import js from "@eslint/js";
import globals from "globals";
export default [
  {
    ignores: ["**/dist/**", "node_modules/**", "artifacts/**", ".script-*/**"],
  },
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      "no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^[A-Z]" },
      ],
    },
  },
];
