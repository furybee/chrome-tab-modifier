/**
 * Debug logging for content scripts.
 * Re-exports the core debugLog from common/ and adds initDebugMode()
 * which reads the debug flag from Chrome storage.
 */

import { setDebugMode } from '../common/debugLog';
import { _getStorageAsync } from '../common/storage';

// Re-export so existing content-script imports keep working
export { debugLog, isDebugMode } from '../common/debugLog';

/**
 * Initialize debug mode from storage
 */
export async function initDebugMode(): Promise<void> {
	try {
		const config = await _getStorageAsync();
		if (config?.settings?.debug_mode) {
			setDebugMode(true);
		}
	} catch (error) {
		// Silently fail if storage is not available
	}

	// Listen for storage changes to update debug mode in real-time
	chrome.storage.onChanged.addListener(async (changes, areaName) => {
		if (areaName === 'local' && (changes.tab_modifier_compressed || changes.tab_modifier)) {
			try {
				const config = await _getStorageAsync();
				if (config?.settings?.debug_mode !== undefined) {
					setDebugMode(config.settings.debug_mode);
				}
			} catch (error) {
				// Silently fail
			}
		}
	});
}
