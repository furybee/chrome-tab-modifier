import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RuleShortcutService } from '../RuleShortcutService';
import { RULE_SHORTCUT_SLOTS, type Rule } from '../../common/types';
import manifest from '../../../manifest.json';

const mockChrome = {
	action: {
		setBadgeText: vi.fn(),
		setBadgeBackgroundColor: vi.fn(),
	},
	tabs: {
		query: vi.fn(),
		sendMessage: vi.fn(),
	},
	runtime: {
		sendMessage: vi.fn(),
	},
};

vi.stubGlobal('chrome', mockChrome);

vi.mock('../../common/storage', () => ({
	_getStorageAsync: vi.fn(),
	_setStorage: vi.fn(),
}));

import { _getStorageAsync, _setStorage } from '../../common/storage';

const rule = (id: string, shortcut: number | null, is_enabled: boolean) =>
	({ id, shortcut, is_enabled, tab: {} }) as unknown as Rule;

const storeWith = (rules: Rule[]) => {
	const settings = { rules, groups: [], settings: {} };
	vi.mocked(_getStorageAsync).mockResolvedValue(settings as any);
	return settings;
};

describe('RuleShortcutService', () => {
	let service: RuleShortcutService;

	beforeEach(() => {
		service = new RuleShortcutService();
		vi.mocked(_setStorage).mockResolvedValue(undefined);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('getSlotFromCommand', () => {
		it('returns the slot of toggle-rule-N commands', () => {
			expect(service.getSlotFromCommand('toggle-rule-1')).toBe(1);
			expect(service.getSlotFromCommand('toggle-rule-10')).toBe(10);
		});

		it('returns null for other commands and out-of-range slots', () => {
			expect(service.getSlotFromCommand('spot-search')).toBeNull();
			expect(service.getSlotFromCommand('toggle-rule-0')).toBeNull();
			expect(service.getSlotFromCommand('toggle-rule-11')).toBeNull();
		});

		it('matches the commands declared in manifest.json', () => {
			const slots = Object.keys(manifest.commands)
				.map((command) => service.getSlotFromCommand(command))
				.filter((slot) => slot !== null);

			expect(slots).toEqual(Array.from({ length: RULE_SHORTCUT_SLOTS }, (_, i) => i + 1));
		});
	});

	describe('toggleSlot', () => {
		it('disables all rules of the slot when one of them is enabled', async () => {
			const settings = storeWith([
				rule('news', 1, true),
				rule('blogs', 1, false),
				rule('other', 2, true),
			]);

			expect(await service.toggleSlot(1)).toBe(false);
			expect(settings.rules.map((r) => r.is_enabled)).toEqual([false, false, true]);
			expect(_setStorage).toHaveBeenCalledWith(settings);
		});

		it('enables all rules of the slot when all are disabled', async () => {
			const settings = storeWith([rule('news', 1, false), rule('blogs', 1, false)]);

			expect(await service.toggleSlot(1)).toBe(true);
			expect(settings.rules.map((r) => r.is_enabled)).toEqual([true, true]);
		});

		it('treats a rule without is_enabled as enabled', async () => {
			const settings = storeWith([{ id: 'legacy', shortcut: 3, tab: {} } as unknown as Rule]);

			expect(await service.toggleSlot(3)).toBe(false);
			expect(settings.rules[0].is_enabled).toBe(false);
		});

		it('returns null and saves nothing when no rule uses the slot', async () => {
			storeWith([rule('news', 1, true)]);

			expect(await service.toggleSlot(5)).toBeNull();
			expect(_setStorage).not.toHaveBeenCalled();
		});
	});

	describe('showFeedback', () => {
		it('shows ON / OFF / – on the badge, then clears it', async () => {
			vi.useFakeTimers();

			await service.showFeedback(true);
			expect(mockChrome.action.setBadgeText).toHaveBeenLastCalledWith({ text: 'ON' });

			await service.showFeedback(false);
			expect(mockChrome.action.setBadgeText).toHaveBeenLastCalledWith({ text: 'OFF' });

			await service.showFeedback(null);
			expect(mockChrome.action.setBadgeText).toHaveBeenLastCalledWith({ text: '–' });

			vi.advanceTimersByTime(2000);
			expect(mockChrome.action.setBadgeText).toHaveBeenLastCalledWith({ text: '' });
		});
	});

	describe('propagateChange', () => {
		it('asks every web tab to re-apply its rules, ignoring tabs without content script', async () => {
			mockChrome.runtime.sendMessage.mockResolvedValue(undefined);
			mockChrome.tabs.query.mockResolvedValue([{ id: 1 }, { id: 2 }, {}]);
			mockChrome.tabs.sendMessage
				.mockResolvedValueOnce(undefined)
				.mockRejectedValueOnce(new Error('Could not establish connection'));

			await expect(service.propagateChange()).resolves.toBeUndefined();

			expect(mockChrome.tabs.query).toHaveBeenCalledWith({ url: ['http://*/*', 'https://*/*'] });
			expect(mockChrome.tabs.sendMessage).toHaveBeenCalledTimes(2);
			expect(mockChrome.tabs.sendMessage).toHaveBeenCalledWith(1, { action: 'reapplyRules' });
		});

		it('tells an open options page to reload, and ignores it when none is open', async () => {
			mockChrome.runtime.sendMessage.mockRejectedValue(new Error('Receiving end does not exist'));
			mockChrome.tabs.query.mockResolvedValue([]);

			await expect(service.propagateChange()).resolves.toBeUndefined();

			expect(mockChrome.runtime.sendMessage).toHaveBeenCalledWith({ action: 'rulesToggled' });
		});
	});
});
