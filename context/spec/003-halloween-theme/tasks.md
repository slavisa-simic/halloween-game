# Tasks: Halloween Theme

Spec: [./functional-spec.md](./functional-spec.md) · [./technical-considerations.md](./technical-considerations.md)

Five vertical slices. Each one leaves the game runnable with a visible increment. The final slice runs the acceptance pass. Implementation uses `typescript-canvas-game`; the regression slice uses `testing-expert`.

---

- [ ] **Slice 1: Night sky backdrop + moon disc (static)**

  > A dark sky and a bright moon appear behind the running game. Cacti still look like cacti for now; everything else plays the same.
  - [ ] Add the new tuning entries to `src/tuning.ts`: `PALETTE.moon = '#f6e58d'`, `PALETTE.cloud = '#2a3660'`, `PALETTE.pumpkinOrange = '#ff8c00'`, the `MOON` object and the `CLOUDS` object per technical-considerations §2.2. `PALETTE.night` is already present. **[Agent: typescript-canvas-game]**
  - [ ] Create `src/features/night-sky.ts` exporting `installNightSky({ renderer }): () => void` that registers a `background`-layer draw filling the whole 800×300 game area with `PALETTE.night`. Follow the puddle feature's shape. **[Agent: typescript-canvas-game]**
  - [ ] Create `src/features/moon.ts` with the full feature skeleton: `installMoon({ game, renderer }): () => void` subscribing to `start`/`restart` (reset), `land` (wobble trigger — stored but no visible effect yet), and `milestone` (growth tween — stored but no visible effect yet). For this slice the drawn moon is a static disc at `(MOON.centerX, MOON.centerY)` with radius `MOON.baseRadius` in `PALETTE.moon`, drawn as horizontal `fillRect` scanlines. **[Agent: typescript-canvas-game]**
  - [ ] Wire `installNightSky({ renderer })` and `installMoon({ game, renderer })` into `src/main.ts` right before the existing `installPuddle` line. **[Agent: typescript-canvas-game]**
  - [ ] Verify: run `npm test`. Start `npm run dev` in the background (record PID), open `http://localhost:5173/?seed=42` in the Playwright MCP, confirm the night sky backdrop and the moon disc render behind the running dinosaur and cacti. Stop the dev server by PID. Delete any screenshots or recordings produced. **[Agent: typescript-canvas-game]**

- [ ] **Slice 2: Clouds drift across the sky**

  > Clouds appear in the sky and drift from right to left at a slower pace than the ground. The seeded cloud sequence is reproducible. The sky is never empty of clouds for long.
  - [ ] Create `src/features/clouds.ts` exporting `installClouds({ game, renderer }): () => void`. Owns a cloud list and a `Rng` seeded via `createRng(state.seed ^ CLOUDS.salt)`. On `start`/`restart` reseed and refill with `CLOUDS.initial` clouds. On each `tick`, scroll every cloud by `state.speed * CLOUDS.speedFactor` leftward, retire clouds past the left edge, spawn replacements from the right. Draw on `parallax` as two or three stacked `fillRect`s per cloud in `PALETTE.cloud`. **[Agent: typescript-canvas-game]**
  - [ ] Wire `installClouds({ game, renderer })` into `src/main.ts` after `installMoon`. **[Agent: typescript-canvas-game]**
  - [ ] Verify: run `npm test`. Start `npm run dev` in the background (record PID), open `http://localhost:5173/?seed=42` in the Playwright MCP, confirm clouds visibly drift leftward and are slower than the ground. Reload on `?seed=42` and confirm the first cloud positions match the previous load. Stop the dev server by PID. Delete artifacts. **[Agent: typescript-canvas-game]**

- [ ] **Slice 3: Pumpkins replace cacti**

  > Obstacles are now orange pumpkins. The game plays identically to spec 001 on the same seed; only the drawn shape and colour differ.
  - [ ] Modify `src/sprites.ts`: rename `CACTUS_SMALL`/`CACTUS_LARGE` to `PUMPKIN_SMALL`/`PUMPKIN_LARGE` and redraw as pumpkin silhouettes with the exact same dimensions (17×35 small, 25×50 large). Rename `CACTUS_SMALL_HITBOX`/`CACTUS_LARGE_HITBOX` to `PUMPKIN_SMALL_HITBOX`/`PUMPKIN_LARGE_HITBOX` with the exact same rectangles. Rename `Sprites.cactusSmall`/`cactusLarge` to `pumpkinSmall`/`pumpkinLarge`. Update `obstacleSprite(kind)` accordingly. **[Agent: typescript-canvas-game]**
  - [ ] Modify `src/render.ts`: add an optional 5th `fillStyle` parameter to `drawSprite` defaulting to `PALETTE.fg`. Update the built-in `drawObstacles` to pass `PALETTE.pumpkinOrange`. Every other call site keeps the default. **[Agent: typescript-canvas-game]**
  - [ ] Update `tests/sprites.test.ts` to assert `Sprites.pumpkinSmall`/`pumpkinLarge` exist with the expected dimensions and hitboxes. Update `tests/render.test.ts` for the obstacle fill colour (if it asserts the fill). **[Agent: typescript-canvas-game]**
  - [ ] Verify: run `npm test`. Start `npm run dev` in the background (record PID), open `http://localhost:5173/?seed=42` in the Playwright MCP, confirm obstacles are orange pumpkins against the night sky and the dinosaur still crashes and the pace still rises as on the plain game. Stop the dev server by PID. Delete artifacts. **[Agent: typescript-canvas-game]**

- [ ] **Slice 4: Moon reacts to `land` (wobble) and `milestone` (grow)**

  > Every time the dinosaur lands, the moon wobbles briefly. Every time the score crosses a multiple of 100, the moon grows a little bigger, capped at half the game-area height. Resets on restart.
  - [ ] Extend `src/features/moon.ts`: the `land` handler sets `wobbleStartTick = state.tick`; the draw callback applies a damped-sine horizontal offset to the moon's drawn centre for `MOON.wobbleTicks` after that tick (see technical-considerations §2.4). The `milestone` handler starts a growth tween `(fromRadius, toRadius = min(MOON.maxRadius, currentRadius * MOON.growFactor), startTick)`; the draw callback lerps `currentRadius` across `MOON.growTicks` ticks. Both state fields reset on `start`/`restart`. **[Agent: typescript-canvas-game]**
  - [ ] Create `tests/moon.test.ts` (the mandatory new unit test per functional-spec §3 In-Scope). Prove RED first (write a test, run it against the pre-slice `moon.ts`, confirm failure, then land the slice's code and show it passes). Cover: `land` triggers a non-zero drawn centre offset that settles after `MOON.wobbleTicks`; a `jump` without `land` leaves the offset at zero; `start`/`restart` clear the wobble; `milestone` triggers a growth tween that reaches `fromRadius * MOON.growFactor` after `MOON.growTicks`; a second `milestone` compounds; the growth caps at `MOON.maxRadius`; `restart` resets the radius to `MOON.baseRadius`. **[Agent: typescript-canvas-game]**
  - [ ] Verify: run `npm test` (the full suite — the new tests must pass; existing acceptance and regression tests must still pass). Start `npm run dev` in the background (record PID), drive through the Playwright MCP: open `http://localhost:5173/?seed=42`, press SPACE repeatedly to clear a run and reach several milestones, confirm the moon visibly wobbles on each landing and has visibly grown by score 300. Stop the dev server by PID. Delete artifacts. **[Agent: typescript-canvas-game]**

- [ ] **Slice 5: Feature Testing & Regression**

  > Verifies the whole feature end-to-end against functional-spec.md, run after all implementation slices are complete.
  - [ ] Read functional-spec.md acceptance criteria in full. Confirm each criterion is covered by an existing test or by `tests/moon.test.ts`. Where a criterion has no coverage, add an acceptance-level test with RED validation and annotate it with `@spec: 003-halloween-theme` and `@regression`. **[Agent: testing-expert]**
  - [ ] Run `npm test`. All must pass. If a pre-existing test now fails (for example `tests/render.test.ts` because of the obstacle fill colour change), update it to match the new spec rather than reverting the implementation. **[Agent: testing-expert]**
