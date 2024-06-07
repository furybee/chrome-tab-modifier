import { vi } from 'vitest';

export const chrome = {
	runtime: {
		sendMessage: vi.fn(),
		onMessage: {
			addListener: vi.fn(),
		},
		getURL: vi.fn((path) => `chrome-extension://mocked-id${path}`),
	},
	storage: {
		local: {
			get: vi.fn((keys, callback) => callback({ tab_modifier: null })),
		},
	},
	tabs: {
		ungroup: vi.fn(),
	},
};
