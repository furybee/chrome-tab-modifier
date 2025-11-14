/**
 * UI components for Spot Search overlay
 * Handles DOM creation and interaction
 */

import type { SpotSearchTab, SpotSearchBookmark } from '../background/SpotSearchService';
import { debugLog } from './debugLog';

export enum ItemType {
	TAB = 'tab',
	BOOKMARK = 'bookmark',
}

export class SpotSearchUI {
	private overlay: HTMLDivElement | null = null;
	private container: HTMLDivElement | null = null;
	private searchInput: HTMLInputElement | null = null;
	private resultsContainer: HTMLDivElement | null = null;
	private currentIndex: number = -1;
	private isVisible: boolean = false;

	/**
	 * Initialize the UI components
	 */
	init(): void {
		debugLog('[SpotSearchUI] 🔍 Init called');
		if (this.container) {
			debugLog('[SpotSearchUI] ℹ️ Already initialized');
			return; // Already initialized
		}

		debugLog('[SpotSearchUI] 🔍 Creating components...');
		this.createOverlay();
		this.createContainer();
		this.createSearchInput();
		this.createResultsContainer();

		if (!this.container || !this.searchInput || !this.resultsContainer) {
			throw new Error('Failed to create spot search components');
		}

		// Assign to local constants for proper type narrowing
		const container: HTMLDivElement = this.container;
		const searchInput: HTMLInputElement = this.searchInput;
		const resultsContainer: HTMLDivElement = this.resultsContainer;

		container.appendChild(searchInput);
		container.appendChild(resultsContainer);
		document.body.appendChild(container);

		this.injectStyles();
		debugLog('[SpotSearchUI] ✅ Components created and injected');
	}

	/**
	 * Toggle visibility of the spot search
	 */
	toggle(): void {
		debugLog('[SpotSearchUI] 🔍 Toggle called, current state:', this.isVisible);
		if (!this.container || !this.overlay) {
			debugLog('[SpotSearchUI] ❌ Container or overlay not found');
			return;
		}

		if (this.isVisible) {
			debugLog('[SpotSearchUI] 🔍 Hiding...');
			this.hide();
		} else {
			debugLog('[SpotSearchUI] 🔍 Showing...');
			this.show();
		}
	}

	/**
	 * Show the spot search
	 */
	show(): void {
		debugLog('[SpotSearchUI] 🔍 Show called');
		if (!this.container || !this.overlay || !this.searchInput) {
			debugLog('[SpotSearchUI] ❌ Missing components');
			return;
		}

		this.container.style.display = 'block';
		this.overlay.style.display = 'block';
		this.searchInput.focus();
		this.isVisible = true;
		debugLog('[SpotSearchUI] ✅ UI shown');

		// Trigger initial search
		this.handleSearch();
	}

	/**
	 * Hide the spot search
	 */
	hide(): void {
		if (!this.container || !this.overlay || !this.searchInput || !this.resultsContainer) return;

		this.container.style.display = 'none';
		this.overlay.style.display = 'none';
		this.searchInput.value = '';
		this.resultsContainer.innerHTML = '';
		this.currentIndex = -1;
		this.isVisible = false;
	}

	/**
	 * Display search results
	 */
	displayResults(tabs: SpotSearchTab[], bookmarks: SpotSearchBookmark[]): void {
		if (!this.resultsContainer) return;

		this.resultsContainer.innerHTML = '';
		this.currentIndex = -1;

		// Display tabs
		tabs.forEach((tab) => {
			const item = this.createResultItem(tab, ItemType.TAB);
			this.resultsContainer!.appendChild(item);
		});

		// Display bookmarks
		bookmarks.forEach((bookmark) => {
			const item = this.createResultItem(bookmark, ItemType.BOOKMARK);
			this.resultsContainer!.appendChild(item);
		});

		// Highlight first item
		this.highlightCurrentItem();
	}

	/**
	 * Create overlay element
	 */
	private createOverlay(): void {
		this.overlay = document.createElement('div');
		this.overlay.className = 'tabee-spot-overlay';
		this.overlay.addEventListener('click', () => this.hide());
		document.body.appendChild(this.overlay);
	}

	/**
	 * Create container element
	 */
	private createContainer(): void {
		this.container = document.createElement('div');
		this.container.className = 'tabee-spot-container';
	}

	/**
	 * Create search input element
	 */
	private createSearchInput(): void {
		this.searchInput = document.createElement('input');
		this.searchInput.type = 'search';
		this.searchInput.placeholder = 'Search tabs and bookmarks...';
		this.searchInput.className = 'tabee-spot-input';

		this.searchInput.addEventListener('input', () => {
			this.handleSearch();
		});

		this.searchInput.addEventListener('keydown', (event) => {
			this.handleKeyDown(event);
		});
	}

	/**
	 * Create results container element
	 */
	private createResultsContainer(): void {
		this.resultsContainer = document.createElement('div');
		this.resultsContainer.className = 'tabee-spot-results';
	}

	/**
	 * Handle search input
	 */
	private async handleSearch(): Promise<void> {
		if (!this.searchInput) return;

		const query = this.searchInput.value.trim();

		// Send message to background to search
		await chrome.runtime.sendMessage({
			action: 'spotSearch',
			query: query || undefined,
		});
	}

	/**
	 * Handle keyboard navigation
	 */
	private handleKeyDown(event: KeyboardEvent): void {
		if (!this.resultsContainer) return;

		const items = Array.from(
			this.resultsContainer.querySelectorAll('.tabee-spot-item')
		) as HTMLDivElement[];

		if (items.length === 0) return;

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			this.currentIndex = (this.currentIndex + 1) % items.length;
			this.highlightCurrentItem();
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			this.currentIndex = (this.currentIndex - 1 + items.length) % items.length;
			this.highlightCurrentItem();
		} else if (event.key === 'Enter') {
			event.preventDefault();
			if (this.currentIndex === -1 && items.length > 0) {
				this.currentIndex = 0;
			}
			if (this.currentIndex >= 0 && this.currentIndex < items.length) {
				items[this.currentIndex].click();
			}
		} else if (event.key === 'Escape') {
			event.preventDefault();
			this.hide();
		}
	}

	/**
	 * Highlight the current item
	 */
	private highlightCurrentItem(): void {
		if (!this.resultsContainer) return;

		const items = Array.from(
			this.resultsContainer.querySelectorAll('.tabee-spot-item')
		) as HTMLDivElement[];

		let selectedItem: HTMLDivElement | null = null;

		// Batch DOM writes: first update all classes
		items.forEach((item, index) => {
			if (index === this.currentIndex) {
				item.classList.add('tabee-spot-item-selected');
				selectedItem = item;
			} else {
				item.classList.remove('tabee-spot-item-selected');
			}
		});

		// Then scroll after all class updates are done
		// Use requestAnimationFrame to avoid forced reflow
		if (selectedItem) {
			requestAnimationFrame(() => {
				selectedItem?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
			});
		}
	}

	/**
	 * Create a result item element
	 */
	private createResultItem(
		item: SpotSearchTab | SpotSearchBookmark,
		type: ItemType
	): HTMLDivElement {
		const itemElement = document.createElement('div');
		itemElement.className = 'tabee-spot-item';

		// Icon
		const icon = document.createElement('div');
		icon.className = 'tabee-spot-item-icon';

		if (type === ItemType.TAB && 'favIconUrl' in item && item.favIconUrl) {
			const img = document.createElement('img');
			img.src = item.favIconUrl;
			img.width = 16;
			img.height = 16;
			icon.appendChild(img);
		} else {
			// Bookmark icon or fallback
			icon.innerHTML =
				'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>';
		}

		// Content
		const content = document.createElement('div');
		content.className = 'tabee-spot-item-content';

		// Title line
		const titleLine = document.createElement('div');
		titleLine.className = 'tabee-spot-item-title-line';

		// Group badge for tabs
		if (type === ItemType.TAB && 'groupTitle' in item && item.groupTitle) {
			const groupBadge = document.createElement('span');
			groupBadge.className = 'tabee-spot-item-group';
			groupBadge.textContent = item.groupTitle;
			if (item.groupColor) {
				groupBadge.style.backgroundColor = this.getGroupColor(item.groupColor);
			}
			titleLine.appendChild(groupBadge);
		}

		// Title
		const title = document.createElement('span');
		title.className = 'tabee-spot-item-title';
		title.textContent = item.title || 'Untitled';
		titleLine.appendChild(title);

		// URL
		const url = document.createElement('div');
		url.className = 'tabee-spot-item-url';
		url.textContent = item.url || '';

		content.appendChild(titleLine);
		content.appendChild(url);

		itemElement.appendChild(icon);
		itemElement.appendChild(content);

		// Click handler
		itemElement.addEventListener('click', async () => {
			this.hide();

			if (type === ItemType.TAB && 'id' in item && item.id && 'windowId' in item && item.windowId) {
				await chrome.runtime.sendMessage({
					action: 'spotSearchActivateTab',
					tabId: item.id,
					windowId: item.windowId,
				});
			} else if (type === ItemType.BOOKMARK && item.url) {
				await chrome.runtime.sendMessage({
					action: 'spotSearchOpenBookmark',
					url: item.url,
				});
			}
		});

		return itemElement;
	}

	/**
	 * Get Chrome tab group color
	 */
	private getGroupColor(color: string): string {
		const colors: Record<string, string> = {
			grey: '#5f6368',
			blue: '#1a73e8',
			red: '#d93025',
			yellow: '#f9ab00',
			green: '#1e8e3e',
			pink: '#d01884',
			purple: '#9334e6',
			cyan: '#007b83',
			orange: '#e8710a',
		};
		return colors[color] || colors.grey;
	}

	/**
	 * Inject CSS styles
	 */
	private injectStyles(): void {
		const style = document.createElement('style');
		style.textContent = `
			.tabee-spot-overlay {
				display: none;
				position: fixed;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				background: rgba(0, 0, 0, 0.7);
				z-index: 2147483646;
			}

			.tabee-spot-container {
				display: none;
				position: fixed;
				top: 15%;
				left: 50%;
				transform: translateX(-50%);
				width: 600px;
				max-width: 90vw;
				background: #2d3748;
				border-radius: 8px;
				box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
				z-index: 2147483647;
				overflow: hidden;
			}

			.tabee-spot-input {
				width: 100%;
				padding: 16px 20px;
				border: none;
				background: #374151;
				color: #f3f4f6;
				font-size: 16px;
				outline: none;
				box-sizing: border-box;
			}

			.tabee-spot-input::placeholder {
				color: #9ca3af;
			}

			.tabee-spot-results {
				max-height: 400px;
				overflow-y: auto;
				padding: 8px 0;
			}

			.tabee-spot-results::-webkit-scrollbar {
				width: 8px;
			}

			.tabee-spot-results::-webkit-scrollbar-track {
				background: #374151;
			}

			.tabee-spot-results::-webkit-scrollbar-thumb {
				background: #4b5563;
				border-radius: 4px;
			}

			.tabee-spot-item {
				display: flex;
				align-items: center;
				padding: 12px 20px;
				cursor: pointer;
				transition: background-color 0.2s;
			}

			.tabee-spot-item:hover,
			.tabee-spot-item-selected {
				background: #374151;
			}

			.tabee-spot-item-icon {
				flex-shrink: 0;
				width: 16px;
				height: 16px;
				margin-right: 12px;
				display: flex;
				align-items: center;
				justify-content: center;
				color: #9ca3af;
			}

			.tabee-spot-item-icon img {
				width: 16px;
				height: 16px;
				border-radius: 2px;
			}

			.tabee-spot-item-content {
				flex: 1;
				min-width: 0;
			}

			.tabee-spot-item-title-line {
				display: flex;
				align-items: center;
				gap: 8px;
				margin-bottom: 4px;
			}

			.tabee-spot-item-group {
				display: inline-block;
				padding: 2px 8px;
				border-radius: 4px;
				font-size: 11px;
				font-weight: 600;
				color: white;
				flex-shrink: 0;
			}

			.tabee-spot-item-title {
				color: #f3f4f6;
				font-size: 14px;
				font-weight: 500;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			.tabee-spot-item-url {
				color: #9ca3af;
				font-size: 12px;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
		`;
		document.head.appendChild(style);
	}
}
