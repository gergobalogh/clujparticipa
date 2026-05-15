# Journey Design — Pipeline Tracker Redesign

## Persona: Maria (Engaged Resident)

## Mental Model Discovery

Maria thinks of the platform like a package tracker. She expects:
1. Submit a tracking number (her idea ID)
2. See stages: Received → Processing → In Transit → Delivered
3. Get notified when the status changes
4. See who handled it at each stage

**Key mismatch with current app**: The current app shows status as a single badge with no timeline, no attribution, and no next-step indicator. It's a dead-end, not a tracker.

## Happy Path: Submit and Track an Idea

```
Step 1 → Step 2 → Step 3 → Step 4 → Step 5
Land on   Tap      Fill     See        Check
homepage  map      form     pipeline   back later
          pin      (3 min)  (instant)  (notification)
```

### Step 1: Land on Homepage
**Input**: URL or shared link
**Expected output**: Immediately understand "this is where I track my neighborhood's ideas"
**Emotional state**: 😐 Curious but skeptical → 😊 "Oh, I see what this does"
**What Maria sees**:
- Map of her district as the hero (Zero-Friction Reporter integration)
- Pipeline metaphor shown on featured idea cards (3-stage mini pipeline per idea)
- "X ideas in your district" with district filter
- Trust signals: partner logos, "non-binding prototype" label, stats

### Step 2: Submit Idea (via map or CTA)
**Input**: Tap map pin location OR click "Propose" button
**Expected output**: Simple form with location pre-filled from map tap
**Emotional state**: 😊 Motivated → 😊 "That was easy"
**What Maria sees**:
- Location pre-filled (if from map tap)
- 3 required fields: title, description, category
- Optional: photo upload
- No account required — participant token generated silently
- After submit: redirected to idea detail page showing THE PIPELINE (Step 3)

### Step 3: See Pipeline on Idea Detail Page
**Input**: Idea detail page loads
**Expected output**: Visual pipeline showing all stages, current stage highlighted, past stages with timestamps
**Emotional state**: 😊 "I can see where it is" → 😌 "It's real, someone will look at this"
**What Maria sees**:
- Horizontal pipeline: SUBMITTED → UNDER_REVIEW → FEASIBLE → IN_VOTING → SELECTED → IN_PROGRESS → COMPLETED
- Current stage: filled + pulsing indicator
- Past stages: filled with timestamp and actor
- Future stages: outlined, gray
- Exception badge if applicable: STALLED, RETURNED, MERGED
- "What happens next" text under current stage

### Step 4: Check Back Later (Pipeline Persistence)
**Input**: Return to idea detail page
**Expected output**: Pipeline shows new stage if changed, with timestamp
**Emotional state**: 😐 "Let me check" → either 😊 "It moved!" or 😌 "It says 'awaiting city response' — at least I know"
**What Maria sees**:
- Pipeline with any new stages filled
- If stalled: explicit label "Waiting for: City department review" with date of last action
- If moved: celebration animation on the new stage
- Status change history timeline below pipeline

### Step 5: Receive Notification (if opted in)
**Input**: Browser notification or email
**Expected output**: "Your idea 'Broken sidewalk' moved to Under Review"
**Emotional state**: 😊 Surprise delight → 😊 "I didn't even have to check!"
**What Maria sees**:
- Push notification with idea title and new stage
- Tap notification → deep link to idea detail page showing updated pipeline

## Happy Path: Discover Existing Ideas (Ion — Curious Newcomer)

```
Step 1 → Step 2 → Step 3 → Step 4
Land on   Filter   Tap an    See impact
homepage  by dist  idea      (pipeline + completed)
```

### Step 1: Land on Homepage
**Input**: Shared link or search result
**Expected output**: Understand the platform's purpose in <30 seconds
**Emotional state**: 😐 Skeptical → 🤔 "Okay, this looks legit"
**What Ion sees**:
- Map showing idea density in his district
- "COMPLETED" ideas highlighted with green pipeline fills
- Stats: "12 ideas completed, 47 in progress"
- Language switcher (HU visible)

### Step 2: Filter by District
**Input**: Tap district filter or map zoom
**Expected output**: See only Gheorgheni ideas
**Emotional state**: 🤔 → 😊 "These are my neighbors' ideas"
**What Ion sees**:
- Filtered idea list with mini-pipeline indicators
- Map zooms to district

### Step 3: Tap an Idea
**Input**: Click idea card
**Expected output**: See the full pipeline — including completed stages
**Emotional state**: 😊 → 😲 "This one actually got done!"
**What Ion sees**:
- Full pipeline with all stages filled for completed ideas
- "Completed: [date]" with before/after photos if available
- Progress updates timeline

### Step 4: Decide to Participate
**Input**: See completed project + "Back this idea" or "Propose your own"
**Expected output**: Low-friction path to support an existing idea or submit a new one
**Emotional state**: 😲 → 😊 "Maybe I should propose that pothole"
**What Ion does**:
- Clicks "Back this idea" → vote recorded without account
- OR clicks "Propose" → enters submission flow

## Emotional Arc

```
Confidence
    │
  5 │                                    ★ notification
    │                               ★
  4 │                          ★ pipeline moved
    │                     ★
  3 │          ★ see pipeline
    │     ★
  2 │★ land on homepage
    │
  1 │
    └──────────────────────────────────────
    Step1  Step2  Step3  Step4  Step5
```

**Key design principle**: Confidence must build at each step. Step 1 (homepage) must immediately signal legitimacy. Step 3 (pipeline) must immediately signal progress. Step 5 (notification) must feel proactive, not passive.

## Error Paths

### E1: Pipeline Stalled (idea hasn't moved in 30+ days)
**Detection**: Current stage has timestamp >30 days ago
**Recovery**: Show explicit "Waiting for: [responsible party]" label. Show last action date. Don't hide the stall — make it visible so the platform creates accountability pressure.
**Emotional state**: 😟 → 😌 "At least I know, and others can see it too"

### E2: Idea Rejected
**Detection**: Status = REJECTED
**Recovery**: Pipeline shows all stages up to rejection point + red "Rejected" marker + reason text from status change note. Show "What you can do: revise and resubmit / support a similar idea" CTA.
**Emotional state**: 😞 → 😐 "I understand why, and I have options"

### E3: Idea Merged
**Detection**: Status = MERGED or status change note contains "merged with"
**Recovery**: Pipeline shows merge point + link to the parent idea. "Your idea was combined with [parent idea title] — follow its progress here."
**Emotional state**: 😐 → 😊 "My input is part of something bigger"

### E4: No Ideas in District
**Detection**: District filter returns 0 results
**Recovery**: "Be the first in [District Name] to propose an idea" + CTA to submit. Show stats from other districts as social proof.
**Emotional state**: 🤔 → 😊 "I could be the one to start"

### E5: Submission Failure (rate limit or validation)
**Detection**: API returns 429 or 400
**Recovery**: Clear error message: "Too many submissions — try again in [X minutes]" or "Please fill in [field name]". Preserve form data.
**Emotional state**: 😤 → 😐 "Okay, I'll fix it"

## Shared Artifacts Registry

| Artifact | Source | Consumer | SSOT Location |
|----------|--------|----------|---------------|
| `${ideaId}` | Created on submission | Pipeline, notifications, detail page | URL path `/ideas/${ideaId}` |
| `${participantToken}` | Generated client-side (localStorage) | Vote, comment, submission | Client localStorage |
| `${currentStage}` | Derived from `idea.status` + `StatusChange` table | Pipeline component, notification trigger | Idea detail API response |
| `${stageTimestamps}` | `StatusChange.createdAt` for each transition | Pipeline stage fill, timeline | `/api/ideas/${id}/status-changes` |
| `${stageActor}` | `StatusChange.changedBy` | Pipeline attribution | `/api/ideas/${id}/status-changes` |
| `${district}` | `idea.district` or map pin | Homepage filter, map clustering | Idea object |
| `${pipelineStages}` | Hardcoded status enum order | Pipeline component layout | `src/lib/transitions.ts` (existing) |
