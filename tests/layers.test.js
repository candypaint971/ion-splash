import { test } from 'node:test';
import assert from 'node:assert/strict';
import { backgroundLayer, strokeLayer } from '../src/layers.js';
import { PATH_I } from '../src/paths.js';
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
