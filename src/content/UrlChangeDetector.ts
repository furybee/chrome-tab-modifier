/**
 * Service responsible for detecting URL changes in Single Page Applications (SPAs)
 * SPAs use History API (pushState/replaceState) which doesn't trigger page reloads
 * or chrome.tabs.onUpdated events, so we need to detect these changes client-side
 */
export class UrlChangeDetector {
	private lastUrl: string;
	private observers: Array<(newUrl: string, oldUrl: string) => void> = [];

	constructor() {
		this.lastUrl = location.href;
	}

	/**
	 * Start monitoring URL changes
	 */
	start(): void {
		// Monitor DOM changes that might indicate URL changes
		this.setupMutationObserver();

		// Intercept History API methods
		this.interceptHistoryAPI();

		// Listen to popstate events (back/forward navigation)
		window.addEventListener('popstate', () => {
			this.checkUrlChange();
		});

		// Periodic check as fallback (every 500ms)
		setInterval(() => {
			this.checkUrlChange();
		}, 500);
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
	 * Setup MutationObserver to detect DOM changes that might indicate navigation
	 * This is useful for SPAs that change content when navigating
	 */
	private setupMutationObserver(): void {
		const observer = new MutationObserver(() => {
			this.checkUrlChange();
		});

		// Observe the entire document for changes
		observer.observe(document.documentElement, {
			childList: true,
			subtree: true,
		});
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
			// Check for URL change
			this.checkUrlChange();
		};

		// Override replaceState
		history.replaceState = (...args) => {
			// Call original method
			originalReplaceState.apply(history, args);
			// Check for URL change
			this.checkUrlChange();
		};
	}
}
