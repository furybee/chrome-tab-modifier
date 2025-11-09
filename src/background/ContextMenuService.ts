/**
 * Service responsible for managing context menus
 * Single Responsibility: Handle all context menu operations
 */
export class ContextMenuService {
	/**
	 * Initialize all context menus
	 */
	initialize(): void {
		this.createRenameTabMenu();
		this.createMergeWindowsMenu();
		this.createSendToHiveMenu();
		this.createTabHiveRejectMenus();
	}

	/**
	 * Create the "Rename Tab" context menu
	 */
	private createRenameTabMenu(): void {
		chrome.contextMenus.create({
			id: 'rename-tab',
			title: '✏️ Rename Tab',
			contexts: ['all'],
		});
	}

	/**
	 * Create the "Merge All Windows" context menu
	 */
	private createMergeWindowsMenu(): void {
		chrome.contextMenus.create({
			id: 'merge-windows',
			title: '🪟 Merge All Windows',
			contexts: ['all'],
		});
	}

	/**
	 * Create the "Send to Tab Hive" context menu
	 */
	private createSendToHiveMenu(): void {
		chrome.contextMenus.create({
			id: 'send-to-hive',
			title: '🍯 Send to Tab Hive',
			contexts: ['all'],
		});
	}

	/**
	 * Create Tab Hive reject list context menus
	 */
	private createTabHiveRejectMenus(): void {
		// Parent menu
		chrome.contextMenus.create({
			id: 'tab-hive-reject-parent',
			title: '🚫 Exclude from Tab Hive',
			contexts: ['all'],
		});

		// Child menu: Exclude domain
		chrome.contextMenus.create({
			id: 'tab-hive-reject-domain',
			parentId: 'tab-hive-reject-parent',
			title: '🌐 Exclude this domain',
			contexts: ['all'],
		});

		// Child menu: Exclude URL
		chrome.contextMenus.create({
			id: 'tab-hive-reject-url',
			parentId: 'tab-hive-reject-parent',
			title: '🔗 Exclude this URL',
			contexts: ['all'],
		});
	}
}
