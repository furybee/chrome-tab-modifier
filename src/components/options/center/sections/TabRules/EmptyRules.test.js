import { beforeEach, describe, expect, it } from 'vitest';
import { TitleService } from '../../../../../content/TitleService';
import { RegexService } from '../../../../../content/RegexService';

describe('Sample Rules', () => {
	let titleService;

	beforeEach(() => {
		document.body.innerHTML = '';
		const regexService = new RegexService();
		titleService = new TitleService(regexService);
	});

	// Helper function to match the old processTitle API
	const processTitle = (url, title, rule) => {
		return titleService.processTitle(url, title, rule);
	};

	describe('Gmail Rule', () => {
		it('should preserve title for Gmail', () => {
			const rule = {
				tab: {
					title: '{title}',
					icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNFQTQzMzUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNNCA0aDE2YzEuMSAwIDIgLjkgMiAydjEyYzAgMS4xLS45IDItMiAySDRjLTEuMSAwLTItLjktMi0yVjZjMC0xLjEuOS0yIDItMnoiLz48cG9seWxpbmUgcG9pbnRzPSIyMiw2IDEyLDEzIDIsNiIvPjwvc3ZnPg==',
					pinned: true,
					unique: true,
				},
			};

			const result = processTitle('https://mail.google.com/mail/u/0/', 'Inbox (5) - john@gmail.com', rule);
			expect(result).toBe('Inbox (5) - john@gmail.com');
		});
	});

	describe('YouTube Rule', () => {
		it('should preserve title for YouTube', () => {
			const rule = {
				tab: {
					title: '{title}',
					muted: true,
				},
			};

			const result = processTitle(
				'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
				'Rick Astley - Never Gonna Give You Up',
				rule
			);
			expect(result).toBe('Rick Astley - Never Gonna Give You Up');
		});
	});

	describe('Google Drive Rule', () => {
		it('should add [Drive] prefix', () => {
			const rule = {
				tab: {
					title: '[Drive] {title}',
					protected: true,
				},
			};

			const result = processTitle(
				'https://drive.google.com/drive/my-drive',
				'My Drive - Google Drive',
				rule
			);
			expect(result).toBe('[Drive] My Drive - Google Drive');
		});
	});

	describe('Google Services Rule', () => {
		it('should match Google Docs', () => {
			const rule = {
				tab: {
					title: '{title}',
				},
			};

			const result = processTitle(
				'https://docs.google.com/document/d/123/edit',
				'Project Plan - Google Docs',
				rule
			);
			expect(result).toBe('Project Plan - Google Docs');
		});

		it('should match Google Sheets', () => {
			const rule = {
				tab: {
					title: '{title}',
				},
			};

			const result = processTitle(
				'https://sheets.google.com/spreadsheets/d/456/edit',
				'Budget 2024 - Google Sheets',
				rule
			);
			expect(result).toBe('Budget 2024 - Google Sheets');
		});

		it('should match Google Slides', () => {
			const rule = {
				tab: {
					title: '{title}',
				},
			};

			const result = processTitle(
				'https://slides.google.com/presentation/d/789/edit',
				'Q4 Presentation - Google Slides',
				rule
			);
			expect(result).toBe('Q4 Presentation - Google Slides');
		});
	});

	describe('Google Calendar Rule', () => {
		it('should rename to Calendar', () => {
			const rule = {
				tab: {
					title: 'Calendar',
					pinned: true,
					protected: true,
					unique: true,
				},
			};

			const result = processTitle(
				'https://calendar.google.com/calendar',
				'Google Calendar - Week of January 1, 2024',
				rule
			);
			expect(result).toBe('Calendar');
		});
	});

	describe('Google Meet Rule', () => {
		it('should add [Meet] prefix', () => {
			const rule = {
				tab: {
					title: '[Meet] {title}',
				},
			};

			const result = processTitle(
				'https://meet.google.com/abc-defg-hij',
				'Team Standup',
				rule
			);
			expect(result).toBe('[Meet] Team Standup');
		});
	});

	describe('Wikipedia Articles Rule', () => {
		it('should extract article name with normal dash', () => {
			const rule = {
				tab: {
					title: '@1',
					title_matcher: '(.+)\\s+[—\\-]\\s+Wikip[ée]dia',
				},
			};

			const result = processTitle(
				'https://en.wikipedia.org/wiki/JavaScript',
				'JavaScript - Wikipedia',
				rule
			);
			expect(result).toBe('JavaScript');
		});

		it('should extract article name with em dash', () => {
			const rule = {
				tab: {
					title: '@1',
					title_matcher: '(.+)\\s+[—\\-]\\s+Wikip[ée]dia',
				},
			};

			const result = processTitle(
				'https://fr.wikipedia.org/wiki/Louis_Silberkleit',
				'Louis Silberkleit — Wikipédia',
				rule
			);
			expect(result).toBe('Louis Silberkleit');
		});

		it('should handle French Wikipedia with accent', () => {
			const rule = {
				tab: {
					title: '@1',
					title_matcher: '(.+)\\s+[—\\-]\\s+Wikip[ée]dia',
				},
			};

			const result = processTitle(
				'https://fr.wikipedia.org/wiki/Paris',
				'Paris — Wikipédia',
				rule
			);
			expect(result).toBe('Paris');
		});

		it('should handle English Wikipedia', () => {
			const rule = {
				tab: {
					title: '@1',
					title_matcher: '(.+)\\s+[—\\-]\\s+Wikip[ée]dia',
				},
			};

			const result = processTitle(
				'https://en.wikipedia.org/wiki/New_York',
				'New York - Wikipedia',
				rule
			);
			expect(result).toBe('New York');
		});
	});

	describe('GitHub Issues Rule', () => {
		it('should extract issue number', () => {
			const rule = {
				tab: {
					title: 'Issue #$1',
					url_matcher: '/issues/(\\d+)',
				},
			};

			const result = processTitle(
				'https://github.com/furybee/chrome-tab-modifier/issues/123',
				'Bug: Tab not updating · Issue #123 · furybee/chrome-tab-modifier',
				rule
			);
			expect(result).toBe('Issue #123');
		});

		it('should handle different repository', () => {
			const rule = {
				tab: {
					title: 'Issue #$1',
					url_matcher: '/issues/(\\d+)',
				},
			};

			const result = processTitle(
				'https://github.com/facebook/react/issues/456',
				'Feature request: New hook · Issue #456 · facebook/react',
				rule
			);
			expect(result).toBe('Issue #456');
		});

		it('should handle issue with longer number', () => {
			const rule = {
				tab: {
					title: 'Issue #$1',
					url_matcher: '/issues/(\\d+)',
				},
			};

			const result = processTitle(
				'https://github.com/microsoft/vscode/issues/12345',
				'Performance issue · Issue #12345 · microsoft/vscode',
				rule
			);
			expect(result).toBe('Issue #12345');
		});
	});

	describe('Combined Rules Edge Cases', () => {
		it('should handle title with special characters', () => {
			const rule = {
				tab: {
					title: '{title}',
				},
			};

			const result = processTitle(
				'https://example.com',
				'Test & Demo | Special <Characters>',
				rule
			);
			expect(result).toBe('Test & Demo | Special <Characters>');
		});

		it('should handle empty title matcher captures', () => {
			const rule = {
				tab: {
					title: '@1 - Wikipedia',
					title_matcher: '(.+)\\s+[—\\-]\\s+Wikip[ée]dia',
				},
			};

			// Title that doesn't match the pattern
			const result = processTitle(
				'https://en.wikipedia.org/wiki/Test',
				'Some Other Title Format',
				rule
			);
			expect(result).toBe('- Wikipedia');
		});

		it('should handle empty url matcher captures', () => {
			const rule = {
				tab: {
					title: 'Issue #$1',
					url_matcher: '/issues/(\\d+)',
				},
			};

			// URL that doesn't match the pattern
			const result = processTitle(
				'https://github.com/user/repo',
				'Repository Home',
				rule
			);
			expect(result).toBe('Issue #');
		});

		it('should handle multiple capture groups in URL', () => {
			const rule = {
				tab: {
					title: '$2 by $1',
					url_matcher: 'github\\.com/([^/]+)/([^/]+)',
				},
			};

			const result = processTitle(
				'https://github.com/furybee/chrome-tab-modifier',
				'Original Title',
				rule
			);
			expect(result).toBe('chrome-tab-modifier by furybee');
		});

		it('should handle multiple capture groups in title', () => {
			const rule = {
				tab: {
					title: '@2 (@1)',
					title_matcher: '(.+)\\s+-\\s+(.+)',
				},
			};

			const result = processTitle(
				'https://example.com',
				'John Doe - Software Engineer',
				rule
			);
			expect(result).toBe('Software Engineer (John Doe)');
		});
	});
});
