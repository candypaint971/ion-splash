import { writeFileSync } from 'node:fs';
import { TOTAL_FRAMES, FPS, COLORS, sec } from './animation.js';
import { PATH_I, PATH_N, PATH_O_OUTER, PATH_O_INNER } from './paths.js';
import {
  resetLayerIds, backgroundLayer, strokeLayer, fillLayer,
  figureLayer, sparkLayer, haloLayer,
} from './layers.js';

resetLayerIds();

const W = 1080, H = 1920;
const CENTER = [W / 2, H / 2];
const LOGO_SCALE = 312;
const LETTER_POS = CENTER;

const SPARK_POS = [
  CENTER[0] + (63.5 - 86.65) * (LOGO_SCALE / 100),
  CENTER[1] + (37.0 - 36.875) * (LOGO_SCALE / 100),
];

const layers = [
  haloLayer({
    position: CENTER,
    color: COLORS.accent,
    pulseStartFrame: sec(2.4),
    pulseEndFrame: sec(2.5),
  }),
  sparkLayer({
    position: SPARK_POS,
    color: COLORS.accent,
    flashFrame: sec(1.4),
    durationFrames: 6,
  }),
  fillLayer({ name: 'N-fill', path: PATH_N, color: COLORS.stroke, fadeStartFrame: sec(2.2), fadeEndFrame: sec(2.4), position: LETTER_POS, scale: LOGO_SCALE }),
  fillLayer({ name: 'O-fill', path: PATH_O_OUTER, color: COLORS.stroke, fadeStartFrame: sec(2.2), fadeEndFrame: sec(2.4), position: LETTER_POS, scale: LOGO_SCALE }),
  fillLayer({ name: 'I-fill', path: PATH_I, color: COLORS.stroke, fadeStartFrame: sec(2.2), fadeEndFrame: sec(2.4), position: LETTER_POS, scale: LOGO_SCALE }),
  figureLayer({ name: 'inner-figures', path: PATH_O_INNER, color: COLORS.stroke, appearStartFrame: sec(1.2), appearEndFrame: sec(1.6), position: LETTER_POS, scale: LOGO_SCALE }),
  strokeLayer({ name: 'N-stroke', path: PATH_N, color: COLORS.stroke, strokeWidth: 2, drawStartFrame: sec(1.6), drawEndFrame: sec(2.2), position: LETTER_POS, scale: LOGO_SCALE }),
  strokeLayer({ name: 'O-stroke', path: PATH_O_OUTER, color: COLORS.stroke, strokeWidth: 2, drawStartFrame: sec(0.4), drawEndFrame: sec(1.2), position: LETTER_POS, scale: LOGO_SCALE }),
  strokeLayer({ name: 'I-stroke', path: PATH_I, color: COLORS.stroke, strokeWidth: 2, drawStartFrame: sec(0.0), drawEndFrame: sec(0.4), position: LETTER_POS, scale: LOGO_SCALE }),
  backgroundLayer({ width: W, height: H, color: COLORS.background }),
];

const lottie = {
  v: '5.7.4',
  fr: FPS,
  ip: 0,
  op: TOTAL_FRAMES,
  w: W,
  h: H,
  nm: 'ION Splash',
  ddd: 0,
  assets: [],
  layers,
  markers: [
    { tm: 0,            cm: 'reveal-start', dr: 0 },
    { tm: sec(2.5),     cm: 'reveal-end',   dr: 0 },
    { tm: sec(2.5),     cm: 'loop-start',   dr: 0 },
    { tm: TOTAL_FRAMES, cm: 'loop-end',     dr: 0 },
  ],
};

const outPath = new URL('../splash.json', import.meta.url).pathname;
writeFileSync(outPath, JSON.stringify(lottie));
console.log(`Wrote ${outPath} (${(JSON.stringify(lottie).length / 1024).toFixed(1)} KB)`);
