# Prioritization — umami-analytics

## Execution order: 01 → 02

| Slice | Why this order |
|-------|---------------|
| **01: Umami server + script** | Foundation — nothing works without it. Lowest risk, fastest to ship. Proves infra works. |
| **02: Custom events** | Pageviews alone show WHERE users go but not WHAT they do. Events answer the "why" and "where they drop off" questions (JOB-002). Highest learning leverage. |

## Learning leverage

- Slice 01 confirms: infrastructure works (unblocks everything)
- Slice 02 confirms: events are useful, not noisy (highest uncertainty — if events are noise, the whole approach needs rethinking)

## Dependency chain

```
01 ──→ 02
```

Strict linear. Slice 02 builds on slice 01. No parallelism possible.
