import { _getStorageAsync, _setStorage } from '../common/storage';
import { _isRuleEnabled } from '../common/helpers';
import { RULE_SHORTCUT_SLOTS } from '../common/types';

const BADGE_DURATION_MS = 2000;

/**
 * Service responsible for toggling rules with keyboard shortcuts
 * Users assign keys to the toggle-rule-N commands in chrome://extensions/shortcuts
 */
export class RuleShortcutService {
	/**
	 * Returns the shortcut slot of a toggle-rule-N command, or null for other commands
	 */
	getSlotFromCommand(command: string): number | null {
		const match = command.match(/^toggle-rule-(\d+)$/);
		if (!match) return null;

		const slot = Number(match[1]);
		return slot >= 1 && slot <= RULE_SHORTCUT_SLOTS ? slot : null;
	}

	/**
	 * Toggles the rules assigned to a slot as one group:
	 * if any of them is enabled they are all disabled, otherwise they are all enabled
	 * @returns the new state, or null if no rule uses this slot
	 */
	async toggleSlot(slot: number): Promise<boolean | null> {
		const tabModifier = await _getStorageAsync();
		if (!tabModifier) return null;

		const rules = tabModifier.rules.filter((rule) => rule.shortcut === slot);
		if (rules.length === 0) return null;

		const enable = !rules.some(_isRuleEnabled);
		rules.forEach((rule) => {
			rule.is_enabled = enable;
		});

		await _setStorage(tabModifier);

		return enable;
	}

	/**
	 * Briefly shows the result on the toolbar icon: ON, OFF, or "–" when no rule uses the slot
	 */
	async showFeedback(enabled: boolean | null): Promise<void> {
		const text = enabled === null ? '–' : enabled ? 'ON' : 'OFF';
		const color = enabled === null ? '#ef4444' : enabled ? '#10b981' : '#6b7280';

		await chrome.action.setBadgeBackgroundColor({ color });
		await chrome.action.setBadgeText({ text });

		setTimeout(() => {
			chrome.action.setBadgeText({ text: '' });
		}, BADGE_DURATION_MS);
	}

	/**
	 * Shows the change without a reload: open web pages re-apply their rules,
	 * and an open options page reloads its rule list
	 */
	async propagateChange(): Promise<void> {
		chrome.runtime.sendMessage({ action: 'rulesToggled' }).catch(() => {
			// No options page open
		});

		const tabs = await chrome.tabs.query({ url: ['http://*/*', 'https://*/*'] });

		await Promise.all(
			tabs.map(async (tab) => {
				if (!tab.id) return;
				try {
					await chrome.tabs.sendMessage(tab.id, { action: 'reapplyRules' });
				} catch {
					// Content script not loaded in this tab (e.g. opened before the extension)
				}
			})
		);
	}
}
