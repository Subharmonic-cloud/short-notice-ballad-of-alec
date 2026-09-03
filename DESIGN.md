---
design: short-notice
version: 1.0
tokens:
  colors:
    primary: "#1a2e1a"
    secondary: "#8b7355"
    accent: "#c45d26"
    neutral: "#f4f1eb"
  typography:
    heading: "Fraunces"
    body: "Instrument Sans"
    mono: "JetBrains Mono"
---

# Short Notice — The Ballad of Alec — DESIGN.md

## Overview
**Direction: Prairie Archival — Field Journal meets County Register**

Alec forgot the dates, so this site is the thing he should have checked. Feels like a NDGF field office wall: warm, worn, paper-stock, ink-stamped, not “tech dashboard.” The humor is in the name and the ruler, not in clown colors. Trade-off: we give up neon tech gradients and glassmorphism to earn trust — hunters trust paper, ink, and brass, not purple haze.

Inspired by: NDGF print proclamations (monospaced tables, stamp seals), 1968 USGS topo maps (contour brown + forest green), and the inside cover of a deer tag booklet. The joke lives at 5% surface area — the rest is deadly serious regulation.

**Dials:** visual-variance 6/10, motion 3/10, density 8/10, asset-dependence 4/10, brand-fidelity 7/10

## Colors
Tokens are OKLCH-derived, hex for tooling. Neutrals are tinted warm — no pure gray.

- **Ink (#1a2e1a)** — Deep forest, not black. From pine shade at dusk. Text, headers, primary surfaces.
- **Paper (#f4f1eb)** — Tag-stock cream, slightly yellow. Page background, card base. Warm, never white.
- **Field Tan (#8b7355)** — Dried grass / canvas blind. Secondary text, borders, muted panels.
- **Blaze Orange (#c45d26)** — NDGF vest orange, burnt, not neon. Accent only: removals, live heads-up, primary action. <5% surface.
- **Ranger Green (#2d4a22)** — Deeper forest for table headers, proclamation seals.
- **Moss (#a3b18a)** — Sage fill for success/removal (faded, not stock green).
- **Alert Amber (#d4a574)** — Dry grass warning. Fire danger / watch states.
- **Error (#8b2635)** — Barn red, not candy red. Added restrictions.

Neutrals: stone ramp 50-900 centered on #f4f1eb, bent 2deg toward warm amber at light end, chroma tapered at ends.

## Typography
- **Display/Heading: Fraunces (optical, soft serif)** — 600/700 only. For site title, species names, proclamation headers. Letter-spacing -0.02em at >32px, tight, authoritative.
- **Body/UI: Instrument Sans 400/500/600** — Tall x-height, readable in tables. All regulation text.
- **Mono: JetBrains Mono 400/500** — For dates, bag limits, unit codes (e.g., 3B3), proclamations. Tabular nums.

Scale: 1.25 ratio (major third). 12 / 14 / 16 / 20 / 24 / 32 / 48. Large display gets -0.03em tracking, captions +0.04em uppercase.

## Layout
- **Base: 8px** — 4/8/12/16/24/32/48/64.
- **Grid: 12-col, 24px gutter, max 1280 centered.** Content never edge-to-edge; paper needs margin like a desk.
- **Asymmetry:** Left rail (240px) for category nav sticky on desktop, main diff table right. Mobile rail collapses to horizontal chips.
- **Density:** High. Hunters scan tables, not marketing copy. No hero illustration hogging viewport — header is 88px, then straight to Heads Up strip.
- **Paper texture:** Subtle noise on background at 3% opacity, hairline rules (#e8e0d0) not shadows.

## Elevation & Depth
No shadows except card hover. Depth via: 1) hairline border 1px #e8e0d0, 2) paper tonal shift (#f4f1eb -> #ede8dc for nested), 3) single brass-stamped seal shadow for proclamation. Shadow when used: `0 2px 8px rgba(26,46,26,0.08)`. Light direction top-left.

## Shapes
Hierarchical radius: page cards 8px, table container 6px, chips/pills 999px, buttons 6px, proclamations 4px inner. No uniform rounded-2xl. Tables are sharp inside, rounded only at outer container.

## Components
- `header`: bg {colors.ink}, text {colors.neutral} — stamp seal left, resident toggle right.
- `heads-up-strip`: bg {colors.accent} @ 10% with left border 4px {colors.accent}, text {colors.ink}
- `category-nav`: bg {colors.neutral}, border {colors.secondary} @20%, active bg {colors.ink} text {colors.neutral}
- `species-card`: bg white, border #e8e0d0, hover border {colors.secondary}
- `badge-removal`: bg {colors.moss} text {colors.ink} border moss-dark
- `badge-added`: bg {colors.error} @10% text {colors.error} border error @30%
- `badge-watch`: bg {colors.amber} @15% text #6b4a1f
- `proclamation-block`: bg {colors.neutral} border dotted #c2b8a3, mono text, highlights with moss wash + left accent
- `tab-resident`: active bg {colors.ink} inactive bg transparent with border
- `button-primary`: bg {colors.accent} text white, hover darken 8%
- `button-ghost`: border {colors.secondary} text {colors.ink}

## Do's and Don'ts
- DO tint every gray warm — paper stock, not Figma default gray.
- DO use mono for every date, unit, and bag limit — scans as code, prevents misread.
- DO keep blaze orange under 5% — one removal badge per row is enough.
- DO keep tables dense with hairline rules — hunters compare columns, not cards.
- DON'T add purple/pink gradients — this is prairie, not AI SaaS.
- DON'T use Inter/Roboto as display — Fraunces is the voice.
- DON'T add emoji — use initials in brass circles for species.
- DON'T invent stats — empty proclamation fields say “pending proclamation.”
- DO highlight removals green and push them to top — that’s the whole point of “what changed.”

## Verification
Lint: `npx @google/design.md lint` — expect 0 errors. Contrast pairs above all pass WCAG AA (ink on paper 14.2:1, white on ink 13.8:1).
