import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TabRulesService } from '../TabRulesService';
import type { Rule } from '../../common/types';
import { _getRuleFromUrl } from '../../common/storage';

/**
 * Stateful fake of the tabs API: remove() really removes, and every call yields
 * to the event loop so that parallel handleSetUnique calls interleave like in Chrome.
 */
let openTabs: chrome.tabs.Tab[] = [];

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

const mockChrome = {
	tabs: {
		query: vi.fn((_queryInfo: any, callback: any) => {
			const snapshot = openTabs.map((t) => ({ ...t }));
			setTimeout(() => callback(snapshot), 0);
		}),
		remove: vi.fn(async (tabId: number) => {
			await tick();
			if (!openTabs.some((t) => t.id === tabId)) {
				throw new Error(`No tab with id: ${tabId}.`);
			}
			openTabs = openTabs.filter((t) => t.id !== tabId);
		}),
	},
	scripting: {
		executeScript: vi.fn(async () => {
			await tick();
			return [];
		}),
	},
	runtime: {
		lastError: undefined,
	},
};

// @ts-ignore
global.chrome = mockChrome;

vi.mock('../../common/storage', () => ({
	_getRuleFromUrl: vi.fn(),
	_getStorageAsync: vi.fn(),
	_setStorage: vi.fn(),
	_shouldSkipUrl: vi.fn(),
	_getDefaultRule: vi.fn(),
	_getDefaultTabModifierSettings: vi.fn(),
}));

const TO_PRINT = 'https://safemed.pt:2087/eurosaude/Invoices/ToPrint';

const rule = {
	id: 'smed-to-print',
	name: 'SMED | Docs por Imprimir',
	detection: 'CONTAINS',
	url_fragment: 'safemed.pt:2087/eurosaude/Invoices/ToPrint',
	tab: { unique: true, url_matcher: null },
} as unknown as Rule;

const message = { url_fragment: rule.url_fragment, rule };

const tab = (id: number, url = TO_PRINT) => ({ id, url }) as chrome.tabs.Tab;

describe('TabRulesService - unique: all duplicates and parallel calls', () => {
	let service: TabRulesService;

	beforeEach(() => {
		service = new TabRulesService();
		vi.clearAllMocks();
		vi.mocked(_getRuleFromUrl).mockImplementation(async (url: string) =>
			url.includes(rule.url_fragment) ? rule : undefined
		);
	});

	it('N pre-existing duplicates -> exactly 1 tab of the rule is left', async () => {
		openTabs = [tab(1), tab(2), tab(3), tab(4), tab(5), tab(6, 'https://mail.google.com/')];

		await service.handleSetUnique(message, tab(5));

		const left = openTabs.filter((t) => t.url === TO_PRINT);
		expect(left.map((t) => t.id)).toEqual([5]);
		// Unrelated tab untouched
		expect(openTabs.some((t) => t.id === 6)).toBe(true);
	});

	it('2 tabs loading at the same time (onUpdated url + complete + setUnique) -> exactly 1 left', async () => {
		openTabs = [tab(10), tab(11)];

		// What background.ts fires for two tabs opened at once
		await Promise.all([
			service.handleSetUnique(message, tab(10)), // onUpdated: url changed
			service.handleSetUnique(message, tab(11)), // onUpdated: url changed
			service.handleSetUnique(message, tab(10)), // onUpdated: status complete
			service.handleSetUnique(message, tab(11)), // onUpdated: status complete
			service.handleSetUnique(message, tab(10)), // content script: setUnique
			service.handleSetUnique(message, tab(11)), // content script: setUnique
		]);

		expect(openTabs.filter((t) => t.url === TO_PRINT)).toHaveLength(1);
	});

	it('2 tabs loading at the same time with url_matcher -> exactly 1 left', async () => {
		const matcherRule = {
			...rule,
			url_fragment: 'invoice-$1',
			tab: { unique: true, url_matcher: 'Invoices/(\\w+)' },
		} as unknown as Rule;
		const matcherMessage = { url_fragment: matcherRule.url_fragment, rule: matcherRule };
		openTabs = [tab(20), tab(21)];

		await Promise.all([
			service.handleSetUnique(matcherMessage, tab(20)),
			service.handleSetUnique(matcherMessage, tab(21)),
			service.handleSetUnique(matcherMessage, tab(20)),
			service.handleSetUnique(matcherMessage, tab(21)),
		]);

		expect(openTabs.filter((t) => t.url === TO_PRINT)).toHaveLength(1);
	});
});
