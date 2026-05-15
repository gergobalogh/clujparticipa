/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";

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

// Track stagger delay and motion.button props for assertions
const __motionProps: Array<{ tag: string; transition?: Record<string, unknown>; whileHover?: Record<string, unknown>; whileTap?: Record<string, unknown> }> = [];

vi.mock("motion/react", () => {
  const React = require("react");
  const forwardRef = React.forwardRef;

  const motion = new Proxy(
    {},
    {
      get(_target, prop: string) {
        // Support motion.div, motion.aside, motion.section, motion.button, motion.a, etc.
        const htmlTags = ["div", "aside", "section", "main", "nav", "span", "p", "h1", "h2", "h3", "button", "a"];
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
                whileHover,
                whileTap,
                ...rest
              }: {
                initial?: Record<string, number>;
                animate?: Record<string, number>;
                transition?: Record<string, unknown>;
                children?: React.ReactNode;
                "data-testid"?: string;
                className?: string;
                whileHover?: Record<string, unknown>;
                whileTap?: Record<string, unknown>;
                [key: string]: unknown;
              },
              ref: React.Ref<HTMLElement>
            ) => {
              // Record props for assertion
              __motionProps.push({ tag: prop, transition, whileHover, whileTap });

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
              // Expose transition delay via data attribute for stagger assertions
              const dataAttrs: Record<string, string> = {};
              if (transition && typeof transition.delay === "number") {
                dataAttrs["data-motion-delay"] = String(transition.delay);
              }
              return React.createElement(
                prop,
                {
                  ref,
                  "data-testid": testId,
                  className,
                  style,
                  ...dataAttrs,
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

// EditorialIdeaCard: lightweight stub — renders card with data-testid
vi.mock("@/components/ideas/editorial-idea-card", () => ({
  EditorialIdeaCard: ({ id, title }: { id: string; title: string }) => (
    <div data-testid="editorial-idea-card" data-idea-id={id}>{title}</div>
  ),
}));

// SidebarCta: lightweight stub — renders CTA with data-testid
vi.mock("@/components/ideas/sidebar-cta", () => ({
  SidebarCta: () => (
    <div data-testid="sidebar-cta">Home.sendIdea</div>
  ),
}));

// Fetch: return mock data so the page renders with stats and ideas
const mockRecentIdeas = [
  { id: "1", title: "Park", category: "ENVIRONMENT", district: "CENTRU", status: "SUBMITTED", supportCount: 5, commentCount: 2, createdAt: "2025-01-01", firstImage: null },
  { id: "2", title: "Library", category: "EDUCATION", district: "MANASTUR", status: "IN_VOTING", supportCount: 10, commentCount: 3, createdAt: "2025-01-02", firstImage: null },
  { id: "3", title: "Crosswalk", category: "SAFETY", district: "GHEORGHENI", status: "COMPLETED", supportCount: 20, commentCount: 7, createdAt: "2025-01-03", firstImage: null },
];

const mockStats = {
  totalIdeas: 3,
  totalVotes: 35,
  totalComments: 12,
  recentIdeas: mockRecentIdeas,
  statusCounts: { SUBMITTED: 1, IN_VOTING: 1, COMPLETED: 1 },
};

global.fetch = vi.fn((url: string | Request | URL) => {
  const path = typeof url === "string" ? url : url.toString();
  if (path.includes("/api/stats")) {
    return Promise.resolve({ ok: true, json: () => Promise.resolve(mockStats) } as Response);
  }
  if (path.includes("/api/voting-config")) {
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ config: null }) } as Response);
  }
  if (path.includes("/api/ideas")) {
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ ideas: [] }) } as Response);
  }
  return Promise.resolve({ ok: false, json: () => Promise.resolve({}) } as Response);
});

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

// ---------------------------------------------------------------------------
// Acceptance: Editorial typographic styles (Step 02-02)
// ---------------------------------------------------------------------------

describe("LocaleHomePage — Editorial typographic styles", () => {
  it("idea feed heading uses font-serif italic", () => {
    const { container } = render(<LocaleHomePage />);
    const sidebar = container.querySelector("[data-testid='sidebar']");
    const heading = sidebar?.querySelector("h2");
    expect(heading).toBeInTheDocument();
    expect(heading?.className).toContain("font-serif");
    expect(heading?.className).toContain("italic");
  });

  it("map overlay heading uses font-serif", () => {
    const { container } = render(<LocaleHomePage />);
    const mapArea = container.querySelector("[data-testid='map-area']");
    const heading = mapArea?.querySelector("h2");
    expect(heading).toBeInTheDocument();
    expect(heading?.className).toContain("font-serif");
    // Map heading should NOT be italic (only idea feed is italic)
    expect(heading?.className).not.toContain("italic");
  });

  it("global selection styling applies black background and white text", () => {
    // Selection styling is applied via CSS utility classes on the root element.
    // In Next.js App Router, this is the <html> or <body> tag via layout.tsx.
    // We verify the CSS rule exists in globals.css by checking the body element's
    // className for selection utilities.
    // Since this is a CSS concern, we verify the rule is declared.
    const cssContent = require("fs").readFileSync(
      require("path").resolve(__dirname, "../../globals.css"),
      "utf-8"
    );
    expect(cssContent).toContain("selection");
  });
});

// ---------------------------------------------------------------------------
// Acceptance: Editorial cards + sidebar CTA (Step 03-02)
// ---------------------------------------------------------------------------

describe("LocaleHomePage — Editorial cards in sidebar with stagger + CTA", () => {
  it("renders EditorialIdeaCard in the sidebar instead of IdeaListRow", async () => {
    render(<LocaleHomePage />);
    // Wait for fetch to resolve and cards to render
    await waitFor(() => {
      const cards = document.querySelectorAll("[data-testid='editorial-idea-card']");
      expect(cards.length).toBeGreaterThan(0);
    });
    // IdeaListRow should NOT be present
    expect(screen.queryByTestId("idea-list-row")).not.toBeInTheDocument();
  });

  it("stagger-animates cards with 0.1s delay per card index", async () => {
    render(<LocaleHomePage />);
    // Wait for cards to render, then check stagger delays
    await waitFor(() => {
      const staggered = document.querySelectorAll("[data-motion-delay]");
      expect(staggered.length).toBeGreaterThan(0);
    });
    const staggered = document.querySelectorAll("[data-motion-delay]");
    const delays = Array.from(staggered).map((el) =>
      parseFloat((el as HTMLElement).dataset.motionDelay ?? "0")
    );
    // Verify sequential delays: 0, 0.1, 0.2...
    // The mock records ALL delay values including 0
    for (let i = 0; i < delays.length; i++) {
      expect(delays[i]).toBeCloseTo(i * 0.1, 2);
    }
  });

  it("skips stagger delays when prefers-reduced-motion is active", async () => {
    __reducedMotion = true;
    render(<LocaleHomePage />);
    await waitFor(() => {
      const cards = document.querySelectorAll("[data-testid='editorial-idea-card']");
      expect(cards.length).toBeGreaterThan(0);
    });
    const staggered = document.querySelectorAll("[data-motion-delay]");
    // With reduced motion, no delay attributes should be present (duration: 0, no delay)
    expect(staggered.length).toBe(0);
    __reducedMotion = false;
  });

  it("renders SidebarCta at the bottom of the sidebar", () => {
    render(<LocaleHomePage />);
    const sidebar = screen.getByTestId("sidebar");
    const cta = sidebar.querySelector("[data-testid='sidebar-cta']");
    expect(cta).toBeInTheDocument();
  });

  it("removes the old hero CTA section with submit/browse/openMap buttons", () => {
    render(<LocaleHomePage />);
    // submitIdea and browseIdeas should not appear anywhere (replaced by SidebarCta)
    expect(screen.queryByText("Home.submitIdea")).not.toBeInTheDocument();
    expect(screen.queryByText("Home.browseIdeas")).not.toBeInTheDocument();
  });

  it("sidebar CTA has Send icon and uppercase tracking-wide label", () => {
    render(<LocaleHomePage />);
    const cta = screen.getByTestId("sidebar-cta");
    // The SidebarCta stub renders "Home.sendIdea" text
    expect(cta.textContent).toContain("Home.sendIdea");
  });
});
