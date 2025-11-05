import type { Rule, TabModifierSettings } from '../common/types';
import { RegexService } from './RegexService';
import { decompressFromUTF16 } from 'lz-string';

const STORAGE_KEY = 'tab_modifier';
const STORAGE_KEY_COMPRESSED = 'tab_modifier_compressed';

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
	 * Decompress data from storage
	 */
	private decompressData(compressed: string): TabModifierSettings | null {
		try {
			const decompressed = decompressFromUTF16(compressed);
			if (!decompressed) {
				return null;
			}
			return JSON.parse(decompressed);
		} catch (error) {
			console.error('[Tabee Content] Failed to decompress data:', error);
			return null;
		}
	}

	/**
	 * Retrieves storage data asynchronously
	 * @returns Promise containing the stored data
	 */
	async getStorageAsync(): Promise<any> {
		return new Promise((resolve, reject) => {
			chrome.storage.local.get([STORAGE_KEY, STORAGE_KEY_COMPRESSED], (items) => {
				if (chrome.runtime.lastError) {
					reject(new Error(chrome.runtime.lastError.message));
				} else {
					// Priority: compressed data first, then uncompressed
					if (items[STORAGE_KEY_COMPRESSED]) {
						const decompressed = this.decompressData(items[STORAGE_KEY_COMPRESSED]);
						if (decompressed) {
							resolve(decompressed);
							return;
						}
						console.warn('[Tabee Content] Failed to decompress data, falling back to uncompressed');
					}

					// Fallback to uncompressed data (backward compatibility)
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
			// Skip disabled rules
			if (r.is_enabled === false) {
				return false;
			}

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
