import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSvgPath } from '../src/extract-paths.js';

test('parseSvgPath returns vertices for a simple cubic path', () => {
  const result = parseSvgPath('M0,0 c10,0 20,0 30,0');
  assert.equal(result.v.length, 2);
  assert.deepEqual(result.v[0], [0, 0]);
  assert.deepEqual(result.v[1], [30, 0]);
  assert.equal(result.o.length, 2);
  assert.equal(result.i.length, 2);
  assert.deepEqual(result.o[0], [10, 0]);
  assert.deepEqual(result.i[1], [-10, 0]);
  assert.equal(result.c, false);
});

test('parseSvgPath handles closed paths', () => {
  const result = parseSvgPath('M0,0 c10,0 20,0 30,0 z');
  assert.equal(result.c, true);
});
