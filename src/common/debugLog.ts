/**
 * Debug logging utility — dependency-free.
 * The flag is set externally via setDebugMode() so this module
 * can be imported from anywhere without circular dependencies.
 */

let debugModeEnabled = false;

export function setDebugMode(enabled: boolean): void {
	debugModeEnabled = enabled;
}

export function isDebugMode(): boolean {
	return debugModeEnabled;
}

export function debugLog(...args: any[]): void {
	if (debugModeEnabled) {
		console.log(...args);
	}
}
