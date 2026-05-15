# Feature Delta — editorial-redesign

## Wave: DISCUSS / [REF] Persona ID

**First-time Visitor** — curious citizen, no account, lands on homepage via direct link or search. Wants to understand what civic ideas exist and where, feel the platform is active and credible, and optionally submit an idea.

## Wave: DISCUSS / [REF] JTBD One-liner

When I visit the civic platform, I want to see an editorial-quality homepage with a live idea feed alongside a map, so I can scan ideas by neighborhood, feel the platform is active, and decide to participate.

## Wave: DISCUSS / [REF] Locked Decisions

- [D1] Feature type: User-facing — all changes are visible UI/UX on the homepage
- [D2] Walking skeleton: Brownfield — redesign branch has existing working layout; right-sized, no split needed
- [D3] UX research depth: Lightweight — clear visual target in cp-example reference
- [D4] JTBD: Yes — 4 jobs identified with opportunity scoring
- [D5] No ticker footer — user directed to keep existing static footer; scrolling ticker removed from scope
- [D6] Framer Motion is integral, not deferred — animations are folded into layout and card slices, not a separate afterthought

## Wave: DISCUSS / [REF] User Stories

### US-1: Split Sidebar+Map Layout

**As a** visitor **I want to** see a sidebar with the idea feed alongside a map of Cluj **So that** I can browse ideas while keeping geographic context

**Job**: J2 (Scanner)

**Before**: I must scroll past a vertical idea list and then navigate to a separate map page to see where ideas are located
**After**: view the homepage → sees a two-column layout with the idea feed on the left and an interactive Leaflet map on the right
**Decision enabled**: I can scan ideas and see their map distribution simultaneously, deciding which neighborhoods to explore

**ACs**:
- Homepage renders sidebar (w-[400px]) on left and map (flex-1) on right
- Leaflet map initializes and is interactive within the right panel
- On <768px, sidebar stacks above map, both full-width
- Idea list scrolls independently within sidebar
- Header and footer unchanged
- No Leaflet/React console errors

### US-2: Framer Motion Layout Entrance

**As a** visitor **I want to** see the sidebar and map animate smoothly into view **So that** the page feels polished and alive

**Job**: J1 (Explorer), J3 (Trust-Seeker)

**Before**: the homepage appears instantly with no transition — feels like any other web app
**After**: load the homepage → sees the sidebar slide in from the left and the map fade+scale into view
**Decision enabled**: I feel the platform is polished and active, deciding to stay and explore

**ACs**:
- Sidebar: `initial={{ opacity: 0, x: -20 }}` → `animate={{ opacity: 1, x: 0 }}`
- Map: `initial={{ opacity: 0, scale: 0.98 }}` → `animate={{ opacity: 1, scale: 1 }}`
- No hydration mismatch warnings
- Animations disabled when `prefers-reduced-motion` is set
- Animated components use `use client`

### US-3: Editorial Typography

**As a** visitor **I want to** see a serif/sans typographic hierarchy with Playfair Display headings **So that** the platform feels like a credible editorial publication

**Job**: J3 (Trust-Seeker)

**Before**: headings use default sans-serif — the page looks like a standard Next.js template
**After**: view the homepage → sees Playfair Display serif on headings and Inter sans on UI elements with editorial tracking
**Decision enabled**: I perceive the platform as credible and serious, deciding to trust my participation

**ACs**:
- Playfair Display renders on heading elements
- Nav labels: `text-[11px] font-bold tracking-widest uppercase`
- Idea feed heading: `font-serif italic`
- No CLS during font swap
- All strings from locale files

### US-4: Editorial Idea Cards with Staggered Animation

**As a** visitor **I want to** see beautifully styled idea cards with neighborhood colors and entrance animations **So that** I can quickly scan ideas and feel the platform is active

**Job**: J1 (Explorer), J2 (Scanner)

**Before**: idea list items are plain rows with minimal visual distinction
**After**: view the homepage → sees color-coded idea cards with serif titles, neighborhood labels, status badges, and staggered fade+slide animation
**Decision enabled**: I can quickly identify ideas in my neighborhood and gauge their status

**ACs**:
- Each card: neighborhood (color-coded), status badge, serif title, support count, comment count
- Title: `font-serif font-medium`, hover underline (`underline-offset-8`)
- Category colors from `category-colors.ts`
- Staggered fade+slide (0.1s delay per card)
- ThumbsUp/MessageSquare icons on counts
- All strings from locale files

### US-5: LIVE Activity Badge

**As a** visitor **I want to** see a "LIVE" badge on the idea feed **So that** I immediately sense the platform is active

**Job**: J1 (Explorer)

**Before**: no indication the platform is active — could be abandoned
**After**: view the homepage → sees a pulsing "LIVE" badge next to the idea feed heading (when ideas or voting exist)
**Decision enabled**: I feel the platform is active, deciding to engage rather than leave

**ACs**:
- LIVE badge appears when `votingConfig.isOpen` OR >0 ideas exist
- Badge: `bg-ink text-paper`, `animate-pulse`
- Hidden when no ideas and no voting
- Badge text from locale files

### US-6: Animated Map Pins

**As a** visitor **I want to** see colored animated pins on the map representing ideas by neighborhood **So that** I can see where civic activity is concentrated

**Job**: J2 (Scanner)

**Before**: map shows default blue Leaflet markers — uniform and uninformative
**After**: view the homepage map → sees colored circle markers with pulse animations, colored by category, with hover tooltips
**Decision enabled**: I can see which neighborhoods have the most activity, deciding where to focus

**ACs**:
- Colored circle markers (not default blue pins)
- Color-coded by category (`category-colors.ts`)
- Active markers pulse
- Hover shows tooltip with location name
- Map remains interactive
- No rendering errors

### US-7: Sidebar CTA Button

**As a** visitor **I want to** see a prominent "Submit your idea" button at the sidebar bottom **So that** I can easily move from browsing to contributing

**Job**: J4 (Contributor)

**Before**: submit button is in the hero section and may be off-screen
**After**: view the homepage → sees a full-width dark "Trimite Ideea Ta" button pinned to the sidebar bottom
**Decision enabled**: I can submit my idea immediately after browsing, without scrolling back up

**ACs**:
- CTA at sidebar bottom, full-width
- `bg-ink text-paper`, `mt-auto` positioning
- Send icon + uppercase tracking-wide label
- Old hero CTA removed
- Stays visible regardless of list length
- All strings from locale files

## Wave: DISCUSS / [REF] Definition of Done

1. All 7 user stories implemented and ACs passing
2. Homepage renders split sidebar+map layout on desktop
3. Layout stacks vertically on mobile (<768px)
4. Framer Motion animations work without hydration errors
5. Playfair Display loads without CLS
6. LIVE badge shows/hides based on activity
7. Custom map pins replace default Leaflet markers
8. CTA button at sidebar bottom with `mt-auto`
9. All visible strings from locale files

## Wave: DISCUSS / [REF] Out of Scope

- Scrolling ticker footer (user directed to keep existing static footer)
- Changes to header or footer components
- Changes to other pages (idea detail, map page, admin)
- PostGIS migration (per CLAUDE.md: use plain lat/long floats)
- react-leaflet major version upgrade (per CLAUDE.md)
- Any new API endpoints (all required APIs already exist)

## Wave: DISCUSS / [REF] WS Strategy

**B** — Brownfield. The redesign branch has an existing working layout. We restructure it rather than build from scratch.

## Wave: DISCUSS / [REF] Driving Ports

| Port | Type | Description |
|------|------|-------------|
| Homepage `/` | HTTP (SSR) | Main entry point — split layout renders server-side, hydrates with motion |
| `/api/ideas` | HTTP (API) | Idea feed data for sidebar + map pins |
| `/api/stats` | HTTP (API) | Total stats for LIVE badge and map overlay |
| `/api/voting-config` | HTTP (API) | Voting status for LIVE badge visibility |

## Wave: DISCUSS / [REF] Prerequisites

- Redesign branch must be checked out and working
- `react-leaflet` already integrated (exists on redesign branch)
- APIs (`/api/ideas`, `/api/stats`, `/api/voting-config`) already functional on redesign branch

---

## Wave: DESIGN / [REF] DDD List

| D# | Decision | Verdict | Rationale |
|----|----------|---------|-----------|
| D01 | Layout: grid vs flex | Flex with fixed sidebar | react-leaflet needs explicit height; flex `h-[calc(100vh-header-footer)]` propagates naturally vs fragile `h-full` chaining through grid cells |
| D02 | Font: Source Serif 4 → Playfair Display | Switch via `next/font/google` | Source Serif 4 has zero references in codebase. Playfair Display is the editorial target. `next/font` gives auto-subset, `font-display: swap`, zero CLS, self-hosted |
| D03 | Motion: `framer-motion` vs `motion` | `motion` v12.x | Canonical successor. Same API. Import from `motion/react` matches cp-example. ~18KB gzipped |
| D04 | SSR pattern for motion | `use client` + conditional rendering | Homepage is already `"use client"`. No dynamic import needed. `prefers-reduced-motion` handled via built-in motion support |
| D05 | IdeaCard vs new EditorialIdeaCard | CREATE new component | Different structure (no image, no border, neighborhood+dot+status line). Extending IdeaCard with variant would double conditional branches |
| D06 | Map markers: extend markerIcon | EXTEND existing `markerIcon()` | Already uses `L.divIcon` with inline HTML. Extend signature to `markerIcon(status, category, neighborhood)`. Add ring-8, pulse, tooltip |
| D07 | Data fetching: consolidate or separate | Keep separate, co-locate in page | Different query shapes. No new API endpoint. Move map fetch from HomeMapPreview into page, pass ideas as prop |
| D08 | CTA link: `next/link` or `<a>` | `Link` from `@/i18n/navigation` | Preserves locale in URL. All internal navigation uses this pattern |
| D09 | LIVE badge visibility | Show when `votingConfig.isOpen` OR `totalIdeas > 0` | Hide when both false. On first load before fetch: hidden (no flash) |
| D10 | Mobile breakpoint | `md:` (768px) | Matches US-1 AC. `flex-col` below, `flex-row` above |

## Wave: DESIGN / [REF] Component Decomposition

| Component | Path | Change | Description |
|-----------|------|--------|-------------|
| Homepage | `src/app/[locale]/page.tsx` | REFACTOR | Split sidebar+map flex layout. Fetch stats + ideas. Orchestrate motion + typography. Remove hero CTA |
| Layout | `src/app/[locale]/layout.tsx` | EXTEND | Replace Geist Sans with Inter. Add Playfair Display. Wire CSS variables. Remove Source Serif 4 |
| EditorialIdeaCard | `src/components/ideas/editorial-idea-card.tsx` | CREATE | Neighborhood label + dot + status, serif title, counts with icons, Framer Motion stagger |
| LiveBadge | `src/components/ui/live-badge.tsx` | CREATE | `bg-ink text-paper animate-pulse`, conditionally visible |
| SidebarCta | `src/components/ideas/sidebar-cta.tsx` | CREATE | Full-width dark button, `mt-auto`, Send icon, Link to `/ideas/new` |
| MapView | `src/components/map/map-view.tsx` | EXTEND | Extend `markerIcon` to accept category + neighborhood. Add ring-8, pulse, tooltip |
| MapLoader | `src/components/map/map-loader.tsx` | EXTEND | Loading placeholder `h-full` for flex container |
| globals.css | `src/app/globals.css` | EXTEND | Add `--font-serif`, `--font-sans` theme variables, selection styles |
| Locale files | `src/i18n/messages/{ro,en,hu}.json` | EXTEND | Add `Home.liveBadge`, `Home.sendIdea` keys |

## Wave: DESIGN / [REF] Driving Ports

| Port | Type | Consumer | Description |
|------|------|----------|-------------|
| `GET /` | HTTP (SSR + client hydration) | Visitor browser | Server renders layout shell, client hydrates with motion + data |
| `GET /api/stats` | HTTP (API, JSON) | Homepage client | `totalIdeas`, `totalVotes`, `totalComments`, `recentIdeas[]`, `statusCounts` |
| `GET /api/ideas?limit=50` | HTTP (API, JSON) | Homepage client | Ideas with lat/long for map + sidebar |
| `GET /api/voting-config` | HTTP (API, JSON) | Homepage client | `config.isOpen` for LIVE badge |

## Wave: DESIGN / [REF] Driven Ports + Adapters

| Port | Adapter | Technology | Description |
|------|---------|------------|-------------|
| DB read (ideas) | Prisma Client | `@prisma/client` via `/api/ideas` | Queries ideas with coordinates, category, district, status, counts |
| DB read (stats) | Prisma Client | `@prisma/client` via `/api/stats` | Aggregates totals and recent ideas |
| DB read (voting config) | Prisma Client | `@prisma/client` via `/api/voting-config` | Reads voting period, computes `isOpen` |
| Tile server (read-only) | HTTP GET | OpenStreetMap CDN | Map tiles fetched by Leaflet. No API key |
| Font delivery (build-time) | `next/font/google` | Next.js build | Playfair Display + Inter downloaded at build, self-hosted |

## Wave: DESIGN / [REF] Technology Choices

| Technology | Version | Rationale |
|------------|---------|-----------|
| `motion` | `^12.23.0` | Canonical v12+ package. Import from `motion/react`. Matches cp-example. ~18KB gzipped |
| `next/font/google` (Playfair_Display) | built-in | Self-hosted, auto-subset, `font-display: swap`, zero CLS. Weights: 400, 700. Styles: normal, italic |
| `next/font/google` (Inter) | built-in | Replaces Geist Sans. Matches cp-example editorial body font. Weights: 400-800 |
| `lucide-react` | `^0.546.0` | ThumbsUp, MessageSquare, Send icons (matches cp-example) |
| `react-leaflet` | `^5.0.0` (existing) | No upgrade per CLAUDE.md. Extended markerIcon works with v5 API |
| `tailwindcss` | `^4` (existing) | ring-8, animate-pulse available natively in v4 |

## Wave: DESIGN / [REF] Reuse Analysis

| Existing Component | Overlap With | Decision | Justification |
|--------------------|-------------|----------|---------------|
| `IdeaCard` | US-4 editorial cards | CREATE NEW | Different structure: no image, no border, neighborhood+dot+status line. Variant would double conditionals |
| `map-view.tsx` `markerIcon()` | US-6 animated pins | EXTEND | Already uses `L.divIcon`. Extend signature + HTML template. Same function, richer output |
| `map-loader.tsx` | US-1 map panel | EXTEND | Change placeholder height to `h-full` for flex container |
| `Badge` (`src/components/ui/badge.tsx`) | US-4 status badge | REUSE | Has all variants. EditorialIdeaCard imports directly |
| `status.ts` `statusToBadgeVariant` | US-4 status badge | REUSE | Maps status → BadgeVariant. No change |
| `globals.css` theme variables | US-1, US-3 colors | EXTEND | Add `--font-serif`, `--font-sans`, selection styles |
| `layout.tsx` font loading | US-3 typography | EXTEND | Add Playfair_Display + Inter via `next/font/google`. Wire CSS vars |
| `page.tsx` data fetch pattern | US-5, US-7 | EXTEND | Add ideas + voting-config fetches. Pass data as props |

## Wave: DESIGN / [REF] Open Questions

| # | Question | Why Deferred | Resolution Path |
|---|----------|-------------|-----------------|
| OQ-1 | Remove Geist Sans or keep as fallback? | Low-risk cosmetic. Removal saves ~15KB but may affect other pages | During GREEN: audit `font-sans` references. If none outside homepage, remove |
| OQ-2 | How many recent ideas in sidebar? | Content decision, not architectural | DISTILL: confirm with PO. Default: keep 5, scrollable |
| OQ-3 | Pulse on ALL pins or only active ones? | Interaction design nuance | DELIVER: pulse on IN_PROGRESS + SELECTED. Static ring-8 on others |
| OQ-4 | LIVE badge pulse + `prefers-reduced-motion`? | Accessibility detail | GREEN: add `motion-reduce:animate-none` |
| OQ-5 | Map overlay from cp-example | Not in any user story | Future feature if requested |
| OQ-6 | LIVE badge locale key values | Translation needs RO/HU/EN | GREEN: `"liveBadge": "LIVE"` in all three (universal signal word) |

## Wave: DESIGN / [REF] C4 System Context

```mermaid
C4Context
  title System Context — ClujParticipa Editorial Homepage
  Person(visitor, "Visitor", "Curious citizen browsing civic ideas")
  System(cluj, "ClujParticipa", "Civic participation platform with editorial homepage")
  System_Ext(osm, "OpenStreetMap", "Tile server for Leaflet map rendering")
  Rel(visitor, cluj, "Browses ideas and map via")
  Rel(cluj, osm, "Fetches map tiles from")
```

## Wave: DESIGN / [REF] C4 Container

```mermaid
C4Container
  title Container Diagram — Editorial Homepage
  Person(visitor, "Visitor", "Curious citizen")
  Container(browser, "Browser Client", "Next.js App Router + React 19", "Renders editorial homepage with split layout, animated cards, and Leaflet map")
  Container(api, "API Routes", "Next.js Route Handlers", "Serves idea, stats, and voting-config JSON")
  ContainerDb(db, "PostgreSQL", "Prisma ORM", "Stores ideas, votes, comments, voting config")
  System_Ext(osm, "OpenStreetMap CDN", "Provides raster map tiles")
  Rel(visitor, browser, "Loads homepage in")
  Rel(browser, api, "Fetches ideas, stats, voting-config from")
  Rel(browser, osm, "Requests map tiles from")
  Rel(api, db, "Queries data via")
```

## Wave: DESIGN / [REF] C4 Component — Homepage

```mermaid
C4Component
  title Component Diagram — Homepage Browser Container
  Component(page, "HomepagePage", "React Client Component", "Orchestrates split layout, fetches data, renders sidebar + map")
  Component(sidebar, "Sidebar Section", "Flex Column", "400px left panel: heading + LIVE badge + scrollable cards + CTA")
  Component(mapPanel, "Map Panel", "Flex Column", "flex-1 right panel: MapLoader with editorial styling")
  Component(card, "EditorialIdeaCard", "React Client Component", "Neighborhood color + status + serif title + counts; stagger entrance")
  Component(liveBadge, "LiveBadge", "React Presentational", "Pulsing LIVE indicator, conditionally visible")
  Component(cta, "SidebarCta", "React Client Component", "Full-width dark submit button, mt-auto positioned")
  Component(mapLoader, "MapLoader", "React Dynamic Import", "SSR-disabled wrapper for MapView")
  Component(mapView, "MapView", "React Client Component", "Leaflet map with custom divIcon markers, ring-8 + pulse")
  Rel(page, sidebar, "Renders")
  Rel(page, mapPanel, "Renders")
  Rel(sidebar, card, "Renders list of")
  Rel(sidebar, liveBadge, "Renders")
  Rel(sidebar, cta, "Renders")
  Rel(mapPanel, mapLoader, "Renders")
  Rel(mapLoader, mapView, "Dynamically imports")
```

---

## Wave: DESIGN / [REF] Pipeline Redesign DDD List

| D# | Decision | Verdict | Rationale |
|----|----------|---------|-----------|
| D11 | Pipeline visual metaphor: disconnected dots vs solid track with markers | Solid track with circular markers (Option A) | Package-tracking mental model: a single horizontal bar anchors the stages, colored for reached and gray for future. Markers are circles ON the bar. Labels above/below. Disconnected dots lose the "journey" continuity |
| D12 | Animation scope: entrance vs transition | Entrance only | Track fills left-to-right on mount, markers fade in sequentially. No animation on status change between renders. Simpler, fewer edge cases, no flash-of-old-state on rehydration |
| D13 | Mobile pipeline layout | Vertical (existing behavior preserved) | Desktop: horizontal track. Mobile: vertical track. Same visual metaphor rotated. MiniPipeline on cards stays horizontal with 3 milestones |
| D14 | Data layer: keep `PipelineStage` and `computePipelineStages()` unchanged | UNCHANGED | Visual redesign only. Data contract is stable. No new domain logic needed |
| D15 | `IdeaPipelineStage` replacement | REPLACE with `PipelineTrackSegment` | Current stage is a disconnected circle+label. New metaphor requires each stage to render a track segment (bar fill) plus a circular marker ON the bar plus a label. Different DOM structure, not extendable |
| D16 | `IdeaPipeline` replacement | REPLACE with `PipelineTrack` | Current component renders disconnected dots with connector lines. New component renders a single continuous track bar with markers. Different composition model. `stalledLabel`/`stalledDays` props remain unchanged |
| D17 | `MiniPipeline` redesign | REPLACE with `MiniPipelineTrack` | Same solid-track metaphor applied to 3-milestone compact view. Current disconnected dots+connectors become a thin colored bar with 3 circular markers. Same milestone grouping logic (ADR-003) |
| D18 | Stalled indicator placement | Keep below pipeline, widen to full track width | Current `StalledIndicator` sits below the pipeline with `mt-1`. Under the new track metaphor, the amber stalled bar should span the full track width for visual alignment with the track above. No logic change |
| D19 | Exception state placement | Keep below pipeline (unchanged) | `ExceptionState` component renders below the pipeline on the detail page. The track redesign does not affect its layout or props |
| D20 | Entrance animation library | `motion` v12 (already in project per D03) | Track fill: `motion.div` with `initial={{ scaleX: 0 }}` `animate={{ scaleX: 1 }}` `transform-origin: left`. Markers: staggered fade. `prefers-reduced-motion` handled by motion's built-in support |
| D21 | Track color mapping | Reuse existing `STAGE_MARKER_COLORS` mapping | The same civic color tokens (`civic-orange`, `civic-blue`, `purple-700`, `civic-teal`) apply to the track fill segments. No new color tokens |
| D22 | Rejected-stage track rendering | Red segment at point of rejection, then gray | For REJECTED ideas, the track fills to the last forward stage reached (via `resolveEffectiveStatus`), then renders a red marker at the rejection point. Track beyond rejection point is gray. Same data as current, different visual |

## Wave: DESIGN / [REF] Pipeline Redesign Component Decomposition

| Component | Path | Change | Description |
|-----------|------|--------|-------------|
| PipelineTrack | `src/components/ideas/pipeline-track.tsx` | CREATE | Solid horizontal bar with circular markers. Entrance animation (left-to-right fill, staggered marker fade). Consumes `PipelineStage[]` + `exceptionState` + `stalledLabel`/`stalledDays`. Renders vertical on mobile |
| PipelineTrackSegment | `src/components/ideas/pipeline-track-segment.tsx` | CREATE | Single stage within PipelineTrack: colored track bar segment + circular marker ON the bar + label. Handles reached/current/future/rejected states |
| MiniPipelineTrack | `src/components/ideas/mini-pipeline-track.tsx` | CREATE | Compact 3-milestone track for idea cards. Same solid-bar metaphor with 3 markers. Same milestone grouping as ADR-003. Horizontal always (used in cards) |
| IdeaPipeline | `src/components/ideas/idea-pipeline.tsx` | REPLACE | Deleted. PipelineTrack takes over. Props contract preserved (`stages`, `exceptionState`, `stalledLabel`, `stalledDays`, `isMobile`) |
| IdeaPipelineStage | `src/components/ideas/idea-pipeline-stage.tsx` | REPLACE | Deleted. PipelineTrackSegment takes over. `STAGE_MARKER_COLORS` constant moves to PipelineTrackSegment |
| MiniPipeline | `src/components/ideas/mini-pipeline.tsx` | REPLACE | Deleted. MiniPipelineTrack takes over. Milestone grouping logic and `MILESTONES` constant move to MiniPipelineTrack |
| StalledIndicator | `src/components/ideas/stalled-indicator.tsx` | EXTEND | Add `fullWidth` prop (default false). When true, spans track width. Wire from PipelineTrack with `fullWidth=true` |
| ExceptionState | `src/components/ideas/exception-state.tsx` | UNCHANGED | No changes needed. Placement below pipeline unaffected |
| Idea detail page | `src/app/[locale]/ideas/[id]/page.tsx` | EXTEND | Replace `IdeaPipeline` import with `PipelineTrack`. Same props. No logic change |
| IdeaCard | `src/components/ideas/idea-card.tsx` | EXTEND | Replace `MiniPipeline` import with `MiniPipelineTrack`. Same `currentStatus` prop |
| IdeaListRow | `src/components/ideas/idea-list-row.tsx` | EXTEND | Replace `MiniPipeline` import with `MiniPipelineTrack`. Same `currentStatus` prop |
| Locale files | `src/i18n/messages/{ro,en,hu}.json` | EXTEND | No new keys needed. Existing `Pipeline.*`, `MiniPipeline.*`, `Stalled.*`, `Exception.*` reused as-is |

## Wave: DESIGN / [REF] Pipeline Redesign Driving Ports

| Port | Type | Consumer | Description |
|------|------|----------|-------------|
| `PipelineStage[]` (data) | In-memory (typed array) | PipelineTrack | Consumes `computePipelineStages()` output. No API call. Data contract unchanged |
| `Status` enum value | In-memory (typed string) | MiniPipelineTrack | Consumes `currentStatus` prop. Same as current MiniPipeline |
| `exceptionState` (optional) | In-memory (string literal union) | PipelineTrack | "REJECTED" / "MERGED" / "RETURNED" / "STALLED". Same prop as current IdeaPipeline |
| `stalledLabel` + `stalledDays` | In-memory (string + number) | PipelineTrack -> StalledIndicator | Passed through to StalledIndicator. Same props as current |
| `isMobile` (boolean) | In-memory | PipelineTrack | Switches between horizontal (desktop) and vertical (mobile) track rendering |

## Wave: DESIGN / [REF] Pipeline Redesign Driven Ports + Adapters

| Port | Adapter | Technology | Description |
|------|---------|------------|-------------|
| Stage color lookup | `STAGE_MARKER_COLORS` constant | Hardcoded map in PipelineTrackSegment | Maps `Status` -> Tailwind bg class. Same mapping as current `idea-pipeline-stage.tsx`. No external dependency |
| Milestone grouping | `MILESTONES` constant + `getStageIndex()` | Pure functions in MiniPipelineTrack | Same logic as current `mini-pipeline.tsx`. Imports `getStageIndex` from `pipeline-stages.ts` |
| i18n labels | `next-intl` `useTranslations()` | `useTranslations("Statuses")`, `useTranslations("MiniPipeline")`, `useTranslations("Pipeline")` | Same translation namespaces as current. No new keys |
| Entrance animation | `motion` v12 | `motion/react` `motion.div` | Track fill animation + staggered marker fade. Already in project per D03/ADR-001 |

## Wave: DESIGN / [REF] Pipeline Redesign Technology Choices

| Technology | Version | Rationale |
|------------|---------|-----------|
| `motion` | `^12.38.0` (existing, per D03) | Track fill: `motion.div` with `scaleX` transform. Marker stagger: `motion.div` with delay. Already installed. No new dependency |
| `tailwindcss` | `^4` (existing) | Track bar via `h-2 bg-gray-200` (base) + colored overlay via `h-2` with civic colors. Markers via `h-4 w-4 rounded-full`. No new utilities needed |
| `next-intl` | existing | `useTranslations("Statuses")`, `useTranslations("MiniPipeline")`, `useTranslations("Pipeline")`. Same namespaces as current |
| `pipeline-stages.ts` | existing (UNCHANGED) | `PIPELINE_STAGES`, `getStageIndex()`, `isStageReached()`, `isCurrentStage()`. Zero modifications per D14 |
| `pipeline-computation.ts` | existing (UNCHANGED) | `computePipelineStages()`, `resolveExceptionType()`, `findRejectionChange()`. Zero modifications per D14 |

## Wave: DESIGN / [REF] Pipeline Redesign Decisions Table

| D# | Decision | Verdict | Key Trade-off |
|----|----------|---------|---------------|
| D11 | Solid track with circular markers | Option A chosen | +Journey continuity, +Package-tracking match, -More DOM elements per stage vs disconnected dots |
| D12 | Entrance animation only | No transition animation on status change | +Simpler rehydration, +No flash-of-old-state, -Status change feels "static" between renders (acceptable: page re-fetches data) |
| D13 | Mobile: vertical track | Preserved existing behavior | +No layout regression, -Vertical track with markers needs different label positioning (above/below flipped) |
| D14 | Data layer unchanged | `PipelineStage` + `computePipelineStages()` untouched | +Zero risk to domain logic, -New visual code must consume existing data shape exactly |
| D15 | Replace IdeaPipelineStage | New PipelineTrackSegment | +Clean DOM for track metaphor, -Must migrate `STAGE_MARKER_COLORS` constant |
| D16 | Replace IdeaPipeline | New PipelineTrack | +Single track bar renders naturally, -Consumer swap (detail page import change) |
| D17 | Replace MiniPipeline | New MiniPipelineTrack | +Visual consistency with full pipeline, -Must migrate `MILESTONES` constant |
| D18 | StalledIndicator width | Extend with `fullWidth` prop | +Visual alignment with track, -Minor prop addition to existing component |
| D19 | ExceptionState placement | Unchanged | +No regression risk, -Does not gain track-style visual (acceptable: exception is a distinct state, not a pipeline stage) |
| D20 | Motion for entrance | `motion` v12 (existing) | +No new deps, +`prefers-reduced-motion` free, -~1KB added to pipeline bundle |
| D21 | Track colors | Reuse existing civic tokens | +Consistent with Badge/MapView, +No new design tokens, -None |
| D22 | Rejected track rendering | Red marker at rejection point, gray beyond | +Shows progress before rejection, +Uses existing `resolveEffectiveStatus`, -Two-color track slightly more complex render |

## Wave: DESIGN / [REF] Pipeline Redesign Reuse Analysis

| Existing Component | Overlap With | Decision | Justification |
|--------------------|-------------|----------|---------------|
| `IdeaPipeline` (`idea-pipeline.tsx`) | PipelineTrack | REPLACE | Different DOM structure (disconnected dots vs continuous bar). Same props preserved. Old file deleted |
| `IdeaPipelineStage` (`idea-pipeline-stage.tsx`) | PipelineTrackSegment | REPLACE | Different DOM structure (circle+label vs track-segment+marker+label). `STAGE_MARKER_COLORS` constant migrates. Old file deleted |
| `MiniPipeline` (`mini-pipeline.tsx`) | MiniPipelineTrack | REPLACE | Different DOM structure (dots+connectors vs track+markers). `MILESTONES` constant + milestone logic migrates. Old file deleted |
| `StalledIndicator` (`stalled-indicator.tsx`) | PipelineTrack integration | EXTEND | Add `fullWidth` prop. Core logic unchanged. Same file, minor addition |
| `ExceptionState` (`exception-state.tsx`) | PipelineTrack integration | REUSE (unchanged) | Placement below pipeline unaffected. No code changes |
| `pipeline-stages.ts` | Data layer | REUSE (unchanged) | `PIPELINE_STAGES`, `getStageIndex()` consumed by new components. Per D14 |
| `pipeline-computation.ts` | Data layer | REUSE (unchanged) | `computePipelineStages()` output feeds PipelineTrack. Per D14 |
| `stalled-detector.ts` | StalledIndicator data | REUSE (unchanged) | Same `StalledInfo` shape. Per D18, only the visual width changes |
| `status.ts` + `statusToBadgeVariant` | Card badges | REUSE (unchanged) | IdeaCard and IdeaListRow badges unaffected. Only pipeline import changes |
| `Badge` (`ui/badge.tsx`) | Card badges | REUSE (unchanged) | Unrelated to pipeline track. No changes |

## Wave: DESIGN / [REF] Pipeline Redesign Open Questions

| # | Question | Why Deferred | Resolution Path |
|---|----------|-------------|-----------------|
| OQ-7 | Track bar thickness: `h-2` or `h-1.5`? | Visual polish, not architectural | GREEN: `h-2` default, adjust if markers (h-4) look disproportionate |
| OQ-8 | Vertical track label position: alternate left/right or all one side? | Interaction design detail for mobile | GREEN: all labels on the right of the vertical track (simpler). Evaluate during review |
| OQ-9 | Track fill animation duration | Animation polish | GREEN: 0.6s for fill, 0.05s stagger between markers. Tune visually |
| OQ-10 | MiniPipelineTrack marker size on cards | Sizing detail | GREEN: same h-2.5 w-2.5 as current MiniPipeline dots. Track bar h-1 |
| OQ-11 | Should old test files be deleted alongside old components? | Test maintenance, not architecture | GREEN: delete `idea-pipeline.test.tsx`, `idea-pipeline-stage.test.tsx`, `mini-pipeline.test.tsx`. Write new tests for PipelineTrack, PipelineTrackSegment, MiniPipelineTrack |

## Wave: DESIGN / [REF] C4 Component — Pipeline Subsystem

```mermaid
C4Component
  title Component Diagram — Pipeline Visual Subsystem
  Component(detailPage, "Idea Detail Page", "React Client Component", "Fetches idea data, computes stages, renders PipelineTrack + ExceptionState")
  Component(pipelineTrack, "PipelineTrack", "React Client Component", "Solid horizontal bar with circular markers. Entrance animation. Consumes PipelineStage[]. Vertical on mobile")
  Component(trackSegment, "PipelineTrackSegment", "React Client Component", "Single stage: colored track segment + circular marker ON bar + label. Handles reached/current/future/rejected")
  Component(stalled, "StalledIndicator", "React Presentational", "Amber stalled text. fullWidth prop aligns to track width")
  Component(exception, "ExceptionState", "React Client Component", "REJECTED/MERGED/RETURNED card. Unchanged")
  Component(miniTrack, "MiniPipelineTrack", "React Client Component", "Compact 3-milestone track for idea cards. Horizontal always. Same milestone grouping as ADR-003")
  Component(card, "IdeaCard / IdeaListRow", "React Client Component", "Card components rendering MiniPipelineTrack for status indication")
  Component(dataLayer, "pipeline-computation.ts", "Pure Functions", "computePipelineStages(), resolveExceptionType(). UNCHANGED")
  Component(stageOrder, "pipeline-stages.ts", "Pure Functions", "PIPELINE_STAGES, getStageIndex(). UNCHANGED")
  Rel(detailPage, pipelineTrack, "Renders")
  Rel(detailPage, exception, "Renders")
  Rel(pipelineTrack, trackSegment, "Renders list of")
  Rel(pipelineTrack, stalled, "Renders")
  Rel(card, miniTrack, "Renders")
  Rel(pipelineTrack, dataLayer, "Consumes PipelineStage[] from")
  Rel(pipelineTrack, stageOrder, "Consumes getStageIndex from")
  Rel(miniTrack, stageOrder, "Consumes getStageIndex from")
```

## Wave: DESIGN / [REF] Pipeline Redesign AC Mapping

The following acceptance criteria describe WHAT (behavior), never HOW (implementation):

**PipelineTrack (full pipeline)**:
- AC-P1: Track renders as a single continuous bar with 7 stage markers positioned on the bar
- AC-P2: Reached stages show colored track segment (civic-orange/blue/purple/teal per status) and filled colored marker
- AC-P3: Current stage marker shows a pulse ring animation
- AC-P4: Future stages show gray track segment and gray-outlined marker
- AC-P5: Stage labels appear above (odd) and below (even) the track on desktop; all on one side on vertical mobile
- AC-P6: On mount, the track fills left-to-right and markers fade in sequentially
- AC-P7: Animation respects `prefers-reduced-motion`
- AC-P8: For REJECTED ideas, track fills to last forward stage reached, then a red marker appears; track beyond is gray
- AC-P9: StalledIndicator renders below the track, spanning the full track width
- AC-P10: ExceptionState renders below the stalled indicator (when applicable), unchanged
- AC-P11: On mobile (`isMobile=true`), track renders vertically with markers along a vertical bar
- AC-P12: All visible strings from locale files (`Statuses.*` namespace)
- AC-P13: `computePipelineStages()` and `pipeline-stages.ts` remain unchanged

**MiniPipelineTrack (card pipeline)**:
- AC-M1: Renders a thin horizontal bar with 3 circular milestone markers
- AC-M2: Reached milestones show colored marker; current milestone marker pulses
- AC-M3: Future milestones show gray marker with gray-outlined ring
- AC-M4: Milestone labels appear below markers
- AC-M5: REJECTED ideas render no mini-pipeline track (return empty)
- AC-M6: Same 3-milestone grouping as ADR-003 (Submitted / In Voting / Completed)
- AC-M7: All visible strings from locale files (`MiniPipeline.*` namespace)
