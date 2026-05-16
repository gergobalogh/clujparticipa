# Story Map — umami-analytics

## Backbone (user activities, left to right)

```
┌─────────────┐  ┌────────────────┐  ┌───────────────┐
│  Deploy      │  │  Track         │  │  Use Data     │
│  Umami       │  │  Events        │  │               │
└─────────────┘  └────────────────┘  └───────────────┘
```

## Walking skeleton slice

**"Pageviews flow, custom events fire"**: Deploy Umami → Add script to layout → Pageviews appear in dashboard → Vote button click tracked as first custom event.

This proves: infrastructure works, custom events fire.

## Slices (elephant carpaccio, ≤1 day each)

### Slice 01: Umami server + script load
- **Goal**: Umami runs and pageviews are collected
- **IN scope**: Deploy Umami (self-hosted Docker or cloud), add `NEXT_PUBLIC_UMAMI_*` env vars, load tracking script in root layout
- **OUT scope**: Custom events
- **Learning hypothesis**: Disproves "Umami is hard to self-host" if deploy fails; confirms pageview collection works end-to-end
- **Effort**: ~4 hours
- **Dogfood**: Operator opens dashboard and sees their own pageviews

### Slice 02: Page-level custom events
- **Goal**: Key user actions are tracked as named events in Umami
- **IN scope**: `trackEvent()` helper, event taxonomy (idea_submit, idea_vote, comment_add, filter_change, sign_in, notification_opt_in), instrument top 6 user-facing pages
- **OUT scope**: Funnel configuration in Umami dashboard, admin event tracking
- **Learning hypothesis**: Disproves "custom events are noisy" if events are distinguishable in dashboard; confirms event naming convention is maintainable
- **Effort**: ~6 hours
- **Dogfood**: Operator submits an idea, votes on it, checks Umami events tab

## Taste tests

| Test | Result |
|------|--------|
| Any slice ships 4+ new components? | No — max 1 new component per slice. PASS |
| Every slice depends on a new abstraction? | No — slice 01 has no new abstractions, slice 02 adds trackEvent helper. PASS |
| No slice disproves any pre-commitment? | Slice 02 disproves "events are too noisy". PASS |
| Any slice uses only synthetic data? | No — all slices use production pageviews and real user interactions. PASS |
| 2+ slices identical except for scale? | No — each slice adds a distinct capability. PASS |
