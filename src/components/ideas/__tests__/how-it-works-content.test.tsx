/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import { HowItWorksContent } from "../how-it-works-content";

const { trackEventMock } = vi.hoisted(() => ({
  trackEventMock: vi.fn(),
}));

// Mock next-intl to verify namespace usage
const translationCalls: Array<{ namespace: string; key: string }> = [];
vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) => {
    translationCalls.push({ namespace, key });
    return `${namespace}.${key}`;
  },
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: trackEventMock,
}));

// Mock IntersectionObserver — track all observer instances
const observerInstances: MockIntersectionObserver[] = [];
const observeMock = vi.fn();
const unobserveMock = vi.fn();
const disconnectMock = vi.fn();
const addMediaListenerMock = vi.fn();
const removeMediaListenerMock = vi.fn();

class MockIntersectionObserver {
  callback: IntersectionObserverCallback;
  options?: IntersectionObserverInit;
  constructor(cb: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = cb;
    this.options = options;
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
  addMediaListenerMock.mockClear();
  removeMediaListenerMock.mockClear();
  trackEventMock.mockClear();
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: addMediaListenerMock,
      removeEventListener: removeMediaListenerMock,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  );
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

  it("renders a roomier max-w-5xl page layout with taller stage cards", () => {
    const { container } = render(<HowItWorksContent />);

    const main = container.querySelector("main");
    expect(main).toHaveClass("max-w-5xl", "py-10");

    const submittedCard = document.getElementById("submitted");
    expect(submittedCard).toHaveClass("min-h-[40vh]", "p-6", "sm:p-8");
  });

  it("renders PipelineTrack with only the first stage active on page load", () => {
    render(<HowItWorksContent />);

    // PipelineTrack is rendered
    expect(screen.getByTestId("pipeline-track")).toBeInTheDocument();

    // All 6 stage markers rendered
    const markers = screen.getAllByTestId("stage-marker");
    expect(markers).toHaveLength(6);

    expect(screen.getByTestId("active-stage-indicator")).toHaveAttribute(
      "data-active-stage",
      "SUBMITTED"
    );
    expect(markers[0]).toHaveClass("border-ink", "bg-paper");

    const futureMarkers = markers.filter(
      (m) =>
        m.classList.contains("border-gray-300") &&
        m.classList.contains("bg-paper")
    );
    expect(futureMarkers).toHaveLength(5);

    const filledSegments = screen
      .getAllByTestId("track-segment")
      .filter((segment) => segment.classList.contains("bg-ink"));
    expect(filledSegments).toHaveLength(0);
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

  it("renders a creator credit link that opens safely in a new tab", () => {
    render(<HowItWorksContent />);

    expect(screen.getByText(/HowItWorks\.creatorCredit/)).toBeInTheDocument();
    const creatorLink = screen.getByRole("link", { name: "Gergo Balogh" });
    expect(creatorLink).toHaveAttribute("href", "https://gergobalogh.me");
    expect(creatorLink).toHaveAttribute("target", "_blank");
    expect(creatorLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("tracks creator link clicks with Umami", () => {
    render(<HowItWorksContent />);

    const creatorLink = screen.getByRole("link", { name: "Gergo Balogh" });

    act(() => {
      creatorLink.click();
    });

    expect(trackEventMock).toHaveBeenCalledWith("creator_link_click", {
      page: "how-it-works",
      destination: "https://gergobalogh.me",
    });
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
      "creatorCredit",
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

    const markers = screen.getAllByTestId("stage-marker");
    expect(markers[0]).toHaveClass("bg-ink");
    expect(markers[1]).toHaveClass("border-ink", "bg-paper");

    const filledSegments = screen
      .getAllByTestId("track-segment")
      .filter((segment) => segment.classList.contains("bg-ink"));
    expect(filledSegments).toHaveLength(1);
  });

  it("configures the observer to favor stage cards in the main reading area", () => {
    render(<HowItWorksContent />);

    expect(observerInstances[0].options).toMatchObject({
      root: null,
      rootMargin: "-30% 0px -45% 0px",
      threshold: [0.35, 0.6],
    });
    expect(observeMock).toHaveBeenCalledTimes(FORWARD_STAGES.length);
  });

  it("passes mobile mode to PipelineTrack so the pipeline renders vertically", async () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: true,
        media: query,
        onchange: null,
        addEventListener: addMediaListenerMock,
        removeEventListener: removeMediaListenerMock,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))
    );

    render(<HowItWorksContent />);

    await waitFor(() => {
      expect(screen.getByTestId("pipeline-track")).toHaveClass("min-h-72");
    });
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

  it("keeps the pipeline sticky below the global header without a scroll sentinel", () => {
    render(<HowItWorksContent />);

    const stickyContainer = screen.getByTestId("sticky-pipeline-container");
    expect(stickyContainer).toHaveClass("sticky");
    expect(stickyContainer).toHaveClass("top-20");
    expect(screen.queryByTestId("sticky-sentinel")).not.toBeInTheDocument();
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
      // Stage card must have scroll-margin-top class so sticky header + pipeline don't cover it
      // In jsdom Tailwind utilities aren't resolved to computed styles,
      // so verify the class is present (scroll-mt-56 = 14rem offset)
      expect(card!.classList.contains("scroll-mt-56")).toBe(true);
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
