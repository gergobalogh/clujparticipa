# Shared Artifacts Registry — social-sharing

| Artifact | Type | Source | Consumer | Notes |
|----------|------|--------|----------|-------|
| `ideaId` | string | URL params (`/ideas/[id]`) | Share URL generation | Already in route |
| `shareUrl` | string | Constructed from ideaId + locale + UTM params | WhatsApp/Facebook intent URLs | Format: `/{locale}/ideas/{id}?utm_source={channel}` |
| `shareText` | string | Generated from idea data + i18n template | Pre-filled message body in intent URLs | Template: "{title} — {category}, {district}. Support this idea!" |
| `ogTitle` | string | `idea.title` | Next.js `generateMetadata` | Plain text, no HTML |
| `ogDescription` | string | `idea.description` (truncated 160 chars) + category/district | Next.js `generateMetadata` | Fallback if no description: "{category} idea in {district} — {supportCount} supporters" |
| `ogImage` | string | `idea.images[0].url` OR generated placeholder | Next.js `generateMetadata` | Next.js ImageResponse for placeholder with category color + title |
| `utmSource` | string | "whatsapp" \| "facebook" \| "copy" | Google Analytics / Umami | Tracks which share channel drove traffic |
