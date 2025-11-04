import { Group, Rule, TabModifierSettings } from './types.ts';
import { _clone, _generateRandomId } from './helpers.ts';
import { _safeRegexTestSync } from './regex-safety.ts';
import { compressToUTF16, decompressFromUTF16 } from 'lz-string';

export const STORAGE_KEY = 'tab_modifier';
export const STORAGE_KEY_COMPRESSED = 'tab_modifier_compressed';
export const STORAGE_KEY_METADATA = 'tab_modifier_metadata';
export const STORAGE_KEY_CHUNK_PREFIX = 'tab_modifier_chunk_'; // Keep for migration only

// Chrome storage.local has a 10MB total limit and NO per-key limit
// We only need compression, no chunking!

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

/**
 * Reassemble chunks into original compressed data (for migration only)
 */
function _reassembleChunks(chunks: string[]): string {
	return chunks.join('');
}

/**
 * Helper to get all storage keys from local storage
 */
function _getAllLocalStorageKeys(): Promise<Record<string, any>> {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get(null, (items) => {
			if (chrome.runtime.lastError) {
				reject(new Error(chrome.runtime.lastError.message));
			} else {
				resolve(items || {});
			}
		});
	});
}

/**
 * Helper to get all storage keys from sync storage (for migration)
 */
function _getAllSyncStorageKeys(): Promise<Record<string, any>> {
	return new Promise((resolve, reject) => {
		chrome.storage.sync.get(null, (items) => {
			if (chrome.runtime.lastError) {
				reject(new Error(chrome.runtime.lastError.message));
			} else {
				resolve(items || {});
			}
		});
	});
}

/**
 * Helper function to load data from a specific storage (local or sync)
 */
async function _loadFromStorage(
	storage: chrome.storage.StorageArea,
	storageName: string
): Promise<TabModifierSettings | null> {
	return new Promise((resolve) => {
		// Check for chunked data first
		storage.get([STORAGE_KEY_METADATA], (metadataItems) => {
			if (chrome.runtime.lastError) {
				resolve(null);
				return;
			}

			const metadata = metadataItems[STORAGE_KEY_METADATA];

			// Chunked format
			if (metadata && metadata.chunkCount > 0) {
				const chunkKeys = Array.from(
					{ length: metadata.chunkCount },
					(_, i) => `${STORAGE_KEY_CHUNK_PREFIX}${i}`
				);

				storage.get(chunkKeys, (chunkItems) => {
					if (chrome.runtime.lastError) {
						resolve(null);
						return;
					}

					// Reassemble chunks
					const chunks: string[] = [];
					for (let i = 0; i < metadata.chunkCount; i++) {
						const chunk = chunkItems[`${STORAGE_KEY_CHUNK_PREFIX}${i}`];
						if (!chunk) {
							console.error(`[Tabee] Missing chunk ${i} in ${storageName} storage`);
							resolve(null);
							return;
						}
						chunks.push(chunk);
					}

					const compressed = _reassembleChunks(chunks);
					const decompressed = _decompressData(compressed);

					if (decompressed) {
						console.log(
							`[Tabee] Loaded data from ${metadata.chunkCount} chunks (${storageName} storage)`
						);
						resolve(decompressed);
					} else {
						resolve(null);
					}
				});
				return;
			}

			// Try compressed single item or uncompressed
			storage.get([STORAGE_KEY, STORAGE_KEY_COMPRESSED], (items) => {
				if (chrome.runtime.lastError) {
					resolve(null);
					return;
				}

				// Try compressed first
				if (items[STORAGE_KEY_COMPRESSED]) {
					const decompressed = _decompressData(items[STORAGE_KEY_COMPRESSED]);
					if (decompressed) {
						console.log(`[Tabee] Loaded compressed data from ${storageName} storage`);
						resolve(decompressed);
						return;
					}
				}

				// Try uncompressed
				if (items[STORAGE_KEY]) {
					console.log(`[Tabee] Loaded uncompressed data from ${storageName} storage`);
					resolve(items[STORAGE_KEY]);
					return;
				}

				resolve(null);
			});
		});
	});
}

export async function _getStorageAsync(): Promise<TabModifierSettings | undefined> {
	try {
		// Try loading from local storage first (current storage)
		let data = await _loadFromStorage(chrome.storage.local, 'local');

		if (data) {
			return data;
		}

		// If not found in local, try sync storage (migration path)
		console.log('[Tabee] No data in local storage, checking sync storage for migration...');
		data = await _loadFromStorage(chrome.storage.sync, 'sync');

		if (data) {
			// Migrate data from sync to local
			console.log('[Tabee] Migrating data from sync storage to local storage...');
			await _setStorage(data);
			console.log('[Tabee] Migration complete!');

			// Clean up sync storage
			await _clearSyncStorage();

			return data;
		}

		// No data found anywhere
		return undefined;
	} catch (error) {
		console.error('[Tabee] Error loading storage:', error);
		throw error;
	}
}

/**
 * Clear sync storage (for migration cleanup)
 */
async function _clearSyncStorage(): Promise<void> {
	const allSyncItems = await _getAllSyncStorageKeys();
	const keysToRemove = Object.keys(allSyncItems).filter(
		(key) =>
			key === STORAGE_KEY ||
			key === STORAGE_KEY_COMPRESSED ||
			key === STORAGE_KEY_METADATA ||
			key.startsWith(STORAGE_KEY_CHUNK_PREFIX)
	);

	if (keysToRemove.length > 0) {
		await chrome.storage.sync.remove(keysToRemove);
		console.log(`[Tabee] Cleared ${keysToRemove.length} keys from sync storage`);
	}
}

export async function _clearStorage(): Promise<void> {
	// Clear local storage
	const allLocalItems = await _getAllLocalStorageKeys();
	const keysToRemove = Object.keys(allLocalItems).filter(
		(key) =>
			key === STORAGE_KEY ||
			key === STORAGE_KEY_COMPRESSED ||
			key === STORAGE_KEY_METADATA ||
			key.startsWith(STORAGE_KEY_CHUNK_PREFIX)
	);

	if (keysToRemove.length > 0) {
		await chrome.storage.local.remove(keysToRemove);
		console.log(`[Tabee] Cleared ${keysToRemove.length} keys from local storage`);
	}

	// Also clear sync storage (for migration cleanup)
	await _clearSyncStorage();
}

export async function _setStorage(tabModifier: TabModifierSettings): Promise<void> {
	const data = _clone({
		rules: tabModifier.rules,
		groups: tabModifier.groups,
		settings: tabModifier.settings,
	});

	try {
		const originalSize = JSON.stringify(data).length;

		// Always compress and use local storage (simple!)
		const compressed = _compressData(data);
		const compressedSize = compressed.length;

		console.log(
			`[Tabee] Saving ${originalSize} bytes (compressed to ${compressedSize} bytes) to local storage`
		);

		// Save compressed data to local storage
		// No chunking needed - local storage has no per-key limit!
		await chrome.storage.local.set({
			[STORAGE_KEY_COMPRESSED]: compressed,
		});

		console.log(`[Tabee] Data saved successfully to local storage`);

		// Clean up any old sync storage data (migration cleanup)
		await _clearSyncStorage();

		const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
		console.log(
			`[Tabee] Storage complete: ${originalSize} → ${compressedSize} bytes (${ratio}% reduction)`
		);
	} catch (error) {
		console.error('[Tabee] Failed to save data:', error);
		throw error;
	}
}

export async function _getRuleFromUrl(url: string): Promise<Rule | undefined> {
	const tabModifier = await _getStorageAsync();
	if (!tabModifier) {
		return;
	}

	const foundRule = tabModifier.rules.find((r) => {
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

// Old migration functions removed - no longer needed with local-only storage

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
