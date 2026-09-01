/* Per-Pokémon time-of-day and weather, from Pokopia Lab.

   Serebii, Bulbapedia and the Dexerto habitat dex all describe the mechanic without
   publishing per-species values. Pokopia Lab does: its Pokémon pages render a row of time
   chips and a row of weather chips, with the ones that do not apply dimmed rather than
   removed. So the state lives in the class list — an inapplicable chip carries opacity-30
   — and reading the labels alone would wrongly report every Pokémon as unrestricted.

     node scripts/labtimes.mjs          # fetch what is missing, then parse
     node scripts/labtimes.mjs --parse  # parse the cached pages only
*/
import fs from 'node:fs';
import path from 'node:path';

const SITE = 'https://pokopialab.com/pokemon';
const UA = 'PokopiaWiki/1.0 (fan wiki build script; github.com/justatom/pokopia-wiki)';
const CACHE = '_research/lab';
const OUT = '_research/labtimes.json';
const TIMES = ['Morning', 'Day', 'Sunset', 'Night'];
const WEATHER = ['Sunny', 'Cloudy', 'Rainy'];
const PARSE_ONLY = process.argv.includes('--parse');
const sleep = ms => new Promise(r => setTimeout(r, ms));

/** the site's URL slug: apostrophes and dots dropped, spaces hyphenated */
const slug = s => String(s).toLowerCase().replace(/['.’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** a chip is off when its own class list carries opacity-30 */
function states(html) {
  const out = {};
  for (const label of [...TIMES, ...WEATHER]) {
    const at = html.indexOf(`>${label}</span>`);
    if (at < 0) return null;
    const chunk = html.slice(Math.max(0, at - 1400), at);
    const cls = [...chunk.matchAll(/class="((?:flex flex-col items-center)[^"]*)"/g)].pop();
    if (!cls) return null;
    out[label] = !/opacity-30/.test(cls[1]);
  }
  return out;
}

const pokemon = JSON.parse(fs.readFileSync('data/pokemon.json', 'utf8'));
/* the seven unique story Pokémon have no page of their own there, and a form usually
   shares its species' page — except Paldean Wooper, which has its own */
const candidates = p => [...new Set([
  p.form ? slug(`${p.form.replace(/ Form$/i, '')} ${p.name}`) : null,
  slug(p.name),
].filter(Boolean))];

fs.mkdirSync(CACHE, { recursive: true });

if (!PARSE_ONLY) {
  let done = 0, fetched = 0, missing = 0;
  for (const p of pokemon) {
    done++;
    if (candidates(p).some(s => fs.existsSync(path.join(CACHE, `${s}.html`)))) continue;
    let got = false;
    for (const s of candidates(p)) {
      const dest = path.join(CACHE, `${s}.html`);
      if (fs.existsSync(dest)) { got = true; break; }
      // retry a dropped connection rather than losing the Pokémon to one bad request;
      // only a 404 means the site genuinely has no page for it
      let gone = false;
      for (let attempt = 1; attempt <= 3 && !got && !gone; attempt++) {
        try {
          const r = await fetch(`${SITE}/${s}`, { headers: { 'User-Agent': UA } });
          if (r.status === 404) { gone = true; break; }
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          fs.writeFileSync(dest, await r.text());
          fetched++; got = true;
        } catch (e) {
          if (attempt === 3) console.error(`  ! ${s}: ${String(e.message || e)}`);
          await sleep(900 * attempt);
        }
      }
      await sleep(350);
      if (got) break;
    }
    if (!got) missing++;
    process.stderr.write(`lab  ${done}/${pokemon.length}  fetched ${fetched}  no page ${missing}   \r`);
  }
  process.stderr.write('\n');
}

const times = {};
let parsed = 0, absent = [];
for (const p of pokemon) {
  const file = candidates(p).map(s => path.join(CACHE, `${s}.html`)).find(f => fs.existsSync(f));
  const st = file && states(fs.readFileSync(file, 'utf8'));
  if (!st) { absent.push(p.name + (p.form ? ` (${p.form})` : '')); continue; }
  times[p.id] = {
    times: TIMES.filter(t => st[t]),
    weather: WEATHER.filter(w => st[w]),
  };
  parsed++;
}
fs.writeFileSync(OUT, JSON.stringify(times, null, 1));
console.log(`${parsed}/${pokemon.length} Pokémon with time and weather`);
if (absent.length) console.log(`   no page for: ${absent.join(', ')}`);
