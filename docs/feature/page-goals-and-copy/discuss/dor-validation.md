# DoR Validation — page-goals-and-copy

| # | DoR Item | Status | Evidence |
|---|----------|--------|----------|
| 1 | User stories have clear acceptance criteria | PASS | All 7 stories have testable ACs referencing specific locale strings and page elements |
| 2 | Stories trace to validated jobs | PASS | Every story references a job from jtbd-job-stories.md; J-HOME, J-SUBMIT, J-DETAIL, J-HOW, J-RESULTS, J-AUTH, J-PRIVACY all scored in opportunity analysis |
| 3 | No open design questions blocking implementation | PASS | All copy targets are specified; no architectural decisions pending (copy-only changes to locale JSON files) |
| 4 | Dependencies identified and available | PASS | No new dependencies. All changes are to existing locale files and minimal page-level JSX text. Umami analytics is a KPI measurement dependency but not a block. |
| 5 | Non-functional requirements defined | PASS | i18n completeness (RO/HU/EN) is an AC on every story. No performance, security, or infra NFRs — copy changes have zero runtime impact. |
| 6 | Testable without infrastructure | PASS | Copy changes are verified by (a) locale file presence, (b) visual inspection, (c) no hardcoded strings lint. No DB, API, or E2E test dependencies. |
| 7 | Scope is bounded | PASS | 7 stories, all copy-only. No component, API, or schema changes. Pages 11-14 explicitly out of scope for changes. |
| 8 | Stakeholder alignment | PASS | Feature owner is the same person as the developer. No external stakeholder review needed for copy. |
| 9 | DoD defined | PASS | DoD items: (1) all ACs pass per story, (2) TypeScript compiles, (3) `npx next build` succeeds, (4) all 3 locale files updated, (5) no hardcoded strings, (6) visual verification on all 7 target pages |
