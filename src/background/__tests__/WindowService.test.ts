import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WindowService } from '../WindowService';

// Mock chrome APIs
const mockChrome = {
	windows: {
		getAll: vi.fn(),
		update: vi.fn(),
	},
	tabs: {
		move: vi.fn(),
	},
};

// @ts-ignore
global.chrome = mockChrome;

describe('WindowService', () => {
	let service: WindowService;

	beforeEach(() => {
		service = new WindowService();
		vi.clearAllMocks();
	});

	describe('mergeAllWindows', () => {
		it('should do nothing if only one window exists', async () => {
			const singleWindow = {
				id: 1,
				focused: true,
				type: 'normal' as 'normal',
				tabs: [{ id: 1 }],
			};

			mockChrome.windows.getAll.mockResolvedValue([singleWindow]);

			await service.mergeAllWindows();

			expect(mockChrome.tabs.move).not.toHaveBeenCalled();
			expect(mockChrome.windows.update).not.toHaveBeenCalled();
		});

		it('should merge multiple windows into focused window', async () => {
			const focusedWindow = {
				id: 1,
				focused: true,
				type: 'normal' as 'normal',
				tabs: [{ id: 1 }, { id: 2 }],
			};

			const otherWindow = {
				id: 2,
				focused: false,
				type: 'normal' as 'normal',
				tabs: [{ id: 3 }, { id: 4 }],
			};

			mockChrome.windows.getAll.mockResolvedValue([focusedWindow, otherWindow]);
			mockChrome.tabs.move.mockResolvedValue([]);
			mockChrome.windows.update.mockResolvedValue(focusedWindow);

			await service.mergeAllWindows();

			expect(mockChrome.tabs.move).toHaveBeenCalledWith([3, 4], {
				windowId: 1,
				index: -1,
			});
			expect(mockChrome.windows.update).toHaveBeenCalledWith(1, { focused: true });
		});

		it('should skip non-normal windows', async () => {
			const normalWindow = {
				id: 1,
				focused: true,
				type: 'normal' as 'normal',
				tabs: [{ id: 1 }],
			};

			const popupWindow = {
				id: 2,
				focused: false,
				type: 'popup' as 'popup',
				tabs: [{ id: 2 }],
			};

			mockChrome.windows.getAll.mockResolvedValue([normalWindow, popupWindow]);
			mockChrome.windows.update.mockResolvedValue(normalWindow);

			await service.mergeAllWindows();

			expect(mockChrome.tabs.move).not.toHaveBeenCalled();
			expect(mockChrome.windows.update).toHaveBeenCalledWith(1, { focused: true });
		});

		it('should use first normal window if none are focused', async () => {
			const window1 = {
				id: 1,
				focused: false,
				type: 'normal' as 'normal',
				tabs: [{ id: 1 }],
			};

			const window2 = {
				id: 2,
				focused: false,
				type: 'normal' as 'normal',
				tabs: [{ id: 2 }],
			};

			mockChrome.windows.getAll.mockResolvedValue([window1, window2]);
			mockChrome.tabs.move.mockResolvedValue([]);
			mockChrome.windows.update.mockResolvedValue(window1);

			await service.mergeAllWindows();

			expect(mockChrome.tabs.move).toHaveBeenCalledWith([2], {
				windowId: 1,
				index: -1,
			});
			expect(mockChrome.windows.update).toHaveBeenCalledWith(1, { focused: true });
		});

		it('should handle windows without tabs', async () => {
			const window1 = {
				id: 1,
				focused: true,
				type: 'normal' as 'normal',
				tabs: [{ id: 1 }],
			};

			const window2 = {
				id: 2,
				focused: false,
				type: 'normal' as 'normal',
				tabs: [],
			};

			mockChrome.windows.getAll.mockResolvedValue([window1, window2]);
			mockChrome.windows.update.mockResolvedValue(window1);

			await service.mergeAllWindows();

			expect(mockChrome.tabs.move).not.toHaveBeenCalled();
			expect(mockChrome.windows.update).toHaveBeenCalledWith(1, { focused: true });
		});

		it('should handle tabs without IDs', async () => {
			const window1 = {
				id: 1,
				focused: true,
				type: 'normal' as 'normal',
				tabs: [{ id: 1 }],
			};

			const window2 = {
				id: 2,
				focused: false,
				type: 'normal' as 'normal',
				tabs: [{ id: undefined }, { id: 2 }],
			};

			mockChrome.windows.getAll.mockResolvedValue([window1, window2]);
			mockChrome.tabs.move.mockResolvedValue([]);
			mockChrome.windows.update.mockResolvedValue(window1);

			await service.mergeAllWindows();

			// Should only move tab with ID
			expect(mockChrome.tabs.move).toHaveBeenCalledWith([2], {
				windowId: 1,
				index: -1,
			});
		});

		it('should handle errors when moving tabs', async () => {
			const window1 = {
				id: 1,
				focused: true,
				type: 'normal' as 'normal',
				tabs: [{ id: 1 }],
			};

			const window2 = {
				id: 2,
				focused: false,
				type: 'normal' as 'normal',
				tabs: [{ id: 2 }],
			};

			mockChrome.windows.getAll.mockResolvedValue([window1, window2]);
			mockChrome.tabs.move.mockRejectedValue(new Error('Failed to move tabs'));
			mockChrome.windows.update.mockResolvedValue(window1);

			// Should not throw
			await service.mergeAllWindows();

			expect(mockChrome.windows.update).toHaveBeenCalledWith(1, { focused: true });
		});
	});
});
