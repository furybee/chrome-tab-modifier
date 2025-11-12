import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UrlChangeDetector } from '../UrlChangeDetector';

describe('UrlChangeDetector', () => {
	let detector: UrlChangeDetector;
	let originalLocation: Location;
	let originalHistory: History;

	beforeEach(() => {
		// Save original objects
		originalLocation = window.location;
		originalHistory = window.history;

		// Mock location.href
		delete (window as any).location;
		(window as any).location = {
			href: 'https://example.com/page1',
		};

		// Mock history API
		window.history = {
			pushState: vi.fn(),
			replaceState: vi.fn(),
		} as any;

		detector = new UrlChangeDetector();
	});

	afterEach(() => {
		// Restore original objects
		(window as any).location = originalLocation;
		window.history = originalHistory;
		vi.clearAllTimers();
	});

	describe('initialization', () => {
		it('should initialize with current URL', () => {
			expect((detector as any).lastUrl).toBe('https://example.com/page1');
		});

		it('should have empty observers array', () => {
			expect((detector as any).observers).toEqual([]);
		});
	});

	describe('onChange', () => {
		it('should register a callback', () => {
			const callback = vi.fn();
			detector.onChange(callback);

			expect((detector as any).observers).toContain(callback);
		});

		it('should register multiple callbacks', () => {
			const callback1 = vi.fn();
			const callback2 = vi.fn();

			detector.onChange(callback1);
			detector.onChange(callback2);

			expect((detector as any).observers).toHaveLength(2);
		});
	});

	describe('checkUrlChange', () => {
		it('should detect URL change and notify observers', () => {
			const callback = vi.fn();
			detector.onChange(callback);

			// Change URL
			window.location.href = 'https://example.com/page2';

			// Trigger check
			(detector as any).checkUrlChange();

			expect(callback).toHaveBeenCalledWith(
				'https://example.com/page2',
				'https://example.com/page1'
			);
		});

		it('should not notify if URL has not changed', () => {
			const callback = vi.fn();
			detector.onChange(callback);

			// Trigger check without changing URL
			(detector as any).checkUrlChange();

			expect(callback).not.toHaveBeenCalled();
		});

		it('should notify all registered observers', () => {
			const callback1 = vi.fn();
			const callback2 = vi.fn();

			detector.onChange(callback1);
			detector.onChange(callback2);

			// Change URL
			window.location.href = 'https://example.com/page2';

			// Trigger check
			(detector as any).checkUrlChange();

			expect(callback1).toHaveBeenCalledOnce();
			expect(callback2).toHaveBeenCalledOnce();
		});

		it('should handle errors in callbacks gracefully', () => {
			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			const errorCallback = vi.fn(() => {
				throw new Error('Callback error');
			});
			const successCallback = vi.fn();

			detector.onChange(errorCallback);
			detector.onChange(successCallback);

			// Change URL
			window.location.href = 'https://example.com/page2';

			// Trigger check
			(detector as any).checkUrlChange();

			expect(errorCallback).toHaveBeenCalled();
			expect(successCallback).toHaveBeenCalled();
			expect(consoleSpy).toHaveBeenCalledWith(
				'[Tabee] Error in URL change callback:',
				expect.any(Error)
			);

			consoleSpy.mockRestore();
		});

		it('should update lastUrl after notifying observers', () => {
			const callback = vi.fn();
			detector.onChange(callback);

			// Change URL
			window.location.href = 'https://example.com/page2';

			// Trigger check
			(detector as any).checkUrlChange();

			expect((detector as any).lastUrl).toBe('https://example.com/page2');

			// Change URL again
			window.location.href = 'https://example.com/page3';

			// Trigger check
			(detector as any).checkUrlChange();

			expect(callback).toHaveBeenCalledWith(
				'https://example.com/page3',
				'https://example.com/page2'
			);
		});
	});

	describe('interceptHistoryAPI', () => {
		it('should intercept pushState and detect URL changes', () => {
			const callback = vi.fn();
			detector.onChange(callback);

			// Setup interception
			(detector as any).interceptHistoryAPI();

			// Simulate pushState changing the URL
			const oldHref = window.location.href;
			window.location.href = 'https://example.com/page2';
			history.pushState(null, '', '/page2');

			// Verify URL change was detected via callback
			expect(callback).toHaveBeenCalledWith('https://example.com/page2', oldHref);
		});

		it('should intercept replaceState and detect URL changes', () => {
			const callback = vi.fn();
			detector.onChange(callback);

			// Setup interception
			(detector as any).interceptHistoryAPI();

			// Simulate replaceState changing the URL
			const oldHref = window.location.href;
			window.location.href = 'https://example.com/page2';
			history.replaceState(null, '', '/page2');

			// Verify URL change was detected via callback
			expect(callback).toHaveBeenCalledWith('https://example.com/page2', oldHref);
		});
	});

	describe('start', () => {
		it('should setup all detection mechanisms', () => {
			const setupMutationObserverSpy = vi.spyOn(detector as any, 'setupMutationObserver');
			const interceptHistoryAPISpy = vi.spyOn(detector as any, 'interceptHistoryAPI');
			const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

			detector.start();

			expect(setupMutationObserverSpy).toHaveBeenCalled();
			expect(interceptHistoryAPISpy).toHaveBeenCalled();
			expect(addEventListenerSpy).toHaveBeenCalledWith('popstate', expect.any(Function));

			setupMutationObserverSpy.mockRestore();
			interceptHistoryAPISpy.mockRestore();
			addEventListenerSpy.mockRestore();
		});
	});

	describe('real-world SPA navigation', () => {
		it('should detect GitHub-style navigation', () => {
			const callback = vi.fn();
			detector.onChange(callback);

			// Initial URL: GitHub repo
			window.location.href = 'https://github.com/owner/repo';
			(detector as any).lastUrl = window.location.href;

			// Navigate to issues (SPA navigation)
			window.location.href = 'https://github.com/owner/repo/issues';
			(detector as any).checkUrlChange();

			expect(callback).toHaveBeenCalledWith(
				'https://github.com/owner/repo/issues',
				'https://github.com/owner/repo'
			);

			// Navigate to specific issue
			window.location.href = 'https://github.com/owner/repo/issues/123';
			(detector as any).checkUrlChange();

			expect(callback).toHaveBeenCalledWith(
				'https://github.com/owner/repo/issues/123',
				'https://github.com/owner/repo/issues'
			);
		});

		it('should detect navigation with query parameters', () => {
			const callback = vi.fn();
			detector.onChange(callback);

			window.location.href = 'https://example.com/page?tab=1';
			(detector as any).lastUrl = window.location.href;

			// Navigate with different query param
			window.location.href = 'https://example.com/page?tab=2';
			(detector as any).checkUrlChange();

			expect(callback).toHaveBeenCalledWith(
				'https://example.com/page?tab=2',
				'https://example.com/page?tab=1'
			);
		});

		it('should detect navigation with hash changes', () => {
			const callback = vi.fn();
			detector.onChange(callback);

			window.location.href = 'https://example.com/page#section1';
			(detector as any).lastUrl = window.location.href;

			// Navigate to different hash
			window.location.href = 'https://example.com/page#section2';
			(detector as any).checkUrlChange();

			expect(callback).toHaveBeenCalledWith(
				'https://example.com/page#section2',
				'https://example.com/page#section1'
			);
		});
	});
});
