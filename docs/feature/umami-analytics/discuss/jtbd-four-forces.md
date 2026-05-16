# Four Forces Analysis — umami-analytics

## JOB-002: Operator Diagnoses Drop-off

### Push (current frustration)
- No visibility into user behavior — flying blind on why engagement is low
- Rely on anecdotal feedback (one user complains, no idea how many silently leave)
- Cannot measure whether editorial redesign actually improved engagement
- Guessing which pages are valuable and which are dead ends

### Pull (desired future)
- See pageview funnels: landing → idea list → idea detail → submit → vote
- Know which buttons are clicked and which are ignored
- Catch trust-eroding UX problems early (e.g., users bounce after seeing "non-binding" label)
- Data-backed iteration instead of gut-driven changes

### Anxiety (adoption concerns)
- Umami adds another infrastructure dependency to maintain
- Tracking events wrong creates noisy data that's worse than no data
- Privacy misstep could damage civic trust (core value of the platform)
- Implementation time takes away from feature work

### Habit (current behavior must change)
- Currently deploying features and hoping they work
- Relying on admin dashboard stats (totals only, no journey data)
- No habit of checking user behavior data because none exists

---

## JOB-003: Operator Validates Feature Value

### Push
- Shipped editorial redesign with no way to measure its impact
- Cannot tell if pipeline track visualization changed return behavior
- No A/B or before/after comparison capability

### Pull
- Tag events by feature so I can see "users who see pipeline track return 2x more"
- Measure notification opt-in rate to see if that feature drives retention
- Prove value to coalition partners with real numbers

### Anxiety
- Feature launches are one-shot — no easy way to segment "before/after"
- Tagging convention could become inconsistent across features
- Data might show a feature failed — ego/investment risk

### Habit
- Currently announcing features as "done" without measuring adoption
- No ritual of checking post-launch metrics because the tooling doesn't exist

---

## JOB-004: Resident Trusts Platform Privacy

### Push
- Internet users are increasingly suspicious of tracking
- Civic platforms that look surveilled undermine participation (people won't submit ideas if they feel watched)
- GDPR requires transparency about data collection

### Pull
- Umami is privacy-first: no cookies, no PII, no cross-site tracking
- Honest notice: "We track page views and clicks to improve the platform. No personal data is collected."
- Opt-out available without losing functionality

### Anxiety
- Any tracking notice, even privacy-friendly, may scare some users
- Umami self-hosted means data stays on our server — but we must ensure that
- Consent banner could feel heavy for a lightweight prototype

### Habit
- Users currently see no tracking notice at all — absence of notice is not the same as absence of tracking
- Most civic sites they've used don't have good privacy practices — low baseline

---

## JOB-005: Resident Sees Platform Is Alive

### Push
- Users who submitted ideas don't know if anyone is reading them
- Low return rate because there's no evidence of activity on return visits
- Pipeline stalled ideas create hopelessness

### Pull
- Active user counts and recent activity signals visible on the platform
- Umami data can feed "proof of life" indicators (e.g., "23 people visited today")
- Shows the platform isn't abandoned

### Anxiety
- Showing low numbers could be worse than showing none (5 visitors today vs. nothing)
- Real-time counters could be gamed or create performance anxiety
- Numbers don't tell the story of impact — volume != value

### Habit
- Users currently judge activity by visible content freshness (new ideas, recent comments)
- No numerical social proof exists on the platform today
