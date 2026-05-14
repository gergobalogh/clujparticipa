# ClujParticipa Design Plan

## Direction

The interface should feel like a plain municipal service, not a startup landing page. The reference is the Vantaa participatory budgeting site: content first, clear navigation, obvious actions, minimal decoration, and practical page layouts.

Simple AF means:

- No hero spectacle, gradients, decorative blobs, or illustration-heavy sections.
- No marketing copy such as "empower", "unlock", or "shape the future".
- No oversized cards or ornamental layouts where a list, form, or table would be clearer.
- Use whitespace for readability, not drama.
- Make every page usable before making it attractive.

## Visual System

- Background: white or near-white.
- Text: very dark slate/black.
- Accent: one civic blue used sparingly for links, focus states, active nav, and primary actions.
- Borders: light gray, visible enough to separate controls and list rows.
- Radius: small, 4-8px.
- Typography: system-like, readable, no display treatment beyond clear page titles.
- Icons: only where they clarify repeated actions; avoid decorative icons.

## Layout Rules

- Header is simple: brand, primary nav, language switcher.
- Footer is simple: prototype note, privacy link, non-binding participation note.
- Main content uses a centered container around `max-w-5xl`.
- Pages start with a title and, only when useful, a short explanatory paragraph.
- Primary actions sit near the page title.
- Repeated content uses list rows or compact cards.
- Forms are one-column and mobile-first.

## Core Page Patterns

### Homepage

- Title: `ClujParticipa`.
- One short paragraph explaining the prototype.
- Three direct actions: submit idea, browse ideas, open map.
- Simple stats row: ideas, votes, comments, in-progress items.
- Recent ideas list.

### Ideas List

- Filters at top using normal form controls.
- Idea rows show title, district, category, status, support count, and comment count.
- Sorting and pagination should be clear but understated.
- Prefer scan-friendly rows over decorative grids.

### Idea Detail

- Title, status, district/category metadata.
- Description first.
- Support block clearly labeled as non-binding.
- Comments below the main content.
- Status timeline as a simple vertical list.
- Map pin lower on the page unless location is the core story.

### Submission Form

- Labels above inputs.
- Required fields are obvious.
- Validation text is direct and close to the field.
- Map location selector can be a plain framed tool area.
- Submit button is primary; cancel/back action is secondary.

### Map

- Functional map, not a showcase.
- Filters above the map on mobile and beside/above it on desktop.
- Popups show title, status, support count, and a detail link.
- The list view remains the primary browsing experience.

### Admin

- Dense, plain operational layout.
- Tables or rows over cards.
- Status controls and moderation actions must be explicit.
- Audit trail should be visible and boring.

## Copy Rules

Use plain civic language:

- Submit an idea
- Browse ideas
- Support
- Status
- Under review
- In progress
- Completed
- Rejected

Avoid campaign language:

- Empower your community
- Shape the future
- Unlock civic innovation
- Transform participation

## Accessibility Baseline

- All interactive controls must have visible focus states.
- Color is not the only status indicator.
- Form fields have explicit labels.
- Buttons and links use clear text.
- Language switching must preserve the current route when possible.
- Text must remain readable on mobile without overlap.

## Implementation Plan

1. Build the app shell: header, footer, container, nav, and language switcher placement.
2. Define shared UI primitives: button, badge, input, textarea, select, card/list row.
3. Apply the shell and primitives to the existing placeholder pages.
4. Add a privacy/prototype note page and footer link.
5. Verify responsive behavior and run lint/type/build checks.
