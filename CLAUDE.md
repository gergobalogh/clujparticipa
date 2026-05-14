# ClujParticipa — Codebase Instructions

## Stack

- Next.js App Router, TypeScript
- Tailwind CSS
- PostgreSQL + Prisma
- Leaflet + OpenStreetMap (`react-leaflet`) — do not upgrade react-leaflet major versions without checking its migration guide
- `next-intl` for i18n (RO default, HU, EN)

## Conventions

- All routes live under `src/app/[locale]/`
- API routes live under `src/app/api/`
- Shared components in `src/components/`, grouped by domain: `ui/`, `layout/`, `ideas/`, `map/`, `admin/`
- Library utilities in `src/lib/`
- Translation files in `src/i18n/messages/ro.json`, `hu.json`, `en.json`
- All visible UI strings must come from locale files — no hardcoded user-facing text

## Data

- Use plain `latitude`/`longitude` Float columns for the MVP — do not add PostGIS
- Participant tokens are generated client-side and stored in localStorage; only a SHA-256 hash is stored server-side
- Never expose raw participant tokens in API responses

## Admin

- Admin actions require `ADMIN_SECRET` from env (request header `x-admin-secret`)
- All status changes and moderation events must be recorded in `StatusChange` or `ModerationEvent`

## Privacy & integrity

- Hash participant identifiers server-side before persistence
- Rate-limit create, vote, and comment endpoints
- Label all voting UI as non-binding prototype support

## What this is

A prototype and coalition-building tool, not a production voting system. Keep scope tight. Do not add features beyond the MVP plan without updating `PROJECT_BOARD.md` first.
