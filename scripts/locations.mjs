/* Parses Serebii's per-area pages into what you can actually find in each area.

   The site already used these pages for one thing — the shop's Environment Level unlocks.
   Everything above that section was going unread, and it is the more useful half: each
   area page is a run of <h2> headings, each followed by one table of item links.

     Naturally Occuring Materials        sticks, ore, clay — the things that respawn
     Naturally Occuring Plants & Blocks  the terrain itself: grass, soil, rock, sand
     Items Found in Area                 objects lying around, one-off
     Items Found in PokeBalls in Area    what the Poke Balls scattered about hold
     Treasure Found in Area              what a treasure map digs up
     Items found in Sparkling Ripples    fishing spots; Bubbly Basin calls them Whirlpools
     Exclusive Shop Items                stock only this area's shop carries

   Palette Town adds "List of Exclusive Pokemon" ahead of them, which links to the Pokedex
   rather than to items, so links are kept with the path that produced them and the caller
   decides what to do with each group. */

import fs from 'node:fs';
import path from 'node:path';

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', eacute: 'é' };
const dec = s => String(s)
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
  .replace(/&([a-z]+);/gi, (m, n) => ENT[n] ?? m);

const text = h => dec(String(h).replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();

/** one area page -> [{ heading, kind, entries: [{ name, slug }] }] */
export function parsePage(html) {
  /* The sidebar that follows the article links to other Serebii sections, so the last
     heading's region has to stop at the end of the article rather than the document. */
  const body = html.slice(0, html.indexOf('</main>') + 1 || html.length);
  const out = [];
  const heads = [...body.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)];

  for (let i = 0; i < heads.length; i++) {
    const heading = text(heads[i][1]);
    const start = heads[i].index + heads[i][0].length;
    const end = i + 1 < heads.length ? heads[i + 1].index : body.length;

    /* Everything between this heading and the next belongs to it. Reading the region
       rather than "the next <table>" is what makes Palette Town's Pokemon list work: its
       heading sits inside a cell of the same table that holds the entries, so there is no
       table after it to find. */
    const seen = new Map();
    for (const m of body.slice(start, end).matchAll(/href="[^"]*\/pokemonpokopia\/(items|pokedex)\/([^"]+?)\.shtml"[^>]*>([\s\S]*?)<\/a>/gi)) {
      // each entry is linked twice, once wrapping its picture and once its name
      const label = text(m[3]);
      if (!label) continue;
      const slug = dec(m[2]);
      if (!seen.has(slug)) seen.set(slug, { name: label, slug, kind: m[1] });
    }
    const entries = [...seen.values()];
    if (entries.length) out.push({ heading, kind: entries[0].kind, entries });
  }
  return out;
}

/** every cached area page, keyed by the Serebii slug (witheredwastelands, …) */
export default function parseLocationPages(dir) {
  const out = new Map();
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir).filter(x => /^loc_.*\.html$/.test(x))) {
    const got = parsePage(fs.readFileSync(path.join(dir, f), 'latin1'));
    if (got.length) out.set(f.replace(/^loc_|\.html$/g, ''), got);
  }
  return out;
}
