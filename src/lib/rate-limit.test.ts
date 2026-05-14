import { describe, it, expect, beforeEach, vi } from "vitest";
import { checkRateLimit, RATE_LIMITS, _resetBuckets } from "./rate-limit";

describe("rate-limit", () => {
  beforeEach(() => {
    _resetBuckets();
  });

  describe("checkRateLimit", () => {
    it("allows first request and decrements remaining", () => {
      const result = checkRateLimit("test-key", { maxRequests: 5, windowMs: 60_000 });
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it("blocks after maxRequests reached", () => {
      const opts = { maxRequests: 3, windowMs: 60_000 };
      checkRateLimit("test-key", opts);
      checkRateLimit("test-key", opts);
      checkRateLimit("test-key", opts);
      const result = checkRateLimit("test-key", opts);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it("independent keys have independent buckets", () => {
      const opts = { maxRequests: 2, windowMs: 60_000 };
      checkRateLimit("key-a", opts);
      checkRateLimit("key-a", opts);
      const resultA = checkRateLimit("key-a", opts);
      expect(resultA.allowed).toBe(false);

      const resultB = checkRateLimit("key-b", opts);
      expect(resultB.allowed).toBe(true);
    });

    it("resetAt is a future timestamp when blocked", () => {
      const opts = { maxRequests: 1, windowMs: 60_000 };
      checkRateLimit("test-key", opts);
      const blocked = checkRateLimit("test-key", opts);
      expect(blocked.resetAt).toBeGreaterThan(Date.now());
    });

    it("allows requests again after window expires", () => {
      vi.useFakeTimers();
      const opts = { maxRequests: 2, windowMs: 10_000 };

      checkRateLimit("test-key", opts);
      checkRateLimit("test-key", opts);
      expect(checkRateLimit("test-key", opts).allowed).toBe(false);

      vi.advanceTimersByTime(10_001);
      expect(checkRateLimit("test-key", opts).allowed).toBe(true);

      vi.useRealTimers();
    });
  });

  describe("RATE_LIMITS", () => {
    it("has correct create limit", () => {
      expect(RATE_LIMITS.create.maxRequests).toBe(5);
      expect(RATE_LIMITS.create.windowMs).toBe(60_000);
    });

    it("has correct vote limit", () => {
      expect(RATE_LIMITS.vote.maxRequests).toBe(20);
      expect(RATE_LIMITS.vote.windowMs).toBe(60_000);
    });

    it("has correct comment limit", () => {
      expect(RATE_LIMITS.comment.maxRequests).toBe(10);
      expect(RATE_LIMITS.comment.windowMs).toBe(60_000);
    });

    it("has correct read limit", () => {
      expect(RATE_LIMITS.read.maxRequests).toBe(60);
      expect(RATE_LIMITS.read.windowMs).toBe(60_000);
    });

    it("has correct bugReport limit", () => {
      expect(RATE_LIMITS.bugReport.maxRequests).toBe(3);
      expect(RATE_LIMITS.bugReport.windowMs).toBe(60_000);
    });
  });

  describe("_resetBuckets", () => {
    it("clears all buckets allowing requests again", () => {
      const opts = { maxRequests: 1, windowMs: 60_000 };
      checkRateLimit("test-key", opts);
      expect(checkRateLimit("test-key", opts).allowed).toBe(false);

      _resetBuckets();
      expect(checkRateLimit("test-key", opts).allowed).toBe(true);
    });
  });
});
