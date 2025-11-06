import { _getStorageAsync } from '../common/storage';

/**
 * Interface for tab activity tracking
 */
interface TabActivity {
	tabId: number;
	lastActiveTime: number;
}

/**
 * Service responsible for Tab Hive (auto-close inactive tabs)
 * Single Responsibility: Manage tab hive operations
 */
export class TabHiveService {
	private static readonly CLOSED_TABS_STORAGE_KEY = 'closed_tabs';
	private static readonly MAX_CLOSED_TABS = 100;
	private static readonly CHECK_INTERVAL_MINUTES = 1; // Check every 1 minute
	private static readonly ALARM_NAME = 'tabee-auto-close-checker';

	private tabActivityMap = new Map<number, TabActivity>();

	/**
	 * Initialize auto-close tracking
	 */
	async initialize(): Promise<void> {
		console.log('[Tabee] 🍯 Initializing auto-close tracking...');

		const settings = await _getStorageAsync();
		if (!settings?.settings.auto_close_enabled) {
			console.log('[Tabee] Auto-close is disabled, skipping initialization');
			return;
		}

		console.log(
			`[Tabee] Auto-close enabled with timeout: ${settings.settings.auto_close_timeout} minutes`
		);

		// Get all existing tabs and mark them as active
		const tabs = await chrome.tabs.query({});
		const now = Date.now();

		console.log(`[Tabee] Tracking ${tabs.length} existing tabs`);

		for (const tab of tabs) {
			if (tab.id) {
				this.tabActivityMap.set(tab.id, {
					tabId: tab.id,
					lastActiveTime: now,
				});
			}
		}

		// Start the auto-close checker
		this.startAutoCloseChecker();
	}

	/**
	 * Update tab activity timestamp
	 */
	updateTabActivity(tabId: number): void {
		const now = Date.now();
		this.tabActivityMap.set(tabId, {
			tabId: tabId,
			lastActiveTime: now,
		});
	}

	/**
	 * Remove tab from tracking
	 */
	removeTab(tabId: number): void {
		this.tabActivityMap.delete(tabId);
	}

	/**
	 * Start the periodic checker for inactive tabs
	 * Uses chrome.alarms API which works reliably in service workers
	 */
	private async startAutoCloseChecker(): Promise<void> {
		console.log('[Tabee] 🍯 Starting auto-close checker using chrome.alarms (runs every minute)');

		// Clear existing alarm if any
		await chrome.alarms.clear(TabHiveService.ALARM_NAME);

		// Create a repeating alarm that fires every minute
		await chrome.alarms.create(TabHiveService.ALARM_NAME, {
			periodInMinutes: TabHiveService.CHECK_INTERVAL_MINUTES,
			delayInMinutes: TabHiveService.CHECK_INTERVAL_MINUTES, // First check after 1 minute
		});

		console.log('[Tabee] Auto-close checker alarm created successfully');
	}

	/**
	 * Stop the auto-close checker
	 */
	async stopAutoCloseChecker(): Promise<void> {
		console.log('[Tabee] 🍯 Auto-close disabled via settings, stopping checker...');
		await chrome.alarms.clear(TabHiveService.ALARM_NAME);
		// Clear the tracking map
		this.tabActivityMap.clear();
	}

	/**
	 * Check and close inactive tabs based on settings
	 * This method is called by the chrome.alarms listener
	 */
	async checkAndCloseInactiveTabs(): Promise<void> {
		try {
			console.log('[Tabee] 🍯 Running auto-close check...');

			const settings = await _getStorageAsync();
			if (!settings?.settings.auto_close_enabled) {
				console.log('[Tabee] Auto-close disabled, stopping checker');
				this.stopAutoCloseChecker();
				return;
			}

			const timeoutMs = settings.settings.auto_close_timeout * 60 * 1000;
			const now = Date.now();

			// Get all tabs
			const allTabs = await chrome.tabs.query({});
			console.log(
				`[Tabee] Checking ${allTabs.length} tabs (timeout: ${settings.settings.auto_close_timeout} minutes)`
			);

			let candidatesCount = 0;
			let closedCount = 0;

			for (const tab of allTabs) {
				if (!tab.id) continue;

				// Skip pinned tabs
				if (tab.pinned) {
					console.log(`[Tabee] Skipping pinned tab: ${tab.title}`);
					continue;
				}

				// Skip active tab
				if (tab.active) {
					console.log(`[Tabee] Skipping active tab: ${tab.title}`);
					continue;
				}

				// Get activity info
				const activity = this.tabActivityMap.get(tab.id);
				if (!activity) {
					// Tab not tracked yet, add it
					console.log(`[Tabee] New untracked tab found, adding to tracking: ${tab.title}`);
					this.tabActivityMap.set(tab.id, {
						tabId: tab.id,
						lastActiveTime: now,
					});
					continue;
				}

				// Check if tab is inactive for too long
				const inactiveTime = now - activity.lastActiveTime;
				const inactiveMinutes = Math.round(inactiveTime / 60000);

				if (inactiveTime >= timeoutMs) {
					candidatesCount++;
					console.log(
						`[Tabee] 🍯 Tab eligible for auto-close: "${tab.title}" (inactive for ${inactiveMinutes} minutes)`
					);

					// Save tab info before closing
					await this.saveClosedTab(tab);

					// Close the tab
					try {
						await chrome.tabs.remove(tab.id);
						closedCount++;
						console.log(
							`[Tabee] ✅ Auto-closed inactive tab: ${tab.title} (inactive for ${inactiveMinutes} minutes)`
						);
					} catch (error) {
						console.error(`[Tabee] ❌ Error closing tab ${tab.id}:`, error);
					}
				} else {
					const remainingMinutes = Math.round((timeoutMs - inactiveTime) / 60000);
					console.log(
						`[Tabee] Tab "${tab.title}" inactive for ${inactiveMinutes}min, will close in ${remainingMinutes}min`
					);
				}
			}

			console.log(
				`[Tabee] 🍯 Auto-close check complete: ${closedCount} tabs closed out of ${candidatesCount} candidates`
			);
		} catch (error) {
			console.error('[Tabee] ❌ Error in auto-close checker:', error);
		}
	}

	/**
	 * Generate a SHA-256 hash for a URL
	 */
	private async hashUrl(url: string): Promise<string> {
		const encoder = new TextEncoder();
		const data = encoder.encode(url);
		const hashBuffer = await crypto.subtle.digest('SHA-256', data);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
	}

	/**
	 * Save a closed tab to history
	 */
	async saveClosedTab(tab: chrome.tabs.Tab): Promise<void> {
		if (!tab.url || !tab.id) return;

		// Don't save chrome:// URLs
		if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
			return;
		}

		try {
			// Generate hash for the URL
			const urlHash = await this.hashUrl(tab.url);

			// Get existing closed tabs
			const result = await chrome.storage.local.get(TabHiveService.CLOSED_TABS_STORAGE_KEY);
			let closedTabs = result[TabHiveService.CLOSED_TABS_STORAGE_KEY] || [];

			// Check if this URL already exists in the hive
			const existingIndex = closedTabs.findIndex((t: any) => t.urlHash === urlHash);
			if (existingIndex !== -1) {
				console.log(`[Tabee] 🍯 Tab already in hive, updating timestamp: ${tab.title}`);
				// Update the existing entry with new timestamp and move to beginning
				const existingTab = closedTabs[existingIndex];
				closedTabs.splice(existingIndex, 1);
				closedTabs.unshift({
					...existingTab,
					title: tab.title || existingTab.title, // Update title if changed
					favIconUrl: tab.favIconUrl || existingTab.favIconUrl, // Update favicon
					closedAt: Date.now(), // Update timestamp
				});
			} else {
				// Add new tab at the beginning
				const closedTab = {
					id: crypto.randomUUID(),
					title: tab.title || 'Untitled',
					url: tab.url,
					urlHash: urlHash, // Store hash for duplicate detection
					favIconUrl: tab.favIconUrl,
					closedAt: Date.now(),
				};
				closedTabs.unshift(closedTab);
			}

			// Keep only the last MAX_CLOSED_TABS
			if (closedTabs.length > TabHiveService.MAX_CLOSED_TABS) {
				closedTabs = closedTabs.slice(0, TabHiveService.MAX_CLOSED_TABS);
			}

			// Save back to storage
			await chrome.storage.local.set({
				[TabHiveService.CLOSED_TABS_STORAGE_KEY]: closedTabs,
			});

			console.log(`[Tabee] Saved closed tab to history: ${tab.title}`);
		} catch (error) {
			console.error('[Tabee] Error saving closed tab:', error);
		}
	}

	/**
	 * Manually send a tab to the hive
	 */
	async sendTabToHive(tab: chrome.tabs.Tab): Promise<void> {
		if (!tab.id) return;

		// Save tab to hive
		await this.saveClosedTab(tab);

		// Close the tab
		try {
			await chrome.tabs.remove(tab.id);
			console.log(`[Tabee] Tab sent to hive: ${tab.title}`);
		} catch (error) {
			console.error('[Tabee] Error closing tab:', error);
		}
	}

	/**
	 * Restore a closed tab
	 */
	async restoreClosedTab(closedTabId: string): Promise<void> {
		try {
			// Get closed tabs
			const result = await chrome.storage.local.get(TabHiveService.CLOSED_TABS_STORAGE_KEY);
			const closedTabs = result[TabHiveService.CLOSED_TABS_STORAGE_KEY] || [];

			// Find the tab
			const tabIndex = closedTabs.findIndex((t: any) => t.id === closedTabId);
			if (tabIndex === -1) {
				console.error('[Tabee] Closed tab not found:', closedTabId);
				return;
			}

			const closedTab = closedTabs[tabIndex];

			// Open the tab
			await chrome.tabs.create({
				url: closedTab.url,
				active: true,
			});

			// Remove from closed tabs
			closedTabs.splice(tabIndex, 1);
			await chrome.storage.local.set({
				[TabHiveService.CLOSED_TABS_STORAGE_KEY]: closedTabs,
			});

			console.log(`[Tabee] Restored tab: ${closedTab.title}`);
		} catch (error) {
			console.error('[Tabee] Error restoring tab:', error);
		}
	}
}
