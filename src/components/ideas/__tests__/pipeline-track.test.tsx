/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { PipelineTrack } from "../pipeline-track";
import type { PipelineStage } from "../pipeline-track";

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) =>
    `${namespace}.${key}`,
}));

function makeStages(currentStatus: string): PipelineStage[] {
  const allStatuses: string[] = [
    "SUBMITTED",
    "UNDER_REVIEW",
    "ELIGIBLE",
    "IN_VOTING",
    "SELECTED",
    "IN_PROGRESS",
    "COMPLETED",
  ];
  return allStatuses.map((status, index) => ({
    status: status as PipelineStage["status"],
    label: status,
    reached: index <= allStatuses.indexOf(currentStatus),
    current: status === currentStatus,
    date: status === currentStatus ? "2025-04-01" : null,
  }));
}

const sevenStages = makeStages("IN_VOTING");

describe("PipelineTrack", () => {
  it("renders a continuous track bar with all 7 stage markers", () => {
    render(<PipelineTrack stages={sevenStages} />);

    const baseBar = screen.getByTestId("track-base");
    expect(baseBar).toBeInTheDocument();
    expect(baseBar).toHaveClass("bg-gray-200");

    const markers = screen.getAllByTestId("stage-marker");
    expect(markers).toHaveLength(7);
  });

  it("alternates stage labels above and below the track on desktop", () => {
    render(<PipelineTrack stages={sevenStages} />);

    const labels = screen.getAllByTestId("stage-label");
    const aboveLabels = labels.filter((el) =>
      el.classList.contains("bottom-5")
    );
    const belowLabels = labels.filter((el) =>
      el.classList.contains("top-5")
    );
    expect(aboveLabels).toHaveLength(4);
    expect(belowLabels).toHaveLength(3);
  });

  it("renders all labels on one side in vertical mobile mode", () => {
    render(<PipelineTrack stages={sevenStages} isMobile={true} />);

    const trackContainer = screen.getByTestId("pipeline-track");
    expect(trackContainer).toHaveClass("min-h-72");

    const labels = screen.getAllByTestId("stage-label");
    const rightSideLabels = labels.filter((el) =>
      el.classList.contains("left-5")
    );
    expect(rightSideLabels).toHaveLength(7);
  });

  it("renders colored overlay segments for reached stages", () => {
    render(<PipelineTrack stages={sevenStages} />);

    const overlay = screen.getByTestId("track-overlay");
    expect(overlay).toBeInTheDocument();

    const segments = screen.getAllByTestId("track-segment");
    expect(segments.length).toBeGreaterThan(0);

    const coloredSegments = segments.filter(
      (s) => !s.classList.contains("bg-gray-200")
    );
    expect(coloredSegments.length).toBeGreaterThan(0);
  });

  it("renders StalledIndicator below the track when stalled", () => {
    render(
      <PipelineTrack
        stages={sevenStages}
        exceptionState="STALLED"
        stalledLabel="waitingForDepartmentReview"
        stalledDays={5}
      />
    );

    expect(screen.getByText(/Pipeline\.waitingFor/)).toBeInTheDocument();

    const stalled = screen.getByTestId("stalled-indicator");
    expect(stalled).toHaveClass("w-full");
  });

  it("does not render StalledIndicator when not stalled", () => {
    render(<PipelineTrack stages={sevenStages} />);

    expect(screen.queryByTestId("stalled-indicator")).not.toBeInTheDocument();
  });

  it("passes REJECTED exceptionState to markers", () => {
    render(
      <PipelineTrack stages={sevenStages} exceptionState="REJECTED" />
    );

    const markers = screen.getAllByTestId("stage-marker");
    const rejectedMarkers = markers.filter((m) =>
      m.classList.contains("bg-red-600")
    );
    expect(rejectedMarkers.length).toBeGreaterThanOrEqual(1);
  });

  it("shows date only on the current stage", () => {
    render(<PipelineTrack stages={sevenStages} />);

    const dates = screen.queryAllByText("2025-04-01");
    expect(dates).toHaveLength(1);
  });

  it("renders current stage with hollow ink-bordered marker", () => {
    render(<PipelineTrack stages={sevenStages} />);

    const markers = screen.getAllByTestId("stage-marker");
    const currentMarker = markers.find((m) =>
      m.classList.contains("border-ink") && m.classList.contains("bg-paper")
    );
    expect(currentMarker).toBeInTheDocument();
  });

  it("renders first stage with solid ink dot", () => {
    render(<PipelineTrack stages={sevenStages} />);

    const markers = screen.getAllByTestId("stage-marker");
    expect(markers[0]).toHaveClass("bg-ink");
  });

  it("renders future stages with gray-bordered hollow markers", () => {
    render(<PipelineTrack stages={sevenStages} />);

    const markers = screen.getAllByTestId("stage-marker");
    const futureMarkers = markers.filter((m) =>
      m.classList.contains("border-gray-300") && m.classList.contains("bg-paper")
    );
    expect(futureMarkers.length).toBeGreaterThanOrEqual(1);
  });

  it("renders horizontal track layout by default", () => {
    render(<PipelineTrack stages={sevenStages} />);

    const trackContainer = screen.getByTestId("pipeline-track");
    expect(trackContainer).toHaveClass("h-28");
  });

  it("accepts PipelineStage array without modification", () => {
    const stages: PipelineStage[] = makeStages("ELIGIBLE");
    render(<PipelineTrack stages={stages} />);

    const markers = screen.getAllByTestId("stage-marker");
    expect(markers).toHaveLength(7);
  });

  it("renders without crashing for empty stages array", () => {
    render(<PipelineTrack stages={[]} />);

    const trackContainer = screen.queryByTestId("pipeline-track");
    expect(trackContainer).toBeInTheDocument();
    expect(screen.queryAllByTestId("stage-marker")).toHaveLength(0);
  });

  describe("showcase mode", () => {
    it("preserves reached and current stage state when showcase=true", () => {
      render(<PipelineTrack stages={sevenStages} showcase={true} />);

      const markers = screen.getAllByTestId("stage-marker");
      const futureMarkers = markers.filter(
        (m) =>
          m.classList.contains("border-gray-300") &&
          m.classList.contains("bg-paper")
      );
      expect(futureMarkers.length).toBeGreaterThanOrEqual(1);

      const currentMarker = markers.find((m) =>
        m.classList.contains("border-ink") && m.classList.contains("bg-paper")
      );
      expect(currentMarker).toBeInTheDocument();
    });

    it("wraps each stage marker in an anchor with correct href when showcase=true", () => {
      render(<PipelineTrack stages={sevenStages} showcase={true} />);

      const anchors = screen.getAllByTestId("stage-anchor");
      expect(anchors).toHaveLength(7);
      expect(anchors[0]).toHaveAttribute("href", "#submitted");
      expect(anchors[1]).toHaveAttribute("href", "#under_review");
      expect(anchors[2]).toHaveAttribute("href", "#eligible");
      expect(anchors[3]).toHaveAttribute("href", "#in_voting");
    });

    it("calls onStageClick with clicked status when showcase marker is clicked", () => {
      const onStageClick = vi.fn();
      render(
        <PipelineTrack
          stages={sevenStages}
          showcase={true}
          onStageClick={onStageClick}
        />
      );

      const anchors = screen.getAllByTestId("stage-anchor");
      anchors[2].click();
      expect(onStageClick).toHaveBeenCalledWith("ELIGIBLE");
    });

    it("renders identically without showcase prop — no regression", () => {
      render(<PipelineTrack stages={sevenStages} />);
      const markersWithoutShowcase = screen.getAllByTestId("stage-marker");

      // Verify the standard behavior is preserved: future markers exist
      const futureMarkers = markersWithoutShowcase.filter(
        (m) =>
          m.classList.contains("border-gray-300") &&
          m.classList.contains("bg-paper")
      );
      expect(futureMarkers.length).toBeGreaterThanOrEqual(1);

      // No anchors rendered in non-showcase mode
      expect(screen.queryAllByTestId("stage-anchor")).toHaveLength(0);
    });
  });
});
