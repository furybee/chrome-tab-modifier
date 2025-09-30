import { beforeEach, describe, expect, it, vi } from 'vitest';
import { _processUrlFragment } from './helpers.ts';

describe('_processUrlFragment', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return original fragment when no urlMatcher is provided', () => {
		const urlFragment = 'https://example.com/ticket/$1';
		const currentUrl = 'https://example.com/ticket/ABC-123';

		const result = _processUrlFragment(urlFragment, currentUrl);

		expect(result).toBe(urlFragment);
	});

	it('should return original fragment when no $ placeholders are present', () => {
		const urlFragment = 'https://example.com/ticket/';
		const currentUrl = 'https://example.com/ticket/ABC-123';
		const urlMatcher = 'https://example.com/ticket/([A-Z]+-\\d+)';

		const result = _processUrlFragment(urlFragment, currentUrl, urlMatcher);

		expect(result).toBe(urlFragment);
	});

	it('should process single capture group correctly', () => {
		const urlFragment = 'https://mysite.atlassian.net/browse/$1';
		const currentUrl = 'https://mysite.atlassian.net/browse/ABC-123';
		const urlMatcher = 'https://mysite.atlassian.net/browse/([A-Z]+-\\d+)';

		const result = _processUrlFragment(urlFragment, currentUrl, urlMatcher);

		expect(result).toBe('https://mysite.atlassian.net/browse/ABC-123');
	});

	it('should process multiple capture groups correctly', () => {
		const urlFragment = 'https://$1.atlassian.net/browse/$2';
		const currentUrl = 'https://mysite.atlassian.net/browse/PROJ-456';
		const urlMatcher = 'https://([^.]+)\\.atlassian\\.net/browse/([A-Z]+-\\d+)';

		const result = _processUrlFragment(urlFragment, currentUrl, urlMatcher);

		expect(result).toBe('https://mysite.atlassian.net/browse/PROJ-456');
	});

	it('should handle non-matching URL gracefully', () => {
		const urlFragment = 'https://example.com/ticket/$1';
		const currentUrl = 'https://different.com/page';
		const urlMatcher = 'https://example.com/ticket/([A-Z]+-\\d+)';

		const result = _processUrlFragment(urlFragment, currentUrl, urlMatcher);

		// Should return original fragment since no matches found
		expect(result).toBe(urlFragment);
	});

	it('should handle invalid regex gracefully', () => {
		const urlFragment = 'https://example.com/ticket/$1';
		const currentUrl = 'https://example.com/ticket/ABC-123';
		const urlMatcher = '[invalid(regex';

		// Mock console.error to verify it's called
		const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		const result = _processUrlFragment(urlFragment, currentUrl, urlMatcher);

		expect(result).toBe(urlFragment);
		expect(consoleErrorSpy).toHaveBeenCalledWith(
			'Tab Modifier: Error processing URL fragment:',
			expect.any(Error)
		);

		consoleErrorSpy.mockRestore();
	});

	it('should handle complex JIRA URL pattern from the issue', () => {
		const urlFragment = 'https://mysite.atlassian.net/browse/$1';
		const currentUrl = 'https://mysite.atlassian.net/browse/PROJ-123?someParam=value';
		const urlMatcher = 'https://mysite.atlassian.net/browse/([A-Z]+-\\d+)';

		const result = _processUrlFragment(urlFragment, currentUrl, urlMatcher);

		expect(result).toBe('https://mysite.atlassian.net/browse/PROJ-123');
	});

	it('should replace multiple occurrences of the same placeholder', () => {
		const urlFragment = 'ticket-$1-copy-$1';
		const currentUrl = 'https://example.com/ticket/ABC-123';
		const urlMatcher = 'https://example.com/ticket/([A-Z]+-\\d+)';

		const result = _processUrlFragment(urlFragment, currentUrl, urlMatcher);

		expect(result).toBe('ticket-ABC-123-copy-ABC-123');
	});

	it('should handle empty capture groups', () => {
		const urlFragment = 'prefix-$1-suffix';
		const currentUrl = 'https://example.com/page/';
		const urlMatcher = 'https://example.com/page/(.*)';

		const result = _processUrlFragment(urlFragment, currentUrl, urlMatcher);

		expect(result).toBe('prefix--suffix');
	});
});