# Functional Specification: Make It Shine

- **Topic:** The second version of the Dino Runner, layered on top of the complete core game: scenery that scrolls past at different speeds, a sky that shifts tone over the course of a run, small particle effects on jumps and milestones, and a punchier crash — all without changing how the game plays. Blue is the colour that carries this new life (both the primary new-element tone and the accent).
- **Status:** Draft
- **Author:** slavisa-simic

---

## 1. Overview and Rationale (The "Why")

The core game (spec 001) is complete and fun on its own, but intentionally plain: dark grey shapes on a near-white background, no scenery, no scenery motion, no feedback beyond a frozen "GAME OVER" and a small red puddle. That plainness was deliberate for the first version — it kept the codebase approachable for learners and the first play session instantly recognisable. The product definition flags the next natural step as "make it shine": richer visuals that make the game feel alive without changing the controls or the rules.

This specification covers that step. It adds a layered sky with drifting clouds and distant hills that scroll past the dinosaur at different speeds; a slow day-to-dusk tint that deepens the sky as a run lasts longer; small puffs of dust under the dinosaur as it leaves and returns to the ground; a short screen shake and pale flash at the moment of a crash; and a brief sparkle around the score counter when a milestone is reached. Every new visible element in this version uses blue — a deep blue as its primary tone and a lighter blue as its accent — so the game reads as one coherent scene. The dinosaur, cacti, ground line and `GAME OVER` text keep their dark-grey silhouette so the game still reads as a faithful tribute to the "no internet" original; only the puddle under the dinosaur, which was the one coloured element in version 1, shifts from red to a cold-pool blue so the whole palette agrees.

The two groups from the product definition both gain from this. Mila the Player gets a game that still starts in under five seconds but now looks worth coming back to for a longer session. Nikola the Learner gets a well-contained set of cosmetic features that layer on top of the core — each one a small, self-contained feature they can read, change or remove without touching gameplay — exactly the shape the architecture already encourages.

Success looks like this. A first-time player on a fresh page notices the scenery moving at different speeds within the first few seconds. Over a run that lasts about a minute and a half, the sky visibly shifts from a bright morning blue to a deeper dusk blue. Every jump leaves a small puff at the dinosaur's feet, every crash lands with a brief shake and flash, every hundred points pops with a short sparkle. A player who plays the same seed on this version and on the plain version sees the same cacti arrive at the same moments, the same jumps clear the same gaps, and the same score climbs at the same rate — only the surroundings differ. A player whose browser is set to prefer reduced motion gets a quieter version where the shake, puffs, and sparkle are softened to simple fades, and the parallax layers slow down, so the game stays comfortable for them.

---

## 2. Functional Requirements (The "What")

### 2.1 Sky and clouds (background parallax)

- The game area has a soft blue sky as its backdrop instead of the near-white background used in the plain version. Clouds drift slowly from right to left across the sky.
  - **Acceptance Criteria:**
    - [ ] When the page opens, then the game area shows a soft blue sky filling the space behind the ground, with at least one cloud visible against it and the dinosaur standing on the ground in front.
    - [ ] When the dinosaur is running, then clouds move leftward at a clearly slower pace than the ground scrolls, so the sky looks farther away.
    - [ ] When a cloud passes the left edge of the game area, then it is gone and a new cloud eventually appears from the right edge, so the sky is never empty of clouds for more than a few seconds.
    - [ ] When the player opens the page on two different occasions with the same `?seed=` number, then the clouds appear in the same places at the same moments on both occasions.
    - [ ] When the player opens the page without a `?seed=` in the address, then the clouds appear in different places on each visit.

### 2.2 Distant and mid-distance scenery (foreground parallax)

- Behind the ground, the player sees a layer of distant blue mountains and a nearer layer of lighter-blue rolling hills. Both layers scroll past the dinosaur, with the distant layer moving slowest and the nearer layer moving faster — but both still slower than the ground.
  - **Acceptance Criteria:**
    - [ ] When the dinosaur is running, then at least three distinct scenery layers are visible between the sky and the ground (clouds, distant mountains, nearer hills), each moving leftward at a different speed, with closer layers moving faster than farther ones.
    - [ ] When a scenery piece passes the left edge of the game area, then it is gone and new scenery eventually appears from the right edge, so no layer is ever empty.
    - [ ] When the dinosaur jumps, then the scenery layers continue scrolling smoothly and the jump does not interrupt their motion.
    - [ ] When a run restarts after a crash, then every scenery layer resets to a fresh starting position (the mountains and hills the player saw at the moment of the crash are gone), as if the page had just loaded.

### 2.3 Day-to-dusk tint

- Over the course of a long run the sky deepens from a bright morning blue to a darker dusk blue, so a player who survives a long time sees the time of day change. The dinosaur, cacti, ground and text stay clearly readable at every stage.
  - **Acceptance Criteria:**
    - [ ] Given a run has just started, when the player looks at the sky, then it is a bright morning blue.
    - [ ] Given a run has lasted 90 seconds, when the player looks at the sky, then it is a visibly deeper blue than it was in the first 5 seconds.
    - [ ] Given a run is at any pace or stage, when a cactus approaches the dinosaur, then its dark silhouette stays clearly visible against the sky at that moment.
    - [ ] When a run restarts after a crash, then the sky returns to the bright morning blue regardless of how long the previous run lasted.
    - [ ] Given the sky is deepening during a run, when the player passes the one-minute mark, then the dusk shift is gradual (never a sudden switch between tones).

### 2.4 Dust puffs on jump and land

- A small puff of dust appears under the dinosaur's feet at the moment it leaves the ground, and again at the moment it lands. The puff is in the same light blue accent as the clouds, spreads out slightly as it fades, and does not block any gameplay element.
  - **Acceptance Criteria:**
    - [ ] Given the dinosaur is on the ground, when the player jumps, then a small light-blue puff appears at the dinosaur's feet at the moment of lift-off and fades away within about half a second.
    - [ ] When the dinosaur lands back on the ground after a jump, then a small light-blue puff appears at its feet and fades away within about half a second.
    - [ ] When no jump has just started or just ended, then no puff is visible.
    - [ ] Given the game is on the start screen or the game-over screen, when no run is in progress, then no puff is visible even if the dinosaur appears to be standing on the ground.
    - [ ] Given a puff is fading, when a cactus passes through the same patch of ground, then the cactus is drawn clearly in front of the puff (the puff never hides the cactus silhouette).

### 2.5 Crash feedback: shake and flash

- The moment the dinosaur hits a cactus, the game area shakes briefly and a pale blue flash washes across the screen. Both settle within a short, fixed time, leaving the frozen game-over screen the player already knows: `GAME OVER`, final score, high score, restart hint, and the puddle under the dinosaur.
  - **Acceptance Criteria:**
    - [ ] When the dinosaur hits a cactus, then the game area shakes briefly (short, back-and-forth motion of a few pixels for about a quarter of a second) and settles.
    - [ ] At the moment the dinosaur hits a cactus, then a pale blue flash appears across the whole game area and fades out within about 150 milliseconds.
    - [ ] When the shake and flash have finished, then the game area is completely still, `GAME OVER` and the "Press SPACE to restart" hint are visible, and nothing moves further until the player restarts.
    - [ ] When the player restarts after a crash, then neither the shake nor the flash plays on the fresh run until the next crash.
    - [ ] Given the shake is in progress, when the player presses SPACE or UP arrow, then the restart is accepted and the fresh run starts cleanly (the restart is never swallowed by the shake).

### 2.6 Milestone sparkle

- In addition to the existing score blink every 100 points, a short burst of light-blue sparkles appears briefly around the score counter at each milestone, drawing the eye to the score without hiding its digits.
  - **Acceptance Criteria:**
    - [ ] When the score reaches a multiple of 100, then a short burst of light-blue sparkles appears around the score counter and fades within about half a second.
    - [ ] While the sparkle is playing, then the five-digit score behind it is still clearly legible.
    - [ ] Given the score has not just crossed a multiple of 100, when the score updates, then no sparkle appears.
    - [ ] When the score is capped at `99999` and holds there, then no new sparkle plays each tick (the sparkle fired only when `99900 → 99999` was first crossed, if at all).

### 2.7 Puddle recolour on crash

- The small puddle under the dinosaur on the game-over screen (introduced in spec 001 §2.5) now spreads in a cold-pool blue instead of red, so the whole screen reads in one palette. Everything else about the puddle — size, timing, that it is gone on the next run — is unchanged.
  - **Acceptance Criteria:**
    - [ ] When the dinosaur crashes, then a small cold-blue puddle spreads out under its feet over about half a second and then stays at its full size while the game-over screen is showing.
    - [ ] When a new run starts after a crash, then the puddle is gone.
    - [ ] When the puddle is shown, then no red appears anywhere on the game area (the only colours on screen are blues, the dark grey of the dinosaur/cacti/text, and the near-white under the sky).

### 2.8 Gameplay is preserved

- Every rule the player feels — jump height and timing, cactus arrival moments, pace rise, score rate, high-score persistence, restart timing — stays exactly as it was in the plain game. "Make it shine" layers on top of the core without touching it.
  - **Acceptance Criteria:**
    - [ ] Given the player opens the page with `?seed=42`, when they play a run on this version and then on the plain version, then every cactus arrives at the same moment and the dinosaur's jumps clear the same gaps in both.
    - [ ] When the dinosaur jumps, then the jump height, airborne duration (about 0.6 seconds), and the smallest clearable gap are identical to the plain-game version.
    - [ ] When a run has lasted 30 seconds, then the pace is the same 1.3 times the starting pace as on the plain version; at 90 seconds it holds at about twice the starting pace.
    - [ ] When the score climbs during a run, then it increases at the same rate as the plain version (about 10 points per second at the starting pace).
    - [ ] When the player restarts after a crash, then the new run begins within half a second and plays exactly as a run started from the start screen, just like on the plain version.
    - [ ] When a run has lasted long enough for the sky to deepen fully, then the dinosaur, cacti and `GAME OVER` text are still clearly readable against the darker sky.

### 2.9 Reduced-motion comfort

- A player whose browser is set to prefer reduced motion sees a quieter version of this release. Clouds and the day-to-dusk tint stay, since they are gentle; parallax layers slow down; the shake and milestone sparkle are suppressed; dust puffs appear as a small soft fade instead of a puff; the crash flash still appears but shorter and dimmer.
  - **Acceptance Criteria:**
    - [ ] Given the player's browser or operating system is set to prefer reduced motion, when the game loads, then no screen shake plays on crashes and no sparkle plays at milestones.
    - [ ] Given the player's browser is set to prefer reduced motion, when the dinosaur jumps or lands, then a small soft fade appears at its feet (not an expanding puff), and the fade is gone within about half a second.
    - [ ] Given the player's browser is set to prefer reduced motion, when the dinosaur is running, then the distant mountains and hills move at a reduced pace compared with the default setting, while the clouds and ground continue to scroll normally.
    - [ ] Given the player's browser is NOT set to prefer reduced motion, when the game plays, then every effect in sections 2.1 through 2.6 appears at its full strength.
    - [ ] Given the player changes the reduced-motion preference while the page is open, when they continue to play without reloading, then the game keeps using the setting that was in effect when the page loaded; the new preference is picked up only after the player reloads the page.

### 2.10 The game area shape is unchanged

- The 800-by-300 game area, its shrink-to-fit rule in small windows, the centring and the no-sideways-scroll rule from spec 001 §2.9 all stay as they are. The new visuals fit within the existing frame.
  - **Acceptance Criteria:**
    - [ ] When the page opens in any supported window size, then the game area still fits inside the window with a small margin, keeps its 800-by-300 landscape shape (or a proportional smaller copy), stays centred, and the page does not scroll sideways.
    - [ ] When the player resizes the window during a run, then the game area refits as before and the scenery, sky tint, puffs, flashes and sparkles all continue uninterrupted.

---

## 3. Scope and Boundaries

### In-Scope

- A soft blue sky backdrop and drifting clouds (background parallax).
- Distant blue mountains and nearer blue hills behind the ground (foreground parallax), each scrolling at its own slower pace.
- A gradual day-to-dusk tint that deepens the sky over the course of a long run and resets on restart.
- Small light-blue dust puffs under the dinosaur's feet on jump lift-off and on landing.
- A short back-and-forth screen shake and a pale blue flash at the moment of a crash, resolving to the familiar frozen game-over screen.
- A short light-blue sparkle around the score counter at every 100-point milestone, alongside the existing blink.
- The game-over puddle recoloured from red to a cold-pool blue, with its size and timing unchanged.
- A reduced-motion variant that softens shake, sparkle and puffs and slows the distant parallax, for players whose browser prefers reduced motion.
- Full preservation of jump timing, cactus arrival moments, pace curve, score rate, restart behaviour, high-score persistence and seeded-run reproducibility.
- The 800-by-300 game area, its shrink-to-fit rule and its centring are unchanged.

### Out-of-Scope

- Sound and music. (A visually richer crash still has no audio.)
- A night cycle or weather beyond the day-to-dusk tint: no stars, no moon, no rain, no snow, no lightning.
- Flying obstacles, ducking, pause, mouse/touch/gamepad input, mobile layout, enlarging the game area above 800 by 300 — all remain out of scope as in spec 001.
- Power-ups, lives, difficulty settings, online leaderboards, accounts, sharing scores, localisation — unchanged from spec 001.
- Richer dinosaur animation beyond the existing two-frame run cycle and the hit pose (no tail swish, no idle breathing).
- A user-facing settings screen to turn the new effects on or off individually (the only switch is the browser's own reduced-motion preference).
- Recolouring the dinosaur, cacti, ground line, score text or `GAME OVER` text away from their dark-grey silhouette; this spec only recolours additive scenery, particle effects and the game-over puddle.
- Replacing the plain-game palette for the parts kept in dark grey. If a later version wants to re-tint the whole game around blue, that is a separate specification.

---

## Change Log

_Dated amendments made after the spec was first written — typically by `/awos:spec` in Update Mode when a bug fix changed documented behavior. Each entry records the date, the source reference (bug id or fix description), and what behavior changed and why. Leave empty until the first amendment._
