import { describe, it, expect } from 'vitest';
import manifest from '../../../manifest.json';

describe('manifest commands', () => {
	it('gives merge-windows no default shortcut', () => {
		// Cmd+Shift+W is Chrome's "close window" on macOS: a default here merged windows by accident
		expect(manifest.commands['merge-windows']).not.toHaveProperty('suggested_key');
	});
});
