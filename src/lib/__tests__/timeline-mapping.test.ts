import { describe, it, expect } from "vitest";
import { mapStatusChangesToTimelineEntries } from "../timeline-mapping";
import { computePipelineStages } from "../pipeline-computation";
import type { Status } from "@prisma/client";

type StatusChange = {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  note: string;
  changedBy: string;
  createdAt: string;
};

describe("mapStatusChangesToTimelineEntries", () => {
  it("maps each StatusChange to a TimelineEntry with actor role resolved", () => {
    const statusChanges: StatusChange[] = [
      {
        id: "sc-1",
        fromStatus: null,
        toStatus: "SUBMITTED",
        note: "Idea submitted",
        changedBy: "system",
        createdAt: "2025-01-15T10:00:00Z",
      },
      {
        id: "sc-2",
        fromStatus: "SUBMITTED",
        toStatus: "UNDER_REVIEW",
        note: "Review started",
        changedBy: "admin@cluj.ro",
        createdAt: "2025-02-20T14:30:00Z",
      },
      {
        id: "sc-3",
        fromStatus: "UNDER_REVIEW",
        toStatus: "ELIGIBLE",
        note: "Passed eligibility",
        changedBy: "dept-urbanism@cluj.ro",
        createdAt: "2025-03-10T09:00:00Z",
      },
    ];

    const entries = mapStatusChangesToTimelineEntries(statusChanges);

    expect(entries).toHaveLength(3);

    expect(entries[0]).toEqual({
      id: "sc-1",
      date: "2025-01-15T10:00:00Z",
      fromStatus: null,
      toStatus: "SUBMITTED",
      actorRole: "System",
      note: "Idea submitted",
    });

    expect(entries[1]).toEqual({
      id: "sc-2",
      date: "2025-02-20T14:30:00Z",
      fromStatus: "SUBMITTED",
      toStatus: "UNDER_REVIEW",
      actorRole: "Admin",
      note: "Review started",
    });

    expect(entries[2]).toEqual({
      id: "sc-3",
      date: "2025-03-10T09:00:00Z",
      fromStatus: "UNDER_REVIEW",
      toStatus: "ELIGIBLE",
      actorRole: "Department",
      note: "Passed eligibility",
    });
  });

  it("preserves chronological order from the input array", () => {
    const statusChanges: StatusChange[] = [
      {
        id: "sc-1",
        fromStatus: null,
        toStatus: "SUBMITTED",
        note: "",
        changedBy: "system",
        createdAt: "2025-01-01T00:00:00Z",
      },
      {
        id: "sc-2",
        fromStatus: "SUBMITTED",
        toStatus: "UNDER_REVIEW",
        note: "",
        changedBy: "admin@cluj.ro",
        createdAt: "2025-02-01T00:00:00Z",
      },
      {
        id: "sc-3",
        fromStatus: "UNDER_REVIEW",
        toStatus: "ELIGIBLE",
        note: "",
        changedBy: "system",
        createdAt: "2025-03-01T00:00:00Z",
      },
    ];

    const entries = mapStatusChangesToTimelineEntries(statusChanges);

    const dates = entries.map((e) => e.date);
    expect(dates).toEqual([
      "2025-01-01T00:00:00Z",
      "2025-02-01T00:00:00Z",
      "2025-03-01T00:00:00Z",
    ]);
  });

  it("handles null fromStatus for initial submission entries", () => {
    const statusChanges: StatusChange[] = [
      {
        id: "sc-1",
        fromStatus: null,
        toStatus: "SUBMITTED",
        note: "First entry",
        changedBy: "system",
        createdAt: "2025-01-15T10:00:00Z",
      },
    ];

    const entries = mapStatusChangesToTimelineEntries(statusChanges);

    expect(entries[0].fromStatus).toBeNull();
    expect(entries[0].toStatus).toBe("SUBMITTED");
  });

  it("returns empty array when input is empty", () => {
    const entries = mapStatusChangesToTimelineEntries([]);
    expect(entries).toEqual([]);
  });

  it("preserves null note values as empty strings", () => {
    const statusChanges: StatusChange[] = [
      {
        id: "sc-1",
        fromStatus: null,
        toStatus: "SUBMITTED",
        note: "",
        changedBy: "system",
        createdAt: "2025-01-15T10:00:00Z",
      },
    ];

    const entries = mapStatusChangesToTimelineEntries(statusChanges);
    expect(entries[0].note).toBe("");
  });

  describe("data consistency with pipeline", () => {
    const statusChanges: StatusChange[] = [
      {
        id: "sc-1",
        fromStatus: null,
        toStatus: "SUBMITTED",
        note: "Initial",
        changedBy: "system",
        createdAt: "2025-01-15T10:00:00Z",
      },
      {
        id: "sc-2",
        fromStatus: "SUBMITTED",
        toStatus: "UNDER_REVIEW",
        note: "Review",
        changedBy: "admin@cluj.ro",
        createdAt: "2025-02-20T14:30:00Z",
      },
      {
        id: "sc-3",
        fromStatus: "UNDER_REVIEW",
        toStatus: "ELIGIBLE",
        note: "Eligible",
        changedBy: "dept@cluj.ro",
        createdAt: "2025-03-10T09:00:00Z",
      },
    ];

    it("timeline entries and pipeline stages derive dates from the same statusChanges", () => {
      const idea = {
        status: "ELIGIBLE" as Status,
        createdAt: "2025-01-15T10:00:00Z",
        statusChanges,
      };

      const pipelineStages = computePipelineStages(idea);
      const timelineEntries = mapStatusChangesToTimelineEntries(statusChanges);

      // The SUBMITTED stage date should match the timeline entry for the SUBMITTED status change
      const submittedStage = pipelineStages.find(
        (s) => s.status === "SUBMITTED"
      );
      const submittedEntry = timelineEntries.find(
        (e) => e.toStatus === "SUBMITTED"
      );

      expect(submittedStage?.date).toBe(submittedEntry?.date);

      // The UNDER_REVIEW stage date should match the timeline entry for UNDER_REVIEW
      const reviewStage = pipelineStages.find(
        (s) => s.status === "UNDER_REVIEW"
      );
      const reviewEntry = timelineEntries.find(
        (e) => e.toStatus === "UNDER_REVIEW"
      );

      expect(reviewStage?.date).toBe(reviewEntry?.date);

      // The ELIGIBLE stage date should match the timeline entry for ELIGIBLE
      const eligibleStage = pipelineStages.find(
        (s) => s.status === "ELIGIBLE"
      );
      const eligibleEntry = timelineEntries.find(
        (e) => e.toStatus === "ELIGIBLE"
      );

      expect(eligibleStage?.date).toBe(eligibleEntry?.date);
    });

    it("concurrent status changes: pipeline shows most recent as current, timeline shows all", () => {
      const concurrentChanges: StatusChange[] = [
        {
          id: "sc-1",
          fromStatus: null,
          toStatus: "SUBMITTED",
          note: "Initial",
          changedBy: "system",
          createdAt: "2025-01-15T10:00:00Z",
        },
        {
          id: "sc-2a",
          fromStatus: "SUBMITTED",
          toStatus: "UNDER_REVIEW",
          note: "First review",
          changedBy: "admin@cluj.ro",
          createdAt: "2025-02-01T10:00:00Z",
        },
        {
          id: "sc-2b",
          fromStatus: "UNDER_REVIEW",
          toStatus: "ELIGIBLE",
          note: "Quick eligibility",
          changedBy: "admin@cluj.ro",
          createdAt: "2025-02-01T10:00:01Z",
        },
      ];

      const idea = {
        status: "ELIGIBLE" as Status,
        createdAt: "2025-01-15T10:00:00Z",
        statusChanges: concurrentChanges,
      };

      const pipelineStages = computePipelineStages(idea);
      const timelineEntries = mapStatusChangesToTimelineEntries(
        concurrentChanges
      );

      // Pipeline: ELIGIBLE is the current stage
      const eligibleStage = pipelineStages.find(
        (s) => s.status === "ELIGIBLE"
      );
      expect(eligibleStage?.current).toBe(true);
      expect(eligibleStage?.reached).toBe(true);

      // Timeline: all 3 entries present chronologically
      expect(timelineEntries).toHaveLength(3);
      expect(timelineEntries[0].toStatus).toBe("SUBMITTED");
      expect(timelineEntries[1].toStatus).toBe("UNDER_REVIEW");
      expect(timelineEntries[2].toStatus).toBe("ELIGIBLE");
    });
  });
});
