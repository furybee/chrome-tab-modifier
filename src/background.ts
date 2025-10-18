import { Group, Rule, TabModifierSettings } from './common/types.ts';
import {
	_getDefaultRule,
	_getDefaultTabModifierSettings,
	_getRuleFromUrl,
	_getStorageAsync,
	_setStorage,
	_shouldSkipUrl,
} from './common/storage.ts';
import { _processUrlFragment } from './common/helpers.ts';

chrome.tabs.onUpdated.addListener(
	async (_: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
		if (!changeInfo.url) return;

		// Skip processing if lightweight mode excludes this URL
		if (await _shouldSkipUrl(changeInfo.url)) {
			return;
		}

		await applyRuleToTab(tab);
	}
);

async function applyRuleToTab(tab: chrome.tabs.Tab) {
	if (!tab.id) return false;
	if (!tab.url) return false;

	const rule = await _getRuleFromUrl(tab.url);

	await ungroupTab(rule, tab);

	if (rule) {
		await chrome.tabs.sendMessage(tab.id, { action: 'applyRule', rule: rule });
	}
}

function queryTabs(queryInfo = {}): Promise<chrome.tabs.Tab[]> {
	return new Promise((resolve, reject) => {
		chrome.tabs.query(queryInfo, (result) => {
			if (chrome.runtime.lastError) {
				reject(new Error(chrome.runtime.lastError.message));
			} else {
				resolve(result);
			}
		});
	});
}

async function handleSetUnique(message: any, currentTab: chrome.tabs.Tab) {
	if (!currentTab.id || !currentTab.url) return;

	const rule = message.rule as Rule;
	const processedUrlFragment = _processUrlFragment(
		message.url_fragment,
		currentTab.url,
		rule?.tab?.url_matcher
	);

	const tabs = await queryTabs({});

	for (const tab of tabs) {
		if (!tab.url) continue;
		if (!tab.id) continue;

		// Process the fragment for each tab to compare
		const tabProcessedFragment = _processUrlFragment(
			message.url_fragment,
			tab.url,
			rule?.tab?.url_matcher
		);

		// Compare processed fragments instead of raw URL
		if (tabProcessedFragment === processedUrlFragment && tab.id !== currentTab.id) {
			await chrome.scripting.executeScript({
				target: { tabId: currentTab.id },
				func: () => {
					window.onbeforeunload = null;
				},
			});

			await chrome.tabs.remove(currentTab.id);
			await chrome.tabs.update(tab.id, { url: currentTab.url, highlighted: true });
			return; // Exit after finding the first match
		}
	}
}

async function handleSetGroup(rule: Rule, tab: chrome.tabs.Tab) {
	if (tab.url?.startsWith('chrome')) return;

	const tabModifier = await _getStorageAsync();
	if (tabModifier) await applyGroupRuleToTab(rule, tab, tabModifier);
}

chrome.tabs.onMoved.addListener(async (tabId) => {
	const tab = await chrome.tabs.get(tabId);
	if (!tab) return;
	if (!tab.url) return;

	// Skip processing if lightweight mode excludes this URL
	if (await _shouldSkipUrl(tab.url)) {
		return;
	}

	const tabModifier = await _getStorageAsync();
	if (!tabModifier) return;

	const rule = await _getRuleFromUrl(tab.url);
	if (!rule) return;

	await applyGroupRuleToTab(rule, tab, tabModifier);
});

chrome.runtime.onMessage.addListener(async (message, sender) => {
	// Handle messages from SidePanel (no sender.tab)
	if (message.action === 'restoreClosedTab') {
		await restoreClosedTab(message.tabId);
		return;
	}

	if (!sender.tab) return;

	const tab = sender.tab as chrome.tabs.Tab;
	if (!tab.id) return;

	switch (message.action) {
		case 'setUnique':
			await handleSetUnique(message, tab);
			break;
		case 'setPinned':
			await chrome.tabs.update(tab.id, { pinned: true });
			break;
		case 'setProtected':
			/**
			 * https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event#usage_notes
			 * Require sticky activation for the dialog to be displayed.
			 * In other words, the browser will only show the dialog box if the
			 * frame or any embedded frame receives a user gesture or user interaction.
			 * If the user has never interacted with the page, then there is no user data to save,
			 * so no legitimate use case for the dialog.
			 */

			await chrome.scripting.executeScript({
				target: { tabId: tab.id },
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
			break;
		case 'setGroup':
			await handleSetGroup(message.rule, tab);
			break;
		case 'setMuted':
			await chrome.tabs.update(tab.id, { muted: true });
			break;
		case 'renameTab':
			await handleRenameTab(tab, message.title);
			break;
	}
});

async function handleRenameTab(tab: chrome.tabs.Tab, title: string) {
	if (!tab?.id) return;
	if (!tab?.url) return;
	if (!URL.canParse(tab.url)) return;

	let tabModifier = await _getStorageAsync();

	if (!tabModifier) {
		tabModifier = _getDefaultTabModifierSettings();
	}

	const urlParams = new URL(tab.url);
	const ruleName = title + ' (' + urlParams.host.substring(0, 15) + ')';
	const rule = _getDefaultRule(ruleName, title ?? '', urlParams.href);

	tabModifier.rules.unshift(rule);

	await _setStorage(tabModifier);

	await chrome.tabs.reload(tab.id);
}

chrome.contextMenus.create({
	id: 'rename-tab',
	title: '✏️ Rename Tab',
	contexts: ['all'],
});

chrome.contextMenus.create({
	id: 'merge-windows',
	title: '🪟 Merge All Windows',
	contexts: ['all'],
});

chrome.contextMenus.create({
	id: 'send-to-hive',
	title: '🍯 Send to Tab Hive',
	contexts: ['all'],
});

chrome.contextMenus.onClicked.addListener(async function (info, tab) {
	if (info.menuItemId === 'rename-tab') {
		if (!tab?.id) return;
		await chrome.tabs.sendMessage(tab.id, { action: 'openPrompt' });
	} else if (info.menuItemId === 'merge-windows') {
		await mergeAllWindows();
	} else if (info.menuItemId === 'send-to-hive') {
		if (!tab) return;
		await sendTabToHive(tab);
	}
});

async function ungroupTab(rule: Rule | undefined, tab: chrome.tabs.Tab) {
	if (!tab.id) return;

	let isRuleHasGroup = false;

	if (rule && rule.tab.group_id && rule.tab.group_id !== '') {
		isRuleHasGroup = true;
	}

	if (!isRuleHasGroup && tab.groupId && tab.groupId !== -1) {
		// Check if the group is one of user's groups
		const group = await chrome.tabGroups.get(tab.groupId);

		const tabModifier = await _getStorageAsync();
		if (!tabModifier) return;

		const tmGroup = tabModifier.groups.find((g) => g.title === group.title);
		if (tmGroup) await chrome.tabs.ungroup(tab.id);
	}
}

async function applyGroupRuleToTab(
	rule: Rule,
	tab: chrome.tabs.Tab,
	tabModifier: TabModifierSettings
) {
	if (!tab.id) return;

	// remove tab from group if it's already in one
	if (!rule || !rule.tab.group_id) {
		await ungroupTab(rule, tab);

		return;
	}

	const tmGroup = tabModifier.groups.find((g) => g.id === rule.tab.group_id);

	if (!tmGroup) return;

	const tabGroupsQueryInfo = {
		title: tmGroup.title,
		color: tmGroup.color as chrome.tabGroups.ColorEnum,
		windowId: tab.windowId,
	};

	chrome.tabGroups.query(tabGroupsQueryInfo, (groups: chrome.tabGroups.TabGroup[]) =>
		handleTabGroups(groups, tab, tmGroup)
	);
}

let handleTabGroupsMaxRetries = 600;
async function handleTabGroups(
	groups: chrome.tabGroups.TabGroup[],
	tab: chrome.tabs.Tab,
	tmGroup: Group
) {
	if (!tab.id) return;

	if (groups.length === 0) {
		await createAndSetupGroup([tab.id], tmGroup);
	} else if (groups.length === 1) {
		const group = groups[0];

		const execute = () => {
			if (!tab.id) return;

			chrome.tabs.group({ groupId: group.id, tabIds: [tab.id] }, (groupId: number) => {
				if (chrome.runtime.lastError && handleTabGroupsMaxRetries > 0) {
					setTimeout(() => execute(), 100);
					handleTabGroupsMaxRetries--;
					return;
				} else {
					handleTabGroupsMaxRetries = 600;
					updateTabGroup(groupId, tmGroup);
				}
			});
		};

		execute();
	}
}

let createAndSetupGroupMaxRetries = 600;
async function createAndSetupGroup(tabIds: number[], tmGroup: Group) {
	const execute = () => {
		chrome.tabs.group({ tabIds: tabIds }, (groupId: number) => {
			if (chrome.runtime.lastError && createAndSetupGroupMaxRetries > 0) {
				setTimeout(() => execute(), 100);
				createAndSetupGroupMaxRetries--;
				return;
			} else {
				createAndSetupGroupMaxRetries = 600;
				updateTabGroup(groupId, tmGroup);
			}
		});
	};

	execute();
}

let updateTabGroupMaxRetries = 600;
async function updateTabGroup(groupId: number, tmGroup: Group) {
	if (!groupId) return;

	const updateProperties = {
		title: tmGroup.title,
		color: tmGroup.color,
		collapsed: tmGroup.collapsed,
	} as chrome.tabGroups.UpdateProperties;

	const execute = () => {
		chrome.tabGroups.update(groupId, updateProperties, () => {
			if (chrome.runtime.lastError && updateTabGroupMaxRetries > 0) {
				setTimeout(() => execute(), 100);
				updateTabGroupMaxRetries--;
				return;
			}
		});
	};

	execute();
}

// Auto-Close Inactive Tabs System
interface TabActivity {
	tabId: number;
	lastActiveTime: number;
}

const tabActivityMap = new Map<number, TabActivity>();
const CLOSED_TABS_STORAGE_KEY = 'closed_tabs';
const MAX_CLOSED_TABS = 100; // Maximum number of closed tabs to keep in history

/**
 * Initialize tab tracking for auto-close
 */
async function initAutoCloseTracking() {
	console.log('[Tabee] 🍯 Initializing auto-close tracking...');

	const settings = await _getStorageAsync();
	if (!settings?.settings.auto_close_enabled) {
		console.log('[Tabee] Auto-close is disabled, skipping initialization');
		return;
	}

	console.log(`[Tabee] Auto-close enabled with timeout: ${settings.settings.auto_close_timeout} minutes`);

	// Get all existing tabs and mark them as active
	const tabs = await chrome.tabs.query({});
	const now = Date.now();

	console.log(`[Tabee] Tracking ${tabs.length} existing tabs`);

	for (const tab of tabs) {
		if (tab.id) {
			tabActivityMap.set(tab.id, {
				tabId: tab.id,
				lastActiveTime: now,
			});
		}
	}

	// Start the auto-close checker
	startAutoCloseChecker();
}

/**
 * Update tab activity when it becomes active
 */
chrome.tabs.onActivated.addListener((activeInfo) => {
	const now = Date.now();
	tabActivityMap.set(activeInfo.tabId, {
		tabId: activeInfo.tabId,
		lastActiveTime: now,
	});
});

/**
 * Update tab activity when it's updated (navigated, etc.)
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
	if (changeInfo.status === 'loading' || changeInfo.url) {
		const now = Date.now();
		tabActivityMap.set(tabId, {
			tabId: tabId,
			lastActiveTime: now,
		});
	}
});

/**
 * Track new tabs
 */
chrome.tabs.onCreated.addListener((tab) => {
	if (tab.id) {
		const now = Date.now();
		tabActivityMap.set(tab.id, {
			tabId: tab.id,
			lastActiveTime: now,
		});
	}
});

/**
 * Clean up closed tabs from tracking
 */
chrome.tabs.onRemoved.addListener((tabId) => {
	tabActivityMap.delete(tabId);
});

/**
 * Start periodic checker for inactive tabs
 */
let autoCloseInterval: number | null = null;

function startAutoCloseChecker() {
	console.log('[Tabee] 🍯 Starting auto-close checker (runs every 60 seconds)');

	// Clear existing interval if any
	if (autoCloseInterval) {
		console.log('[Tabee] Clearing existing auto-close interval');
		clearInterval(autoCloseInterval);
	}

	// Check every minute
	autoCloseInterval = setInterval(async () => {
		await checkAndCloseInactiveTabs();
	}, 60000); // 1 minute

	console.log('[Tabee] Auto-close checker started successfully');
}

/**
 * Check and close inactive tabs based on settings
 */
async function checkAndCloseInactiveTabs() {
	try {
		console.log('[Tabee] 🍯 Running auto-close check...');

		const settings = await _getStorageAsync();
		if (!settings?.settings.auto_close_enabled) {
			console.log('[Tabee] Auto-close disabled, stopping checker');
			// Stop checking if disabled
			if (autoCloseInterval) {
				clearInterval(autoCloseInterval);
				autoCloseInterval = null;
			}
			return;
		}

		const timeoutMs = settings.settings.auto_close_timeout * 60 * 1000;
		const now = Date.now();

		// Get all tabs
		const allTabs = await chrome.tabs.query({});
		console.log(
			`[Tabee] Checking ${allTabs.length} tabs (timeout: ${settings.settings.auto_close_timeout} minutes)`
		);

		let candidatesCount = 0;
		let closedCount = 0;

		for (const tab of allTabs) {
			if (!tab.id) continue;

			// Skip pinned tabs
			if (tab.pinned) {
				console.log(`[Tabee] Skipping pinned tab: ${tab.title}`);
				continue;
			}

			// Skip active tab
			if (tab.active) {
				console.log(`[Tabee] Skipping active tab: ${tab.title}`);
				continue;
			}

			// Get activity info
			const activity = tabActivityMap.get(tab.id);
			if (!activity) {
				// Tab not tracked yet, add it
				console.log(`[Tabee] New untracked tab found, adding to tracking: ${tab.title}`);
				tabActivityMap.set(tab.id, {
					tabId: tab.id,
					lastActiveTime: now,
				});
				continue;
			}

			// Check if tab is inactive for too long
			const inactiveTime = now - activity.lastActiveTime;
			const inactiveMinutes = Math.round(inactiveTime / 60000);

			if (inactiveTime >= timeoutMs) {
				candidatesCount++;
				console.log(
					`[Tabee] 🍯 Tab eligible for auto-close: "${tab.title}" (inactive for ${inactiveMinutes} minutes)`
				);

				// Save tab info before closing
				await saveClosedTab(tab);

				// Close the tab
				try {
					await chrome.tabs.remove(tab.id);
					closedCount++;
					console.log(`[Tabee] ✅ Auto-closed inactive tab: ${tab.title} (inactive for ${inactiveMinutes} minutes)`);
				} catch (error) {
					console.error(`[Tabee] ❌ Error closing tab ${tab.id}:`, error);
				}
			} else {
				const remainingMinutes = Math.round((timeoutMs - inactiveTime) / 60000);
				console.log(
					`[Tabee] Tab "${tab.title}" inactive for ${inactiveMinutes}min, will close in ${remainingMinutes}min`
				);
			}
		}

		console.log(
			`[Tabee] 🍯 Auto-close check complete: ${closedCount} tabs closed out of ${candidatesCount} candidates`
		);
	} catch (error) {
		console.error('[Tabee] ❌ Error in auto-close checker:', error);
	}
}

/**
 * Generate a simple hash for a URL to detect duplicates
 */
async function hashUrl(url: string): Promise<string> {
	// Use the Web Crypto API to generate a SHA-256 hash
	const encoder = new TextEncoder();
	const data = encoder.encode(url);
	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Save closed tab to history
 */
async function saveClosedTab(tab: chrome.tabs.Tab) {
	if (!tab.url || !tab.id) return;

	// Don't save chrome:// URLs
	if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
		return;
	}

	try {
		// Generate hash for the URL
		const urlHash = await hashUrl(tab.url);

		// Get existing closed tabs
		const result = await chrome.storage.local.get(CLOSED_TABS_STORAGE_KEY);
		let closedTabs = result[CLOSED_TABS_STORAGE_KEY] || [];

		// Check if this URL already exists in the hive
		const existingIndex = closedTabs.findIndex((t: any) => t.urlHash === urlHash);
		if (existingIndex !== -1) {
			console.log(`[Tabee] 🍯 Tab already in hive, updating timestamp: ${tab.title}`);
			// Update the existing entry with new timestamp and move to beginning
			const existingTab = closedTabs[existingIndex];
			closedTabs.splice(existingIndex, 1);
			closedTabs.unshift({
				...existingTab,
				title: tab.title || existingTab.title, // Update title if changed
				favIconUrl: tab.favIconUrl || existingTab.favIconUrl, // Update favicon
				closedAt: Date.now(), // Update timestamp
			});
		} else {
			// Add new tab at the beginning
			const closedTab = {
				id: crypto.randomUUID(),
				title: tab.title || 'Untitled',
				url: tab.url,
				urlHash: urlHash, // Store hash for duplicate detection
				favIconUrl: tab.favIconUrl,
				closedAt: Date.now(),
			};
			closedTabs.unshift(closedTab);
		}

		// Keep only the last MAX_CLOSED_TABS
		if (closedTabs.length > MAX_CLOSED_TABS) {
			closedTabs = closedTabs.slice(0, MAX_CLOSED_TABS);
		}

		// Save back to storage
		await chrome.storage.local.set({
			[CLOSED_TABS_STORAGE_KEY]: closedTabs,
		});

		console.log(`[Tabee] Saved closed tab to history: ${tab.title}`);
	} catch (error) {
		console.error('[Tabee] Error saving closed tab:', error);
	}
}

/**
 * Manually send a tab to the hive
 */
async function sendTabToHive(tab: chrome.tabs.Tab) {
	if (!tab.id) return;

	// Save tab to hive
	await saveClosedTab(tab);

	// Close the tab
	try {
		await chrome.tabs.remove(tab.id);
		console.log(`[Tabee] Tab sent to hive: ${tab.title}`);
	} catch (error) {
		console.error('[Tabee] Error closing tab:', error);
	}
}

/**
 * Restore a closed tab
 */
export async function restoreClosedTab(closedTabId: string) {
	try {
		// Get closed tabs
		const result = await chrome.storage.local.get(CLOSED_TABS_STORAGE_KEY);
		const closedTabs = result[CLOSED_TABS_STORAGE_KEY] || [];

		// Find the tab
		const tabIndex = closedTabs.findIndex((t: any) => t.id === closedTabId);
		if (tabIndex === -1) {
			console.error('[Tabee] Closed tab not found:', closedTabId);
			return;
		}

		const closedTab = closedTabs[tabIndex];

		// Open the tab
		await chrome.tabs.create({
			url: closedTab.url,
			active: true,
		});

		// Remove from closed tabs
		closedTabs.splice(tabIndex, 1);
		await chrome.storage.local.set({
			[CLOSED_TABS_STORAGE_KEY]: closedTabs,
		});

		console.log(`[Tabee] Restored tab: ${closedTab.title}`);
	} catch (error) {
		console.error('[Tabee] Error restoring tab:', error);
	}
}

// Initialize auto-close tracking when extension loads
initAutoCloseTracking();

// Listen for storage changes to react to settings updates
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
				initAutoCloseTracking();
			}
			// If auto-close was just disabled
			else if (wasEnabled && !isEnabled) {
				console.log('[Tabee] 🍯 Auto-close disabled via settings, stopping checker...');
				if (autoCloseInterval) {
					clearInterval(autoCloseInterval);
					autoCloseInterval = null;
				}
				// Clear the tracking map
				tabActivityMap.clear();
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

// Handle clicks on the extension icon
// Note: This only works if action.default_popup is NOT set in manifest
chrome.action.onClicked.addListener(async () => {
	// Open the options page to add a new rule
	chrome.runtime.openOptionsPage();
});

// Command Handlers
chrome.commands.onCommand.addListener(async (command) => {
	if (command === 'merge-windows') {
		await mergeAllWindows();
	} else if (command === 'open-side-panel') {
		await openSidePanel();
	}
});

/**
 * Open the side panel for the current window
 */
async function openSidePanel() {
	try {
		const windows = await chrome.windows.getAll();
		if (windows.length === 0) return;

		// Get the current window or the first one
		const currentWindow = windows.find((w) => w.focused) || windows[0];
		if (!currentWindow.id) return;

		await chrome.sidePanel.open({ windowId: currentWindow.id });
		console.log('[Tabee] Side panel opened');
	} catch (error) {
		console.error('[Tabee] Error opening side panel:', error);
	}
}

/**
 * Merge all browser windows into the current window
 */
async function mergeAllWindows() {
	try {
		// Get all windows
		const windows = await chrome.windows.getAll({ populate: true });

		if (windows.length <= 1) {
			console.log('[Tabee] Only one window open, nothing to merge');
			return;
		}

		// Find the currently focused window or use the first normal window
		let targetWindow = windows.find((w) => w.focused);
		if (!targetWindow) {
			targetWindow = windows.find((w) => w.type === 'normal');
		}

		if (!targetWindow || !targetWindow.id) {
			console.error('[Tabee] Could not find target window for merging');
			return;
		}

		console.log(`[Tabee] Merging ${windows.length - 1} windows into window ${targetWindow.id}`);

		// Move all tabs from other windows to the target window
		for (const window of windows) {
			// Skip the target window itself
			if (window.id === targetWindow.id) continue;

			// Skip non-normal windows (popup, devtools, etc.)
			if (window.type !== 'normal') continue;

			if (window.tabs && window.tabs.length > 0) {
				const tabIds = window.tabs
					.map((tab) => tab.id)
					.filter((id): id is number => id !== undefined);

				if (tabIds.length > 0) {
					try {
						// Move tabs to target window
						await chrome.tabs.move(tabIds, {
							windowId: targetWindow.id,
							index: -1, // Append at the end
						});

						console.log(`[Tabee] Moved ${tabIds.length} tabs from window ${window.id}`);
					} catch (error) {
						console.error(`[Tabee] Error moving tabs from window ${window.id}:`, error);
					}
				}
			}
		}

		// Focus the target window
		await chrome.windows.update(targetWindow.id, { focused: true });

		console.log('[Tabee] Windows merged successfully');
	} catch (error) {
		console.error('[Tabee] Error merging windows:', error);
	}
}

export {};
