import { Rule } from '../common/types';
import {
	_getDefaultRule,
	_getDefaultTabModifierSettings,
	_getRuleFromUrl,
	_getStorageAsync,
	_setStorage,
	_shouldSkipUrl,
} from '../common/storage';
import { _processUrlFragment } from '../common/helpers';

/**
 * Service responsible for applying tab modification rules
 * Single Responsibility: Handle all tab rule-related operations
 */
export class TabRulesService {
	/**
	 * Apply a rule to a tab based on its URL
	 */
	async applyRuleToTab(tab: chrome.tabs.Tab): Promise<boolean> {
		if (!tab.id || !tab.url) return false;

		const rule = await _getRuleFromUrl(tab.url);

		if (rule) {
			try {
				await chrome.tabs.sendMessage(tab.id, { action: 'applyRule', rule: rule });
			} catch (error) {
				// Content script not loaded (likely a tab that was open before extension reload)
				// The content script will apply rules automatically when the tab loads
				console.log(`[TabRulesService] Content script not ready for tab ${tab.id}, rule will be applied on next load`);
			}
		}

		return !!rule;
	}

	/**
	 * Handle unique tab logic - close duplicates
	 */
	async handleSetUnique(message: any, currentTab: chrome.tabs.Tab): Promise<void> {
		if (!currentTab.id || !currentTab.url) return;

		const rule = message.rule as Rule;
		const processedUrlFragment = _processUrlFragment(
			message.url_fragment,
			currentTab.url,
			rule?.tab?.url_matcher
		);

		const tabs = await this.queryTabs({});

		for (const tab of tabs) {
			if (!tab.url || !tab.id) continue;

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

	/**
	 * Handle renaming a tab - creates a new rule
	 */
	async handleRenameTab(tab: chrome.tabs.Tab, title: string): Promise<void> {
		if (!tab?.id || !tab?.url || !URL.canParse(tab.url)) return;

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

	/**
	 * Check if a URL should be processed
	 */
	async shouldProcessUrl(url: string): Promise<boolean> {
		return !(await _shouldSkipUrl(url));
	}

	/**
	 * Query tabs helper
	 */
	private queryTabs(queryInfo = {}): Promise<chrome.tabs.Tab[]> {
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
}
