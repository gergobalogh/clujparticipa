# Slice 01: Umami Server + Script Load

## Goal
Umami runs and pageviews are collected from the Next.js app.

## IN scope
- Deploy self-hosted Umami via Docker (or configure Umami Cloud)
- Add `NEXT_PUBLIC_UMAMI_WEBSITE_ID` and `NEXT_PUBLIC_UMAMI_URL` env vars
- Add Umami tracking `<script>` to root layout (`src/app/[locale]/layout.tsx`)
- Verify pageviews appear in Umami dashboard for all locale-prefixed routes

## OUT scope
- Consent gate (script always loads for now — will be gated in slice 02)
- Custom event tracking
- Consent notice UI
- Admin page tracking

## Learning hypothesis
Disproves: "Umami is hard to self-host alongside this stack" if deploy fails.
Confirms: pageview collection works end-to-end (visit → Umami dashboard shows pageview).

## Acceptance criteria
- [ ] `docker compose up umami` (or cloud equivalent) starts Umami and it responds at the configured URL
- [ ] Visiting `/{locale}/ideas` fires a pageview visible in Umami dashboard within 10 seconds
- [ ] Visiting `/{locale}/ideas/{id}` fires a pageview with the idea ID in the URL path
- [ ] Umami script load does not block page rendering (script has `defer` or `async`)
- [ ] Removing env vars causes script tag to not render (graceful degradation)

## Dependencies
- None (this is the first slice)

## Effort estimate
~4 hours

## Reference class
Standard Next.js + Umami integration. Well-documented in Umami docs. Low uncertainty.

## Pre-slice SPIKE
None needed — Umami's Next.js integration is straightforward.
