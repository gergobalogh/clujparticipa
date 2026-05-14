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
    it("has exactly 7 stages", () => {
      expect(PIPELINE_STAGES).toHaveLength(7);
    });

    it("excludes REJECTED", () => {
      expect(PIPELINE_STAGES).not.toContain("REJECTED");
    });

    it("starts with SUBMITTED and ends with COMPLETED", () => {
      expect(PIPELINE_STAGES[0]).toBe("SUBMITTED");
      expect(PIPELINE_STAGES[6]).toBe("COMPLETED");
    });
  });

  describe("getStageIndex", () => {
    it("returns 0 for SUBMITTED", () => {
      expect(getStageIndex("SUBMITTED")).toBe(0);
    });

    it("returns 6 for COMPLETED", () => {
      expect(getStageIndex("COMPLETED")).toBe(6);
    });

    it("returns correct index for each pipeline stage", () => {
      const expected: [Status, number][] = [
        ["SUBMITTED", 0],
        ["UNDER_REVIEW", 1],
        ["ELIGIBLE", 2],
        ["IN_VOTING", 3],
        ["SELECTED", 4],
        ["IN_PROGRESS", 5],
        ["COMPLETED", 6],
      ];
      for (const [status, index] of expected) {
        expect(getStageIndex(status)).toBe(index);
      }
    });

    it("returns -1 for REJECTED (not a pipeline stage)", () => {
      expect(getStageIndex("REJECTED")).toBe(-1);
    });

    it("returns -1 for unknown/unexpected status value", () => {
      expect(getStageIndex("UNKNOWN_STATUS" as Status)).toBe(-1);
    });
  });

  describe("isStageReached", () => {
    it("returns true when stage is before current status", () => {
      expect(isStageReached("SUBMITTED", "ELIGIBLE")).toBe(true);
    });

    it("returns true when stage equals current status", () => {
      expect(isStageReached("ELIGIBLE", "ELIGIBLE")).toBe(true);
    });

    it("returns false when stage is after current status", () => {
      expect(isStageReached("IN_VOTING", "ELIGIBLE")).toBe(false);
    });

    it("returns true for all stages when current is COMPLETED", () => {
      for (const stage of PIPELINE_STAGES) {
        expect(isStageReached(stage, "COMPLETED")).toBe(true);
      }
    });

    it("returns true only for SUBMITTED when current is SUBMITTED", () => {
      expect(isStageReached("SUBMITTED", "SUBMITTED")).toBe(true);
      expect(isStageReached("UNDER_REVIEW", "SUBMITTED")).toBe(false);
      expect(isStageReached("COMPLETED", "SUBMITTED")).toBe(false);
    });

    it("returns false for unknown/unexpected stage", () => {
      expect(isStageReached("UNKNOWN_STAGE" as Status, "ELIGIBLE")).toBe(false);
    });

    it("returns false for unknown/unexpected current status", () => {
      expect(isStageReached("SUBMITTED", "UNKNOWN_CURRENT" as Status)).toBe(false);
    });
  });

  describe("isCurrentStage", () => {
    it("returns true when stage matches current status", () => {
      expect(isCurrentStage("ELIGIBLE", "ELIGIBLE")).toBe(true);
    });

    it("returns false when stage does not match current status", () => {
      expect(isCurrentStage("SUBMITTED", "ELIGIBLE")).toBe(false);
    });

    it("returns true for each stage when it is the current status", () => {
      for (const stage of PIPELINE_STAGES) {
        expect(isCurrentStage(stage, stage)).toBe(true);
      }
    });

    it("returns false for unknown/unexpected stage", () => {
      expect(isCurrentStage("UNKNOWN_STAGE" as Status, "ELIGIBLE")).toBe(false);
    });

    it("returns false for unknown/unexpected current status", () => {
      expect(isCurrentStage("ELIGIBLE", "UNKNOWN_CURRENT" as Status)).toBe(false);
    });
  });
});
