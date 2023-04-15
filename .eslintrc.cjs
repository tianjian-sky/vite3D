/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
    globals: {
        $ref: 'readonly' // 开启reactivityTransform: true后，会报错：'$ref' is not defined 
    },
    root: true,
    'extends': [
        'plugin:vue/vue3-essential',
        'eslint:recommended',
        '@vue/eslint-config-typescript',
        '@vue/eslint-config-prettier/skip-formatting'
    ],
    overrides: [
        {
            files: [
                'cypress/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}'
            ],
            'extends': [
                'plugin:cypress/recommended'
            ]
        }
    ],
    parserOptions: {
        ecmaVersion: 'latest'
    }
}
