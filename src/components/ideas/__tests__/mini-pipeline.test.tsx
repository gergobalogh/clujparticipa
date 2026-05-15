/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { MiniPipeline } from "../mini-pipeline";
import type { Status } from "@prisma/client";

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) =>
    `${namespace}.${key}`,
}));

// ---------------------------------------------------------------------------
// Acceptance: 3-milestone indicator renders correctly for all statuses
// ---------------------------------------------------------------------------

describe("MiniPipeline - Acceptance", () => {
  it("renders 3 milestones: Submitted, In Voting, Completed", () => {
    render(<MiniPipeline currentStatus="SUBMITTED" />);

    expect(screen.getByText("MiniPipeline.submitted")).toBeInTheDocument();
    expect(screen.getByText("MiniPipeline.inVoting")).toBeInTheDocument();
    expect(screen.getByText("MiniPipeline.completed")).toBeInTheDocument();
  });

  it("renders nothing for REJECTED status", () => {
    const { container } = render(<MiniPipeline currentStatus="REJECTED" />);

    expect(container.innerHTML).toBe("");
  });

  it("fills Submitted milestone when status is SUBMITTED", () => {
    render(<MiniPipeline currentStatus="SUBMITTED" />);

    const submitted = screen.getByTestId("milestone-submitted");
    expect(submitted).toHaveAttribute("data-reached", "true");
    expect(submitted).toHaveAttribute("data-current", "true");
  });

  it("fills Submitted milestone and highlights current when status is UNDER_REVIEW", () => {
    render(<MiniPipeline currentStatus="UNDER_REVIEW" />);

    const submitted = screen.getByTestId("milestone-submitted");
    expect(submitted).toHaveAttribute("data-reached", "true");
    expect(submitted).toHaveAttribute("data-current", "true");

    const inVoting = screen.getByTestId("milestone-inVoting");
    expect(inVoting).toHaveAttribute("data-reached", "false");

    const completed = screen.getByTestId("milestone-completed");
    expect(completed).toHaveAttribute("data-reached", "false");
  });

  it("fills Submitted and In Voting milestones when status is IN_VOTING", () => {
    render(<MiniPipeline currentStatus="IN_VOTING" />);

    const submitted = screen.getByTestId("milestone-submitted");
    expect(submitted).toHaveAttribute("data-reached", "true");

    const inVoting = screen.getByTestId("milestone-inVoting");
    expect(inVoting).toHaveAttribute("data-reached", "true");
    expect(inVoting).toHaveAttribute("data-current", "true");

    const completed = screen.getByTestId("milestone-completed");
    expect(completed).toHaveAttribute("data-reached", "false");
  });

  it("fills all milestones when status is COMPLETED", () => {
    render(<MiniPipeline currentStatus="COMPLETED" />);

    const submitted = screen.getByTestId("milestone-submitted");
    expect(submitted).toHaveAttribute("data-reached", "true");

    const inVoting = screen.getByTestId("milestone-inVoting");
    expect(inVoting).toHaveAttribute("data-reached", "true");

    const completed = screen.getByTestId("milestone-completed");
    expect(completed).toHaveAttribute("data-reached", "true");
    expect(completed).toHaveAttribute("data-current", "true");
  });
});

// ---------------------------------------------------------------------------
// Unit: milestone mapping for every status
// ---------------------------------------------------------------------------

describe("MiniPipeline - Unit: milestone mapping", () => {
  const submittedMilestoneStatuses: Status[] = [
    "SUBMITTED",
    "UNDER_REVIEW",
    "ELIGIBLE",
  ];

  const inVotingMilestoneStatuses: Status[] = ["IN_VOTING", "SELECTED"];

  const completedMilestoneStatuses: Status[] = ["IN_PROGRESS", "COMPLETED"];

  it.each(submittedMilestoneStatuses)(
    "maps %s to Submitted as current milestone",
    (status) => {
      render(<MiniPipeline currentStatus={status} />);

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
      render(<MiniPipeline currentStatus={status} />);

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
      render(<MiniPipeline currentStatus={status} />);

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
// Unit: labels come from locale keys
// ---------------------------------------------------------------------------

describe("MiniPipeline - Unit: locale labels", () => {
  it("uses MiniPipeline namespace keys for all 3 milestone labels", () => {
    render(<MiniPipeline currentStatus="SUBMITTED" />);

    // With the mock, useTranslations("MiniPipeline") returns keys as "MiniPipeline.key"
    expect(screen.getByText("MiniPipeline.submitted")).toBeInTheDocument();
    expect(screen.getByText("MiniPipeline.inVoting")).toBeInTheDocument();
    expect(screen.getByText("MiniPipeline.completed")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Unit: visual states of milestones
// ---------------------------------------------------------------------------

describe("MiniPipeline - Unit: visual milestone states", () => {
  it("highlights current milestone with ring indicator", () => {
    render(<MiniPipeline currentStatus="IN_VOTING" />);

    const inVoting = screen.getByTestId("milestone-inVoting");
    expect(inVoting).toHaveAttribute("data-current", "true");

    // Other milestones should not have the highlight
    const submitted = screen.getByTestId("milestone-submitted");
    expect(submitted).toHaveAttribute("data-current", "false");
  });

  it("outlines future milestones as gray", () => {
    render(<MiniPipeline currentStatus="SUBMITTED" />);

    const inVoting = screen.getByTestId("milestone-inVoting");
    expect(inVoting).toHaveAttribute("data-reached", "false");

    const completed = screen.getByTestId("milestone-completed");
    expect(completed).toHaveAttribute("data-reached", "false");
  });

  it("renders connector lines between milestones", () => {
    const { container } = render(<MiniPipeline currentStatus="ELIGIBLE" />);

    const connectors = container.querySelectorAll("[data-testid='milestone-connector']");
    // 3 milestones => 2 connectors
    expect(connectors).toHaveLength(2);
  });
});
