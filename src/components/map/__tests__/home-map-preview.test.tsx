/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, act } from "@testing-library/react";
import { HomeMapPreview } from "../home-map-preview";
import type { IdeaMapData } from "../map-view";

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

// Capture MapView props for assertions
let capturedMapViewProps: Record<string, unknown> = {};

// next/dynamic: render MapView mock directly instead of lazy-loading
vi.mock("next/dynamic", () => ({
  __esModule: true,
  default: () => {
    return function DynamicMock(props: Record<string, unknown>) {
      capturedMapViewProps = { ...props };
      return (
        <div
          data-testid="map-view"
          data-compact={String(props.compact)}
          data-onmapap={typeof props.onMapTap === "function" ? "true" : "false"}
          data-default-center={JSON.stringify(props.defaultCenter)}
        />
      );
    };
  },
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const sampleIdeas: IdeaMapData[] = [
  { id: "1", latitude: 46.77, longitude: 23.59, title: "Park", status: "SUBMITTED", district: "CENTRU", category: "ENVIRONMENT", supportCount: 5 },
  { id: "2", latitude: 46.78, longitude: 23.60, title: "Bench", status: "IN_PROGRESS", district: "MANASTUR", category: "INFRASTRUCTURE", supportCount: 3 },
];

// ---------------------------------------------------------------------------
// Acceptance: Tapping the map opens submission form with coordinates
// ---------------------------------------------------------------------------

describe("HomeMapPreview - Acceptance: tap-to-submit", () => {
  beforeEach(() => {
    mockPush.mockReset();
    capturedMapViewProps = {};
  });

  it("passes onMapTap handler to MapView", () => {
    render(<HomeMapPreview ideas={sampleIdeas} />);

    expect(capturedMapViewProps.onMapTap).toBeDefined();
    expect(typeof capturedMapViewProps.onMapTap).toBe("function");
  });

  it("navigates to /ideas/new with lat/lng params when onMapTap is called", () => {
    render(<HomeMapPreview ideas={sampleIdeas} />);

    // Simulate a tap on the map at coordinates near Manastur
    const onMapTap = capturedMapViewProps.onMapTap as (lat: number, lng: number) => void;
    act(() => {
      onMapTap(46.78, 23.6);
    });

    expect(mockPush).toHaveBeenCalledWith("/ideas/new?lat=46.78&lng=23.6");
  });

  it("rounds coordinates to 4 decimal places in navigation URL", () => {
    render(<HomeMapPreview ideas={sampleIdeas} />);

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
    capturedMapViewProps = {};
  });

  it("passes Cluj-Napoca default center (46.77, 23.59) to MapView", () => {
    render(<HomeMapPreview ideas={[]} />);

    expect(capturedMapViewProps.defaultCenter).toEqual([46.77, 23.59]);
  });
});

// ---------------------------------------------------------------------------
// Regression: existing marker/popup behavior preserved
// ---------------------------------------------------------------------------

describe("HomeMapPreview - Regression: existing behavior", () => {
  beforeEach(() => {
    capturedMapViewProps = {};
  });

  it("passes ideas prop through to MapView", () => {
    render(<HomeMapPreview ideas={sampleIdeas} />);

    const ideas = capturedMapViewProps.ideas as IdeaMapData[];
    expect(ideas).toHaveLength(2);
    expect(ideas[0].id).toBe("1");
    expect(ideas[1].id).toBe("2");
  });

  it("passes empty ideas array to MapView when no ideas provided", () => {
    render(<HomeMapPreview ideas={[]} />);

    const ideas = capturedMapViewProps.ideas as IdeaMapData[];
    expect(ideas).toHaveLength(0);
  });

  it("passes compact=false when hero=true", () => {
    render(<HomeMapPreview ideas={[]} hero={true} />);

    expect(capturedMapViewProps.compact).toBe(false);
  });

  it("passes compact=true when hero=false", () => {
    render(<HomeMapPreview ideas={[]} hero={false} />);

    expect(capturedMapViewProps.compact).toBe(true);
  });
});
