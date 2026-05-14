# Cloudflare Images — Migration Plan

Replace the local filesystem upload handler with Cloudflare Images. The existing
`POST /api/upload` becomes a proxy: it receives files from the browser, validates
them, extracts dimensions, then forwards to Cloudflare and returns the delivery URL.
No files ever touch the server disk.

---

## Context and API facts

**Upload endpoint (v1 — server-side):**
```
POST https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/images/v1
Authorization: Bearer {API_TOKEN}
Content-Type: multipart/form-data

fields:
  file         — the image binary (required when not using `url`)
  requireSignedURLs — boolean, optional (default false — keep public for this app)
  metadata     — JSON string, optional, key-value, max 1024 bytes
```

**Success response:**
```json
{
  "success": true,
  "result": {
    "id": "f508c1d3-45e8-4a3c-a912-example00000",
    "filename": "photo.jpg",
    "uploaded": "2026-05-14T10:00:00Z",
    "variants": [
      "https://imagedelivery.net/{account_hash}/{image_id}/public"
    ],
    "requireSignedURLs": false
  }
}
```

Key facts:
- **Size limit:** 10 MB per image (current app enforces 5 MB — keep it, stricter is fine)
- **Dimensions:** not in the upload response — we keep our existing header parser
- **Delivery URL:** `variants[0]` is the ready-to-use public URL; store this in `IdeaImage.url`
- **No account hash env var needed** — it is embedded in `variants[0]`, just store the full URL

---

## Task C1 — Add env vars and configure `next/image`

**`.env.example`** — add:
```
CLOUDFLARE_ACCOUNT_ID="your-account-id"
CLOUDFLARE_IMAGES_API_TOKEN="your-api-token-with-images-write-permission"
```

The account ID is found in the Cloudflare dashboard sidebar.
The API token needs the **Cloudflare Images: Edit** permission only — create a scoped token, not a global one.

**`next.config.ts`** — add a remote pattern so `next/image` can serve from Cloudflare's CDN:
```ts
const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "imagedelivery.net" },
    ],
  },
};
```

**DoD:** Both env vars are in `.env.example` with placeholder values and a comment explaining where to find them; `npm run build` passes without image pattern warnings; a hardcoded `<Image src="https://imagedelivery.net/..." />` renders without a console error in dev.

---

## Task C2 — Rewrite `POST /api/upload` to proxy to Cloudflare

File: `src/app/api/upload/route.ts`

**Remove:**
- `writeFile`, `mkdir`, `existsSync`, `path` imports
- The local upload directory logic (`uploadDir`, `mkdir`)
- Writing the buffer to disk

**Keep:**
- All auth + rate-limit checks (unchanged)
- MIME type validation (`isAllowedMimeType`)
- File size validation
- File count validation
- `getImageDimensions(buffer)` — Cloudflare does not return dimensions; we still need ours

**Replace the write-to-disk block with a Cloudflare upload:**
```ts
const cfForm = new FormData();
cfForm.append(
  "file",
  new Blob([buffer], { type: file.type }),
  `${randomUUID()}${mimeToExt(file.type)}`
);

const cfRes = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v1`,
  {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.CLOUDFLARE_IMAGES_API_TOKEN}` },
    body: cfForm,
  }
);

if (!cfRes.ok) {
  const err = await cfRes.json().catch(() => ({}));
  return NextResponse.json(
    { error: "Image upload failed", detail: err },
    { status: 502 }
  );
}

const cfData = await cfRes.json();
const url: string = cfData.result.variants[0]; // full delivery URL
```

Return `url` (the Cloudflare delivery URL) instead of the local path.

If `CLOUDFLARE_ACCOUNT_ID` or `CLOUDFLARE_IMAGES_API_TOKEN` are not set, return HTTP 503 with a clear error — do not silently fall back to filesystem.

**DoD:** Uploading a valid image returns a `url` starting with `https://imagedelivery.net/`; the file is visible in the Cloudflare Images dashboard; uploading with a missing env var returns 503; MIME/size/count violations still return 400; rate limiting still applies; no files are written to disk; `npm run type-check` passes.

---

## Task C3 — Update URL validation in the ideas API

File: `src/app/api/ideas/route.ts`

Currently, the Zod schema for image URLs validates:
```ts
url: z.string().startsWith(`/${IMAGE_UPLOAD_DIR}/`)
```

Replace with a Cloudflare delivery URL check:
```ts
url: z.string().startsWith("https://imagedelivery.net/")
```

Also update `src/lib/image-validation.ts`:
- Remove or deprecate `IMAGE_UPLOAD_DIR` (it is no longer used anywhere once Task C2 is done)
- Add and export `CLOUDFLARE_IMAGE_BASE = "https://imagedelivery.net/"` for use in the Zod check, so the pattern is defined in one place

**DoD:** `POST /api/ideas` with a Cloudflare delivery URL in the `images` array succeeds; a URL starting with `/uploads/` is rejected with 400; `IMAGE_UPLOAD_DIR` is no longer imported anywhere; `npm run type-check` passes.

---

## Task C4 — Update `next.config.ts` to remove local image patterns (if set)

If `localPatterns` for `/uploads/**` was added as part of `IMAGE_UPLOAD_PLAN.md` Task 1.2, remove it — local uploads no longer exist.

**DoD:** `next.config.ts` has `remotePatterns` for `imagedelivery.net` and no `localPatterns` for `/uploads`; `npm run build` passes.

---

## Task C5 — Clean up `public/uploads/` directory

The directory `public/uploads/ideas/` is no longer used. Remove it and add it to `.gitignore` to prevent accidental future use.

```
# in .gitignore
public/uploads/
```

If the directory has real uploaded images from development, they can be deleted — they will not be served by Cloudflare.

**DoD:** `public/uploads/` is either removed or empty; `.gitignore` has an entry for it; `npm run build` passes.

---

## Task C6 — Update seed data

The seed script in `prisma/seed.ts` may reference local `/uploads/` image paths (added as part of IMAGE_UPLOAD_PLAN.md Task 2.4). Replace them with real Cloudflare delivery URLs.

Upload a small set of placeholder images to your Cloudflare Images account (via the dashboard — no code needed) and use the resulting `imagedelivery.net` URLs in the seed file.

**DoD:** `npx prisma db seed` exits 0; seeded ideas with images show thumbnails and carousels using Cloudflare-served images; no `localhost` or `/uploads/` URLs exist in seed data.

---

## Task C7 — End-to-end smoke test

1. Start dev server with valid `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_IMAGES_API_TOKEN` in `.env.local`
2. Submit a new idea with 3 images (JPEG, PNG, WebP)
3. Confirm each uploaded image URL starts with `https://imagedelivery.net/`
4. Confirm images are visible in the Cloudflare Images dashboard under your account
5. Confirm images render in the idea detail carousel
6. Confirm the first image renders as a thumbnail on the ideas list card
7. Confirm submitting without images still works
8. Confirm a 6th image is rejected client-side before any upload is attempted

**DoD:** All eight checks pass; no files exist under `public/uploads/`; `npm run build` passes.

---

## Task checklist

| # | Task | Status |
|---|------|--------|
| C1 | Env vars + `next/image` remote pattern | [ ] |
| C2 | Rewrite upload handler to proxy to Cloudflare | [ ] |
| C3 | Update URL validation in ideas API + `image-validation.ts` | [ ] |
| C4 | Remove local image patterns from `next.config.ts` | [ ] |
| C5 | Remove `public/uploads/` + update `.gitignore` | [ ] |
| C6 | Update seed data with Cloudflare URLs | [ ] |
| C7 | End-to-end smoke test | [ ] |

---

## What does NOT change

- `ImageUpload` component — no changes; it still posts to `POST /api/upload`
- `IdeaCarousel`, `IdeaCard` — no changes; they render whatever URL is in `IdeaImage.url`
- `IdeaImage` schema — no changes; `url` is already a plain `String`
- Rate limiting, MIME validation, file count limits — all unchanged
- The dimension parser — kept as-is; dimensions are extracted from the buffer before forwarding to Cloudflare
