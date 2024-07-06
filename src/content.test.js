import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateTitle, getTextBySelector, processTitle, processIcon, applyRule } from './content.js';
import { _getRuleFromUrl } from './common/storage.ts';

import { chrome } from './__mocks__/chrome.js';
global.chrome = chrome;

vi.mock('./common/storage.ts');

describe('Content', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		vi.clearAllMocks();
		global.chrome = chrome;
	});

	describe('updateTitle', () => {
		it('should update title correctly', () => {
			const result = updateTitle('Hello {name}', '{name}', 'World');
			expect(result).toBe('Hello World');
		});

		it('should not update title if value is empty', () => {
			const result = updateTitle('Hello {name}', '{name}', '');
			expect(result).toBe('Hello {name}');
		});
	});

	describe('getTextBySelector', () => {
		it('should get text content from an element', () => {
			document.body.innerHTML = '<div id="test">Hello</div>';
			const result = getTextBySelector('#test');
			expect(result).toBe('Hello');
		});

		it('should get value from an nested input element', () => {
			document.body.innerHTML = `<div id="header-search-form">
        <div>
            <form id="search" action="#" method="get">
                <input type="text" id="q" name="q" value="bar" placeholder="Search...">
                <button type="submit">Search</button>
            </form>
        </div>
    </div>`;

			const result = getTextBySelector('div#header-search-form div form#search input#q');
			expect(result).toBe('bar');
		});

		it('should return empty string if element is not found', () => {
			const result = getTextBySelector('#nonexistent');
			expect(result).toBe('');
		});
	});

	describe('processTitle', () => {
		it('should process title with selectors', () => {
			document.body.innerHTML = '<div id="name">World</div>';
			const rule = {
				tab: {
					title: 'Hello {#name}',
				},
			};
			const result = processTitle('', '', rule);
			expect(result).toBe('Hello World');
		});

		it('should process title with encoded uri', () => {
			const rule = {
				tab: {
					title: '$1',
					url_matcher: '__title=([^&]+)',
				},
			};
			const result = processTitle(
				'http://example.com?__title=%D0%9F%D1%80%D0%B8%D0%BC%D0%B5%D1%80',
				'',
				rule
			);
			expect(result).toBe('Пример');
		});

		it('should process title with title matcher', () => {
			const rule = {
				tab: {
					title: 'Hello @0',
					title_matcher: 'Hello (.+)',
				},
			};
			const result = processTitle('', 'Hello World', rule);
			expect(result).toBe('Hello Hello World');
		});

		it('should process title with URL matcher', () => {
			const rule = {
				tab: {
					title: 'Page $1',
					url_matcher: 'https:\\/\\/example.com\\/(.+)',
				},
			};
			const result = processTitle('https://example.com/test', '', rule);
			expect(result).toBe('Page test');
		});

		it('should process title with title matcher and URL matcher', () => {
			const rule = {
				tab: {
					title: '@0 | $0',
					title_matcher: '[a-z]*@gmail.com',
					url_matcher: '[a-z]*.google.com',
				},
			};

			const result = processTitle('mail.google.com', 'john@gmail.com', rule);
			expect(result).toBe('john@gmail.com | mail.google.com');
		});

		it('should process title with URL matcher - procore', async () => {
			const rule = {
				tab: {
					title: '{title} $1',
					detection: 'REGEX',
					url_fragment: 'app[.]procore[.]com/754712/project/daily_log/list?',
					url_matcher: 'date=[0-9]{4}-([0-9]{2}-[0-9]{2})',
				},
			};

			document.title = 'GMP1';

			const result = processTitle(
				'app.procore.com/754712/project/daily_log/list?date=2021-07-01',
				'GMP1',
				rule
			);
			expect(result).toBe('GMP1 07-01');
		});

		it('should match github repositories', () => {
			const rule = {
				tab: {
					title: 'I got you GitHub!',
					detection: 'REGEX',
					url_fragment: 'github.com',
				},
			};

			const result = processTitle('github.com', '', rule);
			expect(result).toBe('I got you GitHub!');
		});

		it('should deguise Github as Google', () => {
			const rule = {
				tab: {
					detection: 'CONTAINS',
					url_fragment: 'github.com',
					title: 'Google',
					icon: 'https://www.google.com/favicon.ico',
				},
			};

			const result = processTitle('github.com', '', rule);
			expect(result).toBe('Google');
		});

		it('should customize title with html selector and regexp', () => {
			const rule = {
				tab: {
					title: '{title} | $2 by $1',
					detection: 'CONTAINS',
					url_fragment: 'github.com',
					url_matcher: 'github[.]com/([A-Za-z0-9_-]+)/([A-Za-z0-9_-]+)',
				},
			};

			const result = processTitle(
				'https://github.com/furybee/chrome-tab-modifier',
				'FuryBee/chrome-tab-modifier: Take control of your tabs',
				rule
			);

			expect(result).toBe(
				'FuryBee/chrome-tab-modifier: Take control of your tabs | chrome-tab-modifier by furybee'
			);
		});
	});

	describe('processIcon', () => {
		it('should update the favicon', () => {
			processIcon('icon.png');
			const icon = document.querySelector('link[rel*="icon"]');
			expect(icon).toBeTruthy();
			expect(icon.href).toContain('icon.png');
		});

		it('should remove existing favicons', () => {
			document.head.innerHTML = '<link rel="icon" href="old-icon.png">';
			processIcon('new-icon.png');
			const oldIcon = document.querySelector('link[href="old-icon.png"]');
			const newIcon = document.querySelector('link[href*="new-icon.png"]');
			expect(oldIcon).toBeFalsy();
			expect(newIcon).toBeTruthy();
		});
	});

	describe('applyRule', () => {
		it('should apply title rule', async () => {
			const rule = {
				tab: {
					title: 'New Title',
				},
			};
			_getRuleFromUrl.mockResolvedValue(rule);
			await applyRule(rule);
			expect(document.title).toBe('New Title');
		});

		it('should apply favicon rule', async () => {
			const rule = {
				tab: {
					icon: 'icon.png',
				},
			};
			_getRuleFromUrl.mockResolvedValue(rule);
			await applyRule(rule);
			const icon = document.querySelector('link[rel*="icon"]');
			expect(icon).toBeTruthy();
			expect(icon.href).toContain('icon.png');
		});

		it('should send message to set tab as pinned', async () => {
			const rule = {
				tab: {
					pinned: true,
				},
			};
			_getRuleFromUrl.mockResolvedValue(rule);
			await applyRule(rule);
			expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith({
				action: 'setPinned',
			});
		});

		it('should send message to set tab as muted', async () => {
			const rule = {
				tab: {
					muted: true,
				},
			};
			_getRuleFromUrl.mockResolvedValue(rule);
			await applyRule(rule);
			expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith({
				action: 'setMuted',
			});
		});

		it('should send message to set tab as unique', async () => {
			const rule = {
				tab: {
					unique: true,
				},
				url_fragment: 'unique-fragment',
			};
			_getRuleFromUrl.mockResolvedValue(rule);
			await applyRule(rule);
			expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith({
				action: 'setUnique',
				url_fragment: 'unique-fragment',
			});
		});

		it('should set window onbeforeunload for protected tab', async () => {
			const rule = {
				tab: {
					protected: true,
				},
			};
			_getRuleFromUrl.mockResolvedValue(rule);
			await applyRule(rule);
			expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith({
				action: 'setProtected',
			});
		});
	});
});
