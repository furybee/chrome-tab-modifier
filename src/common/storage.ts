import { Group, Rule, TabModifierSettings } from './types.ts';
import { _clone, _generateRandomId } from './helpers.ts';
import { _safeRegexTestSync } from './regex-safety.ts';
import { compressToUTF16, decompressFromUTF16 } from 'lz-string';

export const STORAGE_KEY = 'tab_modifier';
export const STORAGE_KEY_COMPRESSED = 'tab_modifier_compressed';

export function _getDefaultTabModifierSettings(): TabModifierSettings {
	return {
		rules: [],
		groups: [],
		settings: {
			enable_new_version_notification: false,
			theme: 'tabee',
			lightweight_mode_enabled: false,
			lightweight_mode_patterns: [],
			lightweight_mode_apply_to_rules: true,
			lightweight_mode_apply_to_tab_hive: true,
			auto_close_enabled: false,
			auto_close_timeout: 30, // 30 minutes par défaut
		},
	};
}

export function _getDefaultRule(name: string, title: string, urlFragment: string): Rule {
	return {
		id: _generateRandomId(),
		is_enabled: true,
		name: name,
		detection: 'CONTAINS',
		url_fragment: urlFragment,
		tab: {
			title: title,
			icon: null,
			pinned: false,
			protected: false,
			unique: false,
			muted: false,
			title_matcher: null,
			url_matcher: null,
			group_id: null,
		},
	};
}

export function _getDefaultGroup(title?: string): Group {
	return {
		title: title ?? '',
		color: 'grey',
		collapsed: false,
		id: _generateRandomId(),
	};
}

/**
 * Decompress data from storage
 */
function _decompressData(compressed: string): TabModifierSettings | null {
	try {
		const decompressed = decompressFromUTF16(compressed);
		if (!decompressed) {
			return null;
		}
		return JSON.parse(decompressed);
	} catch (error) {
		console.error('[Tabee] Failed to decompress data:', error);
		return null;
	}
}

/**
 * Compress data for storage
 */
function _compressData(data: TabModifierSettings): string {
	const json = JSON.stringify(data);
	return compressToUTF16(json);
}

export function _getStorageAsync(): Promise<TabModifierSettings | undefined> {
	return new Promise((resolve, reject) => {
		chrome.storage.sync.get([STORAGE_KEY, STORAGE_KEY_COMPRESSED], (items) => {
			if (chrome.runtime.lastError) {
				reject(new Error(chrome.runtime.lastError.message));
			} else {
				// Priority: compressed data first, then uncompressed
				if (items[STORAGE_KEY_COMPRESSED]) {
					const decompressed = _decompressData(items[STORAGE_KEY_COMPRESSED]);
					if (decompressed) {
						resolve(decompressed);
						return;
					}
				}

				// Fallback to uncompressed data (backward compatibility)
				resolve(items[STORAGE_KEY]);
			}
		});
	});
}

export async function _clearStorage(): Promise<void> {
	await chrome.storage.sync.remove([STORAGE_KEY, STORAGE_KEY_COMPRESSED]);
}

export async function _setStorage(tabModifier: TabModifierSettings): Promise<void> {
	const data = _clone({
		rules: tabModifier.rules,
		groups: tabModifier.groups,
		settings: tabModifier.settings,
	});

	try {
		// Compress the data
		const compressed = _compressData(data);

		// Save compressed data and remove old uncompressed key
		await chrome.storage.sync.set({
			[STORAGE_KEY_COMPRESSED]: compressed,
		});

		// Clean up old uncompressed data if it exists
		await chrome.storage.sync.remove(STORAGE_KEY);

		// Log compression stats for debugging
		const originalSize = JSON.stringify(data).length;
		const compressedSize = compressed.length;
		const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
		console.log(
			`[Tabee] Storage compressed: ${originalSize} → ${compressedSize} bytes (${ratio}% reduction)`
		);
	} catch (error) {
		console.error('[Tabee] Failed to save compressed data:', error);
		throw error;
	}
}

export async function _getRuleFromUrl(url: string): Promise<Rule | undefined> {
	const tabModifier = await _getStorageAsync();
	if (!tabModifier) {
		return;
	}

	const foundRule = tabModifier.rules.find((r) => {
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
				// nosemgrep: javascript.lang.security.audit.detect-non-literal-regexp.detect-non-literal-regexp
				// Safe: Pattern is validated by _safeRegexTestSync() which checks for ReDoS patterns
				return _safeRegexTestSync(urlFragment, url);
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

/**
 * Migrates uncompressed data to compressed format
 * This ensures existing users' data gets compressed automatically
 */
export async function _migrateToCompressed(): Promise<void> {
	return new Promise((resolve, reject) => {
		chrome.storage.sync.get([STORAGE_KEY, STORAGE_KEY_COMPRESSED], async (items) => {
			if (chrome.runtime.lastError) {
				reject(new Error(chrome.runtime.lastError.message));
				return;
			}

			try {
				// If we already have compressed data, nothing to migrate
				if (items[STORAGE_KEY_COMPRESSED]) {
					resolve();
					return;
				}

				// If we have uncompressed data, migrate it
				const uncompressedData = items[STORAGE_KEY];
				if (uncompressedData) {
					console.log('[Tabee] Migrating to compressed storage format...');
					await _setStorage(uncompressedData);
					console.log('[Tabee] Compression migration successful');
				}

				resolve();
			} catch (error) {
				console.error('[Tabee] Failed to migrate to compressed format:', error);
				reject(error);
			}
		});
	});
}

/**
 * Migrates data from chrome.storage.local to chrome.storage.sync
 * This function checks if data exists in local storage, and if so,
 * copies it to sync storage and then removes it from local storage.
 * This ensures a smooth transition without breaking existing installations.
 */
export async function _migrateLocalToSync(): Promise<void> {
	return new Promise((resolve, reject) => {
		// Check if data exists in local storage
		chrome.storage.local.get(STORAGE_KEY, async (localItems) => {
			if (chrome.runtime.lastError) {
				reject(new Error(chrome.runtime.lastError.message));
				return;
			}

			const localData = localItems[STORAGE_KEY];

			// If no data in local storage, nothing to migrate
			if (!localData) {
				resolve();
				return;
			}

			try {
				// Check if sync storage already has data
				const syncData = await _getStorageAsync();

				// Only migrate if sync storage is empty
				if (!syncData) {
					console.log('[Tabee] Migrating data from local to sync storage...');
					await _setStorage(localData);
					console.log('[Tabee] Migration successful');
				}

				// Clean up local storage after successful migration
				await chrome.storage.local.remove(STORAGE_KEY);
				console.log('[Tabee] Local storage cleaned up');

				resolve();
			} catch (error) {
				reject(error);
			}
		});
	});
}

/**
 * Check if a URL should be excluded from Tab Modifier processing
 * based on lightweight mode patterns
 */
export async function _shouldSkipUrl(url: string): Promise<boolean> {
	const tabModifier = await _getStorageAsync();
	if (!tabModifier) {
		return false;
	}

	const { settings } = tabModifier;

	// If lightweight mode is not enabled or not configured, don't skip any URLs
	if (!settings.lightweight_mode_enabled || !settings.lightweight_mode_patterns) {
		return false;
	}

	// Check if URL matches any enabled pattern
	for (const pattern of settings.lightweight_mode_patterns) {
		if (!pattern.enabled) continue;

		try {
			if (pattern.type === 'domain') {
				// Simple domain matching
				if (url.includes(pattern.pattern)) {
					return true;
				}
			} else if (pattern.type === 'regex') {
				// Regex matching with safety check
				const isMatch = _safeRegexTestSync(pattern.pattern, url);
				if (isMatch) {
					return true;
				}
			}
		} catch (error) {
			console.error('[Tabee] Error checking lightweight mode pattern:', error);
			// Continue checking other patterns
		}
	}

	return false;
}
