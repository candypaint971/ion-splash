const TOKEN_RE = /([A-DF-Za-df-z])|(-?\d*\.?\d+(?:[eE][-+]?\d+)?)/g;

function tokenize(d) {
  const tokens = [];
  for (const m of d.matchAll(TOKEN_RE)) {
    tokens.push(m[1] ?? Number(m[2]));
  }
  return tokens;
}

const isCubicCmd = (c) => c === 'C' || c === 'S';

export function parseSvgPath(d) {
  const tokens = tokenize(d);
  const v = [];
  const inT = [];
  const outT = [];
  let cx = 0, cy = 0;
  let closed = false;
  let cmd = null;
  let prevCmd = null;       // uppercase normalized
  let lastC2 = null;        // absolute coords of last C/S second control point
  let i = 0;

  const addVertex = (x, y) => {
    v.push([x, y]);
    inT.push([0, 0]);
    outT.push([0, 0]);
  };

  while (i < tokens.length) {
    const t = tokens[i];
    if (typeof t === 'string') {
      cmd = t;
      i++;
      if (cmd === 'Z' || cmd === 'z') {
        closed = true;
        prevCmd = 'Z';
        lastC2 = null;
        cmd = null;
      }
      continue;
    }

    if (cmd === 'M' || cmd === 'm') {
      const x = (cmd === 'M' ? 0 : cx) + tokens[i];
      const y = (cmd === 'M' ? 0 : cy) + tokens[i + 1];
      addVertex(x, y);
      cx = x; cy = y;
      i += 2;
      cmd = (cmd === 'M') ? 'L' : 'l'; // implicit lineto
      prevCmd = 'M';
      lastC2 = null;
    } else if (cmd === 'L' || cmd === 'l') {
      const x = (cmd === 'L' ? 0 : cx) + tokens[i];
      const y = (cmd === 'L' ? 0 : cy) + tokens[i + 1];
      addVertex(x, y);
      cx = x; cy = y;
      i += 2;
      prevCmd = 'L';
      lastC2 = null;
    } else if (cmd === 'H' || cmd === 'h') {
      const x = (cmd === 'H' ? 0 : cx) + tokens[i];
      addVertex(x, cy);
      cx = x;
      i += 1;
      prevCmd = 'H';
      lastC2 = null;
    } else if (cmd === 'V' || cmd === 'v') {
      const y = (cmd === 'V' ? 0 : cy) + tokens[i];
      addVertex(cx, y);
      cy = y;
      i += 1;
      prevCmd = 'V';
      lastC2 = null;
    } else if (cmd === 'C' || cmd === 'c') {
      const rel = cmd === 'c';
      const c1x = (rel ? cx : 0) + tokens[i];
      const c1y = (rel ? cy : 0) + tokens[i + 1];
      const c2x = (rel ? cx : 0) + tokens[i + 2];
      const c2y = (rel ? cy : 0) + tokens[i + 3];
      const ex  = (rel ? cx : 0) + tokens[i + 4];
      const ey  = (rel ? cy : 0) + tokens[i + 5];

      const lastIdx = v.length - 1;
      outT[lastIdx] = [c1x - v[lastIdx][0], c1y - v[lastIdx][1]];
      addVertex(ex, ey);
      inT[v.length - 1] = [c2x - ex, c2y - ey];
      cx = ex; cy = ey;
      lastC2 = [c2x, c2y];
      i += 6;
      prevCmd = 'C';
    } else if (cmd === 'S' || cmd === 's') {
      const rel = cmd === 's';
      let c1x, c1y;
      if (isCubicCmd(prevCmd) && lastC2) {
        c1x = 2 * cx - lastC2[0];
        c1y = 2 * cy - lastC2[1];
      } else {
        c1x = cx; c1y = cy;
      }
      const c2x = (rel ? cx : 0) + tokens[i];
      const c2y = (rel ? cy : 0) + tokens[i + 1];
      const ex  = (rel ? cx : 0) + tokens[i + 2];
      const ey  = (rel ? cy : 0) + tokens[i + 3];

      const lastIdx = v.length - 1;
      outT[lastIdx] = [c1x - v[lastIdx][0], c1y - v[lastIdx][1]];
      addVertex(ex, ey);
      inT[v.length - 1] = [c2x - ex, c2y - ey];
      cx = ex; cy = ey;
      lastC2 = [c2x, c2y];
      i += 4;
      prevCmd = 'S';
    } else if (cmd === 'Z' || cmd === 'z') {
      closed = true;
      i++;
      prevCmd = 'Z';
      lastC2 = null;
    } else {
      throw new Error(`Unsupported SVG path command: ${cmd}`);
    }
  }

  return { v, i: inT, o: outT, c: closed };
}
