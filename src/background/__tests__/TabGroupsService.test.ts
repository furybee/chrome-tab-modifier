import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TabGroupsService } from '../TabGroupsService';

// Mock chrome APIs
const mockChrome = {
	tabs: {
		ungroup: vi.fn(),
		group: vi.fn(),
	},
	tabGroups: {
		get: vi.fn(),
		query: vi.fn(),
		update: vi.fn(),
	},
	runtime: {
		lastError: undefined,
	},
};

// @ts-ignore
global.chrome = mockChrome;

// Mock storage module
vi.mock('../../common/storage', () => ({
	_getStorageAsync: vi.fn(() =>
		Promise.resolve({
			rules: [],
			groups: [
				{
					id: 'group1',
					title: 'GitHub',
					color: 'blue',
					collapsed: false,
				},
				{
					id: 'group2',
					title: 'YouTube',
					color: 'red',
					collapsed: false,
				},
			],
			settings: {
				enable_new_version_notification: true,
				theme: 'light',
				lightweight_mode_enabled: false,
				lightweight_mode_patterns: [],
				auto_close_enabled: false,
				auto_close_timeout: 60,
			},
		})
	),
}));

import { _getStorageAsync } from '../../common/storage';

describe('TabGroupsService', () => {
	let service: TabGroupsService;

	beforeEach(() => {
		service = new TabGroupsService();
		vi.clearAllMocks();
	});

	describe('ungroupTab', () => {
		it('should not ungroup if tab has no ID', async () => {
			const tab = { url: 'https://example.com' } as chrome.tabs.Tab;
			const rule = undefined;

			await service.ungroupTab(rule, tab);

			expect(mockChrome.tabs.ungroup).not.toHaveBeenCalled();
		});

		it('should not ungroup if rule has a group', async () => {
			const tab = {
				id: 1,
				groupId: 5,
				url: 'https://example.com',
			} as chrome.tabs.Tab;
			const rule = {
				id: 'rule1',
				name: 'Test',
				detection: 'CONTAINS',
				url_fragment: 'example.com',
				tab: {
					title: 'Test',
					icon: null,
					muted: false,
					pinned: false,
					protected: false,
					unique: false,
					title_matcher: null,
					url_matcher: null,
					group_id: 'group1',
				},
				is_enabled: true,
			};

			await service.ungroupTab(rule, tab);

			expect(mockChrome.tabs.ungroup).not.toHaveBeenCalled();
		});

		it('should ungroup tab if rule has no group but tab is in a Tabee group', async () => {
			const tab = {
				id: 1,
				groupId: 5,
				url: 'https://example.com',
			} as chrome.tabs.Tab;
			const rule = {
				id: 'rule1',
				name: 'Test',
				detection: 'CONTAINS',
				url_fragment: 'example.com',
				tab: {
					title: 'Test',
					icon: null,
					muted: false,
					pinned: false,
					protected: false,
					unique: false,
					title_matcher: null,
					url_matcher: null,
					group_id: null,
				},
				is_enabled: true,
			};

			mockChrome.tabGroups.get.mockResolvedValue({
				id: 5,
				title: 'GitHub',
				color: 'blue',
			});

			await service.ungroupTab(rule, tab);

			expect(mockChrome.tabGroups.get).toHaveBeenCalledWith(5);
			expect(mockChrome.tabs.ungroup).toHaveBeenCalledWith(1);
		});

		it('should not ungroup if tab is in a non-Tabee group', async () => {
			const tab = {
				id: 1,
				groupId: 5,
				url: 'https://example.com',
			} as chrome.tabs.Tab;
			const rule = undefined;

			mockChrome.tabGroups.get.mockResolvedValue({
				id: 5,
				title: 'Some Other Group',
				color: 'grey',
			});

			await service.ungroupTab(rule, tab);

			expect(mockChrome.tabGroups.get).toHaveBeenCalledWith(5);
			expect(mockChrome.tabs.ungroup).not.toHaveBeenCalled();
		});
	});

	describe('applyGroupRuleToTab', () => {
		it('should call ungroupTab if rule has no group_id', async () => {
			const tab = {
				id: 1,
				windowId: 1,
				url: 'https://example.com',
			} as chrome.tabs.Tab;
			const rule = {
				id: 'rule1',
				name: 'Test',
				detection: 'CONTAINS',
				url_fragment: 'example.com',
				tab: {
					title: 'Test',
					icon: null,
					muted: false,
					pinned: false,
					protected: false,
					unique: false,
					title_matcher: null,
					url_matcher: null,
					group_id: null,
				},
				is_enabled: true,
			};
			const tabModifier = (await _getStorageAsync())!;

			const ungroupSpy = vi.spyOn(service, 'ungroupTab' as any);

			await service.applyGroupRuleToTab(rule, tab, tabModifier);

			expect(ungroupSpy).toHaveBeenCalledWith(rule, tab);
		});

		it('should query for existing groups and create new one if none exist', async () => {
			const tab = {
				id: 1,
				windowId: 1,
				url: 'https://github.com',
			} as chrome.tabs.Tab;
			const rule = {
				id: 'rule1',
				name: 'GitHub',
				detection: 'CONTAINS',
				url_fragment: 'github.com',
				tab: {
					title: 'GitHub',
					icon: null,
					muted: false,
					pinned: false,
					protected: false,
					unique: false,
					title_matcher: null,
					url_matcher: null,
					group_id: 'group1',
				},
				is_enabled: true,
			};
			const tabModifier = (await _getStorageAsync())!;

			// Mock query to return no groups
			mockChrome.tabGroups.query.mockImplementation((_queryInfo: any, callback: any) => {
				callback([]);
			});
			mockChrome.tabs.group.mockImplementation((_options: any, callback: any) => {
				callback(10);
			});
			mockChrome.tabGroups.update.mockImplementation(
				(_groupId: any, _props: any, callback: any) => {
					if (callback) callback();
				}
			);

			await service.applyGroupRuleToTab(rule, tab, tabModifier);

			// Wait for async operations
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(mockChrome.tabGroups.query).toHaveBeenCalledWith(
				{
					title: 'GitHub',
					color: 'blue',
					windowId: 1,
				},
				expect.any(Function)
			);
			expect(mockChrome.tabs.group).toHaveBeenCalledWith(
				{ tabIds: [1] },
				expect.any(Function)
			);
		});

		it('should add tab to existing group if one exists', async () => {
			const tab = {
				id: 1,
				windowId: 1,
				url: 'https://github.com',
			} as chrome.tabs.Tab;
			const rule = {
				id: 'rule1',
				name: 'GitHub',
				detection: 'CONTAINS',
				url_fragment: 'github.com',
				tab: {
					title: 'GitHub',
					icon: null,
					muted: false,
					pinned: false,
					protected: false,
					unique: false,
					title_matcher: null,
					url_matcher: null,
					group_id: 'group1',
				},
				is_enabled: true,
			};
			const tabModifier = (await _getStorageAsync())!;

			const existingGroup = {
				id: 5,
				title: 'GitHub',
				color: 'blue',
			};

			// Mock query to return one group
			mockChrome.tabGroups.query.mockImplementation((_queryInfo: any, callback: any) => {
				callback([existingGroup]);
			});
			mockChrome.tabs.group.mockImplementation((_options: any, callback: any) => {
				callback(5);
			});
			mockChrome.tabGroups.update.mockImplementation(
				(_groupId: any, _props: any, callback: any) => {
					if (callback) callback();
				}
			);

			await service.applyGroupRuleToTab(rule, tab, tabModifier);

			// Wait for async operations
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(mockChrome.tabs.group).toHaveBeenCalledWith(
				{ groupId: 5, tabIds: [1] },
				expect.any(Function)
			);
		});

		it('should add tab to first group when multiple duplicate groups exist', async () => {
			const tab = {
				id: 1,
				windowId: 1,
				url: 'https://github.com',
			} as chrome.tabs.Tab;
			const rule = {
				id: 'rule1',
				name: 'GitHub',
				detection: 'CONTAINS',
				url_fragment: 'github.com',
				tab: {
					title: 'GitHub',
					icon: null,
					muted: false,
					pinned: false,
					protected: false,
					unique: false,
					title_matcher: null,
					url_matcher: null,
					group_id: 'group1',
				},
				is_enabled: true,
			};
			const tabModifier = (await _getStorageAsync())!;

			const duplicateGroups = [
				{ id: 5, title: 'GitHub', color: 'blue' },
				{ id: 6, title: 'GitHub', color: 'blue' },
				{ id: 7, title: 'GitHub', color: 'blue' },
			];

			// Mock query to return multiple groups (bug scenario)
			mockChrome.tabGroups.query.mockImplementation((_queryInfo: any, callback: any) => {
				callback(duplicateGroups);
			});
			mockChrome.tabs.group.mockImplementation((_options: any, callback: any) => {
				callback(5);
			});
			mockChrome.tabGroups.update.mockImplementation(
				(_groupId: any, _props: any, callback: any) => {
					if (callback) callback();
				}
			);

			await service.applyGroupRuleToTab(rule, tab, tabModifier);

			// Wait for async operations
			await new Promise((resolve) => setTimeout(resolve, 10));

			// Should use the first group (id: 5) instead of creating a new one
			expect(mockChrome.tabs.group).toHaveBeenCalledWith(
				{ groupId: 5, tabIds: [1] },
				expect.any(Function)
			);
			// Should NOT create a new group
			expect(mockChrome.tabs.group).not.toHaveBeenCalledWith(
				{ tabIds: [1] },
				expect.any(Function)
			);
		});
	});

	describe('handleSetGroup', () => {
		it('should not process chrome:// URLs', async () => {
			const tab = {
				id: 1,
				url: 'chrome://extensions',
			} as chrome.tabs.Tab;
			const rule = {
				id: 'rule1',
				name: 'Test',
				detection: 'CONTAINS',
				url_fragment: 'test',
				tab: {
					title: 'Test',
					icon: null,
					muted: false,
					pinned: false,
					protected: false,
					unique: false,
					title_matcher: null,
					url_matcher: null,
					group_id: 'group1',
				},
				is_enabled: true,
			};

			await service.handleSetGroup(rule, tab);

			expect(mockChrome.tabGroups.query).not.toHaveBeenCalled();
		});
	});
});
