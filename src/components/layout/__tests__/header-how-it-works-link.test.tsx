/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// --- Mocks ---

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) =>
    `${namespace}.${key}`,
  useLocale: () => "ro",
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, ...props }: { children: React.ReactNode; href: string }) => (
    <a {...props}>{children}</a>
  ),
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn() }),
}));

// Session/Auth stub
vi.mock("@/components/auth/session-provider", () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// UserMenu stub
vi.mock("../user-menu", () => ({
  UserMenu: () => <div data-testid="user-menu" />,
}));

// fetch stub for voting config
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ config: null }),
  } as Response)
);

// --- Component under test ---
import { Header } from "../header";
import { Footer } from "../footer";

describe("How it works link appears in header, footer, and idea detail (Step 02-03)", () => {
  it("header nav includes a 'How it works' link pointing to /how-it-works", () => {
    render(<Header />);

    const howItWorksLink = screen.getAllByRole("link").find(
      (link) => link.textContent === "Navigation.howItWorks"
    );

    expect(howItWorksLink).toBeDefined();
    expect(howItWorksLink!.getAttribute("href")).toBe("/how-it-works");
  });

  it("header renders 'How it works' link in both desktop and mobile nav", () => {
    render(<Header />);

    // Desktop nav shows the link
    const desktopLinks = screen.getAllByRole("link").filter(
      (link) => link.textContent === "Navigation.howItWorks"
    );
    expect(desktopLinks.length).toBeGreaterThanOrEqual(1);

    // Open mobile menu
    const menuButton = screen.getByRole("button", { name: "Toggle menu" });
    fireEvent.click(menuButton);

    // After opening mobile menu, the link should appear in mobile nav too
    const allLinks = screen.getAllByRole("link").filter(
      (link) => link.textContent === "Navigation.howItWorks"
    );
    expect(allLinks.length).toBeGreaterThanOrEqual(2);
  });

  it("footer includes a 'How it works' link pointing to /how-it-works", () => {
    render(<Footer />);

    const howItWorksLink = screen.getAllByRole("link").find(
      (link) => link.textContent === "Footer.howItWorks"
    );

    expect(howItWorksLink).toBeDefined();
    expect(howItWorksLink!.getAttribute("href")).toBe("/how-it-works");
  });

  it("existing nav items (Home, Ideas, Map) still render in header", () => {
    render(<Header />);

    const navTexts = screen.getAllByRole("link").map((l) => l.textContent);

    expect(navTexts).toContain("Navigation.home");
    expect(navTexts).toContain("Navigation.ideas");
    expect(navTexts).toContain("Navigation.map");
  });

  it("i18n keys for howItWorks and learnAboutProcess exist in all 3 locale files", async () => {
    const locales = ["en", "ro", "hu"] as const;

    for (const locale of locales) {
      const messages = await import(`@/i18n/messages/${locale}.json`);

      // Navigation namespace
      expect(messages.Navigation.howItWorks).toBeDefined();
      expect(typeof messages.Navigation.howItWorks).toBe("string");

      // Footer namespace
      expect(messages.Footer.howItWorks).toBeDefined();
      expect(typeof messages.Footer.howItWorks).toBe("string");

      // IdeaDetail namespace
      expect(messages.IdeaDetail.learnAboutProcess).toBeDefined();
      expect(typeof messages.IdeaDetail.learnAboutProcess).toBe("string");
    }
  });
});
