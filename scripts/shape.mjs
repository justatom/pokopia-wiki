// Turns the scraped raw.json + dex.json + species.json into canonical data/*.json
import fs from 'node:fs';
function j(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
const R = j('_research/raw.json'), DEX = j('_research/dex.json'), SP = j('_research/species.json');
const W = (n, v) => { fs.writeFileSync(`data/${n}.json`, JSON.stringify(v, null, 1)); console.log(String(Array.isArray(v) ? v.length : Object.keys(v).length).padStart(5), n); };
const slug = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const sec = (p, a = null) => (R[p].secs.find(s => s.anchor === a) || R[p].secs[0]);
const secs = p => R[p].secs;
const cell = c => (c?.t || []).join('\n');
const list = c => (c?.t || []).filter(Boolean);
const SKIP = ['picture', 'no.', 'name', 'emote', 'challenge number', 'favorites', 'example picture', 'doll', 'anchors', 'stamp'];
const table = (rows, n) => rows.filter(r => r.length === n).filter(r => !SKIP.includes(cell(r[0]).toLowerCase()));

/* ---------- specialties ---------- */
const specialties = table(sec('specialty').rows, 3).map(r => ({
  id: slug(cell(r[1])), name: cell(r[1]), desc: cell(r[2])
})).filter(s => s.desc && s.name.length < 30);
W('specialties', specialties);
const specByName = new Map(specialties.map(s => [s.name.toLowerCase(), s.id]));

/* ---------- pokemon ---------- */
// Serebii runs specialty names together in one cell ("GrowLitter"), so split on known names.
const SPEC_RE = new RegExp(specialties.map(s => s.name).sort((a, b) => b.length - a.length)
  .map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
const readSpecs = cells => {
  const sps = [];
  for (const c of cells) for (const t of list(c)) for (const m of (t.match(SPEC_RE) || [])) {
    const id = specByName.get(m.toLowerCase()); if (id && !sps.includes(id)) sps.push(id);
  }
  return sps;
};
// no -> [{name, specs}] (a number can hold both a unique character and its ordinary species)
function specTable(page) {
  const m = new Map();
  for (const s of R[page].secs) for (const r of s.rows) {
    const no = cell(r[0]).match(/^#(\d+)$/); if (!no || r.length < 4) continue;
    const arr = m.get(+no[1]) || []; arr.push({ name: cell(r[2]), specs: readSpecs(r.slice(3)) });
    m.set(+no[1], arr);
  }
  return m;
}
const spMain = specTable('availablepokemon'), spEvent = specTable('eventpokedex'), spBasin = specTable('basinpokedex');
// pick the Serebii row matching a dex entry: special forms take the row whose name isn't the species name
function pickRow(rows, species, form) {
  if (!rows || !rows.length) return null;
  if (form) return rows.find(r => r.name.toLowerCase() !== species.toLowerCase()) || rows[0];
  return rows.find(r => r.name.toLowerCase() === species.toLowerCase()) || rows[0];
}

// The seven unique story Pokémon: species+form -> the name the game gives them
const UNIQUE = {
  'Tangrowth|Professor': 'Professor Tangrowth',
  'Pikachu|Pale': 'Peakychu',
  'Snorlax|Mossy': 'Mosslax',
  'Smeargle|Decorator': 'Smearguru',
  'Rotom|Stereo Rotom': 'DJ Rotom',
  'Greedent|Cook': 'Chef Dente',
  'Tinkaton|Supervisor': 'Tinkmaster',
};

const litter = new Map();
for (const s of R.litter.secs) for (const r of s.rows) {
  const no = cell(r[0]).match(/^#(\d+)$/); if (!no || r.length < 5) continue;
  litter.set(cell(r[2]).toLowerCase(), list(r[4]));
}

const pokedexes = [['main', DEX.main, spMain], ['basin', DEX.basin, spBasin], ['event', DEX.event, spEvent]];
const pokemon = [];
for (const [dex, rows, spmap] of pokedexes) {
  for (const p of rows) {
    const s = SP[p.natdex] || {};
    const row = pickRow(spmap.get(p.no), p.name, p.form);
    const local = UNIQUE[`${p.name}|${p.form}`] || null;
    const serebiiName = row ? row.name : p.name;
    pokemon.push({
      dex, no: p.no, natdex: p.natdex,
      id: `${dex === 'main' ? '' : dex + '-'}${String(p.no).padStart(3, '0')}-${slug(p.name)}${p.form ? '-' + slug(p.form) : ''}`,
      name: p.name, form: p.form, alias: local, types: p.types,
      ja: s.ja || null, genus: s.genus || null, color: s.color || null, gen: s.gen || null,
      specialties: row ? row.specs : [],
      litter: litter.get(serebiiName.toLowerCase()) || litter.get(p.name.toLowerCase()) || [],
    });
  }
}
W('pokemon', pokemon);

/* ---------- moves ---------- */
const moves = [];
{
  let group = 'Primary';
  for (const r of sec('abilities').rows) {
    if (r.length === 1) { const t = cell(r[0]); if (/^(Primary|Secondary) Moves$/.test(t)) group = t.split(' ')[0]; continue; }
    if (r.length !== 4) continue;
    const name = cell(r[1]); if (!name || name === 'Move') continue;
    moves.push({ id: slug(name), name, group, effect: cell(r[2]), unlock: cell(r[3]) });
  }
}
W('moves', moves);
W('moveboosts', [
  { meal: 'Salad', move: 'Leafage', effect: 'Hold to spread more grass; can grow Moss on rock and Duckweed on water' },
  { meal: 'Bread', move: 'Cut', effect: 'Hold to widen the cut; can cut through tougher objects' },
  { meal: 'Steak', move: 'Rock Smash', effect: 'Breaks rock faster; can break tougher rock' },
  { meal: 'Soup', move: 'Water Gun', effect: 'Hold to release more water' },
  { meal: 'Smoothie', move: 'Surf / Dive', effect: 'Move as a boosted Lapras — much faster in water, and Rock Smash works while diving' },
]);

/* ---------- habitats ---------- */
const habitats = [];
for (const a of ['main', 'basin', 'event']) {
  for (const r of table(sec('habitats', a).rows, 4)) {
    const no = cell(r[0]).match(/#(\d+)/); if (!no) continue;
    habitats.push({ dex: a, no: +no[1], id: `${a === 'main' ? '' : a + '-'}${String(+no[1]).padStart(3, '0')}-${slug(cell(r[2]))}`, name: cell(r[2]), desc: cell(r[3]), req: [], mons: [] });
  }
}

/* build requirements + which Pokémon each habitat releases (Dexerto habitat dex) */
const HABDEX = j('_research/habitat_dex.json');
const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const monIndex = new Map();
for (const p of pokemon) {
  for (const key of [p.alias, p.name].filter(Boolean)) {
    if (!monIndex.has(norm(key))) monIndex.set(norm(key), p);
  }
}
/* Dexerto spells a handful of names differently from Bulbapedia */
const MON_ALIAS = {
  ninetails: 'Ninetales', murkow: 'Murkrow', chefdentegreedent: 'Chef Dente',
  stereorotom: 'DJ Rotom', professortangrowth: 'Professor Tangrowth',
};
/* Dexerto marks forms in parentheses; map those onto the dex's form names */
const FORM_HINT = { male: 'male', female: 'female', west: 'west sea', east: 'east sea' };
function findMon(raw, habName = '') {
  const q = raw.match(/\(([^)]+)\)\s*$/);
  const hint = q ? FORM_HINT[q[1].trim().toLowerCase()] : null;
  let s = raw.replace(/\([^)]*\)\s*$/, '').trim();
  if (hint) {
    const exact = pokemon.find(p => norm(p.name) === norm(s) && p.form && norm(p.form) === norm(hint));
    if (exact) return exact;
  }
  // some habitats are form-specific even though the cell just says the species
  const byHabitat = pokemon.find(p =>
    norm(p.name) === norm(s) && p.form && habName &&
    norm(habName).includes(norm(p.form.replace(/ form$/i, ''))));
  if (byHabitat) return byHabitat;
  const n = norm(s);
  const alias = MON_ALIAS[n];
  if (alias && monIndex.has(norm(alias))) return monIndex.get(norm(alias));
  if (monIndex.has(n)) return monIndex.get(n);
  // Dexerto occasionally omits a letter — accept a single-character difference
  for (const [k, v] of monIndex) {
    if (Math.abs(k.length - n.length) <= 1 && k.length > 5) {
      let i = 0, jj = 0, diff = 0;
      while (i < k.length && jj < n.length) {
        if (k[i] === n[jj]) { i++; jj++; }
        else { diff++; if (diff > 1) break; k.length > n.length ? i++ : (k.length < n.length ? jj++ : (i++, jj++)); }
      }
      if (diff + (k.length - i) + (n.length - jj) <= 1) return v;
    }
  }
  return null;
}
const habByKey = new Map(habitats.map(h => [`${h.dex}|${h.no}`, h]));
const unmatched = new Set();
for (const row of HABDEX) {
  const h = habByKey.get(`${row.dex}|${row.no}`);
  if (!h) continue;
  h.req = row.req;
  // one cell sometimes runs two forms together, e.g. "Shellos (west)Shellos (east)"
  const names = row.mons.flatMap(x => x.split(/(?<=\))(?=[A-Z])/));
  for (const raw of names) {
    const p = findMon(raw, row.name);
    if (p) { if (!h.mons.includes(p.id)) h.mons.push(p.id); }
    else unmatched.add(raw);
  }
}
if (unmatched.size) console.log('   ! unmatched habitat Pokémon:', [...unmatched].join(', '));
W('habitats', habitats);

/* reverse index: which habitats release each Pokémon */
{
  const byMon = new Map();
  for (const h of habitats) for (const id of h.mons) {
    if (!byMon.has(id)) byMon.set(id, []);
    byMon.get(id).push(h.id);
  }
  for (const p of pokemon) p.habitats = byMon.get(p.id) || [];
  const withHab = pokemon.filter(p => p.habitats.length).length;
  console.log(`   ${withHab}/${pokemon.length} Pokémon linked to a habitat`);
  W('pokemon', pokemon);
}

/* ---------- items ---------- */
const ITEM_CATS = { materials: 'Materials', food: 'Food', furniture: 'Furniture', 'misc.': 'Misc', outdoor: 'Outdoor', utilities: 'Utilities', nature: 'Nature', buildings: 'Buildings', blocks: 'Blocks', kits: 'Kits', keyitems: 'Key Items', other: 'Other', 'lostrelics(l)': 'Lost Relic (Large)', 'lostrelics(s)': 'Lost Relic (Small)', fossils: 'Fossils' };
const items = []; const itemSeen = new Set();
for (const s of secs('items')) {
  const cat = ITEM_CATS[s.anchor]; if (!cat) continue;
  for (const r of table(s.rows, 5)) {
    const name = cell(r[1]); if (!name) continue;
    const id = slug(name); if (itemSeen.has(id)) continue; itemSeen.add(id);
    items.push({ id, name, cat, desc: cell(r[2]), tags: list(r[3]), sources: list(r[4]) });
  }
}
W('items', items);

/* ---------- recipes ---------- */
const RCATS = { furniture: 'Furniture', 'misc.': 'Misc', outdoor: 'Outdoor', utilities: 'Utilities', buildings: 'Buildings', blocks: 'Blocks', other: 'Other' };
const recipes = [];
for (const s of secs('crafting')) {
  const cat = RCATS[s.anchor]; if (!cat) continue;
  for (const r of table(s.rows, 4)) {
    const name = cell(r[1]); if (!name || name === 'Name') continue;
    const mats = list(r[3]).map(t => {
      const m = t.match(/^(.*?)\s*\*\s*(\d+)$/);
      return m ? { item: slug(m[1]), name: m[1], qty: +m[2] } : { item: slug(t), name: t, qty: 1 };
    });
    recipes.push({ id: slug(name), name, cat, sources: list(r[2]), materials: mats });
  }
}
W('recipes', recipes);

/* ---------- furniture ---------- */
W('furniture', table(sec('furniture').rows, 6).map(r => ({
  id: slug(cell(r[1])), name: cell(r[1]), desc: cell(r[2]), sources: list(r[3]), flags: list(r[4]), colour: list(r[5])
})).filter(x => x.name));

/* ---------- build kits ---------- */
W('buildkits', table(sec('building').rows, 3).map(r => ({ id: slug(cell(r[1])), name: cell(r[1]), desc: cell(r[2]) })).filter(x => x.name && x.name !== 'Name'));

/* ---------- simple tables ---------- */
W('cds', table(sec('cds').rows, 5).map(r => ({ name: cell(r[1]), desc: cell(r[2]), sources: list(r[3]), game: cell(r[4]) })).filter(x => x.name && x.name !== 'Name'));
W('emotes', table(sec('emotes').rows, 2).map(r => ({ name: cell(r[0]), source: cell(r[1]) })).filter(x => x.name && x.name !== 'Emote'));
W('stampcard', table(sec('stampcard').rows, 3).map(r => ({ name: cell(r[1]), coins: cell(r[2]) })).filter(x => x.name && x.name !== 'Stamp'));
W('teamchallenge', table(sec('teaminitiationchallenge').rows, 4).map(r => ({ no: cell(r[0]), requirements: list(r[1]), notes: cell(r[2]), reward: cell(r[3]) })).filter(x => /^\d+$/.test(x.no)));
W('events', table(sec('events').rows, 3).map(r => ({ name: cell(r[1]), duration: cell(r[2]) })).filter(x => x.name && x.name !== 'Name'));
W('water', table(sec('water').rows, 4).map(r => ({ name: cell(r[1]), desc: cell(r[2]), item: cell(r[3]) })).filter(x => x.name && x.name !== 'Name'));
const cooking = [];
{
  let type = '';
  for (const r of sec('cooking').rows) {
    if (r.length !== 7 && r.length !== 8) continue;
    const c = r.length === 8 ? r.slice(1) : r;
    if (r.length === 8 && cell(r[0])) type = cell(r[0]);
    const name = cell(c[0]); if (!name || SKIP.includes(name.toLowerCase())) continue;
    cooking.push({
      type, name, desc: cell(c[1]), pp: cell(c[2]), main: cell(c[3]),
      secondary: [...list(c[4]), ...list(c[5])], spec: cell(c[6])
    });
  }
}
W('cooking', cooking);

const relics = [];
for (const [a, kind] of [['large', 'Large'], ['larges', 'Large (Sunken)'], ['small', 'Small']])
  for (const r of table(sec('lostrelics', a).rows, 3)) if (cell(r[1])) relics.push({ kind, name: cell(r[1]), desc: cell(r[2]) });
W('lostrelics', relics);

const flavors = [];
for (const a of ['general', 'bitter', 'dry', 'sour', 'spicy', 'sweet'])
  for (const r of table(sec('flavors', a).rows, 3)) if (cell(r[1])) flavors.push({ flavor: a === 'general' ? 'none' : a, name: cell(r[1]), desc: cell(r[2]) });
W('flavors', flavors);

W('humanrecords', table(sec('humanrecords', 'image').rows, 5).map(r => ({ name: cell(r[1]), desc: cell(r[2]), location: cell(r[3]), reward: cell(r[4]) })).filter(x => x.name && x.name !== 'Name'));
W('highlightreel', table(sec('highlightreel').rows, 5).map(r => ({ name: cell(r[0]), pokemon: cell(r[1]), items: list(r[2]), time: cell(r[3]), reward: cell(r[4]) })).filter(x => x.name && x.name !== 'Name'));
W('dreamislands', table(sec('dreamislands').rows, 4).map(r => ({ doll: cell(r[0]), finds: [cell(r[1]), cell(r[2]), cell(r[3])].filter(Boolean) })).filter(x => x.doll && x.doll !== 'Doll'));
W('cloudislands', table(sec('cloudislands').rows, 3).map(r => ({ desc: cell(r[1]), code: cell(r[2]) })).filter(x => /^[A-Z0-9]{4} [A-Z0-9]{4}$/.test(x.code)));
W('litter', [...litter].map(([name, items]) => ({ name, items })));

const envAreas = { witheredwastelands: 'Withered Wastelands', bleakbeach: 'Bleak Beach', rockyridges: 'Rocky Ridges', sparklingskylands: 'Sparkling Skylands', palettetown: 'Palette Town', cloudisland: 'Cloud Island', bubblybasin: 'Bubbly Basin' };
const envlevel = [];
for (const s of secs('environmentlevel')) {
  const area = envAreas[s.anchor]; if (!area) continue;
  for (const r of table(s.rows, 3)) { const lv = cell(r[2]).match(/Lv\.\s*(\d+)/); if (!lv) continue; envlevel.push({ area, item: cell(r[1]), level: +lv[1] }); }
}
W('envlevel', envlevel);

/* ---------- version history ---------- */
const patches = [];
{
  const rws = sec('patch').rows;
  for (let i = 0; i < rws.length; i++) {
    const m = cell(rws[i][0]).match(/^Version ([\d.]+)$/);
    if (m && rws[i + 1]) {
      const body = cell(rws[i + 1][0]).split('\n');
      patches.push({ version: m[1], date: (body[1] || '').trim(), lines: body.slice(2).filter(Boolean) });
    }
  }
}
W('patches', patches);

/* ---------- raw prose blocks, kept as EN source for hand-written pages ---------- */
const prose = {};
for (const [k, v] of Object.entries(R)) {
  const blocks = [];
  for (const s of v.secs) for (const r of s.rows) if (r.length <= 2) { const t = cell(r[0]); if (t.length > 2) blocks.push(t); }
  prose[k] = blocks;
}
fs.writeFileSync('data/_prose.json', JSON.stringify(prose, null, 1));
console.log('   ok _prose');
