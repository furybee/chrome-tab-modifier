import { defineStore } from 'pinia';
import { Group, Rule, Settings, TabModifierSettings } from '../common/types.ts';
import { _clone, _generateRandomId } from '../common/helpers.ts';
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
			currentGroup: undefined as Group | undefined,
			rules: [] as Rule[],
			groups: [] as Group[],
			settings: { theme: 'dim' } as Settings,
		};
	},
	actions: {
		addMissingRuleIds(rules: Rule[]) {
			rules.forEach((rule) => {
				if (!rule.id) {
					rule.id = _generateRandomId();
				}
			});
		},
		async init() {
			try {
				const tabModifier = await _getStorageAsync();

				if (!tabModifier) {
					await this.save();
				} else {
					this.addMissingRuleIds(tabModifier.rules);

					this.groups = tabModifier.groups;
					this.rules = tabModifier.rules;
					this.settings = tabModifier.settings;
				}

				await this.applyTheme(this.settings.theme);

				await this.save();
			} catch (error) {
				console.error('Failed to init:', error);
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
		setCurrentRule(rule?: Rule) {
			this.currentRule = _clone(rule);
		},
		setCurrentGroup(group?: Group) {
			this.currentGroup = _clone(group);
		},
		async applyTheme(theme: string) {
			this.settings.theme = theme;

			document.body.setAttribute('data-theme', this.settings.theme);

			await this.save();
		},
		async updateRule(rule: Rule) {
			const index = this.rules.findIndex((r) => r.id === rule.id);

			if (index !== -1) {
				this.rules[index] = _clone(rule);

				await this.save();
			} else {
				console.error('No rule to update');

				await Promise.reject('No rule to update');
			}
		},
		async updateGroup(group: Group) {
			const index = this.groups.findIndex((r) => r.id === group.id);

			if (index !== -1) {
				this.groups[index] = _clone(group);

				await this.save();
			} else {
				console.error('No group to update');

				await Promise.reject('No group to update');
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
					tabModifier.groups = this.groups;
					tabModifier.rules = this.rules;
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

				group.id = group.id ?? _generateRandomId();

				tabModifier.groups.push(group);

				this.groups = tabModifier.groups;

				await _setStorage(tabModifier);
			} catch (error) {
				console.error('Failed to load rules:', error);
			}
		},
	},
});
