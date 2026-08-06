# Design — CampusVoice (student-feedback)

A locked design system for this app. Every page redesign reads this file before
emitting code. Do not regenerate per page — extend or amend this file when the
system needs to grow.

## Genre
modern-minimal — the polished institutional-platform register (Stripe / Linear / ElevenLabs
school), not editorial and not playful. CampusVoice is a real product with two distinct
user classes (students, admins), not a content site.

## Macrostructure family

Three families, one per page-type. Pages within a family share the family's shape; they
vary only in component archetypes.

- **Marketing** (`/` only) — **Marquee Hero**. A single bold statement fills the fold, no
  competing enrichment. Below the fold: Features as a Bento-style tile grid (F1), How-It-Works
  as a numbered step sequence (F4 — submit → AI reads it → admin acts), a security/trust strip,
  one clean CTA band, Ft5 Statement footer.
- **App pages** (`/dashboard/*`, `/admin/*` — 9 routes) — Bento-sensibility (F1) for
  overview/summary tiles and quick actions; tabular spec-sheet voice (F3) for feedback lists,
  reports, and the students table. No enrichment — function carries these pages. The persistent
  sidebar + header shell is kept (correct pattern for a dashboard, not a landing nav) but
  restyled to the tokens below.
- **Auth** (`/login`, `/register`, `/admin-login`) — a plain centered-card utility pattern.
  Not one of the 21 landing macrostructures — these are single-task utility screens. No nav,
  no enrichment.

## Theme

Custom-tuned Coral (modern-minimal catalog theme, re-anchored to CampusVoice's existing
coral-adjacent "CV" mark rather than the stock swatch). Warm-grey paper, single coral accent,
Geist throughout, soft pill CTAs — see `tokens.css` for exact values.

- `--color-paper`    oklch(98% 0.004 60)
- `--color-paper-2`  oklch(96% 0.006 55)
- `--color-ink`      oklch(20% 0.012 40)
- `--color-ink-2`    oklch(42% 0.016 38)
- `--color-rule`     oklch(89% 0.008 50)
- `--color-accent`   oklch(62% 0.19 32)
- `--color-focus`    oklch(62% 0.19 32)

Semantic status/sentiment tokens (`--color-positive`, `--color-negative`, `--color-pending`,
`--color-reviewed` + matching `-bg` pairs) are defined in `tokens.css` — muted, not saturated
flag-colours, in keeping with the restrained register. Use these, not raw Tailwind
`yellow-600`/`green-500`/etc., for status badges, sentiment badges, and rating dots.

## Typography

- Display: Geist, weight 600, tracking -0.02em
- Body: Geist, weight 400
- Mono (`--font-outlier`): Geist Mono — ratings, matric numbers, dates, stat tiles, table numerics
- Type scale anchor: `--text-display` = `clamp(2.5rem, 5vw + 0.5rem, 4.75rem)` (marketing hero only;
  app pages cap at `--text-2xl` for section heads, never the display scale)

## Spacing

4-point named scale (`--spacing-3xs` … `--spacing-3xl`), values in `tokens.css`. Pages must
use named tokens (`gap-md`, `p-lg`, or `var(--spacing-md)`), never raw rem/px values.

**Width/max-width exception:** Tailwind v4 resolves `max-w-{name}`/`w-{name}` for
xs/sm/md/lg/xl/2xl/3xl through this same spacing scale, so those specific size names produce
tiny (gap-sized) widths, not real container widths. Use an explicit arbitrary value for layout
width instead (`max-w-[30rem]`), never the named scale below `4xl`. `max-w-4xl` and above use a
separate, unaffected scale and are safe as-is.

## Motion

- Easings: `--ease-out` / `--ease-in` / `--ease-in-out`, named in `tokens.css`.
- Reveal pattern: marketing page only, reusing the existing `.fade-in-hidden`/`.fade-in-visible`
  + `FadeInSection` IntersectionObserver mechanism already in the codebase — no new dependency.
- App pages: **no reveal animation**. They should feel instant, not composed-in.
- Reduced-motion fallback: opacity-only, ≤150ms, everywhere.

## Microinteractions stance

- Silent success — keep `react-hot-toast`, restyle to tokens, keep messages brief and factual
  (no celebratory copy).
- `:focus-visible` ring = `--color-focus`, ≥3:1 contrast, appears instantly (never animated in).
- No bounce/overshoot easings anywhere.

## CTA voice

- Primary: coral-filled pill (`--color-accent` fill, `--color-accent-ink` text, `--radius-pill`).
- Secondary: ink-outlined pill (transparent fill, `--color-ink` border + text).
- One button-shape system app-wide — no mixing filled-square buttons with pill buttons.

## Per-page allowances

- Marketing page MAY use one Tier-A/Tier-B enrichment on the hero (e.g. a small hand-built
  "voice/waveform" motif — thematically on-brand, not decorative filler).
- App pages MUST NOT use enrichment — function carries the page.
- Auth pages: typography + the CV wordmark only.

## What pages MUST share

- The "CV" wordmark/logotype and "CampusVoice" name.
- The coral accent and its restrained placement (chip highlights, primary CTAs, focus rings —
  not full-bleed colour fields).
- The Geist display + body pairing and Geist Mono for numerics.
- The CTA voice (pill shape, fill/outline pair, padding rhythm).
- Status/sentiment token colours (never ad-hoc Tailwind palette colours).

## What pages MAY differ on

- Macrostructure *within* a page-type family (e.g. an app page can lean more Bento or more
  tabular depending on its content — both still use the system's type/colour/CTA voice).
- Marketing-only enrichment (app pages never get it).

## Nav / footer

- **Marketing nav:** N1b SaaS three-section (replaces the current N1a — wordmark left, centered
  link cluster, Login + filled Sign-Up pill right, frosts on scroll).
- **Marketing footer:** Ft5 Statement (replaces the current Ft3 three-column index footer — one
  closing line under the wordmark instead of three link columns).
- **App shell nav:** persistent sidebar + header kept as-is structurally; active nav items get a
  pill highlight in `--color-accent` instead of the current flat `bg-blue-600` block.

## Exports

Drop-in formats for re-using this design system in other projects.

### tokens.css

The real, consumed file — see [`tokens.css`](tokens.css) at the project root. It's a Tailwind v4
`@theme` block, so its variables are both plain CSS custom properties (`var(--color-accent)`)
**and** generated Tailwind utilities (`bg-accent`, `text-ink`, `font-display`, `gap-md`, …).

### DTCG `tokens.json`

```json
{
  "$schema": "https://design-tokens.github.io/community-group/format/",
  "color": {
    "paper":     { "$value": "oklch(98% 0.004 60)", "$type": "color" },
    "paper-2":   { "$value": "oklch(96% 0.006 55)", "$type": "color" },
    "ink":       { "$value": "oklch(20% 0.012 40)", "$type": "color" },
    "ink-2":     { "$value": "oklch(42% 0.016 38)", "$type": "color" },
    "rule":      { "$value": "oklch(89% 0.008 50)", "$type": "color" },
    "accent":    { "$value": "oklch(62% 0.19 32)",  "$type": "color" },
    "focus":     { "$value": "oklch(62% 0.19 32)",  "$type": "color" },
    "positive":  { "$value": "oklch(62% 0.15 145)", "$type": "color" },
    "negative":  { "$value": "oklch(58% 0.20 25)",  "$type": "color" },
    "pending":   { "$value": "oklch(70% 0.14 75)",  "$type": "color" },
    "reviewed":  { "$value": "oklch(58% 0.12 250)", "$type": "color" }
  },
  "font": {
    "display": { "$value": "Geist, ui-sans-serif, system-ui, sans-serif", "$type": "fontFamily" },
    "body":    { "$value": "Geist, ui-sans-serif, system-ui, sans-serif", "$type": "fontFamily" },
    "outlier": { "$value": "Geist Mono, ui-monospace, monospace",        "$type": "fontFamily" }
  },
  "space": {
    "3xs": { "$value": "0.25rem", "$type": "dimension" },
    "2xs": { "$value": "0.5rem",  "$type": "dimension" },
    "xs":  { "$value": "0.75rem", "$type": "dimension" },
    "sm":  { "$value": "1rem",    "$type": "dimension" },
    "md":  { "$value": "1.5rem",  "$type": "dimension" },
    "lg":  { "$value": "2rem",    "$type": "dimension" },
    "xl":  { "$value": "3rem",    "$type": "dimension" },
    "2xl": { "$value": "4.5rem",  "$type": "dimension" },
    "3xl": { "$value": "7rem",    "$type": "dimension" }
  }
}
```

### shadcn/ui CSS variables

```css
:root {
  --background:         98%  0.004 60;   /* paper */
  --foreground:         20%  0.012 40;   /* ink */
  --primary:            62%  0.19  32;   /* accent */
  --primary-foreground: 99%  0.004 40;   /* accent-ink */
  --muted:              89%  0.008 50;   /* rule */
  --muted-foreground:   55%  0.014 45;
  --border:             89%  0.008 50;   /* rule */
  --input:              89%  0.008 50;
  --ring:               62%  0.19  32;   /* focus */
  --destructive:        58%  0.20  25;   /* negative */
  --radius:             8px;
}
```
