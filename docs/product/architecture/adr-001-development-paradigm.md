# ADR-001: Development Paradigm — Functional Composition

## Status: Accepted

## Context

The ClujParticipa redesign feature adds pipeline visualization, stalled detection, exception-state handling, mini-pipeline indicators, and browser notification opt-in to an existing Next.js App Router + TypeScript codebase. The existing codebase uses React function components and imperative hooks but has no class-based domain logic.

The question: should new domain logic use class-based OOP (services, repositories, domain objects) or functional composition (pure functions, composition, side effects isolated in hooks)?

## Decision

Use **functional composition** as the development paradigm:

- Domain logic: pure functions in `src/lib/` (e.g., `detectStalledIdea`, `resolveActorRole`, `getStageIndex`)
- React components: pure renderers receiving props; no internal business logic
- Side effects: isolated in React hooks (e.g., `useNotificationOptIn`) and Next.js route handlers
- Data transformation: composition of pure functions; no class hierarchies

## Alternatives Considered

1. **Class-based OOP (services/repositories)**: Common in ports-and-adapters patterns from Java/C# lineage. Rejected because (a) existing codebase has zero classes, (b) team of 2 does not benefit from service indirection, (c) TypeScript + React idioms favor functions, (d) class boilerplate adds no clarity for this domain's complexity.

2. **Mixed paradigm (classes for adapters, functions for domain)**: Would align with traditional hexagonal architecture examples. Rejected because (a) having two paradigms increases cognitive overhead for a 2-person team, (b) TypeScript adapters can implement contracts via structural typing (Protocols/interfaces) without classes, (c) React hooks already provide the side-effect boundary.

3. **Full FP with effect systems (fp-ts, Effect)**: Maximum purity and composability. Rejected as overkill for a prototype with 7 pipeline stages and 3 exception states. Team has no fp-ts experience; learning curve would violate time-to-market constraint.

## Consequences

- **Positive**: Domain logic is trivially testable (pure functions, no mocking); components stay thin; existing team patterns preserved; no paradigm mismatch with Next.js App Router.
- **Negative**: Adapter contracts enforced via TypeScript structural typing + Protocol checks rather than class hierarchies; developers must discipline themselves to keep functions pure (enforced by architectural linting, see ADR-004).
- **Neutral**: Ports-and-adapters still applies — ports are function signatures, adapters are function implementations. Dependency inversion is achieved via composition at the route/hook level, not via DI containers.

## Enforcement

- `eslint-plugin-functional` with `no-let`, `no-class`, `immutable-data` rules in `src/lib/` directory
- Pre-commit hook validates no classes in `src/lib/`
- ArchUnit-style check (via `dependency-cruiser`): `src/lib/` must not import `react`, `next`, or `@prisma/client`
