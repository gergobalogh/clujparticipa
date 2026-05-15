/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Mocks — must be set up before importing the module under test
// ---------------------------------------------------------------------------

// Capture divIcon calls to assert on the HTML template
const divIconCalls: Array<{ className: string; iconSize: [number, number]; iconAnchor: [number, number]; popupAnchor: [number, number]; html: string }> = [];

vi.mock("leaflet", () => ({
  default: {
    divIcon: (opts: Record<string, unknown>) => {
      divIconCalls.push({
        className: opts.className as string,
        iconSize: opts.iconSize as [number, number],
        iconAnchor: opts.iconAnchor as [number, number],
        popupAnchor: opts.popupAnchor as [number, number],
        html: opts.html as string,
      });
      return opts;
    },
  },
}));

vi.mock("react-leaflet", () => ({
  MapContainer: () => null,
  TileLayer: () => null,
  Marker: () => null,
  Popup: () => null,
  useMapEvents: () => null,
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "ro",
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@/i18n/routing", () => ({
  AppLocale: {},
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: () => null,
}));

vi.mock("@/lib/status", () => ({
  statusToBadgeVariant: (s: string) => s.toLowerCase(),
}));

vi.mock("leaflet/dist/leaflet.css", () => ({}));

// ---------------------------------------------------------------------------
// Import AFTER mocks are set up
// ---------------------------------------------------------------------------

import { markerIcon, categoryMarkerColors } from "../map-view";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract the inner HTML div from the last divIcon call. */
function lastIconHtml(): string {
  return divIconCalls[divIconCalls.length - 1]?.html ?? "";
}

// ---------------------------------------------------------------------------
// Acceptance: Category-colored markers (Step 04-01)
// ---------------------------------------------------------------------------

describe("markerIcon — Acceptance: category-colored markers with ring and pulse", () => {
  beforeEach(() => {
    divIconCalls.length = 0;
  });

  it("renders colored circle marker with category color, not status color", () => {
    markerIcon("ENVIRONMENT", "SUBMITTED");
    const html = lastIconHtml();
    // ENVIRONMENT category color should appear (teal hex #0F766E), NOT status SUBMITTED (#64748b)
    expect(html).toContain("#0F766E");
  });

  it("adds animate-pulse class for IN_PROGRESS status", () => {
    markerIcon("INFRASTRUCTURE", "IN_PROGRESS");
    const html = lastIconHtml();
    expect(html).toContain("animate-pulse");
  });

  it("adds animate-pulse class for SELECTED status", () => {
    markerIcon("EDUCATION", "SELECTED");
    const html = lastIconHtml();
    expect(html).toContain("animate-pulse");
  });

  it("omits animate-pulse for non-active statuses", () => {
    markerIcon("EDUCATION", "SUBMITTED");
    const html = lastIconHtml();
    expect(html).not.toContain("animate-pulse");
  });

  it("adds ring-8 shadow class to markers", () => {
    markerIcon("SAFETY", "SUBMITTED");
    const html = lastIconHtml();
    expect(html).toContain("ring-8");
  });

  it("falls back to OTHER category color for unknown categories", () => {
    markerIcon("UNKNOWN_CATEGORY", "SUBMITTED");
    const html = lastIconHtml();
    // OTHER falls back to ink-muted hex color
    expect(html).toContain(categoryMarkerColors.OTHER);
  });
});

// ---------------------------------------------------------------------------
// Unit: Category marker color mapping
// ---------------------------------------------------------------------------

describe("categoryMarkerColors", () => {
  it("maps all key categories to distinct hex colors", () => {
    const categories = ["INFRASTRUCTURE", "EDUCATION", "ENVIRONMENT", "CULTURE", "SAFETY", "TRANSPORT", "HEALTH", "OTHER"];
    const colors = categories.map((c) => categoryMarkerColors[c]);
    // All colors are distinct
    expect(new Set(colors).size).toBe(categories.length);
  });
});

// ---------------------------------------------------------------------------
// Unit: MapLoader placeholder (Step 04-01 AC6)
// ---------------------------------------------------------------------------

describe("MapLoader placeholder", () => {
  it("uses h-full class for flex container height propagation", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const source = fs.readFileSync(
      path.resolve(__dirname, "../map-loader.tsx"),
      "utf-8"
    );
    expect(source).toContain("h-full");
  });
});
