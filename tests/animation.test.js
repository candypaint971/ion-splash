import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FPS, TOTAL_FRAMES, COLORS, sec, hexToRgb } from '../src/animation.js';

test('FPS is 60', () => {
  assert.equal(FPS, 60);
});

test('TOTAL_FRAMES covers 3s reveal + 3s loop = 6s', () => {
  assert.equal(TOTAL_FRAMES, 360);
});

test('sec() converts seconds to frames', () => {
  assert.equal(sec(1), 60);
  assert.equal(sec(2.5), 150);
  assert.equal(sec(0.4), 24);
});

test('hexToRgb converts hex to Lottie [0..1] RGB', () => {
  assert.deepEqual(hexToRgb('#FFFFFF'), [1, 1, 1]);
  assert.deepEqual(hexToRgb('#000000'), [0, 0, 0]);
  const navy = hexToRgb('#0F0A2E');
  assert.equal(navy.length, 3);
  assert.ok(Math.abs(navy[0] - 15/255) < 1e-6);
});

test('COLORS has all spec colors', () => {
  assert.ok(COLORS.background);
  assert.ok(COLORS.stroke);
  assert.ok(COLORS.accent);
  assert.ok(COLORS.accentBright);
});
