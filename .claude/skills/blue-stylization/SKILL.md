---
name: blue-stylization
description: Project-wide visual design rule — use blue as both the primary and the accent colour in every new visual, UI element, feature overlay, chart, or stylistic choice this project introduces. Applies whenever work touches colour choice, palette constants, canvas fills, HUD painting, CSS, SVG, screenshots, docs mockups, chart colours, or any new cosmetic feature. Pair with `dataviz` when visualising data. Does not cover accessibility contrast ratios beyond the defaults named below — ask the user if a specific WCAG target is required.
---

# Blue Stylization

Every new visual decision in this project goes blue. The user has stated that **blue is both the primary and the accent colour for all future designs**. Treat that as a hard default: never introduce a new red, green, orange, yellow, or purple fill, stroke, text colour, or chart series without explicit user permission.

## When this skill fires

- Picking a colour for anything new: a HUD element, a cosmetic feature, a chart series, a status indicator, a CSS rule, a markdown badge, an SVG icon, a screenshot overlay.
- Editing `src/tuning.ts` `PALETTE` or any file that imports it.
- Adding a new entry to `src/features/` (puddle-style cosmetics).
- Changing `src/style.css` or `index.html` styling.
- Answering "what colour should X be?".

## The palette

Two blues, picked so they stay distinguishable against each other and against the existing `PALETTE.bg` off-white (`#f7f7f7`):

| Role | Hex | Notes |
| --- | --- | --- |
| Primary (foreground, text, outlines, main sprite fills) | `#1d4ed8` | Deep saturated blue. Replaces the current `PALETTE.fg` grey (`#535353`) in new work. |
| Accent (highlights, feature cosmetics, milestones, hover, selection) | `#60a5fa` | Lighter cyan-blue. Replaces the current `PALETTE.accent` red (`#c4302b`) in new work. |

Both read clearly on `#f7f7f7` and on each other. If you need a third tint (e.g. for a subtle fill behind text), interpolate between them — do not reach for a non-blue.

## How to apply

- **Game constants (`src/tuning.ts`):** when a new palette entry is added, define it as a blue. When an existing entry is retuned, pick a blue in the same role. Keep the names (`fg`, `accent`, …) — the architecture freezes those; only the values move. If the user asks to recolour the whole game, propose swapping `PALETTE.fg` → `#1d4ed8` and `PALETTE.accent` → `#60a5fa` and leave `PALETTE.bg` alone unless they ask.
- **Canvas drawing (`src/render.ts`, `src/features/*`):** read fill colours from `PALETTE` or from the feature's own `as const` blue constant — never a literal hex outside a constant. A feature that needs a one-off tint still names it (`PUDDLE_BLUE = '#60a5fa'`).
- **CSS (`src/style.css`, docs):** use `PALETTE.*` values if the file is TypeScript; use literal `#1d4ed8` / `#60a5fa` otherwise. Keep the page background neutral unless the user has asked for a tinted page.
- **Charts / data viz (if ever added):** series ramp between `#1d4ed8` and `#60a5fa` using uniform lightness steps, not arbitrary hues. For categorical palettes, insert a very dark blue (`#1e3a8a`) at the start and a very light blue (`#dbeafe`) at the end before interpolating — all blue, no colour wheel detours.
- **Screenshots / docs:** callouts, arrows, highlight boxes use `#60a5fa`.

## What NOT to do

- Do not keep the existing red puddle colour (`PALETTE.accent = '#c4302b'`) in a new design. If you touch the puddle feature, propose moving its colour to a blue tone (e.g. a cold-pool blue). The red is live code, not a new design — only act on it when the task explicitly touches it.
- Do not introduce accent colours in warm hues (red, orange, yellow). Even for "warning" or "danger" states, prefer a dark blue + bold weight combination over a red.
- Do not silently change `PALETTE` values on an unrelated task. The palette is frozen contract-adjacent: changing it affects every rendered pixel. Mention the change in the task's commit message when you do touch it.

## Deviations

If a specific brief genuinely needs a non-blue — a traffic-light status, a logo lockup, a themed cosmetic feature — ask the user first with a one-line proposal naming the colour and the reason. Default stays blue; explicit permission unlocks a one-off exception.
