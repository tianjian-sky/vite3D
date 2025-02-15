/* eslint-env node */
// import * from '@rushstack/eslint-patch/modern-module-resolution'

export default {
    globals: {
        $ref: 'readonly' // 开启reactivityTransform: true后，会报错：'$ref' is not defined 
    },
    root: true,
    extends: [
        'plugin:vue/vue3-essential',
        'eslint:recommended',
        '@vue/eslint-config-typescript',
        '@vue/eslint-config-prettier/skip-formatting',
        './.eslintrc-auto-import.json'
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
