import { describe, it, expect } from "vitest";
import type { Status } from "@prisma/client";
import type { PipelineStage } from "@/components/ideas/pipeline-track";

/**
 * The computePipelineStages function is the driving port for this test suite.
 * It is a pure function that transforms idea data into PipelineStage[] for
 * rendering by the IdeaPipeline component.
 *
 * Until the function is extracted into a module, we define the expected
 * contract here and will import from the implementation module once created.
 */

type StatusChange = {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  note: string;
  changedBy: string;
  createdAt: string;
};

type IdeaData = {
  status: Status;
  createdAt: string;
  statusChanges: StatusChange[];
};

import {
  computePipelineStages,
  getExceptionState,
  resolveExceptionType,
  findRejectionChange,
  parseMergeNote,
  parseReturnNote,
} from "../pipeline-computation";

describe("computePipelineStages", () => {
  describe("happy path: SUBMITTED idea with no status changes", () => {
    it("maps all 7 PIPELINE_STAGES to PipelineStage[]", () => {
      const idea: IdeaData = {
        status: "SUBMITTED",
        createdAt: "2025-01-15T10:00:00Z",
        statusChanges: [],
      };
      const stages = computePipelineStages(idea);
      expect(stages).toHaveLength(7);
      const stageStatuses = stages.map((s) => s.status);
      expect(stageStatuses).toEqual([
        "SUBMITTED",
        "UNDER_REVIEW",
        "ELIGIBLE",
        "IN_VOTING",
        "SELECTED",
        "IN_PROGRESS",
        "COMPLETED",
      ]);
    });

    it("marks only SUBMITTED as reached and current", () => {
      const idea: IdeaData = {
        status: "SUBMITTED",
        createdAt: "2025-01-15T10:00:00Z",
        statusChanges: [],
      };
      const stages = computePipelineStages(idea);
      const submitted = stages[0];
      expect(submitted.reached).toBe(true);
      expect(submitted.current).toBe(true);
      expect(submitted.date).toBe("2025-01-15T10:00:00Z");

      const unreached = stages.slice(1);
      for (const stage of unreached) {
        expect(stage.reached).toBe(false);
        expect(stage.current).toBe(false);
        expect(stage.date).toBeNull();
      }
    });
  });

  describe("mid-pipeline: UNDER_REVIEW with status change", () => {
    it("marks SUBMITTED as reached (not current) and UNDER_REVIEW as current", () => {
      const idea: IdeaData = {
        status: "UNDER_REVIEW",
        createdAt: "2025-01-10T08:00:00Z",
        statusChanges: [
          {
            id: "sc1",
            fromStatus: "SUBMITTED",
            toStatus: "UNDER_REVIEW",
            note: "Starting review",
            changedBy: "admin",
            createdAt: "2025-01-12T14:00:00Z",
          },
        ],
      };
      const stages = computePipelineStages(idea);
      expect(stages[0].status).toBe("SUBMITTED");
      expect(stages[0].reached).toBe(true);
      expect(stages[0].current).toBe(false);
      expect(stages[0].date).toBe("2025-01-10T08:00:00Z");

      expect(stages[1].status).toBe("UNDER_REVIEW");
      expect(stages[1].reached).toBe(true);
      expect(stages[1].current).toBe(true);
      expect(stages[1].date).toBe("2025-01-12T14:00:00Z");

      for (const stage of stages.slice(2)) {
        expect(stage.reached).toBe(false);
        expect(stage.current).toBe(false);
        expect(stage.date).toBeNull();
      }
    });
  });

  describe("completed pipeline: COMPLETED status", () => {
    it("marks all stages as reached with only COMPLETED as current", () => {
      const idea: IdeaData = {
        status: "COMPLETED",
        createdAt: "2025-01-01T00:00:00Z",
        statusChanges: [
          {
            id: "sc1",
            fromStatus: "SUBMITTED",
            toStatus: "UNDER_REVIEW",
            note: "",
            changedBy: "admin",
            createdAt: "2025-01-02T00:00:00Z",
          },
          {
            id: "sc2",
            fromStatus: "UNDER_REVIEW",
            toStatus: "ELIGIBLE",
            note: "",
            changedBy: "admin",
            createdAt: "2025-01-03T00:00:00Z",
          },
          {
            id: "sc3",
            fromStatus: "ELIGIBLE",
            toStatus: "IN_VOTING",
            note: "",
            changedBy: "admin",
            createdAt: "2025-01-04T00:00:00Z",
          },
          {
            id: "sc4",
            fromStatus: "IN_VOTING",
            toStatus: "SELECTED",
            note: "",
            changedBy: "admin",
            createdAt: "2025-01-05T00:00:00Z",
          },
          {
            id: "sc5",
            fromStatus: "SELECTED",
            toStatus: "IN_PROGRESS",
            note: "",
            changedBy: "admin",
            createdAt: "2025-01-06T00:00:00Z",
          },
          {
            id: "sc6",
            fromStatus: "IN_PROGRESS",
            toStatus: "COMPLETED",
            note: "",
            changedBy: "admin",
            createdAt: "2025-01-07T00:00:00Z",
          },
        ],
      };
      const stages = computePipelineStages(idea);
      for (const stage of stages) {
        expect(stage.reached).toBe(true);
      }
      expect(stages[6].current).toBe(true);
      expect(stages.slice(0, 6).every((s) => !s.current)).toBe(true);
    });
  });

  describe("REJECTED status: exception state handling", () => {
    it("computes pipeline up to the stage before rejection with correct reached/current flags", () => {
      const idea: IdeaData = {
        status: "REJECTED",
        createdAt: "2025-01-01T00:00:00Z",
        statusChanges: [
          {
            id: "sc1",
            fromStatus: "SUBMITTED",
            toStatus: "UNDER_REVIEW",
            note: "",
            changedBy: "admin",
            createdAt: "2025-01-02T00:00:00Z",
          },
          {
            id: "sc2",
            fromStatus: "UNDER_REVIEW",
            toStatus: "REJECTED",
            note: "Not feasible",
            changedBy: "admin",
            createdAt: "2025-01-05T00:00:00Z",
          },
        ],
      };
      const stages = computePipelineStages(idea);
      expect(stages[0].reached).toBe(true);
      expect(stages[0].current).toBe(false);
      expect(stages[1].reached).toBe(true);
      expect(stages[1].current).toBe(false);
      for (const stage of stages.slice(2)) {
        expect(stage.reached).toBe(false);
        expect(stage.current).toBe(false);
      }
    });
  });

  describe("error path: empty status changes array", () => {
    it("renders all 7 stages with only SUBMITTED filled when statusChanges is empty", () => {
      const idea: IdeaData = {
        status: "SUBMITTED",
        createdAt: "2025-06-01T08:00:00Z",
        statusChanges: [],
      };
      const stages = computePipelineStages(idea);
      expect(stages).toHaveLength(7);
      expect(stages[0].status).toBe("SUBMITTED");
      expect(stages[0].reached).toBe(true);
      expect(stages[0].current).toBe(true);
      expect(stages[0].date).toBe("2025-06-01T08:00:00Z");
      for (const stage of stages.slice(1)) {
        expect(stage.reached).toBe(false);
        expect(stage.current).toBe(false);
        expect(stage.date).toBeNull();
      }
    });

    it("renders with only SUBMITTED filled even for mid-pipeline status when no status changes", () => {
      const idea: IdeaData = {
        status: "IN_VOTING",
        createdAt: "2025-06-01T08:00:00Z",
        statusChanges: [],
      };
      const stages = computePipelineStages(idea);
      expect(stages).toHaveLength(7);
      // SUBMITTED should still have the creation date
      expect(stages[0].date).toBe("2025-06-01T08:00:00Z");
    });
  });

  describe("error path: unexpected status value", () => {
    it("renders pipeline without crashing for unexpected status", () => {
      const idea: IdeaData = {
        status: "UNKNOWN_STATUS" as Status,
        createdAt: "2025-06-01T08:00:00Z",
        statusChanges: [],
      };
      const stages = computePipelineStages(idea);
      expect(stages).toHaveLength(7);
    });

    it("marks no stage as current for unexpected status", () => {
      const idea: IdeaData = {
        status: "UNKNOWN_STATUS" as Status,
        createdAt: "2025-06-01T08:00:00Z",
        statusChanges: [],
      };
      const stages = computePipelineStages(idea);
      const currentStages = stages.filter((s) => s.current);
      expect(currentStages).toHaveLength(0);
    });

    it("marks no stage as reached for unexpected status with no status changes", () => {
      const idea: IdeaData = {
        status: "UNKNOWN_STATUS" as Status,
        createdAt: "2025-06-01T08:00:00Z",
        statusChanges: [],
      };
      const stages = computePipelineStages(idea);
      // getStageIndex returns -1 for unknown, so resolveEffectiveStatus also returns unknown,
      // and no stages should be reached (both stageIndex and effectiveIndex checks fail)
      const reachedStages = stages.filter((s) => s.reached);
      expect(reachedStages).toHaveLength(0);
    });

    it("preserves the raw status label in the pipeline stage", () => {
      const idea: IdeaData = {
        status: "UNKNOWN_STATUS" as Status,
        createdAt: "2025-06-01T08:00:00Z",
        statusChanges: [],
      };
      const stages = computePipelineStages(idea);
      // Labels should still use the Status key from PIPELINE_STAGES
      // The raw status is not in PIPELINE_STAGES so it won't appear as a label,
      // but the pipeline should still render all 7 standard stages
      expect(stages).toHaveLength(7);
      const labels = stages.map((s) => s.label);
      expect(labels).toEqual([
        "SUBMITTED",
        "UNDER_REVIEW",
        "ELIGIBLE",
        "IN_VOTING",
        "SELECTED",
        "IN_PROGRESS",
        "COMPLETED",
      ]);
    });
  });

  describe("error path: malformed status change records", () => {
    it("skips records with null toStatus and renders pipeline", () => {
      const idea: IdeaData = {
        status: "ELIGIBLE",
        createdAt: "2025-01-01T00:00:00Z",
        statusChanges: [
          {
            id: "sc1",
            fromStatus: "SUBMITTED",
            toStatus: "UNDER_REVIEW" as string,
            note: "Review started",
            changedBy: "admin",
            createdAt: "2025-01-05T00:00:00Z",
          },
          {
            id: "sc-malformed",
            fromStatus: "UNDER_REVIEW",
            toStatus: null as unknown as string,
            note: "Bad record",
            changedBy: "admin",
            createdAt: "2025-01-06T00:00:00Z",
          },
          {
            id: "sc2",
            fromStatus: "UNDER_REVIEW",
            toStatus: "ELIGIBLE" as string,
            note: "Marked eligible",
            changedBy: "admin",
            createdAt: "2025-01-10T00:00:00Z",
          },
        ],
      };
      const stages = computePipelineStages(idea);
      expect(stages).toHaveLength(7);
      expect(stages[1].date).toBe("2025-01-05T00:00:00Z");
      expect(stages[2].date).toBe("2025-01-10T00:00:00Z");
    });

    it("skips records with missing createdAt and renders pipeline", () => {
      const idea: IdeaData = {
        status: "UNDER_REVIEW",
        createdAt: "2025-01-01T00:00:00Z",
        statusChanges: [
          {
            id: "sc-bad-date",
            fromStatus: "SUBMITTED",
            toStatus: "UNDER_REVIEW" as string,
            note: "Missing date",
            changedBy: "admin",
            createdAt: undefined as unknown as string,
          },
        ],
      };
      const stages = computePipelineStages(idea);
      expect(stages).toHaveLength(7);
      // The record with missing createdAt should be handled gracefully
      // UNDER_REVIEW should still be reached/current
      expect(stages[1].reached).toBe(true);
      expect(stages[1].current).toBe(true);
      // date should be null (not undefined) when createdAt is missing
      expect(stages[1].date).toBeNull();
    });

    it("handles entirely empty statusChanges array without crashing", () => {
      const idea: IdeaData = {
        status: "SUBMITTED",
        createdAt: "2025-01-01T00:00:00Z",
        statusChanges: [],
      };
      const stages = computePipelineStages(idea);
      expect(stages).toHaveLength(7);
      expect(stages[0].reached).toBe(true);
      expect(stages[0].current).toBe(true);
    });
  });

  describe("date resolution from statusChanges", () => {
    it("uses idea.createdAt for SUBMITTED stage when no status change has toStatus SUBMITTED", () => {
      const idea: IdeaData = {
        status: "ELIGIBLE",
        createdAt: "2025-03-01T09:00:00Z",
        statusChanges: [
          {
            id: "sc1",
            fromStatus: "SUBMITTED",
            toStatus: "UNDER_REVIEW",
            note: "",
            changedBy: "admin",
            createdAt: "2025-03-05T12:00:00Z",
          },
          {
            id: "sc2",
            fromStatus: "UNDER_REVIEW",
            toStatus: "ELIGIBLE",
            note: "",
            changedBy: "admin",
            createdAt: "2025-03-10T15:00:00Z",
          },
        ],
      };
      const stages = computePipelineStages(idea);
      expect(stages[0].date).toBe("2025-03-01T09:00:00Z");
      expect(stages[1].date).toBe("2025-03-05T12:00:00Z");
      expect(stages[2].date).toBe("2025-03-10T15:00:00Z");
    });

    it("uses the most recent status change date when multiple changes exist for the same toStatus", () => {
      const idea: IdeaData = {
        status: "ELIGIBLE",
        createdAt: "2025-01-01T00:00:00Z",
        statusChanges: [
          {
            id: "sc1",
            fromStatus: "SUBMITTED",
            toStatus: "UNDER_REVIEW",
            note: "First review",
            changedBy: "admin",
            createdAt: "2025-01-10T00:00:00Z",
          },
          {
            id: "sc2",
            fromStatus: "REJECTED",
            toStatus: "UNDER_REVIEW",
            note: "Reopened",
            changedBy: "admin",
            createdAt: "2025-02-10T00:00:00Z",
          },
          {
            id: "sc3",
            fromStatus: "UNDER_REVIEW",
            toStatus: "ELIGIBLE",
            note: "",
            changedBy: "admin",
            createdAt: "2025-02-15T00:00:00Z",
          },
        ],
      };
      const stages = computePipelineStages(idea);
      // UNDER_REVIEW should use the most recent change (sc2)
      expect(stages[1].date).toBe("2025-02-10T00:00:00Z");
    });
  });
});

describe("getExceptionState", () => {
  it("returns REJECTED for REJECTED status", () => {
    expect(getExceptionState("REJECTED")).toBe("REJECTED");
  });

  it("returns undefined for forward pipeline statuses", () => {
    const forwardStatuses: Status[] = [
      "SUBMITTED",
      "UNDER_REVIEW",
      "ELIGIBLE",
      "IN_VOTING",
      "SELECTED",
      "IN_PROGRESS",
      "COMPLETED",
    ];
    for (const status of forwardStatuses) {
      expect(getExceptionState(status)).toBeUndefined();
    }
  });

  it("returns undefined for unexpected/unknown status value", () => {
    expect(getExceptionState("UNKNOWN_STATUS" as Status)).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// resolveExceptionType: MERGED/RETURNED detection from status + note prefix
// ---------------------------------------------------------------------------
describe("resolveExceptionType", () => {
  it("returns MERGED when status is REJECTED and note starts with [MERGED]", () => {
    const statusChanges: StatusChange[] = [
      {
        id: "sc1",
        fromStatus: "UNDER_REVIEW",
        toStatus: "REJECTED",
        note: "[MERGED] merged with idea #cm5x8k2q",
        changedBy: "admin",
        createdAt: "2025-01-10T00:00:00Z",
      },
    ];
    expect(resolveExceptionType("REJECTED", statusChanges)).toBe("MERGED");
  });

  it("returns RETURNED when status is REJECTED and note starts with [RETURNED]", () => {
    const statusChanges: StatusChange[] = [
      {
        id: "sc1",
        fromStatus: "UNDER_REVIEW",
        toStatus: "REJECTED",
        note: "[RETURNED] Please add more specific location details",
        changedBy: "admin",
        createdAt: "2025-01-10T00:00:00Z",
      },
    ];
    expect(resolveExceptionType("REJECTED", statusChanges)).toBe("RETURNED");
  });

  it("returns REJECTED when status is REJECTED and note has no prefix", () => {
    const statusChanges: StatusChange[] = [
      {
        id: "sc1",
        fromStatus: "UNDER_REVIEW",
        toStatus: "REJECTED",
        note: "Outside city jurisdiction",
        changedBy: "admin",
        createdAt: "2025-01-10T00:00:00Z",
      },
    ];
    expect(resolveExceptionType("REJECTED", statusChanges)).toBe("REJECTED");
  });

  it("returns undefined when status is not REJECTED (reopened idea)", () => {
    const statusChanges: StatusChange[] = [
      {
        id: "sc1",
        fromStatus: "SUBMITTED",
        toStatus: "REJECTED",
        note: "[MERGED] merged with idea #abc",
        changedBy: "admin",
        createdAt: "2025-01-05T00:00:00Z",
      },
      {
        id: "sc2",
        fromStatus: "REJECTED",
        toStatus: "UNDER_REVIEW",
        note: "Reopened for review",
        changedBy: "admin",
        createdAt: "2025-01-15T00:00:00Z",
      },
    ];
    expect(resolveExceptionType("UNDER_REVIEW", statusChanges)).toBeUndefined();
  });

  it("returns undefined when status is REJECTED but no rejection status change exists", () => {
    const statusChanges: StatusChange[] = [];
    expect(resolveExceptionType("REJECTED", statusChanges)).toBeUndefined();
  });

  it("uses the most recent rejection change when multiple exist", () => {
    const statusChanges: StatusChange[] = [
      {
        id: "sc1",
        fromStatus: "SUBMITTED",
        toStatus: "REJECTED",
        note: "Not feasible",
        changedBy: "admin",
        createdAt: "2025-01-05T00:00:00Z",
      },
      {
        id: "sc2",
        fromStatus: "UNDER_REVIEW",
        toStatus: "REJECTED",
        note: "[MERGED] merged with idea #xyz",
        changedBy: "admin",
        createdAt: "2025-01-20T00:00:00Z",
      },
    ];
    expect(resolveExceptionType("REJECTED", statusChanges)).toBe("MERGED");
  });

  it("detects [MERGED] with mixed case as MERGED", () => {
    const statusChanges: StatusChange[] = [
      {
        id: "sc1",
        fromStatus: "UNDER_REVIEW",
        toStatus: "REJECTED",
        note: "[merged] Combined with another idea",
        changedBy: "admin",
        createdAt: "2025-01-10T00:00:00Z",
      },
    ];
    expect(resolveExceptionType("REJECTED", statusChanges)).toBe("MERGED");
  });

  it("detects [RETURNED] with mixed case as RETURNED", () => {
    const statusChanges: StatusChange[] = [
      {
        id: "sc1",
        fromStatus: "UNDER_REVIEW",
        toStatus: "REJECTED",
        note: "[Returned] Needs revision",
        changedBy: "admin",
        createdAt: "2025-01-10T00:00:00Z",
      },
    ];
    expect(resolveExceptionType("REJECTED", statusChanges)).toBe("RETURNED");
  });

  it("returns REJECTED when note contains 'merged' but not as bracketed prefix", () => {
    const statusChanges: StatusChange[] = [
      {
        id: "sc1",
        fromStatus: "UNDER_REVIEW",
        toStatus: "REJECTED",
        note: "This idea was merged with another",
        changedBy: "admin",
        createdAt: "2025-01-10T00:00:00Z",
      },
    ];
    expect(resolveExceptionType("REJECTED", statusChanges)).toBe("REJECTED");
  });
});

// ---------------------------------------------------------------------------
// findRejectionChange: find most recent StatusChange with toStatus=REJECTED
// ---------------------------------------------------------------------------
describe("findRejectionChange", () => {
  it("returns the most recent rejection status change", () => {
    const statusChanges: StatusChange[] = [
      {
        id: "sc1",
        fromStatus: "SUBMITTED",
        toStatus: "UNDER_REVIEW",
        note: "",
        changedBy: "admin",
        createdAt: "2025-01-02T00:00:00Z",
      },
      {
        id: "sc2",
        fromStatus: "UNDER_REVIEW",
        toStatus: "REJECTED",
        note: "Not feasible",
        changedBy: "admin",
        createdAt: "2025-01-05T00:00:00Z",
      },
    ];
    const result = findRejectionChange(statusChanges);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("sc2");
    expect(result!.note).toBe("Not feasible");
  });

  it.each([
    [["SUBMITTED", "UNDER_REVIEW"] as const, "no rejection change"],
    [[] as const, "empty statusChanges"],
  ])("returns null for %s", (statusFlow, description) => {
    const statusChanges: StatusChange[] = statusFlow.map((status, i) => ({
      id: `sc${i}`,
      fromStatus: i === 0 ? null : "SUBMITTED",
      toStatus: status,
      note: "",
      changedBy: "admin",
      createdAt: `2025-01-0${i + 1}T00:00:00Z`,
    }));
    expect(findRejectionChange(statusChanges)).toBeNull();
  });

  it("picks the last rejection when multiple rejections exist", () => {
    const statusChanges: StatusChange[] = [
      {
        id: "sc1",
        fromStatus: "SUBMITTED",
        toStatus: "REJECTED",
        note: "First rejection",
        changedBy: "admin",
        createdAt: "2025-01-05T00:00:00Z",
      },
      {
        id: "sc2",
        fromStatus: "REJECTED",
        toStatus: "UNDER_REVIEW",
        note: "Reopened",
        changedBy: "admin",
        createdAt: "2025-01-10T00:00:00Z",
      },
      {
        id: "sc3",
        fromStatus: "UNDER_REVIEW",
        toStatus: "REJECTED",
        note: "Second rejection",
        changedBy: "admin",
        createdAt: "2025-01-15T00:00:00Z",
      },
    ];
    const result = findRejectionChange(statusChanges);
    expect(result!.id).toBe("sc3");
    expect(result!.note).toBe("Second rejection");
  });
});

// ---------------------------------------------------------------------------
// parseMergeNote: extract parent idea ID from [MERGED] prefix
// ---------------------------------------------------------------------------
describe("parseMergeNote", () => {
  it.each([
    ["[MERGED] merged with idea #cm5x8k2q", "cm5x8k2q"],
    ["[MERGED] idea cm5x8k2q", "cm5x8k2q"],
    ["[MERGED] merged into cm5x8k2q", "cm5x8k2q"],
    ["[MERGED] #abc123", "abc123"],
  ])("extracts parent idea ID from '%s'", (input, expectedId) => {
    const result = parseMergeNote(input);
    expect(result.parentIdeaId).toBe(expectedId);
  });

  it.each([
    ["[MERGED]"],
    ["[MERGED]   "],
  ])("returns null parentIdeaId for '%s'", (input) => {
    expect(parseMergeNote(input).parentIdeaId).toBeNull();
  });

  it("extracts title when present after ID with dash separator", () => {
    const result = parseMergeNote("[MERGED] merged with idea #abc123 - Better sidewalks");
    expect(result.parentIdeaId).toBe("abc123");
    expect(result.parentIdeaTitle).toBe("Better sidewalks");
  });

  it("returns null parentIdeaTitle when no title after ID", () => {
    const result = parseMergeNote("[MERGED] #abc123");
    expect(result.parentIdeaId).toBe("abc123");
    expect(result.parentIdeaTitle).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// parseReturnNote: extract feedback text from [RETURNED] prefix
// ---------------------------------------------------------------------------
describe("parseReturnNote", () => {
  it.each([
    ["[RETURNED] Please add more details", "Please add more details"],
    ["[RETURNED]   Trim this space", "Trim this space"],
    ["[RETURNED]", ""],
    ["[RETURNED]   ", ""],
  ])("parses '%s' -> '%s'", (input, expected) => {
    expect(parseReturnNote(input)).toBe(expected);
  });
});
