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

// motion/react: render motion elements as real HTML elements that apply initial props as inline styles
// so we can verify animation configuration through the driving port
let __reducedMotion = false;

vi.mock("motion/react", () => {
  const React = require("react");
  const forwardRef = React.forwardRef;

  const motion = new Proxy(
    {},
    {
      get(_target, prop: string) {
        // Support motion.div, motion.aside, motion.section, etc.
        const htmlTags = ["div", "aside", "section", "main", "nav", "span", "p", "h1", "h2", "h3"];
        if (htmlTags.includes(prop)) {
          return forwardRef(
            (
              {
                initial,
                animate,
                transition,
                children,
                "data-testid": testId,
                className,
                ...rest
              }: {
                initial?: Record<string, number>;
                animate?: Record<string, number>;
                transition?: Record<string, unknown>;
                children?: React.ReactNode;
                "data-testid"?: string;
                className?: string;
                [key: string]: unknown;
              },
              ref: React.Ref<HTMLElement>
            ) => {
              // When reduced motion is active, skip to animate state (no transition)
              const effectiveInitial = __reducedMotion ? animate : initial;
              // Apply initial values as inline style (simulating motion's first frame)
              const style: Record<string, string> = {};
              if (effectiveInitial) {
                if ("opacity" in effectiveInitial)
                  style.opacity = String(effectiveInitial.opacity);
                if ("x" in effectiveInitial && effectiveInitial.x !== 0)
                  style.transform = `translateX(${effectiveInitial.x}px)`;
                if ("scale" in effectiveInitial && effectiveInitial.scale !== 1)
                  style.transform = `scale(${effectiveInitial.scale})`;
              }
              return React.createElement(
                prop,
                {
                  ref,
                  "data-testid": testId,
                  className,
                  style,
                  ...rest,
                },
                children
              );
            }
          );
        }
        return undefined;
      },
    }
  );

  return {
    motion,
    useReducedMotion: () => __reducedMotion,
  };
});

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
// Acceptance: Entrance animations (Step 01-02)
// ---------------------------------------------------------------------------

describe("LocaleHomePage — Entrance animations", () => {
  it("sidebar has slide-from-left entrance animation props", () => {
    const { container } = render(<LocaleHomePage />);
    const sidebar = container.querySelector("[data-testid='sidebar']");
    // motion.div renders with style reflecting initial/animate transform
    // We verify the motion wrapper exists by checking for data-testid on the
    // animated element. The animation props (initial/animate) are encoded in
    // the rendered style of motion.div at initial frame.
    expect(sidebar).toBeInTheDocument();
    // motion.div sets initial styles inline — opacity:0 and transform:translateX(-20px)
    const style = (sidebar as HTMLElement).style;
    expect(style.opacity).toBe("0");
    expect(style.transform).toContain("-20");
  });

  it("map area has fade+scale entrance animation props", () => {
    const { container } = render(<LocaleHomePage />);
    const mapArea = container.querySelector("[data-testid='map-area']");
    expect(mapArea).toBeInTheDocument();
    // motion.div initial: opacity:0, scale:0.98
    const style = (mapArea as HTMLElement).style;
    expect(style.opacity).toBe("0");
    expect(style.transform).toContain("0.98");
  });

  it("respects prefers-reduced-motion by skipping animations", () => {
    // Enable reduced motion mode for this test
    __reducedMotion = true;

    const { container } = render(<LocaleHomePage />);
    const sidebar = container.querySelector("[data-testid='sidebar']");
    const mapArea = container.querySelector("[data-testid='map-area']");

    // With reduced motion, component should skip to animate state (opacity: 1, no transform)
    const sidebarStyle = (sidebar as HTMLElement).style;
    const mapStyle = (mapArea as HTMLElement).style;

    expect(sidebarStyle.opacity).toBe("1");
    expect(sidebarStyle.transform).toBe("");
    expect(mapStyle.opacity).toBe("1");
    expect(mapStyle.transform).toBe("");

    __reducedMotion = false;
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
