# Shared Artifacts Registry — umami-analytics

| Artifact | Type | Source (single truth) | Consumers |
|----------|------|----------------------|-----------|
| `${umamiUrl}` | URL | Operator deploys Umami → env var `NEXT_PUBLIC_UMAMI_URL` | Tracking script in layout, operator dashboard |
| `${dashboardUrl}` | URL | Operator bookmarks Umami dashboard | Operator (human) — not consumed by code |
| `${funnelData}` | Data | Umami goals/funnels feature | Operator (human) — drives UX decisions |
