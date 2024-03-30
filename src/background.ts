import { Group, TabModifierSettings } from './types.ts';

const STORAGE_KEY = 'tab_modifier';

function applyRuleToTab(tab: chrome.tabs.Tab, tabModifier: TabModifierSettings) {
	const rule = tabModifier.rules.find((r) => {
		if (!tab.url) return false;

		const detectionType = r.detection ?? 'CONTAINS';
		const urlFragment = r.url_fragment;
		switch (detectionType) {
			case 'CONTAINS':
				return tab.url.includes(urlFragment);
			case 'STARTS':
				return tab.url.startsWith(urlFragment);
			case 'ENDS':
				return tab.url.endsWith(urlFragment);
			case 'REGEXP':
				return new RegExp(urlFragment).test(tab.url);
			case 'EXACT':
				return tab.url === urlFragment;
			default:
				return false;
		}
	});

	if (!rule || !rule.tab.group_id) return;

	const tmGroup = tabModifier.groups.find((g) => g.id === rule.tab.group_id);

	if (!tmGroup) return;

	const tabGroupsQueryInfo = { title: tmGroup.title, windowId: tab.windowId };

	chrome.tabGroups.query(tabGroupsQueryInfo, (groups: chrome.tabGroups.TabGroup[]) =>
		handleTabGroups(groups, tab, tmGroup)
	);
}

// Function to handle tab groups after querying
function handleTabGroups(
	groups: chrome.tabGroups.TabGroup[],
	tab: chrome.tabs.Tab,
	tmGroup: Group
) {
	if (!tab.id) return;

	if (groups.length === 0) {
		createAndSetupGroup([tab.id], tmGroup);
	} else if (groups.length === 1) {
		const group = groups[0];

		chrome.tabs.group({ groupId: group.id, tabIds: [tab.id] }, (groupId: number) => {
			updateTabGroup(groupId, tmGroup);
		});
	}
}

// Function to create and setup a new tab group
function createAndSetupGroup(tabIds: number[], tmGroup: Group) {
	chrome.tabs.group({ tabIds: tabIds }, (groupId: number) => {
		updateTabGroup(groupId, tmGroup);
	});
}

// Function to update tab group properties
function updateTabGroup(groupId: number, tmGroup: Group) {
	const updateProperties = {
		title: tmGroup.title,
		color: tmGroup.color,
		collapsed: tmGroup.collapsed,
	} as chrome.tabGroups.UpdateProperties;

	chrome.tabGroups.update(groupId, updateProperties);
}

chrome.tabs.onUpdated.addListener(
	(_: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
		if (!changeInfo.url) return;

		chrome.storage.local.get(STORAGE_KEY, (items: any) => {
			const tabModifier = items?.[STORAGE_KEY];
			if (tabModifier) applyRuleToTab(tab, tabModifier);
		});
	}
);

chrome.runtime.onMessage.addListener((message, sender) => {
	if (!sender.tab) return;

	const tab = sender.tab as chrome.tabs.Tab;
	if (!tab.id) return;

	switch (message.action) {
		case 'setUnique':
			handleSetUnique(message, tab);
			break;
		case 'setPinned':
			chrome.tabs.update(tab.id, { pinned: true });
			break;
		case 'setGroup':
			handleSetGroup(sender.tab);
			break;
		case 'setMuted':
			chrome.tabs.update(tab.id, { muted: true });
			break;
	}
});

function handleSetUnique(message: any, currentTab: chrome.tabs.Tab) {
	if (!currentTab?.id) return;

	chrome.tabs.query({}, (tabs: chrome.tabs.Tab[]) => {
		tabs.forEach((tab) => {
			if (!tab.url) return;

			if (tab.url.includes(message.url_fragment) && tab.id !== currentTab.id) {
				if (!currentTab?.id) return;

				chrome.tabs.executeScript(currentTab.id, { code: 'window.onbeforeunload = null;' }, () => {
					if (!currentTab?.id) return;
					if (!tab?.id) return;

					chrome.tabs.remove(currentTab.id);

					chrome.tabs.update(tab.id, {
						url: currentTab.url,
						highlighted: true,
					});
				});
			}
		});
	});
}

function handleSetGroup(tab: chrome.tabs.Tab) {
	if (tab.url === 'chrome://newtab/') return;

	chrome.storage.local.get(STORAGE_KEY, (items) => {
		const tabModifier = items?.[STORAGE_KEY];
		if (tabModifier) applyRuleToTab(tab, tabModifier);
	});
}

export {};
