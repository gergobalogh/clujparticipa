# ADR-002: MERGED/RETURNED Note Prefix Convention for Exception State Detection

## Status: Accepted

## Context

The pipeline feature must display three exception states for REJECTED ideas: plain REJECTED, MERGED (idea absorbed into another), and RETURNED (needs revision before resubmission). The Prisma `Status` enum has a single `REJECTED` value — all three states map to `REJECTED` in the database.

Options for distinguishing MERGED and RETURNED from generic REJECTED:

1. Add new Prisma enum values (MERGED, RETURNED) — requires schema migration
2. Add a new `exceptionType` column to StatusChange or Idea — requires schema migration
3. Derive exception type from the existing `StatusChange.note` field using a convention

## Decision

Use **canonical note prefix convention** on `StatusChange.note`:

- `[MERGED] merged with idea #abc123` — idea was absorbed into idea #abc123
- `[RETURNED] revision required: add location details` — idea needs revision
- Any other note (or no prefix) — generic REJECTED

This makes parsing deterministic: extract the bracketed prefix from the most recent `StatusChange` where `toStatus = "REJECTED"`.

Parsing rule: `note.match(/^\[(MERGED|RETURNED)\]/)?.[1]` — returns `"MERGED"`, `"RETURNED"`, or `undefined`.

## Alternatives Considered

1. **Schema migration (add MERGED/RETURNED to Status enum)**: Cleanest in data model. Rejected because (a) CLAUDE.md explicitly states "no new database tables or schema changes" for this MVP, (b) Prisma enum changes require migration + client regeneration, (c) existing status transition logic in `transitions.ts` and `VALID_TRANSITIONS` would need updates, (d) adds 2 more terminal states to the pipeline visualization that are semantically sub-states of REJECTED.

2. **New `exceptionType` column on StatusChange**: Clean separation of concerns. Rejected because (a) still a schema migration, (b) adds nullable column that only applies to REJECTED transitions (sparse, denormalized), (c) MVP constraint on no schema changes.

3. **Substring search without prefix (legacy convention from DISTILL DWD-08)**: `"merged with"` or `"returned"` anywhere in note. Rejected because (a) fragile — free-text notes might contain "returned" in other contexts (e.g., "the department returned a positive assessment"), (b) not deterministic — admin must remember exact phrasing, (c) no visual contract for admins to follow.

## Consequences

- **Positive**: Zero schema changes; deterministic parsing via prefix; admin UI can enforce prefix on status-change actions; backward-compatible with existing REJECTED ideas (no prefix = generic REJECTED).
- **Negative**: Convention-based, not database-enforced; relies on admin UI to insert prefix correctly; if admins bypass UI and write raw notes, prefix may be missing.
- **Mitigation**: Admin status-change form will auto-prepend `[MERGED]` or `[RETURNED]` prefix when selecting the corresponding action. The admin quick-action buttons in `transitions.ts` already define discrete actions; the MERGED/RETURNED variants will be added as distinct quick actions that enforce the prefix.

## Enforcement

- Pure function `parseExceptionType(note: string): "MERGED" | "RETURNED" | undefined` in `src/lib/exception-type-parser.ts` — tested with prefix convention
- Admin route handler validates prefix is present when action is MERGED or RETURNED
- DISTILL scenario #56 and #57 verify the parsing behavior
