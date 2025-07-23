import { vi, describe, it, expect, beforeEach, beforeAll } from 'vitest';

const groupId = 123;
const windowId = 456;
const tabId = 789;
globalThis.chrome = {
	tabGroups: {
		query: vi.fn(),
		update: vi.fn(),
	},
	tabs: {
		group: vi.fn(),
		ungroup: vi.fn(),
		update: vi.fn(),
		get: vi.fn(),
		onUpdated: { addListener: vi.fn() },
		onMoved: { addListener: vi.fn() },
	},
	windows: {
		update: vi.fn(),
	},
	runtime: {
		lastError: null,
		onMessage: { addListener: vi.fn() },
	},
	contextMenus: {
		create: vi.fn(),
		remove: vi.fn(),
		onClicked: { addListener: vi.fn() },
	},
};

const mockTabModifier = {
	groups: [{ id: 'g1', title: 'Work', color: 'grey', collapsed: false, merge: true }],
	rules: [
		{
			id: 'r1',
			name: 'Work',
			detection: 'CONTAINS',
			url_fragment: 'github.com',
			tab: { group_id: 'g1' },
			is_enabled: true,
		},
	],
	settings: { theme: 'dim', enable_new_version_notification: false },
};

describe('Tab Group Merge Feature', () => {
	let applyGroupRuleToTab;

	beforeAll(async () => {
		({ applyGroupRuleToTab } = await import('./background'));
	});

	beforeEach(() => {
		vi.clearAllMocks();
		globalThis.chrome.runtime.lastError = null;
	});

	it('merges tab into existing group in another window and focuses it', async () => {
		const rule = mockTabModifier.rules[0];
		const tab = { id: tabId, groupId: -1, windowId: 999, url: 'https://github.com' };
		const tmGroup = mockTabModifier.groups[0];

		// Simulate existing group in another window
		chrome.tabGroups.query.mockImplementationOnce((query, cb) => {
			cb([{ id: groupId, title: tmGroup.title, color: tmGroup.color, windowId }]);
		});
		chrome.tabs.group.mockImplementation((opts, cb) => cb(groupId));
		chrome.tabs.update.mockResolvedValue({});
		chrome.windows.update.mockResolvedValue({});

		await applyGroupRuleToTab(rule, tab, mockTabModifier);

		expect(chrome.tabGroups.query).toHaveBeenCalled();
		expect(chrome.tabs.group).toHaveBeenCalledWith(
			{ groupId, tabIds: [tabId] },
			expect.any(Function)
		);
		expect(chrome.tabs.update).toHaveBeenCalledWith(tabId, { active: true });
		expect(chrome.windows.update).toHaveBeenCalledWith(windowId, { focused: true });
	});
});
