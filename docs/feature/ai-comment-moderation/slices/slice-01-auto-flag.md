# Slice 01: Auto-flag on creation (Walking Skeleton)

**Goal**: Wire OpenAI Moderation API into POST /api/ideas/[id]/comments so toxic content is auto-flagged.

## IN scope
- Add `FLAGGED` to `CommentStatus` Prisma enum + migration
- Create `src/lib/openai-moderation.ts` — function `moderateText(text: string)` that calls OpenAI Moderation API
- Update POST /api/ideas/[id]/comments to call `moderateText()` before saving
- If flagged: save comment with status `FLAGGED`, return 202 + "under review" message
- If clean: save as `VISIBLE` (existing behavior), return 201
- If OpenAI API fails: fail-open — save as `VISIBLE`, log warning
- `OPENAI_API_KEY` env var required
- Unit tests for `moderateText()` (mocked API responses)
- Integration test for comment POST with moderation

## OUT scope
- ModerationEvent recording for auto-flag (Slice 2)
- Admin UI for flagged queue (Slice 3)
- Resident-facing feedback (Slice 4)
- Appeal flow
- Rate limiting for OpenAI API calls (separate concern)

## Learning hypothesis
Disproves "OpenAI Moderation API latency is acceptable for comment creation" if avg response >2s. Confirms "toxic content can be auto-detected in RO/HU/EN" if categories fire on test inputs.

## Acceptance criteria
- [ ] `FLAGGED` exists in CommentStatus enum
- [ ] `moderateText("clean text")` returns `{ flagged: false }`
- [ ] `moderateText("toxic text")` returns `{ flagged: true, categories: [...] }`
- [ ] POST comment with clean text → 201, status VISIBLE
- [ ] POST comment with flagged text → 202, status FLAGGED, body includes "under review"
- [ ] POST comment when OpenAI API times out → 201, status VISIBLE, warning logged
- [ ] `npm run lint`, `npm run type-check`, `npm run build` pass

## Dependencies
- OPENAI_API_KEY env var configured

## Effort estimate
~6 hours

## Reference class
Content moderation API integration (common pattern, well-documented OpenAI SDK)
