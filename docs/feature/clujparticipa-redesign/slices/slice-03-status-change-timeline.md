# Slice 03: Status Change Timeline

**Goal**: Add an expandable timeline below the pipeline showing all status changes with attribution.

## IN scope
- Expandable section below pipeline: "View full history"
- Each timeline entry: date, from→to status, actor (changedBy), note
- Actor displayed as role (Admin, System, Department) rather than raw identifier
- Chronological order, newest first

## OUT scope
- Pipeline component itself (Slice 1)
- Exception state recovery CTAs (Slice 4)
- Notifications (Slice 6)

## Learning hypothesis
Disproves "timestamped stage changes are irrelevant to residents" if <5% of idea detail visitors expand the timeline. Confirms that attribution (who changed the status) builds trust per O2.

## Acceptance criteria
- Timeline shows all StatusChange records for the idea
- Each entry displays: date, from→to status, actor role, note text
- Timeline is collapsed by default, expands on click
- If no status changes beyond initial submission, shows "No updates yet"
- Actor role derived from changedBy field (admin emails → "Admin", system → "System")

## Dependencies
- Slice 1 (Pipeline component exists; timeline attaches below it)
- Existing `/api/ideas/${id}/status-changes` endpoint

## Effort estimate
4 hours

## Reference class
Similar to activity feed/timeline components in project management tools.
