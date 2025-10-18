import type { Rule } from '../common/types';
import { RegexService } from './RegexService';

const STORAGE_KEY = 'tab_modifier';

/**
 * Service responsible for storage operations and rule matching
 * Handles Chrome storage API interactions and URL-based rule detection
 */
export class StorageService {
	private regexService: RegexService;

	constructor(regexService: RegexService) {
		this.regexService = regexService;
	}

	/**
	 * Retrieves storage data asynchronously
	 * @returns Promise containing the stored data
	 */
	async getStorageAsync(): Promise<any> {
		return new Promise((resolve, reject) => {
			chrome.storage.sync.get(STORAGE_KEY, (items) => {
				if (chrome.runtime.lastError) {
					reject(new Error(chrome.runtime.lastError.message));
				} else {
					resolve(items[STORAGE_KEY]);
				}
			});
		});
	}

	/**
	 * Finds a rule matching the given URL
	 * @param url - The URL to match against rules
	 * @returns The matching rule or undefined
	 */
	async getRuleFromUrl(url: string): Promise<Rule | undefined> {
		const tabModifier = await this.getStorageAsync();
		if (!tabModifier) {
			return;
		}

		const foundRule = tabModifier.rules.find((r: Rule) => {
			const detectionType = r.detection ?? 'CONTAINS';
			const urlFragment = r.url_fragment;

			switch (detectionType) {
				case 'CONTAINS':
					return url.includes(urlFragment);
				case 'STARTS':
				case 'STARTS_WITH':
					return url.startsWith(urlFragment);
				case 'ENDS':
				case 'ENDS_WITH':
					return url.endsWith(urlFragment);
				case 'REGEX':
				case 'REGEXP':
					try {
						const regex = this.regexService.createSafeRegex(urlFragment);
						return regex.test(url);
					} catch (e) {
						console.error('Error processing regex pattern for URL matching:', e);
						return false;
					}
				case 'EXACT':
					return url === urlFragment;
				default:
					return false;
			}
		});

		if (!foundRule) {
			return;
		}

		return foundRule;
	}
}
