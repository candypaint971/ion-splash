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
