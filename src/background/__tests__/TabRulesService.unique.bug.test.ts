import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TabRulesService } from '../TabRulesService';
import type { Rule } from '../../common/types';
import { _processUrlFragment } from '../../common/helpers';

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

describe('TabRulesService - CRITICAL BUG: Unique closes unrelated tabs', () => {
	let service: TabRulesService;

	beforeEach(() => {
		service = new TabRulesService();
		vi.clearAllMocks();
		mockChrome.scripting.executeScript.mockResolvedValue([]);
		mockChrome.tabs.remove.mockResolvedValue(undefined);
	});

	describe('Bug reproduction: Unique closes Gmail when refreshing GitHub', () => {
		it('FIXED: should NOT close Gmail when url_matcher prevents it', async () => {
			// User's configuration: detection = "furybee/chrome-tab-modifier/issues"
			const githubTab = {
				id: 1,
				url: 'https://github.com/furybee/chrome-tab-modifier/issues/123',
			} as chrome.tabs.Tab;

			const gmailTab = {
				id: 2,
				url: 'https://mail.google.com/mail/u/0/#inbox',
			} as chrome.tabs.Tab;

			const message = {
				// No $1 in url_fragment (as per user's config)
				url_fragment: 'furybee/chrome-tab-modifier/issues',
				rule: {
					tab: {
						url_matcher: 'furybee/chrome-tab-modifier/issues/(\\d+)',
					},
				} as Rule,
			};

			// Simulate all open tabs
			mockChrome.tabs.query.mockImplementation((_queryInfo: any, callback: any) => {
				callback([githubTab, gmailTab]);
			});

			// Let's see what _processUrlFragment returns for each tab
			console.log('\n=== FIX VERIFICATION ===');

			const githubProcessed = _processUrlFragment(
				message.url_fragment,
				githubTab.url,
				message.rule.tab.url_matcher
			);
			console.log('GitHub tab processed:', githubProcessed);

			const gmailProcessed = _processUrlFragment(
				message.url_fragment,
				gmailTab.url,
				message.rule.tab.url_matcher
			);
			console.log('Gmail tab processed:', gmailProcessed);

			console.log('Are they equal?', githubProcessed === gmailProcessed);
			console.log('But Gmail URL matches pattern?', new RegExp(message.rule.tab.url_matcher).test(gmailTab.url));

			// Call handleSetUnique
			await service.handleSetUnique(message, githubTab);

			// FIXED: Gmail tab should NOT be closed (even though processed fragments are equal)
			// because Gmail URL doesn't match the url_matcher pattern
			expect(mockChrome.tabs.remove).not.toHaveBeenCalledWith(gmailTab.id);
			expect(mockChrome.tabs.remove).not.toHaveBeenCalled();

			console.log('✅ FIX CONFIRMED: Gmail was NOT closed!');
		});

		it('should show what _processUrlFragment returns for non-matching URLs', () => {
			const urlFragment = 'furybee/chrome-tab-modifier/issues';
			const urlMatcher = 'furybee/chrome-tab-modifier/issues/(\\d+)';

			// Test with matching URL
			const githubUrl = 'https://github.com/furybee/chrome-tab-modifier/issues/123';
			const githubResult = _processUrlFragment(urlFragment, githubUrl, urlMatcher);
			console.log('GitHub URL result:', githubResult);

			// Test with non-matching URL (Gmail)
			const gmailUrl = 'https://mail.google.com/mail/u/0/#inbox';
			const gmailResult = _processUrlFragment(urlFragment, gmailUrl, urlMatcher);
			console.log('Gmail URL result:', gmailResult);

			// Test with another non-matching URL
			const twitterUrl = 'https://twitter.com/home';
			const twitterResult = _processUrlFragment(urlFragment, twitterUrl, urlMatcher);
			console.log('Twitter URL result:', twitterResult);

			console.log('\nAll non-matching URLs return the same value!');
			expect(gmailResult).toBe(urlFragment); // Returns the fragment as-is
			expect(twitterResult).toBe(urlFragment); // Returns the fragment as-is
			expect(gmailResult).toBe(twitterResult); // All the same!
		});

		it('should show the root cause in _processUrlFragment', () => {
			const urlFragment = 'github.com/issues';
			const urlMatcher = 'github\\.com/.+/issues/(\\d+)';

			// URL that matches the pattern
			const matchingUrl = 'https://github.com/owner/repo/issues/123';

			// URL that does NOT match the pattern
			const nonMatchingUrl = 'https://mail.google.com/mail';

			console.log('\n=== ROOT CAUSE ANALYSIS ===');
			console.log('URL Fragment:', urlFragment);
			console.log('URL Matcher:', urlMatcher);

			// When URL matches, regex extracts data
			const matchResult = _processUrlFragment(urlFragment, matchingUrl, urlMatcher);
			console.log('Matching URL result:', matchResult);

			// When URL doesn't match, regex.exec() returns null
			// So _processUrlFragment returns the original urlFragment
			const nonMatchResult = _processUrlFragment(urlFragment, nonMatchingUrl, urlMatcher);
			console.log('Non-matching URL result:', nonMatchResult);

			// PROBLEM: Without $1, both return the same value!
			if (!urlFragment.includes('$')) {
				console.log('⚠️ No $1 in fragment, so both return:', urlFragment);
				expect(matchResult).toBe(urlFragment);
				expect(nonMatchResult).toBe(urlFragment);
				expect(matchResult).toBe(nonMatchResult);
			}
		});
	});

	describe('Expected behavior: Should only close matching tabs', () => {
		it('should NOT close tabs that do not match the url_matcher pattern', async () => {
			const githubTab = {
				id: 1,
				url: 'https://github.com/furybee/chrome-tab-modifier/issues/123',
			} as chrome.tabs.Tab;

			const gmailTab = {
				id: 2,
				url: 'https://mail.google.com/mail/u/0/#inbox',
			} as chrome.tabs.Tab;

			const message = {
				url_fragment: 'furybee/chrome-tab-modifier/issues',
				rule: {
					tab: {
						url_matcher: 'furybee/chrome-tab-modifier/issues/(\\d+)',
					},
				} as Rule,
			};

			mockChrome.tabs.query.mockImplementation((_queryInfo: any, callback: any) => {
				callback([githubTab, gmailTab]);
			});

			await service.handleSetUnique(message, githubTab);

			// Gmail should NOT be closed because it doesn't match the pattern
			expect(mockChrome.tabs.remove).not.toHaveBeenCalledWith(gmailTab.id);

			// In fact, NO tabs should be closed (no duplicates)
			expect(mockChrome.tabs.remove).not.toHaveBeenCalled();
		});

		it('should only close duplicates of the SAME matching URL', async () => {
			const currentTab = {
				id: 1,
				url: 'https://github.com/furybee/chrome-tab-modifier/issues/123',
			} as chrome.tabs.Tab;

			const duplicateTab = {
				id: 2,
				url: 'https://github.com/furybee/chrome-tab-modifier/issues/123',
			} as chrome.tabs.Tab;

			const differentIssueTab = {
				id: 3,
				url: 'https://github.com/furybee/chrome-tab-modifier/issues/456',
			} as chrome.tabs.Tab;

			const gmailTab = {
				id: 4,
				url: 'https://mail.google.com/mail',
			} as chrome.tabs.Tab;

			const message = {
				url_fragment: 'furybee/chrome-tab-modifier/issues/$1',
				rule: {
					tab: {
						url_matcher: 'furybee/chrome-tab-modifier/issues/(\\d+)',
					},
				} as Rule,
			};

			mockChrome.tabs.query.mockImplementation((_queryInfo: any, callback: any) => {
				callback([currentTab, duplicateTab, differentIssueTab, gmailTab]);
			});

			await service.handleSetUnique(message, currentTab);

			// Should ONLY close the duplicate (same issue #123)
			expect(mockChrome.tabs.remove).toHaveBeenCalledWith(duplicateTab.id);
			expect(mockChrome.tabs.remove).toHaveBeenCalledTimes(1);

			// Should NOT close different issue or Gmail
			expect(mockChrome.tabs.remove).not.toHaveBeenCalledWith(differentIssueTab.id);
			expect(mockChrome.tabs.remove).not.toHaveBeenCalledWith(gmailTab.id);
		});
	});
});
