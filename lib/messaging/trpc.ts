/**
 * tRPC v11 integration for browser extensions
 */

// Extension messaging implementation for tRPC

import { TRPCClientError, TRPCLink } from "@trpc/client";
import {
  AnyRouter,
  getTRPCErrorFromUnknown,
  initTRPC,
  TRPCError,
} from "@trpc/server";
import {
  isObservable,
  observable,
  Unsubscribable,
} from "@trpc/server/observable";
import { generateId } from "./core";
import { createDebugger, DebugLevel } from "./debug";
import {
  createDisconnectionError,
  createTimeoutError,
  formatTRPCError,
} from "./errors";
import type {
  CreateExtensionHandlerOptions,
  ExtensionLinkOptions,
  ExtensionMessage,
  Transformer,
  TRPCMessage,
} from "./types";

/**
 * Default transformer (passthrough)
 * @internal
 */
const defaultTransformer: Transformer = {
  serialize: (data) => data,
  deserialize: (data) => data,
};

/**
 * Create extension link for tRPC client
 * @template TRouter - tRPC router type
 * @param {ExtensionLinkOptions} options - Link configuration options
 * @returns {TRPCLink<TRouter>} tRPC link for extension communication
 * @example
 * const link = extensionLink<AppRouter>({
 *   portOptions: { name: "my-extension" },
 *   timeout: 60000,
 *   debug: { enabled: true }
 * });
 */
export function extensionLink<TRouter extends AnyRouter>(
  options: ExtensionLinkOptions,
): TRPCLink<TRouter> {
  return () => {
    const transformer = options.transformer || defaultTransformer;
    const timeout = options.timeout ?? 30000; // Default 30 seconds
    const logger = createDebugger({
      enabled: options.debug?.enabled,
      level: options.debug?.level as DebugLevel | undefined,
      logPerformance: options.debug?.logPerformance,
    });

    return ({ op }) => {
      return observable((observer) => {
        // Use the provided adapter
        const browserAPI = options.adapter;
        if (!browserAPI?.runtime?.connect) {
          throw new Error(
            "Invalid browser adapter provided. Please provide a valid BrowserAdapter instance.",
          );
        }
        const port =
          options.port || browserAPI.runtime.connect(options.portOptions);
        const messageId = generateId();
        let timeoutId: NodeJS.Timeout | undefined;
        let isCompleted = false;

        // Debug logging
        logger.logOperation(op);
        logger.startPerformance(messageId, op.type, op.path);

        // Create tRPC message
        const trpcMessage: TRPCMessage = {
          id: messageId,
          jsonrpc: "2.0",
          method: op.type as "query" | "mutation" | "subscription",
          params: {
            path: op.path,
            input: transformer.serialize(op.input),
          },
        };

        const extensionMessage: ExtensionMessage = { trpc: trpcMessage };

        // Setup timeout handling
        const setupTimeout = () => {
          if (timeout > 0 && !isCompleted) {
            timeoutId = setTimeout(() => {
              if (!isCompleted) {
                isCompleted = true;
                const error = createTimeoutError(timeout, op.path);
                logger.endPerformance(messageId, "error", error);
                logger.error("Request timeout", {
                  messageId,
                  path: op.path,
                  timeout,
                });
                observer.error(TRPCClientError.from(error));
                cleanup();
              }
            }, timeout);
          }
        };

        // Handle responses
        const messageHandler = (message: unknown) => {
          const response = message as ExtensionMessage;
          if (response.trpc.id !== messageId) return;

          // Clear timeout on response
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = undefined;
          }

          logger.logMessage("receive", response.trpc);

          if (response.trpc.error) {
            isCompleted = true;
            const error = response.trpc.error;
            const trcpError = new TRPCError({
              code:
                (error.data?.code as typeof TRPCError.prototype.code) ??
                "INTERNAL_SERVER_ERROR",
              message: error.message,
              cause: error.data,
            });
            logger.endPerformance(messageId, "error", trcpError);
            logger.error("Response error", { messageId, error });
            observer.error(TRPCClientError.from(trcpError));
            return;
          }

          if (response.trpc.result) {
            const { type, data } = response.trpc.result;

            if (type === "stopped") {
              isCompleted = true;
              logger.endPerformance(messageId, "success");
              logger.debug("Subscription stopped", { messageId });
              observer.complete();
            } else {
              const deserializedData = transformer.deserialize(data);
              observer.next({
                result: {
                  data: deserializedData,
                },
              });

              if (op.type !== "subscription") {
                isCompleted = true;
                logger.endPerformance(messageId, "success");
                logger.debug("Operation completed", {
                  messageId,
                  type: op.type,
                });
                observer.complete();
              }
            }
          }
        };

        // Handle port disconnection
        const disconnectHandler = () => {
          if (!isCompleted) {
            isCompleted = true;
            const error = createDisconnectionError(
              "Port disconnected unexpectedly",
            );
            logger.endPerformance(messageId, "error", error);
            logger.error("Port disconnected", { messageId });
            observer.error(TRPCClientError.from(error));
          }
          cleanup();
        };

        // Cleanup function
        const cleanup = () => {
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = undefined;
          }
          port.onMessage.removeListener(messageHandler);
          port.onDisconnect.removeListener(disconnectHandler);
        };

        // Setup listeners
        port.onMessage.addListener(messageHandler);
        port.onDisconnect.addListener(disconnectHandler);

        // Send the message
        logger.logMessage("send", trpcMessage);
        port.postMessage(extensionMessage);

        // Start timeout after sending
        setupTimeout();

        // Handle subscription stop
        if (op.type === "subscription") {
          return () => {
            if (!isCompleted) {
              isCompleted = true;
              const stopMessage: ExtensionMessage = {
                trpc: {
                  id: messageId,
                  jsonrpc: "2.0",
                  method: "subscription.stop",
                },
              };
              logger.debug("Stopping subscription", { messageId });
              port.postMessage(stopMessage);
            }
            cleanup();
          };
        }

        // Cleanup for non-subscriptions
        return () => {
          isCompleted = true;
          cleanup();
        };
      });
    };
  };
}

/**
 * Create tRPC instance for internal use
 * @internal
 */
const t = initTRPC.create({
  isServer: false,
  allowOutsideOfServer: true,
});

/**
 * Create extension handler for tRPC server
 * Sets up port listeners and routes tRPC messages
 * @template TRouter - tRPC router type
 * @param {CreateExtensionHandlerOptions<TRouter>} options - Handler configuration
 * @example
 * createExtensionHandler({
 *   router: appRouter,
 *   createContext: () => ({ user: getCurrentUser() })
 * });
 */
export function createExtensionHandler<TRouter extends AnyRouter>(
  options: CreateExtensionHandlerOptions<TRouter>,
) {
  const {
    adapter,
    router,
    createContext,
    onError,
    transformer = defaultTransformer,
    debug,
  } = options;

  const logger = createDebugger({
    enabled: debug?.enabled,
    level: debug?.level as DebugLevel | undefined,
    logPerformance: debug?.logPerformance,
    prefix: "[tRPC Handler]",
  });

  // Create caller factory using stable API
  const createCaller = t.createCallerFactory(router);

  // Listen for incoming connections
  if (!adapter?.runtime?.onConnect) {
    throw new Error(
      "Invalid browser adapter provided. Please provide a valid BrowserAdapter instance.",
    );
  }
  adapter.runtime.onConnect.addListener((port: chrome.runtime.Port) => {
    const subscriptions = new Map<string, Unsubscribable>();
    logger.info("Port connected", { name: port.name, sender: port.sender });

    const messageHandler = async (message: ExtensionMessage) => {
      const { trpc } = message;

      if (!trpc.id) {
        logger.warn("Received message without ID", message);
        return;
      }

      logger.logMessage("receive", trpc);
      const startTime = performance.now();

      // Handle subscription stop
      if (trpc.method === "subscription.stop") {
        const subscription = subscriptions.get(trpc.id);
        if (subscription) {
          try {
            subscription.unsubscribe();
            logger.debug("Subscription stopped", { id: trpc.id });
          } catch (error) {
            logger.error("Error stopping subscription", { id: trpc.id, error });
          } finally {
            subscriptions.delete(trpc.id);
          }
        } else {
          logger.warn("Subscription not found for stop", { id: trpc.id });
        }
        return;
      }

      // Create context
      const ctx = (await createContext?.()) || {};

      // Handle regular requests
      if (trpc.method && trpc.params) {
        const { path, input } = trpc.params;

        try {
          const deserializedInput = transformer.deserialize(input);

          // Create a caller with the context
          const caller = createCaller(ctx);

          // Parse the path and call the procedure
          const pathParts = path.split(".");
          let procedure: unknown = caller;

          for (const part of pathParts) {
            if (typeof procedure !== "object" || procedure === null) {
              throw new TRPCError({
                code: "NOT_FOUND",
                message: `Procedure ${path} not found - invalid path at ${part}`,
              });
            }
            procedure = (procedure as Record<string, unknown>)[part];
            if (!procedure) {
              throw new TRPCError({
                code: "NOT_FOUND",
                message: `Procedure ${path} not found`,
              });
            }
          }

          // Call the procedure based on its type
          let result: unknown;
          if (trpc.method === "query" || trpc.method === "mutation") {
            result = await (procedure as (input: unknown) => Promise<unknown>)(
              deserializedInput,
            );
          } else if (trpc.method === "subscription") {
            result = await (procedure as (input: unknown) => Promise<unknown>)(
              deserializedInput,
            );
          } else {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Unknown method type: ${trpc.method}`,
            });
          }

          // Handle subscriptions
          if (trpc.method === "subscription" && isObservable(result)) {
            const subscription = result.subscribe({
              next(data) {
                const response: ExtensionMessage = {
                  trpc: {
                    id: trpc.id,
                    result: {
                      type: "data",
                      data: transformer.serialize(data),
                    },
                  },
                };
                port.postMessage(response);
              },
              error(error) {
                const trcpError = getTRPCErrorFromUnknown(error);
                const formattedError = formatTRPCError(trcpError, path);
                const response: ExtensionMessage = {
                  trpc: {
                    id: trpc.id,
                    error: formattedError,
                  },
                };
                port.postMessage(response);
              },
              complete() {
                const response: ExtensionMessage = {
                  trpc: {
                    id: trpc.id,
                    result: {
                      type: "stopped",
                    },
                  },
                };
                port.postMessage(response);
                subscriptions.delete(trpc.id);
              },
            });

            subscriptions.set(trpc.id, subscription);

            // Send subscription started message
            const response: ExtensionMessage = {
              trpc: {
                id: trpc.id,
                result: {
                  type: "started",
                },
              },
            };
            port.postMessage(response);
          } else {
            // Handle query/mutation
            const response: ExtensionMessage = {
              trpc: {
                id: trpc.id,
                result: {
                  type: "data",
                  data: transformer.serialize(result),
                },
              },
            };
            port.postMessage(response);
          }
        } catch (cause) {
          const error = getTRPCErrorFromUnknown(cause);
          const duration = performance.now() - startTime;

          logger.error("Handler error", {
            id: trpc.id,
            path,
            error,
            duration: `${duration.toFixed(2)}ms`,
          });

          onError?.({
            error,
            type: trpc.method,
            path,
            input,
            ctx,
            req: port,
          });

          const formattedError = formatTRPCError(error, path);
          const response: ExtensionMessage = {
            trpc: {
              id: trpc.id,
              error: formattedError,
            },
          };
          logger.logMessage("send", response.trpc);
          port.postMessage(response);
        }
      }
    };

    // Add message listener
    port.onMessage.addListener(messageHandler);

    // Cleanup on disconnect
    port.onDisconnect.addListener(() => {
      logger.info("Port disconnecting, cleaning up subscriptions", {
        count: subscriptions.size,
      });

      // Safely unsubscribe all with error handling
      subscriptions.forEach((subscription, id) => {
        try {
          subscription.unsubscribe();
          logger.trace("Unsubscribed", { id });
        } catch (error) {
          logger.error("Error during cleanup", { id, error });
        }
      });

      subscriptions.clear();

      // Remove message handler
      port.onMessage.removeListener(messageHandler);

      logger.debug("Port cleanup completed");
    });
  });
}

/**
 * Helper to create tRPC client with extension link
 * @template TRouter - tRPC router type
 * @param {ExtensionLinkOptions} options - Client configuration options
 * @returns {Object} Object containing the configured link
 * @example
 * const client = createTRPCClient<AppRouter>({
 *   links: [createExtensionClient().link]
 * });
 */
export function createExtensionClient<TRouter extends AnyRouter>(
  options: ExtensionLinkOptions,
) {
  return {
    link: extensionLink<TRouter>(options),
  };
}
