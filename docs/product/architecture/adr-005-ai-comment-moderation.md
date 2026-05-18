# ADR-005: AI Comment Moderation via OpenAI Moderation API

**Status**: Accepted

**Date**: 2026-05-18

## Context

ClujParticipa allows residents to post comments on ideas. Currently, toxic comments remain publicly visible until an admin manually hides them -- potentially hours. The platform needs automatic content screening to protect the discussion space 24/7.

Requirements:
- Multilingual support (RO, HU, EN)
- Low latency (<2s added to comment POST)
- Fail-open: API outage must not block comment creation
- Full audit trail of auto-flag events
- Single developer, MVP scope, ~2 days effort
- Existing stack: Next.js App Router, Prisma, PostgreSQL
- Functional composition paradigm (ADR-001)

## Decision

Integrate the **OpenAI Moderation API** as a driven adapter behind a `moderateText` domain function. The comment creation route calls `moderateText` before persisting. Flagged comments receive status `FLAGGED` and HTTP 202. Clean comments remain `VISIBLE` with HTTP 201 (no regression). API failures result in `VISIBLE` status (fail-open) with a warning log.

**New components**:
- `src/lib/openai-moderation.ts` -- domain function `moderateText(text: string): Promise<ModerationResult>`
- `src/lib/openai-moderation-adapter.ts` -- driven adapter `callOpenAIModeration(text: string, signal?: AbortSignal): Promise<OpenAIResponse>` + `probeOpenAI(): Promise<boolean>`

**Modified components**:
- `POST /api/ideas/[id]/comments` -- insert `moderateText()` call, branch on result
- `PATCH /api/admin/comments/[id]` -- add APPROVE action, support FLAGGED source status
- `prisma/schema.prisma` -- add FLAGGED to CommentStatus, AUTO_FLAG + APPROVE to ModerationAction
- Admin page -- add "Flagged" filter tab
- i18n files -- add moderation feedback keys

## Alternatives Considered

1. **Google Perspective API** -- Viable for EN but weaker multilingual support for RO/HU. Requires Google Cloud project setup. Free tier has rate limits. Rejected: OpenAI has better RO/HU coverage out of the box and no project setup overhead.

2. **Custom keyword-based filter** -- Simple but easily bypassed, no semantic understanding, high false-positive rate, no multilingual nuance. Rejected: does not meet the quality bar for even a prototype. Noted as out-of-scope in feature-delta.

3. **Tensorflow.js Toxicity model (client-side)** -- No server-side dependency, but requires training data for RO/HU, increases client bundle size significantly, model updates require redeployment. Rejected: training data gap is fatal for multilingual requirement.

4. **Class-based adapter with dependency injection** -- Classic ports-and-adapters OOP pattern. Rejected: violates ADR-001 (functional composition). Existing codebase uses zero classes in domain/application layers. Pure function with module-level import is simpler and consistent.

5. **Circuit breaker (resilience4j-style) for OpenAI API** -- Provides retry, backoff, half-open state. Rejected: over-engineering for MVP with single external dependency. Try/catch with 5s timeout is sufficient. A circuit breaker would add ~50 lines of stateful logic for a feature that explicitly favors fail-open over retry.

## Consequences

- Positive: Zero licensing cost (OpenAI SDK is Apache-2.0, API is pay-per-use at ~$0.001/1K tokens)
- Positive: Multilingual coverage for all three platform languages without training data
- Positive: Consistent with existing architectural patterns (functional composition, ports-and-adapters, additive Prisma migrations)
- Positive: Fail-open design means the feature degrades gracefully -- participation is never blocked
- Negative: Third-party dependency on OpenAI (mitigated by fail-open, probe contract, and the fact that the adapter is a single file that can be swapped for a different provider)
- Negative: Added latency to comment POST (~0.5-1.5s typical, capped at 5s timeout) (mitigated by being within the <2s budget for most calls; worst-case 5s is still acceptable for a prototype)
- Negative: No retry on transient failures -- fail-open means a brief outage sends all comments through unmoderated (acceptable for prototype; can add retry in future iteration if false-negative rate during outages is problematic)

## Quality Attribute Mapping

| Attribute | How satisfied |
|-----------|--------------|
| Latency (<2s) | OpenAI Moderation API typically 0.3-1.5s. 5s timeout is hard cap. Fail-open path is instant. |
| Reliability (fail-open) | try/catch with 5s AbortController timeout. Error path: VISIBLE + warn log. 100% creation success. |
| Auditability | AUTO_FLAG ModerationEvent on every auto-flag. APPROVE event on admin approval. Full trail in existing ModerationEvent table. |
| Maintainability | Two new files (domain + adapter), two modified routes, one Prisma migration. Extends existing patterns. |

## Probe Contract (Earned Trust)

The driven adapter includes `probeOpenAI()` which:
1. Checks OPENAI_API_KEY is present and non-empty
2. Makes one real `moderateText("test")` call
3. Returns `true` if the API responds with valid structure, `false` otherwise
4. Is called at application startup (composition root)
5. Failure logs a structured warning but does not crash the process (consistent with fail-open)
6. Is skipped in NODE_ENV=test (mocked in CI)

Enforcement layers:
- **Subtype**: TypeScript `ModerationPort` interface ensures `moderateText` returns `ModerationResult`
- **Structural**: CI step scanning adapter file for `probeOpenAI` named export
- **Behavioral**: CI gold-test exercising probe with valid key, invalid key, and timeout scenarios
