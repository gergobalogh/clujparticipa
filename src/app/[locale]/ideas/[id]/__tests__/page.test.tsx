/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// ---------------------------------------------------------------------------
// Configurable mock for useNotificationOptIn
// ---------------------------------------------------------------------------

let mockNotificationPermission: "default" | "granted" | "denied" = "denied";
let mockShowInAppFallback = true;
let mockRequestPermission = vi.fn().mockResolvedValue("denied");

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

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: null }),
  signIn: () => {},
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

vi.mock("@/components/ideas/idea-pipeline", () => ({
  IdeaPipeline: () => <div data-testid="idea-pipeline" />,
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

// ---------------------------------------------------------------------------
// Import component AFTER mocks
// ---------------------------------------------------------------------------

import IdeaDetailPage from "../page";

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

function setupFetchMock(idea: Record<string, unknown> = MOCK_IDEA) {
  const fetchMock = vi.fn().mockImplementation((url: string) => {
    if (url.includes("/api/ideas/") && url.endsWith("/comments")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ comments: [] }) });
    }
    if (url.includes("/api/voting-config")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ config: null }) });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve(idea) });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

// ---------------------------------------------------------------------------
// Acceptance: In-app fallback indicator when permission denied
// ---------------------------------------------------------------------------

describe("IdeaDetailPage - Notification fallback when permission denied", () => {
  beforeEach(() => {
    localStorage.clear();
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

    // Now the idea has moved to UNDER_REVIEW
    setupFetchMock({ ...MOCK_IDEA, status: "UNDER_REVIEW" });

    render(<IdeaDetailPage />);

    // Wait for the idea to load (title appears in mobile + desktop, so use AllBy)
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

    setupFetchMock({ ...MOCK_IDEA, status: "UNDER_REVIEW" });

    mockNotificationPermission = "granted";
    mockShowInAppFallback = false;

    render(<IdeaDetailPage />);

    await waitFor(() => {
      expect(screen.getAllByText("Broken sidewalk near school").length).toBeGreaterThan(0);
    });

    expect(screen.queryByTestId("notification-fallback")).not.toBeInTheDocument();
  });

  it("does not show in-app indicator when status has not changed since last visit", async () => {
    localStorage.setItem("idea-123:lastSeenStatus", "UNDER_REVIEW");

    setupFetchMock({ ...MOCK_IDEA, status: "UNDER_REVIEW" });

    render(<IdeaDetailPage />);

    await waitFor(() => {
      expect(screen.getAllByText("Broken sidewalk near school").length).toBeGreaterThan(0);
    });

    expect(screen.queryByTestId("notification-fallback")).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Acceptance: Multiple status changes show latest only
// ---------------------------------------------------------------------------

describe("IdeaDetailPage - Multiple status changes show latest only", () => {
  beforeEach(() => {
    localStorage.clear();
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

    setupFetchMock(multiChangeIdea);

    render(<IdeaDetailPage />);

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
