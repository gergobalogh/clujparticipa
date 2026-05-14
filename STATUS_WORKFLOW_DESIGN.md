# Status & Voting Workflow Design

## 1. Support vs. Vote — one action or two?

**Option A: Two actions (Decidim/Consul model)**
- **Early support/backing** — available on `SUBMITTED` and `UNDER_REVIEW` ideas. Signals community interest. Helps admins prioritize what to review and make eligible.
- **Vote** — only on `IN_VOTING` ideas. The actual ballot.

**Option B: One "support" action (simpler)**
- Available on any non-terminal status (`SUBMITTED`, `UNDER_REVIEW`, `ELIGIBLE`, `IN_VOTING`).
- The `IN_VOTING` phase is about visibility/focus, not a different action.
- Less UI complexity, same data.

**Option C: One action, but different weight/messaging**
- Same action, but the UI label and context change: "Back this idea" on submitted ideas, "Vote" on in-voting ideas.
- Count stays unified, but the UX signals the phase difference.

**Open question:** Does the platform need to distinguish between early backers and voting participants? If yes, Option A. If not, Option B or C keeps it simple.

---

## 2. Valid status transitions

### Current state
Any status can transition to any other status via admin. No validation.

### Proposed flow

```
SUBMITTED → UNDER_REVIEW → ELIGIBLE → IN_VOTING → SELECTED → IN_PROGRESS → COMPLETED
                ↓              ↓            ↓
            REJECTED       REJECTED     REJECTED
```

**Rules:**
- `REJECTED` is terminal — only admin can reopen (transition back to `UNDER_REVIEW`).
- Forward transitions are always allowed.
- Skip-around transitions (e.g., `SUBMITTED` → `IN_VOTING`) should be allowed but discouraged in the UI.
- No backwards transitions except `REJECTED` → `UNDER_REVIEW` (reopen).

### Valid transitions table

| From          | To                                                              |
|---------------|-----------------------------------------------------------------|
| SUBMITTED     | UNDER_REVIEW, REJECTED                                          |
| UNDER_REVIEW  | ELIGIBLE, REJECTED                                              |
| ELIGIBLE      | IN_VOTING, REJECTED                                            |
| IN_VOTING     | SELECTED, REJECTED                                              |
| SELECTED      | IN_PROGRESS                                                    |
| IN_PROGRESS   | COMPLETED                                                      |
| COMPLETED     | — (terminal)                                                   |
| REJECTED      | UNDER_REVIEW (reopen only)                                     |

---

## 3. Admin workflow improvements

### Current state
Raw status dropdown with all options. No guidance, no prioritization.

### Proposed
- Ideas pending review (`SUBMITTED`) highlighted at the top of the admin list.
- **Suggested next status** based on current status (not a free dropdown).
- Quick-action buttons per status:
  - `SUBMITTED`: "Start review" → `UNDER_REVIEW`
  - `UNDER_REVIEW`: "Mark eligible" → `ELIGIBLE`, "Reject" → `REJECTED`
  - `ELIGIBLE`: "Send to voting" → `IN_VOTING`
  - `IN_VOTING`: "Select" → `SELECTED`, "Reject" → `REJECTED`
  - `SELECTED`: "Start implementation" → `IN_PROGRESS`
  - `IN_PROGRESS`: "Mark completed" → `COMPLETED`
  - `REJECTED`: "Reopen" → `UNDER_REVIEW`
- Advanced/expert mode dropdown for override (skip-around transitions).
- Way to reopen rejected ideas if needed.

---

## 4. Public visibility rules

### Current state
All ideas visible regardless of status. No differentiation in the UI.

### Proposed

| Status        | Visible on public list | Visual indicator                          |
|---------------|----------------------|-------------------------------------------|
| SUBMITTED     | Yes                  | "Pending review" badge                    |
| UNDER_REVIEW  | Yes                  | "Under review" badge                      |
| ELIGIBLE      | Yes                  | "Eligible" badge, can be featured         |
| IN_VOTING     | Yes, featured        | "Vote now" badge, prominent in filters   |
| SELECTED      | Yes                  | "Selected" badge                          |
| IN_PROGRESS   | Yes                  | "In progress" badge                       |
| COMPLETED     | Yes                  | "Completed" badge                         |
| REJECTED      | Yes, but dimmed/flagged | "Not eligible" badge, at bottom of list |

**Open question:** Should `REJECTED` ideas be hidden by default with a "show rejected" toggle, or always visible but clearly marked?

---

## 5. Voting/support eligibility per status

| Status        | Can support/vote? | Rationale                                       |
|---------------|-------------------|--------------------------------------------------|
| SUBMITTED     | Yes (support)     | Early signal to admins                          |
| UNDER_REVIEW  | Yes (support)     | Community interest informs eligibility decision  |
| ELIGIBLE      | Yes (support)     | Builds momentum before voting phase              |
| IN_VOTING     | Yes (vote)        | Active ballot                                   |
| SELECTED      | No                | Decision made, voting closed                     |
| IN_PROGRESS   | No                | Decision made, implementation ongoing            |
| COMPLETED     | No                | Terminal                                        |
| REJECTED      | No                | Not eligible for participation                  |

---

## Decisions made (2026-05-14)

1. **Support vs. vote → Option C.** One unified action; the UI label and framing change by phase ("Back this idea" on `SUBMITTED`/`UNDER_REVIEW`/`ELIGIBLE`, "Vote" on `IN_VOTING`). Vote count stays unified. No separate early-backer track.

2. **Transition strictness → Enforce server-side, provide UI override.** The API rejects invalid transitions with HTTP 422. Quick-action buttons are the primary admin UX. An "Advanced" override dropdown remains for skip-around transitions (`force: true` flag in the request body).

3. **Rejected visibility → Always visible, at the bottom.** Aligns with the radical-transparency principle in `CONCEPT.md`. `REJECTED` ideas render after all non-rejected ideas, clearly badged "Not eligible". A show/hide toggle is available as a filter, but the default is to show them.

4. **Skip-around transitions → Allowed via override, blocked in primary UI.** Quick-action buttons enforce the happy path. The override dropdown handles demo resets and edge cases. The API accepts a `force: true` flag (admin only) to permit skip-around moves.
