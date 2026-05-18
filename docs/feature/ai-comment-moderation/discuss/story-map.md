# Story Map — ai-comment-moderation

## Backbone (Activities, left-to-right)

| Submit Comment | AI Screens Content | Admin Reviews Flagged | Resident Sees Outcome |
|----------------|--------------------|-----------------------|------------------------|
| Post a comment | OpenAI Moderation API call | View flagged queue | Clean: instant visibility |
| | | | Flagged: "under review" message |
| | | Approve or hide flagged comment | |

## Walking Skeleton Slice

**Slice 1**: Wire OpenAI Moderation API into comment POST — auto-flag toxic, fail-open on error

End-to-end: resident posts comment → API screens it → toxic comment gets FLAGGED status → clean comment stays VISIBLE → admin can see flagged comments in existing admin UI.

## Slices (Elephant Carpaccio — each ≤1 day ship, each with learning hypothesis)

### Slice 1: Auto-flag on creation (WS)
- **Goal**: Wire OpenAI Moderation API into POST /api/ideas/[id]/comments so toxic content is auto-flagged
- **IN scope**: Add `FLAGGED` to CommentStatus enum, call OpenAI Moderation API on comment creation, save flagged comments with status FLAGGED, return "under review" response to user, fail-open on API error
- **OUT scope**: Admin review UI for flagged queue, ModerationEvent changes, appeal flow, frontend messaging
- **Learning hypothesis**: Disproves "OpenAI Moderation API latency is acceptable for comment creation" if avg response >2s; confirms "toxic content can be auto-detected in RO/HU/EN" if categories fire on test inputs
- **Effort**: ~6 hours
- **Dependencies**: OPENAI_API_KEY env var

### Slice 2: ModerationEvent for auto-flag + admin review
- **Goal**: Record auto-flag events in ModerationEvent so admin has audit trail; add APPROVE action to ModerationAction enum
- **IN scope**: Add AUTO_FLAG and APPROVE to ModerationAction enum, create ModerationEvent on auto-flag with categories as reason, update admin hide/restore to also record APPROVE for flagged→VISIBLE
- **OUT scope**: Dedicated flagged-comments queue UI, resident-facing appeal
- **Learning hypothesis**: Disproves "ModerationEvent schema is sufficient for AI screening metadata" if categories don't fit in reason field; confirms "admin can trace auto-flag to human decision" if ModerationEvent chain is readable
- **Effort**: ~4 hours
- **Dependencies**: Slice 1

### Slice 3: Admin flagged-comments queue
- **Goal**: Admin page shows comments with FLAGGED status for human review
- **IN scope**: Add FLAGGED filter to admin comments view, show flagged categories alongside comment text, one-click approve (→VISIBLE) or hide (→HIDDEN)
- **OUT scope**: Resident notification about review outcome, resident appeal flow
- **Learning hypothesis**: Disproves "admin can triage flagged comments efficiently" if the queue doesn't surface enough context; confirms "one-click review is fast enough for pilot" if admin processes 10 flagged comments in <5 min
- **Effort**: ~5 hours
- **Dependencies**: Slice 2

### Slice 4: Resident feedback on flagged comment
- **Goal**: When a resident's comment is flagged, the API response and UI communicate the state clearly
- **IN scope**: POST /api/ideas/[id]/comments returns 202 with "under review" message when flagged, frontend shows inline confirmation message instead of immediate comment appearance
- **OUT scope**: Appeal flow, email notification of review outcome
- **Learning hypothesis**: Disproves "residents accept a review delay for flagged comments" if we see duplicate-posting behavior; confirms "202 + clear message prevents confusion" if no duplicate posts within 5 min
- **Effort**: ~4 hours
- **Dependencies**: Slice 1

## Carpaccio Taste Tests

| Test | Slice 1 | Slice 2 | Slice 3 | Slice 4 |
|------|---------|---------|---------|---------|
| ≤4 new components? | ✅ (1 route change, 1 lib) | ✅ (schema change, route update) | ✅ (admin UI filter) | ✅ (API response, frontend msg) |
| No shared new abstraction? | ✅ (direct API call) | ✅ (extends existing enum) | ✅ (extends existing admin page) | ✅ (extends existing response) |
| Disproves a pre-commitment? | ✅ (latency, language coverage) | ✅ (schema sufficiency) | ✅ (admin triage speed) | ✅ (resident acceptance) |
| Production data, not synthetic? | ✅ (real comments screened) | ✅ (real ModerationEvents) | ✅ (real flagged queue) | ✅ (real resident behavior) |
| No identical-scale duplicates? | ✅ | ✅ | ✅ | ✅ |

All taste tests pass.
