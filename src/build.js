import { writeFileSync } from 'node:fs';
import { TOTAL_FRAMES, FPS, COLORS, sec } from './animation.js';
import { PATH_I, PATH_N, PATH_O_OUTER, PATH_O_INNER } from './paths.js';
import {
  resetLayerIds, backgroundLayer, fillLayer,
  figureLayer, sparkLayer, haloLayer,
  gridLayer, lightningBoltLayer, shimmerLayer,
} from './layers.js';

resetLayerIds();

const W = 1080, H = 1920;
const CENTER = [W / 2, H / 2];
const LOGO_SCALE = 312;
const LETTER_POS = CENTER;
const STRIKE_POS = CENTER;

// Jagged lightning bolt from top center down to logo center.
const LIGHTNING_VERTICES = [
  [540, 0],
  [510, 140],
  [580, 280],
  [490, 420],
  [600, 560],
  [520, 700],
  [560, 840],
  [540, 960],
];

const layers = [
  // Letter shimmers (subtle cyan electric pulse on the letter fills, after they appear)
  shimmerLayer({ name: 'figures-shimmer', path: PATH_O_INNER, color: COLORS.accent, position: LETTER_POS, scale: LOGO_SCALE, startFrame: sec(1.85) }),
  shimmerLayer({ name: 'N-shimmer', path: PATH_N, color: COLORS.accent, position: LETTER_POS, scale: LOGO_SCALE, startFrame: sec(1.85) }),
  shimmerLayer({ name: 'O-shimmer', path: PATH_O_OUTER, color: COLORS.accent, position: LETTER_POS, scale: LOGO_SCALE, startFrame: sec(1.85) }),
  shimmerLayer({ name: 'I-shimmer', path: PATH_I, color: COLORS.accent, position: LETTER_POS, scale: LOGO_SCALE, startFrame: sec(1.85) }),

  // Halo (pulses twice for more energy)
  haloLayer({ position: CENTER, color: COLORS.accent, pulseStartFrame: sec(1.4), pulseEndFrame: sec(1.6) }),
  haloLayer({ position: CENTER, color: COLORS.accent, pulseStartFrame: sec(1.6), pulseEndFrame: sec(1.85) }),

  // Strike flash (big cyan radial burst at the moment of impact)
  sparkLayer({ position: STRIKE_POS, color: COLORS.accent, flashFrame: sec(0.8), durationFrames: 8 }),

  // Lightning bolt
  lightningBoltLayer({
    vertices: LIGHTNING_VERTICES,
    color: COLORS.accentBright,
    glowColor: COLORS.accent,
    drawStartFrame: sec(0.4),
    drawEndFrame: sec(0.8),
    fadeOutFrames: 18,
  }),

  // Solid white fill layers (materialize from the lightning strike with a subtle scale punch)
  fillLayer({ name: 'N-fill', path: PATH_N, color: COLORS.stroke, fadeStartFrame: sec(0.95), fadeEndFrame: sec(1.4), position: LETTER_POS, scale: LOGO_SCALE, materializeScale: true }),
  fillLayer({ name: 'O-fill', path: PATH_O_OUTER, color: COLORS.stroke, fadeStartFrame: sec(0.95), fadeEndFrame: sec(1.4), position: LETTER_POS, scale: LOGO_SCALE, materializeScale: true }),
  fillLayer({ name: 'I-fill', path: PATH_I, color: COLORS.stroke, fadeStartFrame: sec(0.95), fadeEndFrame: sec(1.4), position: LETTER_POS, scale: LOGO_SCALE, materializeScale: true }),

  // Inner figures rendered in BACKGROUND COLOR — appears as a hole through the O
  figureLayer({ name: 'inner-figures', path: PATH_O_INNER, color: COLORS.background, appearStartFrame: sec(1.05), appearEndFrame: sec(1.4), position: LETTER_POS, scale: LOGO_SCALE }),

  // Background grid (above background, below everything else)
  gridLayer({ width: W, height: H, spacing: 80, color: COLORS.accent, lineWidth: 1.5, baseOpacity: 18, peakOpacity: 38, pulseDuration: 240 }),

  // Solid background
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
    { tm: sec(3.0),     cm: 'reveal-end',   dr: 0 },
    { tm: sec(3.0),     cm: 'loop-start',   dr: 0 },
    { tm: TOTAL_FRAMES, cm: 'loop-end',     dr: 0 },
  ],
};

const outPath = new URL('../splash.json', import.meta.url).pathname;
writeFileSync(outPath, JSON.stringify(lottie));
console.log(`Wrote ${outPath} (${(JSON.stringify(lottie).length / 1024).toFixed(1)} KB)`);
