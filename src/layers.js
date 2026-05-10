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

export function strokeLayer({ name, path, color, strokeWidth, drawStartFrame, drawEndFrame, position = [540, 960], scale = 100 }) {
  return {
    ddd: 0,
    ind: nextId(),
    ty: 4,
    nm: name,
    sr: 1,
    ks: {
      o: { a: 0, k: 100 },
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

export function fillLayer({ name, path, color, fadeStartFrame, fadeEndFrame, position = [540, 960], scale = 100 }) {
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
