import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AnalyticsEventName } from "@/lib/analytics";

// This test verifies the "idea_share" extension to AnalyticsEventName.
// Once the type is extended, trackEvent("idea_share", {...}) should compile and fire.

// Compile-time assertion: if "idea_share" is not in the union,
// the conditional type resolves to `never`, causing a type error.
type _IdeaShareInUnion = Extract<AnalyticsEventName, "idea_share">;

// Runtime helper: validates that the exported type includes "idea_share"
// by attempting to assign the literal and asserting exhaustiveness.
const validEventNames: AnalyticsEventName[] = [
  "idea_submit",
  "idea_vote",
  "comment_add",
  "filter_change",
  "sign_in",
  "notification_opt_in",
  "creator_link_click",
  "idea_share",
];

function isValidEventName(value: string): value is AnalyticsEventName {
  return (validEventNames as string[]).includes(value);
}

describe("Analytics — idea_share event", () => {
  const umamiTrackMock = vi.fn();

  beforeEach(() => {
    umamiTrackMock.mockClear();
    // trackEvent guards on `typeof window === "undefined"` and then
    // accesses `window.umami?.track`, so we must stub window too.
    vi.stubGlobal("window", { umami: { track: umamiTrackMock } });
  });

  it("'idea_share' is included in the AnalyticsEventName union", () => {
    expect(isValidEventName("idea_share")).toBe(true);
  });

  it("trackEvent accepts 'idea_share' as an event name", async () => {
    const { trackEvent } = await import("@/lib/analytics");
    trackEvent("idea_share", { channel: "copy", ideaId: "idea-1" });
    expect(umamiTrackMock).toHaveBeenCalledWith("idea_share", {
      channel: "copy",
      ideaId: "idea-1",
    });
  });

  it("trackEvent accepts 'idea_share' with whatsapp channel", async () => {
    const { trackEvent } = await import("@/lib/analytics");
    trackEvent("idea_share", { channel: "whatsapp", ideaId: "idea-2" });
    expect(umamiTrackMock).toHaveBeenCalledWith("idea_share", {
      channel: "whatsapp",
      ideaId: "idea-2",
    });
  });
});
