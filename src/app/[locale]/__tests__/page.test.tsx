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

  it("renders the ideas feed section", () => {
    const { container } = render(<LocaleHomePage />);
    expect(container.querySelector("[class*='lg:grid-cols']")).toBeInTheDocument();
  });
});
