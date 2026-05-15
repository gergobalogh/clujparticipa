# Slice 01: Pipeline Visualization

**Goal**: Render a visual pipeline on the idea detail page showing all stages with the current stage highlighted.

## IN scope
- Pipeline React component rendering all 7 stages horizontally
- Current stage: filled + pulsing indicator
- Past stages: filled with timestamp from StatusChange records
- Future stages: outlined, gray
- STALLED exception: if current stage >30 days, show "Waiting for: [party]" label
- Mobile-responsive: pipeline collapses to vertical on small screens

## OUT scope
- Mini-pipeline on homepage cards (Slice 2)
- Expandable timeline below pipeline (Slice 3)
- Other exception states (Slice 4)
- Notifications (Slice 6)

## Learning hypothesis
Disproves "residents don't care about pipeline tracking" if pipeline section gets <10% of idea detail page engagement (scroll depth or time-on-section). Confirms that visual progress tracking drives return visits.

## Acceptance criteria
- Given an idea with status UNDER_REVIEW, the pipeline renders with SUBMITTED filled (timestamp) and UNDER_REVIEW highlighted (pulsing)
- Given an idea with no status changes beyond SUBMITTED, the pipeline renders with only SUBMITTED filled
- Given an idea with status stalled >30 days, a "Waiting for" label appears on the current stage
- Pipeline renders correctly on mobile (<640px) as vertical layout
- Pipeline uses existing `/api/ideas/${id}/status-changes` endpoint

## Dependencies
- None (uses existing Prisma StatusChange model and API endpoint)

## Effort estimate
6 hours

## Reference class
Similar to progress stepper components in e-commerce checkout flows.
