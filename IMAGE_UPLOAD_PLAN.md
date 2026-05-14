# Image Upload — Feature Plan

## Current state

The core scaffolding landed in the initial MVP commit and covers:

- `IdeaImage` Prisma model (url, alt, width, height, mimeType, sizeBytes, order)
- `POST /api/upload` — multipart handler, writes files to `public/uploads/ideas/`
- `POST /api/ideas` — accepts image metadata, validates URL prefix + MIME, persists `IdeaImage` rows
- `GET /api/ideas` list — returns `firstImage` per idea
- `GET /api/ideas/[id]` — returns full `images` array ordered by `order`
- `ImageUpload` component — drag-drop dropzone, file picker, client validation, blob previews, remove button
- `IdeaCarousel` (Embla) — loop carousel with prev/next controls and dot indicators
- `IdeaCard` — renders `firstImage` thumbnail or a category-color fallback
- i18n strings for `ImageUpload` in RO/HU/EN

What follows are the remaining tasks, grouped by priority.

---

## Priority 1 — Must do before any real use

### Task 1.1 — Install `sharp` for Next.js image optimization

`sharp` is required by `next/image` when running `output: "standalone"` (Docker). Without it, the optimizer falls back to a slower path and emits a build warning.

**Steps:**
- Run `npm install sharp`
- Run `npm run build` and confirm no `sharp` warnings

**DoD:** `sharp` is in `package.json` `dependencies`; `npm run build` succeeds without an image-optimization warning; `npm run type-check` and `npm run lint` pass.

---

### Task 1.2 — Configure `next.config.ts` for local image serving

`next/image` requires explicit `localPatterns` config (Next.js 15+) to serve images from paths under `public/`. Without it, images in `public/uploads/` may generate runtime warnings or be blocked.

**Steps:**
- Add to `nextConfig` in `next.config.ts`:
  ```ts
  images: {
    localPatterns: [{ pathname: '/uploads/**' }],
  }
  ```

**DoD:** `npm run build` produces no image-pattern warnings; a locally uploaded image renders in `<Image>` on both the list and detail page without console errors.

---

### Task 1.3 — End-to-end smoke test

Verify the full flow works in development before declaring the feature ready.

**Steps:**
1. Start dev server (`npm run dev`)
2. Create a new idea with 3 images (JPEG, PNG, WebP — one of each)
3. Confirm images render in the carousel on the detail page
4. Confirm the first image appears as a thumbnail on the ideas list card
5. Confirm that submitting without images still works (images are optional)
6. Confirm that attempting to upload 6 images shows the "max 5" error

**DoD:** All six checks above pass; no JS console errors; `npm run build` passes.

---

### Task 1.4 — Document the file storage limitation

The current upload handler writes files to the local filesystem (`public/uploads/ideas/`). This works for Docker with a persistent mounted volume, but **not** for Vercel or any ephemeral serverless host — files are lost on each cold start.

**Steps:**
- Add a decision entry to `PROJECT_BOARD.md` Decisions Log:
  - Record the chosen strategy: **self-hosted Docker with a bind-mounted volume** (if that's the path), or flag the need for cloud object storage (Vercel Blob / Cloudflare R2 / AWS S3).
- If going self-hosted: add `UPLOAD_DIR` (default `public/uploads/ideas`) to `.env.example` and update the upload handler to read it from env.
- If going cloud: create a separate storage-adapter task (see Task 2.3).

**DoD:** The storage decision is recorded in `PROJECT_BOARD.md`; `.env.example` is updated if applicable; the choice is unambiguous for any future developer picking up the project.

---

## Priority 2 — Quality and correctness

### Task 2.1 — Fix WebP dimension extraction (VP8L and VP8X)

`getImageDimensions` in `src/app/api/upload/route.ts` only parses VP8 (lossy WebP). Lossless WebP (VP8L) and extended WebP (VP8X, which includes images with alpha channels) fall through to `{ width: null, height: null }`.

Dimensions are not required for rendering (all display uses `fill`), but storing `null` in the DB is misleading and may cause issues if the field is ever used for layout calculations.

**Steps:**
- In `getImageDimensions`, after the VP8 branch, add:
  - **VP8L**: chunk type `"VP8L"` at offset 12; width is bits 0–13 of the 32-bit LE word at offset 21 (plus 1), height is bits 14–27 (plus 1).
  - **VP8X**: chunk type `"VP8X"` at offset 12; canvas width is (24-bit LE at offset 24) + 1, canvas height is (24-bit LE at offset 27) + 1.

**DoD:** A lossless WebP and an alpha-channel WebP uploaded via `/api/upload` return correct `width` and `height` values; PNG and JPEG dimensions are unchanged; `npm run type-check` passes.

---

### Task 2.2 — Add server-side file-content (magic byte) validation

`POST /api/upload` trusts `file.type` — the browser-reported MIME. A crafted request could send a non-image file with a spoofed `Content-Type`. The dimension parser incidentally validates headers for PNG/JPEG/WebP but silently falls through for other byte sequences.

**Steps:**
- In `src/app/api/upload/route.ts`, after reading the buffer, validate the first bytes match the declared MIME type:
  - `image/jpeg` → first two bytes `0xFF 0xD8`
  - `image/png` → first four bytes `0x89 0x50 0x4E 0x47`
  - `image/webp` → bytes 0–3 are `RIFF` and bytes 8–11 are `WEBP`
- Return HTTP 400 if the bytes do not match the declared MIME.
- Delete any files already written in the same request before returning the error response.

**DoD:** A request with `Content-Type: image/jpeg` and a non-JPEG body is rejected with HTTP 400 and no file is written to disk; valid images are accepted; `npm run type-check` passes.

---

### Task 2.3 — Internationalise carousel navigation labels

`src/components/ideas/idea-carousel.tsx` has three hardcoded English strings: `"Previous image"`, `"Next image"`, and `"Go to image ${i + 1}"`. These are `aria-label` attributes — they matter for screen readers.

**Steps:**
- Add keys to all three locale files (`ro.json`, `hu.json`, `en.json`) under a new `"IdeaCarousel"` namespace:
  - `"prev"`, `"next"`, `"goToImage"` (with `{index}` interpolation for the dot buttons)
- Replace the hardcoded strings in `idea-carousel.tsx` with `useTranslations("IdeaCarousel")` calls.

**DoD:** All three locale files contain the `IdeaCarousel` namespace; the carousel renders with translated `aria-label` values in all three locales; `npm run type-check` and `npm run lint` pass.

---

### Task 2.4 — Add images to seed data

The seed script creates ~20 demo ideas but attaches no `IdeaImage` records. The image display code paths (carousel, card thumbnail) have never been exercised with seeded data.

**Steps:**
- In `prisma/seed.ts`, attach 1–3 `IdeaImage` records to 5–8 seeded ideas, using placeholder image paths that exist in `public/` (e.g. a small generic placeholder committed under `public/seed/`).
- Add `alt`, `width`, `height`, `mimeType`, `sizeBytes`, `order` for each record.
- Re-run `npx prisma db seed` to verify.

**DoD:** After seeding, at least 5 ideas have `IdeaImage` records; the ideas list shows thumbnails for those ideas; the detail page renders the carousel; `npx prisma db seed` exits 0.

---

## Priority 3 — Nice-to-have for a polished MVP

### Task 3.1 — Orphaned file cleanup

Files uploaded to `/api/upload` but never attached to an idea (user abandons the form, or idea creation fails after upload) remain on disk indefinitely.

**Options (choose one):**

A. **Accept for MVP** — document the limitation in `PROJECT_BOARD.md` and add a comment in the upload handler; plan a cleanup job for later.

B. **Soft cleanup on create failure** — if `POST /api/ideas` fails after a successful upload, issue a best-effort `DELETE` request or call a server action to remove the orphaned files. Requires the upload response to carry enough info for the client to issue a cleanup.

C. **Scheduled orphan sweep** — a cron-triggered script that deletes any file in `public/uploads/ideas/` not referenced by an `IdeaImage` row, with a minimum age of 24 hours.

**DoD (for any option):** The chosen approach is documented; no uncovered code path silently accumulates orphaned files without the team knowing.

---

### Task 3.2 — Image drag-to-reorder in the upload UI

The `IdeaImage` model has an `order` column and the create API persists it, but the `ImageUpload` component renders previews in fixed selection order with no reordering support.

**Steps:**
- Add drag-and-drop reordering to the preview grid in `src/components/ideas/image-upload.tsx`.
- Update the `order` value of each `PreviewFile` before uploading.
- Use the HTML5 drag API (no extra dependency) or `@dnd-kit/sortable` if already available.

**DoD:** A user can drag thumbnails to reorder them before submitting; the resulting `IdeaImage.order` values in the DB reflect the UI order; the carousel on the detail page shows images in the submitted order; `npm run type-check` passes.

---

### Task 3.3 — Admin idea view shows uploaded images

The admin idea detail page (`src/app/[locale]/admin/`) currently has no image display. Admins reviewing a submission cannot see attached photos, which matters for moderation.

**Steps:**
- In the admin idea detail view, fetch and render `images` from the idea detail API.
- A simple horizontal strip of thumbnails (using `next/image`) is sufficient — no carousel needed.

**DoD:** An admin viewing an idea with images sees all uploaded photos before taking any status action; ideas without images show nothing; `npm run type-check` passes.

---

## Task checklist summary

| # | Task | Priority | Status |
|---|------|----------|--------|
| 1.1 | Install `sharp` | P1 | [x] |
| 1.2 | Configure `next.config.ts` image patterns | P1 | [x] |
| 1.3 | End-to-end smoke test | P1 | [x] |
| 1.4 | Document file storage decision | P1 | [x] |
| 2.1 | Fix WebP VP8L/VP8X dimension extraction | P2 | [x] |
| 2.2 | Server-side magic-byte validation | P2 | [x] |
| 2.3 | i18n carousel navigation labels | P2 | [x] |
| 2.4 | Add images to seed data | P2 | [x] |
| 3.1 | Orphaned file cleanup strategy | P3 | [x] |
| 3.2 | Drag-to-reorder in upload UI | P3 | [x] |
| 3.3 | Admin view shows images | P3 | [x] |
