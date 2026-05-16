import { describe, it, expect } from "vitest";
import type { Status } from "@prisma/client";
import type { PipelineStage } from "@/components/ideas/pipeline-track";

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
  findTerminalChange,
  findRejectionChange,
  parseMergeNote,
  parseReturnNote,
} from "../pipeline-computation";

const PIPELINE_STATUS_ORDER: Status[] = [
  "SUBMITTED",
  "IN_VOTING",
  "SELECTED",
  "ACCEPTED",
  "IN_PROGRESS",
  "COMPLETED",
];

describe("computePipelineStages", () => {
  describe("happy path: SUBMITTED idea with no status changes", () => {
    it("maps all 6 PIPELINE_STAGES to PipelineStage[]", () => {
      const idea: IdeaData = {
        status: "SUBMITTED",
        createdAt: "2025-01-15T10:00:00Z",
        statusChanges: [],
      };
      const stages = computePipelineStages(idea);
      expect(stages).toHaveLength(6);
      const stageStatuses = stages.map((s) => s.status);
      expect(stageStatuses).toEqual(PIPELINE_STATUS_ORDER);
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
      expect(submitted.date).toBe("2025-01-15");

      const unreached = stages.slice(1);
      for (const stage of unreached) {
        expect(stage.reached).toBe(false);
        expect(stage.current).toBe(false);
        expect(stage.date).toBeNull();
      }
    });
  });

  describe("mid-pipeline: IN_VOTING with status change", () => {
    it("marks SUBMITTED as reached (not current) and IN_VOTING as current", () => {
      const idea: IdeaData = {
        status: "IN_VOTING",
        createdAt: "2025-01-10T08:00:00Z",
        statusChanges: [
          {
            id: "sc1",
            fromStatus: "SUBMITTED",
            toStatus: "IN_VOTING",
            note: "Sent to voting",
            changedBy: "admin",
            createdAt: "2025-01-12T14:00:00Z",
          },
        ],
      };
      const stages = computePipelineStages(idea);
      expect(stages[0].status).toBe("SUBMITTED");
      expect(stages[0].reached).toBe(true);
      expect(stages[0].current).toBe(false);
      expect(stages[0].date).toBe("2025-01-10");

      expect(stages[1].status).toBe("IN_VOTING");
      expect(stages[1].reached).toBe(true);
      expect(stages[1].current).toBe(true);
      expect(stages[1].date).toBe("2025-01-12");

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
            toStatus: "IN_VOTING",
            note: "",
            changedBy: "admin",
            createdAt: "2025-01-02T00:00:00Z",
          },
          {
            id: "sc2",
            fromStatus: "IN_VOTING",
            toStatus: "SELECTED",
            note: "",
            changedBy: "admin",
            createdAt: "2025-01-03T00:00:00Z",
          },
          {
            id: "sc3",
            fromStatus: "SELECTED",
            toStatus: "ACCEPTED",
            note: "",
            changedBy: "admin",
            createdAt: "2025-01-04T00:00:00Z",
          },
          {
            id: "sc4",
            fromStatus: "ACCEPTED",
            toStatus: "IN_PROGRESS",
            note: "",
            changedBy: "admin",
            createdAt: "2025-01-05T00:00:00Z",
          },
          {
            id: "sc5",
            fromStatus: "IN_PROGRESS",
            toStatus: "COMPLETED",
            note: "",
            changedBy: "admin",
            createdAt: "2025-01-06T00:00:00Z",
          },
        ],
      };
      const stages = computePipelineStages(idea);
      expect(stages).toHaveLength(6);
      for (const stage of stages) {
        expect(stage.reached).toBe(true);
      }
      expect(stages[5].current).toBe(true);
      expect(stages.slice(0, 5).every((s) => !s.current)).toBe(true);
    });
  });

  describe("terminal statuses: exception state handling", () => {
    it.each([
      ["REJECTED", "Rejected idea that went through SELECTED"],
      ["NEEDS_REVISION", "Needs revision idea that went through SELECTED"],
      ["MERGED", "Merged idea that was in IN_VOTING"],
      ["WITHDRAWN", "Withdrawn idea that was in IN_VOTING"],
    ] as const)(
      "%s: no stage marked current, stages before exit still reached",
      (terminalStatus, _description) => {
        const idea: IdeaData = {
          status: terminalStatus,
          createdAt: "2025-01-01T00:00:00Z",
          statusChanges: [
            {
              id: "sc1",
              fromStatus: "SUBMITTED",
              toStatus: "IN_VOTING",
              note: "",
              changedBy: "admin",
              createdAt: "2025-01-02T00:00:00Z",
            },
            {
              id: "sc2",
              fromStatus: "IN_VOTING",
              toStatus: "SELECTED",
              note: "",
              changedBy: "admin",
              createdAt: "2025-01-03T00:00:00Z",
            },
            {
              id: "sc3",
              fromStatus: "SELECTED",
              toStatus: terminalStatus,
              note: "Exit reason",
              changedBy: "admin",
              createdAt: "2025-01-05T00:00:00Z",
            },
          ],
        };
        const stages = computePipelineStages(idea);
        // No stage should be marked current for terminal-status ideas
        expect(stages.every((s) => !s.current)).toBe(true);
        // Stages before the exit point should be reached
        expect(stages[0].reached).toBe(true); // SUBMITTED
        expect(stages[1].reached).toBe(true); // IN_VOTING
        expect(stages[2].reached).toBe(true); // SELECTED
        // Stages after the exit point should not be reached
        expect(stages[3].reached).toBe(false); // ACCEPTED
        expect(stages[4].reached).toBe(false); // IN_PROGRESS
        expect(stages[5].reached).toBe(false); // COMPLETED
      }
    );

    it("REJECTED with only SUBMITTED reached: only SUBMITTED marked reached", () => {
      const idea: IdeaData = {
        status: "REJECTED",
        createdAt: "2025-01-01T00:00:00Z",
        statusChanges: [
          {
            id: "sc1",
            fromStatus: "SUBMITTED",
            toStatus: "REJECTED",
            note: "Not feasible",
            changedBy: "admin",
            createdAt: "2025-01-05T00:00:00Z",
          },
        ],
      };
      const stages = computePipelineStages(idea);
      expect(stages[0].reached).toBe(true); // SUBMITTED
      for (const stage of stages.slice(1)) {
        expect(stage.reached).toBe(false);
        expect(stage.current).toBe(false);
      }
    });

    it("WITHDRAWN with no forward stage in statusChanges defaults to SUBMITTED as last forward", () => {
      const idea: IdeaData = {
        status: "WITHDRAWN",
        createdAt: "2025-01-01T00:00:00Z",
        statusChanges: [],
      };
      const stages = computePipelineStages(idea);
      // No forward stages in statusChanges, defaults to SUBMITTED
      expect(stages[0].reached).toBe(true);
      expect(stages.every((s) => !s.current)).toBe(true);
    });
  });

  describe("legacy status normalization: UNDER_REVIEW and ELIGIBLE", () => {
    it("UNDER_REVIEW normalizes to IN_VOTING in pipeline stages", () => {
      const idea: IdeaData = {
        status: "UNDER_REVIEW",
        createdAt: "2025-01-10T08:00:00Z",
        statusChanges: [
          {
            id: "sc1",
            fromStatus: "SUBMITTED",
            toStatus: "UNDER_REVIEW",
            note: "Legacy review",
            changedBy: "admin",
            createdAt: "2025-01-12T14:00:00Z",
          },
        ],
      };
      const stages = computePipelineStages(idea);
      expect(stages).toHaveLength(6);
      // UNDER_REVIEW normalizes to IN_VOTING, so IN_VOTING is current
      expect(stages[0].reached).toBe(true); // SUBMITTED
      expect(stages[0].current).toBe(false);
      expect(stages[1].status).toBe("IN_VOTING");
      expect(stages[1].reached).toBe(true);
      expect(stages[1].current).toBe(true);
    });

    it("ELIGIBLE normalizes to IN_VOTING in pipeline stages", () => {
      const idea: IdeaData = {
        status: "ELIGIBLE",
        createdAt: "2025-01-10T08:00:00Z",
        statusChanges: [
          {
            id: "sc1",
            fromStatus: "SUBMITTED",
            toStatus: "IN_VOTING",
            note: "Went to voting",
            changedBy: "admin",
            createdAt: "2025-01-12T14:00:00Z",
          },
        ],
      };
      const stages = computePipelineStages(idea);
      // ELIGIBLE normalizes to IN_VOTING
      expect(stages[1].status).toBe("IN_VOTING");
      expect(stages[1].current).toBe(true);
    });
  });

  describe("error path: empty status changes array", () => {
    it("renders all 6 stages with only SUBMITTED filled when statusChanges is empty", () => {
      const idea: IdeaData = {
        status: "SUBMITTED",
        createdAt: "2025-06-01T08:00:00Z",
        statusChanges: [],
      };
      const stages = computePipelineStages(idea);
      expect(stages).toHaveLength(6);
      expect(stages[0].status).toBe("SUBMITTED");
      expect(stages[0].reached).toBe(true);
      expect(stages[0].current).toBe(true);
      expect(stages[0].date).toBe("2025-06-01");
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
      expect(stages).toHaveLength(6);
      expect(stages[0].date).toBe("2025-06-01");
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
      expect(stages).toHaveLength(6);
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
      const reachedStages = stages.filter((s) => s.reached);
      expect(reachedStages).toHaveLength(0);
    });

    it("preserves the 6 standard pipeline stage labels", () => {
      const idea: IdeaData = {
        status: "UNKNOWN_STATUS" as Status,
        createdAt: "2025-06-01T08:00:00Z",
        statusChanges: [],
      };
      const stages = computePipelineStages(idea);
      const labels = stages.map((s) => s.label);
      expect(labels).toEqual(PIPELINE_STATUS_ORDER);
    });
  });

  describe("error path: malformed status change records", () => {
    it("skips records with null toStatus and renders pipeline", () => {
      const idea: IdeaData = {
        status: "IN_VOTING",
        createdAt: "2025-01-01T00:00:00Z",
        statusChanges: [
          {
            id: "sc1",
            fromStatus: "SUBMITTED",
            toStatus: "IN_VOTING" as string,
            note: "Voting started",
            changedBy: "admin",
            createdAt: "2025-01-05T00:00:00Z",
          },
          {
            id: "sc-malformed",
            fromStatus: "IN_VOTING",
            toStatus: null as unknown as string,
            note: "Bad record",
            changedBy: "admin",
            createdAt: "2025-01-06T00:00:00Z",
          },
        ],
      };
      const stages = computePipelineStages(idea);
      expect(stages).toHaveLength(6);
      expect(stages[1].date).toBe("2025-01-05");
    });

    it("skips records with missing createdAt and renders pipeline", () => {
      const idea: IdeaData = {
        status: "IN_VOTING",
        createdAt: "2025-01-01T00:00:00Z",
        statusChanges: [
          {
            id: "sc-bad-date",
            fromStatus: "SUBMITTED",
            toStatus: "IN_VOTING" as string,
            note: "Missing date",
            changedBy: "admin",
            createdAt: undefined as unknown as string,
          },
        ],
      };
      const stages = computePipelineStages(idea);
      expect(stages).toHaveLength(6);
      expect(stages[1].reached).toBe(true);
      expect(stages[1].current).toBe(true);
      expect(stages[1].date).toBeNull();
    });

    it("handles entirely empty statusChanges array without crashing", () => {
      const idea: IdeaData = {
        status: "SUBMITTED",
        createdAt: "2025-01-01T00:00:00Z",
        statusChanges: [],
      };
      const stages = computePipelineStages(idea);
      expect(stages).toHaveLength(6);
      expect(stages[0].reached).toBe(true);
      expect(stages[0].current).toBe(true);
    });
  });

  describe("date resolution from statusChanges", () => {
    it("uses idea.createdAt for SUBMITTED stage when no status change has toStatus SUBMITTED", () => {
      const idea: IdeaData = {
        status: "SELECTED",
        createdAt: "2025-03-01T09:00:00Z",
        statusChanges: [
          {
            id: "sc1",
            fromStatus: "SUBMITTED",
            toStatus: "IN_VOTING",
            note: "",
            changedBy: "admin",
            createdAt: "2025-03-05T12:00:00Z",
          },
          {
            id: "sc2",
            fromStatus: "IN_VOTING",
            toStatus: "SELECTED",
            note: "",
            changedBy: "admin",
            createdAt: "2025-03-10T15:00:00Z",
          },
        ],
      };
      const stages = computePipelineStages(idea);
      expect(stages[0].date).toBe("2025-03-01");
      expect(stages[1].date).toBe("2025-03-05");
      expect(stages[2].date).toBe("2025-03-10");
    });

    it("uses the most recent status change date when multiple changes exist for the same toStatus", () => {
      const idea: IdeaData = {
        status: "SELECTED",
        createdAt: "2025-01-01T00:00:00Z",
        statusChanges: [
          {
            id: "sc1",
            fromStatus: "SUBMITTED",
            toStatus: "IN_VOTING",
            note: "First voting",
            changedBy: "admin",
            createdAt: "2025-01-10T00:00:00Z",
          },
          {
            id: "sc2",
            fromStatus: "REJECTED",
            toStatus: "IN_VOTING",
            note: "Reopened",
            changedBy: "admin",
            createdAt: "2025-02-10T00:00:00Z",
          },
          {
            id: "sc3",
            fromStatus: "IN_VOTING",
            toStatus: "SELECTED",
            note: "",
            changedBy: "admin",
            createdAt: "2025-02-15T00:00:00Z",
          },
        ],
      };
      const stages = computePipelineStages(idea);
      // IN_VOTING should use the most recent change (sc2)
      expect(stages[1].date).toBe("2025-02-10");
    });
  });
});

describe("getExceptionState", () => {
  it("returns REJECTED for REJECTED status", () => {
    expect(getExceptionState("REJECTED")).toBe("REJECTED");
  });

  it("returns NEEDS_REVISION for NEEDS_REVISION status", () => {
    expect(getExceptionState("NEEDS_REVISION")).toBe("NEEDS_REVISION");
  });

  it("returns MERGED for MERGED status", () => {
    expect(getExceptionState("MERGED")).toBe("MERGED");
  });

  it("returns WITHDRAWN for WITHDRAWN status", () => {
    expect(getExceptionState("WITHDRAWN")).toBe("WITHDRAWN");
  });

  it("returns undefined for forward pipeline statuses", () => {
    const forwardStatuses: Status[] = PIPELINE_STATUS_ORDER;
    for (const status of forwardStatuses) {
      expect(getExceptionState(status)).toBeUndefined();
    }
  });

  it("returns undefined for unexpected/unknown status value", () => {
    expect(getExceptionState("UNKNOWN_STATUS" as Status)).toBeUndefined();
  });
});

describe("resolveExceptionType (deprecated)", () => {
  it("delegates to getExceptionState and returns the status directly", () => {
    expect(resolveExceptionType("REJECTED", [])).toBe("REJECTED");
    expect(resolveExceptionType("NEEDS_REVISION", [])).toBe("NEEDS_REVISION");
    expect(resolveExceptionType("MERGED", [])).toBe("MERGED");
    expect(resolveExceptionType("WITHDRAWN", [])).toBe("WITHDRAWN");
  });

  it("returns undefined for forward pipeline statuses", () => {
    expect(resolveExceptionType("IN_VOTING", [])).toBeUndefined();
    expect(resolveExceptionType("SELECTED", [])).toBeUndefined();
  });
});

describe("findTerminalChange", () => {
  it("returns the most recent terminal status change", () => {
    const statusChanges: StatusChange[] = [
      {
        id: "sc1",
        fromStatus: "SUBMITTED",
        toStatus: "IN_VOTING",
        note: "",
        changedBy: "admin",
        createdAt: "2025-01-02T00:00:00Z",
      },
      {
        id: "sc2",
        fromStatus: "IN_VOTING",
        toStatus: "REJECTED",
        note: "Not feasible",
        changedBy: "admin",
        createdAt: "2025-01-05T00:00:00Z",
      },
    ];
    const result = findTerminalChange(statusChanges);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("sc2");
    expect(result!.note).toBe("Not feasible");
  });

  it("finds NEEDS_REVISION as a terminal change", () => {
    const statusChanges: StatusChange[] = [
      {
        id: "sc1",
        fromStatus: "SELECTED",
        toStatus: "NEEDS_REVISION",
        note: "Needs more detail",
        changedBy: "admin",
        createdAt: "2025-01-05T00:00:00Z",
      },
    ];
    const result = findTerminalChange(statusChanges);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("sc1");
  });

  it("finds MERGED as a terminal change", () => {
    const statusChanges: StatusChange[] = [
      {
        id: "sc1",
        fromStatus: "IN_VOTING",
        toStatus: "MERGED",
        note: "[MERGED] merged with idea #abc",
        changedBy: "admin",
        createdAt: "2025-01-05T00:00:00Z",
      },
    ];
    const result = findTerminalChange(statusChanges);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("sc1");
  });

  it("finds WITHDRAWN as a terminal change", () => {
    const statusChanges: StatusChange[] = [
      {
        id: "sc1",
        fromStatus: "SUBMITTED",
        toStatus: "WITHDRAWN",
        note: "Author withdrew",
        changedBy: "admin",
        createdAt: "2025-01-05T00:00:00Z",
      },
    ];
    const result = findTerminalChange(statusChanges);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("sc1");
  });

  it.each([
    [["SUBMITTED", "IN_VOTING"] as const, "no terminal change"],
    [[] as const, "empty statusChanges"],
  ])("returns null for %s", (statusFlow, _description) => {
    const statusChanges: StatusChange[] = statusFlow.map((status, i) => ({
      id: `sc${i}`,
      fromStatus: i === 0 ? null : "SUBMITTED",
      toStatus: status,
      note: "",
      changedBy: "admin",
      createdAt: `2025-01-0${i + 1}T00:00:00Z`,
    }));
    expect(findTerminalChange(statusChanges)).toBeNull();
  });

  it("picks the last terminal change when multiple exist", () => {
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
        toStatus: "IN_VOTING",
        note: "Reopened",
        changedBy: "admin",
        createdAt: "2025-01-10T00:00:00Z",
      },
      {
        id: "sc3",
        fromStatus: "IN_VOTING",
        toStatus: "NEEDS_REVISION",
        note: "Second exit",
        changedBy: "admin",
        createdAt: "2025-01-15T00:00:00Z",
      },
    ];
    const result = findTerminalChange(statusChanges);
    expect(result!.id).toBe("sc3");
    expect(result!.note).toBe("Second exit");
  });
});

describe("findRejectionChange (backward-compatible alias)", () => {
  it("is the same function as findTerminalChange", () => {
    expect(findRejectionChange).toBe(findTerminalChange);
  });

  it("finds terminal changes when called via the alias", () => {
    const statusChanges: StatusChange[] = [
      {
        id: "sc1",
        fromStatus: "IN_VOTING",
        toStatus: "WITHDRAWN",
        note: "Author withdrew",
        changedBy: "admin",
        createdAt: "2025-01-05T00:00:00Z",
      },
    ];
    const result = findRejectionChange(statusChanges);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("sc1");
  });
});

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
