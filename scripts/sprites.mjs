// Downloads every picture the site uses into src/sprites/ so the published site is
// self-contained (no hotlinking, no external requests at runtime).
//
//   small/     PokéAPI species sprite      committed
//   art/       PokéAPI official artwork    downloaded  (~46 MB)
//   items/     item icon per item id       downloaded  (~45 MB)
//   habitats/  habitat-dex picture         downloaded  (~15 MB)
//   outfits/   outfit thumbnail            downloaded
//   moves/     Ditto's move icon           downloaded
//   specialty/ specialty badge             downloaded
//   builds/    finished-building render    downloaded
//   patterns/  paint pattern swatch        downloaded
//
// Everything is skip-if-present, so a re-run only fetches what is missing.
import fs from 'node:fs';
import path from 'node:path';

const POKEAPI = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
const SEREBII = 'https://www.serebii.net/pokemonpokopia';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

const j = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const dir = d => (fs.mkdirSync(d, { recursive: true }), d);
const sleep = ms => new Promise(r => setTimeout(r, ms));

let bytes = 0, done = 0, total = 0, missed = 0;

// Serebii drops the connection when pushed, so each fetch gets three tries with backoff.
async function grab(url, dest, headers) {
  done++;
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) return;
  for (let attempt = 1; ; attempt++) {
    try {
      const r = await fetch(url, { headers });
      if (r.status === 404) { missed++; console.error(`MISS 404 ${url}`); return; }
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const buf = Buffer.from(await r.arrayBuffer());
      fs.writeFileSync(dest, buf);
      bytes += buf.length;
      return;
    } catch (e) {
      if (attempt === 3) { missed++; console.error(`MISS ${e.message} ${url}`); return; }
      await sleep(600 * attempt * attempt);
    }
  }
}

/** run the jobs `n` at a time, printing one progress line */
async function run(label, jobs, n = 8) {
  total = jobs.length; done = 0;
  for (let i = 0; i < jobs.length; i += n) {
    await Promise.all(jobs.slice(i, i + n).map(f => f()));
    process.stderr.write(`${label} ${done}/${total}  ${(bytes / 1e6).toFixed(1)}MB   \r`);
  }
  process.stderr.write(`${label} ${total}/${total}  ${(bytes / 1e6).toFixed(1)}MB   \n`);
}

/* ---------- Pokémon sprites and artwork (PokéAPI) ---------- */
{
  const small = dir('src/sprites/small'), art = dir('src/sprites/art');
  const ids = [...new Set(j('data/pokemon.json').map(p => p.natdex))].sort((a, b) => a - b);
  await run('species ', ids.flatMap(id => [
    () => grab(`${POKEAPI}/${id}.png`, path.join(small, `${id}.png`)),
    () => grab(`${POKEAPI}/other/official-artwork/${id}.png`, path.join(art, `${id}.png`)),
  ]));
}

/* ---------- item icons (Serebii) ----------
   data/*.json store the bare file name; every icon lives under /pokemonpokopia/items/.
   Serebii refuses requests without a browser User-Agent, hence the headers. */
const SB = { 'User-Agent': UA, Referer: `${SEREBII}/items.shtml` };
{
  const out = dir('src/sprites/items');
  const files = new Set();
  for (const f of ['items', 'furniture', 'buildkits', 'cds', 'lostrelics', 'cooking']) {
    for (const x of j(`data/${f}.json`)) if (x.img) files.add(x.img);
  }
  for (const r of j('data/recipes.json')) {
    if (r.img) files.add(r.img);
    for (const m of r.materials) if (m.img) files.add(m.img);
  }
  // the favourite-category pages list a few items that appear nowhere else
  for (const f of j('data/favorites.json')) for (const i of f.items) if (i.img) files.add(i.img);
  await run('items   ', [...files].map(f =>
    () => grab(`${SEREBII}/items/${encodeURIComponent(f)}`, path.join(out, f), SB)), 4);
}

/* ---------- habitat pictures (Serebii habitat dex) ---------- */
{
  const out = dir('src/sprites/habitats');
  const files = [...new Set(j('data/habitats.json').map(h => h.img).filter(Boolean))];
  await run('habitats', files.map(f =>
    () => grab(`${SEREBII}/habitatdex/th/${f}`, path.join(out, f), SB)), 4);
}

/* ---------- Ditto's move icons ---------- */
{
  const out = dir('src/sprites/moves');
  const files = [...new Set(j('data/moves.json').map(m => m.img).filter(Boolean))];
  await run('moves   ', files.map(f =>
    () => grab(`${SEREBII}/ditto/${f}`, path.join(out, f), SB)), 4);
}

/* ---------- specialty badges ---------- */
/* Serebii drops the hyphen from a specialty id in the filename: "hot-spring" is
   hotspring.png. All 32 exist. */
{
  const out = dir('src/sprites/specialty');
  const ids = j('data/specialties.json').map(x => x.id);
  await run('specialty', ids.map(id =>
    () => grab(`${SEREBII}/pokedex/specialty/${id.replace(/-/g, '')}.png`, path.join(out, `${id}.png`), SB)), 4);
}

/* ---------- paint patterns ---------- */
{
  const out = dir('src/sprites/patterns');
  const files = [...new Set(j('data/patterns.json').map(x => x.img).filter(Boolean))];
  await run('patterns', files.map(f =>
    () => grab(`${SEREBII}/pattern/${f}`, path.join(out, f), SB)), 4);
}

/* ---------- outfit thumbnails ---------- */
{
  const out = dir('src/sprites/outfits');
  const files = [...new Set(j('data/outfits.json').map(o => o.img).filter(Boolean))];
  await run('outfits ', files.map(f =>
    () => grab(`${SEREBII}/custom/th/${f}`, path.join(out, f), SB)), 4);
}

console.log(`downloaded ${(bytes / 1e6).toFixed(1)}MB${missed ? `, ${missed} missing` : ''}`);

/* the building renders and the sprites for items Serebii omits come from the Bulbagarden
   Archives, which needs an API lookup to resolve each upload path, so they live apart */
await import('./archives.mjs');
