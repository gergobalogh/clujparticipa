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
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, ...props }: { children: React.ReactNode; href: string }) => (
    <a {...props}>{children}</a>
  ),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("motion/react", () => {
  const React = require("react");
  const forwardRef = React.forwardRef;

  const motion = new Proxy(
    {},
    {
      get(_target: unknown, prop: string) {
        const htmlTags = ["button", "a", "div"];
        if (htmlTags.includes(prop)) {
          return forwardRef(
            (
              {
                children,
                className,
                whileHover,
                whileTap,
                ...rest
              }: {
                children?: React.ReactNode;
                className?: string;
                whileHover?: Record<string, unknown>;
                whileTap?: Record<string, unknown>;
                [key: string]: unknown;
              },
              ref: React.Ref<HTMLElement>
            ) => {
              return React.createElement(
                prop,
                {
                  ref,
                  className,
                  "data-while-hover": whileHover ? JSON.stringify(whileHover) : undefined,
                  "data-while-tap": whileTap ? JSON.stringify(whileTap) : undefined,
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

  return { motion };
});

// --- Component under test ---
import { SidebarCta } from "../sidebar-cta";

describe("SidebarCta", () => {
  it("renders full-width bg-ink text-paper button with mt-auto on wrapper", () => {
    const { container } = render(<SidebarCta />);
    const link = container.querySelector("a");
    expect(link).toBeInTheDocument();
    // mt-auto is on the Link wrapper to push CTA to bottom of flex sidebar
    expect(link?.className).toContain("mt-auto");
    expect(link?.className).toContain("w-full");
    const button = container.querySelector("button");
    expect(button).toBeInTheDocument();
    expect(button?.className).toContain("bg-ink");
    expect(button?.className).toContain("text-paper");
    expect(button?.className).toContain("w-full");
  });

  it("contains a Send icon", () => {
    render(<SidebarCta />);
    // The Send icon from lucide-react renders an SVG
    const button = screen.getByRole("link").querySelector("svg");
    expect(button).toBeInTheDocument();
  });

  it("has uppercase tracking-wide label from Home.sendIdea", () => {
    render(<SidebarCta />);
    const label = screen.getByText("Home.sendIdea");
    expect(label.className).toContain("uppercase");
    expect(label.className).toContain("tracking-wide");
  });

  it("links to /ideas/new", () => {
    render(<SidebarCta />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/ideas/new");
  });

  it("has motion.button with whileHover scale and whileTap scale", () => {
    const { container } = render(<SidebarCta />);
    const button = container.querySelector("button");
    const whileHover = button?.getAttribute("data-while-hover");
    const whileTap = button?.getAttribute("data-while-tap");
    expect(whileHover).toContain("1.02");
    expect(whileTap).toContain("0.98");
  });
});
