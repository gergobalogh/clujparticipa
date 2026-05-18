# Shared Artifacts Registry — ai-comment-moderation

| Artifact | Source | Consumer | SSOT |
|----------|--------|----------|------|
| `${commentText}` | Comment form input | POST handler, OpenAI Moderation API | Request body |
| `${moderationResult}` | OpenAI Moderation API response | Comment status decision, ModerationEvent | OpenAI API response (ephemeral, not persisted) |
| `${commentId}` | Prisma comment.create | ModerationEvent, admin review queue | Database Comment.id |
| `${flaggedCategories}` | OpenAI Moderation API categories array | ModerationEvent.reason, admin review UI | Persisted in ModerationEvent.reason field |
| `${adminDecision}` | Admin PATCH /api/admin/comments/[id] | Comment status update, ModerationEvent | Request body + ModerationEvent |
