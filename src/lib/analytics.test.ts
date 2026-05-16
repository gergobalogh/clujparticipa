/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { trackEvent } from "./analytics";

describe("trackEvent", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete window.umami;
  });

  it("calls Umami with an event name and payload", () => {
    const track = vi.fn();
    window.umami = { track };

    trackEvent("idea_submit", { category: "INFRASTRUCTURE", district: "CENTRU" });

    expect(track).toHaveBeenCalledWith("idea_submit", {
      category: "INFRASTRUCTURE",
      district: "CENTRU",
    });
  });

  it("calls Umami without a payload", () => {
    const track = vi.fn();
    window.umami = { track };

    trackEvent("sign_in");

    expect(track).toHaveBeenCalledWith("sign_in", undefined);
  });

  it("tracks creator link clicks with payload", () => {
    const track = vi.fn();
    window.umami = { track };

    trackEvent("creator_link_click", {
      page: "how-it-works",
      destination: "https://gergobalogh.me",
    });

    expect(track).toHaveBeenCalledWith("creator_link_click", {
      page: "how-it-works",
      destination: "https://gergobalogh.me",
    });
  });

  it("does nothing when Umami is unavailable", () => {
    expect(() => trackEvent("idea_vote", { ideaId: "idea-1" })).not.toThrow();
  });

  it("does not throw when Umami tracking fails", () => {
    window.umami = {
      track: () => {
        throw new Error("blocked");
      },
    };

    expect(() => trackEvent("filter_change", { filter: "status", value: "SUBMITTED" })).not.toThrow();
  });
});
