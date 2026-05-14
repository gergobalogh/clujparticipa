/**
 * In-memory rate limiter for the MVP.
 * Keys are typically participant hashes or IP addresses.
 * Each bucket tracks request timestamps within a sliding window.
 */

interface Bucket {
  timestamps: number[];
}

const buckets = new Map<string, Bucket>();

// Clean up expired buckets every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, bucket] of buckets) {
    bucket.timestamps = bucket.timestamps.filter(
      (t) => now - t < 60 * 1000 // drop entries older than 1 minute
    );
    if (bucket.timestamps.length === 0) {
      buckets.delete(key);
    }
  }
}

export interface RateLimitOptions {
  /** Maximum requests allowed within the window */
  maxRequests: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

const DEFAULT_OPTIONS: RateLimitOptions = {
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minute
};

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check whether a key is within rate limits.
 * Call this before processing the request.
 */
export function checkRateLimit(
  key: string,
  options: RateLimitOptions = DEFAULT_OPTIONS
): RateLimitResult {
  cleanup();

  const now = Date.now();
  const windowStart = now - options.windowMs;

  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { timestamps: [] };
    buckets.set(key, bucket);
  }

  // Remove timestamps outside the current window
  bucket.timestamps = bucket.timestamps.filter((t) => t > windowStart);

  const remaining = Math.max(0, options.maxRequests - bucket.timestamps.length);

  if (bucket.timestamps.length >= options.maxRequests) {
    const oldestInWindow = bucket.timestamps[0];
    return {
      allowed: false,
      remaining: 0,
      resetAt: oldestInWindow + options.windowMs,
    };
  }

  bucket.timestamps.push(now);
  return {
    allowed: true,
    remaining: remaining - 1,
    resetAt: now + options.windowMs,
  };
}

/** Pre-configured rate limits for different endpoint types */
export const RATE_LIMITS = {
  /** For idea creation */
  create: { maxRequests: 5, windowMs: 60 * 1000 },
  /** For voting */
  vote: { maxRequests: 20, windowMs: 60 * 1000 },
  /** For commenting */
  comment: { maxRequests: 10, windowMs: 60 * 1000 },
  /** For listing (more generous) */
  read: { maxRequests: 60, windowMs: 60 * 1000 },
  /** For bug reports */
  bugReport: { maxRequests: 3, windowMs: 60 * 1000 },
} as const;
