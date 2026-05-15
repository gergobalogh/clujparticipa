# ADR-002: Canonical Note Prefix for MERGED/RETURNED Detection

**Status**: Accepted

**Date**: 2026-05-14

## Context

User stories US-05 AC4-AC6 require MERGED and RETURNED exception states in the pipeline UI. The Prisma Status enum contains only REJECTED — there is no MERGED or RETURNED status value. Adding them to the enum would require a database migration, breaking the "no schema changes" constraint from DISCUSS.

StatusChange.note is a free-text String field. Raw substring matching ("merged with", "returned") is fragile — "The applicant returned the form" would false-match as a RETURNED exception.

## Decision

Require admins to use **canonical note prefixes** when recording MERGED or RETURNED status changes:

| Exception | Prefix | Example |
|----------|--------|---------|
| MERGED | `[MERGED]` | `[MERGED] merged with idea #cm5x8k2q` |
| RETURNED | `[RETURNED]` | `[RETURNED] revision required: add specific location` |
| Plain rejection | No prefix | `Outside city jurisdiction` |

Detection rule: when idea.status is REJECTED, check the most recent StatusChange.note. If it starts with `[MERGED]`, render merge UI. If it starts with `[RETURNED]`, render return UI. Otherwise, render default rejection UI.

## Alternatives Considered

1. **Add MERGED/RETURNED to Prisma Status enum** — Requires migration + VALID_TRANSITIONS update + status.ts update + Badge variant update. Rejected: breaks "no schema changes" constraint, adds complexity for 2 edge cases.

2. **Raw substring matching on note** — Check for "merged with" or "returned" anywhere in note text. Rejected: false positives ("returned the form", "merged two departments"). Parsing is ambiguous.

3. **Separate exception_type column on StatusChange** — Add an optional `exceptionType` field. Rejected: requires schema change, same as alternative 1.

## Consequences

- Positive: Deterministic parsing — `[MERGED]` and `[RETURNED]` prefixes are unambiguous
- Positive: No schema changes — convention-only, backward-compatible with existing data
- Positive: Admin UI can enforce the prefix via form validation
- Negative: Convention relies on admin compliance — a typo like `[Merge]` or `[merged]` would not be detected. Mitigated by: case-insensitive prefix check + admin UI enforcement.
- Negative: Future schema change to add enum values would need migration of existing notes. Low risk: prototype scope, few records.
