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

## US-02: Custom event tracking for key actions

**As an operator**, I want key user actions (submit idea, vote, comment, filter, sign in) tracked as named events, so I can build funnels and see where users drop off in the engagement journey.

**Job trace**: JOB-002 (diagnose drop-off), JOB-003 (validate feature value)

### Acceptance criteria
- [ ] A `trackEvent(name, payload?)` helper exists in `src/lib/analytics.ts`
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

## US-03: Analytics configuration via environment variables

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
