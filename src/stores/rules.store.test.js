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

	it('should maintain unique IDs and add name suffix when duplicating rules multiple times', async () => {
		const store = useRulesStore();
		_getStorageAsync.mockImplementation(() =>
			Promise.resolve({ groups: [], rules: [], settings: { theme: 'dim' } })
		);

		// Create initial rule
		const originalRule = {
			id: 'original-id',
			name: 'Original Rule',
			detection: 'CONTAINS',
			url_fragment: 'example.com',
			tab: {
				title: 'Original Title',
				icon: null,
				muted: false,
				pinned: false,
				protected: false,
				unique: false,
				group_id: null,
				title_matcher: null,
				url_matcher: null,
			},
			is_enabled: true,
		};
		store.rules = [originalRule];

		// Duplicate the rule twice
		const duplicatedRule1 = await store.duplicateRule('original-id');
		const duplicatedRule2 = await store.duplicateRule(duplicatedRule1.id);

		// Verify we have 3 rules with unique IDs
		expect(store.rules.length).toBe(3);
		expect(store.rules[0].id).toBe('original-id');
		expect(store.rules[1].id).toBe(duplicatedRule1.id);
		expect(store.rules[2].id).toBe(duplicatedRule2.id);

		// Verify all IDs are unique
		const ids = store.rules.map((r) => r.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(3);

		// Verify that names have copy suffixes to distinguish them
		expect(store.rules[0].name).toBe('Original Rule');
		expect(store.rules[1].name).toBe('Original Rule (Copy)');
		expect(store.rules[2].name).toBe('Original Rule (Copy 2)');

		// Update the first duplicated rule's title (not name)
		const updatedDuplicate1 = {
			...duplicatedRule1,
			tab: { ...duplicatedRule1.tab, title: 'Updated Title 1' },
		};
		await store.updateRule(updatedDuplicate1);

		// Update the second duplicated rule's title (not name)
		const updatedDuplicate2 = {
			...duplicatedRule2,
			tab: { ...duplicatedRule2.tab, title: 'Updated Title 2' },
		};
		await store.updateRule(updatedDuplicate2);

		// Verify that each rule was updated correctly (checking tab.title)
		expect(store.rules[0].tab.title).toBe('Original Title');
		expect(store.rules[1].tab.title).toBe('Updated Title 1');
		expect(store.rules[2].tab.title).toBe('Updated Title 2');

		// Verify the IDs haven't changed
		expect(store.rules[0].id).toBe('original-id');
		expect(store.rules[1].id).toBe(duplicatedRule1.id);
		expect(store.rules[2].id).toBe(duplicatedRule2.id);

		// Verify the names haven't changed
		expect(store.rules[0].name).toBe('Original Rule');
		expect(store.rules[1].name).toBe('Original Rule (Copy)');
		expect(store.rules[2].name).toBe('Original Rule (Copy 2)');
	});
});
