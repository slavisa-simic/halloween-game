// Drifting clouds (functional spec 003 §2.2).
//
// A cosmetic feature in the shape architecture 2.2 describes. Clouds drift
// leftward at `state.speed * CLOUDS.speedFactor` per tick, retire past the
// left edge, and new ones spawn from the right at seeded gaps. Visual
// randomness goes through the feature's own createRng (state.seed ^ salt).

import { createRng } from '../rng.js';
import type { Renderer } from '../render.js';
import { CANVAS, CLOUDS, PALETTE } from '../tuning.js';
import type { Game, LayerDraw, Rng } from '../types.js';

export interface CloudsDeps {
  readonly game: Pick<Game, 'on' | 'view'>;
  readonly renderer: Pick<Renderer, 'addLayer'>;
}

interface Cloud {
  x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** Random integer in `[min, max]` using one `rng.next()` call. */
function randInt(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng.next() * (max - min + 1));
}

function makeCloud(rng: Rng, x: number): Cloud {
  return {
    x,
    y: randInt(rng, CLOUDS.minY, CLOUDS.maxY),
    width: randInt(rng, CLOUDS.minWidth, CLOUDS.maxWidth),
    height: randInt(rng, CLOUDS.minHeight, CLOUDS.maxHeight),
  };
}

/** Installs the drifting clouds; the returned function removes them again. */
export function installClouds({ game, renderer }: CloudsDeps): () => void {
  let clouds: Cloud[] = [];
  let rng: Rng = createRng(1);

  const reseed = (seed: number): void => {
    rng = createRng((seed ^ CLOUDS.salt) >>> 0);
    clouds = [];
    // Spread the initial clouds across the sky.
    const step = CANVAS.width / CLOUDS.initial;
    for (let i = 0; i < CLOUDS.initial; i += 1) {
      clouds.push(makeCloud(rng, Math.round(i * step)));
    }
  };

  const onStart = (event: { seed: number }): void => {
    reseed(event.seed);
  };

  const onTick = (): void => {
    const state = game.view();
    const dx = state.speed * CLOUDS.speedFactor;
    for (const cloud of clouds) {
      cloud.x -= dx;
    }
    // Retire clouds whose right edge has crossed the left edge.
    clouds = clouds.filter((c) => c.x + c.width > 0);
    // Spawn a new cloud at the right edge when the trailing-rightmost is far enough in.
    const rightmost = clouds.reduce(
      (m, c) => Math.max(m, c.x + c.width),
      Number.NEGATIVE_INFINITY,
    );
    const gap = randInt(rng, CLOUDS.minGapPx, CLOUDS.maxGapPx);
    if (rightmost < CANVAS.width - gap) {
      clouds.push(makeCloud(rng, CANVAS.width));
    }
  };

  const draw: LayerDraw = (ctx) => {
    ctx.fillStyle = PALETTE.cloud;
    for (const cloud of clouds) {
      // A stylised blocky cloud: a base rectangle plus two slimmer bumps on top.
      const x = Math.round(cloud.x);
      const y = Math.round(cloud.y);
      const w = cloud.width;
      const h = cloud.height;
      ctx.fillRect(x, y + Math.floor(h / 3), w, Math.ceil((h * 2) / 3));
      const bumpH = Math.ceil(h / 2);
      ctx.fillRect(x + Math.floor(w / 5), y, Math.floor(w / 3), bumpH);
      ctx.fillRect(
        x + Math.floor(w / 2),
        y + Math.floor(h / 6),
        Math.floor(w / 3),
        bumpH,
      );
    }
  };

  const offStart = game.on('start', onStart);
  const offRestart = game.on('restart', onStart);
  const offTick = game.on('tick', onTick);
  const removeLayer = renderer.addLayer('parallax', draw);

  return () => {
    offStart();
    offRestart();
    offTick();
    removeLayer();
  };
}
