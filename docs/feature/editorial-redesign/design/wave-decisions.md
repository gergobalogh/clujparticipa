# DESIGN Decisions — editorial-redesign (Status Pipeline Redesign Wave)

## Key Decisions

- [D23] 24h auto-transition mechanism: External cron endpoint (`GET /api/cron/transition-submitted`) called by host-level scheduler (systemd timer, crontab, or Vercel Cron). Protected by CRON_SECRET. (Option A from architecture analysis)
- [D24] Vote threshold auto-transition: Checked at vote-time in `POST /api/ideas/[id]/vote`. After creating vote, if total votes >= threshold, auto-transition IN_VOTING -> SELECTED in same transaction. No separate background process.
- [D25] Prisma migration: Two-phase additive-first. Phase 1 = ADD VALUE for 4 new statuses (zero downtime). Phase 2 = data migration (UNDER_REVIEW/ELIGIBLE -> IN_VOTING) + enum rebuild without old values (brief maintenance window).
- [D26] MERGED parent idea reference: New `mergedIntoIdeaId` optional String column on Idea. No FK constraint (avoids circular dependency issues). Admin sets this when transitioning to MERGED.
- [D27] WITHDRAW action: New `POST /api/ideas/[id]/withdraw` endpoint. Validates citizen identity (participant hash match), 24h window, and SUBMITTED/IN_VOTING status. Creates StatusChange with changedBy = "citizen:{hash}".
- [D28] Backward compatibility: UNDER_REVIEW and ELIGIBLE ideas migrated to IN_VOTING. They were already reviewed and eligible by definition. StatusChange history preserves the original transition path.
- [D29] VOTE_ELIGIBLE_STATUSES: Keep support (non-binding "back this idea") on SUBMITTED + IN_VOTING. Formal vote only during IN_VOTING voting period. Same split as current SUPPORT_LABEL_STATUSES vs IN_VOTING.
- [D30] Terminal status rendering: REJECTED, NEEDS_REVISION, MERGED, WITHDRAWN render no forward pipeline track. ExceptionState card renders below with status-specific messaging.
- [D31] Mini-Pipeline milestone mapping: Submitted (SUBMITTED, index 0), In Voting (IN_VOTING/SELECTED/ACCEPTED, indices 1-3), Completed (IN_PROGRESS/COMPLETED, indices 4-5).
- [D32] Stalled detection: NEVER_STALLED = {SUBMITTED, COMPLETED, REJECTED, NEEDS_REVISION, MERGED, WITHDRAWN}. STALLED_WAITING_LABELS for IN_VOTING, SELECTED, ACCEPTED, IN_PROGRESS.
- [D33] ExceptionState type expansion: Add NEEDS_REVISION (replaces RETURNED semantics) and WITHDRAWN to exceptionType prop union.
- [D34] QUICK_ACTIONS: Updated per 10-state machine. SUBMITTED: [sendToVoting, merge, withdraw]. IN_VOTING: [selectIdea, merge]. SELECTED: [accept, reject, needsRevision, merge]. ACCEPTED: [startImplementation]. IN_PROGRESS: [markCompleted]. Terminal: [].

## Changed Assumptions

| Prior Decision | What It Said | What Changed | Impact |
|----------------|-------------|--------------|--------|
| D2 (clujparticipa-redesign) | MERGED/RETURNED detection via canonical note prefix `[MERGED]`/`[RETURNED]` in StatusChange.note | MERGED and NEEDS_REVISION are now real Status enum values. The note prefix is no longer the authoritative type signal. | `resolveExceptionType()` simplified. `parseMergeNote()`/`parseReturnNote()` retained for detail extraction only. |
| D7 (clujparticipa-redesign) | No new API endpoints or data models | Two new API endpoints (cron + withdraw). One new DB column (mergedIntoIdeaId). Prisma Status enum change. | Database migration required. New routes to maintain. |

## Architecture Summary

- Pattern: Modular monolith with ports-and-adapters (unchanged)
- Paradigm: Functional composition (unchanged)
- Key new components: Cron transition endpoint, Withdraw endpoint, two-phase migration
- Key modified components: transitions.ts (rewrite), pipeline-computation.ts (rewrite), pipeline-stages.ts (modify), stalled-detector.ts (modify), Badge (extend), ExceptionState (extend), MiniPipelineTrack (extend), PipelineTrack (extend)

## Reuse Analysis

| Existing Component | File | Overlap With | Decision | Justification |
|--------------------|------|--------------|----------|---------------|
| transitions.ts | `src/lib/transitions.ts` | Status machine SSOT | REWRITE | Graph fundamentally different. Function signatures preserved. |
| pipeline-stages.ts | `src/lib/pipeline-stages.ts` | Forward pipeline | MODIFY | 7 -> 6 stages. Signatures unchanged. |
| pipeline-computation.ts | `src/lib/pipeline-computation.ts` | Exception detection + stage data | REWRITE | Note-prefix detection removed. Status is authoritative. |
| stalled-detector.ts | `src/lib/stalled-detector.ts` | Stalled detection | MODIFY | Maps updated for 10 states. Signature unchanged. |
| Admin status API | `src/app/api/admin/ideas/[id]/status/route.ts` | Status transitions | EXTEND | Zod schema + transition map update. Core logic preserved. |
| Vote API | `src/app/api/ideas/[id]/vote/route.ts` | Threshold check | EXTEND | Post-vote conditional branch. Same endpoint. |
| PipelineTrack | `src/components/ideas/pipeline-track.tsx` | Visual pipeline | EXTEND | exceptionState union + 6-stage rendering. |
| MiniPipelineTrack | `src/components/ideas/mini-pipeline-track.tsx` | Compact pipeline | EXTEND | Milestone indices + terminal null-return. |
| ExceptionState | `src/components/ideas/exception-state.tsx` | Exception cards | EXTEND | Add NEEDS_REVISION, WITHDRAWN renderers. |
| Badge + status.ts | `src/components/ui/badge.tsx`, `src/lib/status.ts` | Status badges | EXTEND | Add 4 variants, remove 2. |

## Technology Stack

- TypeScript 5.x / Next.js 15.x App Router: existing stack, functional composition
- PostgreSQL 16 + Prisma 6.x: existing, migration required for enum change
- External scheduler: host-level systemd timer or crontab (no new dependency inside container)
- No new runtime dependencies inside the Next.js container

## Constraints Established

- Two-phase migration required (additive first, then destructive with maintenance window)
- External scheduler is a new operational dependency (must be configured on host)
- Vote-time threshold check does not cover the "threshold met but no new vote" edge case (admin manual promotion is fallback)
- MERGED parent reference uses String column without FK constraint (deliberate: avoids circular reference issues)
- WITHDRAW is only valid within 24h of idea creation (enforced server-side)

## Quality Attribute Strategies

| Attribute | Strategy |
|-----------|----------|
| Reliability (cron) | Idempotent endpoint: same SUBMITTED idea cannot double-transition. Failed calls are naturally retried on next cron invocation. |
| Reliability (threshold) | Transactional vote+transition. If threshold transition fails, vote still succeeds; admin or cron catches it. |
| Security (cron) | CRON_SECRET env var. Endpoint returns 401 for missing/wrong secret. |
| Security (withdraw) | Participant hash match validation. Only the idea's original submitter can withdraw. |
| Auditability | Every transition creates StatusChange + ModerationEvent records. "System" actor for cron transitions. "citizen:{hash}" for withdraw. |
| Maintainability | transitions.ts remains the single source of truth. All consumers import from it. |
| Testability | Pure function test for transitions. API route tests for cron, withdraw, vote-threshold. |

## Open Questions

| # | Question | Why Deferred | Resolution Path |
|---|----------|-------------|-----------------|
| OQ-12 | Vote threshold value: configurable per voting period or fixed? | Business decision, not architectural | DISTILL: confirm with PO. Default: configurable via new `selectionThreshold` field on VotingConfig model |
| OQ-13 | Cron frequency: every hour, every 5 minutes, every 15 minutes? | Operational tuning, not architectural | DELIVER: start with 1 hour. Adjust based on observed latency between 24h mark and actual transition |
| OQ-14 | Should MERGED ideas retain their vote count in the parent idea's total? | Business logic detail | DISTILL: confirm with PO. Current behavior: MERGED idea shows link to parent. Parent's vote count is independent. |
| OQ-15 | Phase 2 maintenance window: how long? | Deployment planning | DELIVER: estimate 5 minutes for migration on current data volume (5 seed ideas). Production estimate depends on row count. |
| OQ-16 | WITHDRAW: allow withdraw if idea has zero votes only, or any vote count? | Business rule, not architectural | DISTILL: confirm with PO. Recommendation: allow withdraw regardless of vote count within 24h (votes are non-binding prototype support). |

---

# DESIGN Decisions — editorial-redesign (How It Works Page)

## Key Decisions

- [D7] Page route: `/[locale]/how-it-works` — short, memorable, standard civic-tech pattern
- [D8] Pipeline hero: Extend PipelineTrack with `showcase` prop — all 6 forward stages shown as reached, markers are click anchors
- [D9] Sticky pipeline with scroll-spy: IntersectionObserver fills stage-by-stage as visitor scrolls. Unsticks after last stage card
- [D10] Click-to-scroll: Hash URL anchors (`#submitted`) + CSS `:target` for card highlight
- [D11] Client boundary: Single `HowItWorksContent` client component. Page shell is server component
- [D12] Terminal states: Dedicated "What if things don't go as planned?" section with colored-dot pattern
- [D13] i18n: New `HowItWorks` namespace alongside existing `Statuses`
- [D14] Badge: Extend with 4 missing variants (accepted, needs_revision, merged, withdrawn)
- [D15] Entry points: Nav bar, footer, idea detail page, post-submission confirmation

## Architecture Summary

- Pattern: Modular monolith with ports-and-adapters (unchanged)
- Paradigm: Functional composition (unchanged)
- Key new components: how-it-works page (server), HowItWorksContent (client)
- Key modified components: PipelineTrack (extend), Badge (extend), Nav (extend), Footer (extend)

## Reuse Analysis

| Existing Component | File | Overlap With | Decision | Justification |
|--------------------|------|--------------|----------|---------------|
| PipelineTrack | `src/components/ideas/pipeline-track.tsx` | Pipeline rendering | EXTEND | `showcase` + `onStageClick` props ~30 LOC vs 200+ LOC new component |
| ExceptionState | `src/components/ideas/exception-state.tsx` | Terminal state visual | EXTEND pattern | Same colored-dot convention, no code import |
| Badge | `src/components/ui/badge.tsx` | Status label | EXTEND | 4 missing variants, trivial addition |
| Terms page | `src/app/[locale]/terms/page.tsx` | Info page layout | EXTEND pattern | Same `max-w-3xl` server-component convention |
| i18n Statuses | `src/i18n/messages/en.json` | Status labels | EXTEND | New namespace alongside, labels reused |

## Technology Stack

- Next.js App Router (server page + client boundary): existing stack
- IntersectionObserver: browser-native, no library
- Tailwind `sticky top-16`: sticky positioning below nav
- CSS `:target`: card highlight on hash navigation
- next-intl: existing i18n pattern

## Constraints Established

- PipelineTrack showcase mode must not break existing idea-detail rendering (prop-gated, no default change)
- IntersectionObserver requires client component boundary (accepted — one component boundary per page)
- Terminal states are not on the sticky pipeline (they're in a separate section below)

## Open Questions

| # | Question | Why Deferred | Resolution Path |
|---|----------|-------------|-----------------|
| OQ-17 | Exact description copy for each status | Content decision | DELIVER: copywriting |
| OQ-18 | Sticky pipeline backdrop blur? | Visual polish | DELIVER: CSS detail |
| OQ-19 | Post-submission confirmation exists? | Entry point | DELIVER: verify, defer if not built yet |
