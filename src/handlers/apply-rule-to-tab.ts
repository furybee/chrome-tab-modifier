import { _getRuleFromUrl } from '../common/storage.ts';
import { ACTION } from '../common/const.ts';
import { ungroupTab } from './ungroup-tab.ts';

export async function applyRuleToTab(tab: chrome.tabs.Tab) {
	if (!tab.id) return false;
	if (!tab.url) return false;

	const rule = await _getRuleFromUrl(tab.url);

	await ungroupTab(rule, tab);

	if (rule) {
		await chrome.tabs.sendMessage(tab.id, { action: ACTION.APPLY_RULE, rule: rule });
	}
}
