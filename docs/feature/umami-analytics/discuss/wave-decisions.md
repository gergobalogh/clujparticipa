# DISCUSS Decisions — umami-analytics

## Key Decisions
- [D1] Umami (self-hosted) as analytics provider: privacy-first, cookieless, no PII, open-source. Aligns with civic platform values and JOB-004. (see: jtbd-four-forces.md)
- [D2] Consent as hard gate (not soft): tracking MUST NOT fire without explicit consent. Not "opt-out after tracking starts." (see: user-stories.md US-03)
- [D3] Non-modal bottom bar for consent notice: never blocks content, dismissable, no cookie-wall patterns. (see: journey-resident-consent-visual.md)
- [D4] Event taxonomy: 6 initial events (idea_submit, idea_vote, comment_add, filter_change, sign_in, notification_opt_in). Expandable without architecture changes. (see: user-stories.md US-04)
- [D5] Environment-variable-driven configuration: NEXT_PUBLIC_UMAMI_URL + NEXT_PUBLIC_UMAMI_WEBSITE_ID. No hardcoded analytics URLs. (see: user-stories.md US-06)

## Requirements Summary
- Primary jobs/user needs: Operator needs to diagnose drop-off (JOB-002, score 81) and validate feature value (JOB-003, score 72). Residents need to trust privacy (JOB-004, score 35 — mostly solved by Umami's architecture).
- Walking skeleton scope: 4 slices, linear chain, each ≤1 day. First 3 slices deliver core value (pageviews + consent + events). Slice 04 is polish.
- Feature type: Cross-cutting — touches all pages (tracking script), privacy/consent flow, and infrastructure (Umami deployment).

## Constraints Established
- Umami must be self-hosted (or Umami Cloud) — no third-party analytics services that sell data
- Tracking is consent-gated: no events without explicit user consent
- Umami script must not impact page load performance (>100ms addition = fail)
- All consent UI strings must come from locale files (RO, HU, EN)

## Upstream Changes
- No DISCOVER artifacts exist for this feature (new feature, no prior wave)
- No contradictions with existing SSOT — JOBS-002 through JOB-005 are additive to JOB-001
