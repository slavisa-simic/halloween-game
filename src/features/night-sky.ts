// The night-sky backdrop (functional spec 003 §2.2).
//
// A cosmetic feature in the shape architecture 2.2 describes. The dark fill
// is painted on the `background` layer, before everything else, so the moon
// (also on `background`) and every other layer sit on top of it.

import type { Renderer } from '../render.js';
import { CANVAS, PALETTE } from '../tuning.js';
import type { LayerDraw } from '../types.js';

export interface NightSkyDeps {
  readonly renderer: Pick<Renderer, 'addLayer'>;
}

/** Installs the night-sky backdrop; the returned function removes it again. */
export function installNightSky({ renderer }: NightSkyDeps): () => void {
  const draw: LayerDraw = (ctx) => {
    ctx.fillStyle = PALETTE.night;
    ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);
  };
  return renderer.addLayer('background', draw);
}
