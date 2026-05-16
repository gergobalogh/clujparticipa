# Journey: Operator Sets Up and Uses Analytics

## Visual Journey

```
┌─────────────────────────────────────────────────────────────────────────┐
│  OPERATOR ANALYTICS JOURNEY                                             │
├──────────┬──────────┬──────────┬──────────┬──────────┬─────────────────┤
│  Step 1  │  Step 2  │  Step 3  │  Step 4  │  Step 5  │    Step 6        │
│  Deploy  │  Verify  │  Check   │  Spot    │  Diagnose│  Act on          │
│  Umami   │  Data    │  Dash    │  Problem │  Funnel  │  Insight         │
│  server  │  flows   │  board   │          │          │                  │
├──────────┼──────────┼──────────┼──────────┼──────────┼─────────────────┤
│  😐      │  😟→😊   │  😊      │  😟      │  😟→🤔   │  🤔→😊          │
│  focused │  anxious │  curious │  worried │  digging│  decisive        │
│          │  then    │          │          │  then    │                  │
│          │  relieved│          │          │  focused │                  │
└──────────┴──────────┴──────────┴──────────┴──────────┴─────────────────┘

Shared artifacts:
  ${umamiUrl} → Step 1 produces → consumed by Steps 2-6
  ${consentStatus} → Step 2 produces → consumed by Steps 3-6
  ${dashboardUrl} → Step 3 produces → consumed by Steps 4-6
  ${funnelData} → Step 5 produces → consumed by Step 6
```

## Steps

### Step 1: Deploy Umami server
- **Action**: Configure and deploy self-hosted Umami instance (or point to Umami Cloud)
- **Expected output**: Running Umami instance at `${umamiUrl}`, admin login works
- **Emotional state**: focused (routine infra work)
- **Artifacts produced**: `${umamiUrl}`
- **Artifacts consumed**: —

### Step 2: Verify data flows
- **Action**: Add Umami tracking script to Next.js layout, visit site, check Umami dashboard for pageview
- **Expected output**: First pageview appears in Umami within seconds
- **Emotional state**: anxious → relieved (does it work?)
- **Artifacts produced**: `${consentStatus}` (tracking works end-to-end)
- **Artifacts consumed**: `${umamiUrl}`

### Step 3: Check dashboard
- **Action**: Open Umami dashboard, see pageviews, referrers, top pages
- **Expected output**: Real-time and historical pageview data with locale paths visible
- **Emotional state**: curious (first time seeing real data)
- **Artifacts produced**: `${dashboardUrl}` (bookmarked)
- **Artifacts consumed**: `${umamiUrl}`, `${consentStatus}`

### Step 4: Spot problem
- **Action**: Notice anomaly — e.g., high bounce rate on idea detail, low vote button clicks, nobody uses the map page
- **Expected output**: Data shows a specific page or action with unexpectedly low engagement
- **Emotional state**: worried (something is wrong)
- **Artifacts produced**: —
- **Artifacts consumed**: `${dashboardUrl}`

### Step 5: Diagnose funnel
- **Action**: Use Umami's funnel/goals feature to trace the journey: landing → idea list → idea detail → vote
- **Expected output**: Funnel shows exact step where users drop off
- **Emotional state**: digging → focused (narrowing the problem)
- **Artifacts produced**: `${funnelData}`
- **Artifacts consumed**: `${dashboardUrl}`, `${consentStatus}`

### Step 6: Act on insight
- **Action**: Make UX change based on data, tag it in Umami as a goal, measure improvement
- **Expected output**: Before/after comparison shows the fix worked (or didn't)
- **Emotional state**: decisive (data-backed action)
- **Artifacts produced**: —
- **Artifacts consumed**: `${funnelData}`, `${dashboardUrl}`

## Error paths

| Error | Trigger | Recovery |
|-------|---------|----------|
| Umami server down | Deploy fails or container crashes | Fallback: tracking script is no-op, site works without analytics. Alert operator via uptime monitor. |
| No data appears | Script loaded but events don't fire | Check: CORS, ad blockers, consent gate. Debug via browser devtools network tab. |
| Consent blocking all data | Consent banner not shown or all users opt out | Verify consent component renders. Track anonymous pageviews even without consent (Umami's cookieless model may allow this — confirm with GDPR). |
