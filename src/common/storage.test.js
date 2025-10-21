import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	_clearStorage,
	_getDefaultGroup,
	_getDefaultRule,
	_getDefaultTabModifierSettings,
	_getRuleFromUrl,
	_getStorageAsync,
	_setStorage,
	_migrateToCompressed,
	STORAGE_KEY,
	STORAGE_KEY_COMPRESSED,
} from './storage';
import { chrome } from '../__mocks__/chrome';
import { compressToUTF16, decompressFromUTF16 } from 'lz-string';

global.chrome = chrome;

beforeEach(() => {
	vi.clearAllMocks();
	global.chrome = chrome;
	global.chrome.runtime.lastError = null;
});

describe('Storage', () => {
	it('_getDefaultTabModifierSettings should return default settings', () => {
		const settings = _getDefaultTabModifierSettings();
		expect(settings).toEqual({
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
				auto_close_timeout: 30,
			},
		});
	});

	it('_getDefaultRule should return a rule with given parameters', () => {
		const rule = _getDefaultRule('testName', 'testTitle', 'testFragment');
		expect(rule.name).toBe('testName');
		expect(rule.tab.title).toBe('testTitle');
		expect(rule.url_fragment).toBe('testFragment');
		expect(rule.id).toBeTruthy();
	});

	it('_getDefaultGroup should return a group with given title', () => {
		const group = _getDefaultGroup('testTitle');
		expect(group.title).toBe('testTitle');
		expect(group.color).toBe('grey');
		expect(group.id).toBeTruthy();
	});

	it('_getStorageAsync should get storage data', async () => {
		const mockData = {
			rules: [],
			groups: [],
			settings: { enable_new_version_notification: false, theme: 'dim', lightweight_mode_enabled: false, lightweight_mode_patterns: [], auto_close_enabled: false, auto_close_timeout: 30 },
		};
		global.chrome.storage.sync.get.mockImplementation((keys, callback) => {
			callback({ [STORAGE_KEY]: mockData });
		});
		const storageData = await _getStorageAsync();
		expect(storageData).toEqual(mockData);
	});

	it('_clearStorage should remove storage data', async () => {
		await _clearStorage();

		expect(global.chrome.storage.sync.remove).toHaveBeenCalledWith([
			STORAGE_KEY,
			STORAGE_KEY_COMPRESSED,
		]);
	});

	it('_setStorage should set compressed storage data', async () => {
		const mockData = {
			rules: [],
			groups: [],
			settings: {
				enable_new_version_notification: false,
				theme: 'dim',
				lightweight_mode_enabled: false,
				lightweight_mode_patterns: [],
				auto_close_enabled: false,
				auto_close_timeout: 30,
			},
		};

		// Mock console.log to suppress compression stats output during tests
		const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

		await _setStorage(mockData);

		// Should have called set with compressed data
		expect(global.chrome.storage.sync.set).toHaveBeenCalled();

		// Verify the data was compressed
		const setCallArgs = global.chrome.storage.sync.set.mock.calls[0][0];
		expect(setCallArgs).toHaveProperty(STORAGE_KEY_COMPRESSED);
		expect(typeof setCallArgs[STORAGE_KEY_COMPRESSED]).toBe('string');

		// Verify we can decompress it back to original data
		const decompressed = JSON.parse(decompressFromUTF16(setCallArgs[STORAGE_KEY_COMPRESSED]));
		expect(decompressed).toEqual(mockData);

		// Should also try to remove old uncompressed key
		expect(global.chrome.storage.sync.remove).toHaveBeenCalledWith(STORAGE_KEY);

		consoleLogSpy.mockRestore();
	});

	it('_getRuleFromUrl should return rule based on url detection', async () => {
		const mockRule = {
			id: '1',
			name: 'test',
			detection: 'CONTAINS',
			url_fragment: 'example.com',
			tab: {
				title: 'Example',
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
		const mockData = {
			rules: [mockRule],
			groups: [],
			settings: { enable_new_version_notification: false, theme: 'dim', lightweight_mode_enabled: false, lightweight_mode_patterns: [], auto_close_enabled: false, auto_close_timeout: 30 },
		};
		global.chrome.storage.sync.get.mockImplementation((keys, callback) => {
			callback({ tab_modifier: mockData });
		});
		global.chrome.runtime.lastError = null;

		const rule = await _getRuleFromUrl('https://example.com');
		expect(rule).toEqual(mockRule);
	});

	describe('_getRuleFromUrl detection types', () => {
		it('should detect url based on CONTAINS', async () => {
			const mockRule = {
				id: '1',
				name: 'test',
				detection: 'CONTAINS',
				url_fragment: 'example.com',
				tab: {
					title: 'Example',
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
			const mockData = {
				rules: [mockRule],
				groups: [],
				settings: { enable_new_version_notification: false, theme: 'dim', lightweight_mode_enabled: false, lightweight_mode_patterns: [], auto_close_enabled: false, auto_close_timeout: 30 },
			};
			global.chrome.storage.sync.get.mockImplementation((keys, callback) => {
				callback({ [STORAGE_KEY]: mockData });
			});
			global.chrome.runtime.lastError = null;

			const rule = await _getRuleFromUrl('https://example.com/path');
			expect(rule).toEqual(mockRule);
		});

		it('should detect url based on STARTS_WITH', async () => {
			const mockRule = {
				id: '1',
				name: 'test',
				detection: 'STARTS_WITH',
				url_fragment: 'https://example.com',
				tab: {
					title: 'Example',
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
			const mockData = {
				rules: [mockRule],
				groups: [],
				settings: { enable_new_version_notification: false, theme: 'dim', lightweight_mode_enabled: false, lightweight_mode_patterns: [], auto_close_enabled: false, auto_close_timeout: 30 },
			};
			global.chrome.storage.sync.get.mockImplementation((keys, callback) => {
				callback({ [STORAGE_KEY]: mockData });
			});
			global.chrome.runtime.lastError = null;

			const rule = await _getRuleFromUrl('https://example.com/path');
			expect(rule).toEqual(mockRule);
		});

		it('should detect url based on ENDS_WITH', async () => {
			const mockRule = {
				id: '1',
				name: 'test',
				detection: 'ENDS_WITH',
				url_fragment: '/path',
				tab: {
					title: 'Example',
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
			const mockData = {
				rules: [mockRule],
				groups: [],
				settings: { enable_new_version_notification: false, theme: 'dim', lightweight_mode_enabled: false, lightweight_mode_patterns: [], auto_close_enabled: false, auto_close_timeout: 30 },
			};
			global.chrome.storage.sync.get.mockImplementation((keys, callback) => {
				callback({ [STORAGE_KEY]: mockData });
			});
			global.chrome.runtime.lastError = null;

			const rule = await _getRuleFromUrl('https://example.com/path');
			expect(rule).toEqual(mockRule);
		});

		it('should detect url based on REGEX', async () => {
			const mockRule = {
				id: '1',
				name: 'test',
				detection: 'REGEX',
				url_fragment: 'example\\.com\\/path',
				tab: {
					title: 'Example',
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
			const mockData = {
				rules: [mockRule],
				groups: [],
				settings: { enable_new_version_notification: false, theme: 'dim', lightweight_mode_enabled: false, lightweight_mode_patterns: [], auto_close_enabled: false, auto_close_timeout: 30 },
			};
			global.chrome.storage.sync.get.mockImplementation((keys, callback) => {
				callback({ [STORAGE_KEY]: mockData });
			});
			global.chrome.runtime.lastError = null;

			const rule = await _getRuleFromUrl('https://example.com/path');
			expect(rule).toEqual(mockRule);
		});

		it('should detect jira url based on REGEX', async () => {
			const mockRule = {
				id: '1',
				name: 'test',
				detection: 'REGEX',
				// Updated pattern: removed dangerous .*? prefix which could cause ReDoS
				// The pattern now matches the domain and path structure safely
				url_fragment:
					'furybee\\.atlassian\\.net\\/jira\\/software\\/c\\/projects\\/([a-zA-Z]{1,5})\\/boards\\/([0-9]{1,4})(\\?.*)?$',
				tab: {
					title: 'FuryBee Jira',
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
			const mockData = {
				rules: [mockRule],
				groups: [],
				settings: { enable_new_version_notification: false, theme: 'dim', lightweight_mode_enabled: false, lightweight_mode_patterns: [], auto_close_enabled: false, auto_close_timeout: 30 },
			};
			global.chrome.storage.sync.get.mockImplementation((keys, callback) => {
				callback({ [STORAGE_KEY]: mockData });
			});
			global.chrome.runtime.lastError = null;

			const rule = await _getRuleFromUrl(
				'https://furybee.atlassian.net/jira/software/c/projects/FB/boards/74?quickFilter=313'
			);
			expect(rule).toEqual(mockRule);
		});

		it('should detect biblegateway url based on REGEX', async () => {
			const mockRule = {
				id: '1',
				name: 'test',
				detection: 'REGEX',
				url_fragment:
					'https:\\/\\/www\\.biblegateway\\.com\\/passage\\/\\?search=.*version=(?!MOUNCE)(?!.*;).*',
				tab: {
					title: 'Bible Gateway',
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
			const mockData = {
				rules: [mockRule],
				groups: [],
				settings: { enable_new_version_notification: false, theme: 'dim', lightweight_mode_enabled: false, lightweight_mode_patterns: [], auto_close_enabled: false, auto_close_timeout: 30 },
			};
			global.chrome.storage.sync.get.mockImplementation((keys, callback) => {
				callback({ [STORAGE_KEY]: mockData });
			});
			global.chrome.runtime.lastError = null;

			const rule = await _getRuleFromUrl(
				'https://www.biblegateway.com/passage/?search=John+3&version=NASB'
			);
			expect(rule).toEqual(mockRule);
		});

		it('should detect url based on EXACT', async () => {
			const mockRule = {
				id: '1',
				name: 'test',
				detection: 'EXACT',
				url_fragment: 'https://example.com/path',
				tab: {
					title: 'Example',
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
			const mockData = {
				rules: [mockRule],
				groups: [],
				settings: { enable_new_version_notification: false, theme: 'dim', lightweight_mode_enabled: false, lightweight_mode_patterns: [], auto_close_enabled: false, auto_close_timeout: 30 },
			};
			global.chrome.storage.sync.get.mockImplementation((keys, callback) => {
				callback({ [STORAGE_KEY]: mockData });
			});
			global.chrome.runtime.lastError = null;

			const rule = await _getRuleFromUrl('https://example.com/path');
			expect(rule).toEqual(mockRule);
		});

		it('should block dangerous ReDoS regex patterns', async () => {
			const mockRule = {
				id: '1',
				name: 'dangerous',
				detection: 'REGEX',
				// This pattern has nested quantifiers and would cause ReDoS
				url_fragment: '(a+)+b',
				tab: {
					title: 'Dangerous',
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
			const mockData = {
				rules: [mockRule],
				groups: [],
				settings: { enable_new_version_notification: false, theme: 'dim', lightweight_mode_enabled: false, lightweight_mode_patterns: [], auto_close_enabled: false, auto_close_timeout: 30 },
			};
			global.chrome.storage.sync.get.mockImplementation((keys, callback) => {
				callback({ [STORAGE_KEY]: mockData });
			});
			global.chrome.runtime.lastError = null;

			// Should return undefined because the dangerous pattern is blocked
			const rule = await _getRuleFromUrl('https://aaaaaaaaaaaaaaaaaaa.com');
			expect(rule).toBeUndefined();
		});
	});

	describe('Compression features', () => {
		it('_getStorageAsync should read compressed data', async () => {
			const mockData = {
				rules: [
					{
						id: '1',
						name: 'test',
						detection: 'CONTAINS',
						url_fragment: 'example.com',
						tab: {
							title: 'Example',
							icon: null,
							pinned: false,
							protected: false,
							unique: false,
							muted: false,
							title_matcher: null,
							url_matcher: null,
							group_id: null,
						},
					},
				],
				groups: [],
				settings: {
					enable_new_version_notification: false,
					theme: 'dim',
					lightweight_mode_enabled: false,
					lightweight_mode_patterns: [],
					auto_close_enabled: false,
					auto_close_timeout: 30,
				},
			};

			// Compress the data
			const compressed = compressToUTF16(JSON.stringify(mockData));

			global.chrome.storage.sync.get.mockImplementation((keys, callback) => {
				callback({ [STORAGE_KEY_COMPRESSED]: compressed });
			});

			const storageData = await _getStorageAsync();
			expect(storageData).toEqual(mockData);
		});

		it('_getStorageAsync should fallback to uncompressed data if compressed is not available', async () => {
			const mockData = {
				rules: [],
				groups: [],
				settings: {
					enable_new_version_notification: false,
					theme: 'dim',
					lightweight_mode_enabled: false,
					lightweight_mode_patterns: [],
					auto_close_enabled: false,
					auto_close_timeout: 30,
				},
			};

			global.chrome.storage.sync.get.mockImplementation((keys, callback) => {
				callback({ [STORAGE_KEY]: mockData });
			});

			const storageData = await _getStorageAsync();
			expect(storageData).toEqual(mockData);
		});

		it('_migrateToCompressed should migrate uncompressed data to compressed format', async () => {
			const mockData = {
				rules: [
					{
						id: '1',
						name: 'test',
						detection: 'CONTAINS',
						url_fragment: 'example.com',
						tab: {
							title: 'Example',
							icon: null,
							pinned: false,
							protected: false,
							unique: false,
							muted: false,
							title_matcher: null,
							url_matcher: null,
							group_id: null,
						},
					},
				],
				groups: [],
				settings: {
					enable_new_version_notification: false,
					theme: 'dim',
					lightweight_mode_enabled: false,
					lightweight_mode_patterns: [],
					auto_close_enabled: false,
					auto_close_timeout: 30,
				},
			};

			// Mock console.log to suppress output during tests
			const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

			// Mock that we have uncompressed data
			global.chrome.storage.sync.get.mockImplementation((keys, callback) => {
				callback({ [STORAGE_KEY]: mockData });
			});

			await _migrateToCompressed();

			// Should have called set to save compressed version
			expect(global.chrome.storage.sync.set).toHaveBeenCalled();
			const setCallArgs = global.chrome.storage.sync.set.mock.calls[0][0];
			expect(setCallArgs).toHaveProperty(STORAGE_KEY_COMPRESSED);

			consoleLogSpy.mockRestore();
		});

		it('_migrateToCompressed should do nothing if already compressed', async () => {
			const mockData = {
				rules: [],
				groups: [],
				settings: {
					enable_new_version_notification: false,
					theme: 'dim',
					lightweight_mode_enabled: false,
					lightweight_mode_patterns: [],
					auto_close_enabled: false,
					auto_close_timeout: 30,
				},
			};

			const compressed = compressToUTF16(JSON.stringify(mockData));

			// Mock that we already have compressed data
			global.chrome.storage.sync.get.mockImplementation((keys, callback) => {
				callback({ [STORAGE_KEY_COMPRESSED]: compressed });
			});

			await _migrateToCompressed();

			// Should not have called set since data is already compressed
			expect(global.chrome.storage.sync.set).not.toHaveBeenCalled();
		});

		it('compression should significantly reduce data size', async () => {
			// Create a realistic dataset with multiple rules
			const mockData = {
				rules: Array.from({ length: 20 }, (_, i) => ({
					id: `rule-${i}`,
					name: `Test Rule ${i}`,
					detection: 'CONTAINS',
					url_fragment: `example-${i}.com`,
					is_enabled: true,
					tab: {
						title: `Example Title ${i}`,
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
					theme: 'dim',
					lightweight_mode_enabled: false,
					lightweight_mode_patterns: [],
					auto_close_enabled: false,
					auto_close_timeout: 30,
				},
			};

			const jsonString = JSON.stringify(mockData);
			const compressed = compressToUTF16(jsonString);

			const originalSize = jsonString.length;
			const compressedSize = compressed.length;
			const compressionRatio = compressedSize / originalSize;

			// Verify that compression actually reduces size
			expect(compressedSize).toBeLessThan(originalSize);
			// Expect at least 30% compression for this kind of JSON data
			expect(compressionRatio).toBeLessThan(0.7);
		});
	});
});
