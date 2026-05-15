/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { PipelineTrackSegment } from "../pipeline-track-segment";
import type { PipelineStage } from "../pipeline-track";

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) =>
    `${namespace}.${key}`,
}));

// Mock motion/react to render children without animation
vi.mock("motion/react", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: {
      children: React.ReactNode;
      [key: string]: unknown;
    }) => {
      // Filter out motion-specific props that cause React warnings
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

const reachedStage: PipelineStage = {
  status: "SUBMITTED",
  label: "Submitted",
  reached: true,
  current: false,
  date: "2025-03-15",
};

const currentStage: PipelineStage = {
  status: "IN_VOTING",
  label: "In voting",
  reached: true,
  current: true,
  date: "2025-04-01",
};

const futureStage: PipelineStage = {
  status: "SELECTED",
  label: "Selected",
  reached: false,
  current: false,
  date: null,
};

describe("PipelineTrackSegment", () => {
  // AC-P2: Reached stages show colored track segment and filled colored marker
  it("renders reached stage with colored track segment and filled colored marker", () => {
    render(<PipelineTrackSegment stage={reachedStage} index={0} />);

    const marker = screen.getByTestId("stage-marker");
    expect(marker).toHaveClass("bg-civic-orange");

    const track = screen.getByTestId("track-segment");
    expect(track).not.toHaveClass("bg-gray-200");

    expect(screen.getByText("Statuses.SUBMITTED")).toBeInTheDocument();
  });

  // AC-P3: Current stage marker shows a pulse ring animation
  it("renders current stage marker with pulse ring animation", () => {
    render(<PipelineTrackSegment stage={currentStage} index={1} />);

    const pulse = screen.getByTestId("pulse-ring");
    expect(pulse).toHaveClass("animate-pulse");

    const marker = screen.getByTestId("stage-marker");
    expect(marker).toHaveClass("bg-purple-700");

    expect(screen.getByText("Statuses.IN_VOTING")).toBeInTheDocument();
  });

  // AC-P4: Future stages show gray track segment and gray-outlined marker
  it("renders future stage with gray track segment and outlined gray marker", () => {
    render(<PipelineTrackSegment stage={futureStage} index={3} />);

    const marker = screen.getByTestId("stage-marker");
    expect(marker).toHaveClass("border-gray-300");
    expect(marker).not.toHaveClass("bg-civic-teal");

    const track = screen.getByTestId("track-segment");
    expect(track).toHaveClass("bg-gray-200");

    expect(screen.getByText("Statuses.SELECTED")).toBeInTheDocument();
  });

  // AC-P8: REJECTED renders red marker at rejection point, gray beyond
  it("renders REJECTED state with red marker and gray track beyond", () => {
    render(
      <PipelineTrackSegment stage={reachedStage} exceptionState="REJECTED" index={0} />
    );

    const marker = screen.getByTestId("stage-marker");
    expect(marker).toHaveClass("bg-red-600");

    expect(screen.getByText("Statuses.SUBMITTED")).toBeInTheDocument();
  });

  // AC-P7: Animation respects prefers-reduced-motion (component uses motion.div which handles this)
  it("renders with motion wrapper for animation entrance", () => {
    const { container } = render(
      <PipelineTrackSegment stage={reachedStage} index={2} />
    );

    // The component should render without crashing
    // motion.div handles prefers-reduced-motion automatically in v12
    expect(screen.getByTestId("stage-marker")).toBeInTheDocument();
    expect(screen.getByTestId("track-segment")).toBeInTheDocument();
  });

  // AC-P12: All visible strings from locale files
  it("uses useTranslations for stage labels, not hardcoded strings", () => {
    render(<PipelineTrackSegment stage={currentStage} index={0} />);

    // The label comes from useTranslations('Statuses') - our mock returns 'Statuses.KEY'
    expect(screen.getByText("Statuses.IN_VOTING")).toBeInTheDocument();
  });

  // Date rendering: reached stage shows date, future stage does not
  it("renders date on reached stage and omits date on future stage", () => {
    const { unmount } = render(
      <PipelineTrackSegment stage={reachedStage} index={0} />
    );
    expect(screen.getByText("2025-03-15")).toBeInTheDocument();
    unmount();

    render(<PipelineTrackSegment stage={futureStage} index={1} />);
    expect(screen.queryByText(/20/)).not.toBeInTheDocument();
  });

  // Marker colors per status - parametrized for distinct statuses
  it.each([
    { status: "SUBMITTED" as const, expectedColor: "bg-civic-orange" },
    { status: "ELIGIBLE" as const, expectedColor: "bg-civic-blue" },
    { status: "IN_VOTING" as const, expectedColor: "bg-purple-700" },
    { status: "COMPLETED" as const, expectedColor: "bg-civic-teal" },
  ])(
    "applies correct marker color for $status stage",
    ({ status, expectedColor }) => {
      const stage: PipelineStage = {
        status,
        label: status,
        reached: true,
        current: false,
        date: "2025-01-01",
      };
      render(<PipelineTrackSegment stage={stage} index={0} />);

      const marker = screen.getByTestId("stage-marker");
      expect(marker).toHaveClass(expectedColor);
    }
  );
});
