# Page Goals & Copy Strategy — page-goals-and-copy

## Overview

Every page has one job: move the visitor one step closer to civic participation. Copy is the mechanism. This document defines the goal, audience, tone, and primary CTA for each page, plus the copy principles that bind them together.

---

## Copy Principles (cross-page)

1. **Show, don't tell.** Stats, live activity, and pipeline visuals speak louder than paragraphs. Copy points attention to the proof, not the claim.
2. **One CTA per page.** Every page drives exactly one primary action. Secondary actions exist but are visually and verbally subordinate.
3. **Earn the scroll.** The first 10 seconds must answer "what is this?" and "is it alive?" Every subsequent section must justify the reader's continued attention.
4. **Civic, not startup.** No "join the movement," no "empower your community," no growth-hacking language. Direct, respectful, local.
5. **Trilingual consistency.** Romanian leads. Hungarian and English follow the same tone and structure, not word-for-word translation. Romanian uses "tu" (informal), not "dumneavoastră" (formal) — this is a civic peer platform, not a government portal.
6. **Prototype honesty.** The non-binding prototype status is always visible on participation surfaces (voting, submission). Never hide it, never apologize for it — state it clearly and move on.
7. **Earn trust through transparency.** Show the pipeline. Show the completed count. Show the status timeline. Trust comes from visible process, not marketing claims.

---

## Page-by-Page Strategy

### 1. Homepage (`/`)

| Dimension | Definition |
|-----------|-----------|
| **Goal** | Prove the platform is alive and make the visitor choose: browse ideas, view the map, or submit one |
| **Primary audience** | Ion (curious newcomer) — 30-second attention window, skeptical, needs proof of legitimacy |
| **Secondary audience** | Maria (engaged resident returning) — needs activity proof that things are moving |
| **Tone** | Confident but quiet. Editorial — like a serious local newspaper, not a tech startup. Serif headings, restrained color, visible borders. "This is your city's civic platform" not "Revolutionize democracy!" |
| **Primary CTA** | **"Submit your idea"** — the action that creates the most engagement and pipeline content |
| **Secondary CTAs** | "View all ideas →", "View full map →", "How it works" |
| **Copy focus** | The eyebrow + title + description must answer three questions in order: (1) What is this? → "Participatory Budgeting / ClujParticipa" (2) What can I do? → "Submit neighborhood ideas, discover them on the map, add support, comment, and follow each idea's progress" (3) Is it alive? → stats strip + LIVE badge on idea feed |
| **Current gaps** | Description is too long and feature-listy. Needs to be shorter and more action-oriented. Eyebrow "Participatory Budgeting" is English-only — should say "Bugetare Participativă" in RO. No emotional hook — just feature description. |
| **Emotional arc** | Curious skepticism → quick recognition ("oh, this is real") → scan activity proof → decide to act |

---

### 2. Ideas List (`/ideas`)

| Dimension | Definition |
|-----------|-----------|
| **Goal** | Help the visitor find an idea worth supporting or commenting on |
| **Primary audience** | Maria (returning to check on ideas) + Ion (browsing to assess legitimacy) |
| **Tone** | Organized and scannable. "Here's what your community proposed" — neutral, letting the ideas speak |
| **Primary CTA** | **Click an idea** to view its detail page (the list row IS the CTA) |
| **Secondary CTAs** | Filter controls, "Load more", "Submit an idea" (if no results) |
| **Copy focus** | Page title and description should frame the list as community output, not a database dump. "Discover and support proposals from the Cluj community" → good, but could be more active: "See what Cluj residents are proposing" |
| **Current gaps** | Description is passive ("Discover and support"). Empty state copy is weak. "No ideas found with these filters" is a dead end — should suggest action ("Try different filters, or submit the first idea in this category"). |
| **Emotional arc** | Scanning → filtering → finding relevance → clicking through |

---

### 3. Idea Detail (`/ideas/[id]`)

| Dimension | Definition |
|-----------|-----------|
| **Goal** | Give the visitor enough information and confidence to support, comment on, or share the idea |
| **Primary audience** | Maria (deciding whether to support) + Ion (checking if participation works) |
| **Tone** | Informative and empowering. Each section has a micro-job: (1) Pipeline → "Here's where this idea stands" (2) Description → "Here's what they're proposing" (3) Feasibility → "Here's what the city says" (4) Comments → "Here's what the community thinks" (5) Vote button → "Now it's your turn" |
| **Primary CTA** | **Support this idea / Vote** — the main participation action |
| **Secondary CTAs** | "Add a comment", "Share" (social sharing), "Learn about the process" |
| **Copy focus** | The page should read like a story with a clear decision point. Pipeline gives context, description gives substance, comments give social proof, and the vote section is the climax. Micro-copy at each section heading should guide the reader's mental model. |
| **Current gaps** | Section headings are bare ("Comments", "Location", "Status History") — they don't tell the reader WHY they should care. "Comments" → "What the community says". "Status History" → "How this idea has progressed". The non-binding label on the vote section is present but visually easy to miss. The "Learn about the process" link is good but reads like documentation. |
| **Emotional arc** | Interest → understanding (pipeline context) → confidence (description + feasibility) → social proof (comments) → decision (support / vote) |

---

### 4. Submit Idea (`/ideas/new`)

| Dimension | Definition |
|-----------|-----------|
| **Goal** | Turn the visitor's neighborhood frustration into a structured proposal — with minimal friction and maximum reassurance |
| **Primary audience** | Maria (has a specific problem to report) + first-time submitters |
| **Tone** | Encouraging and direct. "Your neighborhood needs your voice" — not "Fill out this form." Form labels should feel like questions, not bureaucratic fields. |
| **Primary CTA** | **"Submit idea"** button — the culmination of the form |
| **Secondary CTAs** | "View idea" (after submission), map pin placement |
| **Copy focus** | The page title and description set the emotional frame. "Submit an idea" → too neutral. "Propose an improvement for your neighborhood" → better but still descriptive. The title should be action-first: "Share your idea for Cluj". Form field labels and placeholders should guide, not interrogate. "Summarize your idea in a few words" is good. "Describe the problem and your proposal in detail" is good. The success message after submission is critical — "Idea submitted successfully!" → too flat. Should include reassurance: "Your idea is now in the pipeline. You can track its progress anytime." |
| **Current gaps** | No emotional framing before the form — just title + description. Success state is a flat message. No link to the pipeline explanation from the success state. No "what happens next" reassurance. Location hint is technical ("Click on the map to set the proposal location") — should be personal ("Pin the spot in your neighborhood where the idea applies"). |
| **Emotional arc** | Frustration with neighborhood problem → motivation to act → form filling (confidence builds as fields complete) → submission → relief and validation (success message + pipeline link) |

---

### 5. Map View (`/map`)

| Dimension | Definition |
|-----------|-----------|
| **Goal** | Show the geographic distribution of civic ideas and let the visitor explore by neighborhood |
| **Primary audience** | Ion (wants to see if his area has ideas) + Maria (checking geographic spread) |
| **Tone** | Exploratory and place-connected. "See where your neighbors are taking action" |
| **Primary CTA** | **Click a map pin** to view an idea detail |
| **Secondary CTAs** | Filter by category/status, "View details" in popups |
| **Copy focus** | Page title "Map" is too minimal. Description should connect geography to participation: "Discover proposals across Cluj's neighborhoods. Each pin is an idea from a resident like you." |
| **Current gaps** | Title is just "Map". Description is thin. Empty state "No ideas match the selected filters" is a dead end. |
| **Emotional arc** | Exploring the map → finding local pins → clicking through to ideas |

---

### 6. How It Works (`/how-it-works`)

| Dimension | Definition |
|-----------|-----------|
| **Goal** | Build trust by showing the idea lifecycle — from submission to completion — so the visitor believes participation has a real process behind it |
| **Primary audience** | Ion (needs proof of process before participating) + new visitors who clicked from homepage or idea detail |
| **Tone** | Motivational-documentary. "Here's how your idea travels from a spark to reality" — not a manual, a story. Each stage is a chapter, not a checkbox. |
| **Primary CTA** | **"Submit your idea"** — the page's purpose is to convert understanding into action |
| **Secondary CTAs** | "Browse ideas", stage clicks for navigation |
| **Copy focus** | Title "How It Works" is functional but passive. "How It Works" → could stay (it's a standard nav label) but the subtitle should do the emotional work: "Follow your idea from submission to completion" → already good. Stage descriptions are currently one-liners — they should be slightly more narrative without becoming paragraphs. The completed count is the #1 trust proof but it's not visible on this page. The CTA at the bottom is strong ("Submit your idea") but the creator credit line underneath weakens it — the last thing you see should be the action, not the attribution. |
| **Current gaps** | No completed-ideas count visible (the #1 proof point). Terminal states (Rejected, Merged, Withdrawn) are presented without emotional handling — "The idea did not meet the criteria" is cold. Should acknowledge the emotional weight: "Not every idea proceeds — but every idea is reviewed." |
| **Emotional arc** | Skepticism → understanding (pipeline walkthrough) → hope (seeing a real process) → action (submit CTA) |

---

### 7. Voting Results (`/results`)

| Dimension | Definition |
|-----------|-----------|
| **Goal** | Prove that participation produces outcomes — show the community what was selected and what's in voting |
| **Primary audience** | Maria (wants to see if her support mattered) + Ion (needs proof that things actually happen) |
| **Tone** | Celebratory but factual. "Here's what your community chose" — this is the payoff page, the proof that participation works |
| **Primary CTA** | **Click a selected idea** to see its detail (the result IS the CTA — clicking confirms it's real) |
| **Secondary CTAs** | "Browse all ideas" (if no results), share results |
| **Copy focus** | Title "Voting results" is fine. But the page lacks a hero moment — when there ARE selected ideas, the page should frame it as community achievement, not just a data table. "Selected ideas" heading should become "What the community chose" or "Ideas moving forward". The "Selected" badge is too bureaucratic — "Winner" is better but still startup-y. "Moving forward" or "Approved by the community" is more civic. |
| **Current gaps** | No framing copy when results exist — just a heading and a list. No celebration, no context ("These ideas received the most community support during the [voting period label]"). Empty state is weak. No share-ability. |
| **Emotional arc** | Curiosity → discovery (selected ideas) → validation (my vote mattered) → sharing (telling others) |

---

### 8. Login / Auth (`/login`)

| Dimension | Definition |
|-----------|-----------|
| **Goal** | Remove the login barrier by making OAuth feel like a one-click empowerment, not a data surrender |
| **Primary audience** | Anyone blocked from voting/commenting by the auth wall — triggered mid-action, so they arrive with intent |
| **Tone** | Reassuring and minimal. "One click to make your support count" — not "Create an account". This is an enabler, not a destination. |
| **Primary CTA** | **"Continue with Google" / "Continue with Facebook"** — the buttons are the CTA |
| **Secondary CTAs** | "Back to home" |
| **Copy focus** | The subtitle "Use an existing Google or Facebook account to support ideas across devices and keep your participation tied to one internal participant identity" is too long and explains the plumbing. Should be benefit-first: "Sign in with an account you already have. Your vote counts across devices." The trust section ("What we use") is good but buried. Prototype status note should be more prominent. |
| **Current gaps** | Subtitle is 23 words of plumbing explanation. No benefit-first framing. "OAuth only, no password account to manage" is good copy but is the panel subtitle — it should be the hero copy. No privacy reassurance near the buttons (the most anxiety-producing moment). |
| **Emotional arc** | Frustration (blocked from voting) → scanning options → anxiety (what data do they take?) → reassurance (trust section) → action (click OAuth) |

---

### 9. Admin Panel (`/admin`)

| Dimension | Definition |
|-----------|-----------|
| **Goal** | Enable the operator to manage the platform efficiently — status changes, moderation, voting configuration |
| **Primary audience** | Operator (single user, internal) |
| **Tone** | Functional and direct. Internal tool, no editorial ambitions. Labels should be unambiguous. |
| **Primary CTA** | Varies by tab — "Update" (status), "Hide/Restore" (comments), "Save" (config) |
| **Copy focus** | Admin copy is already functional. Quick-action button labels ("Start review", "Mark eligible", "Send to voting") are excellent — clear, action-specific, and translated. No copy overhaul needed. |
| **Current gaps** | None significant. Maintain current quality. |
| **Emotional arc** | Task → action → confirmation (functional loop) |

---

### 10. Privacy (`/privacy`)

| Dimension | Definition |
|-----------|-----------|
| **Goal** | Answer privacy concerns clearly enough that the visitor decides to engage rather than leave |
| **Primary audience** | Any user who paused to ask "what do they do with my data?" — arrives suspicious |
| **Tone** | Transparent and calm. Legal compliance is the floor, not the ceiling. Write for the neighbor, not the lawyer. |
| **Primary CTA** | **Return to participation** — the page's job is to clear the obstacle, not become a destination |
| **Secondary CTAs** | "Data deletion" link, contact email |
| **Copy focus** | Headings are good and scannable. "Prototype Status" is first — correct, this is the most important frame. "Non-Binding Support" section is clear. "Participant Identification" explains the hash system well. The GDPR sections (Data Controller, Legal Basis, Rights, Retention, DPO) are legally necessary but read like a legal document — they should stay but could use plainer language where possible without losing legal accuracy. |
| **Current gaps** | The page is well-structured but dense. Could benefit from a 2-3 sentence summary at the top before diving into sections. The tone shifts from human ("This is a prototype") to legal ("Under GDPR, you have the right to...") — both are needed but the transition could be smoother. |
| **Emotional arc** | Suspicion → scanning → reassurance → returning to participate |

---

### 11–14. Terms, Bug Report, Data Deletion, Unsubscribe

These are utility/legal pages with low copy urgency. Current copy is functional and adequate. No strategic changes needed. Maintain existing quality. Minor opportunities:
- **Terms**: Add a one-sentence summary at top before the legal body.
- **Bug Report**: Keep as-is — the copy is already friendly and direct.
- **Data Deletion**: Keep as-is — the flow is clear.
- **Unsubscribe**: Keep as-is — minimal and functional.

---

## Page Goal Summary Table

| Page | Goal (one sentence) | Primary CTA | Audience | Tone keyword |
|------|-----------|-----------|----------|-------------|
| Homepage | Prove it's alive; make them choose an action | Submit your idea | Ion (newcomer) | Confident-quiet |
| Ideas List | Find an idea worth supporting | Click an idea | Maria + Ion | Organized-scannable |
| Idea Detail | Give enough info to support, comment, or share | Support this idea | Maria | Informative-empowering |
| Submit Idea | Turn frustration into a proposal with reassurance | Submit idea | Maria | Encouraging-direct |
| Map | Show geographic distribution of ideas | Click a pin | Ion | Exploratory-place-connected |
| How It Works | Build trust by showing the real process | Submit your idea | Ion | Motivational-documentary |
| Results | Prove participation produces outcomes | Click a selected idea | Maria + Ion | Celebratory-factual |
| Login | Remove the auth barrier with one-click framing | Continue with Google/Facebook | Any auth-blocked user | Reassuring-minimal |
| Admin | Manage the platform efficiently | Tab-dependent | Operator | Functional-direct |
| Privacy | Clear the trust obstacle so they participate | Return to participation | Any skeptical user | Transparent-calm |
| Terms | Define the legal framework concisely | None | Legal reviewers | Legal-plain |
| Bug Report | Capture bug reports with minimal friction | Submit report | Helpful users | Friendly-simple |
| Data Deletion | Enable GDPR-compliant data removal | Check status / Request deletion | Privacy-concerned users | Clear-empowering |
| Unsubscribe | Confirm opt-out and return | Back to idea | Notification recipients | Brief-neutral |
