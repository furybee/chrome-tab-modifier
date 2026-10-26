import { describe, it, expect } from 'vitest';
import source from './CustomSelect.vue?raw';

describe('CustomSelect', () => {
	it('keeps tabindex off the <summary> so the dropdown opens on click (#576)', () => {
		// daisyUI 5 sets pointer-events: none on a focused `.dropdown > [tabindex]:first-child`:
		// with a tabindex, the summary lost the click as soon as it got focus on mousedown
		const summaryTag = source.match(/<summary\s[^>]*>/)?.[0];

		expect(summaryTag).toBeDefined();
		expect(summaryTag).not.toMatch(/tabindex/);
	});
});
