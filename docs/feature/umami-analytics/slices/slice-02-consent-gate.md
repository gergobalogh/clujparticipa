# Slice 02: Consent Notice + Gate

## Goal
Users see a privacy notice and can opt in/out. Tracking is gated by consent. No tracking fires without user consent.

## IN scope
- Consent banner component (non-modal bottom bar, dismissable, never gates content)
- localStorage persistence of consent choice (`analytics-consent` key)
- Conditional Umami script initialization — only fires if consent = "accepted"
- Privacy page (`/{locale}/privacy`) shows current consent status
- i18n strings for consent notice (RO, HU, EN)

## OUT scope
- Custom event tracking (slice 03)
- Consent state React context (slice 04 — for now, consent is read from localStorage on mount)
- Umami goals/funnels configuration
- Admin consent (admin always tracks — internal tool)

## Learning hypothesis
Disproves: "consent banner will hurt engagement" if opt-in rate is >60%.
Confirms: consent gate actually blocks tracking when declined — no pageviews in Umami for declined users.

## Acceptance criteria
- [ ] On first visit, consent banner appears at bottom of page with short privacy text + Accept/Decline
- [ ] Clicking "Accept" stores `analytics-consent: accepted` in localStorage and enables tracking
- [ ] Clicking "Decline" stores `analytics-consent: declined` in localStorage and no tracking fires
- [ ] Dismissing by scrolling also counts as "declined" (no consent = no tracking)
- [ ] Page content is fully accessible regardless of consent choice
- [ ] Privacy page shows current consent status and a brief explanation of what is tracked
- [ ] Consent banner does not reappear on subsequent visits (choice remembered)
- [ ] All consent UI strings come from locale files — no hardcoded text

## Dependencies
- Slice 01 (Umami server + script must be running)

## Effort estimate
~5 hours

## Reference class
GDPR consent patterns for privacy-friendly analytics. Umami community examples exist.

## Pre-slice SPIKE
None needed — consent gating Umami is a well-documented pattern (load script conditionally).
