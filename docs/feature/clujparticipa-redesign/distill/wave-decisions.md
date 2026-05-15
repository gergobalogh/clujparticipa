# DISTILL Decisions — clujparticipa-redesign

## Key Decisions

- [DWD-01] Status name resolution: Use ELIGIBLE (not FEASIBLE) in all scenarios — code is SSOT (`transitions.ts`, Prisma Status enum). User stories to be updated separately.
- [DWD-02] Walking Skeleton Strategy: **Strategy C (Real local)** — all driven adapters use real I/O. No costly external dependencies; PostgreSQL test database, real filesystem. No env-switching needed.
- [DWD-03] Driving ports confirmed from DISCUSS: `/ideas/{id}` GET, `/api/ideas/{id}/status-changes` GET, `/api/ideas/{id}/vote` POST, Browser Notification API outbound. DESIGN directory absent; ports derived from DISCUSS feature-delta.
- [DWD-04] Container preference: No containers — real adapters on host with Vitest + PostgreSQL test database.
- [DWD-05] Test framework: Vitest (existing) — no pytest-bdd. Feature files use Gherkin syntax as specification; step implementations are Vitest test files in TypeScript.
- [DWD-06] Pipeline stages: 7 forward stages (SUBMITTED → UNDER_REVIEW → ELIGIBLE → IN_VOTING → SELECTED → IN_PROGRESS → COMPLETED). REJECTED is an exception state rendered as a marker, not a pipeline stage.
- [DWD-07] Reconciliation passed: 0 contradictions between DISCUSS and DEVOPS wave decisions.
- [DWD-08] MERGED/RETURNED exception states: Derive from StatusChange.note conventions — no schema changes. Rules: (1) MERGED: idea.status is REJECTED and most recent StatusChange.note contains the substring "merged with" + a reference to another idea; (2) RETURNED: idea.status is REJECTED and most recent StatusChange.note contains the substring "returned" or "revision required". The Prisma Status enum remains unchanged (REJECTED covers all three exit states).

## Walking Skeleton Tag Strategy

- Walking skeleton: `@walking_skeleton @real-io` (Strategy C)
- Adapter integration tests: `@real-io @adapter-integration`
- No `@in-memory` tags needed (no InMemory doubles — Strategy C)

## Adapter Inventory

| Adapter | Type | I/O |
|---------|------|-----|
| PostgreSQL via Prisma | Driven | Real (test DB) |
| `/api/ideas/{id}/status-changes` | Driving port (HTTP GET) | Real HTTP |
| `/api/ideas/{id}` | Driving port (HTTP GET) | Real HTTP |
| `/api/ideas/{id}/vote` | Driving port (HTTP POST) | Real HTTP |
| Browser Notification API | Driven (outbound) | Fake (contract smoke) |

## Missing Upstream Artifacts

- `docs/product/architecture/brief.md` — NOT FOUND (warned, not blocked)
- `docs/product/kpi-contracts.yaml` — NOT FOUND (warned, KPIs from discuss/outcome-kpis.md used instead)
- `docs/feature/clujparticipa-redesign/design/` — NOT FOUND (blocked for driving ports, resolved via DISCUSS ports confirmation)
- `docs/feature/clujparticipa-redesign/spike/` — NOT FOUND (no spike run; DISTILL creates walking skeleton)
