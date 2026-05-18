# DESIGN Decisions — social-sharing

## Key Decisions
- [D1] Server component shell for idea detail page: `generateMetadata` requires a server component. The existing `"use client"` page must be restructured as server shell + client island. (see: ADR-001 in feature-delta.md)
- [D2] Sonner for toast: add `sonner` package for the "Link copied" toast notification. Lightweight, accessible, commonly paired with Next.js. (see: DDD-3)
- [D3] ImageResponse for OG placeholder: use native `next/og` `ImageResponse` for dynamic OG images. No external image generation service needed. (see: DDD-5)
- [D4] IdeaShareRow standalone component: encapsulate all share logic (WhatsApp, Facebook, copy-link) in a single client component. Testable in isolation. (see: DDD-6)
- [D5] Category hex colors: extend `category-colors.ts` with `categoryOgColors` hex mapping for use in ImageResponse (Tailwind classes don't work in server-side image generation). (see: DDD-8)

## Architecture Summary
- Pattern: Server component shell + client island (standard Next.js App Router)
- Paradigm: OOP (TypeScript/React — existing project paradigm)
- Key components: IdeaDetailPage (server), IdeaDetailClient (client island), IdeaShareRow, OG image route handler

## Reuse Analysis
| Existing Component | File | Overlap | Decision | Justification |
|-------------------|------|---------|----------|---------------|
| IdeaDetailPage | src/app/[locale]/ideas/[id]/page.tsx | Idea rendering, data fetch | EXTEND | Restructure as server shell + client island |
| categoryCardColors | src/lib/category-colors.ts | Category colors | EXTEND | Add hex mapping for ImageResponse |
| trackEvent | src/lib/analytics.ts | Analytics | EXTEND | Add "idea_share" to event name union |
| generateMetadata pattern | src/app/[locale]/how-it-works/page.tsx | Server metadata | EXTEND (reference) | Follow same async pattern |
| lucide-react | package.json | Icons | EXTEND | Import Share2, Copy from existing package |
| Locale files | src/i18n/messages/ | i18n | EXTEND | Add Share namespace |
| Toaster | N/A | Toast | CREATE NEW | No toast exists — add sonner |
| copyToClipboard | N/A | Clipboard | CREATE NEW | ~15 lines, no dependency |
| IdeaShareRow | N/A | Share UI | CREATE NEW | No share component exists |
| OG image route | N/A | Dynamic images | CREATE NEW | No image generation route exists |

## Technology Stack
- Next.js 16.2.6 (existing): generateMetadata, ImageResponse
- sonner ^2.x (new): toast notifications
- Prisma ^7.8.0 (existing): server-side data fetch
- lucide-react ^1.16.0 (existing): share icons
- next-intl ^4.11.2 (existing): i18n for share text and OG description

## Constraints Established
- `NEXT_PUBLIC_APP_URL` env var must be set in production for absolute OG image URLs
- Idea detail page restructuring is the highest-risk change (735-line component split)
- ImageResponse cannot use Tailwind classes — requires hex color values
- Facebook sharer.php reads OG tags from the target page at fetch time — OG tags must be in the HTML response, not added client-side

## Upstream Changes
- None — no DISCUSS assumptions changed by DESIGN decisions
