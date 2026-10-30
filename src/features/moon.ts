// The moon (functional spec 003 §2.2, §2.3, §2.4).
//
// A cosmetic feature in the shape architecture 2.2 describes. The moon has a
// fixed resting centre and a base radius; a `land` event starts a damped-sine
// horizontal wobble that settles after MOON.wobbleTicks; a `milestone` event
// starts a growth tween that compounds the radius by MOON.growFactor over
// MOON.growTicks, capped at MOON.maxRadius. Both reset on `start` / `restart`.

import type { Renderer } from '../render.js';
import { MOON, PALETTE } from '../tuning.js';
import type { Game, LayerDraw } from '../types.js';

export interface MoonDeps {
  readonly game: Pick<Game, 'on' | 'view'>;
  readonly renderer: Pick<Renderer, 'addLayer'>;
}

interface GrowthTween {
  readonly fromRadius: number;
  readonly toRadius: number;
  readonly startTick: number;
}

/** Installs the moon; the returned function removes it again. */
export function installMoon({ game, renderer }: MoonDeps): () => void {
  let currentRadius = MOON.baseRadius;
  let wobbleStartTick: number | null = null;
  let growth: GrowthTween | null = null;

  const reset = (): void => {
    currentRadius = MOON.baseRadius;
    wobbleStartTick = null;
    growth = null;
  };

  const onLand = (): void => {
    wobbleStartTick = game.view().tick;
  };

  const onMilestone = (): void => {
    const toRadius = Math.min(
      MOON.maxRadius,
      currentRadius * MOON.growFactor,
    );
    growth = {
      fromRadius: currentRadius,
      toRadius,
      startTick: game.view().tick,
    };
  };

  /**
   * The signed horizontal offset for the drawn moon centre at `tick`.
   * A damped sine over MOON.wobbleTicks ticks; zero at the start tick, so a
   * re-triggered wobble causes no snap.
   */
  function wobbleOffsetX(tick: number): number {
    if (wobbleStartTick === null) return 0;
    const elapsed = tick - wobbleStartTick;
    if (elapsed < 0 || elapsed >= MOON.wobbleTicks) {
      wobbleStartTick = null;
      return 0;
    }
    const t = elapsed / MOON.wobbleTicks;
    return MOON.wobblePx * Math.sin(t * Math.PI * 4) * (1 - t);
  }

  /**
   * Advances the growth tween and returns the radius to draw at `tick`.
   * Clears `growth` when the tween is complete.
   */
  function radiusAt(tick: number): number {
    if (growth === null) return currentRadius;
    const elapsed = tick - growth.startTick;
    if (elapsed <= 0) return growth.fromRadius;
    if (elapsed >= MOON.growTicks) {
      currentRadius = growth.toRadius;
      growth = null;
      return currentRadius;
    }
    const t = elapsed / MOON.growTicks;
    return growth.fromRadius + (growth.toRadius - growth.fromRadius) * t;
  }

  const draw: LayerDraw = (ctx, state) => {
    const radius = radiusAt(state.tick);
    const offsetX = wobbleOffsetX(state.tick);
    const cx = Math.round(MOON.centerX + offsetX);
    const cy = Math.round(MOON.centerY);
    const r = Math.round(radius);
    ctx.fillStyle = PALETTE.moon;
    // Approximate a disc as horizontal scanlines (DrawContext has no path APIs).
    for (let dy = -r; dy <= r; dy += 1) {
      const halfWidth = Math.round(Math.sqrt(r * r - dy * dy));
      ctx.fillRect(cx - halfWidth, cy + dy, halfWidth * 2 + 1, 1);
    }
  };

  const offStart = game.on('start', reset);
  const offRestart = game.on('restart', reset);
  const offLand = game.on('land', onLand);
  const offMilestone = game.on('milestone', onMilestone);
  const removeLayer = renderer.addLayer('background', draw);

  return () => {
    offStart();
    offRestart();
    offLand();
    offMilestone();
    removeLayer();
  };
}
