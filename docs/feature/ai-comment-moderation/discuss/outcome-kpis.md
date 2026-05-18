# Outcome KPIs — ai-comment-moderation

| KPI | Target | Measurement method |
|-----|--------|--------------------|
| Time toxic content is publicly visible | <30 seconds (auto-flag) vs. hours (manual) | Timestamp diff: comment.createdAt vs. first ModerationEvent with AUTO_FLAG for same comment |
| False positive rate | <15% of flagged comments are approved by admin | Count(approved FLAGGED→VISIBLE) / Count(all FLAGGED) |
| Moderation API latency overhead | <2s added to comment POST | Server-side timing: duration of moderateText() call, measured in OpenAI moderation wrapper |
| Admin review turnaround | <24 hours for flagged comments | Timestamp diff: ModerationEvent(APPROVE or HIDE).createdAt - comment.createdAt |
| Comment creation success rate during API outage | 100% (fail-open) | Count(201 responses during outage) / Count(attempts during outage) |
