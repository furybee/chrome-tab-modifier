import { Group, Rule, TabModifierSettings } from '../common/types.ts';
import { ungroupTab } from '../handlers/ungroup-tab.ts';

export async function applyGroupRuleToTab(
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
		color: tmGroup.color,
		windowId: tab.windowId,
	} as chrome.tabGroups.QueryInfo;

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
