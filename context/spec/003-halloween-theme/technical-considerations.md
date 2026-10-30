# Technical Specification: Halloween Theme

- **Functional Specification:** [./functional-spec.md](./functional-spec.md)
- **Status:** Draft
- **Author(s):** slavisa-simic

---

## 1. High-Level Technical Approach

A cosmetic re-skin layered on top of the core game. The simulation is untouched — no change to `game.ts`, `obstacles.ts`, `physics.ts`, `collision.ts`, `score.ts`, `events.ts`, `types.ts`, `input.ts`, `input-dom.ts`, `store.ts`, `rng.ts`, `assert.ts`. The frozen testing contract in architecture §3 is preserved; `PALETTE` and `tuning.ts` grow additively.

Four changes land under `src/`:

1. **`src/sprites.ts`** — the two cactus bitmaps and their hitboxes are renamed and redrawn as pumpkin silhouettes (small 17×35, large 25×50 — same dimensions, same hitbox rectangles). The `obstacleSprite(kind)` picker returns the new sprites. Obstacle sizing and spawn geometry stay identical.
2. **`src/render.ts`** — the `drawSprite` helper gains an optional `fillStyle` parameter defaulting to `PALETTE.fg`. The built-in `drawObstacles` layer passes `PALETTE.pumpkinOrange`. Every other call site keeps the default.
3. **`src/tuning.ts`** — grows additively: `PALETTE.night`, `PALETTE.moon`, `PALETTE.cloud`, `PALETTE.pumpkinOrange`, plus the `MOON` and `CLOUDS` configuration objects.
4. **Three new features under `src/features/`** — `night-sky.ts`, `moon.ts`, `clouds.ts`. Each is an `installX({ game, renderer })` returning `dispose()`, following the puddle feature pattern (`src/features/puddle.ts`). `main.ts` installs them alongside the puddle.

Determinism: clouds draw their positions from a per-run `createRng(state.seed ^ CLOUDS.salt)`, reseeded on `start`/`restart`. Everything else is tick-driven (moon wobble, growth tween) or static.

Rendering: only existing public APIs are used — `renderer.addLayer(layer, draw)`, the `background`/`parallax`/`world`/`foreground`/`hud` layers, and the `DrawContext` surface. The moon is drawn as a disc approximated by horizontal `fillRect` scanlines.

No new runtime dependency, no new build-time dependency, no CI change, no `.gitignore` change.

---

## 2. Proposed Solution & Implementation Plan

### 2.1 Module changes under `src/`

| Path | Change |
| --- | --- |
| `src/sprites.ts` | Rename `CACTUS_SMALL`/`CACTUS_LARGE` bitmaps to `PUMPKIN_SMALL`/`PUMPKIN_LARGE` and redraw as pumpkin silhouettes (ribbed body + stem) with the exact same dimensions (17×35, 25×50). Rename `CACTUS_SMALL_HITBOX`/`CACTUS_LARGE_HITBOX` to `PUMPKIN_SMALL_HITBOX`/`PUMPKIN_LARGE_HITBOX` with the exact same rectangles. Rename `Sprites.cactusSmall`/`cactusLarge` to `pumpkinSmall`/`pumpkinLarge`. Update `obstacleSprite(kind)` to return the new sprites. The sprite internal names are not part of the frozen testing contract (architecture §3), only `ObstacleKind` is. |
| `src/render.ts` | Modify `drawSprite(ctx, sprite, x, y, fillStyle = PALETTE.fg)` to accept an optional `fillStyle` parameter. The built-in `drawObstacles` passes `PALETTE.pumpkinOrange`; all other call sites keep the default by not passing a 5th argument. |
| `src/tuning.ts` | Add `PALETTE.moon` (`'#f6e58d'`), `PALETTE.cloud` (`'#2a3660'`), `PALETTE.pumpkinOrange` (`'#ff8c00'`). `PALETTE.night` is already in place from an earlier step. Add `MOON` (`{ centerX, centerY, baseRadius, maxRadius, growFactor, growTicks, wobblePx, wobbleTicks }`) and `CLOUDS` (`{ speedFactor, initial, minY, maxY, minWidth, maxWidth, minHeight, maxHeight, minGapPx, maxGapPx, salt }`) as `as const` object exports. See §2.2 for values. |
| `src/features/night-sky.ts` | Create. `installNightSky({ renderer })` registers a `background`-layer draw that fills `(0, 0, CANVAS.width, CANVAS.height)` with `PALETTE.night`. Returns `dispose()`. Subscribes to no events. |
| `src/features/moon.ts` | Create. `installMoon({ game, renderer })` carries three closure fields: `currentRadius`, `wobbleStartTick` (nullable), and `growthTween` (nullable `{ fromRadius, toRadius, startTick }`). Subscribes: `game.on('start', reset)` and `game.on('restart', reset)` where `reset` returns `currentRadius` to `MOON.baseRadius` and nulls both wobble and growth state; `game.on('land', handler)` sets `wobbleStartTick` to the live state's tick; `game.on('milestone', handler)` starts a growth tween — `fromRadius = currentRadius`, `toRadius = min(MOON.maxRadius, currentRadius * MOON.growFactor)`, `startTick = state.tick`. Draws on `background` (after the night sky) as horizontal `fillRect` scanlines in `PALETTE.moon`, centred at `(MOON.centerX + wobbleOffsetX(state.tick), MOON.centerY)` with the current (tweened) radius. See §2.4 for the wobble and growth math. Returns `dispose()`. |
| `src/features/clouds.ts` | Create. `installClouds({ game, renderer })` carries a cloud list `{ x, y, width, height }[]` and a seeded `Rng`. On `start`/`restart` reseed `Rng = createRng(state.seed ^ CLOUDS.salt)` and refill the sky with `CLOUDS.initial` clouds spread across the width using the Rng. On each `tick`, scrolls every cloud leftward by `state.speed * CLOUDS.speedFactor`, retires clouds past the left edge, and spawns a replacement at the right whenever the trailing-rightmost cloud is more than `nextGap(rng)` pixels inside the right edge. Draws on `parallax` as two or three stacked `fillRect`s per cloud in `PALETTE.cloud`. Returns `dispose()`. |
| `src/main.ts` | Add imports for `installNightSky`, `installMoon`, `installClouds`. Call them (in that order) right before the existing `installPuddle` line, so the layer-draw order within each layer stays back-to-front: night sky → moon → clouds → (world built-ins) → puddle. No other change. |

### 2.2 Tuning additions

| Name | Starting value | Purpose |
| --- | --- | --- |
| `PALETTE.night` | `'#0b1026'` | Night-sky backdrop. (Already added.) |
| `PALETTE.moon` | `'#f6e58d'` | Moon disc fill. |
| `PALETTE.cloud` | `'#2a3660'` | Cloud rectangle fill. |
| `PALETTE.pumpkinOrange` | `'#ff8c00'` | Pumpkin obstacle fill. |
| `MOON.centerX` | `650` | Fixed resting-centre x (upper-right of the 800×300 area). |
| `MOON.centerY` | `60` | Fixed resting-centre y. |
| `MOON.baseRadius` | `20` | Starting radius. |
| `MOON.maxRadius` | `75` | Cap; diameter 150 = half of `CANVAS.height`. |
| `MOON.growFactor` | `1.05` | Compounding multiplier applied at each milestone (five percent per functional-spec §2.4). |
| `MOON.growTicks` | `18` | ~300 ms at 60 Hz. |
| `MOON.wobblePx` | `3` | Peak amplitude of the horizontal wobble, in logical px. |
| `MOON.wobbleTicks` | `12` | ~200 ms at 60 Hz. |
| `CLOUDS.speedFactor` | `0.3` | Cloud x-velocity ÷ `state.speed`. |
| `CLOUDS.initial` | `3` | Number of clouds pre-populated on `start`/`restart`. |
| `CLOUDS.minY` / `maxY` | `10` / `80` | Vertical band for cloud placement (above the ground, below the moon's rest centre). |
| `CLOUDS.minWidth` / `maxWidth` | `40` / `80` | Cloud base-rectangle width range. |
| `CLOUDS.minHeight` / `maxHeight` | `10` / `18` | Cloud base-rectangle height range. |
| `CLOUDS.minGapPx` / `maxGapPx` | `150` / `350` | Horizontal gap range between consecutive clouds (seeded). |
| `CLOUDS.salt` | `0x434C4F55` | XORed with `state.seed` to make the per-run cloud Rng. |

### 2.3 Rendering layer order after the change

| Layer | Draws (back to front) |
| --- | --- |
| `background` | night sky backdrop (full fill); moon disc. |
| `parallax` | clouds; puddle (unchanged position). |
| `world` | ground; obstacles (pumpkins, orange); dino. |
| `foreground` | (empty.) |
| `hud` | score; hint; game over. |

### 2.4 Logic & algorithm notes

#### Wobble (`src/features/moon.ts`)

Each draw, the moon's centre x is `MOON.centerX + wobbleOffsetX(state.tick)`:

- If `wobbleStartTick === null`, offset is 0.
- Let `elapsed = state.tick - wobbleStartTick`. If `elapsed < 0` or `elapsed >= MOON.wobbleTicks`, offset is 0 (also clear `wobbleStartTick` to `null` when `elapsed >= MOON.wobbleTicks`).
- Else `offsetX = MOON.wobblePx * sin((elapsed / MOON.wobbleTicks) * 2π * 2) * (1 - elapsed / MOON.wobbleTicks)` — a damped sine over the wobble duration, zero at `elapsed = 0` so a re-triggered wobble causes no snap.

Re-landing while wobbling: a fresh `land` event just overwrites `wobbleStartTick`.

#### Growth tween (`src/features/moon.ts`)

On `milestone`: set `growthTween = { fromRadius: currentRadius, toRadius: min(MOON.maxRadius, currentRadius * MOON.growFactor), startTick: state.tick }`.

Each draw, if `growthTween !== null`:

- `elapsed = state.tick - growthTween.startTick`.
- If `elapsed <= 0`, `currentRadius = growthTween.fromRadius`.
- Else if `elapsed >= MOON.growTicks`, `currentRadius = growthTween.toRadius`; clear the tween.
- Else `currentRadius = fromRadius + (toRadius - fromRadius) * (elapsed / MOON.growTicks)`.

Compounding (functional-spec §2.4 "about 1.1025 times, not 1.10"): automatic because every trigger multiplies the then-current radius.

Cap: when `currentRadius === MOON.maxRadius`, future triggers see `toRadius = currentRadius`; the tween is a no-op.

#### Reset on start/restart (`src/features/moon.ts`)

Clear `wobbleStartTick`, clear `growthTween`, set `currentRadius = MOON.baseRadius`. Simple and complete.

#### Moon disc drawing

The `DrawContext` has no `arc` / `beginPath`. Approximate a disc as horizontal `fillRect` scanlines:

```
for dy from -r to r:
  halfWidth = round(sqrt(r*r - dy*dy))
  fillRect(centerX - halfWidth, centerY + dy, halfWidth * 2 + 1, 1)
```

At `baseRadius = 20` and `maxRadius = 75`, the staircase edge is acceptable for the game's pixel-art aesthetic.

#### Cloud scrolling (`src/features/clouds.ts`)

On each `tick`:

- For every cloud: `cloud.x -= state.speed * CLOUDS.speedFactor`.
- Remove any cloud whose right edge (`x + width`) is less than 0.
- Let `rightmost = max(cloud.x + cloud.width)` over current clouds (or `-Infinity` if empty). If `rightmost < CANVAS.width - nextGap(rng)`, spawn a new cloud at `x = CANVAS.width`, with width/height/y drawn from the seeded Rng in the configured ranges.

Draw: for every cloud, three stacked `fillRect`s (base + two bumps) in `PALETTE.cloud`.

### 2.5 Testing-contract compatibility

- All frozen names in architecture §3 keep their shape and semantics.
- `PALETTE` gains fields; architecture §3 explicitly allows additive growth of such exports.
- `MOON`, `CLOUDS` are new `as const` object exports.
- The `GameEvent` union is unchanged. The features subscribe to `start`, `restart`, `land`, `milestone`, `tick` — all existing events.
- `window.__dino` is unchanged.

### 2.6 Tick-level mapping of acceptance criteria to tests

| Criterion | Test file | Technique |
| --- | --- | --- |
| §2.1 pumpkins, no cacti | `tests/sprites.test.ts` (update) | Assert `Sprites.pumpkinSmall` / `pumpkinLarge` exist with expected dimensions and hitboxes. |
| §2.1 seeded run matches plain game | existing `tests/game.acceptance.test.ts`, `tests/obstacles.test.ts` | Unchanged — this spec touches no simulation code; obstacle sizes/timings stay identical. |
| §2.1 crash on touch, near miss on daylight | existing `tests/collision.test.ts`, `tests/game.acceptance.test.ts` | Unchanged — hitbox rectangles are byte-identical. |
| §2.2 night sky visible on first draw | `tests/moon.test.ts` (new) or `tests/night-sky.test.ts` (new) | `fakeContext()` + install, render one frame, assert a `fillRect(0, 0, 800, 300)` in `PALETTE.night`. |
| §2.2 moon visible | `tests/moon.test.ts` | Install, render, assert scanlines around `(MOON.centerX, MOON.centerY)` in `PALETTE.moon`. |
| §2.2 clouds move slower than ground; sky stays populated; reproducible; frozen on death | `tests/clouds.test.ts` (optional for Tier 1) | Run with `collisions: false`, assert cloud x delta vs ground delta. Deferred as not strictly needed for Tier 1 scoring. |
| §2.3 wobble on land, not on jump, not on start/dead | `tests/moon.test.ts` | After a `land` event, inspect the drawn moon-centre x offset for ticks 0..`wobbleTicks`; assert offset is zero without a `land` event. |
| §2.4 moon grows at milestone, compounding, capped, resets | `tests/moon.test.ts` | Fire a `milestone` event via a stubbed bus or run the game long enough; assert radius sequence. |
| §2.5 preservation | existing `tests/game.acceptance.test.ts`, `tests/regression.acceptance.test.ts` | Unchanged. |
| §2.6 shrink-to-fit | existing `e2e/smoke.spec.ts` | Unchanged. |

For Tier 1 the mandatory new test (per the scoring brief) is `tests/moon.test.ts`, covering the wobble and growth logic.

---

## 3. Impact and Risk Analysis

- **Risk — pumpkin silhouette feels unfair.** A pumpkin is squatter than a cactus; even with identical bounding boxes, the visible shape could leave the hitbox feeling off. Mitigation: match the pumpkin silhouette's drawn pixels tightly to the existing hitbox rectangle (`PUMPKIN_SMALL_HITBOX = { x: 2, y: 0, width: 13, height: 35 }`). The outer columns and the top-most rows outside the hitbox are the stem/arm fringe; near-miss forgiveness is preserved.
- **Risk — `drawObstacles` colour change regresses `tests/render.test.ts`.** The test may assert the obstacle fill is `PALETTE.fg`. Mitigation: update the test to assert `PALETTE.pumpkinOrange` for obstacles; everything else (dino, ground, HUD) still fills `PALETTE.fg`.
- **Risk — moon disc looks blocky.** The `DrawContext` has no path APIs. Scanline approximation is good enough for the pixel-art aesthetic.
- **Risk — milestone fires at every 100 points for the whole run, including the capped moon.** The feature's cap is `MOON.maxRadius`; past that, `milestone` arrivals do not grow the moon further. No wasted frames.
- **Risk — `?seed=0` edge case.** `0 ^ CLOUDS.salt === CLOUDS.salt`, which is a valid mulberry32 seed, so no special-case needed.
- **No new runtime or build-time dependency; no CI change; no change to `localStorage`, `window.__dino`, or event ordering.**

---

## 4. Testing Strategy

- **Unit tests, Vitest in Node under `tests/`.**
  - `tests/moon.test.ts` (new, required): wobble starts on `land`, settles after `MOON.wobbleTicks`; no wobble on `jump` without `land`; growth starts on `milestone`, reaches `fromRadius * MOON.growFactor` after `MOON.growTicks`; compounds at the second milestone; caps at `MOON.maxRadius`; resets on `start`/`restart`.
  - `tests/sprites.test.ts` (update): the new `pumpkinSmall`/`pumpkinLarge` names, dimensions, hitboxes.
  - `tests/render.test.ts` (update): the obstacle fill is now `PALETTE.pumpkinOrange`.
  - Existing acceptance and regression tests (`tests/game.acceptance.test.ts`, `tests/regression.acceptance.test.ts`, `tests/obstacles.test.ts`, `tests/collision.test.ts`, `tests/score.test.ts`, `tests/puddle.test.ts`) must still pass — they are the preservation gate for §2.5.
- **RED validation.** The new `tests/moon.test.ts` is written and shown to fail before the feature's install path is wired, then shown to pass after.
- **No new Playwright test.** The existing smoke proves wiring; everything new is reachable in Node under Vitest.
- **`npm test` must pass end to end.** `/awos:verify` reads the acceptance criteria against the running game (dev server + Playwright MCP for the visual criteria, unit-test output for the logic criteria).

---

## 5. Open Technical Assumptions

- **Assumption:** `PALETTE.night` = `#0b1026`, `PALETTE.moon` = `#f6e58d`, `PALETTE.cloud` = `#2a3660`, `PALETTE.pumpkinOrange` = `#ff8c00`. Tunable at implementation time without changing any contract.
- **Assumption:** The moon's resting centre is `(650, 60)` — upper-right, well clear of the obstacle rail. A different position is a one-line change.
- **Assumption:** `MOON.growFactor` is `1.05` (five percent per milestone, per functional-spec §2.4). The earlier Draft used 1.01 per 10 clears; the simpler milestone trigger is paired with a larger step so the growth is visible by score 300.
- **Assumption:** The moon is drawn as a scanline-filled disc; the staircase edge is accepted as a pixel-art fit.
- **Assumption:** `tests/clouds.test.ts` is optional for Tier 1 — the single mandatory new test is `tests/moon.test.ts`.
