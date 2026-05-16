# Opportunity Scores — umami-analytics

Opportunity score = Importance × (10 - Satisfaction). Higher = more underserved.

| ID | Job | Importance (1-10) | Current Satisfaction (1-10) | Gap | Score | Status |
|----|-----|-------------------|-----------------------------|-----|-------|--------|
| JOB-002 | Diagnose drop-off — see where users abandon the journey | 9 | 1 | 9 | 81 | **critically under-served** |
| JOB-003 | Validate feature value — measure if shipped features change behavior | 8 | 1 | 9 | 72 | **critically under-served** |
| JOB-004 | Trust platform privacy — know tracking is honest and minimal | 7 | 5 | 5 | 35 | appropriately-served (Umami's nature solves most of this) |
| JOB-005 | See platform is alive — evidence of activity on return | 6 | 3 | 7 | 42 | under-served but secondary |

## Priority ranking

1. **JOB-002 (Diagnose drop-off)** — Score 81. Zero visibility today. This is the primary value of analytics. Without it, every UX decision is a guess.
2. **JOB-003 (Validate feature value)** — Score 72. Closely related to JOB-002. Distinguishing: JOB-002 is "where are problems?" vs JOB-003 is "did my fix work?" Both are critical, but diagnosis must come first.
3. **JOB-005 (Platform is alive)** — Score 42. Secondary — this is a consumption use of analytics data, not a collection use. Can be deferred until analytics are proven useful.
4. **JOB-004 (Privacy trust)** — Score 35. Umami's cookieless, PII-free architecture satisfies most of this job already. Consent gate deferred — privacy is addressed by Umami's architecture (no cookies, no PII).
