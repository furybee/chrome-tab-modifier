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

		// Protection and unique tab handling
		if (rule.tab.protected) {
			await chrome.runtime.sendMessage({
				action: 'setProtected',
			});
		}

		if (rule.tab.unique) {
			await chrome.runtime.sendMessage({
				action: 'setUnique',
				url_fragment: rule.url_fragment,
				rule: rule,
			});
		}

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

		const targetNode = document.documentElement;
		const config = { childList: true, subtree: true };
		let lastTitle = document.title;

		const callback = () => {
			if (document.title !== lastTitle) {
				originalTitleElement!.setAttribute('content', document.title);

				originalTitle = originalTitleElement!.getAttribute('content') || document.title;
				document.title = this.titleService.processTitle(location.href, originalTitle, rule);

				lastTitle = document.title;
			}
		};

		const observer = new MutationObserver(callback);
		observer.observe(targetNode, config);
	}

	/**
	 * Applies icon rule with MutationObserver for dynamic icon changes
	 * @param rule - The rule containing icon configuration
	 */
	private applyIconRule(rule: Rule): void {
		if (!rule.tab.icon) return;

		const iconUrl = rule.tab.icon;
		this.iconService.processIcon(iconUrl);

		let iconChangedByMe = false;

		const iconObserver = new MutationObserver((mutations) => {
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

		iconObserver.observe(document.head, {
			attributes: true,
			childList: true,
			characterData: true,
			subtree: true,
			attributeOldValue: true,
			characterDataOldValue: true,
		});
	}
}
