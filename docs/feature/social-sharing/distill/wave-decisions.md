# DISTILL Decisions — social-sharing

## Key Decisions
- [DWD-1] Walking Skeleton Strategy: Strategy C (Real local) — all driven ports are browser-local or HTTP routes testable with real adapters in jsdom/Vitest
- [DWD-2] Test framework: Vitest (existing project convention) — no BDD/Gherkin tooling added. Gherkin .feature files serve as specification docs only
- [DWD-3] Component test style: @testing-library/react with jest-dom matchers (existing pattern)
- [DWD-4] API route test style: NextRequest + Prisma mock (existing pattern from 14 route.test.ts files)
- [DWD-5] OG metadata test: Separate test file for generateMetadata, since the page restructuring is a prerequisite

## WS Strategy
Strategy C (Real local) — confirmed by user. All scenarios tagged `@real-io`.

## Adapter Coverage
All driven adapters covered by at least one real-io scenario. No missing adapters.

## Test Placement
Co-located with source (existing convention): `__tests__/` subdirectories or `.test.ts` sibling files.

## Scaffolds
4 RED-ready scaffold files created:
1. `src/lib/clipboard.ts` — copyToClipboard utility
2. `src/components/ideas/idea-share-row.tsx` — share button row
3. `src/components/ui/toaster.tsx` — sonner wrapper
4. `src/app/api/og/ideas/[id]/route.ts` — OG image handler
