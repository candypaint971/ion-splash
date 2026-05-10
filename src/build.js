import { writeFileSync } from 'node:fs';
import { TOTAL_FRAMES, FPS, COLORS, sec } from './animation.js';
import { PATH_I, PATH_N, PATH_O_OUTER, PATH_O_INNER } from './paths.js';
import {
  resetLayerIds, backgroundLayer, strokeLayer, fillLayer,
  figureLayer, sparkLayer, haloLayer,
  gridLayer, lightningBoltLayer, shimmerLayer,
  taglineLayer,
} from './layers.js';

resetLayerIds();

const W = 1080, H = 1920;
const CENTER = [W / 2, H / 2];
const LOGO_SCALE = 312;
const LETTER_POS = CENTER;
const STRIKE_POS = CENTER;

const TAGLINE_Y = 1240;
const TAGLINE_PIECES = [
  // "Charge " — left of italic
  { text: 'Charge', font: 'Helvetica',         offset: -270 },
  // "faster" — italic, in middle
  { text: 'faster', font: 'Helvetica-Oblique', offset: -90  },
  // "Drive longer" — right of italic
  { text: 'Drive longer', font: 'Helvetica',   offset: 200  },
];

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
  // Tagline pieces — sit on top, fade in after the lightning charge completes
  ...TAGLINE_PIECES.map(p => taglineLayer({
    text: p.text,
    font: p.font,
    fontSize: 64,
    color: COLORS.stroke,           // white text
    position: [CENTER[0] + p.offset, TAGLINE_Y],
    fadeStartFrame: sec(2.8),
    fadeEndFrame: sec(3.4),
  })),

  // Letter shimmers (subtle cyan electric pulse on the letter fills, after they appear)
  shimmerLayer({ name: 'figures-shimmer', path: PATH_O_INNER, color: COLORS.accent, position: LETTER_POS, scale: LOGO_SCALE, startFrame: sec(2.7) }),
  shimmerLayer({ name: 'N-shimmer', path: PATH_N, color: COLORS.accent, position: LETTER_POS, scale: LOGO_SCALE, startFrame: sec(2.7) }),
  shimmerLayer({ name: 'O-shimmer', path: PATH_O_OUTER, color: COLORS.accent, position: LETTER_POS, scale: LOGO_SCALE, startFrame: sec(2.7) }),
  shimmerLayer({ name: 'I-shimmer', path: PATH_I, color: COLORS.accent, position: LETTER_POS, scale: LOGO_SCALE, startFrame: sec(2.7) }),

  // Halo (pulses twice for more energy)
  haloLayer({ position: CENTER, color: COLORS.accent, pulseStartFrame: sec(2.4), pulseEndFrame: sec(2.55) }),
  haloLayer({ position: CENTER, color: COLORS.accent, pulseStartFrame: sec(2.55), pulseEndFrame: sec(2.7) }),

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

  // Solid white fill layers (cross-fade in at 1.8s)
  fillLayer({ name: 'N-fill', path: PATH_N, color: COLORS.stroke, fadeStartFrame: sec(1.8), fadeEndFrame: sec(2.4), position: LETTER_POS, scale: LOGO_SCALE }),
  fillLayer({ name: 'O-fill', path: PATH_O_OUTER, color: COLORS.stroke, fadeStartFrame: sec(1.8), fadeEndFrame: sec(2.4), position: LETTER_POS, scale: LOGO_SCALE }),
  fillLayer({ name: 'I-fill', path: PATH_I, color: COLORS.stroke, fadeStartFrame: sec(1.8), fadeEndFrame: sec(2.4), position: LETTER_POS, scale: LOGO_SCALE }),

  // Inner figures rendered in BACKGROUND COLOR — appears as a hole through the O
  figureLayer({ name: 'inner-figures', path: PATH_O_INNER, color: COLORS.background, appearStartFrame: sec(1.6), appearEndFrame: sec(1.8), position: LETTER_POS, scale: LOGO_SCALE }),

  // Cyan stroke draws — fade out once the white fills appear
  strokeLayer({ name: 'N-stroke', path: PATH_N, color: COLORS.accent, strokeWidth: 3, drawStartFrame: sec(0.9), drawEndFrame: sec(1.6), position: LETTER_POS, scale: LOGO_SCALE, fadeOutAfterFrame: sec(2.0) }),
  strokeLayer({ name: 'I-stroke', path: PATH_I, color: COLORS.accent, strokeWidth: 3, drawStartFrame: sec(0.9), drawEndFrame: sec(1.6), position: LETTER_POS, scale: LOGO_SCALE, fadeOutAfterFrame: sec(2.0) }),
  strokeLayer({ name: 'O-stroke', path: PATH_O_OUTER, color: COLORS.accent, strokeWidth: 3, drawStartFrame: sec(0.8), drawEndFrame: sec(1.4), position: LETTER_POS, scale: LOGO_SCALE, fadeOutAfterFrame: sec(2.0) }),

  // Background grid (above background, below everything else)
  gridLayer({ width: W, height: H, spacing: 80, color: COLORS.accent, lineWidth: 1, baseOpacity: 8, peakOpacity: 22, pulseDuration: 240 }),

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
  fonts: {
    list: [
      { fName: 'Helvetica',         fFamily: 'Helvetica', fStyle: 'Regular',  ascent: 75 },
      { fName: 'Helvetica-Oblique', fFamily: 'Helvetica', fStyle: 'Oblique',  ascent: 75 },
    ],
  },
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
