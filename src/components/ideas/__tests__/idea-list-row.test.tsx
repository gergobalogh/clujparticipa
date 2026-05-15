/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { IdeaListRow } from "../idea-list-row";

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
};

// ---------------------------------------------------------------------------
// Acceptance: MiniPipeline renders on IdeaListRow for non-REJECTED statuses
// ---------------------------------------------------------------------------

describe("IdeaListRow - Acceptance: MiniPipeline integration", () => {
  it("renders MiniPipeline component for a non-REJECTED status", () => {
    render(<IdeaListRow {...baseProps} status="SUBMITTED" />);

    expect(screen.getByTestId("mini-pipeline")).toBeInTheDocument();
  });

  it("renders MiniPipeline for IN_VOTING status", () => {
    render(<IdeaListRow {...baseProps} status="IN_VOTING" />);

    expect(screen.getByTestId("mini-pipeline")).toBeInTheDocument();
  });

  it("does not render MiniPipeline for REJECTED status", () => {
    render(<IdeaListRow {...baseProps} status="REJECTED" />);

    expect(screen.queryByTestId("mini-pipeline")).not.toBeInTheDocument();
  });

  it("preserves existing Badge alongside MiniPipeline", () => {
    render(<IdeaListRow {...baseProps} status="SUBMITTED" />);

    // Badge for status should still be present
    expect(screen.getByText("Statuses.SUBMITTED")).toBeInTheDocument();
    // MiniPipeline should also be present
    expect(screen.getByTestId("mini-pipeline")).toBeInTheDocument();
  });

  it("preserves Badge for REJECTED status even without MiniPipeline", () => {
    render(<IdeaListRow {...baseProps} status="REJECTED" />);

    expect(screen.getByText("Statuses.REJECTED")).toBeInTheDocument();
    expect(screen.queryByTestId("mini-pipeline")).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Unit: MiniPipeline receives correct currentStatus prop
// ---------------------------------------------------------------------------

describe("IdeaListRow - Unit: MiniPipeline currentStatus prop", () => {
  it("passes status to MiniPipeline so it renders correct milestone state", () => {
    render(<IdeaListRow {...baseProps} status="IN_VOTING" />);

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
// Regression: existing IdeaListRow behavior preserved
// ---------------------------------------------------------------------------

describe("IdeaListRow - Regression: existing behavior", () => {
  it("renders title and description", () => {
    render(<IdeaListRow {...baseProps} />);

    expect(screen.getByText("Build a new park")).toBeInTheDocument();
    expect(screen.getByText("A beautiful park in the city center")).toBeInTheDocument();
  });

  it("renders category and district in meta line", () => {
    render(<IdeaListRow {...baseProps} />);

    expect(screen.getByText("Categories.ENVIRONMENT")).toBeInTheDocument();
    expect(screen.getByText("Districts.CENTRU")).toBeInTheDocument();
  });

  it("renders support count", () => {
    render(<IdeaListRow {...baseProps} />);

    expect(screen.getByText("Ideas.supportCount")).toBeInTheDocument();
  });

  it("renders comment count", () => {
    render(<IdeaListRow {...baseProps} />);

    expect(screen.getByText("Ideas.commentCount")).toBeInTheDocument();
  });

  it("does not render description when omitted", () => {
    const { description, ...propsWithoutDesc } = baseProps;
    render(<IdeaListRow {...propsWithoutDesc} />);

    expect(screen.queryByText("A beautiful park in the city center")).not.toBeInTheDocument();
  });
});
