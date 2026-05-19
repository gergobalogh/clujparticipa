import { describe, it, expect } from "vitest";

// This test verifies the categoryOgColors extension to category-colors.ts.
// ImageResponse requires hex colors — Tailwind classes cannot be used.

describe("categoryOgColors — hex color mapping for ImageResponse", () => {
  it("maps every category to a hex color string", async () => {
    const { categoryOgColors } = await import("@/lib/category-colors");

    const categories = [
      "INFRASTRUCTURE",
      "EDUCATION",
      "ENVIRONMENT",
      "CULTURE",
      "SAFETY",
      "TRANSPORT",
      "HEALTH",
      "OTHER",
    ];

    for (const cat of categories) {
      expect(categoryOgColors[cat]).toBeDefined();
      expect(categoryOgColors[cat]).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it("resolveCategoryOgColor falls back to OTHER for unknown categories", async () => {
    const { resolveCategoryOgColor, categoryOgColors } = await import(
      "@/lib/category-colors"
    );
    expect(resolveCategoryOgColor("NONEXISTENT")).toBe(
      categoryOgColors.OTHER
    );
  });

  it("TRANSPORT maps to cyan hex color #06B6D4", async () => {
    const { categoryOgColors } = await import("@/lib/category-colors");
    expect(categoryOgColors.TRANSPORT).toBe("#06B6D4");
  });
});
