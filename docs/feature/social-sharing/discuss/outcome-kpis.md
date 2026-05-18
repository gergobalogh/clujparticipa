# Outcome KPIs — social-sharing

| KPI | Target | Measurement method | Baseline |
|-----|--------|--------------------|----------|
| Share actions per week | ≥ 20 share events/week within 4 weeks of launch | Umami custom event `idea_share` (aggregated across all channels) | 0 (no share feature exists) |
| Share-driven visits | ≥ 5% of total visits arrive via utm_source params within 4 weeks | Umami: pageviews where `utm_source` is whatsapp, facebook, or copy | 0% (no UTM tags exist) |
| WhatsApp vs. Facebook ratio | WhatsApp share clicks ≥ 3x Facebook | Umami: `idea_share` events grouped by channel | N/A |
| OG preview click-through rate | ≥ 15% of users who see a shared link preview click through | (Requires destination-side analytics — proxy: utm_source visits / estimated shares) | N/A |
| Copy-link usage vs. direct share | ≥ 30% of shares use copy-link (not WhatsApp/Facebook) | Umami: `idea_share` events grouped by channel | N/A |

**Notes**:
- The 5% share-driven visits target is conservative for a civic app — social-driven growth typically starts slow and compounds.
- WhatsApp ≥ 3x Facebook is based on Romanian social media usage patterns (WhatsApp dominant for group communication).
- These KPIs feed directly into Umami event tracking (existing infrastructure from `umami-analytics` feature).
