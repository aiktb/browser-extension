/**
 * Error handling utilities for tRPC browser extension messaging
 * Implements JSON-RPC 2.0 compliant error formatting
 */

import { TRPCError } from "@trpc/server";
import { TRPC_ERROR_CODE_KEY } from "@trpc/server/unstable-core-do-not-import";

/**
 * JSON-RPC 2.0 error codes
 * @see https://www.jsonrpc.org/specification#error_object
 */
export const JSON_RPC_ERROR_CODES = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
  // Server error codes reserved from -32000 to -32099
  SERVER_ERROR: -32000,
} as const;

/**
 * Map tRPC error codes to HTTP status codes
 * @param {string} code - tRPC error code
 * @returns {number} HTTP status code
 */
export function getHTTPStatusFromTRPCError(code: TRPC_ERROR_CODE_KEY): number {
  const statusMap: Record<TRPC_ERROR_CODE_KEY, number> = {
    PARSE_ERROR: 400,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    PAYMENT_REQUIRED: 402,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    TIMEOUT: 408,
    CONFLICT: 409,
    PRECONDITION_FAILED: 412,
    PAYLOAD_TOO_LARGE: 413,
    UNPROCESSABLE_CONTENT: 422,
    TOO_MANY_REQUESTS: 429,
    CLIENT_CLOSED_REQUEST: 499,
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
    // Custom codes
    METHOD_NOT_SUPPORTED: 405,
    UNSUPPORTED_MEDIA_TYPE: 415,
  };

  return statusMap[code] || 500;
}

/**
 * Get JSON-RPC error code from tRPC error
 * @param {string} code - tRPC error code
 * @returns {number} JSON-RPC error code
 */
export function getJSONRPCErrorCode(code: TRPC_ERROR_CODE_KEY): number {
  const codeMap: Partial<Record<TRPC_ERROR_CODE_KEY, number>> = {
    PARSE_ERROR: JSON_RPC_ERROR_CODES.PARSE_ERROR,
    BAD_REQUEST: JSON_RPC_ERROR_CODES.INVALID_REQUEST,
    NOT_FOUND: JSON_RPC_ERROR_CODES.METHOD_NOT_FOUND,
    INTERNAL_SERVER_ERROR: JSON_RPC_ERROR_CODES.INTERNAL_ERROR,
    METHOD_NOT_SUPPORTED: JSON_RPC_ERROR_CODES.METHOD_NOT_FOUND,
  };

  return codeMap[code] || JSON_RPC_ERROR_CODES.INTERNAL_ERROR;
}

/**
 * Format error for transmission with JSON-RPC 2.0 compliance
 * @param {unknown} error - Error to format
 * @param {string} [path] - Procedure path where error occurred
 * @returns {object} Formatted error object
 */
export function formatTRPCError(
  error: unknown,
  path?: string,
): {
  code: number;
  message: string;
  data?: {
    code: TRPC_ERROR_CODE_KEY;
    httpStatus: number;
    stack?: string;
    path?: string;
    cause?: unknown;
  };
} {
  let trcpError: TRPCError;

  if (error instanceof TRPCError) {
    trcpError = error;
  } else if (error instanceof Error) {
    trcpError = new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: error.message,
      cause: error,
    });
  } else {
    trcpError = new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: String(error),
      cause: error,
    });
  }

  const isDev = import.meta.env?.DEV ?? false;

  return {
    code: getJSONRPCErrorCode(trcpError.code),
    message: trcpError.message,
    data: {
      code: trcpError.code,
      httpStatus: getHTTPStatusFromTRPCError(trcpError.code),
      // Only include stack trace in development
      stack: isDev ? trcpError.stack : undefined,
      path,
      // Include cause in development for debugging
      cause: isDev ? trcpError.cause : undefined,
    },
  };
}

/**
 * Create a timeout error with proper formatting
 * @param {number} timeout - Timeout duration in milliseconds
 * @param {string} [path] - Procedure path that timed out
 * @returns {TRPCError} Formatted timeout error
 */
export function createTimeoutError(timeout: number, path?: string): TRPCError {
  return new TRPCError({
    code: "TIMEOUT",
    message: `Request timed out after ${timeout}ms${path ? ` for ${path}` : ""}`,
  });
}

/**
 * Create a disconnection error
 * @param {string} [reason] - Reason for disconnection
 * @returns {TRPCError} Formatted disconnection error
 */
export function createDisconnectionError(reason?: string): TRPCError {
  return new TRPCError({
    code: "CLIENT_CLOSED_REQUEST",
    message: `Connection closed${reason ? `: ${reason}` : ""}`,
  });
}
