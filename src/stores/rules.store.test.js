import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	_getDefaultTabModifierSettings,
	_getStorageAsync,
	_setStorage,
} from '../common/storage.ts';
import { useRulesStore } from './rules.store.ts';

// Mock des fonctions asynchrones
vi.mock('../common/storage.ts');

describe('Rules Store', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		document.body.setAttribute = vi.fn();
	});

	it('should initialize the store', async () => {
		const store = useRulesStore();
		_getStorageAsync.mockImplementation(() => Promise.resolve(null));
		_getDefaultTabModifierSettings.mockImplementation(() => ({
			groups: [],
			rules: [],
			settings: { theme: 'dim' },
		}));

		await store.init();

		expect(store.groups).toEqual([]);
		expect(store.rules).toEqual([]);
		expect(store.settings).toEqual({ theme: 'dim' });
		expect(_setStorage).toHaveBeenCalled();
	});

	it('should add a new rule', async () => {
		const store = useRulesStore();
		const newRule = { id: '1', detection: 'STARTS_WITH' };
		_getStorageAsync.mockImplementation(() =>
			Promise.resolve({ groups: [], rules: [], settings: { theme: 'dim' } })
		);

		await store.addRule(newRule);

		expect(store.rules).toContainEqual(newRule);
		expect(_setStorage).toHaveBeenCalled();
	});

	it('should add a new group', async () => {
		const store = useRulesStore();
		const newGroup = { id: '1', title: 'Test Group' };
		_getStorageAsync.mockImplementation(() =>
			Promise.resolve({ groups: [], rules: [], settings: { theme: 'dim' } })
		);

		await store.addGroup(newGroup);

		expect(store.groups).toContainEqual({ ...newGroup, title: 'Test Group\u200B' });
		expect(_setStorage).toHaveBeenCalled();
	});

	it('should update an existing rule', async () => {
		const store = useRulesStore();
		const existingRule = { id: '1', detection: 'STARTS_WITH' };
		store.rules = [existingRule];
		const updatedRule = { id: '1', detection: 'ENDS_WITH' };

		await store.updateRule(updatedRule);

		expect(store.rules).toContainEqual(updatedRule);
		expect(_setStorage).toHaveBeenCalled();
	});

	it('should delete a rule', async () => {
		const store = useRulesStore();
		const ruleToDelete = { id: '1', detection: 'STARTS_WITH' };
		store.rules = [ruleToDelete];

		await store.deleteRule(0);

		expect(store.rules).not.toContain(ruleToDelete);
		expect(_setStorage).toHaveBeenCalled();
	});
});
