# ION Splash Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hand-author a Lottie JSON splash animation for the ION mobile app, plus a local preview page and integration README.

**Architecture:** A small Node.js builder script emits `splash.json` deterministically. The builder is split into focused modules (path data, layer builders, animation timeline). The output JSON is committed for direct consumption by mobile platforms via the standard Lottie runtimes.

**Tech Stack:** Node.js (>= 20, for built-in `node --test`), `svgson` for SVG parsing, `lottie-web` (CDN) for the preview page. No bundler. No framework.

**Reference spec:** [docs/superpowers/specs/2026-05-10-ion-splash-design.md](../specs/2026-05-10-ion-splash-design.md)

**Source asset:** `/Users/admin/Desktop/ION-LOGO-03.svg` (viewBox `0 0 173.3 73.75`, three paths: I, N, and O+inner-shape)

---

## File Structure

```
ion-splash/
├── .gitignore
├── package.json                 # Node deps (svgson) + scripts (build, test, preview)
├── README.md                    # Integration notes for iOS / Android / RN
├── splash.json                  # OUTPUT (committed)
├── splash-preview.html          # Local preview page
├── src/
│   ├── build.js                 # Entry: orchestrates build, writes splash.json
│   ├── paths.js                 # Lottie bezier path data for I, O outer, inner shape, N
│   ├── layers.js                # Builders: stroke layer, fill layer, spark, halo
│   └── animation.js             # Constants: fps, duration, color, easing helpers
└── tests/
    └── splash.test.js           # node --test: validates output JSON structure & invariants
```

**Per-file responsibility:**
- `paths.js` — pure data. Exports four named path objects in Lottie shape format (`{i, o, v, c}`). No animation logic.
- `layers.js` — pure functions. Takes path data + animation params, returns Lottie layer objects.
- `animation.js` — constants and easing helpers. No layer-building logic.
- `build.js` — orchestration. Imports the above, assembles the final Lottie document, writes `splash.json`.
- `splash.test.js` — validates `splash.json` after a build.

---

## Conventions

- **Frame rate:** 60fps. All durations in the spec convert to frames as `seconds * 60`.
- **Colors in Lottie:** RGB normalized to `[0..1]` (e.g., `#FFFFFF` → `[1, 1, 1]`).
- **Commit cadence:** one commit per task. Use Conventional Commits (`feat:`, `chore:`, `test:`, `docs:`).
- **TDD:** every code task adds a test first, runs it red, implements, runs it green, commits.

---

## Task 1: Project scaffolding

**Files:**
- Create: `.gitignore`
- Create: `package.json`

- [ ] **Step 1: Create `.gitignore`**

```
node_modules/
.DS_Store
*.log
```

- [ ] **Step 2: Create `package.json`**

```json
{
  "name": "ion-splash",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "engines": { "node": ">=20" },
  "scripts": {
    "build": "node src/build.js",
    "test": "node --test tests/",
    "preview": "python3 -m http.server 8080"
  },
  "devDependencies": {
    "svgson": "^5.3.1"
  }
}
```

- [ ] **Step 3: Install deps**

Run: `npm install`
Expected: creates `node_modules/`, `package-lock.json` written.

- [ ] **Step 4: Commit**

```bash
git add .gitignore package.json package-lock.json
git commit -m "chore: scaffold node project"
```

---

## Task 2: Animation constants module

**Files:**
- Create: `src/animation.js`
- Create: `tests/animation.test.js`

- [ ] **Step 1: Write the failing test**

`tests/animation.test.js`:
```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FPS, TOTAL_FRAMES, COLORS, sec, hexToRgb } from '../src/animation.js';

test('FPS is 60', () => {
  assert.equal(FPS, 60);
});

test('TOTAL_FRAMES covers 2.5s reveal + 2s loop = 4.5s', () => {
  assert.equal(TOTAL_FRAMES, 270);
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
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/animation.js`**

```javascript
export const FPS = 60;
export const TOTAL_FRAMES = 270; // 4.5s at 60fps (2.5s reveal + 2s breathing loop)

export const sec = (s) => Math.round(s * FPS);

export const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
};

export const COLORS = {
  background: hexToRgb('#0F0A2E'),
  stroke: hexToRgb('#FFFFFF'),
  accent: hexToRgb('#00E5FF'),
};

// Premium ease: cubic-bezier(0.65, 0, 0.35, 1) → Lottie keyframe easing
export const PREMIUM_EASE = {
  i: { x: [0.35], y: [1] },   // in tangent (entering keyframe)
  o: { x: [0.65], y: [0] },   // out tangent (leaving keyframe)
};

// Easing for fast spark flash
export const EASE_OUT = {
  i: { x: [0.25], y: [1] },
  o: { x: [0.5], y: [1] },
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add src/animation.js tests/animation.test.js
git commit -m "feat: add animation constants and helpers"
```

---

## Task 3: SVG path extraction utility

**Files:**
- Create: `src/extract-paths.js` (one-time helper, run manually)
- Create: `tests/extract-paths.test.js`

**Purpose:** Read `/Users/admin/Desktop/ION-LOGO-03.svg`, parse the three top-level paths, and emit normalized cubic-bezier vertex data suitable for hand-tuning into Lottie shape format.

> **Implementation note:** This script does the *one-time conversion* from SVG `d` strings to a vertex+tangent representation. The output is reviewed by the engineer and committed into `src/paths.js` as static data. We deliberately do NOT do this conversion at build time — the data is small, stable, and we want it visible in code review.

- [ ] **Step 1: Write the failing test**

`tests/extract-paths.test.js`:
```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseSvgPath } from '../src/extract-paths.js';

test('parseSvgPath returns vertices for a simple cubic path', () => {
  // M0,0 c10,0 20,0 30,0 → one segment, two endpoints + tangents
  const result = parseSvgPath('M0,0 c10,0 20,0 30,0');
  assert.equal(result.v.length, 2);          // start vertex + end vertex
  assert.deepEqual(result.v[0], [0, 0]);
  assert.deepEqual(result.v[1], [30, 0]);
  assert.equal(result.o.length, 2);          // out tangents (relative to vertex)
  assert.equal(result.i.length, 2);          // in tangents (relative to vertex)
  assert.deepEqual(result.o[0], [10, 0]);    // first vertex out-tangent = c1 - vertex
  assert.deepEqual(result.i[1], [-10, 0]);   // last vertex in-tangent = c2 - vertex
  assert.equal(result.c, false);             // not closed (no Z)
});

test('parseSvgPath handles closed paths', () => {
  const result = parseSvgPath('M0,0 c10,0 20,0 30,0 z');
  assert.equal(result.c, true);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/extract-paths.js`**

```javascript
// Parses SVG path 'd' strings into Lottie bezier shape data: {i, o, v, c}.
// Supports: M/m (moveto), C/c (cubic bezier), Z/z (close).
// Other commands (L, H, V, S, Q, T, A) are NOT supported — the ION logo only uses M, c, and z.

const TOKEN_RE = /([MmCcZz])|(-?\d*\.?\d+(?:[eE][-+]?\d+)?)/g;

function tokenize(d) {
  const tokens = [];
  for (const m of d.matchAll(TOKEN_RE)) {
    tokens.push(m[1] ?? Number(m[2]));
  }
  return tokens;
}

export function parseSvgPath(d) {
  const tokens = tokenize(d);
  const vertices = [];   // absolute [x,y]
  const inTans = [];     // relative to vertex
  const outTans = [];    // relative to vertex
  let cx = 0, cy = 0;    // current pen position
  let closed = false;
  let cmd = null;
  let i = 0;

  while (i < tokens.length) {
    const t = tokens[i];
    if (typeof t === 'string') { cmd = t; i++; continue; }

    if (cmd === 'M' || cmd === 'm') {
      const x = cmd === 'M' ? tokens[i] : cx + tokens[i];
      const y = cmd === 'M' ? tokens[i + 1] : cy + tokens[i + 1];
      cx = x; cy = y;
      vertices.push([x, y]);
      inTans.push([0, 0]);
      outTans.push([0, 0]);
      i += 2;
      cmd = (cmd === 'M') ? 'L' : 'l'; // implicit lineto if more pairs follow (not used here)
    } else if (cmd === 'C' || cmd === 'c') {
      const rel = cmd === 'c';
      const c1x = (rel ? cx : 0) + tokens[i];
      const c1y = (rel ? cy : 0) + tokens[i + 1];
      const c2x = (rel ? cx : 0) + tokens[i + 2];
      const c2y = (rel ? cy : 0) + tokens[i + 3];
      const ex  = (rel ? cx : 0) + tokens[i + 4];
      const ey  = (rel ? cy : 0) + tokens[i + 5];

      // Out-tangent of previous vertex = c1 - prevVertex
      const lastIdx = vertices.length - 1;
      outTans[lastIdx] = [c1x - vertices[lastIdx][0], c1y - vertices[lastIdx][1]];

      // New vertex with in-tangent = c2 - newVertex
      vertices.push([ex, ey]);
      inTans.push([c2x - ex, c2y - ey]);
      outTans.push([0, 0]);
      cx = ex; cy = ey;
      i += 6;
    } else if (cmd === 'Z' || cmd === 'z') {
      closed = true;
      i++;
    } else {
      throw new Error(`Unsupported SVG path command: ${cmd}`);
    }
  }

  return { v: vertices, i: inTans, o: outTans, c: closed };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/extract-paths.js tests/extract-paths.test.js
git commit -m "feat: add SVG path → Lottie bezier parser"
```

---

## Task 4: Generate path data and inspect inner shape

**Files:**
- Create: `src/paths.js`
- Create: `scripts/dump-paths.js` (one-time helper)
- Create: `tests/paths.test.js`

- [ ] **Step 1: Write the helper script**

`scripts/dump-paths.js`:
```javascript
import { readFileSync } from 'node:fs';
import { parse } from 'svgson';
import { parseSvgPath } from '../src/extract-paths.js';

const svg = readFileSync('/Users/admin/Desktop/ION-LOGO-03.svg', 'utf8');
const tree = await parse(svg);

const paths = tree.children.filter(c => c.name === 'path');
console.log(`Found ${paths.length} top-level paths.`);

paths.forEach((p, idx) => {
  const d = p.attributes.d;
  // Split compound paths on M/m to identify subpaths
  const subpaths = d.split(/(?=[Mm])/).filter(s => s.trim());
  console.log(`\n=== Path ${idx} (${subpaths.length} subpath${subpaths.length > 1 ? 's' : ''}) ===`);
  subpaths.forEach((sp, sIdx) => {
    const parsed = parseSvgPath(sp);
    console.log(`  Subpath ${sIdx}: ${parsed.v.length} vertices, closed=${parsed.c}`);
    console.log(`    First vertex: [${parsed.v[0]}]`);
  });
});
```

- [ ] **Step 2: Run the helper and capture output**

Run: `node scripts/dump-paths.js`
Expected output (will look something like):
```
Found 3 top-level paths.

=== Path 0 (1 subpath) ===
  Subpath 0: N vertices, closed=true
    First vertex: [6.31, 4.18]

=== Path 1 (1 subpath) ===
  Subpath 0: N vertices, closed=true
    First vertex: [114.71, 2.59]

=== Path 2 (2 subpaths) ===
  Subpath 0: N vertices, closed=true     ← outer "O" ring
    First vertex: [63.52, 2.06]
  Subpath 1: N vertices, closed=true     ← inner figures shape
    First vertex: [62.82, 60.34]
```

The engineer should **manually copy** the output of a fully-printed dump (extend the script to print `JSON.stringify(parsed)` if needed) into `src/paths.js`.

- [ ] **Step 3: Implement `src/paths.js`**

The file exports four constants:

```javascript
// Lottie bezier shape data extracted from /Users/admin/Desktop/ION-LOGO-03.svg
// SVG viewBox: 0 0 173.3 73.75
// Coordinates are in viewBox space and will be transformed to canvas space at layer level.

// Path 0 (M6.31,4.18...) — the "I" letter
export const PATH_I = {
  i: [/* fill from dump-paths.js output */],
  o: [/* fill from dump-paths.js output */],
  v: [/* fill from dump-paths.js output */],
  c: true,
};

// Path 1 (M114.71,2.59...) — the "N" letter
export const PATH_N = {
  i: [/* … */], o: [/* … */], v: [/* … */], c: true,
};

// Path 2, subpath 0 (M63.52,2.06...) — outer ring of the "O"
export const PATH_O_OUTER = {
  i: [/* … */], o: [/* … */], v: [/* … */], c: true,
};

// Path 2, subpath 1 (M62.82,60.34...) — inner shape (the two figures)
export const PATH_O_INNER = {
  i: [/* … */], o: [/* … */], v: [/* … */], c: true,
};
```

> **Authoring note:** Extend `scripts/dump-paths.js` with `console.log(JSON.stringify(parsed, null, 2))` for each subpath, copy the output into the four constants. This is a manual one-time transcription.

- [ ] **Step 4: Write tests for paths.js**

`tests/paths.test.js`:
```javascript
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
  // First vertex of "I" path should be near (6.31, 4.18) from the source SVG
  assert.ok(Math.abs(PATH_I.v[0][0] - 6.31) < 0.01);
  assert.ok(Math.abs(PATH_I.v[0][1] - 4.18) < 0.01);
});
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test`
Expected: PASS, all path tests green.

- [ ] **Step 6: Commit**

```bash
git add src/paths.js scripts/dump-paths.js tests/paths.test.js
git commit -m "feat: extract logo path data from source SVG"
```

---

## Task 5: Layer builders — background and stroke layers

**Files:**
- Create: `src/layers.js`
- Create: `tests/layers.test.js`

- [ ] **Step 1: Write the failing test**

`tests/layers.test.js`:
```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { backgroundLayer, strokeLayer } from '../src/layers.js';
import { PATH_I } from '../src/paths.js';
import { COLORS, sec } from '../src/animation.js';

test('backgroundLayer is a solid color filling the canvas', () => {
  const layer = backgroundLayer({ width: 1080, height: 1920, color: COLORS.background });
  assert.equal(layer.ty, 1);                    // solid layer
  assert.equal(layer.sw, 1080);
  assert.equal(layer.sh, 1920);
  assert.deepEqual(layer.sc, '#0f0a2e');        // hex form for solid layers
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
  assert.equal(layer.ty, 4);                    // shape layer
  // shapes contains: path → stroke → trim-path → group transform
  const trim = findShape(layer, 'tm');
  assert.equal(trim.s.k[0].s[0], 0);            // start at 0%
  assert.equal(trim.s.k[1].s[0], 100);          // ends at 100%
  assert.equal(trim.s.k[0].t, sec(0.0));
  assert.equal(trim.s.k[1].t, sec(0.4));
});

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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `layers.js` not found.

- [ ] **Step 3: Implement `src/layers.js`**

```javascript
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
    ty: 1,                          // solid
    nm: 'Background',
    sr: 1,
    ks: { o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [width/2, height/2, 0] }, a: { a: 0, k: [width/2, height/2, 0] }, s: { a: 0, k: [100, 100, 100] } },
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
    ty: 4,                          // shape
    nm: name,
    sr: 1,
    ks: {
      o: { a: 0, k: 100 },
      r: { a: 0, k: 0 },
      p: { a: 0, k: [position[0], position[1], 0] },
      a: { a: 0, k: [86.65, 36.875, 0] },   // SVG viewBox center
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/layers.js tests/layers.test.js
git commit -m "feat: add background and stroke layer builders"
```

---

## Task 6: Layer builders — fill, spark, halo

**Files:**
- Modify: `src/layers.js` (append)
- Modify: `tests/layers.test.js` (append)

- [ ] **Step 1: Add failing tests**

Append to `tests/layers.test.js`:
```javascript
import { fillLayer, sparkLayer, haloLayer, figureLayer } from '../src/layers.js';

test('fillLayer fades opacity 0→100 over a transition window', () => {
  const layer = fillLayer({
    name: 'I-fill',
    path: PATH_I,
    color: COLORS.stroke,
    fadeStartFrame: sec(2.2),
    fadeEndFrame: sec(2.4),
  });
  assert.equal(layer.ty, 4);
  // Opacity is animated on the layer transform
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
  // Opacity flashes 0 → 100 → 0 within 5 frames
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
  assert.equal(layer.ks.o.a, 1);     // opacity animated
  assert.equal(layer.ks.s.a, 1);     // scale animated
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
```

Add this import at the top of `tests/layers.test.js`:
```javascript
import { PATH_O_INNER } from '../src/paths.js';
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `fillLayer`, `sparkLayer`, etc. not exported.

- [ ] **Step 3: Implement the new builders in `src/layers.js`**

Append to `src/layers.js`:
```javascript
export function fillLayer({ name, path, color, fadeStartFrame, fadeEndFrame, position = [540, 960], scale = 100 }) {
  return {
    ddd: 0, ind: nextId(), ty: 4, nm: name, sr: 1,
    ks: {
      o: {
        a: 1,
        k: [
          { t: fadeStartFrame, s: [0],   ...PREMIUM_EASE },
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
          { t: appearStartFrame, s: [0],   ...PREMIUM_EASE },
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
  // A small filled circle that flashes opacity 0 → 100 → 0
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS, all layer tests green.

- [ ] **Step 5: Commit**

```bash
git add src/layers.js tests/layers.test.js
git commit -m "feat: add fill, figure, spark, halo layer builders"
```

---

## Task 7: Build orchestrator

**Files:**
- Create: `src/build.js`
- Create: `tests/splash.test.js`

- [ ] **Step 1: Write the failing test**

`tests/splash.test.js`:
```javascript
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
  // Halo is on top (rendered last in Lottie's first-is-top order means it's first in array)
  assert.deepEqual(names, [
    'halo',
    'spark',
    'N-fill', 'O-fill', 'I-fill',
    'inner-figures',
    'N-stroke', 'O-stroke', 'I-stroke',
    'Background',
  ]);
});

test('splash.json file size is under 50KB', () => {
  const stats = readFileSync(SPLASH_PATH);
  assert.ok(stats.length < 50_000, `splash.json is ${stats.length} bytes`);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `splash.json` does not exist / `build.js` not found.

- [ ] **Step 3: Implement `src/build.js`**

```javascript
import { writeFileSync } from 'node:fs';
import { TOTAL_FRAMES, FPS, COLORS, sec } from './animation.js';
import { PATH_I, PATH_N, PATH_O_OUTER, PATH_O_INNER } from './paths.js';
import {
  resetLayerIds, backgroundLayer, strokeLayer, fillLayer,
  figureLayer, sparkLayer, haloLayer,
} from './layers.js';

resetLayerIds();

const W = 1080, H = 1920;
const CENTER = [W / 2, H / 2];

// Logo native size is 173.3 × 73.75. We scale it to ~50% of canvas width.
// 1080 * 0.5 / 173.3 ≈ 3.12 → use 312 (Lottie scale is %).
const LOGO_SCALE = 312;

// Position offsets for individual letters (logo viewBox coords with logo center at canvas center)
// All letter layers share the same anchor (the SVG viewBox center) and the same position (canvas center).
// They render correctly because each path keeps its viewBox-space coordinates.
const LETTER_POS = CENTER;

// Spark sits between the two halves of the inner shape — viewBox x ≈ 63 (center of "O")
// In canvas space: CENTER + (63 - 86.65) * (LOGO_SCALE/100) ≈ CENTER + offset
const SPARK_POS = [
  CENTER[0] + (63.5 - 86.65) * (LOGO_SCALE / 100),
  CENTER[1] + (37.0 - 36.875) * (LOGO_SCALE / 100),
];

// Layers in Lottie array order: index 0 is rendered LAST (on top).
const layers = [
  haloLayer({
    position: CENTER,
    color: COLORS.accent,
    pulseStartFrame: sec(2.4),
    pulseEndFrame: sec(2.5),
  }),
  sparkLayer({
    position: SPARK_POS,
    color: COLORS.accent,
    flashFrame: sec(1.4),
    durationFrames: 6,
  }),
  // Final solid-fill versions of each letter (cross-fade in at 2.2s)
  fillLayer({ name: 'N-fill', path: PATH_N, color: COLORS.stroke, fadeStartFrame: sec(2.2), fadeEndFrame: sec(2.4), position: LETTER_POS, scale: LOGO_SCALE }),
  fillLayer({ name: 'O-fill', path: PATH_O_OUTER, color: COLORS.stroke, fadeStartFrame: sec(2.2), fadeEndFrame: sec(2.4), position: LETTER_POS, scale: LOGO_SCALE }),
  fillLayer({ name: 'I-fill', path: PATH_I, color: COLORS.stroke, fadeStartFrame: sec(2.2), fadeEndFrame: sec(2.4), position: LETTER_POS, scale: LOGO_SCALE }),
  // Inner figures: one compound shape that fades in across the spark beat (1.2s → 1.6s)
  figureLayer({ name: 'inner-figures', path: PATH_O_INNER, color: COLORS.stroke, appearStartFrame: sec(1.2), appearEndFrame: sec(1.6), position: LETTER_POS, scale: LOGO_SCALE }),
  // Stroke draws (these animate via trim path)
  strokeLayer({ name: 'N-stroke', path: PATH_N, color: COLORS.stroke, strokeWidth: 2, drawStartFrame: sec(1.6), drawEndFrame: sec(2.2), position: LETTER_POS, scale: LOGO_SCALE }),
  strokeLayer({ name: 'O-stroke', path: PATH_O_OUTER, color: COLORS.stroke, strokeWidth: 2, drawStartFrame: sec(0.4), drawEndFrame: sec(1.2), position: LETTER_POS, scale: LOGO_SCALE }),
  strokeLayer({ name: 'I-stroke', path: PATH_I, color: COLORS.stroke, strokeWidth: 2, drawStartFrame: sec(0.0), drawEndFrame: sec(0.4), position: LETTER_POS, scale: LOGO_SCALE }),
  backgroundLayer({ width: W, height: H, color: COLORS.background }),
];

const lottie = {
  v: '5.7.4',
  fr: FPS,
  ip: 0,
  op: TOTAL_FRAMES,
  w: W,
  h: H,
  nm: 'ION Splash',
  ddd: 0,
  assets: [],
  layers,
  markers: [
    { tm: 0,           cm: 'reveal-start', dr: 0 },
    { tm: sec(2.5),    cm: 'reveal-end',   dr: 0 },
    { tm: sec(2.5),    cm: 'loop-start',   dr: 0 },
    { tm: TOTAL_FRAMES, cm: 'loop-end',    dr: 0 },
  ],
};

const outPath = new URL('../splash.json', import.meta.url).pathname;
writeFileSync(outPath, JSON.stringify(lottie));
console.log(`Wrote ${outPath} (${(JSON.stringify(lottie).length / 1024).toFixed(1)} KB)`);
```

- [ ] **Step 4: Run the build and tests**

Run: `npm run build && npm test`
Expected: build prints file size, all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/build.js tests/splash.test.js splash.json
git commit -m "feat: assemble splash.json from layer builders"
```

---

## Task 8: Preview HTML page

**Files:**
- Create: `splash-preview.html`

- [ ] **Step 1: Create the preview page**

`splash-preview.html`:
```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>ION Splash — Preview</title>
  <style>
    :root { color-scheme: dark; }
    body { margin: 0; font-family: -apple-system, system-ui, sans-serif; background: #0F0A2E; color: #fff; }
    .stage { display: flex; align-items: center; justify-content: center; height: 80vh; }
    .stage.light { background: #ffffff; }
    #anim { width: min(360px, 80vw); aspect-ratio: 1080 / 1920; }
    .controls { padding: 16px; display: flex; gap: 12px; align-items: center; flex-wrap: wrap; background: #000; }
    button { padding: 8px 14px; border: 1px solid #444; background: #1d1645; color: #fff; border-radius: 6px; cursor: pointer; font-size: 14px; }
    button:hover { background: #2a2058; }
    input[type=range] { flex: 1; min-width: 200px; }
    label { font-size: 14px; opacity: 0.8; }
  </style>
</head>
<body>
  <div class="stage" id="stage">
    <div id="anim"></div>
  </div>
  <div class="controls">
    <button id="play">Play</button>
    <button id="pause">Pause</button>
    <button id="restart">Restart</button>
    <button id="bg-toggle">Toggle background</button>
    <label>Frame: <span id="frame">0</span></label>
    <input type="range" id="scrub" min="0" max="270" value="0" step="1" />
  </div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js"></script>
  <script>
    const anim = lottie.loadAnimation({
      container: document.getElementById('anim'),
      renderer: 'svg',
      loop: false,
      autoplay: true,
      path: './splash.json',
    });

    document.getElementById('play').onclick    = () => anim.play();
    document.getElementById('pause').onclick   = () => anim.pause();
    document.getElementById('restart').onclick = () => { anim.goToAndStop(0, true); anim.play(); };

    const stage = document.getElementById('stage');
    document.getElementById('bg-toggle').onclick = () => stage.classList.toggle('light');

    const scrub = document.getElementById('scrub');
    const frameLabel = document.getElementById('frame');
    anim.addEventListener('DOMLoaded', () => {
      scrub.max = anim.totalFrames;
    });
    anim.addEventListener('enterFrame', (e) => {
      scrub.value = Math.round(e.currentTime);
      frameLabel.textContent = Math.round(e.currentTime);
    });
    scrub.addEventListener('input', () => {
      anim.goToAndStop(Number(scrub.value), true);
      frameLabel.textContent = scrub.value;
    });
  </script>
</body>
</html>
```

- [ ] **Step 2: Manually verify in browser**

Run: `npm run preview`
Open: http://localhost:8080/splash-preview.html

Verify:
- The animation plays automatically on load
- The "I" draws first (left side)
- The "O" outer ring draws next, then the inner shape appears with a cyan flash
- The "N" draws last
- All letters cross-fade to solid white
- A cyan halo pulses outward
- Scrubbing works; toggling the background swaps between dark navy and white

If anything is visually off, iterate by tweaking `src/animation.js` keyframe values, re-running `npm run build`, and refreshing the browser.

- [ ] **Step 3: Commit**

```bash
git add splash-preview.html
git commit -m "feat: add local Lottie preview page"
```

---

## Task 9: Optional breathing loop

**Files:**
- Modify: `src/build.js` — add a parent group transform with looped scale animation, OR add a separate "loop marker" without looping (decide based on visual review)

> **Decision point:** After Task 8 visual review, decide whether to enable the breathing loop:
> - **Option A (recommended):** Add a sine-wave scale loop on the fill layers from frame 150 to 270 (1.000 → 1.015 → 1.000). Subtle "alive" signal during app load.
> - **Option B:** Skip the loop. Splash holds static at frame 150. The mobile app dismisses it as soon as it's ready.
>
> If Option A, do this task. Otherwise skip and proceed to Task 10.

- [ ] **Step 1: Add a failing test**

Append to `tests/splash.test.js`:
```javascript
test('fill layers have a breathing scale loop after frame 150', () => {
  const json = JSON.parse(readFileSync(SPLASH_PATH, 'utf8'));
  const fill = json.layers.find(l => l.nm === 'I-fill');
  assert.equal(fill.ks.s.a, 1, 'scale should be animated');
  // Should have keyframes at 150, 210, 270
  const times = fill.ks.s.k.map(k => k.t);
  assert.ok(times.includes(150));
  assert.ok(times.includes(210));
  assert.ok(times.includes(270));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL.

- [ ] **Step 3: Modify `fillLayer` in `src/layers.js` to support an optional `breathe` flag**

In `fillLayer`, replace the static `s` transform with conditional animated keyframes when `breathe: true` is passed:
```javascript
s: breathe
  ? {
      a: 1,
      k: [
        { t: 150, s: [scale, scale, 100] },
        { t: 210, s: [scale * 1.015, scale * 1.015, 100] },
        { t: 270, s: [scale, scale, 100] },
      ],
    }
  : { a: 0, k: [scale, scale, 100] },
```

Update the function signature to accept `breathe` (default `false`).

- [ ] **Step 4: Pass `breathe: true` from `src/build.js` for the three `*-fill` layers**

```javascript
fillLayer({ name: 'N-fill', path: PATH_N, ..., breathe: true }),
fillLayer({ name: 'O-fill', path: PATH_O_OUTER, ..., breathe: true }),
fillLayer({ name: 'I-fill', path: PATH_I, ..., breathe: true }),
```

- [ ] **Step 5: Build and run tests**

Run: `npm run build && npm test`
Expected: PASS.

- [ ] **Step 6: Visually verify in preview**

Open the preview, watch the loop after the reveal completes. The pulse should be barely perceptible — a quiet "still alive" signal, not a heartbeat.

- [ ] **Step 7: Commit**

```bash
git add src/layers.js src/build.js tests/splash.test.js splash.json
git commit -m "feat: add subtle breathing loop after reveal"
```

---

## Task 10: README with integration notes

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write the README**

```markdown
# ION Splash

Animated splash screen for the ION mobile app, delivered as a Lottie JSON file.

## Files

- `splash.json` — the Lottie animation. Drop this into your mobile app and play it via the appropriate Lottie runtime.
- `splash-preview.html` — local browser preview with scrubbing, play/pause, and a dark/light background toggle.
- `src/`, `tests/` — the builder script and tests. Run `npm install && npm run build` to regenerate `splash.json`.

## Animation

- **Background color:** `#0F0A2E` (deep navy)
- **Duration:** 2.5s reveal, then a 2s subtle breathing loop
- **Markers:** `reveal-start` (0s), `reveal-end` / `loop-start` (2.5s), `loop-end` (4.5s)

The mobile app should:
1. Display the splash full-screen
2. Play the animation from `reveal-start`
3. Once the app finishes loading, transition out (fade or cross-dissolve to the home screen). It is fine to dismiss mid-loop.

## Integration

### iOS (lottie-ios)

```swift
import Lottie

let animationView = LottieAnimationView(name: "splash")
animationView.contentMode = .scaleAspectFit
animationView.backgroundColor = UIColor(red: 0x0F/255, green: 0x0A/255, blue: 0x2E/255, alpha: 1)
animationView.frame = view.bounds
view.addSubview(animationView)

animationView.play(fromMarker: "reveal-start", toMarker: "loop-end", loopMode: .playOnce) { _ in
    // App ready — transition to home screen
}
```

### Android (lottie-android)

```xml
<com.airbnb.lottie.LottieAnimationView
    android:id="@+id/splash"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#0F0A2E"
    app:lottie_fileName="splash.json"
    app:lottie_autoPlay="true"
    app:lottie_loop="false" />
```

```kotlin
splashView.addAnimatorListener(object : AnimatorListenerAdapter() {
    override fun onAnimationEnd(animation: Animator) {
        // App ready — transition to home screen
    }
})
```

### React Native (lottie-react-native)

```jsx
import LottieView from 'lottie-react-native';

<LottieView
  source={require('./splash.json')}
  autoPlay
  loop={false}
  style={{ flex: 1, backgroundColor: '#0F0A2E' }}
  onAnimationFinish={() => { /* transition to home */ }}
/>
```

## Local development

```bash
npm install
npm run build       # regenerates splash.json
npm test            # runs validation tests
npm run preview     # serves at http://localhost:8080
# then open http://localhost:8080/splash-preview.html
```

## Customizing

To tweak timing, colors, or easing, edit `src/animation.js` and `src/build.js`, then re-run `npm run build`. The `splash.json` file is generated — do not edit it by hand.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README with integration notes for iOS/Android/RN"
```

---

## Task 11: Final visual review and tuning

**Files:**
- Modify (if needed): `src/animation.js`, `src/layers.js`, `src/build.js`

- [ ] **Step 1: Open the preview and play through several times**

Run: `npm run preview` → open http://localhost:8080/splash-preview.html

Watch for:
- ✅ The "I" draws as a single confident gesture from above
- ✅ The transition from "I" finish to "O" start feels continuous (no obvious gap)
- ✅ The cyan spark is clearly the focal moment — your eye goes to it
- ✅ The cross-fade from stroke to fill is invisible (both look like "the logo is there")
- ✅ The halo expands and dissolves smoothly, not abruptly
- ✅ The breathing loop is subtle enough to be "felt, not noticed"
- ✅ At no point does the animation feel busy or cluttered

- [ ] **Step 2: Tune any beats that don't feel right**

Common adjustments:
- Spark too bright: reduce its base opacity in `sparkLayer` (e.g., max keyframe to `[80]`)
- Halo too aggressive: reduce `pulseStartFrame` opacity from 60 to 40
- Draw feels slow: shave 0.1s off the slowest segment (usually the "O" outer ring)
- Cross-fade pop: extend the fade from 0.2s to 0.3s

After each change: `npm run build` then refresh the browser.

- [ ] **Step 3: Confirm file size and structure**

Run: `npm test`
Expected: all tests pass, including the <50KB size check.

Run: `wc -c splash.json`
Expected: under 50,000 bytes.

- [ ] **Step 4: Final commit (only if changes were made)**

```bash
git add src/ splash.json
git commit -m "polish: final timing and color tuning"
```

---

## Self-review checklist (post-implementation)

After all tasks pass, the engineer should verify:

- [ ] `splash.json` exists at the project root
- [ ] `splash.json` is < 50KB
- [ ] All tests pass (`npm test`)
- [ ] The preview plays smoothly at 60fps
- [ ] The README integration snippets compile/lint in their respective platforms (or at minimum, look syntactically correct)
- [ ] No `TODO`, `FIXME`, or placeholder values remain in the source files
- [ ] Git log is clean and incremental (one commit per task)
