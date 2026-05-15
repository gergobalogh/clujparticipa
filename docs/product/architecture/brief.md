# Architecture Brief — ClujParticipa

## System Context (C4 Level 1)

```mermaid
graph TB
    Resident[Resident<br/>Browser] -->|HTTPS| App[ClujParticipa<br/>Next.js App]
    Admin[Admin<br/>Browser] -->|HTTPS + x-admin-secret| App
    App -->|SQL| DB[(PostgreSQL)]
    App -->|API| Resend[Resend Email]
    App -->|API| Cloudflare[Cloudflare Images]
    App -->|Tiles| OSM[OpenStreetMap]
    Resident -.->|Browser API| Notifications[Browser Notifications]
```

**External systems**:
- PostgreSQL 16 — primary data store
- Resend — transactional email (status change notifications, existing)
- Cloudflare Images — image storage and CDN (existing)
- OpenStreetMap — map tiles via Leaflet (existing)
- Browser Notification API — push notifications (new, outbound only)

**People**:
- Resident — submits ideas, votes, tracks progress. No account required.
- Admin — manages idea statuses, moderates content. Requires ADMIN_SECRET header.

## Container (C4 Level 2)

```mermaid
graph TB
    Browser[Resident Browser] -->|HTTP/HTTPS| NextJS[Next.js App<br/>App Router]
    AdminBrowser[Admin Browser] -->|HTTP/HTTPS| NextJS

    subgraph "Single Docker Container"
        NextJS
        subgraph "Server Components"
            HomePage[Homepage<br/>Server Component]
            DetailPage[Idea Detail<br/>Server Component]
        end
        subgraph "Client Components"
            Pipeline[PipelineTrack<br/>Client Component]
            MiniPipeline[MiniPipelineTrack<br/>Client Component]
            Timeline[StatusChangeTimeline<br/>Client Component]
            Map[MapView<br/>Client Component]
        end
        subgraph "API Routes"
            IdeasAPI[/api/ideas]
            StatusChangesAPI[/api/ideas/id/status-changes]
            VoteAPI[/api/ideas/id/vote]
            StatsAPI[/api/stats]
            AdminAPI[/api/admin/ideas/id/status]
        end
        subgraph "Domain Logic"
            Transitions[transitions.ts<br/>Status Machine]
            PipelineStages[pipeline-stages.ts<br/>Stage Ordering]
            PipelineComputation[pipeline-computation.ts<br/>Stage Transforms]
            StalledDetector[stalled-detector.ts<br/>Stalled Detection]
            ActorResolver[actor-role-resolver.ts<br/>Role Resolution]
        end
    end

    NextJS -->|Prisma| DB[(PostgreSQL)]
    NextJS -->|HTTP| Resend[Resend]
    NextJS -->|HTTP| Cloudflare[Cloudflare Images]
    Pipeline -->|fetch| StatusChangesAPI
    Pipeline --> PipelineStages
    Pipeline --> PipelineComputation
    Pipeline --> StalledDetector
    MiniPipeline --> PipelineStages
    Timeline --> ActorResolver
```

## Application Architecture

### Pattern: Modular monolith with ports-and-adapters

```
┌─────────────────────────────────────────────────────┐
│                  Driving Adapters                     │
│  Next.js Pages (Server Components)                   │
│  API Route Handlers                                   │
│  Browser Notification API (outbound)                  │
├─────────────────────────────────────────────────────┤
│                  Application Layer                    │
│  Pipeline orchestration, stage rendering logic        │
│  Exception state detection, stalled detection         │
│  Actor role resolution, milestone grouping            │
│  Pipeline visual: track+marker rendering (ADR-004)   │
├─────────────────────────────────────────────────────┤
│                  Domain Layer                         │
│  transitions.ts — status machine (SSOT)               │
│  pipeline-stages.ts — stage ordering                  │
│  pipeline-computation.ts — stage data transforms      │
│  stalled-detector.ts — stalled detection rules         │
│  actor-role-resolver.ts — changedBy → role mapping    │
├─────────────────────────────────────────────────────┤
│                  Driven Adapters                      │
│  Prisma (PostgreSQL)                                  │
│  Resend (email)                                       │
│  Cloudflare Images                                    │
└─────────────────────────────────────────────────────┘
```

**Dependency rule**: Dependencies point inward. Domain logic has zero imports from adapters. Application layer imports from domain only. Driving adapters import from application layer.

### Component Boundaries

| Boundary | Owns | Imports From |
|----------|------|-------------|
| Pipeline domain | Stage ordering, stalled detection, milestone grouping, exception state detection | transitions.ts (domain peer) |
| Pipeline visual | PipelineTrack, PipelineTrackSegment, MiniPipelineTrack, StalledIndicator, ExceptionState | pipeline domain, i18n messages, motion v12 |
| UI presentation | EditorialIdeaCard, LiveBadge, SidebarCta, StatusChangeTimeline, MapView | pipeline visual, pipeline domain, i18n messages |
| Data access | Prisma queries, API route handlers | Domain (status types), Prisma schema |
| Notifications | useNotificationOptIn hook, browser API probe | Browser Notification API (outbound) |

### Paradigm: Functional Composition

All domain logic is pure functions. No classes, no inheritance.

- `getStageIndex(status)` → number
- `isStageReached(stage, current)` → boolean
- `detectStalledIdea(status, lastChangeDate, now?)` → StalledInfo
- `resolveActorRole(changedBy)` → ActorRole
- `getMilestoneGroup(currentStatus)` → { submitted: boolean, inVoting: boolean, completed: boolean }

React components are pure renderers of typed props. Side effects isolated in hooks (`useNotificationOptIn`).

### Color System for Pipeline

Pipeline track and marker colors derive from existing design tokens (per ADR-004: solid track with circular markers):

| Stage | Track Fill Color | Marker Color | CSS Token | Badge Variant |
|-------|-----------------|-------------|-----------|---------------|
| SUBMITTED | civic-orange | civic-orange | `--color-civic-orange` | submitted |
| UNDER_REVIEW | civic-orange | civic-orange | `--color-civic-orange` | under_review |
| ELIGIBLE | civic-blue | civic-blue | `--color-civic-blue` | eligible |
| IN_VOTING | purple-700 | purple-700 | (Tailwind default) | in_voting |
| SELECTED | civic-teal | civic-teal | `--color-civic-teal` | selected |
| IN_PROGRESS | civic-teal | civic-teal | `--color-civic-teal` | in_progress |
| COMPLETED | civic-teal | civic-teal | `--color-civic-teal` | completed |
| REJECTED (exception) | N/A (gray beyond rejection) | red-600 | (Tailwind default) | rejected |
| Future (not reached) | gray-200 | border gray-300 | (Tailwind default) | — |
| STALLED indicator | amber-500 | amber-500 | (Tailwind default) | — |
| MERGED indicator | civic-blue-light | civic-blue-light | `--color-civic-blue-light` | — |
| RETURNED indicator | civic-orange-light | civic-orange-light | `--color-civic-orange-light` | — |

No new color tokens introduced. Pipeline track reuses the same color system as Badge and MapView markers.

### MERGED/RETURNED Note Convention

Admins must prefix StatusChange.notes with canonical markers:

| Exception | Prefix | Example |
|----------|--------|---------|
| MERGED | `[MERGED]` | `[MERGED] merged with idea #cm5x8k2q` |
| RETURNED | `[RETURNED]` | `[RETURNED] revision required: add specific location` |
| Plain rejection | No prefix | `Outside city jurisdiction` |

Parsing rule: if the most recent StatusChange for a REJECTED idea has a note starting with `[MERGED]` or `[RETURNED]`, render the corresponding exception UI instead of the default rejection marker.

### Mini-Pipeline Track Milestone Mapping

The 3-marker mini-pipeline track (per ADR-004: solid track with circular markers) groups the 7 forward stages into 3 public-facing milestones:

| Milestone | Mapped Stages | Visual |
|-----------|-------------|--------|
| Submitted | SUBMITTED, UNDER_REVIEW, ELIGIBLE | Filled dot when any of these is current |
| In Voting | IN_VOTING, SELECTED | Filled dot when either is current |
| Completed | IN_PROGRESS, COMPLETED | Filled dot when either is current |

REJECTED ideas show no mini-pipeline track (status badge alone indicates rejection).

### Pipeline Visual Architecture (ADR-004)

The pipeline visual system uses a **solid continuous track with circular markers** metaphor, replacing the previous disconnected-dot design. See ADR-004 for full rationale.

**Components**:

| Component | Path | Role |
|-----------|------|------|
| PipelineTrack | `src/components/ideas/pipeline-track.tsx` | Full 7-stage pipeline on detail page. Horizontal track on desktop, vertical on mobile. Entrance animation (track fill left-to-right, staggered marker fade) |
| PipelineTrackSegment | `src/components/ideas/pipeline-track-segment.tsx` | Single stage within PipelineTrack: colored track segment + circular marker ON bar + label |
| MiniPipelineTrack | `src/components/ideas/mini-pipeline-track.tsx` | Compact 3-milestone track for idea cards. Horizontal always. Same milestone grouping as ADR-003 |

**Replaced components** (deleted):
- `IdeaPipeline` (was `idea-pipeline.tsx`) -- replaced by `PipelineTrack`
- `IdeaPipelineStage` (was `idea-pipeline-stage.tsx`) -- replaced by `PipelineTrackSegment`
- `MiniPipeline` (was `mini-pipeline.tsx`) -- replaced by `MiniPipelineTrack`

**Extended components**:
- `StalledIndicator` -- added `fullWidth` prop to align stalled bar width with track width

**Unchanged components**:
- `ExceptionState` -- placement below pipeline unaffected
- `pipeline-computation.ts` -- `computePipelineStages()`, `resolveExceptionType()` unchanged
- `pipeline-stages.ts` -- `PIPELINE_STAGES`, `getStageIndex()` unchanged

**Animation contract** (entrance only, no transition on status change):
- Track fill: `motion.div` `scaleX: 0 -> 1`, `transformOrigin: left`, `duration: 0.6s`
- Marker stagger: `motion.div` `opacity: 0 -> 1`, `delay: index * 0.05s`
- Reduced motion: handled by `motion` v12 built-in `prefers-reduced-motion` support

### Homepage Layout Restructure

Current layout: `1fr 400px` grid (idea feed left, map sidebar right).

New layout:

```
┌────────────────────────────────────────┐
│           MAP HERO (full-width)         │
│     HomeMapPreview at 400-500px height   │
│     Tap to submit with location         │
├────────────────────────────────────────┤
│  "Track your idea's progress"           │
│  Stats bar (completed count, etc.)       │
├────────────────────────────────────────┤
│  Idea feed with MiniPipeline indicators │
│  (existing IdeaListRow + MiniPipeline)   │
└────────────────────────────────────────┘
```

Map moves from sidebar to hero. Stats strip moves below map. Idea feed stays but gains mini-pipelines. Mobile: map is full-width and visible (remove `hidden lg:block`).
