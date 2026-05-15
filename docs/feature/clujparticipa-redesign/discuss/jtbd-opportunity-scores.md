# JTBD-to-Story Bridge — clujparticipa-redesign

## Job: JOB-001

**Functional**: When I see a problem in my neighborhood, I want to submit my idea and track whether it gets acted on, so I can decide whether engaging with the city is worth my time.

## Outcome-to-Story Mapping

| Outcome | Opportunity | Stories Fed | Story Summary |
|---------|-------------|-------------|---------------|
| O1 — Time to see idea progress | 15 (under-served) | S1, S2, S3 | Pipeline visualization, stage timeline, status change history |
| O2 — Engagement not ignored | 16 (under-served) | S2, S3, S4, S5 | Attributed status changes, notifications, "waiting for" labels, exception states |
| O3 — Time to understand legitimacy | 13 (under-served) | S6, S7 | Homepage redesign with pipeline concept, trust signals, impact stats |
| O4 — Effort to find neighborhood ideas | 9 (appropriately served) | S8 | Map-first entry point, district filtering (existing — maintain) |
| O5 — Abandoning due to distrust | 12 (appropriately served) | S6, S7 | Polished UI, consistent typography, mobile-first design |

## Story-to-Job Traceability

All stories trace to JOB-001. Each story serves one or more under-served outcomes:

- **S1** (Pipeline component) → O1: residents see progress immediately
- **S2** (Stage timeline with attribution) → O1 + O2: progress is visible AND attributed
- **S3** (Status change notifications) → O1 + O2: residents don't need to check back — updates come to them
- **S4** (Exception states) → O2: "stalled/returned/merged" labels prove the system hasn't forgotten
- **S5** (Waiting-for labels) → O2: explicit "awaiting city response" removes the ambiguity of silence
- **S6** (Homepage with pipeline concept + impact) → O3 + O5: new visitors understand what this is and trust it
- **S7** (Trust signals) → O3 + O5: partner logos, stats, non-binding disclaimer
- **S8** (Map-first entry point) → O4: district-filtered map as the homepage hero
