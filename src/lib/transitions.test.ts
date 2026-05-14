import { describe, it, expect } from "vitest";
import {
  VALID_TRANSITIONS,
  ALL_STATUSES,
  isValidTransition,
  getNextStatuses,
  VOTE_ELIGIBLE_STATUSES,
  SUPPORT_LABEL_STATUSES,
  QUICK_ACTIONS,
} from "./transitions";

describe("transitions", () => {
  describe("isValidTransition", () => {
    it("allows valid forward transitions", () => {
      expect(isValidTransition("SUBMITTED", "UNDER_REVIEW")).toBe(true);
      expect(isValidTransition("UNDER_REVIEW", "ELIGIBLE")).toBe(true);
      expect(isValidTransition("ELIGIBLE", "IN_VOTING")).toBe(true);
      expect(isValidTransition("IN_VOTING", "SELECTED")).toBe(true);
      expect(isValidTransition("SELECTED", "IN_PROGRESS")).toBe(true);
      expect(isValidTransition("IN_PROGRESS", "COMPLETED")).toBe(true);
    });

    it("allows rejecting from most statuses", () => {
      expect(isValidTransition("SUBMITTED", "REJECTED")).toBe(true);
      expect(isValidTransition("UNDER_REVIEW", "REJECTED")).toBe(true);
      expect(isValidTransition("ELIGIBLE", "REJECTED")).toBe(true);
      expect(isValidTransition("IN_VOTING", "REJECTED")).toBe(true);
    });

    it("allows reopening from REJECTED", () => {
      expect(isValidTransition("REJECTED", "UNDER_REVIEW")).toBe(true);
    });

    it("blocks skip-around transitions", () => {
      expect(isValidTransition("SUBMITTED", "ELIGIBLE")).toBe(false);
      expect(isValidTransition("SUBMITTED", "IN_VOTING")).toBe(false);
      expect(isValidTransition("SUBMITTED", "COMPLETED")).toBe(false);
    });

    it("blocks transitions from COMPLETED", () => {
      expect(isValidTransition("COMPLETED", "SUBMITTED")).toBe(false);
      expect(isValidTransition("COMPLETED", "REJECTED")).toBe(false);
    });

    it("blocks same-status transitions", () => {
      for (const s of ALL_STATUSES) {
        expect(isValidTransition(s, s)).toBe(false);
      }
    });

    it("blocks REJECTED→SUBMITTED (must reopen to UNDER_REVIEW)", () => {
      expect(isValidTransition("REJECTED", "SUBMITTED")).toBe(false);
    });
  });

  describe("getNextStatuses", () => {
    it("returns correct next statuses for SUBMITTED", () => {
      expect(getNextStatuses("SUBMITTED")).toEqual(["UNDER_REVIEW", "REJECTED"]);
    });

    it("returns empty array for COMPLETED", () => {
      expect(getNextStatuses("COMPLETED")).toEqual([]);
    });

    it("returns reopen action for REJECTED", () => {
      expect(getNextStatuses("REJECTED")).toEqual(["UNDER_REVIEW"]);
    });

    it("returns correct next statuses for IN_VOTING", () => {
      expect(getNextStatuses("IN_VOTING")).toEqual(["SELECTED", "REJECTED"]);
    });
  });

  describe("VOTE_ELIGIBLE_STATUSES", () => {
    it("includes SUBMITTED, UNDER_REVIEW, ELIGIBLE, IN_VOTING", () => {
      expect(VOTE_ELIGIBLE_STATUSES).toContain("SUBMITTED");
      expect(VOTE_ELIGIBLE_STATUSES).toContain("UNDER_REVIEW");
      expect(VOTE_ELIGIBLE_STATUSES).toContain("ELIGIBLE");
      expect(VOTE_ELIGIBLE_STATUSES).toContain("IN_VOTING");
    });

    it("excludes SELECTED, IN_PROGRESS, COMPLETED, REJECTED", () => {
      expect(VOTE_ELIGIBLE_STATUSES).not.toContain("SELECTED");
      expect(VOTE_ELIGIBLE_STATUSES).not.toContain("IN_PROGRESS");
      expect(VOTE_ELIGIBLE_STATUSES).not.toContain("COMPLETED");
      expect(VOTE_ELIGIBLE_STATUSES).not.toContain("REJECTED");
    });
  });

  describe("SUPPORT_LABEL_STATUSES", () => {
    it("includes SUBMITTED, UNDER_REVIEW, ELIGIBLE", () => {
      expect(SUPPORT_LABEL_STATUSES).toContain("SUBMITTED");
      expect(SUPPORT_LABEL_STATUSES).toContain("UNDER_REVIEW");
      expect(SUPPORT_LABEL_STATUSES).toContain("ELIGIBLE");
    });

    it("excludes IN_VOTING and later statuses", () => {
      expect(SUPPORT_LABEL_STATUSES).not.toContain("IN_VOTING");
      expect(SUPPORT_LABEL_STATUSES).not.toContain("SELECTED");
      expect(SUPPORT_LABEL_STATUSES).not.toContain("REJECTED");
    });
  });

  describe("VALID_TRANSITIONS completeness", () => {
    it("has an entry for every status in ALL_STATUSES", () => {
      for (const status of ALL_STATUSES) {
        expect(VALID_TRANSITIONS[status]).toBeDefined();
        expect(Array.isArray(VALID_TRANSITIONS[status])).toBe(true);
      }
    });

    it("never transitions to itself", () => {
      for (const [from, targets] of Object.entries(VALID_TRANSITIONS)) {
        expect(targets).not.toContain(from);
      }
    });
  });

  describe("QUICK_ACTIONS", () => {
    it("has an entry for every status", () => {
      for (const status of ALL_STATUSES) {
        expect(QUICK_ACTIONS[status]).toBeDefined();
        expect(Array.isArray(QUICK_ACTIONS[status])).toBe(true);
      }
    });

    it("has empty array for COMPLETED", () => {
      expect(QUICK_ACTIONS.COMPLETED).toEqual([]);
    });

    it("each action has to, labelKey, and variant", () => {
      for (const [status, actions] of Object.entries(QUICK_ACTIONS)) {
        for (const action of actions) {
          expect(action).toHaveProperty("to");
          expect(action).toHaveProperty("labelKey");
          expect(action).toHaveProperty("variant");
          expect(["primary", "danger"]).toContain(action.variant);
          expect(VALID_TRANSITIONS[status as keyof typeof VALID_TRANSITIONS]).toContain(action.to);
        }
      }
    });
  });
});
