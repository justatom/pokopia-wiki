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

/* ---------- item pictures ----------
   Serebii reuses one icon per item on every page it appears on, so index the whole
   scrape once: a picture cell (image, no text of its own) is always followed by the
   cell naming what it shows. Gives 100% coverage of items, furniture and recipes. */
const ICONS = new Map();
for (const page of Object.keys(R)) {
  for (const s of (R[page].secs || [])) for (const r of (s.rows || [])) {
    for (let i = 0; i < r.length - 1; i++) {
      if ((r[i].t || []).length) continue;
      const src = (r[i].i || []).find(x => /(^|\/)items\/[^/]+\.png$/.test(x));
      const nm = list(r[i + 1]);
      if (!src || nm.length !== 1) continue;
      const name = nm[0];
      const id = slug(name); if (!id || ICONS.has(id)) continue;
      ICONS.set(id, src.replace(/^.*items\//, ''));
    }
  }
}
const icon = name => ICONS.get(slug(name)) || null;
console.log(String(ICONS.size).padStart(5), 'item icons indexed');

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

/* ideal habitat, five favourite categories and a flavour, from Bulbapedia. Keyed by
   Pokopia dex number + national number + form, because Shellos, Tatsugiri and the unique
   story Pokémon each share a dex number with their base form. */
const LIKES = fs.existsSync('_research/likes.json') ? j('_research/likes.json') : {};
/* time of day and weather, keyed by our own Pokémon id (see scripts/labtimes.mjs) */
const LABTIMES = fs.existsSync('_research/labtimes.json') ? j('_research/labtimes.json') : {};
/* the dex writes DJ Rotom's form as "Stereo Rotom" where Bulbapedia labels it "Stereo" */
const likesOf = p => {
  const form = String(p.form || '');
  const short = form.endsWith(` ${p.name}`) ? form.slice(0, -(p.name.length + 1)) : form;
  return LIKES[`${p.no}|${p.natdex}|${form}`] || LIKES[`${p.no}|${p.natdex}|${short}`] || {};
};

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
      ...(({ ambience = null, favorites = [], flavor = null }) => ({ ambience, favorites, flavor }))(likesOf(p)),
      ...(({ times = null, weather = null }) => ({ times, weather }))(
        LABTIMES[`${dex === 'main' ? '' : dex + '-'}${String(p.no).padStart(3, '0')}-${slug(p.name)}${p.form ? '-' + slug(p.form) : ''}`] || {}),
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
    moves.push({
      id: slug(name), name, group, effect: cell(r[2]), unlock: cell(r[3]),
      img: ((r[0].i || [])[0] || '').replace(/^.*\//, '') || null,
    });
  }
}
W('moves', moves);
/* Eating a meal powers up one move for a while, on its own PP meter. Serebii's table is
   flattened into a single cell by the scraper, so read it back as "meal, move, then one or
   two effect lines" — the meal names are the only fixed markers in it. */
{
  const MEALS = ['Salad', 'Bread', 'Steak', 'Soup', 'Smoothie'];
  const flat = sec('abilities').rows.map(r => list(r[0]))
    .find(t => t.includes('Meal') && MEALS.every(m => t.includes(m))) || [];
  const boosts = [];
  for (let i = 0; i < flat.length; i++) {
    if (!MEALS.includes(flat[i]) || !flat[i + 1]) continue;
    const effects = [];
    for (let k = i + 2; k < flat.length && !MEALS.includes(flat[k]); k++) effects.push(flat[k]);
    boosts.push({ meal: flat[i], move: flat[i + 1], effects });
  }
  if (boosts.length !== MEALS.length) console.log(`   ! expected ${MEALS.length} move boosts, found ${boosts.length}`);
  W('moveboosts', boosts);
}

/* ---------- habitats ---------- */
const habitats = [];
for (const a of ['main', 'basin', 'event']) {
  for (const r of table(sec('habitats', a).rows, 4)) {
    const no = cell(r[0]).match(/#(\d+)/); if (!no) continue;
    const pic = (r[1].i || [])[0] || '';
    habitats.push({ dex: a, no: +no[1], id: `${a === 'main' ? '' : a + '-'}${String(+no[1]).padStart(3, '0')}-${slug(cell(r[2]))}`, name: cell(r[2]), desc: cell(r[3]), img: pic.replace(/^.*\//, '') || null, req: [], mons: [] });
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
    items.push({ id, name, cat, desc: cell(r[2]), img: icon(name), tags: list(r[3]), sources: list(r[4]) });
  }
}

/* ---------- painting ----------
   Serebii lists which items take paint and which take a pattern; Bulbapedia additionally
   records how many sections of an item can be coloured separately. Serebii's pattern
   table is a dataset of its own: 116 patterns with where each is found and its cost. */
{
  const paint = new Map(), pattern = new Set();
  for (const r of sec('paint').rows) {
    if (r.length !== 5) continue;
    const name = cell(r[1]); if (!name || name === 'Name') continue;
    paint.set(slug(name), /yes/i.test(cell(r[3])));
    if (/yes/i.test(cell(r[4]))) pattern.add(slug(name));
  }
  const patterns = [];
  for (const r of sec('paint').rows) {
    if (r.length !== 3) continue;
    const where = cell(r[1]); if (!where || where === 'Location') continue;
    patterns.push({
      img: ((r[0].i || [])[0] || '').replace(/^.*\//, '') || null,
      source: where,
      cost: list(r[2]),
    });
  }
  W('patterns', patterns);

  /* ---------- Bulbapedia item facts ----------
     Paint slot counts, and the flags saying an item needs the Expansion Pass, came from an
     event, or arrived in a later version — none of which Serebii publishes. */
  let extra = new Map();
  if (fs.existsSync('_research/bulba_items.json')) {
    const { default: parseItems } = await import('./bulbaitems.mjs');
    const rows = parseItems(j('_research/bulba_items.json').parse.wikitext);
    extra = new Map(rows.map(x => [slug(x.name), x]));

    /* Bulbapedia carries items Serebii's list omits — mostly flower seeds broken out per
       colour. Add them so the item list is the union of both. */
    let added = 0;
    /* Bulbapedia leaves the pocket blank for a dozen plant growth stages and terrain
       pieces. Serebii files the identical kind of object — "Potato sprout (Grow)",
       "Dry potato plant" — under Nature, so these follow our own categorisation. */
    for (const x of rows) {
      const id = slug(x.name);
      if (itemSeen.has(id)) continue;
      const cat = x.cat || 'Nature';
      itemSeen.add(id); added++;
      items.push({
        id, name: x.name, cat, desc: x.desc, img: icon(x.name),
        tags: x.classification ? [x.classification] : [], sources: [],
      });
    }
    if (added) console.log(`   ${added} items added from Bulbapedia`);
  }

  for (const i of items) {
    const b = extra.get(i.id);
    i.paint = paint.has(i.id) ? paint.get(i.id) : (b ? b.paintable : false);
    i.paintSlots = b && b.paint ? b.paint : null;
    i.pattern = pattern.has(i.id) || Boolean(b && b.pattern);
    i.dlc = Boolean(b && b.dlc);
    i.event = Boolean(b && b.event);
    i.addedIn = (b && b.addedIn) || null;
    i.craftable = Boolean(b && b.craftable);
    if (!i.tags.length && b && b.classification) i.tags = [b.classification];
    // the Bulbapedia sprite name, so a missing Serebii icon can fall back to the Archives
    i.bulbaFile = b ? b.file : null;
  }
  const n = k => items.filter(x => x[k]).length;
  console.log(`   paint ${n('paint')} · pattern ${n('pattern')} · DLC ${n('dlc')} · event ${n('event')} · craftable ${n('craftable')}`);
}
W('items', items);

/* ---------- recipes ---------- */
/* Serebii misspells three material names, which otherwise point at items that do not
   exist. "Pok&eacute" (in Decorative Poké Ball) is mangled upstream too, but there is no
   safe reading of it, so it is left alone rather than guessed at. */
const MAT_FIX = { 'Linestone': 'Limestone', 'Iron ignot': 'Iron ingot', 'Stones': 'Stone' };
const RCATS = { furniture: 'Furniture', 'misc.': 'Misc', outdoor: 'Outdoor', utilities: 'Utilities', buildings: 'Buildings', blocks: 'Blocks', other: 'Other' };
const recipes = [];
for (const s of secs('crafting')) {
  const cat = RCATS[s.anchor]; if (!cat) continue;
  for (const r of table(s.rows, 4)) {
    const name = cell(r[1]); if (!name || name === 'Name') continue;
    const mats = list(r[3]).map(t => {
      const m = t.match(/^(.*?)\s*\*\s*(\d+)$/);
      const nm = MAT_FIX[(m ? m[1] : t).trim()] || (m ? m[1] : t);
      return { item: slug(nm), name: nm, qty: m ? +m[2] : 1 };
    });
    recipes.push({ id: slug(name), name, cat, img: icon(name), sources: list(r[2]), materials: mats.map(m => ({ ...m, img: icon(m.name) })) });
  }
}
W('recipes', recipes);

/* ---------- furniture ---------- */
W('furniture', table(sec('furniture').rows, 6).map(r => ({
  id: slug(cell(r[1])), name: cell(r[1]), desc: cell(r[2]), img: icon(cell(r[1])), sources: list(r[3]), flags: list(r[4]), colour: list(r[5])
})).filter(x => x.name));

/* ---------- build kits ---------- */
/* Serebii names and describes the kits; Bulbapedia's Building page is where the build
   requirements live, so the two are merged on the kit name. Bulbapedia writes the story
   kit as "Ocean temple" where Serebii has "Ocean temple kit", hence the loose match. */
{
  const kits = table(sec('building').rows, 3)
    .map(r => ({ id: slug(cell(r[1])), name: cell(r[1]), desc: cell(r[2]), img: icon(cell(r[1])) }))
    .filter(x => x.name && x.name !== 'Name');
  let reqs = [];
  if (fs.existsSync('_research/bulba_building.json')) {
    const { default: parseKits } = await import('./buildkits.mjs');
    reqs = parseKits(j('_research/bulba_building.json').parse.wikitext);
  }
  const key = s => slug(s).replace(/-?kit$/, '');
  const byName = new Map(reqs.map(r => [key(r.name), r]));
  for (const k of kits) {
    const r = byName.get(key(k.name));
    k.build = r && r.file ? r.file.trim().replace(/ /g, '_') : null;
    k.materials = r ? r.materials : [];
    k.helpers = r ? r.helpers : [];
    k.time = r ? r.time : [];
    k.group = r ? r.section : null;
  }
  const withReq = kits.filter(k => k.materials.length).length;
  console.log(`   ${withReq}/${kits.length} kits with build requirements`);
  W('buildkits', kits);
}

/* ---------- simple tables ---------- */
W('cds', table(sec('cds').rows, 5).map(r => ({ name: cell(r[1]), desc: cell(r[2]), img: icon(cell(r[1])), sources: list(r[3]), game: cell(r[4]) })).filter(x => x.name && x.name !== 'Name'));
const emotes = table(sec('emotes').rows, 2).map(r => ({ name: cell(r[0]), source: cell(r[1]) })).filter(x => x.name && x.name !== 'Emote');
W('emotes', emotes);
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
      type, name, desc: cell(c[1]), img: icon(name), pp: cell(c[2]), main: cell(c[3]),
      secondary: [...list(c[4]), ...list(c[5])], spec: cell(c[6])
    });
  }
}
W('cooking', cooking);

const relics = [];
for (const [a, kind] of [['large', 'Large'], ['larges', 'Large (Sunken)'], ['small', 'Small']])
  for (const r of table(sec('lostrelics', a).rows, 3)) if (cell(r[1])) relics.push({ kind, name: cell(r[1]), desc: cell(r[2]), img: icon(cell(r[1])) });
W('lostrelics', relics);

const flavors = [];
for (const a of ['general', 'bitter', 'dry', 'sour', 'spicy', 'sweet'])
  for (const r of table(sec('flavors', a).rows, 3)) if (cell(r[1])) flavors.push({ flavor: a === 'general' ? 'none' : a, name: cell(r[1]), desc: cell(r[2]) });
W('flavors', flavors);

W('humanrecords', table(sec('humanrecords', 'image').rows, 5).map(r => ({ name: cell(r[1]), desc: cell(r[2]), location: cell(r[3]), reward: cell(r[4]) })).filter(x => x.name && x.name !== 'Name'));
W('highlightreel', table(sec('highlightreel').rows, 5).map(r => ({ name: cell(r[0]), pokemon: cell(r[1]), items: list(r[2]), time: cell(r[3]), reward: cell(r[4]) })).filter(x => x.name && x.name !== 'Name'));
/* ---------- dream islands ----------
   The doll you set down decides what the island is stocked with. Serebii's own table gives
   three "focus" materials per doll; the far longer per-island lists come from the item
   sources, which tag every item with the island it spawns on — Natural for things that
   grow there, Original for the furniture and relics unique to it.
   The Legendary each doll biases towards is from Serebii's Legendary page; it is a bias,
   not a guarantee, and the Clefairy doll has none. */
const DOLL_LEGENDARY = {
  'Pikachu Doll': 'Raikou', 'Eevee Doll': 'Suicune', 'Arcanine Doll': 'Entei',
  'Dragonite Doll': 'Mewtwo', 'Starmie Doll': 'Phione',
};
W('dreamislands', table(sec('dreamislands').rows, 4)
  .map(r => ({ doll: cell(r[0]), finds: [cell(r[1]), cell(r[2]), cell(r[3])].filter(Boolean) }))
  .filter(x => x.doll && x.doll !== 'Doll')
  .map(x => {
    const on = kind => items.filter(i => i.sources.includes(`${x.doll} Dream Island (${kind})`))
      .map(i => ({ id: i.id, name: i.name, img: i.img }));
    return {
      ...x,
      id: slug(x.doll),
      img: icon(x.doll),
      random: x.finds[0] === 'Random',
      legendary: DOLL_LEGENDARY[x.doll] || null,
      focus: x.finds.filter(f => f !== 'Random').map(f => ({ name: f, img: icon(f) })),
      natural: on('Natural'),
      original: on('Original'),
    };
  }));
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

/* ---------- gifts ----------
   The inverse of the Favourites system: what a Pokémon hands *you*. Three channels are
   documented per-species, so only those are indexed here.

     litter    Pokémon with the Litter specialty drop a fixed material near their home,
               over and over, for as long as they live there.
     emote     Fifteen species hand over one specific emote as a friendship gift. One-off.
     item      A named story character gives a fixed item.

   Serebii also notes that any Pokémon starts handing over random materials as friendship
   climbs, but publishes no drop table and no rate — so nothing here invents one, and the
   guide text says as much rather than guessing a number. */
const monByName = new Map();
for (const p of pokemon) {
  if (p.alias) monByName.set(p.alias.toLowerCase(), p);
  if (!monByName.has(p.name.toLowerCase())) monByName.set(p.name.toLowerCase(), p);
}
const gifts = [];
const pushGift = (name, g) => {
  const p = monByName.get(String(name).toLowerCase());
  gifts.push({ mon: p ? p.id : null, natdex: p ? p.natdex : null, name: p ? (p.alias || p.name) : name, ...g });
};
for (const p of pokemon) if (p.litter.length) {
  pushGift(p.name, { kind: 'litter', gives: p.litter, trigger: 'specialty', rate: 'repeat' });
}
for (const e of emotes) {
  const m = e.source.match(/^Gift (?:from|by) (.+)$/i); if (!m) continue;
  pushGift(m[1], { kind: 'emote', gives: [e.name], trigger: 'friendship', rate: 'once' });
}
{
  const byGiver = new Map();
  for (const i of items) for (const s of i.sources) {
    const m = s.match(/^Gift from (.+)$/i); if (!m) continue;
    const arr = byGiver.get(m[1]) || []; arr.push(i.name); byGiver.set(m[1], arr);
  }
  for (const [who, got] of byGiver) pushGift(who, { kind: 'item', gives: got, trigger: 'story', rate: 'once' });
}
gifts.sort((a, b) => (a.natdex || 9999) - (b.natdex || 9999) || a.name.localeCompare(b.name));
W('gifts', gifts);

/* the emote gift is worth showing on the Pokémon's own page too */
{
  const emoteGift = new Map(gifts.filter(g => g.kind === 'emote' && g.mon).map(g => [g.mon, g.gives[0]]));
  for (const p of pokemon) p.gift = emoteGift.get(p.id) || null;
  W('pokemon', pokemon);
}

/* ---------- favourite categories ----------
   One Serebii subpage per category, each listing the items in it and the Pokémon that
   like it. Serebii flags the item halves as work in progress, so `partial` is recorded
   and the site says the counts are a floor rather than a total. */
{
  const favorites = [];
  for (const page of Object.keys(R).filter(k => k.startsWith('fav_'))) {
    const name = (R[page].heads || [])[0];
    if (!name) continue;
    const secItems = R[page].secs.find(s => s.rows.some(r => r.length === 4 && cell(r[0]) === 'Picture'));
    const secMons = R[page].secs.find(s => s.rows.some(r => r.length === 5 && cell(r[0]) === 'No.'));
    const its = [];
    for (const r of (secItems ? secItems.rows : [])) {
      if (r.length !== 4) continue;
      const nm = cell(r[1]); if (!nm || nm === 'Name') continue;
      its.push({ id: slug(nm), name: nm, img: ((r[0].i || [])[0] || '').replace(/^.*items\//, '') || icon(nm) });
    }
    const mons = [];
    for (const r of (secMons ? secMons.rows : [])) {
      if (r.length !== 5) continue;
      const nm = cell(r[2]); if (!nm || nm === 'Name') continue;
      mons.push(nm);
    }
    favorites.push({
      id: slug(name), name,
      partial: (R[page].secs[0].text || []).some(t => /work in progress/i.test(t)),
      items: its, mons,
    });
  }
  favorites.sort((a, b) => a.name.localeCompare(b.name));
  W('favorites', favorites);
  console.log(`   ${favorites.reduce((n, f) => n + f.items.length, 0)} item↔category links`);
}

/* ---------- cookware ----------
   Which kitchen equipment each kind of meal needs, and whether it has to sit on a heat
   source. Both facts are written on the items themselves ("Kitchen equipment for making
   soup. Put this on a stove or campfire"), so they are read off rather than hand-listed. */
{
  const FOR = [
    [/making salads?/i, 'Salad'],
    [/making soup/i, 'Soup'],
    [/baking bread/i, 'Bread'],
    [/making hamburger steak/i, 'Steak'],
    [/making smoothies?/i, 'Smoothie'],
  ];
  const byType = new Map();
  for (const i of items) {
    if (!/(kitchen|cooking) equipment/i.test(i.desc)) continue;
    const hit = FOR.find(([re]) => re.test(i.desc)); if (!hit) continue;
    const heat = /stove or campfire/i.test(i.desc) ? 'stove'
      : /light the fire/i.test(i.desc) ? 'lit' : null;
    const arr = byType.get(hit[1]) || []; arr.push({ id: i.id, name: i.name, img: i.img, desc: i.desc, heat });
    byType.set(hit[1], arr);
  }
  const HEAT = ['Cooking stove', 'Campfire', 'Bonfire'];
  W('cookware', {
    types: [...byType].map(([type, tools]) => ({ type, tools, heat: tools.some(t => t.heat) })),
    heatSources: HEAT.map(n => items.find(i => i.name === n)).filter(Boolean)
      .map(i => ({ id: i.id, name: i.name, img: i.img, desc: i.desc })),
  });
}

/* ---------- outfits ----------
   Ditto's wardrobe. Serebii lays it out as seven tables — Outfit, Hair, Tops, Pants, Hat,
   Bags, Shoes — each with a picture, a name and where the magazine that teaches it is
   found. The heading sits in the section before its table, except "Hat": the scraper drops
   text shorter than four characters, so that one falls back to its place in the order. */
{
  const ORDER = ['Outfit', 'Hair', 'Tops', 'Pants', 'Hat', 'Bags', 'Shoes'];
  const outfits = [];
  const secsC = R.customisation.secs;
  let n = 0;
  for (let i = 0; i < secsC.length; i++) {
    const rows = secsC[i].rows || [];
    if (!rows.some(r => r.length === 4 && cell(r[0]) === 'Picture')) continue;
    const heading = ((secsC[i - 1] || {}).text || []).slice(-1)[0];
    const cat = ORDER.includes(heading) ? heading : ORDER[n];
    n++;
    for (const r of rows) {
      if (r.length !== 4) continue;
      const name = cell(r[1]); if (!name || name === 'Name') continue;
      outfits.push({
        cat, name,
        img: ((r[0].i || [])[0] || '').replace(/^.*\//, '') || null,
        style: cell(r[2]) || null,
        sources: list(r[3]),
      });
    }
  }
  if (n !== ORDER.length) console.log(`   ! expected ${ORDER.length} outfit tables, found ${n}`);
  W('outfits', outfits);
}
