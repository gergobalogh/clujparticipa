import { describe, it, expect } from "vitest";
import { hashParticipantToken, validateParticipantToken } from "./participant";

describe("participant", () => {
  describe("hashParticipantToken", () => {
    it("returns a 64-character hex string", async () => {
      const hash = await hashParticipantToken("some-test-token-value");
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[0-9a-f]+$/);
    });

    it("is deterministic — same input produces same output", async () => {
      const hash1 = await hashParticipantToken("deterministic-token");
      const hash2 = await hashParticipantToken("deterministic-token");
      expect(hash1).toBe(hash2);
    });

    it("different inputs produce different hashes", async () => {
      const hash1 = await hashParticipantToken("token-alpha");
      const hash2 = await hashParticipantToken("token-beta");
      expect(hash1).not.toBe(hash2);
    });

    it("hashes empty string without error", async () => {
      const hash = await hashParticipantToken("");
      expect(hash).toHaveLength(64);
    });
  });

  describe("validateParticipantToken", () => {
    it("returns null for valid token (16+ chars)", () => {
      expect(validateParticipantToken("a-very-valid-token-1234")).toBeNull();
    });

    it("returns error key for short token (15 chars)", () => {
      expect(validateParticipantToken("123456789012345")).toBe("ApiErrors.invalidParticipantToken");
    });

    it("returns error key for empty string", () => {
      expect(validateParticipantToken("")).toBe("ApiErrors.invalidParticipantToken");
    });

    it("returns error key for whitespace-only string of 16+ chars", () => {
      expect(validateParticipantToken("                ")).toBe("ApiErrors.invalidParticipantToken");
    });

    it("returns error key for non-string input", () => {
      expect(validateParticipantToken(12345)).toBe("ApiErrors.invalidParticipantToken");
      expect(validateParticipantToken(null)).toBe("ApiErrors.invalidParticipantToken");
      expect(validateParticipantToken(undefined)).toBe("ApiErrors.invalidParticipantToken");
    });

    it("accepts exactly 16 characters", () => {
      expect(validateParticipantToken("1234567890123456")).toBeNull();
    });
  });
});
