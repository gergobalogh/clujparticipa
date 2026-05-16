# Story Map — umami-analytics

## Backbone (user activities, left to right)

```
┌─────────────┐  ┌──────────────┐  ┌────────────────┐  ┌───────────────┐
│  Deploy      │  │  Consent     │  │  Track         │  │  Use Data     │
│  Umami       │  │  Gate        │  │  Events        │  │               │
└─────────────┘  └──────────────┘  └────────────────┘  └───────────────┘
```

## Walking skeleton slice

**"Pageviews flow, consent respected"**: Deploy Umami → Add script to layout → Show consent notice → Pageviews appear in dashboard → Vote button click tracked as first custom event.

This proves: infrastructure works, consent gates tracking, custom events fire.

## Slices (elephant carpaccio, ≤1 day each)

### Slice 01: Umami server + script load
- **Goal**: Umami runs and pageviews are collected
- **IN scope**: Deploy Umami (self-hosted Docker or cloud), add `NEXT_PUBLIC_UMAMI_*` env vars, load tracking script in root layout
- **OUT scope**: Consent gate, custom events, consent notice UI
- **Learning hypothesis**: Disproves "Umami is hard to self-host" if deploy fails; confirms pageview collection works end-to-end
- **Effort**: ~4 hours
- **Dogfood**: Operator opens dashboard and sees their own pageviews

### Slice 02: Consent notice + gate
- **Goal**: Users see a privacy notice and can opt in/out; tracking is gated by consent
- **IN scope**: Consent banner component (non-modal bottom bar), localStorage persistence, script conditional on consent, privacy page shows consent status
- **OUT scope**: Custom events, Umami goals/funnels configuration
- **Learning hypothesis**: Disproves "consent banner will hurt engagement" if opt-in rate is >60%; confirms consent gate actually blocks tracking when declined
- **Effort**: ~5 hours
- **Dogfood**: Operator declines consent, checks Umami — their own pageview should NOT appear

### Slice 03: Page-level custom events
- **Goal**: Key user actions are tracked as named events in Umami
- **IN scope**: `trackEvent()` helper, event taxonomy (idea_submit, idea_vote, comment_add, filter_change, sign_in), instrument top 6 user-facing pages
- **OUT scope**: Funnel configuration in Umami dashboard, admin event tracking
- **Learning hypothesis**: Disproves "custom events are noisy" if events are distinguishable in dashboard; confirms event naming convention is maintainable
- **Effort**: ~6 hours
- **Dogfood**: Operator submits an idea, votes on it, checks Umami events tab

### Slice 04: Consent persistence + privacy page toggle
- **Goal**: Residents can change their consent choice from the privacy page; consent survives page navigation
- **IN scope**: Privacy page consent toggle, consent state context provider (React context), consent re-evaluation on change
- **OUT scope**: Funnel/goals configuration, new events
- **Learning hypothesis**: Disproves "users never revisit consent" if privacy page sees toggle usage; confirms consent state is reactive (enables/disables tracking live)
- **Effort**: ~4 hours
- **Dogfood**: Operator accepts consent, toggles to decline on privacy page, confirms tracking stops

## Taste tests

| Test | Result |
|------|--------|
| Any slice ships 4+ new components? | No — max 2 new components per slice (consent banner + context provider). PASS |
| Every slice depends on a new abstraction? | No — slice 01 has no new abstractions, slice 02 introduces consent state (minimal), slice 03 adds trackEvent helper. PASS |
| No slice disproves any pre-commitment? | Slice 02 disproves "consent hurts engagement" — named hypothesis. Slice 03 disproves "events are too noisy". PASS |
| Any slice uses only synthetic data? | No — all slices use production pageviews and real user interactions. PASS |
| 2+ slices identical except for scale? | No — each slice adds a distinct capability. PASS |
