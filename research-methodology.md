# Research Methodology — Vantaa Participatory Budgeting

## Objective

Find citizen-proposed projects on the Vantaa (Finland) participatory budgeting platform that were suggested by residents and successfully implemented by the local administration. Produce a full inventory and a curated set of seed examples for a Cluj-Napoca initiative.

## Tools Used

- **Google Search** via the project's Playwright-based `scripts/google_search.js` script (bypasses bot detection by using a real browser)
- **WebFetch** for extracting content from discovered URLs
- **pdftotext** for reading binary PDF documents that WebFetch couldn't render

## Search Strategy

### Phase 1 — Broad Discovery

Initial searches in English to map the landscape:

1. `"Vantaa participatory budgeting citizen proposals implemented site"` — identified the main platform (osallistuvavantaa.fi, powered by Maptionnaire) and key news articles on vantaa.fi
2. `"Vantaa participatory budgeting winning ideas implemented 2024"` — found the 2024 voting results article listing 66 winning projects across 7 regions
3. `"site:osallistuvavantaa.fi"` — attempted to search within the platform directly; the Maptionnaire-based site doesn't index well in Google, returned minimal results

### Phase 2 — Fetching Key Pages

Direct WebFetch on the most promising URLs:

- **vantaa.fi/en/topical/news/winning-ideas-participatory-budgeting-vantaa** — this was the richest source; extracted all 66 winning projects organized by the 7 major regions (Aviapolis, Hakunila, Kivistö, Koivukylä, Korso, Myyrmäki, Tikkurila) with descriptions
- **osallistuvavantaa.fi/p/8fs7gw8xyl74** — the official participatory budgeting page; failed to render (Maptionnaire SPA, returns only the word "Maptionnaire" to crawlers)
- **vantaa.fi/en/topical/news/how-should-participatory-budgeting-projects-be-implemented** — confirmed implementation timeline (2024–2025), co-creation process, and pointed to tracking on osallistuvavantaa.fi

### Phase 3 — Earlier Rounds (Pre-Citywide)

Searched for the pilot rounds before the 2023 citywide expansion:

1. `"Vantaa participatory budgeting 2022 Hakunila Martinlaakso implemented projects"` — found the **2020–2021 round** (Hakunila & Martinlaakso, EUR 50K)
2. `"Vantaa participatory budgeting 2022 Havukoski Länsimäki Mikkola results"` — found the **2021–2022 round** (3 districts, EUR 150K total)
3. `"Vantaa Myyrmäki participatory budgeting 2022 voting results"` — found the **2022–2023 round** (Myyrmäki, EUR 50K)

WebFetch on these pages yielded detailed project lists with budgets:

- **Round 1**: 14 projects (disc golf, meadows, waste bins, lighting, park yoga, etc.)
- **Round 2**: 27 projects across 3 districts (mill renovation, cherry trees, street art, village festival, etc.) with individual budgets
- **Round 3**: 9 projects (seasonal lighting, flower meadows, movie picnic, 21 trees, etc.) with per-project status

### Phase 4 — Implementation Verification

The voting results show what *won*, not what was actually *built*. To verify implementation:

1. **Finnish-language searches** — `"Vantaa osallistuva budjetointi 2025 toteutetaan valmistuu"` — found the **Vantaa 2024 Financial Statement** (tilinpäätös), a 239-page PDF with detailed OSBU spending
2. **PDF extraction** — WebFetch returned binary data, so I used `pdftotext` to convert and `grep` for "osbu", "osallistuva budjetointi", and "Osbu" references
3. **Key findings from the financial statement**:
   - All 66 projects had implementation plans completed by Aug 31, 2024
   - Some projects were already implemented in 2024: Lammaslampi bridge renovation (EUR 50K), seasonal lights on Rälssitie, Tikkurila light competition, additional waste bins
   - ~EUR 510K in projects (mainly green areas and sports facilities) scheduled for 2025
   - Streets & Parks spent EUR 50K on new OSBU projects in 2024, largest being the bridge

### Phase 5 — Curating Seed Examples

From the full inventory, selected 21 projects across 5 categories for the Cluj seed page:

- **Selection criteria**: diversity of type (infrastructure, culture, environment, youth, sport), range of budget (EUR 500 – 100K), proven popularity (high vote counts), and replicability in a Romanian urban context
- Wrote descriptions in Romanian, framed as inspiration rather than copy, with budget ranges and Vantaa source attribution

## Limitations

1. **Maptionnaire SPA is opaque to crawlers** — the osallistuvavantaa.fi platform returns no content to WebFetch. Individual project pages and voting results within the platform could not be scraped. All project data came from vantaa.fi news articles and the financial statement PDF.
2. **No granular 2025 status** — the financial statement covers through end of 2024. The remaining ~EUR 510K of projects are "scheduled for 2025" but specific completion status per project is not publicly available as of May 2026.
3. **Implementation vs. winning** — for the 2024–2025 round, only ~4 projects are confirmed as implemented (from the financial statement). The other 62 are "in progress" or "planned." I clearly separated confirmed implementations from voted-but-not-yet-built projects in the report.
4. **Image/media assets** — the Vantaa platform likely has photos of implemented projects, but these are inside the Maptionnaire SPA and not accessible via search or direct URL fetching.

## Sources

| Source | URL | Type |
|--------|-----|------|
| Winning ideas 2024 | vantaa.fi/en/topical/news/winning-ideas-participatory-budgeting-vantaa | News article |
| Round 1 implemented projects | vantaa.fi/en/topical/news/year-2020-participatory-budgeting-projects-implemented | News article |
| Round 2 results | vantaa.fi/en/topical/news/results-havukoski-mikkola-and-lansimaki-participatory-budgeting | News article |
| Round 3 progress | vantaa.fi/en/topical/news/participatory-budgeting-projects-progressing-myyrmaki | News article |
| Implementation co-creation | vantaa.fi/en/topical/news/how-should-participatory-budgeting-projects-be-implemented | News article |
| Ideas influx | vantaa.fi/en/topical/news/vantaas-participatory-budgeting-inspired-influx-ideas | News article |
| 2024 Financial Statement | vantaa.fi/sites/default/files/document/KH tilinpäätöskirja 2024 | Official PDF |
| Govlaunch overview | govlaunch.com/de/projects/vantaa-fi-encourages-community-involvement | Third-party summary |
| Osallistuva Vantaa platform | osallistuvavantaa.fi | SPA (content not extractable) |
