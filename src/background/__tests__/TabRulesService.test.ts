import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TabRulesService } from '../TabRulesService';

// Mock chrome APIs
const mockChrome = {
	tabs: {
		query: vi.fn(),
		sendMessage: vi.fn(),
		remove: vi.fn(),
		update: vi.fn(),
		reload: vi.fn(),
	},
	scripting: {
		executeScript: vi.fn(),
	},
	runtime: {
		lastError: undefined,
	},
};

// @ts-ignore
global.chrome = mockChrome;

// Mock storage module
vi.mock('../../common/storage', () => ({
	_getRuleFromUrl: vi.fn(),
	_getStorageAsync: vi.fn(() =>
		Promise.resolve({
			rules: [],
			groups: [],
			settings: {
				enable_new_version_notification: true,
				theme: 'light',
				lightweight_mode_enabled: false,
				lightweight_mode_patterns: [],
				auto_close_enabled: false,
				auto_close_timeout: 60,
			},
		})
	),
	_setStorage: vi.fn(),
	_shouldSkipUrl: vi.fn(),
	_getDefaultRule: vi.fn(),
	_getDefaultTabModifierSettings: vi.fn(),
}));

// Mock helpers module
vi.mock('../../common/helpers', () => ({
	_processUrlFragment: vi.fn((_fragment, url) => url),
}));

import { _getRuleFromUrl, _shouldSkipUrl, _getDefaultRule, _setStorage } from '../../common/storage';

describe('TabRulesService', () => {
	let service: TabRulesService;

	beforeEach(() => {
		service = new TabRulesService();
		vi.clearAllMocks();
	});

	describe('applyRuleToTab', () => {
		it('should return false if tab has no ID', async () => {
			const tab = { url: 'https://example.com' } as chrome.tabs.Tab;

			const result = await service.applyRuleToTab(tab);

			expect(result).toBe(false);
			expect(mockChrome.tabs.sendMessage).not.toHaveBeenCalled();
		});

		it('should return false if tab has no URL', async () => {
			const tab = { id: 1 } as chrome.tabs.Tab;

			const result = await service.applyRuleToTab(tab);

			expect(result).toBe(false);
			expect(mockChrome.tabs.sendMessage).not.toHaveBeenCalled();
		});

		it('should send message to tab if rule exists', async () => {
			const mockRule = {
				id: 'rule1',
				name: 'Test Rule',
				detection: 'CONTAINS',
				url_fragment: 'example.com',
				tab: {
					title: 'Example',
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

			vi.mocked(_getRuleFromUrl).mockResolvedValue(mockRule);
			mockChrome.tabs.sendMessage.mockResolvedValue(undefined);

			const tab = { id: 1, url: 'https://example.com' } as chrome.tabs.Tab;
			const result = await service.applyRuleToTab(tab);

			expect(result).toBe(true);
			expect(mockChrome.tabs.sendMessage).toHaveBeenCalledWith(1, {
				action: 'applyRule',
				rule: mockRule,
			});
		});

		it('should return false if no rule matches', async () => {
			vi.mocked(_getRuleFromUrl).mockResolvedValue(undefined);

			const tab = { id: 1, url: 'https://example.com' } as chrome.tabs.Tab;
			const result = await service.applyRuleToTab(tab);

			expect(result).toBe(false);
			expect(mockChrome.tabs.sendMessage).not.toHaveBeenCalled();
		});
	});

	describe('handleSetUnique', () => {
		it('should not process if current tab has no ID or URL', async () => {
			const message = { url_fragment: 'example.com' };
			const tab = {} as chrome.tabs.Tab;

			await service.handleSetUnique(message, tab);

			expect(mockChrome.tabs.query).not.toHaveBeenCalled();
		});

		it('should close duplicate tab and keep current tab', async () => {
			const currentTab = {
				id: 1,
				url: 'https://example.com/page',
			} as chrome.tabs.Tab;

			const duplicateTab = {
				id: 2,
				url: 'https://example.com/page',
			} as chrome.tabs.Tab;

			const otherTab = {
				id: 3,
				url: 'https://different.com',
			} as chrome.tabs.Tab;

			const message = {
				url_fragment: 'example.com',
				rule: {
					tab: { url_matcher: null },
				},
			};

			// Mock chrome.tabs.query to call the callback
			mockChrome.tabs.query.mockImplementation((_queryInfo: any, callback: any) => {
				callback([currentTab, duplicateTab, otherTab]);
			});
			mockChrome.scripting.executeScript.mockResolvedValue([]);
			mockChrome.tabs.remove.mockResolvedValue(undefined);

			await service.handleSetUnique(message, currentTab);

			// Should execute script on duplicate tab to remove beforeunload
			expect(mockChrome.scripting.executeScript).toHaveBeenCalledWith({
				target: { tabId: 2 },
				func: expect.any(Function),
			});

			// Should close the duplicate tab (not the current tab)
			expect(mockChrome.tabs.remove).toHaveBeenCalledWith(2);
			expect(mockChrome.tabs.remove).not.toHaveBeenCalledWith(1);

			// Should not update any tabs
			expect(mockChrome.tabs.update).not.toHaveBeenCalled();
		});

		it('should handle multiple duplicate tabs by closing only the first one', async () => {
			const currentTab = {
				id: 1,
				url: 'https://example.com/page',
			} as chrome.tabs.Tab;

			const duplicate1 = {
				id: 2,
				url: 'https://example.com/page',
			} as chrome.tabs.Tab;

			const duplicate2 = {
				id: 3,
				url: 'https://example.com/page',
			} as chrome.tabs.Tab;

			const message = {
				url_fragment: 'example.com',
				rule: {
					tab: { url_matcher: null },
				},
			};

			mockChrome.tabs.query.mockImplementation((_queryInfo: any, callback: any) => {
				callback([currentTab, duplicate1, duplicate2]);
			});
			mockChrome.scripting.executeScript.mockResolvedValue([]);
			mockChrome.tabs.remove.mockResolvedValue(undefined);

			await service.handleSetUnique(message, currentTab);

			// Should only close the first duplicate found
			expect(mockChrome.tabs.remove).toHaveBeenCalledTimes(1);
			expect(mockChrome.tabs.remove).toHaveBeenCalledWith(2);
		});

		it('should not close any tabs if no duplicates exist', async () => {
			const currentTab = {
				id: 1,
				url: 'https://example.com/page',
			} as chrome.tabs.Tab;

			const otherTab = {
				id: 2,
				url: 'https://different.com',
			} as chrome.tabs.Tab;

			const rule = {
				id: 'rule1',
				tab: { url_matcher: null },
			};

			const message = {
				url_fragment: 'example.com',
				rule: rule,
			};

			mockChrome.tabs.query.mockImplementation((_queryInfo: any, callback: any) => {
				callback([currentTab, otherTab]);
			});

			// Mock _getRuleFromUrl to return rule only for currentTab, not for otherTab
			vi.mocked(_getRuleFromUrl).mockImplementation(async (url: string) => {
				if (url === currentTab.url) {
					return rule as any;
				}
				return undefined;
			});

			await service.handleSetUnique(message, currentTab);

			// Should not close any tabs
			expect(mockChrome.tabs.remove).not.toHaveBeenCalled();
			expect(mockChrome.scripting.executeScript).not.toHaveBeenCalled();
		});

		it('should handle errors when removing beforeunload handler', async () => {
			const currentTab = {
				id: 1,
				url: 'https://example.com/page',
			} as chrome.tabs.Tab;

			const duplicateTab = {
				id: 2,
				url: 'https://example.com/page',
			} as chrome.tabs.Tab;

			const rule = {
				id: 'rule1',
				tab: { url_matcher: null },
			};

			const message = {
				url_fragment: 'example.com',
				rule: rule,
			};

			mockChrome.tabs.query.mockImplementation((_queryInfo: any, callback: any) => {
				callback([currentTab, duplicateTab]);
			});

			// Mock _getRuleFromUrl to return the rule for both tabs
			vi.mocked(_getRuleFromUrl).mockResolvedValue(rule as any);

			mockChrome.scripting.executeScript.mockRejectedValue(new Error('Cannot execute script'));
			mockChrome.tabs.remove.mockResolvedValue(undefined);

			// Mock console.log to avoid test output pollution
			const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

			await service.handleSetUnique(message, currentTab);

			// Should still close the tab even if script execution fails
			expect(mockChrome.tabs.remove).toHaveBeenCalledWith(2);
			expect(consoleLogSpy).toHaveBeenCalled();

			consoleLogSpy.mockRestore();
		});

		it('should skip tabs without URL or ID', async () => {
			const currentTab = {
				id: 1,
				url: 'https://example.com/page',
			} as chrome.tabs.Tab;

			const tabWithoutUrl = {
				id: 2,
			} as chrome.tabs.Tab;

			const tabWithoutId = {
				url: 'https://example.com/page',
			} as chrome.tabs.Tab;

			const message = {
				url_fragment: 'example.com',
				rule: {
					tab: { url_matcher: null },
				},
			};

			mockChrome.tabs.query.mockImplementation((_queryInfo: any, callback: any) => {
				callback([currentTab, tabWithoutUrl, tabWithoutId]);
			});

			await service.handleSetUnique(message, currentTab);

			// Should not close any tabs since duplicates don't have ID or URL
			expect(mockChrome.tabs.remove).not.toHaveBeenCalled();
		});
	});

	describe('handleRenameTab', () => {
		it('should not process if tab has no ID', async () => {
			const tab = { url: 'https://example.com' } as chrome.tabs.Tab;

			await service.handleRenameTab(tab, 'New Title');

			expect(_setStorage).not.toHaveBeenCalled();
		});

		it('should not process if tab has no URL', async () => {
			const tab = { id: 1 } as chrome.tabs.Tab;

			await service.handleRenameTab(tab, 'New Title');

			expect(_setStorage).not.toHaveBeenCalled();
		});

		it('should not process if URL is not parseable', async () => {
			const tab = { id: 1, url: 'not-a-valid-url' } as chrome.tabs.Tab;

			await service.handleRenameTab(tab, 'New Title');

			expect(_setStorage).not.toHaveBeenCalled();
		});

		it('should create a new rule and reload tab', async () => {
			const mockRule = {
				id: 'new-rule',
				name: 'New Title (example.com)',
				detection: 'CONTAINS',
				url_fragment: 'https://example.com',
				tab: {
					title: 'New Title',
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

			vi.mocked(_getDefaultRule).mockReturnValue(mockRule);
			vi.mocked(_setStorage).mockResolvedValue(undefined);
			mockChrome.tabs.reload.mockResolvedValue(undefined);

			const tab = {
				id: 1,
				url: 'https://example.com/page',
			} as chrome.tabs.Tab;

			await service.handleRenameTab(tab, 'New Title');

			expect(_getDefaultRule).toHaveBeenCalled();
			expect(_setStorage).toHaveBeenCalled();
			expect(mockChrome.tabs.reload).toHaveBeenCalledWith(1);
		});
	});

	describe('shouldProcessUrl', () => {
		it('should return true if URL should not be skipped', async () => {
			vi.mocked(_shouldSkipUrl).mockResolvedValue(false);

			const result = await service.shouldProcessUrl('https://example.com');

			expect(result).toBe(true);
		});

		it('should return false if URL should be skipped', async () => {
			vi.mocked(_shouldSkipUrl).mockResolvedValue(true);

			const result = await service.shouldProcessUrl('https://example.com');

			expect(result).toBe(false);
		});
	});
});
