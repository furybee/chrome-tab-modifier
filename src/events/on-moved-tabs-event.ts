import { _getRuleFromUrl, _getStorageAsync } from '../common/storage.ts';
import { applyGroupRuleToTab } from '../handlers/apply-group-rule-to-tab.ts';

export function registerOnTabsMovedEvent() {
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
}
