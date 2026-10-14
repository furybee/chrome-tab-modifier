import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RuleApplicationService } from '../RuleApplicationService';
import { TitleService } from '../TitleService';
import { IconService } from '../IconService';
import { RegexService } from '../RegexService';
import type { Rule } from '../../common/types';

vi.stubGlobal('chrome', { runtime: { sendMessage: vi.fn() } });

const rule = {
	id: 'github',
	name: 'GitHub',
	detection: 'CONTAINS',
	url_fragment: 'localhost',
	is_enabled: true,
	tab: {
		title: 'GitHub - {title}',
		icon: null,
		pinned: false,
		protected: false,
		unique: false,
		muted: false,
		title_matcher: null,
		url_matcher: null,
	},
} as Rule;

// MutationObserver callbacks run as microtasks
const flushMutations = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('RuleApplicationService - title', () => {
	let service: RuleApplicationService;

	beforeEach(() => {
		document.head.innerHTML = '<title>Original</title>';
		service = new RuleApplicationService(new TitleService(new RegexService()), new IconService());
	});

	afterEach(() => {
		// One service per page in real life: stop this test's observer before resetting the DOM
		(service as unknown as { titleObserver: MutationObserver | null }).titleObserver?.disconnect();
		document.head.innerHTML = '';
	});

	it('applies the title rule on load', async () => {
		await service.applyRule(rule);

		expect(document.title).toBe('GitHub - Original');
	});

	it('reapplies the rule when the page changes the title text', async () => {
		await service.applyRule(rule);

		document.querySelector('title')!.textContent = 'Updated';
		await flushMutations();

		expect(document.title).toBe('GitHub - Updated');
	});

	it('reapplies the rule when the page replaces the <title> element (#566)', async () => {
		await service.applyRule(rule);

		// GitHub swaps the whole <title> element after load
		const newTitle = document.createElement('title');
		newTitle.textContent = 'Replaced';
		document.querySelector('title')!.replaceWith(newTitle);
		await flushMutations();

		expect(document.title).toBe('GitHub - Replaced');
	});

	it('does not loop when applying its own title', async () => {
		const processTitle = vi.spyOn(TitleService.prototype, 'processTitle');
		await service.applyRule(rule);

		document.querySelector('title')!.textContent = 'Updated';
		await flushMutations();
		await flushMutations();

		// Once on load, once for the page update; our own write must not trigger another pass
		expect(processTitle).toHaveBeenCalledTimes(2);
		processTitle.mockRestore();
	});
});
