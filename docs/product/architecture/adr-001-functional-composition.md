# ADR-001: Functional Composition as Development Paradigm

**Status**: Accepted

**Date**: 2026-05-14

## Context

The ClujParticipa redesign adds pipeline visualization, stalled detection, exception state handling, and notification opt-in to an existing Next.js/TypeScript codebase. TypeScript/React is multi-paradigm — both functional composition and OOP are viable.

The existing codebase uses 100% functional style: `transitions.ts`, `status.ts`, `rate-limit.ts`, and all API route handlers are pure functions or simple objects. No classes exist in the domain or application layers. All 10 DISTILL scaffold stubs define typed function signatures, not class methods.

## Decision

Use **functional composition** for all new domain and application logic:
- Pure functions for domain logic (pipeline-stages, stalled-detector, actor-role-resolver)
- React components as pure renderers of typed props
- Side effects isolated in hooks (useNotificationOptIn)
- No classes, no inheritance, no domain objects with methods

## Alternatives Considered

1. **OOP with domain objects** — Pipeline class encapsulating stage state, StalledDetector class with configuration. Rejected: would create a paradigm split in an already-functional codebase. No benefit for a ~1.5-week prototype with minimal business logic.

2. **Mixed (functional domain + OOP services)** — Pure functions for simple logic, classes for complex services. Rejected: adds cognitive overhead for a single developer. The "complex" services (pipeline staging, stalled detection) are pure functions by nature.

## Consequences

- Positive: Consistency with existing codebase — no paradigm mismatch
- Positive: Easier unit testing — pure functions require no mocking
- Positive: Simpler DELIVER implementation — crafter follows existing patterns
- Negative: No encapsulation of stateful pipelines (acceptable: pipeline state is derived from props, not mutable)
- Negative: Hook-based side effects can be harder to test than class methods (acceptable: only one hook in scope)
