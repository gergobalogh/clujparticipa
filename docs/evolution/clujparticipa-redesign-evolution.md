# Evolution: clujparticipa-redesign

**Feature**: Civic UI Redesign — Pipeline Tracker + Map-First Entry
**Date**: 2026-05-15
**Branch**: redesign
**Commits**: 21 (436ad06..4a0200e)

## Summary

Implemented pipeline visualization, mini-pipeline indicators, status change timeline, exception states with recovery CTAs, map-first homepage, and notification opt-in for the ClujParticipa civic participation platform.

## Milestones Delivered

| Milestone | Components | Status |
|----------|-----------|--------|
| WS — Walking Skeleton | IdeaPipeline on idea detail page | DONE |
| M1 — Pipeline Visualization | Stage rendering, timestamps, mobile, stalled detection, error paths | DONE |
| M2 — Homepage Integration | MiniPipeline, hero text, stats, i18n | DONE |
| M3 — Status Change Timeline | Expandable timeline, actor roles | DONE |
| M4 — Exception States | REJECTED/MERGED/RETURNED detection, recovery CTAs | DONE |
| M5 — Map-First Homepage | Map hero, tap-to-submit, mobile visible | DONE |
| M6 — Notification Opt-In | useNotificationOptIn, opt-in prompt, in-app fallback | DONE |

## New Production Files

| File | Purpose |
|------|---------|
| src/lib/pipeline-stages.ts | Pipeline stage ordering (7 forward stages) |
| src/lib/stalled-detector.ts | Stalled idea detection (>30 days) |
| src/lib/actor-role-resolver.ts | Maps changedBy to display role |
| src/lib/pipeline-computation.ts | Pipeline data computation + MERGED/RETURNED detection |
| src/lib/timeline-mapping.ts | StatusChange to TimelineEntry mapping |
| src/lib/home-stats.ts | Completed count + zero-state resolution |
| src/lib/category-colors.ts | Shared category color maps |
| src/lib/types.ts | Shared StatusChange type |
| src/components/ideas/idea-pipeline.tsx | 7-stage pipeline visualization |
| src/components/ideas/idea-pipeline-stage.tsx | Individual pipeline stage |
| src/components/ideas/mini-pipeline.tsx | 3-milestone compact indicator |
| src/components/ideas/stalled-indicator.tsx | "Waiting for" label |
| src/components/ideas/status-change-timeline.tsx | Expandable timeline |
| src/components/ideas/exception-state.tsx | REJECTED/MERGED/RETURNED UI + CTAs |
| src/hooks/use-notification-opt-in.ts | Browser notification permission hook |

## Modified Files

| File | Change |
|------|--------|
| src/app/[locale]/ideas/[id]/page.tsx | Pipeline + timeline + exception state integration |
| src/app/[locale]/ideas/new/page.tsx | Notification opt-in + lat/lng pre-fill |
| src/app/[locale]/page.tsx | Map-first layout, completed stats, zero states |
| src/components/ideas/idea-card.tsx | MiniPipeline integration |
| src/components/ideas/idea-list-row.tsx | MiniPipeline integration |
| src/components/map/home-map-preview.tsx | Hero mode + tap-to-submit |
| src/components/map/map-view.tsx | Map click handler, marker click tracking |
| src/i18n/messages/ro.json | Pipeline/Stalled/Timeline/MiniPipeline/Exception/Notification namespaces |
| src/i18n/messages/hu.json | Same namespaces in Hungarian |
| src/i18n/messages/en.json | Same namespaces in English |

## Test Summary

- 214 tests (lib + hooks + components) all passing
- 0 TypeScript errors in production code
- 0 remaining scaffold markers

## Design Decisions Preserved

- DDD-1: Functional composition (pure functions, no classes)
- DDD-2: Modular monolith with ports-and-adapters
- DDD-3: Flat 30-day stalled threshold
- DDD-4: Runtime probe for Notification API
- DDD-5: [MERGED]/[RETURNED] prefix convention (ADR-002)
- DDD-6: 3-milestone mini-pipeline grouping (ADR-003)
- DDD-7: Map-first homepage layout
- DDD-8: Reuse existing status-changes API + transitions.ts

## Post-MVP Deferrals

- Stage-specific stalled thresholds
- Service worker / push notification infrastructure
- Playwright E2E test infrastructure
- Analytics integration for KPI tracking
- Full accessibility audit
