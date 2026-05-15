/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import React from "react";
import fs from "fs";
import path from "path";

// --- Mocks ---

vi.mock("next-intl", () => ({
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock("next-intl/server", () => ({
  getMessages: () => Promise.resolve({}),
  setRequestLocale: () => {},
}));

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
  RedirectType: { push: 0, replace: 1 },
}));

vi.mock("next/script", () => ({
  default: () => null,
}));

// Track which fonts are requested and their CSS variable assignments
const fontCalls: Array<{ name: string; variable: string; weight?: string[]; style?: string[] }> = [];

// Create a mock factory that tracks calls
function createFontMock(name: string) {
  return (options: { variable: string; weight?: string[]; style?: string[]; subsets?: string[] }) => {
    fontCalls.push({ name, variable: options.variable, weight: options.weight, style: options.style });
    return {
      variable: options.variable,
      className: `font-${name.toLowerCase().replace(/_/g, "-")}`,
    };
  };
}

// Mock next/font/google with all named exports that layout.tsx might use
vi.mock("next/font/google", () => ({
  Playfair_Display: createFontMock("Playfair_Display"),
  Inter: createFontMock("Inter"),
  Geist: createFontMock("Geist"),
  Geist_Mono: createFontMock("Geist_Mono"),
  Source_Serif_4: createFontMock("Source_Serif_4"),
}));

vi.mock("@/components/auth/session-provider", () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock("@/components/layout/header", () => ({
  Header: () => <header data-testid="header" />,
}));

vi.mock("@/components/layout/footer", () => ({
  Footer: () => <footer data-testid="footer" />,
}));

vi.mock("@/i18n/routing", () => ({
  isAppLocale: (locale: string) => ["ro", "hu", "en"].includes(locale),
  locales: ["ro", "hu", "en"],
}));

// --- Tests ---

describe("LocaleLayout -- Font wiring (Step 02-01)", () => {
  let LocaleLayout: React.ComponentType<{
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
  }>;

  beforeAll(async () => {
    const mod = await import("../layout");
    LocaleLayout = mod.default;
  });

  it("registers Playfair_Display font with --font-playfair variable", () => {
    const playfair = fontCalls.find((c) => c.name === "Playfair_Display");
    expect(playfair).toBeDefined();
    expect(playfair!.variable).toBe("--font-playfair");
  });

  it("registers Playfair_Display with weights 400 and 700", () => {
    const playfair = fontCalls.find((c) => c.name === "Playfair_Display");
    expect(playfair).toBeDefined();
    expect(playfair!.weight).toContain("400");
    expect(playfair!.weight).toContain("700");
  });

  it("registers Playfair_Display with italic style", () => {
    const playfair = fontCalls.find((c) => c.name === "Playfair_Display");
    expect(playfair).toBeDefined();
    expect(playfair!.style).toContain("italic");
  });

  it("registers Inter font with --font-inter variable", () => {
    const inter = fontCalls.find((c) => c.name === "Inter");
    expect(inter).toBeDefined();
    expect(inter!.variable).toBe("--font-inter");
  });

  it("registers Inter with weight range 400-800", () => {
    const inter = fontCalls.find((c) => c.name === "Inter");
    expect(inter).toBeDefined();
    expect(inter!.weight).toContain("400");
    expect(inter!.weight).toContain("800");
  });

  it("does NOT register Source_Serif_4", () => {
    const sourceSerif = fontCalls.find((c) => c.name === "Source_Serif_4");
    expect(sourceSerif).toBeUndefined();
  });

  it("does NOT register Geist sans", () => {
    const geist = fontCalls.find((c) => c.name === "Geist");
    expect(geist).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Acceptance: CSS variable wiring in globals.css
// ---------------------------------------------------------------------------

describe("globals.css -- Font CSS variable wiring (Step 02-01)", () => {
  const globalsPath = path.resolve(__dirname, "../../globals.css");
  let cssContent: string;

  beforeAll(() => {
    cssContent = fs.readFileSync(globalsPath, "utf-8");
  });

  it("wires --font-sans to --font-inter (Inter) in @theme inline", () => {
    // The @theme inline block should set --font-sans: var(--font-inter);
    expect(cssContent).toMatch(/--font-sans:\s*var\(--font-inter\)/);
  });

  it("wires --font-serif to --font-playfair (Playfair Display) in @theme inline", () => {
    // The @theme inline block should set --font-serif: var(--font-playfair);
    expect(cssContent).toMatch(/--font-serif:\s*var\(--font-playfair\)/);
  });

  it("does NOT reference --font-geist-sans in @theme inline", () => {
    expect(cssContent).not.toMatch(/--font-sans:\s*var\(--font-geist-sans\)/);
  });

  it("does NOT reference --font-source-serif in @theme inline", () => {
    expect(cssContent).not.toMatch(/--font-serif:\s*var\(--font-source-serif\)/);
  });
});
