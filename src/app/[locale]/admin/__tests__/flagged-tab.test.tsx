/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Polyfill requestAnimationFrame for jsdom - execute synchronously to avoid timing issues
const originalRAF = globalThis.requestAnimationFrame;
beforeEach(() => {
  globalThis.requestAnimationFrame = (cb: FrameRequestCallback) => {
    cb(0);
    return 0;
  };
});
afterEach(() => {
  if (originalRAF) {
    globalThis.requestAnimationFrame = originalRAF;
  } else {
    delete (globalThis as Record<string, unknown>).requestAnimationFrame;
  }
});

const mockT = (namespace: string) => (key: string, params?: Record<string, unknown>) => {
  if (key === "flaggedCount" && params?.count !== undefined) {
    return String(params.count);
  }
  return `${namespace}.${key}`;
};

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => mockT(namespace),
  useLocale: () => "en",
}));

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const { src, alt, ...rest } = props;
    return require("react").createElement("img", { src: String(src ?? ""), alt: String(alt ?? ""), ...rest });
  },
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, ...props }: { children: React.ReactNode; href: string }) => (
    <a {...props}>{children}</a>
  ),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/home-stats", () => ({
  computeCompletedCount: () => 0,
  resolveZeroState: () => "noIdeasYet",
}));

const flaggedCommentsData = [
  {
    id: "c1",
    text: "Offensive comment text",
    status: "FLAGGED",
    ideaId: "idea-1",
    ideaTitle: "Fix the park",
    flaggedCategories: ["hate", "harassment"],
    createdAt: "2026-05-17T10:00:00Z",
  },
  {
    id: "c2",
    text: "Spam comment",
    status: "FLAGGED",
    ideaId: "idea-2",
    ideaTitle: "New traffic lights",
    flaggedCategories: ["spam"],
    createdAt: "2026-05-16T08:00:00Z",
  },
];

describe("Admin Flagged Tab", () => {
  let AdminPage: React.ComponentType;

  beforeEach(async () => {
    localStorage.clear();
    const mod = await import("../page");
    AdminPage = mod.default;
  });

  it("renders the Flagged tab button alongside other tabs", async () => {
    localStorage.setItem("admin-secret", "test-secret");
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      if (typeof url === "string" && url.includes("/api/admin/comments/flagged")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ comments: [], count: 0 }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ ideas: [] }),
      } as Response);
    });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText("Admin.flaggedTab")).toBeInTheDocument();
    });
    expect(screen.getByText("Admin.ideasTab")).toBeInTheDocument();
    expect(screen.getByText("Admin.commentsTab")).toBeInTheDocument();
  });

  it("displays flagged count badge when there are flagged comments", async () => {
    localStorage.setItem("admin-secret", "test-secret");
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      if (typeof url === "string" && url.includes("/api/admin/comments/flagged")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ comments: flaggedCommentsData, count: 2 }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ ideas: [] }),
      } as Response);
    });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  it("shows flagged comments with idea title and categories when tab is active", async () => {
    localStorage.setItem("admin-secret", "test-secret");
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      if (typeof url === "string" && url.includes("/api/admin/comments/flagged")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ comments: flaggedCommentsData, count: 2 }),
        } as Response);
      }
      if (typeof url === "string" && url.includes("/api/ideas")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ideas: [] }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);
    });

    render(<AdminPage />);

    const flaggedTab = await screen.findByText("Admin.flaggedTab");
    await userEvent.setup().click(flaggedTab);

    await waitFor(() => {
      expect(screen.getByText("Offensive comment text")).toBeInTheDocument();
    });
    expect(screen.getByText(/Fix the park/)).toBeInTheDocument();
    expect(screen.getByText(/hate, harassment/)).toBeInTheDocument();
    expect(screen.getByText("Spam comment")).toBeInTheDocument();
    expect(screen.getByText(/New traffic lights/)).toBeInTheDocument();
  });

  it("shows Approve and Hide action buttons when action is triggered", async () => {
    localStorage.setItem("admin-secret", "test-secret");
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      if (typeof url === "string" && url.includes("/api/admin/comments/flagged")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ comments: [flaggedCommentsData[0]], count: 1 }),
        } as Response);
      }
      if (typeof url === "string" && url.includes("/api/ideas")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ideas: [] }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);
    });

    render(<AdminPage />);

    const flaggedTab = await screen.findByText("Admin.flaggedTab");
    await userEvent.setup().click(flaggedTab);

    await waitFor(() => {
      expect(screen.getByText("Offensive comment text")).toBeInTheDocument();
    });

    // The action button shows "Admin.flaggedApprove / Admin.flaggedHide"
    const actionButton = screen.getByRole("button", { name: /Admin\.flaggedApprove/ });
    await userEvent.setup().click(actionButton);

    // After clicking, separate Approve and Hide buttons appear
    await waitFor(() => {
      expect(screen.getAllByText("Admin.flaggedApprove").length).toBeGreaterThanOrEqual(1);
    });
    expect(screen.getByText("Admin.flaggedHide")).toBeInTheDocument();
  });

  it("removes comment from list after approve action", async () => {
    localStorage.setItem("admin-secret", "test-secret");
    let approved = false;
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      if (typeof url === "string" && url.includes("/api/admin/comments/flagged")) {
        // Return data until after the approve action, then empty
        if (!approved) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ comments: [flaggedCommentsData[0]], count: 1 }),
          } as Response);
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ comments: [], count: 0 }),
        } as Response);
      }
      if (typeof url === "string" && url.includes("/api/admin/comments/c1")) {
        approved = true;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ id: "c1", status: "VISIBLE" }),
        } as Response);
      }
      if (typeof url === "string" && url.includes("/api/ideas")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ideas: [] }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);
    });

    render(<AdminPage />);

    const flaggedTab = await screen.findByText("Admin.flaggedTab");
    await userEvent.setup().click(flaggedTab);

    await waitFor(() => {
      expect(screen.getByText("Offensive comment text")).toBeInTheDocument();
    });

    // Click the combined Approve/Hide action button
    const actionButton = screen.getByRole("button", { name: /Admin\.flaggedApprove/ });
    await userEvent.setup().click(actionButton);

    const reasonInput = await screen.findByLabelText("Admin.moderationReasonLabel");
    await userEvent.setup().type(reasonInput, "Looks fine");

    // Find and click the confirm Approve button (the one in the inline form)
    await waitFor(() => {
      const approveBtns = screen.getAllByText("Admin.flaggedApprove");
      const confirmBtn = approveBtns.find(
        (b) => b.closest("button") && !b.closest("button")?.disabled
      );
      expect(confirmBtn).toBeTruthy();
    });

    const approveBtns = screen.getAllByText("Admin.flaggedApprove");
    const confirmBtn = approveBtns.find(
      (b) => b.closest("button") && !b.closest("button")?.disabled
    );
    if (confirmBtn) {
      await userEvent.setup().click(confirmBtn);
    }

    await waitFor(() => {
      expect(screen.getByText("Admin.flaggedNoItems")).toBeInTheDocument();
    });
  });

  it("shows empty state message when no flagged comments exist", async () => {
    localStorage.setItem("admin-secret", "test-secret");
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      if (typeof url === "string" && url.includes("/api/admin/comments/flagged")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ comments: [], count: 0 }),
        } as Response);
      }
      if (typeof url === "string" && url.includes("/api/ideas")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ideas: [] }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);
    });

    render(<AdminPage />);

    const flaggedTab = await screen.findByText("Admin.flaggedTab");
    await userEvent.setup().click(flaggedTab);

    await waitFor(() => {
      expect(screen.getByText("Admin.flaggedNoItems")).toBeInTheDocument();
    });
  });
});
