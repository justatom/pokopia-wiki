/* Parses Serebii's per-kit building pages into the facts the index page leaves out.

   building.shtml names and describes the 56 kits and nothing else. Each kit also has its
   own subpage, and that is the only place any source records how many Pokemon can live in
   the finished building — the thing you actually want to know before spending the
   materials. The kit name is no guide to it: the Poke Ball *house* kit holds one Pokemon
   while the log cabin holds four, and a windmill holds none at all.

   The subpage opens with a five-column table that is the same on every kit:

     Concept | Floors | Liveable Pokemon | Time Required | Size
     Building with Interior | 1 | 1 | 15 minutes | Width: 2<br>Depth: 2<br>Height: 1

   Floors is blank on anything you cannot walk into. Rather than trust the column order,
   the header row is read for its labels and the row beneath it is zipped onto them. */

import fs from 'node:fs';
import path from 'node:path';

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', eacute: 'é', deg: '°', hellip: '…' };

/** one table cell of HTML -> plain text, keeping <br> as a line break */
const txt = h => String(h)
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/<[^>]*>/g, '')
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
  .replace(/&([a-z]+);/gi, (m, n) => ENT[n] ?? m)
  .split('\n').map(s => s.trim()).filter(Boolean).join('\n');

/** the cells of every <tr> in a chunk of HTML, as raw HTML strings */
function rows(html) {
  const out = [];
  for (const tr of html.split(/<tr[^>]*>/i).slice(1)) {
    const cells = [...tr.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(m => m[1]);
    if (cells.length) out.push(cells);
  }
  return out;
}

/** "Width: 2\nDepth: 2\nHeight: 1" -> { width: 2, depth: 2, height: 1 } */
function size(text) {
  const out = {};
  for (const line of String(text).split('\n')) {
    const m = line.match(/^(width|depth|height)\s*:\s*(\d+)/i);
    if (m) out[m[1].toLowerCase()] = +m[2];
  }
  return Object.keys(out).length ? out : null;
}

/** a whole subpage -> the facts, or null if it has no header table */
export function parsePage(html) {
  const all = rows(html);
  const i = all.findIndex(r => r.some(c => /Liveable/i.test(c)));
  if (i < 0 || !all[i + 1]) return null;
  const labels = all[i].map(txt);
  const values = all[i + 1].map(txt);
  const at = name => {
    const k = labels.findIndex(l => new RegExp(name, 'i').test(l));
    return k < 0 ? '' : (values[k] ?? '');
  };
  const live = at('Liveable');
  const floors = at('Floors');
  return {
    /* Serebii leaves the cell empty rather than writing 0 on kits with no interior, so an
       empty cell is "no data" and a written 0 is "nothing lives here". Both read as null
       for floors; only Liveable distinguishes them, and it is always filled in. */
    live: /^\d+$/.test(live) ? +live : null,
    floors: /^\d+$/.test(floors) ? +floors : null,
    concept: at('Concept') || null,
    size: size(at('Size')),
  };
}

/** every cached subpage, keyed by its Serebii slug (leafdenkit, pokeballhousekit, …) */
export default function parseBuildPages(dir) {
  const out = new Map();
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.html'))) {
    const got = parsePage(fs.readFileSync(path.join(dir, f), 'latin1'));
    if (got) out.set(f.replace(/\.html$/, ''), got);
  }
  return out;
}
