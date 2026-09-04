/* Static site generator for the Pokopia Wiki.
   Zero dependencies: reads data/*.json + data/content.mjs, writes dist/. */
import fs from 'node:fs';
import path from 'node:path';
import { layout, esc, icon, typePill, T, LOGO } from './ui.mjs';
import { GAME, CHARACTERS, LOCATIONS, GUIDES, SOURCES } from '../data/content.mjs';

const BASE = (process.env.BASE_PATH || '').replace(/\/$/, '');
const OUT = 'dist';
const LANGS = ['en', 'th'];

const D = n => JSON.parse(fs.readFileSync(`data/${n}.json`, 'utf8'));
const pokemon = D('pokemon'), habitats = D('habitats'), items = D('items'), recipes = D('recipes'),
  furniture = D('furniture'), buildkits = D('buildkits'), moves = D('moves'), moveboosts = D('moveboosts'),
  specialties = D('specialties'), cds = D('cds'), emotes = D('emotes'), lostrelics = D('lostrelics'),
  flavors = D('flavors'), humanrecords = D('humanrecords'), highlightreel = D('highlightreel'),
  dreamislands = D('dreamislands'), cloudislands = D('cloudislands'), envlevel = D('envlevel'),
  patches = D('patches'), events = D('events'), water = D('water'), cooking = D('cooking'),
  stampcard = D('stampcard'), teamchallenge = D('teamchallenge'), gifts = D('gifts'), favorites = D('favorites'),
  cookware = D('cookware'), outfits = D('outfits'), patterns = D('patterns'), toys = D('toys'),
  locations = D('locations');
const THRECORDS = fs.existsSync('data/th/records.json') ? D('th/records') : {};
/* Serebii writes the Important Requests in English; data/th/requests.json carries the Thai
   paragraph for paragraph, keyed by request id. */
const THREQUESTS = fs.existsSync('data/th/requests.json') ? D('th/requests') : {};
const requestParas = (r, lang) => (lang === 'th' && THREQUESTS[r.id]) || r.paras;

/* Thai item descriptions, keyed by item id. 492 of the 1,776 descriptions are shared by
   more than one item — every flower seed colour reads the same — so a translation is
   written once against one item and reaches the rest through the English text. */
const THITEMS = fs.existsSync('data/th/items.json') ? D('th/items') : {};
const thDescByEnglish = new Map();
for (const [id, text] of Object.entries(THITEMS)) {
  if (id.startsWith('_')) continue;
  const it = items.find(x => x.id === id);
  if (it && it.desc) thDescByEnglish.set(it.desc.trim(), text);
}
/** an item's description in the reading language, falling back to the original */
const itemDesc = (i, lang) => (lang === 'th' && (THITEMS[i.id] || thDescByEnglish.get((i.desc || '').trim()))) || i.desc;
/* Building kits, toys, Lost Relics and cooking equipment each have an item entry of their
   own, so anything showing one of their descriptions can read it in the page's language
   instead of falling back to Serebii's English. */
const descOf = (x, lang) => { const it = itemById.get(x.id) || itemRef(x.name); return it ? itemDesc(it, lang) : x.desc; };
const THNAMES = D('th/pokemon-names'), TERMS = D('th/terms'),
  THPATCH = D('th/patches'), THM = D('th/misc');

/* Thai overlays: fall back to the English source whenever no translation exists. */
const thSpec = (id, i) => (THM.specialties[id] || [])[i];
/* what a cooked meal adds to its move, phrase by phrase, as Serebii words them */
const thBoost = (x, lang) => (lang === 'th' && (THM.moveBoosts || {})[x]) || x;

/* Where an item comes from. Serebii writes 200 distinct source lines, but 129 of them are
   five sentences with a name slotted in, so those are built rather than listed; the rest
   are in data/th/sources.json. */
const THSOURCES = fs.existsSync('data/th/sources.json') ? D('th/sources') : {};
const SRC_QUAL_TH = { Natural: 'เกิดเองตามธรรมชาติ', Original: 'มีอยู่เดิมในพื้นที่', Treasure: 'ขุดเจอจากแผนที่สมบัติ' };
const DOLL_TH = { Pikachu: 'ปิกาจู', Dragonite: 'คาอิริว', Arcanine: 'วินดี', Clefairy: 'ปิปปิ', Eevee: 'อีวุย', Starmie: 'สตาร์มี' };

function thSource(text, lang) {
  if (lang !== 'th') return text;
  const s = String(text).trim();
  if (THSOURCES[s]) return THSOURCES[s];
  let m;
  if ((m = s.match(/^Shop - Unlocked at (.+?) Lv\. (\d+)$/)) && AREA_TH[m[1]])
    return `ร้านค้า${AREA_TH[m[1]]} ปลดล็อกที่เลเวล ${m[2]}`;
  if ((m = s.match(/^(.+?) \((Natural|Original|Treasure)\)$/)) && AREA_TH[m[1]])
    return `${AREA_TH[m[1]]} — ${SRC_QUAL_TH[m[2]]}`;
  if ((m = s.match(/^(.+?) Doll Dream Island \((Natural|Original)\)$/)))
    return `เกาะแห่งความฝันตุ๊กตา${DOLL_TH[m[1]] || m[1]} — ${SRC_QUAL_TH[m[2]]}`;
  if ((m = s.match(/^(.+?) \(Build Kit\)$/)))
    return `ได้จากการสร้างด้วย ${m[1]}`;
  if ((m = s.match(/^Reach Rank (\d+) in (.+?)( and put in shop)?$/)) && AREA_TH[m[2]])
    return `ไปให้ถึงแรงก์ ${m[1]} ที่${AREA_TH[m[2]]}${m[3] ? ' แล้วนำไปวางขายในร้าน' : ''}`;
  return s;
}
const thMove = (id, i) => (THM.moves[id] || [])[i];
const specName = (s, lang) => (lang === 'th' && thSpec(s.id, 0)) ? `${thSpec(s.id, 0)} · ${s.name}` : s.name;
const specDesc = (s, lang) => (lang === 'th' && thSpec(s.id, 1)) || s.desc;
const moveName = (m, lang) => (lang === 'th' && thMove(m.id, 0)) ? `${thMove(m.id, 0)} · ${m.name}` : m.name;
const moveEffect = (m, lang) => (lang === 'th' && thMove(m.id, 1)) || m.effect;
const moveUnlock = (m, lang) => (lang === 'th' && thMove(m.id, 2)) || m.unlock;
const thCat = (c, lang) => (lang === 'th' && THM.itemCats[c]) ? THM.itemCats[c] : c;
const thFlavor = (f, lang) => (lang === 'th' && THM.flavors[f]) ? THM.flavors[f] : f;

/* ---------------- helpers ---------------- */
let written = 0;
function write(rel, html) {
  const file = path.join(OUT, rel, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  written++;
}
function copy(from, to) {
  fs.cpSync(from, path.join(OUT, to), { recursive: true });
}
const words = s => s.toLowerCase().replace(/[()',.!?]/g, ' ').split(/[\s-]+/).filter(Boolean);

/** Thai gloss for an English item/habitat name: dictionary lookup, head-first word order. */
function gloss(name) {
  const ws = words(name);
  const out = ws.map(w => (TERMS[w] !== undefined ? TERMS[w] : null));
  if (out.every(x => x === null)) return '';
  // Thai puts the head noun first, so reverse the English modifier stack.
  const parts = out.map((th, i) => (th === null ? ws[i] : th)).filter(x => x !== '').reverse();
  const s = parts.join('').trim();
  return s === name.toLowerCase() ? '' : s;
}
const glossCache = new Map();
const G = name => {
  if (!glossCache.has(name)) glossCache.set(name, gloss(name));
  return glossCache.get(name);
};

/** Pokémon naming: EN = "Cyndaquil"; TH = "ไซนดาควิล · Cyndaquil · ฮิโนอาราชิ" */
function monNames(p) {
  const th = THNAMES[String(p.natdex)] || [null, null];
  return { en: p.name, thEn: th[0], thJa: th[1], ja: p.ja, form: p.form, alias: p.alias };
}
function monTitle(p, lang) {
  const n = monNames(p);
  if (lang === 'en') return n.alias || (n.form ? `${n.en} (${n.form})` : n.en);
  return n.thEn || n.en;
}
function monSub(p, lang) {
  const n = monNames(p);
  if (lang === 'en') return n.form && n.alias ? n.form : (n.ja || '');
  const bits = [n.en];
  if (n.thJa && n.thJa !== n.thEn) bits.push(n.thJa);
  return bits.join(' · ');
}
const monUrl = (lang, p) => `${BASE}/${lang}/pokemon/${p.id}/`;
const sprite = p => `${BASE}/sprites/small/${p.natdex}.png`;
/* official artwork is downloaded by scripts/sprites.mjs; fall back to the small
   sprite so a build without it still produces a complete site */
const hasArt = id => fs.existsSync(`src/sprites/art/${id}.png`);
const art = p => hasArt(p.natdex) ? `${BASE}/sprites/art/${p.natdex}.png` : sprite(p);

/* Item icons and habitat pictures are downloaded by scripts/sprites.mjs too. Read each
   folder once rather than stat-ing 1,700 files per language, and return null when a
   picture is missing so every caller falls back to its line icon. */
const picsIn = d => { try { return new Set(fs.readdirSync(`src/sprites/${d}`)); } catch { return new Set(); } };
const ITEM_PICS = picsIn('items'), HAB_PICS = picsIn('habitats');
const itemPic = img => img && ITEM_PICS.has(img) ? `${BASE}/sprites/items/${encodeURIComponent(img)}` : null;
/* an item Serebii does not list has no icon name of its own; its Archives sprite is
   saved as <our id>.png, so try that before giving up */
const itemImage = i => itemPic(i.img) || (ITEM_PICS.has(`${i.id}.png`) ? `${BASE}/sprites/items/${encodeURIComponent(i.id)}.png` : null);
const PATTERN_PICS = picsIn('patterns');
const patternPic = img => img && PATTERN_PICS.has(img) ? `${BASE}/sprites/patterns/${encodeURIComponent(img)}` : null;
const habPic = img => img && HAB_PICS.has(img) ? `${BASE}/sprites/habitats/${encodeURIComponent(img)}` : null;
/* the in-game badge for a specialty, saved as <id>.png by scripts/sprites.mjs */
const SPEC_PICS = picsIn('specialty');
const specPic = id => id && SPEC_PICS.has(`${id}.png`) ? `${BASE}/sprites/specialty/${encodeURIComponent(id)}.png` : null;

/** a specialty card: the badge next to the name, then what it does, then anything extra */
function specCard(s, lang, extra = '') {
  const pic = specPic(s.id);
  return `<div class="card" id="${esc(s.id)}">
    <div class="spec-head">
      ${pic ? `<img class="spec-badge" src="${pic}" alt="" loading="lazy" width="83" height="62" decoding="async">` : ''}
      <h3>${esc(specName(s, lang))}</h3>
    </div>
    <p class="spec-desc">${esc(specDesc(s, lang))}</p>
    ${extra}</div>`;
}

const L = (lang, s) => (typeof s === 'string' ? s : s[lang]);

/* ---------------- shared fragments ---------------- */
function monCard(p, lang) {
  const n = monNames(p);
  return `<a class="mon" href="${monUrl(lang, p)}">
<img src="${sprite(p)}" alt="" loading="lazy" width="68" height="68">
<div class="mon-no">#${String(p.no).padStart(3, '0')}</div>
<div class="mon-name">${esc(monTitle(p, lang))}</div>
<div class="mon-sub">${esc(lang === 'th' ? (n.en + (n.thJa ? ' · ' + n.thJa : '')) : (n.form || n.ja || ''))}</div>
</a>`;
}

function crumb(lang, trail) {
  const t = T[lang];
  return `<nav class="crumb"><a href="${BASE}/${lang}/">${esc(t.nav.home)}</a>` +
    trail.map(([label, href]) => ` <span aria-hidden="true">›</span> ` + (href ? `<a href="${href}">${esc(label)}</a>` : `<span>${esc(label)}</span>`)).join('') +
    `</nav>`;
}

/* Chips wrap rather than scroll sideways, since a horizontal scroller gave no hint that
   there was anything past the edge. Past this many the rest start folded away behind a
   toggle — six keeps the bar to one row on a desktop and two on a phone, and only the
   Pokédex, with one chip per specialty, ever has enough categories to fold any away. */
const CHIP_LIMIT = 6;

/** the filter chip bar: [All] plus one chip per category, the tail folded behind a toggle */
function chipBar(lang, cats, catLabel) {
  const t = T[lang];
  const hiddenCount = Math.max(0, cats.length - CHIP_LIMIT);
  return `<div class="chips-scroll" id="listChips">
    <button class="chip" aria-pressed="true" data-cat="">${esc(t.all)}</button>
    ${cats.map(([value, label], i) => `<button class="chip${i >= CHIP_LIMIT ? ' chip-extra' : ''}" aria-pressed="false" data-cat="${esc(value)}"${i >= CHIP_LIMIT ? ' hidden' : ''}>${esc(label)}</button>`).join('')}
    ${hiddenCount ? `<button class="chip-more" id="chipMore" type="button" aria-expanded="false" aria-controls="listChips" data-more="${esc(t.moreFilters(hiddenCount))}" data-less="${esc(t.fewerFilters)}">${esc(t.moreFilters(hiddenCount))}</button>` : ''}
  </div>`;
}

function listPage({ lang, rows, cats, catLabel, grid = false }) {
  const t = T[lang];
  return `<div class="toolbar"><div class="wrap">
  <input class="filter-input" id="listFilter" type="search" placeholder="${esc(t.filter)}" autocomplete="off">
  ${chipBar(lang, cats.map(c => [c, catLabel ? catLabel(c) : c]))}
  <div class="count" id="listCount">${esc(t.results(rows.length))}</div>
</div></div>
<div class="wrap"><div class="${grid ? 'grid g-3' : 'rows'}" id="listRows">${rows.map(r => r.html).join('')}</div>
<p class="sr-empty" id="listEmpty" hidden>${esc(t.noResults)}</p></div>`;
}

/* Items have no page of their own — they live as rows on their category page. Every row
   carries an id, so a reference from anywhere else (a recipe material, a habitat
   requirement, a favourite, a gift) can link straight to it; :target highlights it. */
const itemById = new Map(items.map(i => [i.id, i]));
const itemSquashed = new Map(items.map(i => [i.id.replace(/-/g, ''), i]));
/* Names Serebii writes one way in a list and another way on the item itself. The area
   pages account for most of them; "Copper deposit" and "Farm soil" are deliberately absent
   because each names a family with one entry per area, not a single item. */
const ITEM_ALIASES = {
  'pokemon-center-rebuilding-kit': 'pokemon-center-rebuild-kit',
  'sloped-tile-roof': 'sloped-tiled-roof',
  'pecha-tree-seeds': 'pecha-seeds',
  'pecha-tree-seed': 'pecha-seeds',
  'public-chair': 'public-seat',
  'altar-of-the-flame-kit': 'altar-of-flame-kit',
};
const itemSlug = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** resolve a loose reference — an item id, or text like "Tall Grass x 4" or "Hedge (any)" */
function itemRef(key) {
  if (itemById.has(key)) return itemById.get(key);
  const bare = String(key).replace(/\s*\((?:any|lit)\)/gi, '').replace(/\s*[x×]\s*\d+\s*$/i, '').trim();
  const id = ITEM_ALIASES[itemSlug(bare)] || itemSlug(bare);
  // sources are inconsistent about plurals ("Sea grape" for the item "Sea grapes") and
  // about spacing ("Seaglass Fragments" for "Sea glass fragments")
  return itemById.get(id) || itemById.get(id + 's') || itemById.get(id.replace(/s$/, ''))
    || itemSquashed.get(id.replace(/-/g, '')) || itemSquashed.get(id.replace(/-/g, '').replace(/s$/, '')) || null;
}
const itemHref = (lang, key) => {
  const it = itemRef(key);
  return it ? `${BASE}/${lang}/items/${catSlug(it.cat)}/#i-${it.id}` : null;
};
/** wrap already-escaped label in a link when the reference resolves, else leave it alone */
const itemLink = (lang, key, label) => {
  const href = itemHref(lang, key);
  return href ? `<a class="item-link" href="${href}">${label}</a>` : label;
};

/* Facts Serebii does not carry: whether Smearguru can repaint the item (and in how many
   separately coloured sections), whether it takes a pattern instead, and whether it needs
   the Expansion Pass or came from an event or a later version. */
function itemFacts(i, lang) {
  const th = lang === 'th';
  const out = [];
  if (i.paint) out.push(`<span class="tag tag-moss">${th ? 'ทาสีได้' : 'Paintable'}${i.paintSlots ? ` ×${i.paintSlots}` : ''}</span>`);
  if (i.pattern) out.push(`<span class="tag tag-moss">${th ? 'ใส่ลายได้' : 'Pattern'}</span>`);
  if (i.craftable) out.push(`<span class="tag">${th ? 'คราฟต์ได้' : 'Craftable'}</span>`);
  if (i.dlc) out.push(`<span class="tag tag-clay">Expansion Pass</span>`);
  if (i.event) out.push(`<span class="tag tag-clay">${th ? 'อีเวนต์' : 'Event'}</span>`);
  if (i.addedIn) out.push(`<span class="tag">v${esc(i.addedIn)}</span>`);
  return out.join('');
}
/** the favourite categories an item counts as — the fact that decides who wants it */
const itemLikedAs = (i, lang) => (i.likedAs || []).length
  ? `<div class="kit-line"><span class="kit-label">${lang === 'th' ? 'นับเป็นหมวด' : 'Counts as'}</span>
      <div class="kit-helpers">${i.likedAs.map(c => `<span class="tag tag-clay">${esc(thFav(c, lang))}</span>`).join('')}</div></div>`
  : '';

/** the same facts as words, so the filter box can find them */
const itemSearchText = (i, lang) => [
  ...((recipeById.get(i.id) || { materials: [] }).materials.map(m => m.name)),
  ...(i.likedAs || []).flatMap(c => [c, thFav(c, 'th')]),
  i.paint ? (lang === 'th' ? 'ทาสีได้ paintable' : 'paintable') : '',
  i.pattern ? (lang === 'th' ? 'ใส่ลายได้ pattern' : 'pattern') : '',
  i.craftable ? (lang === 'th' ? 'คราฟต์ได้ craftable' : 'craftable') : '',
  i.dlc ? 'expansion pass dlc' : '',
  i.event ? (lang === 'th' ? 'อีเวนต์ event' : 'event') : '',
  i.addedIn ? `v${i.addedIn}` : '',
].filter(Boolean).join(' ');

const cellPic = img => { const u = itemPic(img); return u ? `<img class="cell-ico" src="${u}" alt="" loading="lazy" width="32" height="32" decoding="async">` : ''; };
const matPic = m => { const u = itemPic(m.img); return u ? `<img class="mat-ico" src="${u}" alt="" loading="lazy" width="24" height="24" decoding="async">` : ''; };

/* 882 of the items can be crafted, and recipes.json keys its recipe by the same id, so an
   item's own row can carry what it costs instead of sending the reader to /recipes/. */
const recipeById = new Map(recipes.map(r => [r.id, r]));

/** one material: picture, name, quantity, linked to that material's own row */
function recipeMaterial(m, lang) {
  const it = itemById.get(m.item) || itemRef(m.name);
  const pic = itemPic(m.img) || (it ? itemPic(it.img) : null);
  // items keep their English name as the primary label everywhere on the site
  const inner = `${pic ? `<img src="${pic}" alt="" loading="lazy" width="34" height="34" decoding="async">` : ''}<span>${esc(m.name)}</span> <b>×${m.qty}</b>`;
  return it
    ? `<a class="fav-item" href="${itemHref(lang, it.id)}" title="${esc(itemDesc(it, lang) || m.name)}">${inner}</a>`
    : `<span class="fav-item">${inner}</span>`;
}

/** what an item costs to craft, and how the recipe is unlocked */
function itemRecipe(i, lang) {
  const th = lang === 'th';
  const r = recipeById.get(i.id);
  /* Eight items are flagged craftable while Serebii files their recipe under a slightly
     different name — "Rattan rug" against "Ratan rug", "Big treasure box" against "Big
     treasure chest". Pairing them up would be a guess, so the row says the recipe is
     missing rather than showing another item's. */
  if (!r || !r.materials.length) return i.craftable
    ? `<div class="row-meta recipe-src"><span>${th ? 'คราฟต์ได้ แต่ Serebii ยังไม่ได้ลงสูตรไว้ใต้ชื่อนี้' : 'Craftable, but Serebii files no recipe under this name'}</span></div>`
    : '';
  /* the item's own "sources" say where to get the finished thing; the recipe's say how you
     come to know it, which is a different question and only shown when it differs */
  const unlock = r.sources.filter(x => !(i.sources || []).includes(x));
  return `<div class="kit-line">
    <span class="kit-label">${th ? 'ใช้คราฟต์' : 'Crafted from'}</span>
    <div class="fav-items">${r.materials.map(m => recipeMaterial(m, lang)).join('')}</div></div>` +
    (unlock.length ? `<div class="row-meta recipe-src"><span>${th ? 'ปลดล็อกสูตร' : 'Recipe unlocked by'}: ${esc(unlock.join(' · '))}</span></div>` : '');
}
const rowIcon = (kind, pic) => pic
  ? `<img class="row-ico row-pic" src="${pic}" alt="" loading="lazy" width="72" height="72" decoding="async">`
  : `<div class="row-ico">${icon(kind)}</div>`;

const monById = new Map(pokemon.map(p => [p.id, p]));
/* longest name first, so an unlock line saying "Paldean Wooper" is not matched as "Wooper" */
const MON_BY_NAME_DESC = [...pokemon].sort((a, b) => b.name.length - a.name.length);

const thAmb = (a, lang) => (lang === 'th' && THM.ambience[a]) || a;
const thFav = (f, lang) => (lang === 'th' && THM.favorites[f]) || f;
const favByName = new Map(favorites.map(f => [f.name, f]));

/* What each ideal habitat means in play. The six are the game's own ambience values;
   the reading of each is written here rather than quoted, since no source spells them out. */
/* Pokopia Lab and Serebii name the same conditions differently — Sunset/Sunny/Cloudy/Rainy
   against Evening/Sun/Cloud/Rain — so both spellings live in one map. */
const TIME_TH = { Morning: 'เช้า', Day: 'กลางวัน', Sunset: 'เย็น', Evening: 'เย็น', Night: 'กลางคืน' };
const WEATHER_TH = { Sunny: 'แดดออก', Sun: 'แดดออก', Cloudy: 'มีเมฆ', Cloud: 'มีเมฆ', Rainy: 'ฝนตก', Rain: 'ฝนตก' };
const ALL_TIMES = ['Morning', 'Day', 'Sunset', 'Night'];
const ALL_WEATHER = ['Sunny', 'Cloudy', 'Rainy'];

/** a row of condition chips, the ones that do not apply shown muted rather than dropped */
function condRow(all, active, thMap, lang) {
  const on = new Set(active);
  return `<div class="cond-row">${all.map(k => `<span class="cond${on.has(k) ? ' cond-on' : ''}">${esc(lang === 'th' ? (thMap[k] || k) : k)}</span>`).join('')}</div>`;
}

const AMBIENCE_DESC = {
  Bright: ['สว่างสดใส โล่ง แดดส่องถึง', 'Open and well lit, with the sun reaching in'],
  Dark: ['มืดครึ้ม มีมุมอับและที่กำบัง เช่น ถ้ำหรือใต้ดิน', 'Shadowy and dim — caves, undergrounds, covered corners'],
  Warm: ['อบอุ่น มีไฟหรือแดดแรง', 'Warm, with fire or strong sun about'],
  Cool: ['เย็นสบาย มีร่มเงาและลมโชย', 'Cool, shaded, with a breeze through it'],
  Humid: ['ชื้น มีน้ำอยู่ใกล้ ๆ', 'Damp, with water close by'],
  Dry: ['แห้ง เป็นดินทรายหรือหิน', 'Dry — sand, dust and bare rock'],
};

/* Flavours are a favourite category too, but Serebii has no per-flavour item page for
   them; the food and berry list is where the items with a given flavour live. */
const flavorItems = flavor => flavors
  .filter(f => f.flavor === String(flavor).toLowerCase())
  .map(f => ({ id: itemSlug(f.name), name: f.name, img: (itemRef(f.name) || {}).img }));

/** one favourite category: its whole item list, in a box that scrolls */
function favTier(label, gloss, count, items, lang, no) {
  const th = lang === 'th';
  return `<div class="like-tier">
    <div class="like-head"><h3>${no ? `<b class="fav-no">${no}</b> ` : ''}${esc(label)}${gloss ? ` <span class="gloss">${esc(gloss)}</span>` : ''}</h3>
      <span>${esc(count)}</span></div>
    ${items.length ? `<div class="fav-items fav-scroll">${items.map(it => {
    const href = itemHref(lang, it.id);
    const pic = itemPic(it.img);
    const inner = `${pic ? `<img src="${pic}" alt="" loading="lazy" width="34" height="34" decoding="async">` : ''}<span>${esc(it.name)}</span>`;
    return href ? `<a class="fav-item" href="${href}" title="${esc(it.name)}">${inner}</a>`
      : `<span class="fav-item" title="${esc(it.name)}">${inner}</span>`;
  }).join('')}</div>` : ''}
  </div>`;
}

/** What a Pokémon likes: one ideal ambience, five item categories, one flavour.
    The five are numbered the way the game lists them; no source ranks them by
    strength, so nothing here implies one is worth more than another. */
/* The ideal habitat, plus what is actually known about time of day and weather. No source
   publishes a per-Pokémon time or weather table, so this says how the mechanic works
   rather than inventing per-species values. */
function monEnvironment(p, lang) {
  if (!p.ambience) return '';
  const th = lang === 'th';
  const desc = (AMBIENCE_DESC[p.ambience] || [])[th ? 0 : 1] || '';
  return `<section><div class="sec-title"><h2>${th ? 'สภาพแวดล้อมที่ชอบ' : 'Environment'}</h2></div>
  <div class="env">
    <div class="env-pick"><b>${esc(thAmb(p.ambience, lang))}</b>${th ? ` <span class="gloss">${esc(p.ambience)}</span>` : ''}
      <span>${th ? '1 จาก 6 บรรยากาศ' : '1 of 6 ambiences'}</span></div>
    ${desc ? `<p class="env-desc">${esc(desc)}</p>` : ''}
  </div>
  <p class="note">${th
      ? 'ที่อยู่อาศัยที่ตรงกับบรรยากาศนี้จะดัน Comfy Level ได้เร็วกว่า ส่วนช่วงเวลาและอากาศเป็นเงื่อนไขว่าโปเกมอนจะโผล่มาที่ที่อยู่อาศัยหรือไม่ ทั้งนี้แสงแทนที่เวลาได้ ตัวที่ออกกลางคืนจะออกตอนไหนก็ได้ถ้าที่อยู่อาศัยอยู่ในที่มืด เช่น ถ้ำหรือใต้ดิน และตัวที่ออกกลางวันจะออกตอนกลางคืนได้ถ้าที่อยู่อาศัยมีแสงสว่างล้อมรอบ'
      : 'A habitat matching this ambience raises Comfy Level faster. Time and weather gate whether a Pokémon turns up at a habitat at all — though light overrides the clock: a night Pokémon spawns at any hour if its habitat sits somewhere dark such as a cave or underground, and a day Pokémon spawns at night if its habitat is ringed with light.'}</p>
  ${p.times || p.weather ? `<div class="conds">
    ${p.times ? `<div class="cond-block"><div class="cond-label">${th ? 'ช่วงเวลาที่ออก' : 'Time of day'}</div>
      ${condRow(ALL_TIMES, p.times, TIME_TH, lang)}
      ${p.times.length < ALL_TIMES.length ? `<p class="cond-note">${th
        ? `ออกเฉพาะ${p.times.map(x => TIME_TH[x] || x).join(' / ')}เท่านั้น`
        : `Only ${p.times.join(', ')}`}</p>` : ''}</div>` : ''}
    ${p.weather ? `<div class="cond-block"><div class="cond-label">${th ? 'สภาพอากาศ' : 'Weather'}</div>
      ${condRow(ALL_WEATHER, p.weather, WEATHER_TH, lang)}
      ${p.weather.length < ALL_WEATHER.length ? `<p class="cond-note">${th
        ? `ออกเฉพาะตอน${p.weather.map(x => WEATHER_TH[x] || x).join(' / ')}เท่านั้น`
        : `Only when ${p.weather.join(', ')}`}</p>` : ''}</div>` : ''}
  </div>` : `<p class="note note-clay">${th
      ? 'ยังไม่มีข้อมูลช่วงเวลาและสภาพอากาศของตัวนี้ — แหล่งข้อมูลที่ใช้ยังไม่ครอบคลุมโปเกมอนจาก Expansion Pass และอีเวนต์'
      : 'Time and weather are not recorded for this one — the source does not yet cover the Expansion Pass and event Pokémon.'}</p>`}
  </section>`;
}

function monLikes(p, lang) {
  if (!p.favorites.length && !p.flavor) return '';
  const th = lang === 'th';
  return `<section><div class="sec-title"><h2>${th ? 'ของโปรด' : 'Favourites'}</h2><span>${p.favorites.length + (p.flavor ? 1 : 0)}</span></div>
  <p class="note">${th
      ? 'ให้หรือวางของที่ตรงกับรายการนี้ ค่าความเป็นเพื่อนและ Comfy Level จะขึ้นเร็วกว่าปกติมาก สังเกตได้จากประกายตอนวางที่จะใหญ่กว่า และถ้าเป็นโปเกมอนที่มีความถนัด Trade ของที่ตรงจะมีมูลค่าบนตาชั่งเพิ่ม 50%'
      : 'Give or place anything matching these and both friendship and Comfy Level rise much faster — a matching item lays down with a bigger sparkle. For a Pokémon with the Trade specialty, matching items are also worth 50% more on the scale.'}</p>
  <div class="likes">
    ${p.favorites.map((f, i) => {
        const cat = favByName.get(f);
        const items = cat ? cat.items : [];
        const count = cat ? `${items.length}${cat.partial ? '+' : ''} ${th ? 'ไอเทม' : 'items'}` : '';
        return favTier(thFav(f, lang), th ? f : '', count, items, lang, i + 1);
      }).join('')}
    ${p.flavor ? (() => {
        const items = flavorItems(p.flavor);
        return favTier(`${th ? 'รส' : 'Flavour'}: ${thFlavor(p.flavor.toLowerCase(), lang)}`, th ? p.flavor : '',
          `${items.length} ${th ? 'อย่าง' : 'foods'}`, items, lang, 0);
      })() : ''}
  </div>
  <p class="note note-clay">${th
      ? 'สองข้อที่ต้องบอกตามตรง หนึ่งคือเกมแสดงห้าหมวดนี้เรียงตามลำดับตายตัว แต่ไม่มีแหล่งข้อมูลไหนบอกว่าหมวดที่ 1 ให้ผลมากกว่าหมวดที่ 5 เลขที่เห็นจึงเป็นลำดับในเกม ไม่ใช่ระดับความชอบ สองคือรายการไอเทมของแต่ละหมวดยังไม่ครบ Serebii ระบุเองว่ายังทยอยเพิ่มอยู่ ตัวเลขที่เห็นจึงเป็นขั้นต่ำ ไม่ใช่ยอดรวม'
      : 'Two caveats. The game lists these five in a fixed order, but no source says the first counts for more than the fifth — the numbers are the in-game order, not a strength ranking. And the item lists are incomplete: Serebii marks them as still being filled in, so each count is a floor, not a total.'}</p>
  </section>`;
}

/** What a Pokémon hands you back: Litter drops and the one-off emote gift. */
function monGives(p, lang) {
  if (!p.litter.length && !p.gift) return '';
  const th = lang === 'th';
  return `<section><div class="sec-title"><h2>${th ? 'ของที่มันให้เรา' : 'What it gives you'}</h2><span>${p.litter.length + (p.gift ? 1 : 0)}</span></div>
  <div class="rows">
    ${p.litter.map(x => dataRow({
        name: x, gloss: G(x), kind: 'box', pic: itemPic(itemImg.get(x.toLowerCase())), href: itemHref(lang, x), lang,
        desc: th ? 'ทิ้งไว้ใกล้บ้านของมันเรื่อย ๆ จากความถนัด Litter — ไม่ต้องรอให้สนิท เริ่มตั้งแต่วันที่ย้ายเข้ามา'
          : 'Dropped near its home again and again by the Litter specialty — no friendship needed, it starts the day it moves in.',
        meta: `<span class="tag tag-moss">Litter</span><span>${th ? 'ซ้ำเรื่อย ๆ' : 'Repeats'}</span>`,
      })).join('')}
    ${p.gift ? dataRow({
        name: p.gift, kind: 'star', lang,
        desc: th ? 'อิโมตที่มันมอบให้ครั้งเดียว เมื่อความสนิทขึ้นถึงระดับสูง (ระดับ 4)'
          : 'An emote it hands over once, when friendship reaches the high stage (stage 4).',
        meta: `<span class="tag tag-clay">${th ? 'อิโมต' : 'Emote'}</span><span>${th ? 'ครั้งเดียว' : 'Once'}</span>`,
      }) : ''}
  </div>
  <p class="note"><a href="${BASE}/${lang}/gifts/" style="text-decoration:underline">${th ? 'ดูของขวัญของโปเกมอนทุกตัว และห้าระดับความสนิท' : 'See every Pokémon’s gifts and the five friendship stages'}</a></p>
  </section>`;
}
/* The six areas you build in, plus Cloud Island, which is a trip rather than a place you
   own. Serebii writes them in English on every habitat page. */
const AREAS = ['Palette Town', 'Withered Wastelands', 'Rocky Ridges', 'Sparkling Skylands', 'Bleak Beach', 'Bubbly Basin', 'Cloud Island'];
const AREA_TH = {
  'Palette Town': 'พาเลตทาวน์', 'Withered Wastelands': 'ดินแดนแห้งแล้ง', 'Rocky Ridges': 'สันเขาหิน',
  'Sparkling Skylands': 'เกาะลอยฟ้า', 'Bleak Beach': 'ชายหาดร้าง', 'Bubbly Basin': 'อ่าวน้ำใส', 'Cloud Island': 'เกาะเมฆ',
};
const RARITY_TH = { Common: 'พบบ่อย', Rare: 'หายาก', 'Very Rare': 'หายากมาก' };
const areaSlug = a => a.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const thArea = (a, lang) => (lang === 'th' && AREA_TH[a]) || a;

/* A habitat is "everywhere" when it works in all six buildable areas. Most do not include
   Bubbly Basin, which arrived with the expansion, so that is the line worth drawing. */
const buildable = h => (h.areas || []).filter(a => a !== 'Cloud Island');

/** the chip values a habitat answers to: its dex, its areas, and any gating it has */
function habitatCats(h) {
  const out = [h.dex, ...buildable(h).map(areaSlug)];
  if ((h.times || []).length && h.times.length < 4) out.push('timed');
  if ((h.weather || []).length && h.weather.length < 3) out.push('weathered');
  return out.join(' ');
}

/** where it works, what it yields and any time or weather it insists on */
function habitatFacts(h, lang) {
  const th = lang === 'th', out = [];
  const areas = buildable(h);
  const base = AREAS.filter(a => a !== 'Cloud Island' && a !== 'Bubbly Basin');
  if (areas.length >= 6) out.push(`<span class="tag">${th ? 'ทุกพื้นที่' : 'Every area'}</span>`);
  else if (base.every(a => areas.includes(a))) out.push(`<span class="tag">${th ? 'ทุกพื้นที่ ยกเว้นอ่าวน้ำใส' : 'Every area but Bubbly Basin'}</span>`);
  else if (areas.length) out.push(...areas.map(a => `<span class="tag">${esc(thArea(a, lang))}</span>`));
  for (const r of (h.rarities || [])) out.push(`<span class="tag tag-clay">${esc(th ? RARITY_TH[r] : r)}</span>`);
  if ((h.times || []).length && h.times.length < 4)
    out.push(`<span class="tag tag-moss">${h.times.map(x => esc(th ? TIME_TH[x] || x : x)).join(' · ')}</span>`);
  if ((h.weather || []).length && h.weather.length < 3)
    out.push(`<span class="tag tag-moss">${h.weather.map(x => esc(th ? WEATHER_TH[x] || x : x)).join(' · ')}</span>`);
  return out.join('');
}

/** habitat card: build requirements on the left, the Pokémon it releases below */
function habitatCard(h, lang) {
  const mons = h.mons.map(id => monById.get(id)).filter(Boolean);
  const gl = G(h.name), pic = habPic(h.img);
  return `<article class="row${pic ? ' row-wide' : ''}" id="h${h.dex}-${h.no}" data-cat="${esc(habitatCats(h))}" data-s="${esc((h.name + ' ' + gl + ' ' + h.desc + ' ' + h.req.join(' ') + ' ' + mons.map(m => m.name + ' ' + monTitle(m, lang)).join(' ')).toLowerCase())}">
${pic
      ? `<img class="hab-pic" src="${pic}" alt="${esc(h.name)}" loading="lazy" width="150" height="105" decoding="async">`
      : rowIcon('leaf')}
<div>
  <div class="row-name">#${String(h.no).padStart(3, '0')} ${esc(h.name)}</div>
  ${lang === 'th' && gl ? `<div class="row-th gloss">${esc(gl)}</div>` : ''}
  ${h.desc ? `<div class="row-desc">${esc(h.desc)}</div>` : ''}
  ${habitatFacts(h, lang) ? `<div class="row-meta">${habitatFacts(h, lang)}</div>` : ''}
  ${h.req.length ? `<div class="mats">${h.req.map(r => `<span class="mat">${itemLink(lang, r, esc(r))}</span>`).join('')}</div>` : ''}
  ${mons.length ? `<div class="hab-mons">${mons.map(m => `<a href="${monUrl(lang, m)}" title="${esc(monTitle(m, lang))}"><img src="${sprite(m)}" alt="${esc(monTitle(m, lang))}" loading="lazy" width="40" height="40"><span>${esc(monTitle(m, lang))}</span></a>`).join('')}</div>` : ''}
</div></article>`;
}

/** the same content as dataRow, laid out as a card so a long list tiles instead of
    running one entry per full-width row with most of the width left empty */
function dataCard({ name, gloss: gl, desc, meta, foot, cat, kind, pic, id, href, find, lang }) {
  const inner = `<div class="dc-head">${rowIcon(kind, pic)}
    <div><div class="row-name">${esc(name)}</div>
    ${lang === 'th' && gl ? `<div class="row-th gloss">${esc(gl)}</div>` : ''}</div></div>
  ${desc ? `<div class="row-desc">${esc(desc)}</div>` : ''}
  ${meta ? `<div class="row-meta">${meta}</div>` : ''}
  ${foot ? `<div class="dc-foot">${foot}</div>` : ''}`;
  return `<div class="card data-card"${id ? ` id="${esc(id)}"` : ''} data-cat="${esc(cat || '')}" data-s="${esc((name + ' ' + (gl || '') + ' ' + (desc || '') + ' ' + (find || '')).toLowerCase())}">
    ${href ? `<a class="dc-link" href="${href}">${inner}</a>` : inner}</div>`;
}

function dataRow({ name, gloss: gl, desc, meta, mats, cat, kind, pic, id, href, find, lang }) {
  return `<div class="row"${id ? ` id="${esc(id)}"` : ''} data-cat="${esc(cat || '')}" data-s="${esc((name + ' ' + (gl || '') + ' ' + (desc || '') + ' ' + (find || '')).toLowerCase())}">
${rowIcon(kind, pic)}
<div><div class="row-name">${href ? `<a href="${href}">${esc(name)}</a>` : esc(name)}</div>
${lang === 'th' && gl ? `<div class="row-th gloss">${esc(gl)}</div>` : ''}
${desc ? `<div class="row-desc">${esc(desc)}</div>` : ''}
${mats || ''}
${meta ? `<div class="row-meta">${meta}</div>` : ''}</div></div>`;
}

/* ---------------- pages ---------------- */
function homePage(lang) {
  const t = T[lang];
  const featured = ['getting-started', 'habitats', 'building', 'crafting', 'water', 'cooking']
    .map(s => GUIDES.find(g => g.slug === s)).filter(Boolean);
  const latest = patches[0];
  const counts = [
    [new Set(pokemon.filter(p => p.dex === 'main').map(p => p.no)).size, t.nav.pokedex, '/pokedex/', 'dex'],
    [habitats.length, t.nav.habitats, '/habitats/', 'leaf'],
    [items.length, t.nav.items, '/items/', 'box'],
    [recipes.length, t.nav.recipes, '/recipes/', 'package'],
  ];
  const body = `
<section class="hero"><div class="wrap stack" style="--gap:14px">
  <p class="eyebrow">${lang === 'th' ? 'Nintendo Switch 2 · 5 มีนาคม 2026' : 'Nintendo Switch 2 · 5 March 2026'}</p>
  <h1>${esc(L(lang, GAME.title))}</h1>
  <p class="lede">${esc(L(lang, GAME.tagline))}</p>
  <div class="chips">
    <a class="chip" href="${BASE}/${lang}/pokedex/">${icon('dex')} ${esc(t.nav.pokedex)}</a>
    <a class="chip" href="${BASE}/${lang}/guides/">${icon('book')} ${esc(t.nav.basics)}</a>
    <a class="chip" href="${BASE}/${lang}/updates/">${icon('refresh')} v${latest.version}</a>
  </div>
</div></section>

<div class="wrap">
  <div class="grid g-2">${counts.map(([n, label, href, ic]) => `
    <a class="card" href="${BASE}/${lang}${href}">
      <div style="color:var(--moss);width:22px">${icon(ic)}</div>
      <div style="font-family:var(--font-display);font-size:1.6rem;line-height:1.2;margin-top:6px">${n}</div>
      <div style="font-size:.85rem;color:var(--muted)">${esc(label)}</div>
    </a>`).join('')}</div>

  <div class="sec-title"><h2>${lang === 'th' ? 'เริ่มจากตรงนี้' : 'Start here'}</h2></div>
  <div class="grid g-4">${featured.map(g => `
    <a class="card" href="${BASE}/${lang}/guide/${g.slug}/">
      <div style="color:var(--moss);width:22px">${icon(g.icon)}</div>
      <h3 style="margin:8px 0 4px">${esc(L(lang, g.title))}</h3>
      <p style="font-size:.87rem;color:var(--muted);margin:0">${esc(L(lang, g.summary))}</p>
    </a>`).join('')}</div>

  <div class="sec-title"><h2>${lang === 'th' ? 'ตัวละครหลัก' : 'The cast'}</h2>
    <span><a href="${BASE}/${lang}/characters/">${lang === 'th' ? 'ดูทั้งหมด' : 'See all'}</a></span></div>
  <div class="dex-grid">${CHARACTERS.map(c => {
    const p = pokemon.find(x => x.natdex === c.natdex && (x.alias || x.natdex === 132));
    return `<a class="mon" href="${BASE}/${lang}/characters/#${c.id}">
      <img src="${BASE}/sprites/small/${c.natdex}.png" alt="" loading="lazy" width="68" height="68">
      <div class="mon-name">${esc(L(lang, c.name))}</div>
      <div class="mon-sub">${esc(L(lang, c.role).split('·')[0].trim())}</div></a>`;
  }).join('')}</div>

  <div class="sec-title"><h2>${lang === 'th' ? 'สถานที่' : 'Locations'}</h2></div>
  <div class="grid g-4">${LOCATIONS.map(l => `
    <a class="card" href="${BASE}/${lang}/location/${l.id}/">
      <div class="chips" style="margin-bottom:8px"><span class="tag ${l.dlc ? 'tag-clay' : 'tag-moss'}">${l.dlc ? 'DLC' : '#' + l.order}</span></div>
      <h3>${esc(L(lang, l.name))}</h3>
      <p style="font-size:.85rem;color:var(--muted);margin:4px 0 0">${esc(L(lang, l.based))}</p>
    </a>`).join('')}</div>

  <div class="sec-title"><h2>${esc(t.nav.updates)}</h2>
    <span><a href="${BASE}/${lang}/updates/">${lang === 'th' ? 'ดูทั้งหมด' : 'See all'}</a></span></div>
  <div class="card"><h3>v${latest.version} — ${esc((lang === 'th' && THPATCH[latest.version]) ? THPATCH[latest.version].date : latest.date)}</h3>
    <ul style="margin:10px 0 0;padding-left:1.1em;font-size:.9rem;color:var(--ink-2)">${((lang === 'th' && THPATCH[latest.version] && THPATCH[latest.version].lines.length === latest.lines.length) ? THPATCH[latest.version].lines : latest.lines).slice(0, 5).map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
</div>`;
  return layout({ lang, base: BASE, title: L(lang, GAME.title), desc: L(lang, GAME.tagline), path: '/', body });
}

function pokedexPage(lang) {
  const t = T[lang];
  const groups = [
    ['main', lang === 'th' ? 'เด็กซ์หลัก' : 'Main Pokédex'],
    ['basin', lang === 'th' ? 'เด็กซ์ Bubbly Basin' : 'Bubbly Basin dex'],
    ['event', lang === 'th' ? 'เด็กซ์อีเวนต์' : 'Event dex'],
  ];
  const body = `${crumb(lang, [[t.nav.pokedex]])}
<div class="wrap stack">
  <h1>${esc(t.nav.pokedex)}</h1>
  <p class="lede">${lang === 'th'
      ? 'โปเกมอนทุกตัวที่ปรากฏใน Pokémon Pokopia พร้อมความถนัด ประเภท และชื่อไทยทั้งแบบทับศัพท์อังกฤษและทับศัพท์ญี่ปุ่น'
      : 'Every Pokémon that appears in Pokémon Pokopia, with its specialties, types and dex numbers.'}</p>
</div>
<div class="toolbar"><div class="wrap">
  <input class="filter-input" id="listFilter" type="search" placeholder="${esc(t.filter)}" autocomplete="off">
  ${chipBar(lang, specialties.map(s => [s.id, lang === 'th' && thSpec(s.id, 0) ? thSpec(s.id, 0) : s.name]))}
  <div class="count" id="listCount">${esc(t.results(pokemon.length))}</div>
</div></div>
<div class="wrap" id="listRows">
${groups.map(([dex, label]) => {
    const list = pokemon.filter(p => p.dex === dex);
    if (!list.length) return '';
    return `<div class="sec-title"><h2>${esc(label)}</h2><span>${list.length}</span></div>
    <div class="dex-grid">${list.map(p => monCard(p, lang).replace('<a class="mon"',
      `<a class="mon" data-cat="${p.specialties.join(' ')}" data-s="${esc([p.name, p.form, p.alias, p.ja, ...(THNAMES[String(p.natdex)] || [])].filter(Boolean).join(' ').toLowerCase())}"`)).join('')}</div>`;
  }).join('')}
</div>
<p class="sr-empty" id="listEmpty" hidden>${esc(t.noResults)}</p>`;
  return layout({ lang, base: BASE, title: t.nav.pokedex, desc: 'Pokémon Pokopia Pokédex', path: '/pokedex/', body });
}

function pokemonPage(p, lang) {
  const t = T[lang];
  const n = monNames(p);
  const specs = p.specialties.map(id => specialties.find(s => s.id === id)).filter(Boolean);
  const hab = null;
  const idx = pokemon.filter(x => x.dex === p.dex);
  const i = idx.indexOf(p);
  const prev = idx[i - 1], next = idx[i + 1];
  const dexLabel = { main: lang === 'th' ? 'เด็กซ์หลัก' : 'Main dex', basin: 'Bubbly Basin', event: lang === 'th' ? 'อีเวนต์' : 'Event' }[p.dex];

  const body = `${crumb(lang, [[t.nav.pokedex, `${BASE}/${lang}/pokedex/`], [monTitle(p, lang)]])}
<div class="wrap stack" style="--gap:22px">
  <div class="mon-head">
    <div class="mon-art"><img src="${art(p)}" alt="${esc(p.name)}" width="230" height="230" loading="eager"></div>
    <div class="stack" style="--gap:12px">
      <div>
        <p class="eyebrow">${esc(dexLabel)} · #${String(p.no).padStart(3, '0')}</p>
        <h1>${esc(monTitle(p, lang))}</h1>
        ${lang === 'th'
      ? `<p class="lede" style="margin:4px 0 0">${esc(p.alias || p.name)}${n.thJa ? ` · ${esc(n.thJa)}` : ''}${n.ja ? ` · ${esc(n.ja)}` : ''}</p>`
      : `<p class="lede" style="margin:4px 0 0">${esc(n.ja || '')}${n.thEn ? ` · ${esc(n.thEn)}` : ''}</p>`}
      </div>
      <div class="chips">${p.types.map(typePill).join('')}</div>
      <dl class="kv">
        <dt>${lang === 'th' ? 'เลขเด็กซ์แห่งชาติ' : 'National dex'}</dt><dd>#${String(p.natdex).padStart(4, '0')}</dd>
        ${p.genus ? `<dt>${lang === 'th' ? 'ฉายา' : 'Category'}</dt><dd>${esc(p.genus)}</dd>` : ''}
        ${p.form ? `<dt>${lang === 'th' ? 'ร่าง' : 'Form'}</dt><dd>${esc(p.form)}</dd>` : ''}
      </dl>
    </div>
  </div>

  ${specs.length ? `<section><div class="sec-title"><h2>${esc(t.nav.specialties)}</h2></div>
    <div class="grid g-4">${specs.map(s => specCard(s, lang)).join('')}</div></section>` : ''}

  ${monEnvironment(p, lang)}
  ${monLikes(p, lang)}
  ${monGives(p, lang)}

  ${(() => {
      const habs = p.habitats.map(id => habitats.find(h => h.id === id)).filter(Boolean);
      if (habs.length) return `<section><div class="sec-title"><h2>${lang === 'th' ? 'สร้างที่อยู่อาศัยแบบไหนถึงจะได้' : 'How to get it'}</h2><span>${habs.length}</span></div>
    <div class="rows">${habs.map(h => `<article class="row${habPic(h.img) ? ' row-wide' : ''}">${habPic(h.img)
        ? `<a href="${BASE}/${lang}/habitats/#h${h.dex}-${h.no}"><img class="hab-pic" src="${habPic(h.img)}" alt="${esc(h.name)}" loading="lazy" width="150" height="105" decoding="async"></a>`
        : rowIcon('leaf')}<div>
      <div class="row-name"><a href="${BASE}/${lang}/habitats/#h${h.dex}-${h.no}">#${String(h.no).padStart(3, '0')} ${esc(h.name)}</a>
        <span class="tag ${h.dex === 'basin' ? 'tag-clay' : 'tag-moss'}" style="margin-left:6px">${esc({ main: lang === 'th' ? 'เด็กซ์หลัก' : 'Main', basin: 'Bubbly Basin', event: lang === 'th' ? 'อีเวนต์' : 'Event' }[h.dex])}</span></div>
      ${lang === 'th' && G(h.name) ? `<div class="row-th gloss">${esc(G(h.name))}</div>` : ''}
      <div class="mats">${h.req.map(r => `<span class="mat">${itemLink(lang, r, esc(r))}</span>`).join('')}</div>
    </div></article>`).join('')}</div></section>`;
      return `<div class="note note-clay">${lang === 'th'
        ? 'โปเกมอนตัวนี้ไม่ได้มาจากการสร้างที่อยู่อาศัย — ดูวิธีได้มาในคู่มือโปเกมอนในตำนาน'
        : 'This Pokémon is not obtained by building a habitat — see the Legendary guide for how it joins you.'} <a href="${BASE}/${lang}/guide/legendary/" style="text-decoration:underline">${lang === 'th' ? 'เปิดคู่มือ' : 'Open guide'}</a></div>`;
    })()}

  ${(() => {
      const taught = moves.filter(m => new RegExp(`\\b${p.name}\\b`, 'i').test(m.unlock));
      return taught.length ? `<section><div class="sec-title"><h2>${lang === 'th' ? 'สอนท่าให้ดิตโต้' : 'Teaches Ditto'}</h2></div>
    <div class="grid g-4">${taught.map(m => `<a class="card" href="${BASE}/${lang}/moves/#${m.id}"><h3>${esc(moveName(m, lang))}</h3><p style="font-size:.88rem;color:var(--ink-2);margin:6px 0 0">${esc(moveEffect(m, lang))}</p></a>`).join('')}</div></section>` : '';
    })()}

  <nav class="grid g-2" style="margin-top:10px">
    ${prev ? `<a class="card" href="${monUrl(lang, prev)}"><div style="font-size:.75rem;color:var(--muted)">← #${String(prev.no).padStart(3, '0')}</div><div style="font-weight:600">${esc(monTitle(prev, lang))}</div></a>` : '<div></div>'}
    ${next ? `<a class="card" href="${monUrl(lang, next)}" style="text-align:right"><div style="font-size:.75rem;color:var(--muted)">#${String(next.no).padStart(3, '0')} →</div><div style="font-weight:600">${esc(monTitle(next, lang))}</div></a>` : '<div></div>'}
  </nav>
</div>`;
  const desc = lang === 'th'
    ? `${monTitle(p, lang)} (${p.name}) ในเกม Pokémon Pokopia — เด็กซ์ #${p.no}, ความถนัด ${specs.map(s => s.name).join(', ') || '-'}`
    : `${monTitle(p, lang)} in Pokémon Pokopia — Pokopia dex #${p.no}, specialties: ${specs.map(s => s.name).join(', ') || 'none'}.`;
  return layout({ lang, base: BASE, title: monTitle(p, lang), desc, path: `/pokemon/${p.id}/`, body });
}

function habitatsPage(lang) {
  const t = T[lang], th = lang === 'th';

  /* Three kinds of chip share one bar because the filter is single-select: which dex a
     habitat is in, which area it is any use in, and whether it insists on a time of day or
     a kind of weather. Every habitat carries all of its values in data-cat. */
  const areaCats = AREAS.filter(a => a !== 'Cloud Island').map(areaSlug);
  const cats = ['main', 'basin', 'event', ...areaCats, 'timed', 'weathered'];
  const areaByCat = new Map(AREAS.map(a => [areaSlug(a), a]));
  const catLabel = c => areaByCat.has(c) ? thArea(areaByCat.get(c), lang)
    : ({
      main: th ? 'เด็กซ์หลัก' : 'Main', basin: 'Bubbly Basin', event: th ? 'อีเวนต์' : 'Event',
      timed: th ? 'จำกัดช่วงเวลา' : 'Time-gated', weathered: th ? 'จำกัดสภาพอากาศ' : 'Weather-gated',
    }[c] || c);

  const everywhere = habitats.filter(h => buildable(h).length >= 6).length;
  const basinOnly = habitats.filter(h => buildable(h).includes('Bubbly Basin')).length;
  const timed = habitats.filter(h => h.times.length && h.times.length < 4).length;
  const weathered = habitats.filter(h => h.weather.length && h.weather.length < 3).length;

  const rows = habitats.map(h => ({ html: habitatCard(h, lang) }));
  const body = `${crumb(lang, [[t.nav.habitats]])}
<div class="wrap stack"><h1>${esc(t.nav.habitats)}</h1>
<p class="lede">${lang === 'th'
      ? 'ที่อยู่อาศัยทั้ง 252 แบบ พร้อมของที่ต้องวางและโปเกมอนที่จะย้ายเข้ามา — สร้างให้ครบตามรายการ แล้วโปเกมอนที่ตรงกับที่อยู่นั้นจะออกมาเอง'
      : 'All 252 habitats, with the exact objects each one needs and the Pokémon it releases. Build one correctly and the matching Pokémon moves in.'}</p>
<p class="note">${th
      ? `บางแบบมีเงื่อนไขช่วงเวลาของวันและสภาพอากาศ ถ้าสร้างครบแล้วยังไม่มีใครมา ลองรอฝนหรือรอกลางคืน — มี ${timed} แบบที่จำกัดช่วงเวลา และ ${weathered} แบบที่จำกัดสภาพอากาศ กดแถบกรองเพื่อดูได้เลย`
      : `Some habitats are gated by time of day or weather — if one looks finished but stays empty, wait for rain or nightfall. ${timed} are time-gated and ${weathered} weather-gated; the chips pick them out.`}</p>
<p class="note note-clay">${th
      ? `แถบกรองพื้นที่มาจากถิ่นที่โปเกมอนของแต่ละที่อยู่อาศัยอาศัยอยู่จริง ตามที่ Serebii ระบุไว้ ต้องบอกตรง ๆ ว่ามันกรองได้ไม่มากนัก เพราะที่อยู่อาศัย ${everywhere} จาก ${habitats.length} แบบใช้ได้ทุกพื้นที่ — ที่แยกออกมาชัดคือ ${basinOnly} แบบที่ใช้ได้ในอ่าวน้ำใส และอีกไม่กี่แบบที่ผูกกับพื้นที่เดียว`
      : `The area chips come from where the Pokémon each habitat releases actually live, as Serebii records it. They do not narrow much: ${everywhere} of the ${habitats.length} habitats work in every area. What they do separate out is the ${basinOnly} that work in Bubbly Basin, and the handful tied to one area.`}</p></div>
${listPage({ lang, rows, cats, catLabel })}`;
  return layout({ lang, base: BASE, title: t.nav.habitats, desc: 'All Pokopia habitats', path: '/habitats/', body });
}

const catSlug = c => c.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Category index: one card per category, so no single page carries 1,700 rows. */
function catIndexPage({ lang, kind, all, root, title, lede, ic }) {
  const cats = [...new Set(all.map(x => x.cat))];
  const body = `${crumb(lang, [[title]])}
<div class="wrap stack">
  <h1>${esc(title)}</h1>
  <p class="lede">${esc(lede)}</p>
  <div class="grid g-3">${cats.map(c => `
    <a class="card" href="${BASE}/${lang}${root}${catSlug(c)}/">
      <div style="color:var(--moss);width:22px">${icon(ic)}</div>
      <h3 style="margin:8px 0 2px">${esc(thCat(c, lang))}</h3>
      ${lang === 'th' && thCat(c, lang) !== c ? `<p style="font-size:.78rem;color:var(--muted);margin:0">${esc(c)}</p>` : ''}
      <p style="font-size:.85rem;color:var(--muted);margin:0">${all.filter(x => x.cat === c).length} ${lang === 'th' ? 'รายการ' : 'entries'}</p>
    </a>`).join('')}</div>
</div>`;
  return layout({ lang, base: BASE, title, desc: lede, path: root, body });
}

function itemsCatPage(cat, lang) {
  const t = T[lang];
  const list = items.filter(i => i.cat === cat);
  const rows = list.map(i => ({
    html: dataRow({
      name: i.name, gloss: G(i.name), desc: itemDesc(i, lang), cat: i.tags[0] || '', kind: 'box', pic: itemImage(i), id: `i-${i.id}`, find: itemSearchText(i, lang), lang,
      mats: itemRecipe(i, lang) + itemLikedAs(i, lang),
      meta: i.tags.map(x => `<span class="tag tag-clay">${esc(x)}</span>`).join('') + itemFacts(i, lang) +
        (i.sources.length ? `<span>${esc(i.sources.slice(0, 3).map(x => thSource(x, lang)).join(' · '))}${i.sources.length > 3 ? ' …' : ''}</span>` : ''),
    })
  }));
  const tags = [...new Set(list.flatMap(i => i.tags))].filter(Boolean);
  const body = `${crumb(lang, [[t.nav.items, `${BASE}/${lang}/items/`], [cat]])}
<div class="wrap stack"><h1>${esc(thCat(cat, lang))}</h1>
${lang === 'th' && thCat(cat, lang) !== cat ? `<p class="gloss">${esc(cat)}</p>` : ''}
<p class="lede">${list.length} ${lang === 'th' ? 'รายการ' : 'items'}</p>
${(() => {
      const known = list.filter(i => (i.likedAs || []).length).length;
      return known ? `<p class="note">${lang === 'th'
        ? `แถบ “นับเป็นหมวด” คือหมวดของโปรดที่ไอเทมนั้นนับเป็น ถ้าตรงกับที่โปเกมอนชอบ Comfy Level จะขึ้นเร็วกว่าปกติ พิมพ์ชื่อหมวดในช่องกรองได้เลย เช่น สีสันสดใส หรือ colorful — หมวดนี้ระบุได้แล้ว ${known} จาก ${list.length} รายการ ที่เหลือ Serebii ยังไม่ได้จัดหมวดให้`
        : `“Counts as” is the favourite categories an item belongs to; matching one raises Comfy Level faster. You can filter by them — try “colorful”. ${known} of these ${list.length} items are catalogued; Serebii has not sorted the rest yet.`}</p>` : '';
    })()}</div>
${listPage({ lang, rows, cats: tags })}`;
  return layout({ lang, base: BASE, title: `${cat} — ${t.nav.items}`, desc: `Pokopia ${cat} items`, path: `/items/${catSlug(cat)}/`, body });
}

function recipesCatPage(cat, lang) {
  const t = T[lang];
  const list = recipes.filter(r => r.cat === cat);
  const rows = list.map(r => ({
    html: dataRow({
      name: r.name, gloss: G(r.name), cat: '', kind: 'package', pic: itemPic(r.img), href: itemHref(lang, r.id), lang,
      mats: `<div class="mats">${r.materials.map(m => `<span class="mat">${matPic(m)}${itemLink(lang, m.item, esc(m.name))} <b>×${m.qty}</b></span>`).join('')}</div>`,
      meta: r.sources.length ? `<span>${esc(r.sources.map(x => thSource(x, lang)).join(' · '))}</span>` : '',
    })
  }));
  const body = `${crumb(lang, [[t.nav.recipes, `${BASE}/${lang}/recipes/`], [cat]])}
<div class="wrap stack"><h1>${esc(thCat(cat, lang))}</h1>
${lang === 'th' && thCat(cat, lang) !== cat ? `<p class="gloss">${esc(cat)}</p>` : ''}
<p class="lede">${list.length} ${lang === 'th' ? 'สูตร' : 'recipes'}</p></div>
${listPage({ lang, rows, cats: [] })}`;
  return layout({ lang, base: BASE, title: `${cat} — ${t.nav.recipes}`, desc: `Pokopia ${cat} recipes`, path: `/recipes/${catSlug(cat)}/`, body });
}

function furniturePage(lang) {
  const t = T[lang];
  /* every furniture id is also an item id, so the descriptions the Thai edition already
     carries apply here too rather than falling back to Serebii's English */
  const rows = furniture.map(f => ({
    html: dataCard({
      name: f.name, gloss: G(f.name), desc: itemDesc(itemById.get(f.id) || f, lang),
      cat: f.flags[0] || '', kind: 'home', pic: itemPic(f.img), href: itemHref(lang, f.id), lang,
      find: [...f.flags, ...f.colour, ...f.sources].join(' '),
      meta: f.flags.map(x => `<span class="tag tag-moss">${esc(thCat(x, lang))}</span>`).join('') +
        f.colour.map(x => `<span class="tag">${esc(thCat(x, lang))}</span>`).join(''),
      foot: f.sources.length ? esc(f.sources.slice(0, 4).map(x => thSource(x, lang)).join(' · ')) : '',
    })
  }));
  const cats = [...new Set(furniture.flatMap(f => f.flags))].filter(Boolean);
  const body = `${crumb(lang, [[t.nav.furniture]])}
<div class="wrap stack"><h1>${esc(t.nav.furniture)}</h1>
<p class="lede">${lang === 'th'
      ? 'เฟอร์นิเจอร์ทุกชิ้นที่วางในบ้านได้ ชิ้นที่ติดแท็ก Relaxation หรือ Decoration คือชิ้นที่โปเกมอนมักขอเพื่อเพิ่ม Comfy Level'
      : 'Every placeable furniture piece. Items tagged Relaxation or Decoration are the ones Pokémon ask for to raise their Comfy Level.'}</p></div>
${listPage({ lang, rows, cats, catLabel: c => thCat(c, lang), grid: true })}`;
  return layout({ lang, base: BASE, title: t.nav.furniture, desc: 'Pokopia furniture list', path: '/furniture/', body });
}

/* Ditto's move icons, downloaded alongside the other artwork. Only the ten primary moves
   have one; the five secondary moves are icon-less upstream and fall back to a line icon. */
const MOVE_PICS = picsIn('moves');
const movePic = img => img && MOVE_PICS.has(img) ? `${BASE}/sprites/moves/${encodeURIComponent(img)}` : null;

/** which Pokémon an unlock line names, and where in the escaped string it sits.
    Thai has no word boundaries, so the Thai reading is matched as a plain substring. */
function unlockMon(text, lang) {
  const out = esc(text);
  for (const p of MON_BY_NAME_DESC) {
    const label = esc(lang === 'th' ? (monNames(p).thEn || p.name) : p.name);
    const at = out.indexOf(label);
    if (at < 0) continue;
    // in English insist on a word boundary, so "Wooper" does not match inside another name
    if (lang !== 'th' && /[A-Za-z]/.test(out.charAt(at + label.length))) continue;
    return { mon: p, at, label };
  }
  return null;
}

/** "Befriend Scyther" / "ผูกมิตรกับไซเธอร์" — link whichever Pokémon the line names */
function linkMons(text, lang) {
  const out = esc(text), hit = unlockMon(text, lang);
  return hit
    ? out.slice(0, hit.at) + `<a href="${monUrl(lang, hit.mon)}">${hit.label}</a>` + out.slice(hit.at + hit.label.length)
    : out;
}

function movesPage(lang) {
  const t = T[lang], th = lang === 'th';
  const boostFor = name => moveboosts.find(b => b.move.toLowerCase() === String(name).toLowerCase());
  const groups = [['Primary', th ? 'ท่าหลัก' : 'Primary moves'], ['Secondary', th ? 'ท่ารอง' : 'Secondary moves']];
  const body = `${crumb(lang, [[t.nav.moves]])}
<div class="wrap stack">
  <h1>${esc(t.nav.moves)}</h1>
  <p class="lede">${lang === 'th'
      ? 'ดิตโต้ไม่ต่อสู้ — ท่าทุกท่าในเกมนี้คือเครื่องมือปรับภูมิประเทศที่ยืมมาจากโปเกมอนที่คุณผูกมิตรด้วย เรียนแล้วติดตัวถาวรและสลับใช้ได้ตลอด'
      : 'Ditto never battles. Every move here is a terraforming tool borrowed from a Pokémon you befriended — learned permanently, switchable at any time.'}</p>
  ${groups.map(([grp, label]) => `
  <div class="sec-title"><h2>${esc(label)}</h2><span>${moves.filter(m => m.group === grp).length}</span></div>
  ${grp === 'Secondary' ? `<p class="note">${th
        ? 'ท่ารองไม่มีไอคอนของตัวเองในเกม รูปที่เห็นจึงเป็นสไปรท์ของโปเกมอนที่ยืมท่ามา กดที่รูปเพื่อไปหน้าโปเกมอนตัวนั้นได้'
        : 'The secondary moves have no icon of their own, so each card shows the Pokémon the move is borrowed from instead — click it to open that Pokémon.'}</p>` : ''}
  <div class="grid g-3">${moves.filter(m => m.group === grp).map(m => {
        const boost = boostFor(m.name);
        return `<div class="card move-card" id="${m.id}">
      <div class="move-art">
        ${(() => {
            // the icons are 250px square; they used to be drawn at 52
            if (movePic(m.img)) return `<img src="${movePic(m.img)}" alt="" loading="lazy" width="250" height="250" decoding="async">`;
            // the five secondary moves have no icon upstream (Serebii 404s on them), so
            // stand in the Pokémon the move is borrowed from — which is the same idea.
            // Its artwork rather than its sprite, because this box is now 250px wide.
            const hit = unlockMon(m.unlock, 'en');
            return hit
              ? `<a href="${monUrl(lang, hit.mon)}" title="${esc(monTitle(hit.mon, lang))}"><img src="${art(hit.mon)}" alt="${esc(monTitle(hit.mon, lang))}" loading="lazy" width="250" height="250" decoding="async"></a>`
              : `<div class="move-art-blank">${icon('bolt')}</div>`;
          })()}
      </div>
      <h3 class="move-name">${esc(moveName(m, lang))}</h3>
      <p class="move-effect">${esc(moveEffect(m, lang))}</p>
      <p class="move-unlock">${icon('sparkles')} <span>${linkMons(moveUnlock(m, lang), lang)}</span></p>
      ${boost ? `<div class="move-boost">
        <span class="tag tag-clay">${esc(thCookType(boost.meal, lang))}</span>
        <span>${boost.effects.map(x => esc(thBoost(x, lang))).join(' · ')}</span>
      </div>` : ''}
    </div>`;
      }).join('')}</div>`).join('')}

  <div class="sec-title"><h2>${th ? 'การอัปเกรดท่าด้วยอาหาร' : 'Powering up moves with food'}</h2><span>${moveboosts.length}</span></div>
  <p class="note">${th
      ? 'หลังไปถึง Rocky Ridges และเจอเชฟเดนเต้ คุณจะทำอาหารได้ กินแล้วท่าที่ตรงกันจะแรงขึ้นชั่วคราว โดยใช้มิเตอร์ PP แยกจากของเดิม เลือกได้ว่าจะใช้ท่าปกติหรือท่าที่บัฟไว้'
      : 'Once you reach Rocky Ridges and meet Chef Dente you can cook. Eating a meal powers up its move for a while on a separate PP meter, so the boosted version runs alongside the ordinary one rather than replacing it.'}</p>
  <div class="table-scroll"><table>
    <thead><tr><th>${th ? 'อาหาร' : 'Meal'}</th><th>${th ? 'ท่า' : 'Move'}</th><th>${th ? 'ผลที่ได้' : 'What it adds'}</th></tr></thead>
    <tbody>${moveboosts.map(b => {
        const mv = moves.find(m => m.name.toLowerCase() === b.move.toLowerCase());
        return `<tr>
      <td><a class="tag tag-clay" href="${BASE}/${lang}/cooking/">${esc(thCookType(b.meal, lang))}</a></td>
      <td><div class="cell-item">${mv && movePic(mv.img) ? `<img class="cell-ico" src="${movePic(mv.img)}" alt="" loading="lazy" width="32" height="32" decoding="async">` : ''}<div><strong>${mv ? `<a href="${BASE}/${lang}/moves/#${mv.id}">${esc(moveName(mv, lang))}</a>` : esc(b.move)}</strong></div></div></td>
      <td>${b.effects.map(e => `<div>${esc(thBoost(e, lang))}</div>`).join('')}</td></tr>`;
      }).join('')}</tbody>
  </table></div>
</div>`;
  return layout({ lang, base: BASE, title: t.nav.moves, desc: 'Pokopia move list', path: '/moves/', body });
}

function specialtiesPage(lang) {
  const t = T[lang];
  const byspec = id => pokemon.filter(p => p.specialties.includes(id));
  const body = `${crumb(lang, [[t.nav.specialties]])}
<div class="wrap stack">
  <h1>${esc(t.nav.specialties)}</h1>
  <p class="lede">${lang === 'th'
      ? `ความถนัดคือสิ่งที่โปเกมอนแต่ละตัวทำให้คุณได้ ตั้งแต่ผลิตไฟฟ้า ตัดไม้ ไปจนถึงพาคุณไป Dream Island — มีทั้งหมด ${specialties.length} แบบ กดที่ตัวไหนก็ได้เพื่อเปิดหน้าโปเกมอนตัวนั้น`
      : `A specialty is what a Pokémon does for you — generate power, chop logs, carry you to a Dream Island. There are ${specialties.length} of them; click any Pokémon to open its page.`}</p>
  <div class="grid g-4">${specialties.map(s => {
        const list = byspec(s.id);
        return specCard(s, lang, `<p class="spec-count">${list.length} ${lang === 'th' ? 'ตัว' : 'Pokémon'}</p>
      ${list.length ? `<div class="spec-mons">${list.map(p => `<a class="spec-mon" href="${monUrl(lang, p)}" title="${esc(monTitle(p, lang))}"><img src="${sprite(p)}" alt="${esc(monTitle(p, lang))}" loading="lazy" width="40" height="40"><span>${esc(monTitle(p, lang))}</span></a>`).join('')}</div>` : ''}`);
      }).join('')}</div>
</div>`;
  return layout({ lang, base: BASE, title: t.nav.specialties, desc: 'Pokopia specialties', path: '/specialties/', body });
}

function charactersPage(lang) {
  const t = T[lang];
  const body = `${crumb(lang, [[t.nav.characters]])}
<div class="wrap stack" style="--gap:20px">
  <h1>${esc(t.nav.characters)}</h1>
  <p class="lede">${lang === 'th'
      ? 'Pokopia ไม่มีตัวละครมนุษย์เลย — "นักแสดง" ทั้งหมดคือโปเกมอนร่างพิเศษเจ็ดตัวที่มีความถนัดเฉพาะตัวซึ่งหาจากตัวอื่นไม่ได้ บวกกับตัวคุณเอง'
      : 'Pokopia has no human cast. The story is carried by seven unique Pokémon with specialties no ordinary Pokémon has — plus you.'}</p>
  ${CHARACTERS.map(c => `
  <article class="card cast" id="${c.id}">
    <img class="cast-pic" src="${art({ natdex: c.natdex })}" alt="${esc(L(lang, c.name))}" width="208" height="208" loading="lazy" decoding="async">
    <div>
      <h2>${esc(L(lang, c.name))}</h2>
      <p class="cast-role">${esc(L(lang, c.role))}</p>
      <p class="cast-desc">${esc(L(lang, c.desc))}</p>
    </div>
  </article>`).join('')}
</div>`;
  return layout({ lang, base: BASE, title: t.nav.characters, desc: 'Pokopia characters', path: '/characters/', body });
}

function locationsPage(lang) {
  const t = T[lang];
  const body = `${crumb(lang, [[t.nav.locations]])}
<div class="wrap stack">
  <h1>${esc(t.nav.locations)}</h1>
  <p class="lede">${lang === 'th'
      ? 'ทุกพื้นที่ใน Pokopia คือซากของเมืองในคันโตที่เรารู้จัก — แต่ผ่านไปนานมากจนแทบจำไม่ได้'
      : 'Every area in Pokopia is the ruin of a Kanto city you already know — just a very long time later.'}</p>
  <div class="grid g-4">${LOCATIONS.map(l => `
    <a class="card" href="${BASE}/${lang}/location/${l.id}/">
      <div class="chips" style="margin-bottom:8px"><span class="tag ${l.dlc ? 'tag-clay' : 'tag-moss'}">${l.dlc ? 'Expansion Pass' : '#' + l.order}</span></div>
      <h3>${esc(L(lang, l.name))}</h3>
      <p style="font-size:.85rem;color:var(--muted);margin:4px 0 8px">${esc(L(lang, l.based))}</p>
      <p style="font-size:.88rem;color:var(--ink-2);margin:0">${esc(L(lang, l.desc).slice(0, 130))}…</p>
    </a>`).join('')}</div>
</div>`;
  return layout({ lang, base: BASE, title: t.nav.locations, desc: 'Pokopia locations', path: '/locations/', body });
}

/* A shop unlock is either the item itself or its recipe — "Iron bed Recipe" unlocks the
   recipe for the Iron bed. Either way it points at the same item entry, so drop the
   suffix to resolve it and keep a badge saying which of the two you are getting. */
function unlockChip(text, lang) {
  const th = lang === 'th';
  const recipe = /\s+Recipe$/i.test(text);
  const it = itemRef(text) || itemRef(text.replace(/\s+Recipe$/i, ''));
  const pic = it && itemPic(it.img);
  const inner = `${pic ? `<img src="${pic}" alt="" loading="lazy" width="28" height="28" decoding="async">` : ''}<span>${esc(text.replace(/\s+Recipe$/i, ''))}</span>${recipe ? `<b class="unlock-recipe">${th ? 'สูตร' : 'recipe'}</b>` : ''}`;
  return it
    ? `<a class="fav-item" href="${itemHref(lang, it.id)}" title="${esc(itemDesc(it, lang) || text)}">${inner}</a>`
    : `<span class="fav-item" title="${esc(text)}">${inner}</span>`;
}

/* Serebii's headings for what an area holds, in its own order, with a line saying what the
   group actually is — "Items Found in Area" alone does not tell you they are one-offs. */
const FIND_GROUPS = {
  materials: { th: 'วัสดุที่เกิดใหม่เรื่อย ๆ', en: 'Naturally occurring materials',
    thNote: 'เก็บแล้วขึ้นใหม่ ไม่มีวันหมด', enNote: 'these respawn, so they never run out' },
  blocks: { th: 'พื้นผิว ต้นไม้ และบล็อกในพื้นที่', en: 'Terrain, plants and blocks',
    thNote: 'พื้นดิน หิน หญ้า และต้นไม้ที่ประกอบกันเป็นพื้นที่นี้ ขุดหรือตัดเอาไปใช้ได้', enNote: 'the ground, rock, grass and trees the area is built from — dig or cut them up and take them' },
  lying: { th: 'ไอเทมที่วางอยู่ในพื้นที่', en: 'Items lying around the area',
    thNote: 'วางอยู่กับที่ เก็บได้ครั้งเดียว', enNote: 'placed objects, picked up once' },
  pokeballs: { th: 'ของในโปเกบอลที่ตกอยู่', en: 'What the Poké Balls hold',
    thNote: 'โปเกบอลที่กระจายอยู่ทั่วพื้นที่ เปิดแล้วได้ของพวกนี้', enNote: 'the Poké Balls scattered about the area open on these' },
  treasure: { th: 'สมบัติที่ขุดได้', en: 'Treasure you can dig up',
    thNote: 'ได้จากการขุดตามแผนที่สมบัติ', enNote: 'what a treasure map digs up here' },
  water: { th: 'ของที่ได้จากจุดตกปลา', en: 'From the fishing spots',
    thNote: 'จุดน้ำวิบวับ — ที่อ่าวน้ำใสเรียกว่าน้ำวน', enNote: 'Sparkling Ripples, which Bubbly Basin calls Whirlpools' },
};

function locationPage(l, lang) {
  const t = T[lang], th = lang === 'th';
  const here = locations.find(x => x.id === l.id);
  const unlocks = envlevel.filter(e => e.area.toLowerCase().replace(/\s+/g, '-') === l.id);
  const byLevel = {};
  unlocks.forEach(u => (byLevel[u.level] ||= []).push(u.item));
  const body = `${crumb(lang, [[t.nav.locations, `${BASE}/${lang}/locations/`], [L(lang, l.name)]])}
<div class="wrap stack" style="--gap:18px">
  <div>
    <p class="eyebrow">${l.dlc ? 'Expansion Pass' : (lang === 'th' ? 'พื้นที่ที่ ' : 'Area ') + l.order}</p>
    <h1>${esc(L(lang, l.name))}</h1>
    <p class="lede" style="margin-top:6px">${esc(L(lang, l.based))}</p>
  </div>
  <div class="prose"><p>${esc(L(lang, l.desc))}</p></div>

  ${here && !here.requests.length ? `
  <p class="note note-clay">${th
      ? 'พื้นที่นี้ไม่มี Important Request ที่ Serebii บันทึกไว้ — เป็นช่องว่างของแหล่งข้อมูล ไม่ใช่ว่าเราไม่ได้ใส่'
      : 'Serebii documents no Important Request for this area — that is a gap in the source, not an omission here.'}</p>` : ''}

  ${here && here.requests.length ? `
  <section>
    <div class="sec-title"><h2>${th ? 'เหตุการณ์เนื้อเรื่องของพื้นที่นี้' : 'Story events here'}</h2><span>${here.requests.length}</span></div>
    <div class="rows">${here.requests.map(r => `<div class="row">
      ${rowIcon('star')}
      <div><div class="row-name">${esc(r.name)}</div>
      ${requestParas(r, lang).map(x => `<div class="row-desc">${esc(x)}</div>`).join('')}</div></div>`).join('')}</div>
    <p class="note">${th
      ? 'Important Request คือเควสต์เนื้อเรื่องที่ทำร่วมกับศาสตราจารย์โมจัมโบและโปเกมอนในพื้นที่ ทำสำเร็จแล้ว Environment Level ของพื้นที่และ Trainer Rank จะขึ้น'
      : 'Important Requests are the story quests you work through with Professor Tangrowth and the area’s Pokémon. Finishing one raises the area’s Environment Level and your Trainer Rank.'}</p>
  </section>` : ''}

  ${here && here.exclusive.length ? `
  <section>
    <div class="sec-title"><h2>${th ? 'โปเกมอนที่เจอได้เฉพาะที่นี่' : 'Pokémon you only find here'}</h2><span>${here.exclusive.length}</span></div>
    <div class="mon-tiles">${here.exclusive.map(m => monTile(m.id, m.name, lang)).join('')}</div>
    <p class="note">${th
      ? `โปเกมอนส่วนใหญ่ย้ายเข้ามาได้ทุกพื้นที่ ขอแค่สร้างที่อยู่อาศัยที่มันชอบให้ รายชื่อนี้คือส่วนน้อยที่ผูกกับพื้นที่นี้จริง ๆ ${here.exclusiveFrom === 'serebii' ? 'ตามที่ Serebii ระบุไว้' : 'คำนวณจากถิ่นที่อยู่ของโปเกมอนแต่ละตัวในหน้าที่อยู่อาศัยของ Serebii'}`
      : `Most Pokémon will move into any area once you build the habitat they like. These are the few genuinely tied to this one, ${here.exclusiveFrom === 'serebii' ? 'as Serebii lists them.' : 'worked out from the areas each Pokémon lives in on Serebii’s habitat pages.'}`}</p>
  </section>` : ''}

  ${here && here.finds.length ? `
  <section>
    <div class="sec-title"><h2>${th ? 'ของที่หาได้ในพื้นที่นี้' : 'What you can find here'}</h2><span>${here.finds.reduce((n, f) => n + f.items.length, 0)}</span></div>
    ${here.finds.map(f => {
      const g = FIND_GROUPS[f.key];
      return `<details class="finds"${f.key === 'blocks' ? ' open' : ''}>
      <summary>${esc(g ? (th ? g.th : g.en) : f.heading)} <b>${f.items.length}</b></summary>
      ${g ? `<p class="finds-note">${esc(th ? g.thNote : g.enNote)}</p>` : ''}
      <div class="fav-items">${f.items.map(x => unlockChip(x, lang)).join('')}</div></details>`;
    }).join('')}
  </section>` : ''}

  ${Object.keys(byLevel).length ? `
  <section>
    <div class="sec-title"><h2>${lang === 'th' ? 'ของที่ปลดล็อกตาม Environment Level' : 'Shop unlocks by Environment Level'}</h2><span>${unlocks.length}</span></div>
    <div class="table-scroll"><table>
      <thead><tr><th>${lang === 'th' ? 'เลเวล' : 'Level'}</th><th>${lang === 'th' ? 'ปลดล็อก' : 'Unlocks'}</th></tr></thead>
      <tbody>${Object.keys(byLevel).sort((a, b) => a - b).map(lv => `<tr><td class="num">Lv. ${lv}</td><td><div class="fav-items">${byLevel[lv].map(x => unlockChip(x, lang)).join('')}</div></td></tr>`).join('')}</tbody>
    </table></div>
    <p class="note">${lang === 'th'
      ? 'ยิ่ง Environment Level ของพื้นที่สูงขึ้น ร้านค้าก็จะมีของใหม่ให้ซื้อมากขึ้น ชิ้นที่ติดป้าย “สูตร” คือปลดล็อกสูตรคราฟต์ ไม่ใช่ตัวไอเทม กดที่ชิ้นไหนก็ได้เพื่อเปิดหน้าไอเทมนั้น'
      : 'Raising an area’s Environment Level puts new stock in its shop. An entry marked “recipe” unlocks the crafting recipe rather than the item; click any of them to open its entry.'}</p>
  </section>` : ''}
</div>`;
  return layout({ lang, base: BASE, title: L(lang, l.name), desc: L(lang, l.desc).slice(0, 150), path: `/location/${l.id}/`, body });
}

function guidesPage(lang) {
  const t = T[lang];
  const body = `${crumb(lang, [[t.nav.basics]])}
<div class="wrap stack">
  <h1>${esc(t.nav.basics)}</h1>
  <p class="lede">${lang === 'th'
      ? 'คู่มือระบบต่าง ๆ ของเกม เขียนจากข้อมูลที่ตรวจสอบแล้ว — ไม่ใช่การเดา'
      : 'System-by-system guides, written from verified data rather than guesswork.'}</p>
  <div class="grid g-4">${GUIDES.map(g => `
    <a class="card" href="${BASE}/${lang}/guide/${g.slug}/">
      <div style="color:var(--moss);width:22px">${icon(g.icon)}</div>
      <h3 style="margin:8px 0 4px">${esc(L(lang, g.title))}</h3>
      <p style="font-size:.87rem;color:var(--muted);margin:0">${esc(L(lang, g.summary))}</p>
    </a>`).join('')}</div>
</div>`;
  return layout({ lang, base: BASE, title: t.nav.basics, desc: 'Pokopia guides', path: '/guides/', body });
}

function guidePage(g, lang) {
  const t = T[lang];
  const body = `${crumb(lang, [[t.nav.basics, `${BASE}/${lang}/guides/`], [L(lang, g.title)]])}
<div class="wrap stack" style="--gap:18px">
  <div>
    <div style="color:var(--moss);width:26px">${icon(g.icon)}</div>
    <h1 style="margin-top:8px">${esc(L(lang, g.title))}</h1>
    <p class="lede" style="margin-top:6px">${esc(L(lang, g.summary))}</p>
  </div>
  <div class="prose">
    ${g.blocks.map(bl => `<h2>${esc(L(lang, bl.h))}</h2>${bl.p.map(x => `<p>${esc(L(lang, x))}</p>`).join('')}`).join('')}
  </div>
  <nav class="grid g-2">${GUIDES.filter(x => x.slug !== g.slug).slice(0, 4).map(x => `
    <a class="card" href="${BASE}/${lang}/guide/${x.slug}/"><div style="font-size:.8rem;color:var(--muted)">${esc(t.nav.basics)}</div><div style="font-weight:600">${esc(L(lang, x.title))}</div></a>`).join('')}</nav>
</div>`;
  return layout({ lang, base: BASE, title: L(lang, g.title), desc: L(lang, g.summary), path: `/guide/${g.slug}/`, body });
}

function storyPage(lang) {
  const t = T[lang];
  const body = `${crumb(lang, [[t.nav.story]])}
<div class="wrap stack" style="--gap:18px">
  <h1>${esc(t.nav.story)}</h1>
  <div class="prose">${GAME.story.map(p => `<p>${esc(L(lang, p))}</p>`).join('')}</div>
  <section>
    <div class="sec-title"><h2>${lang === 'th' ? 'ข้อมูลเกม' : 'Game facts'}</h2></div>
    <div class="table-scroll"><table><tbody>
      ${GAME.facts.map(([k, v]) => `<tr><th style="position:static">${esc(L(lang, k))}</th><td>${esc(L(lang, v))}</td></tr>`).join('')}
    </tbody></table></div>
  </section>
  <section>
    <div class="sec-title"><h2>${lang === 'th' ? 'Team Initiation Challenge' : 'Team Initiation Challenge'}</h2><span>${teamchallenge.length}</span></div>
    <div class="table-scroll"><table>
      <thead><tr><th>#</th><th>${lang === 'th' ? 'ต้องใช้' : 'Requirements'}</th><th>${lang === 'th' ? 'รางวัล' : 'Reward'}</th></tr></thead>
      <tbody>${teamchallenge.map(c => `<tr><td class="num">${esc(c.no)}</td><td>${c.requirements.map(esc).join('<br>')}${c.notes ? `<div style="font-size:.8rem;color:var(--muted);margin-top:4px">${esc(c.notes)}</div>` : ''}</td><td>${esc(c.reward)}</td></tr>`).join('')}</tbody>
    </table></div>
  </section>
</div>`;
  return layout({ lang, base: BASE, title: t.nav.story, desc: L(lang, GAME.tagline), path: '/story/', body });
}

const BUILD_PICS = picsIn('builds');
/* the game's own render of the completed building, without the kit badge Serebii stamps
   on its copy; falls back to that badged icon when the Archives has no file */
const buildPic = f => f && BUILD_PICS.has(f) ? `${BASE}/sprites/builds/${encodeURIComponent(f)}` : null;

const KIT_GROUPS_TH = {
  'List of building kits': 'ชุดก่อสร้างทั่วไป', 'Event kits': 'ชุดจากอีเวนต์',
  'Basin kits': 'ชุดของ Bubbly Basin', 'Ocean temple': 'วิหารใต้ทะเล (เนื้อเรื่อง)',
};

/** one helper requirement: "x1 Pokemon with Build or Engineer" as linked specialty chips */
function helperChip(h, lang) {
  const th = lang === 'th';
  const specs = h.specialties.map(n => specialties.find(s => s.name.toLowerCase() === n.toLowerCase())).filter(Boolean);
  const label = specs.length
    ? specs.map(s => `<a href="${BASE}/${lang}/specialties/#${s.id}">${esc(specName(s, lang))}</a>`).join(th ? ' หรือ ' : ' or ')
    : `<span class="gloss">${th ? 'ตัวไหนก็ได้' : 'any Pokémon'}</span>`;
  return `<span class="kit-helper"><b>×${h.count}</b> ${label}</span>`;
}

/* Serebii's own wording for whether you can walk into a finished build. */
const KIT_CONCEPT_TH = { 'Building with Interior': 'เข้าไปข้างในได้', 'Overworld': 'ตั้งอยู่บนพื้นที่', 'Interior': 'พื้นที่ภายใน' };

/** how many Pokemon can live in a finished kit: a real number, "not a home", or a gap */
function kitLive(k, lang) {
  const th = lang === 'th';
  if (k.live === null) return `<span class="kit-live kit-live-gap">${th ? 'ยังไม่มีข้อมูลว่าอยู่ได้กี่ตัว' : 'residency not documented yet'}</span>`;
  if (k.live === 0) return `<span class="kit-live kit-live-no">${th ? 'ไม่ใช่ที่อยู่อาศัย' : 'not somewhere Pokémon live'}</span>`;
  return `<span class="kit-live"><b>${k.live}</b> ${th ? 'ตัว' : 'Pokémon'}</span>`;
}

/** footprint, floors and whether it has an interior — the same little table on Serebii */
function kitShape(k, lang) {
  const th = lang === 'th', out = [];
  if (k.size) out.push(th
    ? `กว้าง ${k.size.width} × ลึก ${k.size.depth} × สูง ${k.size.height}`
    : `${k.size.width} wide × ${k.size.depth} deep × ${k.size.height} tall`);
  if (k.floors) out.push(th ? `${k.floors} ชั้น` : `${k.floors} floor${k.floors === 1 ? '' : 's'}`);
  if (k.concept) out.push(th ? (KIT_CONCEPT_TH[k.concept] || k.concept) : k.concept);
  return out.map(x => `<span>${esc(x)}</span>`).join('');
}

/** a material chip: icon, name, quantity, linked to the item */
function kitMaterial(m, lang) {
  const it = itemRef(m.name), pic = it && itemPic(it.img);
  const inner = `${pic ? `<img src="${pic}" alt="" loading="lazy" width="30" height="30" decoding="async">` : ''}<span>${esc(m.name)}</span>${m.qty ? ` <b>×${m.qty}</b>` : ''}`;
  return it
    ? `<a class="fav-item" href="${itemHref(lang, it.id)}" title="${esc(itemDesc(it, lang) || m.name)}">${inner}</a>`
    : `<span class="fav-item">${inner}</span>`;
}

function buildingPage(lang) {
  const t = T[lang], th = lang === 'th';
  const g = GUIDES.find(x => x.slug === 'building');
  const groups = [...new Set(buildkits.map(k => k.group))];
  const total = k => k.helpers.reduce((n, h) => n + h.count, 0);

  const card = k => `<article class="row kit" id="k-${esc(k.id)}">
    ${buildPic(k.build) || itemPic(k.img)
      ? `<img class="kit-pic" src="${buildPic(k.build) || itemPic(k.img)}" alt="${esc(k.name)}" loading="lazy" width="128" height="128" decoding="async">`
      : rowIcon('hammer')}
    <div>
      <div class="row-name">${itemLink(lang, k.id, esc(k.name))}</div>
      ${th && G(k.name) ? `<div class="row-th gloss">${esc(G(k.name))}</div>` : ''}
      ${k.desc ? `<div class="row-desc">${esc(descOf(k, lang))}</div>` : ''}
      <div class="kit-line">
        <span class="kit-label">${th ? 'อยู่อาศัยได้' : 'Houses'}</span>
        <div class="kit-helpers">${kitLive(k, lang)}</div></div>
      ${kitShape(k, lang) ? `<div class="row-meta kit-shape">${kitShape(k, lang)}</div>` : ''}
      ${k.materials.length ? `<div class="kit-line">
        <span class="kit-label">${th ? 'วัสดุ' : 'Materials'}</span>
        <div class="fav-items">${k.materials.map(m => kitMaterial(m, lang)).join('')}</div></div>` : ''}
      ${k.helpers.length ? `<div class="kit-line">
        <span class="kit-label">${th ? `ผู้ช่วย ${total(k)} ตัว` : `${total(k)} Pokémon`}</span>
        <div class="kit-helpers">${k.helpers.map(h => helperChip(h, lang)).join('')}</div></div>` : ''}
      ${k.time.length ? `<div class="kit-line">
        <span class="kit-label">${th ? 'เวลา' : 'Time'}</span>
        <div class="kit-helpers">${k.time.map(x => `<span class="tag tag-clay">${esc(x)}</span>`).join('')}</div></div>` : ''}
      ${!k.materials.length ? `<div class="row-meta"><span class="gloss">${th ? 'ยังไม่มีข้อมูลวัสดุและผู้ช่วยที่ต้องใช้' : 'materials and helpers not documented yet'}</span></div>` : ''}
    </div></article>`;

  const body = `${crumb(lang, [[t.nav.building]])}
<div class="wrap stack" style="--gap:18px">
  <h1>${esc(t.nav.building)}</h1>
  <div class="prose">${g.blocks.map(bl => `<h2>${esc(L(lang, bl.h))}</h2>${bl.p.map(x => `<p>${esc(L(lang, x))}</p>`).join('')}`).join('')}</div>
  <p class="note">${th
      ? 'ขั้นตอนคือ วางชุดก่อสร้างตรงจุดที่อยากได้ แล้วเก็บวัสดุตามที่ชุดนั้นระบุ จากนั้นพาโปเกมอนที่มีความถนัดตรงเงื่อนไขมาช่วย คุยกับมันให้เดินตามมาที่จุดก่อสร้าง แล้วเวลาจะเริ่มนับ'
      : 'The loop is: put the kit where you want the building, collect the materials it lists, then bring Pokémon whose specialties match. Talk to one, have it follow you to the kit, and ask it to help — the clock starts from there.'}</p>
  <p class="note">${th
      ? 'รูปในแต่ละการ์ดคือภาพสิ่งปลูกสร้างที่เสร็จแล้ว ซึ่งเป็นภาพเรนเดอร์จากตัวเกมเอง ไม่ใช่ไอคอนกล่องชุดก่อสร้าง ทั้งนี้ยังไม่มีแหล่งข้อมูลไหนเผยแพร่ภาพหน้าจอของบ้านแต่ละหลังตอนตั้งอยู่จริงในแมป'
      : 'The picture on each card is the finished building as the game itself renders it, not a picture of the kit box. No source publishes an in-world screenshot of each building standing on your land.'}</p>
  <p class="note">${(() => {
      const homes = buildkits.filter(k => k.live > 0).length;
      const gaps = buildkits.filter(k => k.live === null).length;
      return th
        ? `“อยู่อาศัยได้” คือจำนวนโปเกมอนที่ย้ายเข้ามาอยู่ในสิ่งปลูกสร้างนั้นได้ ชื่อชุดไม่ได้บอกตัวเลขนี้เสมอไป — Poké Ball house kit ที่มีคำว่า house อยู่ในชื่อ อยู่ได้แค่ 1 ตัว ส่วนกระท่อมสีต่าง ๆ อยู่ได้ถึง 4 ตัว จาก ${buildkits.length} ชุด มี ${homes} ชุดที่เป็นที่อยู่อาศัย และอีก ${gaps} ชุด (ของ Bubbly Basin) ที่ Serebii ยังไม่ได้ลงตัวเลข`
        : `“Houses” is how many Pokémon can move into the finished building. The kit’s name is not a reliable guide to it — the Poké Ball <em>house</em> kit holds one, while the coloured huts hold four. ${homes} of the ${buildkits.length} kits are somewhere Pokémon live; ${gaps} of the Bubbly Basin kits have no figure published yet.`;
    })()}</p>
  <p class="note note-clay">${th
      ? 'พาโปเกมอนที่มีความถนัด Engineer (ทิงคมาสเตอร์) มาช่วยจะย่นเวลาลงมาก งานที่ปกติต้องข้ามวันจะเหลือ 1 ชั่วโมง และแต่ละพื้นที่มีโควตาก่อสร้าง 40 แต้ม สิ่งปลูกสร้างหนึ่งหลังกิน 1 หรือ 2 แต้มตามขนาด'
      : 'Bringing a Pokémon with the Engineer specialty (Tinkmaster) cuts the time sharply — a "next day" build becomes an hour. Each area also has a 40-point building budget, and every build spends 1 or 2 points depending on its size.'}</p>
  ${groups.map(grp => {
      const list = buildkits.filter(k => k.group === grp);
      const label = grp ? ((th && KIT_GROUPS_TH[grp]) || grp) : (th ? 'อื่น ๆ' : 'Other');
      return `<section>
    <div class="sec-title"><h2>${esc(label)}</h2><span>${list.length}</span></div>
    <div class="rows">${list.map(card).join('')}</div></section>`;
    }).join('')}
</div>`;
  return layout({
    lang, base: BASE, title: t.nav.building, path: '/building/',
    desc: th ? 'ชุดก่อสร้างทั้ง 56 แบบใน Pokémon Pokopia พร้อมวัสดุที่ต้องใช้ จำนวนโปเกมอนและความถนัดที่ต้องมี และเวลาที่ใช้สร้าง'
      : 'All 56 building kits in Pokémon Pokopia — the materials each needs, how many Pokémon and which specialties, and how long it takes.',
    body,
  });
}

const COOK_TYPES_TH = { Salad: 'สลัด', Soup: 'ซุป', Bread: 'ขนมปัง', Steak: 'สเต๊ก', Smoothie: 'สมูทตี้' };
const thCookType = (ty, lang) => (lang === 'th' && COOK_TYPES_TH[ty]) || ty;

/** an ingredient or a piece of equipment as an icon chip that links to the item */
function itemChip(name, lang, cls = 'fav-item') {
  const it = itemRef(name);
  const pic = it && itemPic(it.img);
  const inner = `${pic ? `<img src="${pic}" alt="" loading="lazy" width="34" height="34" decoding="async">` : ''}<span>${esc(name)}</span>`;
  return it
    ? `<a class="${cls}" href="${itemHref(lang, it.id)}" title="${esc(itemDesc(it, lang) || name)}">${inner}</a>`
    : `<span class="${cls}" title="${esc(name)}">${inner}</span>`;
}
const ingredient = (name, lang) => itemChip(name, lang);
const equipChip = (x, lang) => itemChip(x.name, lang);

/** the helper specialty a dish needs, linking to the specialty list */
const specTag = (id, lang) => {
  if (!id) return `<span style="color:var(--muted)">—</span>`;
  const s = specialties.find(x => x.name.toLowerCase() === String(id).toLowerCase());
  return s
    ? `<a class="tag tag-moss" href="${BASE}/${lang}/specialties/#${s.id}" title="${esc(specDesc(s, lang))}">${esc(specName(s, lang))}</a>`
    : `<span class="tag tag-moss">${esc(id)}</span>`;
};

function cookingPage(lang) {
  const t = T[lang];
  const th = lang === 'th';
  const sec = (title, count, inner) => `<section><div class="sec-title"><h2>${esc(title)}</h2><span>${count}</span></div>${inner}</section>`;
  const g = GUIDES.find(x => x.slug === 'cooking');
  const types = [...new Set(cooking.map(c => c.type))].filter(Boolean);
  const body = `${crumb(lang, [[t.nav.cooking]])}
<div class="wrap stack" style="--gap:18px">
  <h1>${esc(t.nav.cooking)}</h1>
  <div class="prose">${g.blocks.map(bl => `<h2>${esc(L(lang, bl.h))}</h2>${bl.p.map(x => `<p>${esc(L(lang, x))}</p>`).join('')}</h2>`).join('')}</div>
  ${sec(th ? 'อุปกรณ์ที่ต้องใช้' : 'The equipment you need',
      cookware.types.reduce((n, x) => n + x.tools.length, 0) + cookware.heatSources.length, `
  <p class="note">${th
        ? 'อาหารแต่ละแบบใช้อุปกรณ์คนละอย่าง หม้อ กระทะ และเตาอบขนมปังต้องวางบนแหล่งความร้อนก่อนถึงจะใช้ได้ ส่วนเขียงกับเครื่องปั่นใช้ได้เลยไม่ต้องใช้ไฟ'
        : 'Each kind of meal needs its own piece of equipment. Pots, pans and the bread oven have to sit on a heat source; the cutting board and blender work as they are.'}</p>
  <div class="cookware">${cookware.types.map(k => `<div class="cookware-type">
    <div class="like-head"><h3>${esc(thCookType(k.type, lang))}${th ? ` <span class="gloss">${esc(k.type)}</span>` : ''}</h3>
      <span>${k.heat ? (th ? 'ต้องมีความร้อน' : 'needs heat') : (th ? 'ไม่ต้องใช้ไฟ' : 'no fire needed')}</span></div>
    <div class="fav-items">${k.tools.map(x => equipChip(x, lang)).join('')}</div>
  </div>`).join('')}
  <div class="cookware-type">
    <div class="like-head"><h3>${th ? 'แหล่งความร้อน' : 'Heat sources'}</h3>
      <span>${th ? 'วางหม้อหรือกระทะไว้ข้างบน' : 'put the pot or pan on top'}</span></div>
    <div class="fav-items">${cookware.heatSources.map(x => equipChip(x, lang)).join('')}</div>
  </div></div>
  <p class="note note-clay">${th
        ? 'เตาอบขนมปังต่างจากอันอื่น ต้องให้โปเกมอนที่มีความถนัด Burn มาจุดไฟให้ และเมนูอีก 8 อย่างก็ต้องพาโปเกมอนที่มีความถนัดตรงตามที่ระบุในตารางไปช่วยด้วย'
        : 'The bread oven is the odd one out — a Pokémon with the Burn specialty has to light it for you. Eight dishes also need a helper Pokémon with the specialty named in the table.'}</p>`)}

  ${types.map(ty => {
      const list = cooking.filter(c => c.type === ty);
      const kit = cookware.types.find(k => k.type === ty);
      // smoothies power up Surf for a while rather than restoring PP, and Serebii puts
      // that duration in the same column — so label the column from what is actually in it
      const timed = list.every(c => /\d+\s*min/i.test(c.pp));
      return `<section>
    <div class="sec-title"><h2>${esc(thCookType(ty, lang))}${th ? ` <span class="gloss">${esc(ty)}</span>` : ''}</h2><span>${list.length}</span></div>
    ${kit ? `<div class="fav-items" style="margin-bottom:10px">${kit.tools.map(x => equipChip(x, lang)).join('')}${kit.heat
        ? cookware.heatSources.map(x => equipChip(x, lang)).join('') : ''}</div>` : ''}
    <div class="table-scroll"><table>
      <thead><tr><th>${th ? 'เมนู' : 'Dish'}</th><th>${timed ? (th ? 'ระยะเวลา' : 'Duration') : (th ? 'ฟื้น PP' : 'PP healed')}</th><th>${th ? 'วัตถุดิบหลัก' : 'Main'}</th><th>${th ? 'วัตถุดิบเสริม' : 'Secondary'}</th><th>${th ? 'ต้องมีผู้ช่วย' : 'Helper needed'}</th></tr></thead>
      <tbody>${list.map(c => `<tr>
        <td><div class="cell-item">${cellPic(c.img)}<div><strong>${esc(c.name)}</strong>${th && G(c.name) ? `<div class="gloss">${esc(G(c.name))}</div>` : ''}<div style="font-size:.82rem;color:var(--muted)">${esc(descOf(c, lang))}</div></div></div></td>
        <td class="num">${esc(c.pp)}</td>
        <td>${ingredient(c.main, lang)}</td>
        <td>${c.secondary.map(x => ingredient(x, lang)).join('') || '—'}</td>
        <td>${specTag(c.spec, lang)}</td></tr>`).join('')}</tbody>
    </table></div></section>`;
    }).join('')}
  <section>
    <div class="sec-title"><h2>${lang === 'th' ? 'รสชาติของอาหารและเบอร์รี' : 'Food & berry flavours'}</h2><span>${flavors.length}</span></div>
    <div class="table-scroll"><table>
      <thead><tr><th>${lang === 'th' ? 'รส' : 'Flavour'}</th><th>${lang === 'th' ? 'ชื่อ' : 'Name'}</th><th>${lang === 'th' ? 'คำอธิบาย' : 'Description'}</th></tr></thead>
      <tbody>${flavors.map(f => `<tr><td><span class="tag tag-clay">${esc(thFlavor(f.flavor, lang))}</span></td><td>${ingredient(f.name, lang)}</td><td>${esc(descOf(f, lang))}</td></tr>`).join('')}</tbody>
    </table></div>
  </section>
</div>`;
  return layout({ lang, base: BASE, title: t.nav.cooking, desc: 'Pokopia cooking guide', path: '/cooking/', body });
}

/* ---------------- gifts ----------------
   The inverse of the Favourites system: what a Pokémon hands *you*. Serebii names the
   friendship milestones but publishes no gauge values and no rate for the random material
   gifts, so the stage table describes what changes rather than quoting numbers, and the
   frequency column says "undocumented" where that is the honest answer. */
const itemImg = new Map(items.map(i => [i.name.toLowerCase(), i.img]));
const giftPic = name => cellPic(itemImg.get(String(name).toLowerCase()));

/** a Pokémon chip: sprite + name, linking to its page */
/** a Pokemon as a picture tile — for the few places a list is short enough to show large.
    monChip's 34px sprite is right inside a table cell and too small to read on its own. */
function monTile(id, fallbackName, lang) {
  const p = monById.get(id);
  if (!p) return `<span class="mon-tile">${esc(fallbackName)}</span>`;
  return `<a class="mon-tile" href="${monUrl(lang, p)}" title="${esc(monTitle(p, lang))}">
    <img src="${art(p)}" alt="" loading="lazy" width="88" height="88" decoding="async">
    <span>${esc(monTitle(p, lang))}</span></a>`;
}

function monChip(id, fallbackName, lang) {
  const p = monById.get(id);
  if (!p) return `<span>${esc(fallbackName)}</span>`;
  return `<a class="mon-chip" href="${monUrl(lang, p)}"><img src="${sprite(p)}" alt="" loading="lazy" width="34" height="34" decoding="async"><span>${esc(monTitle(p, lang))}</span></a>`;
}

function giftsPage(lang) {
  const t = T[lang];
  const th = lang === 'th';
  const sec = (title, count, inner) => `<section><div class="sec-title"><h2>${esc(title)}</h2><span>${count}</span></div>${inner}</section>`;
  const litter = gifts.filter(g => g.kind === 'litter');
  const emote = gifts.filter(g => g.kind === 'emote');
  const story = gifts.filter(g => g.kind === 'item');

  /* the five milestones Serebii describes, in order. No numbers are quoted because none
     are published — each row says what visibly changes instead. */
  const STAGES = [
    [th ? '1 · เพิ่งรู้จัก' : '1 · Just met',
      th ? 'ย้ายเข้ามาใหม่ ยังอยู่ห่าง ๆ' : 'Newly moved in, still keeps its distance',
      th ? 'ยังไม่ให้อะไร — แต่ถ้ามีความถนัด Litter มันเริ่มทิ้งของแถวบ้านตั้งแต่วันแรก'
        : 'Nothing yet — but if it has the Litter specialty, the drops start from day one',
      th ? 'Litter: ต่อเนื่อง' : 'Litter: continuous'],
    [th ? '2 · เริ่มคุ้นเคย' : '2 · Warming up',
      th ? 'เริ่มชวนเล่นเกม ควิซและ Look This Way' : 'Starts proposing games — quizzes and Look This Way',
      th ? 'ยังไม่ให้ของ แต่การเล่นเกมเป็นวิธีดันค่าที่เร็วที่สุดวิธีหนึ่ง'
        : 'Still no gifts, but the games are one of the fastest ways to push the gauge',
      th ? 'มันเข้ามาชวนเอง' : 'It approaches you'],
    [th ? '3 · สนิทระดับหนึ่ง' : '3 · Friendly',
      th ? 'ดูดีใจเวลาเจอคุณ' : 'Looks pleased to see you',
      th ? 'เริ่มเอาวัสดุที่หามาได้มาให้เองโดยไม่ต้องขอ' : 'Starts handing over materials it has found, unprompted',
      th ? 'ไม่มีข้อมูลความถี่' : 'Rate undocumented'],
    [th ? '4 · สนิทมาก' : '4 · Close',
      th ? 'เลิกเรียก "ดิตโต้" เปลี่ยนมาเรียกชื่อจริงของคุณ' : 'Drops "Ditto" and calls you by your given name',
      th ? 'โปเกมอน 15 ตัวที่มีอิโมตจะให้ในช่วงนี้' : 'The fifteen Pokémon with an emote hand it over around here',
      th ? 'อิโมต: ครั้งเดียว' : 'Emote: once'],
    [th ? '5 · เพื่อนซี้' : '5 · Best Friends',
      th ? 'เดินมาบอกคุณเองว่าเป็นเพื่อนซี้แล้ว' : 'Comes to you and announces it',
      th ? 'เครื่องหมาย Best Friend ในหน้าโปเกเด็กซ์ และนับรวมในเช็กลิสต์ 100%'
        : 'A Best Friend mark on its Pokédex entry, and a tick on the 100% checklist',
      th ? 'ครั้งเดียว' : 'Once'],
  ];

  const body = `${crumb(lang, [[t.nav.gifts]])}
<div class="wrap stack" style="--gap:20px">
  <h1>${esc(t.nav.gifts)}</h1>
  <p class="lede">${th
      ? 'ด้านกลับของระบบของโปรด — ไม่ใช่ของที่เราให้มัน แต่เป็นของที่มันให้เรา ใครให้อะไร ตอนไหน และบ่อยแค่ไหน'
      : 'The other side of the Favourites system — not what you give them, but what they give you: who gives what, at which stage, and how often.'}</p>
  <p class="note">${th
      ? 'เกมแสดงความสนิทเป็นเกจ ไม่ใช่ตัวเลข และไม่มีแหล่งข้อมูลทางการที่ระบุความถี่ของการให้วัสดุแบบสุ่ม หน้านี้จึงลงเฉพาะสิ่งที่ยืนยันได้ และเขียนว่า "ไม่มีข้อมูล" ตรงที่ยังไม่มีใครบันทึกไว้ แทนที่จะเดาตัวเลข'
      : 'The game shows friendship as a gauge, not a number, and no official source gives a rate for the random material gifts. This page lists only what is pinned down, and says "undocumented" where that is the honest answer rather than guessing.'}</p>

  ${sec(th ? 'ห้าระดับความสนิท' : 'The five stages', STAGES.length, `<div class="table-scroll"><table>
    <thead><tr><th>${th ? 'ระดับ' : 'Stage'}</th><th>${th ? 'สิ่งที่เปลี่ยน' : 'What changes'}</th><th>${th ? 'ของที่ได้' : 'What you get'}</th><th>${th ? 'ความถี่' : 'Frequency'}</th></tr></thead>
    <tbody>${STAGES.map(r => `<tr><td><strong>${esc(r[0])}</strong></td><td>${esc(r[1])}</td><td>${esc(r[2])}</td><td>${esc(r[3])}</td></tr>`).join('')}</tbody>
  </table></div>`)}

  ${sec(th ? 'ของที่ทิ้งไว้จากความถนัด Litter' : 'Litter drops', litter.length, `
  <p class="note">${th
      ? 'มาจากความถนัด ไม่ใช่ค่าความสนิท เริ่มตั้งแต่วันที่มันย้ายเข้ามา และทิ้งซ้ำเรื่อย ๆ ใกล้บ้านของมัน เก็บได้ไม่จำกัด'
      : 'Driven by the specialty, not by friendship: it starts the day the Pokémon moves in and repeats near its home indefinitely.'}</p>
  <div class="table-scroll"><table>
    <thead><tr><th>${th ? 'โปเกมอน' : 'Pokémon'}</th><th>${th ? 'ของที่ได้' : 'Drops'}</th><th>${th ? 'ความถี่' : 'Frequency'}</th></tr></thead>
    <tbody>${litter.map(g => `<tr>
      <td>${monChip(g.mon, g.name, lang)}</td>
      <td>${g.gives.map(x => `<div class="cell-item">${giftPic(x)}<div><strong>${itemLink(lang, x, esc(x))}</strong>${th && G(x) ? `<div class="gloss">${esc(G(x))}</div>` : ''}</div></div>`).join('')}</td>
      <td>${th ? 'ซ้ำเรื่อย ๆ ใกล้บ้าน' : 'Repeats, near its home'}</td></tr>`).join('')}</tbody>
  </table></div>`)}

  ${sec(th ? 'อิโมตที่ได้ตอนสนิทมาก' : 'Emote gifts', emote.length, `
  <p class="note">${th
      ? 'ได้ครั้งเดียวต่อหนึ่งตัว เมื่อความสนิทขึ้นถึงระดับสูง อีก 33 อิโมตที่เหลือมาจาก Human Record หรือจากการเชิญโปเกมอนของผู้เล่นอื่นมาเยี่ยม'
      : 'One-off, handed over once friendship is high. The other 33 emotes come from Human Records or from having another player’s Pokémon visit.'}</p>
  <div class="table-scroll"><table>
    <thead><tr><th>${th ? 'โปเกมอน' : 'Pokémon'}</th><th>${th ? 'อิโมต' : 'Emote'}</th><th>${th ? 'ความถี่' : 'Frequency'}</th></tr></thead>
    <tbody>${emote.map(g => `<tr>
      <td>${monChip(g.mon, g.name, lang)}</td>
      <td><strong>${esc(g.gives.join(', '))}</strong></td>
      <td>${th ? 'ครั้งเดียว · ระดับ 4' : 'Once · stage 4'}</td></tr>`).join('')}</tbody>
  </table></div>`)}

  ${story.length ? sec(th ? 'ไอเทมจากตัวละครในเนื้อเรื่อง' : 'Item gifts from story characters', story.length, `<div class="table-scroll"><table>
    <thead><tr><th>${th ? 'ผู้ให้' : 'Giver'}</th><th>${th ? 'ของที่ได้' : 'Gives'}</th><th>${th ? 'ความถี่' : 'Frequency'}</th></tr></thead>
    <tbody>${story.map(g => `<tr>
      <td>${monChip(g.mon, g.name, lang)}</td>
      <td>${g.gives.map(x => `<div class="cell-item">${giftPic(x)}<div><strong>${itemLink(lang, x, esc(x))}</strong></div></div>`).join('')}</td>
      <td>${th ? 'ตามเนื้อเรื่อง' : 'Story-driven'}</td></tr>`).join('')}</tbody>
  </table></div>`) : ''}

  ${sec(th ? 'ความถนัดที่ต้องแลก ไม่ใช่ของขวัญ' : 'Specialties that trade rather than give', EXCHANGES.length, `
  <p class="note">${th
      ? 'สี่อย่างนี้ให้ของกับคุณเหมือนกัน แต่ต้องเอาของไปให้ก่อน จึงนับเป็นการแลก ไม่ใช่ของขวัญ'
      : 'These also hand you things, but you have to put something in first — they are exchanges, not gifts.'}</p>
  <div class="rows">${EXCHANGES.map(([id, en, thai]) => {
        const s = specialties.find(x => x.id === id);
        const mons = pokemon.filter(p => p.specialties.includes(id));
        return dataRow({
          name: s ? specName(s, lang) : id, desc: th ? thai : en, kind: 'package', lang,
          meta: mons.slice(0, 12).map(m => `<a class="tag" href="${monUrl(lang, m)}">${esc(monTitle(m, lang))}</a>`).join('') +
            (mons.length > 12 ? `<span>+${mons.length - 12}</span>` : ''),
        });
      }).join('')}</div>`)}

  <p class="note">${th
      ? 'ข้อมูลจาก Serebii (หน้า Friendship, Favorites, Emotes, Litter Rewards และ Collect Trades) — ดูวิธีดันค่าความสนิทให้เร็วขึ้นได้ที่คู่มือมิตรภาพ'
      : 'Compiled from Serebii’s Friendship, Favorites, Emotes, Litter Rewards and Collect Trades pages — see the friendship guide for how to push the gauge faster.'}</p>
  <nav class="grid g-2">
    <a class="card" href="${BASE}/${lang}/guide/friendship/"><div style="font-size:.8rem;color:var(--muted)">${esc(t.nav.basics)}</div><div style="font-weight:600">${esc(L(lang, GUIDES.find(x => x.slug === 'friendship').title))}</div></a>
    <a class="card" href="${BASE}/${lang}/specialties/"><div style="font-size:.8rem;color:var(--muted)">${esc(t.nav.pokedex)}</div><div style="font-weight:600">${esc(t.nav.specialties)}</div></a>
  </nav>
</div>`;
  return layout({
    lang, base: BASE, title: t.nav.gifts, path: '/gifts/',
    desc: th ? 'ของขวัญที่โปเกมอนให้คุณใน Pokémon Pokopia — ใครให้อะไร ตอนไหน และบ่อยแค่ไหน'
      : 'Every gift Pokémon give you in Pokémon Pokopia — who gives what, at which friendship stage, and how often.',
    body,
  });
}

/* the four specialties that hand you goods in exchange for something */
const EXCHANGES = [
  ['gather-honey', 'Bring it honey and it gives you special furniture in return.', 'เอาน้ำผึ้งไปให้ แล้วมันจะให้เฟอร์นิเจอร์พิเศษกลับมา'],
  ['collect', 'Gimmighoul and Gholdengo turn Rainbow and Silver Feathers — and unwanted appraised Lost Relics — into Gamer, Luxury, Poké Ball, Cute and Antique items, music mats and rare materials such as Strange Strings.', 'กิมมิโกลกับโกลเดนโกเปลี่ยน Rainbow Feather, Silver Feather และ Lost Relic ที่ประเมินแล้วแต่ไม่อยากเก็บ ให้กลายเป็นของหมวด Gamer, Luxury, Poké Ball, Cute, Antique รวมถึงเสื่อดนตรีและวัสดุหายากอย่าง Strange Strings'],
  ['trade', 'Sets up shop at a powered cash register. Items matching the trader’s favourites are worth 50% more on the scale.', 'มาตั้งร้านตรงเครื่องคิดเงินที่ต่อไฟ ของที่ตรงกับของโปรดของพ่อค้าจะมีมูลค่าบนตาชั่งเพิ่มขึ้น 50%'],
  ['rarify', 'Turns Star Pieces into rare Pokémetal.', 'เปลี่ยน Star Piece ให้เป็น Pokémetal หายาก'],
];

const RECORD_PICS = picsIn('records');
const recordPhoto = f => f && RECORD_PICS.has(f) ? `${BASE}/sprites/records/${encodeURIComponent(f)}` : null;

const RECORD_TYPES_TH = {
  Newspaper: 'หนังสือพิมพ์', 'Diary entry': 'ไดอารี', Magazine: 'นิตยสาร',
  Note: 'บันทึกย่อ', Letter: 'จดหมาย', Paper: 'เอกสาร', Photo: 'รูปถ่าย',
};
const RECORD_LOC_TH = {
  'Withered Wasteland': 'Withered Wastelands', 'Bleak Beach': 'Bleak Beach',
  'Rocky Ridges': 'Rocky Ridges', 'Sparkling Skylands': 'Sparkling Skylands',
  'Bubbly Basin': 'Bubbly Basin', 'Dream Island': 'เกาะแห่งความฝัน',
};

/* Human Records are the notes, papers and photographs the evacuated humans left behind —
   the game's story is mostly told through them. Serebii names all 180 but publishes none
   of their text; Bulbapedia writes out 126. The Thai readings are hand-written in
   data/th/records.json, in the game's own light, chatty voice. */
function recordsPage(lang) {
  const t = T[lang], th = lang === 'th';
  const typeLabel = ty => (th && RECORD_TYPES_TH[ty]) || ty || (th ? 'ไม่ทราบชนิด' : 'Unsorted');
  const locLabel = l => (th && RECORD_LOC_TH[l]) || l;
  const types = [...new Set(humanrecords.map(r => r.type))].filter(Boolean).concat([null]);
  const withText = humanrecords.filter(r => r.content).length;
  const withPhoto = humanrecords.filter(r => recordPhoto(r.photo)).length;
  const translated = humanrecords.filter(r => THRECORDS[r.id]).length;

  const card = r => {
    const tr = THRECORDS[r.id];
    const body = th && tr ? tr.content : r.content;
    const shot = recordPhoto(r.photo);
    return `<article class="row rec" id="r-${esc(r.id)}" data-cat="${esc(r.type || 'Unsorted')}" data-s="${esc((r.name + ' ' + (tr ? tr.name + ' ' + tr.content : '') + ' ' + r.content + ' ' + r.location).toLowerCase())}">
    ${rowIcon('book', itemPic(r.img))}
    <div>
      <div class="row-name">${esc(th && tr ? tr.name : r.name)}</div>
      ${th && tr ? `<div class="row-th gloss">${esc(r.name)}</div>` : ''}
      <div class="row-meta">
        <span class="tag tag-moss">${esc(typeLabel(r.type))}</span>
        <span class="tag">${esc(locLabel(r.location))}</span>
        ${r.reward ? `<span class="tag tag-clay">${th ? 'ได้' : 'Reward'}: ${esc(r.reward)}</span>` : ''}
      </div>
      ${shot ? `<figure class="rec-shot">
        <img src="${shot}" alt="${esc((th && tr && tr.alt) || r.photoAlt || r.name)}" loading="lazy" decoding="async">
        ${(th && tr && tr.alt) || r.photoAlt ? `<figcaption>${esc((th && tr && tr.alt) || r.photoAlt)}</figcaption>` : ''}
      </figure>` : ''}
      ${body
        ? `<blockquote class="rec-text">${body.split('\n\n').map(x => `<p>${esc(x)}</p>`).join('')}</blockquote>
           ${th && !tr ? `<p class="rec-note">${'ยังไม่ได้แปลเป็นไทย — ด้านบนเป็นต้นฉบับภาษาอังกฤษ'}</p>` : ''}`
        : `<p class="rec-note">${th ? 'ยังไม่มีใครบันทึกเนื้อหาของชิ้นนี้ไว้' : 'Nobody has written this one down yet'}</p>`}
    </div></article>`;
  };

  const rows = humanrecords.map(r => ({ html: card(r) }));
  const body = `${crumb(lang, [[t.nav.records]])}
<div class="wrap stack"><h1>${esc(t.nav.records)}</h1>
<p class="lede">${th
      ? 'บันทึก หนังสือพิมพ์ ไดอารี และรูปถ่ายที่มนุษย์ทิ้งไว้ก่อนอพยพ เรื่องราวเบื้องหลังของเกมเกือบทั้งหมดถูกเล่าผ่านของพวกนี้'
      : 'The notes, newspapers, diaries and photographs the humans left behind when they evacuated. Almost all of the game’s backstory is told through them.'}</p>
<p class="note">${th
      ? `รวบรวมได้ ${humanrecords.length} ชิ้น มีเนื้อหาครบ ${withText} ชิ้น เป็นรูปถ่ายจริง ${withPhoto} ใบ${translated ? ` และแปลไทยแล้ว ${translated} ชิ้น` : ''} — Serebii ระบุชื่อและจุดที่พบไว้ครบ แต่เว้นช่องเนื้อหาว่างทุกชิ้น เนื้อหาและรูปถ่ายมาจาก Bulbapedia`
      : `${humanrecords.length} records, ${withText} with their text and ${withPhoto} that are photographs. Serebii names them all and says where each is found, but leaves every content field blank; the text and the photographs come from Bulbapedia.`}</p></div>
${listPage({ lang, rows, cats: types.map(x => x || 'Unsorted'), catLabel: c => typeLabel(c === 'Unsorted' ? null : c) })}`;
  return layout({
    lang, base: BASE, title: t.nav.records, path: '/records/',
    desc: th ? `บันทึกของมนุษย์ทั้ง ${humanrecords.length} ชิ้นใน Pokémon Pokopia พร้อมจุดที่พบและเนื้อหา`
      : `All ${humanrecords.length} Human Records in Pokémon Pokopia, with where each is found and what it says.`,
    body,
  });
}

/* Toys are the items the game tags as playthings. A Pokémon likes five of the 43
   favourite categories and a toy usually belongs to four, so most toys please a large
   share of the dex — 163 Pokémon on average. The categories are what actually decides it,
   so those lead; the Pokémon are a sample with the real total stated beside it. */
const TOY_SAMPLE = 12;
const toyUrl = (lang, toy) => `${BASE}/${lang}/toys/${toy.id}/`;

/* A toy's own page carries the full list of Pokémon that like it. It cannot go on the
   index: 22,880 Pokémon-likes-toy pairs rendered as chips would be a 4.2 MB page. */
function toyPage(toy, lang) {
  const t = T[lang], th = lang === 'th';
  const liked = toy.likedBy.map(id => monById.get(id)).filter(Boolean);
  const body = `${crumb(lang, [[t.nav.toys, `${BASE}/${lang}/toys/`], [toy.name]])}
<div class="wrap stack" style="--gap:18px">
  <div class="row toy" style="border:0;background:none;padding:0">
    ${itemPic(toy.img) ? `<img class="toy-pic" src="${itemPic(toy.img)}" alt="${esc(toy.name)}" width="72" height="72">` : rowIcon('sparkles')}
    <div>
      <h1 style="font-size:1.35rem">${esc(toy.name)}</h1>
      ${th && G(toy.name) ? `<div class="row-th gloss">${esc(G(toy.name))}</div>` : ''}
      ${toy.desc ? `<p class="row-desc">${esc(descOf(toy, lang))}</p>` : ''}
    </div>
  </div>
  <div class="env">
    <div class="kit-line"><span class="kit-label">${th ? 'ได้มาจาก' : 'How to get'}</span>
      <div class="kit-helpers">${toy.sources.map(x => `<span class="tag">${esc(thSource(x, lang))}</span>`).join('')}</div></div>
    <div class="kit-line"><span class="kit-label">${th ? 'นับเป็นหมวด' : 'Counts as'}</span>
      <div class="kit-helpers">${toy.categories.map(c => `<span class="tag tag-clay">${esc(thFav(c, lang))}</span>`).join('')}</div></div>
    <div class="kit-line"><span class="kit-label">${th ? 'ไอเทม' : 'Item'}</span>
      <div class="kit-helpers">${itemLink(lang, toy.id, `<span class="tag tag-moss">${th ? 'เปิดหน้าไอเทม' : 'Open the item entry'}</span>`)}</div></div>
  </div>
  <section><div class="sec-title"><h2>${th ? 'โปเกมอนที่ชอบของชิ้นนี้' : 'Pokémon that like it'}</h2><span>${liked.length}</span></div>
  <p class="note">${th
      ? `ทุกตัวในรายการนี้มีหมวดของโปรดอย่างน้อยหนึ่งหมวดตรงกับ ${toy.categories.map(c => thFav(c, lang)).join(' / ')} วางของชิ้นนี้ในบ้านหรือที่อยู่อาศัยของมัน แล้ว Comfy Level กับค่าความเป็นเพื่อนจะขึ้นเร็วกว่าปกติ`
      : `Every Pokémon here has at least one favourite category matching ${toy.categories.join(' / ')}. Put this in its home or habitat and Comfy Level and friendship rise faster.`}</p>
  <div class="spec-mons" style="max-height:none">${liked.map(m => `<a class="spec-mon" href="${monUrl(lang, m)}" title="${esc(monTitle(m, lang))}"><img src="${sprite(m)}" alt="" loading="lazy" width="40" height="40"><span>${esc(monTitle(m, lang))}</span></a>`).join('')}</div>
  </section>
  <nav class="grid g-2">
    <a class="card" href="${BASE}/${lang}/toys/"><div style="font-size:.8rem;color:var(--muted)">${esc(t.nav.toys)}</div><div style="font-weight:600">${th ? 'กลับไปรายการของเล่น' : 'Back to all toys'}</div></a>
  </nav>
</div>`;
  return layout({
    lang, base: BASE, title: toy.name, path: `/toys/${toy.id}/`,
    desc: th ? `${toy.name} ใน Pokémon Pokopia — ได้มาจากไหน นับเป็นหมวดอะไร และโปเกมอน ${liked.length} ตัวที่ชอบ`
      : `${toy.name} in Pokémon Pokopia — where to get it, the favourite categories it counts as, and the ${liked.length} Pokémon that like it.`,
    body,
  });
}

function toysPage(lang) {
  const t = T[lang], th = lang === 'th';
  /* Filter by the item's own category and by any favourite category it counts as. Both
     go in data-cat, which the filter reads as a space-separated set, so the values are
     slugged and prefixed to keep the two kinds apart. */
  const itemCats = [...new Set(toys.map(x => x.cat))];
  const favCats = [...new Set(toys.flatMap(x => x.categories))].sort();
  const cats = [...itemCats.map(c => `cat-${itemSlug(c)}`), ...favCats.map(c => `fav-${itemSlug(c)}`)];
  const catLabel = v => v.startsWith('cat-')
    ? thCat(itemCats.find(c => `cat-${itemSlug(c)}` === v) || v, lang)
    : thFav(favCats.find(c => `fav-${itemSlug(c)}` === v) || v, lang);

  const rows = toys.map(toy => {
    const liked = toy.likedBy.map(id => monById.get(id)).filter(Boolean);
    const shown = liked.slice(0, TOY_SAMPLE);
    const keys = [`cat-${itemSlug(toy.cat)}`, ...toy.categories.map(c => `fav-${itemSlug(c)}`)].join(' ');
    return {
      html: `<article class="row toy" id="t-${esc(toy.id)}" data-cat="${esc(keys)}" data-s="${esc((toy.name + ' ' + G(toy.name) + ' ' + toy.desc + ' ' + toy.categories.join(' ') + ' ' + toy.categories.map(c => thFav(c, 'th')).join(' ') + ' ' + toy.sources.join(' ')).toLowerCase())}">
    ${itemPic(toy.img)
        ? `<a href="${itemHref(lang, toy.id) || '#'}"><img class="toy-pic" src="${itemPic(toy.img)}" alt="${esc(toy.name)}" loading="lazy" width="72" height="72" decoding="async"></a>`
        : rowIcon('sparkles')}
    <div>
      <div class="row-name">${itemLink(lang, toy.id, esc(toy.name))}</div>
      ${th && G(toy.name) ? `<div class="row-th gloss">${esc(G(toy.name))}</div>` : ''}
      ${toy.desc ? `<div class="row-desc">${esc(descOf(toy, lang))}</div>` : ''}
      <div class="kit-line"><span class="kit-label">${th ? 'ได้มาจาก' : 'How to get'}</span>
        <div class="kit-helpers">${toy.sources.map(x => `<span class="tag">${esc(thSource(x, lang))}</span>`).join('')}</div></div>
      ${toy.categories.length ? `<div class="kit-line"><span class="kit-label">${th ? 'นับเป็นหมวด' : 'Counts as'}</span>
        <div class="kit-helpers">${toy.categories.map(c => `<span class="tag tag-clay">${esc(thFav(c, lang))}</span>`).join('')}</div></div>` : ''}
      ${liked.length ? `<div class="kit-line"><span class="kit-label">${th ? `โปเกมอนที่ชอบ ${liked.length} ตัว` : `${liked.length} like it`}</span>
        <div class="toy-mons">${shown.map(m => monChip(m.id, m.name, lang)).join('')}${liked.length > shown.length
          ? `<a class="fav-item fav-more" href="${toyUrl(lang, toy)}">${th ? `ดูทั้งหมด ${liked.length} ตัว →` : `see all ${liked.length} →`}</a>` : ''}</div></div>` : ''}
    </div></article>`,
    };
  });

  const body = `${crumb(lang, [[t.nav.toys]])}
<div class="wrap stack"><h1>${esc(t.nav.toys)}</h1>
<p class="lede">${th
      ? `ของเล่นทั้ง ${toys.length} ชิ้นที่เกมติดป้ายว่า Toy พร้อมรูปจริง วิธีได้มา และหมวดของโปรดที่มันนับเป็น`
      : `All ${toys.length} items the game tags as toys, with a picture, where each comes from, and the favourite categories it counts as.`}</p>
<p class="note">${th
      ? 'วางของเล่นไว้ในบ้านหรือที่อยู่อาศัยของโปเกมอน ถ้าตรงกับหมวดของโปรดของมัน Comfy Level กับค่าความเป็นเพื่อนจะขึ้นเร็วกว่าปกติมาก'
      : 'Put a toy in a Pokémon’s home or habitat: if it matches one of that Pokémon’s favourite categories, Comfy Level and friendship rise much faster.'}</p>
<p class="note note-clay">${th
      ? 'โปเกมอนหนึ่งตัวชอบ 5 หมวดจากทั้งหมด 43 หมวด ส่วนของเล่นชิ้นหนึ่งมักอยู่ใน 4 หมวด ของเล่นแต่ละชิ้นจึงถูกใจโปเกมอนเฉลี่ยถึง 163 ตัว ตรงนี้แสดงตัวอย่าง 12 ตัวแรก กด “ดูทั้งหมด” เพื่อเปิดหน้าของเล่นชิ้นนั้นที่ลิสต์ครบทุกตัว'
      : 'A Pokémon likes 5 of the 43 categories and a toy usually sits in 4, so the average toy pleases 163 Pokémon. Twelve are shown here; “see all” opens that toy’s own page, which lists every one.'}</p></div>
${listPage({ lang, rows, cats, catLabel })}`;
  return layout({
    lang, base: BASE, title: t.nav.toys, path: '/toys/',
    desc: th ? `ของเล่นทั้ง ${toys.length} ชิ้นใน Pokémon Pokopia พร้อมรูป วิธีได้มา และโปเกมอนที่ชอบ`
      : `All ${toys.length} toys in Pokémon Pokopia, with pictures, where to get them and which Pokémon like them.`,
    body,
  });
}

/* ---------------- outfits ----------------
   Ditto has no shop to buy clothes from: it learns a look by reading a magazine, and the
   Location column is where that magazine is. Most of them are lying around a Dream Island,
   which is why the two pages point at each other. */
const OUTFIT_CATS_TH = {
  Outfit: 'ชุดเต็มตัว', Hair: 'ทรงผม', Tops: 'เสื้อ', Pants: 'กางเกง',
  Hat: 'หมวก', Bags: 'กระเป๋า', Shoes: 'รองเท้า',
};
const OUTFIT_PICS = picsIn('outfits');
const outfitPic = img => img && OUTFIT_PICS.has(img) ? `${BASE}/sprites/outfits/${encodeURIComponent(img)}` : null;

/** where the magazine is: a plain label, but Dream Island entries link to that page */
function outfitSource(src, lang) {
  const dream = /^Dream Island/i.test(src);
  const dlc = /Expansion Pass/i.test(src);
  const cls = dlc ? 'tag tag-clay' : dream ? 'tag tag-moss' : 'tag';
  return dream
    ? `<a class="${cls}" href="${BASE}/${lang}/dream-islands/">${esc(src)}</a>`
    : `<span class="${cls}">${esc(src)}</span>`;
}

function outfitsPage(lang) {
  const t = T[lang], th = lang === 'th';
  const cats = [...new Set(outfits.map(o => o.cat))];
  const label = c => (th && OUTFIT_CATS_TH[c]) || c;
  const fromDream = outfits.filter(o => o.sources.some(s => /^Dream Island/i.test(s))).length;
  const rows = outfits.map(o => ({
    html: `<div class="row outfit" data-cat="${esc(o.cat)}" data-s="${esc((o.name + ' ' + label(o.cat) + ' ' + o.sources.join(' ')).toLowerCase())}">
      ${outfitPic(o.img)
        ? `<img class="outfit-pic" src="${outfitPic(o.img)}" alt="${esc(o.name)}" loading="lazy" width="96" height="96" decoding="async">`
        : rowIcon('sparkles')}
      <div>
        <div class="row-name">${esc(o.name)}</div>
        <div class="row-th gloss">${esc(label(o.cat))}${th ? ` · ${esc(o.cat)}` : ''}</div>
        ${o.style ? `<div class="row-desc">${esc(o.style)}</div>` : ''}
        <div class="row-meta">${o.sources.map(s => outfitSource(s, lang)).join('')}</div>
      </div></div>`,
  }));

  const body = `${crumb(lang, [[t.nav.outfits]])}
<div class="wrap stack"><h1>${esc(t.nav.outfits)}</h1>
<p class="lede">${th
      ? `เสื้อผ้า ทรงผม หมวก กระเป๋า และรองเท้าทั้ง ${outfits.length} แบบที่ดิตโต้เปลี่ยนได้ พร้อมรูปและที่มาของแต่ละแบบ`
      : `All ${outfits.length} looks Ditto can take — clothes, hair, hats, bags and shoes — each with a picture and where it comes from.`}</p>
<p class="note">${th
      ? 'คันโตหลังภัยพิบัติไม่มีร้านขายเสื้อผ้าให้ซื้อ ดิตโต้จึงเรียนรู้ลุคใหม่จากการอ่านนิตยสารที่พูดถึงเทรนเนอร์จากทั่วโลก ช่องที่บอกที่มาคือจุดที่นิตยสารเล่มนั้นอยู่ เปลี่ยนลุคได้ทุกเมื่อที่กระจกบานใหญ่ ไม่ว่าจะวางไว้ตรงไหน'
      : 'Post-disaster Kanto has no clothes shop. Ditto learns a new look by reading a magazine about trainers from around the world, so the source is where that magazine is lying. You can change at any large mirror, wherever you have put it.'}</p>
<p class="note note-clay">${th
      ? `${fromDream} จาก ${outfits.length} แบบมาจากนิตยสารที่พบระหว่างไปเกาะแห่งความฝัน ซึ่งสุ่มทุกครั้ง ถ้ายังขาดอยู่ก็ต้องไปเรื่อย ๆ วันละครั้ง`
      : `${fromDream} of the ${outfits.length} come from magazines found on Dream Island trips, which are randomised — if one is still missing, it is a matter of going back, once a day.`}</p></div>
${listPage({ lang, rows, cats, catLabel: label })}`;
  return layout({
    lang, base: BASE, title: t.nav.outfits, path: '/outfits/',
    desc: th ? `เครื่องแต่งกายทั้ง ${outfits.length} แบบใน Pokémon Pokopia พร้อมรูปและวิธีได้มา`
      : `All ${outfits.length} outfits, hairstyles and accessories in Pokémon Pokopia, with pictures and how to unlock each one.`,
    body,
  });
}

/* ---------------- dream islands ----------------
   A Dream Island is generated fresh for each trip and reset at the end of the day, so
   there is no map to draw and no fixed layout to list — what is knowable is which doll
   stocks the island with what, which is exactly what the item sources record. */
function dreamIslandsPage(lang) {
  const t = T[lang], th = lang === 'th';
  const sec = (title, count, inner) => `<section><div class="sec-title"><h2>${esc(title)}</h2>${count == null ? '' : `<span>${count}</span>`}</div>${inner}</section>`;
  const monByName2 = new Map(pokemon.map(p => [p.name.toLowerCase(), p]));
  const legendChip = name => {
    const p = monByName2.get(String(name).toLowerCase());
    return p ? monChip(p.id, name, lang) : esc(name);
  };
  const itemGrid = (list, label) => list.length ? `<details class="island-finds">
    <summary>${esc(label)} <b>${list.length}</b></summary>
    <div class="fav-items">${list.map(x => itemChip(x.name, lang)).join('')}</div></details>` : '';

  const body = `${crumb(lang, [[t.nav.dreamIslands]])}
<div class="wrap stack" style="--gap:20px">
  <h1>${esc(t.nav.dreamIslands)}</h1>
  <p class="lede">${th
      ? 'เกาะส่วนตัวที่ไปได้วันละครั้ง เต็มไปด้วยแร่และของหายาก ตุ๊กตาที่คุณวางก่อนออกเดินทางเป็นตัวกำหนดว่าเกาะจะมีอะไร'
      : 'A private island you can visit once a day, stocked with ore and rare finds. The doll you set down before you leave decides what is on it.'}</p>

  ${sec(th ? 'ไปยังไง' : 'How to get there', null, `<div class="prose">
    <p>${th
        ? 'ผูกมิตรกับดริฟลูนก่อน ความถนัด Dream Island ของมันคือประตูไปเกาะ จากนั้นวางตุ๊กตาลงพื้นแล้วกดตรวจดู ดริฟลูนจะลอยมาพาคุณไป'
        : 'Befriend Drifloon first — its Dream Island specialty is the way there. Then set a doll down and inspect it, and Drifloon floats over to whisk you away.'}</p>
    <p>${th
        ? 'ไปได้วันละครั้ง และเกาะจะรีเซ็ตเมื่อจบวัน ของที่ทิ้งไว้บนเกาะจะหายไปเลย เก็บให้หมดก่อนกลับ'
        : 'One trip per day, and the island resets when the day ends — anything you leave behind is gone for good, so clear it out before you go.'}</p></div>`)}

  ${sec(th ? 'ตุ๊กตาแต่ละตัวพาไปเกาะแบบไหน' : 'What each doll stocks the island with', dreamislands.length, `
  <p class="note">${th
      ? 'สามอย่างแรกคือของที่ Serebii ระบุว่าเกาะนั้นเน้นเป็นพิเศษ ส่วนรายการเต็มด้านล่างมาจากแหล่งที่มาของไอเทมแต่ละชิ้น ซึ่งบอกว่าไอเทมนั้นเจอบนเกาะไหน — "ของที่ขึ้นเอง" คือของที่งอกอยู่บนเกาะ ส่วน "ของประจำเกาะ" คือเฟอร์นิเจอร์และของสะสมที่เจอได้เฉพาะเกาะนั้น'
      : 'The first three are the finds Serebii lists as that island’s focus. The longer lists come from the item sources, which record the island each item spawns on — “grows there” for the natural resources, “exclusive finds” for the furniture and collectibles you only get on that island.'}</p>
  <div class="islands">${dreamislands.map(d => `<article class="island">
    <div class="island-head">
      ${itemPic(d.img) ? `<img class="island-doll" src="${itemPic(d.img)}" alt="" loading="lazy" width="56" height="56" decoding="async">` : ''}
      <div>
        <h3>${esc(d.doll)}${th && G(d.doll) ? ` <span class="gloss">${esc(G(d.doll))}</span>` : ''}</h3>
        ${d.random
      ? `<p class="island-sub">${th ? 'สุ่มทั้งหมด ไม่เน้นของชนิดไหนเป็นพิเศษ' : 'Entirely random — no particular focus'}</p>`
      : `<p class="island-sub">${d.natural.length + d.original.length} ${th ? 'อย่างที่เจอได้' : 'things to find'}${d.legendary ? ` · ${th ? 'ลุ้นเจอ' : 'chance of'} ${legendChip(d.legendary)}` : ''}</p>`}
      </div>
    </div>
    ${d.focus.length ? `<div class="fav-items">${d.focus.map(f => ingredient(f.name, lang)).join('')}</div>` : ''}
    ${itemGrid(d.original, th ? 'ของประจำเกาะ' : 'Exclusive finds')}
    ${itemGrid(d.natural, th ? 'ของที่ขึ้นเอง' : 'Grows there')}
  </article>`).join('')}</div>`)}

  ${sec(th ? 'โปเกมอนบนเกาะ' : 'Pokémon on the island', null, `
  <p class="note note-clay">${th
      ? 'เกาะแห่งความฝันไม่มีโปเกมอนป่าอยู่เลย — Serebii ระบุไว้ชัดเจน สิ่งเดียวที่เจอได้คือโปเกมอนในตำนาน ซึ่งเป็นโอกาสสุ่ม ไม่ใช่การการันตี'
      : 'Dream Islands have no wild Pokémon on them at all — Serebii says so plainly. The one exception is a Legendary, and that is a chance, not a guarantee.'}</p>
  <div class="table-scroll"><table>
    <thead><tr><th>${th ? 'ตุ๊กตาที่ใช้' : 'Doll'}</th><th>${th ? 'โปเกมอนที่มีโอกาสเจอ' : 'Legendary it favours'}</th><th>${th ? 'วิธีเจอ' : 'How it works'}</th></tr></thead>
    <tbody>${dreamislands.filter(d => d.legendary).map(d => `<tr>
      <td>${itemChip(d.doll, lang)}</td><td>${legendChip(d.legendary)}</td>
      <td>${th ? 'วางตุ๊กตานี้ก่อนออกเดินทางเพื่อเพิ่มโอกาส คุยกับมันบนเกาะแล้วพากลับมาสร้างบ้านให้ได้' : 'Set this doll down before you leave to bias the roll; talk to it on the island and you can bring it home.'}</td></tr>`).join('')}</tbody>
  </table></div>
  <p class="note">${th
      ? 'มิวไม่ได้มาจากเกาะแบบนี้ ต้องเก็บ Mysterious Slate ให้ครบ 27 ชิ้น ซึ่งพบสุ่มตามพื้นที่เป็นประกาย แล้วเอาไปวางให้ตรงช่องที่ซากปรักหักพังใกล้ Pokémon Center ใน Withered Wastelands ให้เป็นรูปมิว'
      : 'Mew does not come from these islands. Collect all 27 Mysterious Slates — they appear at random in shiny patches of ground — then lay them on the matching tiles at the ruins near the Pokémon Center in the Withered Wastelands to form a picture of Mew.'}</p>`)}

  ${sec(th ? 'ของหายากและเรื่องเล่าบนเกาะ' : 'Rare finds and the lore on them', null, `<div class="prose">
    <p>${th
        ? 'นอกจากแร่และวัสดุ แต่ละเกาะยังมีสมุดบันทึกของผู้คนที่เล่าเรื่องเบื้องหลังของเกม ชุดแต่งตัวที่อ้างอิงตัวละครจากภาคหลักอย่าง Blue, Green และ Ethan รวมถึงของหายากอย่าง Pokémetal Ingot'
        : 'Beyond the ore and materials, each island hides notebooks that fill in the game’s background lore, outfits based on main-series characters such as Blue, Green and Ethan, and rare items like Pokémetal Ingots.'}</p>
    <p>${th
        ? 'ทุกทริปยังให้คำใบ้เกี่ยวกับที่อยู่อาศัยที่คุณยังไม่เคยค้นพบด้วย'
        : 'Every trip also hands you tips towards habitats you have not discovered yet.'}</p></div>`)}

  ${sec(th ? 'ทำไมไม่มีแผนที่เกาะ' : 'Why there is no island map', null, `
  <p class="note note-clay">${th
      ? 'เกาะถูกสุ่มสร้างใหม่ทุกครั้งที่ไป และรีเซ็ตทิ้งเมื่อจบวัน หน้าตาภูมิประเทศจึงไม่เหมือนกันสองครั้ง ไม่มีแหล่งข้อมูลไหนเผยแพร่ผังเกาะ เพราะไม่มีผังที่ตายตัวให้เผยแพร่ สิ่งที่คาดเดาได้คือ "ของที่เจอ" ซึ่งขึ้นกับตุ๊กตา ไม่ใช่ "เจอตรงไหน"'
      : 'The island is generated fresh for every trip and thrown away at the end of the day, so no two look alike. No source publishes a layout because there is no fixed layout to publish — what is predictable is what you find, which the doll decides, not where you find it.'}</p>`)}

  <nav class="grid g-2">
    <a class="card" href="${BASE}/${lang}/guide/legendary/"><div style="font-size:.8rem;color:var(--muted)">${esc(t.nav.basics)}</div><div style="font-weight:600">${esc(L(lang, GUIDES.find(x => x.slug === 'legendary').title))}</div></a>
    <a class="card" href="${BASE}/${lang}/collections/"><div style="font-size:.8rem;color:var(--muted)">${esc(t.nav.collections)}</div><div style="font-weight:600">${esc(t.nav.collections)}</div></a>
  </nav>
</div>`;
  return layout({
    lang, base: BASE, title: t.nav.dreamIslands, path: '/dream-islands/',
    desc: th ? 'เกาะแห่งความฝันใน Pokémon Pokopia — ตุ๊กตาแต่ละตัวพาไปเกาะแบบไหน เจออะไรได้บ้าง และโปเกมอนในตำนานเจอยังไง'
      : 'Dream Islands in Pokémon Pokopia — what each doll stocks the island with, everything you can find, and how the Legendaries turn up.',
    body,
  });
}

function collectionsPage(lang) {
  const t = T[lang];
  const sec = (title, count, inner) => `<section><div class="sec-title"><h2>${esc(title)}</h2><span>${count}</span></div>${inner}</section>`;
  const body = `${crumb(lang, [[t.nav.collections]])}
<div class="wrap stack" style="--gap:20px">
  <h1>${esc(t.nav.collections)}</h1>
  <p class="lede">${lang === 'th'
      ? 'ของสะสมทุกหมวดที่ซ่อนอยู่ในบล็อกเรืองแสง กองซาก และชั้นวางทั่วภูมิภาค'
      : 'Everything hidden in glowing blocks, rubble and racks across the region.'}</p>

  ${sec(lang === 'th' ? 'ซีดีเพลง' : 'Music CDs', cds.length, `<div class="table-scroll"><table>
    <thead><tr><th>${lang === 'th' ? 'ชื่อ' : 'Track'}</th><th>${lang === 'th' ? 'จากเกม' : 'From'}</th><th>${lang === 'th' ? 'พบที่' : 'Found in'}</th></tr></thead>
    <tbody>${cds.map(c => `<tr><td><div class="cell-item">${cellPic(c.img)}<div><strong>${esc(c.name)}</strong><div style="font-size:.8rem;color:var(--muted)">${esc(descOf(c, lang))}</div></div></div></td><td>${esc(c.game)}</td><td>${c.sources.map(x => esc(thSource(x, lang))).join('<br>')}</td></tr>`).join('')}</tbody></table></div>`)}

  ${sec('Lost Relics', lostrelics.length, `<div class="rows">${lostrelics.map(r => dataRow({
        name: r.name, gloss: G(r.name), desc: descOf(r, lang), kind: 'star', pic: itemPic(r.img), lang, cat: r.kind,
        meta: `<span class="tag tag-clay">${esc(r.kind)}</span>`
      })).join('')}</div>`)}

  ${sec(lang === 'th' ? 'บันทึกของมนุษย์' : 'Human Records', humanrecords.length, `
  <p class="note"><a href="${BASE}/${lang}/records/" style="text-decoration:underline">${lang === 'th' ? 'อ่านเนื้อหาของแต่ละชิ้นได้ที่หน้าบันทึกของมนุษย์' : 'Read what each one says on the Human Records page'}</a></p>
  <div class="table-scroll"><table>
    <thead><tr><th>${lang === 'th' ? 'ชื่อ' : 'Record'}</th><th>${lang === 'th' ? 'พบที่' : 'Location'}</th><th>${lang === 'th' ? 'รางวัล' : 'Reward'}</th></tr></thead>
    <tbody>${humanrecords.map(h => `<tr><td>${esc(h.name)}</td><td>${esc(h.location)}</td><td>${esc(h.reward) || '—'}</td></tr>`).join('')}</tbody></table></div>`)}

  ${sec('Highlight Reel', highlightreel.length, `<div class="table-scroll"><table>
    <thead><tr><th>${lang === 'th' ? 'ภาพ' : 'Shot'}</th><th>${lang === 'th' ? 'โปเกมอน' : 'Pokémon'}</th><th>${lang === 'th' ? 'ไอเทม' : 'Items'}</th><th>${lang === 'th' ? 'เวลา' : 'Time'}</th><th>${lang === 'th' ? 'รางวัล' : 'Reward'}</th></tr></thead>
    <tbody>${highlightreel.map(h => `<tr><td>${esc(h.name)}</td><td>${esc(h.pokemon) || '—'}</td><td>${h.items.map(esc).join('<br>') || '—'}</td><td>${esc(h.time) || '—'}</td><td>${esc(h.reward) || '—'}</td></tr>`).join('')}</tbody></table></div>`)}

  ${sec(lang === 'th' ? 'ลายสำหรับทาของ' : 'Paint patterns', patterns.length, `
  <p class="note">${lang === 'th'
      ? 'สเมียร์กุรุทาสีของให้ได้ และบางชิ้นใส่ "ลาย" แทนสีได้ ลายส่วนใหญ่ได้จากของที่เวสปิควีนให้ ที่เหลือเจอบนเกาะแห่งความฝัน มีมาตั้งแต่ต้นเกม หรือได้หลังรับประกาศนียบัตร ราคาที่เห็นคือสีที่ต้องจ่ายต่อการทาหนึ่งครั้ง'
      : 'Smearguru repaints your things, and some take a pattern instead of a flat colour. Most patterns come off items Vespiquen gives you; the rest turn up on Dream Islands, are there from the start, or arrive with the Diploma. The cost is the paint each one spends.'}</p>
  <div class="patterns">${patterns.map(x => `<div class="pattern">
    ${patternPic(x.img) ? `<img src="${patternPic(x.img)}" alt="" loading="lazy" width="72" height="72" decoding="async">` : ''}
    <div class="pattern-src">${esc(x.source)}</div>
    <div class="pattern-cost">${x.cost.map(c => esc(c)).join('<br>')}</div>
  </div>`).join('')}</div>`)}

  ${sec(lang === 'th' ? 'อีโมต' : 'Emotes', emotes.length, `<div class="table-scroll"><table>
    <thead><tr><th>${lang === 'th' ? 'อีโมต' : 'Emote'}</th><th>${lang === 'th' ? 'ได้จาก' : 'Source'}</th></tr></thead>
    <tbody>${emotes.map(e => `<tr><td>${esc(e.name)}</td><td>${esc(e.source)}</td></tr>`).join('')}</tbody></table></div>`)}

  ${sec('Dream Islands', dreamislands.length, `<div class="table-scroll"><table>
    <thead><tr><th>${lang === 'th' ? 'ตุ๊กตาเริ่มต้น' : 'Starting doll'}</th><th>${lang === 'th' ? 'ของหายากที่เน้น' : 'Focused rare finds'}</th><th>${lang === 'th' ? 'โปเกมอนในตำนาน' : 'Legendary'}</th></tr></thead>
    <tbody>${dreamislands.map(d => `<tr><td>${itemChip(d.doll, lang)}</td><td>${d.focus.map(f => ingredient(f.name, lang)).join('') || (lang === 'th' ? 'สุ่มทั้งหมด' : 'all random')}</td><td>${d.legendary ? esc(d.legendary) : '—'}</td></tr>`).join('')}</tbody></table></div>
    <p class="note"><a href="${BASE}/${lang}/dream-islands/" style="text-decoration:underline">${lang === 'th' ? 'ดูรายละเอียดเกาะแต่ละแบบ ของที่เจอได้ทั้งหมด และวิธีเจอโปเกมอนในตำนาน' : 'See each island in full — everything it stocks, and how the Legendaries turn up'}</a></p>`)}

  ${sec('Cloud Islands', cloudislands.length, `<div class="table-scroll"><table>
    <thead><tr><th>${lang === 'th' ? 'เกาะ' : 'Island'}</th><th>${lang === 'th' ? 'โค้ด' : 'Code'}</th></tr></thead>
    <tbody>${cloudislands.map(c => `<tr><td>${esc(c.desc)}</td><td class="num"><strong>${esc(c.code)}</strong></td></tr>`).join('')}</tbody></table></div>`)}

  ${sec(lang === 'th' ? 'สแตมป์การ์ด' : 'Stamp card', stampcard.length, `<div class="table-scroll"><table>
    <thead><tr><th>${lang === 'th' ? 'สแตมป์' : 'Stamp'}</th><th>${lang === 'th' ? 'เหรียญ' : 'Coins'}</th></tr></thead>
    <tbody>${stampcard.map(s => `<tr><td>${esc(s.name)}</td><td class="num">${esc(s.coins)}</td></tr>`).join('')}</tbody></table></div>`)}

  ${sec(lang === 'th' ? 'ชนิดของน้ำ' : 'Liquid types', water.length, `<div class="table-scroll"><table>
    <thead><tr><th>${lang === 'th' ? 'ชนิด' : 'Liquid'}</th><th>${lang === 'th' ? 'คุณสมบัติ' : 'Behaviour'}</th><th>${lang === 'th' ? 'ได้จากเครื่องดื่ม' : 'From drink'}</th></tr></thead>
    <tbody>${water.map(w => { const th = lang === 'th' ? THM.water[w.name] : null; return `<tr><td><strong>${esc(w.name)}</strong>${th ? `<div class="gloss">${esc(th[0])}</div>` : ''}</td><td>${esc(th ? th[1] : w.desc)}</td><td>${esc(w.item)}</td></tr>`; }).join('')}</tbody></table></div>`)}
</div>`;
  return layout({ lang, base: BASE, title: t.nav.collections, desc: 'Pokopia collectibles', path: '/collections/', body });
}

function eventsPage(lang) {
  const t = T[lang];
  const body = `${crumb(lang, [[t.nav.events]])}
<div class="wrap stack">
  <h1>${esc(t.nav.events)}</h1>
  <p class="lede">${lang === 'th'
      ? 'อีเวนต์ออนไลน์ที่ผ่านมา แต่ละอีเวนต์เปิดที่อยู่อาศัยและโปเกมอนในเด็กซ์อีเวนต์เพิ่ม'
      : 'Past online events. Each one opens event-dex habitats and Pokémon that are not otherwise obtainable.'}</p>
  <div class="rows">${events.map(e => dataRow({ name: e.name, gloss: lang === 'th' ? (THM.events[e.name] || '') : '', desc: '', kind: 'calendar', lang, meta: `<span class="tag tag-clay">${esc(e.duration)}</span>` })).join('')}</div>
  <div class="sec-title"><h2>${lang === 'th' ? 'โปเกมอนเด็กซ์อีเวนต์' : 'Event dex Pokémon'}</h2></div>
  <div class="dex-grid">${pokemon.filter(p => p.dex === 'event').map(p => monCard(p, lang)).join('')}</div>
</div>`;
  return layout({ lang, base: BASE, title: t.nav.events, desc: 'Pokopia events', path: '/events/', body });
}

function updatesPage(lang) {
  const t = T[lang];
  const body = `${crumb(lang, [[t.nav.updates]])}
<div class="wrap stack" style="--gap:16px">
  <h1>${esc(t.nav.updates)}</h1>
  <p class="lede">${lang === 'th'
      ? 'ประวัติแพตช์ทางการทั้งหมดตั้งแต่วางจำหน่าย รายการด้านล่างคัดมาจากบันทึกแพตช์ของทางการ'
      : 'Every official patch since launch, taken from the published release notes.'}</p>
  ${patches.map(p => {
    const th = lang === 'th' ? THPATCH[p.version] : null;
    const lines = th && th.lines.length === p.lines.length ? th.lines : p.lines;
    return `<article class="card">
    <div class="chips" style="margin-bottom:6px"><span class="tag tag-moss">v${esc(p.version)}</span><span class="tag">${esc(th ? th.date : p.date)}</span></div>
    <ul style="margin:6px 0 0;padding-left:1.1em;font-size:.9rem;color:var(--ink-2)">${lines.map(l => `<li>${esc(l)}</li>`).join('')}</ul>
  </article>`;
  }).join('')}
</div>`;
  return layout({ lang, base: BASE, title: t.nav.updates, desc: 'Pokopia patch notes', path: '/updates/', body });
}

function dlcPage(lang) {
  const t = T[lang];
  const basin = LOCATIONS.find(l => l.id === 'bubbly-basin');
  const packs = [
    ['Dynamic Ditto', '9 June 2026', '', lang === 'th' ? 'ลาย Dynamic Ditto สำหรับบล็อกและวอลเปเปอร์ แถมให้ทันทีที่ซื้อแพ็ก' : 'A Dynamic Ditto pattern for both blocks and wallpaper, granted the moment you buy the pass.'],
    ['Bubbly Basin', '5 August 2026', '', lang === 'th' ? 'พื้นที่ใต้น้ำแห่งใหม่ ปลดล็อกท่า Dive การสร้างใต้น้ำ และโปเกมอนลึกลับมานาฟี' : 'A new underwater area that unlocks the Dive move, underwater building and the Mythical Pokémon Manaphy.'],
    ['Pack 2', lang === 'th' ? 'ปลายปี 2026' : 'Late 2026', '', lang === 'th' ? 'ยังไม่เปิดเผยรายละเอียด' : 'Contents not yet announced.'],
    ['Pack 3', '2027', '', lang === 'th' ? 'เมืองใหม่อีกหนึ่งแห่ง' : 'Another new town.'],
  ];
  const basinMons = pokemon.filter(p => p.dex === 'basin');
  const body = `${crumb(lang, [[t.nav.dlc]])}
<div class="wrap stack" style="--gap:18px">
  <h1>Pokémon Pokopia Expansion Pass</h1>
  <p class="lede">${lang === 'th'
      ? 'ประกาศและเริ่มขายเดือนมิถุนายน 2026 ราคา $34.99 / €34.99 / £29.99 ประกอบด้วยแพ็กเสริมสามชุดที่ทยอยปล่อย เพิ่มเมืองใหม่สองแห่งและระบบใหม่ ซื้อครั้งเดียวได้ครบทั้งสามแพ็ก'
      : 'Announced and released in June 2026 at $34.99 / €34.99 / £29.99. Three packs release over time, adding two new towns and a range of new features; one purchase covers all three.'}</p>
  <div class="grid g-4">${packs.map(([name, date, _, desc]) => `
    <div class="card"><div class="chips" style="margin-bottom:8px"><span class="tag tag-clay">${esc(date)}</span></div>
    <h3>${esc(name)}</h3><p style="font-size:.88rem;color:var(--ink-2);margin:6px 0 0">${esc(desc)}</p></div>`).join('')}</div>
  <div class="prose"><h2>${esc(L(lang, basin.name))}</h2><p>${esc(L(lang, basin.desc))}</p></div>
  <section><div class="sec-title"><h2>${lang === 'th' ? 'โปเกมอนใน Bubbly Basin' : 'Bubbly Basin Pokédex'}</h2><span>${basinMons.length}</span></div>
    <div class="dex-grid">${basinMons.map(p => monCard(p, lang)).join('')}</div></section>
  <section><div class="sec-title"><h2>${lang === 'th' ? 'ที่อยู่อาศัยใน Bubbly Basin' : 'Bubbly Basin habitats'}</h2><span>${habitats.filter(h => h.dex === 'basin').length}</span></div>
    <div class="rows">${habitats.filter(h => h.dex === 'basin').map(h => habitatCard(h, lang)).join('')}</div></section>
</div>`;
  return layout({ lang, base: BASE, title: t.nav.dlc, desc: 'Pokopia Expansion Pass', path: '/dlc/', body });
}

function aboutPage(lang) {
  const t = T[lang];
  const body = `${crumb(lang, [[t.nav.about]])}
<div class="wrap stack">
  <h1>${esc(t.nav.about)}</h1>
  <div class="prose">
    ${lang === 'th' ? `
    <p>เว็บนี้เป็นสารานุกรมที่ทำโดยแฟนเกม รวบรวมข้อมูลของ <strong>Pokémon Pokopia</strong> ไว้ในที่เดียว รองรับสองภาษาคือภาษาอังกฤษและภาษาไทย</p>
    <h2>เรื่องชื่อโปเกมอนภาษาไทย</h2>
    <p>เกมนี้ยังไม่มีภาษาไทยอย่างเป็นทางการ ชื่อไทยในเว็บนี้จึงเป็นการทับศัพท์ที่ทำขึ้นเอง โดยแสดงสามอย่างควบคู่กันเสมอ คือ ชื่อไทยที่ทับศัพท์จากภาษาอังกฤษ ชื่อภาษาอังกฤษตามที่ปรากฏในเกม และชื่อไทยที่ทับศัพท์จากภาษาญี่ปุ่น เช่น <strong>ไซนดาควิล · Cyndaquil · ฮิโนอาราชิ</strong></p>
    <h2>เรื่องชื่อไอเทมภาษาไทย</h2>
    <p>ชื่อไอเทม ที่อยู่อาศัย และสูตรคราฟต์ จะแสดงชื่อภาษาอังกฤษเป็นหลัก เพราะเป็นชื่อที่คุณจะเห็นจริงในเกม บรรทัดสีเขียวใต้ชื่อคือคำแปลไทยประกอบ ซึ่งสร้างจากพจนานุกรมคำศัพท์กว่า 1,250 คำที่เขียนขึ้นเอง — มีไว้ให้อ่านเข้าใจง่าย ไม่ใช่ชื่อทางการ</p>
    <h2>ความครบถ้วนของข้อมูล</h2>
    <p>ข้อมูลในเว็บนี้ครอบคลุมโปเกมอน ${pokemon.length} รายการ (${new Set(pokemon.filter(p => p.dex === 'main').map(p => p.no)).size} ตัวในเด็กซ์หลัก), ที่อยู่อาศัย ${habitats.length} แบบ (ครบทั้งวัสดุที่ต้องใช้และโปเกมอนที่จะมา), ไอเทม ${items.length} ชิ้น, สูตรคราฟต์ ${recipes.length} สูตร, เฟอร์นิเจอร์ ${furniture.length} ชิ้น, ชุดก่อสร้าง ${buildkits.length} ชุด, เมนูอาหาร ${cooking.length} เมนู, ซีดี ${cds.length} แผ่น, Lost Relic ${lostrelics.length} ชิ้น, Human Record ${humanrecords.length} ชิ้น และประวัติแพตช์ทางการทั้ง ${patches.length} เวอร์ชัน</p>
    <h2>แหล่งข้อมูล</h2>` : `
    <p>An independent, fan-made encyclopedia for <strong>Pokémon Pokopia</strong>, published in English and Thai.</p>
    <h2>On Thai Pokémon names</h2>
    <p>The game has no official Thai localisation, so the Thai names here are transliterations written for this site. Each Pokémon is always shown three ways: the Thai transliteration of the English name, the English name as it appears in game, and the Thai transliteration of the Japanese name — for example <strong>ไซนดาควิล · Cyndaquil · ฮิโนอาราชิ</strong>.</p>
    <h2>On item names</h2>
    <p>Items, habitats and recipes keep their English names as the primary label, because that is what you actually see on screen. In the Thai edition a green line underneath carries a Thai reading, generated from a hand-written dictionary of over 1,250 terms. It is a reading aid, not an official name.</p>
    <h2>Coverage</h2>
    <p>${pokemon.length} Pokémon entries (${new Set(pokemon.filter(p => p.dex === 'main').map(p => p.no)).size} in the main dex), ${habitats.length} habitats (each with its build requirements and resident Pokémon), ${items.length} items, ${recipes.length} crafting recipes, ${furniture.length} furniture pieces, ${buildkits.length} building kits, ${cooking.length} dishes, ${cds.length} music CDs, ${lostrelics.length} Lost Relics, ${humanrecords.length} Human Records and all ${patches.length} official patches.</p>
    <h2>Sources</h2>`}
    <ul>${SOURCES.map(([label, url]) => `<li><a href="${url}" rel="noopener nofollow">${esc(label)}</a></li>`).join('')}</ul>
    <p class="note note-clay">${lang === 'th'
      ? 'Pokémon และชื่อที่เกี่ยวข้องทั้งหมดเป็นเครื่องหมายการค้าของ Nintendo, Creatures Inc. และ GAME FREAK inc. เว็บนี้ไม่ใช่เว็บทางการ ไม่มีส่วนเกี่ยวข้อง และไม่ได้รับการรับรองจากบริษัทดังกล่าว ภาพสไปรท์โปเกมอนมาจากโปรเจกต์ PokéAPI/sprites'
      : 'Pokémon and all related names are trademarks of Nintendo, Creatures Inc. and GAME FREAK inc. This site is unofficial, unaffiliated and not endorsed by them. Pokémon sprites come from the PokéAPI/sprites project.'}</p>
  </div>
</div>`;
  return layout({ lang, base: BASE, title: t.nav.about, desc: 'About this wiki', path: '/about/', body });
}

/* ---------------- search index ---------------- */
function searchIndex(lang) {
  const t = T[lang];
  const out = [];
  for (const p of pokemon) {
    const n = monNames(p);
    out.push({
      n: monTitle(p, lang), s: monSub(p, lang), u: `/${lang}/pokemon/${p.id}/`, k: t.nav.pokedex,
      i: `/sprites/small/${p.natdex}.png`,
      q: [p.name, p.form, p.alias, p.ja, n.thEn, n.thJa, `#${p.no}`].filter(Boolean).join(' ').toLowerCase(),
    });
  }
  const add = (arr, kind, url, sub) => arr.forEach(x => {
    const g = lang === 'th' ? G(x.name) : '';
    out.push({
      n: x.name, s: g || (sub ? sub(x) : ''), u: typeof url === 'function' ? url(x) : url, k: kind,
      ...(itemPic(x.img) ? { i: `/sprites/items/${encodeURIComponent(x.img)}` } : {}),
      q: (x.name + (g ? ' ' + g : '')).toLowerCase(),
    });
  });
  habitats.forEach(h => {
    const gl = lang === 'th' ? G(h.name) : '';
    out.push({
      n: `#${String(h.no).padStart(3, '0')} ${h.name}`, s: gl || h.req.join(' · '),
      u: `/${lang}/habitats/#h${h.dex}-${h.no}`, k: t.nav.habitats,
      ...(habPic(h.img) ? { i: `/sprites/habitats/${encodeURIComponent(h.img)}` } : {}),
      q: (h.name + (gl ? ' ' + gl : '') + ' ' + h.mons.map(id => (monById.get(id) || {}).name || '').join(' ')).toLowerCase(),
    });
  });
  add(items, t.nav.items, x => `/${lang}/items/${catSlug(x.cat)}/`, x => x.cat);
  add(recipes, t.nav.recipes, x => `/${lang}/recipes/${catSlug(x.cat)}/`, x => x.cat);
  add(furniture, t.nav.furniture, `/${lang}/furniture/`);
  add(buildkits, t.nav.building, `/${lang}/building/`);
  add(cooking, t.nav.cooking, `/${lang}/cooking/`, x => x.type);
  add(lostrelics, t.nav.collections, `/${lang}/collections/`, x => x.kind);
  add(cds, t.nav.collections, `/${lang}/collections/`, x => x.game);
  moves.forEach(m => out.push({ n: moveName(m, lang), s: moveEffect(m, lang), u: `/${lang}/moves/#${m.id}`, k: t.nav.moves, q: moveName(m, lang).toLowerCase() }));
  specialties.forEach(s => out.push({ n: specName(s, lang), s: specDesc(s, lang), u: `/${lang}/specialties/#${s.id}`, k: t.nav.specialties, q: specName(s, lang).toLowerCase() }));
  GUIDES.forEach(g => out.push({ n: L(lang, g.title), s: L(lang, g.summary), u: `/${lang}/guide/${g.slug}/`, k: t.nav.basics, q: L(lang, g.title).toLowerCase() }));
  outfits.forEach(o => out.push({
    n: o.name, s: (lang === 'th' && OUTFIT_CATS_TH[o.cat]) || o.cat, u: `/${lang}/outfits/`, k: t.nav.outfits,
    ...(outfitPic(o.img) ? { i: `/sprites/outfits/${encodeURIComponent(o.img)}` } : {}),
    q: (o.name + ' ' + o.cat + ' ' + ((lang === 'th' && OUTFIT_CATS_TH[o.cat]) || '')).toLowerCase(),
  }));
  out.push({
    n: t.nav.dreamIslands, u: `/${lang}/dream-islands/`, k: t.nav.basics,
    s: lang === 'th' ? 'ตุ๊กตาไหนพาไปเกาะแบบไหน' : 'What each doll stocks the island with',
    q: (t.nav.dreamIslands + ' dream island doll เกาะ ตุ๊กตา').toLowerCase(),
  });
  out.push({
    n: t.nav.gifts, u: `/${lang}/gifts/`, k: t.nav.basics,
    s: lang === 'th' ? 'ใครให้อะไร ตอนไหน และบ่อยแค่ไหน' : 'Who gives what, at which stage, and how often',
    q: (t.nav.gifts + ' gifts litter emote ของขวัญ').toLowerCase(),
  });
  LOCATIONS.forEach(l => out.push({ n: L(lang, l.name), s: L(lang, l.based), u: `/${lang}/location/${l.id}/`, k: t.nav.locations, q: (L(lang, l.name) + ' ' + l.id).toLowerCase() }));
  CHARACTERS.forEach(c => out.push({ n: L(lang, c.name), s: L(lang, c.role), u: `/${lang}/characters/#${c.id}`, k: t.nav.characters, i: `/sprites/small/${c.natdex}.png`, q: L(lang, c.name).toLowerCase() }));
  return out;
}

/* ---------------- run ---------------- */
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

for (const lang of LANGS) {
  write(`${lang}`, homePage(lang));
  write(`${lang}/pokedex`, pokedexPage(lang));
  for (const p of pokemon) write(`${lang}/pokemon/${p.id}`, pokemonPage(p, lang));
  write(`${lang}/habitats`, habitatsPage(lang));
  write(`${lang}/items`, catIndexPage({
    lang, all: items, root: '/items/', ic: 'box', title: T[lang].nav.items,
    lede: lang === 'th'
      ? `ไอเทมทั้งหมด ${items.length} รายการ แยกตามหมวด — ชื่ออังกฤษคือชื่อที่ปรากฏในเกม (เกมยังไม่มีภาษาไทย) บรรทัดสีเขียวคือคำแปลไทยประกอบ`
      : `All ${items.length} items with their in-game descriptions and where to find them, grouped by category.`,
  }));
  for (const c of [...new Set(items.map(i => i.cat))]) write(`${lang}/items/${catSlug(c)}`, itemsCatPage(c, lang));
  write(`${lang}/recipes`, catIndexPage({
    lang, all: recipes, root: '/recipes/', ic: 'package', title: T[lang].nav.recipes,
    lede: lang === 'th'
      ? `สูตรคราฟต์ทั้งหมด ${recipes.length} สูตร พร้อมวัสดุที่ต้องใช้และวิธีได้สูตรมา`
      : `All ${recipes.length} crafting recipes with their material costs and how each recipe is unlocked.`,
  }));
  for (const c of [...new Set(recipes.map(r => r.cat))]) write(`${lang}/recipes/${catSlug(c)}`, recipesCatPage(c, lang));
  write(`${lang}/furniture`, furniturePage(lang));
  write(`${lang}/moves`, movesPage(lang));
  write(`${lang}/specialties`, specialtiesPage(lang));
  write(`${lang}/characters`, charactersPage(lang));
  write(`${lang}/locations`, locationsPage(lang));
  for (const l of LOCATIONS) write(`${lang}/location/${l.id}`, locationPage(l, lang));
  write(`${lang}/guides`, guidesPage(lang));
  for (const g of GUIDES) write(`${lang}/guide/${g.slug}`, guidePage(g, lang));
  write(`${lang}/story`, storyPage(lang));
  write(`${lang}/building`, buildingPage(lang));
  write(`${lang}/cooking`, cookingPage(lang));
  write(`${lang}/gifts`, giftsPage(lang));
  write(`${lang}/dream-islands`, dreamIslandsPage(lang));
  write(`${lang}/toys`, toysPage(lang));
  toys.forEach(toy => write(`${lang}/toys/${toy.id}`, toyPage(toy, lang)));
  write(`${lang}/outfits`, outfitsPage(lang));
  write(`${lang}/records`, recordsPage(lang));
  write(`${lang}/collections`, collectionsPage(lang));
  write(`${lang}/events`, eventsPage(lang));
  write(`${lang}/updates`, updatesPage(lang));
  write(`${lang}/dlc`, dlcPage(lang));
  write(`${lang}/about`, aboutPage(lang));
  fs.writeFileSync(path.join(OUT, `search-${lang}.json`), JSON.stringify(searchIndex(lang)));
}

/* language picker at the root */
fs.writeFileSync(path.join(OUT, 'index.html'), `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Pokopia Wiki</title><link rel="icon" href="${BASE}/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="${BASE}/styles.css">
<script>location.replace("${BASE}/" + ((navigator.language||"en").toLowerCase().startsWith("th") ? "th" : "en") + "/");</script>
</head><body><div class="wrap stack" style="padding:15vh 0;text-align:center">
<h1>Pokopia Wiki</h1><p class="lede" style="margin-inline:auto">Choose a language · เลือกภาษา</p>
<div class="chips" style="justify-content:center"><a class="chip" href="${BASE}/en/">English</a><a class="chip" href="${BASE}/th/">ไทย</a></div>
</div></body></html>`);

/* static assets */
fs.copyFileSync('src/styles.css', path.join(OUT, 'styles.css'));
fs.copyFileSync('src/app.js', path.join(OUT, 'app.js'));
copy('src/sprites', 'sprites');
fs.writeFileSync(path.join(OUT, 'favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">${LOGO.replace(/^<svg[^>]*>|<\/svg>$/g, '').replace(/var\(--moss-soft\)/g, '#e3f0e8').replace(/var\(--moss\)/g, '#2f7a58').replace(/var\(--clay\)/g, '#b4622f').replace(/var\(--paper\)/g, '#faf7f1')}</svg>`);
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');

/* sitemap + robots */
const urls = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name === 'index.html') urls.push('/' + path.relative(OUT, path.dirname(p)).split(path.sep).join('/') + '/');
  }
})(OUT);
fs.writeFileSync(path.join(OUT, 'sitemap.txt'), urls.map(u => (u === '/./' ? '/' : u)).join('\n'));
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n`);

console.log(`built ${written} pages → ${OUT}/`);
