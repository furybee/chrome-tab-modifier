import { vi } from 'vitest';

global.chrome = {
	runtime: {
		sendMessage: vi.fn(),
		onMessage: {
			addListener: vi.fn(),
		},
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
