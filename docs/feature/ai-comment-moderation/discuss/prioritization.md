# Prioritization — ai-comment-moderation

## Execution Order

| Priority | Slice | Rationale |
|----------|-------|-----------|
| 1 | Slice 1: Auto-flag on creation | **Highest uncertainty** — must validate OpenAI Moderation API latency and language support before building anything else. Also the walking skeleton: end-to-end value (toxic content auto-flagged). |
| 2 | Slice 2: ModerationEvent audit trail | **Dependency chain** — Slice 3 needs APPROVE action. Also low uncertainty, fast to implement. |
| 3 | Slice 04: Resident feedback | **Dogfood cadence** — after Slice 1, residents see 202 responses but no UI feedback. Close this gap before building admin queue. Also: learning leverage (duplicate-post behavior). |
| 4 | Slice 3: Admin flagged queue | **Lowest uncertainty** — well-understood admin UI pattern. Can ship last because admin can already filter comments by status manually in the interim. |

**Key insight**: Slice 1 is the make-or-break experiment. If OpenAI Moderation API is too slow or doesn't work well for Romanian/Hungarian, the entire approach needs rethinking. Ship it first, learn fast.
