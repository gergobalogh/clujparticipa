export type AnalyticsEventName =
  | "idea_submit"
  | "idea_vote"
  | "comment_add"
  | "filter_change"
  | "sign_in"
  | "notification_opt_in"
  | "creator_link_click"
  | "idea_share";

export type AnalyticsPayload = Record<string, string | number | boolean | null>;

declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: AnalyticsPayload) => void;
    };
  }
}

export function trackEvent(
  name: AnalyticsEventName,
  payload?: AnalyticsPayload
): void {
  if (typeof window === "undefined" || !window.umami?.track) {
    return;
  }

  try {
    window.umami.track(name, payload);
  } catch {
    // Analytics must never affect the product flow.
  }
}
