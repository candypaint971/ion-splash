import { test } from 'node:test';
import assert from 'node:assert/strict';
import { backgroundLayer, strokeLayer } from '../src/layers.js';
import { fillLayer, sparkLayer, haloLayer, figureLayer } from '../src/layers.js';
import { PATH_I } from '../src/paths.js';
import { PATH_O_INNER } from '../src/paths.js';
import { COLORS, sec } from '../src/animation.js';

function findShape(layer, type) {
  const walk = (items) => {
    for (const it of items) {
      if (it.ty === type) return it;
      if (it.ty === 'gr' && it.it) {
        const found = walk(it.it);
        if (found) return found;
      }
    }
    return null;
  };
  return walk(layer.shapes);
}

test('backgroundLayer is a solid color filling the canvas', () => {
  const layer = backgroundLayer({ width: 1080, height: 1920, color: COLORS.background });
  assert.equal(layer.ty, 1);
  assert.equal(layer.sw, 1080);
  assert.equal(layer.sh, 1920);
  assert.equal(layer.sc, '#0f0a2e');
  assert.equal(layer.ip, 0);
});

test('strokeLayer animates trim-path 0%→100% over the given frame range', () => {
  const layer = strokeLayer({
    name: 'I-stroke',
    path: PATH_I,
    color: COLORS.stroke,
    strokeWidth: 2,
    drawStartFrame: sec(0.0),
    drawEndFrame: sec(0.4),
  });
  assert.equal(layer.ty, 4);
  const trim = findShape(layer, 'tm');
  assert.equal(trim.s.k[0].s[0], 0);
  assert.equal(trim.s.k[1].s[0], 100);
  assert.equal(trim.s.k[0].t, sec(0.0));
  assert.equal(trim.s.k[1].t, sec(0.4));
});

test('fillLayer fades opacity 0→100 over a transition window', () => {
  const layer = fillLayer({
    name: 'I-fill',
    path: PATH_I,
    color: COLORS.stroke,
    fadeStartFrame: sec(2.2),
    fadeEndFrame: sec(2.4),
  });
  assert.equal(layer.ty, 4);
  assert.equal(layer.ks.o.a, 1);
  assert.equal(layer.ks.o.k[0].s[0], 0);
  assert.equal(layer.ks.o.k[1].s[0], 100);
});

test('sparkLayer is a brief radial flash', () => {
  const layer = sparkLayer({
    position: [540, 960],
    color: COLORS.accent,
    flashFrame: sec(1.4),
    durationFrames: 5,
  });
  assert.equal(layer.ty, 4);
  assert.equal(layer.ks.o.k.length, 3);
});

test('figureLayer fades + scales in', () => {
  const layer = figureLayer({
    name: 'inner-figures',
    path: PATH_O_INNER,
    color: COLORS.stroke,
    appearStartFrame: sec(1.2),
    appearEndFrame: sec(1.6),
  });
  assert.equal(layer.ks.o.a, 1);
  assert.equal(layer.ks.s.a, 1);
});

test('haloLayer scales from 100% → 130% with opacity 100→0', () => {
  const layer = haloLayer({
    position: [540, 960],
    color: COLORS.accent,
    pulseStartFrame: sec(2.4),
    pulseEndFrame: sec(2.5),
  });
  assert.equal(layer.ks.s.a, 1);
  assert.equal(layer.ks.o.a, 1);
  assert.equal(layer.ks.s.k[1].s[0], 130);
});
