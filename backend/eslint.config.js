import js from "@eslint/js";
import globals from "globals";

export default [
    js.configs.recommended,

    {
        files: ["**/*.js"],

        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.node,
                ...globals.jest,
            },
        },

        rules: {
            "no-unused-vars": "warn",
            "no-console": "off",
            semi: ["error", "always"],
            quotes: ["error", "double"],
            indent: ["error", 4],
        },
    },
];
