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

  it("TRANSPORT maps to a cyan-family hex color", async () => {
    const { categoryOgColors } = await import("@/lib/category-colors");
    // Tailwind cyan-700 is roughly #0e7490
    expect(categoryOgColors.TRANSPORT).toMatch(/^#0e7490$/i);
  });
});
