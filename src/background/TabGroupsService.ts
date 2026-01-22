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

	// Track tabs that are known to be in split view
	// This provides an extra layer of protection since Chrome can crash
	// if we try to group tabs that are transitioning to split view
	private splitViewTabs: Set<number> = new Set();

	/**
	 * Mark a tab as being in split view
	 */
	markTabInSplitView(tabId: number): void {
		this.splitViewTabs.add(tabId);
		console.log('[Tabee] Marked tab as split view:', tabId);
	}

	/**
	 * Mark a tab as no longer being in split view
	 */
	markTabNotInSplitView(tabId: number): void {
		this.splitViewTabs.delete(tabId);
		console.log('[Tabee] Unmarked tab from split view:', tabId);
	}

	/**
	 * Check if a tab is in split view (Chrome 140+)
	 * Tabs in split view cannot be grouped and attempting to do so crashes Chrome
	 */
	isTabInSplitView(tab: chrome.tabs.Tab): boolean {
		// Check our tracking set first (most reliable)
		if (tab.id && this.splitViewTabs.has(tab.id)) {
			return true;
		}

		// splitViewId is available in Chrome 140+
		// When a tab is in split view, splitViewId will be a positive number
		// When not in split view, it's either undefined or -1
		const splitViewId = (tab as chrome.tabs.Tab & { splitViewId?: number }).splitViewId;
		const inSplitView = splitViewId !== undefined && splitViewId !== -1;

		// If detected via splitViewId, also add to our tracking set
		if (inSplitView && tab.id) {
			this.splitViewTabs.add(tab.id);
		}

		return inSplitView;
	}

	/**
	 * Check if a tab ID is in our split view tracking set
	 */
	isTabIdInSplitView(tabId: number): boolean {
		return this.splitViewTabs.has(tabId);
	}

	/**
	 * Ungroup a tab if it doesn't have a group rule
	 */
	async ungroupTab(rule: Rule | undefined, tab: chrome.tabs.Tab): Promise<void> {
		if (!tab.id) return;

		// Skip if tab is in split view - ungrouping split view tabs can crash Chrome
		if (this.isTabInSplitView(tab)) {
			console.log('[Tabee] Skipping ungroup for tab in split view:', tab.id);
			return;
		}

		let isRuleHasGroup = false;

		if (rule && rule.tab.group_id && rule.tab.group_id !== '') {
			isRuleHasGroup = true;
		}

		if (!isRuleHasGroup && tab.groupId && tab.groupId !== -1) {
			try {
				// Check if the group is one of user's groups
				const group = await chrome.tabGroups.get(tab.groupId);

				const tabModifier = await _getStorageAsync();
				if (!tabModifier) return;

				const tmGroup = tabModifier.groups.find((g) => g.title === group.title);
				if (tmGroup) {
					// Re-check split view status before ungrouping
					const currentTab = await chrome.tabs.get(tab.id);
					if (this.isTabInSplitView(currentTab)) {
						console.log('[Tabee] Tab entered split view, skipping ungroup:', tab.id);
						return;
					}
					await chrome.tabs.ungroup(tab.id);
				}
			} catch (error) {
				console.log('[Tabee] Error in ungroupTab (tab may be in split view):', error);
			}
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

		// Skip if tab is in split view - grouping split view tabs crashes Chrome
		if (this.isTabInSplitView(tab)) {
			console.log('[Tabee] Skipping group rule for tab in split view:', tab.id);
			return;
		}

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

		// Double-check split view status (tab state could have changed)
		if (this.isTabInSplitView(tab)) {
			console.log('[Tabee] Skipping handleTabGroups for tab in split view:', tab.id);
			return;
		}

		if (groups.length === 0) {
			await this.createAndSetupGroup([tab.id], tmGroup);
		} else {
			// If one or more groups exist, use the first one
			// This prevents duplicate groups from accumulating
			const group = groups[0];
			const tabId = tab.id;

			const execute = async () => {
				// Quick check using tracking set (fastest)
				if (this.isTabIdInSplitView(tabId)) {
					console.log('[Tabee] Tab in split view (tracked), aborting group:', tabId);
					this.handleTabGroupsMaxRetries = 600;
					return;
				}

				// Re-fetch tab to check current split view status before each retry
				try {
					const currentTab = await chrome.tabs.get(tabId);
					if (this.isTabInSplitView(currentTab)) {
						console.log('[Tabee] Tab entered split view, aborting group operation:', tabId);
						this.handleTabGroupsMaxRetries = 600; // Reset retries
						return;
					}
				} catch {
					// Tab may have been closed, abort
					this.handleTabGroupsMaxRetries = 600;
					return;
				}

				// Final check before the actual API call
				if (this.isTabIdInSplitView(tabId)) {
					console.log('[Tabee] Tab entered split view just before group call:', tabId);
					this.handleTabGroupsMaxRetries = 600;
					return;
				}

				chrome.tabs.group({ groupId: group.id, tabIds: [tabId] }, (groupId: number) => {
					if (chrome.runtime.lastError) {
						const errorMsg = chrome.runtime.lastError.message || '';
						// Check if error is split view related
						if (
							errorMsg.includes('split') ||
							errorMsg.includes('Cannot group') ||
							this.isTabIdInSplitView(tabId)
						) {
							console.log('[Tabee] Split view error detected, stopping retries:', errorMsg);
							this.handleTabGroupsMaxRetries = 600;
							return;
						}
						if (this.handleTabGroupsMaxRetries > 0) {
							setTimeout(() => execute(), 100);
							this.handleTabGroupsMaxRetries--;
							return;
						}
					}
					this.handleTabGroupsMaxRetries = 600;
					this.updateTabGroup(groupId, tmGroup);
				});
			};

			execute();
		}
	}

	/**
	 * Create and setup a new tab group
	 */
	private async createAndSetupGroup(tabIds: number[], tmGroup: Group): Promise<void> {
		const tabId = tabIds[0]; // We only ever pass one tab

		const execute = async () => {
			// Quick check using tracking set (fastest)
			if (this.isTabIdInSplitView(tabId)) {
				console.log('[Tabee] Tab in split view (tracked), aborting createGroup:', tabId);
				this.createAndSetupGroupMaxRetries = 600;
				return;
			}

			// Re-fetch tab to check current split view status before each retry
			try {
				const currentTab = await chrome.tabs.get(tabId);
				if (this.isTabInSplitView(currentTab)) {
					console.log(
						'[Tabee] Tab entered split view, aborting createAndSetupGroup:',
						tabId
					);
					this.createAndSetupGroupMaxRetries = 600; // Reset retries
					return;
				}
			} catch {
				// Tab may have been closed, abort
				this.createAndSetupGroupMaxRetries = 600;
				return;
			}

			// Final check before the actual API call
			if (this.isTabIdInSplitView(tabId)) {
				console.log('[Tabee] Tab entered split view just before createGroup call:', tabId);
				this.createAndSetupGroupMaxRetries = 600;
				return;
			}

			chrome.tabs.group({ tabIds: tabIds }, (groupId: number) => {
				if (chrome.runtime.lastError) {
					const errorMsg = chrome.runtime.lastError.message || '';
					// Check if error is split view related
					if (
						errorMsg.includes('split') ||
						errorMsg.includes('Cannot group') ||
						this.isTabIdInSplitView(tabId)
					) {
						console.log(
							'[Tabee] Split view error in createGroup, stopping retries:',
							errorMsg
						);
						this.createAndSetupGroupMaxRetries = 600;
						return;
					}
					if (this.createAndSetupGroupMaxRetries > 0) {
						setTimeout(() => execute(), 100);
						this.createAndSetupGroupMaxRetries--;
						return;
					}
				}
				this.createAndSetupGroupMaxRetries = 600;
				this.updateTabGroup(groupId, tmGroup);
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
