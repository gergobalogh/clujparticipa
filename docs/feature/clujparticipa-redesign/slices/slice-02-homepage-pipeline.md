# Slice 02: Homepage Pipeline Integration

**Goal**: Show mini-pipeline indicators on idea cards and redesign the homepage to make the pipeline concept visible before clicking.

## IN scope
- Mini-pipeline (3-stage compact indicator) on each idea list card
- Homepage redesign: pipeline metaphor visible in hero section
- Trust signals: partner logos, stats bar, "non-binding prototype" label
- Language switcher prominent for new visitors

## OUT scope
- Full pipeline on detail page (Slice 1)
- Status change timeline (Slice 3)
- Map as homepage hero (Slice 5)
- Notifications (Slice 6)

## Learning hypothesis
Disproves "new visitors don't notice the pipeline metaphor on the homepage" if mini-pipeline on idea cards gets <5% click-through to idea detail. Confirms homepage drives idea detail page visits.

## Acceptance criteria
- Each idea card in the list shows a 3-stage mini-pipeline (submitted/current/completed endpoints)
- Homepage hero section references the pipeline concept ("Track your idea's progress")
- Stats bar shows total ideas, votes, comments (existing — maintain)
- Language switcher is visible in header for all locales
- Mini-pipeline reuses the Pipeline component's stage logic from Slice 1

## Dependencies
- Slice 1 (Pipeline component must exist to reuse stage logic)

## Effort estimate
5 hours

## Reference class
Similar to order status indicators on e-commerce order list pages.
