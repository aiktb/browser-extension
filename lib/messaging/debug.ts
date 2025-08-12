/**
 * Debug utilities for tRPC browser extension messaging
 * Provides logging and performance monitoring capabilities
 */

import type { TRPCMessage } from "./types";

/**
 * Debug levels for controlling log verbosity
 */
export enum DebugLevel {
  NONE = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  DEBUG = 4,
  TRACE = 5,
}

/**
 * Debug configuration options
 */
export interface DebugOptions {
  /** Enable debug logging */
  enabled?: boolean;
  /** Debug verbosity level */
  level?: DebugLevel;
  /** Log performance metrics */
  logPerformance?: boolean;
  /** Custom log prefix */
  prefix?: string;
  /** Custom logger implementation */
  logger?: {
    log: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    info: (...args: unknown[]) => void;
    debug: (...args: unknown[]) => void;
    trace: (...args: unknown[]) => void;
  };
}

/**
 * Performance tracking entry
 */
interface PerformanceEntry {
  operation: string;
  path: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status?: "success" | "error";
  error?: unknown;
}

/**
 * Debug logger class for tRPC messaging
 */
export class TRPCDebugger {
  private enabled: boolean;
  private level: DebugLevel;
  private logPerformance: boolean;
  private prefix: string;
  private logger: DebugOptions["logger"];
  private performanceEntries: Map<string, PerformanceEntry>;
  private maxEntries = 100;
  private entriesOrder: string[] = [];

  constructor(options: DebugOptions = {}) {
    const isDev = import.meta.env?.DEV ?? false;

    this.enabled = options.enabled ?? isDev;
    this.level = options.level ?? (isDev ? DebugLevel.DEBUG : DebugLevel.ERROR);
    this.logPerformance = options.logPerformance ?? isDev;
    this.prefix = options.prefix ?? "[tRPC Extension]";
    this.logger = options.logger ?? console;
    this.performanceEntries = new Map();
  }

  /**
   * Check if a log level is enabled
   */
  private isLevelEnabled(level: DebugLevel): boolean {
    return this.enabled && level <= this.level;
  }

  /**
   * Format log message with prefix and timestamp
   */
  private formatMessage(level: string, ...args: unknown[]): unknown[] {
    const timestamp = new Date().toISOString();
    return [`${this.prefix} ${timestamp} [${level}]`, ...args];
  }

  /**
   * Log error message
   */
  error(...args: unknown[]): void {
    if (this.isLevelEnabled(DebugLevel.ERROR) && this.logger) {
      this.logger.error(...this.formatMessage("ERROR", ...args));
    }
  }

  /**
   * Log warning message
   */
  warn(...args: unknown[]): void {
    if (this.isLevelEnabled(DebugLevel.WARN) && this.logger) {
      this.logger.warn(...this.formatMessage("WARN", ...args));
    }
  }

  /**
   * Log info message
   */
  info(...args: unknown[]): void {
    if (this.isLevelEnabled(DebugLevel.INFO) && this.logger) {
      this.logger.info(...this.formatMessage("INFO", ...args));
    }
  }

  /**
   * Log debug message
   */
  debug(...args: unknown[]): void {
    if (this.isLevelEnabled(DebugLevel.DEBUG) && this.logger) {
      this.logger.debug(...this.formatMessage("DEBUG", ...args));
    }
  }

  /**
   * Log trace message
   */
  trace(...args: unknown[]): void {
    if (this.isLevelEnabled(DebugLevel.TRACE) && this.logger) {
      this.logger.trace(...this.formatMessage("TRACE", ...args));
    }
  }

  /**
   * Log outgoing operation
   */
  logOperation(op: {
    type: string;
    path: string;
    input?: unknown;
    context?: unknown;
  }): void {
    if (this.isLevelEnabled(DebugLevel.DEBUG)) {
      this.debug("Operation", {
        type: op.type,
        path: op.path,
        input: op.input,
        context: op.context,
      });
    }
  }

  /**
   * Log tRPC message
   */
  logMessage(direction: "send" | "receive", message: TRPCMessage): void {
    if (this.isLevelEnabled(DebugLevel.TRACE)) {
      this.trace(`Message ${direction}`, {
        id: message.id,
        method: message.method,
        params: message.params,
        result: message.result,
        error: message.error,
      });
    }
  }

  /**
   * Start performance tracking for an operation
   */
  startPerformance(id: string, operation: string, path: string): void {
    if (!this.logPerformance) return;

    this.performanceEntries.set(id, {
      operation,
      path,
      startTime: performance.now(),
    });

    if (this.isLevelEnabled(DebugLevel.TRACE)) {
      this.trace("Performance tracking started", { id, operation, path });
    }
  }

  /**
   * End performance tracking for an operation
   */
  endPerformance(
    id: string,
    status: "success" | "error",
    error?: unknown,
  ): void {
    if (!this.logPerformance) return;

    const entry = this.performanceEntries.get(id);
    if (!entry) return;

    entry.endTime = performance.now();
    entry.duration = entry.endTime - entry.startTime;
    entry.status = status;
    entry.error = error;

    if (this.isLevelEnabled(DebugLevel.INFO)) {
      const perfData: Record<string, unknown> = {
        operation: entry.operation,
        path: entry.path,
        duration: `${entry.duration.toFixed(2)}ms`,
        status: entry.status,
      };
      if (error) {
        perfData.error = error;
      }
      this.info("Performance", perfData);
    }

    // Track order and clean up old entries
    this.entriesOrder.push(id);
    if (this.performanceEntries.size > this.maxEntries) {
      const oldestKey = this.entriesOrder.shift();
      if (oldestKey) {
        this.performanceEntries.delete(oldestKey);
      }
    }
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): {
    totalOperations: number;
    averageDuration: number;
    successRate: number;
    operations: Record<string, { count: number; avgDuration: number }>;
  } {
    const entries = Array.from(this.performanceEntries.values()).filter(
      (e) => e.duration !== undefined,
    );

    if (entries.length === 0) {
      return {
        totalOperations: 0,
        averageDuration: 0,
        successRate: 0,
        operations: {},
      };
    }

    const totalDuration = entries.reduce(
      (sum, e) => sum + (e.duration || 0),
      0,
    );
    const successCount = entries.filter((e) => e.status === "success").length;

    // Group by operation type
    const operations: Record<string, { count: number; totalDuration: number }> =
      {};
    for (const entry of entries) {
      const key = `${entry.operation}:${entry.path}`;
      if (!operations[key]) {
        operations[key] = { count: 0, totalDuration: 0 };
      }
      operations[key].count++;
      operations[key].totalDuration += entry.duration || 0;
    }

    // Calculate averages
    const operationStats: Record<
      string,
      { count: number; avgDuration: number }
    > = {};
    for (const [key, data] of Object.entries(operations)) {
      operationStats[key] = {
        count: data.count,
        avgDuration: data.totalDuration / data.count,
      };
    }

    return {
      totalOperations: entries.length,
      averageDuration: totalDuration / entries.length,
      successRate: (successCount / entries.length) * 100,
      operations: operationStats,
    };
  }

  /**
   * Clear performance entries
   */
  clearPerformance(): void {
    this.performanceEntries.clear();
    if (this.isLevelEnabled(DebugLevel.DEBUG)) {
      this.debug("Performance entries cleared");
    }
  }

  /**
   * Set debug level
   */
  setLevel(level: DebugLevel): void {
    this.level = level;
  }

  /**
   * Enable/disable debugging
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}

/**
 * Create a default debugger instance
 */
export function createDebugger(options?: DebugOptions): TRPCDebugger {
  return new TRPCDebugger(options);
}
