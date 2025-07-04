import { Rule } from '../common/types.ts';
import { _getStorageAsync } from '../common/storage.ts';

export async function ungroupTab(rule: Rule | undefined, tab: chrome.tabs.Tab) {
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
