# Slice 03 — WhatsApp + Facebook Share Buttons

**Goal**: One-tap share to WhatsApp (Web intent) and Facebook (sharer.php) with pre-filled text and UTM tracking.

## IN scope
- WhatsApp icon button — opens `https://wa.me/?text={encodedShareText + URL with utm_source=whatsapp}`
- Facebook icon button — opens `https://www.facebook.com/sharer/sharer.php?u={encoded URL with utm_source=facebook}`
- Pre-filled share text template (i18n): "{title} — {category}, {district}. {ctaText} {url}"
- CTA text in RO/HU/EN: "Susține această idee!" / "Támogasd ezt az ötletet!" / "Support this idea!"
- Share button row (WhatsApp, Facebook, copy-link) — replaces copy-link-only UI from Slice 1
- Fallback: if WhatsApp intent URL fails (app not installed), copy link to clipboard
- Umami events: `trackEvent("idea_share", { channel: "whatsapp"|"facebook", ideaId })`
- Accessible labels for all share buttons (i18n)

## OUT scope
- Twitter/X share
- Telegram share
- Email share
- Native Web Share API (can be added later as enhancement)
- OG image generation

## Learning hypothesis
If WhatsApp share clicks outnumber Facebook 5:1 (expected for Romanian civic groups), it validates WhatsApp as the primary sharing channel. If Facebook matches or exceeds, the audience may be different than assumed.

## Acceptance criteria
- GIVEN I am on an idea detail page, WHEN I tap the WhatsApp button, THEN a new tab opens the WhatsApp Web compose URL with pre-filled text containing the idea title, category, district, CTA, and URL with utm_source=whatsapp
- GIVEN I am on an idea detail page, WHEN I tap the Facebook button, THEN a new tab opens the Facebook sharer dialog with the idea URL containing utm_source=facebook
- GIVEN WhatsApp is not installed and the intent URL fails, WHEN I tap WhatsApp, THEN the link is copied to clipboard as fallback with a toast "Link copied"
- GIVEN I am on a mobile viewport, WHEN I view the share row, THEN all three buttons (WhatsApp, Facebook, copy) are visible and tappable with adequate hit targets (44x44px minimum)
- GIVEN I view the share row on desktop, WHEN I hover over a share button, THEN a tooltip shows the translated label (e.g., "Share on WhatsApp")
- GIVEN the locale is Romanian, WHEN the share text is generated, THEN the CTA is "Susține această idee!" and category/district labels are in Romanian

## Dependencies
- Slice 1 (Copy Link) — share row UI pattern established
- Slice 2 (OG Tags) — shared links must render previews for the feature to be valuable

## Effort estimate
~4 hours

## Reference class
Social share intent URLs — standard pattern in civic and content apps. WhatsApp Web intent + Facebook sharer.php are well-documented APIs.
