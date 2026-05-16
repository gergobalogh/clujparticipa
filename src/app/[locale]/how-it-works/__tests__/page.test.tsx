/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// --- Mocks ---

// next-intl: return namespace.key for all translation calls (used by HowItWorksContent internally)
vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) =>
    `${namespace}.${key}`,
}));

// next-intl/server: provide getTranslations for metadata generation
vi.mock("next-intl/server", () => ({
  getTranslations: (namespace: string) =>
    Promise.resolve((key: string) => `${namespace}.${key}`),
}));

// HowItWorksContent: boundary mock — the page shell is the unit under test,
// not the client component's internal behavior
vi.mock("@/components/ideas/how-it-works-content", () => ({
  HowItWorksContent: () => (
    <main
      className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8"
      data-testid="how-it-works-content"
    >
      <h1>HowItWorks.title</h1>
    </main>
  ),
}));

// --- Component under test ---
import HowItWorksPage, { generateMetadata } from "../page";

// ---------------------------------------------------------------------------
// Acceptance: Page renders HowItWorksContent with correct structure
// ---------------------------------------------------------------------------

describe("HowItWorksPage", () => {
  it("renders the HowItWorksContent client component", () => {
    render(<HowItWorksPage />);
    expect(screen.getByTestId("how-it-works-content")).toBeInTheDocument();
  });

  it("is a server component (no 'use client' directive in source)", () => {
    const source = readFileSync(
      resolve(__dirname, "../page.tsx"),
      "utf-8",
    );
    expect(source).not.toMatch(/"use client"/);
    expect(source).not.toMatch(/'use client'/);
  });

  it("renders the redesigned centered layout via HowItWorksContent", () => {
    const { container } = render(<HowItWorksPage />);
    const main = container.querySelector("main");
    expect(main).toBeInTheDocument();
    expect(main?.className).toContain("max-w-5xl");
  });

  it("exports a generateMetadata function for SEO", () => {
    expect(generateMetadata).toBeDefined();
    expect(typeof generateMetadata).toBe("function");
  });

  it("generateMetadata returns title and description for SEO", async () => {
    const metadata = await generateMetadata();
    expect(metadata).toHaveProperty("title");
    expect(metadata).toHaveProperty("description");
  });
});
