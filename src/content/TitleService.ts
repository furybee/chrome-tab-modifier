import type { Rule } from '../common/types';
import { RegexService } from './RegexService';

/**
 * Service responsible for processing and updating page titles
 * Handles selector extraction, regex matching, and title updates
 */
export class TitleService {
	private regexService: RegexService;

	constructor(regexService: RegexService) {
		this.regexService = regexService;
	}

	/**
	 * Updates a title by replacing a tag with a value
	 * @param title - The current title
	 * @param tag - The tag to replace
	 * @param value - The value to replace with
	 * @returns The updated title
	 */
	updateTitle(title: string, tag: string, value: string): string {
		if (!value) return title;
		// edge cases for unmatched capture groups
		if (value.startsWith('$')) return title.replace(tag, decodeURI(''));
		if (value.startsWith('@')) return title.replace(tag, decodeURI(''));
		return title.replace(tag, decodeURI(value));
	}

	/**
	 * Extracts text content from DOM using a CSS selector
	 * Supports wildcard selectors with * character
	 * @param selector - CSS selector string
	 * @returns Extracted text content or empty string
	 */
	getTextBySelector(selector: string): string {
		let el: Element | null = null;

		if (selector.includes('*')) {
			const parts = selector.split(' ');

			const toSafe = (s: string) =>
				typeof CSS !== 'undefined' && CSS.escape
					? CSS.escape(s)
					: s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/]/g, '\\]');

			const modifiedParts = parts.map((part) => {
				if (!part.includes('*')) return part;
				if (part.startsWith('.')) {
					const raw = part.replace(/\./g, '').replace(/\*/g, '');
					return `[class*="${toSafe(raw)}"]`;
				}
				const rawAttr = part.replace(/\*/g, '');
				return `[${toSafe(rawAttr)}]`;
			});

			const modifiedSelector = modifiedParts.join(' ');
			const elements = document.querySelectorAll(modifiedSelector);

			if (elements.length > 0) {
				el = elements[0];
			}
		} else {
			el = document.querySelector(selector);
		}

		let value = '';

		if (el) {
			let targetEl: any = el;
			if (el.childNodes.length > 0) {
				targetEl = el.childNodes[0];
			}

			if (targetEl.tagName?.toLowerCase() === 'input') {
				value = (targetEl as HTMLInputElement).value;
			} else if (targetEl.tagName?.toLowerCase() === 'select') {
				const selectEl = targetEl as HTMLSelectElement;
				value = selectEl.options[selectEl.selectedIndex].text;
			} else {
				value = targetEl.innerText || targetEl.textContent;
			}
		}

		return value.trim();
	}

	/**
	 * Processes a title template with selector extraction and regex matching
	 * @param currentUrl - The current page URL
	 * @param currentTitle - The current page title
	 * @param rule - The rule to apply
	 * @returns The processed title
	 */
	processTitle(currentUrl: string, currentTitle: string, rule: Rule): string {
		let title = rule.tab.title;
		const matches = title.match(/\{([^}]+)}/g);

		if (matches) {
			let selector: string, text: string;

			matches.forEach((match) => {
				selector = match.substring(1, match.length - 1);

				if (selector === 'title') {
					text = currentTitle;
				} else {
					text = this.getTextBySelector(selector);
				}

				title = this.updateTitle(title, match, text);
			});
		}

		if (rule.tab.title_matcher) {
			try {
				const regex = this.regexService.createSafeRegex(rule.tab.title_matcher, 'g');
				let matches: RegExpExecArray | null;
				let i = 0;
				let iterationCount = 0;
				const maxIterations = 100; // Prevent infinite loops

				while ((matches = regex.exec(currentTitle)) !== null && iterationCount < maxIterations) {
					for (let j = 0; j < matches.length; j++) {
						let tag = '@' + i;
						title = this.updateTitle(title, tag, matches[j] ?? tag);
						i++;
					}
					iterationCount++;
				}
			} catch (e) {
				console.error('Error processing title_matcher regex:', e);
			}
		}

		if (rule.tab.url_matcher) {
			try {
				const regex = this.regexService.createSafeRegex(rule.tab.url_matcher, 'g');
				let matches: RegExpExecArray | null;
				let i = 0;
				let iterationCount = 0;
				const maxIterations = 100; // Prevent infinite loops

				while ((matches = regex.exec(currentUrl)) !== null && iterationCount < maxIterations) {
					for (let j = 0; j < matches.length; j++) {
						let tag = '$' + i;
						title = this.updateTitle(title, tag, matches[j] ?? tag);
						i++;
					}
					iterationCount++;
				}
			} catch (e) {
				console.error('Error processing url_matcher regex:', e);
			}
		}

		// Remove unhandled capture groups
		title = title.replace(/\s*[$@]\d+\s*/g, ' ').trim();

		return title;
	}
}
