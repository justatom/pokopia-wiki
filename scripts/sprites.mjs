// Downloads the PokéAPI sprites used by the site into src/sprites/ so the published
// site is self-contained (no hotlinking, no external requests at runtime).
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
const OUT_SMALL = 'src/sprites/small';
const OUT_ART = 'src/sprites/art';
fs.mkdirSync(OUT_SMALL, { recursive: true });
fs.mkdirSync(OUT_ART, { recursive: true });

const ids = [...new Set(JSON.parse(fs.readFileSync('data/pokemon.json', 'utf8')).map(p => p.natdex))].sort((a, b) => a - b);
console.log(`${ids.length} species`);

async function grab(url, dest) {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) return 0;
  const r = await fetch(url);
  if (!r.ok) { console.error('MISS', url, r.status); return 0; }
  const buf = Buffer.from(await r.arrayBuffer());
  fs.writeFileSync(dest, buf);
  return buf.length;
}

let bytes = 0, done = 0;
for (let i = 0; i < ids.length; i += 8) {
  const batch = ids.slice(i, i + 8);
  const got = await Promise.all(batch.flatMap(id => [
    grab(`${BASE}/${id}.png`, path.join(OUT_SMALL, `${id}.png`)),
    grab(`${BASE}/other/official-artwork/${id}.png`, path.join(OUT_ART, `${id}.png`)),
  ]));
  bytes += got.reduce((a, b) => a + b, 0);
  done += batch.length;
  process.stderr.write(`${done}/${ids.length}  ${(bytes / 1e6).toFixed(1)}MB\r`);
}
console.log(`\ndownloaded ${(bytes / 1e6).toFixed(1)}MB`);
