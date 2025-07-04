import { applyRuleToTab } from '../handlers/apply-rule-to-tab.ts';

export function registerOnTabsUpdatedEvent() {
	chrome.tabs.onUpdated.addListener(
		async (_: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
			if (!changeInfo.url) return;

			await applyRuleToTab(tab);
		}
	);
}
