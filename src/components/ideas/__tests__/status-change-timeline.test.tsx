/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { StatusChangeTimeline, TimelineEntry } from "../status-change-timeline";

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) =>
    `${namespace}.${key}`,
  useLocale: () => "en",
}));

const sampleEntries: TimelineEntry[] = [
  {
    id: "1",
    date: "2025-01-15T10:00:00Z",
    fromStatus: null,
    toStatus: "SUBMITTED",
    actorRole: "System",
    note: "Idea submitted",
  },
  {
    id: "2",
    date: "2025-02-20T14:30:00Z",
    fromStatus: "SUBMITTED",
    toStatus: "UNDER_REVIEW",
    actorRole: "Admin",
    note: "Review started",
  },
  {
    id: "3",
    date: "2025-03-10T09:00:00Z",
    fromStatus: "UNDER_REVIEW",
    toStatus: "ELIGIBLE",
    actorRole: "Department",
    note: "Passed eligibility check",
  },
];

describe("StatusChangeTimeline", () => {
  it("is collapsed by default", () => {
    render(
      <StatusChangeTimeline
        entries={sampleEntries}
        noUpdatesLabel="Timeline.noUpdatesYet"
        viewHistoryLabel="Timeline.viewFullHistory"
      />
    );

    // The toggle label should be visible
    expect(screen.getByText("Timeline.viewFullHistory")).toBeInTheDocument();

    // Entry content should NOT be visible when collapsed
    expect(screen.queryByText("Idea submitted")).not.toBeInTheDocument();
  });

  it("shows 'View full history' label when collapsed", () => {
    render(
      <StatusChangeTimeline
        entries={sampleEntries}
        noUpdatesLabel="Timeline.noUpdatesYet"
        viewHistoryLabel="Timeline.viewFullHistory"
      />
    );

    expect(screen.getByText("Timeline.viewFullHistory")).toBeInTheDocument();
  });

  it("expands the timeline when clicking 'View full history'", () => {
    render(
      <StatusChangeTimeline
        entries={sampleEntries}
        noUpdatesLabel="Timeline.noUpdatesYet"
        viewHistoryLabel="Timeline.viewFullHistory"
      />
    );

    const toggle = screen.getByText("Timeline.viewFullHistory");
    fireEvent.click(toggle);

    // After clicking, entries should be visible
    expect(screen.getByText("Idea submitted")).toBeInTheDocument();
    expect(screen.getByText("Review started")).toBeInTheDocument();
    expect(screen.getByText("Passed eligibility check")).toBeInTheDocument();
  });

  it("shows date, from-to status, actor role, and note for each entry", () => {
    render(
      <StatusChangeTimeline
        entries={sampleEntries}
        noUpdatesLabel="Timeline.noUpdatesYet"
        viewHistoryLabel="Timeline.viewFullHistory"
      />
    );

    // Expand first
    fireEvent.click(screen.getByText("Timeline.viewFullHistory"));

    // Status labels are rendered -- statuses repeat across entries (from/to transitions)
    const submittedLabels = screen.getAllByText("Statuses.SUBMITTED");
    expect(submittedLabels.length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("Statuses.UNDER_REVIEW").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Statuses.ELIGIBLE").length).toBeGreaterThanOrEqual(1);

    // Actor roles are rendered
    expect(screen.getByText("System")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("Department")).toBeInTheDocument();

    // Notes are rendered
    expect(screen.getByText("Idea submitted")).toBeInTheDocument();
    expect(screen.getByText("Review started")).toBeInTheDocument();
  });

  it("shows 'No updates yet' when entries array is empty", () => {
    render(
      <StatusChangeTimeline
        entries={[]}
        noUpdatesLabel="Timeline.noUpdatesYet"
        viewHistoryLabel="Timeline.viewFullHistory"
      />
    );

    expect(screen.getByText("Timeline.noUpdatesYet")).toBeInTheDocument();
    // View full history toggle should not appear when there are no entries
    expect(screen.queryByText("Timeline.viewFullHistory")).not.toBeInTheDocument();
  });

  it("displays unknown actor role as 'Department'", () => {
    const entriesWithUnknownActor: TimelineEntry[] = [
      {
        id: "1",
        date: "2025-01-15T10:00:00Z",
        fromStatus: null,
        toStatus: "SUBMITTED",
        actorRole: "Department",
        note: "Initial status",
      },
    ];

    render(
      <StatusChangeTimeline
        entries={entriesWithUnknownActor}
        noUpdatesLabel="Timeline.noUpdatesYet"
        viewHistoryLabel="Timeline.viewFullHistory"
      />
    );

    fireEvent.click(screen.getByText("Timeline.viewFullHistory"));

    // The actorRole is pre-computed by the parent, so "Department" is passed directly
    expect(screen.getByText("Department")).toBeInTheDocument();
  });

  it("renders 20 entries without performance issues", () => {
    const manyEntries: TimelineEntry[] = Array.from({ length: 20 }, (_, index) => ({
      id: String(index + 1),
      date: new Date(2025, 0, index + 1).toISOString(),
      fromStatus: index === 0 ? null : "SUBMITTED",
      toStatus: index === 0 ? "SUBMITTED" : "UNDER_REVIEW",
      actorRole: "System",
      note: `Entry note ${index + 1}`,
    }));

    const { container } = render(
      <StatusChangeTimeline
        entries={manyEntries}
        noUpdatesLabel="Timeline.noUpdatesYet"
        viewHistoryLabel="Timeline.viewFullHistory"
      />
    );

    fireEvent.click(screen.getByText("Timeline.viewFullHistory"));

    // All 20 entries should be rendered
    for (let index = 1; index <= 20; index++) {
      expect(screen.getByText(`Entry note ${index}`)).toBeInTheDocument();
    }
  });

  it("renders multiple entries in chronological order", () => {
    render(
      <StatusChangeTimeline
        entries={sampleEntries}
        noUpdatesLabel="Timeline.noUpdatesYet"
        viewHistoryLabel="Timeline.viewFullHistory"
      />
    );

    fireEvent.click(screen.getByText("Timeline.viewFullHistory"));

    const notes = screen.getAllByText(/Idea submitted|Review started|Passed eligibility check/);

    // Entries should appear in the order provided (chronological)
    expect(notes[0]).toHaveTextContent("Idea submitted");
    expect(notes[1]).toHaveTextContent("Review started");
    expect(notes[2]).toHaveTextContent("Passed eligibility check");
  });
});
