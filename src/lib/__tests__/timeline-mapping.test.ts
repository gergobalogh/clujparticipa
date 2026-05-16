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
        toStatus: "IN_VOTING",
        note: "Sent to voting",
        changedBy: "admin@cluj.ro",
        createdAt: "2025-02-20T14:30:00Z",
      },
      {
        id: "sc-3",
        fromStatus: "IN_VOTING",
        toStatus: "SELECTED",
        note: "Selected for implementation",
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
      toStatus: "IN_VOTING",
      actorRole: "Admin",
      note: "Sent to voting",
    });

    expect(entries[2]).toEqual({
      id: "sc-3",
      date: "2025-03-10T09:00:00Z",
      fromStatus: "IN_VOTING",
      toStatus: "SELECTED",
      actorRole: "Department",
      note: "Selected for implementation",
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
        toStatus: "IN_VOTING",
        note: "",
        changedBy: "admin@cluj.ro",
        createdAt: "2025-02-01T00:00:00Z",
      },
      {
        id: "sc-3",
        fromStatus: "IN_VOTING",
        toStatus: "SELECTED",
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
        toStatus: "IN_VOTING",
        note: "Voting",
        changedBy: "admin@cluj.ro",
        createdAt: "2025-02-20T14:30:00Z",
      },
      {
        id: "sc-3",
        fromStatus: "IN_VOTING",
        toStatus: "SELECTED",
        note: "Selected",
        changedBy: "dept@cluj.ro",
        createdAt: "2025-03-10T09:00:00Z",
      },
    ];

    it("timeline entries and pipeline stages derive dates from the same statusChanges", () => {
      const idea = {
        status: "SELECTED" as Status,
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

      expect(submittedStage?.date).toBe(submittedEntry?.date?.slice(0, 10));

      // The IN_VOTING stage date should match the timeline entry for IN_VOTING
      const votingStage = pipelineStages.find(
        (s) => s.status === "IN_VOTING"
      );
      const votingEntry = timelineEntries.find(
        (e) => e.toStatus === "IN_VOTING"
      );

      expect(votingStage?.date).toBe(votingEntry?.date?.slice(0, 10));

      // The SELECTED stage date should match the timeline entry for SELECTED
      const selectedStage = pipelineStages.find(
        (s) => s.status === "SELECTED"
      );
      const selectedEntry = timelineEntries.find(
        (e) => e.toStatus === "SELECTED"
      );

      expect(selectedStage?.date).toBe(selectedEntry?.date?.slice(0, 10));
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
          toStatus: "IN_VOTING",
          note: "First voting round",
          changedBy: "admin@cluj.ro",
          createdAt: "2025-02-01T10:00:00Z",
        },
        {
          id: "sc-2b",
          fromStatus: "IN_VOTING",
          toStatus: "SELECTED",
          note: "Quick selection",
          changedBy: "admin@cluj.ro",
          createdAt: "2025-02-01T10:00:01Z",
        },
      ];

      const idea = {
        status: "SELECTED" as Status,
        createdAt: "2025-01-15T10:00:00Z",
        statusChanges: concurrentChanges,
      };

      const pipelineStages = computePipelineStages(idea);
      const timelineEntries = mapStatusChangesToTimelineEntries(
        concurrentChanges
      );

      // Pipeline: SELECTED is the current stage
      const selectedStage = pipelineStages.find(
        (s) => s.status === "SELECTED"
      );
      expect(selectedStage?.current).toBe(true);
      expect(selectedStage?.reached).toBe(true);

      // Timeline: all 3 entries present chronologically
      expect(timelineEntries).toHaveLength(3);
      expect(timelineEntries[0].toStatus).toBe("SUBMITTED");
      expect(timelineEntries[1].toStatus).toBe("IN_VOTING");
      expect(timelineEntries[2].toStatus).toBe("SELECTED");
    });
  });
});
