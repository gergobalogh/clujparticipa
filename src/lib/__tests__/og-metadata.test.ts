import { describe, it, expect } from "vitest";
import { buildOgDescription } from "@/lib/og-metadata";

describe("buildOgDescription", () => {
  it("truncates description to 160 chars with ellipsis when exceeded", () => {
    const longDesc = "A".repeat(200);
    const result = buildOgDescription({
      description: longDesc,
      title: "Some title",
      category: "Infrastructure",
      district: "Gheorgheni",
    });

    const suffix = " — Infrastructure, Gheorgheni";
    const descWithoutSuffix = result.slice(0, result.length - suffix.length);
    expect(descWithoutSuffix.length).toBe(163); // 160 + "..."
    expect(descWithoutSuffix).toMatch(/\.\.\.$/);
    expect(result).toContain("Infrastructure");
    expect(result).toContain("Gheorgheni");
  });

  it("does not truncate short descriptions", () => {
    const result = buildOgDescription({
      description: "A short description",
      title: "Some title",
      category: "Education",
      district: "Centru",
    });

    expect(result).toContain("A short description");
    expect(result).toContain("Education");
    expect(result).toContain("Centru");
    expect(result).not.toMatch(/\.\.\./);
  });

  it("uses title as fallback when description is empty string", () => {
    const result = buildOgDescription({
      description: "",
      title: "My Great Idea",
      category: "Safety",
      district: "Manastur",
    });

    expect(result).toContain("My Great Idea");
    expect(result).toContain("Safety");
    expect(result).toContain("Manastur");
  });

  it("uses title as fallback when description is whitespace-only", () => {
    const result = buildOgDescription({
      description: "   ",
      title: "Whitespace Idea",
      category: "Transport",
      district: "Iris",
    });

    expect(result).toContain("Whitespace Idea");
    expect(result).not.toContain("   ");
  });

  it("handles description exactly at 160 chars (no truncation)", () => {
    const exactDesc = "B".repeat(160);
    const result = buildOgDescription({
      description: exactDesc,
      title: "Exact",
      category: "Health",
      district: "Gruia",
    });

    const suffix = " — Health, Gruia";
    const descWithoutSuffix = result.slice(0, result.length - suffix.length);
    expect(descWithoutSuffix.length).toBe(160);
    expect(descWithoutSuffix).not.toMatch(/\.\.\.$/);
  });

  it("handles description at 161 chars (truncates)", () => {
    const overDesc = "C".repeat(161);
    const result = buildOgDescription({
      description: overDesc,
      title: "Over",
      category: "Culture",
      district: "Zorilor",
    });

    const suffix = " — Culture, Zorilor";
    const descWithoutSuffix = result.slice(0, result.length - suffix.length);
    expect(descWithoutSuffix.length).toBe(163); // 160 + "..."
    expect(descWithoutSuffix).toMatch(/\.\.\.$/);
  });
});
