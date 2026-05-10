import { test } from 'node:test';
import assert from 'node:assert/strict';
import { backgroundLayer, strokeLayer } from '../src/layers.js';
import { fillLayer, sparkLayer, haloLayer, figureLayer } from '../src/layers.js';
import { gridLayer, lightningBoltLayer, shimmerLayer } from '../src/layers.js';
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

test('gridLayer is a shape layer with a pulsing opacity', () => {
  const layer = gridLayer({ width: 1080, height: 1920, spacing: 80, color: COLORS.accent, baseOpacity: 8, peakOpacity: 22, pulseDuration: 240 });
  assert.equal(layer.ty, 4);
  assert.equal(layer.nm, 'grid');
  assert.equal(layer.ks.o.a, 1);
  assert.ok(layer.ks.o.k.length >= 2);
  // First keyframe should start at base opacity
  assert.equal(layer.ks.o.k[0].s[0], 8);
  // Should contain stroke shapes for grid lines (verticals + horizontals)
  const group = layer.shapes[0];
  const shapeCount = group.it.filter(it => it.ty === 'sh').length;
  // ceil(1080/80)+1 verticals = 14, ceil(1920/80)+1 horizontals = 25
  assert.ok(shapeCount > 20);
});

test('lightningBoltLayer has trim animation and stacked strokes', () => {
  const layer = lightningBoltLayer({
    vertices: [[540, 0], [540, 480], [540, 960]],
    color: COLORS.stroke,
    glowColor: COLORS.accent,
    drawStartFrame: sec(0.4),
    drawEndFrame: sec(0.8),
  });
  assert.equal(layer.ty, 4);
  assert.equal(layer.nm, 'lightning');
  const trim = findShape(layer, 'tm');
  assert.equal(trim.s.k[0].s[0], 0);
  assert.equal(trim.s.k[1].s[0], 100);
  assert.equal(trim.s.k[0].t, sec(0.4));
  assert.equal(trim.s.k[1].t, sec(0.8));
  // Stacked strokes: glow + core
  const group = layer.shapes[0];
  const strokes = group.it.filter(it => it.ty === 'st');
  assert.equal(strokes.length, 2);
});

test('shimmerLayer pulses opacity 0→30→0 looping after startFrame', () => {
  const layer = shimmerLayer({
    name: 'shim',
    path: PATH_I,
    color: COLORS.accent,
    startFrame: sec(2.7),
    period: 90,
  });
  assert.equal(layer.ty, 4);
  assert.equal(layer.nm, 'shim');
  assert.equal(layer.ks.o.a, 1);
  // First keyframe at startFrame, opacity 0
  assert.equal(layer.ks.o.k[0].t, sec(2.7));
  assert.equal(layer.ks.o.k[0].s[0], 0);
  // Should reach peak of 30 at least once
  const peaks = layer.ks.o.k.filter(kf => kf.s[0] === 30);
  assert.ok(peaks.length >= 1);
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
