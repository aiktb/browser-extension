/**
 * @filename: lint-staged.config.mjs
 * @type {import('lint-staged').Configuration}
 */
const config = {
  "*.{js,jsx,ts,tsx}": [
    /**
     * Run Prettier first to format code, then ESLint to check code quality.
     * This order is optimal because:
     * 1. Prettier formats the code consistently
     * 2. ESLint checks the formatted code for quality issues
     * 3. eslint-config-prettier ensures no formatting conflicts
     */
    "prettier --write --ignore-unknown",
    "eslint --fix",
    /**
     * ⚠️  lint‑staged automatically appends the list of staged file paths to
     *     every task. When those paths reach `tsc`, the compiler receives
     *     explicit file arguments and therefore **ignores tsconfig.json** —
     *     @see {@link https://www.typescriptlang.org/docs/handbook/compiler-options.html#tsconfigjson-files-are-ignored-when-input-files-are-specified}
     *     @see {@link https://github.com/okonet/lint-staged/issues/825}
     *     Wrapping the script in `bash -c` prevents that filename injection,
     *     allowing `pnpm run lint:typecheck` (aka `tsc --noEmit`) to run against the
     *     entire project and honour the project's tsconfig.
     */
    "bash -c 'pnpm run lint:typecheck'",
  ],
  "!*.{js,jsx,ts,tsx}": ["prettier --write --ignore-unknown"],
};

export default config;
