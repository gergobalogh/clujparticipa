/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";

const { trackEventMock } = vi.hoisted(() => ({
  trackEventMock: vi.fn(),
}));

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: null }),
  signOut: vi.fn(),
}));

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) => `${namespace}.${key}`,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    children,
    href,
    onClick,
  }: {
    children: React.ReactNode;
    href: string;
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  }) => (
    <a
      href={href === "/login" ? "/ro/autentificare" : href}
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
      }}
    >
      {children}
    </a>
  ),
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: trackEventMock,
}));

import { UserMenu } from "../user-menu";

describe("UserMenu analytics", () => {
  beforeEach(() => {
    trackEventMock.mockClear();
  });

  it("links unauthenticated users to the localized login route and tracks sign_in", async () => {
    const user = userEvent.setup();
    render(<UserMenu />);

    const link = screen.getByRole("link", { name: "Auth.signIn" });
    expect(link).toHaveAttribute("href", "/ro/autentificare");

    await user.click(link);

    expect(trackEventMock).toHaveBeenCalledWith("sign_in");
  });
});
