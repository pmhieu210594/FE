// Configuration document: https://eslint.org/

import js from "@eslint/js";
import pluginTypeScript from "@typescript-eslint/eslint-plugin";
import * as parserTypeScript from "@typescript-eslint/parser";
import configPrettier from "eslint-config-prettier";
import { defineFlatConfig } from "eslint-define-config";
import pluginCasePolice from "eslint-plugin-case-police";
import pluginJsxA11y from "eslint-plugin-jsx-a11y";
import pluginPrettier from "eslint-plugin-prettier";
import pluginSonarjs from "eslint-plugin-sonarjs";

/** @type {import('eslint-define-config').FlatESLintConfig} */
export default defineFlatConfig([
    /**
     * Global ignore
     */
    {
        ignores: [
            "**/node_modules/**",
            "**/dist/**",
            "**/build/**",
            "**/coverage/**",
            "**/.next/**",
            "**/.turbo/**",
            "**/.cache/**",
            "**/playwright-report/**",
            "**/test-results/**",
            "**/src/assets/**",
            "**/public/assets/library/**",
            "**/*.min.js",
        ],
    },

    /**
     * Common JS/TS/React rules
     */
    {
        files: ["**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}"],

        ...js.configs.recommended,

        plugins: {
            prettier: pluginPrettier,
            sonarjs: pluginSonarjs,
            "jsx-a11y": pluginJsxA11y,
            "case-police": pluginCasePolice,
        },

        rules: {
            ...configPrettier.rules,
            ...pluginPrettier.configs.recommended.rules,
            ...pluginSonarjs.configs.recommended.rules,
            ...pluginJsxA11y.configs.recommended.rules,
            ...pluginCasePolice.configs.recommended.rules,

            /*
             * ESLint rule configuration
             */

            // Require let or const instead of var
            "no-var": "error",

            // Disallow using variables before defining them
            "no-use-before-define": "off",

            // Variables that are never reassigned after declaration require const
            "prefer-const": "error",

            // Disallow irregular spaces
            "no-irregular-whitespace": "off",

            // Disable debugger usage
            "no-debugger": "off",
            "no-unused-vars": "off",

            /**
             * Prettier
             */
            "prettier/prettier": [
                "error",
                {
                    endOfLine: "auto",
                },
            ],

            /*
             * SonarJS
             */
            "sonarjs/no-duplicate-string": "off",
            "sonarjs/no-nested-template-literals": "off",
        },
    },

    /**
     * TypeScript / TSX rules
     */
    {
        files: ["**/*.{ts,tsx,mts,cts}"],

        languageOptions: {
            parser: parserTypeScript,
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: "module",
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },

        plugins: {
            "@typescript-eslint": pluginTypeScript,
        },

        rules: {
            ...pluginTypeScript.configs.recommended.rules,

            /*
             * TypeScript rule configuration
             */

            // Infer types of parameters, properties, and variables based on default or initial values
            "@typescript-eslint/no-inferrable-types": "off",

            // Disallow custom TS modules and namespaces
            "@typescript-eslint/no-namespace": "off",

            // Disallow any type
            "@typescript-eslint/no-explicit-any": "off",

            // Deprecated/removed in newer @typescript-eslint versions, keep off if available
            "@typescript-eslint/ban-types": "off",

            // Explicit return type declarations are not required
            "@typescript-eslint/explicit-function-return-type": "off",

            // Allow require statements
            "@typescript-eslint/no-var-requires": "off",

            // Disallow empty functions
            "@typescript-eslint/no-empty-function": "off",

            // Disallow using variables before they are defined
            "@typescript-eslint/no-use-before-define": "off",

            // Allow @ts-ignore / @ts-expect-error
            "@typescript-eslint/ban-ts-comment": "off",

            // Allow non-null assertions
            "@typescript-eslint/no-non-null-assertion": "off",

            // Do not require explicit boundary types
            "@typescript-eslint/explicit-module-boundary-types": "off",

            // Importing with top-level type qualifier
            "@typescript-eslint/no-import-type-side-effects": "error",

            // Allow non-null assertion after optional chaining
            "@typescript-eslint/no-non-null-asserted-optional-chain": "off",

            // Disallow unused variables, but allow variables starting with _
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                },
            ],

            // Prefer inline type imports
            "@typescript-eslint/consistent-type-imports": [
                "error",
                {
                    disallowTypeAnnotations: false,
                    fixStyle: "inline-type-imports",
                },
            ],

            // Allows enum member values to be valid JS expressions
            "@typescript-eslint/prefer-literal-enum-member": [
                "error",
                {
                    allowBitwiseExpressions: true,
                },
            ],
        },
    },

    /**
     * JavaScript config files
     */
    {
        files: ["**/*.{js,cjs,mjs}"],

        rules: {
            "@typescript-eslint/no-require-imports": "off",
            "@typescript-eslint/no-var-requires": "off",
        },
    },
]);
