import { describe, it, expect } from "vitest";
import type { Status } from "@prisma/client";
import type { PipelineStage } from "@/components/ideas/idea-pipeline";

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

/** The function under test -- will be implemented in pipeline-computation.ts */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let computePipelineStages: (idea: IdeaData) => PipelineStage[];

/** Detect exception state from idea status -- will be co-located or imported */
let getExceptionState: (status: Status) => "REJECTED" | "MERGED" | "RETURNED" | "STALLED" | undefined;

/**
 * These imports will be activated once the implementation module exists.
 * For now, the tests serve as the RED-phase contract.
 */
try {
  const mod = await import("../pipeline-computation");
  computePipelineStages = mod.computePipelineStages;
  getExceptionState = mod.getExceptionState;
} catch {
  // Module does not exist yet -- RED phase. Tests must fail.
}

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
});
