# Slice 02 — OG Meta Tags (with uploaded image)

**Goal**: Idea detail pages emit `og:title`, `og:description`, `og:image` in `<head>` so shared links render rich previews on WhatsApp, Facebook, and other platforms.

## IN scope
- `generateMetadata` export on the idea detail page
- og:title = idea.title
- og:description = idea.description truncated to 160 chars + category + district
- og:image = first uploaded image URL (absolute, with origin)
- og:url = canonical idea URL (with locale)
- og:type = "website"
- og:site_name = "ClujParticipa"
- Data fetching for metadata (Prisma query for idea by ID, including images)

## OUT scope
- Placeholder image for ideas without images
- WhatsApp/Facebook share buttons
- Twitter card tags (twitter:card, twitter:image)
- Dynamic OG image generation (ImageResponse)

## Learning hypothesis
If OG previews render correctly in WhatsApp/Facebook when a link is pasted, it validates the Next.js App Router metadata generation pipeline. If previews don't render, we may need to investigate SSR timing, image URL format, or platform-specific requirements.

## Acceptance criteria
- GIVEN an idea with id "idea-1" and 1 uploaded image, WHEN a social media crawler fetches the page, THEN the HTML contains `<meta property="og:title" content="{idea.title}">`
- GIVEN an idea with a description > 160 chars, WHEN metadata is generated, THEN og:description is truncated to 160 chars with ellipsis, followed by " — {category}, {district}"
- GIVEN an idea with no uploaded images, WHEN metadata is generated, THEN og:image is omitted (placeholder handled by Slice 4)
- GIVEN the idea detail page is in Romanian locale, THEN og:url contains `/ro/ideas/{id}`
- GIVEN the app is deployed, WHEN I paste an idea URL into WhatsApp Web, THEN a preview card renders with the idea title, description, and image

## Dependencies
- None — this is the foundation slice

## Effort estimate
~4 hours

## Reference class
Next.js generateMetadata with Prisma data fetch — standard App Router pattern. Similar to any dynamic SEO metadata feature.
