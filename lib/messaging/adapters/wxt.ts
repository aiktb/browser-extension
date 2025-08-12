/**
 * @fileoverview WXT-specific adapter for browser extension messaging.
 * @module adapters/wxt
 *
 * @description
 * Provides a WXT-compatible adapter that automatically detects and uses
 * the appropriate browser API (Chrome or Firefox). WXT is a modern
 * web extension framework that simplifies cross-browser extension development.
 *
 * @see {@link https://wxt.dev}
 */
import type {
  BrowserAdapter,
  BrowserAdapterOptions,
} from "@/lib/messaging/adapters/interface";
import { createExtensionHandler, extensionLink } from "@/lib/messaging/trpc";
import type {
  CreateExtensionHandlerOptions,
  ExtensionLinkOptions,
} from "@/lib/messaging/types";
import { createTRPCClient } from "@trpc/client";
import type { AnyRouter } from "@trpc/server";

/**
 * Detects if the code is running in a WebExtension environment.
 *
 * @description
 * Checks for the presence of either the `browser` API (Firefox/Safari)
 * or the `chrome` API (Chrome/Edge) to determine if running in an extension.
 *
 * @returns {boolean} True if browser extension API is available, false otherwise
 *
 * @example
 * ```typescript
 * if (isExtensionEnvironment()) {
 *   // Initialize extension-specific features
 *   const adapter = createWXTAdapter();
 * } else {
 *   // Fallback for non-extension environments
 * }
 * ```
 */
export function isExtensionEnvironment(): boolean {
  // Check for browser API (Firefox/Safari) or chrome API (Chrome/Edge)
  // Using chrome type as common interface for both APIs
  const global = globalThis as {
    browser?: typeof chrome;
    chrome?: typeof chrome;
  };
  return (
    global.browser?.runtime?.id !== undefined ||
    global.chrome?.runtime?.id !== undefined
  );
}

/**
 * Creates a WXT browser API adapter with automatic browser detection.
 *
 * @description
 * This adapter follows WXT's detection strategy: it prefers the `browser`
 * global (Firefox/Safari) over `chrome` (Chrome/Edge) when both are available.
 * This ensures maximum compatibility across different browsers.
 *
 * @param {BrowserAdapterOptions} [options] - Optional configuration for the adapter
 * @param {BrowserAdapter} [options.browserAPI] - Custom browser API implementation
 *
 * @returns {BrowserAdapter} A WXT-compatible browser adapter instance
 *
 * @throws {Error} Throws if no browser API is detected and no mock is provided
 *
 * @example
 * ```typescript
 * // Automatic detection
 * const adapter = createWXTAdapter();
 * const port = adapter.runtime.connect({ name: "my-extension" });
 * ```
 *
 * @example
 * ```typescript
 * // With custom implementation for testing
 * const mockAPI = createMockBrowserAPI();
 * const adapter = createWXTAdapter({ browserAPI: mockAPI });
 * ```
 *
 * @since 1.0.0
 */
export function createWXTAdapter(
  options?: BrowserAdapterOptions,
): BrowserAdapter {
  // Use provided API or auto-detect
  if (options?.browserAPI) {
    return options.browserAPI;
  }

  // Both browser and chrome APIs follow the same interface (chrome types)
  const global = globalThis as {
    browser?: typeof chrome;
    chrome?: typeof chrome;
  };

  // WXT-style detection: prefer browser over chrome if available
  const browser = global.browser?.runtime?.id ? global.browser : global.chrome;

  if (!browser) {
    throw new Error(
      "Browser API not available. " +
        "Make sure this code is running in a browser extension environment. " +
        "If testing, provide a mock browserAPI in options.",
    );
  }

  return browser as BrowserAdapter;
}

/**
 * WXT-specific link options for tRPC integration.
 *
 * @interface WXTLinkOptions
 * @extends {ExtensionLinkOptions}
 */
export interface WXTLinkOptions extends ExtensionLinkOptions {
  /**
   * Port name for connection identification
   * @default "wxt-trpc"
   */
  portName?: string;
}

/**
 * Creates a WXT-compatible tRPC link for client-side communication.
 *
 * @template TRouter - The tRPC router type for type-safe communication
 *
 * @param {WXTLinkOptions} options - Configuration options for the WXT link
 * @param {BrowserAdapter} options.adapter - Required browser adapter instance
 * @param {string} [options.portName="wxt-trpc"] - Name for the connection port
 * @param {chrome.runtime.Port} [options.port] - Existing port to reuse
 *
 * @returns {TRPCLink<TRouter>} Configured tRPC link for extension messaging
 *
 * @throws {Error} Throws if adapter is not provided
 *
 * @example
 * ```typescript
 * const adapter = createWXTAdapter();
 * const link = wxtLink<AppRouter>({
 *   adapter,
 *   portName: "my-extension",
 *   timeout: 30000
 * });
 *
 * const client = createTRPCClient<AppRouter>({
 *   links: [link]
 * });
 * ```
 *
 * @since 1.0.0
 */
export function wxtLink<TRouter extends AnyRouter>(
  options: WXTLinkOptions,
): ReturnType<typeof extensionLink<TRouter>> {
  // Adapter must be provided
  if (!options.adapter) {
    const errorMessage =
      "Browser adapter is required. Please provide an adapter using createWXTAdapter() or another adapter.";
    throw new Error(errorMessage);
  }

  // Create port if not provided
  const port =
    options.port ||
    options.adapter.runtime.connect({
      name: options.portName || "wxt-trpc",
    });

  // Pass the adapter to extensionLink with the port
  return extensionLink<TRouter>({
    ...options,
    port,
  });
}

/**
 * Creates a WXT-compatible tRPC handler for server-side message processing.
 *
 * @template TRouter - The tRPC router type containing your procedures
 *
 * @param {CreateExtensionHandlerOptions<TRouter>} options - Handler configuration
 * @param {BrowserAdapter} options.adapter - Required browser adapter instance
 * @param {TRouter} options.router - tRPC router with defined procedures
 * @param {Function} [options.createContext] - Context creation function
 * @param {Function} [options.onError] - Error handling callback
 *
 * @example
 * ```typescript
 * const adapter = createWXTAdapter();
 * createWXTHandler({
 *   adapter,
 *   router: appRouter,
 *   createContext: () => ({
 *     timestamp: Date.now(),
 *     user: getCurrentUser()
 *   }),
 *   onError: ({ error, path }) => {
 *     console.error(`Error in ${path}:`, error);
 *   }
 * });
 * ```
 *
 * @since 1.0.0
 */
export function createWXTHandler<TRouter extends AnyRouter>(
  options: CreateExtensionHandlerOptions<TRouter>,
) {
  // Simply delegate to the extension handler
  createExtensionHandler(options);
}

/**
 * Creates a WXT tRPC client with pre-configured link for easy setup.
 *
 * @template TRouter - The tRPC router type for type-safe client creation
 *
 * @param {WXTLinkOptions} options - Client configuration options
 * @param {BrowserAdapter} options.adapter - Required browser adapter instance
 * @param {string} [options.portName] - Optional port name for connection
 * @param {Transformer} [options.transformer] - Optional data transformer
 *
 * @returns {TRPCClient<TRouter>} Configured tRPC client ready for use
 *
 * @example
 * ```typescript
 * const adapter = createWXTAdapter();
 * const client = createWXTClient<AppRouter>({
 *   adapter,
 *   transformer: superjson,
 *   timeout: 60000
 * });
 *
 * // Use the client
 * const result = await client.greeting.query("World");
 * ```
 *
 * @since 1.0.0
 */
export function createWXTClient<TRouter extends AnyRouter>(
  options: WXTLinkOptions,
) {
  return createTRPCClient<TRouter>({
    links: [wxtLink<TRouter>(options)],
  });
}

/**
 * Helper function for simplified background script setup with WXT.
 *
 * @description
 * This is a convenience wrapper that simplifies the setup of tRPC handlers
 * in background scripts by combining adapter and router configuration.
 *
 * @template TRouter - The tRPC router type containing your procedures
 *
 * @param {BrowserAdapter} adapter - Browser API adapter instance
 * @param {TRouter} router - tRPC router with defined procedures
 * @param {Object} [options] - Additional handler configuration options
 * @param {Function} [options.createContext] - Context creation function
 * @param {Function} [options.onError] - Error handling callback
 * @param {Transformer} [options.transformer] - Data transformation utilities
 *
 * @example
 * ```typescript
 * // In background.ts
 * import { createWXTAdapter, setupWXTBackground } from '@/lib/messaging';
 * import { appRouter } from './router';
 *
 * const adapter = createWXTAdapter();
 *
 * setupWXTBackground(adapter, appRouter, {
 *   createContext: async () => ({
 *     user: await getCurrentUser(),
 *     timestamp: Date.now()
 *   }),
 *   onError: ({ error, path }) => {
 *     console.error(`Background error in ${path}:`, error);
 *   }
 * });
 * ```
 *
 * @since 1.0.0
 */
export function setupWXTBackground<TRouter extends AnyRouter>(
  adapter: BrowserAdapter,
  router: TRouter,
  options?: Omit<CreateExtensionHandlerOptions<TRouter>, "router" | "adapter">,
) {
  createWXTHandler({
    adapter,
    router,
    ...options,
  });
}

/**
 * Helper function for simplified client setup in content scripts and popups.
 *
 * @description
 * This convenience wrapper creates a ready-to-use tRPC client with WXT adapter,
 * ideal for use in popup pages, content scripts, and other client contexts.
 *
 * @template TRouter - The tRPC router type for type-safe client operations
 *
 * @param {WXTLinkOptions} options - Client configuration options
 * @param {BrowserAdapter} options.adapter - Required browser adapter instance
 * @param {string} [options.portName="wxt-trpc"] - Port name for connection
 * @param {number} [options.timeout=30000] - Request timeout in milliseconds
 * @param {Transformer} [options.transformer] - Data transformation utilities
 *
 * @returns {TRPCClient<TRouter>} Ready-to-use tRPC client
 *
 * @example
 * ```typescript
 * // In popup or content script
 * import { createWXTAdapter, setupWXTClient } from '@/lib/messaging';
 * import type { AppRouter } from './router';
 *
 * const adapter = createWXTAdapter();
 * const client = setupWXTClient<AppRouter>({
 *   adapter,
 *   timeout: 60000,
 *   transformer: superjson
 * });
 *
 * // Use the client
 * const data = await client.getData.query();
 * await client.saveData.mutate({ key: 'value' });
 * ```
 *
 * @since 1.0.0
 */
export function setupWXTClient<TRouter extends AnyRouter>(
  options: WXTLinkOptions,
) {
  return createWXTClient<TRouter>(options);
}
