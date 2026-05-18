# Slice 04 — OG Placeholder Image (ideas without photos)

**Goal**: Generate a dynamic OG image for ideas that have no uploaded photos — category-colored background with idea title and category label.

## IN scope
- Next.js `ImageResponse` route at `/api/og/ideas/[id]`
- Category color mapping (reuse `src/lib/category-colors.ts`)
- Title text rendering (truncated to fit, max 2 lines)
- Category label rendering
- Font loading (system font or bundled font for ImageResponse)
- Update `generateMetadata`: when `idea.images` is empty, set `og:image` to the placeholder route URL
- Image dimensions: 1200x630 (standard OG image size)

## OUT scope
- Custom fonts beyond system fonts
- Complex layout (photo+text composite)
- Admin-customizable OG images
- Twitter-specific card images
- Caching strategy (beyond Next.js default ISR)

## Learning hypothesis
If placeholder OG images render correctly in WhatsApp/Facebook link previews, it validates the Next.js ImageResponse pipeline for future dynamic image generation (e.g., winner announcements, result visualizations). If social platforms reject the dynamic image, we may need a static SVG or pre-generated PNG fallback.

## Acceptance criteria
- GIVEN an idea with id "idea-2" and 0 uploaded images, WHEN a social media crawler fetches the idea detail page, THEN og:image points to `/api/og/ideas/idea-2`
- GIVEN the OG image route is requested, THEN it returns a 1200x630 PNG image
- GIVEN the idea category is "TRANSPORT", THEN the placeholder image background uses the TRANSPORT category color
- GIVEN the idea title is "New bike lane on Dorobantilor", THEN the title is rendered in white text, centered, max 2 lines, truncated with ellipsis if too long
- GIVEN the OG placeholder renders, WHEN I paste the idea URL in WhatsApp, THEN a preview card appears with the colored placeholder image

## Dependencies
- Slice 2 (OG Tags) — placeholder image is a fallback within the OG metadata system

## Effort estimate
~5 hours

## Reference class
Next.js ImageResponse dynamic OG images — standard pattern documented in Next.js docs. Similar to Vercel OG playground examples.
