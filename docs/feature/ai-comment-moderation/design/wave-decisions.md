# DESIGN Wave Decisions -- ai-comment-moderation

## Interaction Mode

Propose (autonomous analysis with user confirmation).

## Quality Attribute Ranking

1. Latency -- <2s added to comment POST
2. Reliability (fail-open) -- 100% comment creation success during outage
3. Auditability -- full ModerationEvent trail
4. Maintainability -- minimal new components, extend existing patterns

## Constraints

- Single developer, prototype/MVP scope, ~2 days effort
- OPENAI_API_KEY env var required
- Existing Next.js + Prisma stack (no new infrastructure)
- Functional composition paradigm (ADR-001)

## Conway's Law Assessment

Single team, single developer. Architecture boundaries do not conflict with team structure. No Inverse Conway Maneuver needed.

## Paradigm Confirmation

Functional composition (ADR-001) confirmed applicable. All new code: pure functions, no classes. React components as pure renderers. Side effects isolated in adapter function with explicit error handling.

## Architecture Recommendation

**Modular monolith extension** (consistent with existing architecture). Two new files in `src/lib/`, two modified route files, one Prisma migration. No new services, no new routes, no new containers.

Rejection of microservices: team size = 1, no independent deployment need.
Rejection of event-driven: synchronous moderation on POST is simpler and meets latency requirement.
Rejection of class-based adapter: violates ADR-001.

## Key Architectural Decisions

| ID | Decision | Rationale |
|----|----------|-----------|
| D1 | Use OpenAI Moderation API | Multilingual RO/HU/EN, no training data, low cost (from DISCUSS) |
| D2 | Fail-open on API outage | Blocking comments worse than missing toxic content (from DISCUSS) |
| D3 | Add FLAGGED to CommentStatus | Distinct from HIDDEN; awaiting human review (from DISCUSS) |
| D4 | Store flagged categories in ModerationEvent.reason | Format "auto_flag:hate,harassment" (from DISCUSS) |
| D5 | Return HTTP 202 for flagged comments | Distinct from 201 (clean) and 400 (validation) (from DISCUSS) |
| D6 | moderateText as pure function in src/lib/openai-moderation.ts | Consistent with ADR-001, testable, callable from any route |
| D7 | Driven adapter in separate file from domain logic | Ports-and-adapters: domain does not import SDK |
| D8 | Fail-open via try/catch, not circuit breaker | MVP scope, single dep, circuit breaker is over-engineering |
| D9 | probeOpenAI() at startup | Earned Trust: verify adapter works before first real use |
| D10 | ModerationResult = { flagged: boolean, categories: string[] } | Minimal contract, future-proof for category set changes |
| D11 | FLAGGED comments excluded from GET responses automatically | Current query filters status=VISIBLE; FLAGGED is not VISIBLE |
| D12 | APPROVE action distinct from RESTORE in ModerationAction | Audit trail semantic clarity |

## Open Questions

| ID | Question | Default |
|----|----------|---------|
| OQ-1 | moderateText: parameter injection or module-level import? | Module-level import (simpler, consistent with codebase) |
| OQ-2 | Should authors see their own flagged comments in GET? | Not visible (202 notice is sufficient for MVP) |
| OQ-3 | probeOpenAI in production or dev-only? | All environments (1s startup cost acceptable) |

## External Integration Annotation

Contract tests recommended for OpenAI Moderation API -- consumer-driven contracts to detect breaking changes before production. MVP mitigation: integration test with recorded response fixture.
