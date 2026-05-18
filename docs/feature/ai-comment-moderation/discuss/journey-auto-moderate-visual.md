# Journey Visual: Auto-Moderate Comment — ai-comment-moderation

**Persona**: maria-manastur (resident commenter) + admin (platform operator)
**Job**: JOB-008 (auto-moderate toxic content), JOB-009 (scale moderation)

## Happy Path: Resident Posts a Clean Comment

```
s1-write ──> s2-submit ──> s3-screen ──> s4-visible ──> s5-see
  │            │            │             │             │
  "Write      "POST       "OpenAI       "status=      "Comment
   comment"   /comments"   returns       VISIBLE"      appears
                            clean"                      instantly"
  😊+1        😊+1        😊+1         😊+2          😊+1
```

| Step | Action | Output | Emotion |
|------|--------|--------|---------|
| s1-write | Type comment text | Text in input field | motivated |
| s2-submit | Click "Post comment" | POST /api/ideas/[id]/comments | confident |
| s3-screen | API calls OpenAI Moderation | Response: all categories clean | waiting |
| s4-visible | Comment saved as VISIBLE | Comment appears in thread immediately | satisfied |
| s5-see | Other residents see comment | Comment in discussion | engaged |

## Flagged Path: Resident Posts a Toxic Comment

```
s1-write ──> s2-submit ──> s3-screen ──> s4-flagged ──> s5-held ──> s6-admin-reviews
  │            │            │             │             │           │
  "Write      "POST       "OpenAI       "status=     "Comment    "Admin
   toxic      /comments"   returns       FLAGGED"     not shown   approves
   comment"                   flagged                  publicly"   or hides"
  😐+0        😐+0        😟-1         😟-1         😐+0        😊+1
```

| Step | Action | Output | Emotion |
|------|--------|--------|---------|
| s1-write | Type toxic/abusive text | Text in input field | aggressive |
| s2-submit | Click "Post comment" | POST /api/ideas/[id]/comments | confident |
| s3-screen | API calls OpenAI Moderation | Response: one+ category flagged | waiting |
| s4-flagged | Comment saved as FLAGGED | Response: "Your comment is under review" | concerned |
| s5-held | Comment not visible publicly | Hidden from comment list | uncertain |
| s6-admin-reviews | Admin reviews flagged queue | Admin approves → VISIBLE or hides → HIDDEN | resolved |

## Error Path: OpenAI API Fails

```
s1-write ──> s2-submit ──> s3-screen-fail ──> s4-failover ──> s5-visible
  │            │            │                  │              │
  "Write      "POST       "OpenAI API        "Fail open:    "Comment
   comment"   /comments"   timeout/error"     save as         appears
                                              VISIBLE,       (toxic
                                              log error"      possible)"
  😊+1        😊+1        😟-1              😐+0           😐+0
```

| Step | Action | Output | Emotion |
|------|--------|--------|---------|
| s3-screen-fail | OpenAI API timeout/error | Catch error, log warning | anxious |
| s4-failover | Save comment as VISIBLE | Comment appears publicly (fail-open) | neutral |
| s5-visible | Resident sees comment | Comment in thread | relieved but platform vulnerable |

**Fail-open rationale**: For a prototype, blocking all comments during an API outage is worse than letting a potentially toxic comment through temporarily. Admin manual moderation remains the fallback.
