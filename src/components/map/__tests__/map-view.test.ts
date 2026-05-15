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
    markerIcon("ENVIRONMENT", "SUBMITTED", "Manastur");
    const html = lastIconHtml();
    // ENVIRONMENT category color should appear (teal hex #0F766E), NOT status SUBMITTED (#64748b)
    expect(html).toContain("#0F766E");
  });

  it("adds animate-pulse class for IN_PROGRESS status", () => {
    markerIcon("INFRASTRUCTURE", "IN_PROGRESS", "Gheorgheni");
    const html = lastIconHtml();
    expect(html).toContain("animate-pulse");
  });

  it("adds animate-pulse class for SELECTED status", () => {
    markerIcon("EDUCATION", "SELECTED", "Centru");
    const html = lastIconHtml();
    expect(html).toContain("animate-pulse");
  });

  it("omits animate-pulse for non-active statuses", () => {
    markerIcon("EDUCATION", "SUBMITTED", "Zorilor");
    const html = lastIconHtml();
    expect(html).not.toContain("animate-pulse");
  });

  it("adds ring-8 shadow class to markers", () => {
    markerIcon("SAFETY", "SUBMITTED", "Marasti");
    const html = lastIconHtml();
    expect(html).toContain("ring-8");
  });

  it("falls back to OTHER category color for unknown categories", () => {
    markerIcon("UNKNOWN_CATEGORY", "SUBMITTED", "Gruia");
    const html = lastIconHtml();
    // OTHER falls back to ink-muted hex color
    expect(html).toContain(categoryMarkerColors.OTHER);
  });
});

// ---------------------------------------------------------------------------
// Acceptance: Hover tooltips on map markers (Step 04-02)
// ---------------------------------------------------------------------------

describe("markerIcon — Acceptance: hover tooltip with district name", () => {
  beforeEach(() => {
    divIconCalls.length = 0;
  });

  it("includes tooltip div with district name in marker HTML", () => {
    markerIcon("ENVIRONMENT", "SUBMITTED", "Manastur");
    const html = lastIconHtml();
    expect(html).toContain("Manastur");
  });

  it("styles tooltip as dark (bg-ink text-paper)", () => {
    markerIcon("INFRASTRUCTURE", "IN_PROGRESS", "Gheorgheni");
    const html = lastIconHtml();
    expect(html).toContain("bg-ink");
    expect(html).toContain("text-paper");
  });

  it("hides tooltip by default and shows on hover via CSS", () => {
    markerIcon("EDUCATION", "SUBMITTED", "Centru");
    const html = lastIconHtml();
    // Tooltip should be hidden by default (opacity-0 or similar)
    expect(html).toMatch(/opacity-0|invisible|hidden|pointer-events-none/);
  });

  it("preserves marker circle and ring classes when tooltip is added", () => {
    markerIcon("SAFETY", "SUBMITTED", "Zorilor");
    const html = lastIconHtml();
    expect(html).toContain("ring-8");
    expect(html).toContain("#DC2626");
    expect(html).toContain("Zorilor");
  });
});

// ---------------------------------------------------------------------------
// Unit: markerIcon tooltip HTML structure (Step 04-02)
// ---------------------------------------------------------------------------

describe("markerIcon — Unit: tooltip HTML structure", () => {
  beforeEach(() => {
    divIconCalls.length = 0;
  });

  it("wraps marker and tooltip in a group container for hover targeting", () => {
    markerIcon("ENVIRONMENT", "SUBMITTED", "Manastur");
    const html = lastIconHtml();
    // The outermost element should be a group div that :hover targets
    expect(html).toMatch(/^<div class="[^"]*group[^"]*"/);
  });

  it("positions tooltip above marker with absolute positioning", () => {
    markerIcon("INFRASTRUCTURE", "SUBMITTED", "Gheorgheni");
    const html = lastIconHtml();
    expect(html).toContain("absolute");
    expect(html).toContain("bottom-full");
  });

  it("shows tooltip on group hover via group-hover:opacity-100", () => {
    markerIcon("EDUCATION", "SUBMITTED", "Centru");
    const html = lastIconHtml();
    expect(html).toContain("group-hover:opacity-100");
  });

  it("includes whitespace-nowrap on tooltip to prevent wrapping", () => {
    markerIcon("SAFETY", "SUBMITTED", "Marasti");
    const html = lastIconHtml();
    expect(html).toContain("whitespace-nowrap");
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
