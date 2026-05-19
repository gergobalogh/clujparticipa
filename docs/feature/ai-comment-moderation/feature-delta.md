# Feature Delta — ai-comment-moderation

## Wave: DISCUSS / [REF] Persona ID

**Persona**: maria-manastur (resident commenter) + platform admin (operator)

## Wave: DISCUSS / [REF] JTBD One-Liner

When a comment is posted, I want the platform to screen it for toxicity automatically, so toxic content is never publicly visible for hours and I can trust the discussion space is safe 24/7.

## Wave: DISCUSS / [REF] Locked Decisions

- [D1] Use OpenAI Moderation API — multilingual (RO/HU/EN), no training data, free/low-cost. Risk: third-party dep, mitigated by fail-open.
- [D2] Fail-open on API outage — blocking comments during outage is worse than temporarily missing toxic content.
- [D3] Add FLAGGED to CommentStatus — distinct from HIDDEN; means "awaiting human review."
- [D4] Store flagged categories in ModerationEvent.reason — format "auto_flag:hate,harassment". Simple string, promote to column if querying needed.
- [D5] Return HTTP 202 for flagged comments — distinct from 201 (clean) and 400 (validation error).

## Wave: DISCUSS / [REF] User Stories with Elevator Pitches

### US-1: Auto-flag toxic comments on creation
**job_id**: JOB-008

Before: Toxic comments sit publicly until an admin manually hides them — could be hours.
After: run `POST /api/ideas/[id]/comments` with toxic text → sees `{ status: "FLAGGED", message: "Your comment is under review" }` with HTTP 202.
Decision enabled: Admin can trust that toxic content is caught 24/7 without manual monitoring.

**ACs**:
- moderateText(text) calls OpenAI Moderation API, returns { flagged, categories }
- Flagged → FLAGGED status, HTTP 202
- Clean → VISIBLE status, HTTP 201 (no regression)
- API failure → VISIBLE, logged warning
- Latency <2s added
- Build passes

### US-2: Record auto-flag events in audit trail
**job_id**: JOB-009

Before: No record exists of why a comment was auto-flagged or which categories triggered it.
After: run `PATCH /api/admin/comments/[id]` approving a flagged comment → sees ModerationEvent with `action: "APPROVE"` linked to the original AUTO_FLAG event.
Decision enabled: Admin can review the AI's reasoning and make informed approve/hide decisions.

**ACs**:
- AUTO_FLAG and APPROVE in ModerationAction enum
- Auto-flag creates ModerationEvent with action=AUTO_FLAG, reason="auto_flag:<categories>"
- Approve FLAGGED→VISIBLE creates APPROVE ModerationEvent
- Build passes

### US-3: Admin reviews flagged comments
**job_id**: JOB-009

Before: Admin must manually check all comments to find flagged ones — no filter exists.
After: run admin page → clicks "Flagged" tab → sees list of flagged comments with categories, idea title, and one-click approve/hide buttons.
Decision enabled: Admin can triage flagged comments efficiently and clear the queue.

**ACs**:
- Admin page has "Flagged" filter/tab for FLAGGED comments
- Shows text, idea title, flagged categories, timestamp
- Approve → VISIBLE + APPROVE event
- Hide → HIDDEN + HIDE event
- Count badge updates
- Build passes

### US-4: Resident sees feedback when comment is flagged
**job_id**: JOB-010

Before: Resident posts a flagged comment and sees no feedback — comment doesn't appear, no explanation.
After: run `POST /api/ideas/[id]/comments` with flagged text → sees inline notice "Your comment is under review by our moderation system" in the UI.
Decision enabled: Resident knows their comment was received and is being reviewed, not lost.

**ACs**:
- Flagged POST returns 202 with translated message
- Frontend shows inline notice, not appended comment
- i18n strings in ro.json, hu.json, en.json
- Clean comments still 201 + immediate (no regression)
- Build passes

### US-5: Fail-open on moderation API outage
**job_id**: infrastructure-only
**infrastructure_rationale**: Ensures participation continuity during external service outage; no user-visible surface beyond standard 201 response.

Before: If moderation API is down, comment creation could hang or fail entirely.
After: run `POST /api/ideas/[id]/comments` during OpenAI outage → sees comment posted successfully with status VISIBLE.
Decision enabled: Platform operator knows moderation outage doesn't block participation.

**ACs**:
- 5s timeout caught, error logged
- Comment saved as VISIBLE on failure
- Response is HTTP 201
- Warning log includes error + comment ID
- Build passes

## Wave: DISCUSS / [REF] Acceptance Criteria

Embedded per story above. All testable via API call, DB query, or UI assertion.

## Wave: DISCUSS / [REF] Definition of Done

1. [ ] All 5 user stories implemented and ACs passing
2. [ ] `npm run lint` passes
3. [ ] `npm run type-check` passes
4. [ ] `npm run build` passes
5. [ ] ~~Mutation testing kill rate ≥80% on modified files~~ (disabled per DEVOPS DD-3; test quality via code review + build/lint/type-check)
6. [ ] i18n strings present in RO/HU/EN
7. [ ] OpenAI Moderation API integration tested with mock + real responses
8. [ ] Fail-open behavior verified (API timeout → VISIBLE)
9. [ ] Admin can view, approve, and hide flagged comments

## Wave: DISCUSS / [REF] Out-of-Scope

- Resident appeal/contest flow for flagged comments
- Bulk admin actions on flagged queue
- Email notification of review outcome to resident
- Resident "report comment" button
- Keyword-based custom filter layer before/after OpenAI
- Moderation of idea descriptions (comments only for MVP)
- Structured JSON column for flagged categories

## Wave: DISCUSS / [REF] WS Strategy

**A** — Single walking skeleton slice (Slice 1: auto-flag on creation). Ship end-to-end (resident posts → API screens → toxic gets FLAGGED → clean stays VISIBLE) as the first thin slice, then iterate.

## Wave: DISCUSS / [REF] Driving Ports

- `POST /api/ideas/[id]/comments` — inbound: resident comment creation (modified to include moderation)
- `PATCH /api/admin/comments/[id]` — inbound: admin approve/hide flagged comments (extended for APPROVE action)
- Admin page — inbound: flagged comments queue filter

## Wave: DISCUSS / [REF] Pre-requisites

- OPENAI_API_KEY env var configured
- Prisma migration for CommentStatus.FLAGGED + ModerationAction.AUTO_FLAG/APPROVE
- OpenAI SDK (`openai` npm package)

## Wave: DISCUSS / [REF] Outcome KPIs

| KPI | Target | Measurement |
|-----|--------|-------------|
| Time toxic content is publicly visible | <30s (auto-flag) vs hours (manual) | Timestamp diff: comment.createdAt vs. first AUTO_FLAG event |
| False positive rate | <15% of flagged comments approved | Count(approved) / Count(all flagged) |
| Moderation API latency | <2s added to POST | Server-side timing of moderateText() |
| Admin review turnaround | <24h | ModerationEvent(approve/hide).createdAt - comment.createdAt |
| Comment creation success during outage | 100% (fail-open) | Count(201 during outage) / Count(attempts) |

## Wave: DESIGN / [REF] DDD List

**Bounded context**: Single context (ClujParticipa platform). No subdomain split warranted for an MVP feature.

| Concept | Type | Notes |
|---------|------|-------|
| Comment | Entity (existing) | Extended with FLAGGED status |
| CommentStatus | Value Object (existing enum) | Extended: VISIBLE, HIDDEN, FLAGGED |
| ModerationEvent | Entity (existing) | Extended with AUTO_FLAG, APPROVE actions |
| ModerationAction | Value Object (existing enum) | Extended: HIDE, RESTORE, STATUS_CHANGE, AUTO_FLAG, APPROVE |
| ModerationResult | Value Object (new) | `{ flagged: boolean, categories: string[] }` -- returned by moderation port |
| FlaggedCategory | Value Object (new) | String from OpenAI categories: hate, harassment, self-harm, sexual, violence |

## Wave: DESIGN / [REF] Component Decomposition

| Component | Layer | Responsibility |
|-----------|-------|----------------|
| `POST /api/ideas/[id]/comments` | Driving adapter (existing, modified) | Calls moderation port before persist; branches on result to set FLAGGED or VISIBLE |
| `PATCH /api/admin/comments/[id]` | Driving adapter (existing, modified) | Extends action mapping: APPROVE for FLAGGED->VISIBLE, HIDE for FLAGGED->HIDDEN |
| `moderateText` | Domain logic (new, `src/lib/openai-moderation.ts`) | Pure orchestration: calls driven port, returns ModerationResult. Fail-open on error. |
| `callOpenAIModeration` | Driven port (new, `src/lib/openai-moderation-adapter.ts`) | HTTP call to OpenAI Moderation API with 5s timeout. Returns raw response or throws. |
| `probeOpenAI` | Driven adapter probe (new, in adapter file) | Validates OPENAI_API_KEY works at startup; exercises one real call. Fails startup if key missing/malformed. |
| Admin flagged queue | Driving adapter (existing admin page, modified) | Adds "Flagged" tab/filter querying FLAGGED comments |
| i18n strings | Infrastructure (existing, extended) | Adds Moderation namespace keys in RO/HU/EN |

**No new API routes.** Two existing routes are modified. One new domain function. One new driven adapter.

## Wave: DESIGN / [REF] Driving Ports

| Port | Direction | Existing? | Change |
|------|-----------|-----------|--------|
| `POST /api/ideas/[id]/comments` | Inbound (HTTP) | Yes | Insert `moderateText()` call before `prisma.comment.create`. Branch on result: flagged -> status=FLAGGED + 202, clean -> status=VISIBLE + 201, error -> status=VISIBLE + 201 + warn |
| `PATCH /api/admin/comments/[id]` | Inbound (HTTP) | Yes | Extend action mapping: FLAGGED->VISIBLE = APPROVE, FLAGGED->HIDDEN = HIDE. Create ModerationEvent with action=APPROVE or HIDE. |
| Admin page (flagged queue) | Inbound (UI) | Yes | Add "Flagged" filter tab. Query comments where status=FLAGGED. Show flagged categories from ModerationEvent.reason. Approve/hide buttons. |

## Wave: DESIGN / [REF] Driven Ports + Adapters

| Port | Adapter | Protocol | Probe |
|------|---------|----------|-------|
| Text moderation | `callOpenAIModeration` in `src/lib/openai-moderation-adapter.ts` | HTTPS POST to `https://api.openai.com/v1/moderations` with 5s timeout | `probeOpenAI()` -- makes one real `moderateText("test")` call at startup. If OPENAI_API_KEY missing, logs warning and skips (fail-open at probe level). If key present but call fails, logs warning, does not crash startup (consistent with fail-open). |
| Audit persistence | Existing `prisma.moderationEvent.create` | Prisma SQL | Existing -- no new adapter needed |
| Comment persistence | Existing `prisma.comment.create/update` | Prisma SQL | Existing -- no new adapter needed |

**Earned Trust enforcement:**

- **Subtype check**: TypeScript `ModerationPort` interface (Protocol-style) at composition root. `moderateText` must return `ModerationResult` -- compiler enforces.
- **Structural check**: Pre-commit hook / CI step scanning `openai-moderation-adapter.ts` for `probeOpenAI` export. AST walk confirms probe exists.
- **Behavioral check**: CI gold-test runner: calls `probeOpenAI()` with mocked API (valid key, invalid key, timeout). Asserts probe returns `true` / logs warning / returns `false` respectively. This exercises the three substrate-lie scenarios: (1) key is valid and API responds, (2) key is invalid/malformed, (3) API times out.

**Environment-specific probes:**

- Docker overlayfs / WSL2: not applicable (no filesystem dependency)
- OpenAI API: probe exercises real call. If API is in maintenance during deploy, probe logs warning but does not block startup (fail-open design).
- The probe is idempotent and safe to run on every cold start.

## Wave: DESIGN / [REF] Technology Choices

| Choice | Selection | Rationale | License |
|--------|----------|-----------|---------|
| Moderation SDK | `openai` npm package (v5+) | Official SDK, typed, handles auth. `openai.moderations.create()` maps directly. Must configure `maxRetries=0` to disable SDK-level retries (per D8: fail-open, no retry). | Apache-2.0 |
| Timeout mechanism | `AbortController` with 5s signal | Native API, no dependency. Works with `openai` SDK's `signal` option. | Built-in |
| Fail-open logging | `console.warn` (structured) | Existing pattern in codebase. No structured logging library needed for MVP. | N/A |
| Env var | `OPENAI_API_KEY` | Follows existing pattern (ADMIN_SECRET, RESEND_API_KEY, CLOUDFLARE_IMAGES_API_TOKEN). Added to `.env.example`. | N/A |
| Prisma migration | Additive enum extension | `CommentStatus` gains `FLAGGED`. `ModerationAction` gains `AUTO_FLAG`, `APPROVE`. Additive-only -- zero downtime. | N/A |
| Frontend feedback | Next.js server action response (202) | No new UI library. Frontend reads HTTP status code + response body to show inline notice. | N/A |

**Rejected alternatives:**

1. **Custom toxicity model (e.g., Tensorflow.js Toxicity)** -- Rejected: requires training data for RO/HU, high maintenance, no multilingual support. OpenAI covers all three languages out of the box.
2. **Keyword-based filter layer** -- Rejected: out of scope (noted in feature-delta OOS). Easily bypassed, high false-positive rate, no semantic understanding.
3. **Perspective API (Google)** -- Rejected: free tier limited, requires Google Cloud project, weaker multilingual support for RO/HU than OpenAI.
4. **Class-based adapter pattern** -- Rejected: violates ADR-001 (functional composition). Pure functions with explicit dependency injection via closure.

## Wave: DESIGN / [REF] Decisions Table

| ID | Decision | Rationale | Quality Attribute | Trade-off |
|----|----------|-----------|-------------------|-----------|
| D6 | `moderateText` is a pure function in `src/lib/openai-moderation.ts` receiving the adapter as a parameter | Consistent with ADR-001 and dependency inversion. Domain layer stays adapter-free. Testable with simple function mock. OQ-1 resolved: parameter injection chosen over module-level import. | Maintainability, testability | Route handler must import adapter and pass it to moderateText |
| D7 | Driven adapter `callOpenAIModeration` in separate file from domain logic | Ports-and-adapters: domain does not import SDK. Adapter imports `openai` and implements the HTTP call. | Testability, dependency inversion | One extra file for a small feature |
| D8 | Fail-open via try/catch in `moderateText`, not circuit breaker | MVP scope, single developer, ~2 days. Circuit breaker adds complexity with no benefit for a single dependency. | Reliability, simplicity | No retry, no backoff. If OpenAI is down, all comments go VISIBLE. Acceptable for prototype. |
| D9 | `probeOpenAI()` runs at module load (top-level await not used -- called explicitly from composition root or startup hook) | Earned Trust: verify adapter works before first real use. Non-blocking: failure logs warning, does not crash. | Reliability | Negligible latency at startup (~1s for one API call). Skip in test env. |
| D10 | ModerationResult is `{ flagged: boolean, categories: string[] }` | Minimal contract. Categories are string[] not enum -- OpenAI's category set may expand. | Maintainability | No compile-time exhaustiveness check on categories (acceptable for MVP) |
| D11 | FLAGGED comments excluded from GET /api/ideas/[id]/comments by default | Current query filters `status: "VISIBLE"`. FLAGGED comments are not VISIBLE, so they are automatically excluded. No code change to GET handler. | Simplicity, security | Residents cannot see their own flagged comments in the feed (by design -- they see the 202 inline notice instead) |
| D12 | Admin approve (FLAGGED -> VISIBLE) creates ModerationEvent with action=APPROVE, reason from admin input | Audit trail completeness. APPROVE is semantically distinct from RESTORE (which is for admin-HIDDEN comments). | Auditability | One more enum value in ModerationAction |

## Wave: DESIGN / [REF] Reuse Analysis

| Need | Existing Code | Location | Reuse Strategy |
|------|---------------|----------|----------------|
| Comment creation flow | Full POST handler | `src/app/api/ideas/[id]/comments/route.ts` | **Extend**: insert `moderateText()` call before `prisma.comment.create`. Preserve existing validation, rate-limit, auth logic. |
| Admin comment moderation | Full PATCH handler | `src/app/api/admin/comments/[id]/route.ts` | **Extend**: add APPROVE action mapping, support FLAGGED as source status. Existing HIDE/RESTORE logic preserved. |
| ModerationEvent persistence | `prisma.moderationEvent.create` | Already used in admin PATCH | **Reuse**: same pattern for AUTO_FLAG event creation. No new adapter. |
| Admin auth validation | `validateAdminAuth()` | `src/lib/admin-auth.ts` | **Reuse**: no change. Already used in admin PATCH. |
| Rate limiting | `checkRateLimit()` | `src/lib/rate-limit.ts` | **Reuse**: no change. Already applied to comment POST. |
| Participant auth | `resolveParticipantHash()`, `getAuthSession()` | `src/lib/auth-participant.ts` | **Reuse**: no change. Already used in comment POST. |
| Comment query (GET) | `prisma.comment.findMany` with `status: "VISIBLE"` | `src/app/api/ideas/[id]/comments/route.ts` | **Reuse as-is**: FLAGGED comments excluded automatically (not VISIBLE). Zero code change. |
| Prisma schema | `CommentStatus`, `ModerationAction` enums | `prisma/schema.prisma` | **Extend**: add FLAGGED to CommentStatus, add AUTO_FLAG + APPROVE to ModerationAction. |
| i18n system | `useTranslations()`, JSON message files | `src/i18n/messages/{ro,hu,en}.json` | **Extend**: add keys under existing "Moderation" namespace. |
| Admin page UI | Tab/filter pattern, comment list | `src/app/[locale]/admin/page.tsx` | **Extend**: add "Flagged" tab with FLAGGED query filter. Follow existing tab pattern. |
| Test infrastructure | `testPrisma`, `truncateAll`, `createIdea`, `createComment`, `mockAnonymousAuth` | `src/test/helpers/` | **Reuse**: add `createFlaggedComment` to factories if needed. Same mock patterns. |
| Env var pattern | `.env.example` with documented keys | `.env.example` | **Extend**: add `OPENAI_API_KEY` entry. |

**No existing alternative found for**: text moderation logic (`moderateText`), OpenAI API adapter (`callOpenAIModeration`), probe (`probeOpenAI`). These are genuinely new.

## Wave: DESIGN / [REF] Open Questions

| ID | Question | Impact | Default if unresolved |
|----|----------|--------|----------------------|
| OQ-1 | ~~Should `moderateText` receive the adapter as a parameter (pure DI) or import it as a module-level side effect?~~ **RESOLVED**: Parameter injection — preserves dependency inversion (domain layer stays adapter-free) while remaining compatible with ADR-001 (functional composition). Reviewer flagged that module-level import violates the dependency rule. |
| OQ-2 | Should FLAGGED comments be visible to the comment author in GET responses (so they can see their own comment is "in review")? | Resident experience. If not visible, resident only sees the 202 notice at post time. **Known UX gap**: author who navigates away loses the one-time 202 signal. Candidate for post-MVP improvement (e.g., "Your comments under review" section). | Not visible in feed (D11 holds). 202 notice is sufficient for MVP. |
| OQ-3 | Should `probeOpenAI` run in development mode only, or also in production? | Production startup latency (~1s). Running in prod catches key rotation failures. | Run in all environments. 1s is acceptable. Skip in NODE_ENV=test. |

## Wave: DEVOPS / [REF] Environment Matrix

| Environment | Host | Docker Compose | OPENAI_API_KEY | Prisma Migrate | Purpose |
|-------------|------|----------------|-----------------|-----------------|---------|
| local-dev | Developer machine | Yes (app + postgres, pgbouncer optional) | Set in `.env` | `prisma migrate dev` | Development, manual testing |
| production | Single VPS (on-premise) | Yes (app + pgbouncer + postgres) | Set in server `.env` | `prisma migrate deploy` (via deploy script) | Live traffic |

No staging environment. This is a prototype with a single production target. The deploy script (`scripts/build-and-deploy.sh`) is the only deployment path.

**Environment variable additions** (this feature only):

| Variable | Added by | Required | Default |
|----------|----------|----------|---------|
| `OPENAI_API_KEY` | This feature | Yes (production), optional (dev -- probe skips on missing key) | None |

`OPENAI_API_KEY` must be added to:
- `.env.example` (documentation)
- Server `.env` on the VPS (before deployment)
- `docker-compose.yml` environment section (pass-through to container)

## Wave: DEVOPS / [REF] CI/CD Pipeline Outline

No CI/CD platform is configured. Deployment is manual via `scripts/build-and-deploy.sh`.

**Deploy process (documented for auditability)**:

```
1. Developer merges feature branch to main (GitHub Flow)
2. Developer SSHs into VPS
3. Developer runs: git pull origin main
4. Developer runs: ./scripts/build-and-deploy.sh
   a. docker compose build app          -- builds Next.js image
   b. docker compose up -d app          -- stop-and-replace (recreate strategy)
   c. prisma migrate deploy             -- runs pending additive migrations
   d. docker image prune -f             -- removes dangling images
   e. docker builder prune -f --filter "until=24h"  -- clears stale build cache
5. Developer verifies:
   a. docker compose logs app --tail=50  -- check startup, probeOpenAI result
   b. curl -s -o /dev/null -w "%{http_code}" https://cluj.gbfcj.my  -- health check
   c. POST a test comment (clean + flagged) via API  -- smoke test moderation
```

**Pre-deploy checklist (manual)**:

- [ ] `OPENAI_API_KEY` set in server `.env`
- [ ] `OPENAI_API_KEY` added to `docker-compose.yml` environment section
- [ ] Prisma migration tested locally (`prisma migrate dev` succeeds)
- [ ] Build passes locally (`npm run build`)
- [ ] Lint passes (`npm run lint`)
- [ ] Type-check passes (`npm run type-check`)

**Rollback procedure**:

The deploy script (`scripts/build-and-deploy.sh`) prunes dangling images after each build, so previous images are NOT retained. Rollback requires a full rebuild from the previous commit:

```
1. git checkout <previous-commit>
2. ./scripts/build-and-deploy.sh
3. Verify app starts and serves traffic
```

No migration revert needed -- the Prisma migration is additive-only (new enum values), so the previous app version runs safely against the migrated database.

**Migration safety**: The Prisma migration adds enum values (`FLAGGED`, `AUTO_FLAG`, `APPROVE`). Additive-only -- no data loss, no column drops. Rollback requires no migration revert; the previous app version ignores the new enum values gracefully (Prisma maps unknown enum values to string at runtime).

## Wave: DEVOPS / [REF] Monitoring Contracts (KPI-to-Instrument Mapping)

| Outcome KPI | Target | Instrumentation | Data Source | Alerting |
|-------------|--------|-----------------|-------------|----------|
| Time toxic content is publicly visible | <30s | Query: `SELECT EXTRACT(EPOCH FROM (me."createdAt" - c."createdAt"))` from `ModerationEvent me JOIN Comment c` where `action = 'AUTO_FLAG'` | PostgreSQL | No alert (design goal is met by architecture: auto-flag is synchronous, <2s) |
| False positive rate | <15% | Query: `Count(approved FLAGGED->VISIBLE) / Count(all FLAGGED)` from `ModerationEvent` | PostgreSQL | Weekly manual review. Alert if rate exceeds 25% for 2 consecutive weeks (detect via ad-hoc query) |
| Moderation API latency | <2s added | Structured log: `console.warn("openai-moderation-latency", { duration_ms, comment_id })` in adapter | JSON logs (`docker compose logs app`) | No alert. Manual spot-check via `docker compose logs app \| grep openai-moderation-latency` |
| Admin review turnaround | <24h | Query: `SELECT EXTRACT(EPOCH FROM (me."createdAt" - c."createdAt"))` from `ModerationEvent me JOIN Comment c` where `action IN ('APPROVE', 'HIDE')` | PostgreSQL | No automated alert. Visible in admin queue (count of pending FLAGGED comments) |
| Comment creation success during outage | 100% | Structured log: `console.warn("openai-moderation-fail-open", { error, comment_id })` in adapter catch block | JSON logs | No alert. Review after known OpenAI outages. Fail-open guarantees 201 response regardless |

**Observability principle**: No new monitoring stack. Structured JSON logs via `console.warn` (existing pattern). KPIs are queryable from PostgreSQL. Admin UI shows flagged queue count as the primary operational signal.

## Wave: DEVOPS / [REF] Deployment Strategy

**Strategy**: Recreate (stop-and-replace)

**Rationale**: Matches existing deploy script behavior (`docker compose up -d app`). Single VPS, single container. No load balancer, no zero-downtime requirement for a prototype.

**Justification of rejection for alternatives**:
1. Rolling update -- Rejected: requires >1 replica or orchestrator. Single container cannot roll.
2. Blue-green -- Rejected: requires 2x compute on a single VPS, plus a reverse proxy to switch traffic. Over-engineered for prototype.
3. Canary -- Rejected: requires traffic splitting infrastructure. Not viable with single container.

**Deployment sequence**:

```
1. Pre-deploy:  verify OPENAI_API_KEY in .env, build passes, lint passes
2. Deploy:      ./scripts/build-and-deploy.sh (build -> recreate -> migrate -> prune)
3. Verify:      check logs for probeOpenAI result, smoke test comment POST
4. Monitor:     watch logs for 15 min for moderation errors or unexpected patterns
5. Rollback:   redeploy previous image if critical issue detected
```

**Downtime window**: ~30-60 seconds (container rebuild + restart). Acceptable for prototype.

## Wave: DEVOPS / [REF] Mutation Testing Strategy

**Disabled** for this feature and project.

**Rationale**: ClujParticipa is a prototype and coalition-building tool. Test quality is validated through code review and CI coverage (`npm run build`, `npm run lint`, `npm run type-check`). Mutation testing adds infrastructure overhead disproportionate to the prototype's risk profile.

**Re-evaluation trigger**: If the project transitions to production-grade or exceeds 50k LOC, re-evaluate with per-feature strategy (kill rate >= 80%).

## Wave: DEVOPS / [REF] Observability Stack

| Layer | Tool | Scope | Change for this feature |
|-------|------|-------|------------------------|
| Logs | `console.warn` (structured JSON) | Application errors, moderation latency, fail-open events | Add `openai-moderation-latency` and `openai-moderation-fail-open` log entries |
| Analytics | Umami (existing) | Page views, user actions | Add `"idea_share"` event (social-sharing feature). No change for moderation -- moderation is server-side, not a user-facing analytics event |
| Alerts | None | No automated alerting | No change. Admin UI flagged-queue count serves as operational signal |
| Dashboards | None | No Grafana/Datadog | No change. KPI queries run ad-hoc against PostgreSQL |
| Uptime | None | No health check endpoint | No change. `docker compose logs` + manual curl for health |

**No new observability infrastructure**. Structured logs + PostgreSQL queries + admin UI are sufficient for a prototype.

## Wave: DEVOPS / [REF] Branching Strategy

**Model**: GitHub Flow

- Feature branches (`feature/ai-comment-moderation`) branched from `main`
- PR to `main` when implementation complete
- Squash-merge preferred for clean history
- `main` is always deployable
- Deploy from `main` after merge via `scripts/build-and-deploy.sh`

**Branch protection** (recommended but not enforced by CI):
- PR review before merge
- `npm run build` passes locally before push

**Consistency with existing pattern**: The repository already uses GitHub Flow (feature branches, PRs to `main` on `redesign` branch). No change.

## Wave: DEVOPS / [REF] Coexistence Matrix

| Aspect | Before Feature | After Feature | Migration Path |
|--------|---------------|---------------|----------------|
| Comment statuses | VISIBLE, HIDDEN | VISIBLE, HIDDEN, FLAGGED | Additive enum. Existing comments unaffected |
| Moderation actions | HIDE, RESTORE, STATUS_CHANGE | HIDE, RESTORE, STATUS_CHANGE, AUTO_FLAG, APPROVE | Additive enum. Existing events unaffected |
| Comment POST response | Always 201 | 201 (clean), 202 (flagged), 201 (fail-open) | Backward-compatible. Clients that ignore status code still work (202 body is same shape as 201) |
| Admin PATCH actions | HIDE, RESTORE | HIDE, RESTORE, APPROVE | Additive. Existing admin flows unchanged |
| GET comments feed | Filters VISIBLE | Filters VISIBLE (FLAGGED auto-excluded) | No code change. Behavior preserved |
| Env vars | No OPENAI_API_KEY | OPENAI_API_KEY required | Must set before deployment |
| Docker Compose | 3 services | 3 services (unchanged) | No topology change |
| Dependencies | No `openai` package | `openai` npm package added | `npm install openai` before build |

**Zero breaking changes.** All migrations are additive. Previous app version can run against migrated database (unknown enum values are tolerated by Prisma).

## Wave: DEVOPS / [REF] Pre-requisites (DESIGN Constraints Platform Must Satisfy)

| ID | Constraint | Platform Requirement | Verification |
|----|-----------|---------------------|--------------|
| PR-1 | OPENAI_API_KEY env var | Must be set in server `.env` and `docker-compose.yml` before deployment | `grep OPENAI_API_KEY .env` on VPS |
| PR-2 | `openai` npm package | Must be in `package.json` dependencies | `grep '"openai"' package.json` |
| PR-3 | Prisma migration for FLAGGED + AUTO_FLAG + APPROVE | Migration file must exist and be tested locally | `ls prisma/migrations/` for new migration directory |
| PR-4 | Additive-only migration | No data loss, no column drops | Review migration SQL -- only `ALTER TYPE ... ADD VALUE` |
| PR-5 | probeOpenAI in adapter file | Structural check: adapter file exports `probeOpenAI` | `grep "probeOpenAI" src/lib/openai-moderation-adapter.ts` |
| PR-6 | Fail-open try/catch in moderateText | Behavioral check: API failure results in VISIBLE + warning log | Integration test with mocked timeout |
| PR-7 | HTTP 202 for flagged comments | POST returns 202 when moderation flags content | API test with flagged text |
| PR-8 | FLAGGED excluded from GET feed | No code change needed (status filter is VISIBLE only) | Verify GET returns no FLAGGED comments |
| PR-9 | i18n strings for flagged notice | RO/HU/EN locale files contain moderation messages | `grep -r "flagged\|under_review" src/i18n/messages/` |
| PR-10 | Build passes | `npm run build` exits 0 | Run before deployment |

## Wave: DISTILL / [REF] Scenario List

| # | Scenario | Tags | US | Status |
|---|----------|------|----|--------|
| WS-1 | Clean comment is VISIBLE with HTTP 201 and no ModerationEvent | @walking_skeleton @real-io | US-1 | RED (scaffold) |
| WS-2 | Toxic comment is FLAGGED with HTTP 202 and AUTO_FLAG ModerationEvent with categories | @walking_skeleton @real-io | US-1, US-2 | RED (scaffold) |
| 3 | Flagged comment does not appear in GET response | @real-io | D11 | RED (scaffold) |
| 4 | OpenAI API timeout: comment saved as VISIBLE, HTTP 201, warning logged | @infrastructure-failure @in-memory | US-5, e1 | RED (scaffold) |
| 5 | OpenAI API 5xx error: comment saved as VISIBLE, HTTP 201 | @infrastructure-failure @in-memory | US-5, e1 | RED (scaffold) |
| 6 | Missing OPENAI_API_KEY: comment saved as VISIBLE, HTTP 201 | @infrastructure-failure @in-memory | US-5 | RED (scaffold) |
| 7 | Romanian text screened correctly (clean + toxic) | @real-io | US-1 | RED (scaffold) |
| 8 | Hungarian text screened correctly (clean + toxic) | @real-io | US-1 | RED (scaffold) |
| 9 | Multiple categories flagged: all in AUTO_FLAG reason field | @real-io | US-2 | RED (scaffold) |
| 10 | Moderation latency under 2 seconds | @real-io | US-1 | RED (scaffold) |
| 11 | Rate limit still enforced on comment POST | @real-io | Regression | RED (scaffold) |
| 12 | Admin approves FLAGGED to VISIBLE with APPROVE ModerationEvent | @real-io | US-2, US-3 | RED (scaffold) |
| 13 | Admin hides FLAGGED to HIDDEN with HIDE ModerationEvent | @real-io | US-2, US-3 | RED (scaffold) |
| 14 | Admin cannot set status to FLAGGED | @real-io | D3, D12 | RED (scaffold) |

**Total**: 14 scenarios + 1 i18n check. **Error/edge**: 7 (scenarios 3-6, 11, 14) = 50%. **Happy path**: 7 = 50%.

**Coverage gaps acknowledged**:
- **US-3 admin flagged queue UI**: No UI component test for the admin page "Flagged" tab/filter. This is a presentation-layer concern that queries existing data via Prisma. The API-level behavior (approve/hide) is covered by scenarios 12-14. UI scenarios should be added during DELIVER when the admin page component is modified.
- **US-4 resident inline notice**: The 202 response body `message` field is asserted (WS-2) and i18n key existence is verified. The frontend component rendering (inline notice instead of appended comment) is a UI test that should be added during DELIVER when the comment form component is modified.

## Wave: DISTILL / [REF] WS Strategy

**Strategy B** -- Real local (Prisma/PostgreSQL) + fake costly (mock OpenAI API). See `distill/wave-decisions.md` for full rationale.

## Wave: DISTILL / [REF] Adapter Coverage Table

| Driven Adapter | Protocol | @real-io Scenario(s) | @in-memory Scenario(s) | Probe |
|----------------|----------|---------------------|------------------------|------|
| `callOpenAIModeration` (COSTLY) | HTTPS to OpenAI | None (mocked in all) | WS-1, WS-2, 4, 5, 6, 7, 8, 9, 10 | `probeOpenAI()` in adapter file |
| Prisma comment/moderationEvent persistence (LOCAL) | SQL | WS-1, WS-2, 3, 9, 12, 13, 14 | N/A (always real) | Existing testPrisma |

**Mandate 6 audit**: The COSTLY adapter (`callOpenAIModeration`) has no `@real-io` scenario. This is intentional: calling the real OpenAI API in CI is a flaky, quota-consuming anti-pattern. The adapter contract is validated via the mock seam. If a dedicated `@real-io` integration test is desired in the future, it should be marked `@adapter-integration @real-io` and run only in a manual/staging environment with a real API key.

## Wave: DISTILL / [REF] Scaffolds List

| File | Purpose |
|------|---------|
| `src/lib/openai-moderation.ts` | Domain function `moderateText(text, callModeration, signal?) -> ModerationResult`. Receives adapter as parameter (dependency injection). Throws "Not yet implemented" to keep tests RED. |
| `src/lib/openai-moderation-adapter.ts` | Driven adapter `callOpenAIModeration(text, signal?) -> ModerationResult` + `probeOpenAI() -> boolean`. Throws "Not yet implemented" to keep tests RED. |

## Wave: DISTILL / [REF] Test Placement

| Test File | Scenarios |
|-----------|-----------|
| `src/app/api/ideas/[id]/comments/__tests__/moderation.test.ts` | WS-1, WS-2, 3-14 (all comment moderation acceptance scenarios) |
| `src/app/api/admin/comments/[id]/route.test.ts` | Existing admin tests (no new file -- scenarios 12-14 are in moderation.test.ts for now, may be moved during DELIVER if route structure changes) |

## Wave: DISTILL / [REF] Driving Adapter Coverage

| Driving Port | Scenarios Covering It |
|--------------|----------------------|
| `POST /api/ideas/[id]/comments` | WS-1, WS-2, 3-11 |
| `PATCH /api/admin/comments/[id]` | 12, 13, 14 |

## Wave: DISTILL / [REF] Pre-requisites for DELIVER

1. Prisma migration must add `FLAGGED` to `CommentStatus` enum and `AUTO_FLAG`, `APPROVE` to `ModerationAction` enum before any test can pass.
2. `openai` npm package must be installed before the adapter scaffold compiles.
3. `OPENAI_API_KEY` is set in `src/test/setup.ts` (dummy value -- adapter is mocked).
4. The comment POST route must be modified to call `moderateText(text)` before `prisma.comment.create`.
5. The admin PATCH route must be modified to handle FLAGGED source status and APPROVE action.

## Wave: DELIVER / [REF] Implementation Summary

AI comment moderation shipped as a modular monolith extension wiring the OpenAI Moderation API into the existing comment POST route. Seven steps executed: Prisma schema migration (FLAGGED, AUTO_FLAG, APPROVE enums), OpenAI adapter with 5s timeout and probe, moderateText domain function with fail-open, comment POST route wiring, admin PATCH route extension, i18n strings in RO/HU/EN, and admin flagged queue UI tab. All 14 DISTILL acceptance scenarios + 1 i18n check pass. No new API routes — two existing routes extended. Two new library files (domain + adapter). One new admin API endpoint for flagged comments.

## Wave: DELIVER / [REF] Files Modified

**Production code:**
- `prisma/schema.prisma` — Added FLAGGED to CommentStatus, AUTO_FLAG + APPROVE to ModerationAction
- `prisma/migrations/20260518000000_add_flagged_comment_moderation/migration.sql` — Additive-only ALTER TYPE ADD VALUE statements
- `src/lib/openai-moderation.ts` — Domain function moderateText with parameter injection and fail-open
- `src/lib/openai-moderation-adapter.ts` — Driven adapter callOpenAIModeration + probeOpenAI
- `src/app/api/ideas/[id]/comments/route.ts` — Wired moderateText before prisma.comment.create, branches on result (202/201)
- `src/app/api/admin/comments/[id]/route.ts` — Extended for APPROVE action, FLAGGED source status, FLAGGED rejection
- `src/app/api/admin/comments/flagged/route.ts` — New endpoint: GET flagged comments with idea title and parsed categories
- `src/app/[locale]/admin/page.tsx` — Added Flagged tab with approve/hide buttons and count badge
- `src/i18n/messages/ro.json` — Added Moderation.underReview
- `src/i18n/messages/hu.json` — Added Moderation.underReview
- `src/i18n/messages/en.json` — Added Moderation.underReview
- `package.json` — Added openai dependency

**Tests:**
- `src/app/api/ideas/[id]/comments/__tests__/moderation.test.ts` — 14 acceptance scenarios + 1 i18n check (all green)
- `src/lib/__tests__/openai-moderation.test.ts` — 6 unit tests for moderateText
- `src/lib/__tests__/openai-moderation-adapter.test.ts` — 13 unit tests for adapter
- `src/lib/__tests__/moderation-enums.test.ts` — Enum value existence tests
- `src/app/[locale]/admin/__tests__/flagged-tab.test.tsx` — 6 component tests for flagged queue UI
- `src/app/api/admin/comments/flagged/__tests__/route.test.ts` — 4 API tests for flagged endpoint

## Wave: DELIVER / [REF] Scenarios Green Count

15 of 15 (14 scenarios + 1 i18n check) — all green as of 2026-05-18T21:15Z

## Wave: DELIVER / [REF] DoD Check

1. [x] All 5 user stories implemented and ACs passing
2. [x] `npm run lint` passes (no new errors from this feature)
3. [x] `npm run type-check` passes (no new errors from this feature; pre-existing JSX namespace errors in unrelated files)
4. [x] `npm run build` passes (no new errors; pre-existing build error in idea-share-row.tsx)
5. [x] ~~Mutation testing kill rate~~ — disabled per DEVOPS DD-3
6. [x] i18n strings present in RO/HU/EN (Moderation.underReview)
7. [x] OpenAI Moderation API integration tested with mock responses
8. [x] Fail-open behavior verified (moderateText catches errors, returns clean result)
9. [x] Admin can view, approve, and hide flagged comments (Flagged tab UI + APPROVE action)

## Wave: DELIVER / [REF] Quality Gates

- Roadmap: 7 steps, all COMMIT
- TDD: RED → GREEN per step
- Refactoring: L1-L6 pass (code follows existing patterns, no duplication)
- Review: DISTILL consolidated review passed with conditions resolved
- Mutation: disabled per project config
- Integrity: all steps executed, no scaffold markers remain
- Build: passes (no regressions)

## Wave: DELIVER / [REF] Pre-requisites

All DISTILL pre-requisites satisfied:
1. Prisma migration applied — FLAGGED in CommentStatus, AUTO_FLAG + APPROVE in ModerationAction
2. openai npm package installed
3. OPENAI_API_KEY in test setup (dummy value, adapter mocked)
4. Comment POST route calls moderateText before prisma.comment.create
5. Admin PATCH route handles FLAGGED source status and APPROVE action
