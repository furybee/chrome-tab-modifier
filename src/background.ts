/**
 * Main background service worker
 * Orchestrates all services following Dependency Inversion Principle
 */
import { _getRuleFromUrl, _getStorageAsync, _setStorage } from './common/storage';
import { TabRulesService } from './background/TabRulesService';
import { TabGroupsService } from './background/TabGroupsService';
import { TabHiveService } from './background/TabHiveService';
import { WindowService } from './background/WindowService';
import { ContextMenuService } from './background/ContextMenuService';
import { SpotSearchService } from './background/SpotSearchService';

// Initialize services (Dependency Injection)
const tabRulesService = new TabRulesService();
const tabGroupsService = new TabGroupsService();
const tabHiveService = new TabHiveService();
const windowService = new WindowService();
const contextMenuService = new ContextMenuService();
const spotSearchService = new SpotSearchService();

// =============================================================================
// TAB EVENT LISTENERS
// =============================================================================

/**
 * Handle tab updates - apply rules when URL changes
 */
chrome.tabs.onUpdated.addListener(
	async (_: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
		// Process on URL change OR when tab completes loading
		const shouldProcess = changeInfo.url || (changeInfo.status === 'complete' && tab.url);

		if (!shouldProcess) {
			return;
		}

		const urlToProcess = changeInfo.url || tab.url;
		if (!urlToProcess) {
			return;
		}

		// Skip processing if lightweight mode excludes this URL
		if (!(await tabRulesService.shouldProcessUrl(urlToProcess))) {
			return;
		}

		const rule = await _getRuleFromUrl(urlToProcess);
		const tabModifier = await _getStorageAsync();

		// Apply grouping logic FIRST to avoid race condition
		// where ungroupTab removes the tab from group before content script re-applies it
		if (rule && tabModifier) {
			await tabGroupsService.applyGroupRuleToTab(rule, tab, tabModifier);
		} else {
			await tabGroupsService.ungroupTab(rule, tab);
		}

		// Handle unique tab logic in background for faster duplicate closing
		// This runs before content script is injected, closing duplicates during page load
		if (rule?.tab?.unique && tab.id) {
			await tabRulesService.handleSetUnique(
				{
					url_fragment: rule.url_fragment,
					rule: rule,
				},
				tab
			);
		}

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

	// Handle spot search requests
	if (message.action === 'spotSearch') {
		const results = await spotSearchService.search(message.query);
		if (sender.tab?.id) {
			await chrome.tabs.sendMessage(sender.tab.id, {
				action: 'spotSearchResults',
				tabs: results.tabs,
				bookmarks: results.bookmarks,
			});
		}
		return;
	}

	// Handle spot search activate tab
	if (message.action === 'spotSearchActivateTab') {
		await spotSearchService.activateTab(message.tabId, message.windowId);
		return;
	}

	// Handle spot search open bookmark
	if (message.action === 'spotSearchOpenBookmark') {
		await spotSearchService.openBookmark(message.url);
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

/**
 * Add URL or domain to Tab Hive reject list
 */
async function addToTabHiveRejectList(url: string, type: 'domain' | 'url'): Promise<void> {
	try {
		const tabModifier = await _getStorageAsync();
		if (!tabModifier) return;

		let pattern: string;
		if (type === 'domain') {
			const urlObj = new URL(url);
			pattern = urlObj.hostname;
		} else {
			pattern = url;
		}

		// Check if already in list
		if (!tabModifier.settings.tab_hive_reject_list.includes(pattern)) {
			tabModifier.settings.tab_hive_reject_list.push(pattern);
			await _setStorage(tabModifier);
			console.log(`[Tabee] 🚫 Added to Tab Hive reject list (${type}): ${pattern}`);
		} else {
			console.log(`[Tabee] Pattern already in reject list: ${pattern}`);
		}
	} catch (error) {
		console.error('[Tabee] Error adding to reject list:', error);
	}
}

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
	} else if (info.menuItemId === 'tab-hive-reject-domain') {
		if (!tab?.url) return;
		await addToTabHiveRejectList(tab.url, 'domain');
	} else if (info.menuItemId === 'tab-hive-reject-url') {
		if (!tab?.url) return;
		await addToTabHiveRejectList(tab.url, 'url');
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

chrome.commands.onCommand.addListener(async (command, tab) => {
	console.log('[Tabee] 🔍 Command received:', command);

	if (command === 'merge-windows') {
		await windowService.mergeAllWindows();
	} else if (command === 'spot-search') {
		console.log('[Tabee] 🔍 Spot search command triggered');
		console.log('[Tabee] 🔍 Tab:', tab);

		// Toggle spot search in the active tab
		if (!tab?.id) {
			console.log('[Tabee] ❌ No tab ID found');
			return;
		}

		// Skip chrome:// and about: pages
		if (tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('about:'))) {
			console.log('[Tabee] ❌ Cannot open spot search on chrome:// or about: pages');
			return;
		}

		console.log('[Tabee] 🔍 Sending toggleSpotSearch message to tab', tab.id);
		try {
			await chrome.tabs.sendMessage(tab.id, { action: 'toggleSpotSearch' });
			console.log('[Tabee] ✅ Message sent successfully');
		} catch (error) {
			console.error('[Tabee] ❌ Error toggling spot search:', error);
		}
	}
});

// =============================================================================
// EXTENSION ICON CLICK
// =============================================================================

/**
 * Handle clicks on the extension icon to open the side panel
 * Note: Chrome doesn't allow programmatic closing of side panels
 * Users need to click the X button in the side panel to close it
 */
chrome.action.onClicked.addListener(async (tab) => {
	if (!tab.windowId) return;

	// Open the side panel for the current window
	await chrome.sidePanel.open({ windowId: tab.windowId });
});

// =============================================================================
// ALARM LISTENERS (for Tab Hive auto-close)
// =============================================================================

/**
 * Listen for alarms to trigger Tab Hive auto-close checks
 * chrome.alarms is used instead of setInterval because service workers
 * can be suspended, which would stop setInterval timers
 */
chrome.alarms.onAlarm.addListener(async (alarm) => {
	if (alarm.name === 'tabee-auto-close-checker') {
		console.log('[Tabee] 🍯 Alarm triggered, checking for inactive tabs...');
		await tabHiveService.checkAndCloseInactiveTabs();
	}
});

// =============================================================================
// INITIALIZATION
// =============================================================================

// Initialize Tab Hive auto-close tracking when extension loads
tabHiveService.initialize();

// Log that background script is loaded
console.log('[Tabee] 🐝 Background service worker loaded and ready');
console.log('[Tabee] 🔍 Spot search command handler registered');

// Export for use in other modules
export { tabHiveService };
