# Story Map — social-sharing

## Backbone (Activities)

1. **Discover share controls** — Locate share buttons on idea detail page
2. **Share via channel** — Choose WhatsApp, Facebook, or copy-link
3. **Render rich preview** — OG meta tags generate compelling link previews
4. **Track sharing** — Measure which channels drive traffic and conversions

---

## Walking Skeleton

**Slice 0 — Copy Link + OG Tags**: The thinnest end-to-end slice. A resident can copy the idea URL and paste it anywhere — and when a recipient sees the link in WhatsApp/Facebook, they see a rich preview. This delivers value even without the WhatsApp/Facebook intent buttons because most sharing in Romania happens via copy-paste into WhatsApp groups.

---

## Elephant Carpaccio Slices

### Slice 1: Copy Link Button
**Goal**: One-tap copy of the idea URL to clipboard with UTM tracking.
**IN scope**: Copy-link button on idea detail page (mobile + desktop), clipboard API, toast confirmation, UTM param generation (`utm_source=copy`), i18n for button label and toast.
**OUT scope**: WhatsApp/Facebook intent URLs, OG meta tags, placeholder image generation, analytics event.
**Learning hypothesis**: If residents use the copy-link button at least once per 100 idea detail page views, it validates that people want to share but lack the affordance. If zero usage, sharing demand may be lower than assumed.
**Effort**: ~4 hours (1 new component, i18n strings, toast utility)
**Dogfood moment**: Team copies a link and shares it in their own test WhatsApp group.
**Production data**: Copy-clicks tracked via existing `trackEvent("idea_share", { channel: "copy" })`.

### Slice 2: OG Meta Tags (with uploaded image)
**Goal**: Idea detail pages emit `og:title`, `og:description`, `og:image` in `<head>` for ideas that have uploaded images.
**IN scope**: `generateMetadata` in idea detail page (convert to server component metadata or add metadata export), og:title = idea.title, og:description = truncated description + category/district, og:image = first uploaded image URL, og:url = canonical URL.
**OUT scope**: Placeholder image for ideas without images, WhatsApp/Facebook share buttons, Twitter card tags.
**Learning hypothesis**: If OG previews render correctly in WhatsApp/Facebook link previews (verified by pasting a link), it validates the metadata pipeline. If previews don't render, Next.js App Router metadata generation may need a different approach.
**Effort**: ~4 hours (metadata export function, URL construction, truncation logic)
**Dogfood moment**: Paste an idea URL into WhatsApp Web and verify the preview card renders.
**Production data**: UTM-tagged traffic from social platforms visible in Umami.

### Slice 3: WhatsApp + Facebook Share Buttons
**Goal**: One-tap share to WhatsApp (Web intent) and Facebook (sharer.php).
**IN scope**: WhatsApp icon button (opens `wa.me?text=...`), Facebook icon button (opens `sharer.php?u=...`), pre-filled share text with idea title/category/district/URL, UTM params (`utm_source=whatsapp`, `utm_source=facebook`), i18n for share text template, fallback to copy-link if WhatsApp intent fails.
**OUT scope**: Twitter/X share, Telegram share, email share, native Web Share API, placeholder OG image.
**Learning hypothesis**: If WhatsApp share clicks outnumber Facebook 5:1 (expected for Romanian civic groups), it validates WhatsApp as the primary channel. If Facebook matches or exceeds, the audience may be different than assumed.
**Effort**: ~4 hours (share button component, intent URL builders, fallback logic, i18n)
**Dogfood moment**: Share an idea to the team's WhatsApp group and a test Facebook post.
**Production data**: Share-clicks per channel tracked via `trackEvent("idea_share", { channel: "whatsapp"|"facebook" })`.

### Slice 4: OG Placeholder Image (ideas without photos)
**Goal**: Generate a dynamic OG image for ideas that have no uploaded photos — category-colored background with idea title and category label.
**IN scope**: Next.js `ImageResponse` route (`/api/og/ideas/[id]`), category color mapping, title text rendering, font loading, fallback in `generateMetadata` when `idea.images` is empty.
**OUT scope**: Custom fonts beyond system, complex layout (photo+text), admin-customizable OG images.
**Learning hypothesis**: If placeholder OG images render in social previews, it validates the ImageResponse pipeline for future dynamic image generation. If rendering fails or social platforms reject the image, we may need a static fallback approach.
**Effort**: ~5 hours (API route, ImageResponse template, category color mapping, font handling)
**Dogfood moment**: Share an idea with no photos and verify the colored placeholder renders in WhatsApp preview.
**Production data**: None directly — value is indirect via higher click-through rates on ideas without photos.

---

## Prioritization

| Slice | Priority | Rationale |
|-------|----------|-----------|
| Slice 2 (OG Tags) | 1st | **Foundation** — OG tags are a dependency for Slices 1 and 3. Without OG tags, copied/shared links have no preview. Ship first. |
| Slice 1 (Copy Link) | 2nd | **Lowest risk, highest certainty** — copy-link is the simplest sharing action. Romanian civic groups communicate primarily via WhatsApp, where copy-paste is the default. Validates demand before investing in intent URLs. |
| Slice 3 (WhatsApp + FB) | 3rd | **Channel expansion** — builds on Slice 1's share UI and Slice 2's OG tags. Learning hypothesis about WhatsApp vs. Facebook usage justifies sequencing after demand is validated. |
| Slice 4 (Placeholder OG) | 4th | **Polish** — only ~30% of ideas may lack photos. Value is real but lower urgency than the core share+preview loop. |

**Dependency chain**: Slice 2 → Slice 1 → Slice 3 → Slice 4 (each slice can ship independently but builds on prior learnings)
