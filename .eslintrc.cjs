module.exports = {
    env: {
        browser: true,
        es2021: true,
        webextensions: true,
    },
    extends: [
        'plugin:vue/vue3-recommended',
        'eslint:recommended',
        '@vue/typescript/recommended',
        'plugin:prettier/recommended',
    ],
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json',
        extraFileExtensions: ['.vue'],
    },
    plugins: [
        'vue',
        'prettier',
    ],
    rules: {
        'vue/no-unused-vars': 'error',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'prettier/prettier': 'error',
    },
    overrides: [
        {
            files: ['*.vue'],
            rules: {
                'vue/multi-word-component-names': 'off',
            },
        },
        {
            files: ['**/*.test.js', '**/*.test.ts', '**/__mocks__/**'],
            env: {
                node: true,
                'vitest-globals/env': true,
            },
            globals: {
                vi: true,
                describe: true,
                it: true,
                expect: true,
                beforeEach: true,
                afterEach: true,
            },
        },
    ],
};
