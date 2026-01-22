import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	_getStorageAsync,
	_setStorage,
	_clearStorage,
	STORAGE_KEY,
	STORAGE_KEY_COMPRESSED,
	STORAGE_KEY_METADATA,
	STORAGE_KEY_CHUNK_PREFIX,
} from '../storage';
import { TabModifierSettings } from '../types';
import { compressToUTF16 } from 'lz-string';

// Mock chrome.storage API
const mockLocalStorage: Record<string, any> = {};
const mockSyncStorage: Record<string, any> = {};

// @ts-ignore - global is from vitest setup
global.chrome = {
	storage: {
		local: {
			get: vi.fn((keys: string[] | null, callback: (items: any) => void) => {
				if (keys === null) {
					callback(mockLocalStorage);
				} else {
					const result: Record<string, any> = {};
					(Array.isArray(keys) ? keys : [keys]).forEach((key) => {
						if (key in mockLocalStorage) {
							result[key] = mockLocalStorage[key];
						}
					});
					callback(result);
				}
			}),
			set: vi.fn((items: Record<string, any>, callback?: () => void) => {
				Object.assign(mockLocalStorage, items);
				callback?.();
				return Promise.resolve();
			}),
			remove: vi.fn((keys: string | string[], callback?: () => void) => {
				const keysArray = Array.isArray(keys) ? keys : [keys];
				keysArray.forEach((key) => delete mockLocalStorage[key]);
				callback?.();
				return Promise.resolve();
			}),
		},
		sync: {
			get: vi.fn((keys: string[] | null, callback: (items: any) => void) => {
				if (keys === null) {
					callback(mockSyncStorage);
				} else {
					const result: Record<string, any> = {};
					(Array.isArray(keys) ? keys : [keys]).forEach((key) => {
						if (key in mockSyncStorage) {
							result[key] = mockSyncStorage[key];
						}
					});
					callback(result);
				}
			}),
			set: vi.fn((items: Record<string, any>, callback?: () => void) => {
				Object.assign(mockSyncStorage, items);
				callback?.();
				return Promise.resolve();
			}),
			remove: vi.fn((keys: string | string[], callback?: () => void) => {
				const keysArray = Array.isArray(keys) ? keys : [keys];
				keysArray.forEach((key) => delete mockSyncStorage[key]);
				callback?.();
				return Promise.resolve();
			}),
		},
	},
	runtime: {
		lastError: undefined,
	},
} as any;

const createMockData = (rulesCount: number): TabModifierSettings => ({
	rules: Array.from({ length: rulesCount }, (_, i) => ({
		id: `rule_${i}`,
		is_enabled: true,
		name: `Test Rule ${i}`,
		detection: 'CONTAINS' as const,
		url_fragment: `example${i}.com`,
		tab: {
			title: `[TEST ${i}] {title}`,
			icon: null,
			pinned: false,
			protected: false,
			unique: false,
			muted: false,
			title_matcher: null,
			url_matcher: null,
			group_id: null,
		},
	})),
	groups: [],
	settings: {
		enable_new_version_notification: false,
		theme: 'tabee',
		lightweight_mode_enabled: false,
		lightweight_mode_patterns: [],
		lightweight_mode_apply_to_rules: true,
		lightweight_mode_apply_to_tab_hive: true,
		auto_close_enabled: false,
		auto_close_timeout: 30,
		tab_hive_reject_list: [],
		debug_mode: false,
	},
});

describe('Storage Migration Tests', () => {
	beforeEach(() => {
		// Clear mock storage before each test
		Object.keys(mockLocalStorage).forEach((key) => delete mockLocalStorage[key]);
		Object.keys(mockSyncStorage).forEach((key) => delete mockSyncStorage[key]);
		vi.clearAllMocks();
	});

	describe('Migration from Sync to Local', () => {
		it('should migrate uncompressed data from sync storage', async () => {
			// Setup: Old format with uncompressed data in sync
			const mockData = createMockData(5);
			mockSyncStorage[STORAGE_KEY] = mockData;

			// Load data (should trigger migration)
			const result = await _getStorageAsync();

			// Verify migration happened
			expect(result).toBeDefined();
			expect(result?.rules.length).toBe(5);
			expect(mockLocalStorage[STORAGE_KEY_COMPRESSED]).toBeDefined();
			expect(mockSyncStorage[STORAGE_KEY]).toBeUndefined(); // Cleaned up
		});

		it('should migrate compressed data from sync storage', async () => {
			// Setup: Compressed format in sync
			const mockData = createMockData(10);
			const compressed = compressToUTF16(JSON.stringify(mockData));
			mockSyncStorage[STORAGE_KEY_COMPRESSED] = compressed;

			// Load data (should trigger migration)
			const result = await _getStorageAsync();

			// Verify migration happened
			expect(result).toBeDefined();
			expect(result?.rules.length).toBe(10);
			expect(mockLocalStorage[STORAGE_KEY_COMPRESSED]).toBeDefined();
			expect(mockSyncStorage[STORAGE_KEY_COMPRESSED]).toBeUndefined(); // Cleaned up
		});

		it('should migrate chunked data from sync storage', async () => {
			// Setup: Chunked format in sync (large dataset)
			const mockData = createMockData(100);
			const compressed = compressToUTF16(JSON.stringify(mockData));

			// Simulate chunked data (split into 3 chunks)
			const chunkSize = Math.ceil(compressed.length / 3);
			const chunks = [
				compressed.substring(0, chunkSize),
				compressed.substring(chunkSize, chunkSize * 2),
				compressed.substring(chunkSize * 2),
			];

			mockSyncStorage[STORAGE_KEY_CHUNK_PREFIX + '0'] = chunks[0];
			mockSyncStorage[STORAGE_KEY_CHUNK_PREFIX + '1'] = chunks[1];
			mockSyncStorage[STORAGE_KEY_CHUNK_PREFIX + '2'] = chunks[2];
			mockSyncStorage[STORAGE_KEY_METADATA] = {
				version: 2,
				chunkCount: 3,
				originalSize: JSON.stringify(mockData).length,
				compressedSize: compressed.length,
			};

			// Load data (should trigger migration)
			const result = await _getStorageAsync();

			// Verify migration happened
			expect(result).toBeDefined();
			expect(result?.rules.length).toBe(100);
			expect(mockLocalStorage[STORAGE_KEY_COMPRESSED]).toBeDefined();

			// Verify sync storage was cleaned up
			expect(mockSyncStorage[STORAGE_KEY_CHUNK_PREFIX + '0']).toBeUndefined();
			expect(mockSyncStorage[STORAGE_KEY_CHUNK_PREFIX + '1']).toBeUndefined();
			expect(mockSyncStorage[STORAGE_KEY_CHUNK_PREFIX + '2']).toBeUndefined();
			expect(mockSyncStorage[STORAGE_KEY_METADATA]).toBeUndefined();
		});

		it('should handle already migrated data in local storage', async () => {
			// Setup: Data already in local storage
			const mockData = createMockData(5);
			const compressed = compressToUTF16(JSON.stringify(mockData));
			mockLocalStorage[STORAGE_KEY_COMPRESSED] = compressed;

			// Load data (should NOT trigger migration)
			const result = await _getStorageAsync();

			// Verify data is loaded correctly
			expect(result).toBeDefined();
			expect(result?.rules.length).toBe(5);

			// Verify local storage was used
			expect(chrome.storage.local.get).toHaveBeenCalled();
		});
	});

	describe('New Storage Format (Local Only)', () => {
		it('should save data to local storage with compression', async () => {
			const mockData = createMockData(20);

			await _setStorage(mockData);

			// Verify data is saved compressed in local storage
			expect(mockLocalStorage[STORAGE_KEY_COMPRESSED]).toBeDefined();
			expect(typeof mockLocalStorage[STORAGE_KEY_COMPRESSED]).toBe('string');

			// Verify no chunking (single compressed item)
			expect(mockLocalStorage[STORAGE_KEY_METADATA]).toBeUndefined();
			expect(mockLocalStorage[STORAGE_KEY_CHUNK_PREFIX + '0']).toBeUndefined();
		});

		it('should handle large datasets (80KB+)', async () => {
			// Create a large dataset
			const mockData = createMockData(200);
			const jsonSize = JSON.stringify(mockData).length;
			console.log(`Test data size: ${jsonSize} bytes`);

			await _setStorage(mockData);

			// Verify data is saved
			expect(mockLocalStorage[STORAGE_KEY_COMPRESSED]).toBeDefined();

			// Load and verify integrity
			const result = await _getStorageAsync();
			expect(result).toBeDefined();
			expect(result?.rules.length).toBe(200);
		});

		it('should compress data effectively', async () => {
			const mockData = createMockData(50);
			const originalSize = JSON.stringify(mockData).length;

			await _setStorage(mockData);

			const compressedSize = mockLocalStorage[STORAGE_KEY_COMPRESSED].length;

			// Verify compression is effective (should be < 50% of original)
			expect(compressedSize).toBeLessThan(originalSize * 0.5);
			console.log(
				`Compression: ${originalSize} → ${compressedSize} bytes (${((1 - compressedSize / originalSize) * 100).toFixed(1)}% reduction)`
			);
		});
	});

	describe('Clear Storage', () => {
		it('should clear all data from local and sync storage', async () => {
			// Setup data in both storages
			mockLocalStorage[STORAGE_KEY_COMPRESSED] = 'compressed_data';
			mockLocalStorage[STORAGE_KEY] = { rules: [] };
			mockSyncStorage[STORAGE_KEY] = { rules: [] };
			mockSyncStorage[STORAGE_KEY_COMPRESSED] = 'old_compressed';

			await _clearStorage();

			// Verify all keys are removed
			expect(mockLocalStorage[STORAGE_KEY_COMPRESSED]).toBeUndefined();
			expect(mockLocalStorage[STORAGE_KEY]).toBeUndefined();
			expect(mockSyncStorage[STORAGE_KEY]).toBeUndefined();
			expect(mockSyncStorage[STORAGE_KEY_COMPRESSED]).toBeUndefined();
		});

		it('should clear chunked data', async () => {
			// Setup chunked data
			mockSyncStorage[STORAGE_KEY_CHUNK_PREFIX + '0'] = 'chunk0';
			mockSyncStorage[STORAGE_KEY_CHUNK_PREFIX + '1'] = 'chunk1';
			mockSyncStorage[STORAGE_KEY_METADATA] = '{"chunkCount": 2}';

			await _clearStorage();

			// Verify chunks are removed
			expect(mockSyncStorage[STORAGE_KEY_CHUNK_PREFIX + '0']).toBeUndefined();
			expect(mockSyncStorage[STORAGE_KEY_CHUNK_PREFIX + '1']).toBeUndefined();
			expect(mockSyncStorage[STORAGE_KEY_METADATA]).toBeUndefined();
		});
	});

	describe('Edge Cases', () => {
		it('should return undefined for empty storage', async () => {
			const result = await _getStorageAsync();
			expect(result).toBeUndefined();
		});

		it('should handle corrupted compressed data gracefully', async () => {
			// Setup corrupted compressed data
			mockLocalStorage[STORAGE_KEY_COMPRESSED] = 'invalid_compressed_data!!!';

			const result = await _getStorageAsync();

			// Should return undefined instead of crashing
			expect(result).toBeUndefined();
		});

		it('should handle missing chunks in chunked data', async () => {
			// Setup incomplete chunked data
			mockSyncStorage[STORAGE_KEY_CHUNK_PREFIX + '0'] = 'chunk0';
			// Missing chunk 1
			mockSyncStorage[STORAGE_KEY_METADATA] = {
				version: 2,
				chunkCount: 2,
				originalSize: 1000,
				compressedSize: 500,
			};

			const result = await _getStorageAsync();

			// Should handle gracefully (returns undefined)
			expect(result).toBeUndefined();
		});

		it('should preserve data integrity after multiple save/load cycles', async () => {
			const mockData = createMockData(30);

			// Save
			await _setStorage(mockData);

			// Load
			const loaded1 = await _getStorageAsync();
			expect(loaded1?.rules.length).toBe(30);

			// Modify and save again
			loaded1!.rules.push({
				id: 'new_rule',
				is_enabled: true,
				name: 'New Rule',
				detection: 'CONTAINS',
				url_fragment: 'new.com',
				tab: {
					title: 'New',
					icon: null,
					pinned: false,
					protected: false,
					unique: false,
					muted: false,
					title_matcher: null,
					url_matcher: null,
					group_id: null,
				},
			});

			await _setStorage(loaded1!);

			// Load again
			const loaded2 = await _getStorageAsync();
			expect(loaded2?.rules.length).toBe(31);
			expect(loaded2?.rules[30].name).toBe('New Rule');
		});
	});

	describe('Import Scenarios', () => {
		it('should handle import of small file (<10KB)', async () => {
			const importData = createMockData(10);

			await _setStorage(importData);

			const result = await _getStorageAsync();
			expect(result?.rules.length).toBe(10);
		});

		it('should handle import of medium file (50KB)', async () => {
			const importData = createMockData(80);
			const size = JSON.stringify(importData).length;
			console.log(`Medium file size: ${size} bytes`);

			await _setStorage(importData);

			const result = await _getStorageAsync();
			expect(result?.rules.length).toBe(80);
		});

		it('should handle import of large file (80KB+)', async () => {
			const importData = createMockData(150);
			const size = JSON.stringify(importData).length;
			console.log(`Large file size: ${size} bytes`);

			await _setStorage(importData);

			const result = await _getStorageAsync();
			expect(result?.rules.length).toBe(150);
		});
	});
});
