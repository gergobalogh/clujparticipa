# DEVOPS Wave Decisions — ai-comment-moderation

## Deployment Decisions

| ID | Decision | Rationale | Quality Attribute | Trade-off |
|----|----------|-----------|-------------------|-----------|
| DD-1 | Recreate deployment strategy (stop-and-replace) | Matches existing `docker compose up -d app` in deploy script. Single container, no orchestrator. | Simplicity | ~30-60s downtime per deploy. Acceptable for prototype. |
| DD-2 | No CI/CD pipeline | Manual deploy via `scripts/build-and-deploy.sh`. No GitHub Actions. Project has no CI/CD platform and one developer. | Simplicity | No automated quality gates. Mitigated by local pre-deploy checklist. |
| DD-3 | Mutation testing disabled | Prototype scope. Test quality via code review + `npm run build/lint/type-check`. Re-evaluate at 50k LOC or production transition. | Simplicity | No mutation kill rate gate. Acceptable for prototype risk profile. |
| DD-4 | Structured JSON logs only (no new monitoring stack) | Existing pattern: `console.warn` with structured objects. No Grafana, Datadog, or Prometheus. | Simplicity, cost | No automated alerting. Admin UI flagged-queue count is primary operational signal. |
| DD-5 | OPENAI_API_KEY added to docker-compose.yml environment section | Follows existing pattern (ADMIN_SECRET, RESEND_API_KEY). Container must receive env var at startup for `probeOpenAI`. | Consistency | Key visible in compose file (same as other secrets -- acceptable on single VPS with restricted SSH access). |
| DD-6 | Additive-only Prisma migration, no rollback migration | FLAGGED + AUTO_FLAG + APPROVE are new enum values. No data loss. Previous app version tolerates unknown enum values via Prisma string mapping. | Reliability | If app fails after deploy, previous image can run against migrated DB without reverting migration. |
| DD-7 | Rollback = redeploy previous commit | No blue-green, no image tagging. `git checkout <previous-commit> && ./scripts/build-and-deploy.sh`. | Simplicity | Rollback takes ~5 min (full rebuild). Acceptable for prototype. |
| DD-8 | probeOpenAI runs in production | Catches key rotation failures at startup. 1s latency acceptable. Skip in NODE_ENV=test. | Reliability | Startup depends on OpenAI API being reachable. Non-blocking: failure logs warning, does not crash. |

## KPI Instrumentation Decisions

| KPI | Instrumentation Method | Rationale |
|-----|----------------------|-----------|
| Time toxic content is publicly visible | PostgreSQL query (timestamp diff) | Auto-flag is synchronous; by design <2s. No real-time alerting needed. Ad-hoc query for reporting. |
| False positive rate | PostgreSQL query (approved / all flagged) | Weekly manual review sufficient. No automated alert at prototype scale. |
| Moderation API latency | Structured log: `openai-moderation-latency` | Spot-check via `docker compose logs`. No aggregation. |
| Admin review turnaround | PostgreSQL query (ModerationEvent - Comment timestamp diff) | Admin UI flagged-queue count provides operational signal. |
| Comment creation success during outage | Structured log: `openai-moderation-fail-open` | Fail-open guarantees 100% by architecture. Log confirms behavior. |

## Branching and Release

| Aspect | Decision |
|--------|----------|
| Model | GitHub Flow |
| Feature branch | `feature/ai-comment-moderation` from `main` (or `redesign`) |
| Merge strategy | Squash-merge to `main` |
| Deploy trigger | Manual after merge to `main` |
| Release tagging | None (prototype) |

## Observability Decisions

| Aspect | Decision |
|--------|----------|
| Logging | `console.warn` with structured JSON objects (existing pattern) |
| Log entries added | `openai-moderation-latency` (duration_ms, comment_id), `openai-moderation-fail-open` (error, comment_id) |
| Metrics | None (no Prometheus/Grafana) |
| Tracing | None (no OpenTelemetry) |
| Alerting | None automated. Admin UI flagged-queue count + manual log review |
| Dashboards | None. KPI queries run ad-hoc against PostgreSQL |
