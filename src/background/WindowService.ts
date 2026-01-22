/**
 * Service responsible for window management operations
 * Single Responsibility: Handle all window-related operations
 */
export class WindowService {
	/**
	 * Merge all browser windows into the current window
	 */
	async mergeAllWindows(): Promise<void> {
		try {
			// Get all windows
			const windows = await chrome.windows.getAll({ populate: true });

			if (windows.length <= 1) {
				console.log('[Tabee] Only one window open, nothing to merge');
				return;
			}

			// Find the currently focused window or use the first normal window
			let targetWindow = windows.find((w) => w.focused);
			if (!targetWindow) {
				targetWindow = windows.find((w) => w.type === 'normal');
			}

			if (!targetWindow || !targetWindow.id) {
				console.error('[Tabee] Could not find target window for merging');
				return;
			}

			console.log(`[Tabee] Merging ${windows.length - 1} windows into window ${targetWindow.id}`);

			// Move all tabs from other windows to the target window
			for (const window of windows) {
				// Skip the target window itself
				if (window.id === targetWindow.id) continue;

				// Skip non-normal windows (popup, devtools, etc.)
				if (window.type !== 'normal') continue;

				if (window.tabs && window.tabs.length > 0) {
					const tabIds = window.tabs
						.map((tab) => tab.id)
						.filter((id): id is number => id !== undefined);

					if (tabIds.length > 0) {
						try {
							// Move tabs to target window
							await chrome.tabs.move(tabIds, {
								windowId: targetWindow.id,
								index: -1, // Append at the end
							});

							console.log(`[Tabee] Moved ${tabIds.length} tabs from window ${window.id}`);
						} catch (error) {
							console.error(`[Tabee] Error moving tabs from window ${window.id}:`, error);
						}
					}
				}
			}

			// Focus the target window
			await chrome.windows.update(targetWindow.id, { focused: true });

			console.log('[Tabee] Windows merged successfully');
		} catch (error) {
			console.error('[Tabee] Error merging windows:', error);
		}
	}
}
