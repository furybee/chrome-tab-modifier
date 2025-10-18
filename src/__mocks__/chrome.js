import { vi } from 'vitest';

export const chrome = {
	runtime: {
		sendMessage: vi.fn(),
		onMessage: {
			addListener: vi.fn(),
		},
		getURL: vi.fn((path) => `chrome-extension://mocked-id${path}`),
		lastError: null,
	},
	storage: {
		local: {
			get: vi.fn((keys, callback) => callback({ tab_modifier: null })),
			set: vi.fn((items, callback) => callback && callback()),
			remove: vi.fn((key, callback) => callback && callback()),
		},
		sync: {
			get: vi.fn((keys, callback) => callback({ tab_modifier: null })),
			set: vi.fn((items, callback) => callback && callback()),
			remove: vi.fn((key, callback) => callback && callback()),
		},
	},
	tabs: {
		ungroup: vi.fn(),
	},
};
