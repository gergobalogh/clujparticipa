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
    it("IN_VOTING at 35 days is stalled with correct days and label", () => {
      const result = detectStalledIdea("IN_VOTING", daysAgo(35, now), now);
      expect(result.isStalled).toBe(true);
      expect(result.daysSinceLastChange).toBe(35);
      expect(result.waitingForLabel).toBe("waitingForVotingPeriod");
    });

    it("IN_VOTING at 15 days is not stalled", () => {
      const result = detectStalledIdea("IN_VOTING", daysAgo(15, now), now);
      expect(result.isStalled).toBe(false);
    });

    it("COMPLETED at 60 days is never stalled", () => {
      const result = detectStalledIdea("COMPLETED", daysAgo(60, now), now);
      expect(result.isStalled).toBe(false);
    });

    it("SELECTED at 40 days has waitingForLabel 'waitingForSelection'", () => {
      const result = detectStalledIdea("SELECTED", daysAgo(40, now), now);
      expect(result.waitingForLabel).toBe("waitingForSelection");
    });

    it("ACCEPTED at 35 days is stalled with waitingForImplementation label", () => {
      const result = detectStalledIdea("ACCEPTED", daysAgo(35, now), now);
      expect(result.isStalled).toBe(true);
      expect(result.waitingForLabel).toBe("waitingForImplementation");
    });
  });

  describe("stall eligibility by status", () => {
    const neverStalled: Status[] = [
      "SUBMITTED",
      "COMPLETED",
      "REJECTED",
      "NEEDS_REVISION",
      "MERGED",
      "WITHDRAWN",
    ];
    const stallEligible: Status[] = [
      "IN_VOTING",
      "SELECTED",
      "ACCEPTED",
      "IN_PROGRESS",
    ];

    it("SUBMITTED, COMPLETED, REJECTED, NEEDS_REVISION, MERGED, WITHDRAWN are never stalled even after 60 days", () => {
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

  describe("legacy statuses are never stalled", () => {
    it("UNDER_REVIEW and ELIGIBLE are never stalled even after 60 days", () => {
      expect(detectStalledIdea("UNDER_REVIEW", daysAgo(60, now), now).isStalled).toBe(false);
      expect(detectStalledIdea("ELIGIBLE", daysAgo(60, now), now).isStalled).toBe(false);
    });

    it("UNDER_REVIEW and ELIGIBLE have empty waiting labels", () => {
      expect(detectStalledIdea("UNDER_REVIEW", daysAgo(60, now), now).waitingForLabel).toBe("");
      expect(detectStalledIdea("ELIGIBLE", daysAgo(60, now), now).waitingForLabel).toBe("");
    });
  });

  describe("30-day threshold boundary", () => {
    it("exactly 30 days is stalled, 29 days is not", () => {
      const at30 = detectStalledIdea("IN_VOTING", daysAgo(30, now), now);
      const at29 = detectStalledIdea("IN_VOTING", daysAgo(29, now), now);
      expect(at30.isStalled).toBe(true);
      expect(at29.isStalled).toBe(false);
    });
  });

  describe("waiting labels per status", () => {
    const expectedLabels: [Status, string][] = [
      ["IN_VOTING", "waitingForVotingPeriod"],
      ["SELECTED", "waitingForSelection"],
      ["ACCEPTED", "waitingForImplementation"],
      ["IN_PROGRESS", "waitingForImplementation"],
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
        "IN_VOTING",
        daysAgo(31, referenceNow),
        referenceNow
      );
      expect(result.isStalled).toBe(true);
      expect(result.daysSinceLastChange).toBe(31);
    });
  });

  describe("daysSinceLastChange calculation", () => {
    it("returns 0 for same date, 1 for yesterday", () => {
      const sameDay = detectStalledIdea("IN_VOTING", now, now);
      const yesterday = detectStalledIdea(
        "IN_VOTING",
        daysAgo(1, now),
        now
      );
      expect(sameDay.daysSinceLastChange).toBe(0);
      expect(yesterday.daysSinceLastChange).toBe(1);
    });
  });
});
