/* Downloads the picture of each finished building into src/sprites/builds/.

   Serebii's kit icon and Bulbapedia's are the same in-game render of the completed
   building; Serebii's has an orange "kit" badge stamped in the corner, Bulbapedia's does
   not. The badge-free one is what belongs next to a kit's requirements, so it comes from
   the Bulbagarden Archives, resolved through the API rather than guessed — the upload
   path is a hash of the file name and cannot be built from the name alone.

   No source publishes an in-world screenshot of each building, so this render is as close
   to "the finished house" as the game's own material gets. */
import fs from 'node:fs';
import path from 'node:path';

const API = 'https://archives.bulbagarden.net/w/api.php';
const UA = 'PokopiaWiki/1.0 (static site build script for a Pokémon Pokopia fan wiki)';
const OUT = 'src/sprites/builds';
const sleep = ms => new Promise(r => setTimeout(r, ms));

const wanted = [...new Set(
  JSON.parse(fs.readFileSync('data/buildkits.json', 'utf8')).map(k => k.build).filter(Boolean)
)];
const missing = wanted.filter(f => !fs.existsSync(path.join(OUT, f)));
if (!missing.length) { console.log(`builds   ${wanted.length}/${wanted.length}  cached`); process.exit(0); }
fs.mkdirSync(OUT, { recursive: true });

/** ask the Archives where these files actually live (50 titles per call is the API cap) */
async function urls(names) {
  const out = new Map();
  for (let i = 0; i < names.length; i += 40) {
    const batch = names.slice(i, i + 40);
    const u = new URL(API);
    u.search = new URLSearchParams({
      action: 'query', prop: 'imageinfo', iiprop: 'url',
      titles: batch.map(n => `File:${n.replace(/_/g, ' ')}`).join('|'),
      format: 'json', formatversion: '2',
    });
    const r = await fetch(u, { headers: { 'User-Agent': UA } });
    const body = await r.text();
    if (!body.startsWith('{')) { console.error('  ! Archives returned no JSON'); continue; }
    for (const page of JSON.parse(body).query?.pages || []) {
      const url = page.imageinfo?.[0]?.url;
      if (url) out.set(page.title.replace(/^File:/, '').replace(/ /g, '_'), url);
    }
    await sleep(400);
  }
  return out;
}

const found = await urls(missing);
let bytes = 0, done = 0, missed = 0;
for (const name of missing) {
  const url = found.get(name);
  done++;
  if (!url) { missed++; console.error(`  ! no such file on the Archives: ${name}`); continue; }
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const buf = Buffer.from(await r.arrayBuffer());
    fs.writeFileSync(path.join(OUT, name), buf);
    bytes += buf.length;
  } catch (e) { missed++; console.error(`  ! ${String(e.message || e)} ${name}`); }
  process.stderr.write(`builds   ${done}/${missing.length}  ${(bytes / 1e6).toFixed(1)}MB   \r`);
  await sleep(250);
}
console.log(`builds   ${done}/${missing.length}  ${(bytes / 1e6).toFixed(1)}MB${missed ? `, ${missed} missing` : ''}`);
