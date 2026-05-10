import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { TOTAL_FRAMES, FPS } from '../src/animation.js';

const SPLASH_PATH = new URL('../splash.json', import.meta.url).pathname;

test('build script produces splash.json', () => {
  execSync('node src/build.js', { stdio: 'inherit' });
  assert.ok(existsSync(SPLASH_PATH));
});

test('splash.json is valid JSON with expected top-level fields', () => {
  const json = JSON.parse(readFileSync(SPLASH_PATH, 'utf8'));
  assert.equal(json.fr, FPS);
  assert.equal(json.ip, 0);
  assert.equal(json.op, TOTAL_FRAMES);
  assert.equal(json.w, 1080);
  assert.equal(json.h, 1920);
  assert.ok(Array.isArray(json.layers));
});

test('splash.json has the expected layers in render order (top to bottom)', () => {
  const json = JSON.parse(readFileSync(SPLASH_PATH, 'utf8'));
  const names = json.layers.map(l => l.nm);
  assert.deepEqual(names, [
    'figures-shimmer', 'N-shimmer', 'O-shimmer', 'I-shimmer',
    'halo', 'halo',
    'spark',
    'lightning',
    'N-fill', 'O-fill', 'I-fill',
    'inner-figures',
    'grid',
    'Background',
  ]);
});

test('splash.json file size is under 120KB', () => {
  const stats = readFileSync(SPLASH_PATH);
  assert.ok(stats.length < 120_000, `splash.json is ${stats.length} bytes`);
});
