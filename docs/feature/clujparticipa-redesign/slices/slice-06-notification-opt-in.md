# Slice 06: Notification Opt-In

**Goal**: Allow residents to opt in to browser notifications when their idea's status changes.

## IN scope
- Browser notification permission prompt after first idea submission
- Notification payload: idea title + new stage name
- Deep link from notification to idea detail page
- Fallback: if notifications denied, show in-app toast on status change

## OUT scope
- Email notifications (future — requires email service integration)
- Push notification service worker (may require VAPID keys setup)
- Pipeline component (Slice 1)

## Learning hypothesis
Disproves "residents won't opt in to notifications" if <10% of idea submitters enable notifications. Confirms that proactive updates drive return visits per O1.

## Acceptance criteria
- After first idea submission, a notification opt-in prompt appears
- If granted, browser notification fires when idea status changes
- Notification contains idea title and new stage name
- Clicking notification navigates to idea detail page
- If permission denied, in-app toast shows on next visit when status has changed

## Dependencies
- Slice 1 (Pipeline shows status; notifications announce the same transitions)
- Service worker registration in Next.js

## Effort estimate
4 hours

## Reference class
Similar to order tracking notifications in food delivery apps.
