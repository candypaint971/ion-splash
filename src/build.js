import { writeFileSync } from 'node:fs';
import { TOTAL_FRAMES, FPS, COLORS, sec } from './animation.js';
import {
  resetLayerIds, sparkLayer, haloLayer,
  gridLayer, lightningBoltLayer,
} from './layers.js';

resetLayerIds();

const W = 1080, H = 1920;
const CENTER = [W / 2, H / 2];
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

// Effects-only Lottie. The logo (SVG) and tagline (HTML) are composited
// on top of this animation by the host (preview HTML or mobile app).
// Background is also handled by the host so the Lottie can layer over a photo.
const layers = [
  // Halo (pulses twice for energy)
  haloLayer({ position: CENTER, color: COLORS.accent, pulseStartFrame: sec(1.4), pulseEndFrame: sec(1.6) }),
  haloLayer({ position: CENTER, color: COLORS.accent, pulseStartFrame: sec(1.6), pulseEndFrame: sec(1.85) }),

  // Strike flash at the moment of impact
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

  // Background grid (faint purple, slow pulse)
  gridLayer({ width: W, height: H, spacing: 80, color: COLORS.accent, lineWidth: 1.5, baseOpacity: 18, peakOpacity: 38, pulseDuration: 240 }),
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
