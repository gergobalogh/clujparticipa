/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";

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

describe("Header — Editorial typographic styles (Step 02-02)", () => {
  it("nav labels use text-[11px] font-bold tracking-widest uppercase style", () => {
    render(<Header />);

    const navLinks = screen.getAllByRole("link").filter(
      (link) => link.textContent && ["Navigation.home", "Navigation.ideas", "Navigation.map"].includes(link.textContent)
    );

    expect(navLinks.length).toBeGreaterThanOrEqual(3);

    for (const link of navLinks) {
      const classList = link.className;
      expect(classList).toContain("text-[11px]");
      expect(classList).toContain("font-bold");
      expect(classList).toContain("tracking-widest");
      expect(classList).toContain("uppercase");
    }
  });
});
