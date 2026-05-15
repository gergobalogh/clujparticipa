/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { EditorialIdeaCard } from "../editorial-idea-card";

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string, opts?: Record<string, unknown>) => {
    if (opts) {
      return `${namespace}.${key}:${JSON.stringify(opts)}`;
    }
    return `${namespace}.${key}`;
  },
}));

const baseProps = {
  id: "idea-1",
  title: "Build a new park",
  category: "ENVIRONMENT",
  district: "CENTRU",
  status: "SUBMITTED",
  supportCount: 5,
  commentCount: 2,
};

// ---------------------------------------------------------------------------
// Acceptance: EditorialIdeaCard shows neighborhood, status, title, support, comment count
// ---------------------------------------------------------------------------

describe("EditorialIdeaCard - Acceptance", () => {
  it("renders neighborhood, status badge, serif title, support and comment counts", () => {
    render(<EditorialIdeaCard {...baseProps} />);

    // Neighborhood (district)
    expect(screen.getByText("Districts.CENTRU")).toBeInTheDocument();

    // Status badge
    expect(screen.getByText("Statuses.SUBMITTED")).toBeInTheDocument();

    // Title
    expect(screen.getByText("Build a new park")).toBeInTheDocument();

    // Support count
    expect(
      screen.getByText(`Ideas.supportCount:{"count":5}`)
    ).toBeInTheDocument();

    // Comment count
    expect(
      screen.getByText(`Ideas.commentCount:{"count":2}`)
    ).toBeInTheDocument();
  });

  it("applies category color class from resolveCategoryListColor", () => {
    const { container } = render(
      <EditorialIdeaCard {...baseProps} category="INFRASTRUCTURE" />
    );

    // The neighborhood label should carry the category color class
    const neighborhoodEl = screen.getByText("Districts.CENTRU");
    // INFRASTRUCTURE maps to text-civic-orange
    expect(neighborhoodEl.className).toContain("text-civic-orange");
  });

  it("renders title with serif font and hover underline", () => {
    render(<EditorialIdeaCard {...baseProps} />);

    const title = screen.getByText("Build a new park");
    expect(title.className).toContain("font-serif");
    expect(title.className).toContain("font-medium");
    expect(title.className).toContain("hover:underline");
    expect(title.className).toContain("underline-offset-8");
  });

  it("links to the idea detail page", () => {
    render(<EditorialIdeaCard {...baseProps} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/ideas/idea-1");
  });
});
