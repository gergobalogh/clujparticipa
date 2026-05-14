# Image Experience Plan

## Product Decisions

- **Max images per idea**: 5
- **Max file size**: 5 MB per image
- **Allowed MIME types**: `image/jpeg`, `image/png`, `image/webp`
- **Alt text**: Auto-generated from idea title for MVP (no user-entered alt text field)
- **Landing hero image**: Curated static asset under `public/images/hero-*.webp` (city/civic photo)
- **Image upload is optional**: Ideas can be created without any images

These decisions are reflected in `src/lib/image-validation.ts`.

## Review Summary

The original plan is a solid start for idea-level image attachments, but it is too narrow in three areas:

- It treats images mostly as an idea detail carousel feature, while the current landing page and `/ideas` list are the places where images can most improve scanning and engagement.
- It proposes `/uploads` as a static path, but this Next app serves static files from `public/`. For a local-disk MVP, uploads should either be written under `public/uploads/...` or served through a route handler.
- It does not yet cover upload validation, image moderation visibility, responsive image dimensions, or the card/list redesign needed once thumbnails exist.

Recommendation: implement images as an idea media feature first, then surface the first image in the landing and ideas list. Keep map popups text-only for the MVP.

## Pages That Should Use Images

| Page | Decision | Why |
|---|---|---|
| Landing page `/[locale]` | Add a civic visual hero image and show thumbnails for recent ideas when available | The first screen is currently all text and stats. A restrained, real-world visual makes the product feel grounded, while recent idea thumbnails add useful context. |
| Ideas list `/[locale]/ideas` | Redesign from rows into feed cards with optional thumbnails | This is the highest-value change. A Reddit-like feed card pattern makes each idea easier to scan, compare, and open. |
| Idea detail `/[locale]/ideas/[id]` | Add a full carousel above the map, after title/meta/description or between meta and description | Detail is where all uploaded images should be available. Carousel belongs here, not in every compact surface. |
| New idea `/[locale]/ideas/new` | Add multi-image upload with previews before submit | Citizens need to attach photos while creating the idea, ideally before selecting the map if the photo explains the location/problem. |
| Map `/[locale]/map` | No images for MVP | Leaflet popups are small; thumbnails can make them cramped and slower. Keep popups fast and link to detail. |
| Admin `/[locale]/admin` | Add image count/thumbnail preview for ideas; defer full image moderation actions unless needed | Admins need awareness that an idea contains images before status review. A lightweight preview is enough for MVP. |

## UX Direction

### Landing Page

- Add one curated/static image block near the hero, not a decorative gradient or generic illustration.
- Keep the current CTA and stats structure, but use a two-column desktop layout where the image supports the title and CTAs.
- Update the "Recent ideas" list so items can show a small fixed-aspect thumbnail when an idea has images.
- Do not create a marketing-style landing page; keep the current civic product surface.

### Ideas Page

- Replace the divided text list with responsive feed cards.
- Each card should contain:
  - fixed-aspect thumbnail area on top or left, using the first image if present;
  - title, status badge, category, district, support count, comment count;
  - two-line description clamp;
  - clear full-card click target.
- If an idea has no image, use a quiet category-colored placeholder or omit the media area consistently. Avoid fake stock imagery.
- Preserve the existing filters, sort, pagination, empty states, and loading states.

### Idea Detail Page

- Render all images in order as a carousel.
- Use stable dimensions to prevent layout shift.
- Provide keyboard-accessible previous/next controls, dots or thumbnails, and meaningful alt text.
- If no images exist, render no image block.

### New Idea Page

- Allow multiple image selection with drag-and-drop and normal file picker.
- Show client-side previews, remove/reorder controls, file-size errors, and upload progress or submit-disabled state.
- Limit the MVP to a small number of images per idea, for example 5.
- Upload only after base form validation passes.

## Storage

MVP recommendation:

- Use local disk only for the prototype.
- Store files under `public/uploads/ideas/` so URLs like `/uploads/ideas/<filename>.jpg` are public in this Next app.
- Generate collision-resistant filenames; never trust the original filename for the stored path.
- Save image metadata in the database, not only the URL.

Production note:

- Local disk is not enough for multi-instance or ephemeral deployments. If this moves beyond prototype hosting, replace this with object storage plus CDN.

## Data Model

Separate `IdeaImage` model in Prisma:

```prisma
model IdeaImage {
  id        String   @id @default(cuid())
  url       String
  alt       String?
  width     Int?
  height    Int?
  mimeType  String
  sizeBytes Int
  order     Int
  ideaId    String
  idea      Idea     @relation(fields: [ideaId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@index([ideaId, order])
}
```

Add the reverse relation to `Idea`:

```prisma
model Idea {
  // ...existing fields...
  images IdeaImage[]
}
```

Why a separate model over a JSON array: explicit ordering, easy delete/reorder later, queryable counts, and safer API shaping.

## Upload Flow

1. The "New Idea" form validates title, description, category, district, and location.
2. Images are validated client-side for count, type, and approximate size.
3. On submit, the client uploads images to `POST /api/upload` using `multipart/form-data`.
4. The upload route validates MIME type, size, count, and filename safety, then writes files to `public/uploads/ideas/`.
5. The upload route returns image records: `{ url, width, height, mimeType, sizeBytes, order }`.
6. The idea creation request includes the returned images along with the idea fields.
7. `POST /api/ideas` creates the idea and nested `IdeaImage` rows in one Prisma write.

Alternative for stricter consistency: create the idea first, then upload to `POST /api/ideas/[id]/images`. That avoids orphaned uploads but needs cleanup if upload fails. For the MVP, uploading first is simpler if we add a cleanup task later.

## Components

- `src/components/ideas/idea-card.tsx`
  - Used by `/ideas` and landing recent ideas.
  - Supports compact and default variants.
- `src/components/ideas/idea-carousel.tsx`
  - Used by idea detail.
  - Prefer `embla-carousel-react` for accessible carousel behavior.
- `src/components/ideas/image-upload.tsx`
  - Used by new idea form.
  - Handles previews, ordering, removal, validation messages.

Use `next/image` for rendered images where practical. For dynamic local URLs, provide stable `width`/`height` or use a fixed parent with `fill` to avoid layout shift.

## API Changes

- `GET /api/ideas`
  - Include only enough image data for cards: first image and image count.
  - Avoid returning every image for list/map views.
- `GET /api/ideas/[id]`
  - Include all images ordered by `order`.
- `POST /api/ideas`
  - Accept an `images` array and create nested image rows.
  - Validate image URLs returned by the upload route only.
- `POST /api/upload`
  - New route handler for multipart uploads.
  - Validate type, size, count, path, and participant rate limit.

## Tasks And Definitions Of Done

### 1. Finalize Product Rules For Images

Tasks:

- Decide max images per idea, max file size, allowed MIME types, and whether image upload is optional.
- Decide whether alt text is user-entered now or generated from idea title/category for MVP.
- Decide landing hero image source: curated static asset, generated civic photo-style asset, or existing municipal/city imagery with rights confirmed.

DOD:

- `IMAGE_CAROUSEL_PLAN.md` documents max count, max size, allowed formats, and landing image source.
- The decisions are reflected in validation constants used by upload UI and API.

### 2. Add Database Support

Tasks:

- Add `IdeaImage` to `prisma/schema.prisma`.
- Add `images` relation to `Idea`.
- Create and apply a Prisma migration.
- Regenerate Prisma client.

DOD:

- `npm run db:validate` passes.
- Migration applies cleanly on a fresh database.
- Existing ideas without images still load in list, detail, map, and admin pages.

### 3. Build Secure Upload Endpoint

Tasks:

- Create `src/app/api/upload/route.ts`.
- Accept `multipart/form-data`.
- Enforce max count, max bytes per file, total request size, allowed MIME types, and safe generated filenames.
- Store files under `public/uploads/ideas/`.
- Return normalized image metadata.
- Add basic rate limiting using the existing participant token pattern where possible.

DOD:

- Valid image uploads return public URLs and metadata.
- Invalid types, oversized files, too many files, missing token, and malformed multipart requests return clear non-2xx responses.
- Uploaded filenames cannot contain user-controlled path segments.
- `npm run type-check` and `npm run lint` pass.

### 4. Extend Idea APIs

Tasks:

- Update `POST /api/ideas` schema to accept uploaded image metadata.
- Create idea and images in one Prisma operation.
- Update `GET /api/ideas` to return first image plus image count.
- Update `GET /api/ideas/[id]` to return ordered images.
- Keep map consumers lightweight by mapping only the fields they need.

DOD:

- Creating an idea with no images still works.
- Creating an idea with valid image metadata stores ordered image rows.
- List API returns card-safe image data without bloating map/list responses.
- Detail API returns all images ordered by `order`.
- Existing client pages do not crash when `images` is absent or empty.

### 5. Add Image Upload UI To New Idea Form

Tasks:

- Build `src/components/ideas/image-upload.tsx`.
- Add it to `src/app/[locale]/ideas/new/page.tsx`.
- Show previews, remove controls, reorder controls if included in MVP, validation errors, and submit-disabled state during upload.
- Submit images before creating the idea, then include returned metadata in the idea payload.
- Add translations in `en`, `ro`, and `hu`.

DOD:

- User can create an idea with 0 images.
- User can create an idea with multiple valid images and see previews before submit.
- Invalid file type/count/size is blocked before submit and again by the API.
- Successful submit opens the created idea detail page with images visible.
- Keyboard navigation and labels work for upload controls.

### 6. Build Idea Carousel

Tasks:

- Install `embla-carousel-react`.
- Build `src/components/ideas/idea-carousel.tsx`.
- Render it on `src/app/[locale]/ideas/[id]/page.tsx`.
- Add previous/next controls, dots or thumbnails, alt text, and stable aspect ratio.

DOD:

- Detail page renders no image area when there are no images.
- Detail page renders all images in saved order when images exist.
- Carousel is usable by keyboard and screen readers have meaningful labels.
- No layout shift occurs while images load.
- Mobile and desktop layouts remain readable around the map, vote box, status timeline, and comments.

### 7. Redesign Ideas List As Feed Cards

Tasks:

- Build `src/components/ideas/idea-card.tsx`.
- Replace the divided list in `src/app/[locale]/ideas/page.tsx` with responsive cards.
- Include first image thumbnail, title, status, category, district, support/comment counts, and description.
- Preserve filters, sorting, loading, load more, empty state, and error state.

DOD:

- `/ideas` shows cards on mobile and desktop with no text overlap.
- Cards with and without images have consistent spacing and stable dimensions.
- Filters, sorting, pagination, and links behave exactly as before.
- First image thumbnails are cropped predictably and do not stretch.

### 8. Add Images To Landing Page Carefully

Tasks:

- Add a first-viewport civic image treatment to `src/app/[locale]/page.tsx`.
- Update recent ideas to reuse the compact `IdeaCard` variant with thumbnails.
- Update `/api/stats` if needed so recent ideas include first image data.

DOD:

- Landing first viewport shows the product name/value, CTAs, and a real visual signal without hiding the next section.
- Recent ideas display thumbnails when present and remain clean when absent.
- Stats loading/error states still work.
- Mobile layout does not crop important text or image content awkwardly.

### 9. Add Admin Image Awareness

Tasks:

- Add image count and a small first-image thumbnail to the admin ideas table/list.
- Link admins to the public detail page or provide a preview modal if needed.
- Defer image hide/delete moderation unless the prototype requires it.

DOD:

- Admin can tell which submitted ideas include images.
- Admin view remains usable on narrow screens.
- Status changes and comment moderation continue to work.

### 10. Keep Map Popups Lightweight

Tasks:

- Do not add images to map popups for MVP.
- Ensure API changes do not force map page to download full image arrays.

DOD:

- `/map` behavior and visual density are unchanged except for any necessary type updates.
- Map API payload remains small for `limit=100`.

### 11. Verification Pass

Tasks:

- Run type checking, linting, Prisma validation, and production build.
- Manually test: landing, ideas list, idea creation with/without images, idea detail carousel, map, and admin.
- Test at mobile and desktop widths.

DOD:

- `npm run db:validate` passes.
- `npm run type-check` passes.
- `npm run lint` passes.
- `npm run build` passes.
- Manual test notes cover image upload success, image upload validation failures, no-image fallback, card layout, carousel controls, and map/admin regressions.
