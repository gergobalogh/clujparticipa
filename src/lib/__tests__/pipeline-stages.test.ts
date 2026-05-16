import { describe, it, expect } from "vitest";
import {
  PIPELINE_STAGES,
  getStageIndex,
  isStageReached,
  isCurrentStage,
} from "../pipeline-stages";
import type { Status } from "@prisma/client";

describe("pipeline-stages", () => {
  describe("PIPELINE_STAGES constant", () => {
    it("has exactly 6 forward stages", () => {
      expect(PIPELINE_STAGES).toHaveLength(6);
    });

    it("excludes terminal statuses (REJECTED, NEEDS_REVISION, MERGED, WITHDRAWN)", () => {
      expect(PIPELINE_STAGES).not.toContain("REJECTED");
      expect(PIPELINE_STAGES).not.toContain("NEEDS_REVISION");
      expect(PIPELINE_STAGES).not.toContain("MERGED");
      expect(PIPELINE_STAGES).not.toContain("WITHDRAWN");
    });

    it("excludes legacy statuses (UNDER_REVIEW, ELIGIBLE)", () => {
      expect(PIPELINE_STAGES).not.toContain("UNDER_REVIEW");
      expect(PIPELINE_STAGES).not.toContain("ELIGIBLE");
    });

    it("starts with SUBMITTED and ends with COMPLETED", () => {
      expect(PIPELINE_STAGES[0]).toBe("SUBMITTED");
      expect(PIPELINE_STAGES[5]).toBe("COMPLETED");
    });
  });

  describe("getStageIndex", () => {
    it("returns correct index for each pipeline stage", () => {
      const expected: [Status, number][] = [
        ["SUBMITTED", 0],
        ["IN_VOTING", 1],
        ["SELECTED", 2],
        ["ACCEPTED", 3],
        ["IN_PROGRESS", 4],
        ["COMPLETED", 5],
      ];
      for (const [status, index] of expected) {
        expect(getStageIndex(status)).toBe(index);
      }
    });

    it("returns -1 for terminal statuses (not pipeline stages)", () => {
      const terminalStatuses: Status[] = [
        "REJECTED",
        "NEEDS_REVISION",
        "MERGED",
        "WITHDRAWN",
      ];
      for (const status of terminalStatuses) {
        expect(getStageIndex(status), `${status} should return -1`).toBe(-1);
      }
    });

    it("returns -1 for legacy statuses (UNDER_REVIEW, ELIGIBLE)", () => {
      expect(getStageIndex("UNDER_REVIEW")).toBe(-1);
      expect(getStageIndex("ELIGIBLE")).toBe(-1);
    });

    it("returns -1 for unknown/unexpected status value", () => {
      expect(getStageIndex("UNKNOWN_STATUS" as Status)).toBe(-1);
    });
  });

  describe("isStageReached", () => {
    it("returns true when stage is before current status", () => {
      expect(isStageReached("SUBMITTED", "IN_VOTING")).toBe(true);
    });

    it("returns true when stage equals current status", () => {
      expect(isStageReached("IN_VOTING", "IN_VOTING")).toBe(true);
    });

    it("returns false when stage is after current status", () => {
      expect(isStageReached("IN_VOTING", "SUBMITTED")).toBe(false);
    });

    it("returns true for all stages when current is COMPLETED", () => {
      for (const stage of PIPELINE_STAGES) {
        expect(isStageReached(stage, "COMPLETED")).toBe(true);
      }
    });

    it("returns true only for SUBMITTED when current is SUBMITTED", () => {
      expect(isStageReached("SUBMITTED", "SUBMITTED")).toBe(true);
      expect(isStageReached("IN_VOTING", "SUBMITTED")).toBe(false);
      expect(isStageReached("COMPLETED", "SUBMITTED")).toBe(false);
    });

    it("returns false when stage is a terminal status", () => {
      expect(isStageReached("REJECTED", "IN_VOTING")).toBe(false);
    });

    it("returns false when current status is a terminal status", () => {
      expect(isStageReached("SUBMITTED", "REJECTED")).toBe(false);
    });

    it("returns false for unknown/unexpected stage", () => {
      expect(isStageReached("UNKNOWN_STAGE" as Status, "IN_VOTING")).toBe(false);
    });

    it("returns false for unknown/unexpected current status", () => {
      expect(isStageReached("SUBMITTED", "UNKNOWN_CURRENT" as Status)).toBe(false);
    });
  });

  describe("isCurrentStage", () => {
    it("returns true when stage matches current status", () => {
      expect(isCurrentStage("IN_VOTING", "IN_VOTING")).toBe(true);
    });

    it("returns false when stage does not match current status", () => {
      expect(isCurrentStage("SUBMITTED", "IN_VOTING")).toBe(false);
    });

    it("returns true for each stage when it is the current status", () => {
      for (const stage of PIPELINE_STAGES) {
        expect(isCurrentStage(stage, stage)).toBe(true);
      }
    });

    it("returns false when stage is a terminal status", () => {
      expect(isCurrentStage("REJECTED", "REJECTED")).toBe(false);
    });

    it("returns false for unknown/unexpected stage", () => {
      expect(isCurrentStage("UNKNOWN_STAGE" as Status, "IN_VOTING")).toBe(false);
    });

    it("returns false for unknown/unexpected current status", () => {
      expect(isCurrentStage("IN_VOTING", "UNKNOWN_CURRENT" as Status)).toBe(false);
    });
  });

  describe("error path: defensive handling for unexpected status values", () => {
    it("getStageIndex returns -1 for various unexpected status values", () => {
      const unexpectedStatuses: Status[] = [
        "UNKNOWN_STATUS" as Status,
        "" as Status,
        "random_string" as Status,
      ];
      for (const status of unexpectedStatuses) {
        expect(getStageIndex(status)).toBe(-1);
      }
    });

    it("isStageReached returns false when both stage and current are unexpected", () => {
      expect(isStageReached("FOO" as Status, "BAR" as Status)).toBe(false);
    });

    it("isCurrentStage returns false when both stage and current are unexpected", () => {
      expect(isCurrentStage("FOO" as Status, "BAR" as Status)).toBe(false);
    });

    it("terminal statuses are consistently treated as non-pipeline stages across all functions", () => {
      const terminalStatuses: Status[] = [
        "REJECTED",
        "NEEDS_REVISION",
        "MERGED",
        "WITHDRAWN",
      ];
      for (const status of terminalStatuses) {
        expect(getStageIndex(status), `${status} getStageIndex`).toBe(-1);
        expect(isStageReached(status, "SUBMITTED"), `${status} isStageReached as stage`).toBe(false);
        expect(isStageReached("SUBMITTED", status), `${status} isStageReached as current`).toBe(false);
        expect(isCurrentStage(status, status), `${status} isCurrentStage`).toBe(false);
      }
    });
  });
});
