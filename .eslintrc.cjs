const vueRules = [
    'vue/multi-word-component-names',
    'vue/no-async-in-computed-properties',
    'vue/no-lone-template',
    'vue/no-mutating-props',
    'vue/no-reserved-component-names',
    'vue/no-side-effects-in-computed-properties',
    'vue/no-unused-components',
    'vue/no-use-v-if-with-v-for',
    'vue/no-useless-template-attributes',
    'vue/no-v-html',
    'vue/order-in-components',
    'vue/prop-name-casing',
    'vue/require-default-prop',
    'vue/require-prop-types',
    'vue/require-render-return',
    'vue/require-v-for-key',
    'vue/return-in-computed-property',
    'vue/valid-v-bind',
    'vue/valid-v-bind-sync',
    'vue/valid-v-for',
    'vue/valid-v-slot',
];

const rules = {
    // Override some rules here (airbnb...)
    indent: ['error', 4],
    'vue/html-indent': ['error', 4],
    'vue/script-indent': ['error', 4, {
        "baseIndent": 2,
        "switchCase": 2,
        "ignores": []
    }],
    'no-continue': 'off',

    // Mark some rules as warnings
    ...Array.from(new Set([...vueRules]))
        .reduce((acc, item) => {
            acc[item] = 'warn';
            return acc;
        }, {}),
};

module.exports = {
    "env": {
        "node": true,
        "browser": true
    },
    "extends": [
        "eslint:recommended",
        // "standard-with-typescript",
        "plugin:vue/recommended",
    ],
    // "overrides": [
    //     {
    //         "env": {
    //             "node": true
    //         },
    //         "files": [
    //             ".eslintrc.{js,cjs}"
    //         ],
    //         "parserOptions": {
    //             "sourceType": "script"
    //         }
    //     }
    // ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module",
    },
    "plugins": [
        "vue"
    ],
    rules,
    settings: {
        'import/resolver': {
            alias: {
                map: [
                    ['@', './src/'],
                ],
                extensions: ['.js', '.vue'],
            },
            node: {
                extensions: ['.js', '.vue'],
            },
        },
    },
}
