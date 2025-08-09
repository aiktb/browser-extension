import js from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import pluginReactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";
/**
 * React Hooks plugin is essential for catching Hook-related bugs that are difficult
 * to debug at runtime. Without this plugin, developers can accidentally violate
 * React's rules of Hooks (calling Hooks conditionally or in loops), which leads to
 * inconsistent behavior and React throwing errors. This plugin also ensures that
 * dependency arrays in useEffect, useCallback, and useMemo are complete, preventing
 * stale closure bugs where values don't update as expected. These issues are particularly
 * dangerous because they may work in development but fail unpredictably in production.
 * @see {@link https://github.com/facebook/react/blob/main/packages/eslint-plugin-react-hooks/README.md}
 */
import pluginReactHooks from "eslint-plugin-react-hooks";
/**
 * eslint-config-prettier turns off all ESLint rules that are unnecessary or might conflict
 * with Prettier. This allows Prettier to handle all formatting concerns while ESLint focuses
 * on code quality. The /flat suffix is used for ESLint's flat config system.
 * @see {@link https://github.com/prettier/eslint-config-prettier}
 */
import eslintConfigPrettier from "eslint-config-prettier/flat";
import type { ConfigWithExtends } from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules",
      // wxt related files
      ".output",
      ".wxt",
      // shadcn/ui related files
      "components/ui/**",
      "lib/utils.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended as ConfigWithExtends,
  pluginReact.configs.flat["jsx-runtime"] as ConfigWithExtends,
  {
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.webextensions,
      },
    },
    plugins: {
      "react-hooks": pluginReactHooks,
      "react-refresh": pluginReactRefresh,
    },
    rules: {
      // Use recommended rules from plugins
      ...pluginReactHooks.configs.recommended.rules,
      ...pluginReactRefresh.configs.vite.rules,

      /**
       * React 17+ introduces the new JSX Transform which automatically imports React
       * when JSX is used, eliminating the need for explicit React imports in every file.
       * This reduces boilerplate and makes components cleaner without affecting functionality.
       * @see {@link https://legacy.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html}
       */
      "react/react-in-jsx-scope": "off",

      /**
       * PropTypes are redundant when using TypeScript as TypeScript provides
       * compile-time type checking that is more robust than runtime PropTypes validation.
       * Disabling this rule prevents ESLint from requiring PropTypes definitions
       * for components that already have TypeScript interfaces or type annotations.
       * @see {@link https://react.dev/learn/typescript}
       * @see {@link https://github.com/facebook/react/issues/28992} PropTypes removal in React 19
       */
      "react/prop-types": "off",
    },
  },
  /**
   * eslint-config-prettier must be placed last to override any formatting rules
   * from other configs. This ensures Prettier handles all formatting while ESLint
   * focuses only on code quality issues.
   */
  eslintConfigPrettier,
);
