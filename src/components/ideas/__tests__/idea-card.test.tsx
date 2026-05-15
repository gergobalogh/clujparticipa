/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { IdeaCard } from "../idea-card";

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) =>
    `${namespace}.${key}`,
}));

vi.mock("next/image", () => ({
  default: () => null,
}));

const baseProps = {
  id: "idea-1",
  title: "Build a new park",
  description: "A beautiful park in the city center",
  category: "ENVIRONMENT",
  district: "CENTRU",
  status: "SUBMITTED" as const,
  supportCount: 5,
  commentCount: 2,
  firstImage: null,
  rejectionNote: null,
};

// ---------------------------------------------------------------------------
// Acceptance: MiniPipeline renders on IdeaCard for non-REJECTED statuses
// ---------------------------------------------------------------------------

describe("IdeaCard - Acceptance: MiniPipeline integration", () => {
  it("renders MiniPipeline component for a non-REJECTED status in full mode", () => {
    render(<IdeaCard {...baseProps} status="SUBMITTED" />);

    expect(screen.getByTestId("mini-pipeline-track")).toBeInTheDocument();
  });

  it("renders MiniPipeline component for a non-REJECTED status in compact mode", () => {
    render(<IdeaCard {...baseProps} compact status="IN_VOTING" />);

    expect(screen.getByTestId("mini-pipeline-track")).toBeInTheDocument();
  });

  it("does not render MiniPipeline for REJECTED status in full mode", () => {
    render(<IdeaCard {...baseProps} status="REJECTED" />);

    expect(screen.queryByTestId("mini-pipeline-track")).not.toBeInTheDocument();
  });

  it("preserves existing Badge alongside MiniPipeline in full mode", () => {
    render(<IdeaCard {...baseProps} status="SUBMITTED" />);

    // Badge for status should still be present
    expect(screen.getByText("Statuses.SUBMITTED")).toBeInTheDocument();
    // MiniPipeline should also be present
    expect(screen.getByTestId("mini-pipeline-track")).toBeInTheDocument();
  });

  it("preserves existing Badge for REJECTED status even without MiniPipeline", () => {
    render(<IdeaCard {...baseProps} status="REJECTED" />);

    expect(screen.getByText("Statuses.REJECTED")).toBeInTheDocument();
    expect(screen.getByText("Ideas.notEligible")).toBeInTheDocument();
    expect(screen.queryByTestId("mini-pipeline-track")).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Unit: compact mode MiniPipeline placement
// ---------------------------------------------------------------------------

describe("IdeaCard - Unit: compact mode MiniPipeline", () => {
  it("renders MiniPipeline in compact mode for IN_VOTING status", () => {
    render(<IdeaCard {...baseProps} compact status="IN_VOTING" />);

    expect(screen.getByTestId("mini-pipeline-track")).toBeInTheDocument();
  });

  it("does not render MiniPipeline in compact mode for REJECTED status but Badge remains", () => {
    render(<IdeaCard {...baseProps} compact status="REJECTED" />);

    expect(screen.queryByTestId("mini-pipeline-track")).not.toBeInTheDocument();
    expect(screen.getByText("Statuses.REJECTED")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Unit: MiniPipeline receives correct currentStatus prop
// ---------------------------------------------------------------------------

describe("IdeaCard - Unit: MiniPipeline currentStatus prop", () => {
  it("passes status to MiniPipeline so it renders correct milestone state", () => {
    render(<IdeaCard {...baseProps} status="COMPLETED" />);

    // If MiniPipeline receives COMPLETED, all milestones are reached
    const submitted = screen.getByTestId("milestone-submitted");
    expect(submitted).toHaveAttribute("data-reached", "true");

    const completed = screen.getByTestId("milestone-completed");
    expect(completed).toHaveAttribute("data-reached", "true");
    expect(completed).toHaveAttribute("data-current", "true");
  });
});

// ---------------------------------------------------------------------------
// Regression: existing IdeaCard behavior preserved
// ---------------------------------------------------------------------------

describe("IdeaCard - Regression: existing behavior", () => {
  it("renders title and description in full mode", () => {
    render(<IdeaCard {...baseProps} />);

    expect(screen.getByText("Build a new park")).toBeInTheDocument();
    expect(screen.getByText("A beautiful park in the city center")).toBeInTheDocument();
  });

  it("renders title without description in compact mode", () => {
    render(<IdeaCard {...baseProps} compact />);

    expect(screen.getByText("Build a new park")).toBeInTheDocument();
    // Description not rendered in compact mode
    expect(screen.queryByText("A beautiful park in the city center")).not.toBeInTheDocument();
  });

  it("renders support count", () => {
    render(<IdeaCard {...baseProps} />);

    expect(screen.getByText("Ideas.supportCount")).toBeInTheDocument();
  });

  it("renders category badge in full mode", () => {
    render(<IdeaCard {...baseProps} />);

    // Category appears in the image placeholder and the meta area
    const categoryElements = screen.getAllByText("Categories.ENVIRONMENT");
    expect(categoryElements.length).toBeGreaterThanOrEqual(1);
  });

  it("renders rejection note for REJECTED status with note", () => {
    render(
      <IdeaCard {...baseProps} status="REJECTED" rejectionNote="Does not meet criteria" />
    );

    expect(screen.getByText("Does not meet criteria")).toBeInTheDocument();
  });
});
