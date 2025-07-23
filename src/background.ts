import { Group, Rule, TabModifierSettings } from './common/types.ts';
import {
	_getDefaultRule,
	_getDefaultTabModifierSettings,
	_getRuleFromUrl,
	_getStorageAsync,
	_setStorage,
} from './common/storage.ts';

// Helper to query tab groups
function queryTabGroups(
	queryInfo: chrome.tabGroups.QueryInfo
): Promise<chrome.tabGroups.TabGroup[]> {
	return new Promise((resolve) => {
		chrome.tabGroups.query(queryInfo, (groups) => resolve(groups));
	});
}

// Helper to move tab to group, update group, and focus
async function moveTabToGroup(
	tab: chrome.tabs.Tab,
	group: chrome.tabGroups.TabGroup,
	tmGroup: Group
): Promise<void> {
	if (tab.groupId !== group.id) {
		if (tab.groupId && tab.groupId !== -1) {
			await chrome.tabs.ungroup(tab.id!);
		}
		await new Promise<void>((resolve) => {
			chrome.tabs.group({ groupId: group.id, tabIds: [tab.id!] }, async (groupId: number) => {
				updateTabGroup(groupId, tmGroup);
				try {
					await chrome.tabs.update(tab.id!, { active: true });
					await chrome.windows.update(group.windowId, { focused: true });
				} catch (e) {
					// ignore
				}
				resolve();
			});
		});
	}
}

chrome.tabs.onUpdated.addListener(
	async (_: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
		if (!changeInfo.url) return;

		await applyRuleToTab(tab);
	}
);

async function applyRuleToTab(tab: chrome.tabs.Tab) {
	if (!tab.id) return false;
	if (!tab.url) return false;

	const rule = await _getRuleFromUrl(tab.url);

	await ungroupTab(rule, tab);

	if (rule) {
		try {
			await chrome.tabs.sendMessage(tab.id, { action: 'applyRule', rule: rule });
		} catch (err: any) {
			// Ignore 'Could not establish connection' error (content script not injected)
			if (!err?.message?.includes('Could not establish connection')) {
				throw err;
			}
		}
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
	if (!currentTab.id) return;

	const tabs = await queryTabs({});

	for (const tab of tabs) {
		if (!tab.url) continue;
		if (!tab.id) continue;

		if (tab.url.includes(message.url_fragment) && tab.id !== currentTab.id) {
			await chrome.scripting.executeScript({
				target: { tabId: currentTab.id },
				func: () => {
					window.onbeforeunload = null;
				},
			});

			await chrome.tabs.remove(currentTab.id);
			await chrome.tabs.update(tab.id, { url: currentTab.url, highlighted: true });
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

	const tabModifier = await _getStorageAsync();
	if (!tabModifier) return;

	const rule = await _getRuleFromUrl(tab.url);
	if (!rule) return;

	await applyGroupRuleToTab(rule, tab, tabModifier);
});

chrome.runtime.onMessage.addListener(async (message, sender) => {
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
	title: 'Rename Tab',
	contexts: ['all'],
});

chrome.contextMenus.onClicked.addListener(async function (info, tab) {
	if (!tab?.id) return;

	if (info.menuItemId === 'rename-tab') {
		await chrome.tabs.sendMessage(tab.id, { action: 'openPrompt' });
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

	let groups: chrome.tabGroups.TabGroup[] = [];
	if (tmGroup.merge) {
		groups = await queryTabGroups({
			title: tmGroup.title,
			color: tmGroup.color as chrome.tabGroups.ColorEnum,
		});
		if (groups.length > 0) {
			await moveTabToGroup(tab, groups[0], tmGroup);
			return;
		}
	}
	// fallback to current window
	groups = await queryTabGroups({
		title: tmGroup.title,
		color: tmGroup.color as chrome.tabGroups.ColorEnum,
		windowId: tab.windowId,
	});
	await handleTabGroups(groups, tab, tmGroup);
}

async function handleTabGroups(
	groups: chrome.tabGroups.TabGroup[],
	tab: chrome.tabs.Tab,
	tmGroup: Group
) {
	if (!tab.id) return;

	if (groups.length === 0) {
		await createAndSetupGroup([tab.id], tmGroup);
	} else if (groups.length === 1) {
		await moveTabToGroup(tab, groups[0], tmGroup);
		return;
	}
}

let createAndSetupGroupMaxRetries = 600;
async function createAndSetupGroup(tabIds: number[], tmGroup: Group) {
	let retries = createAndSetupGroupMaxRetries;
	while (retries > 0) {
		try {
			const groupId: number = await new Promise((resolve, reject) => {
				chrome.tabs.group({ tabIds: tabIds }, (groupId: number) => {
					if (chrome.runtime.lastError) {
						reject(new Error(chrome.runtime.lastError.message));
					} else {
						resolve(groupId);
					}
				});
			});
			createAndSetupGroupMaxRetries = 600;
			updateTabGroup(groupId, tmGroup);
			return;
		} catch (e) {
			retries--;
			await new Promise((res) => setTimeout(res, 100));
		}
	}
	createAndSetupGroupMaxRetries = 600;
}

let updateTabGroupMaxRetries = 600;
async function updateTabGroup(groupId: number, tmGroup: Group) {
	if (!groupId) return;

	const updateProperties = {
		title: tmGroup.title,
		color: tmGroup.color,
		collapsed: tmGroup.collapsed,
	} as chrome.tabGroups.UpdateProperties;

	let retries = updateTabGroupMaxRetries;
	while (retries > 0) {
		try {
			await new Promise<void>((resolve, reject) => {
				chrome.tabGroups.update(groupId, updateProperties, () => {
					if (chrome.runtime.lastError) {
						reject(new Error(chrome.runtime.lastError.message));
					} else {
						resolve();
					}
				});
			});
			updateTabGroupMaxRetries = 600;
			return;
		} catch (e) {
			retries--;
			await new Promise((res) => setTimeout(res, 100));
		}
	}
	updateTabGroupMaxRetries = 600;
}

export { applyGroupRuleToTab };
