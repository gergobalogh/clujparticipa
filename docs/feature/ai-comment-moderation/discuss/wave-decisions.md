# DISCUSS Decisions — ai-comment-moderation

## Key Decisions
- [D1] Use OpenAI Moderation API (not a local model or keyword filter): OpenAI covers multilingual content (RO/HU/EN), requires no training data, and is free/very-low-cost for the moderation endpoint. Risk: third-party dependency, mitigated by fail-open. (see: jtbd-four-forces.md)
- [D2] Fail-open on API outage: For a prototype, blocking comment creation during an outage is worse than letting a potentially toxic comment through temporarily. Admin manual moderation remains the fallback. (see: journey-auto-moderate-visual.md)
- [D3] Add FLAGGED to CommentStatus (not reuse HIDDEN): FLAGGED means "awaiting human review" — semantically different from HIDDEN ("rejected"). This lets the admin queue filter specifically for AI-flagged items. (see: user-stories.md US-1)
- [D4] Store flagged categories in ModerationEvent.reason field: Format "auto_flag:hate,harassment". Simple, avoids schema changes for a structured JSON column. If querying by category becomes needed, promote to a dedicated column later. (see: user-stories.md US-2)
- [D5] Return HTTP 202 for flagged comments: Distinct from 201 (clean comment) and 400 (validation error). Lets frontend differentiate and show appropriate feedback. (see: user-stories.md US-4)

## Requirements Summary
- Primary jobs/user needs: Auto-moderate toxic comments 24/7 without human delay; scale moderation beyond manual review; preserve resident voice when AI gets it wrong.
- Walking skeleton scope: Slice 1 — wire OpenAI Moderation API into comment POST, auto-flag toxic, fail-open on error.
- Feature type: Backend (API-level screening, minimal UI changes)

## Constraints Established
- OpenAI Moderation API latency must be <2s to avoid degrading comment creation UX
- Fail-open strategy means moderation is best-effort, not a guarantee
- ModerationEvent.reason field format is "auto_flag:<categories>" — not a structured JSON column
- OPENAI_API_KEY env var is required; missing key should fail-open with a startup warning, not crash

## Upstream Changes
- No DISCOVER assumptions changed (no prior DISCOVER for this feature)
- Resolves Open Question from PROJECT_BOARD.md: "Who moderates comments and feasibility notes during a public pilot?" → Answer: AI auto-moderation with admin review fallback

## Scope Assessment: PASS
- ~5 user stories, 1 bounded context (comment moderation), 2 integration points, ~1-2 days effort
