/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { ExceptionState } from "../exception-state";

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) =>
    `${namespace}.${key}`,
}));

// ---------------------------------------------------------------------------
// REJECTED
// ---------------------------------------------------------------------------
describe("ExceptionState — REJECTED", () => {
  const rejectedProps = {
    exceptionType: "REJECTED" as const,
    reason: "Insufficient community support",
    resubmitUrl: "/ideas/new?from=idea-42",
    similarIdeasUrl: "/ideas?category=TRANSPORT",
    hasSimilarIdeas: true,
  };

  it("shows a red marker for rejected state", () => {
    render(<ExceptionState {...rejectedProps} />);
    const marker = screen.getByTestId("exception-marker");
    expect(marker).toHaveClass("bg-red-500");
  });

  it("displays the rejection reason text", () => {
    render(<ExceptionState {...rejectedProps} />);
    expect(screen.getByText("Insufficient community support")).toBeInTheDocument();
  });

  it("renders 'Support similar' CTA linking to filtered ideas list", () => {
    render(<ExceptionState {...rejectedProps} />);
    const link = screen.getByRole("link", { name: /Exception\.supportSimilar/i });
    expect(link).toHaveAttribute("href", "/ideas?category=TRANSPORT");
  });

  it("renders 'Revise and resubmit' CTA linking to pre-filled form", () => {
    render(<ExceptionState {...rejectedProps} />);
    const link = screen.getByRole("link", { name: /Exception\.reviseAndResubmit/i });
    expect(link).toHaveAttribute("href", "/ideas/new?from=idea-42");
  });

  it("hides 'Support similar' CTA when hasSimilarIdeas is false", () => {
    render(<ExceptionState {...rejectedProps} hasSimilarIdeas={false} />);
    expect(screen.queryByRole("link", { name: /Exception\.supportSimilar/i })).not.toBeInTheDocument();
  });

  it("shows 'No similar ideas' message when hasSimilarIdeas is false", () => {
    render(<ExceptionState {...rejectedProps} hasSimilarIdeas={false} />);
    expect(screen.getByText("Exception.noSimilarIdeas")).toBeInTheDocument();
  });

  it("shows generic 'Contact us' message when reason is null", () => {
    render(<ExceptionState {...rejectedProps} reason={null} />);
    expect(screen.getByText("Exception.contactUs")).toBeInTheDocument();
    expect(screen.queryByText("Insufficient community support")).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// MERGED
// ---------------------------------------------------------------------------
describe("ExceptionState — MERGED", () => {
  const mergedProps = {
    exceptionType: "MERGED" as const,
    reason: "[MERGED] Duplicate of idea-99",
    parentIdeaId: "idea-99",
    parentIdeaTitle: "Better sidewalks on Main Street",
  };

  it("shows a merge indicator", () => {
    render(<ExceptionState {...mergedProps} />);
    const indicator = screen.getByTestId("exception-marker");
    expect(indicator).toHaveClass("bg-purple-500");
  });

  it("renders combined-with text", () => {
    render(<ExceptionState {...mergedProps} />);
    expect(screen.getByText("Exception.mergedWith")).toBeInTheDocument();
  });

  it("renders a link to the parent idea", () => {
    render(<ExceptionState {...mergedProps} />);
    const link = screen.getByRole("link", { name: /Better sidewalks on Main Street/i });
    expect(link).toHaveAttribute("href", "/ideas/idea-99");
  });

  it("marks parent idea link as unavailable when parentIdeaTitle is null", () => {
    render(<ExceptionState {...mergedProps} parentIdeaTitle={null} />);
    expect(screen.getByText("Exception.parentUnavailable")).toBeInTheDocument();
  });

  it("still renders parent idea link when parentIdeaTitle is present", () => {
    render(<ExceptionState {...mergedProps} />);
    expect(screen.getByText("Better sidewalks on Main Street")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// RETURNED
// ---------------------------------------------------------------------------
describe("ExceptionState — RETURNED", () => {
  const returnedProps = {
    exceptionType: "RETURNED" as const,
    reason: "[RETURNED] Please provide more details about the budget impact",
    resubmitUrl: "/ideas/new?from=idea-7",
  };

  it("shows a return indicator", () => {
    render(<ExceptionState {...returnedProps} />);
    const indicator = screen.getByTestId("exception-marker");
    expect(indicator).toHaveClass("bg-amber-500");
  });

  it("renders admin feedback text", () => {
    render(<ExceptionState {...returnedProps} />);
    expect(
      screen.getByText("Please provide more details about the budget impact")
    ).toBeInTheDocument();
  });

  it("renders 'Revise and resubmit' CTA", () => {
    render(<ExceptionState {...returnedProps} />);
    const link = screen.getByRole("link", { name: /Exception\.reviseAndResubmit/i });
    expect(link).toHaveAttribute("href", "/ideas/new?from=idea-7");
  });
});
