# Story Map: Pipeline Tracker Redesign

## User: Maria (Engaged Resident) + Ion (Curious Newcomer)
## Goal: Submit an idea and track its progress through a visible pipeline

## Backbone

| Discover | Submit | View Pipeline | Track Progress | Engage |
|----------|--------|---------------|----------------|--------|
| See homepage with map + pipeline concept | Submit idea via form | See visual pipeline on idea detail | Check back and see updates | Vote, comment, share |
| Filter by district | See pipeline after submit | See timestamps + attribution per stage | Get notified on stage change | See completed ideas with impact |
| Understand legitimacy (trust signals) | No account required | See exception states (stalled/returned/merged) | See "waiting for" labels | Find similar ideas |
| Switch language (RO/HU/EN) | Add photo to idea | See status change history timeline | | |

---

### Walking Skeleton
- See homepage with pipeline concept on one idea card
- Submit an idea (title + description + category)
- See pipeline with current stage highlighted on idea detail
- Return to idea detail and see pipeline persists
- Vote on an idea (existing — no change)

### Slice 1: Pipeline Visualization (≈6h)
**Learning hypothesis**: Disproves "residents don't care about pipeline tracking" if pipeline views have <10% of idea detail page engagement. Confirms that visual progress tracking drives return visits.
- Pipeline component on idea detail page
- All stages rendered, current highlighted, past timestamped
- Exception state: STALLED with "waiting for" label

### Slice 2: Homepage Pipeline Integration (≈5h)
**Learning hypothesis**: Disproves "new visitors don't notice the pipeline metaphor on the homepage" if mini-pipeline on idea cards gets <5% click-through. Confirms homepage drives idea detail page visits.
- Mini-pipeline (3-stage indicator) on idea list cards
- Homepage redesign: pipeline concept visible before clicking
- Trust signals: stats, non-binding label

### Slice 3: Status Change Timeline (≈4h)
**Learning hypothesis**: Disproves "timestamped stage changes are irrelevant to residents" if <5% of visitors expand the timeline. Confirms that attribution (who changed the status) builds trust.
- Expandable timeline below pipeline showing all status changes
- Each entry: date, from→to, actor, note
- Attributed to role (Admin, System, Department)

### Slice 4: Exception States & Recovery CTAs (≈4h)
**Learning hypothesis**: Disproves "exception states (rejected/merged) don't need special handling" if rejected ideas get 0 follow-up actions. Confirms that recovery CTAs (resubmit, support similar) reduce abandonment.
- Rejected state: red marker + reason + resubmit CTA
- Merged state: link to parent idea
- Returned state: revision prompt

### Slice 5: Map-First Entry Point (≈5h)
**Learning hypothesis**: Disproves "map as homepage hero doesn't increase district-specific engagement" if district-filtered page views don't increase 20% vs current. Confirms Zero-Friction Reporter insight: map-first UX reduces friction.
- Map as homepage hero element (promote existing map preview)
- Tap-to-submit: clicking map pre-fills location in form
- District auto-detection or manual filter

### Slice 6: Notification Opt-In (≈4h)
**Learning hypothesis**: Disproves "residents won't opt in to notifications" if <10% of idea submitters enable notifications. Confirms that proactive updates drive return visits.
- Browser notification prompt on first idea submission
- Notification on status change
- Deep link from notification to idea detail

---

## Carpaccio Taste Tests

| Test | Result |
|------|--------|
| Slice lists 4+ new components? | No — max 2 per slice (pipeline component + homepage card update). PASS |
| Every slice depends on a new abstraction? | No — Pipeline component is built in Slice 1, others consume it. PASS |
| No slice disproves any pre-commitment? | Each slice has a named learning hypothesis. PASS |
| Slice uses only synthetic data? | All slices work against existing Prisma data (seed + real). PASS |
| 2+ slices identical except scale? | No — each targets a different outcome. PASS |
