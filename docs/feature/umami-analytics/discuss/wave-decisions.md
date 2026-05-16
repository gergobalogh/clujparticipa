# DISCUSS Decisions — umami-analytics

## Key Decisions
- [D1] Umami (self-hosted) as analytics provider: privacy-first, cookieless, no PII, open-source. Aligns with civic platform values and JOB-004. (see: jtbd-four-forces.md)
- [D2] Event taxonomy: 6 initial events (idea_submit, idea_vote, comment_add, filter_change, sign_in, notification_opt_in). Expandable without architecture changes. (see: user-stories.md US-02)
- [D3] Environment-variable-driven configuration: NEXT_PUBLIC_UMAMI_URL + NEXT_PUBLIC_UMAMI_WEBSITE_ID. No hardcoded analytics URLs. (see: user-stories.md US-03)

## Requirements Summary
- Primary jobs/user needs: Operator needs to diagnose drop-off (JOB-002, score 81) and validate feature value (JOB-003, score 72).
- Walking skeleton scope: 2 slices, linear chain, each ≤1 day. Both slices deliver core value (pageviews + events).
- Feature type: Cross-cutting — touches all pages (tracking script) and infrastructure (Umami deployment).

## Constraints Established
- Umami must be self-hosted (or Umami Cloud) — no third-party analytics services that sell data
- Umami script must not impact page load performance (>100ms addition = fail)

## Upstream Changes
- No DISCOVER artifacts exist for this feature (new feature, no prior wave)
- No contradictions with existing SSOT — JOBS-002 through JOB-005 are additive to JOB-001
