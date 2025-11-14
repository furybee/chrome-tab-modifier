import { debugLog } from './debugLog';

/**
 * Service responsible for detecting URL changes in Single Page Applications (SPAs)
 * SPAs use History API (pushState/replaceState) which doesn't trigger page reloads
 * or chrome.tabs.onUpdated events, so we need to detect these changes client-side
 */
export class UrlChangeDetector {
	private lastUrl: string;
	private observers: Array<(newUrl: string, oldUrl: string) => void> = [];
	private debounceTimeout: number | null = null;

	constructor() {
		this.lastUrl = location.href;
	}

	/**
	 * Start monitoring URL changes
	 */
	start(): void {
		// Monitor DOM changes that might indicate URL changes (heavily throttled)
		this.setupMutationObserver();

		// Intercept History API methods (primary detection for SPAs)
		this.interceptHistoryAPI();

		// Listen to popstate events (back/forward navigation)
		window.addEventListener('popstate', () => {
			this.checkUrlChange();
		});

		// Periodic check as fallback (catches URL changes missed by other methods)
		// 1000ms provides good coverage without excessive overhead
		setInterval(() => {
			this.checkUrlChange();
		}, 1000);
	}

	/**
	 * Register a callback to be called when URL changes
	 */
	onChange(callback: (newUrl: string, oldUrl: string) => void): void {
		this.observers.push(callback);
	}

	/**
	 * Check if URL has changed and notify observers
	 */
	private checkUrlChange(): void {
		const currentUrl = location.href;
		if (currentUrl !== this.lastUrl) {
			const oldUrl = this.lastUrl;
			this.lastUrl = currentUrl;

			debugLog('[Tabee] 🔄 URL changed (SPA navigation):', {
				from: oldUrl,
				to: currentUrl,
			});

			// Notify all observers
			this.observers.forEach((callback) => {
				try {
					callback(currentUrl, oldUrl);
				} catch (error) {
					console.error('[Tabee] Error in URL change callback:', error);
				}
			});
		}
	}

	/**
	 * Debounced version of checkUrlChange with rate limiting
	 * Prevents excessive calls during heavy DOM manipulation
	 */
	private debouncedCheckUrlChange(): void {
		// Cancel any pending check
		if (this.debounceTimeout !== null) {
			clearTimeout(this.debounceTimeout);
		}

		// Schedule the URL check with debounce
		// This means: wait 500ms of "silence" before checking
		this.debounceTimeout = setTimeout(() => {
			this.debounceTimeout = null;
			this.checkUrlChange();
		}, 500) as any; // 500ms debounce - waits for DOM changes to completely settle
	}

	/**
	 * Setup MutationObserver to detect DOM changes that might indicate navigation
	 * Uses aggressive debouncing to prevent performance issues during page loads
	 */
	private setupMutationObserver(): void {
		const observer = new MutationObserver(() => {
			// Use debouncing instead of throttling
			// This ensures we only check AFTER mutations have settled
			this.debouncedCheckUrlChange();
		});

		// Only observe the title element (most reliable SPA navigation indicator)
		// Observing less = fewer callbacks = better performance
		const titleElement = document.querySelector('title');
		if (titleElement) {
			observer.observe(titleElement, {
				childList: true,
				characterData: true,
				subtree: true,
			});
		}
	}

	/**
	 * Intercept History API methods (pushState, replaceState)
	 * to detect URL changes immediately
	 */
	private interceptHistoryAPI(): void {
		// Store original methods
		const originalPushState = history.pushState;
		const originalReplaceState = history.replaceState;

		// Override pushState
		history.pushState = (...args) => {
			// Call original method
			originalPushState.apply(history, args);
			// Check for URL change immediately (not throttled, as History API calls are infrequent)
			this.checkUrlChange();
		};

		// Override replaceState
		history.replaceState = (...args) => {
			// Call original method
			originalReplaceState.apply(history, args);
			// Check for URL change immediately (not throttled, as History API calls are infrequent)
			this.checkUrlChange();
		};
	}
}
