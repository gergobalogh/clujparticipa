# DISCUSS Decisions — social-sharing

## Key Decisions
- [D1] WhatsApp and Facebook as primary share channels: Romanian civic groups communicate primarily via WhatsApp; Facebook is secondary but significant for public posts. No Twitter/X or Telegram for MVP. (see: story-map.md)
- [D2] Copy-link as the fallback and baseline: Most Romanian sharing happens via copy-paste into WhatsApp groups. Copy-link must work first and work perfectly. (see: story-map.md)
- [D3] OG meta tags are the foundation: Without rich previews, sharing is ineffective. OG tags must ship before or alongside share buttons. (see: story-map.md — prioritization)
- [D4] UTM params for attribution: Every shared URL gets `utm_source=whatsapp|facebook|copy` to measure channel effectiveness in Umami. (see: shared-artifacts-registry.md)
- [D5] Dynamic OG placeholder via ImageResponse: Ideas without photos get a category-colored placeholder image generated at request time, not a static fallback. (see: slice-04-og-placeholder.md)

## Requirements Summary
- Primary jobs/user needs: JOB-006 (Civic Advocacy — share ideas with personal network) and JOB-007 (Credible First Impression — rich previews for shared links). Both are under-served (satisfaction = 1).
- Walking skeleton scope: Copy Link + OG Tags (Slices 1+2) — the thinnest end-to-end value delivery.
- Feature type: User-facing

## Constraints Established
- Idea detail page is currently a `"use client"` component — `generateMetadata` requires server-side data access. This may require restructuring (see DESIGN wave).
- OG images must be absolute URLs with `NEXT_PUBLIC_APP_URL` origin — relative URLs don't work in social previews.
- WhatsApp Web intent URL format: `https://wa.me/?text=...` (not `whatsapp://send?text=...` — the deep link doesn't work reliably on desktop).
- Facebook sharer.php only uses the URL parameter — the preview comes from OG tags on the target page, not from the share dialog.

## Upstream Changes
- None — this feature is purely additive with no contradictions to prior wave artifacts.
