import { describe, it, expect } from "vitest";
import roHome from "@/i18n/messages/ro.json" assert { type: "json" };
import huHome from "@/i18n/messages/hu.json" assert { type: "json" };
import enHome from "@/i18n/messages/en.json" assert { type: "json" };

/**
 * Pure function: extract the COMPLETED count from the stats.statusCounts object.
 * This is the data transformation that feeds the completed-ideas stat card.
 */
let computeCompletedCount: (statusCounts: Record<string, number>) => number;

try {
  const mod = await import("../home-stats");
  computeCompletedCount = mod.computeCompletedCount;
} catch {
  // Module does not exist yet -- RED phase. Tests must fail.
  computeCompletedCount = () => {
    throw new Error("home-stats module not implemented");
  };
}

/**
 * Pure function: determine the zero-state message key based on total ideas
 * and whether the user is filtering by district.
 */
let resolveZeroState: (totalIdeas: number) => "noIdeasAtAll" | "noIdeas";

try {
  const mod = await import("../home-stats");
  resolveZeroState = mod.resolveZeroState;
} catch {
  resolveZeroState = () => {
    throw new Error("home-stats module not implemented");
  };
}

// ---------------------------------------------------------------------------
// Acceptance: computeCompletedCount
// ---------------------------------------------------------------------------

describe("computeCompletedCount", () => {
  it("extracts COMPLETED count from statusCounts", () => {
    const statusCounts = { SUBMITTED: 10, COMPLETED: 3, REJECTED: 1 };
    expect(computeCompletedCount(statusCounts)).toBe(3);
  });

  it("returns 0 when COMPLETED key is absent from statusCounts", () => {
    const statusCounts = { SUBMITTED: 5, UNDER_REVIEW: 2 };
    expect(computeCompletedCount(statusCounts)).toBe(0);
  });

  it("returns 0 when COMPLETED count is 0", () => {
    const statusCounts = { SUBMITTED: 5, COMPLETED: 0 };
    expect(computeCompletedCount(statusCounts)).toBe(0);
  });

  it("returns 0 when statusCounts is empty", () => {
    expect(computeCompletedCount({})).toBe(0);
  });

  it("handles a large completed count", () => {
    const statusCounts = { COMPLETED: 42 };
    expect(computeCompletedCount(statusCounts)).toBe(42);
  });
});

// ---------------------------------------------------------------------------
// Acceptance: resolveZeroState
// ---------------------------------------------------------------------------

describe("resolveZeroState", () => {
  it('returns "noIdeasAtAll" when totalIdeas is 0', () => {
    expect(resolveZeroState(0)).toBe("noIdeasAtAll");
  });

  it('returns "noIdeas" when totalIdeas is greater than 0', () => {
    expect(resolveZeroState(5)).toBe("noIdeas");
  });
});

// ---------------------------------------------------------------------------
// Acceptance: Locale key verification (i18n completeness)
// These tests verify that switching language will find ALL required keys
// in every locale file. If a key is missing in Hungarian, switching to
// Hungarian would show a fallback/raw key instead of translated text.
// ---------------------------------------------------------------------------

describe("Locale key completeness for Home namespace", () => {
  const requiredHomeKeys = [
    "title",
    "description",
    "submitIdea",
    "browseIdeas",
    "openMap",
    "totalIdeas",
    "totalVotes",
    "totalComments",
    "recentIdeas",
    "viewAll",
    "civicStatus",
    "completedIdeas",
    "beFirst",
    "noIdeasAtAll",
  ];

  it("has all required Home keys in Romanian", () => {
    const homeKeys = Object.keys(roHome.Home);
    for (const key of requiredHomeKeys) {
      expect(homeKeys).toContain(key);
    }
  });

  it("has all required Home keys in Hungarian", () => {
    const homeKeys = Object.keys(huHome.Home);
    for (const key of requiredHomeKeys) {
      expect(homeKeys).toContain(key);
    }
  });

  it("has all required Home keys in English", () => {
    const homeKeys = Object.keys(enHome.Home);
    for (const key of requiredHomeKeys) {
      expect(homeKeys).toContain(key);
    }
  });

  it("all three locales have exactly the same Home keys", () => {
    const roKeys = Object.keys(roHome.Home).sort();
    const huKeys = Object.keys(huHome.Home).sort();
    const enKeys = Object.keys(enHome.Home).sort();
    expect(huKeys).toEqual(roKeys);
    expect(enKeys).toEqual(roKeys);
  });

  it("Home.title references pipeline/progress concept in Romanian", () => {
    const title = roHome.Home.title.toLowerCase();
    const description = roHome.Home.description.toLowerCase();
    const hasPipelineReference =
      title.includes("pipeline") ||
      title.includes("parcurs") ||
      title.includes("progres") ||
      title.includes("traseu") ||
      description.includes("parcurs") ||
      description.includes("progres") ||
      description.includes("pipeline") ||
      description.includes("traseu") ||
      description.includes("urmărește");
    expect(hasPipelineReference).toBe(true);
  });

  it("Home.title references pipeline/progress concept in Hungarian", () => {
    const title = huHome.Home.title.toLowerCase();
    const description = huHome.Home.description.toLowerCase();
    const hasPipelineReference =
      title.includes("folyamat") ||
      title.includes("előrehalad") ||
      title.includes("nyomon követ") ||
      title.includes("pipeline") ||
      description.includes("folyamat") ||
      description.includes("előrehalad") ||
      description.includes("nyomon követ") ||
      description.includes("pipeline") ||
      description.includes("státusz");
    expect(hasPipelineReference).toBe(true);
  });

  it("Home.title references pipeline/progress concept in English", () => {
    const title = enHome.Home.title.toLowerCase();
    const description = enHome.Home.description.toLowerCase();
    const hasPipelineReference =
      title.includes("pipeline") ||
      title.includes("progress") ||
      title.includes("track") ||
      title.includes("journey") ||
      description.includes("pipeline") ||
      description.includes("progress") ||
      description.includes("track") ||
      description.includes("journey") ||
      description.includes("follow");
    expect(hasPipelineReference).toBe(true);
  });
});
