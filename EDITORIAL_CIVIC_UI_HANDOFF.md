# Editorial Civic UI Handoff

## Purpose

Use this file to resume the design/implementation conversation after work starts on `EDITORIAL_CIVIC_UI_TASKS.md`.

The task plan contains the full implementation checklist and definitions of done. This handoff captures the decisions already aligned in conversation, the intended sequencing, and the open checkpoints to revisit after tasks are implemented.

## Current State

No implementation changes have been made as part of this alignment session.

Created/updated planning files:

- `EDITORIAL_CIVIC_UI_TASKS.md`
- `EDITORIAL_CIVIC_UI_HANDOFF.md`

Existing relevant code areas inspected during planning:

- `src/components/layout/header.tsx`
- `src/components/layout/footer.tsx`
- `src/components/layout/language-switcher.tsx`
- `src/components/layout/user-menu.tsx`
- `src/app/[locale]/page.tsx`
- `src/app/[locale]/ideas/page.tsx`
- `src/components/ideas/idea-card.tsx`
- `src/app/[locale]/ideas/[id]/page.tsx`
- `src/app/[locale]/map/page.tsx`
- `src/components/map/map-view.tsx`
- `src/app/[locale]/ideas/new/page.tsx`
- `src/app/[locale]/results/page.tsx`
- `src/app/[locale]/privacy/page.tsx`
- `src/app/[locale]/terms/page.tsx`
- `src/app/[locale]/data-deletion/content.tsx`
- `src/app/[locale]/bug-report/page.tsx`
- `src/app/[locale]/admin/page.tsx`

## Agreed Direction

The target feel is inspired by the reference app in `/home/jack/Downloads/clujparticipa`, but the production app should not become a clone.

Keep the real Next.js app practical and accessible while borrowing:

- Warm paper/ink colors.
- Editorial display typography for brand, headings, and idea titles.
- Compact uppercase metadata.
- Stronger map/feed relationship.
- Flatter, sharper public UI.
- Static high-contrast footer with language controls.

Avoid:

- Moving footer ticker.
- Full-screen fixed layouts everywhere.
- Decorative hero illustrations.
- Generic blue/slate SaaS styling as the dominant feel.
- Public Admin nav item.
- Major admin workflow redesign.

## Decisions Already Made

### App Shell

- Move `RO`, `HU`, `EN` language switching out of the header and into the footer.
- Remove `Admin` from public primary navigation.
- Keep `/admin` directly reachable for now.
- Keep participant auth/user controls in the header.
- Use compact uppercase public nav with active underline/ink treatment.
- Use a static ink/paper footer, no movement.

### Homepage

- Replace the current landing-style layout with a civic console.
- Main content should be recent ideas plus a real map/map-preview area.
- Use real `/api/stats` data where possible.
- Main heading should be `ClujParticipa` with translated support text.
- Remove the decorative SVG panel.
- Recent ideas should be typographic, not image-led.

### Ideas List

- Default browse view should be single-column editorial rows.
- No grid/list toggle in the first pass.
- Rows may show small thumbnails on desktop when images exist.
- Include metadata, title, short description, support count, comment count.
- Keep existing filters and sorting.

### Idea Detail

- Treat as a civic record with a practical action area.
- Desktop should have a right-side support/status action rail.
- Mobile should show support/vote near the top.
- Description remains primary.
- Carousel remains, with flatter styling.
- Map moves lower than the core idea/action content.
- Progress updates should have more public weight than raw status history.
- Comments remain practical.

### Map

- Make map page feel like a workspace.
- Use a larger responsive map on desktop.
- Keep compact filters.
- No side results panel in first pass.
- Restyle pins and popups to match the editorial idea language.
- Popups should show localized status text, not raw status keys.

### Submit Idea

- Keep single-page form.
- No wizard.
- Use subtle section rhythm.
- Keep photos after description.
- Keep map picker behavior, Cluj center default, and district fly-to.
- Use new public primary button style for submit.
- Keep anonymous submission token behavior.

### Results

- Treat results as a formal civic board.
- Use "Selected" rather than "Winner".
- Avoid bright celebratory winner cards.
- Do not show images in first pass.
- Include voting open/closed/scheduled status when available.
- Be careful not to overstate officialness while this is a prototype.

### Legal And Support Pages

- Keep plain document layout.
- Use paper/ink and revised typography.
- Page titles may use display serif.
- Body text remains sans-serif and narrow.
- Bug report remains footer-linked, not nav-linked.

### Admin

- Keep dense, operational, and table-like.
- Token refresh only.
- No public editorial treatment.
- No auth mechanic changes.
- Danger actions remain red.

## Recommended Implementation Order

1. Design tokens and typography.
2. Shared UI primitives: buttons, badges, inputs, textarea, select.
3. Header and footer shell.
4. Homepage civic console.
5. Ideas list rows and idea presentation components.
6. Map page and map popups.
7. Idea detail layout/action rail.
8. Submit idea form styling.
9. Results board.
10. Legal/support pages.
11. Admin token-only pass.
12. Responsive/accessibility verification.

## Resume Checklist After Implementation Starts

When returning to this session, first check:

- Which tasks from `EDITORIAL_CIVIC_UI_TASKS.md` were implemented.
- Whether implementation followed the agreed decisions above.
- Whether any scope changed during implementation.
- Whether there are visual regressions on mobile or desktop.
- Whether language switching still preserves routes from the footer.
- Whether Admin is absent from the public nav.
- Whether `/admin` remains directly reachable.
- Whether homepage uses real data and not decorative placeholders.
- Whether public pages avoid generic blue/slate dominance.
- Whether admin stayed operational and dense.

## Verification Commands

Use the commands already appropriate for this repo:

```bash
npm run lint
npm run type-check
```

If implementation touches behavior, also run the relevant test suite or focused tests.

## Manual Review Targets

Review at mobile and desktop widths:

- Header nav and auth controls.
- Footer links and footer language switcher.
- Homepage first viewport.
- Ideas list row readability.
- Idea detail support/vote placement.
- Map page height, filters, pins, and popups.
- Submit idea form and map picker.
- Results page ranking and selected ideas.
- Legal/support document readability.
- Admin table density and moderation controls.

## Open Follow-Up Questions

These were not fully decided and can be revisited later:

- Whether to create a dedicated `/login` route that includes participant login and admin access.
- Whether homepage map preview should always be a real Leaflet map or fall back to a lighter static preview on slow devices.
- Whether idea list should eventually offer a grid mode.
- Whether participant hash display on comments should become friendlier copy such as "Anonymous participant".
- Whether admin should eventually move behind stronger authentication instead of the current secret-key flow.
