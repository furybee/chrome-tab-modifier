import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TitleService } from '../TitleService';
import { RegexService } from '../RegexService';
import type { Rule } from '../../common/types';

// Mock document for selector tests
const mockDocument = {
	querySelector: vi.fn(),
	querySelectorAll: vi.fn(),
};

// @ts-ignore
global.document = mockDocument as any;
// @ts-ignore
global.location = { href: 'https://example.com/page' };

describe('TitleService', () => {
	let service: TitleService;
	let regexService: RegexService;

	beforeEach(() => {
		regexService = new RegexService();
		service = new TitleService(regexService);
		vi.clearAllMocks();
	});

	describe('updateTitle', () => {
		it('should return original title if value is empty', () => {
			const result = service.updateTitle('My Title', '{selector}', '');
			expect(result).toBe('My Title');
		});

		it('should replace tag with decoded value', () => {
			const result = service.updateTitle('My {name} Page', '{name}', 'Test');
			expect(result).toBe('My Test Page');
		});

		it('should return title with empty string for unmatched $ capture groups', () => {
			const result = service.updateTitle('Title $0', '$0', '$1');
			expect(result).toBe('Title ');
		});

		it('should return title with empty string for unmatched @ capture groups', () => {
			const result = service.updateTitle('Title @0', '@0', '@1');
			expect(result).toBe('Title ');
		});

		it('should decode URI components in value', () => {
			const result = service.updateTitle('Title {tag}', '{tag}', 'Hello%20World');
			expect(result).toBe('Title Hello World');
		});
	});

	describe('getTextBySelector', () => {
		it('should return empty string if element not found', () => {
			mockDocument.querySelector.mockReturnValue(null);

			const result = service.getTextBySelector('.not-found');
			expect(result).toBe('');
		});

		it('should get text content from element', () => {
			const mockElement = {
				childNodes: [],
				textContent: 'Test Content',
			};
			mockDocument.querySelector.mockReturnValue(mockElement);

			const result = service.getTextBySelector('.content');
			expect(result).toBe('Test Content');
		});

		it('should get value from input element', () => {
			const mockInput = {
				childNodes: [{ tagName: 'input', value: 'Input Value' }],
			};
			mockDocument.querySelector.mockReturnValue(mockInput);

			const result = service.getTextBySelector('input');
			expect(result).toBe('Input Value');
		});

		it('should get selected option text from select element', () => {
			const mockSelect = {
				childNodes: [
					{
						tagName: 'select',
						selectedIndex: 1,
						options: [{ text: 'Option 1' }, { text: 'Option 2' }],
					},
				],
			};
			mockDocument.querySelector.mockReturnValue(mockSelect);

			const result = service.getTextBySelector('select');
			expect(result).toBe('Option 2');
		});

		it('should handle wildcard selectors with *', () => {
			const mockElement = {
				childNodes: [],
				textContent: 'Wildcard Content',
			};
			mockDocument.querySelectorAll.mockReturnValue([mockElement]);

			const result = service.getTextBySelector('.prefix* suffix');
			expect(result).toBe('Wildcard Content');
		});

		it('should trim the result', () => {
			const mockElement = {
				childNodes: [],
				textContent: '  Trimmed Content  ',
			};
			mockDocument.querySelector.mockReturnValue(mockElement);

			const result = service.getTextBySelector('.content');
			expect(result).toBe('Trimmed Content');
		});
	});

	describe('processTitle', () => {
		it('should return title with selector values replaced', () => {
			const mockElement = {
				childNodes: [],
				textContent: 'Example',
			};
			mockDocument.querySelector.mockReturnValue(mockElement);

			const rule: Rule = {
				id: 'test',
				name: 'Test',
				detection: 'CONTAINS',
				url_fragment: 'example.com',
				tab: {
					title: 'Page: {.heading}',
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

			const result = service.processTitle('https://example.com', 'Original Title', rule);
			expect(result).toBe('Page: Example');
		});

		it('should replace {title} with current title', () => {
			const rule: Rule = {
				id: 'test',
				name: 'Test',
				detection: 'CONTAINS',
				url_fragment: 'example.com',
				tab: {
					title: 'Modified: {title}',
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

			const result = service.processTitle('https://example.com', 'Original Title', rule);
			expect(result).toBe('Modified: Original Title');
		});

		it('should apply title_matcher regex and replace @ tags', () => {
			const rule: Rule = {
				id: 'test',
				name: 'Test',
				detection: 'CONTAINS',
				url_fragment: 'example.com',
				tab: {
					title: 'Match: @1',
					icon: null,
					muted: false,
					pinned: false,
					protected: false,
					unique: false,
					title_matcher: '([A-Z][a-z]+)',
					url_matcher: null,
				},
				is_enabled: true,
			};

			const result = service.processTitle('https://example.com', 'Hello World', rule);
			expect(result).toBe('Match: Hello');
		});

		it('should apply url_matcher regex and replace $ tags', () => {
			const rule: Rule = {
				id: 'test',
				name: 'Test',
				detection: 'CONTAINS',
				url_fragment: 'example.com',
				tab: {
					title: 'Domain: $1',
					icon: null,
					muted: false,
					pinned: false,
					protected: false,
					unique: false,
					title_matcher: null,
					url_matcher: 'https://([^/]+)',
				},
				is_enabled: true,
			};

			const result = service.processTitle('https://example.com/page', 'Title', rule);
			expect(result).toBe('Domain: example.com');
		});

		it('should remove unhandled capture groups', () => {
			const rule: Rule = {
				id: 'test',
				name: 'Test',
				detection: 'CONTAINS',
				url_fragment: 'example.com',
				tab: {
					title: 'Title $0 @1 $2',
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

			const result = service.processTitle('https://example.com', 'Original', rule);
			expect(result).toBe('Title');
		});

		it('should handle regex errors gracefully for title_matcher', () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			const rule: Rule = {
				id: 'test',
				name: 'Test',
				detection: 'CONTAINS',
				url_fragment: 'example.com',
				tab: {
					title: 'Title @0',
					icon: null,
					muted: false,
					pinned: false,
					protected: false,
					unique: false,
					title_matcher: '(?=.*)+', // Unsafe pattern
					url_matcher: null,
				},
				is_enabled: true,
			};

			const result = service.processTitle('https://example.com', 'Original', rule);
			expect(consoleSpy).toHaveBeenCalled();
			expect(result).toBe('Title');

			consoleSpy.mockRestore();
		});

		it('should handle regex errors gracefully for url_matcher', () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			const rule: Rule = {
				id: 'test',
				name: 'Test',
				detection: 'CONTAINS',
				url_fragment: 'example.com',
				tab: {
					title: 'Title $0',
					icon: null,
					muted: false,
					pinned: false,
					protected: false,
					unique: false,
					title_matcher: null,
					url_matcher: '(.+)+$', // Unsafe pattern
				},
				is_enabled: true,
			};

			const result = service.processTitle('https://example.com', 'Original', rule);
			expect(consoleSpy).toHaveBeenCalled();
			expect(result).toBe('Title');

			consoleSpy.mockRestore();
		});

		it('should transform complex pipe-separated title with regex capture groups', () => {
			// Test case: Transform "Work Item | OrgName - CSS - 45% Savings Share | Customer Name | Category | App Console"
			// To: "WI | Customer Name | OrgName - CSS - 45% Savings Share"
			const rule: Rule = {
				id: 'test',
				name: 'Test',
				detection: 'CONTAINS',
				url_fragment: 'example.com',
				tab: {
					// @0 = full match
					// @1 = first segment (Work Item)
					// @2 = second segment (OrgName...)
					// @3 = third segment (Customer Name)
					// @4 = fourth segment (Category)
					// @5 = fifth segment (App Console)
					title: 'WI | @3| @2',
					icon: null,
					muted: false,
					pinned: false,
					protected: false,
					unique: false,
					// Regex to capture segments separated by " | "
					// Each ([^|]+) captures text that is not a pipe character (will include surrounding whitespace)
					title_matcher:
						'([^|]+)\\s*\\|\\s*([^|]+)\\s*\\|\\s*([^|]+)\\s*\\|\\s*([^|]+)\\s*\\|\\s*([^|]+)',
					url_matcher: null,
				},
				is_enabled: true,
			};

			const originalTitle =
				'Work Item | OrgName - CSS - 45% Savings Share | Customer Name | Category | App Console';
			const result = service.processTitle('https://example.com', originalTitle, rule);

			// The regex captures groups with surrounding whitespace, but they are trimmed during replacement
			expect(result).toBe('WI | Customer Name | OrgName - CSS - 45% Savings Share');
		});
	});
});
