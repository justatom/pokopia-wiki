/* Re-fetches every upstream source and rebuilds the parsed caches in _research/.
   Only needed when the game gets new content — the parsed JSON is committed, so a
   normal `npm run data` works offline.

     node scripts/scrape.mjs           # fetch + parse everything
     node scripts/scrape.mjs --parse   # re-parse the cached HTML only
*/
import fs from 'node:fs';
import path from 'node:path';

const R = '_research';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const PARSE_ONLY = process.argv.includes('--parse');
fs.mkdirSync(`${R}/serebii`, { recursive: true });

/* ------------------------------------------------------------------ */
/* HTML helpers                                                        */
/* ------------------------------------------------------------------ */
const ENT = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', eacute: 'é', egrave: 'è',
  uuml: 'ü', ouml: 'ö', auml: 'ä', ntilde: 'ñ', ccedil: 'ç', aacute: 'á', iacute: 'í',
  oacute: 'ó', uacute: 'ú', hellip: '…', mdash: '—', ndash: '–', rsquo: '’', lsquo: '‘',
  ldquo: '“', rdquo: '”', times: '×', deg: '°', frac12: '½', trade: '™', reg: '®', copy: '©',
};
const dec = s => String(s)
  .replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(+n))
  .replace(/&#x([0-9a-f]+);/gi, (m, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&([a-zA-Z]+[0-9]*);/g, (m, n) => ENT[n] ?? ENT[n.toLowerCase()] ?? m);

const load = f => fs.readFileSync(f, 'latin1')
  .replace(/�/g, 'é').replace(/Ã©/g, 'é')
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<!--[\s\S]*?-->/g, '');

const txt = s => dec(String(s)
  .replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|li|tr)>/gi, '\n').replace(/<[^>]+>/g, ''))
  .replace(/[ \t]+/g, ' ').split('\n').map(x => x.trim()).filter(Boolean).join('\n');

const imgs = s => [...String(s).matchAll(/<img[^>]*src="([^"]+)"/gi)].map(m => m[1]);

/** split a page into sections keyed by its <a name="…"> anchors */
function sections(h) {
  const parts = []; const re = /<a name="([^"]+)"/g;
  let m, last = null, idx = 0;
  while ((m = re.exec(h))) { parts.push({ anchor: last, html: h.slice(idx, m.index) }); last = m[1]; idx = m.index; }
  parts.push({ anchor: last, html: h.slice(idx) });
  return parts;
}

/** depth-aware row reader: returns the cells of outermost <tr>s, inner HTML intact */
function rows(html) {
  const out = []; const tok = /<(\/?)(table|tr|t[dh])\b[^>]*>/gi;
  let m, depth = 0, trDepth = -1, cur = null, cellStart = -1, cellDepth = -1;
  while ((m = tok.exec(html))) {
    const close = m[1] === '/', tag = m[2].toLowerCase();
    if (tag === 'table') { depth += close ? -1 : 1; continue; }
    if (tag === 'tr') {
      if (!close && (trDepth === -1 || depth <= trDepth)) { if (cur) out.push(cur); cur = []; trDepth = depth; }
      continue;
    }
    if (!close) { if (cur && depth === trDepth && cellStart < 0) { cellStart = tok.lastIndex; cellDepth = depth; } }
    else if (cur && cellStart >= 0 && depth === cellDepth) { cur.push(html.slice(cellStart, m.index)); cellStart = -1; }
  }
  if (cur) out.push(cur);
  return out.filter(r => r.length);
}

const get = async (url, dest) => {
  if (PARSE_ONLY && fs.existsSync(dest)) return;
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) { console.error('  !', r.status, url); return; }
  fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
};

/* ------------------------------------------------------------------ */
/* 1. Serebii — the bulk of the game data                              */
/* ------------------------------------------------------------------ */
const SEREBII = 'abilities availablepokemon basinpokedex building cds cloudislands collect cooking crafting customisation dive dreamislands electricity emotes environmentlevel eventpokedex events expansionpass favorites flavors flowers friendship furniture gameplay habitats hideandsneak highlightreel humanrecords importantrequests internetevents items jumprope legendary litter locations lostrelics magnetrise mosslaxboosts paint patch pokedexcompletion pokemoncenter specialty stampcard teaminitiationchallenge trade treasuremaps uniquepokemon vegetables water'.split(' ');
const SEREBII_LOC = 'bleakbeach bubblybasin palettetown rockyridges sparklingskylands witheredwastelands'.split(' ');

if (!PARSE_ONLY) {
  console.log('fetching Serebii…');
  for (const p of SEREBII) await get(`https://www.serebii.net/pokemonpokopia/${p}.shtml`, `${R}/serebii/${p}.html`);
  for (const p of SEREBII_LOC) await get(`https://www.serebii.net/pokemonpokopia/locations/${p}.shtml`, `${R}/serebii/loc_${p}.html`);
  await get('https://www.serebii.net/pokemonpokopia/expansionpass/bubblybasin.shtml', `${R}/serebii/exp_bubblybasin.html`);
}

console.log('parsing Serebii…');
const raw = {};
for (const f of fs.readdirSync(`${R}/serebii`).filter(x => x.endsWith('.html'))) {
  const h = load(path.join(R, 'serebii', f));
  raw[f.replace(/\.html$/, '')] = {
    heads: [...h.matchAll(/<h([12])[^>]*>([\s\S]*?)<\/h\1>/gi)].map(m => txt(m[2])),
    secs: sections(h).map(s => ({
      anchor: s.anchor,
      text: txt(s.html.replace(/<table[\s\S]*?<\/table>/gi, ' ')).split('\n').filter(x => x.length > 3),
      rows: rows(s.html).map(cells => cells.map(c => ({ t: txt(c).split('\n').filter(Boolean), i: imgs(c) }))),
    })),
  };
}
fs.writeFileSync(`${R}/raw.json`, JSON.stringify(raw));
console.log(`  ${Object.keys(raw).length} pages`);

/* ------------------------------------------------------------------ */
/* 2. Bulbapedia — the three Pokédex orderings, via the MediaWiki API   */
/* ------------------------------------------------------------------ */
const DEX_PAGES = {
  main: 'List of Pokémon by Pokédex number in Pokémon Pokopia',
  event: 'List of Pokémon by Pokédex (Event) number in Pokémon Pokopia',
  basin: 'List of Pokémon by Pokédex (Basin) number in Pokémon Pokopia',
};

/** the dex tables mix a compact template with hand-written rows for alternate forms */
function parseDex(wiki) {
  const out = []; let cur = null;
  const push = () => { if (cur && cur.name) out.push(cur); cur = null; };
  for (const L of wiki.split('\n')) {
    let m = L.match(/^\{\{rdex\|(\d+)\|(\d+)\|([^|]+)\|(\d)\|([^|}]+)(?:\|([^|}]+))?/);
    if (m) {
      push();
      out.push({
        no: +m[1], natdex: +m[2], name: m[3].trim(), form: null,
        types: [m[5].trim()].concat(m[4] === '2' && m[6] ? [m[6].trim()] : []),
      });
      continue;
    }
    m = L.match(/^\|\s*(?:rowspan="\d+"\s*)?style="font-family:monospace[^|]*\|\s*#(\d+)\s*$/);
    if (m) {
      if (cur === null || cur.name) { push(); cur = { no: +m[1], natdex: null, name: null, form: null, types: [] }; }
      else if (cur.natdex === null) cur.natdex = +m[1];
      continue;
    }
    m = L.match(/^\|\s*\{\{p\|([^}|]+)\}\}(?:<br><small>([^<]+)<\/small>)?/);
    if (m && cur) {
      if (cur.name) { const prev = cur; out.push(cur); cur = { no: prev.no, natdex: prev.natdex, name: null, form: null, types: [] }; }
      cur.name = m[1].trim(); cur.form = m[2] ? m[2].trim() : null;
      continue;
    }
    m = L.match(/^\{\{typetable\|([A-Za-z]+)/);
    if (m && cur && cur.name) cur.types.push(m[1]);
  }
  push();
  return out;
}

console.log('fetching Bulbapedia dexes…');
const dex = {};
for (const [key, page] of Object.entries(DEX_PAGES)) {
  const cache = `${R}/bulba_${key}.json`;
  if (!PARSE_ONLY || !fs.existsSync(cache)) {
    const u = new URL('https://bulbapedia.bulbagarden.net/w/api.php');
    u.search = new URLSearchParams({ action: 'parse', page, prop: 'wikitext', format: 'json', formatversion: '2' });
    const r = await fetch(u, { headers: { 'User-Agent': UA } });
    fs.writeFileSync(cache, JSON.stringify(await r.json()));
  }
  dex[key] = parseDex(JSON.parse(fs.readFileSync(cache, 'utf8')).parse.wikitext);
  console.log(`  ${key}: ${dex[key].length} rows`);
}
fs.writeFileSync(`${R}/dex.json`, JSON.stringify(dex, null, 1));

/* ------------------------------------------------------------------ */
/* 3. PokéAPI — Japanese names, genus, colour                          */
/* ------------------------------------------------------------------ */
console.log('fetching PokéAPI species…');
const ids = [...new Set(Object.values(dex).flat().map(x => x.natdex))].sort((a, b) => a - b);
const species = fs.existsSync(`${R}/species.json`) ? JSON.parse(fs.readFileSync(`${R}/species.json`, 'utf8')) : {};
for (let i = 0; i < ids.length; i += 12) {
  const batch = ids.slice(i, i + 12).filter(id => !species[id]);
  await Promise.all(batch.map(async id => {
    try {
      const j = await (await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)).json();
      const pick = l => (j.names.find(n => n.language.name === l) || {}).name || null;
      species[id] = {
        en: pick('en'), ja: pick('ja-Hrkt') || pick('ja'), romaji: pick('roomaji'),
        genus: (j.genera.find(g => g.language.name === 'en') || {}).genus || null,
        color: j.color && j.color.name, gen: j.generation && j.generation.name,
      };
    } catch (e) { console.error('  !', id, String(e)); }
  }));
}
fs.writeFileSync(`${R}/species.json`, JSON.stringify(species, null, 1));
console.log(`  ${Object.keys(species).length} species`);

/* ------------------------------------------------------------------ */
/* 4. Dexerto habitat dex — build requirements + resident Pokémon      */
/* ------------------------------------------------------------------ */
console.log('fetching habitat dex…');
await get('https://www.dexerto.com/wikis/pokopia/habitat-dex/', `${R}/dex_hab.html`);
const { default: parseHab } = await import('./habitatdex.mjs');
parseHab(`${R}/dex_hab.html`, `${R}/habitat_dex.json`);

console.log('\ndone — now run `npm run data` to rebuild data/*.json');
