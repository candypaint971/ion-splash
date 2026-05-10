import { readFileSync } from 'node:fs';
import { parse } from 'svgson';
import { parseSvgPath } from '../src/extract-paths.js';

const svg = readFileSync('/Users/admin/Desktop/ION-LOGO-03.svg', 'utf8');
const tree = await parse(svg);

const paths = tree.children.filter(c => c.name === 'path');
console.log(`Found ${paths.length} top-level paths.`);

paths.forEach((p, idx) => {
  const d = p.attributes.d;
  const subpaths = d.split(/(?=[Mm])/).filter(s => s.trim());
  console.log(`\n=== Path ${idx} (${subpaths.length} subpath${subpaths.length > 1 ? 's' : ''}) ===`);
  subpaths.forEach((sp, sIdx) => {
    const parsed = parseSvgPath(sp);
    console.log(`  Subpath ${sIdx}: ${parsed.v.length} vertices, closed=${parsed.c}, first=[${parsed.v[0]}]`);
    console.log(`    JSON: ${JSON.stringify(parsed)}`);
  });
});
