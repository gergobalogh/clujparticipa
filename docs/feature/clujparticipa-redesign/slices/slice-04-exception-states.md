# Slice 04: Exception States & Recovery CTAs

**Goal**: Handle rejected, merged, and returned ideas with pipeline-appropriate visual treatment and recovery actions.

## IN scope
- Rejected: red pipeline marker at rejection point + reason text + "Support similar" / "Revise and resubmit" CTA
- Merged: merge point on pipeline + link to parent idea + "Your idea was combined with [title]" text
- Returned: revision prompt with admin note on what to change

## OUT scope
- Pipeline component (Slice 1)
- Timeline (Slice 3)
- Notifications (Slice 6)

## Learning hypothesis
Disproves "exception states don't need special handling" if rejected ideas with follow-up actions = 0. Confirms that recovery CTAs reduce abandonment per O2.

## Acceptance criteria
- REJECTED idea: pipeline shows red marker at rejection stage, reason text from StatusChange.note, CTA buttons visible
- MERGED idea: pipeline shows merge indicator, link to parent idea navigates correctly
- RETURNED idea: pipeline shows return indicator, revision prompt with admin feedback
- CTAs navigate to correct targets (resubmit form, similar idea page)

## Dependencies
- Slice 1 (Pipeline component renders the exception markers)
- Existing status enum includes REJECTED

## Effort estimate
4 hours

## Reference class
Similar to order return/rejection flows in e-commerce.
