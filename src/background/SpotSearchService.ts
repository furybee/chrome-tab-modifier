/**
 * Service responsible for spot search functionality
 * Handles searching tabs and bookmarks
 */

export interface SpotSearchTab {
	id?: number;
	title?: string;
	url?: string;
	favIconUrl?: string;
	windowId?: number;
	groupId?: number;
	groupTitle?: string;
	groupColor?: string;
}

export interface SpotSearchBookmark {
	id: string;
	title: string;
	url?: string;
}

export interface SpotSearchResults {
	tabs: SpotSearchTab[];
	bookmarks: SpotSearchBookmark[];
}

export class SpotSearchService {
	/**
	 * Search tabs and bookmarks based on query
	 * @param query - Search query (optional)
	 * @returns Search results containing tabs and bookmarks
	 */
	async search(query?: string): Promise<SpotSearchResults> {
		const lowerQuery = query?.toLowerCase().trim();

		// Get all tabs
		const allTabs = await chrome.tabs.query({});
		const groups = await chrome.tabGroups.query({});

		// Filter and map tabs
		const tabs = allTabs
			.map((tab) => {
				let tabGroup = undefined;

				if (tab.groupId && tab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE) {
					tabGroup = groups.find((group) => group.id === tab.groupId);
				}

				return {
					id: tab.id,
					title: tab.title,
					url: tab.url,
					favIconUrl: tab.favIconUrl,
					windowId: tab.windowId,
					groupId: tab.groupId,
					groupTitle: tabGroup?.title,
					groupColor: tabGroup?.color,
				};
			})
			.filter((tab) => {
				// Filter out chrome:// URLs
				if (tab.url?.startsWith('chrome://') || tab.url?.startsWith('about:')) {
					return false;
				}

				// If no query, return all tabs
				if (!lowerQuery) {
					return true;
				}

				// Search in title, URL, and group title
				return (
					tab.title?.toLowerCase().includes(lowerQuery) ||
					tab.url?.toLowerCase().includes(lowerQuery) ||
					tab.groupTitle?.toLowerCase().includes(lowerQuery)
				);
			});

		// Search bookmarks
		let bookmarks: SpotSearchBookmark[] = [];
		if (lowerQuery) {
			const rawBookmarks = await chrome.bookmarks.search({ query: lowerQuery });
			bookmarks = rawBookmarks
				.filter((bookmark) => bookmark.url) // Only bookmarks with URLs
				.map((bookmark) => ({
					id: bookmark.id,
					title: bookmark.title,
					url: bookmark.url,
				}));
		}

		return { tabs, bookmarks };
	}

	/**
	 * Activate a specific tab
	 * @param tabId - ID of the tab to activate
	 * @param windowId - ID of the window containing the tab
	 */
	async activateTab(tabId: number, windowId: number): Promise<void> {
		await chrome.tabs.update(tabId, { active: true });
		await chrome.windows.update(windowId, { focused: true });
	}

	/**
	 * Open a bookmark in a new tab
	 * @param url - URL of the bookmark to open
	 */
	async openBookmark(url: string): Promise<void> {
		await chrome.tabs.create({ url });
	}
}
