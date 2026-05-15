# Outcome KPIs — clujparticipa-redesign

| KPI ID | KPI | Target | Measurement Method | Outcome Linked |
|--------|-----|--------|-------------------|----------------|
| KPI-1 | Pipeline engagement rate | >80% of idea detail page visitors see the pipeline section (scroll depth past pipeline) | Client-side scroll depth tracking | O1 |
| KPI-2 | Return visit rate for submitters | >30% of idea submitters return to check their idea within 14 days | Participant token + page view analytics | O1, O2 |
| KPI-3 | Homepage → idea detail CTR | >20% increase vs current baseline | Link click tracking on idea cards | O3 |
| KPI-4 | Timeline expansion rate | >5% of idea detail visitors expand the status change timeline | Client-side click tracking on "View full history" | O2 |
| KPI-5 | District-filtered page views | >20% increase after map-first homepage | District filter usage analytics | O4 |
| KPI-6 | Notification opt-in rate | >10% of idea submitters enable notifications | Browser permission API result tracking | O1 |
| KPI-7 | Exception state recovery action rate | >0% of rejected/returned ideas get a follow-up action (resubmit or support similar) | CTA click tracking on recovery buttons | O2 |
| KPI-8 | Time to understand platform purpose | <30 seconds for new visitors (measured by time-to-first-scroll on homepage) | Scroll event timing on homepage | O3 |

## Measurement infrastructure

All KPIs require client-side event tracking. Current app has no analytics. Recommended approach:
- Add lightweight event tracking (Umami self-hosted or Plausible, both privacy-friendly and GDPR-compliant)
- Track events: page_view, pipeline_view, timeline_expand, notification_grant, cta_click
- No PII in analytics — participant tokens are hashed before persistence per CLAUDE.md
