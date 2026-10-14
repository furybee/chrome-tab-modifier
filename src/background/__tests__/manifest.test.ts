import { describe, it, expect } from 'vitest';
import manifest from '../../../manifest.json';

describe('manifest commands', () => {
	const mergeWindowsKeys = manifest.commands['merge-windows'].suggested_key;

	it('does not take over Chrome\'s "close window" shortcut for merge-windows', () => {
		// Command+Shift+W (macOS) and Ctrl+Shift+W close the window in Chrome: merging instead was catastrophic
		Object.values(mergeWindowsKeys).forEach((key) => {
			expect(key).not.toMatch(/^(Command|Ctrl)\+Shift\+W$/);
		});
	});

	it('uses the same merge-windows shortcut on every platform', () => {
		expect(new Set(Object.values(mergeWindowsKeys))).toEqual(new Set(['Alt+Shift+W']));
	});
});
