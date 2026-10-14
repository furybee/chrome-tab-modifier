import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import pluginVue from 'eslint-plugin-vue';
import tseslint from 'typescript-eslint';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default defineConfig(
	js.configs.recommended,
	tseslint.configs.recommended,
	pluginVue.configs['flat/recommended'],
	{
		// Parse <script lang="ts"> blocks in .vue files with the TypeScript parser
		files: ['**/*.vue'],
		languageOptions: {
			parserOptions: {
				parser: tseslint.parser,
			},
		},
	},
	eslintPluginPrettierRecommended,
	{
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'module',
			globals: {
				...globals.browser,
				...globals.webextensions,
			},
		},
		rules: {
			'vue/no-unused-vars': 'error',
			'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
			'@typescript-eslint/explicit-module-boundary-types': 'off',
			'@typescript-eslint/explicit-function-return-type': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
			'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
			'prettier/prettier': 'error',
		},
	},
	{
		files: ['**/*.vue'],
		rules: {
			'vue/multi-word-component-names': 'off',
		},
	}
);
