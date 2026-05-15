# ADR-003: Mini-Pipeline Milestone Marker Grouping

**Status**: Accepted

**Date**: 2026-05-14

## Context

The redesign adds a mini-pipeline (3-stage compact indicator) to idea list cards. The full pipeline has 7 forward stages: SUBMITTED, UNDER_REVIEW, ELIGIBLE, IN_VOTING, SELECTED, IN_PROGRESS, COMPLETED. The mini-pipeline must compress these into 3 visual dots that are meaningful to residents.

The JTBD analysis identifies the resident's mental model as **package tracking** — submit and follow the progress.

## Decision

Use **milestone markers** grouping:

| Milestone | Mapped Stages | Visual Meaning |
|-----------|-------------|----------------|
| Submitted | SUBMITTED, UNDER_REVIEW, ELIGIBLE | "Your idea has been received and is being assessed" |
| In Voting | IN_VOTING, SELECTED | "Your idea is in public voting or has been selected" |
| Completed | IN_PROGRESS, COMPLETED | "Your idea is being implemented or is done" |

This maps to the package-tracking analogy: **Order Placed / Shipped / Delivered**.

REJECTED ideas show no mini-pipeline — the status badge alone indicates the exception state.

## Alternatives Considered

1. **Ternary progress (Early / Active / Done)** — SUBMITTED+UNDER_REVIEW / ELIGIBLE+IN_VOTING / SELECTED+IN_PROGRESS+COMPLETED. Rejected: "Active" is vague. Residents don't think in terms of "early" vs "active" stages.

2. **Current-centric (Past / Current / Future)** — Shows relative position of the current stage. Rejected: requires the full stage list to compute; the 3 dots would change meaning per idea. "Milestone markers" are absolute and learnable.

3. **Start / Current / End (4 dots)** — SUBMITTED / current / COMPLETED with a 4th position for the current stage. Rejected: 4 dots on a small card is visually noisy. 3 dots is the compact standard.

## Consequences

- Positive: Learnable — 3 fixed milestones that don't change meaning between ideas
- Positive: Maps directly to the package-tracking mental model from JTBD
- Positive: Simple to implement — one function `getMilestoneGroup(status)` returning 3 booleans
- Negative: Loss of granularity — ELIGIBLE and UNDER_REVIEW look the same in the mini view. Acceptable: the full pipeline on the detail page provides the detail.
- Negative: IN_PROGRESS and COMPLETED look the same. Acceptable: both mean "the idea succeeded" which is the milestone that matters.
