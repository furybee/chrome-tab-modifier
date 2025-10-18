/**
 * Main background service worker
 * Orchestrates all services following Dependency Inversion Principle
 */
import { _getRuleFromUrl, _getStorageAsync } from './common/storage';
import { TabRulesService } from './background/TabRulesService';
import { TabGroupsService } from './background/TabGroupsService';
import { TabHiveService } from './background/TabHiveService';
import { WindowService } from './background/WindowService';
import { ContextMenuService } from './background/ContextMenuService';

// Initialize services (Dependency Injection)
const tabRulesService = new TabRulesService();
const tabGroupsService = new TabGroupsService();
const tabHiveService = new TabHiveService();
const windowService = new WindowService();
const contextMenuService = new ContextMenuService();

// =============================================================================
// TAB EVENT LISTENERS
// =============================================================================

/**
 * Handle tab updates - apply rules when URL changes
 */
chrome.tabs.onUpdated.addListener(
	async (_: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
		if (!changeInfo.url) return;

		// Skip processing if lightweight mode excludes this URL
		if (!(await tabRulesService.shouldProcessUrl(changeInfo.url))) {
			return;
		}

		const rule = await _getRuleFromUrl(tab.url!);
		await tabGroupsService.ungroupTab(rule, tab);
		await tabRulesService.applyRuleToTab(tab);
	}
);

/**
 * Handle tab moves - reapply group rules
 */
chrome.tabs.onMoved.addListener(async (tabId) => {
	const tab = await chrome.tabs.get(tabId);
	if (!tab?.url) return;

	// Skip processing if lightweight mode excludes this URL
	if (!(await tabRulesService.shouldProcessUrl(tab.url))) {
		return;
	}

	const tabModifier = await _getStorageAsync();
	if (!tabModifier) return;

	const rule = await _getRuleFromUrl(tab.url);
	if (!rule) return;

	await tabGroupsService.applyGroupRuleToTab(rule, tab, tabModifier);
});

/**
 * Track tab activation for Tab Hive
 */
chrome.tabs.onActivated.addListener((activeInfo) => {
	tabHiveService.updateTabActivity(activeInfo.tabId);
});

/**
 * Track tab updates for Tab Hive
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
	if (changeInfo.status === 'loading' || changeInfo.url) {
		tabHiveService.updateTabActivity(tabId);
	}
});

/**
 * Track new tabs for Tab Hive
 */
chrome.tabs.onCreated.addListener((tab) => {
	if (tab.id) {
		tabHiveService.updateTabActivity(tab.id);
	}
});

/**
 * Clean up closed tabs from Tab Hive tracking
 */
chrome.tabs.onRemoved.addListener((tabId) => {
	tabHiveService.removeTab(tabId);
});

// =============================================================================
// RUNTIME MESSAGE LISTENERS
// =============================================================================

chrome.runtime.onMessage.addListener(async (message, sender) => {
	// Handle messages from SidePanel (no sender.tab)
	if (message.action === 'restoreClosedTab') {
		await tabHiveService.restoreClosedTab(message.tabId);
		return;
	}

	if (!sender.tab) return;

	const tab = sender.tab as chrome.tabs.Tab;
	if (!tab.id) return;

	switch (message.action) {
		case 'setUnique':
			await tabRulesService.handleSetUnique(message, tab);
			break;
		case 'setPinned':
			await chrome.tabs.update(tab.id, { pinned: true });
			break;
		case 'setProtected':
			await handleSetProtected(tab.id);
			break;
		case 'setGroup':
			await tabGroupsService.handleSetGroup(message.rule, tab);
			break;
		case 'setMuted':
			await chrome.tabs.update(tab.id, { muted: true });
			break;
		case 'renameTab':
			await tabRulesService.handleRenameTab(tab, message.title);
			break;
	}
});

/**
 * Handle tab protection - set beforeunload handler
 */
async function handleSetProtected(tabId: number): Promise<void> {
	/**
	 * https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event#usage_notes
	 * Require sticky activation for the dialog to be displayed.
	 */
	await chrome.scripting.executeScript({
		target: { tabId: tabId },
		func: () => {
			let removeListener = false;

			const bindBeforeUnload = () => {
				window.addEventListener('beforeunload', function (e) {
					e.preventDefault();
					e.returnValue = true;
					return 'Are you sure?';
				});

				if (removeListener) {
					window.removeEventListener('click', bindBeforeUnload);
					window.removeEventListener('mousedown', bindBeforeUnload);
					window.removeEventListener('keydown', bindBeforeUnload);
					window.removeEventListener('pointerdown', bindBeforeUnload);
					window.removeEventListener('pointerup', bindBeforeUnload);
					window.removeEventListener('touchend', bindBeforeUnload);
				}
			};

			bindBeforeUnload();

			removeListener = true;
			window.removeEventListener('click', bindBeforeUnload);
			window.removeEventListener('mousedown', bindBeforeUnload);
			window.removeEventListener('keydown', bindBeforeUnload);
			window.removeEventListener('pointerdown', bindBeforeUnload);
			window.removeEventListener('pointerup', bindBeforeUnload);
			window.removeEventListener('touchend', bindBeforeUnload);
		},
	});
}

// =============================================================================
// CONTEXT MENUS
// =============================================================================

contextMenuService.initialize();

chrome.contextMenus.onClicked.addListener(async function (info, tab) {
	if (info.menuItemId === 'rename-tab') {
		if (!tab?.id) return;
		await chrome.tabs.sendMessage(tab.id, { action: 'openPrompt' });
	} else if (info.menuItemId === 'merge-windows') {
		await windowService.mergeAllWindows();
	} else if (info.menuItemId === 'send-to-hive') {
		if (!tab) return;
		await tabHiveService.sendTabToHive(tab);
	}
});

// =============================================================================
// STORAGE CHANGE LISTENER
// =============================================================================

/**
 * Listen for storage changes to react to settings updates
 */
chrome.storage.onChanged.addListener((changes, areaName) => {
	if (areaName !== 'sync' && areaName !== 'local') return;

	// Check if tab_modifier settings changed
	if (changes.tab_modifier) {
		const oldSettings = changes.tab_modifier.oldValue?.settings;
		const newSettings = changes.tab_modifier.newValue?.settings;

		// Check if auto-close settings changed
		if (oldSettings && newSettings) {
			const wasEnabled = oldSettings.auto_close_enabled;
			const isEnabled = newSettings.auto_close_enabled;
			const oldTimeout = oldSettings.auto_close_timeout;
			const newTimeout = newSettings.auto_close_timeout;

			// If auto-close was just enabled
			if (!wasEnabled && isEnabled) {
				console.log('[Tabee] 🍯 Auto-close enabled via settings, initializing tracking...');
				tabHiveService.initialize();
			}
			// If auto-close was just disabled
			else if (wasEnabled && !isEnabled) {
				tabHiveService.stopAutoCloseChecker();
			}
			// If timeout changed while enabled
			else if (isEnabled && oldTimeout !== newTimeout) {
				console.log(
					`[Tabee] 🍯 Auto-close timeout changed from ${oldTimeout} to ${newTimeout} minutes`
				);
				// No need to restart, the next check will use the new timeout
			}
		}
	}
});

// =============================================================================
// COMMAND HANDLERS
// =============================================================================

chrome.commands.onCommand.addListener(async (command) => {
	if (command === 'merge-windows') {
		await windowService.mergeAllWindows();
	}
});

// =============================================================================
// EXTENSION ICON CLICK
// =============================================================================

/**
 * Handle clicks on the extension icon
 * Note: This only works if action.default_popup is NOT set in manifest
 */
chrome.action.onClicked.addListener(async () => {
	chrome.runtime.openOptionsPage();
});

// =============================================================================
// INITIALIZATION
// =============================================================================

// Initialize Tab Hive auto-close tracking when extension loads
tabHiveService.initialize();

// Export for use in other modules
export { tabHiveService };
