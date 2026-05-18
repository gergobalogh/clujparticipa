# JTBD Four Forces — ai-comment-moderation

## JOB-008: Auto-moderate toxic content

| Force | Description |
|-------|-------------|
| **Push** (current frustration) | Toxic comments sit publicly until an admin manually hides them — could be hours overnight or on weekends. During a public pilot, this destroys trust fast. |
| **Pull** (desired future) | Every comment is screened within milliseconds of posting. Toxic content never appears publicly. The discussion space feels safe 24/7. |
| **Anxiety** (adoption concern) | False positives — legitimate civic criticism flagged as "harassment." OpenAI's model may be calibrated for general English, not Romanian/Hungarian civic discourse. Over-moderation could silence legitimate dissent. |
| **Habit** (current behavior must change) | Admins currently read every comment manually. Residents currently accept that moderation is slow because it's human. Both must trust an automated system. |

## JOB-009: Scale moderation beyond manual review

| Force | Description |
|-------|-------------|
| **Push** | A single admin cannot review all comments during peak traffic. Missed toxic content damages platform credibility. Unmoderated periods (nights, weekends) are risky. |
| **Pull** | Consistent, tireless screening. No comment goes unreviewed. Admin focuses on flagged items only, not everything. |
| **Anxiety** | OpenAI Moderation API is a third-party dependency. Outages or latency could block comment creation. API cost per call may add up. |
| **Habit** | Admins currently review the comment list manually. Switching to "only review flagged items" changes their workflow and may feel like loss of control. |

## JOB-010: Preserve my voice when AI gets it wrong

| Force | Description |
|-------|-------------|
| **Push** | No recourse currently when a comment is hidden — the admin decided, and that's final. If AI auto-hides, there's even less transparency. |
| **Pull** | Flagged comments get human review. The author is told why their comment was flagged. There's a clear path to contest. |
| **Anxiety** | Adding an appeal/review flow is more UI/UX work. Will admins actually review flagged comments promptly? Will residents understand why their comment is held? |
| **Habit** | Currently, comments appear instantly. Any delay — even for flagged content only — is a new behavior that residents must accept. |
