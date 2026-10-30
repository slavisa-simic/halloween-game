# Functional Specification: Halloween Theme

- **Topic:** A Halloween re-theme of the Dino Runner. The ground-level cacti become orange pumpkins; the near-white background becomes a dark night sky with a bright moon and clouds drifting from right to left; the moon wobbles briefly every time the dinosaur lands from a jump; the moon grows slightly bigger each time the score reaches a new multiple of 100. Core gameplay — jump, pace rise, score, high score, restart, seeded replay — is untouched.
- **Status:** Draft
- **Author:** slavisa-simic

---

## 1. Overview and Rationale (The "Why")

The core game (spec 001) is intentionally plain: dark-grey shapes on a near-white backdrop. This re-themes it as a Halloween night so the game feels seasonal without changing how it plays. The player sees four changes: the obstacles on the ground are pumpkins instead of cacti; the sky is dark with a visible moon and drifting clouds; every time the dinosaur lands from a jump, the moon gives a small wobble; and every time the score crosses a milestone (every 100 points), the moon grows a little bigger. The seed-based replay keeps producing identical cactus-for-pumpkin spawn moments — only the drawing is different.

Two groups benefit. Mila the Player gets a seasonal skin. Nikola the Learner gets three well-contained cosmetic features (background, moon, clouds) and one obstacle re-skin, each layered on top of the core game via the existing feature pattern.

Success looks like: the game recognises as "the dino game, spooky edition" within one second; `?seed=42` produces the same gameplay as the plain game cactus-for-pumpkin; the moon visibly wobbles on each landing; the moon has visibly grown by the time the player reaches 300 points. `npm test` passes.

---

## 2. Functional Requirements (The "What")

### 2.1 Pumpkins replace cacti as the ground obstacle

- Every ground obstacle is drawn as an orange pumpkin instead of a dark-grey cactus. The small and large sizes stay. Groups of up to three stand side by side exactly as before. The silhouette fits the hitbox the player already knows; near-miss forgiveness and crash detection are unchanged.
  - **Acceptance Criteria:**
    - [ ] When a run starts, then the obstacles on the ground are orange pumpkins and no cactus silhouettes are drawn anywhere.
    - [ ] Given the player opens the page with `?seed=42`, when they play a run on this theme and compare with the plain game on the same seed, then every obstacle arrives at the same moment, in the same size (small or large) and in the same grouping (single or group of up to three) — only the shape and colour drawn differ.
    - [ ] When any part of the dinosaur's body touches any part of a pumpkin, then the run ends on that same frame, exactly as a cactus collision used to end it (crash detection is unchanged).
    - [ ] When the dinosaur passes a pumpkin with visible night sky between its body and the pumpkin, then the run continues (near-miss forgiveness is unchanged).

### 2.2 Night sky with a moon and drifting clouds

- The near-white background is replaced by a dark night sky filling the game area behind the ground. A bright, round moon sits in the upper part of the sky at a fixed spot — it does not scroll with the ground. Clouds drift slowly from right to left in front of the moon, slower than the ground scrolls, so the sky reads as deep.
  - **Acceptance Criteria:**
    - [ ] When the page opens, then the sky is clearly dark (noticeably darker than the ground), a bright round moon is visible in the upper part of the game area, and at least one cloud is drifting across the sky.
    - [ ] When the dinosaur is running, then the moon stays in the same spot (it does not scroll with the ground) and clouds move leftward at a clearly slower pace than the ground scrolls.
    - [ ] When a cloud passes the left edge of the game area, then it is gone and a new cloud eventually appears from the right, so the sky is never empty of clouds for long.
    - [ ] Given a crash has just happened, when the game-over screen is showing, then the sky, moon and clouds are frozen (the clouds stop drifting; the moon stays where it was).

### 2.3 The moon wobbles when the dinosaur lands

- Every time the dinosaur comes back down to the ground after a jump, the moon gives a brief wobble: a small back-and-forth motion of a few pixels across about 200 ms, then it settles back to its resting position. The wobble is only the moon; the sky, clouds, ground, dinosaur, pumpkins and score counter do not move with it.
  - **Acceptance Criteria:**
    - [ ] When the dinosaur lands back on the ground after a jump, then the moon wobbles briefly (a small back-and-forth of a few pixels for about 200 ms) and settles.
    - [ ] When the dinosaur lifts off into a jump, then the moon does not wobble on lift-off (only on landing).
    - [ ] When the moon is wobbling, then the sky, clouds, pumpkins, dinosaur, ground and score stay still.
    - [ ] Given the dinosaur is on the start screen or the game-over screen and has not just landed, when the player looks at the moon, then the moon is still.

### 2.4 The moon grows a little bigger at every milestone

- Every time the score reaches a new multiple of 100 (the existing milestone in spec 001), the moon grows by five percent of its current size, over a short smooth tween of about 300 ms. The moon stays centred on the same point as it grows. The moon is capped so its diameter never exceeds half the game area height. A new run after a crash resets the moon to its base size.
  - **Acceptance Criteria:**
    - [ ] Given a run has just started, when the player looks at the sky, then the moon is at its base size.
    - [ ] When the score reaches 100 for the first time in a run, then the moon grows smoothly over about 300 ms to a size five percent larger than its previous size.
    - [ ] When the score reaches 200, then the moon grows again by another five percent of its then-current size (so compounding: about 1.1025 times its base size, not 1.10).
    - [ ] Given the moon's diameter has reached half the game area height, when the score crosses more milestones, then the moon stays at that maximum size and does not grow further.
    - [ ] When the moon grows, then its centre point stays in the same place in the sky (it grows outward from its centre).
    - [ ] When a new run starts after a crash, then the moon returns to its base size.

### 2.5 Gameplay rules from spec 001 are preserved

- Every rule the player can feel from spec 001 — jump height and duration, obstacle arrival timing, pace rise to about twice the starting pace by 90 seconds, five-digit score counter, blink at every 100 points, `HI` best score, one-key restart, seeded replay — stays as it is.
  - **Acceptance Criteria:**
    - [ ] Given `?seed=42`, when the player plays a run on this theme and a run on the plain game, then every obstacle arrives at the same moment, in the same size and grouping; only the drawing of the obstacle and the background differ.
    - [ ] When the dinosaur jumps, then it lands back on the ground about 0.6 seconds later, exactly as in the plain game.
    - [ ] When the score climbs during a run, then it increases at the same rate; the five-digit display and the blink at every 100 points behave as in the plain game.
    - [ ] When the player restarts after a crash, then the new run begins within half a second — the moon returns to its base size, clouds reset to a fresh starting pattern, and the dinosaur starts running at the starting pace.

### 2.6 The game area shape and shrink-to-fit are unchanged

- The 800-by-300 game area, its shrink-to-fit rule in small windows and its centring (spec 001 §2.9) stay as they are. The night sky, moon, clouds and pumpkins fit within the same frame.
  - **Acceptance Criteria:**
    - [ ] When the page opens in any supported window size, then the game area still fits inside the window with a small margin, keeps its 800-by-300 landscape shape (or a proportional smaller copy), stays centred, and the page does not scroll sideways.

---

## 3. Scope and Boundaries

### In-Scope

- Pumpkins (small and large, singles and groups of up to three) drawn in orange with the same sizes, groupings, gaps, arrival moments and hitboxes as the cacti they replace.
- A dark night sky filling the background behind the ground.
- A fixed-position bright moon in the upper part of the sky.
- Clouds drifting slowly from right to left in front of the moon, slower than the ground.
- A short few-pixel wobble of the moon on every landing from a jump (reaction to the `land` event).
- A compounding five-percent growth of the moon at every 100-point milestone (reaction to the `milestone` event), capped at half the game area height, resetting on restart.
- Preservation of jump timing, obstacle arrival moments, pace curve, score rate, five-digit score display, high-score persistence, one-key restart and seeded-run reproducibility.
- The 800-by-300 game area, shrink-to-fit rule and centring from spec 001 §2.9 are unchanged.
- At least one new unit test file exercising the new logic (the moon's wobble and growth).

### Out-of-Scope

- Sound and music.
- A full day/night cycle, stars, weather (rain, snow, lightning).
- Bats, ducking, the witch's hat, candies, hearts — Tier 2 and Tier 3 features of the workshop brief; not included in this spec.
- Pumpkin colour change based on how many have been cleared.
- Changing the game-over puddle's colour from its spec 001 red.
- Flying obstacles, ducking, pause, mouse/touch/gamepad input, mobile layout — unchanged from spec 001.
- Power-ups, lives, difficulty settings, leaderboards, accounts, sharing scores, localisation — unchanged from spec 001.
- Richer dinosaur animation beyond the existing two-frame run cycle and hit pose.
- A user-facing settings screen for the theme.
- Any gameplay-affecting change: nothing in sections 2.1 through 2.6 makes the game faster, slower, easier or harder.

---

## Change Log

_Dated amendments made after the spec was first written — typically by `/awos:spec` in Update Mode when a bug fix changed documented behavior. Each entry records the date, the source reference (bug id or fix description), and what behavior changed and why. Leave empty until the first amendment._

- **2026-10-30 — Scope reduction for ex7 Tier 1.** The earlier Draft covered an every-5-clears pumpkin colour change and a puddle recolour tied to the current pumpkin colour; both are removed. The time-based change the brief asks for is now the moon's five-percent growth at every 100-point milestone, which uses the existing `milestone` game event instead of a new clear-counter utility. The reactive wobble on `land` stays. The two event reactions required by the Tier 1 scoring are `land` (wobble) and `milestone` (growth). Why: ex7's Tier 1 budget was 30 minutes of implementation — the earlier Draft's colour-fade and clear-counter logic was too wide for that budget to land verified.
