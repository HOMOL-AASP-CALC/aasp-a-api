/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
    root: true,
    plugins: [
        "@typescript-eslint"
    ],
    extends: [
        "plugin:vue/vue3-essential",
        "eslint:recommended",
        '@vue/eslint-config-typescript'
    ],
    parserOptions: {
        ecmaVersion: "latest",
        tsconfigRootDir: __dirname,
        parser: "@typescript-eslint/parser",
        sourceType: "module",
    },
    rules: {
        "indent": [
            "error",
            4
        ],
    }
};
