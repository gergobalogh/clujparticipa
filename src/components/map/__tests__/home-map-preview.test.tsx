/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, act } from "@testing-library/react";
import { HomeMapPreview } from "../home-map-preview";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next-intl", () => ({
  useTranslations: (ns: string) => (key: string) => `${ns}.${key}`,
  useLocale: () => "ro",
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
  useRouter: () => ({ push: mockPush }),
}));

// Mock MapView: captures onMapTap and other props for testing
let capturedMapViewProps: Record<string, unknown> = {};

vi.mock("../map-view", () => ({
  default: (props: Record<string, unknown>) => {
    capturedMapViewProps = { ...props };
    return (
      <div
        data-testid="map-view"
        data-compact={String(props.compact)}
        data-onmapap={typeof props.onMapTap === "function" ? "true" : "false"}
        data-default-center={JSON.stringify(props.defaultCenter)}
      />
    );
  },
  IdeaMapData: {},
}));

// Mock fetch for ideas
const mockFetch = vi.fn();
global.fetch = mockFetch;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockIdeasResponse(ideas: Array<Record<string, unknown>>) {
  return {
    ok: true,
    json: () => Promise.resolve({ ideas }),
  };
}

// ---------------------------------------------------------------------------
// Acceptance: Tapping the map opens submission form with coordinates
// ---------------------------------------------------------------------------

describe("HomeMapPreview - Acceptance: tap-to-submit", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockFetch.mockReset();
    mockFetch.mockResolvedValue(
      mockIdeasResponse([
        { id: "1", latitude: 46.77, longitude: 23.59, title: "Test", status: "SUBMITTED", district: "CENTRU", category: "ENVIRONMENT", supportCount: 0 },
      ])
    );
    capturedMapViewProps = {};
  });

  it("passes onMapTap handler to MapView", async () => {
    render(<HomeMapPreview />);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(capturedMapViewProps.onMapTap).toBeDefined();
    expect(typeof capturedMapViewProps.onMapTap).toBe("function");
  });

  it("navigates to /ideas/new with lat/lng params when onMapTap is called", async () => {
    render(<HomeMapPreview />);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    // Simulate a tap on the map at coordinates near Manastur
    const onMapTap = capturedMapViewProps.onMapTap as (lat: number, lng: number) => void;
    act(() => {
      onMapTap(46.78, 23.6);
    });

    expect(mockPush).toHaveBeenCalledWith("/ideas/new?lat=46.78&lng=23.6");
  });

  it("rounds coordinates to 4 decimal places in navigation URL", async () => {
    render(<HomeMapPreview />);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    const onMapTap = capturedMapViewProps.onMapTap as (lat: number, lng: number) => void;
    act(() => {
      // Pass coordinates with many decimal places
      onMapTap(46.770123456, 23.594398765);
    });

    expect(mockPush).toHaveBeenCalledWith("/ideas/new?lat=46.7701&lng=23.5944");
  });
});

// ---------------------------------------------------------------------------
// Unit: Default center when location unavailable
// ---------------------------------------------------------------------------

describe("HomeMapPreview - Unit: default center", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    capturedMapViewProps = {};
  });

  it("passes Cluj-Napoca default center (46.77, 23.59) to MapView", async () => {
    mockFetch.mockResolvedValue(mockIdeasResponse([]));

    render(<HomeMapPreview />);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(capturedMapViewProps.defaultCenter).toEqual([46.77, 23.59]);
  });
});

// ---------------------------------------------------------------------------
// Regression: existing marker/popup behavior preserved
// ---------------------------------------------------------------------------

describe("HomeMapPreview - Regression: existing behavior", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    capturedMapViewProps = {};
  });

  it("fetches ideas on mount and passes them to MapView", async () => {
    mockFetch.mockResolvedValue(
      mockIdeasResponse([
        { id: "1", latitude: 46.77, longitude: 23.59, title: "Park", status: "SUBMITTED", district: "CENTRU", category: "ENVIRONMENT", supportCount: 5 },
        { id: "2", latitude: 46.78, longitude: 23.60, title: "Bench", status: "IN_PROGRESS", district: "MANASTUR", category: "INFRASTRUCTURE", supportCount: 3 },
      ])
    );

    render(<HomeMapPreview />);

    expect(mockFetch).toHaveBeenCalledWith("/api/ideas?limit=50");

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    const ideas = capturedMapViewProps.ideas as Array<Record<string, unknown>>;
    expect(ideas).toHaveLength(2);
    expect(ideas[0].id).toBe("1");
    expect(ideas[1].id).toBe("2");
  });

  it("filters out ideas with zero or invalid coordinates", async () => {
    mockFetch.mockResolvedValue(
      mockIdeasResponse([
        { id: "1", latitude: 46.77, longitude: 23.59, title: "Valid", status: "SUBMITTED", district: "CENTRU", category: "ENVIRONMENT", supportCount: 0 },
        { id: "2", latitude: 0, longitude: 0, title: "Zero", status: "SUBMITTED", district: "CENTRU", category: "ENVIRONMENT", supportCount: 0 },
        { id: "3", latitude: NaN, longitude: 23.59, title: "NaN", status: "SUBMITTED", district: "CENTRU", category: "ENVIRONMENT", supportCount: 0 },
      ])
    );

    render(<HomeMapPreview />);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    const ideas = capturedMapViewProps.ideas as Array<Record<string, unknown>>;
    expect(ideas).toHaveLength(1);
    expect(ideas[0].id).toBe("1");
  });

  it("passes compact=false when hero=true", async () => {
    mockFetch.mockResolvedValue(mockIdeasResponse([]));

    render(<HomeMapPreview hero={true} />);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(capturedMapViewProps.compact).toBe(false);
  });

  it("passes compact=true when hero=false", async () => {
    mockFetch.mockResolvedValue(mockIdeasResponse([]));

    render(<HomeMapPreview hero={false} />);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(capturedMapViewProps.compact).toBe(true);
  });
});
