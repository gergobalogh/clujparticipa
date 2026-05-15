# Prioritization: Pipeline Tracker Redesign

## Release Priority

| Priority | Slice | Target Outcome | KPI | Rationale |
|----------|-------|---------------|-----|-----------|
| 1 | Walking Skeleton | End-to-end flow works | Pipeline renders on idea detail | Validates core assumption: pipeline is buildable with existing data |
| 2 | Slice 1: Pipeline Visualization | O1 + O2 — Time to see progress, engagement not ignored | % of idea detail page visitors who see pipeline > 80% | Highest-uncertainty slice: if the pipeline component doesn't work with our StatusChange data, nothing else matters |
| 3 | Slice 2: Homepage Pipeline Integration | O3 + O5 — Legitimacy, trust | Homepage → idea detail CTR increase > 20% | Riskiest UX assumption: pipeline metaphor works on small cards too |
| 4 | Slice 3: Status Change Timeline | O2 — Engagement not ignored | % of visitors who expand timeline > 5% | Attribution builds trust — next step after pipeline visualization |
| 5 | Slice 5: Map-First Entry Point | O4 — Effort to find neighborhood ideas | District-filtered page views increase > 20% | Map-first integrates Zero-Friction Reporter's strength |
| 6 | Slice 4: Exception States | O2 — Engagement not ignored | Rejected ideas with follow-up action > 0% | Edge case handling — important but not highest uncertainty |
| 7 | Slice 6: Notification Opt-In | O1 — Time to see progress | % of submitters who opt in > 10% | Nice-to-have, depends on browser support |

## Priority Scoring (Value x Urgency / Effort)

| Slice | Value (1-5) | Urgency (1-5) | Effort (1-5) | Score |
|-------|-------------|---------------|--------------|-------|
| S1 Pipeline Visualization | 5 | 5 | 3 | 8.3 |
| S2 Homepage Integration | 4 | 4 | 3 | 5.3 |
| S3 Status Change Timeline | 4 | 3 | 2 | 6.0 |
| S5 Map-First Entry | 3 | 3 | 3 | 3.0 |
| S4 Exception States | 3 | 2 | 2 | 3.0 |
| S6 Notification Opt-In | 2 | 2 | 2 | 2.0 |

**Riskiest-assumption-first override**: S1 goes first regardless of score because it validates the core data model assumption. S2 goes second because the homepage is the first thing visitors see (O3 legitimacy).

## Backlog Suggestions

| Story | Slice | Priority | Outcome Link | Dependencies |
|-------|-------|----------|-------------|--------------|
| Pipeline component renders stages | S1 | P1 | O1 | None (uses existing StatusChange data) |
| Current stage highlighted with indicator | S1 | P1 | O1 | Pipeline component |
| Past stages show timestamps | S1 | P1 | O1 + O2 | Pipeline component, StatusChange API |
| STALLED exception with "waiting for" label | S1 | P1 | O2 | Pipeline component |
| Mini-pipeline on idea list cards | S2 | P2 | O3 | Pipeline component (reuse) |
| Homepage redesign with pipeline concept | S2 | P2 | O3 + O5 | Mini-pipeline |
| Trust signals on homepage | S2 | P2 | O3 + O5 | None |
| Expandable timeline below pipeline | S3 | P3 | O2 | Pipeline component |
| Timeline entries with attribution | S3 | P3 | O2 | StatusChange API (existing changedBy field) |
| Rejected state with red marker + reason + CTA | S4 | P5 | O2 | Pipeline component |
| Merged state with parent idea link | S4 | P5 | O2 | Pipeline component |
| Map as homepage hero | S5 | P4 | O4 | Existing HomeMapPreview component |
| Tap-map-to-submit with pre-filled location | S5 | P4 | O4 | Map component, submission form |
| Browser notification prompt | S6 | P6 | O1 | Service worker setup |
| Notification on status change | S6 | P6 | O1 | StatusChange events, push API |
