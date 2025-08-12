/**
 * @fileoverview WebExtension Polyfill adapter for browser extension messaging.
 * @module adapters/polyfill
 *
 * @description
 * Adapter for Mozilla's webextension-polyfill library which provides a
 * Promise-based API and cross-browser compatibility. This adapter enables
 * the same code to work across Chrome, Firefox, Edge, and other browsers
 * that support the WebExtensions API.
 *
 * @see {@link https://github.com/mozilla/webextension-polyfill}
 */

import type { BrowserAdapter, BrowserAdapterOptions } from "./interface";

/**
 * Checks if the WebExtension polyfill is available in the current environment.
 *
 * @description
 * This function detects the presence of the `browser` global object which is
 * typically provided by the webextension-polyfill library. It also ensures
 * that it's not just the native Chrome API exposed as `browser`.
 *
 * @returns {boolean} True if WebExtension polyfill is available, false otherwise
 *
 * @example
 * ```typescript
 * if (isPolyfillEnvironment()) {
 *   const adapter = createPolyfillAdapter();
 *   // Use cross-browser compatible features
 * }
 * ```
 */
export function isPolyfillEnvironment(): boolean {
  const global = globalThis as {
    browser?: BrowserAdapter;
    chrome?: BrowserAdapter;
  };
  return !!(
    global.browser?.runtime?.id &&
    typeof global.browser.runtime.connect === "function" &&
    // Polyfill typically has a different structure than native APIs
    global.browser !== global.chrome
  );
}

/**
 * Creates a WebExtension polyfill browser API adapter for cross-browser compatibility.
 *
 * @param {BrowserAdapterOptions} [options] - Optional configuration for the adapter
 * @param {BrowserAdapter} [options.browserAPI] - Custom browser API implementation
 *
 * @returns {BrowserAdapter} A polyfill-compatible browser adapter instance
 *
 * @throws {Error} Throws an error if polyfill is not available and no mock is provided
 *
 * @example
 * ```typescript
 * // Using global polyfill
 * const adapter = createPolyfillAdapter();
 * ```
 *
 * @example
 * ```typescript
 * // With explicit polyfill import
 * import browser from 'webextension-polyfill';
 * const adapter = createPolyfillAdapter({ browserAPI: browser });
 * ```
 *
 * @example
 * ```typescript
 * // Testing with mock
 * const mockBrowser = createMockBrowserAPI();
 * const adapter = createPolyfillAdapter({ browserAPI: mockBrowser });
 * ```
 *
 * @since 1.0.0
 */
export function createPolyfillAdapter(
  options?: BrowserAdapterOptions,
): BrowserAdapter {
  // Use provided API or detect browser object
  if (options?.browserAPI) {
    return options.browserAPI;
  }

  const global = globalThis as { browser?: BrowserAdapter };

  if (!global.browser?.runtime?.id) {
    throw new Error(
      "WebExtension polyfill not available. " +
        "Either install 'webextension-polyfill' package and ensure it's loaded, " +
        "or provide a browserAPI in options.",
    );
  }

  // The polyfill follows the same interface as Chrome API
  return global.browser as BrowserAdapter;
}
