# Shared Artifacts Registry — page-goals-and-copy

| Artifact | Source | Consumed by | SSOT location |
|----------|--------|-------------|---------------|
| `${localeFiles}` | i18n messages | All pages — every visible string | `src/i18n/messages/{ro,hu,en}.json` |
| `${completedCount}` | Stats API | Homepage trust signal, How It Works proof | `computeCompletedCount(stats.statusCounts)` |
| `${pipelineStages}` | transitions.ts | How It Works, Idea Detail pipeline labels | `src/lib/pipeline-stages.ts` |
| `${votingConfig}` | Voting config API | Homepage civic status, Results voting period | `/api/voting-config` |
| `${ideaStatus}` | Prisma Idea model | Idea Detail vote section, pipeline, badges | `idea.status` |
| `${rejectionNote}` | StatusChange | Idea Detail exception state, Results | `StatusChange.note` |
