# Planned Features

Four features that close the full civic participation loop:
*submit → deliberate → vote → see results → track delivery*

---

## Feature 1 — Email Notifications on Status Changes

### Context

When an idea moves status, the person who submitted it has no way to know. They submitted and never came back. Email is the highest-leverage re-engagement mechanism.

Scope for this plan:
- Notify the **submitter** and any **voter who opts in**.
- Since voting is already gated to authenticated users (Google/Facebook OAuth), both groups already have a verified email in `User.email`. No email fields to collect — just checkboxes.
- Anonymous submitters receive no notification (they have no email in the system). This is acceptable: meaningful participants are expected to be logged in.
- The `Idea` model currently stores no submitter identity. We need to add `submitterParticipantHash` so we can resolve the submitter's email at send time via `ParticipantIdentity → User.email`. Voters' hashes are already on the `Vote` model.
- At send time: collect opted-in submitter + opted-in voters, resolve all emails, **deduplicate** (a submitter who also voted gets one email, not two), then batch-send via Resend.
- Emails are sent in Romanian only for this iteration (locale is not stored per-idea; Romanian is the default).
- Resend is the chosen provider (Next.js-native, generous free tier, batch send API included).

---

### Task 1.1 — Schema: notification fields on `Idea` and `Vote`

**`Idea` model** — add three columns:

```prisma
model Idea {
  // existing fields ...
  submitterParticipantHash String?
  notifyOnStatusChange     Boolean @default(false)
  unsubscribeToken         String? @unique
}
```

- `submitterParticipantHash` — the SHA-256 hash already computed at submission time; used to join to `ParticipantIdentity → User.email`.
- `notifyOnStatusChange` — submitter opt-in flag; defaults to `false`.
- `unsubscribeToken` — UUID used in the submitter's one-click unsubscribe link.

**`Vote` model** — add two columns:

```prisma
model Vote {
  // existing fields ...
  notifyOnStatusChange Boolean @default(false)
  unsubscribeToken     String? @unique
}
```

- `notifyOnStatusChange` — voter opt-in flag; defaults to `false`.
- `unsubscribeToken` — UUID used in the voter's one-click unsubscribe link (per-idea, per-voter — clicking it only unsubscribes that voter from that idea).

Run `npx prisma migrate dev --name add_notification_fields`.

**DoD:** `npx prisma validate` passes; migration applies cleanly; both `unsubscribeToken` fields have `@unique`; `npm run type-check` passes.

---

### Task 1.2 — Store submitter identity and opt-in at idea creation

**API (`src/app/api/ideas/route.ts`):**
- Add `notifyOnStatusChange: z.boolean().optional().default(false)` to the Zod body schema.
- When creating the idea:
  - Set `submitterParticipantHash` to the resolved `participantHash` (already computed for rate-limiting — reuse it).
  - If `notifyOnStatusChange` is `true`, generate an `unsubscribeToken` with `crypto.randomUUID()` and store it; otherwise leave it `null`.
- Never return `submitterParticipantHash` or `unsubscribeToken` in any API response.

**Form (`src/app/[locale]/ideas/new/page.tsx`):**
- Add a checkbox at the bottom of the form, visible only when the user **is authenticated** (anonymous users have no email — silently omit for them).
- Default: unchecked.
- Label: `"NewIdea.notifyLabel"` — "Notifică-mă pe email când statusul ideii se schimbă."
- Pass `notifyOnStatusChange: true/false` in the submission body.

**Locale files (RO/HU/EN):** add `"NewIdea.notifyLabel"`.

**DoD:** An authenticated user can check the box; `notifyOnStatusChange: true` is sent to the API and stored; anonymous users do not see the checkbox; `submitterParticipantHash` is stored on the created idea; none of these fields appear in any public API response; `npm run type-check` and `npm run lint` pass.

---

### Task 1.3 — Voter opt-in checkbox near the vote button

**API (`src/app/api/ideas/[id]/vote/route.ts`):**
- Add `notifyOnStatusChange: z.boolean().optional().default(false)` to the request body schema.
- When creating the `Vote` record:
  - If `notifyOnStatusChange` is `true`, generate a `unsubscribeToken` with `crypto.randomUUID()` and store it alongside the vote.
  - If `false`, leave `unsubscribeToken` null.
- Never expose `unsubscribeToken` in any API response.

**UI (`src/app/[locale]/ideas/[id]/page.tsx`):**
- Add a checkbox immediately below the vote/support button, visible only when the user **is authenticated** and has **not yet voted**.
- Default: unchecked.
- After the user votes (button click), send `notifyOnStatusChange` as part of the vote request body.
- Once voted, replace the checkbox with a static line showing their current preference (e.g. "You will be notified of updates") — no editing needed for MVP.
- Label: `"IdeaDetail.notifyVoteLabel"` — "Notifică-mă pe email când statusul ideii se schimbă."

**Locale files (RO/HU/EN):** add `"IdeaDetail.notifyVoteLabel"` and `"IdeaDetail.notifyVoteConfirm"`.

**DoD:** An authenticated user sees the checkbox before voting; it submits with the vote; re-voting is already prevented by the duplicate-vote check so the checkbox is only ever seen once; anonymous users (who cannot vote) see neither button nor checkbox; `npm run type-check` and `npm run lint` pass.

---

### Task 1.4 — Install Resend SDK and configure env

```bash
npm install resend
```

Add to `.env.example`:
```
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@clujparticipa.ro"
```

**DoD:** `resend` is in `package.json` `dependencies`; `.env.example` has both vars; `npm run build` passes.

---

### Task 1.5 — Create email sending utility with fan-out and deduplication

Create `src/lib/email.ts`:

**Signature:**
```ts
sendStatusChangeEmails({
  idea: { id, title, status, submitterParticipantHash, notifyOnStatusChange, unsubscribeToken },
  adminNote: string,
}): Promise<{ sent: number }>
```

**Logic (all DB queries run in parallel where possible):**

1. Collect opted-in recipients:
   - **Submitter**: if `idea.notifyOnStatusChange` is `true` and `idea.submitterParticipantHash` is set, resolve `ParticipantIdentity → User.email`.
   - **Voters**: query all `Vote` records for this idea where `notifyOnStatusChange = true`; for each, resolve `participantHash → ParticipantIdentity → User.email`.
2. **Deduplicate** by email address (a submitter who also voted gets one email, not two). Use a `Set<string>` to track seen addresses.
3. Build one email payload per unique address, each with its own `unsubscribeToken` (submitter uses `idea.unsubscribeToken`; voters use their `vote.unsubscribeToken`).
4. If the recipient list is empty, return `{ sent: 0 }` immediately.
5. Send via `resend.batch.send([...])` — a single Resend API call for all recipients.
6. Return `{ sent: count }`. Never throws — catch all errors, log to `console.error`, return `{ sent: 0 }`.
7. If `RESEND_API_KEY` is not set, log a warning and return `{ sent: 0 }`.

**Email body** (inline HTML, no template library):
- Idea title with a link to `{NEXT_PUBLIC_APP_URL}/ro/ideas/{id}`.
- The admin note from the status change.
- One-click unsubscribe link: `{NEXT_PUBLIC_APP_URL}/api/unsubscribe?token={recipientUnsubscribeToken}`.

**DoD:** Recipient list is built from both submitter and voters; deduplication prevents double emails; batch send uses a single Resend API call; the function never throws; `{ sent: 0 }` is returned when no API key is set or no opted-in recipients exist; `npm run type-check` passes.

---

### Task 1.6 — Trigger email fan-out from status change API

In `src/app/api/admin/ideas/[id]/status/route.ts`, after the DB transaction succeeds:

1. Re-fetch the idea selecting `id`, `title`, `status`, `notifyOnStatusChange`, `submitterParticipantHash`, `unsubscribeToken`.
2. Fire-and-forget the fan-out — do not await:
   ```ts
   void sendStatusChangeEmails({ idea, adminNote: note });
   ```
   The function handles all fan-out and deduplication internally (Task 1.5).
3. The HTTP response is returned immediately without waiting for email delivery.

**DoD:** A status change triggers `sendStatusChangeEmails`; opted-in submitter and voters each receive one email; a submitter who also voted receives only one email; the API response is unaffected by email success or failure; `npm run type-check` passes.

---

### Task 1.7 — Add `GET /api/unsubscribe` route

Create `src/app/api/unsubscribe/route.ts`:
- Accept `?token=` query param. No auth required — the token is the credential.
- Look up the token in **both** tables:
  1. `Idea.unsubscribeToken` — if found, set `idea.notifyOnStatusChange = false` and `idea.unsubscribeToken = null`. Return a page: "You will no longer receive updates for this idea." with a link back to the idea.
  2. `Vote.unsubscribeToken` — if found, set `vote.notifyOnStatusChange = false` and `vote.unsubscribeToken = null`. Return a page: "You will no longer receive updates for this idea." with a link to the idea (resolve `vote.ideaId`).
- If the token matches neither table: return "Already unsubscribed or link has expired."
- Return plain HTML in all cases (not JSON).

**DoD:** A submitter's unsubscribe token clears the idea-level preference; a voter's token clears that vote's preference only; a second visit to the same URL shows "already unsubscribed"; no further emails are sent to that address for that idea; `npm run type-check` passes.

---

## Feature 2 — Admin Feasibility Notes

### Context

The status workflow moves ideas forward, but admins have no way to attach structured official feedback: estimated cost, responsible city department, or a plain-language response explaining why an idea is or isn't feasible. This turns the tool from a vote collector into a real deliberation record.

One feasibility note per idea, admin-editable. Public-facing on the idea detail page.

---

### Task 2.1 — Schema: add `FeasibilityNote` model

Add to `prisma/schema.prisma`:

```prisma
model FeasibilityNote {
  id                  String   @id @default(cuid())
  ideaId              String   @unique
  estimatedCostRonMin Int?
  estimatedCostRonMax Int?
  department          String?
  responseText        String
  author              String
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  idea                Idea     @relation(fields: [ideaId], references: [id], onDelete: Cascade)
}
```

Add to `Idea`:
```prisma
feasibilityNote FeasibilityNote?
```

Run `npx prisma migrate dev --name add_feasibility_note`.

**DoD:** `npx prisma validate` passes; migration applies cleanly; `@unique` on `ideaId` enforces one note per idea; `npm run type-check` passes.

---

### Task 2.2 — Add `PUT /api/admin/ideas/[id]/feasibility`

Create `src/app/api/admin/ideas/[id]/feasibility/route.ts`:
- Requires `x-admin-secret` header (same as other admin routes).
- Accepts `PUT` with body: `{ responseText: string (1–5000 chars), department?: string, estimatedCostRonMin?: number, estimatedCostRonMax?: number }`.
- Validates with Zod. If `estimatedCostRonMin` and `estimatedCostRonMax` are both provided, enforce `min <= max`.
- Upserts `FeasibilityNote` (create or update) for the given idea id.
- Sets `author: "admin"`.
- Returns the saved note.
- Returns 404 if the idea does not exist.

**DoD:** `PUT` with valid body creates a note if none exists; a second `PUT` updates it; missing required field `responseText` returns 400; invalid admin secret returns 401; cost range inversion returns 400; `npm run type-check` passes.

---

### Task 2.3 — Include feasibility note in idea detail API

In `src/app/api/ideas/[id]/route.ts`, add `feasibilityNote: true` to the Prisma `include` block.

The response will now contain `feasibilityNote: { ... } | null`.

**DoD:** `GET /api/ideas/{id}` response contains a `feasibilityNote` key; it is `null` when no note exists; it contains all fields when a note exists; `npm run type-check` passes.

---

### Task 2.4 — Admin form for feasibility note

In the admin idea detail view (`src/app/[locale]/admin/`):
- Add a collapsible "Feasibility assessment" section below the status controls.
- Form fields: `responseText` (textarea), `department` (text input), `estimatedCostRonMin` and `estimatedCostRonMax` (number inputs, optional).
- Pre-fill from existing note if one exists.
- Submit calls `PUT /api/admin/ideas/{id}/feasibility`.
- Show save confirmation or error inline.

**DoD:** Admin can create and update a feasibility note; pre-fill works on reload; validation errors are surfaced; `npm run type-check` passes.

---

### Task 2.5 — Display feasibility note on public idea detail

In `src/app/[locale]/ideas/[id]/page.tsx`:
- Render `feasibilityNote` below the description and above the status timeline, but only if it exists.
- Show: `responseText` (full text), `department` (if set), formatted cost range (if set), `createdAt` date.
- Use a visually distinct block (e.g., left border in city blue) to signal official content.
- Label it with translation key `"IdeaDetail.feasibilityHeading"`.

Add locale keys to RO/HU/EN:
- `"IdeaDetail.feasibilityHeading"` — "Evaluare de fezabilitate"
- `"IdeaDetail.feasibilityDepartment"` — "Direcție responsabilă"
- `"IdeaDetail.feasibilityCostRange"` — "Cost estimat"
- `"IdeaDetail.feasibilityAuthor"` — "Evaluare oficială"

**DoD:** A public visitor sees the feasibility note when one exists; ideas without a note show nothing in that space; cost range is formatted as "RON X – Y" (or just "RON X+" when only min is set); `npm run type-check` passes.

---

## Feature 3 — Voting Period with Deadline and Results Page

### Context

The `IN_VOTING` status exists but has no time boundary. Users don't know when voting opens or closes. There's no public page showing final tallies. Without a deadline and a results page, the voting phase has no stakes or resolution.

One active voting config at a time, admin-managed. A public `/results` page. Countdown timer on idea detail during `IN_VOTING`. Vote API enforces the deadline.

---

### Task 3.1 — Schema: add `VotingConfig` model

Add to `prisma/schema.prisma`:

```prisma
model VotingConfig {
  id        String   @id @default(cuid())
  startsAt  DateTime
  endsAt    DateTime
  label     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Run `npx prisma migrate dev --name add_voting_config`.

Only one active config is expected; the API will upsert on a fixed sentinel ID (`"singleton"`) to enforce this.

**DoD:** `npx prisma validate` passes; migration applies cleanly; `npm run type-check` passes.

---

### Task 3.2 — Add `GET /api/voting-config` and `PUT /api/admin/voting-config`

**`GET /api/voting-config`** (public, no auth):
- Returns the current `VotingConfig` or `{ config: null }` if not set.
- Response: `{ config: { startsAt, endsAt, label, isOpen: boolean } | null }`.
- `isOpen` is `startsAt <= now <= endsAt`.

**`PUT /api/admin/voting-config`** (admin):
- Requires `x-admin-secret`.
- Body: `{ startsAt: ISO string, endsAt: ISO string, label?: string }`.
- Zod: `endsAt` must be after `startsAt`.
- Upserts on ID `"singleton"`.
- Returns saved config with `isOpen`.

**DoD:** `GET` returns `null` before any config is set; `PUT` creates config; second `PUT` updates it; `endsAt < startsAt` returns 400; `isOpen` is accurate at time of request; `npm run type-check` passes.

---

### Task 3.3 — Enforce voting deadline in vote API

In `src/app/api/ideas/[id]/vote/route.ts`:
- Fetch the current `VotingConfig` (query DB, not the public API endpoint).
- If a config exists and voting is **not** open (`now < startsAt` or `now > endsAt`), return HTTP 403 with `{ error: "Voting is not currently open" }`.
- If no config exists, **do not** block voting (allow voting outside a configured window, so the system works before a config is ever set — preserves existing behavior).

**DoD:** A vote cast outside the configured window returns 403; a vote cast inside the window succeeds; no config set → votes are accepted as before; `npm run type-check` passes.

---

### Task 3.4 — Countdown timer component

Create `src/components/ideas/voting-countdown.tsx` (client component):
- Accepts `endsAt: string` (ISO date).
- Renders a live countdown: "Voting closes in X days Y hours Z minutes" — or "Voting has closed" if past.
- Uses `setInterval` with 1-second tick; clears on unmount.
- Translation keys: `"IdeaDetail.votingClosesIn"`, `"IdeaDetail.votingClosed"`, `"IdeaDetail.votingDays"`, `"IdeaDetail.votingHours"`, `"IdeaDetail.votingMinutes"`.

In `src/app/[locale]/ideas/[id]/page.tsx`:
- Fetch `GET /api/voting-config` alongside the idea fetch.
- If idea status is `IN_VOTING` and config exists, render `<VotingCountdown endsAt={config.endsAt} />` near the vote button.

**DoD:** The countdown renders and ticks for an `IN_VOTING` idea during an active config; it shows "closed" after `endsAt`; it does not render for ideas in other statuses; `npm run type-check` passes.

---

### Task 3.5 — Results page

Create `src/app/[locale]/results/page.tsx` (server component):
- Fetches all ideas with status `IN_VOTING` or `SELECTED`, sorted by `supportCount` descending.
- Fetches current `VotingConfig` to show the voting period label and dates.
- Layout:
  - **Section 1 — Selected ideas** (`SELECTED` status): highlighted, shown first with a "Winner" badge.
  - **Section 2 — All votes** (`IN_VOTING`): ranked list with vote counts.
- Uses `IdeaCard` in compact mode.
- Shows a placeholder if no ideas are in voting.
- Add translation keys: `"Results.title"`, `"Results.description"`, `"Results.selectedHeading"`, `"Results.allVotesHeading"`, `"Results.noResults"`, `"Results.votingPeriod"`.

**DoD:** Page renders for all three locales; SELECTED ideas appear in a separate top section; ideas are sorted by vote count; vote counts are visible on each row; `npm run build` passes; `npm run type-check` passes.

---

### Task 3.6 — Navigation link to Results page

In the main navigation (`src/components/layout/`):
- Add a "Results" nav link that is visible only when at least one `IN_VOTING` or `SELECTED` idea exists **or** when a `VotingConfig` has been set.
- The check can be a lightweight `GET /api/voting-config` call from the layout (cached).
- Add translation key `"Navigation.results"` to RO/HU/EN.

**DoD:** The Results link appears in the nav when a voting config is active; it is absent when no config is set and no IN_VOTING/SELECTED ideas exist; active locale routing works; `npm run type-check` passes.

---

### Task 3.7 — Admin UI for voting config

In the admin dashboard (`src/app/[locale]/admin/`):
- Add a "Voting period" section with two datetime inputs (`startsAt`, `endsAt`) and an optional label input.
- Pre-fill from current config.
- Submit calls `PUT /api/admin/voting-config`.
- Show current status: "Open", "Scheduled (opens X)", or "Not configured".

**DoD:** Admin can set and update voting dates via the UI; current status is displayed accurately; validation error (end before start) is shown inline; `npm run type-check` passes.

---

## Feature 4 — Progress Updates on In-Progress Ideas

### Context

Once an idea reaches `IN_PROGRESS`, citizens who backed it have no way to follow along. Admins can post timestamped progress updates (text + optional photo) that appear as a live feed on the idea detail page. This is the feature that builds long-term trust in the process.

---

### Task 4.1 — Schema: add `ProgressUpdate` model

Add to `prisma/schema.prisma`:

```prisma
model ProgressUpdate {
  id        String   @id @default(cuid())
  ideaId    String
  text      String
  imageUrl  String?
  author    String
  createdAt DateTime @default(now())
  idea      Idea     @relation(fields: [ideaId], references: [id], onDelete: Cascade)

  @@index([ideaId, createdAt])
}
```

Add to `Idea`:
```prisma
progressUpdates ProgressUpdate[]
```

Run `npx prisma migrate dev --name add_progress_updates`.

**DoD:** `npx prisma validate` passes; migration applies cleanly; `npm run type-check` passes.

---

### Task 4.2 — Add `POST /api/admin/ideas/[id]/updates`

Create `src/app/api/admin/ideas/[id]/updates/route.ts`:
- Requires `x-admin-secret`.
- Body: `{ text: string (1–5000 chars), imageUrl?: string }`.
- Validates with Zod. If `imageUrl` is present, it must start with `/${IMAGE_UPLOAD_DIR}/` (reuse the same constraint as idea images, so only already-uploaded files are accepted).
- Creates a `ProgressUpdate` record. `author` is set to `"admin"`.
- Returns the created update.
- Returns 404 if the idea does not exist.
- Does **not** restrict to specific statuses — admins may post updates on any status (allows updating `SELECTED` ideas before work formally starts).

**DoD:** `POST` with valid body creates a `ProgressUpdate` row; `text` longer than 5000 chars returns 400; invalid `imageUrl` returns 400; missing admin secret returns 401; non-existent idea returns 404; `npm run type-check` passes.

---

### Task 4.3 — Include progress updates in idea detail API

In `src/app/api/ideas/[id]/route.ts`, add to the Prisma `include`:

```ts
progressUpdates: {
  orderBy: { createdAt: 'asc' },
},
```

**DoD:** `GET /api/ideas/{id}` response contains `progressUpdates: []` when none exist and a populated array when they do; order is chronological; `npm run type-check` passes.

---

### Task 4.4 — Progress update form in admin idea view

In the admin idea detail view:
- Add a "Post progress update" section below the status controls.
- Fields: `text` (textarea, required), `imageUrl` (text input, optional — admin pastes the path from a prior upload).
- On submit, call `POST /api/admin/ideas/{id}/updates`.
- Below the form, render the existing updates in reverse-chronological order (newest first) with delete-confirmation placeholder (deletion is out of scope for this iteration).
- Pre-fetching: the admin page should call `GET /api/ideas/{id}` which now includes `progressUpdates`.

**DoD:** Admin can post a text-only update; admin can post an update with an image URL; the new update appears immediately after submission without a page reload; `npm run type-check` passes.

---

### Task 4.5 — Display progress updates on public idea detail

In `src/app/[locale]/ideas/[id]/page.tsx`:
- Add a "Progress updates" section between the feasibility note and the status timeline.
- Only render if `idea.progressUpdates.length > 0`.
- Each update renders as a timeline entry:
  - Date (formatted, localized)
  - Update text
  - Image (if `imageUrl` is set) — use `next/image` with `width`/`height` unknown, so use `fill` inside a fixed-aspect container
- Label with translation key `"IdeaDetail.progressUpdatesHeading"`.
- Individual update date format: `"IdeaDetail.progressUpdateDate"` (use `Intl.DateTimeFormat` with `{ dateStyle: 'medium' }`).

Add locale keys to RO/HU/EN:
- `"IdeaDetail.progressUpdatesHeading"` — "Actualizări de progres"
- `"IdeaDetail.progressUpdateDate"` — (use date formatting, not a static string)
- `"IdeaDetail.noProgressUpdates"` — not needed (section is hidden when empty)

**DoD:** Progress updates render in chronological order on the public detail page; images render without layout shift; the section is invisible when no updates exist; all three locales render correctly; `npm run type-check` and `npm run lint` pass; `npm run build` passes.

---

## Task checklist summary

| # | Task | Feature | Status |
|---|------|---------|--------|
| 1.1 | Schema: notification fields on `Idea` and `Vote` | Notifications | [x] |
| 1.2 | Submitter opt-in: checkbox on idea creation form + API stores submitter hash | Notifications | [x] |
| 1.3 | Voter opt-in: checkbox near vote button + vote API stores preference | Notifications | [x] |
| 1.4 | Install Resend SDK + env vars | Notifications | [x] |
| 1.5 | `src/lib/email.ts` — fan-out with deduplication via `resend.batch.send` | Notifications | [x] |
| 1.6 | Trigger fan-out from status change API (fire-and-forget) | Notifications | [x] |
| 1.7 | `GET /api/unsubscribe` — handles both idea-level and vote-level tokens | Notifications | [x] |
| 2.1 | Schema: `FeasibilityNote` model | Feasibility Notes | [x] |
| 2.2 | `PUT /api/admin/ideas/[id]/feasibility` | Feasibility Notes | [x] |
| 2.3 | Include feasibility note in idea detail API | Feasibility Notes | [x] |
| 2.4 | Admin form for feasibility note | Feasibility Notes | [x] |
| 2.5 | Public display of feasibility note on idea detail | Feasibility Notes | [x] |
| 3.1 | Schema: `VotingConfig` model | Voting Period | [x] |
| 3.2 | `GET /api/voting-config` + `PUT /api/admin/voting-config` | Voting Period | [x] |
| 3.3 | Enforce deadline in vote API | Voting Period | [x] |
| 3.4 | `VotingCountdown` component + wiring to idea detail | Voting Period | [x] |
| 3.5 | `/results` page | Voting Period | [x] |
| 3.6 | Navigation link to Results | Voting Period | [x] |
| 3.7 | Admin UI for voting config | Voting Period | [x] |
| 4.1 | Schema: `ProgressUpdate` model | Progress Updates | [x] |
| 4.2 | `POST /api/admin/ideas/[id]/updates` | Progress Updates | [x] |
| 4.3 | Include progress updates in idea detail API | Progress Updates | [x] |
| 4.4 | Admin form + update list in admin idea view | Progress Updates | [x] |
| 4.5 | Public display of progress updates on idea detail | Progress Updates | [x] |
