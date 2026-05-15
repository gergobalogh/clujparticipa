/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Capture calls to requestPermission for assertion
const requestPermissionMock = vi.fn().mockResolvedValue("granted");

// Configurable mock state for useNotificationOptIn
let mockNotificationPermission: "default" | "granted" | "denied" = "default";
let mockShowInAppFallback = false;

vi.mock("@/hooks/use-notification-opt-in", () => ({
  useNotificationOptIn: () => ({
    get permission() { return mockNotificationPermission; },
    requestPermission: requestPermissionMock,
    get showInAppFallback() { return mockShowInAppFallback; },
  }),
}));

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => {
    const keys: Record<string, string> = {
      NewIdea: {
        title: "Submit an idea",
        description: "Propose an improvement",
        titleLabel: "Title",
        titlePlaceholder: "Summarize your idea",
        descriptionLabel: "Description",
        descriptionPlaceholder: "Describe the problem",
        categoryLabel: "Category",
        categoryPlaceholder: "Select a category",
        districtLabel: "District",
        districtPlaceholder: "Select a district",
        locationLabel: "Map location",
        locationHint: "Click on the map",
        submit: "Submit idea",
        submitting: "Submitting...",
        success: "Idea submitted successfully!",
        viewIdea: "View idea",
        required: "Required",
        notifyLabel: "Notify me by email when the idea's status changes.",
      },
      Notification: {
        optInTitle: "Enable notifications?",
        optInDescription: "Get notified when your idea's status changes.",
        optInAllow: "Allow notifications",
        optInDismiss: "Not now",
        statusChangedBanner: "This idea moved to {stage}",
      },
      Categories: {
        INFRASTRUCTURE: "Infrastructure",
        EDUCATION: "Education",
        ENVIRONMENT: "Environment",
        CULTURE: "Culture",
        SAFETY: "Safety",
        TRANSPORT: "Transport",
        HEALTH: "Health",
        OTHER: "Other",
      },
      Districts: {
        MANASTUR: "Manastur",
        GHEORGHENI: "Gheorgheni",
        ZORILOR: "Zorilor",
        CENTRU: "Centru",
        MARASTI: "Marasti",
        GRIGORESCU: "Grigorescu",
        IRIS: "Iris",
        GRUIA: "Gruia",
        ANDREI_MURESANU: "Andrei Muresanu",
        BUNA_ZIUA: "Buna Ziua",
        BORHANCI: "Borhanci",
        DAMBU_ROTUND: "Dambu Rotund",
        OTHER: "Other",
      },
    }[namespace] ?? {};

    return (key: string) => keys[key] ?? `${namespace}.${key}`;
  },
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, ...props }: { children: React.ReactNode; href: string }) => (
    <a {...props}>{children}</a>
  ),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: null }),
}));

vi.mock("@/components/map/map-picker-loader", () => ({
  MapPickerLoader: () => <div data-testid="map-picker" />,
}));

vi.mock("@/lib/client-participant", () => ({
  getOrCreateParticipantToken: () => "test-token",
}));

vi.mock("@/components/ideas/image-upload", () => ({
  ImageUpload: () => null,
}));

// ---------------------------------------------------------------------------
// Import component AFTER mocks
// ---------------------------------------------------------------------------

import NewIdeaPage from "../page";

// ---------------------------------------------------------------------------
// Acceptance: Opt-in prompt appears after first idea submission
// ---------------------------------------------------------------------------

describe("NewIdeaPage - Notification opt-in after submission", () => {
  beforeEach(() => {
    requestPermissionMock.mockClear();
    requestPermissionMock.mockResolvedValue("granted");
    mockNotificationPermission = "default";
    mockShowInAppFallback = false;
  });

  afterEach(() => {
    mockNotificationPermission = "default";
    mockShowInAppFallback = false;
  });

  it("calls requestPermission after successful idea submission", async () => {
    const user = userEvent.setup();

    // Mock fetch to return a successful response
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "idea-123" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<NewIdeaPage />);

    // Fill out the form
    const titleInput = screen.getByLabelText(/Title/);
    await user.type(titleInput, "Fix the sidewalk");

    const descInput = screen.getByLabelText(/Description/);
    await user.type(descInput, "The sidewalk on Main Street is broken and dangerous for pedestrians");

    // Select category
    const categorySelect = screen.getByLabelText(/Category/);
    await user.selectOptions(categorySelect, "INFRASTRUCTURE");

    // Select district
    const districtSelect = screen.getByLabelText(/District/);
    await user.selectOptions(districtSelect, "MANASTUR");

    // Submit
    const submitButton = screen.getByRole("button", { name: /Submit idea/ });
    await user.click(submitButton);

    // After successful submission, requestPermission should be called
    await waitFor(() => {
      expect(requestPermissionMock).toHaveBeenCalled();
    });

    vi.restoreAllMocks();
  });

  it("does not call requestPermission before submission", () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "idea-123" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<NewIdeaPage />);

    expect(requestPermissionMock).not.toHaveBeenCalled();

    vi.restoreAllMocks();
  });

  it("shows opt-in prompt UI after successful submission", async () => {
    const user = userEvent.setup();

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "idea-123" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<NewIdeaPage />);

    // Fill and submit the form
    const titleInput = screen.getByLabelText(/Title/);
    await user.type(titleInput, "Fix the sidewalk");

    const descInput = screen.getByLabelText(/Description/);
    await user.type(descInput, "The sidewalk on Main Street is broken and dangerous for pedestrians");

    const categorySelect = screen.getByLabelText(/Category/);
    await user.selectOptions(categorySelect, "INFRASTRUCTURE");

    const districtSelect = screen.getByLabelText(/District/);
    await user.selectOptions(districtSelect, "MANASTUR");

    const submitButton = screen.getByRole("button", { name: /Submit idea/ });
    await user.click(submitButton);

    // After successful submission, the opt-in prompt should be visible
    await waitFor(() => {
      expect(screen.getByText(/Enable notifications/i)).toBeInTheDocument();
    });

    vi.restoreAllMocks();
  });
});

// ---------------------------------------------------------------------------
// Unit: Notification API unavailable -- no prompt, no errors
// ---------------------------------------------------------------------------

describe("NewIdeaPage - Notification API unavailable", () => {
  beforeEach(() => {
    requestPermissionMock.mockClear();
    requestPermissionMock.mockResolvedValue("denied");
    mockNotificationPermission = "denied";
    mockShowInAppFallback = true;
  });

  afterEach(() => {
    mockNotificationPermission = "default";
    mockShowInAppFallback = false;
  });

  it("when Notification API unavailable, shows success without opt-in prompt and no errors", async () => {
    const user = userEvent.setup();

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "idea-456" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<NewIdeaPage />);

    // Fill and submit the form
    const titleInput = screen.getByLabelText(/Title/);
    await user.type(titleInput, "New park bench");

    const descInput = screen.getByLabelText(/Description/);
    await user.type(descInput, "We need a park bench at the corner of the street for elderly residents");

    const categorySelect = screen.getByLabelText(/Category/);
    await user.selectOptions(categorySelect, "INFRASTRUCTURE");

    const districtSelect = screen.getByLabelText(/District/);
    await user.selectOptions(districtSelect, "MANASTUR");

    const submitButton = screen.getByRole("button", { name: /Submit idea/ });
    await user.click(submitButton);

    // After successful submission, success message should appear
    await waitFor(() => {
      expect(screen.getByText(/Idea submitted successfully/i)).toBeInTheDocument();
    });

    // The opt-in prompt should NOT appear when Notification API is unavailable
    // (permission='denied' from hook, meaning unavailable)
    expect(screen.queryByText(/Enable notifications/i)).not.toBeInTheDocument();

    vi.restoreAllMocks();
  });
});
