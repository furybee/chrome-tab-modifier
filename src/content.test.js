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

		it('should get value from an input element', () => {
			document.body.innerHTML = '<input id="test" value="Hello">';
			const result = getTextBySelector('#test');
			expect(result).toBe('Hello');
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
			expect(window.onbeforeunload).toBeInstanceOf(Function);
		});
	});
});
