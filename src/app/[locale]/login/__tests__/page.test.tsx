/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";

const { signInMock } = vi.hoisted(() => ({
  signInMock: vi.fn(),
}));

const messages: Record<string, string> = {
  eyebrow: "Civic account",
  title: "Sign in to ClujParticipa",
  subtitle: "Use an existing account to support ideas across devices.",
  trustHeading: "What we use",
  trustText: "Only basic profile details are shared by the provider.",
  prototypeHeading: "Prototype status",
  prototypeText: "Votes remain non-binding during this pilot.",
  panelTitle: "Choose a provider",
  panelSubtitle: "OAuth only",
  googleButton: "Continue with Google",
  facebookButton: "Continue with Facebook",
  privacyNote: "No passwords are stored by ClujParticipa.",
  backHome: "Back to home",
};

vi.mock("next-auth/react", () => ({
  signIn: signInMock,
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => messages[key] ?? key,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, ...props }: { children: React.ReactNode; href: string }) => (
    <a {...props}>{children}</a>
  ),
}));

import LoginPage from "../page";

describe("LoginPage", () => {
  beforeEach(() => {
    signInMock.mockClear();
  });

  it("renders Google and Facebook OAuth buttons without account-password UI", () => {
    render(<LoginPage />);

    expect(
      screen.getByRole("button", { name: /continue with google/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /continue with facebook/i })
    ).toBeInTheDocument();

    expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/reset password/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/create account/i)).not.toBeInTheDocument();
  });

  it("starts the selected OAuth provider flow", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole("button", { name: /continue with google/i }));
    expect(signInMock).toHaveBeenCalledWith("google");

    await user.click(screen.getByRole("button", { name: /continue with facebook/i }));
    expect(signInMock).toHaveBeenCalledWith("facebook");
  });
});
