import { describe, it, expect } from "vitest";
import {
  IMAGE_MAX_COUNT,
  IMAGE_MAX_SIZE_BYTES,
  IMAGE_ALLOWED_MIME_TYPES,
  IMAGE_ALLOWED_EXTENSIONS,
  CLOUDFLARE_IMAGE_BASE,
  isAllowedMimeType,
} from "./image-validation";

describe("image-validation", () => {
  describe("isAllowedMimeType", () => {
    it("allows jpeg", () => {
      expect(isAllowedMimeType("image/jpeg")).toBe(true);
    });

    it("allows png", () => {
      expect(isAllowedMimeType("image/png")).toBe(true);
    });

    it("allows webp", () => {
      expect(isAllowedMimeType("image/webp")).toBe(true);
    });

    it("rejects gif", () => {
      expect(isAllowedMimeType("image/gif")).toBe(false);
    });

    it("rejects pdf", () => {
      expect(isAllowedMimeType("application/pdf")).toBe(false);
    });

    it("rejects empty string", () => {
      expect(isAllowedMimeType("")).toBe(false);
    });
  });

  describe("constants", () => {
    it("IMAGE_MAX_COUNT is 5", () => {
      expect(IMAGE_MAX_COUNT).toBe(5);
    });

    it("IMAGE_MAX_SIZE_BYTES is 5 MB", () => {
      expect(IMAGE_MAX_SIZE_BYTES).toBe(5 * 1024 * 1024);
    });

    it("IMAGE_ALLOWED_MIME_TYPES contains exactly jpeg, png, webp", () => {
      expect(IMAGE_ALLOWED_MIME_TYPES).toEqual(["image/jpeg", "image/png", "image/webp"]);
    });

    it("IMAGE_ALLOWED_EXTENSIONS contains expected values", () => {
      expect(IMAGE_ALLOWED_EXTENSIONS).toEqual([".jpg", ".jpeg", ".png", ".webp"]);
    });

    it("CLOUDFLARE_IMAGE_BASE is the Cloudflare delivery URL prefix", () => {
      expect(CLOUDFLARE_IMAGE_BASE).toBe("https://imagedelivery.net/");
      expect(CLOUDFLARE_IMAGE_BASE).toMatch(/^https:\/\//);
    });
  });
});
