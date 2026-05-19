# User Stories — page-goals-and-copy

## US-1: Homepage Copy Reframe

**As a** first-time visitor **I want to** understand what ClujParticipa is, that it's active, and what I can do — within 10 seconds **So that** I decide to stay and participate instead of leaving

**Job**: J-HOME (Scanner), J-HOME-RETURN (Returner)

### Elevator Pitch
Before: I land on the homepage and see a feature description ("Civic participation prototype for Cluj-Napoca. Submit neighborhood ideas...") but can't quickly tell if the platform is alive or what to do first
After: load the homepage → sees a short action-oriented headline, activity proof (stats strip, idea feed), and a single prominent "Submit your idea" CTA
Decision enabled: I can immediately decide whether to browse ideas, explore the map, or submit one

**ACs**:
- Homepage description is ≤20 words and action-first (not feature-listy)
- "Participatory Budgeting" eyebrow uses locale-appropriate term (RO: "Bugetare Participativă", not English)
- Stats strip shows at least total ideas + completed ideas (the two strongest trust signals)
- Idea feed heading has LIVE badge (existing — preserve)
- Primary CTA "Submit your idea" is visually prominent (existing SidebarCta — preserve)
- Empty state copy is actionable ("Be the first to propose an improvement" not "No ideas yet")
- All copy changes present in RO, HU, EN locale files
- No hardcoded user-facing strings

---

## US-2: Submit Page Emotional Framing

**As a** resident with a neighborhood problem **I want to** feel that submitting my idea matters and that I'll be able to track it **So that** I overcome submission anxiety and complete the form

**Job**: J-SUBMIT (Proposer)

### Elevator Pitch
Before: I see a form titled "Submit an idea" with a neutral description — it feels like filling out a government form
After: open the submission page → sees an encouraging headline ("Share your idea for Cluj"), form labels that guide me conversationally, and a success message that tells me what happens next
Decision enabled: I submit my idea because I understand it enters a real process, not a void

**ACs**:
- Page title is action-first and encouraging (e.g. "Share your idea for Cluj" not just "Submit an idea")
- Description frames the form as civic action, not bureaucracy
- Location hint is personal ("Pin the spot where the idea applies" not "Click on the map to set the proposal location")
- Success message includes next-step reassurance ("Your idea is now in the pipeline. Track its progress anytime.")
- Success state links to the submitted idea's detail page (existing "View idea" — preserve) and to How It Works
- All copy changes present in RO, HU, EN locale files

---

## US-3: Idea Detail Micro-Copy Guide

**As a** visitor viewing an idea **I want to** understand each section's purpose from its heading **So that** I know why I should read it and what action it enables

**Job**: J-DETAIL (Deep-Diver)

### Elevator Pitch
Before: I see bare section headings ("Comments", "Status History", "Location") that don't tell me why I should care
After: view an idea detail page → sees section headings that guide my mental model ("What the community says", "How this idea has progressed", "Where this idea applies")
Decision enabled: I engage with each section knowing its purpose, leading to an informed support decision

**ACs**:
- "Comments" heading becomes a more descriptive label (e.g. "What the community says" or "Community discussion")
- "Status History" → "How this idea has progressed" or similar action-oriented heading
- "Location" → "Where this idea applies" or similar
- "Progress Updates" → "Implementation updates" or similar
- "Feasibility Assessment" heading stays (it's already good)
- Non-binding label on vote section remains visible and unchanged in content
- "Learn about the process" link stays (already good)
- All copy changes present in RO, HU, EN locale files

---

## US-4: How It Works Trust Amplification

**As a** skeptical newcomer **I want to** see evidence that ideas actually get implemented **So that** I believe participating is worth my time

**Job**: J-HOW (Process Learner)

### Elevator Pitch
Before: I read the How It Works page and understand the pipeline stages, but I see no proof that ideas actually reach completion
After: visit the How It Works page → sees the completed ideas count near the top, and terminal state descriptions that acknowledge emotional weight
Decision enabled: I believe the process works because I see real completion numbers, and I submit my idea

**ACs**:
- Completed ideas count is visible on the page (near the hero section or as a trust badge)
- Terminal state descriptions acknowledge emotional reality (e.g. "Not every idea proceeds — but every idea is reviewed" instead of just "The idea did not meet the criteria")
- CTA at page bottom remains "Submit your idea" — preserve
- Creator credit is visually subordinate to the CTA (don't let it compete for last-screen attention)
- All copy changes present in RO, HU, EN locale files

---

## US-5: Results Page Impact Framing

**As a** community member **I want to** see voting results framed as community achievement **So that** I feel my participation produced real outcomes

**Job**: J-RESULTS (Outcome Verifier)

### Elevator Pitch
Before: I see a data table titled "Voting results" with "Selected ideas" — it's informative but feels like a spreadsheet, not a payoff
After: visit the results page → sees a framing line ("Here's what the community chose") with context about the voting period, and selected ideas presented as community achievements
Decision enabled: I confirm my vote mattered and consider sharing the results with neighbors

**ACs**:
- When selected ideas exist, page shows a framing sentence (e.g. "These ideas received the most community support during [voting period label]")
- "Selected ideas" heading is more community-oriented (e.g. "Ideas moving forward" or "Community selections")
- Voting period info already exists — preserve
- Empty state includes a CTA ("No ideas in the voting process yet. Browse submitted ideas →")
- All copy changes present in RO, HU, EN locale files

---

## US-6: Login Page Benefit-First Reframe

**As a** resident blocked from voting by the auth wall **I want to** understand the benefit of signing in before I see the technical details **So that** I click through rather than abandon

**Job**: J-AUTH (Identity Connector)

### Elevator Pitch
Before: I see a page titled "Civic account" with a 23-word subtitle explaining the technical plumbing of participant identity
After: land on the login page → sees a short benefit-first subtitle ("Sign in with an account you already have. Your vote counts across devices.") and privacy reassurance near the buttons
Decision enabled: I click OAuth because I understand the benefit and feel my data is safe

**ACs**:
- Subtitle is benefit-first, ≤15 words, no technical jargon ("participant identity", "internal participant hash")
- Technical explanation ("What we use", "Prototype status") remains but is secondary
- Privacy reassurance text is visible near the OAuth buttons (the highest-anxiety moment)
- "OAuth only, no password account to manage" sentiment is promoted to hero position or subtitle
- All copy changes present in RO, HU, EN locale files

---

## US-7: Privacy Page Scannability

**As a** privacy-concerned visitor **I want to** get a quick summary of the privacy position before reading the detailed sections **So that** I decide to engage without reading walls of text

**Job**: J-PRIVACY (Trust Builder)

### Elevator Pitch
Before: I see a long privacy page with many sections — I have to read everything to understand the basic stance
After: open the privacy page → sees a 2-3 sentence summary at the top before the detailed sections
Decision enabled: I quickly understand the privacy stance and either proceed or dive deeper into specific concerns

**ACs**:
- A 2-3 sentence summary paragraph appears before the first section heading
- Summary covers: (1) prototype status, (2) what data is collected, (3) how to delete it
- Existing section structure and headings are preserved (they're already well-organized)
- GDPR/legal sections remain unchanged in content (legal accuracy required)
- All copy changes present in RO, HU, EN locale files
