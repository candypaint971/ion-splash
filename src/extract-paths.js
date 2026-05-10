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
  const vertices = [];
  const inTans = [];
  const outTans = [];
  let cx = 0, cy = 0;
  let closed = false;
  let cmd = null;
  let i = 0;

  while (i < tokens.length) {
    const t = tokens[i];
    if (typeof t === 'string') {
      cmd = t;
      i++;
      if (cmd === 'Z' || cmd === 'z') {
        closed = true;
        cmd = null;
      }
      continue;
    }

    if (cmd === 'M' || cmd === 'm') {
      const x = cmd === 'M' ? tokens[i] : cx + tokens[i];
      const y = cmd === 'M' ? tokens[i + 1] : cy + tokens[i + 1];
      cx = x; cy = y;
      vertices.push([x, y]);
      inTans.push([0, 0]);
      outTans.push([0, 0]);
      i += 2;
      cmd = (cmd === 'M') ? 'L' : 'l';
    } else if (cmd === 'C' || cmd === 'c') {
      const rel = cmd === 'c';
      const c1x = (rel ? cx : 0) + tokens[i];
      const c1y = (rel ? cy : 0) + tokens[i + 1];
      const c2x = (rel ? cx : 0) + tokens[i + 2];
      const c2y = (rel ? cy : 0) + tokens[i + 3];
      const ex  = (rel ? cx : 0) + tokens[i + 4];
      const ey  = (rel ? cy : 0) + tokens[i + 5];

      const lastIdx = vertices.length - 1;
      outTans[lastIdx] = [c1x - vertices[lastIdx][0], c1y - vertices[lastIdx][1]];

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
