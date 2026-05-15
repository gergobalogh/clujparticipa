# Taste Evaluation — clujparticipa-redesign

## Phase 1: DVF Filter

| Option | Desirability | Feasibility | Viability | DVF Avg | Status |
|--------|-------------|-------------|-----------|---------|--------|
| 1. Pipeline Tracker | 5 | 4 | 4 | 4.3 | ✓ Survives |
| 2. Civic + Neighborhood Social | 4 | 2 | 3 | 3.0 | ✓ Survives |
| 3. Parliamentary Record | 3 | 3 | 3 | 3.0 | ✓ Survives |
| 4. Impact Showcase | 4 | 3 | 4 | 3.7 | ✓ Survives |
| 5. Zero-Friction Reporter | 4 | 5 | 2 | 3.7 | ✓ Survives |
| 6. WhatsApp-First Bot | 3 | 2 | 2 | 2.3 | ✗ Eliminated (DVF < 6 total = 7, but avg=2.3; borderline — eliminates because feasibility=2 requires WhatsApp Business API + phone number verification + Romanian data compliance, viability=2 because no web presence = no SEO = no organic discovery) |

**DVF eliminations**: Option 6 (WhatsApp-First Bot). Feasibility requires WhatsApp Business API integration, RO data compliance (GDPR + national rules), and abandons the existing Next.js investment. Viability: no web presence means no organic discovery, no SEO, no shareable links — critical for a coalition-building tool.

## Phase 2: Taste Scoring

**Product type**: Consumer civic app — residents are the primary users.
**Weights selected**: Consumer App profile.

| Criterion | Weight | Rationale |
|-----------|--------|-----------|
| DVF (avg) | 35% | Consumer desirability is primary — residents must want to use it |
| Subtraction (T1) | 25% | For a low-trust context, less is more — every extra element raises suspicion |
| Concept Count (T2) | 20% | New mental models are a barrier in populations with low digital civic experience |
| Progressive Disclosure (T3) | 10% | Important but secondary to simplicity and subtraction |
| Speed-as-Trust (T4) | 10% | Perceived speed matters but the platform is not performance-critical |

### Detailed Scoring

#### Option 1: Pipeline Tracker

| Criterion | Score | Rationale |
|-----------|-------|----------|
| T1 Subtraction | 5 | Pipeline IS the interface — no separate status page, no badges, no sidebar. Remove the pipeline and nothing works. |
| T2 Concept Count | 4 | One new concept: "pipeline" — anchored to package tracking mental model that 90%+ of internet users know. |
| T3 Progressive Disclosure | 4 | First interaction: see your idea's pipeline. Tap a stage for details. Depth on demand. |
| T4 Speed-as-Trust | 5 | Every action has immediate visual feedback — idea appears on pipeline, stage transitions animate. |

#### Option 2: Civic + Neighborhood Social

| Criterion | Score | Rationale |
|-----------|-------|----------|
| T1 Subtraction | 2 | Social layer adds: feed, following, profiles, verification, notifications. Multiple removable parts. |
| T2 Concept Count | 2 | Three new concepts: district feed, neighbor verification, social proof layer. Some interdependent. |
| T3 Progressive Disclosure | 2 | First interaction requires choosing: browse feed? submit idea? check map? Multiple paths exposed. |
| T4 Speed-as-Trust | 3 | Feed loading, social verification delays, but justified by community value. |

#### Option 3: Parliamentary Record

| Criterion | Score | Rationale |
|-----------|-------|----------|
| T1 Subtraction | 4 | Timeline IS the interface. One removable element: attribution badges could be optional. |
| T2 Concept Count | 2 | Three new concepts: immutable record, attributed events, chronological-first UX. Interdependent. |
| T3 Progressive Disclosure | 3 | First interaction exposes timeline + filters. Two features, but logical sequencing. |
| T4 Speed-as-Trust | 2 | Loading full histories may be slow; user sees events loading progressively but no instant payoff. |

#### Option 4: Impact Showcase

| Criterion | Score | Rationale |
|-----------|-------|----------|
| T1 Subtraction | 3 | Gallery + original idea link + supporter list. Impact page could stand alone without idea link-backs. |
| T2 Concept Count | 3 | Two concepts: impact gallery + reverse funnel. Introduced sequentially but both needed upfront. |
| T3 Progressive Disclosure | 4 | First interaction: browse impact gallery. Tap for details. Submission is one step deeper. |
| T4 Speed-as-Trust | 4 | Impact page loads fast (static content). But "submit your own" is secondary, so new visitors wait to see value. |

#### Option 5: Zero-Friction Reporter

| Criterion | Score | Rationale |
|-----------|-------|----------|
| T1 Subtraction | 5 | Nothing can be removed — location + description + map is the irreducible minimum. |
| T2 Concept Count | 4 | One concept: "tap the map to report" — anchored to Waze/pin-dropping mental model. |
| T3 Progressive Disclosure | 5 | First interaction = tap the map. That's it. Heat map reveals itself. |
| T4 Speed-as-Trust | 5 | Pin appears instantly on map. Heat map updates. No waiting. |

## Phase 3: Weighted Scoring Matrix

| Option | DVF (35%) | T1 Sub (25%) | T2 Concept (20%) | T3 Prog (10%) | T4 Speed (10%) | Weighted Total |
|--------|-----------|-------------|-----------------|---------------|----------------|----------------|
| 1. Pipeline Tracker | 4.3 | 5 | 4 | 4 | 5 | **4.455** |
| 5. Zero-Friction Reporter | 3.7 | 5 | 4 | 5 | 5 | **4.345** |
| 4. Impact Showcase | 3.7 | 3 | 3 | 4 | 4 | **3.445** |
| 3. Parliamentary Record | 3.0 | 4 | 2 | 3 | 2 | **2.950** |
| 2. Civic + Neighborhood Social | 3.0 | 2 | 2 | 2 | 3 | **2.450** |

**Weights locked before scoring. No retroactive adjustment.**

### Score Breakdown

```
Option 1: 4.3×0.35 + 5×0.25 + 4×0.20 + 4×0.10 + 5×0.10 = 1.505 + 1.250 + 0.800 + 0.400 + 0.500 = 4.455
Option 5: 3.7×0.35 + 5×0.25 + 4×0.20 + 5×0.10 + 5×0.10 = 1.295 + 1.250 + 0.800 + 0.500 + 0.500 = 4.345
Option 4: 3.7×0.35 + 3×0.25 + 3×0.20 + 4×0.10 + 4×0.10 = 1.295 + 0.750 + 0.600 + 0.400 + 0.400 = 3.445
Option 3: 3.0×0.35 + 4×0.25 + 2×0.20 + 3×0.10 + 2×0.10 = 1.050 + 1.000 + 0.400 + 0.300 + 0.200 = 2.950
Option 2: 3.0×0.35 + 2×0.25 + 2×0.20 + 2×0.10 + 3×0.10 = 1.050 + 0.500 + 0.400 + 0.200 + 0.300 = 2.450
```

## Top 3

1. **Pipeline Tracker** — 4.46
2. **Zero-Friction Reporter** — 4.35
3. **Impact Showcase** — 3.45
