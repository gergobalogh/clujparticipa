# Prioritization — umami-analytics

## Execution order: 01 → 02 → 03 → 04

| Slice | Why this order |
|-------|---------------|
| **01: Umami server + script** | Foundation — nothing works without it. Lowest risk, fastest to ship. Proves infra works. |
| **02: Consent gate** | Must land before any tracking fires on real users. Ethical prerequisite. Without it, slice 01 ships tracking without consent — unacceptable for a civic platform. |
| **03: Custom events** | Pageviews alone show WHERE users go but not WHAT they do. Events answer the "why" and "where they drop off" questions (JOB-002). Highest learning leverage. |
| **04: Consent persistence** | Important but not urgent. Most users set-and-forget consent. Privacy page toggle is a polish feature, not a blocker. Ships last. |

## Learning leverage

- Slice 01 confirms: infrastructure works (unblocks everything)
- Slice 02 confirms: consent doesn't kill engagement (blocks going further if it does)
- Slice 03 confirms: events are useful, not noisy (highest uncertainty — if events are noise, the whole approach needs rethinking)
- Slice 04 confirms: users revisit consent (low uncertainty — nice to validate but not blocking)

## Dependency chain

```
01 ──→ 02 ──→ 03 ──→ 04
```

Strict linear. Each slice builds on the previous. No parallelism possible.
