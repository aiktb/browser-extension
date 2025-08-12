/**
 * Core messaging system for browser extensions
 * Provides a lightweight, type-safe messaging foundation
 */

// Core messaging for cross-browser extensions

import type { BrowserAdapter } from "./adapters/interface";

/**
 * Message format for extension communication
 * @template T - The type of data payload
 */
export interface Message<T = unknown> {
  /** Unique identifier for message tracking */
  id: string;
  /** Message type indicator */
  type: "request" | "response" | "error";
  /** Method name for routing (required for requests) */
  method?: string;
  /** Payload data */
  data?: T;
  /** Error information (only for error type) */
  error?: SerializedError;
}

/**
 * Serialized error format for safe transmission across extension boundaries
 */
export interface SerializedError {
  /** Error name/type */
  name: string;
  /** Human-readable error message */
  message: string;
  /** Stack trace for debugging */
  stack?: string;
  /** Error code for programmatic handling */
  code?: string;
  /** Additional error context data */
  data?: unknown;
}

/**
 * Handler function for processing messages
 * @template TInput - Input data type
 * @template TOutput - Output data type
 */
export interface MessageHandler<TInput = unknown, TOutput = unknown> {
  (input: TInput): Promise<TOutput> | TOutput;
}

/**
 * Router mapping method names to their handlers
 */
export interface MessageRouter {
  [method: string]: MessageHandler;
}

/**
 * Generate unique message ID
 * @returns {string} Unique ID combining timestamp and random string
 * @example
 * const id = generateId(); // "1704067200000-abc123"
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Serialize error for transmission across extension boundaries
 * @param {unknown} error - Error object or value to serialize
 * @returns {SerializedError} Serialized error safe for messaging
 * @example
 * const serialized = serializeError(new Error("Failed"));
 */
export function serializeError(error: unknown): SerializedError {
  if (error instanceof Error) {
    const errorWithExtras = error as Error & { code?: string; data?: unknown };
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: errorWithExtras.code,
      data: errorWithExtras.data,
    };
  }

  return {
    name: "UnknownError",
    message: String(error),
  };
}

/**
 * Deserialize error from transmission back to Error object
 * @param {SerializedError} serialized - Serialized error data
 * @returns {Error} Reconstructed Error object
 * @example
 * const error = deserializeError(serializedError);
 * console.error(error.message);
 */
export function deserializeError(serialized: SerializedError): Error {
  const error = new Error(serialized.message);
  error.name = serialized.name;
  if (serialized.stack) error.stack = serialized.stack;
  if (serialized.code) {
    const errorWithCode = error as Error & { code?: string };
    errorWithCode.code = serialized.code;
  }
  if (serialized.data) {
    const errorWithData = error as Error & { data?: unknown };
    errorWithData.data = serialized.data;
  }
  return error;
}

/**
 * Port-based connection manager for bidirectional communication
 * Handles message routing, subscriptions, and connection lifecycle
 * @class
 */
export class PortConnection {
  /** Chrome runtime port for communication */
  private port: chrome.runtime.Port;
  /** Message response handlers indexed by message ID */
  private handlers = new Map<string, (response: Message) => void>();
  /** Active subscriptions with their cleanup functions */
  private subscriptions = new Map<string, () => void>();

  /**
   * Create a new port connection
   * @param {chrome.runtime.Port} port - Chrome runtime port
   */
  constructor(port: chrome.runtime.Port) {
    this.port = port;
    this.setupListeners();
  }

  /**
   * Setup message and disconnect listeners
   * @private
   */
  private setupListeners(): void {
    this.port.onMessage.addListener((message: Message) => {
      const handler = this.handlers.get(message.id);
      if (handler) {
        handler(message);
        // Always clean up handlers after processing
        this.handlers.delete(message.id);
      }
    });

    this.port.onDisconnect.addListener(() => {
      this.subscriptions.forEach((unsubscribe) => unsubscribe());
      this.subscriptions.clear();
      this.handlers.clear();
    });
  }

  /**
   * Send a message and wait for response
   * @template T - Expected response type
   * @param {Message} message - Message to send
   * @returns {Promise<T>} Promise resolving to response data
   * @throws {Error} If response contains an error
   */
  async sendMessage<T>(message: Message): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = message.id || generateId();
      const messageWithId = { ...message, id };

      this.handlers.set(id, (response: Message) => {
        if (response.type === "error" && response.error) {
          reject(deserializeError(response.error));
        } else {
          resolve(response.data as T);
        }
      });

      this.port.postMessage(messageWithId);
    });
  }

  /**
   * Send a successful response
   * @param {string} id - Message ID to respond to
   * @param {unknown} data - Response data
   */
  sendResponse(id: string, data: unknown): void {
    const message: Message = {
      id,
      type: "response",
      data,
    };
    this.port.postMessage(message);
  }

  /**
   * Send an error response
   * @param {string} id - Message ID to respond to
   * @param {unknown} error - Error to send
   */
  sendError(id: string, error: unknown): void {
    const message: Message = {
      id,
      type: "error",
      error: serializeError(error),
    };
    this.port.postMessage(message);
  }

  /**
   * Add a subscription with cleanup function
   * @param {string} id - Subscription ID
   * @param {Function} unsubscribe - Cleanup function
   */
  addSubscription(id: string, unsubscribe: () => void): void {
    this.subscriptions.set(id, unsubscribe);
  }

  /**
   * Remove and cleanup a subscription
   * @param {string} id - Subscription ID
   */
  removeSubscription(id: string): void {
    const unsubscribe = this.subscriptions.get(id);
    if (unsubscribe) {
      unsubscribe();
      this.subscriptions.delete(id);
    }
  }

  /**
   * Disconnect the port and cleanup resources
   */
  disconnect(): void {
    this.port.disconnect();
  }
}

/**
 * Create a message handler for the server side
 * @param {MessageRouter} router - Router with method handlers
 * @returns {Function} Port connection handler
 * @example
 * const handler = createMessageHandler({
 *   greet: async (name) => `Hello, ${name}!`
 * });
 * chrome.runtime.onConnect.addListener(handler);
 */
export function createMessageHandler(router: MessageRouter) {
  return (port: chrome.runtime.Port) => {
    if (!port || typeof port.onMessage?.addListener !== "function") {
      console.error("Invalid port provided to message handler");
      return;
    }
    const connection = new PortConnection(port);

    port.onMessage.addListener(async (message: Message) => {
      if (message.type !== "request" || !message.method) return;

      const handler = router[message.method];
      if (!handler) {
        connection.sendError(
          message.id,
          new Error(`Method ${message.method} not found`),
        );
        return;
      }

      try {
        const result = await handler(message.data);
        connection.sendResponse(message.id, result);
      } catch (error) {
        connection.sendError(message.id, error);
      }
    });
  };
}

/**
 * Create a message client for sending requests
 * @param {BrowserAdapter} adapter - Browser API adapter (required)
 * @param {string} [portName] - Optional port name for identification
 * @returns {Object} Client with send and disconnect methods
 * @example
 * import { createChromeAdapter } from "./adapters/chrome";
 * const adapter = createChromeAdapter();
 * const client = createMessageClient(adapter, "my-port");
 * const result = await client.send("greet", "World");
 * client.disconnect();
 */
export function createMessageClient(
  adapter: BrowserAdapter,
  portName?: string,
) {
  if (!adapter?.runtime?.connect) {
    throw new Error(
      "Invalid browser adapter provided. Please provide a valid BrowserAdapter instance.",
    );
  }
  const port = adapter.runtime.connect({ name: portName });
  const connection = new PortConnection(port);

  return {
    async send<TInput, TOutput>(
      method: string,
      data: TInput,
    ): Promise<TOutput> {
      const message: Message<TInput> = {
        id: generateId(),
        type: "request",
        method,
        data,
      };
      return connection.sendMessage<TOutput>(message);
    },

    disconnect(): void {
      connection.disconnect();
    },
  };
}
