import { describe, it, expect, beforeEach, vi } from 'vitest';
import { IconService } from '../IconService';

// Mock chrome runtime
const mockChrome = {
	runtime: {
		getURL: vi.fn((path: string) => `chrome-extension://mock-id${path}`),
	},
};

// @ts-ignore
global.chrome = mockChrome;

// Mock document
const mockDocument = {
	head: {
		appendChild: vi.fn(),
	},
	querySelectorAll: vi.fn(),
	createElement: vi.fn(),
};

// @ts-ignore
global.document = mockDocument as any;

describe('IconService', () => {
	let service: IconService;

	beforeEach(() => {
		service = new IconService();
		vi.clearAllMocks();
	});

	describe('processIcon', () => {
		it('should mark existing icons as old-icon', () => {
			const mockIcon1 = { setAttribute: vi.fn() };
			const mockIcon2 = { setAttribute: vi.fn() };
			mockDocument.querySelectorAll.mockReturnValue([mockIcon1, mockIcon2]);

			const mockNewIcon = {
				type: '',
				rel: '',
				href: '',
			};
			mockDocument.createElement.mockReturnValue(mockNewIcon);

			service.processIcon('icon.png');

			expect(mockIcon1.setAttribute).toHaveBeenCalledWith('rel', 'old-icon');
			expect(mockIcon2.setAttribute).toHaveBeenCalledWith('rel', 'old-icon');
		});

		it('should create new icon link element', () => {
			mockDocument.querySelectorAll.mockReturnValue([]);

			const mockNewIcon = {
				type: '',
				rel: '',
				href: '',
			};
			mockDocument.createElement.mockReturnValue(mockNewIcon);

			service.processIcon('icon.png');

			expect(mockDocument.createElement).toHaveBeenCalledWith('link');
			expect(mockNewIcon.type).toBe('image/x-icon');
			expect(mockNewIcon.rel).toBe('icon');
		});

		it('should use chrome runtime URL for asset icons', () => {
			mockDocument.querySelectorAll.mockReturnValue([]);

			const mockNewIcon = {
				type: '',
				rel: '',
				href: '',
			};
			mockDocument.createElement.mockReturnValue(mockNewIcon);

			service.processIcon('icon.png');

			expect(mockChrome.runtime.getURL).toHaveBeenCalledWith('/assets/icon.png');
			expect(mockNewIcon.href).toBe('chrome-extension://mock-id/assets/icon.png');
		});

		it('should use direct URL for http icons', () => {
			mockDocument.querySelectorAll.mockReturnValue([]);

			const mockNewIcon = {
				type: '',
				rel: '',
				href: '',
			};
			mockDocument.createElement.mockReturnValue(mockNewIcon);

			service.processIcon('http://example.com/icon.png');

			expect(mockChrome.runtime.getURL).not.toHaveBeenCalled();
			expect(mockNewIcon.href).toBe('http://example.com/icon.png');
		});

		it('should use direct URL for https icons', () => {
			mockDocument.querySelectorAll.mockReturnValue([]);

			const mockNewIcon = {
				type: '',
				rel: '',
				href: '',
			};
			mockDocument.createElement.mockReturnValue(mockNewIcon);

			service.processIcon('https://example.com/icon.png');

			expect(mockChrome.runtime.getURL).not.toHaveBeenCalled();
			expect(mockNewIcon.href).toBe('https://example.com/icon.png');
		});

		it('should use direct URL for data URIs', () => {
			mockDocument.querySelectorAll.mockReturnValue([]);

			const mockNewIcon = {
				type: '',
				rel: '',
				href: '',
			};
			mockDocument.createElement.mockReturnValue(mockNewIcon);

			const dataUri = 'data:image/png;base64,iVBORw0KGgoAAAANS';
			service.processIcon(dataUri);

			expect(mockChrome.runtime.getURL).not.toHaveBeenCalled();
			expect(mockNewIcon.href).toBe(dataUri);
		});

		it('should append new icon to document head', () => {
			mockDocument.querySelectorAll.mockReturnValue([]);

			const mockNewIcon = {
				type: '',
				rel: '',
				href: '',
			};
			mockDocument.createElement.mockReturnValue(mockNewIcon);

			service.processIcon('icon.png');

			expect(mockDocument.head.appendChild).toHaveBeenCalledWith(mockNewIcon);
		});

		it('should return true on success', () => {
			mockDocument.querySelectorAll.mockReturnValue([]);

			const mockNewIcon = {
				type: '',
				rel: '',
				href: '',
			};
			mockDocument.createElement.mockReturnValue(mockNewIcon);

			const result = service.processIcon('icon.png');

			expect(result).toBe(true);
		});
	});
});
