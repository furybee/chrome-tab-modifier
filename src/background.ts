import { Group, Rule, TabModifierSettings } from './common/types.ts';
import {
	_getDefaultRule,
	_getDefaultTabModifierSettings,
	_getRuleFromUrl,
	_getStorageAsync,
	_setStorage,
} from './common/storage.ts';

chrome.tabs.onUpdated.addListener(
	async (_: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
		if (!changeInfo.url) return;

		await applyRuleToTab(tab);
	}
);

function handleSetUnique(message: any, currentTab: chrome.tabs.Tab) {
	if (!currentTab?.id) return;

	chrome.tabs.query({}, (tabs: chrome.tabs.Tab[]) => {
		tabs.forEach((tab) => {
			if (!tab.url) return;

			if (tab.url.includes(message.url_fragment) && tab.id !== currentTab.id) {
				if (!currentTab?.id) return;

				chrome.tabs.executeScript(
					currentTab.id,
					{ code: 'window.onbeforeunload = null;' },
					async () => {
						if (!currentTab?.id) return;
						if (!tab?.id) return;

						await chrome.tabs.remove(currentTab.id);

						await chrome.tabs.update(tab.id, {
							url: currentTab.url,
							highlighted: true,
						});
					}
				);
			}
		});
	});
}

async function handleSetGroup(rule: Rule, tab: chrome.tabs.Tab) {
	if (tab.url?.startsWith('chrome')) return;

	const tabModifier = await _getStorageAsync();
	if (tabModifier) await applyGroupRuleToTab(rule, tab, tabModifier);
}

chrome.runtime.onMessage.addListener(async (message, sender) => {
	if (!sender.tab) return;

	const tab = sender.tab as chrome.tabs.Tab;
	if (!tab.id) return;

	switch (message.action) {
		case 'setUnique':
			handleSetUnique(message, tab);
			break;
		case 'setPinned':
			await chrome.tabs.update(tab.id, { pinned: true });
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
	const ruleName = 'Rule (' + urlParams.host.substring(0, 15) + ')';
	const rule = _getDefaultRule(title ?? 'Default', ruleName, urlParams.href);

	tabModifier.rules.push(rule);

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

	const tabGroupsQueryInfo = { title: tmGroup.title, windowId: tab.windowId };

	chrome.tabGroups.query(tabGroupsQueryInfo, (groups: chrome.tabGroups.TabGroup[]) =>
		handleTabGroups(groups, tab, tmGroup)
	);
}

async function applyRuleToTab(tab: chrome.tabs.Tab) {
	if (!tab.id) return false;
	if (!tab.url) return false;

	const rule = await _getRuleFromUrl(tab.url);

	await ungroupTab(rule, tab);

	if (rule) {
		await chrome.tabs.sendMessage(tab.id, { action: 'applyRule', rule: rule });
	}
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
		const group = groups[0];

		chrome.tabs.group({ groupId: group.id, tabIds: [tab.id] }, (groupId: number) => {
			updateTabGroup(groupId, tmGroup);
		});
	}
}

async function createAndSetupGroup(tabIds: number[], tmGroup: Group) {
	chrome.tabs.group({ tabIds: tabIds }, (groupId: number) => {
		updateTabGroup(groupId, tmGroup);
	});
}

async function updateTabGroup(groupId: number, tmGroup: Group) {
	const updateProperties = {
		title: tmGroup.title,
		color: tmGroup.color,
		collapsed: tmGroup.collapsed,
	} as chrome.tabGroups.UpdateProperties;

	await chrome.tabGroups.update(groupId, updateProperties);
}

export {};
