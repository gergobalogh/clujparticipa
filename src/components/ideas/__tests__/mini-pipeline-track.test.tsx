/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { MiniPipelineTrack } from "../mini-pipeline-track";
import type { Status } from "@prisma/client";

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) =>
    `${namespace}.${key}`,
}));

// ---------------------------------------------------------------------------
// Acceptance: MiniPipelineTrack renders 3-milestone continuous bar
// ---------------------------------------------------------------------------

describe("MiniPipelineTrack - Acceptance", () => {
  it("renders a thin horizontal bar with 3 milestone markers and labels below", () => {
    render(<MiniPipelineTrack currentStatus="SUBMITTED" />);

    const baseBar = screen.getByTestId("mini-track-base");
    expect(baseBar).toBeInTheDocument();
    expect(baseBar).toHaveClass("bg-gray-200");

    const markers = screen.getAllByTestId(/^milestone-/);
    expect(markers).toHaveLength(3);

    expect(screen.getByText("MiniPipeline.submitted")).toBeInTheDocument();
    expect(screen.getByText("MiniPipeline.inVoting")).toBeInTheDocument();
    expect(screen.getByText("MiniPipeline.completed")).toBeInTheDocument();
  });

  it("renders nothing for REJECTED status", () => {
    const { container } = render(<MiniPipelineTrack currentStatus="REJECTED" />);
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing for NEEDS_REVISION status", () => {
    const { container } = render(<MiniPipelineTrack currentStatus="NEEDS_REVISION" />);
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing for MERGED status", () => {
    const { container } = render(<MiniPipelineTrack currentStatus="MERGED" />);
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing for WITHDRAWN status", () => {
    const { container } = render(<MiniPipelineTrack currentStatus="WITHDRAWN" />);
    expect(container.innerHTML).toBe("");
  });

  it("renders colored segments for reached milestones and gray for future", () => {
    render(<MiniPipelineTrack currentStatus="IN_VOTING" />);

    const submitted = screen.getByTestId("milestone-submitted");
    expect(submitted).toHaveAttribute("data-reached", "true");
    expect(submitted).toHaveAttribute("data-current", "false");

    const inVoting = screen.getByTestId("milestone-inVoting");
    expect(inVoting).toHaveAttribute("data-reached", "true");
    expect(inVoting).toHaveAttribute("data-current", "true");

    const completed = screen.getByTestId("milestone-completed");
    expect(completed).toHaveAttribute("data-reached", "false");
  });
});

// ---------------------------------------------------------------------------
// Unit: milestone grouping (new 10-status pipeline)
// ---------------------------------------------------------------------------

describe("MiniPipelineTrack - Unit: milestone grouping", () => {
  const submittedMilestoneStatuses: Status[] = ["SUBMITTED"];

  const inVotingMilestoneStatuses: Status[] = ["IN_VOTING", "SELECTED", "ACCEPTED"];

  const completedMilestoneStatuses: Status[] = ["IN_PROGRESS", "COMPLETED"];

  it.each(submittedMilestoneStatuses)(
    "maps %s to Submitted as current milestone",
    (status) => {
      render(<MiniPipelineTrack currentStatus={status} />);

      const submitted = screen.getByTestId("milestone-submitted");
      expect(submitted).toHaveAttribute("data-current", "true");

      const inVoting = screen.getByTestId("milestone-inVoting");
      expect(inVoting).toHaveAttribute("data-current", "false");

      const completed = screen.getByTestId("milestone-completed");
      expect(completed).toHaveAttribute("data-current", "false");
    }
  );

  it.each(inVotingMilestoneStatuses)(
    "maps %s to In Voting as current milestone",
    (status) => {
      render(<MiniPipelineTrack currentStatus={status} />);

      const submitted = screen.getByTestId("milestone-submitted");
      expect(submitted).toHaveAttribute("data-reached", "true");
      expect(submitted).toHaveAttribute("data-current", "false");

      const inVoting = screen.getByTestId("milestone-inVoting");
      expect(inVoting).toHaveAttribute("data-reached", "true");
      expect(inVoting).toHaveAttribute("data-current", "true");

      const completed = screen.getByTestId("milestone-completed");
      expect(completed).toHaveAttribute("data-reached", "false");
    }
  );

  it.each(completedMilestoneStatuses)(
    "maps %s to Completed as current milestone",
    (status) => {
      render(<MiniPipelineTrack currentStatus={status} />);

      const submitted = screen.getByTestId("milestone-submitted");
      expect(submitted).toHaveAttribute("data-reached", "true");
      expect(submitted).toHaveAttribute("data-current", "false");

      const inVoting = screen.getByTestId("milestone-inVoting");
      expect(inVoting).toHaveAttribute("data-reached", "true");
      expect(inVoting).toHaveAttribute("data-current", "false");

      const completed = screen.getByTestId("milestone-completed");
      expect(completed).toHaveAttribute("data-reached", "true");
      expect(completed).toHaveAttribute("data-current", "true");
    }
  );
});

// ---------------------------------------------------------------------------
// Unit: terminal statuses return null
// ---------------------------------------------------------------------------

describe("MiniPipelineTrack - Unit: terminal status handling", () => {
  const terminalStatuses: Status[] = ["REJECTED", "NEEDS_REVISION", "MERGED", "WITHDRAWN"];

  it.each(terminalStatuses)(
    "returns null for %s status with no track rendered",
    (status) => {
      const { container } = render(<MiniPipelineTrack currentStatus={status} />);
      expect(container.innerHTML).toBe("");
      expect(screen.queryByTestId("mini-track-base")).not.toBeInTheDocument();
    }
  );
});

// ---------------------------------------------------------------------------
// Unit: visual states of milestones
// ---------------------------------------------------------------------------

describe("MiniPipelineTrack - Unit: visual milestone states", () => {
  it("gives reached milestones colored marker class", () => {
    render(<MiniPipelineTrack currentStatus="IN_VOTING" />);

    const submitted = screen.getByTestId("milestone-submitted");
    expect(submitted).toHaveAttribute("data-reached", "true");
    const submittedDot = submitted.querySelector("[data-reached-dot]");
    expect(submittedDot).toHaveClass("bg-amber-600");
  });

  it("gives current milestone a ring highlight", () => {
    render(<MiniPipelineTrack currentStatus="IN_VOTING" />);

    const inVoting = screen.getByTestId("milestone-inVoting");
    expect(inVoting).toHaveAttribute("data-current", "true");

    const inVotingDot = inVoting.querySelector("[data-reached-dot]");
    expect(inVotingDot).toHaveClass("ring-2");
  });

  it("gives future milestones gray marker with gray outline ring", () => {
    render(<MiniPipelineTrack currentStatus="SUBMITTED" />);

    const completed = screen.getByTestId("milestone-completed");
    expect(completed).toHaveAttribute("data-reached", "false");

    const completedDot = completed.querySelector("[data-future-dot]");
    expect(completedDot).toHaveClass("bg-gray-200");
    expect(completedDot).toHaveClass("outline-gray-300");
  });
});

// ---------------------------------------------------------------------------
// Unit: locale labels
// ---------------------------------------------------------------------------

describe("MiniPipelineTrack - Unit: locale labels", () => {
  it("uses MiniPipeline namespace keys for all 3 milestone labels", () => {
    render(<MiniPipelineTrack currentStatus="SUBMITTED" />);

    expect(screen.getByText("MiniPipeline.submitted")).toBeInTheDocument();
    expect(screen.getByText("MiniPipeline.inVoting")).toBeInTheDocument();
    expect(screen.getByText("MiniPipeline.completed")).toBeInTheDocument();
  });
});
