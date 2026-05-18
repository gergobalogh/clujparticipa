# Slice 02: ModerationEvent for auto-flag + admin review

**Goal**: Record auto-flag events in ModerationEvent so admin has audit trail; add APPROVE action.

## IN scope
- Add `AUTO_FLAG` and `APPROVE` to `ModerationAction` Prisma enum + migration
- On auto-flag: create ModerationEvent with action=AUTO_FLAG, reason=flagged categories (comma-separated)
- Update PATCH /api/admin/comments/[id] to recognize FLAGGED→VISIBLE as APPROVE, record ModerationEvent with action=APPROVE
- Flagged categories stored in ModerationEvent.reason field (format: "auto_flag:hate,harassment")

## OUT scope
- Admin UI for flagged queue (Slice 3)
- Resident notification (Slice 4)
- Appeal flow

## Learning hypothesis
Disproves "ModerationEvent schema is sufficient for AI screening metadata" if categories don't fit in reason field or need structured querying. Confirms "admin can trace auto-flag to human decision" if ModerationEvent chain is readable.

## Acceptance criteria
- [ ] AUTO_FLAG and APPROVE exist in ModerationAction enum
- [ ] Auto-flagged comment creates ModerationEvent with action=AUTO_FLAG
- [ ] ModerationEvent.reason contains flagged categories (e.g. "auto_flag:hate,harassment")
- [ ] Admin approving FLAGGED→VISIBLE creates ModerationEvent with action=APPROVE
- [ ] Admin hiding FLAGGED→HIDDEN creates ModerationEvent with action=HIDE (existing)
- [ ] `npm run lint`, `npm run type-check`, `npm run build` pass

## Dependencies
- Slice 1 (FLAGGED status + moderation function)

## Effort estimate
~4 hours

## Reference class
Audit trail extension for automated system actions
