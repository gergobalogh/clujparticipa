# Outcome KPIs — umami-analytics

| KPI | Target | Measurement method | Timeframe |
|-----|--------|--------------------|-----------|
| Consent opt-in rate | ≥60% of first-time visitors accept | Count "accepted" vs "declined" in localStorage (sampled via consent_changed events in Umami) | 2 weeks post-launch |
| Pageview coverage | ≥95% of routes emit pageviews | Compare Umami page count vs expected route count (13 routes) | 1 week post-launch |
| Custom event coverage | ≥6 distinct event types fire within first week | Count distinct event names in Umami Events tab | 1 week post-launch |
| Drop-off diagnosis time | Identify top drop-off step in funnel within 30 minutes of dashboard access | Operator self-report — can they answer "where do users drop off?" from Umami data? | 2 weeks post-launch |
| Page load impact | Umami script adds <100ms to LCP | Lighthouse comparison: before/after analytics on homepage | 1 week post-launch |
| Consent re-visit rate | ≥2% of users change consent from privacy page | Count consent_changed events with source=privacy-page in Umami | 4 weeks post-launch |
