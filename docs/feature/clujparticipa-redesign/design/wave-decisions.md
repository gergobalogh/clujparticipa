# DESIGN Decisions — clujparticipa-redesign

## Key Decisions

- [D1] Development paradigm: Functional composition — pure functions for domain logic, React components as pure renderers, side effects in hooks. No classes. (see: ADR-001)
- [D2] MERGED/RETURNED detection: Canonical note prefix `[MERGED]` / `[RETURNED]` in StatusChange.note — deterministic parsing without schema changes (see: ADR-002)
- [D3] Mini-pipeline grouping: Milestone markers — Submitted / In Voting / Completed — maps to package-tracking mental model (see: ADR-003)
- [D4] Stalled detection: Flat 30-day threshold for all stages — stage-specific tuning deferred to post-MVP
- [D5] Notification probe: Runtime probe at mount — if `Notification` API unavailable, fall back to in-app toast
- [D6] Homepage layout: Map-first — promote HomeMapPreview from sidebar to full-width hero; stats and idea feed below
- [D7] No new API endpoints or data models — reuse existing status-changes API + transitions.ts

## Architecture Summary

- Pattern: Modular monolith with ports-and-adapters
- Paradigm: Functional composition (pure functions, no classes)
- Key components: IdeaPipeline, MiniPipeline, StatusChangeTimeline, StalledIndicator, ExceptionState, pipeline-stages.ts, stalled-detector.ts, actor-role-resolver.ts

## Reuse Analysis

| Existing Component | File | Overlap | Decision | Justification |
|-------------------|------|---------|----------|---------------|
| IdeaPipeline scaffold | src/components/ideas/idea-pipeline.tsx | Types defined | EXTEND | Implement existing interface |
| IdeaPipelineStage scaffold | src/components/ideas/idea-pipeline-stage.tsx | Types defined | EXTEND | Implement existing interface |
| MiniPipeline scaffold | src/components/ideas/mini-pipeline.tsx | Types defined | EXTEND | Implement existing interface |
| StatusChangeTimeline scaffold | src/components/ideas/status-change-timeline.tsx | Types defined | EXTEND | Implement existing interface |
| StalledIndicator scaffold | src/components/ideas/stalled-indicator.tsx | Types defined | EXTEND | Implement existing interface |
| ExceptionState scaffold | src/components/ideas/exception-state.tsx | Types defined | EXTEND | Implement existing interface |
| pipeline-stages scaffold | src/lib/pipeline-stages.ts | Signatures defined | EXTEND | Implement existing signatures |
| stalled-detector scaffold | src/lib/stalled-detector.ts | Signature defined | EXTEND | Implement existing signature |
| actor-role-resolver scaffold | src/lib/actor-role-resolver.ts | Signature defined | EXTEND | Implement existing signature |
| useNotificationOptIn scaffold | src/hooks/use-notification-opt-in.ts | Types defined | EXTEND | Implement existing interface |
| IdeaDetailPage | src/app/[locale]/ideas/[id]/page.tsx | Inline timeline, rejection handling | EXTEND | Replace inline JSX with components |
| IdeaCard | src/components/ideas/idea-card.tsx | Status badge, no pipeline | EXTEND | Add MiniPipeline |
| IdeaListRow | src/components/ideas/idea-list-row.tsx | Compact row with badge | EXTEND | Add MiniPipeline |
| LocaleHomePage | src/app/[locale]/page.tsx | 2-col grid, map in sidebar | EXTEND | Restructure to map-first |
| HomeMapPreview | src/components/map/home-map-preview.tsx | Compact map widget | EXTEND | Promote to hero, add tap-to-submit |
| status-changes API | src/app/api/ideas/[id]/status-changes/route.ts | Returns ordered records | EXTEND | No changes needed |
| transitions.ts | src/lib/transitions.ts | ALL_STATUSES, VALID_TRANSITIONS | EXTEND | pipeline-stages derives from this |
| Badge | src/components/ui/badge.tsx | Status color variants | EXTEND | Pipeline reuses same color tokens |
| status.ts | src/lib/status.ts | statusToBadgeVariant() | EXTEND | Pipeline colors reference same mapping |

## Technology Stack

- TypeScript 5.x / Next.js 15.x App Router: existing stack, functional composition
- Tailwind CSS 4.x: existing, design tokens already defined
- PostgreSQL 16 + Prisma 6.x: existing, no schema changes
- react-leaflet 4.x: existing, do not upgrade major versions
- next-intl 3.x: existing, RO/HU/EN locales
- Vitest 4.x: existing, add @testing-library/react + jsdom for component tests

## Constraints Established

- No new database schema changes (MERGED/RETURNED from note conventions)
- No new API endpoints (reuse existing status-changes API)
- All pipeline stage colors derive from existing design tokens + Badge variants
- Pipeline stages ordered from transitions.ts ALL_STATUSES (ELIGIBLE, not FEASIBLE)
- Browser Notification API is the only new outbound adapter

## Upstream Changes

- DISCUSS US-01 AC1 references "FEASIBLE" — should be updated to "ELIGIBLE" per code SSOT (already noted in distill/upstream-issues.md)
- DISCUSS US-05 AC4-AC6 reference MERGED/RETURNED as statuses — should be updated to specify note prefix convention per D2 (already noted in distill/upstream-issues.md)
- DISTILL DWD-08 (MERGED/RETURNED from note) — confirmed by DESIGN D2 (canonical prefix convention)
