/**
 * Examples of using different browser API adapters
 *
 * This demonstrates how to use the messaging library with different
 * browser API implementations for maximum flexibility
 */

import { createTRPCClient } from "@trpc/client";
import type { AnyRouter } from "@trpc/server";
import { extensionLink } from "../trpc";

// Import adapter interface
import type { BrowserAdapter, ExtensionPort } from "../adapters/interface";

// Import different adapters
import { createChromeAdapter } from "../adapters/chrome";
import { createPolyfillAdapter } from "../adapters/polyfill";
import { createWXTAdapter } from "../adapters/wxt";

// Import core messaging
import { createMessageClient } from "../core";

/**
 * Example 1: Using Chrome adapter directly
 * For Chrome extensions that don't need cross-browser compatibility
 */
export function setupChromeClient<TRouter extends AnyRouter>() {
  const adapter = createChromeAdapter();

  return createTRPCClient<TRouter>({
    links: [
      extensionLink<TRouter>({
        adapter,
        portOptions: { name: "chrome-extension" },
      }),
    ],
  });
}

/**
 * Example 2: Using WebExtension Polyfill adapter
 * For extensions that use Mozilla's webextension-polyfill
 */
export function setupPolyfillClient<TRouter extends AnyRouter>() {
  // Assuming webextension-polyfill is installed and available globally
  const adapter = createPolyfillAdapter();

  return createTRPCClient<TRouter>({
    links: [
      extensionLink<TRouter>({
        adapter,
        portOptions: { name: "polyfill-extension" },
      }),
    ],
  });
}

/**
 * Example 3: Using WXT adapter (auto-detects browser)
 * For WXT-based extensions that need automatic browser detection
 */
export function setupWXTClientExample<TRouter extends AnyRouter>() {
  const adapter = createWXTAdapter();

  return createTRPCClient<TRouter>({
    links: [
      extensionLink<TRouter>({
        adapter,
        portOptions: { name: "wxt-extension" },
      }),
    ],
  });
}

/**
 * Example 4: Custom adapter implementation
 * You can provide your own browser API implementation
 */
export function setupCustomClient<TRouter extends AnyRouter>() {
  // Custom browser API object (e.g., from a testing framework)
  const customBrowserAPI = {
    runtime: {
      id: "custom-extension-id",
      connect: (() => {
        // Custom port implementation
        const port: ExtensionPort = {
          name: "custom-port",
          disconnect: () => {},
          postMessage: () => {},
          onDisconnect: {
            addListener: () => {},
            removeListener: () => {},
            hasListener: () => false,
            hasListeners: () => false,
            removeRules: () => {},
            getRules: () => {},
            addRules: () => {},
          },
          onMessage: {
            addListener: () => {},
            removeListener: () => {},
            hasListener: () => false,
            hasListeners: () => false,
            removeRules: () => {},
            getRules: () => {},
            addRules: () => {},
          },
        };
        return port;
      }) as BrowserAdapter["runtime"]["connect"],
      onConnect: {
        addListener: () => {},
        removeListener: () => {},
        hasListener: () => false,
        hasListeners: () => false,
        removeRules: () => {},
        getRules: () => {},
        addRules: () => {},
      },
      sendMessage: () => {},
      onMessage: {
        addListener: () => {},
        removeListener: () => {},
        hasListener: () => false,
        hasListeners: () => false,
        removeRules: () => {},
        getRules: () => {},
        addRules: () => {},
      },
    },
  } as BrowserAdapter;

  return createTRPCClient<TRouter>({
    links: [
      extensionLink<TRouter>({
        adapter: customBrowserAPI,
        portOptions: { name: "custom-extension" },
      }),
    ],
  });
}

/**
 * Example 5: Conditional adapter selection
 * Automatically choose the right adapter based on environment
 */
export function setupAutoClient<TRouter extends AnyRouter>() {
  let adapter;

  // Try different adapters in order of preference
  try {
    // First try WXT (supports both browser and chrome)
    adapter = createWXTAdapter();
  } catch {
    try {
      // Fallback to Chrome API
      adapter = createChromeAdapter();
    } catch {
      try {
        // Fallback to polyfill
        adapter = createPolyfillAdapter();
      } catch {
        throw new Error("No browser extension API available");
      }
    }
  }

  return createTRPCClient<TRouter>({
    links: [
      extensionLink<TRouter>({
        adapter,
        portOptions: { name: "auto-extension" },
      }),
    ],
  });
}

/**
 * Example 6: Using adapter with core messaging (non-tRPC)
 */
export function setupCoreMessaging() {
  // Use Chrome adapter
  const adapter = createChromeAdapter();
  const client = createMessageClient(adapter, "core-messaging");

  // Use the client
  return {
    async sendGreeting(name: string) {
      return client.send("greet", { name });
    },

    disconnect() {
      client.disconnect();
    },
  };
}
