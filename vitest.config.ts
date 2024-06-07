export default {
	test: {
		environment: 'jsdom',
		setupFiles: './vitest.setup.js',

		coverage: {
			reporter: ['text', 'json-summary', 'json'],
			reportOnFailure: true,
		}
	}
}
