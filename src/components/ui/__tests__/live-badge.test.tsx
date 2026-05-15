/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { LiveBadge } from "../live-badge";

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) =>
    `${namespace}.${key}`,
}));

// ---------------------------------------------------------------------------
// Acceptance: LiveBadge appears when votingConfig.isOpen OR >0 ideas
// ---------------------------------------------------------------------------

describe("LiveBadge - Acceptance", () => {
  it.each([
    { votingOpen: true, totalIdeas: 0, desc: "voting open" },
    { votingOpen: false, totalIdeas: 5, desc: "ideas exist" },
    { votingOpen: true, totalIdeas: 5, desc: "both" },
  ] as const)(
    "renders when $desc",
    ({ votingOpen, totalIdeas }) => {
      render(<LiveBadge votingOpen={votingOpen} totalIdeas={totalIdeas} />);

      expect(screen.getByText("Home.liveBadge")).toBeInTheDocument();
    }
  );

  it("does not render when voting is closed and no ideas", () => {
    const { container } = render(
      <LiveBadge votingOpen={false} totalIdeas={0} />
    );

    expect(container.innerHTML).toBe("");
  });

  it("has bg-ink text-paper animate-pulse styling", () => {
    render(<LiveBadge votingOpen={true} totalIdeas={0} />);

    const badge = screen.getByText("Home.liveBadge");
    expect(badge.className).toContain("bg-ink");
    expect(badge.className).toContain("text-paper");
    expect(badge.className).toContain("animate-pulse");
  });
});
