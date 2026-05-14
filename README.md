# ClujParticipa

ClujParticipa is a proposed civic participation platform for Cluj-Napoca, inspired by participatory budgeting models such as Osallistuva Vantaa in Finland.

The goal is to build a focused prototype that shows how residents could submit neighborhood ideas, discuss them, vote on feasible proposals, and track implementation in a transparent public workflow.

## Current Status

This repository now contains the initial application foundation and data layer:

- `CONCEPT.md` - one-page concept note for conversations with civic, university, NGO, and municipal partners
- `IMPLEMENTATION_PLAN.md` - MVP technical plan
- `PROJECT_BOARD.md` - task board and decision log
- Next.js App Router scaffold with TypeScript, Tailwind, and ESLint
- Prisma schema, initial migration, and seed data for the prototype

The current app surface is intentionally minimal. Feature implementation begins after the foundation and seeded data are in place.

## MVP Scope

The first version should demonstrate five core flows:

- Submit an idea with title, description, category, district, and map location
- Browse and filter ideas
- View ideas on a map
- Vote and comment with lightweight abuse controls
- Track proposal status through a public timeline

The prototype is intended as a demonstration and coalition-building tool. It is not a production voting system.

## Product Principles

- Start with one pilot district before citywide rollout
- Keep the interface mobile-first and accessible
- Support Romanian, Hungarian, and English
- Prefer open-source infrastructure and no proprietary map API dependency
- Separate public participation from administrative actions
- Treat privacy, moderation, and voting integrity as first-class requirements

## Planned Stack

- Next.js App Router with TypeScript
- Tailwind CSS
- PostgreSQL with Prisma
- Leaflet / OpenStreetMap
- `next-intl` for translations

The MVP should use plain latitude/longitude columns first. PostGIS can be added later if spatial queries become a real requirement.

## External References

- Vantaa participatory budgeting funding announcement: https://www.vantaa.fi/en/topical/news/vantaa-invest-eu12-million-participatory-budgeting-2023-2024
- Vantaa 2024 voting information: https://www.vantaa.fi/en/topical/news/vote-participatory-budgeting-ideas-april-28
- European Urban Initiative Innovative Actions: https://www.urban-initiative.eu/about-innovative-actions
- Citizens, Equality, Rights and Values programme: https://commission.europa.eu/funding-tenders/find-funding/eu-funding-programmes/citizens-equality-rights-and-values-programme_en
- URBACT networks: https://urbact.eu/networks
