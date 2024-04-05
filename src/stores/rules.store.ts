import { defineStore } from 'pinia';
import { Group, Rule, Settings, TabModifierSettings } from '../common/types.ts';
import { _clone } from '../common/helpers.ts';
import {
	_clearStorage,
	_getDefaultTabModifierSettings,
	_getStorageAsync,
	_setStorage,
} from '../common/storage.ts';

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
				const tabModifier = await _getStorageAsync();

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
		async setConfig(config: TabModifierSettings) {
			try {
				await _setStorage(config);

				await this.init();
			} catch (error) {
				console.error('Failed to set config:', error);
			}
		},
		async mergeConfig(config: TabModifierSettings) {
			try {
				const tabModifier = await _getStorageAsync();

				if (!tabModifier) {
					await this.setConfig(config);

					return;
				}

				if (config.rules.length > 0) {
					tabModifier.rules.push(...config.rules);
				}

				if (config.groups.length > 0) {
					tabModifier.groups.push(...config.groups);
				}

				await _setStorage(tabModifier);

				await this.init();
			} catch (error) {
				console.error('Failed to set config:', error);
			}
		},
		async getConfig(): Promise<TabModifierSettings | undefined> {
			try {
				return await _getStorageAsync();
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
		async duplicateRule(index: number): Promise<Rule> {
			const rule = _clone(this.rules[index]);

			this.rules.push(rule);

			await this.save();

			return rule;
		},
		async save() {
			try {
				let tabModifier = await _getStorageAsync();

				if (!tabModifier) {
					tabModifier = _getDefaultTabModifierSettings();
				} else {
					tabModifier.rules = this.rules;
					tabModifier.groups = this.groups;
					tabModifier.settings = this.settings;
				}

				await _setStorage(tabModifier);
			} catch (error) {
				console.error('Failed to save:', error);
			}
		},
		async deleteAllRules() {
			await _clearStorage();

			await this.save();
		},
		async addRule(rule: Rule) {
			try {
				let tabModifier = await _getStorageAsync();

				if (!tabModifier) {
					tabModifier = _getDefaultTabModifierSettings();
				}

				tabModifier.rules.push(rule);

				this.rules = tabModifier.rules;

				await _setStorage(tabModifier);
			} catch (error) {
				console.error('Failed to load rules:', error);
			}
		},
		async addGroup(group: Group) {
			try {
				let tabModifier = await _getStorageAsync();

				if (!tabModifier) {
					tabModifier = _getDefaultTabModifierSettings();
				}

				group.id = Math.random().toString(36).substring(7);

				tabModifier.groups.push(group);

				this.groups = tabModifier.groups;

				await _setStorage(tabModifier);
			} catch (error) {
				console.error('Failed to load rules:', error);
			}
		},
	},
});
