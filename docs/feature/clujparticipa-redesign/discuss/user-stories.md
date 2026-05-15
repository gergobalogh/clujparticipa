# User Stories — clujparticipa-redesign

## US-01: Pipeline visualization on idea detail page

**job_id**: JOB-001
**Slices**: S1

As a resident who submitted an idea,
I want to see a visual pipeline showing all stages my idea must pass through,
so I can instantly understand where my idea stands and what comes next.

### Elevator Pitch
Before: I see a single status badge ("UNDER_REVIEW") with no timeline, no context, and no indication of what happens next.
After: visit idea detail page → sees a horizontal pipeline with 7 stages, current stage highlighted and pulsing, past stages filled with timestamps, future stages outlined.
Decision enabled: I can tell whether my idea is progressing or stuck, and I know what stage comes next.

### Acceptance Criteria
- AC1: Pipeline renders all 7 stages (SUBMITTED → UNDER_REVIEW → FEASIBLE → IN_VOTING → SELECTED → IN_PROGRESS → COMPLETED) horizontally on desktop, vertically on mobile
- AC2: Current stage is filled with accent color and shows a pulsing indicator
- AC3: Past stages show the date of the status change from StatusChange records
- AC4: Future stages are outlined, gray, with no dates
- AC5: If no status changes beyond SUBMITTED, only SUBMITTED is filled with the idea creation date
- AC6: Pipeline consumes data from existing `/api/ideas/${id}/status-changes` endpoint

---

## US-02: Stalled pipeline indicator

**job_id**: JOB-001
**Slices**: S1

As a resident checking on my idea,
I want to see when my idea has been waiting too long at a stage,
so I know the system hasn't forgotten my idea and others can see the delay.

### Elevator Pitch
Before: My idea shows "UNDER_REVIEW" with no indication of how long it's been there — I assume it's been ignored.
After: visit idea detail page for a stalled idea → sees "Waiting for: City department review" label on the current pipeline stage with "Last updated 35 days ago".
Decision enabled: I know the idea hasn't been forgotten, and I can see publicly that the city is the bottleneck.

### Acceptance Criteria
- AC1: If the most recent StatusChange is >30 days ago, a "Waiting for" label appears below the current stage
- AC2: The label shows the number of days since the last status change
- AC3: The "waiting for" text is derived from the current stage name (UNDER_REVIEW → "City department review", FEASIBLE → "Voting period", etc.)
- AC4: The stalled indicator is visually distinct (amber/yellow accent) but not alarming

---

## US-03: Homepage with pipeline concept

**job_id**: JOB-001
**Slices**: S2

As a first-time visitor,
I want to immediately understand that this platform tracks idea progress through a pipeline,
so I can decide in under 30 seconds whether it's worth my time.

### Elevator Pitch
Before: I land on the homepage and see a list of ideas with status badges — I can't tell if this is a suggestion box or a tracking tool.
After: visit homepage → sees mini-pipeline indicators on idea cards showing 3-stage progress, hero text referencing "Track your idea's progress", stats showing completed ideas.
Decision enabled: I understand this is a tracking tool, not just a suggestion box, and I'm more likely to submit an idea.

### Acceptance Criteria
- AC1: Each idea card in the list shows a compact 3-stage indicator (start/current/end)
- AC2: Homepage hero text references the pipeline concept ("Track your idea's progress" or equivalent from locale files)
- AC3: Stats section shows count of COMPLETED ideas (proves impact exists)
- AC4: Language switcher is visible and functional for all 3 locales

---

## US-04: Status change timeline

**job_id**: JOB-001
**Slices**: S3

As a resident tracking my idea,
I want to see the full history of status changes with who made each change and why,
so I can trust that the process is transparent and not arbitrary.

### Elevator Pitch
Before: I see the current status but no history — I don't know how long each stage took or who made decisions.
After: click "View full history" on idea detail page → sees expandable timeline with each status change showing date, from→to, who changed it, and why.
Decision enabled: I can assess whether the process is fair and timely, and I trust the platform more because nothing is hidden.

### Acceptance Criteria
- AC1: Expandable section below pipeline, collapsed by default, labeled "View full history"
- AC2: Each entry shows: date, from status, to status, actor role (Admin/System/Department), note text
- AC3: Actor role is derived from changedBy field (known admin emails → "Admin", other → "System")
- AC4: If only one status change (initial SUBMITTED), timeline shows "No updates yet" instead of empty timeline
- AC5: Timeline entries ordered newest-first

---

## US-05: Exception states with recovery actions

**job_id**: JOB-001
**Slices**: S4

As a resident whose idea was rejected, merged, or returned,
I want to see why it happened and what I can do next,
so I don't feel like my participation was wasted.

### Elevator Pitch
Before: My idea shows "REJECTED" as a badge — no reason, no next step, just a dead end.
After: visit my rejected idea detail page → sees red pipeline marker at rejection point, reason text "Outside city jurisdiction", and CTA buttons "Support a similar idea" and "Revise and resubmit".
Decision enabled: I understand why my idea was rejected and have a clear path forward instead of giving up.

### Acceptance Criteria
- AC1: REJECTED ideas show a red marker on the pipeline at the rejection stage
- AC2: Rejection reason text (from StatusChange.note) is displayed below the pipeline
- AC3: CTA buttons appear: "Support a similar idea" (links to ideas list filtered by same category) and "Revise and resubmit" (links to submission form pre-filled with original data)
- AC4: MERGED ideas show a merge indicator on the pipeline + link to the parent idea
- AC5: Merged idea text: "Your idea was combined with [parent idea title] — follow its progress here"
- AC6: RETURNED ideas show a return indicator + admin feedback note + "Revise and resubmit" CTA

---

## US-06: Map-first homepage entry

**job_id**: JOB-001
**Slices**: S5

As a resident visiting the platform,
I want the map to be the first thing I see so I can quickly find ideas in my neighborhood,
so I don't have to navigate through lists to find what's relevant to me.

### Elevator Pitch
Before: I see a text-heavy homepage with idea cards — I have to read and filter to find my district.
After: visit homepage → sees an interactive map as the hero element, tap my neighborhood → see ideas near me, tap "Propose" on the map → submission form with location pre-filled.
Decision enabled: I can instantly find what's happening near me and submit an idea with minimal friction.

### Acceptance Criteria
- AC1: Map component is the primary hero element on the homepage (above the fold, full-width)
- AC2: Map is visible on mobile (currently hidden behind `lg:block`)
- AC3: Tapping a point on the map opens the idea submission form with latitude/longitude pre-filled
- AC4: District can be inferred from map viewport or selected manually
- AC5: Existing idea pins and clustering functionality preserved

---

## US-07: Trust signals for legitimacy

**job_id**: JOB-001
**Slices**: S2

As a skeptical first-time visitor,
I want to see evidence that this platform is legitimate and produces results,
so I can decide whether to invest my time in participating.

### Elevator Pitch
Before: I visit the homepage and it looks like any other website — no proof it's connected to the city or that anything gets done.
After: visit homepage → sees count of completed ideas, partner/institutional logos, "non-binding prototype" label, and completed idea cards with green-filled pipelines.
Decision enabled: I believe this platform has credibility and real outcomes, so I'm willing to try it.

### Acceptance Criteria
- AC1: Stats section shows COMPLETED idea count prominently
- AC2: Completed idea cards have visually distinct styling (green pipeline fills)
- AC3: "Non-binding prototype" label is visible per CLAUDE.md requirement
- AC4: Platform description in locale files explains the tracking model clearly

---

## US-08: Notification on status change

**job_id**: JOB-001
**Slices**: S6

As a resident who submitted an idea,
I want to be notified when my idea's status changes,
so I don't have to keep checking back manually.

### Elevator Pitch
Before: I submit an idea and have to remember to check back — I never know if anything has changed.
After: submit an idea → opt in to notifications → receive browser notification "Your idea 'Broken sidewalk' moved to Under Review" → tap to see updated pipeline.
Decision enabled: I can stay informed without active effort, which makes me more likely to continue participating.

### Acceptance Criteria
- AC1: After first idea submission, a notification opt-in prompt appears
- AC2: If permission granted, browser notification fires when the idea's status changes
- AC3: Notification payload: idea title + new stage name
- AC4: Tapping notification navigates to idea detail page
- AC5: If permission denied, show in-app indicator on next visit that status has changed
