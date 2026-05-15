# Evolution: editorial-redesign

**Feature**: Editorial Homepage Redesign
**Date**: 2026-05-15
**Branch**: redesign
**Pre-Dispatch Gate**: PASSED (all 9 roadmap steps have COMMIT entries)

## Summary

Transformed the ClujParticipa homepage from a centered single-column layout into an editorial-quality split layout with a sidebar idea feed alongside an interactive Leaflet map. Implemented Framer Motion entrance animations, Playfair Display + Inter typography, editorial idea cards with neighborhood colors, a LIVE activity badge, animated map pins with hover tooltips, and a sidebar CTA button -- all modeled after the cp-example visual reference.

## Business Context

The homepage is the primary entry point for first-time visitors. The previous layout required scrolling through a vertical idea list and navigating separately to a map page. The editorial redesign addresses three jobs:

- **J1 (Explorer)**: Sense platform liveness via LIVE badge, animated cards, and pulsing map pins
- **J2 (Scanner)**: Browse ideas by neighborhood while maintaining geographic context via the split layout
- **J3 (Trust-Seeker)**: Perceive editorial quality through serif typography and polished motion design
- **J4 (Contributor)**: Find the submit CTA easily at the sidebar bottom

### Outcome KPIs

| KPI | Target | Measurement |
|-----|--------|-------------|
| Homepage bounce rate | Reduce by 20% from baseline | Analytics: page session >10s |
| Idea click-through rate | Increase by 30% | Analytics: sidebar idea clicks / homepage sessions |
| CTA clicks | Increase by 25% | Analytics: CTA button clicks / homepage sessions |
| Time to first interaction | <3 seconds | Lighthouse FCP + animation complete |
| Mobile layout usability | No horizontal scroll on <768px | Manual test: iPhone SE viewport |

## Key Decisions

### DISCUSS Phase

| ID | Decision | Rationale |
|----|----------|-----------|
| D1 | Feature type: User-facing | All changes are visible UI/UX on the homepage |
| D2 | Walking skeleton: Brownfield | Redesign branch has existing working layout; right-sized, no split |
| D3 | UX research depth: Lightweight | Clear visual target in cp-example reference |
| D4 | JTBD: Yes (mandatory) | 4 jobs identified with opportunity scoring |
| D5 | No ticker footer | User directed to keep existing static footer |
| D6 | Framer Motion integral, not deferred | Animations folded into layout and card slices |

### DESIGN Phase

| ID | Decision | Rationale |
|----|----------|-----------|
| D01 | Layout: flex with fixed sidebar (not grid) | react-leaflet needs explicit height propagation; flex h-[calc(100vh-header-footer)] works naturally vs fragile grid h-full chaining |
| D02 | Font: Playfair Display via next/font/google (not CSS @import) | Zero CLS, auto-subset, self-hosted; see ADR-001 |
| D03 | Motion: motion v12.x from motion/react | Canonical successor to framer-motion, same API, ~18KB gzipped; see ADR-001 |
| D04 | SSR pattern: use client + conditional rendering | Homepage already "use client"; no dynamic import needed |
| D05 | CREATE EditorialIdeaCard (not extend IdeaCard) | Different structure (no image/border, neighborhood+dot+status line); variant would double conditionals |
| D06 | EXTEND existing markerIcon() | Already uses L.divIcon; extend signature + HTML template |
| D07 | Data fetching: keep separate, co-locate in page | No new API endpoint; move map fetch into page, pass ideas as prop |
| D08 | CTA: Link from @/i18n/navigation | Preserves locale in URL |
| D09 | LIVE badge: show when votingConfig.isOpen OR totalIdeas > 0 | Hide when both false; no flash on first load |
| D10 | Mobile breakpoint: md: (768px) | Matches US-1 AC; flex-col below, flex-row above |

## Steps Completed

| Step ID | Name | Phase | Status |
|---------|------|-------|--------|
| 01-01 | Install motion + restructure homepage to flex split layout | PREPARE/RED_ACCEPTANCE/GREEN/COMMIT | PASS |
| 01-02 | Add Framer Motion entrance animations to layout | PREPARE/RED_ACCEPTANCE/GREEN/COMMIT | PASS |
| 02-01 | Add Playfair Display + Inter fonts via next/font | PREPARE/RED_ACCEPTANCE/GREEN/COMMIT | PASS |
| 02-02 | Apply editorial typographic styles | PREPARE/RED_ACCEPTANCE/GREEN/COMMIT | PASS |
| 03-01 | Create EditorialIdeaCard + LiveBadge components | PREPARE/RED_ACCEPTANCE/GREEN/COMMIT | PASS |
| 03-02 | Wire editorial cards into sidebar with stagger animation + CTA | PREPARE/RED_ACCEPTANCE/GREEN/COMMIT | PASS |
| 04-01 | Extend markerIcon with category colors, ring-8, and pulse | PREPARE/RED_ACCEPTANCE/GREEN/COMMIT | PASS |
| 04-02 | Add hover tooltips to map markers | PREPARE/RED_ACCEPTANCE/GREEN/COMMIT | PASS |
| 05-01 | Integration verification and cleanup | PREPARE/RED_ACCEPTANCE/GREEN/COMMIT | PASS |

All steps completed via TDD: RED acceptance (driving port) -> GREEN implementation -> COMMIT. Unit tests were SKIPPED where acceptance tests covered all distinct behaviors through the driving port (per TDD methodology rule; steps 01-01, 01-02, 02-01, 02-02, 03-01, 05-01). Unit tests were EXECUTED for steps 03-02, 04-01, 04-02 where additional behavior verification was needed.

## Lessons Learned

1. **Flex over grid for react-leaflet**: Grid-based layout required fragile h-full chaining through multiple DOM levels for the Leaflet container. Flex with explicit calc-height on the parent propagates naturally and reliably.
2. **New component over variant**: Creating EditorialIdeaCard as a separate component avoided conditional branch explosion that extending IdeaCard would have caused. The editorial card has fundamentally different structure (no image, no border, neighborhood+dot+status line).
3. **next/font over CSS @import for fonts**: Diverging from the cp-example's CSS @import approach for fonts was critical. next/font provides auto-subsetting (~30KB vs full charset), font-display: swap, zero CLS, and build-time self-hosting.
4. **Acceptance-first TDD eliminated redundancy**: When acceptance tests cover all distinct behaviors through the driving port, unit tests testing internal structure add no value. 6 of 9 steps skipped unit tests by design.
5. **prefers-reduced-motion as a first-class concern**: Building reduced-motion support from the start (rather than retrofitting) avoided a separate accessibility pass. motion v12's built-in support plus CSS motion-reduce:animate-none covered all cases.

## Issues Encountered

No blocking issues. All steps passed on first attempt.

Open questions resolved during delivery:
- OQ-1 (Geist Sans removal): Audited font-sans references; none outside homepage, removed safely saving ~15KB.
- OQ-3 (Pulse on all pins vs active only): Pulse on IN_PROGRESS + SELECTED only; static ring-8 on others.
- OQ-4 (LIVE badge + prefers-reduced-motion): Added motion-reduce:animate-none to badge.
- OQ-6 (LIVE badge locale): "LIVE" used universally across RO/HU/EN (universal signal word).

## Permanent Artifacts

| Artifact | Location | Type |
|----------|----------|------|
| ADR-001: Motion and Font Selection | `docs/product/architecture/adr-001-motion-and-fonts.md` | Architecture Decision Record |
| Feature Delta | `docs/feature/editorial-redesign/feature-delta.md` | Cross-wave requirements reference |
| UX Journeys | `docs/ux/editorial-redesign/` (migrated) | User experience documentation |
| Outcome KPIs | Captured in this document | Business measurement |

## Commits

| Commit | Description |
|--------|-------------|
| 540ae64 | feat(editorial-redesign): apply editorial typographic styles |
| e6cf155 | feat(editorial-redesign): create EditorialIdeaCard + LiveBadge components |
| 1f7e6f4 | feat(editorial-redesign): wire editorial cards with stagger + sidebar CTA |
| d9dd7b1 | feat(editorial-redesign): extend marker icon with category colors, ring, and pulse |
| efb8eb3 | feat(editorial-redesign): add hover tooltips to map markers |

## Post-Feature Deferrals

- Analytics integration for outcome KPI tracking (bounce rate, CTR, CTA clicks)
- Full accessibility audit beyond prefers-reduced-motion
- E2E testing with Playwright for homepage journey
- Map overlay stats panel (from cp-example, not in any user story)
