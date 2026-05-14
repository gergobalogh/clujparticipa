import { describe, it, expect } from "vitest";
import { detectStalledIdea } from "../stalled-detector";
import type { Status } from "@prisma/client";

function daysAgo(days: number, now: Date): Date {
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  return date;
}

describe("detectStalledIdea", () => {
  const now = new Date("2025-06-15T12:00:00Z");

  describe("acceptance criteria", () => {
    it("UNDER_REVIEW at 35 days is stalled with correct days and label", () => {
      const result = detectStalledIdea("UNDER_REVIEW", daysAgo(35, now), now);
      expect(result.isStalled).toBe(true);
      expect(result.daysSinceLastChange).toBe(35);
      expect(result.waitingForLabel).toBe("City department review");
    });

    it("UNDER_REVIEW at 15 days is not stalled", () => {
      const result = detectStalledIdea("UNDER_REVIEW", daysAgo(15, now), now);
      expect(result.isStalled).toBe(false);
    });

    it("COMPLETED at 60 days is never stalled", () => {
      const result = detectStalledIdea("COMPLETED", daysAgo(60, now), now);
      expect(result.isStalled).toBe(false);
    });

    it("ELIGIBLE at 40 days has waitingForLabel 'Eligibility assessment'", () => {
      const result = detectStalledIdea("ELIGIBLE", daysAgo(40, now), now);
      expect(result.waitingForLabel).toBe("Eligibility assessment");
    });
  });

  describe("stall eligibility by status", () => {
    const neverStalled: Status[] = ["SUBMITTED", "COMPLETED", "REJECTED"];
    const stallEligible: Status[] = [
      "UNDER_REVIEW",
      "ELIGIBLE",
      "IN_VOTING",
      "SELECTED",
      "IN_PROGRESS",
    ];

    it("SUBMITTED, COMPLETED, REJECTED are never stalled even after 60 days", () => {
      for (const status of neverStalled) {
        const result = detectStalledIdea(status, daysAgo(60, now), now);
        expect(result.isStalled, `${status} should not be stalled`).toBe(false);
        expect(
          result.waitingForLabel,
          `${status} should have empty label`
        ).toBe("");
      }
    });

    it("stall-eligible statuses are stalled after 30 days", () => {
      for (const status of stallEligible) {
        const result = detectStalledIdea(status, daysAgo(30, now), now);
        expect(result.isStalled, `${status} should be stalled at 30 days`).toBe(
          true
        );
      }
    });
  });

  describe("30-day threshold boundary", () => {
    it("exactly 30 days is stalled, 29 days is not", () => {
      const at30 = detectStalledIdea("UNDER_REVIEW", daysAgo(30, now), now);
      const at29 = detectStalledIdea("UNDER_REVIEW", daysAgo(29, now), now);
      expect(at30.isStalled).toBe(true);
      expect(at29.isStalled).toBe(false);
    });
  });

  describe("waiting labels per upstream-issues.md", () => {
    const expectedLabels: [Status, string][] = [
      ["UNDER_REVIEW", "City department review"],
      ["ELIGIBLE", "Eligibility assessment"],
      ["IN_VOTING", "Public voting period"],
      ["SELECTED", "Selection for implementation"],
      ["IN_PROGRESS", "Implementation in progress"],
    ];

    it("maps each stall-eligible status to its correct label", () => {
      for (const [status, label] of expectedLabels) {
        const result = detectStalledIdea(status, daysAgo(35, now), now);
        expect(result.waitingForLabel, `label for ${status}`).toBe(label);
      }
    });
  });

  describe("custom now parameter", () => {
    it("uses the provided now date instead of system time", () => {
      const referenceNow = new Date("2025-01-01T00:00:00Z");
      const result = detectStalledIdea(
        "UNDER_REVIEW",
        daysAgo(31, referenceNow),
        referenceNow
      );
      expect(result.isStalled).toBe(true);
      expect(result.daysSinceLastChange).toBe(31);
    });
  });

  describe("daysSinceLastChange calculation", () => {
    it("returns 0 for same date, 1 for yesterday", () => {
      const sameDay = detectStalledIdea("UNDER_REVIEW", now, now);
      const yesterday = detectStalledIdea(
        "UNDER_REVIEW",
        daysAgo(1, now),
        now
      );
      expect(sameDay.daysSinceLastChange).toBe(0);
      expect(yesterday.daysSinceLastChange).toBe(1);
    });
  });
});
