import { describe, it, expect } from "vitest";
import {
  isValidTransition,
  getNextStatuses,
  ALL_STATUSES,
  VALID_TRANSITIONS,
  VOTE_ELIGIBLE_STATUSES,
  SUPPORT_LABEL_STATUSES,
  TERMINAL_STATUSES,
  QUICK_ACTIONS,
} from "../transitions";

describe("transitions", () => {
  describe("ALL_STATUSES", () => {
    it("contains exactly 10 statuses", () => {
      expect(ALL_STATUSES).toHaveLength(10);
    });

    it("includes all new statuses", () => {
      expect(ALL_STATUSES).toContain("ACCEPTED");
      expect(ALL_STATUSES).toContain("NEEDS_REVISION");
      expect(ALL_STATUSES).toContain("MERGED");
      expect(ALL_STATUSES).toContain("WITHDRAWN");
    });

    it("excludes legacy statuses from the main list", () => {
      expect(ALL_STATUSES).not.toContain("UNDER_REVIEW");
      expect(ALL_STATUSES).not.toContain("ELIGIBLE");
    });
  });

  describe("VALID_TRANSITIONS", () => {
    it("SUBMITTED can transition to IN_VOTING, WITHDRAWN, MERGED", () => {
      expect(VALID_TRANSITIONS.SUBMITTED).toEqual(["IN_VOTING", "WITHDRAWN", "MERGED"]);
    });

    it("IN_VOTING can transition to SELECTED, WITHDRAWN, MERGED", () => {
      expect(VALID_TRANSITIONS.IN_VOTING).toEqual(["SELECTED", "WITHDRAWN", "MERGED"]);
    });

    it("SELECTED can transition to ACCEPTED, REJECTED, NEEDS_REVISION, MERGED", () => {
      expect(VALID_TRANSITIONS.SELECTED).toEqual(["ACCEPTED", "REJECTED", "NEEDS_REVISION", "MERGED"]);
    });

    it("ACCEPTED transitions to IN_PROGRESS", () => {
      expect(VALID_TRANSITIONS.ACCEPTED).toEqual(["IN_PROGRESS"]);
    });

    it("IN_PROGRESS transitions to COMPLETED", () => {
      expect(VALID_TRANSITIONS.IN_PROGRESS).toEqual(["COMPLETED"]);
    });

    it("terminal statuses have no outgoing transitions", () => {
      for (const status of TERMINAL_STATUSES) {
        expect(VALID_TRANSITIONS[status]).toEqual([]);
      }
    });
  });

  describe("isValidTransition", () => {
    it("valid forward transitions", () => {
      expect(isValidTransition("SUBMITTED", "IN_VOTING")).toBe(true);
      expect(isValidTransition("IN_VOTING", "SELECTED")).toBe(true);
      expect(isValidTransition("SELECTED", "ACCEPTED")).toBe(true);
      expect(isValidTransition("ACCEPTED", "IN_PROGRESS")).toBe(true);
      expect(isValidTransition("IN_PROGRESS", "COMPLETED")).toBe(true);
    });

    it("valid branch transitions", () => {
      expect(isValidTransition("SUBMITTED", "WITHDRAWN")).toBe(true);
      expect(isValidTransition("SUBMITTED", "MERGED")).toBe(true);
      expect(isValidTransition("SELECTED", "REJECTED")).toBe(true);
      expect(isValidTransition("SELECTED", "NEEDS_REVISION")).toBe(true);
      expect(isValidTransition("SELECTED", "MERGED")).toBe(true);
    });

    it("rejects invalid transitions", () => {
      expect(isValidTransition("SUBMITTED", "COMPLETED")).toBe(false);
      expect(isValidTransition("COMPLETED", "SUBMITTED")).toBe(false);
      expect(isValidTransition("REJECTED", "IN_VOTING")).toBe(false);
      expect(isValidTransition("NEEDS_REVISION", "SUBMITTED")).toBe(false);
    });

    it("rejects transitions from terminal statuses", () => {
      expect(isValidTransition("REJECTED", "SELECTED")).toBe(false);
      expect(isValidTransition("WITHDRAWN", "SUBMITTED")).toBe(false);
      expect(isValidTransition("MERGED", "SELECTED")).toBe(false);
      expect(isValidTransition("NEEDS_REVISION", "IN_VOTING")).toBe(false);
    });
  });

  describe("getNextStatuses", () => {
    it("returns valid next statuses for SUBMITTED", () => {
      expect(getNextStatuses("SUBMITTED")).toEqual(["IN_VOTING", "WITHDRAWN", "MERGED"]);
    });

    it("returns empty array for terminal statuses", () => {
      expect(getNextStatuses("REJECTED")).toEqual([]);
      expect(getNextStatuses("WITHDRAWN")).toEqual([]);
    });
  });

  describe("VOTE_ELIGIBLE_STATUSES", () => {
    it("includes SUBMITTED and IN_VOTING only", () => {
      expect(VOTE_ELIGIBLE_STATUSES).toEqual(["SUBMITTED", "IN_VOTING"]);
    });
  });

  describe("SUPPORT_LABEL_STATUSES", () => {
    it("includes SUBMITTED only", () => {
      expect(SUPPORT_LABEL_STATUSES).toEqual(["SUBMITTED"]);
    });
  });

  describe("QUICK_ACTIONS", () => {
    it("SUBMITTED has sendToVoting, merge, withdraw", () => {
      expect(QUICK_ACTIONS.SUBMITTED).toHaveLength(3);
      expect(QUICK_ACTIONS.SUBMITTED.map((a) => a.labelKey)).toEqual([
        "sendToVoting",
        "merge",
        "withdraw",
      ]);
    });

    it("SELECTED has accept, reject, needsRevision, merge", () => {
      expect(QUICK_ACTIONS.SELECTED).toHaveLength(4);
      expect(QUICK_ACTIONS.SELECTED.map((a) => a.labelKey)).toEqual([
        "accept",
        "reject",
        "needsRevision",
        "merge",
      ]);
    });

    it("terminal statuses have no quick actions", () => {
      expect(QUICK_ACTIONS.REJECTED).toEqual([]);
      expect(QUICK_ACTIONS.NEEDS_REVISION).toEqual([]);
      expect(QUICK_ACTIONS.MERGED).toEqual([]);
      expect(QUICK_ACTIONS.WITHDRAWN).toEqual([]);
    });
  });
});
