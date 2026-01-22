import { describe, it, expect } from 'vitest';
import { _processUrlFragment } from '../helpers';

/**
 * This test demonstrates the fundamental conflict between detection and uniqueness
 * when using url_fragment with $1 placeholders
 */
describe('Detection vs Uniqueness Conflict', () => {
	describe('The Problem: url_fragment serves two purposes', () => {
		it('shows that $1 works for uniqueness comparison (what the test in helpers.urlFragment.test.js proves)', () => {
			const urlFragment = 'https://mysite.atlassian.net/browse/$1';
			const currentUrl = 'https://mysite.atlassian.net/browse/ABC-123';
			const urlMatcher = 'https://mysite.atlassian.net/browse/([A-Z]+-\\d+)';

			const result = _processUrlFragment(urlFragment, currentUrl, urlMatcher);

			// ✅ This works! _processUrlFragment correctly substitutes $1
			expect(result).toBe('https://mysite.atlassian.net/browse/ABC-123');
		});

		it('shows that detection with CONTAINS and $1 fails', () => {
			const urlFragment = 'mysite.atlassian.net/browse/$1';
			const actualUrl = 'https://mysite.atlassian.net/browse/ABC-123';

			// This is what happens in _getRuleFromUrl with detection: "CONTAINS"
			const doesMatch = actualUrl.includes(urlFragment);

			// ❌ FAILS! The URL doesn't contain the literal string "$1"
			expect(doesMatch).toBe(false);

			// This is why the rule is never applied, so _processUrlFragment never gets called!
		});

		it('shows that detection with REGEX and $1 fails', () => {
			const urlFragment = 'mysite\\.atlassian\\.net/browse/$1';
			const actualUrl = 'https://mysite.atlassian.net/browse/ABC-123';

			// This is what happens in _getRuleFromUrl with detection: "REGEX"
			try {
				const regex = new RegExp(urlFragment);
				const doesMatch = regex.test(actualUrl);

				// ❌ FAILS! $1 in regex means "end of line followed by 1"
				expect(doesMatch).toBe(false);
			} catch (e) {
				// Or might throw if $1 creates invalid regex
				expect(e).toBeTruthy();
			}
		});

		it('shows that without $1, all tickets are considered duplicates', () => {
			// Valid regex for detection (without $1)
			const urlFragment = 'mysite.atlassian.net/browse';
			const urlMatcher = 'mysite\\.atlassian\\.net/browse/([A-Z]+-\\d+)';

			const ticket1 = 'https://mysite.atlassian.net/browse/ABC-123';
			const ticket2 = 'https://mysite.atlassian.net/browse/XYZ-456';

			const result1 = _processUrlFragment(urlFragment, ticket1, urlMatcher);
			const result2 = _processUrlFragment(urlFragment, ticket2, urlMatcher);

			// ❌ Both return the same value because url_fragment has no $
			expect(result1).toBe('mysite.atlassian.net/browse');
			expect(result2).toBe('mysite.atlassian.net/browse');
			expect(result1).toBe(result2);

			// This means ticket ABC-123 and XYZ-456 are considered duplicates!
		});
	});

	describe('Why the original test in helpers.urlFragment.test.js is misleading', () => {
		it('only tests _processUrlFragment in isolation, not the full flow', () => {
			// The test proves this works:
			const urlFragment = 'https://mysite.atlassian.net/browse/$1';
			const currentUrl = 'https://mysite.atlassian.net/browse/ABC-123';
			const urlMatcher = 'https://mysite.atlassian.net/browse/([A-Z]+-\\d+)';

			const result = _processUrlFragment(urlFragment, currentUrl, urlMatcher);
			expect(result).toBe('https://mysite.atlassian.net/browse/ABC-123');

			// ✅ TRUE: _processUrlFragment works correctly

			// ❌ BUT: It doesn't test if the rule would be detected in the first place!
			// The test skips the detection phase completely
		});

		it('demonstrates the missing piece: detection must happen BEFORE uniqueness', () => {
			const urlFragment = 'mysite.atlassian.net/browse/$1';
			const actualUrl = 'https://mysite.atlassian.net/browse/ABC-123';

			// Step 1: Detection (MISSING from the original test!)
			const detectedWithContains = actualUrl.includes(urlFragment);
			expect(detectedWithContains).toBe(false); // ❌ Rule not detected

			// Step 2: Uniqueness (only called if Step 1 succeeded)
			// This step is never reached because detection failed!
			// So _processUrlFragment is never called in real usage
		});
	});

	describe('The Solution: unique_pattern field', () => {
		it('would allow separate fields for detection and uniqueness', () => {
			// Proposed solution:
			const config = {
				detection: 'REGEX',
				url_fragment: 'mysite\\.atlassian\\.net/browse/[A-Z]+-\\d+', // For detection
				tab: {
					unique: true,
					url_matcher: 'mysite\\.atlassian\\.net/browse/([A-Z]+-\\d+)', // For capturing
					unique_pattern: 'mysite.atlassian.net/browse/$1', // For uniqueness (NEW!)
				},
			};

			// Detection would use url_fragment (valid regex)
			const url = 'https://mysite.atlassian.net/browse/ABC-123';
			const regex = new RegExp(config.url_fragment);
			const detected = regex.test(url);
			expect(detected).toBe(true); // ✅ Detection works!

			// Uniqueness would use unique_pattern (with $1)
			const uniqueId = _processUrlFragment(config.tab.unique_pattern, url, config.tab.url_matcher);
			expect(uniqueId).toBe('mysite.atlassian.net/browse/ABC-123'); // ✅ Uniqueness works!

			// Different ticket numbers would have different unique IDs
			const url2 = 'https://mysite.atlassian.net/browse/XYZ-456';
			const uniqueId2 = _processUrlFragment(
				config.tab.unique_pattern,
				url2,
				config.tab.url_matcher
			);
			expect(uniqueId2).toBe('mysite.atlassian.net/browse/XYZ-456'); // ✅ Different!
			expect(uniqueId).not.toBe(uniqueId2); // ✅ Not duplicates!
		});
	});

	describe('Real-world example: GitHub Issues', () => {
		it('shows why GitHub unique-per-issue-number is currently impossible', () => {
			// What the user wants to do:
			const desiredConfig = {
				detection: 'REGEX',
				url_fragment: 'github\\.com/.+/issues/\\d+', // Matches all issues
				tab: {
					unique: true,
					url_matcher: 'github\\.com/.+/issues/(\\d+)', // Captures issue number
					// Missing: unique_pattern: "github.com/issues/$1"
				},
			};

			// Without $1 in url_fragment, all issues are duplicates
			const issue123 = 'https://github.com/owner/repo/issues/123';
			const issue456 = 'https://github.com/owner/repo/issues/456';

			const uniqueId1 = _processUrlFragment(
				desiredConfig.url_fragment,
				issue123,
				desiredConfig.tab.url_matcher
			);

			const uniqueId2 = _processUrlFragment(
				desiredConfig.url_fragment,
				issue456,
				desiredConfig.tab.url_matcher
			);

			// ❌ Both have the same unique ID
			expect(uniqueId1).toBe(desiredConfig.url_fragment);
			expect(uniqueId2).toBe(desiredConfig.url_fragment);
			expect(uniqueId1).toBe(uniqueId2);

			// So issue #123 and issue #456 are considered duplicates
			// Even though they're different issues!
		});

		it('shows what would work with unique_pattern', () => {
			// With the proposed unique_pattern field:
			const improvedConfig = {
				detection: 'REGEX',
				url_fragment: 'github\\.com/.+/issues/\\d+', // For detection
				tab: {
					unique: true,
					url_matcher: 'github\\.com/.+/issues/(\\d+)',
					unique_pattern: 'github.com/issues/$1', // NEW! For uniqueness
				},
			};

			const issue123 = 'https://github.com/owner/repo/issues/123';
			const issue456 = 'https://github.com/owner/repo/issues/456';

			// Detection works (valid regex)
			const regex = new RegExp(improvedConfig.url_fragment);
			expect(regex.test(issue123)).toBe(true); // ✅
			expect(regex.test(issue456)).toBe(true); // ✅

			// Uniqueness distinguishes by issue number
			const uniqueId1 = _processUrlFragment(
				improvedConfig.tab.unique_pattern,
				issue123,
				improvedConfig.tab.url_matcher
			);

			const uniqueId2 = _processUrlFragment(
				improvedConfig.tab.unique_pattern,
				issue456,
				improvedConfig.tab.url_matcher
			);

			// ✅ Different unique IDs!
			expect(uniqueId1).toBe('github.com/issues/123');
			expect(uniqueId2).toBe('github.com/issues/456');
			expect(uniqueId1).not.toBe(uniqueId2);

			// So issue #123 and #456 can coexist!
		});
	});
});
