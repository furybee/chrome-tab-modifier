import { Group, Rule, TabModifierSettings } from '../common/types';
import { _getStorageAsync } from '../common/storage';

/**
 * Service responsible for managing tab groups
 * Single Responsibility: Handle all tab grouping operations
 */
export class TabGroupsService {
	private handleTabGroupsMaxRetries = 600;
	private createAndSetupGroupMaxRetries = 600;
	private updateTabGroupMaxRetries = 600;

	/**
	 * Ungroup a tab if it doesn't have a group rule
	 */
	async ungroupTab(rule: Rule | undefined, tab: chrome.tabs.Tab): Promise<void> {
		if (!tab.id) return;

		let isRuleHasGroup = false;

		if (rule && rule.tab.group_id && rule.tab.group_id !== '') {
			isRuleHasGroup = true;
		}

		if (!isRuleHasGroup && tab.groupId && tab.groupId !== -1) {
			// Check if the group is one of user's groups
			const group = await chrome.tabGroups.get(tab.groupId);

			const tabModifier = await _getStorageAsync();
			if (!tabModifier) return;

			const tmGroup = tabModifier.groups.find((g) => g.title === group.title);
			if (tmGroup) await chrome.tabs.ungroup(tab.id);
		}
	}

	/**
	 * Apply a group rule to a tab
	 */
	async applyGroupRuleToTab(
		rule: Rule,
		tab: chrome.tabs.Tab,
		tabModifier: TabModifierSettings
	): Promise<void> {
		if (!tab.id) return;

		// remove tab from group if it's already in one
		if (!rule || !rule.tab.group_id) {
			await this.ungroupTab(rule, tab);
			return;
		}

		const tmGroup = tabModifier.groups.find((g) => g.id === rule.tab.group_id);

		if (!tmGroup) return;

		const tabGroupsQueryInfo = {
			title: tmGroup.title,
			color: tmGroup.color as chrome.tabGroups.ColorEnum,
			windowId: tab.windowId,
		};

		chrome.tabGroups.query(tabGroupsQueryInfo, (groups: chrome.tabGroups.TabGroup[]) =>
			this.handleTabGroups(groups, tab, tmGroup)
		);
	}

	/**
	 * Handle tab groups - create or add to existing
	 */
	private async handleTabGroups(
		groups: chrome.tabGroups.TabGroup[],
		tab: chrome.tabs.Tab,
		tmGroup: Group
	): Promise<void> {
		if (!tab.id) return;

		if (groups.length === 0) {
			await this.createAndSetupGroup([tab.id], tmGroup);
		} else if (groups.length === 1) {
			const group = groups[0];

			const execute = () => {
				if (!tab.id) return;

				chrome.tabs.group({ groupId: group.id, tabIds: [tab.id] }, (groupId: number) => {
					if (chrome.runtime.lastError && this.handleTabGroupsMaxRetries > 0) {
						setTimeout(() => execute(), 100);
						this.handleTabGroupsMaxRetries--;
						return;
					} else {
						this.handleTabGroupsMaxRetries = 600;
						this.updateTabGroup(groupId, tmGroup);
					}
				});
			};

			execute();
		}
	}

	/**
	 * Create and setup a new tab group
	 */
	private async createAndSetupGroup(tabIds: number[], tmGroup: Group): Promise<void> {
		const execute = () => {
			chrome.tabs.group({ tabIds: tabIds }, (groupId: number) => {
				if (chrome.runtime.lastError && this.createAndSetupGroupMaxRetries > 0) {
					setTimeout(() => execute(), 100);
					this.createAndSetupGroupMaxRetries--;
					return;
				} else {
					this.createAndSetupGroupMaxRetries = 600;
					this.updateTabGroup(groupId, tmGroup);
				}
			});
		};

		execute();
	}

	/**
	 * Update tab group properties
	 */
	private updateTabGroup(groupId: number, tmGroup: Group): void {
		if (!groupId) return;

		const updateProperties = {
			title: tmGroup.title,
			color: tmGroup.color,
			collapsed: tmGroup.collapsed,
		} as chrome.tabGroups.UpdateProperties;

		const execute = () => {
			chrome.tabGroups.update(groupId, updateProperties, () => {
				if (chrome.runtime.lastError && this.updateTabGroupMaxRetries > 0) {
					setTimeout(() => execute(), 100);
					this.updateTabGroupMaxRetries--;
					return;
				}
			});
		};

		execute();
	}

	/**
	 * Handle setting a group from a message
	 */
	async handleSetGroup(rule: Rule, tab: chrome.tabs.Tab): Promise<void> {
		if (tab.url?.startsWith('chrome')) return;

		const tabModifier = await _getStorageAsync();
		if (tabModifier) await this.applyGroupRuleToTab(rule, tab, tabModifier);
	}
}
