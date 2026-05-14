# ClujParticipa MVP - Implementation Plan

## Context

ClujParticipa is a greenfield civic participation prototype for Cluj-Napoca, inspired by participatory budgeting workflows such as Osallistuva Vantaa. The MVP demonstrates five public-facing flows: idea submission, map-based discovery, voting/support, comments, and proposal status tracking.

The prototype can use demo data. Its job is to move conversations from "this could exist" to "this is what it would feel like."

## Non-Goals For MVP

- Production-grade legally binding voting
- Citywide launch
- Full municipal identity verification
- Procurement system integration
- Complex geospatial analytics

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 14+ or current stable Next.js App Router, TypeScript | Full-stack app, good routing, API handlers |
| Styling | Tailwind CSS | Fast mobile-first implementation |
| Database | PostgreSQL | Reliable relational base |
| ORM | Prisma | Type-safe data access and migrations |
| Maps | Leaflet + OpenStreetMap tiles | Free, no API keys, open-source friendly |
| i18n | next-intl | Strong App Router locale support |
| Public participation identity | Anonymous participant token stored client-side, hashed server-side | Low-friction demo with clear limitations |
| Admin auth | Protected admin token/session for status changes and moderation | Prevents public mutation of official workflow state |

## Data Model

Use plain latitude/longitude columns for the MVP. Add PostGIS only when real spatial queries are needed.

**Models:**

- `Idea` - id, title, description, category, latitude, longitude, district, status, createdAt, updatedAt
- `Vote` - id, ideaId, participantHash, direction, createdAt
- `Comment` - id, ideaId, participantHash, text, parentId, status, createdAt
- `StatusChange` - id, ideaId, fromStatus, toStatus, note, changedBy, createdAt
- `ModerationEvent` - id, targetType, targetId, action, reason, changedBy, createdAt

**Constraints:**

- One vote per `participantHash` per idea
- Comments support one-level threaded replies through `parentId`; replies to replies are not part of the MVP
- Status changes require admin authorization
- Comments can be hidden without deletion
- Public API never exposes raw participant tokens

**Enums:**

- `Category`: INFRASTRUCTURE, EDUCATION, ENVIRONMENT, CULTURE, SAFETY, TRANSPORT, HEALTH, OTHER
- `Status`: SUBMITTED, UNDER_REVIEW, ELIGIBLE, IN_VOTING, SELECTED, IN_PROGRESS, COMPLETED, REJECTED
- `CommentStatus`: VISIBLE, HIDDEN
- `District`: MANASTUR, GHEORGHENI, ZORILOR, CENTRU, MARASTI, GRIGORESCU, IRIS, GRUIA, ANDREI_MURESANU, BUNA_ZIUA, BORHANCI, DAMBU_ROTUND, OTHER

District values should be validated with local partners before they become budget or quota boundaries.

## i18n Setup

Create three locale files:

- `ro.json` as default
- `hu.json`
- `en.json`

All visible UI strings should come from locale files. Seed content can start in Romanian with translated sample titles/descriptions added later.

## Core Features

### Homepage (`/[locale]/`)

- Project overview
- Public stats: total ideas, visible comments, total votes, status counts
- Recent ideas
- Calls to submit an idea and open the map

### Idea Submission (`/[locale]/ideas/new`)

- Form fields: title, description, category, district
- Leaflet map click to set latitude/longitude
- Preview before submit
- Participant token generated client-side if missing
- Server stores only a hash derived from the participant token

### Ideas List (`/[locale]/ideas`)

- Filter by category, district, and status
- Sort by date and support count
- Pagination
- Cards with status badge, vote count, and comment count

### Idea Detail (`/[locale]/ideas/[id]`)

- Full idea content
- Map pin
- Vote buttons
- Visible comments with one-level threaded replies
- Status history timeline
- Public explanation for rejected or selected proposals

### Map View (`/[locale]/map`)

- Full-screen Leaflet map
- Centered on Cluj-Napoca
- Markers for ideas
- Marker popup with title, status, support count, and link
- Category/status filters
- Marker clustering if the library is lightweight and compatible

### Admin Surface (`/[locale]/admin`)

Keep this intentionally small:

- Authenticate with an admin-only session or deployment secret for MVP
- Change idea status
- Add status notes
- Hide comments
- Record all admin actions in status or moderation history

## API Routes

Public:

- `GET /api/ideas` - list with filters
- `POST /api/ideas` - create idea
- `GET /api/ideas/[id]` - detail
- `POST /api/ideas/[id]/vote` - vote with duplicate check
- `GET /api/ideas/[id]/comments` - list visible comments with visible one-level replies
- `POST /api/ideas/[id]/comments` - create comment or one-level reply

Admin:

- `PATCH /api/admin/ideas/[id]/status` - update status with note
- `PATCH /api/admin/comments/[id]` - hide/restore comment

## Privacy And Integrity

The MVP voting mechanism is suitable only for a prototype. It should be labeled as non-binding support, not official voting.

Minimum controls:

- Hash participant identifiers server-side
- Do not collect unnecessary personal data
- Add rate limits to create, vote, and comment endpoints
- Add spam honeypot or equivalent lightweight abuse control
- Publish a short privacy note in the UI
- Keep admin actions auditable

Future production voting requires a separate identity verification design, likely involving municipal or national identity infrastructure and legal review.

## Directory Structure

```text
src/
  app/
    [locale]/
      layout.tsx
      page.tsx
      ideas/
        page.tsx
        new/page.tsx
        [id]/page.tsx
      map/
        page.tsx
      admin/
        page.tsx
    api/
      ideas/
        route.ts
        [id]/
          route.ts
          vote/route.ts
          comments/route.ts
      admin/
        ideas/[id]/status/route.ts
        comments/[id]/route.ts
  components/
    ui/
    layout/
    ideas/
    map/
    admin/
  lib/
    db.ts
    participant.ts
    admin-auth.ts
    rate-limit.ts
  i18n/
    request.ts
    messages/
      ro.json
      hu.json
      en.json
prisma/
  schema.prisma
  seed.ts
public/
  images/
tailwind.config.ts
next.config.ts
```

## Implementation Order

1. Scaffold Next.js app with TypeScript and Tailwind
2. Install Prisma, PostgreSQL driver, next-intl, Leaflet, and validation helpers
3. Add database schema and seed data
4. Configure i18n and app shell
5. Build shared UI components
6. Implement public idea APIs
7. Implement participant token/hash handling and rate limits
8. Build idea submission, list, detail, and map views
9. Implement admin status/moderation APIs and minimal admin page
10. Add privacy note, loading states, validation errors, and responsive polish
11. Run end-to-end verification with seeded data

## Verification

- `npm run dev` starts the app locally
- `npm run lint` passes
- `npm run type-check` or equivalent passes
- Seed script creates realistic demo ideas
- Language switcher changes all UI text
- Submitted idea appears in list, detail, and map views
- Vote endpoint prevents duplicate votes for one participant token
- Comment creation works and hidden comments do not show publicly
- Public users cannot change status
- Admin status changes appear in the status timeline
- Map renders on desktop and mobile viewport sizes
