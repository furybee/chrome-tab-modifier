import { defineStore } from 'pinia';
import { Group, Rule, Settings, TabModifierSettings } from '../common/types.ts';
import { _clone, _generateRandomId, _isRuleEnabled } from '../common/helpers.ts';
import {
	_clearStorage,
	_getDefaultTabModifierSettings,
	_getStorageAsync,
	_setStorage,
	_migrateLocalToSync,
	_migrateToCompressed,
} from '../common/storage.ts';

/**
 * Invisible character to append to group
 * titles to identify them as our groups.
 */
const INVISIBLE_CHAR: string = '\u200B';

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
		fixDuplicateRuleIds(rules: Rule[]) {
			const uniqueIds = new Set();

			rules = rules.map((rule) => {
				if (uniqueIds.has(rule.id)) {
					rule.id = _generateRandomId();
				}

				uniqueIds.add(rule.id);

				return rule;
			});

			return rules;
		},
		fixRuleIsEnabled(rules: Rule[]) {
			rules = rules.map((rule) => {
				if (rule.is_enabled === undefined) {
					rule.is_enabled = true;
				}

				return rule;
			});

			return rules;
		},
		handleMissingRuleSettings(rules: Rule[]): Rule[] {
			rules = rules.map((rule) => {
				if (!rule.id) {
					rule.id = _generateRandomId();
				}

				// FIX: Remove this later
				if (rule.detection === 'STARTS') {
					rule.detection = 'STARTS_WITH';
				}

				if (rule.detection === 'REGEXP') {
					rule.detection = 'REGEX';
				}

				if (rule.detection === 'ENDS') {
					rule.detection = 'ENDS_WITH';
				}

				return rule;
			});

			return rules;
		},
		async updateRulePosition(ruleId: string, position: number) {
			const index = this.getRuleIndexById(ruleId);

			if (index === -1) {
				throw new Error('Rule not found');
			}

			const rule = this.rules[index];

			this.rules.splice(index, 1);
			this.rules.splice(position, 0, rule);

			await this.save();
		},
		addMissingInvisibleChar(groups: Group[]): Group[] {
			groups = groups.map((group) => {
				if (!group.title.endsWith(INVISIBLE_CHAR)) {
					group.title = group.title + INVISIBLE_CHAR;
				}

				return group;
			});

			return groups;
		},
		fixMissingLightweightModeSettings(settings: Settings): Settings {
			// Add default values for lightweight mode if they don't exist
			if (settings.lightweight_mode_enabled === undefined) {
				settings.lightweight_mode_enabled = false;
			}
			if (settings.lightweight_mode_patterns === undefined) {
				settings.lightweight_mode_patterns = [];
			}
			if (settings.lightweight_mode_apply_to_rules === undefined) {
				settings.lightweight_mode_apply_to_rules = true;
			}
			if (settings.lightweight_mode_apply_to_tab_hive === undefined) {
				settings.lightweight_mode_apply_to_tab_hive = true;
			}
			// Add default values for auto-close if they don't exist
			if (settings.auto_close_enabled === undefined) {
				settings.auto_close_enabled = false;
			}
			if (settings.auto_close_timeout === undefined) {
				settings.auto_close_timeout = 30;
			}
			return settings;
		},
		async init() {
			try {
				// Migrate data from local to sync storage if needed
				await _migrateLocalToSync();

				// Migrate uncompressed data to compressed format
				await _migrateToCompressed();

				let tabModifier = await _getStorageAsync();

				if (!tabModifier) {
					await this.save();
				} else {
					tabModifier = await this.setConfig(tabModifier, false);

					if (!tabModifier) {
						throw new Error('Failed to set config');
					}

					// FIX: Remove this later
					tabModifier.groups = tabModifier.groups ?? [];
					tabModifier.rules = this.handleMissingRuleSettings(tabModifier.rules);
					tabModifier.rules = this.fixDuplicateRuleIds(tabModifier.rules);
					tabModifier.rules = this.fixRuleIsEnabled(tabModifier.rules);
					tabModifier.groups = this.addMissingInvisibleChar(tabModifier.groups);
					tabModifier.settings = this.fixMissingLightweightModeSettings(tabModifier.settings);

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
		async setConfig(
			config: TabModifierSettings,
			shouldInit: boolean = true
		): Promise<TabModifierSettings | undefined> {
			try {
				// FIX: Remove this later
				config.groups = config.groups ?? [];
				config.rules = this.handleMissingRuleSettings(config.rules);
				config.rules = this.fixDuplicateRuleIds(config.rules);
				config.rules = this.fixRuleIsEnabled(config.rules);
				config.groups = this.addMissingInvisibleChar(config.groups);

				const defaultConfig = _getDefaultTabModifierSettings();

				const mergedConfig = {
					...defaultConfig,
					...config,
				};

				await _setStorage(config);

				if (shouldInit) {
					await this.init();
				}

				return mergedConfig;
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

				if (config.groups && config.groups.length > 0) {
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
				if (!group.title.endsWith(INVISIBLE_CHAR)) {
					group.title = group.title + INVISIBLE_CHAR;
				}

				this.groups[index] = _clone(group);

				await this.save();
			} else {
				console.error('No group to update');

				await Promise.reject('No group to update');
			}
		},
		async deleteGroup(groupId: string) {
			const index = this.getGroupIndexById(groupId);

			this.groups.splice(index, 1);

			await this.save();
		},
		getGroupIndexById(id: string): number {
			return this.groups.findIndex((group) => group.id === id);
		},
		getRuleById(id: string): Rule | undefined {
			return this.rules.find((rule) => rule.id === id);
		},
		getRuleIndexById(id: string): number {
			return this.rules.findIndex((rule) => rule.id === id);
		},
		async deleteRule(ruleId: string) {
			const index = this.getRuleIndexById(ruleId);

			this.rules.splice(index, 1);

			await this.save();
		},
		async toggleRule(ruleId: string) {
			const index = this.getRuleIndexById(ruleId);
			const rule = this.rules[index];
			const isEnabled = _isRuleEnabled(rule);

			this.rules[index].is_enabled = !isEnabled;

			await this.save();
		},
		async duplicateRule(ruleId: string): Promise<Rule> {
			const index = this.getRuleIndexById(ruleId);

			const currentRule = this.rules[index];
			if (!currentRule) {
				throw new Error('Rule not found');
			}

			const rule = _clone(currentRule);

			rule.id = _generateRandomId();

			// Add a suffix to the rule name to distinguish it from the original
			// If the name already ends with " (Copy N)", increment N
			// Otherwise, add " (Copy)"
			const copyMatch = rule.name.match(/^(.*?)\s*\(Copy(?:\s+(\d+))?\)$/);
			if (copyMatch) {
				const baseName = copyMatch[1];
				const copyNumber = copyMatch[2] ? parseInt(copyMatch[2], 10) : 1;
				rule.name = `${baseName} (Copy ${copyNumber + 1})`;
			} else {
				rule.name = `${rule.name} (Copy)`;
			}

			this.rules.splice(index + 1, 0, rule);

			await this.save();

			return rule;
		},
		async moveUp(ruleId: string): Promise<Rule> {
			const index = this.getRuleIndexById(ruleId);

			if (index <= 0 || index >= this.rules.length) {
				throw new Error('Index out of bounds');
			}

			// Clone the current rule
			const rule = _clone(this.rules[index]);

			// Swap the current rule with the one above it
			[this.rules[index - 1], this.rules[index]] = [this.rules[index], this.rules[index - 1]];

			// Save the changes
			await this.save();

			return rule;
		},
		async moveDown(ruleId: string): Promise<Rule> {
			const index = this.getRuleIndexById(ruleId);

			if (index < 0 || index >= this.rules.length - 1) {
				throw new Error('Index out of bounds');
			}

			// Clone the current rule
			const rule = _clone(this.rules[index]);

			// Swap the current rule with the one below it
			[this.rules[index], this.rules[index + 1]] = [this.rules[index + 1], this.rules[index]];

			// Save the changes
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

				tabModifier.rules.unshift(rule);

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

				if (!group.title.endsWith(INVISIBLE_CHAR)) {
					group.title = group.title + INVISIBLE_CHAR;
				}

				tabModifier.groups.push(group);

				this.groups = tabModifier.groups;

				await _setStorage(tabModifier);
			} catch (error) {
				console.error('Failed to load rules:', error);
			}
		},
	},
});
