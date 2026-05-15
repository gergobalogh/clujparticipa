# Recommendation — clujparticipa-redesign

## Top 3 Options

### Option 1: Pipeline Tracker — Score 4.455

**Why it scores well**: Highest DVF (4.3) because it directly addresses the two most under-served outcomes (O1: time to see progress, O2: engagement not ignored). Highest taste scores because the pipeline is both the interface and the content — zero removable parts (T1=5), one familiar concept (T2=4), progressive by nature (T3=4), instant feedback on stage transitions (T4=5).

**Core trade-off**: Pipeline implies a linear, predictable process — but civic improvement is messy. Ideas get stuck, reversed, merged, or split. The pipeline must handle exceptions (stalled, returned to review, rejected after selection) without breaking the metaphor.

**Key risk**: The pipeline metaphor breaks if the city doesn't provide timely status updates. A pipeline with stale stages is worse than no pipeline — it proves disengagement.

**Hire criteria**: A resident would choose this when they want to know "what's happening with my idea" and trust that each stage has a real person behind it.

---

### Option 2: Zero-Friction Reporter — Score 4.345

**Why it scores well**: Near-perfect taste scores (T1=5, T2=4, T3=5, T4=5) because it is the simplest possible interface. One tap on a map is the lowest-friction civic interaction ever designed. Desirability and viability are slightly lower because it sacrifices richness (no categories, no detailed tracking, no comments).

**Core trade-off**: Simplicity kills depth. Without categories, comments, or status tracking, the platform becomes a complaint board — not a participation tool. The map shows where problems concentrate but not what's being done about them. This directly fails O1 (time to see progress) and O2 (engagement not ignored).

**Key risk**: Without status tracking, the platform cannot demonstrate impact — the exact job it was designed to serve. It maximizes input volume but minimizes visible tracking and demonstrated impact.

**Hire criteria**: A resident would choose this when they want to "just report this quickly" — a passive, low-commitment interaction. Not when they want to follow up.

---

### Option 3: Impact Showcase — Score 3.445

**Why it scores well**: Desirability (3.7) from proof-of-impact motivation. Progressive disclosure (T3=4) works well — impact gallery first, submission second.

**Core trade-off**: Requires completed projects to populate the gallery. At launch with zero completed projects, the homepage has nothing to showcase — a cold-start problem. Also, leading with impact may discourage new ideas ("only big projects get attention").

**Key risk**: No completed projects = no content = no credibility = no participation. This is a vanity-first design that works only after the platform has a track record.

**Hire criteria**: A resident would choose this when they're skeptical and need proof before committing their own time.

---

## Recommendation

**Proceed with Pipeline Tracker.**

The scoring matrix is clear: Pipeline Tracker leads on both DVF (addressing the validated job) and taste (simplest, most familiar, most progressive). It directly serves the two highest-opportunity outcomes (O1 and O2) from the JTBD analysis.

The pipeline metaphor maps to a universal mental model (package tracking) while serving the civic job (visible tracking → demonstrated impact). Every other option either fails to serve the tracking job (Zero-Friction Reporter) or adds complexity that erodes trust in a low-trust context (Social Layer, Parliamentary Record).

**Critical success factor**: The pipeline must handle non-linear civic reality (exceptions, stalls, reversals) gracefully. Package tracking works because it has "exception" states — delayed, returned, customs hold. The civic pipeline needs equivalent states: "Stalled — awaiting city response", "Returned — needs revision", "Merged — combined with another idea".

---

## Dissenting Case

**Zero-Friction Reporter (4.35) is the close second — and it might be the better choice under different assumptions.**

If the key risk of Pipeline Tracker materializes — the city doesn't provide timely status updates — then Pipeline Tracker becomes a monument to disengagement: a pipeline frozen at "Under Review" for months. In that scenario, Zero-Friction Reporter's map-heat approach actually serves residents better: it shows problem density (which the platform itself generates, no city cooperation needed) and creates collective visibility ("47 reports on this street") without depending on institutional responsiveness.

The 0.11 score gap between Pipeline Tracker and Zero-Friction Reporter reflects exactly this trade-off: Pipeline Tracker depends on institutional cooperation; Zero-Friction Reporter does not.

**Dissent recommendation**: If the city partnership is uncertain or non-existent, start with Zero-Friction Reporter's map-first UX and add pipeline tracking as a progressive enhancement once institutional cooperation is confirmed. The pipeline can be built on top of the map — not instead of it.

---

## Decision for DISCUSS Wave

Proceed with **Pipeline Tracker** as the primary design direction, with the dissenting option (Zero-Friction Reporter's map-first entry point) as a fallback integration point. Specifically: the map should be the first thing residents see (Zero-Friction Reporter's strength), and the pipeline should be the tracking mechanism for each idea (Pipeline Tracker's strength). The DISCUSS wave should reconcile these into a single coherent UX.
