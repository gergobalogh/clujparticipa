import { describe, it, expect, vi, beforeEach } from "vitest";

// This test verifies the "idea_share" extension to AnalyticsEventName.
// Once the type is extended, trackEvent("idea_share", {...}) should compile and fire.

describe("Analytics — idea_share event", () => {
  beforeEach(() => {
    vi.stubGlobal("umami", { track: vi.fn() });
  });

  it("trackEvent accepts 'idea_share' as an event name", async () => {
    // Dynamic import to pick up type changes after extension
    const { trackEvent } = await import("@/lib/analytics");
    trackEvent("idea_share", { channel: "copy", ideaId: "idea-1" });
    expect(window.umami!.track).toHaveBeenCalledWith("idea_share", {
      channel: "copy",
      ideaId: "idea-1",
    });
  });

  it("trackEvent accepts 'idea_share' with whatsapp channel", async () => {
    const { trackEvent } = await import("@/lib/analytics");
    trackEvent("idea_share", { channel: "whatsapp", ideaId: "idea-2" });
    expect(window.umami!.track).toHaveBeenCalledWith("idea_share", {
      channel: "whatsapp",
      ideaId: "idea-2",
    });
  });
});
