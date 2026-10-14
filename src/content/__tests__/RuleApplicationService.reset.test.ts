import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RuleApplicationService } from '../RuleApplicationService';
import { TitleService } from '../TitleService';
import { IconService } from '../IconService';
import { RegexService } from '../RegexService';
import type { Rule } from '../../common/types';

vi.stubGlobal('chrome', { runtime: { sendMessage: vi.fn() } });

const ruleWithTitle = (title: string) =>
	({
		id: title,
		name: title,
		detection: 'CONTAINS',
		url_fragment: 'localhost',
		is_enabled: true,
		tab: {
			title,
			icon: null,
			pinned: false,
			protected: false,
			unique: false,
			muted: false,
			title_matcher: null,
			url_matcher: null,
		},
	}) as Rule;

const flushMutations = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('RuleApplicationService - reset (rule toggled off)', () => {
	let service: RuleApplicationService;

	beforeEach(() => {
		document.head.innerHTML = '<title>Original</title>';
		service = new RuleApplicationService(new TitleService(new RegexService()), new IconService());
	});

	afterEach(() => {
		service.reset();
		document.head.innerHTML = '';
	});

	it('restores the original title and stops applying the rule', async () => {
		await service.applyRule(ruleWithTitle('News - {title}'));
		expect(document.title).toBe('News - Original');

		service.reset();
		expect(document.title).toBe('Original');

		// The page changes its title afterwards: the disabled rule must not come back
		document.querySelector('title')!.textContent = 'Next article';
		await flushMutations();
		expect(document.title).toBe('Next article');
	});

	it('applies another rule on top of the original title, not the previous rule output', async () => {
		await service.applyRule(ruleWithTitle('News - {title}'));
		await service.applyRule(ruleWithTitle('Blog - {title}'));

		expect(document.title).toBe('Blog - Original');
	});

	it('does nothing when no rule was applied', () => {
		service.reset();

		expect(document.title).toBe('Original');
	});
});
