import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageService } from '../StorageService';
import { RegexService } from '../RegexService';
import type { Rule } from '../../common/types';

// Mock chrome APIs
const mockChrome = {
	storage: {
		sync: {
			get: vi.fn(),
		},
	},
	runtime: {
		lastError: null,
	},
};

// @ts-ignore
global.chrome = mockChrome;

describe('StorageService', () => {
	let service: StorageService;
	let regexService: RegexService;

	beforeEach(() => {
		regexService = new RegexService();
		service = new StorageService(regexService);
		vi.clearAllMocks();
		mockChrome.runtime.lastError = null;
	});

	describe('getStorageAsync', () => {
		it('should resolve with storage data', async () => {
			const mockData = { rules: [], groups: [], settings: {} };
			mockChrome.storage.sync.get.mockImplementation((_key, callback) => {
				callback({ tab_modifier: mockData });
			});

			const result = await service.getStorageAsync();

			expect(result).toEqual(mockData);
			expect(mockChrome.storage.sync.get).toHaveBeenCalledWith(
				'tab_modifier',
				expect.any(Function)
			);
		});

		it('should reject on chrome runtime error', async () => {
			mockChrome.runtime.lastError = { message: 'Storage error' };
			mockChrome.storage.sync.get.mockImplementation((_key, callback) => {
				callback({});
			});

			await expect(service.getStorageAsync()).rejects.toThrow('Storage error');
		});
	});

	describe('getRuleFromUrl', () => {
		it('should return undefined if no storage data', async () => {
			mockChrome.storage.sync.get.mockImplementation((_key, callback) => {
				callback({});
			});

			const result = await service.getRuleFromUrl('https://example.com');

			expect(result).toBeUndefined();
		});

		it('should find rule with CONTAINS detection', async () => {
			const mockRule: Rule = {
				id: 'test',
				name: 'Test',
				detection: 'CONTAINS',
				url_fragment: 'example.com',
				tab: {
					title: 'Test',
					icon: null,
					muted: false,
					pinned: false,
					protected: false,
					unique: false,
					title_matcher: null,
					url_matcher: null,
				},
				is_enabled: true,
			};

			mockChrome.storage.sync.get.mockImplementation((_key, callback) => {
				callback({ tab_modifier: { rules: [mockRule] } });
			});

			const result = await service.getRuleFromUrl('https://example.com/page');

			expect(result).toEqual(mockRule);
		});

		it('should find rule with STARTS_WITH detection', async () => {
			const mockRule: Rule = {
				id: 'test',
				name: 'Test',
				detection: 'STARTS_WITH',
				url_fragment: 'https://example',
				tab: {
					title: 'Test',
					icon: null,
					muted: false,
					pinned: false,
					protected: false,
					unique: false,
					title_matcher: null,
					url_matcher: null,
				},
				is_enabled: true,
			};

			mockChrome.storage.sync.get.mockImplementation((_key, callback) => {
				callback({ tab_modifier: { rules: [mockRule] } });
			});

			const result = await service.getRuleFromUrl('https://example.com/page');

			expect(result).toEqual(mockRule);
		});

		it('should find rule with ENDS_WITH detection', async () => {
			const mockRule: Rule = {
				id: 'test',
				name: 'Test',
				detection: 'ENDS_WITH',
				url_fragment: '/page',
				tab: {
					title: 'Test',
					icon: null,
					muted: false,
					pinned: false,
					protected: false,
					unique: false,
					title_matcher: null,
					url_matcher: null,
				},
				is_enabled: true,
			};

			mockChrome.storage.sync.get.mockImplementation((_key, callback) => {
				callback({ tab_modifier: { rules: [mockRule] } });
			});

			const result = await service.getRuleFromUrl('https://example.com/page');

			expect(result).toEqual(mockRule);
		});

		it('should find rule with EXACT detection', async () => {
			const mockRule: Rule = {
				id: 'test',
				name: 'Test',
				detection: 'EXACT',
				url_fragment: 'https://example.com/page',
				tab: {
					title: 'Test',
					icon: null,
					muted: false,
					pinned: false,
					protected: false,
					unique: false,
					title_matcher: null,
					url_matcher: null,
				},
				is_enabled: true,
			};

			mockChrome.storage.sync.get.mockImplementation((_key, callback) => {
				callback({ tab_modifier: { rules: [mockRule] } });
			});

			const result = await service.getRuleFromUrl('https://example.com/page');

			expect(result).toEqual(mockRule);
		});

		it('should find rule with REGEX detection', async () => {
			const mockRule: Rule = {
				id: 'test',
				name: 'Test',
				detection: 'REGEX',
				url_fragment: 'https://.*\\.com',
				tab: {
					title: 'Test',
					icon: null,
					muted: false,
					pinned: false,
					protected: false,
					unique: false,
					title_matcher: null,
					url_matcher: null,
				},
				is_enabled: true,
			};

			mockChrome.storage.sync.get.mockImplementation((_key, callback) => {
				callback({ tab_modifier: { rules: [mockRule] } });
			});

			const result = await service.getRuleFromUrl('https://example.com/page');

			expect(result).toEqual(mockRule);
		});

		it('should handle regex errors gracefully', async () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			const mockRule: Rule = {
				id: 'test',
				name: 'Test',
				detection: 'REGEX',
				url_fragment: '(?=.*)+', // Unsafe pattern
				tab: {
					title: 'Test',
					icon: null,
					muted: false,
					pinned: false,
					protected: false,
					unique: false,
					title_matcher: null,
					url_matcher: null,
				},
				is_enabled: true,
			};

			mockChrome.storage.sync.get.mockImplementation((_key, callback) => {
				callback({ tab_modifier: { rules: [mockRule] } });
			});

			const result = await service.getRuleFromUrl('https://example.com/page');

			expect(consoleSpy).toHaveBeenCalled();
			expect(result).toBeUndefined();

			consoleSpy.mockRestore();
		});

		it('should return undefined if no rule matches', async () => {
			const mockRule: Rule = {
				id: 'test',
				name: 'Test',
				detection: 'CONTAINS',
				url_fragment: 'github.com',
				tab: {
					title: 'Test',
					icon: null,
					muted: false,
					pinned: false,
					protected: false,
					unique: false,
					title_matcher: null,
					url_matcher: null,
				},
				is_enabled: true,
			};

			mockChrome.storage.sync.get.mockImplementation((_key, callback) => {
				callback({ tab_modifier: { rules: [mockRule] } });
			});

			const result = await service.getRuleFromUrl('https://example.com/page');

			expect(result).toBeUndefined();
		});

		it('should use CONTAINS as default detection type', async () => {
			const mockRule: any = {
				id: 'test',
				name: 'Test',
				// No detection specified
				url_fragment: 'example.com',
				tab: {
					title: 'Test',
					icon: null,
					muted: false,
					pinned: false,
					protected: false,
					unique: false,
					title_matcher: null,
					url_matcher: null,
				},
				is_enabled: true,
			};

			mockChrome.storage.sync.get.mockImplementation((_key, callback) => {
				callback({ tab_modifier: { rules: [mockRule] } });
			});

			const result = await service.getRuleFromUrl('https://example.com/page');

			expect(result).toEqual(mockRule);
		});

		it('should support legacy STARTS detection type', async () => {
			const mockRule: Rule = {
				id: 'test',
				name: 'Test',
				detection: 'STARTS',
				url_fragment: 'https://example',
				tab: {
					title: 'Test',
					icon: null,
					muted: false,
					pinned: false,
					protected: false,
					unique: false,
					title_matcher: null,
					url_matcher: null,
				},
				is_enabled: true,
			};

			mockChrome.storage.sync.get.mockImplementation((_key, callback) => {
				callback({ tab_modifier: { rules: [mockRule] } });
			});

			const result = await service.getRuleFromUrl('https://example.com');

			expect(result).toEqual(mockRule);
		});

		it('should support legacy ENDS detection type', async () => {
			const mockRule: Rule = {
				id: 'test',
				name: 'Test',
				detection: 'ENDS',
				url_fragment: '.com',
				tab: {
					title: 'Test',
					icon: null,
					muted: false,
					pinned: false,
					protected: false,
					unique: false,
					title_matcher: null,
					url_matcher: null,
				},
				is_enabled: true,
			};

			mockChrome.storage.sync.get.mockImplementation((_key, callback) => {
				callback({ tab_modifier: { rules: [mockRule] } });
			});

			const result = await service.getRuleFromUrl('https://example.com');

			expect(result).toEqual(mockRule);
		});

		it('should support legacy REGEXP detection type', async () => {
			const mockRule: Rule = {
				id: 'test',
				name: 'Test',
				detection: 'REGEXP',
				url_fragment: 'https://.*\\.com',
				tab: {
					title: 'Test',
					icon: null,
					muted: false,
					pinned: false,
					protected: false,
					unique: false,
					title_matcher: null,
					url_matcher: null,
				},
				is_enabled: true,
			};

			mockChrome.storage.sync.get.mockImplementation((_key, callback) => {
				callback({ tab_modifier: { rules: [mockRule] } });
			});

			const result = await service.getRuleFromUrl('https://example.com');

			expect(result).toEqual(mockRule);
		});
	});
});
