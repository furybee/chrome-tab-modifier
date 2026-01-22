import type { Rule } from '../common/types';
import { TitleService } from './TitleService';
import { IconService } from './IconService';

/**
 * Service responsible for applying rules to the current tab
 * Orchestrates title, icon, and other rule modifications
 */
export class RuleApplicationService {
	private titleService: TitleService;
	private iconService: IconService;
	private titleObserver: MutationObserver | null = null;
	private iconObserver: MutationObserver | null = null;

	constructor(titleService: TitleService, iconService: IconService) {
		this.titleService = titleService;
		this.iconService = iconService;
	}

	/**
	 * Applies a rule to the current page
	 * @param rule - The rule to apply
	 * @param updateTitle - Whether to update the title (default: true)
	 */
	async applyRule(rule: Rule, updateTitle: boolean = true): Promise<void> {
		if (!rule) {
			return;
		}

		if (rule.is_enabled === undefined) {
			rule.is_enabled = true;
		}

		if (rule.is_enabled === false) {
			return;
		}

		// Handle title modification with MutationObserver
		if (rule.tab.title && updateTitle) {
			this.applyTitleRule(rule);
		}

		// Pinning, muting handled through Chrome Runtime messages
		if (rule.tab.pinned) {
			await chrome.runtime.sendMessage({ action: 'setPinned' });
		}

		if (rule.tab.muted) {
			await chrome.runtime.sendMessage({ action: 'setMuted' });
		}

		// Favicon handling with MutationObserver
		if (rule.tab.icon && updateTitle) {
			this.applyIconRule(rule);
		}

		// Protection handling
		if (rule.tab.protected) {
			await chrome.runtime.sendMessage({
				action: 'setProtected',
			});
		}

		// Note: unique tab handling is now done in background.ts for faster duplicate closing
		// No need to send message here as it's already handled during tab.onUpdated

		// Tab grouping is now handled directly in background.ts to avoid race conditions
		// No need to send a message here anymore
	}

	/**
	 * Applies title rule with MutationObserver for dynamic title changes
	 * @param rule - The rule containing title configuration
	 */
	private applyTitleRule(rule: Rule): void {
		let originalTitleElement = document.querySelector('meta[name="original-tab-modifier-title"]');

		if (!originalTitleElement) {
			originalTitleElement = document.createElement('meta');
			originalTitleElement.setAttribute('name', 'original-tab-modifier-title');
			originalTitleElement.setAttribute('content', document.title);
			document.head.appendChild(originalTitleElement);
		}

		let originalTitle = originalTitleElement.getAttribute('content') || document.title;
		document.title = this.titleService.processTitle(location.href, originalTitle, rule);

		// CRITICAL FIX: Disconnect old observer before creating a new one
		// This prevents memory leaks and infinite loops on SPAs
		if (this.titleObserver) {
			this.titleObserver.disconnect();
			this.titleObserver = null;
		}

		// Only observe the title element, not the entire document
		// This drastically reduces the number of mutation callbacks
		const titleElement = document.querySelector('title');
		if (!titleElement) return;

		const config = { childList: true, characterData: true, subtree: true };
		let lastTitle = document.title;

		const callback = () => {
			if (document.title !== lastTitle) {
				originalTitleElement!.setAttribute('content', document.title);

				originalTitle = originalTitleElement!.getAttribute('content') || document.title;
				document.title = this.titleService.processTitle(location.href, originalTitle, rule);

				lastTitle = document.title;
			}
		};

		// Store the observer as an instance variable to reuse/disconnect later
		this.titleObserver = new MutationObserver(callback);
		this.titleObserver.observe(titleElement, config);
	}

	/**
	 * Applies icon rule with MutationObserver for dynamic icon changes
	 * @param rule - The rule containing icon configuration
	 */
	private applyIconRule(rule: Rule): void {
		if (!rule.tab.icon) return;

		const iconUrl = rule.tab.icon;
		this.iconService.processIcon(iconUrl);

		// CRITICAL FIX: Disconnect old observer before creating a new one
		// This prevents memory leaks and infinite loops on SPAs
		if (this.iconObserver) {
			this.iconObserver.disconnect();
			this.iconObserver = null;
		}

		let iconChangedByMe = false;

		// Store the observer as an instance variable to reuse/disconnect later
		this.iconObserver = new MutationObserver((mutations) => {
			if (!iconChangedByMe) {
				mutations.forEach((mutation) => {
					if ((mutation.target as any).type === 'image/x-icon') {
						this.iconService.processIcon(iconUrl);
						iconChangedByMe = true;
					} else if (mutation.addedNodes.length) {
						mutation.addedNodes.forEach((node) => {
							if ((node as any).type === 'image/x-icon') {
								this.iconService.processIcon(iconUrl);
								iconChangedByMe = true;
							}
						});
					} else if (mutation.removedNodes.length) {
						mutation.removedNodes.forEach((node) => {
							if ((node as any).type === 'image/x-icon') {
								this.iconService.processIcon(iconUrl);
								iconChangedByMe = true;
							}
						});
					}
				});
			} else {
				iconChangedByMe = false;
			}
		});

		this.iconObserver.observe(document.head, {
			attributes: true,
			childList: true,
			characterData: true,
			subtree: true,
			attributeOldValue: true,
			characterDataOldValue: true,
		});
	}
}
