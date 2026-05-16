# User Stories — umami-analytics

---

## US-01: Umami pageview tracking

**As an operator**, I want pageviews collected from every page of the platform, so I can see which pages users visit and where they spend time.

**Job trace**: JOB-002 (diagnose drop-off)

### Acceptance criteria
- [ ] Umami tracking script is loaded in the root layout via `<Script>` with `strategy="afterInteractive"`
- [ ] Script source URL and website ID come from `NEXT_PUBLIC_UMAMI_URL` and `NEXT_PUBLIC_UMAMI_WEBSITE_ID` env vars
- [ ] If env vars are missing, the script tag is not rendered (no error thrown)
- [ ] Visiting any `/{locale}/*` route records a pageview in Umami within 10 seconds
- [ ] Page URLs in Umami include the locale prefix (e.g., `/ro/ideas`, `/hu/ideas/new`)
- [ ] Script load does not add >100ms to page load time (measured via Lighthouse)

### Elevator Pitch
Before: I cannot see which pages users visit or how they navigate the platform.
After: open Umami dashboard → sees pageviews per route with locale prefixes and time-on-page metrics.
Decision enabled: I can identify which pages are most/least visited and where to focus improvement effort.

---

## US-02: Privacy consent notice

**As a resident**, I want to see a clear, lightweight notice about analytics tracking when I first visit the platform, so I can make an informed choice about whether my browsing is tracked.

**Job trace**: JOB-004 (trust platform privacy)

### Acceptance criteria
- [ ] On first visit (no `analytics-consent` in localStorage), a bottom bar appears with: privacy text + "Accept" button + "Decline" button
- [ ] The notice states that analytics are privacy-friendly (no cookies, no PII, no cross-site tracking)
- [ ] Clicking "Accept" stores `analytics-consent: accepted` in localStorage and enables tracking
- [ ] Clicking "Decline" stores `analytics-consent: declined` in localStorage and tracking does NOT fire
- [ ] Scrolling past the notice without clicking also counts as "declined" — no tracking fires
- [ ] The notice does not block, overlay, or gate any page content — user can interact with the page immediately
- [ ] On subsequent visits, the notice does NOT reappear (choice remembered)
- [ ] All visible strings come from locale files (`ro.json`, `hu.json`, `en.json`)

### Elevator Pitch
Before: I visit the site and have no idea if my browsing is being tracked or by whom.
After: visit site → see bottom bar "We use privacy-friendly analytics. No personal data is collected." → click Accept or Decline → tracking respects my choice.
Decision enabled: I can choose whether to participate in analytics without losing any platform functionality.

---

## US-03: Consent-gated tracking

**As a resident**, I want tracking to only fire when I have given consent, so my browsing behavior is not collected without my knowledge.

**Job trace**: JOB-004 (trust platform privacy)

### Acceptance criteria
- [ ] Umami script initialization is conditional: only loads when `analytics-consent === "accepted"` in localStorage
- [ ] When consent is "declined" or absent, no network requests to the Umami server are made
- [ ] When consent changes from "declined" to "accepted" (via privacy page toggle), tracking begins immediately without page reload
- [ ] When consent changes from "accepted" to "declined", no further tracking events fire (existing data in Umami is not deleted — acceptable)
- [ ] Verify: with browser devtools Network tab open and consent = "declined", zero requests to Umami URL are observed across any page navigation

### Elevator Pitch
Before: I worry that declining consent might not actually stop tracking, or that tracking happens before I consent.
After: decline consent → open devtools Network tab → navigate to 3 pages → see zero requests to the analytics server.
Decision enabled: I can trust that my privacy choice is technically enforced, not just a UI promise.

---

## US-04: Custom event tracking for key actions

**As an operator**, I want key user actions (submit idea, vote, comment, filter, sign in) tracked as named events, so I can build funnels and see where users drop off in the engagement journey.

**Job trace**: JOB-002 (diagnose drop-off), JOB-003 (validate feature value)

### Acceptance criteria
- [ ] A `trackEvent(name, payload?)` helper exists in `src/lib/analytics.ts`
- [ ] Helper checks consent before firing — no events without `analytics-consent === "accepted"`
- [ ] Helper is a no-op when Umami script is not loaded (ad blocker, env vars missing) — no console errors
- [ ] Events are tracked using Umami's `umami.track(name, payload)` API
- [ ] Initial event taxonomy implemented:
  - `idea_submit` with payload `{ category, district }`
  - `idea_vote` with payload `{ ideaId }`
  - `comment_add` with payload `{ ideaId }`
  - `filter_change` with payload `{ filter, value }`
  - `sign_in` (no payload)
  - `notification_opt_in` (no payload)
- [ ] Events appear in Umami's "Events" tab within 10 seconds of the action
- [ ] Adding a new event requires: (1) adding the event name to the taxonomy, (2) calling `trackEvent()` — no architecture changes

### Elevator Pitch
Before: I can see pageviews but not what users DO on pages — I don't know if they vote, comment, or just read.
After: submit an idea on `/ideas/new` → check Umami Events tab → see `idea_submit` event with category and district data.
Decision enabled: I can build a funnel from landing → submit → vote and identify the exact step where users drop off.

---

## US-05: Privacy page consent management

**As a resident**, I want to see my current consent status and change it from the privacy page, so I'm not locked into a choice I made on my first visit.

**Job trace**: JOB-004 (trust platform privacy)

### Acceptance criteria
- [ ] Privacy page (`/{locale}/privacy`) shows a section: "Analytics" with current consent status (accepted/declined)
- [ ] A toggle button allows changing consent from accepted → declined or declined → accepted
- [ ] Changing consent updates localStorage and immediately enables or disables tracking
- [ ] When consent changes, a `consent_changed` event fires (so the operator can see consent patterns in Umami)
- [ ] The consent management section uses locale strings for all visible text
- [ ] If consent is changed to "accepted", the Umami script loads dynamically without page reload

### Elevator Pitch
Before: I accepted analytics on my first visit but now want to opt out — I have no way to change my choice.
After: visit `/privacy` → see "Analytics: accepted" → click "Decline" → tracking stops immediately.
Decision enabled: I can change my mind about analytics participation at any time without contacting support.

---

## US-06: Analytics configuration via environment variables

**As an operator**, I want to configure Umami connection via environment variables, so I can switch between self-hosted and cloud instances without code changes.

**Job trace**: JOB-002 (diagnose drop-off) — infrastructure prerequisite

### Acceptance criteria
- [ ] `NEXT_PUBLIC_UMAMI_URL` — base URL of the Umami instance (e.g., `https://analytics.clujparticipa.ro`)
- [ ] `NEXT_PUBLIC_UMAMI_WEBSITE_ID` — website ID from Umami dashboard
- [ ] Both env vars are documented in `.env.example`
- [ ] Missing env vars cause the tracking script to not render (graceful, no error)
- [ ] `.env.example` includes comments explaining each variable

### Elevator Pitch
Before: I need to hardcode analytics URLs or edit source files to change the analytics backend.
After: set `NEXT_PUBLIC_UMAMI_URL` and `NEXT_PUBLIC_UMAMI_WEBSITE_ID` in `.env` → restart → tracking points to the new instance.
Decision enabled: I can switch analytics backends (self-hosted ↔ cloud) via config, not code changes.
