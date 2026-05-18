# User Stories — ai-comment-moderation

## US-1: Auto-flag toxic comments on creation

**As an** admin
**I want** every new comment to be screened by the OpenAI Moderation API before becoming publicly visible
**So that** toxic content is never displayed to residents, even when I'm not online to manually moderate

**job_id**: JOB-008

### Elevator Pitch
Before: Toxic comments sit publicly until an admin manually hides them — could be hours.
After: run `POST /api/ideas/[id]/comments` with toxic text → sees `{ status: "FLAGGED", message: "Your comment is under review" }` with HTTP 202.
Decision enabled: Admin can trust that toxic content is caught 24/7 without manual monitoring.

### Acceptance Criteria
- [ ] `moderateText(text)` calls OpenAI Moderation API with input text and returns `{ flagged: boolean, categories: string[] }`
- [ ] When flagged=true, comment is saved with status FLAGGED, response is HTTP 202 with body `{ status: "FLAGGED", message: "<translated>" }`
- [ ] When flagged=false, comment is saved with status VISIBLE, response is HTTP 201 (existing behavior)
- [ ] When OpenAI API call fails (timeout, 5xx, network error), comment is saved as VISIBLE, error is logged via console.warn
- [ ] Comment creation latency with moderation call adds <2s to existing response time
- [ ] `npm run lint`, `npm run type-check`, `npm run build` pass

---

## US-2: Record auto-flag events in audit trail

**As an** admin
**I want** every auto-flagged comment to create a ModerationEvent recording the flagged categories and action
**So that** I have a complete audit trail of what the AI caught and what I decided

**job_id**: JOB-009

### Elevator Pitch
Before: No record exists of why a comment was auto-flagged or which categories triggered it.
After: run `PATCH /api/admin/comments/[id]` approving a flagged comment → sees ModerationEvent with `action: "APPROVE"` linked to the original AUTO_FLAG event.
Decision enabled: Admin can review the AI's reasoning and make informed approve/hide decisions.

### Acceptance Criteria
- [ ] AUTO_FLAG exists in ModerationAction enum
- [ ] APPROVE exists in ModerationAction enum
- [ ] Auto-flagged comment creates ModerationEvent with action=AUTO_FLAG, reason="auto_flag:<comma-separated categories>"
- [ ] Admin approving FLAGGED→VISIBLE creates ModerationEvent with action=APPROVE
- [ ] Admin hiding FLAGGED→HIDDEN creates ModerationEvent with action=HIDE (existing)
- [ ] `npm run lint`, `npm run type-check`, `npm run build` pass

---

## US-3: Admin reviews flagged comments

**As an** admin
**I want** a filtered view of comments with FLAGGED status so I can quickly review and approve or hide them
**So that** I can resolve false positives and confirm genuine flags without reading every comment

**job_id**: JOB-009

### Elevator Pitch
Before: Admin must manually check all comments to find flagged ones — no filter exists.
After: run admin page → clicks "Flagged" tab → sees list of flagged comments with categories, idea title, and one-click approve/hide buttons.
Decision enabled: Admin can triage flagged comments efficiently and clear the queue.

### Acceptance Criteria
- [ ] Admin page has a "Flagged" filter/tab showing only FLAGGED comments
- [ ] Each flagged comment displays: text, idea title, flagged categories, timestamp
- [ ] "Approve" button changes status to VISIBLE and creates APPROVE ModerationEvent
- [ ] "Hide" button changes status to HIDDEN and creates HIDE ModerationEvent
- [ ] Flagged count badge updates after action
- [ ] `npm run lint`, `npm run type-check`, `npm run build` pass

---

## US-4: Resident sees feedback when comment is flagged

**As a** resident
**I want** to see a clear message when my comment is held for moderation review
**So that** I don't think my comment was lost and don't post it again

**job_id**: JOB-010

### Elevator Pitch
Before: Resident posts a comment that gets flagged and sees no feedback — comment doesn't appear, no explanation.
After: run `POST /api/ideas/[id]/comments` with flagged text → sees inline notice "Your comment is under review by our moderation system" in the UI.
Decision enabled: Resident knows their comment was received and is being reviewed, not lost.

### Acceptance Criteria
- [ ] POST comment when flagged returns HTTP 202 with translated message
- [ ] Frontend shows inline notice/toast instead of appending comment to list
- [ ] i18n strings for moderation.underReview exist in ro.json, hu.json, en.json
- [ ] Clean comments still return 201 and appear immediately (no regression)
- [ ] `npm run lint`, `npm run type-check`, `npm run build` pass

---

## US-5: Fail-open on moderation API outage

**As a** resident
**I want** my comment to still be posted even if the AI moderation service is down
**So that** an external service outage doesn't prevent civic participation

**job_id**: JOB-010

@infrastructure

### Elevator Pitch
Before: If moderation API is down, comment creation could hang or fail entirely.
After: run `POST /api/ideas/[id]/comments` during OpenAI outage → sees comment posted successfully with status VISIBLE (same as before moderation existed).
Decision enabled: Platform operator knows that moderation outage doesn't block participation — manual moderation remains fallback.

### Acceptance Criteria
- [ ] OpenAI API timeout (5s default) is caught, error is logged
- [ ] Comment is saved as VISIBLE on API failure
- [ ] Response is HTTP 201 (normal creation response)
- [ ] Warning log includes error message and comment ID for admin follow-up
- [ ] `npm run lint`, `npm run type-check`, `npm run build` pass

---

## Requirements Completeness Score

| Story | Has job trace | Has elevator pitch | ACs testable | ACs verify pitch | Total |
|-------|-------------|-------------------|--------------|-----------------|-------|
| US-1 | ✓ JOB-008 | ✓ | ✓ 6 items | ✓ | 4/4 |
| US-2 | ✓ JOB-009 | ✓ | ✓ 6 items | ✓ | 4/4 |
| US-3 | ✓ JOB-009 | ✓ | ✓ 6 items | ✓ | 4/4 |
| US-4 | ✓ JOB-010 | ✓ | ✓ 5 items | ✓ | 4/4 |
| US-5 | ✓ JOB-010 (@infra) | ✓ | ✓ 5 items | ✓ | 4/4 |

**Score**: 5/5 stories = 1.0 (>0.95 ✓)
