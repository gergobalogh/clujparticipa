# ClujParticipa - Project Board

## Legend

- [ ] Not started
- [~] In progress
- [x] Done

---

## Phase 1 - Foundation

- [x] Clean project README
- [x] Concept note (`CONCEPT.md`)
- [x] Project board (`PROJECT_BOARD.md`)
- [x] Implementation plan (`IMPLEMENTATION_PLAN.md`)
- [x] Scaffold Next.js app (App Router, TypeScript, Tailwind)
  - DoD: `npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"` completes without error; `npm run dev` serves the default page on `localhost:3000`
- [x] Install dependencies (Prisma, next-intl, react-leaflet, validation/rate-limit helpers)
  - DoD: `npm install prisma @prisma/client next-intl react-leaflet leaflet zod @types/leaflet` succeeds; packages appear in `package.json`; no peer dependency errors
- [x] Set up directory structure
  - DoD: `src/app/[locale]/`, `src/components/{ui,layout,ideas,map,admin}/`, `src/lib/`, `src/i18n/messages/` all exist; three empty locale files (`ro.json`, `hu.json`, `en.json`) are present with `{}` placeholder; `npm run build` does not fail due to missing directories

## Phase 2 - Data Layer

- [x] Write Prisma schema (Idea, Vote, Comment, StatusChange, ModerationEvent + enums)
  - DoD: `npx prisma validate` passes; schema contains all five models and all enums from the implementation plan; `StatusChange.changedBy` is a non-nullable String; no raw `String` used where an enum applies
- [x] Run initial migration
  - DoD: `npx prisma migrate dev --name init` succeeds against a local PostgreSQL database; migration file appears in `prisma/migrations/`
- [x] Write seed script (~20 demo ideas across all statuses and categories — must show SUBMITTED, UNDER_REVIEW, IN_PROGRESS, COMPLETED, and REJECTED states; spread across at least 3 districts; include sample comments and votes so the detail page is not empty)
  - DoD: `npx prisma db seed` runs without error; database contains ≥20 ideas, ≥3 distinct districts, ≥5 distinct statuses, ≥10 comments, ≥30 votes; all participant identifiers are stored as hashes, not raw tokens
- [x] Seed the database
  - DoD: seed command exits 0; querying `SELECT COUNT(*) FROM "Idea"` returns ≥20

## Phase 3 - i18n

- [x] Configure next-intl (RO/HU/EN, Romanian default)
- [x] Create translation files (`ro.json`, `hu.json`, `en.json`)
- [x] Language switcher component

## Phase 4 - Layout & UI

- [x] Write design plan (`DESIGN_PLAN.md`)
  - DoD: Design doc exists; it states the "simple municipal service" direction; it defines visual system, layout rules, page patterns, copy rules, and accessibility baseline
- [x] App shell with header/footer
  - DoD: Shared layout renders brand, primary nav, language switcher, footer prototype note, privacy link, and non-binding support note on all locale pages; active nav state is visible; `npm run build` passes
- [x] Shared UI primitives
  - DoD: `src/components/ui/` contains Button, Badge, Input, Textarea, Select, and Card/ListRow components; components use small radius, visible borders/focus states, restrained civic colors, and accept standard React props; `npm run type-check` passes
- [x] Page layout patterns
  - DoD: Homepage, ideas list placeholder, idea detail placeholder, new idea placeholder, map placeholder, and admin placeholder all use the shared shell/container and translated page header pattern; no startup-style hero, gradients, decorative blobs, or nested cards are present
- [x] Privacy note page/section
  - DoD: `src/app/[locale]/privacy/page.tsx` exists; footer links to it; page explains prototype data use, non-binding support votes, anonymous participant token hashing, moderation, and future identity verification caveat in all three locales
- [x] Mobile-first responsive baseline
  - DoD: Header/nav wraps cleanly at narrow widths; controls and buttons do not overflow at 320px width; list rows stack on mobile; `npm run lint`, `npm run type-check`, and `npm run build` pass

## Phase 5 - Public API

- [x] `GET/POST /api/ideas` - list with filters / create
- [x] `GET /api/ideas/[id]` - detail
- [x] `POST /api/ideas/[id]/vote` - support vote with duplicate check
- [x] `GET/POST /api/ideas/[id]/comments` - list visible comments / create
  - DoD: Supports one-level threaded replies through `parentId`; replies must belong to the same idea; replies to replies are rejected; public responses include visible top-level comments with visible replies
- [x] Participant token hashing
- [x] Basic rate limits / abuse controls

## Phase 6 - Admin API

- [x] Minimal admin authentication
- [x] `PATCH /api/admin/ideas/[id]/status` - update status with note
- [x] `PATCH /api/admin/comments/[id]` - hide/restore comment
  - DoD: Admin can hide or restore both top-level comments and replies; hiding a top-level comment does not expose it publicly, and reply display behavior is explicitly handled
- [x] Public audit trail for status changes

## Phase 7 - Features

- [x] Idea submission form + map pin placement
- [x] Ideas list with filters (category, district, status) and sorting
- [x] Idea detail page (votes, one-level threaded comments, status timeline)
  - DoD: Users can post a top-level comment or reply to an existing top-level comment; replies render visually under their parent; the UI prevents replying to replies
- [x] Map view (Leaflet, markers, filters, popups)
- [x] Minimal admin page for status and moderation
- [x] Homepage (stats, recent ideas, CTAs)

## Phase 8 - Polish

- [x] Loading states and error handling
- [x] Responsive testing across devices
- [x] Label voting as non-binding prototype support
- [x] End-to-end verification

## Phase 9 - Optional Identity Login

- [x] Add OAuth login with Google and Facebook
  - DoD: Users can sign in and sign out with both providers in local/dev configuration; missing provider env vars produce a clear configuration error; auth routes do not expose provider secrets
- [x] Create a participant identity model separate from admin users
  - DoD: Database schema stores participant identities separately from admin authentication; votes/comments reference an internal participant identity or hash, not raw Google/Facebook IDs or access tokens
- [x] Connect voting to authenticated participant identity
  - DoD: Authenticated users can cast one support vote per idea across browsers/devices; duplicate votes by the same identity return a clear error; anonymous-token voting is either disabled or explicitly retained behind a feature flag
- [x] Update comments to use authenticated participant identity where available
  - DoD: New authenticated comments are linked to the participant identity; public comment responses never expose email, provider IDs, raw names, or tokens
- [x] Add login state to public UI
  - DoD: Header or voting/comment surfaces show signed-in/signed-out state; protected voting/comment actions prompt login without losing the user's current page context
- [x] Update privacy and integrity copy
  - DoD: Privacy page explains Google/Facebook login, what identity data is stored, what is hashed, how it is used for duplicate-vote prevention, and why voting remains non-binding without municipal eligibility verification; all copy exists in RO/HU/EN
- [x] Add auth-focused tests and verification
  - DoD: `npm run lint`, `npm run type-check`, and `npm run build` pass; duplicate-vote behavior is verified for authenticated identities; unauthenticated access paths are verified; provider secrets are not logged or serialized

## Phase 10 - Status Workflow

- [x] Server-side status transition validation
  - DoD: `PATCH /api/admin/ideas/[id]/status` enforces the valid transition table from `STATUS_WORKFLOW_DESIGN.md`; invalid transitions return HTTP 422 with a descriptive error message; valid transitions are defined in a single shared constant (e.g. `src/lib/transitions.ts`) importable by both API and UI; `REJECTED → UNDER_REVIEW` (reopen) is explicitly permitted; a `force: true` body flag allows skip-around overrides for admin use; `npm run lint`, `npm run type-check`, and `npm run build` pass

- [x] Admin quick-action buttons per status
  - DoD: Admin idea view replaces the raw status dropdown with contextual quick-action buttons matching the transition table (e.g. "Start review" → `UNDER_REVIEW`, "Mark eligible" → `ELIGIBLE`, "Reject" → `REJECTED`); each button triggers only its valid next status; an "Advanced" override dropdown remains for skip-around transitions; all button labels are translated strings present in RO/HU/EN locale files; buttons call the validated status API and surface 422 errors as user-visible messages; `npm run lint`, `npm run type-check`, and `npm run build` pass

- [x] Phase-aware vote/support button label
  - DoD: The vote/support button on the idea detail page renders "Back this idea" (translated) for `SUBMITTED`, `UNDER_REVIEW`, and `ELIGIBLE`; renders "Vote" (translated) for `IN_VOTING`; is hidden and non-interactive for `SELECTED`, `IN_PROGRESS`, `COMPLETED`, and `REJECTED`; both label strings exist in all three locale files (`ro.json`, `hu.json`, `en.json`); no data model or API changes required; `npm run type-check` passes

- [x] Rejected ideas sorted to bottom of list with public rejection note
  - DoD: Ideas list page renders `REJECTED` ideas after all non-rejected ideas regardless of active sort order; `REJECTED` ideas display a "Not eligible" badge translated in all three locales; the admin status-change UI prompts for a required public note when transitioning to `REJECTED`; the rejection note is displayed on the idea detail page and in the status timeline; the list page includes a "Show / hide rejected" filter toggle that defaults to visible; `npm run lint`, `npm run type-check`, and `npm run build` pass

---

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-05-12 | Greenfield Next.js, not fork CONSUL/Decidim | Faster to ship a focused MVP; heavy platforms slow prototyping |
| 2026-05-12 | PostgreSQL + Prisma first, defer PostGIS | Plain lat/lng is enough for the MVP; add spatial queries later if needed |
| 2026-05-12 | Leaflet + OpenStreetMap | Free, no API keys, open-source friendly |
| 2026-05-12 | Anonymous participant token for prototype voting | Lowest barrier to participation, but explicitly non-binding |
| 2026-05-12 | Separate admin API for status/moderation | Prevents public users from mutating official workflow state |
| 2026-05-12 | Romanian default locale, plus Hungarian and English | Reflects local audience and international visibility |
| 2026-05-12 | Vercel for prototype hosting | Zero-config Next.js deployment; sufficient for demo and partner review; revisit if city/NGO requires self-hosted infrastructure |
| 2026-05-12 | Add optional Google/Facebook login after MVP polish | Improves participant continuity and duplicate-vote controls, but remains non-binding without municipal eligibility verification |

## Open Questions

- Which district for the pilot? Manastur is suggested, but this needs validation with local actors.
- What is the real budget source for a pilot: City Hall, NGO/university grant, sponsor, or EU-funded partnership?
- What identity verification approach is acceptable for a future binding vote?
- Which Cluj neighborhood taxonomy should be used for budget/quota boundaries?
- Who moderates comments and feasibility notes during a public pilot?
