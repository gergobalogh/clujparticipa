# Slice 03: Admin flagged-comments queue

**Goal**: Admin page shows comments with FLAGGED status for human review with one-click actions.

## IN scope
- Add FLAGGED filter/tab to admin comments section
- Show flagged categories (parsed from ModerationEvent.reason) alongside comment text
- One-click "Approve" button → PATCH with status=VISIBLE
- One-click "Hide" button → PATCH with status=HIDDEN (existing flow)
- Flagged comments sorted newest-first
- Count badge on FLAGGED tab

## OUT scope
- Resident notification about review outcome
- Appeal flow
- Bulk actions

## Learning hypothesis
Disproves "admin can triage flagged comments efficiently" if the queue doesn't surface enough context (missing idea title, author info, etc.). Confirms "one-click review is fast enough for pilot" if admin processes 10 flagged comments in <5 min.

## Acceptance criteria
- [ ] Admin page has a "Flagged" filter showing only FLAGGED comments
- [ ] Each flagged comment displays: text, idea title, author hash, flagged categories, timestamp
- [ ] "Approve" button changes status to VISIBLE and records APPROVE ModerationEvent
- [ ] "Hide" button changes status to HIDDEN and records HIDE ModerationEvent
- [ ] Flagged count badge updates after approve/hide
- [ ] `npm run lint`, `npm run type-check`, `npm run build` pass

## Dependencies
- Slice 2 (APPROVE action in ModerationEvent)

## Effort estimate
~5 hours

## Reference class
Admin queue UI (pattern established by existing admin page)
