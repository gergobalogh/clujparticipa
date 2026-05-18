# Slice 01 — Copy Link Button

**Goal**: One-tap copy of the idea URL to clipboard with UTM tracking.

## IN scope
- Copy-link button on idea detail page (desktop action rail + mobile below vote section)
- Clipboard API (`navigator.clipboard.writeText`) with fallback for older browsers
- Toast notification confirming "Link copied" (i18n in RO/HU/EN)
- UTM param appended: `utm_source=copy`
- Umami event: `trackEvent("idea_share", { channel: "copy", ideaId })`

## OUT scope
- WhatsApp/Facebook intent URLs
- OG meta tags
- Placeholder image generation
- Web Share API (deferred)

## Learning hypothesis
If residents use the copy-link button at least once per 100 idea detail page views, it validates that people want to share but lack the affordance. If zero usage, sharing demand may be lower than assumed.

## Acceptance criteria
- GIVEN I am on an idea detail page, WHEN I tap the copy-link button, THEN the idea URL with `?utm_source=copy` is written to my clipboard
- GIVEN I tap copy-link, THEN a toast appears with the translated "Link copied" message and disappears after 3 seconds
- GIVEN I am on a mobile viewport, WHEN I scroll to the vote section, THEN the copy-link button is visible below the vote button
- GIVEN I am on a desktop viewport, WHEN I look at the action rail, THEN the copy-link button is visible in the rail
- GIVEN the clipboard API is unavailable, WHEN I tap copy-link, THEN a fallback method writes to clipboard

## Dependencies
- Slice 2 (OG Tags) should ship first so copied links render previews

## Effort estimate
~4 hours

## Reference class
Simple UI button + clipboard API — similar to any "copy to clipboard" feature in civic/feedback apps.
