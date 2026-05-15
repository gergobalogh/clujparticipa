# ADR-001: Motion Library and Serif Font Selection

## Status: Accepted

## Context

The editorial-redesign feature requires entrance animations (sidebar slide, map fade+scale, card stagger) and an editorial serif font for headings. The cp-example reference uses `motion` v12 (imported from `motion/react`) and Playfair Display (loaded via CSS `@import` from Google Fonts CDN). The current codebase has no animation library and uses Geist Sans + Geist Mono via `next/font/google`.

## Decision

1. **Install `motion` v12.x** and import from `motion/react` — matching the cp-example's approach.
2. **Add Playfair Display via `next/font/google`** (not CSS `@import`) — diverging from cp-example for performance and CLS prevention.
3. **Replace Geist Sans with Inter via `next/font/google`** — matching the cp-example's body font.

## Alternatives Considered

### Motion library
- **`framer-motion` v11**: Legacy package. `motion` v12 is its successor with identical API. Rejected: older major, same API under different name.
- **CSS-only animations** (`@keyframes` + Tailwind `animate-*`): Cannot express stagger (requires JS delay per index) or `whileHover`/`whileTap` interactive animations. Rejected.
- **`gsap`**: Overkill for entrance animations. Larger bundle (~23KB gzipped). Rejected.

### Serif font
- **CSS `@import` from Google Fonts CDN** (cp-example approach): Render-blocking external request, no subsetting, CLS risk. Rejected: `next/font` eliminates these.
- **Source Serif 4**: Zero references in actual codebase. Lighter but does not match editorial target. Rejected.
- **Georgia (system serif)**: Zero download but lacks editorial character. Rejected.

### Sans font
- **Keep Geist Sans**: Geometric Vercel-brand font, does not match editorial Inter aesthetic. Rejected.
- **System font stack**: Inconsistent rendering. Rejected.

## Consequences

- **Positive**: `motion` v12 is tree-shakeable (~18KB gzipped), no hydration issues with `use client`. Playfair Display via `next/font`: auto-subset (~30KB woff2), `font-display: swap`, zero CLS, self-hosted. Inter via `next/font`: same benefits (~20KB woff2).
- **Negative**: Net new client weight ~53KB (after Geist Sans removal saves ~15KB). Three new npm deps: `motion`, `lucide-react`.
- **Risk**: `motion` v12 is relatively new. Mitigated by: re-export of framer-motion v12 with same mature core; API surface we use (motion.div, motion.button, initial/animate/transition) is most stable part.
