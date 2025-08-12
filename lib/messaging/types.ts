/**
 * Type definitions for tRPC browser extension messaging
 */

import type { AnyRouter } from "@trpc/server";
import type { ExtensionPort } from "./adapters/interface";

/**
 * tRPC message format following JSON-RPC 2.0 specification
 */
export interface TRPCMessage {
  /** Unique request/response identifier */
  id: string;
  /** JSON-RPC version */
  jsonrpc?: "2.0";
  /** RPC method type */
  method?: "query" | "mutation" | "subscription" | "subscription.stop";
  /** Request parameters */
  params?: {
    /** Procedure path */
    path: string;
    /** Input data for the procedure */
    input?: unknown;
  };
  /** Response result */
  result?: {
    /** Result type indicator */
    type?: "data" | "started" | "stopped";
    /** Result data payload */
    data?: unknown;
  };
  /** Error information */
  error?: TRPCError;
}

/**
 * tRPC error format with metadata
 */
export interface TRPCError {
  /** JSON-RPC error code */
  code: number;
  /** Human-readable error message */
  message: string;
  /** Additional error metadata */
  data?: {
    /** tRPC error code */
    code: string;
    /** HTTP status code equivalent */
    httpStatus?: number;
    /** Stack trace for debugging */
    stack?: string;
    /** Procedure path where error occurred */
    path?: string;
  };
}

/**
 * Extension message wrapper for tRPC messages
 */
export interface ExtensionMessage {
  /** Wrapped tRPC message */
  trpc: TRPCMessage;
}

/**
 * Port connection options for Chrome runtime
 */
export interface PortOptions {
  /** Port name for identification */
  name?: string;
  /** Include TLS channel ID (for secure contexts) */
  includeTlsChannelId?: boolean;
}

/**
 * Extension link configuration options
 */
export interface ExtensionLinkOptions {
  /** Browser API adapter (required) */
  adapter: import("./adapters/interface").BrowserAdapter;
  /** Existing port to use (creates new if not provided) */
  port?: chrome.runtime.Port;
  /** Options for creating new port */
  portOptions?: PortOptions;
  /** Custom transformer for data serialization */
  transformer?: Transformer;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Debug configuration */
  debug?: {
    /** Enable debug logging */
    enabled?: boolean;
    /** Log performance metrics */
    logPerformance?: boolean;
    /** Debug verbosity level (0-5) */
    level?: number;
  };
}

/**
 * Transformer for data serialization/deserialization
 * Useful for handling complex data types across extension boundaries
 */
export interface Transformer {
  /**
   * Serialize data before transmission
   * @param data - Data to serialize
   * @returns Serialized data
   */
  serialize: (data: unknown) => unknown;
  /**
   * Deserialize data after reception
   * @param data - Data to deserialize
   * @returns Deserialized data
   */
  deserialize: (data: unknown) => unknown;
}

/**
 * Configuration options for creating extension handler
 * @template TRouter - tRPC router type
 */
export interface CreateExtensionHandlerOptions<TRouter extends AnyRouter> {
  /** Browser API adapter (required) */
  adapter: import("./adapters/interface").BrowserAdapter;
  /** tRPC router instance */
  router: TRouter;
  /** Context creation function */
  createContext?: () => Promise<unknown> | unknown;
  /** Error handler callback */
  onError?: (opts: {
    /** Error that occurred */
    error: unknown;
    /** Operation type */
    type: "query" | "mutation" | "subscription" | "unknown";
    /** Procedure path */
    path?: string;
    /** Input data */
    input?: unknown;
    /** Context object */
    ctx?: unknown;
    /** Port that sent the request */
    req: ExtensionPort;
  }) => void;
  /** Custom data transformer */
  transformer?: Transformer;
  /** Debug configuration */
  debug?: {
    /** Enable debug logging */
    enabled?: boolean;
    /** Log performance metrics */
    logPerformance?: boolean;
    /** Debug verbosity level (0-5) */
    level?: number;
  };
}

/**
 * Extension client configuration
 */
export interface ExtensionClientConfig {
  /** Existing port to reuse */
  port?: chrome.runtime.Port;
  /** Options for creating new port */
  portOptions?: PortOptions;
  /** Custom data transformer */
  transformer?: Transformer;
}

/**
 * Subscription observer pattern interface
 * @template T - Data type for subscription values
 */
export interface SubscriptionObserver<T = unknown> {
  /**
   * Called when new value is emitted
   * @param value - Emitted value
   */
  next: (value: T) => void;
  /**
   * Called when error occurs
   * @param err - Error that occurred
   */
  error: (err: unknown) => void;
  /**
   * Called when subscription completes
   */
  complete: () => void;
}

/**
 * Operation descriptor for tRPC procedures
 */
export interface Operation {
  /** Operation identifier */
  id: string;
  /** Operation type */
  type: "query" | "mutation" | "subscription";
  /** Procedure path */
  path: string;
  /** Input data */
  input?: unknown;
  /** Operation context */
  context?: Record<string, unknown>;
}
