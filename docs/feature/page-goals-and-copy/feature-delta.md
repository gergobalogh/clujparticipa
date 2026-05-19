# Feature Delta — page-goals-and-copy

## Wave: DISCUSS / [REF] Persona ID

**Ion** — Curious Newcomer, Gheorgheni, low-moderate tech comfort. Skeptical, needs proof of impact before participating. 30-second attention window on homepage. Prefers Hungarian.

**Maria** — Engaged Resident, Manastur, moderate tech comfort. Submits ideas and tracks them. Mental model: package tracker. Needs next-step reassurance after submission.

## Wave: DISCUSS / [REF] JTBD One-liner

When I land on the civic platform, I want to understand what it does, that it's alive, and what I can do — within 10 seconds — so I can decide whether to stay and participate or leave. (J-HOME, critically-under-served, score 54)

## Wave: DISCUSS / [REF] Locked Decisions

- [D1] Scope: Copy-only changes across 7 high-opportunity pages. No component, API, or schema changes.
- [D2] Top 3 opportunities: J-HOME (54), J-SUBMIT (45), J-RESULTS (28) — these drive the user stories.
- [D3] UX depth: Comprehensive — page-by-page journey with goals, audience, tone, CTA, emotional arc for all 14 pages.
- [D4] No walking skeleton — brownfield, additive copy improvements.
- [D5] Admin, Terms, Bug Report, Data Deletion, Unsubscribe: out of scope.
- [D6] Copy principles: show-don't-tell, one-CTA-per-page, earn-the-scroll, civic-not-startup, trilingual-consistency, prototype-honesty, trust-through-transparency.

## Wave: DISCUSS / [REF] User Stories

| ID | Story | Elevator Pitch (After) | Slices |
|---|---|---|---|
| US-1 | Homepage copy reframe | load homepage → sees short action-oriented headline, activity proof, and prominent "Submit your idea" CTA | S1 |
| US-2 | Submit page emotional framing | open submission page → sees encouraging headline, conversational labels, and success message with next-step reassurance | S2 |
| US-3 | Idea detail micro-copy guide | view idea detail → sees section headings that explain their purpose ("What the community says", "How this idea has progressed") | S3 |
| US-4 | How It Works trust amplification | visit How It Works → sees completed ideas count near top and terminal state copy that acknowledges emotional weight | S4 |
| US-5 | Results page impact framing | visit results → sees "Here's what the community chose" framing with voting period context | S5 |
| US-6 | Login page benefit-first reframe | land on login → sees ≤15-word benefit-first subtitle and privacy reassurance near buttons | S6 |
| US-7 | Privacy page scannability | open privacy page → sees 2-3 sentence summary before detailed sections | S7 |

### US-1: Homepage Copy Reframe

**As a** first-time visitor **I want to** understand what ClujParticipa is, that it's active, and what I can do — within 10 seconds **So that** I decide to stay and participate

**Job**: J-HOME (Scanner), J-HOME-RETURN (Returner)

#### Elevator Pitch
Before: I land on the homepage and see a feature description but can't quickly tell if the platform is alive or what to do first
After: load the homepage → sees a short action-oriented headline, activity proof (stats strip, idea feed), and a single prominent "Submit your idea" CTA
Decision enabled: I can immediately decide whether to browse ideas, explore the map, or submit one

**ACs**:
- Homepage description is ≤20 words and action-first
- "Participatory Budgeting" eyebrow uses locale-appropriate term (RO: "Bugetare Participativă")
- Stats strip shows at least total ideas + completed ideas
- Idea feed heading has LIVE badge (preserve existing)
- Primary CTA "Submit your idea" is visually prominent (preserve existing SidebarCta)
- Empty state copy is actionable
- All copy in RO, HU, EN locale files
- No hardcoded user-facing strings

### US-2: Submit Page Emotional Framing

**As a** resident with a neighborhood problem **I want to** feel that submitting my idea matters **So that** I overcome submission anxiety and complete the form

**Job**: J-SUBMIT (Proposer)

#### Elevator Pitch
Before: I see a form titled "Submit an idea" — it feels like filling out a government form
After: open the submission page → sees an encouraging headline, conversational labels, and a success message that tells me what happens next
Decision enabled: I submit my idea because I understand it enters a real process, not a void

**ACs**:
- Page title is action-first and encouraging
- Description frames the form as civic action
- Location hint is personal ("Pin the spot where the idea applies")
- Success message includes next-step reassurance with pipeline reference
- Success state links to idea detail and How It Works
- All copy in RO, HU, EN locale files

### US-3: Idea Detail Micro-Copy Guide

**As a** visitor viewing an idea **I want to** understand each section's purpose from its heading **So that** I know why I should read it

**Job**: J-DETAIL (Deep-Diver)

#### Elevator Pitch
Before: I see bare section headings ("Comments", "Status History", "Location") that don't tell me why I should care
After: view an idea detail page → sees section headings that guide my mental model
Decision enabled: I engage with each section knowing its purpose, leading to an informed support decision

**ACs**:
- "Comments" heading is more descriptive
- "Status History" heading is action-oriented
- "Location" heading is descriptive
- Non-binding label unchanged
- All copy in RO, HU, EN locale files

### US-4: How It Works Trust Amplification

**As a** skeptical newcomer **I want to** see evidence that ideas actually get implemented **So that** I believe participating is worth my time

**Job**: J-HOW (Process Learner)

#### Elevator Pitch
Before: I read the pipeline stages but see no proof that ideas reach completion
After: visit How It Works → sees completed ideas count and terminal state copy that acknowledges emotional reality
Decision enabled: I believe the process works because I see real completion numbers

**ACs**:
- Completed ideas count is visible on the page
- Terminal state descriptions acknowledge emotional reality
- CTA preserved, creator credit visually subordinate
- All copy in RO, HU, EN locale files

### US-5: Results Page Impact Framing

**As a** community member **I want to** see voting results framed as community achievement **So that** I feel my participation produced real outcomes

**Job**: J-RESULTS (Outcome Verifier)

#### Elevator Pitch
Before: I see a data table titled "Voting results" — it feels like a spreadsheet
After: visit results → sees "Here's what the community chose" with voting period context
Decision enabled: I confirm my vote mattered and consider sharing results

**ACs**:
- Framing sentence when selected ideas exist
- "Selected ideas" heading is community-oriented
- Empty state includes CTA
- All copy in RO, HU, EN locale files

### US-6: Login Page Benefit-First Reframe

**As a** resident blocked from voting **I want to** understand the benefit of signing in before the technical details **So that** I click through rather than abandon

**Job**: J-AUTH (Identity Connector)

#### Elevator Pitch
Before: I see a 23-word subtitle explaining participant identity plumbing
After: land on login → sees ≤15-word benefit-first subtitle and privacy reassurance near buttons
Decision enabled: I click OAuth because I understand the benefit and feel my data is safe

**ACs**:
- Subtitle is benefit-first, ≤15 words, no jargon
- Technical explanation remains secondary
- Privacy reassurance visible near OAuth buttons
- All copy in RO, HU, EN locale files

### US-7: Privacy Page Scannability

**As a** privacy-concerned visitor **I want to** get a quick summary before reading the detailed sections **So that** I decide to engage without reading walls of text

**Job**: J-PRIVACY (Trust Builder)

#### Elevator Pitch
Before: I see a long privacy page — I have to read everything to understand the basic stance
After: open privacy page → sees a 2-3 sentence summary at the top
Decision enabled: I quickly understand the privacy stance and either proceed or dive deeper

**ACs**:
- 2-3 sentence summary before first section
- Summary covers prototype status, data collection, deletion
- Existing section structure preserved
- All copy in RO, HU, EN locale files

## Wave: DISCUSS / [REF] Acceptance Criteria

Cross-cutting ACs (apply to all stories):
- All changed strings exist in `src/i18n/messages/ro.json`, `hu.json`, and `en.json`
- No hardcoded user-facing strings in any page component
- TypeScript compiles without errors
- `npx next build` succeeds
- Visual verification on all 7 target pages (homepage, submit, idea detail, how-it-works, results, login, privacy)

## Wave: DISCUSS / [REF] Definition of Done

1. All acceptance criteria pass for each story
2. TypeScript compiles without errors
3. `npx next build` succeeds
4. All 3 locale files contain the updated strings
5. No hardcoded user-facing strings
6. Visual verification on all 7 target pages
7. i18n completeness: every changed key exists in RO, HU, EN
8. Existing features preserved: pipeline, LIVE badge, non-binding labels, sidebar CTA
9. No new components or API changes introduced

## Wave: DISCUSS / [REF] Out-of-scope

- Component-level changes (no new components, no JSX structure changes beyond text)
- API endpoint changes
- Database schema changes
- Admin page copy (adequate as-is)
- Terms of Service copy (legal, not strategic)
- Bug Report copy (already friendly)
- Data Deletion copy (already clear)
- Unsubscribe copy (already minimal)
- Map page structural changes (copy only if explicitly requested)
- Ideas list structural changes (copy only if explicitly requested)
- New pages or routes
- A/B testing framework
- Analytics instrumentation (tracked as KPI dependency, not feature work)

## Wave: DISCUSS / [REF] WS Strategy

**Strategy C (Real local)** — No walking skeleton needed. Brownfield feature: all changes are additive copy improvements to existing working pages. Each story is independently deployable as locale file updates. No env-switching needed.

## Wave: DISCUSS / [REF] Driving Ports

| Port | Type | Direction | Consumer |
|------|------|-----------|----------|
| `/` | HTTP GET | Inbound | Homepage renders updated copy |
| `/ideas/new` | HTTP GET | Inbound | Submit page renders updated copy |
| `/ideas/[id]` | HTTP GET | Inbound | Idea detail renders updated section headings |
| `/how-it-works` | HTTP GET | Inbound | How It Works renders completed count + updated terminal copy |
| `/results` | HTTP GET | Inbound | Results page renders impact framing |
| `/login` | HTTP GET | Inbound | Login page renders benefit-first subtitle |
| `/privacy` | HTTP GET | Inbound | Privacy page renders summary |

## Wave: DISCUSS / [REF] Pre-requisites

- Existing locale files (`ro.json`, `hu.json`, `en.json`) with current string keys
- Existing page components rendering locale strings via `useTranslations()`
- Umami analytics (optional — for KPI measurement, not a block)
- `computeCompletedCount()` from `src/lib/home-stats.ts` (for US-4 trust signal on How It Works)

## Wave: DISCUSS / [REF] Copy Principles

1. **Show, don't tell.** Stats, pipeline, activity signals speak louder than paragraphs. Copy points to proof.
2. **One CTA per page.** Every page drives exactly one primary action. Secondary actions are subordinate.
3. **Earn the scroll.** First 10 seconds must answer "what is this?" and "is it alive?".
4. **Civic, not startup.** No growth-hacking language. Direct, respectful, local.
5. **Trilingual consistency.** RO leads. HU and EN follow same tone, not word-for-word. RO uses "tu" (informal).
6. **Prototype honesty.** Non-binding status always visible on participation surfaces. State clearly, move on.
7. **Trust through transparency.** Show the pipeline. Show completed count. Trust comes from visible process.

## Wave: DISCUSS / [REF] Page Goal Summary

| Page | Goal | Primary CTA | Audience | Tone |
|------|------|-----------|----------|------|
| Homepage | Prove it's alive; make them act | Submit your idea | Ion (newcomer) | Confident-quiet |
| Ideas List | Find an idea worth supporting | Click an idea | Maria + Ion | Organized-scannable |
| Idea Detail | Give enough info to support/comment/share | Support this idea | Maria | Informative-empowering |
| Submit Idea | Turn frustration into proposal with reassurance | Submit idea | Maria | Encouraging-direct |
| Map | Show geographic distribution of ideas | Click a pin | Ion | Exploratory-place-connected |
| How It Works | Build trust by showing the real process | Submit your idea | Ion | Motivational-documentary |
| Results | Prove participation produces outcomes | Click a selected idea | Maria + Ion | Celebratory-factual |
| Login | Remove auth barrier with benefit framing | Continue with Google/Facebook | Auth-blocked user | Reassuring-minimal |
| Admin | Manage the platform efficiently | Tab-dependent | Operator | Functional-direct |
| Privacy | Clear the trust obstacle | Return to participation | Skeptical user | Transparent-calm |

## Wave: DISCUSS / [WHY] Persona Narrative

Per-page goals, frustrations, mental models, and vocabulary for each persona. Full narrative at `discuss/persona-narrative.md`.

Key copy implications:
- **Ion**: Headlines should use "propose" not "submit" (warmer). Every page needs completed/active proof. Hungarian translations must feel native. Status labels should answer "is anything happening."
- **Maria**: Success message after submission is the #1 emotional moment. Stalled indicator language matters ("Waiting for" not "Stuck"). Section headings should match package-tracker mental model.
- **Operator**: Cares about whether copy moves metrics, not the specific words. Admin copy is adequate — no changes needed.

| Page | Ion's goal | Maria's goal | Operator's interest |
|------|-----------|-------------|-------------------|
| Homepage | Is this real? | Is it still active? | Bounce rate |
| Submit | Will anyone read this? | I have a problem to report | Completion rate |
| Idea Detail | Has anything been completed? | What's happening with this? | Scroll depth |
| How It Works | Is there a real process? | Show proof, not explanation | CTA conversion |
| Results | Proof it works | Did my support matter? | Click-through rate |
| Login | Why do they need my account? | Make my vote count | OAuth click rate |
| Privacy | What do they do with my data? | Same concern | Exit rate |

## Wave: DISCUSS / [REF] Outcome KPIs

| KPI | Target | Measurement |
|-----|--------|-------------|
| Homepage bounce rate | Decrease 15% | Umami: % leaving without clicking |
| Submission completion rate | Increase 20% | Umami: form start vs. submit events |
| How It Works → submit conversion | ≥10% | Umami: CTA click rate on /how-it-works |
| Auth page click-through rate | Increase 10% | Umami: OAuth button click rate on /login |
| Results page engagement | ≥30% click a selected idea | Umami: click-through on /results |
