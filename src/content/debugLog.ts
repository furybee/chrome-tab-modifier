/**
 * Debug logging utilities for content scripts
 */

import { _getStorageAsync } from '../common/storage';

let debugModeEnabled = false;

/**
 * Initialize debug mode from storage
 */
export async function initDebugMode(): Promise<void> {
	try {
		const config = await _getStorageAsync();
		if (config?.settings?.debug_mode) {
			debugModeEnabled = true;
		}
	} catch (error) {
		// Silently fail if storage is not available
	}

	// Listen for storage changes to update debug mode in real-time
	chrome.storage.onChanged.addListener(async (changes, areaName) => {
		if (areaName === 'local' && (changes.tab_modifier_compressed || changes.tab_modifier)) {
			try {
				// Reload settings from storage to get the updated value
				const config = await _getStorageAsync();
				if (config?.settings?.debug_mode !== undefined) {
					debugModeEnabled = config.settings.debug_mode;
				}
			} catch (error) {
				// Silently fail
			}
		}
	});
}

/**
 * Conditional logging function that respects debug mode setting
 */
export function debugLog(...args: any[]) {
	if (debugModeEnabled) {
		console.log(...args);
	}
}
