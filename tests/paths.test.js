import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PATH_I, PATH_N, PATH_O_OUTER, PATH_O_INNER } from '../src/paths.js';

const ALL = { PATH_I, PATH_N, PATH_O_OUTER, PATH_O_INNER };

for (const [name, p] of Object.entries(ALL)) {
  test(`${name}: i, o, v are arrays of equal length`, () => {
    assert.ok(Array.isArray(p.v) && p.v.length > 0);
    assert.equal(p.i.length, p.v.length);
    assert.equal(p.o.length, p.v.length);
  });

  test(`${name}: every vertex/tangent is a [x,y] pair of numbers`, () => {
    for (const arr of [p.v, p.i, p.o]) {
      for (const pt of arr) {
        assert.equal(pt.length, 2);
        assert.equal(typeof pt[0], 'number');
        assert.equal(typeof pt[1], 'number');
      }
    }
  });

  test(`${name}: closed flag is boolean`, () => {
    assert.equal(typeof p.c, 'boolean');
  });
}

test('PATH_I starts at expected SVG coordinate', () => {
  assert.ok(Math.abs(PATH_I.v[0][0] - 6.31) < 0.01);
  assert.ok(Math.abs(PATH_I.v[0][1] - 4.18) < 0.01);
});

test('PATH_O_INNER starts at expected SVG coordinate', () => {
  assert.ok(Math.abs(PATH_O_INNER.v[0][0] - 62.82) < 0.01);
  assert.ok(Math.abs(PATH_O_INNER.v[0][1] - 60.34) < 0.01);
});
