# Feature Delta — umami-analytics

## Wave: DISCUSS / [REF] Persona ID

| Persona | Role | Key trait |
|---------|------|-----------|
| Operator | Product owner/developer | Needs data to diagnose UX problems and validate feature decisions |
| maria-manasur | Engaged Resident | Package-tracker mental model, anxious when can't see progress, cares about privacy |
| ion-curious | Curious Newcomer | Skeptical of civic tools, won't engage if platform feels surveilled |

## Wave: DISCUSS / [WHY] Persona Narrative

### Operator (product owner / developer)

**Goals**: Know which pages users visit and which they ignore. Identify the exact step where users abandon the submission/voting journey. Prove that feature investments (editorial redesign, pipeline track) changed behavior. Catch trust-eroding UX problems before they cause abandonment.

**Frustrations**: No analytics at all — every UX decision is a guess. Cannot tell if the editorial redesign improved engagement. Rely on one-off user complaints instead of systemic data. Cannot show coalition partners evidence of platform health.

**Mental model**: Treats analytics like a diagnostic tool — find the problem, measure the fix. Doesn't need dashboards for vanity metrics; needs actionable signals about where the UX breaks.

**Vocabulary**: pageview → "how many people visited", funnel → "where do they drop off", event → "what did they click", bounce rate → "left without doing anything"

**Analytics relationship**: Primary consumer. Will check Umami dashboard weekly and after every feature launch. Needs the data to be trustworthy (not inflated by bots or internal traffic) and the event taxonomy to be predictable (can add events without reading docs).

### Maria (Engaged Resident, Manastur)

**Goals**: Report the broken sidewalk near the school. Know if anyone is looking at it. Feel like it wasn't a waste of time.

**Frustrations**: Posted on Facebook last year, nothing happened. City hall website has no feedback mechanism. Doesn't want to create another account.

**Mental model**: Package tracker — submit and follow. Expects to see stages. Gets anxious when stages don't move.

**Privacy stance**: Will accept tracking if it's clearly explained and doesn't feel invasive. The Umami model (no cookies, no PII) matches her expectation of "honest government tools." Won't read a long privacy policy — needs 1-sentence notice + Accept/Decline.

**Vocabulary**: idea → "proposal", status → "what's happening with it", pipeline → "where it is in the process", support → "backing"

**Analytics relationship**: Data subject. Her behavior is tracked. She needs to trust the tracking is minimal and honest, or she'll disengage — not because she's anti-technology, but because civic surveillance has real historical weight in Romania.

### Ion (Curious Newcomer, Gheorgheni)

**Goals**: Understand what this platform does in 30 seconds. See evidence that it works (completed projects). Find ideas from their district.

**Frustrations**: Doesn't trust online civic tools — usually just politics or performance. Doesn't want to register for anything. Doesn't read Romanian well — prefers Hungarian.

**Mental model**: Treats the platform like a petition site — skeptical, wants proof of impact before participating. Won't submit unless they see that others' ideas got results.

**Privacy stance**: Highly suspicious of any tracking on civic sites. Default assumption is surveillance. Will likely decline consent on first visit. The consent gate itself is a trust signal — if the platform is upfront about tracking, it's more trustworthy than one that tracks silently.

**Vocabulary**: idea → "suggestion", status → "is anything happening", vote → "support"

**Analytics relationship**: Most likely to decline consent. Even if he declines, the fact that he was asked builds trust. May accept later after returning and seeing the platform is legitimate. His consent decision is itself a trust indicator — a high decline rate signals a trust problem that analytics can help diagnose.

## Wave: DISCUSS / [REF] JTBD One-Liner

- **JOB-002**: When I see few ideas being submitted or users leaving without acting, I want to see exactly where they drop off, so I can fix the broken step before more users lose trust.
- **JOB-003**: When I invest effort in a new feature, I want to measure whether it actually changes behavior, so I can double down on what works and cut what doesn't.
- **JOB-004**: When I visit a civic participation site, I want to know that my behavior isn't being sold or profiled, so I can engage honestly without feeling surveilled.
- **JOB-005**: When I return to the platform after weeks away, I want to see evidence that things are happening, so I feel my participation matters.

## Wave: DISCUSS / [REF] Locked Decisions

- **[D1] Umami (self-hosted)**: Privacy-first, cookieless, no PII, open-source. Aligns with civic platform values. Alternatives (GA, Plausible cloud) rejected: GA is not privacy-friendly; Plausible cloud is SaaS-dependent.
- **[D2] Consent as hard gate**: Tracking MUST NOT fire without explicit consent. Not "opt-out after tracking starts." Enforced technically (script conditional on localStorage value).
- **[D3] Non-modal bottom bar for consent**: Never blocks content, dismissable, no cookie-wall. Tested against: full-page overlay (rejected — gates content), footer text only (rejected — not prominent enough for first-time visitors).
- **[D4] Event taxonomy (6 initial events)**: idea_submit, idea_vote, comment_add, filter_change, sign_in, notification_opt_in. Expandable by adding to taxonomy and calling trackEvent().
- **[D5] Environment-variable-driven config**: NEXT_PUBLIC_UMAMI_URL + NEXT_PUBLIC_UMAMI_WEBSITE_ID. Switch backends without code changes.

## Wave: DISCUSS / [REF] User Stories

### US-01: Umami pageview tracking
**As an operator**, I want pageviews collected from every page, so I can see which pages users visit and where they spend time.
**Job**: JOB-002

#### Elevator Pitch
Before: I cannot see which pages users visit or how they navigate the platform.
After: open Umami dashboard → sees pageviews per route with locale prefixes and time-on-page metrics.
Decision enabled: I can identify which pages are most/least visited and where to focus improvement effort.

**ACs**:
- Umami script loaded in root layout via `<Script strategy="afterInteractive">`
- URL + Website ID from env vars; missing vars = no script rendered
- Any `/{locale}/*` route records pageview within 10s
- Page URLs include locale prefix
- Script adds <100ms to page load

### US-02: Privacy consent notice
**As a resident**, I want a clear notice about analytics tracking on first visit, so I can make an informed choice.
**Job**: JOB-004

#### Elevator Pitch
Before: I visit the site and have no idea if my browsing is being tracked.
After: visit site → see bottom bar "Privacy-friendly analytics. No personal data collected." → click Accept or Decline → tracking respects my choice.
Decision enabled: I can choose whether to participate in analytics without losing any platform functionality.

**ACs**:
- Bottom bar on first visit (no localStorage key): privacy text + Accept/Decline
- Accept → stores "accepted", enables tracking
- Decline or scroll-past → stores "declined", no tracking
- Does not block or gate any page content
- Choice remembered across visits
- All strings from locale files

### US-03: Consent-gated tracking
**As a resident**, I want tracking to only fire when I have consented, so my behavior is not collected without my knowledge.
**Job**: JOB-004

#### Elevator Pitch
Before: I worry that declining consent doesn't actually stop tracking.
After: decline consent → open devtools Network tab → navigate 3 pages → see zero requests to the analytics server.
Decision enabled: I can trust that my privacy choice is technically enforced, not just a UI promise.

**ACs**:
- Umami script only loads when consent = "accepted"
- Declined/absent = zero network requests to Umami server
- Accepting consent loads script dynamically without page reload
- Declining after accepting stops future events (existing data retained)

### US-04: Custom event tracking
**As an operator**, I want key user actions tracked as named events, so I can build funnels and see where users drop off.
**Job**: JOB-002, JOB-003

#### Elevator Pitch
Before: I can see pageviews but not what users DO — I don't know if they vote, comment, or just read.
After: submit an idea → check Umami Events tab → see `idea_submit` with category and district data.
Decision enabled: I can build a funnel from landing → submit → vote and identify the exact drop-off step.

**ACs**:
- `trackEvent(name, payload?)` helper in `src/lib/analytics.ts`
- Consent check before firing — no events without consent
- No-op when Umami not loaded (graceful)
- 6 initial events: idea_submit, idea_vote, comment_add, filter_change, sign_in, notification_opt_in
- Events appear in Umami within 10s
- Adding new event = add name + call trackEvent (no architecture change)

### US-05: Privacy page consent management
**As a resident**, I want to see and change my consent status from the privacy page, so I'm not locked into a first-visit choice.
**Job**: JOB-004

#### Elevator Pitch
Before: I accepted analytics on first visit but now want to opt out — no way to change.
After: visit `/privacy` → see "Analytics: accepted" → click "Decline" → tracking stops immediately.
Decision enabled: I can change my mind about analytics at any time without contacting support.

**ACs**:
- Privacy page shows consent status with toggle
- Toggle updates localStorage + enables/disables tracking immediately
- consent_changed event fires before new consent takes effect
- Uses locale strings

### US-06: Analytics configuration via env vars
**As an operator**, I want to configure Umami via env vars, so I can switch backends without code changes.
**Job**: JOB-002

#### Elevator Pitch
Before: I need to hardcode analytics URLs or edit source files to change the backend.
After: set NEXT_PUBLIC_UMAMI_URL + NEXT_PUBLIC_UMAMI_WEBSITE_ID in .env → restart → tracking points to new instance.
Decision enabled: I can switch analytics backends via config, not code changes.

**ACs**:
- NEXT_PUBLIC_UMAMI_URL and NEXT_PUBLIC_UMAMI_WEBSITE_ID documented in .env.example
- Missing vars = script not rendered (graceful)
- Comments in .env.example explain each variable

## Wave: DISCUSS / [REF] Definition of Done

- [x] JTBD analysis complete — 4 jobs in job story format
- [x] Job dimensions identified — functional/emotional/social per job
- [x] Four forces mapped per job — push/pull/anxiety/habit
- [x] Opportunity scores produced — JOB-002 highest at 81
- [x] UX journey maps with emotional arcs — 2 journeys (operator, resident)
- [x] Every journey maps to at least one job
- [x] Discovery complete — mental models understood
- [x] Happy path defined — all steps with expected outputs
- [x] Emotional arc coherent — confidence builds progressively
- [x] Shared artifacts tracked — every variable has single source
- [x] Story map with carpaccio slices — 4 slices, ≤1 day each, taste tests pass
- [x] Outcome KPIs defined with measurable targets
- [x] Every user story traces to a job
- [x] All acceptance criteria testable
- [x] DoR passed — 9/9 items validated

## Wave: DISCUSS / [REF] Out of Scope

- Umami goals/funnels dashboard configuration (manual in Umami UI, not code)
- Admin action tracking (admin panel is internal, low priority)
- Error event tracking (form validation failures, API errors)
- Map interaction events (pin click, hover — can be added later)
- Comment reply tracking (subset of comment_add, defer)
- A/B testing via Umami (use Umami's built-in feature later, not code)
- Real-time activity indicators on the platform (JOB-005 — consume analytics data, separate feature)
- Umami Cloud vs self-hosted decision (implementation supports both via env vars)

## Wave: DISCUSS / [REF] WS Strategy

**Strategy B** (brownfield, evaluate existing): Project has existing layout, locale system, and privacy page. Walking skeleton = 4 slices that layer onto existing structure. No need for Strategy A (greenfield) or Strategy D (configurable env-switching — env vars already handle this).

## Wave: DISCUSS / [REF] Driving Ports

| Port | Type | Description |
|------|------|-------------|
| Browser → Umami script | Inbound | Pageviews and custom events via `<script>` + `umami.track()` |
| Consent component → localStorage | Inbound | User consent choice stored and read |
| `trackEvent()` → Umami | Inbound | Custom events gated by consent |
| Privacy page → Consent context | Inbound | User changes consent choice |

## Wave: DISCUSS / [REF] Pre-requisites

- Existing Next.js layout at `src/app/[locale]/layout.tsx` (exists)
- Existing privacy page at `src/app/[locale]/privacy/page.tsx` (exists)
- Locale files at `src/i18n/messages/{ro,hu,en}.json` (exist)
- Umami server deployed and accessible (operator responsibility, not code)
