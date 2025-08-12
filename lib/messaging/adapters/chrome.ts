/**
 * @fileoverview Chrome API adapter for browser extension messaging.
 * @module adapters/chrome
 *
 * @description
 * Provides a direct adapter for Chrome extension APIs without any wrappers.
 * This adapter is designed for Chrome extensions that don't require
 * cross-browser compatibility.
 */

import type { BrowserAdapter, BrowserAdapterOptions } from "./interface";

/**
 * Checks if the Chrome extension API is available in the current environment.
 *
 * @returns {boolean} True if Chrome extension API is available, false otherwise
 *
 * @example
 * ```typescript
 * if (isChromeExtensionEnvironment()) {
 *   const adapter = createChromeAdapter();
 *   // Use Chrome-specific features
 * }
 * ```
 */
export function isChromeExtensionEnvironment(): boolean {
  const global = globalThis as { chrome?: typeof chrome };
  return !!(
    global.chrome?.runtime?.id &&
    typeof global.chrome.runtime.connect === "function"
  );
}

/**
 * Creates a Chrome browser API adapter for extension messaging.
 *
 * @param {BrowserAdapterOptions} [options] - Optional configuration for the adapter
 * @param {BrowserAdapter} [options.browserAPI] - Custom browser API implementation (useful for testing)
 *
 * @returns {BrowserAdapter} A Chrome-compatible browser adapter instance
 *
 * @throws {Error} Throws an error if Chrome API is not available and no mock is provided
 *
 * @example
 * ```typescript
 * // Production usage
 * const adapter = createChromeAdapter();
 * const port = adapter.runtime.connect({ name: 'my-extension' });
 * ```
 *
 * @example
 * ```typescript
 * // Testing usage with mock
 * const mockBrowserAPI = createMockBrowserAPI();
 * const adapter = createChromeAdapter({ browserAPI: mockBrowserAPI });
 * ```
 *
 * @since 1.0.0
 */
export function createChromeAdapter(
  options?: BrowserAdapterOptions,
): BrowserAdapter {
  // Use provided API or detect Chrome API
  if (options?.browserAPI) {
    return options.browserAPI;
  }

  const global = globalThis as { chrome?: typeof chrome };

  if (!global.chrome?.runtime?.id) {
    throw new Error(
      "Chrome extension API not available. " +
        "Make sure this code is running in a Chrome extension environment. " +
        "If testing, provide a mock browserAPI in options.",
    );
  }

  return global.chrome as BrowserAdapter;
}
