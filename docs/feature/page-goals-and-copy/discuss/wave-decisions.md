# DISCUSS Decisions — page-goals-and-copy

## Key Decisions
- [D1] Feature scope: Copy-only changes across 7 high-opportunity pages. No component, API, or schema changes. Rationale: opportunity scoring shows copy has the highest leverage on the top 3 trust-and-action bottlenecks (homepage, submit, results).
- [D2] JTBD: 13 job stories identified, 6 scored as under-served or critically-under-served. Top 3 (J-HOME=54, J-SUBMIT=45, J-RESULTS=28) drive the user stories.
- [D3] UX depth: Comprehensive — page-by-page journey with goals, audience, tone, CTA, emotional arc, and current gap analysis for all 14 pages.
- [D4] No walking skeleton needed — brownfield, all changes are additive copy improvements to existing working pages.
- [D5] Admin, Terms, Bug Report, Data Deletion, Unsubscribe pages: out of scope. Copy is adequate; no strategic changes needed.
- [D6] Copy principles defined: show-don't-tell, one-CTA-per-page, earn-the-scroll, civic-not-startup, trilingual-consistency, prototype-honesty, trust-through-transparency.

## Requirements Summary
- Primary jobs/user needs: Homepage visitors need to understand and act in 10 seconds. Submitters need emotional framing and next-step reassurance. Results viewers need community-achievement framing.
- Walking skeleton scope: N/A — brownfield, copy-only
- Feature type: User-facing (all changes visible in UI text)

## Constraints Established
- All changes are to locale JSON files and minimal JSX text. No new components, no new API endpoints, no schema changes.
- Trilingual completeness is a hard gate: every changed string must exist in RO, HU, EN.
- Prototype/non-binding labels must not be weakened or hidden.

## Upstream Changes
- None. All DISCOVER and prior DIVERGE assumptions remain valid. The copy strategy reinforces (not contradicts) the pipeline-tracker and editorial-redesign directions.
