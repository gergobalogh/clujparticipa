/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";

// --- Mocks ---

// next-intl: return namespace.key for all translation calls
vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) =>
    `${namespace}.${key}`,
}));

// next/navigation Link: render as anchor
vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, ...props }: { children: React.ReactNode; href: string }) => (
    <a {...props}>{children}</a>
  ),
}));

// react-leaflet: Leaflet requires a DOM, mock the map components
vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="map-container">{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: () => null,
  Popup: () => null,
}));

vi.mock("leaflet", () => ({
  default: {
    divIcon: () => ({ className: "", iconSize: [16, 16] }),
  },
}));

// next/dynamic: render HomeMapPreview directly instead of lazy-loading
vi.mock("next/dynamic", () => ({
  __esModule: true,
  default: (loader: () => { default: React.ComponentType }) => {
    // Return a component that renders a map placeholder
    return function DynamicMock() {
      return <div data-testid="home-map-preview">Map Preview</div>;
    };
  },
}));

// IdeaListRow: lightweight stub
vi.mock("@/components/ideas/idea-list-row", () => ({
  IdeaListRow: ({ title }: { title: string }) => (
    <div data-testid="idea-list-row">{title}</div>
  ),
}));

// home-stats: stub pure functions
vi.mock("@/lib/home-stats", () => ({
  computeCompletedCount: () => 3,
  resolveZeroState: () => "noIdeasYet",
}));

// --- Component under test ---
// Import AFTER mocks so dependencies are replaced
import LocaleHomePage from "../page";

// ---------------------------------------------------------------------------
// Acceptance: Map is homepage hero element
// ---------------------------------------------------------------------------

describe("LocaleHomePage - Acceptance: Map-first layout", () => {
  it("renders HomeMapPreview on the page (not hidden on mobile)", () => {
    render(<LocaleHomePage />);

    const mapPreview = screen.getByTestId("home-map-preview");
    expect(mapPreview).toBeInTheDocument();
  });

  it("places map section before the ideas feed", () => {
    const { container } = render(<LocaleHomePage />);

    const mapSection = container.querySelector("[data-map-hero]");
    const ideasSection = container.querySelector("[data-ideas-feed]");

    // Both sections must exist
    expect(mapSection).toBeInTheDocument();
    expect(ideasSection).toBeInTheDocument();

    // Map section must appear before ideas feed in DOM order
    if (mapSection && ideasSection) {
      const position = mapSection.compareDocumentPosition(ideasSection);
      // Node.DOCUMENT_POSITION_FOLLOWING = 4
      expect(position & 4).toBeTruthy();
    }
  });

  it("does not wrap the map in a hidden-on-mobile container", () => {
    const { container } = render(<LocaleHomePage />);

    // The map section must NOT have 'hidden' or 'lg:block' classes
    const mapSection = container.querySelector("[data-map-hero]");
    expect(mapSection).toBeInTheDocument();

    if (mapSection) {
      const classList = mapSection.className;
      // Must not contain 'hidden' as a standalone responsive-hiding class
      expect(classList).not.toMatch(/\bhidden\b/);
    }
  });

  it("renders the map as full-width (not inside a 2-column grid for map)", () => {
    const { container } = render(<LocaleHomePage />);

    const mapSection = container.querySelector("[data-map-hero]");
    expect(mapSection).toBeInTheDocument();

    if (mapSection) {
      // The map hero section should NOT be inside a grid that constrains it
      // to a fixed 400px sidebar. The grid layout was: lg:grid-cols-[1fr_400px]
      const parentGrid = mapSection.closest("[class*='lg:grid-cols']");
      // If there is a parent grid, the map should not be in a fixed-width column
      if (parentGrid) {
        const gridClasses = parentGrid.className;
        expect(gridClasses).not.toContain("lg:grid-cols-[1fr_400px]");
      }
    }
  });
});
