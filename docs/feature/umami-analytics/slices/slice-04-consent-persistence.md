# Slice 04: Consent Persistence + Privacy Page Toggle

## Goal
Residents can change their consent choice from the privacy page. Consent state is reactive — changing consent immediately enables or disables tracking.

## IN scope
- React context provider for consent state (`AnalyticsConsentProvider`)
- Privacy page consent toggle (button that flips consent choice)
- Re-evaluation: when consent changes, Umami script is loaded/unloaded dynamically
- Consent change fires a one-time `consent_changed` event (before new consent takes effect) for the operator to see consent patterns

## OUT scope
- New custom events (using existing events from slice 03)
- Funnel/goals configuration
- Admin consent management

## Learning hypothesis
Disproves: "users never revisit consent" if privacy page sees toggle usage in Umami data.
Confirms: consent state is reactive — toggling to "declined" immediately stops tracking, toggling to "accepted" immediately starts it.

## Acceptance criteria
- [ ] `AnalyticsConsentProvider` wraps the app and provides `consent` + `setConsent()` to children
- [ ] Privacy page shows current consent status (accepted/declined) with a toggle button
- [ ] Clicking toggle on privacy page updates localStorage and the context
- [ ] Changing consent from "declined" to "accepted" loads Umami script and enables tracking
- [ ] Changing consent from "accepted" to "declined" stops all future tracking (existing session pageviews remain in Umami — this is acceptable)
- [ ] A `consent_changed` event fires in Umami before the new consent takes effect (so the operator sees the pattern)
- [ ] Consent banner on first visit uses the same `setConsent()` function as the privacy toggle

## Dependencies
- Slice 02 (consent banner + localStorage)
- Slice 03 (trackEvent helper for consent_changed event)

## Effort estimate
~4 hours

## Reference class
React context for user preferences. Standard pattern.

## Pre-slice SPIKE
None needed — loading/unloading Umami script dynamically is documented in Umami's SPA guide.
