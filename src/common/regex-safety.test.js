import { describe, expect, it, vi, beforeEach } from 'vitest';
import { _isRegexPatternSafe, _safeRegexTestSync } from './regex-safety';

describe('Regex Safety', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Spy on console.warn to verify warnings are logged
		vi.spyOn(console, 'warn').mockImplementation(() => {});
	});

	describe('_isRegexPatternSafe', () => {
		it('should accept safe simple patterns', () => {
			expect(_isRegexPatternSafe('example\\.com')).toBe(true);
			expect(_isRegexPatternSafe('https://[a-z]+\\.example\\.com')).toBe(true);
			expect(_isRegexPatternSafe('^https://example\\.com/path$')).toBe(true);
			expect(_isRegexPatternSafe('[0-9]{1,4}')).toBe(true);
		});

		it('should accept complex but safe patterns from existing tests', () => {
			// From biblegateway test
			expect(
				_isRegexPatternSafe(
					'https:\\/\\/www\\.biblegateway\\.com\\/passage\\/\\?search=.*version=(?!MOUNCE)(?!.*;).*'
				)
			).toBe(true);

			// From jira test (without the catastrophic .*? at the start)
			expect(
				_isRegexPatternSafe(
					'furybee.atlassian.net\\/jira\\/software\\/c\\/projects\\/([a-zA-Z]{1,5})\\/boards\\/([0-9]{1,4})(\\?.*)?$'
				)
			).toBe(true);
		});

		it('should reject patterns with nested quantifiers', () => {
			expect(_isRegexPatternSafe('(a+)+')).toBe(false);
			expect(_isRegexPatternSafe('(a*)*')).toBe(false);
			expect(_isRegexPatternSafe('(a+)*')).toBe(false);
			expect(_isRegexPatternSafe('(a{1,5})+')).toBe(false);
			expect(_isRegexPatternSafe('(x+|y+)+')).toBe(false);
		});

		it('should reject patterns with consecutive quantifiers', () => {
			expect(_isRegexPatternSafe('a+++')).toBe(false);
			expect(_isRegexPatternSafe('a**')).toBe(false);
			expect(_isRegexPatternSafe('a+*')).toBe(false);
			expect(_isRegexPatternSafe('a?+')).toBe(false);
		});

		it('should reject patterns with overlapping alternatives', () => {
			expect(_isRegexPatternSafe('(a|a)*')).toBe(false);
			expect(_isRegexPatternSafe('(x+|x+y+)*')).toBe(false);
		});

		it('should reject invalid regex patterns', () => {
			expect(_isRegexPatternSafe('[')).toBe(false);
			expect(_isRegexPatternSafe('((')).toBe(false);
			expect(_isRegexPatternSafe('*')).toBe(false);
		});

		it('should reject empty or non-string patterns', () => {
			expect(_isRegexPatternSafe('')).toBe(false);
			expect(_isRegexPatternSafe(null)).toBe(false);
			expect(_isRegexPatternSafe(undefined)).toBe(false);
		});

		it('should reject excessively long patterns', () => {
			const longPattern = 'a'.repeat(1001);
			expect(_isRegexPatternSafe(longPattern)).toBe(false);
		});
	});

	describe('_safeRegexTestSync', () => {
		it('should match safe patterns correctly', () => {
			expect(_safeRegexTestSync('example\\.com', 'https://example.com/path')).toBe(true);
			expect(_safeRegexTestSync('example\\.com', 'https://other.com/path')).toBe(false);
			expect(_safeRegexTestSync('^https://example\\.com', 'https://example.com/path')).toBe(
				true
			);
		});

		it('should handle complex safe patterns from existing tests', () => {
			// Jira pattern (safe version without .*? at the start)
			const jiraPattern =
				'furybee.atlassian.net\\/jira\\/software\\/c\\/projects\\/([a-zA-Z]{1,5})\\/boards\\/([0-9]{1,4})(\\?.*)?$';
			const jiraUrl =
				'https://furybee.atlassian.net/jira/software/c/projects/FB/boards/74?quickFilter=313';
			expect(_safeRegexTestSync(jiraPattern, jiraUrl)).toBe(true);

			// Bible Gateway pattern
			const biblePattern =
				'https:\\/\\/www\\.biblegateway\\.com\\/passage\\/\\?search=.*version=(?!MOUNCE)(?!.*;).*';
			const bibleUrl = 'https://www.biblegateway.com/passage/?search=John+3&version=NASB';
			expect(_safeRegexTestSync(biblePattern, bibleUrl)).toBe(true);
		});

		it('should block dangerous ReDoS patterns', () => {
			// These patterns are known to cause catastrophic backtracking
			const dangerousPatterns = [
				'(a+)+',
				'(a*)*',
				'(a|a)*',
				'(x+|x+y+)*',
				'(a+)+b',
			];

			dangerousPatterns.forEach((pattern) => {
				const result = _safeRegexTestSync(pattern, 'aaaaaaaaaaaaaaaaaaaaaaaaa');
				expect(result).toBe(false);
				expect(console.warn).toHaveBeenCalledWith(
					expect.stringContaining('Unsafe regex pattern detected')
				);
			});
		});

		it('should handle invalid regex patterns gracefully', () => {
			expect(_safeRegexTestSync('[', 'test')).toBe(false);
			expect(_safeRegexTestSync('((', 'test')).toBe(false);
			expect(console.warn).toHaveBeenCalled();
		});

		it('should handle empty or invalid inputs', () => {
			expect(_safeRegexTestSync('', 'test')).toBe(false);
			expect(_safeRegexTestSync(null, 'test')).toBe(false);
			expect(_safeRegexTestSync(undefined, 'test')).toBe(false);
		});

		it('should work with patterns from existing storage tests', () => {
			// These are the actual patterns used in storage.test.js
			expect(_safeRegexTestSync('example\\.com\\/path', 'https://example.com/path')).toBe(
				true
			);
		});
	});
});
