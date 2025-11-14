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
				console.log(
					`[TabRulesService] Content script not ready for tab ${tab.id}, rule will be applied on next load`
				);
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
		const urlFragment = message.url_fragment;

		// Check if current tab URL matches the url_matcher pattern (if defined)
		// If not, skip unique tab logic (tab doesn't match the rule)
		if (rule?.tab?.url_matcher) {
			try {
				const regex = new RegExp(rule.tab.url_matcher);
				if (!regex.test(currentTab.url)) {
					console.log(
						'[TabRulesService] Current tab URL does not match url_matcher, skipping unique check'
					);
					return;
				}
			} catch (error) {
				console.error('[TabRulesService] Invalid url_matcher regex:', error);
				return;
			}
		}

		const processedUrlFragment = _processUrlFragment(
			urlFragment,
			currentTab.url,
			rule?.tab?.url_matcher
		);

		const tabs = await this.queryTabs({});

		for (const tab of tabs) {
			if (!tab.url || !tab.id) continue;

			// When url_matcher is NOT defined, check if tab matches the same rule
			if (!rule?.tab?.url_matcher) {
				// Check if this tab would match the same rule (using rule detection logic)
				const tabRule = await _getRuleFromUrl(tab.url);

				// If both tabs match the same rule, they're duplicates (close the other tab)
				// This allows all tabs matching the rule to be considered as one "unique" group
				if (tabRule?.id === rule.id && tab.id !== currentTab.id) {
					// Remove beforeunload handler from the duplicate tab before closing it
					try {
						await chrome.scripting.executeScript({
							target: { tabId: tab.id },
							func: () => {
								window.onbeforeunload = null;
							},
						});
					} catch (error) {
						// Ignore errors if we can't execute script (e.g., chrome:// pages)
						console.log(
							`[TabRulesService] Could not remove beforeunload from tab ${tab.id}:`,
							error
						);
					}

					// Close the duplicate tab (keep the current tab)
					await chrome.tabs.remove(tab.id);
					return; // Exit after closing the first duplicate
				}
				continue;
			}

			// Skip tabs that don't match the url_matcher pattern
			// This prevents closing unrelated tabs that happen to have the same processed fragment
			try {
				const regex = new RegExp(rule.tab.url_matcher);
				if (!regex.test(tab.url)) {
					// This tab doesn't match the rule, skip it
					continue;
				}
			} catch (error) {
				console.error('[TabRulesService] Invalid url_matcher regex:', error);
				continue;
			}

			// Process the fragment for each tab to compare
			const tabProcessedFragment = _processUrlFragment(urlFragment, tab.url, rule.tab.url_matcher);

			// Compare processed fragments instead of raw URL
			if (tabProcessedFragment === processedUrlFragment && tab.id !== currentTab.id) {
				// Remove beforeunload handler from the duplicate tab before closing it
				try {
					await chrome.scripting.executeScript({
						target: { tabId: tab.id },
						func: () => {
							window.onbeforeunload = null;
						},
					});
				} catch (error) {
					// Ignore errors if we can't execute script (e.g., chrome:// pages)
					console.log(`[TabRulesService] Could not remove beforeunload from tab ${tab.id}:`, error);
				}

				// Close the duplicate tab (keep the current tab)
				await chrome.tabs.remove(tab.id);
				return; // Exit after closing the first duplicate
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
