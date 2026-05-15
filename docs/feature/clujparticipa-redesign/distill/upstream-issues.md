# Upstream Issues — DISTILL Back-Propagation

Found during DISTILL wave review. These issues exist in prior wave artifacts and should be corrected.

## 1. FEASIBLE vs ELIGIBLE in DISCUSS artifacts

**Files affected**:
- `discuss/user-stories.md` US-01 AC1 — references "FEASIBLE" instead of "ELIGIBLE"
- `discuss/journey-pipeline-tracker-visual.md` Step 3 — references "FEASIBLE"
- `discuss/journey-pipeline-tracker.feature` — references "FEASIBLE"

**Resolution**: DISTILL uses ELIGIBLE per code SSOT (DWD-01). DISCUSS artifacts should be updated to match.

## 2. MERGED/RETURNED not in Prisma Status enum

**Files affected**:
- `discuss/user-stories.md` US-05 AC4-AC6 — reference MERGED and RETURNED as exception states
- `discuss/journey-pipeline-tracker-visual.md` E3 — references "MERGED" status

**Resolution**: DISTILL derives MERGED/RETURNED from StatusChange.note conventions (DWD-08). No schema changes needed. DISCUSS ACs should specify the derivation logic explicitly.

## 3. Stage-to-label mapping incomplete in US-02 AC3

**File affected**: `discuss/user-stories.md` US-02 AC3

**Issue**: Only 2 of 7 stages have defined human-readable labels. The FEASIBLE→"Voting period" mapping is incorrect (FEASIBLE=ELIGIBLE should map to "Eligibility assessment", not "Voting period"; IN_VOTING maps to "Voting period").

**Resolution**: Complete the stage-to-label mapping in `src/lib/stalled-detector.ts` scaffold:
- SUBMITTED → "Submission received"
- UNDER_REVIEW → "City department review"
- ELIGIBLE → "Eligibility assessment"
- IN_VOTING → "Public voting period"
- SELECTED → "Selection for implementation"
- IN_PROGRESS → "Implementation in progress"
- COMPLETED → "Completed"

## 4. Journey Step 5 mentions "email" contradicting D5

**File affected**: `discuss/journey-pipeline-tracker-visual.md` Step 5

**Issue**: Says "Browser notification or email" but D5 locks browser-only. Should say "Browser notification" only.

## 5. DEVOPS pipeline references jest instead of vitest

**File affected**: `feature-delta.md` DEVOPS CI/CD Pipeline Outline

**Issue**: Test step says `npx jest --ci --coverage` but project uses vitest.

**Resolution**: Fixed in DISTILL to `npx vitest run --coverage`.
