# Shared Artifacts Registry — umami-analytics

| Artifact | Type | Source (single truth) | Consumers |
|----------|------|----------------------|-----------|
| `${umamiUrl}` | URL | Operator deploys Umami → env var `NEXT_PUBLIC_UMAMI_URL` | Tracking script in layout, operator dashboard |
| `${consentStatus}` | Boolean | Consent component writes to `localStorage` key `analytics-consent` | Umami script initialization, all event tracking calls |
| `${consentChoice}` | String ("accepted"\|"declined"\|"undecided") | Resident clicks Accept/Decline in consent notice | Consent component, privacy page toggle |
| `${dashboardUrl}` | URL | Operator bookmarks Umami dashboard | Operator (human) — not consumed by code |
| `${funnelData}` | Data | Umami goals/funnels feature | Operator (human) — drives UX decisions |
| `${trackingActive}` | Derived boolean | `${consentChoice}` === "accepted" AND script loaded | All `trackEvent()` calls check this before firing |
