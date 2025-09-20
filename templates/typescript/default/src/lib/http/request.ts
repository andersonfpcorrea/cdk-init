import { setTimeout as sleep } from "node:timers/promises";

import type { Dispatcher} from "undici";
import { request as undiciRequest } from "undici";

import { retryableStatusCodes } from "./constants";

type RetryOptions = {
  /**
   * Maximum number of retry attempts
   * @default 3
   */
  maxRetries?: number;

  /**
   * Initial delay in milliseconds before first retry
   * @default 1000
   */
  initialDelay?: number;

  /**
   * Maximum delay in milliseconds between retries
   * @default 30000
   */
  maxDelay?: number;

  /**
   * Backoff multiplier for exponential backoff
   * @default 2
   */
  backoffMultiplier?: number;

  /**
   * HTTP status codes that should trigger a retry
   * @default [408, 429, 500, 502, 503, 504]
   */
  retryableStatusCodes?: number[];

  /**
   * Whether to retry on network errors
   * @default true
   */
  retryOnNetworkError?: boolean;

  /**
   * Custom function to determine if a response should be retried
   */
  shouldRetry?: (error: unknown, attempt: number) => boolean;

  /**
   * Callback function called before each retry attempt
   */
  onRetry?: (error: unknown, attempt: number) => void;
};

const DEFAULT_RETRY_OPTIONS: Required<
  Omit<RetryOptions, "shouldRetry" | "onRetry">
> = {
  maxRetries: 2,
  initialDelay: 500,
  maxDelay: 10_000,
  backoffMultiplier: 2,
  retryableStatusCodes,
  retryOnNetworkError: true,
};

/**
 * Calculate delay for next retry using exponential backoff with jitter
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  multiplier: number,
): number {
  // Exponential backoff: delay = initialDelay * (multiplier ^ attempt)
  const exponentialDelay = initialDelay * Math.pow(multiplier, attempt);

  // Cap at maxDelay
  const cappedDelay = Math.min(exponentialDelay, maxDelay);

  // Add jitter (±10%) to prevent thundering herd
  const jitter = cappedDelay * 0.1;
  return cappedDelay + (Math.random() * 2 - 1) * jitter;
}

/**
 * Network error codes that should trigger a retry
 * Based on Node.js common system errors that are network-related
 * https://nodejs.org/api/errors.html#common-system-errors
 */
const NETWORK_ERROR_CODES = [
  "ECONNREFUSED", // Connection refused
  "ECONNRESET", // Connection reset by peer
  "ENOTFOUND", // DNS lookup failed
  "ETIMEDOUT", // Operation timed out
  "EPIPE", // Broken pipe
] as const;

type NetworkErrorCode = (typeof NETWORK_ERROR_CODES)[number];

/**
 * Check if an error is a network error that should trigger a retry
 */
function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const nodeError = error as NodeJS.ErrnoException;
    if (
      nodeError.code &&
      NETWORK_ERROR_CODES.includes(nodeError.code as NetworkErrorCode)
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Undici request with automatic retry logic
 *
 * @example
 * ```typescript
 * // Simple usage with defaults
 * const response = await request('https://api.example.com/data');
 * ```
 *
 * @example
 * ```typescript
 * // With custom retry options
 * const response = await request('https://api.example.com/data',
 *   {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ key: 'value' })
 *   },
 *   {
 *     maxRetries: 5,
 *     initialDelay: 500,
 *     retryableStatusCodes: [429, 500, 502, 503, 504],
 *     onRetry: (error, attempt) => {
 *       console.log(`Retry attempt ${attempt} after error:`, error);
 *     }
 *   }
 * );
 * ```
 *
 * @example
 * ```typescript
 * // With custom retry logic
 * const response = await request('https://api.example.com/data',
 *   { method: 'GET' },
 *   {
 *     shouldRetry: (error, attempt) => {
 *       // Custom logic: only retry if specific error message
 *       if (error instanceof Error && error.message.includes('timeout')) {
 *         return attempt < 2; // Only retry timeouts twice
 *       }
 *       return false;
 *     }
 *   }
 * );
 * ```
 *
 * @param url - The URL to request
 * @param options - Standard Undici request options
 * @param retryOptions - Optional retry configuration
 * @returns Promise resolving to Undici ResponseData
 * @throws Will throw the last error if all retries are exhausted
 */
export async function request(
  url: Parameters<typeof undiciRequest>[0],
  options?: Parameters<typeof undiciRequest>[1],
  retryOptions?: RetryOptions,
) {
  const config = {
    ...DEFAULT_RETRY_OPTIONS,
    ...retryOptions,
  };

  let lastError: unknown;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const response = await undiciRequest(url, options);

      // Check if we should retry based on status code
      if (
        config.retryableStatusCodes.includes(response.statusCode) &&
        attempt < config.maxRetries
      ) {
        const error = new Error(
          `HTTP ${response.statusCode}: ${
            response.statusCode >= 500 ? "Server Error" : "Request Error"
          }`,
        );
        (error as Error & { statusCode: number }).statusCode =
          response.statusCode;
        (
          error as Error & { response: Dispatcher.ResponseData<unknown> }
        ).response = response;

        // Check custom retry condition
        if (config.shouldRetry && !config.shouldRetry(error, attempt)) {
          return response;
        }

        // Trigger retry callback
        config.onRetry?.(error, attempt + 1);

        // Calculate and apply delay
        const delay = calculateDelay(
          attempt,
          config.initialDelay,
          config.maxDelay,
          config.backoffMultiplier,
        );
        await sleep(delay);

        lastError = error;
        continue;
      }

      // Success or non-retryable status code
      return response;
    } catch (error) {
      lastError = error;

      // Check if we should retry this error
      const shouldRetryError =
        attempt < config.maxRetries &&
        ((config.retryOnNetworkError && isNetworkError(error)) ||
          (config.shouldRetry?.(error, attempt) ?? false));

      if (shouldRetryError) {
        // Trigger retry callback
        config.onRetry?.(error, attempt + 1);

        // Calculate and apply delay
        const delay = calculateDelay(
          attempt,
          config.initialDelay,
          config.maxDelay,
          config.backoffMultiplier,
        );
        await sleep(delay);
        continue;
      }

      // Don't retry, re-throw the error
      throw error;
    }
  }

  // All retries exhausted
  throw lastError;
}
