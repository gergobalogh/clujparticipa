# Slice 04: Resident feedback on flagged comment

**Goal**: When a resident's comment is flagged, the API response and UI communicate the state clearly to prevent confusion and duplicate posting.

## IN scope
- POST /api/ideas/[id]/comments returns 202 Accepted with body `{ status: "FLAGGED", message: "<translated: your comment is under review>" }` when flagged
- Frontend: after posting, if response status is 202, show inline toast/notice "Your comment is under review by our moderation system" instead of appending comment to list
- i18n strings for "under review" message in RO/HU/EN

## OUT scope
- Appeal flow
- Email notification of review outcome
- Comment status polling/refresh

## Learning hypothesis
Disproves "residents accept a review delay for flagged comments" if we see duplicate-posting behavior (same text posted twice within 5 min). Confirms "202 + clear message prevents confusion" if no duplicate posts observed.

## Acceptance criteria
- [ ] Flagged comment POST returns 202 with translated "under review" message
- [ ] Frontend shows inline notice instead of comment appearing in list
- [ ] i18n strings exist in ro.json, hu.json, en.json for moderation messages
- [ ] Clean comments still return 201 and appear immediately (no regression)
- [ ] `npm run lint`, `npm run type-check`, `npm run build` pass

## Dependencies
- Slice 1 (FLAGGED status + 202 response)

## Effort estimate
~4 hours

## Reference class
Async feedback patterns (common in content platforms — Reddit, Medium)
