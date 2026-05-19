# Slice 04 — How It Works Trust Amplification

**Goal**: Add completed-ideas count and emotionally-aware terminal state copy to build trust

**IN scope**:
- Add completed ideas count display to How It Works page (using `computeCompletedCount()`)
- Rewrite terminal state descriptions in `HowItWorks` namespace to acknowledge emotional weight
- Make creator credit visually subordinate to CTA

**OUT scope**:
- Pipeline component changes
- Stage description rewrites (forward stages are already good)
- New API endpoints (reuse existing stats)

**Learning hypothesis**: Disproves "trust proof doesn't affect submission rate" — if How It Works → submit conversion is unchanged, completed count visibility doesn't drive action.

**ACs**:
- Completed ideas count visible near page hero
- Terminal state descriptions acknowledge emotional reality
- Creator credit doesn't compete with CTA for last-screen attention
- All strings in RO, HU, EN

**Dependencies**: `computeCompletedCount()` from `src/lib/home-stats.ts`, `/api/stats` endpoint

**Effort estimate**: ≤6 hours (includes adding stats fetch to page component)
