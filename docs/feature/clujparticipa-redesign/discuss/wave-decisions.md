# DISCUSS Decisions — clujparticipa-redesign

## Key Decisions
- [D1] Design direction: Pipeline Tracker (from DIVERGE) + Map-first entry point (from dissenting case) → composite approach (see: recommendation.md)
- [D2] JTBD: Reuse DIVERGE JOB-001 rather than re-running JTBD analysis — job already validated at physical level (see: jtbd-opportunity-scores.md)
- [D3] UX depth: Deep-dive with two personas (Maria: engaged resident, Ion: curious newcomer) and full error-path mapping (see: journey-pipeline-tracker-visual.md)
- [D4] Walking skeleton: Pipeline renders on idea detail page with current stage highlighted — minimum slice that connects all activities
- [D5] Notification strategy: Browser notifications only (no email) — avoids email service dependency, aligns with prototype scope

## Scope Assessment
- PASS — right-sized for a single feature (8 stories, 2 bounded contexts, 3 integration points, ~1.5 weeks effort)

## Requirements Summary
- Primary jobs: JOB-001 — "Submit my idea and track whether it gets acted on"
- Walking skeleton scope: Pipeline component on idea detail page with current stage highlighted
- Feature type: User-facing

## Constraints Established
- Pipeline stages must come from existing `src/lib/transitions.ts` status enum
- StatusChange model must drive pipeline timestamps (no new data model changes)
- All UI strings from locale files (RO/HU/EN) per CLAUDE.md
- No PostGIS, no new authentication, no email service

## Upstream Changes
- None — DIVERGE assumptions hold. Pipeline Tracker recommendation confirmed by DISCUSS journey design.
