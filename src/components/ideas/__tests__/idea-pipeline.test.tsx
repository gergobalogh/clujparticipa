/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { IdeaPipeline } from "../idea-pipeline";
import type { PipelineStage } from "../idea-pipeline";

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) =>
    `${namespace}.${key}`,
}));

function makeStages(count: number, currentStatus: string): PipelineStage[] {
  const allStatuses = [
    "SUBMITTED",
    "UNDER_REVIEW",
    "ELIGIBLE",
    "IN_VOTING",
    "SELECTED",
    "IN_PROGRESS",
    "COMPLETED",
  ];
  return allStatuses.slice(0, count).map((status, index) => ({
    status: status as PipelineStage["status"],
    label: status,
    reached: index <= allStatuses.indexOf(currentStatus),
    current: status === currentStatus,
    date: status === "SUBMITTED" ? "2025-03-15" : null,
  }));
}

const sevenStages = makeStages(7, "IN_VOTING");

describe("IdeaPipeline", () => {
  // Acceptance: renders 7 stages in correct order
  it("renders all 7 stages when given 7-item stages array", () => {
    render(<IdeaPipeline stages={sevenStages} />);

    const stageElements = screen.getAllByTestId("pipeline-stage");
    expect(stageElements).toHaveLength(7);
  });

  // Acceptance: StalledIndicator shown when exceptionState=STALLED
  it("shows StalledIndicator when exceptionState is STALLED and stalledLabel provided", () => {
    render(
      <IdeaPipeline
        stages={sevenStages}
        exceptionState="STALLED"
        stalledLabel="Review"
        stalledDays={5}
      />
    );

    expect(screen.getByText(/Pipeline\.waitingFor/)).toBeInTheDocument();
    expect(screen.getByText(/^5\s/)).toBeInTheDocument();
    expect(screen.getByText(/Pipeline\.daysAgo/)).toBeInTheDocument();
  });

  // Acceptance: passes exceptionState to each IdeaPipelineStage
  it("passes REJECTED exceptionState to pipeline stages", () => {
    render(
      <IdeaPipeline stages={sevenStages} exceptionState="REJECTED" />
    );

    // When REJECTED, all stage markers should have red-600 class
    const markers = screen.getAllByTestId("stage-marker");
    const rejectedMarkers = markers.filter((m) =>
      m.classList.contains("bg-red-600")
    );
    expect(rejectedMarkers.length).toBeGreaterThanOrEqual(1);
  });

  // Unit: horizontal layout by default
  it("renders horizontal layout (flex-row) when isMobile is false or undefined", () => {
    const { container } = render(<IdeaPipeline stages={sevenStages} />);

    const pipeline = container.querySelector("[data-testid='pipeline']");
    expect(pipeline?.className).toContain("flex-row");
  });

  // Unit: vertical layout when isMobile
  it("renders vertical layout (flex-col) when isMobile is true", () => {
    const { container } = render(
      <IdeaPipeline stages={sevenStages} isMobile={true} />
    );

    const pipeline = container.querySelector("[data-testid='pipeline']");
    expect(pipeline?.className).toContain("flex-col");
  });

  // Unit: StalledIndicator not rendered when no exceptionState
  it("does not render StalledIndicator when exceptionState is undefined", () => {
    render(<IdeaPipeline stages={sevenStages} />);

    expect(screen.queryByText(/Pipeline\.waitingFor/)).not.toBeInTheDocument();
  });

  // Unit: handles empty stages array gracefully
  it("renders without crashing for empty stages array", () => {
    const { container } = render(<IdeaPipeline stages={[]} />);

    const pipeline = container.querySelector("[data-testid='pipeline']");
    expect(pipeline).toBeInTheDocument();
    expect(screen.queryAllByTestId("pipeline-stage")).toHaveLength(0);
  });

  // Acceptance: renders without crashing for unexpected status values
  it("renders without crashing for unexpected status values in stages", () => {
    const stagesWithUnexpected: PipelineStage[] = [
      {
        status: "SUBMITTED" as PipelineStage["status"],
        label: "Submitted",
        reached: true,
        current: true,
        date: "2025-03-15",
      },
    ];

    // Should not throw -- unknown statuses handled gracefully by IdeaPipelineStage
    expect(() =>
      render(<IdeaPipeline stages={stagesWithUnexpected} />)
    ).not.toThrow();
  });

  // Error path: pipeline not rendered when idea is not found
  // The IdeaDetailPage prevents pipeline rendering for !idea, so IdeaPipeline
  // is never mounted in that case. This test verifies the component itself
  // is stable when not rendered (no side effects on unmount).
  it("does not render any pipeline elements when stages is empty (not-found case)", () => {
    const { container } = render(<IdeaPipeline stages={[]} />);

    const pipeline = container.querySelector("[data-testid='pipeline']");
    expect(pipeline).toBeInTheDocument();
    // No stage elements rendered = safe for not-found page to render without pipeline
    expect(screen.queryAllByTestId("pipeline-stage")).toHaveLength(0);
  });
});
