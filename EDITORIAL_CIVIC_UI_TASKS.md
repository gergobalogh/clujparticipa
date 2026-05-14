# Editorial Civic UI Task Plan

## Goal

Evolve ClujParticipa toward the stronger civic-dashboard feel of the reference app while keeping the real product usable, accessible, and maintainable.

The target direction is not a full clone. Keep the Next.js app structure and existing feature set, but shift the public experience toward:

- Warm paper and ink colors with restrained civic accents.
- Editorial typography for identity, headings, and idea titles.
- A homepage that feels like the working product, not a landing page.
- A stronger map/feed relationship.
- Sharper, flatter UI surfaces with less generic blue/slate styling.
- A static footer/activity area that keeps the reference footer colors and language controls, without ticker movement.

## Aligned Product Decisions

These decisions were agreed before implementation and should guide scope.

- Move language switching (`RO`, `HU`, `EN`) out of the header and into the footer.
- Remove `Admin` from the public primary navigation.
- Keep `/admin` reachable directly as the admin access page unless a dedicated login route is designed later.
- Do not add footer movement or marquee behavior.
- Use the homepage as a civic console: recent ideas plus real map/activity context.
- Use single-column editorial rows as the default ideas browse view.
- Keep idea detail practical, with a desktop action rail and support/vote placed high on mobile.
- Make the map page a primary workspace with a larger map and compact filters.
- Keep submission and support/legal forms conservative and workflow-first.
- Treat results as an official-looking civic board, not a celebratory winner page.
- Keep admin operational and dense; apply tokens only, not the public editorial style.

## Non-Goals

- Do not add a moving footer ticker.
- Do not force every page into a fixed-height full-screen layout.
- Do not redesign admin pages into expressive/public-facing screens.
- Do not remove existing localization, auth, forms, moderation, or map behavior.
- Do not add decorative hero illustrations or gradient backgrounds.
- Do not add a public Admin nav item.
- Do not add a grid/list toggle to ideas browse in the first pass.

## Design Tokens

### Task 1: Add The Editorial Color System

Introduce shared tokens for the reference-inspired palette.

Suggested baseline:

- `paper`: `#FDFCFB`
- `paper-muted`: `#F5F3F0`
- `ink`: `#1C1C1C`
- `ink-muted`: rgba/opacity variant of ink
- `civic-teal`: teal accent for active/live/community signals
- `civic-blue`: blue accent for selected/official/in-progress signals
- `civic-orange`: orange/amber accent for proposed/review signals

Definition of Done:

- Colors are defined in one shared styling location, preferably Tailwind theme/global CSS.
- Body background can use `paper` without breaking existing pages.
- Existing blue primary actions still have an intentional mapping, either retained as `civic-blue` or replaced consistently.
- Contrast passes for body text, primary buttons, badges, and nav states.
- No page becomes dominated by a single blue/slate palette.

### Task 2: Add Display Typography

Add a serif display font for selected editorial moments while keeping the current sans font for UI.

Definition of Done:

- A display serif is available through a reusable class or Tailwind token.
- Serif is used only for brand/title/idea-heading treatments, not dense UI controls.
- Existing form fields, tables, buttons, admin screens, and small labels remain sans-serif.
- No text overlap or excessive line-height changes occur on mobile.

## App Shell

### Task 3: Restyle The Header

Move the header closer to the reference app: stronger brand mark, uppercase compact nav, ink/paper styling, and sharper visual separation.

Definition of Done:

- Header uses paper/ink colors instead of default white/slate styling.
- Brand has a stronger first-viewport signal: mark plus `ClujParticipa` treatment.
- Desktop nav uses compact uppercase labels with active underline or ink treatment.
- Mobile nav remains accessible and obvious.
- Language switcher is removed from the header.
- Auth/user controls remain present and usable.
- `Admin` is removed from the primary nav.
- Conditional `Results` behavior remains available for public results.

### Task 4: Create A Static Ink Footer Bar

Keep the reference footer's high-contrast ink/paper feel and language controls, but skip movement.

Definition of Done:

- Footer or bottom bar uses ink background and paper text on public pages.
- It includes `RO`, `HU`, `EN` language controls in the footer area.
- It can include static civic status text, prototype note, voting-period status, or key links.
- There is no marquee, animation, or automatic horizontal motion.
- Legal/prototype links remain accessible.
- Footer works on mobile without horizontal overflow.
- Bug report, privacy, data deletion, and terms remain discoverable from the footer.

## Homepage

### Task 5: Replace Landing Layout With Civic Console Layout

Redesign the homepage around the actual product: recent ideas plus map/activity context.

Definition of Done:

- Homepage first viewport shows recent ideas and a map/map-preview area.
- Primary action to submit an idea is visible without relying on marketing copy.
- Existing stats API data is reused where practical.
- Recent ideas are real data, not hard-coded decorative examples.
- The map area uses a real map preview if performance is acceptable, and links naturally to the full map page.
- Layout is responsive: stacked on mobile, split on desktop.
- No oversized hero card, gradient illustration, or generic SaaS hero remains.
- Homepage heading uses `ClujParticipa` as the main brand heading with translated supporting text.
- Recent ideas do not show large images by default; the feed is primarily typographic.
- The current decorative SVG panel is removed.

### Task 6: Add Live Civic Status Treatment Without Motion

Add the sense that the platform is active without using the moving ticker.

Definition of Done:

- Homepage includes a compact static status strip or inline status badges.
- The strip can show items such as voting phase, total ideas, total votes, recent update, or active districts.
- At least one value is backed by real app data when available.
- Any pulse animation is optional and limited to a small status dot, not a full moving ticker.
- Copy is plain civic language, not marketing language.
- The status treatment can reuse total ideas, support votes, comments, active voting status, or status counts.

## Idea Presentation

### Task 7: Introduce Editorial Idea Feed Rows

Create or adapt a compact idea row treatment inspired by the reference feed.

Definition of Done:

- Recent/homepage idea items show district/category/status as small uppercase metadata.
- Idea titles use the display serif treatment.
- Support and comment counts use compact icon+number or compact text metadata.
- Rows feel clickable without needing large card chrome.
- Hover state is subtle: underline, ink shift, or light background.
- Existing `IdeaCard` behavior is preserved where grid cards are still appropriate.
- Browse page default view is a single-column editorial row list.
- Desktop rows may include a small right-side thumbnail when an image exists.
- Mobile rows remain compact and readable, with thumbnails reduced or omitted when needed.
- Rows include a one-to-two-line description where available.
- No grid/list toggle is added in the first pass.

### Task 8: Tune Idea Cards Away From Generic SaaS Cards

For browse pages, reduce the rounded-card/blue-hover feel and align them with the editorial system.

Definition of Done:

- Idea cards or rows use smaller radius, thinner borders, and paper/white surfaces.
- Title, status, district/category, support count, and comments remain scannable.
- Category/status colors are semantic accents, not dominant blocks.
- Image handling still works for uploaded idea images.
- Rejected/eligible/in-voting states remain distinguishable without relying on color alone.
- If a separate `IdeaListRow` component is added, keep `IdeaCard` available for contexts that still need card/compact card behavior.

## Idea Detail

### Task 9: Redesign Idea Detail As Civic Record

Make the detail page feel like a readable civic record with a practical action area.

Definition of Done:

- Idea title uses the display serif treatment.
- District, category, submitted date, and status are shown as compact metadata, not heavy labels.
- Desktop layout includes a right-side action rail for support/vote and status summary.
- On mobile, support/vote appears near the top before map, history, and comments.
- Description remains primary readable content and is not placed inside a heavy card.
- Image carousel remains available when images exist, with a sharper/flatter frame.
- Map appears below the core idea/action content.
- Feasibility and rejection notes use restrained official callout styling.
- Progress updates appear before or above raw status history.
- Status history remains available as a quieter audit timeline.
- Comments remain practical and accessible.
- Participant hash or anonymous identity text is visually de-emphasized.

## Map Experience

### Task 10: Make The Map More Central Visually

Give the map stronger visual weight on the homepage and map page.

Definition of Done:

- Homepage map preview feels like a primary workspace rather than a decorative illustration.
- Full map page gives the map more vertical space and less surrounding generic page chrome.
- Map controls and filters still remain usable on mobile and desktop.
- Leaflet tiles, markers, and popups continue to work.
- Marker colors align with the new semantic accent palette.
- Desktop map height is substantially larger than the current embedded `500px` treatment where viewport space allows.
- Mobile map remains usable at an appropriate fixed/minimum height.
- Filters sit inline with the page title area on desktop and above the map on mobile.
- No side results panel is added in the first pass.
- Map frame uses the paper/ink system rather than generic slate card styling.

### Task 11: Restyle Map Popups And Pins

Bring map details into the same visual language as the idea feed.

Definition of Done:

- Pins use clear semantic colors with enough contrast on the map.
- Popups show title, status, support count, and detail link.
- Popup typography and badges match the revised UI system.
- The detail link is keyboard-accessible and localized where applicable.
- Popups include localized status text rather than raw status keys.
- Popups prioritize district/category/status metadata and idea title.

## Shared UI Components

### Task 12: Update Buttons, Badges, And Controls

Revise shared primitives so pages inherit the new system consistently.

Definition of Done:

- Primary buttons use ink or civic accent intentionally; submit-style public actions default to ink primary.
- Secondary buttons use paper/white, ink text, and light borders.
- Badges use semantic accents with restrained backgrounds.
- Inputs/selects remain conventional and accessible.
- Focus states are visible and meet contrast requirements.
- No component change breaks form usability.
- Existing form pages migrate toward shared `Input`, `Textarea`, `Select`, and `Button` primitives where practical.

### Task 13: Add Icons Where They Improve Scanning

Use icons for repeated compact metadata and controls, not decoration.

Definition of Done:

- Support/comment metadata uses recognizable compact icons where useful.
- Icons come from the existing icon library if available.
- Icons have appropriate sizing and do not cause layout shifts.
- Buttons with icons still have accessible labels or visible text.

## Submit Idea Form

### Task 14: Keep Submission Workflow Conservative

Refresh the submit page visually without changing the workflow into a wizard.

Definition of Done:

- Submit form remains a single-page form.
- Page title may use display serif; labels, fields, and help text remain sans-serif.
- Form uses subtle section rhythm for proposal, photos, category/district, location, and notifications.
- Photos remain after description.
- Image upload keeps drag/drop, validation, previews, and reorder behavior.
- Dropzone uses paper/ink styling with restrained hover.
- Map picker keeps Cluj center default, required location behavior, and district fly-to.
- Submit button uses the new public primary style.
- Anonymous submission token behavior remains unchanged.
- Success state includes a path to view the created idea.

## Results

### Task 15: Restyle Results As Civic Board

Make the results page feel like a public results board while preserving clarity and non-binding prototype context.

Definition of Done:

- Results page title uses display serif.
- Voting period callout uses official paper/ink or muted civic styling.
- Results copy does not overstate municipal officialness if the process is still a prototype.
- Use "Selected" or "Selected for implementation" rather than "Winner" in the UI.
- Selected ideas are shown as formal list/table-like rows, not bright winner cards.
- In-voting rankings show rank, title, district/category, support count, and status.
- Images are not shown on the results page in the first pass.
- Empty state stays simple and may link to browse ideas or map.
- Voting open/closed/scheduled status is shown when data supports it.

## Legal And Support Pages

### Task 16: Apply Plain Document Styling

Let legal and support pages inherit the new system without making them expressive dashboards.

Definition of Done:

- Privacy, terms, data deletion, bug report, and similar pages use paper/ink colors.
- Page titles may use display serif.
- Body text stays readable, narrow, and sans-serif.
- Existing `max-w-3xl` document measure is preserved.
- Links use the revised link treatment.
- Forms use shared primitives and revised button styles.
- Sections are not wrapped in decorative cards unless needed for function.
- Bug report remains footer-linked, not primary nav.
- Data deletion status messages remain clear and semantically colored.

## Admin

### Task 17: Keep Admin Operational

Admin should remain dense and functional, with only token-level visual updates.

Definition of Done:

- Admin is removed from public header navigation.
- `/admin` remains directly reachable unless a dedicated login route is designed later.
- Admin auth mechanics are unchanged.
- Tables, tabs, compact inline controls, and moderation workflows remain structurally intact.
- Admin typography stays plain sans-serif.
- Token updates apply to borders, focus states, buttons, tabs, badges, and table surfaces.
- Danger actions remain clearly red.
- No public editorial homepage/map treatment is applied to admin.

## Page Scope

### Task 18: Apply Public Page Styling First

Roll out the new feel to user-facing pages before admin and legal pages.

Recommended order:

1. Header/footer/app shell.
2. Homepage.
3. Ideas list and idea cards.
4. Map page and map popups.
5. Idea detail page.
6. Submission form.
7. Results page.
8. Legal/prototype/support pages.
9. Admin pages last, with token-only operational styling.

Definition of Done:

- Public navigation feels coherent across home, ideas, map, results, and idea detail.
- Admin remains dense and practical, not overly editorial.
- Legal/prototype pages remain readable and plain.

## Responsive And Accessibility Checks

### Task 19: Verify Mobile Layouts

Definition of Done:

- Header brand, nav, auth controls, and language switching do not overlap.
- Homepage split layout stacks cleanly.
- Idea feed rows remain readable at narrow widths.
- Map controls and filters remain reachable.
- Footer language controls and links wrap without overflow.
- Detail page action rail collapses so support/vote is visible near the top.
- Ideas rows remain readable without thumbnails causing cramped text.

### Task 20: Verify Accessibility

Definition of Done:

- Keyboard focus is visible for nav, language switcher, buttons, cards/rows, map links, and form controls.
- Color is not the only indicator for status.
- Text contrast meets WCAG AA for normal text and controls.
- Motion is limited and nonessential.
- Language switcher remains usable by keyboard and screen reader.
- Footer language controls preserve current route when switching locale.

## Verification

### Task 21: Run Quality Checks

Definition of Done:

- `npm run lint` passes.
- `npm run type-check` passes, if available.
- Relevant tests pass for touched behavior.
- Manual responsive review is completed for mobile and desktop widths.
- Public pages are visually reviewed for text overflow and incoherent overlap.

## Acceptance Criteria For The Whole Redesign

The redesign is complete when:

- The homepage immediately feels like a civic participation workspace.
- The app uses the paper/ink/editorial system consistently on public pages.
- The footer keeps the reference app's ink/paper color confidence and language controls without movement.
- Recent ideas, stats, and map context are real and useful, not decorative.
- Existing participation workflows still work: browse, filter, submit, view map, vote/support, comment, language switching, auth.
- The app remains accessible, responsive, and practical for repeated civic use.
