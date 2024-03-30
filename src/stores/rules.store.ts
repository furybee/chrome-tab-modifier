import { defineStore } from 'pinia';
import { Group, Rule, Settings, TabModifierSettings } from '../types.ts';
import { _clone } from '../helpers.ts';

const STORAGE_KEY = 'tab_modifier';

function getStorageAsync(): Promise<TabModifierSettings | undefined> {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get(STORAGE_KEY, (items) => {
			if (chrome.runtime.lastError) {
				reject(new Error(chrome.runtime.lastError.message));
			} else {
				resolve(items[STORAGE_KEY]);
			}
		});
	});
}

const getDefaultTabModifierSettings = (): TabModifierSettings => {
	return {
		rules: [],
		groups: [],
		settings: {
			enable_new_version_notification: false,
			theme: 'dim',
		},
	};
};

export const useRulesStore = defineStore('rules', {
	state: () => {
		return {
			currentRule: undefined as Rule | undefined,
			currentIndex: undefined as number | undefined,
			currentGroup: undefined as Group | undefined,
			currentGroupIndex: undefined as number | undefined,
			rules: [] as Rule[],
			groups: [] as Group[],
			settings: { theme: 'dim' } as Settings,
		};
	},
	actions: {
		async init() {
			try {
				const tabModifier = await getStorageAsync();

				if (!tabModifier) {
					await this.save();
				} else {
					this.rules = tabModifier.rules;
					this.groups = tabModifier.groups;
					this.settings = tabModifier.settings;
				}

				await this.applyTheme(this.settings.theme);
			} catch (error) {
				console.error('Failed to load rules:', error);
			}
		},
		async getConfig(): Promise<TabModifierSettings | undefined> {
			try {
				return await getStorageAsync();
			} catch (error) {
				console.error('Failed to load config:', error);
			}
		},
		setCurrentRule(rule?: Rule, index?: number) {
			this.currentRule = _clone(rule);
			this.currentIndex = index;
		},
		setCurrentGroup(group?: Group, index?: number) {
			this.currentGroup = _clone(group);
			this.currentGroupIndex = index;
		},
		async applyTheme(theme: string) {
			this.settings.theme = theme;

			document.body.setAttribute('data-theme', this.settings.theme);

			await this.save();
		},
		async updateRule(rule: Rule) {
			if (this.currentIndex !== undefined && rule !== undefined) {
				this.rules[this.currentIndex] = _clone(rule);

				await this.save();
			} else {
				console.error('No rule or index to update');

				await Promise.reject('No rule or index to update');
			}
		},
		async updateGroup(group: Group) {
			if (this.currentGroupIndex !== undefined && group !== undefined) {
				this.groups[this.currentGroupIndex] = _clone(group);

				await this.save();
			} else {
				console.error('No group or index to update');

				await Promise.reject('No group or index to update');
			}
		},
		async deleteRule(index: number) {
			this.rules.splice(index, 1);

			await this.save();
		},
		async deleteGroup(index: number) {
			this.groups.splice(index, 1);

			await this.save();
		},
		async duplicateRule(index: number) {
			const rule = _clone(this.rules[index]);

			this.rules.push(rule);

			await this.save();
		},
		async save() {
			try {
				let tabModifier = await getStorageAsync();

				if (!tabModifier) {
					tabModifier = getDefaultTabModifierSettings();
				} else {
					tabModifier.rules = this.rules;
					tabModifier.groups = this.groups;
					tabModifier.settings = this.settings;
				}

				chrome.storage.local.set({
					tab_modifier: _clone({
						rules: tabModifier.rules,
						groups: tabModifier.groups,
						settings: tabModifier.settings,
					}),
				});
			} catch (error) {
				console.error('Failed to save:', error);
			}
		},
		async deleteAllRules() {
			chrome.storage.local.remove(STORAGE_KEY);

			await this.save();
		},
		async addRule(rule: Rule) {
			try {
				let tabModifier = await getStorageAsync();

				if (!tabModifier) {
					tabModifier = getDefaultTabModifierSettings();
				}

				tabModifier.rules.push(rule);

				this.rules = tabModifier.rules;

				chrome.storage.local.set({
					tab_modifier: _clone({
						rules: tabModifier.rules,
						groups: tabModifier.groups,
						settings: tabModifier.settings,
					}),
				});
			} catch (error) {
				console.error('Failed to load rules:', error);
			}
		},
		async addGroup(group: Group) {
			try {
				let tabModifier = await getStorageAsync();

				if (!tabModifier) {
					tabModifier = getDefaultTabModifierSettings();
				}

				group.id = Math.random().toString(36).substring(7);

				tabModifier.groups.push(group);

				this.groups = tabModifier.groups;

				chrome.storage.local.set({
					tab_modifier: _clone({
						rules: tabModifier.rules,
						groups: tabModifier.groups,
						settings: tabModifier.settings,
					}),
				});
			} catch (error) {
				console.error('Failed to load rules:', error);
			}
		},
	},
});
