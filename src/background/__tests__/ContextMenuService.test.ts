import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ContextMenuService } from '../ContextMenuService';

// Mock chrome APIs
const mockChrome = {
	contextMenus: {
		create: vi.fn(),
	},
};

// @ts-ignore
global.chrome = mockChrome;

describe('ContextMenuService', () => {
	let service: ContextMenuService;

	beforeEach(() => {
		service = new ContextMenuService();
		vi.clearAllMocks();
	});

	describe('initialize', () => {
		it('should create all context menus', () => {
			service.initialize();

			expect(mockChrome.contextMenus.create).toHaveBeenCalledTimes(3);

			// Check rename tab menu
			expect(mockChrome.contextMenus.create).toHaveBeenCalledWith({
				id: 'rename-tab',
				title: '✏️ Rename Tab',
				contexts: ['all'],
			});

			// Check merge windows menu
			expect(mockChrome.contextMenus.create).toHaveBeenCalledWith({
				id: 'merge-windows',
				title: '🪟 Merge All Windows',
				contexts: ['all'],
			});

			// Check send to hive menu
			expect(mockChrome.contextMenus.create).toHaveBeenCalledWith({
				id: 'send-to-hive',
				title: '🍯 Send to Tab Hive',
				contexts: ['all'],
			});
		});

		it('should create menus in correct order', () => {
			service.initialize();

			const calls = mockChrome.contextMenus.create.mock.calls;

			expect(calls[0][0].id).toBe('rename-tab');
			expect(calls[1][0].id).toBe('merge-windows');
			expect(calls[2][0].id).toBe('send-to-hive');
		});

		it('should set all menus to "all" contexts', () => {
			service.initialize();

			const calls = mockChrome.contextMenus.create.mock.calls;

			calls.forEach((call) => {
				expect(call[0].contexts).toEqual(['all']);
			});
		});

		it('should include emojis in menu titles', () => {
			service.initialize();

			const calls = mockChrome.contextMenus.create.mock.calls;

			expect(calls[0][0].title).toContain('✏️');
			expect(calls[1][0].title).toContain('🪟');
			expect(calls[2][0].title).toContain('🍯');
		});
	});
});
