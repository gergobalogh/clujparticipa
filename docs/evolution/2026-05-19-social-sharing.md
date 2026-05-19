# Social-Sharing Feature Evolution

**Feature ID**: social-sharing
**Completed**: 2026-05-19
**Branch**: redesign

## Summary

Added WhatsApp/Facebook share buttons, copy-link, OG meta tags, and dynamic OG placeholder images to idea detail pages. Idea detail page restructured from client component to server shell + client island pattern to support `generateMetadata`.

## Key Artifacts

- Feature delta: `docs/feature/social-sharing/feature-delta.md`
- Roadmap: `docs/feature/social-sharing/deliver/roadmap.json`
- Execution log: `docs/feature/social-sharing/deliver/execution-log.json`

## Commits (11)

1. `5b07a00` — categoryOgColors hex mapping with fallback (01-02)
2. `b393636` — copyToClipboard with execCommand fallback (02-01)
3. `561e403` — idea_share AnalyticsEventName union (02-02)
4. `db5d8a9` — OG image route walking skeleton (01-01)
5. `d4cd299` — restructure ideas/[id] to server shell with generateMetadata (01-03)
6. `e24a249` — generateMetadata emits og:image with absolute URL (01-04)
7. `39af544` — Toaster component, layout mount, Share i18n keys (02-03)
8. `7f9dba1` — OG image route with category colors, title truncation, error handling, placeholder wiring (01-05)
9. `af95dac` — IdeaShareRow with WhatsApp, Facebook, copy-link buttons (03-01/02/03)
10. `99813b6` — refactoring: em-dash convention, locale in share URLs, distinct Facebook icon
11. `d8acf69` — fix: trackEvent on WhatsApp/Facebook, i18n share text, translated OG category, Facebook fallback, toast on fallback

## Test Coverage

48 tests across 8 test files, covering all 28 DISTILL scenarios.

## Shipped Components

| Component | Path |
|-----------|------|
| IdeaDetailPage (server shell) | `src/app/[locale]/ideas/[id]/page.tsx` |
| IdeaDetailClient (client island) | `src/components/ideas/idea-detail-client.tsx` |
| IdeaShareRow | `src/components/ideas/idea-share-row.tsx` |
| Toaster | `src/components/ui/toaster.tsx` |
| OG image route | `src/app/api/og/ideas/[id]/route.tsx` |
| copyToClipboard | `src/lib/clipboard.ts` |
| buildOgDescription | `src/lib/og-metadata.ts` |
| truncateOgTitle | `src/lib/og-image-helpers.ts` |
| categoryOgColors | `src/lib/category-colors.ts` |
| idea_share analytics | `src/lib/analytics.ts` |
