/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";

const { trackEventMock } = vi.hoisted(() => ({
  trackEventMock: vi.fn(),
}));

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => (key: string) => `${namespace}.${key}`,
}));

vi.mock("@/components/ideas/idea-list-row", () => ({
  IdeaListRow: ({ title }: { title: string }) => <div>{title}</div>,
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: trackEventMock,
}));

import IdeasPage from "../page";

describe("IdeasPage analytics", () => {
  beforeEach(() => {
    trackEventMock.mockClear();
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ ideas: [] }),
      })
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("tracks category, district, and status filter changes", async () => {
    const user = userEvent.setup();
    render(<IdeasPage />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    await user.selectOptions(screen.getByLabelText("Ideas.filterCategory"), "INFRASTRUCTURE");
    await user.selectOptions(screen.getByLabelText("Ideas.filterDistrict"), "MANASTUR");
    await user.selectOptions(screen.getByLabelText("Ideas.filterStatus"), "SUBMITTED");

    expect(trackEventMock).toHaveBeenCalledWith("filter_change", {
      filter: "category",
      value: "INFRASTRUCTURE",
    });
    expect(trackEventMock).toHaveBeenCalledWith("filter_change", {
      filter: "district",
      value: "MANASTUR",
    });
    expect(trackEventMock).toHaveBeenCalledWith("filter_change", {
      filter: "status",
      value: "SUBMITTED",
    });
  });
});
