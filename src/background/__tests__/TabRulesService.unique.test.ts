import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TabRulesService } from '../TabRulesService';
import type { Rule } from '../../common/types';

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

// Import the actual _processUrlFragment function
import { _processUrlFragment } from '../../common/helpers';

describe('TabRulesService - GitHub Unique Issue Test', () => {
	let service: TabRulesService;

	beforeEach(() => {
		service = new TabRulesService();
		vi.clearAllMocks();
		mockChrome.scripting.executeScript.mockResolvedValue([]);
		mockChrome.tabs.remove.mockResolvedValue(undefined);
	});

	describe('URL Fragment with $1 placeholder', () => {
		it('should process url_fragment with $1 placeholder correctly', () => {
			const urlFragment = 'github.com/issues/$1';
			const currentUrl = 'https://github.com/owner/repo/issues/123';
			const urlMatcher = 'github\\.com/.+/issues/(\\d+)';

			const result = _processUrlFragment(urlFragment, currentUrl, urlMatcher);

			console.log('Input urlFragment:', urlFragment);
			console.log('Input currentUrl:', currentUrl);
			console.log('Input urlMatcher:', urlMatcher);
			console.log('Result:', result);

			// Should replace $1 with the captured group (123)
			expect(result).toBe('github.com/issues/123');
		});

		it('should distinguish different issue numbers', () => {
			const urlFragment = 'github.com/issues/$1';
			const urlMatcher = 'github\\.com/.+/issues/(\\d+)';

			const url123 = 'https://github.com/owner/repo/issues/123';
			const url456 = 'https://github.com/owner/repo/issues/456';

			const result123 = _processUrlFragment(urlFragment, url123, urlMatcher);
			const result456 = _processUrlFragment(urlFragment, url456, urlMatcher);

			console.log('Issue 123 processed:', result123);
			console.log('Issue 456 processed:', result456);

			// Different issue numbers should produce different results
			expect(result123).toBe('github.com/issues/123');
			expect(result456).toBe('github.com/issues/456');
			expect(result123).not.toBe(result456);
		});

		it('should handle full GitHub URLs with $1', () => {
			const urlFragment = 'https://github.com/issues/$1';
			const urlMatcher = 'github\\.com/.+/issues/(\\d+)';

			const url = 'https://github.com/microsoft/vscode/issues/12345';

			const result = _processUrlFragment(urlFragment, url, urlMatcher);

			console.log('Full URL processed:', result);

			expect(result).toBe('https://github.com/issues/12345');
		});
	});

	describe('Unique tab logic with GitHub issues', () => {
		it('should close duplicate tab with same issue number', async () => {
			const currentTab = {
				id: 1,
				url: 'https://github.com/owner/repo/issues/123',
			} as chrome.tabs.Tab;

			const duplicateTab = {
				id: 2,
				url: 'https://github.com/owner/repo/issues/123',
			} as chrome.tabs.Tab;

			const differentIssueTab = {
				id: 3,
				url: 'https://github.com/owner/repo/issues/456',
			} as chrome.tabs.Tab;

			const message = {
				url_fragment: 'github.com/issues/$1',
				rule: {
					tab: {
						url_matcher: 'github\\.com/.+/issues/(\\d+)',
					},
				} as Rule,
			};

			mockChrome.tabs.query.mockImplementation((_queryInfo: any, callback: any) => {
				callback([currentTab, duplicateTab, differentIssueTab]);
			});

			await service.handleSetUnique(message, currentTab);

			// Should close the duplicate tab (issue #123)
			expect(mockChrome.tabs.remove).toHaveBeenCalledWith(2);
			expect(mockChrome.tabs.remove).toHaveBeenCalledTimes(1);

			// Should NOT close the different issue tab (#456)
			expect(mockChrome.tabs.remove).not.toHaveBeenCalledWith(3);
		});

		it('should NOT close tabs with different issue numbers', async () => {
			const tab123 = {
				id: 1,
				url: 'https://github.com/owner/repo/issues/123',
			} as chrome.tabs.Tab;

			const tab456 = {
				id: 2,
				url: 'https://github.com/owner/repo/issues/456',
			} as chrome.tabs.Tab;

			const message = {
				url_fragment: 'github.com/issues/$1',
				rule: {
					tab: {
						url_matcher: 'github\\.com/.+/issues/(\\d+)',
					},
				} as Rule,
			};

			mockChrome.tabs.query.mockImplementation((_queryInfo: any, callback: any) => {
				callback([tab123, tab456]);
			});

			await service.handleSetUnique(message, tab123);

			// Should NOT close any tabs because issue numbers are different
			expect(mockChrome.tabs.remove).not.toHaveBeenCalled();
		});

		it('should handle multiple duplicates of the same issue', async () => {
			const currentTab = {
				id: 1,
				url: 'https://github.com/owner/repo/issues/999',
			} as chrome.tabs.Tab;

			const duplicate1 = {
				id: 2,
				url: 'https://github.com/owner/repo/issues/999',
			} as chrome.tabs.Tab;

			const duplicate2 = {
				id: 3,
				url: 'https://github.com/owner/repo/issues/999',
			} as chrome.tabs.Tab;

			const message = {
				url_fragment: 'github.com/issues/$1',
				rule: {
					tab: {
						url_matcher: 'github\\.com/.+/issues/(\\d+)',
					},
				} as Rule,
			};

			mockChrome.tabs.query.mockImplementation((_queryInfo: any, callback: any) => {
				callback([currentTab, duplicate1, duplicate2]);
			});

			await service.handleSetUnique(message, currentTab);

			// Should only close the first duplicate found
			expect(mockChrome.tabs.remove).toHaveBeenCalledTimes(1);
			expect(mockChrome.tabs.remove).toHaveBeenCalledWith(2);
		});
	});

	describe('Rule Detection with CONTAINS and $1', () => {
		it('should show the problem: CONTAINS does not work with $1 in url_fragment', () => {
			// This is what the user tried to do
			const urlFragment = 'github.com/issues/$1';
			const actualUrl = 'https://github.com/owner/repo/issues/123';

			// With CONTAINS detection, we use includes()
			const doesMatch = actualUrl.includes(urlFragment);

			console.log('url_fragment:', urlFragment);
			console.log('actualUrl:', actualUrl);
			console.log('Does CONTAINS match?', doesMatch);

			// This will be FALSE because the URL doesn't contain the literal string "$1"
			expect(doesMatch).toBe(false);

			// This is why the rule is not applied!
		});

		it('should show what WOULD work for detection', () => {
			const urlFragment = 'github.com';
			const actualUrl = 'https://github.com/owner/repo/issues/123';

			const doesMatch = actualUrl.includes(urlFragment);

			console.log('url_fragment:', urlFragment);
			console.log('actualUrl:', actualUrl);
			console.log('Does CONTAINS match?', doesMatch);

			expect(doesMatch).toBe(true);
		});

		it('should demonstrate the conflict: detection vs uniqueness', () => {
			// For DETECTION, we need a pattern that matches the URL
			const detectionPattern = 'github.com/issues'; // or regex: github\.com/.+/issues/\d+

			// For UNIQUENESS, we need a template with $1
			const uniqueTemplate = 'github.com/issues/$1';

			console.log('Detection pattern (for matching):', detectionPattern);
			console.log('Unique template (for comparison):', uniqueTemplate);

			// The problem: url_fragment is used for BOTH purposes!
			console.log('But url_fragment can only be one value, not both!');

			expect(detectionPattern).not.toBe(uniqueTemplate);
		});
	});

	describe('Working configuration (current limitation)', () => {
		it('should work if we use simple CONTAINS without $1 for detection', async () => {
			// Current working approach: url_fragment without $1 for detection
			const currentTab = {
				id: 1,
				url: 'https://github.com/owner/repo/issues/123',
			} as chrome.tabs.Tab;

			const duplicateTab = {
				id: 2,
				url: 'https://github.com/owner/repo/issues/123',
			} as chrome.tabs.Tab;

			const message = {
				// No $1 here, so CONTAINS detection works
				url_fragment: 'github.com/issues',
				rule: {
					tab: {
						url_matcher: 'github\\.com/.+/issues/(\\d+)',
					},
				} as Rule,
			};

			mockChrome.tabs.query.mockImplementation((_queryInfo: any, callback: any) => {
				callback([currentTab, duplicateTab]);
			});

			// But now let's see what happens with uniqueness
			const processed1 = _processUrlFragment(
				message.url_fragment,
				currentTab.url!,
				message.rule.tab.url_matcher
			);

			const processed2 = _processUrlFragment(
				message.url_fragment,
				duplicateTab.url!,
				message.rule.tab.url_matcher
			);

			console.log('Processed tab 1:', processed1);
			console.log('Processed tab 2:', processed2);

			// Problem: both return the same value (url_fragment has no $)
			expect(processed1).toBe('github.com/issues');
			expect(processed2).toBe('github.com/issues');
			expect(processed1).toBe(processed2);

			// So all GitHub issues would be considered duplicates!
			// This is exactly what the user is experiencing!
		});
	});
});
