# Story Map — page-goals-and-copy

## Backbone (Activities)

```
Homepage → Submit → Detail → How It Works → Results → Login → Privacy
```

## Walking Skeleton

US-1 (Homepage copy) — the homepage is the #1 bottleneck. Fixing it first gives the highest leverage.

## Elephant Carpaccio Slices

| Slice | Stories | Ship estimate | Learning hypothesis |
|-------|---------|---------------|---------------------|
| S1 | US-1 | ≤1 day | Disproves: "homepage copy has no effect on bounce rate" if bounce rate unchanged after 2 weeks |
| S2 | US-2 | ≤1 day | Disproves: "submission anxiety is not a copy problem" if completion rate unchanged |
| S3 | US-3 | ≤1 day | Disproves: "section headings don't affect engagement depth" if scroll depth unchanged |
| S4 | US-4 | ≤1 day | Disproves: "trust proof doesn't affect submission rate" if How It Works → submit rate unchanged |
| S5 | US-5 | ≤1 day | Disproves: "results framing doesn't affect engagement" if results click-through unchanged |
| S6 | US-6 | ≤1 day | Disproves: "auth copy doesn't affect click-through" if OAuth rate unchanged |
| S7 | US-7 | ≤1 day | Disproves: "privacy summary doesn't affect trust" if privacy page exit rate unchanged |

## Prioritization Rationale

1. **S1 (Homepage)** — highest opportunity score (54), highest traffic, first impression gate
2. **S2 (Submit)** — second-highest opportunity (45), direct conversion impact
3. **S4 (How It Works)** — third-highest leverage for trust building (21), feeds back into submission
4. **S5 (Results)** — proof-of-impact page (28), important but lower traffic
5. **S3 (Detail)** — refinement (24), improves engagement depth but not acquisition
6. **S6 (Login)** — unblocks voting (14), moderate impact
7. **S7 (Privacy)** — trust obstacle removal (12), lowest traffic, lowest urgency

## Taste Tests

- ✅ Each slice ships ≤1 copy change (locale files only) — thin by nature
- ✅ No slice introduces new abstractions
- ✅ Each slice has a named learning hypothesis
- ✅ No two slices are identical except for scale
- ✅ All slices use production data (real locale strings, real pages)
