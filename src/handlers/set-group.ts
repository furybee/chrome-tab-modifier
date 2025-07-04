import { Rule } from '../common/types.ts';
import { _getStorageAsync } from '../common/storage.ts';
import { applyGroupRuleToTab } from './apply-group-rule-to-tab.ts';

export async function handleSetGroup(rule: Rule, tab: chrome.tabs.Tab) {
	if (tab.url?.startsWith('chrome')) return;

	const tabModifier = await _getStorageAsync();
	if (tabModifier) await applyGroupRuleToTab(rule, tab, tabModifier);
}
