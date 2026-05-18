# User Stories — social-sharing

## US-01: Copy Idea Link
**As a** resident who supports an idea,
**I want to** copy the idea URL to my clipboard with one tap,
**So I can** paste it in WhatsApp, email, or any channel to rally support.

**job_id**: JOB-006

### Elevator Pitch
Before: I must manually select the browser URL bar, copy the URL, and switch apps — 30+ seconds of friction that usually kills the impulse to share.
After: tap the copy-link button on the idea detail page → sees "Link copied" toast → URL with `utm_source=copy` is in clipboard.
Decision enabled: I can share the idea in any channel I choose (WhatsApp, email, SMS) without friction, increasing the likelihood I actually share it.

### Acceptance Criteria
- AC1: Copy-link button renders on idea detail page (desktop: action rail; mobile: below vote section)
- AC2: Tapping the button writes the idea URL with `?utm_source=copy` to the clipboard via `navigator.clipboard.writeText`
- AC3: A toast notification with the translated "Link copied" message appears and auto-dismisses after 3 seconds
- AC4: If clipboard API is unavailable, a fallback textarea method copies the URL
- AC5: `trackEvent("idea_share", { channel: "copy", ideaId })` fires on tap
- AC6: Button label and toast text exist in all three locales (RO/HU/EN)

---

## US-02: OG Meta Tags for Idea Detail Pages
**As a** resident who shares an idea link,
**I want the** link to render a rich preview card (title, image, description) in WhatsApp and Facebook,
**So my** contacts can see at a glance what the idea is about and are more likely to click.

**job_id**: JOB-007

### Elevator Pitch
Before: when I paste a ClujParticipa idea link in WhatsApp, the recipient sees a bare URL or generic site preview — no idea title, no image, no context. Most people ignore it.
After: paste the idea URL in WhatsApp → sees a preview card with the idea title, first image, category, district, and support count → recipient can evaluate the idea before clicking.
Decision enabled: the recipient decides whether the idea is relevant to them before clicking — they don't waste time on irrelevant links, and they don't ignore the link as spam.

### Acceptance Criteria
- AC1: Idea detail page emits `og:title` = idea title
- AC2: Idea detail page emits `og:description` = description truncated to 160 chars + " — {category}, {district}" (translated)
- AC3: Idea detail page emits `og:image` = first uploaded image URL (absolute, with `NEXT_PUBLIC_APP_URL` origin) when idea has images
- AC4: Idea detail page emits `og:url` = canonical idea URL with locale
- AC5: Idea detail page emits `og:type` = "website" and `og:site_name` = "ClujParticipa"
- AC6: For ideas without images, `og:image` is omitted (placeholder handled by US-04)

---

## US-03: WhatsApp and Facebook Share Buttons
**As a** resident who supports an idea,
**I want to** share it directly to WhatsApp or Facebook with one tap,
**So I can** reach my entire network in seconds instead of manually copy-pasting.

**job_id**: JOB-006

### Elevator Pitch
Before: I must copy the link, open WhatsApp, find the right group, paste, and write context — most of the time I don't bother.
After: tap the WhatsApp share button on the idea detail page → WhatsApp Web opens with a pre-filled message containing the idea title, category, district, CTA, and link → I just hit send.
Decision enabled: I can share an idea in 3 seconds instead of 30, making it likely I'll share it at all.

### Acceptance Criteria
- AC1: WhatsApp icon button renders in the share row on idea detail page (desktop + mobile)
- AC2: Tapping WhatsApp opens `https://wa.me/?text={encodedShareText}` in a new tab
- AC3: Share text template (i18n): "{title} — {category}, {district}. {ctaText} {url}"
- AC4: CTA text in RO: "Susține această idee!", HU: "Támogasd ezt az ötletet!", EN: "Support this idea!"
- AC5: URL in share text includes `?utm_source=whatsapp`
- AC6: Facebook icon button renders in the share row
- AC7: Tapping Facebook opens `https://www.facebook.com/sharer/sharer.php?u={encodedUrl}` with `utm_source=facebook`
- AC8: If WhatsApp intent URL fails (app not installed), fallback to copy-link behavior (clipboard + toast)
- AC9: `trackEvent("idea_share", { channel: "whatsapp"|"facebook", ideaId })` fires on tap
- AC10: All share buttons have accessible labels (aria-label) in the current locale
- AC11: Button hit targets are at least 44x44px on mobile

---

## US-04: Dynamic OG Placeholder Image
**As a** resident who shares an idea that has no uploaded photos,
**I want the** shared link to still render a visually distinct preview card,
**So the** link doesn't look broken and recipients still click.

**job_id**: JOB-007

### Elevator Pitch
Before: ideas without photos have no og:image, so shared links show a blank/generic preview — they look broken and get ignored.
After: share an idea URL that has no photos → WhatsApp renders a preview card with a category-colored placeholder image showing the idea title → recipient sees a professional-looking card, not a broken link.
Decision enabled: every shared idea looks compelling, whether or not it has photos — no idea is disadvantaged in sharing because it lacks an image.

### Acceptance Criteria
- AC1: API route `/api/og/ideas/[id]` returns a 1200x630 PNG image via Next.js `ImageResponse`
- AC2: Image background color matches the idea's category color (from `src/lib/category-colors.ts`)
- AC3: Idea title is rendered in white text, centered, max 2 lines, truncated with ellipsis if > 80 chars
- AC4: Category label is rendered (translated) in the image
- AC5: For ideas without uploaded images, `generateMetadata` sets `og:image` to the placeholder route URL (absolute)
- AC6: For ideas WITH uploaded images, `og:image` still points to the uploaded image (placeholder not used)
