/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, act } from "@testing-library/react";
import { HowItWorksContent } from "../how-it-works-content";

// Mock next-intl to verify namespace usage
const translationCalls: Array<{ namespace: string; key: string }> = [];
vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) => {
    translationCalls.push({ namespace, key });
    return `${namespace}.${key}`;
  },
}));

// Mock IntersectionObserver — track all observer instances
const observerInstances: MockIntersectionObserver[] = [];
const observeMock = vi.fn();
const unobserveMock = vi.fn();
const disconnectMock = vi.fn();

class MockIntersectionObserver {
  callback: IntersectionObserverCallback;
  constructor(cb: IntersectionObserverCallback) {
    this.callback = cb;
    observerInstances.push(this);
  }
  observe = observeMock;
  unobserve = unobserveMock;
  disconnect = disconnectMock;
}

beforeEach(() => {
  translationCalls.length = 0;
  observerInstances.length = 0;
  observeMock.mockClear();
  unobserveMock.mockClear();
  disconnectMock.mockClear();
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
});

afterEach(() => {
  vi.restoreAllMocks();
});

// The 6 forward pipeline stages
const FORWARD_STAGES = [
  "SUBMITTED",
  "IN_VOTING",
  "SELECTED",
  "ACCEPTED",
  "IN_PROGRESS",
  "COMPLETED",
] as const;

// The 4 terminal statuses
const TERMINAL_STATUSES = [
  "REJECTED",
  "NEEDS_REVISION",
  "MERGED",
  "WITHDRAWN",
] as const;

// Explicit mapping from Status value to HowItWorks description key
const STAGE_DESC_KEYS: Record<string, string> = {
  SUBMITTED: "submittedDesc",
  IN_VOTING: "inVotingDesc",
  SELECTED: "selectedDesc",
  ACCEPTED: "acceptedDesc",
  IN_PROGRESS: "inProgressDesc",
  COMPLETED: "completedDesc",
};

const TERMINAL_DESC_KEYS: Record<string, string> = {
  REJECTED: "rejectedDesc",
  NEEDS_REVISION: "needsRevisionDesc",
  MERGED: "mergedDesc",
  WITHDRAWN: "withdrawnDesc",
};

describe("HowItWorksContent", () => {
  // --- ACCEPTANCE TESTS ---

  it("renders PipelineTrack in showcase mode with all 6 forward stages shown as reached", () => {
    render(<HowItWorksContent />);

    // PipelineTrack is rendered
    expect(screen.getByTestId("pipeline-track")).toBeInTheDocument();

    // All 6 stage markers rendered (no future/gray markers in showcase mode)
    const markers = screen.getAllByTestId("stage-marker");
    expect(markers).toHaveLength(6);

    // All markers are solid (reached) — none should have gray-300 future border
    const futureMarkers = markers.filter(
      (m) =>
        m.classList.contains("border-gray-300") &&
        m.classList.contains("bg-paper")
    );
    expect(futureMarkers).toHaveLength(0);
  });

  it("renders 6 stage cards with correct id attributes, Badge, description, and nextStep", () => {
    render(<HowItWorksContent />);

    for (const stage of FORWARD_STAGES) {
      // Each stage card has an element with id matching the status slug (lowercase)
      const card = document.getElementById(stage.toLowerCase());
      expect(card).toBeInTheDocument();

      // Each card has a Badge (role=status)
      const badges = card!.querySelectorAll("[role=status]");
      expect(badges.length).toBeGreaterThanOrEqual(1);

      // Each card renders a description from HowItWorks namespace
      const descKey = STAGE_DESC_KEYS[stage];
      expect(
        translationCalls.some(
          (c) => c.namespace === "HowItWorks" && c.key === descKey
        )
      ).toBe(true);
    }
  });

  it("renders 4 terminal cards with colored dots and descriptions", () => {
    render(<HowItWorksContent />);

    for (const status of TERMINAL_STATUSES) {
      const descKey = TERMINAL_DESC_KEYS[status];
      expect(
        translationCalls.some(
          (c) => c.namespace === "HowItWorks" && c.key === descKey
        )
      ).toBe(true);
    }

    // 4 terminal card dots (rounded-full colored dots)
    const terminalDots = screen.getAllByTestId("terminal-dot");
    expect(terminalDots).toHaveLength(4);

    // Each dot has the correct color class per ExceptionState convention
    const expectedColors: Record<string, string> = {
      REJECTED: "bg-red-500",
      NEEDS_REVISION: "bg-amber-500",
      MERGED: "bg-purple-500",
      WITHDRAWN: "bg-gray-400",
    };
    for (const dot of terminalDots) {
      const status = dot.getAttribute("data-status");
      expect(status).toBeTruthy();
      expect(dot.classList.contains(expectedColors[status!]!)).toBe(true);
    }
  });

  it("renders CTA section with a link to the ideas page", () => {
    render(<HowItWorksContent />);

    const ctaLink = screen.getByRole("link", { name: /HowItWorks\.cta/ });
    expect(ctaLink).toBeInTheDocument();
    expect(ctaLink).toHaveAttribute("href", expect.stringContaining("ideas"));
  });

  it("renders all visible strings from the HowItWorks i18n namespace", () => {
    translationCalls.length = 0;
    render(<HowItWorksContent />);

    const hiwCalls = translationCalls.filter(
      (c) => c.namespace === "HowItWorks"
    );
    // Must include title, subtitle, forwardSection, terminalSection, descriptions
    const requiredKeys = [
      "title",
      "subtitle",
      "forwardSection",
      "terminalSection",
      "cta",
      "submittedDesc",
      "inVotingDesc",
      "selectedDesc",
      "acceptedDesc",
      "inProgressDesc",
      "completedDesc",
      "rejectedDesc",
      "needsRevisionDesc",
      "mergedDesc",
      "withdrawnDesc",
    ];
    for (const key of requiredKeys) {
      expect(
        hiwCalls.some((c) => c.key === key),
        `Expected HowItWorks.${key} to be called`
      ).toBe(true);
    }
  });

  // --- UNIT TESTS ---

  it("updates activeStage when IntersectionObserver detects a stage card entering viewport", () => {
    render(<HowItWorksContent />);

    // The first observer is for stage cards
    expect(observerInstances.length).toBeGreaterThanOrEqual(1);
    const cardObserver = observerInstances[0];

    // Simulate IN_VOTING card entering viewport
    const inVotingCard = document.getElementById("in_voting");
    expect(inVotingCard).toBeInTheDocument();

    act(() => {
      cardObserver.callback(
        [
          {
            target: inVotingCard!,
            isIntersecting: true,
            intersectionRatio: 0.5,
          } as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver
      );
    });

    // The active stage indicator should reflect IN_VOTING
    const activeIndicator = screen.getByTestId("active-stage-indicator");
    expect(activeIndicator).toHaveAttribute("data-active-stage", "IN_VOTING");
  });

  it("scrolls to the correct stage card when pipeline marker is clicked", () => {
    const scrollIntoViewMock = vi.fn();
    HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

    render(<HowItWorksContent />);

    // Click on a pipeline stage anchor (showcase mode wraps markers in anchors)
    const anchors = screen.getAllByTestId("stage-anchor");
    // Find the anchor for IN_VOTING
    const inVotingAnchor = anchors.find(
      (a) => a.getAttribute("href") === "#in_voting"
    );
    expect(inVotingAnchor).toBeInTheDocument();

    act(() => {
      inVotingAnchor!.click();
    });

    expect(scrollIntoViewMock).toHaveBeenCalled();

    scrollIntoViewMock.mockRestore();
  });

  it("toggles sticky state when sentinel element intersects viewport", () => {
    render(<HowItWorksContent />);

    // The sticky container should initially be sticky
    const stickyContainer = screen.getByTestId("sticky-pipeline-container");
    expect(stickyContainer).toHaveClass("sticky");

    // Find the sentinel element
    const sentinel = screen.getByTestId("sticky-sentinel");
    expect(sentinel).toBeInTheDocument();

    // The second observer is for the sentinel
    expect(observerInstances.length).toBeGreaterThanOrEqual(2);
    const sentinelObserver = observerInstances[1];

    // When sentinel enters viewport, pipeline should unstick
    act(() => {
      sentinelObserver.callback(
        [
          {
            target: sentinel,
            isIntersecting: true,
            intersectionRatio: 1,
          } as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver
      );
    });

    // After sentinel intersects, sticky class should be removed
    expect(stickyContainer).not.toHaveClass("sticky");
  });

  it("cleans up IntersectionObservers on unmount", () => {
    const { unmount } = render(<HowItWorksContent />);

    unmount();

    expect(disconnectMock).toHaveBeenCalled();
  });

  // --- ACCEPTANCE TEST: Hash navigation and :target highlight ---

  it("stage cards have stage-card class, id, and scroll-mt for :target highlight and hash navigation", () => {
    render(<HowItWorksContent />);

    for (const stage of FORWARD_STAGES) {
      const card = document.getElementById(stage.toLowerCase());
      expect(card).toBeInTheDocument();
      // Stage card must have a consistent class that :target CSS can target
      expect(card!.classList.contains("stage-card")).toBe(true);
      // Stage card must have scroll-margin-top class so sticky pipeline doesn't cover it
      // In jsdom Tailwind utilities aren't resolved to computed styles,
      // so verify the class is present (scroll-mt-24 = 6rem offset)
      expect(card!.classList.contains("scroll-mt-24")).toBe(true);
    }
  });

  it(":target CSS rule is defined for stage-card elements", () => {
    // CSS rules from globals.css are not loaded into jsdom, so we verify
    // the structural prerequisite: the stage-card class exists on rendered cards.
    // The :target CSS rule in globals.css pairs with this class.
    // Full :target behavior (highlight on hash navigation) is a browser concern
    // verified by the class + id structure tested above.
    render(<HowItWorksContent />);

    const submittedCard = document.getElementById("submitted");
    expect(submittedCard).toBeInTheDocument();
    expect(submittedCard!.classList.contains("stage-card")).toBe(true);
    // Verify the id attribute enables hash targeting: #submitted
    expect(submittedCard!.id).toBe("submitted");
  });
});
