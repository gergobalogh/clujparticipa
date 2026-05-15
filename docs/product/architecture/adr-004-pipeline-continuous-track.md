# ADR-004: Pipeline Continuous Track with Circular Markers

**Status**: Accepted

**Date**: 2026-05-15

## Context

The current `IdeaPipeline` component renders pipeline stages as disconnected circles with thin connector lines between them. The `MiniPipeline` uses the same disconnected-dot metaphor at 3-milestone scale. User research (JTBD analysis) identifies the resident's mental model as **package tracking** -- submit and follow the progress.

The disconnected dots fail to convey journey continuity. They look like a checklist, not a track. The gap between each circle breaks the "progress along a path" metaphor that package tracking universally uses (e.g., Amazon, DHL, Posta Romana).

The visual redesign must:
- Preserve all existing states: reached, current, future, rejected, stalled
- Work for both the full 7-stage pipeline (detail page) and the 3-milestone mini-pipeline (cards)
- Support horizontal (desktop) and vertical (mobile) layouts for the full pipeline
- Keep the data layer (`PipelineStage`, `computePipelineStages()`) unchanged
- Use entrance animation on mount (per D12: no transition animation on status change)

## Decision

Replace the disconnected-dot metaphor with a **solid continuous track with circular markers ON the bar**:

- A single horizontal (or vertical on mobile) bar forms the track
- The bar is colored for reached stages (same civic color tokens) and gray for future stages
- Circular markers sit ON the bar at each stage position
- The current-stage marker pulses (existing behavior)
- Stage labels alternate above/below the track (desktop) or appear on one side (mobile vertical)

This applies to both:
1. **PipelineTrack** (full 7-stage pipeline on the idea detail page)
2. **MiniPipelineTrack** (3-milestone compact track on idea cards)

## Alternatives Considered

1. **Disconnected dots (current)** -- Circles with connector lines. Rejected: breaks journey continuity. Each dot appears isolated. Does not match the package-tracking mental model.

2. **Segmented bar (no markers)** -- Colored bar divided into segments with no circles. Rejected: loses the ability to show the current-stage pulse animation. No anchor point for labels. The "where am I now?" question has no clear visual answer.

3. **Stepped progress bar** -- Blocky segments with labels inside. Rejected: too wide for 7 stages on mobile. Labels cannot fit inside thin bar segments. More suited for 3-4 step wizards than 7-stage civic pipelines.

4. **Timeline (vertical only)** -- Vertical line with branching nodes, like a Git log. Rejected: the detail page already has a `StatusChangeTimeline` component. Duplicating the timeline metaphor would confuse the two. Pipeline = future-oriented (what's next). Timeline = past-oriented (what happened).

## Consequences

- **Positive**: Strong journey continuity -- the continuous bar reads as "a path the idea travels along"
- **Positive**: Package-tracking mental model matches resident expectations
- **Positive**: Current-stage pulse is visually anchored on the bar, making "where am I" immediately obvious
- **Positive**: MiniPipelineTrack shares the same metaphor, creating visual consistency between cards and detail page
- **Positive**: No data layer changes. `PipelineStage[]` and `computePipelineStages()` feed in unchanged
- **Negative**: More DOM elements per stage (track segment + marker + label vs circle + connector + label). Approximately 2x elements. Acceptable: 7 stages = ~21 elements, well within React rendering budget
- **Negative**: Vertical mobile layout requires label positioning logic (alternate vs single-side). Defers to GREEN phase for polish
- **Negative**: Rejected ideas render a two-tone track (colored up to rejection, gray beyond). Slightly more complex than the current uniform approach but more informative

## Component Impact

| Old Component | New Component | Change Type |
|---------------|---------------|-------------|
| `IdeaPipeline` | `PipelineTrack` | REPLACE |
| `IdeaPipelineStage` | `PipelineTrackSegment` | REPLACE |
| `MiniPipeline` | `MiniPipelineTrack` | REPLACE |
| `StalledIndicator` | `StalledIndicator` | EXTEND (add `fullWidth` prop) |
| `ExceptionState` | `ExceptionState` | UNCHANGED |

## Animation Specification

Entrance animation only (no transition on status change):

- **Track fill**: `motion.div` with `initial={{ scaleX: 0 }}` `animate={{ scaleX: 1 }}` `transition={{ duration: 0.6, ease: "easeOut" }}` `style={{ transformOrigin: "left" }}`
- **Marker stagger**: `motion.div` with `initial={{ opacity: 0, scale: 0.5 }}` `animate={{ opacity: 1, scale: 1 }}` `transition={{ delay: index * 0.05 }}`
- **Reduced motion**: `motion` v12 automatically respects `prefers-reduced-motion: reduce` -- animations become instant

## Color Specification

Reuses existing civic design tokens (same as current `STAGE_MARKER_COLORS`):

| Stage | Track Fill Color | Marker Color |
|-------|-----------------|-------------|
| SUBMITTED | `bg-civic-orange` | `bg-civic-orange` |
| UNDER_REVIEW | `bg-civic-orange` | `bg-civic-orange` |
| ELIGIBLE | `bg-civic-blue` | `bg-civic-blue` |
| IN_VOTING | `bg-purple-700` | `bg-purple-700` |
| SELECTED | `bg-civic-teal` | `bg-civic-teal` |
| IN_PROGRESS | `bg-civic-teal` | `bg-civic-teal` |
| COMPLETED | `bg-civic-teal` | `bg-civic-teal` |
| REJECTED | N/A (gray track beyond) | `bg-red-600` |
| Future (not reached) | `bg-gray-200` | `border-2 border-gray-300 bg-transparent` |
