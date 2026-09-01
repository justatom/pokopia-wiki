/* Parses Serebii's per-habitat pages for the facts the habitat index leaves out.

   habitats.shtml is four columns — number, picture, name, description — and the Dexerto
   habitat dex adds the build requirements and the Pokemon each habitat releases. Neither
   says *where* a habitat is any use, which is what you want when you are standing in one
   area deciding what to build. Each habitat's own page does, under every Pokemon it
   releases:

     Available Pokemon
       Torkoal
       Location: Withered Wastelands / Bleak Beach / Rocky Ridges / ...
       Rarity:   Common
       Time      Weather
       Morning   Sun
       Day       Cloud
       ...

   The table is one column per Pokemon and one row per field, so the fields are read by
   their label and zipped back onto the names by column index. Rarity, time and weather
   come along for free and are per habitat *and* Pokemon, which is finer than the
   per-species figures Pokopia Lab publishes. */

import fs from 'node:fs';
import path from 'node:path';

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', eacute: 'é' };
const dec = s => String(s)
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
  .replace(/&([a-z]+);/gi, (m, n) => ENT[n] ?? m);

/** cell HTML -> the lines inside it, <br> and block tags being the breaks */
const lines = h => dec(String(h).replace(/<(br|\/tr|\/td|\/div|\/p)[^>]*>/gi, '\n').replace(/<[^>]*>/g, ''))
  .split('\n').map(s => s.trim()).filter(Boolean);

/** the cells of every <tr> in one table's HTML.
    Serebii closes the last Time/Weather cell with </tr> and no </td>, so a cell has to be
    allowed to end at the next cell or the row as well as at its own closing tag. */
function rows(tableHtml) {
  const out = [];
  for (const tr of tableHtml.split(/<tr[^>]*>/i).slice(1)) {
    const cells = [...tr.matchAll(/<t[dh][^>]*>([\s\S]*?)(?=<\/t[dh]>|<t[dh][^>]*>|<\/tr>|$)/gi)].map(m => m[1]);
    if (cells.length) out.push(cells);
  }
  return out;
}

/** every table nested one level inside `html`, in document order */
function nested(html) {
  const out = [];
  let depth = 0, start = -1;
  for (const m of html.matchAll(/<(\/?)table\b/gi)) {
    if (m[1]) { depth--; if (depth === 1 && start >= 0) { out.push(html.slice(start, m.index)); start = -1; } }
    else { depth++; if (depth === 2) start = m.index; }
  }
  return out;
}

/* Time and Weather live in a two-column table nested inside the Pokemon's cell. Splitting
   the outer table on <tr> shreds it, so these are pulled straight out of the Available
   Pokemon table in document order and zipped back on by index. */
function timeWeatherBlocks(tbl) {
  return nested(tbl).filter(t => /<b>\s*Time\b/i.test(t) && /<b>\s*Weather\b/i.test(t)).map(t => {
    const body = t.slice(t.indexOf('</tr>', t.search(/<b>\s*Time\b/i)) + 5);
    const cols = [...body.matchAll(/<td[^>]*>([\s\S]*?)(?=<\/td>|<td[^>]*>|<\/tr>|<\/table>|$)/gi)].map(m => lines(m[1]));
    return { times: cols[0] || [], weather: cols[1] || [] };
  });
}

/** the Available Pokemon table, or '' */
function availableTable(html) {
  const i = html.search(/Available\s+Pok(?:&eacute;|é)mon/i);
  if (i < 0) return '';
  const j = html.indexOf('<table', i);
  if (j < 0) return '';
  /* the outer table ends at the first </table> that is not one of its nested ones */
  let depth = 0;
  const re = /<(\/?)table\b/gi; re.lastIndex = j;
  for (let m; (m = re.exec(html));) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return html.slice(j, re.lastIndex);
  }
  return html.slice(j);
}

/* Serebii writes Cloud Island alongside the six areas; it is a trip you take, not a place
   you build in, so it is kept but the site labels it as such. */
const AREA = /witheredwastelands|bleakbeach|rockyridges|sparklingskylands|palettetown|bubblybasin|cloudisland/i;

export function parsePage(html) {
  const tbl = availableTable(html);
  if (!tbl) return null;
  const rs = rows(tbl);

  /* the first row is the Pokemon names, one cell each; every later row is one field */
  const names = (rs[0] || []).map(c => lines(c).join(' ')).filter(Boolean);
  if (!names.length) return null;

  const mons = names.map(name => ({ name, locations: [], rarity: null, times: [], weather: [] }));

  for (const r of rs.slice(1)) {
    r.forEach((cell, col) => {
      const m = mons[col];
      if (!m) return;
      if (/<b>\s*Location/i.test(cell)) {
        m.locations = [...cell.matchAll(/locations\/([a-z]+)\.shtml"[^>]*>(?:<u>)?([^<]+)/gi)]
          .filter(x => AREA.test(x[1])).map(x => dec(x[2]).trim());
      } else if (/<b>\s*Rarity/i.test(cell)) {
        m.rarity = lines(cell).filter(x => !/^Rarity:?$/i.test(x)).join(' ').replace(/^:\s*/, '') || null;
      }
    });
  }
  timeWeatherBlocks(tbl).forEach((tw, i) => { if (mons[i]) { mons[i].times = tw.times; mons[i].weather = tw.weather; } });

  return mons.filter(m => m.locations.length || m.rarity || m.times.length);
}

/** every cached habitat page, keyed by its Serebii slug */
export default function parseHabitatPages(dir) {
  const out = new Map();
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.html'))) {
    const got = parsePage(fs.readFileSync(path.join(dir, f), 'latin1'));
    if (got && got.length) out.set(f.replace(/\.html$/, ''), got);
  }
  return out;
}
