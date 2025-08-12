/**
 * @fileoverview Browser API adapter interface definitions.
 * @module adapters/interface
 *
 * @description
 * This module provides type definitions for abstracting browser extension APIs,
 * allowing different implementations (Chrome native, webextension-polyfill, etc.)
 * to be used interchangeably through a common interface.
 */

/**
 * Port interface for extension messaging connections.
 *
 * @description
 * Represents a connection port between different parts of an extension
 * (e.g., between background script and content script). This interface
 * matches the Chrome extension Port API structure.
 *
 * @interface ExtensionPort
 */
export interface ExtensionPort {
  name: string;
  disconnect: () => void;
  postMessage: (message: unknown) => void;
  onDisconnect: chrome.events.Event<() => void>;
  onMessage: chrome.events.Event<(message: unknown) => void>;
}

/**
 * Configuration options for establishing a port connection.
 *
 * @interface PortConnectOptions
 */
export interface PortConnectOptions {
  name?: string;
  includeTlsChannelId?: boolean;
}

/**
 * Runtime API interface for browser extension runtime operations.
 *
 * @description
 * Provides methods and events for managing extension runtime behavior,
 * including inter-extension communication and lifecycle management.
 *
 * @interface RuntimeAPI
 */
export interface RuntimeAPI {
  id?: string;
  connect: {
    // Overloaded signatures to match Chrome's API
    (connectInfo?: PortConnectOptions): ExtensionPort;
    (extensionId: string, connectInfo?: PortConnectOptions): ExtensionPort;
  };
  onConnect: chrome.events.Event<(port: ExtensionPort) => void>;
  sendMessage: (
    extensionId: string | undefined,
    message: unknown,
    options?: chrome.runtime.MessageOptions,
    callback?: (response: unknown) => void,
  ) => void;
  onMessage: chrome.events.Event<
    (
      message: unknown,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: unknown) => void,
    ) => boolean | void
  >;
}

/**
 * Main browser API adapter interface.
 *
 * @description
 * This is the primary interface that all browser adapters must implement.
 * It provides a consistent API surface for extension operations regardless
 * of the underlying browser or polyfill being used.
 *
 * @interface BrowserAdapter
 */
export interface BrowserAdapter {
  runtime: RuntimeAPI;
}

/**
 * Configuration options for creating a browser adapter instance.
 *
 * @interface BrowserAdapterOptions
 */
export interface BrowserAdapterOptions {
  /**
   * Custom browser API object (e.g., chrome, browser)
   * If not provided, the adapter should auto-detect
   */
  browserAPI?: BrowserAdapter;
}

/**
 * Factory function type definition for creating browser adapters.
 *
 * @typedef {Function} CreateBrowserAdapter
 * @param {BrowserAdapterOptions} [options] - Optional configuration
 * @returns {BrowserAdapter} A configured browser adapter instance
 */
export type CreateBrowserAdapter = (
  options?: BrowserAdapterOptions,
) => BrowserAdapter;
