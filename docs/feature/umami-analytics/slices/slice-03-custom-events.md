# Slice 03: Page-Level Custom Events

## Goal
Key user actions are tracked as named events in Umami, enabling funnel analysis and behavioral insights.

## IN scope
- `trackEvent(name, payload?)` helper function in `src/lib/analytics.ts`
- Helper checks `${consentStatus}` before firing — no events without consent
- Event taxonomy (initial set):
  - `idea_submit` — idea creation form submitted successfully
  - `idea_vote` — vote/support button clicked
  - `comment_add` — comment form submitted
  - `filter_change` — any filter dropdown changed (category, district, status)
  - `sign_in` — user signs in
  - `notification_opt_in` — notification permission accepted
- Instrument these events on: home page, ideas list, idea detail, idea new
- i18n: event names are English-only (internal), no locale strings needed

## OUT scope
- Umami goals/funnels dashboard configuration (manual in Umami UI)
- Admin action tracking
- Error event tracking (form validation failures, API errors)
- Map interaction events (click pin, hover)
- Comment reply tracking (can be added later)

## Learning hypothesis
Disproves: "custom events will be too noisy to be useful" if events are clearly distinguishable in Umami's events tab.
Confirms: event naming convention is maintainable — a new developer can add an event without reading this doc.

## Acceptance criteria
- [ ] `trackEvent()` helper exists, calls Umami's `umami.track()` API when consent is accepted
- [ ] `trackEvent()` is a no-op when consent is declined or undecided — no events fire
- [ ] Submitting an idea fires `idea_submit` event with payload `{ category, district }`
- [ ] Voting on an idea fires `idea_vote` event with payload `{ ideaId }`
- [ ] Adding a comment fires `comment_add` event with payload `{ ideaId }`
- [ ] Changing a filter fires `filter_change` event with payload `{ filter: "category"|"district"|"status", value }`
- [ ] Signing in fires `sign_in` event (no payload)
- [ ] Accepting notification permission fires `notification_opt_in` event
- [ ] All events appear in Umami events tab within 10 seconds
- [ ] Helper handles Umami not loaded (ad blocker) gracefully — no console errors

## Dependencies
- Slice 01 (Umami running)
- Slice 02 (consent gate — events must respect consent)

## Effort estimate
~6 hours

## Reference class
Custom event tracking with Umami. Standard pattern: wrapper function + consent check.

## Pre-slice SPIKE
None needed — Umami's `track()` API is well-documented.
