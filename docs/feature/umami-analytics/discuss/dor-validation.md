# DoR Validation — umami-analytics

| # | DoR Item | Status | Evidence |
|---|----------|--------|----------|
| 1 | User stories trace to job stories | PASS | US-01 → JOB-002, US-02 → JOB-002+JOB-003, US-03 → JOB-002 |
| 2 | Acceptance criteria are testable | PASS | Every AC is verifiable by: opening Umami dashboard, checking Network tab, verifying env var behavior |
| 3 | Stories have elevator pitches | PASS | Every story has Before/After/Decision-enabled triplet with concrete observable output |
| 4 | No story is infrastructure-only without rationale | PASS | US-03 is infrastructure-adjacent but enables JOB-002 (operator diagnoses drop-off using configured analytics). Not pure infra. |
| 5 | Dependencies identified | PASS | Slice dependency chain: 01→02. No circular dependencies. All external dependencies (Umami server) documented. |
| 6 | No open UX questions | PASS | No consent UI decisions needed. Umami's cookieless architecture minimizes privacy risk. |
| 7 | Privacy/consent addressed | PASS | Umami's cookieless, no-PII architecture satisfies privacy by design. Consent gate deferred. |
| 8 | Walking skeleton defined | PASS | "Pageviews flow, custom events fire" — 2 slices, each ≤1 day, linear dependency chain |
| 9 | Outcome KPIs defined | PASS | See outcome-kpis.md |

**DoR verdict: PASS** — all 9 items validated with evidence.
