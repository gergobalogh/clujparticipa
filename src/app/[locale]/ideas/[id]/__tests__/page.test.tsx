/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";

// ---------------------------------------------------------------------------
// Configurable mock for useNotificationOptIn
// ---------------------------------------------------------------------------

let mockNotificationPermission: "default" | "granted" | "denied" = "denied";
let mockShowInAppFallback = true;
let mockRequestPermission = vi.fn().mockResolvedValue("denied");
const { trackEventMock, signInMock } = vi.hoisted(() => ({
  trackEventMock: vi.fn(),
  signInMock: vi.fn(),
}));

vi.mock("@/hooks/use-notification-opt-in", () => ({
  useNotificationOptIn: () => ({
    get permission() { return mockNotificationPermission; },
    get showInAppFallback() { return mockShowInAppFallback; },
    requestPermission: mockRequestPermission,
  }),
}));

// ---------------------------------------------------------------------------
// Other mocks
// ---------------------------------------------------------------------------

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => {
    const keys: Record<string, Record<string, string>> = {
      IdeaDetail: {
        title: "Idea Details",
        category: "Category",
        district: "District",
        status: "Status",
        submittedBy: "Submitted",
        supportButton: "Support this idea",
        backThisIdea: "Support this idea",
        voteButton: "Vote",
        alreadySupported: "Already supported",
        supportCount: "{count} supports",
        commentCount: "{count} comments",
        nonBinding: "Support votes are non-binding.",
        notOpenForVoting: "This idea is not open for voting.",
        rejectionNote: "Rejection note",
        commentsTitle: "Comments",
        addComment: "Add a comment",
        commentPlaceholder: "Write a comment...",
        replyPlaceholder: "Write a reply...",
        submitComment: "Submit",
        submitReply: "Reply",
        noComments: "No comments yet.",
        statusTimeline: "Status History",
        statusFrom: "From",
        statusTo: "To",
        statusNote: "Note",
        statusBy: "Changed by",
        replyTo: "Reply",
        cancelReply: "Cancel",
        location: "Location",
        notifyVoteLabel: "Notify me by email",
        notifyVoteConfirm: "You will be notified.",
        feasibilityHeading: "Feasibility Assessment",
        feasibilityDepartment: "Responsible department",
        feasibilityCostRange: "Estimated cost",
        feasibilityAuthor: "Official assessment",
        votingClosesIn: "Voting closes in",
        votingClosed: "Voting has closed",
        votingDays: "days",
        votingHours: "hours",
        votingMinutes: "minutes",
        progressUpdatesHeading: "Progress Updates",
        loading: "Loading...",
      },
      Categories: { INFRASTRUCTURE: "Infrastructure" },
      Districts: { CENTRU: "Centru" },
      Statuses: {
        SUBMITTED: "Submitted",
        UNDER_REVIEW: "Under review",
        ELIGIBLE: "Eligible",
        IN_VOTING: "In voting",
        SELECTED: "Selected",
        IN_PROGRESS: "In progress",
        COMPLETED: "Completed",
        REJECTED: "Rejected",
      },
      Auth: {
        signIn: "Sign in",
        signOut: "Sign out",
        signInToVote: "Sign in to vote",
        loginRequiredNote: "Login required.",
      },
      Pipeline: {
        waitingFor: "Waiting for",
        daysAgo: "days ago",
        rejected: "Rejected",
        stalled: "Stalled",
      },
      Timeline: {
        viewFullHistory: "View full history",
        noUpdatesYet: "No updates yet",
      },
      Notification: {
        statusChangedBanner: "This idea moved to {stage}",
      },
    };
    const nsKeys = keys[namespace] ?? {};
    return (key: string, params?: Record<string, string>) => {
      let value = nsKeys[key] ?? `${namespace}.${key}`;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          value = value.replace(`{${k}}`, String(v));
        });
      }
      return value;
    };
  },
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "idea-123" }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, ...props }: { children: React.ReactNode; href: string }) => (
    <a {...props}>{children}</a>
  ),
}));

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: null }),
  signIn: signInMock,
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="badge">{children}</span>
  ),
}));

vi.mock("@/components/map/map-picker-loader", () => ({
  MapPickerLoader: () => <div data-testid="map-picker" />,
}));

vi.mock("@/components/ideas/idea-carousel", () => ({
  IdeaCarousel: () => <div data-testid="idea-carousel" />,
}));

vi.mock("@/components/ideas/pipeline-track", () => ({
  PipelineTrack: () => <div data-testid="pipeline-track" />,
}));

vi.mock("@/components/ideas/status-change-timeline", () => ({
  StatusChangeTimeline: () => <div data-testid="status-change-timeline" />,
}));

vi.mock("@/components/ideas/voting-countdown", () => ({
  VotingCountdown: () => <div data-testid="voting-countdown" />,
}));

vi.mock("@/components/ideas/exception-state", () => ({
  ExceptionState: () => <div data-testid="exception-state" />,
}));

vi.mock("@/lib/client-participant", () => ({
  getOrCreateParticipantToken: () => "test-token",
}));

vi.mock("@/lib/status", () => ({
  statusToBadgeVariant: () => "default",
}));

vi.mock("@/lib/transitions", () => ({
  VOTE_ELIGIBLE_STATUSES: ["SUBMITTED", "UNDER_REVIEW", "ELIGIBLE", "IN_VOTING"],
  SUPPORT_LABEL_STATUSES: ["SUBMITTED", "UNDER_REVIEW", "ELIGIBLE"],
}));

vi.mock("@/lib/pipeline-computation", () => ({
  computePipelineStages: () => [],
  resolveExceptionType: () => null,
  findRejectionChange: () => null,
  parseMergeNote: () => ({ parentIdeaId: null, parentIdeaTitle: null }),
  parseReturnNote: () => null,
}));

vi.mock("@/lib/timeline-mapping", () => ({
  mapStatusChangesToTimelineEntries: () => [],
}));

vi.mock("@/lib/stalled-detector", () => ({
  detectStalledIdea: () => ({ isStalled: false, daysSinceLastChange: 0, waitingForLabel: "" }),
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: trackEventMock,
}));

// ---------------------------------------------------------------------------
// Import component AFTER mocks
// ---------------------------------------------------------------------------

import IdeaDetailClient from "@/components/ideas/idea-detail-client";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MOCK_IDEA = {
  id: "idea-123",
  title: "Broken sidewalk near school",
  description: "The sidewalk needs repair",
  category: "INFRASTRUCTURE",
  district: "CENTRU",
  status: "UNDER_REVIEW",
  latitude: 46.77,
  longitude: 23.59,
  createdAt: "2025-01-01T00:00:00Z",
  supportCount: 5,
  commentCount: 2,
  statusChanges: [
    {
      id: "sc-1",
      fromStatus: null,
      toStatus: "SUBMITTED",
      note: "",
      changedBy: "system",
      createdAt: "2025-01-01T00:00:00Z",
    },
    {
      id: "sc-2",
      fromStatus: "SUBMITTED",
      toStatus: "UNDER_REVIEW",
      note: "Under review",
      changedBy: "admin",
      createdAt: "2025-01-15T00:00:00Z",
    },
  ],
  images: [],
  feasibilityNote: null,
  progressUpdates: [],
};

// The client island no longer fetches idea data -- it receives it as props.
// It still fetches comments and voting-config client-side.
function setupClientFetchMock() {
  const fetchMock = vi.fn().mockImplementation((url: string) => {
    if (url.includes("/api/ideas/") && url.endsWith("/comments")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ comments: [] }) });
    }
    if (url.includes("/api/voting-config")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ config: null }) });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function setupClientFetchMockWithVote() {
  const fetchMock = vi.fn().mockImplementation((url: string, init?: RequestInit) => {
    if (url.includes("/api/ideas/") && url.endsWith("/comments")) {
      if (init?.method === "POST") {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: "comment-1" }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ comments: [] }) });
    }
    if (url.includes("/api/ideas/") && url.endsWith("/vote")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ supportCount: 6 }) });
    }
    if (url.includes("/api/voting-config")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ config: null }) });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

// ---------------------------------------------------------------------------
// Acceptance: In-app fallback indicator when permission denied
// ---------------------------------------------------------------------------

describe("IdeaDetailClient - Notification fallback when permission denied", () => {
  beforeEach(() => {
    localStorage.clear();
    trackEventMock.mockClear();
    signInMock.mockClear();
    mockNotificationPermission = "denied";
    mockShowInAppFallback = true;
    mockRequestPermission = vi.fn().mockResolvedValue("denied");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows in-app status change indicator when showInAppFallback is true and status changed since last visit", async () => {
    // Mark the idea as last seen with status SUBMITTED (older status)
    localStorage.setItem("idea-123:lastSeenStatus", "SUBMITTED");

    // Idea has moved to UNDER_REVIEW -- pass this as props
    setupClientFetchMock();

    const ideaWithChangedStatus = { ...MOCK_IDEA, status: "UNDER_REVIEW" };
    render(<IdeaDetailClient idea={ideaWithChangedStatus} />);

    // Wait for the idea title to appear (mobile + desktop)
    await waitFor(() => {
      expect(screen.getAllByText("Broken sidewalk near school").length).toBeGreaterThan(0);
    });

    // The in-app fallback indicator should be visible
    await waitFor(() => {
      expect(screen.getByTestId("notification-fallback")).toBeInTheDocument();
    });
  });

  it("does not show in-app indicator when permission is granted", async () => {
    localStorage.setItem("idea-123:lastSeenStatus", "SUBMITTED");

    setupClientFetchMock();

    mockNotificationPermission = "granted";
    mockShowInAppFallback = false;

    const ideaWithChangedStatus = { ...MOCK_IDEA, status: "UNDER_REVIEW" };
    render(<IdeaDetailClient idea={ideaWithChangedStatus} />);

    await waitFor(() => {
      expect(screen.getAllByText("Broken sidewalk near school").length).toBeGreaterThan(0);
    });

    expect(screen.queryByTestId("notification-fallback")).not.toBeInTheDocument();
  });

  it("does not show in-app indicator when status has not changed since last visit", async () => {
    localStorage.setItem("idea-123:lastSeenStatus", "UNDER_REVIEW");

    setupClientFetchMock();

    render(<IdeaDetailClient idea={MOCK_IDEA} />);

    await waitFor(() => {
      expect(screen.getAllByText("Broken sidewalk near school").length).toBeGreaterThan(0);
    });

    expect(screen.queryByTestId("notification-fallback")).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Acceptance: Multiple status changes show latest only
// ---------------------------------------------------------------------------

describe("IdeaDetailClient - Multiple status changes show latest only", () => {
  beforeEach(() => {
    localStorage.clear();
    trackEventMock.mockClear();
    signInMock.mockClear();
    mockNotificationPermission = "denied";
    mockShowInAppFallback = true;
    mockRequestPermission = vi.fn().mockResolvedValue("denied");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the most recent status in the in-app indicator, not an older one", async () => {
    // User last saw the idea as SUBMITTED
    localStorage.setItem("idea-123:lastSeenStatus", "SUBMITTED");

    // Idea has gone through 3 changes: SUBMITTED -> UNDER_REVIEW -> ELIGIBLE -> IN_VOTING
    const multiChangeIdea = {
      ...MOCK_IDEA,
      status: "IN_VOTING",
      statusChanges: [
        { id: "sc-1", fromStatus: null, toStatus: "SUBMITTED", note: "", changedBy: "system", createdAt: "2025-01-01T00:00:00Z" },
        { id: "sc-2", fromStatus: "SUBMITTED", toStatus: "UNDER_REVIEW", note: "Under review", changedBy: "admin", createdAt: "2025-01-15T00:00:00Z" },
        { id: "sc-3", fromStatus: "UNDER_REVIEW", toStatus: "ELIGIBLE", note: "Eligible", changedBy: "admin", createdAt: "2025-02-01T00:00:00Z" },
        { id: "sc-4", fromStatus: "ELIGIBLE", toStatus: "IN_VOTING", note: "Sent to voting", changedBy: "admin", createdAt: "2025-02-15T00:00:00Z" },
      ],
    };

    setupClientFetchMock();

    render(<IdeaDetailClient idea={multiChangeIdea} />);

    await waitFor(() => {
      expect(screen.getAllByText("Broken sidewalk near school").length).toBeGreaterThan(0);
    });

    // The in-app indicator should show the LATEST status (IN_VOTING), not an intermediate one
    await waitFor(() => {
      const fallback = screen.getByTestId("notification-fallback");
      expect(fallback).toBeInTheDocument();
      expect(fallback.textContent).toContain("In voting");
    });
  });
});

describe("IdeaDetailClient - analytics events", () => {
  beforeEach(() => {
    localStorage.clear();
    trackEventMock.mockClear();
    signInMock.mockClear();
    mockNotificationPermission = "granted";
    mockShowInAppFallback = false;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("tracks sign_in before redirecting unauthenticated voting users", async () => {
    const user = userEvent.setup();
    setupClientFetchMock();

    render(<IdeaDetailClient idea={MOCK_IDEA} />);

    await waitFor(() => {
      expect(screen.getAllByText("Broken sidewalk near school").length).toBeGreaterThan(0);
    });

    await user.click(screen.getAllByRole("button", { name: "Sign in to vote" })[0]);

    expect(trackEventMock).toHaveBeenCalledWith("sign_in");
    expect(signInMock).toHaveBeenCalled();
  });

  it("tracks top-level comments after a successful submit", async () => {
    const user = userEvent.setup();
    setupClientFetchMockWithVote();

    render(<IdeaDetailClient idea={MOCK_IDEA} />);

    await waitFor(() => {
      expect(screen.getAllByText("Broken sidewalk near school").length).toBeGreaterThan(0);
    });

    await user.type(screen.getByPlaceholderText("Write a comment..."), "Please fix this soon");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => {
      expect(trackEventMock).toHaveBeenCalledWith("comment_add", { ideaId: "idea-123" });
    });
  });
});
