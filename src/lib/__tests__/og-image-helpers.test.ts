import { describe, it, expect } from "vitest";
import { truncateOgTitle } from "@/lib/og-image-helpers";

describe("truncateOgTitle — OG image title truncation", () => {
  it("S13: returns title unchanged when under 80 characters", () => {
    const title = "New bike lane on Dorobantilor";
    expect(truncateOgTitle(title)).toBe(title);
  });

  it("S13: truncates title at 80 characters with ellipsis", () => {
    const title = "A".repeat(100);
    const result = truncateOgTitle(title);
    expect(result.length).toBe(83); // 80 chars + "..."
    expect(result).toMatch(/\.\.\.$/);
    expect(result.slice(0, 80)).toBe("A".repeat(80));
  });

  it("S13: does not truncate title at exactly 80 characters", () => {
    const title = "B".repeat(80);
    expect(truncateOgTitle(title)).toBe(title);
  });

  it("S13: truncates title at 81 characters", () => {
    const title = "C".repeat(81);
    const result = truncateOgTitle(title);
    expect(result.length).toBe(83); // 80 + "..."
    expect(result).toMatch(/\.\.\.$/);
  });

  it("S13: handles empty string", () => {
    expect(truncateOgTitle("")).toBe("");
  });

  it("S13: handles single character", () => {
    expect(truncateOgTitle("X")).toBe("X");
  });
});
