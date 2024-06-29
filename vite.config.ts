import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { crx, ManifestV3Export } from '@crxjs/vite-plugin';
import ViteRestart from 'vite-plugin-restart';
import manifest from './manifest.json' assert { type: 'json' };

export default defineConfig({
	server: {
		strictPort: true,
		port: 5173,
		hmr: {
			clientPort: 5173,
		},
		watch: {
			ignored: ['!**/_locales/**'],
		},
	},
	plugins: [
		vue(),
		ViteRestart({
			restart: ['./_locales/**/*.json'],
		}),
		crx({ manifest: manifest as unknown as ManifestV3Export }),
	],
});
