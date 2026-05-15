# Brainstorming — clujparticipa-redesign

## HMW Question

**How might we make a resident's journey from idea to visible impact feel as trackable and trustworthy as tracking a package delivery?**

This reframing comes from the competitive research finding: package tracking is the most successful "visible tracking" UX pattern ever designed. The endowed progress effect (Nunes & Dreze 2006) confirms that framing submission as step 1 of a journey increases persistence.

## SCAMPER Options

### S — Substitute: Pipeline Tracker

**Core idea**: Replace the current idea-status badge system with a visual pipeline (like package tracking) where each idea shows discrete stages: Submitted → Under Review → Feasible → In Voting → Selected → In Progress → Completed, with timestamps and responsible party at each stage.

**Key mechanism**: Linear pipeline visualization with endowed progress — the act of submitting is framed as step 1 of N, not a dead-end form. Each stage transition triggers a notification.

**Key assumption**: Residents will trust a pipeline if each stage has a responsible party and timestamp — transparency replaces trust.

**SCAMPER origin**: S (Substitute — replace status badges with pipeline)

**Closest competitor**: Delivery package tracking + FixMyStreet's "fixed" status

---

### C — Combine: Civic + Neighborhood Social Layer

**Core idea**: Merge the idea submission platform with a neighborhood social layer where residents can follow their district's feed, see what neighbors are proposing, and get notified when something nearby changes — like a hyperlocal Nextdoor but purpose-built for civic improvement.

**Key mechanism**: District as the primary organizing principle. Feed-based UX with idea cards, map pins, and community verification (neighbors confirm/reject reports, Waze-style).

**Key assumption**: Social proof from neighbors increases legitimacy more than institutional branding — people trust people they see locally.

**SCAMPER origin**: C (Combine — merge civic participation with neighborhood social)

**Closest competitor**: Nextdoor + FixMyStreet hybrid

---

### A — Adapt: Parliamentary Record Model

**Core idea**: Adapt the parliamentary record (Hansard) model — every action on an idea (submission, review, status change, comment, vote) becomes part of a public, immutable timeline. No edits disappear. The full history is the core feature, not a sidebar.

**Key mechanism**: Immutable audit trail as the primary UX — the timeline IS the interface. Residents scroll through chronological events, each attributed to a role (resident, reviewer, admin, system). Think GitHub commit log for civic ideas.

**Key assumption**: Radical transparency (even showing negative outcomes) builds more trust than polished success stories — residents need to see the process, warts and all.

**SCAMPER origin**: A (Adapt — borrow parliamentary record model)

**Closest competitor**: Decidim's accountability component + GitHub commit history

---

### M — Magnify: Impact Showcase

**Core idea**: Amplify the "Demonstrated Impact" end of the pipeline to be the homepage hero. Instead of leading with "submit your idea", lead with "here's what your neighbors achieved" — completed projects with before/after photos, budgets, timelines, and the number of residents who supported them.

**Key mechanism**: Reverse funnel UX — impact first, submission second. The homepage is a gallery of completed improvements, each linking back to the original idea and the residents who made it happen.

**Key assumption**: Seeing completed projects is the strongest motivator for new participation — proof of impact beats calls to action.

**SCAMPER origin**: M (Magnify — amplify demonstrated impact)

**Closest competitor**: Kickstarter's "Projects We Love" section + Better Reykjavik's longitudinal record

---

### P — Put to Other Use: Civic Data API Platform

**Core idea**: Reframe the platform as primarily an open data API that any local organization, journalist, or developer can build on. The web UI is one consumer of the API. Others include: local news sites embedding idea trackers, university researchers analyzing participation patterns, NGOs building advocacy tools.

**Key mechanism**: API-first architecture where the web app is a reference implementation. Open data exports, embeddable widgets, RSS feeds. The platform's credibility comes from its data being used by trusted third parties.

**Key assumption**: Institutional trust is too low for a single platform to be credible — but if multiple trusted organizations reference the same data source, collective credibility emerges.

**SCAMPER origin**: P (Put to Other Use — serve journalists, NGOs, researchers)

**Closest competitor**: CKAN (open data platform) + Pol.is data exports

---

### E — Eliminate: Zero-Friction Reporter

**Core idea**: Eliminate the idea detail page entirely. Residents report problems via a single map tap (location) + one sentence (description) + optional photo. No categories, no status tracking, no comments. The map IS the interface — pins cluster by density, showing where problems concentrate. City staff triage from the backend.

**Key mechanism**: Extreme reduction of submission friction. The map shows problem density as a heat map. Residents see their pin appear instantly. Weekly digest shows aggregate progress ("47 reports in Manastur this month, 12 addressed").

**Key assumption**: The biggest barrier to participation is form complexity — a single tap that immediately shows on the map will generate 10x more inputs than a detailed form.

**SCAMPER origin**: E (Eliminate — remove everything except location + description)

**Closest competitor**: Waze (report-only UX) + SeeClickFix

---

### R — Reverse: City Reports to Residents

**Core idea**: Reverse the workflow — instead of residents submitting and waiting, the city publishes what it's working on and residents confirm/redirect. The city posts planned projects, budgets, and timelines; residents verify that these match neighborhood priorities, suggest modifications, and flag conflicts.

**Key mechanism**: Top-down transparency as the starting point. The city's project pipeline is the public record. Residents don't submit into the void — they respond to concrete plans with concrete feedback.

**Key assumption**: In a low-trust environment, residents engaging with real plans (even imperfect ones) produces better outcomes than residents submitting ideas that may never be acknowledged.

**SCAMPER origin**: R (Reverse — city speaks first, residents respond)

**Closest competitor**: Vantaa Osallistuva's proposal-based voting + EU public consultation portals

---

## Crazy 8s Supplements

### Option 8: Gamified Civic Quests

**Core idea**: Frame participation as neighborhood quests — "3 ideas needed for your district to unlock the next voting round", "Verify 5 reports to earn Trusted Reporter status". Progress bars, badges, district leaderboards.

**Key mechanism**: Game mechanics (progress bars, social proof, scarcity) applied to civic engagement. Each district competes. Milestones unlock real city attention (guaranteed review after X ideas).

**Key assumption**: Intrinsic motivation for civic engagement is insufficient — extrinsic rewards (status, recognition, competition) are needed to bootstrap participation in a low-trust context.

**Closest competitor**: Duolingo streaks + Foursquare mayorships

---

### Option 9: WhatsApp-First Civic Bot

**Core idea**: No web app at all — the entire platform runs via WhatsApp Business API. Residents message a number, answer 3 questions (location, problem, photo), and receive status updates as chat messages. The web app exists only as an admin dashboard and public results page.

**Key mechanism**: Meet residents where they already are (WhatsApp penetration in Romania is ~85%). No app to install, no website to navigate. Conversational UI with location sharing.

**Key assumption**: The web platform is a barrier — residents who would never visit a civic website will message a number if it's shared in their neighborhood WhatsApp group.

**Closest competitor**: Government chatbot services (Estonia's e-Residency bot, India's MyGov WhatsApp integration)

---

## Curated 6 — Diversity Test

| # | Option | Different mechanism? | Different assumption? | Different cost? |
|---|--------|---------------------|---------------------|-----------------|
| 1 | Pipeline Tracker | Visual pipeline + notifications | Transparency replaces trust | Medium (UX redesign) |
| 2 | Civic + Neighborhood Social | District feed + social proof | Social proof > institutional branding | High (new social layer) |
| 3 | Parliamentary Record | Immutable audit timeline | Radical transparency > polish | Medium (data model change) |
| 4 | Impact Showcase | Impact-first reverse funnel | Proof of impact > calls to action | Medium (content collection) |
| 5 | Zero-Friction Reporter | Map-tap + heat map | Friction is the #1 barrier | Low (simplification) |
| 6 | WhatsApp-First Bot | Chat-based, no web app | Web is a barrier in RO | High (new channel) |

**Eliminated**: Civic Data API (mechanism overlaps with Parliamentary Record's transparency — kept the stronger representative), Gamified Civic Quests (assumption about extrinsic motivation is weakest and most contested in civic tech literature), City Reports to Residents (requires city partnership that doesn't exist yet — validates poorly against O2 "engagement not ignored" since the city must initiate).

All 6 pass the 3-point diversity test.
