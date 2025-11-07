/**
 * Service responsible for detecting URL changes in Single Page Applications (SPAs)
 * SPAs use History API (pushState/replaceState) which doesn't trigger page reloads
 * or chrome.tabs.onUpdated events, so we need to detect these changes client-side
 */
export class UrlChangeDetector {
	private lastUrl: string;
	private observers: Array<(newUrl: string, oldUrl: string) => void> = [];
	private throttleTimeout: number | null = null;
	private pendingCheck: boolean = false;

	constructor() {
		this.lastUrl = location.href;
	}

	/**
	 * Start monitoring URL changes
	 */
	start(): void {
		// Monitor DOM changes that might indicate URL changes (throttled)
		this.setupMutationObserver();

		// Intercept History API methods
		this.interceptHistoryAPI();

		// Listen to popstate events (back/forward navigation)
		window.addEventListener('popstate', () => {
			this.checkUrlChange();
		});

		// Periodic check as fallback (increased to 1000ms to reduce overhead)
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

			console.log('[Tabee] 🔄 URL changed (SPA navigation):', {
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
	 * Throttled version of checkUrlChange to prevent excessive calls
	 * Uses requestIdleCallback when available to avoid blocking main thread
	 */
	private throttledCheckUrlChange(): void {
		// If a check is already scheduled, mark that another check is pending
		if (this.throttleTimeout !== null) {
			this.pendingCheck = true;
			return;
		}

		// Schedule the URL check
		const performCheck = () => {
			this.checkUrlChange();
			this.throttleTimeout = null;

			// If another check was requested during throttle, schedule it
			if (this.pendingCheck) {
				this.pendingCheck = false;
				this.throttledCheckUrlChange();
			}
		};

		// Use requestIdleCallback if available to avoid blocking main thread
		// Otherwise fall back to setTimeout with a delay
		if ('requestIdleCallback' in window) {
			this.throttleTimeout = requestIdleCallback(performCheck, { timeout: 500 }) as any;
		} else {
			this.throttleTimeout = setTimeout(performCheck, 100) as any;
		}
	}

	/**
	 * Setup MutationObserver to detect DOM changes that might indicate navigation
	 * This is useful for SPAs that change content when navigating
	 * Now uses throttling to prevent performance issues with large rule sets
	 */
	private setupMutationObserver(): void {
		const observer = new MutationObserver(() => {
			this.throttledCheckUrlChange();
		});

		// Only observe the title element and meta tags in head (most common SPA navigation indicators)
		// This dramatically reduces the number of callbacks compared to observing entire document
		const titleElement = document.querySelector('title');
		if (titleElement) {
			observer.observe(titleElement, {
				childList: true,
				characterData: true,
				subtree: true,
			});
		}

		// Also observe head for meta tag changes (some SPAs update these)
		const headElement = document.querySelector('head');
		if (headElement) {
			observer.observe(headElement, {
				childList: true,
				subtree: false, // Don't observe deep changes in head
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
