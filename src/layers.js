import { TOTAL_FRAMES, PREMIUM_EASE } from './animation.js';

const rgbToHex = ([r, g, b]) =>
  '#' + [r, g, b].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('');

let layerIdCounter = 1;
const nextId = () => layerIdCounter++;

export function resetLayerIds() { layerIdCounter = 1; }

export function backgroundLayer({ width, height, color }) {
  return {
    ddd: 0,
    ind: nextId(),
    ty: 1,
    nm: 'Background',
    sr: 1,
    ks: {
      o: { a: 0, k: 100 },
      r: { a: 0, k: 0 },
      p: { a: 0, k: [width / 2, height / 2, 0] },
      a: { a: 0, k: [width / 2, height / 2, 0] },
      s: { a: 0, k: [100, 100, 100] },
    },
    ao: 0,
    sw: width,
    sh: height,
    sc: rgbToHex(color),
    ip: 0,
    op: TOTAL_FRAMES,
    st: 0,
    bm: 0,
  };
}

export function strokeLayer({ name, path, color, strokeWidth, drawStartFrame, drawEndFrame, position = [540, 960], scale = 100, fadeOutAfterFrame = null, fadeOutFrames = 12 }) {
  const opacity = fadeOutAfterFrame == null
    ? { a: 0, k: 100 }
    : {
        a: 1,
        k: [
          { t: drawStartFrame,                       s: [100] },
          { t: fadeOutAfterFrame,                    s: [100] },
          { t: fadeOutAfterFrame + fadeOutFrames,    s: [0] },
        ],
      };
  return {
    ddd: 0,
    ind: nextId(),
    ty: 4,
    nm: name,
    sr: 1,
    ks: {
      o: opacity,
      r: { a: 0, k: 0 },
      p: { a: 0, k: [position[0], position[1], 0] },
      a: { a: 0, k: [86.65, 36.875, 0] },
      s: { a: 0, k: [scale, scale, 100] },
    },
    ao: 0,
    shapes: [
      {
        ty: 'gr',
        nm: name + '-group',
        it: [
          { ty: 'sh', nm: 'path', ks: { a: 0, k: { i: path.i, o: path.o, v: path.v, c: path.c } } },
          {
            ty: 'st',
            nm: 'stroke',
            c: { a: 0, k: [...color, 1] },
            o: { a: 0, k: 95 },
            w: { a: 0, k: strokeWidth },
            lc: 2, lj: 2, ml: 1, bm: 0,
          },
          {
            ty: 'tm',
            nm: 'trim',
            s: {
              a: 1,
              k: [
                { t: drawStartFrame, s: [0],   ...PREMIUM_EASE },
                { t: drawEndFrame,   s: [100] },
              ],
            },
            e: { a: 0, k: 100 },
            o: { a: 0, k: 0 },
            m: 1,
          },
          {
            ty: 'tr',
            p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] },
            r: { a: 0, k: 0 }, o: { a: 0, k: 100 },
            sk: { a: 0, k: 0 }, sa: { a: 0, k: 0 },
          },
        ],
      },
    ],
    ip: 0,
    op: TOTAL_FRAMES,
    st: 0,
    bm: 0,
  };
}

export function fillLayer({ name, path, color, fadeStartFrame, fadeEndFrame, position = [540, 960], scale = 100, materializeScale = false }) {
  const scaleProp = materializeScale
    ? {
        a: 1,
        k: [
          { t: fadeStartFrame, s: [scale * 0.92, scale * 0.92, 100], ...PREMIUM_EASE },
          { t: fadeEndFrame,   s: [scale, scale, 100] },
        ],
      }
    : {
        a: 1,
        k: [
          { t: fadeStartFrame, s: [scale * 0.95, scale * 0.95, 100], ...PREMIUM_EASE },
          { t: fadeEndFrame,   s: [scale, scale, 100] },
        ],
      };
  return {
    ddd: 0, ind: nextId(), ty: 4, nm: name, sr: 1,
    ks: {
      o: {
        a: 1,
        k: [
          { t: fadeStartFrame, s: [0], ...PREMIUM_EASE },
          { t: fadeEndFrame,   s: [100] },
        ],
      },
      r: { a: 0, k: 0 },
      p: { a: 0, k: [position[0], position[1], 0] },
      a: { a: 0, k: [86.65, 36.875, 0] },
      s: scaleProp,
    },
    ao: 0,
    shapes: [
      {
        ty: 'gr', nm: name + '-group',
        it: [
          { ty: 'sh', nm: 'path', ks: { a: 0, k: { i: path.i, o: path.o, v: path.v, c: path.c } } },
          { ty: 'fl', nm: 'fill', c: { a: 0, k: [...color, 1] }, o: { a: 0, k: 100 }, r: 1, bm: 0 },
          { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }, sk: { a: 0, k: 0 }, sa: { a: 0, k: 0 } },
        ],
      },
    ],
    ip: 0, op: TOTAL_FRAMES, st: 0, bm: 0,
  };
}

export function figureLayer({ name, path, color, appearStartFrame, appearEndFrame, position = [540, 960], scale = 100 }) {
  return {
    ddd: 0, ind: nextId(), ty: 4, nm: name, sr: 1,
    ks: {
      o: {
        a: 1,
        k: [
          { t: appearStartFrame, s: [0], ...PREMIUM_EASE },
          { t: appearEndFrame,   s: [100] },
        ],
      },
      r: { a: 0, k: 0 },
      p: { a: 0, k: [position[0], position[1], 0] },
      a: { a: 0, k: [86.65, 36.875, 0] },
      s: {
        a: 1,
        k: [
          { t: appearStartFrame, s: [scale * 0.9, scale * 0.9, 100], ...PREMIUM_EASE },
          { t: appearEndFrame,   s: [scale, scale, 100] },
        ],
      },
    },
    ao: 0,
    shapes: [
      {
        ty: 'gr', nm: name + '-group',
        it: [
          { ty: 'sh', nm: 'path', ks: { a: 0, k: { i: path.i, o: path.o, v: path.v, c: path.c } } },
          { ty: 'fl', nm: 'fill', c: { a: 0, k: [...color, 1] }, o: { a: 0, k: 100 }, r: 1, bm: 0 },
          { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }, sk: { a: 0, k: 0 }, sa: { a: 0, k: 0 } },
        ],
      },
    ],
    ip: 0, op: TOTAL_FRAMES, st: 0, bm: 0,
  };
}

export function sparkLayer({ position, color, flashFrame, durationFrames = 5 }) {
  return {
    ddd: 0, ind: nextId(), ty: 4, nm: 'spark', sr: 1,
    ks: {
      o: {
        a: 1,
        k: [
          { t: flashFrame, s: [0] },
          { t: flashFrame + Math.floor(durationFrames * 0.4), s: [100] },
          { t: flashFrame + durationFrames, s: [0] },
        ],
      },
      r: { a: 0, k: 0 },
      p: { a: 0, k: [position[0], position[1], 0] },
      a: { a: 0, k: [0, 0, 0] },
      s: { a: 0, k: [100, 100, 100] },
    },
    ao: 0,
    shapes: [
      {
        ty: 'gr', nm: 'spark-group',
        it: [
          { ty: 'el', nm: 'ellipse', p: { a: 0, k: [0, 0] }, s: { a: 0, k: [40, 40] }, d: 1 },
          { ty: 'fl', nm: 'fill', c: { a: 0, k: [...color, 1] }, o: { a: 0, k: 100 }, r: 1, bm: 0 },
          { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }, sk: { a: 0, k: 0 }, sa: { a: 0, k: 0 } },
        ],
      },
    ],
    ip: 0, op: TOTAL_FRAMES, st: 0, bm: 0,
  };
}

export function gridLayer({ width, height, spacing = 60, color, lineWidth = 1, baseOpacity = 10, peakOpacity = 25, pulseDuration = 240 }) {
  const verticals = [];
  const horizontals = [];
  for (let x = 0; x <= width; x += spacing) {
    verticals.push({ ty: 'sh', nm: `v-${x}`, ks: { a: 0, k: { i: [[0,0],[0,0]], o: [[0,0],[0,0]], v: [[x, 0], [x, height]], c: false } } });
  }
  for (let y = 0; y <= height; y += spacing) {
    horizontals.push({ ty: 'sh', nm: `h-${y}`, ks: { a: 0, k: { i: [[0,0],[0,0]], o: [[0,0],[0,0]], v: [[0, y], [width, y]], c: false } } });
  }
  // Loop opacity pulse for the entire timeline
  const opacityKeyframes = [];
  let t = 0;
  let toPeak = true;
  while (t <= TOTAL_FRAMES) {
    opacityKeyframes.push({ t, s: [toPeak ? baseOpacity : peakOpacity] });
    t += Math.floor(pulseDuration / 2);
    toPeak = !toPeak;
  }
  return {
    ddd: 0, ind: nextId(), ty: 4, nm: 'grid', sr: 1,
    ks: {
      o: { a: 1, k: opacityKeyframes },
      r: { a: 0, k: 0 },
      p: { a: 0, k: [width / 2, height / 2, 0] },
      a: { a: 0, k: [width / 2, height / 2, 0] },
      s: { a: 0, k: [100, 100, 100] },
    },
    ao: 0,
    shapes: [
      {
        ty: 'gr', nm: 'grid-group',
        it: [
          ...verticals,
          ...horizontals,
          { ty: 'st', nm: 'stroke', c: { a: 0, k: [...color, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: lineWidth }, lc: 1, lj: 1, ml: 1, bm: 0 },
          { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }, sk: { a: 0, k: 0 }, sa: { a: 0, k: 0 } },
        ],
      },
    ],
    ip: 0, op: TOTAL_FRAMES, st: 0, bm: 0,
  };
}

export function lightningBoltLayer({ vertices, color, glowColor, drawStartFrame, drawEndFrame, fadeOutFrames = 12 }) {
  const fadeStart = drawEndFrame;
  const fadeEnd = drawEndFrame + fadeOutFrames;
  const pathData = {
    i: vertices.map(() => [0, 0]),
    o: vertices.map(() => [0, 0]),
    v: vertices,
    c: false,
  };
  return {
    ddd: 0, ind: nextId(), ty: 4, nm: 'lightning', sr: 1,
    ks: {
      o: {
        a: 1,
        k: [
          { t: drawStartFrame, s: [100] },
          { t: fadeStart,      s: [100] },
          { t: fadeEnd,        s: [0] },
        ],
      },
      r: { a: 0, k: 0 },
      p: { a: 0, k: [0, 0, 0] },
      a: { a: 0, k: [0, 0, 0] },
      s: { a: 0, k: [100, 100, 100] },
    },
    ao: 0,
    shapes: [
      {
        ty: 'gr', nm: 'lightning-group',
        it: [
          { ty: 'sh', nm: 'path', ks: { a: 0, k: pathData } },
          { ty: 'st', nm: 'glow', c: { a: 0, k: [...glowColor, 1] }, o: { a: 0, k: 60 }, w: { a: 0, k: 12 }, lc: 2, lj: 2, ml: 1, bm: 0 },
          { ty: 'st', nm: 'core', c: { a: 0, k: [...color, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 3 }, lc: 2, lj: 2, ml: 1, bm: 0 },
          { ty: 'tm', nm: 'trim',
            s: { a: 1, k: [
              { t: drawStartFrame, s: [0], ...PREMIUM_EASE },
              { t: drawEndFrame,   s: [100] },
            ]},
            e: { a: 0, k: 100 }, o: { a: 0, k: 0 }, m: 1,
          },
          { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }, sk: { a: 0, k: 0 }, sa: { a: 0, k: 0 } },
        ],
      },
    ],
    ip: 0, op: TOTAL_FRAMES, st: 0, bm: 0,
  };
}

export function shimmerLayer({ name, path, color, position = [540, 960], scale = 100, startFrame, period = 90 }) {
  const cycles = Math.ceil((TOTAL_FRAMES - startFrame) / period);
  const opacityKeyframes = [{ t: startFrame, s: [0] }];
  for (let c = 0; c < cycles; c++) {
    const cycleStart = startFrame + c * period;
    opacityKeyframes.push({ t: cycleStart + Math.floor(period / 2), s: [30] });
    opacityKeyframes.push({ t: cycleStart + period, s: [0] });
  }
  return {
    ddd: 0, ind: nextId(), ty: 4, nm: name, sr: 1,
    ks: {
      o: { a: 1, k: opacityKeyframes },
      r: { a: 0, k: 0 },
      p: { a: 0, k: [position[0], position[1], 0] },
      a: { a: 0, k: [86.65, 36.875, 0] },
      s: { a: 0, k: [scale, scale, 100] },
    },
    ao: 0,
    shapes: [
      {
        ty: 'gr', nm: name + '-group',
        it: [
          { ty: 'sh', nm: 'path', ks: { a: 0, k: { i: path.i, o: path.o, v: path.v, c: path.c } } },
          { ty: 'fl', nm: 'fill', c: { a: 0, k: [...color, 1] }, o: { a: 0, k: 100 }, r: 1, bm: 0 },
          { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }, sk: { a: 0, k: 0 }, sa: { a: 0, k: 0 } },
        ],
      },
    ],
    ip: 0, op: TOTAL_FRAMES, st: 0, bm: 0,
  };
}

export function taglineLayer({ text, font = 'Helvetica', fontSize = 64, color, position, fadeStartFrame, fadeEndFrame }) {
  return {
    ddd: 0, ind: nextId(), ty: 5, nm: `tagline-${text.trim()}`, sr: 1,
    ks: {
      o: {
        a: 1,
        k: [
          { t: fadeStartFrame, s: [0],   ...PREMIUM_EASE },
          { t: fadeEndFrame,   s: [100] },
        ],
      },
      r: { a: 0, k: 0 },
      p: { a: 0, k: [position[0], position[1], 0] },
      a: { a: 0, k: [0, 0, 0] },
      s: { a: 0, k: [100, 100, 100] },
    },
    ao: 0,
    t: {
      d: {
        k: [{
          s: {
            s: fontSize,
            f: font,
            t: text,
            j: 2,                  // 2 = center justify
            tr: 0,
            lh: fontSize * 1.2,
            ls: 0,
            fc: color,             // Lottie text color is RGB array (no alpha)
          },
          t: 0,
        }],
      },
      p: {},
      m: { g: 1, a: { a: 0, k: [0, 0] } },
      a: [],
    },
    ip: 0, op: TOTAL_FRAMES, st: 0, bm: 0,
  };
}

export function haloLayer({ position, color, pulseStartFrame, pulseEndFrame, baseRadius = 200 }) {
  return {
    ddd: 0, ind: nextId(), ty: 4, nm: 'halo', sr: 1,
    ks: {
      o: {
        a: 1,
        k: [
          { t: pulseStartFrame, s: [60] },
          { t: pulseEndFrame,   s: [0] },
        ],
      },
      r: { a: 0, k: 0 },
      p: { a: 0, k: [position[0], position[1], 0] },
      a: { a: 0, k: [0, 0, 0] },
      s: {
        a: 1,
        k: [
          { t: pulseStartFrame, s: [100, 100, 100] },
          { t: pulseEndFrame,   s: [130, 130, 100] },
        ],
      },
    },
    ao: 0,
    shapes: [
      {
        ty: 'gr', nm: 'halo-group',
        it: [
          { ty: 'el', nm: 'ellipse', p: { a: 0, k: [0, 0] }, s: { a: 0, k: [baseRadius * 2, baseRadius * 2] }, d: 1 },
          { ty: 'st', nm: 'stroke', c: { a: 0, k: [...color, 1] }, o: { a: 0, k: 100 }, w: { a: 0, k: 4 }, lc: 2, lj: 2, ml: 1, bm: 0 },
          { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }, sk: { a: 0, k: 0 }, sa: { a: 0, k: 0 } },
        ],
      },
    ],
    ip: 0, op: TOTAL_FRAMES, st: 0, bm: 0,
  };
}
