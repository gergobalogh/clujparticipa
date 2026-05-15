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

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, ...props }: { children: React.ReactNode; href: string }) => (
    <a {...props}>{children}</a>
  ),
  useRouter: () => ({ push: vi.fn() }),
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
import LocaleHomePage from "../page";

describe("LocaleHomePage", () => {
  it("renders HomeMapPreview on the page", () => {
    render(<LocaleHomePage />);
    expect(screen.getByTestId("home-map-preview")).toBeInTheDocument();
  });

  it("renders the ideas feed section heading", () => {
    render(<LocaleHomePage />);
    expect(screen.getByText("Home.recentIdeas")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Acceptance: Flex split layout (Step 01-01)
// ---------------------------------------------------------------------------

describe("LocaleHomePage — Flex split layout", () => {
  it("renders sidebar with w-[400px] on desktop", () => {
    const { container } = render(<LocaleHomePage />);
    const sidebar = container.querySelector("[data-testid='sidebar']");
    expect(sidebar).toBeInTheDocument();
    expect(sidebar?.className).toContain("w-[400px]");
  });

  it("renders map area with flex-1 on desktop", () => {
    const { container } = render(<LocaleHomePage />);
    const mapArea = container.querySelector("[data-testid='map-area']");
    expect(mapArea).toBeInTheDocument();
    expect(mapArea?.className).toContain("flex-1");
  });

  it("uses flex layout (not grid) for the main content split", () => {
    const { container } = render(<LocaleHomePage />);
    const splitLayout = container.querySelector("[data-testid='split-layout']");
    expect(splitLayout).toBeInTheDocument();
    expect(splitLayout?.className).toContain("flex");
    expect(splitLayout?.className).not.toContain("grid");
  });

  it("stacks sidebar above map on mobile (flex-col below md)", () => {
    const { container } = render(<LocaleHomePage />);
    const splitLayout = container.querySelector("[data-testid='split-layout']");
    expect(splitLayout?.className).toContain("flex-col");
    expect(splitLayout?.className).toContain("md:flex-row");
  });

  it("sidebar idea list scrolls independently", () => {
    const { container } = render(<LocaleHomePage />);
    const sidebar = container.querySelector("[data-testid='sidebar']");
    expect(sidebar?.className).toContain("overflow-y-auto");
  });
});
