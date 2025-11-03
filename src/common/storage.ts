import { Group, Rule, TabModifierSettings } from './types.ts';
import { _clone, _generateRandomId } from './helpers.ts';
import { _safeRegexTestSync } from './regex-safety.ts';
import { compressToUTF16, decompressFromUTF16 } from 'lz-string';

export const STORAGE_KEY = 'tab_modifier';
export const STORAGE_KEY_COMPRESSED = 'tab_modifier_compressed';
export const STORAGE_KEY_METADATA = 'tab_modifier_metadata';
export const STORAGE_KEY_CHUNK_PREFIX = 'tab_modifier_chunk_';

// Chrome storage.sync limits
export const QUOTA_BYTES_PER_ITEM = 8192; // 8KB per item
export const MAX_ITEMS = 512;
// Use 7KB per chunk to leave safety margin for JSON overhead and metadata
export const CHUNK_SIZE = 7000;

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
 * Split compressed data into chunks that fit within Chrome storage limits
 */
function _createChunks(compressedData: string): string[] {
	const chunks: string[] = [];
	let offset = 0;

	while (offset < compressedData.length) {
		chunks.push(compressedData.substring(offset, offset + CHUNK_SIZE));
		offset += CHUNK_SIZE;
	}

	return chunks;
}

/**
 * Reassemble chunks into original compressed data
 */
function _reassembleChunks(chunks: string[]): string {
	return chunks.join('');
}

/**
 * Helper to get all storage keys (Promise wrapper)
 */
function _getAllStorageKeys(): Promise<Record<string, any>> {
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

export function _getStorageAsync(): Promise<TabModifierSettings | undefined> {
	return new Promise((resolve, reject) => {
		// First, check for chunked data (new format)
		chrome.storage.sync.get([STORAGE_KEY_METADATA], async (metadataItems) => {
			if (chrome.runtime.lastError) {
				reject(new Error(chrome.runtime.lastError.message));
				return;
			}

			const metadata = metadataItems[STORAGE_KEY_METADATA];

			// New chunked format
			if (metadata && metadata.chunkCount > 0) {
				try {
					const chunkKeys = Array.from(
						{ length: metadata.chunkCount },
						(_, i) => `${STORAGE_KEY_CHUNK_PREFIX}${i}`
					);

					chrome.storage.sync.get(chunkKeys, (chunkItems) => {
						if (chrome.runtime.lastError) {
							reject(new Error(chrome.runtime.lastError.message));
							return;
						}

						// Reassemble chunks in order
						const chunks: string[] = [];
						for (let i = 0; i < metadata.chunkCount; i++) {
							const chunk = chunkItems[`${STORAGE_KEY_CHUNK_PREFIX}${i}`];
							if (!chunk) {
								console.error(`[Tabee] Missing chunk ${i}`);
								reject(new Error(`Missing chunk ${i}`));
								return;
							}
							chunks.push(chunk);
						}

						const compressed = _reassembleChunks(chunks);
						const decompressed = _decompressData(compressed);

						if (decompressed) {
							console.log(`[Tabee] Loaded data from ${metadata.chunkCount} chunks`);
							resolve(decompressed);
						} else {
							reject(new Error('Failed to decompress chunked data'));
						}
					});
				} catch (error) {
					console.error('[Tabee] Error reading chunked data:', error);
					reject(error);
				}
				return;
			}

			// Legacy format: try compressed single item, then uncompressed
			chrome.storage.sync.get([STORAGE_KEY, STORAGE_KEY_COMPRESSED], (items) => {
				if (chrome.runtime.lastError) {
					reject(new Error(chrome.runtime.lastError.message));
					return;
				}

				// Priority: compressed data first, then uncompressed
				if (items[STORAGE_KEY_COMPRESSED]) {
					const decompressed = _decompressData(items[STORAGE_KEY_COMPRESSED]);
					if (decompressed) {
						resolve(decompressed);
						return;
					}
					console.warn('[Tabee] Failed to decompress data, falling back to uncompressed');
				}

				// Fallback to uncompressed data (backward compatibility)
				resolve(items[STORAGE_KEY]);
			});
		});
	});
}

export async function _clearStorage(): Promise<void> {
	// Get all storage keys
	const allItems = await _getAllStorageKeys();
	const keysToRemove = Object.keys(allItems).filter(
		(key) =>
			key === STORAGE_KEY ||
			key === STORAGE_KEY_COMPRESSED ||
			key === STORAGE_KEY_METADATA ||
			key.startsWith(STORAGE_KEY_CHUNK_PREFIX)
	);

	if (keysToRemove.length > 0) {
		await chrome.storage.sync.remove(keysToRemove);
		console.log(`[Tabee] Cleared ${keysToRemove.length} storage keys`);
	}
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
		const originalSize = JSON.stringify(data).length;
		const compressedSize = compressed.length;

		// Determine if we need chunking (leave 1KB margin for safety)
		const needsChunking = compressedSize > QUOTA_BYTES_PER_ITEM - 1000;

		if (needsChunking) {
			// Split into chunks
			const chunks = _createChunks(compressed);

			// Check if we exceed the item limit
			if (chunks.length + 1 > MAX_ITEMS) {
				throw new Error(
					`Data too large: requires ${chunks.length} chunks but limit is ${MAX_ITEMS}`
				);
			}

			// Prepare chunk data
			const chunkData: Record<string, string> = {};
			chunks.forEach((chunk, index) => {
				chunkData[`${STORAGE_KEY_CHUNK_PREFIX}${index}`] = chunk;
			});

			// Save metadata
			chunkData[STORAGE_KEY_METADATA] = JSON.stringify({
				version: 2,
				chunkCount: chunks.length,
				originalSize,
				compressedSize,
			});

			// Save all chunks atomically
			await chrome.storage.sync.set(chunkData);

			// Clean up old single-item storage
			await chrome.storage.sync.remove([STORAGE_KEY, STORAGE_KEY_COMPRESSED]);

			const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
			console.log(
				`[Tabee] Storage chunked: ${originalSize} → ${compressedSize} bytes (${ratio}% reduction) in ${chunks.length} chunks`
			);
		} else {
			// Data fits in single item, use old format for compatibility
			await chrome.storage.sync.set({
				[STORAGE_KEY_COMPRESSED]: compressed,
			});

			// Clean up old formats
			await chrome.storage.sync.remove([STORAGE_KEY, STORAGE_KEY_METADATA]);

			// Also clean up any old chunks
			const allItems = await _getAllStorageKeys();
			const oldChunks = Object.keys(allItems).filter((key) =>
				key.startsWith(STORAGE_KEY_CHUNK_PREFIX)
			);
			if (oldChunks.length > 0) {
				await chrome.storage.sync.remove(oldChunks);
			}

			const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
			console.log(
				`[Tabee] Storage compressed: ${originalSize} → ${compressedSize} bytes (${ratio}% reduction)`
			);
		}
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
 * Migrates data to the most appropriate storage format
 * This handles migration from:
 * 1. Uncompressed -> Compressed (old migration)
 * 2. Compressed single item -> Chunked format (if data is too large)
 *
 * The function automatically determines if chunking is needed based on data size
 */
export async function _migrateToCompressed(): Promise<void> {
	return new Promise((resolve, reject) => {
		chrome.storage.sync.get(
			[STORAGE_KEY, STORAGE_KEY_COMPRESSED, STORAGE_KEY_METADATA],
			async (items) => {
				if (chrome.runtime.lastError) {
					reject(new Error(chrome.runtime.lastError.message));
					return;
				}

				try {
					// If we already have chunked data, nothing to migrate
					if (items[STORAGE_KEY_METADATA]) {
						console.log('[Tabee] Already using chunked storage format');
						resolve();
						return;
					}

					// If we have compressed data, check if it needs chunking
					if (items[STORAGE_KEY_COMPRESSED]) {
						const compressedSize = items[STORAGE_KEY_COMPRESSED].length;

						// If compressed data is close to the limit, migrate to chunked format
						if (compressedSize > QUOTA_BYTES_PER_ITEM - 1000) {
							console.log('[Tabee] Migrating to chunked storage format (data too large)...');
							const decompressed = _decompressData(items[STORAGE_KEY_COMPRESSED]);
							if (decompressed) {
								await _setStorage(decompressed);
								console.log('[Tabee] Migration to chunked format successful');
							}
						}
						resolve();
						return;
					}

					// If we have uncompressed data, migrate it (this will auto-chunk if needed)
					const uncompressedData = items[STORAGE_KEY];
					if (uncompressedData) {
						console.log('[Tabee] Migrating to compressed storage format...');
						await _setStorage(uncompressedData);
						console.log('[Tabee] Compression migration successful');
					}

					resolve();
				} catch (error) {
					console.error('[Tabee] Failed to migrate storage format:', error);
					// Don't reject - allow the app to continue with existing data
					resolve();
				}
			}
		);
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
