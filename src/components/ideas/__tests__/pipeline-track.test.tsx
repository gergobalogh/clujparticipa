/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { PipelineTrack } from "../pipeline-track";
import type { PipelineStage } from "../idea-pipeline";

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) =>
    `${namespace}.${key}`,
}));

vi.mock("motion/react", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: {
      children: React.ReactNode;
      [key: string]: unknown;
    }) => {
      const {
        initial,
        animate,
        transition,
        ...rest
      } = props;
      return <div {...rest}>{children}</div>;
    },
  },
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
    date: status === "SUBMITTED" ? "2025-03-15" : null,
  }));
}

const sevenStages = makeStages("IN_VOTING");

describe("PipelineTrack", () => {
  // AC-P1: Track renders as a single continuous bar with 7 stage markers positioned on the bar
  it("renders a continuous track bar with all 7 stage markers", () => {
    const { container } = render(<PipelineTrack stages={sevenStages} />);

    // Gray base bar exists
    const baseBar = screen.getByTestId("track-base");
    expect(baseBar).toBeInTheDocument();
    expect(baseBar).toHaveClass("bg-gray-200");

    // 7 stage markers positioned on the bar
    const markers = screen.getAllByTestId("stage-marker");
    expect(markers).toHaveLength(7);
  });

  // AC-P5: Stage labels alternate above/below on desktop
  it("alternates stage labels above and below the track on desktop", () => {
    const { container } = render(<PipelineTrack stages={sevenStages} />);

    const labels = screen.getAllByTestId("stage-label");
    // Even-index labels should be above, odd-index below
    const aboveLabels = labels.filter((el) =>
      el.classList.contains("order-before")
    );
    const belowLabels = labels.filter((el) =>
      el.classList.contains("order-after")
    );
    // With 7 stages: indices 0,2,4,6 above (4), indices 1,3,5 below (3)
    expect(aboveLabels).toHaveLength(4);
    expect(belowLabels).toHaveLength(3);
  });

  // AC-P6: On mount, track fills left-to-right and markers fade in sequentially
  it("renders entrance animation wrapper with left-to-right origin on track overlay", () => {
    const { container } = render(<PipelineTrack stages={sevenStages} />);

    // The colored overlay should exist with animation properties
    const overlay = screen.getByTestId("track-overlay");
    expect(overlay).toBeInTheDocument();

    // Motion markers should exist (each with staggered delay from index)
    const motionMarkers = screen.getAllByTestId("motion-marker");
    expect(motionMarkers).toHaveLength(7);
  });

  // AC-P9: StalledIndicator renders below the track, spanning full width
  it("renders StalledIndicator below the track with fullWidth when stalled", () => {
    render(
      <PipelineTrack
        stages={sevenStages}
        exceptionState="STALLED"
        stalledLabel="waitingForDepartmentReview"
        stalledDays={5}
      />
    );

    // StalledIndicator is rendered
    expect(screen.getByText(/Pipeline\.waitingFor/)).toBeInTheDocument();

    // It should have fullWidth applied
    const stalled = screen.getByTestId("stalled-indicator");
    expect(stalled).toHaveClass("w-full");
  });

  // AC-P11: On mobile (isMobile=true), track renders vertically
  it("renders vertical track layout when isMobile is true", () => {
    const { container } = render(
      <PipelineTrack stages={sevenStages} isMobile={true} />
    );

    const trackContainer = screen.getByTestId("pipeline-track");
    expect(trackContainer).toHaveClass("flex-col");

    // Base bar should be vertical (h-full w-2)
    const baseBar = screen.getByTestId("track-base");
    expect(baseBar).toHaveClass("w-2");

    // All labels on one side in vertical mode
    const labels = screen.getAllByTestId("stage-label");
    const oneSideLabels = labels.filter((el) =>
      el.classList.contains("order-after")
    );
    expect(oneSideLabels).toHaveLength(7);
  });

  // AC-P13: PipelineStage type and pipeline-stages.ts remain unchanged
  // Verified structurally: PipelineTrack accepts PipelineStage[] from idea-pipeline unchanged
  it("accepts PipelineStage array from idea-pipeline without modification", () => {
    // This test validates the contract: same PipelineStage type, no adaptation needed
    const stages: PipelineStage[] = makeStages("ELIGIBLE");
    const { container } = render(<PipelineTrack stages={stages} />);

    const markers = screen.getAllByTestId("stage-marker");
    expect(markers).toHaveLength(7);
  });

  // Horizontal layout by default (not mobile)
  it("renders horizontal track layout by default", () => {
    render(<PipelineTrack stages={sevenStages} />);

    const trackContainer = screen.getByTestId("pipeline-track");
    expect(trackContainer).toHaveClass("sm:flex-row");
  });

  // No StalledIndicator when not stalled
  it("does not render StalledIndicator when exceptionState is not STALLED", () => {
    render(<PipelineTrack stages={sevenStages} />);

    expect(screen.queryByTestId("stalled-indicator")).not.toBeInTheDocument();
  });

  // REJECTED exception state passes through to track segments
  it("passes REJECTED exceptionState to track segments", () => {
    render(
      <PipelineTrack stages={sevenStages} exceptionState="REJECTED" />
    );

    // At least one marker should show rejected state (red)
    const markers = screen.getAllByTestId("stage-marker");
    const rejectedMarkers = markers.filter((m) =>
      m.classList.contains("bg-red-600")
    );
    expect(rejectedMarkers.length).toBeGreaterThanOrEqual(1);
  });

  // Colored overlay segments fill the reached portion
  it("renders colored overlay segments for reached stages", () => {
    render(<PipelineTrack stages={sevenStages} />);

    // The overlay exists and should contain colored segments
    const overlay = screen.getByTestId("track-overlay");
    expect(overlay).toBeInTheDocument();

    // Track segments should exist within the overlay
    const segments = screen.getAllByTestId("track-segment");
    expect(segments.length).toBeGreaterThan(0);

    // Some segments should be colored (reached), some gray (future)
    const coloredSegments = segments.filter(
      (s) => !s.classList.contains("bg-gray-200")
    );
    expect(coloredSegments.length).toBeGreaterThan(0);
  });

  // Empty stages array graceful handling
  it("renders without crashing for empty stages array", () => {
    const { container } = render(<PipelineTrack stages={[]} />);

    const trackContainer = screen.queryByTestId("pipeline-track");
    expect(trackContainer).toBeInTheDocument();
    expect(screen.queryAllByTestId("stage-marker")).toHaveLength(0);
  });
});
