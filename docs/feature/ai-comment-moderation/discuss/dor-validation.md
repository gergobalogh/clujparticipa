# DoR Validation — ai-comment-moderation

| # | DoR Item | Evidence | Status |
|---|----------|----------|--------|
| 1 | User stories trace to job stories | US-1→JOB-008, US-2→JOB-009, US-3→JOB-009, US-4→JOB-010, US-5→JOB-010 | ✓ |
| 2 | Acceptance criteria are testable | Every AC is verifiable via API call, DB query, or UI assertion | ✓ |
| 3 | No open design questions | All decisions locked (fail-open, AUTO_FLAG/APPROVE actions, 202 response) | ✓ |
| 4 | Dependencies identified | OPENAI_API_KEY env var, OpenAI SDK package, Prisma migration for FLAGGED/AUTO_FLAG/APPROVE | ✓ |
| 5 | No overlapping stories | Each story covers distinct surface (API screening, audit trail, admin UI, resident UX, fail-open) | ✓ |
| 6 | Stories are small enough | Largest: US-1 at ~6h, all others ≤5h | ✓ |
| 7 | Non-functional requirements clear | Latency <2s, fail-open on outage, i18n in RO/HU/EN | ✓ |
| 8 | Out of scope defined | No appeal flow, no bulk actions, no email notifications, no resident reporting | ✓ |
| 9 | Outcome KPIs defined | 5 KPIs with numeric targets and measurement methods | ✓ |
