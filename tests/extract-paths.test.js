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

test('parseSvgPath handles L (absolute lineto)', () => {
  const r = parseSvgPath('M0,0 L10,5');
  assert.equal(r.v.length, 2);
  assert.deepEqual(r.v[1], [10, 5]);
  assert.deepEqual(r.i[1], [0, 0]);
  assert.deepEqual(r.o[1], [0, 0]);
});

test('parseSvgPath handles H/h (horizontal lineto)', () => {
  const r = parseSvgPath('M5,5 H20 h5');
  assert.deepEqual(r.v[1], [20, 5]);
  assert.deepEqual(r.v[2], [25, 5]);
});

test('parseSvgPath handles V/v (vertical lineto)', () => {
  const r = parseSvgPath('M5,5 V20 v5');
  assert.deepEqual(r.v[1], [5, 20]);
  assert.deepEqual(r.v[2], [5, 25]);
});

test('parseSvgPath handles S (smooth cubic, reflects previous c2)', () => {
  // After C0,5 5,5 5,0, lastC2 is at (5,5), pen at (5,0).
  // S15,0 10,0 should reflect: c1 = (2*5 - 5, 2*0 - 5) = (5, -5)
  const r = parseSvgPath('M0,0 C0,5 5,5 5,0 S15,0 10,0');
  // 3 vertices total: (0,0), (5,0), (10,0)
  assert.equal(r.v.length, 3);
  assert.deepEqual(r.v[2], [10, 0]);
  // Out-tangent of vertex 1 (the pen position before S) = c1 - v1
  // c1 = (5, -5), v1 = (5, 0) → out-tangent = (0, -5)
  assert.deepEqual(r.o[1], [0, -5]);
});

test('parseSvgPath throws on truly unsupported commands', () => {
  assert.throws(() => parseSvgPath('M0,0 A10,10 0 0 1 5,5'), /Unsupported/);
});
