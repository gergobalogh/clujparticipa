# DISTILL Decisions — ai-comment-moderation

## WS Strategy

**Strategy B — Real local (Prisma/PostgreSQL) + fake costly (mock OpenAI API)**

Justification: OpenAI Moderation API is a COSTLY driven adapter (network call, paid quota, flaky). Prisma/PostgreSQL is LOCAL and already exercised via real I/O in the existing test suite. Mocking OpenAI at the module boundary (`vi.mock("@/lib/openai-moderation-adapter")`) isolates test execution from external service availability while preserving real database transaction semantics for comment creation and ModerationEvent persistence.

## Test Format

**Vitest + .test.ts files only.** No Cucumber/.feature executable test files.

Rationale: Existing project convention uses Vitest with `globals: true`, `environment: "node"`, `pool: "forks"`. The journey Gherkin file (`auto-moderate-comment.yaml`) is documentation only, not an executable specification. Introducing Cucumber would add tooling overhead with no benefit for a team already fluent in Vitest.

## Reconciliation Result

DISCUSS proposed Strategy A (single WS slice). DESIGN clarified the two driven adapters (COSTLY vs LOCAL) and the fail-open pattern. DISTILL reconciles to Strategy B because:
- Strategy A's "single slice" would require real OpenAI calls in CI, creating flaky tests and quota dependency
- Strategy B preserves the full user journey (comment POST with moderation) while controlling the COSTLY adapter via mock
- Real DB I/O catches Prisma schema issues (FLAGGED enum, ModerationEvent creation) that in-memory doubles would miss

## Key DISTILL Decisions

| ID | Decision | Rationale |
|----|----------|-----------|
| DIST-1 | Mock `moderateText` at module level, not `callOpenAIModeration` directly in comment POST tests | The comment route handler will call `moderateText` (the domain function), not the adapter directly. Mocking the domain function is the correct test seam for the driving port scenario. |
| DIST-2 | Mock `callOpenAIModeration` separately for adapter-level tests | The adapter mock is available but not the primary test seam for the POST route. Use it only if testing adapter behavior in isolation. |
| DIST-3 | All scenarios use `testPrisma` with real PostgreSQL | No in-memory Prisma doubles. Real DB catches enum issues, constraint violations, and transaction semantics. |
| DIST-4 | Fail-open scenarios mock `moderateText` to throw | The domain function wraps the adapter call in try/catch. When `moderateText` throws, the route handler should catch it and save as VISIBLE. |
| DIST-5 | Admin FLAGGED scenarios use direct PATCH calls to existing admin route | No new admin route. Extend existing `PATCH /api/admin/comments/[id]` with APPROVE action and FLAGGED source status. |
| DIST-6 | FLAGGED status is admin-readonly | Admin cannot set status=FLAGGED via PATCH. FLAGGED is only set by the system during comment creation. Validate this with a 400 rejection test. |
| DIST-7 | OPENAI_API_KEY added to test setup | Prevents tests from crashing on missing env var. Value is a dummy string since the real adapter is mocked. |
