/* Extracts the habitat dex (build requirements + resident Pokémon) from the Dexerto
   wiki page. The page renders only the first rows and reveals the rest with a "Load
   More" button, but it ships the whole table as a URL-encoded JSON blob, so the full
   252 rows can be read without a browser. */
import fs from 'node:fs';

const strip = s => String(s)
  .replace(/<[^>]+>/g, '')
  .replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"')
  .replace(/\s+/g, ' ').trim();

const cellText = c => strip(c && c.content !== undefined ? c.content : '');
/* a cell can hold several linked names separated by <br> or by adjacent <a> tags */
const cellList = c => {
  const raw = String(c && c.content !== undefined ? c.content : '');
  const anchors = [...raw.matchAll(/<a[^>]*>([\s\S]*?)<\/a>/gi)].map(m => strip(m[1])).filter(Boolean);
  if (anchors.length) return anchors;
  return raw.split(/<br\s*\/?>|\n/i).map(strip).filter(Boolean);
};

/** read the balanced JSON array that starts at `start` */
function sliceArray(s, start) {
  let depth = 0, inStr = false, esc = false;
  for (let j = start; j < s.length; j++) {
    const ch = s[j];
    if (inStr) { if (esc) esc = false; else if (ch === '\\') esc = true; else if (ch === '"') inStr = false; continue; }
    if (ch === '"') inStr = true;
    else if (ch === '[') depth++;
    else if (ch === ']') { depth--; if (!depth) return s.slice(start, j + 1); }
  }
  return null;
}

export default function parseHabitatDex(htmlPath, outPath) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const blobs = [...html.matchAll(/%22[0-9A-Za-z%._~!*'()\-]{2000,}/g)].map(m => m[0]);

  const tables = [];
  for (const blob of blobs) {
    let decoded;
    try { decoded = decodeURIComponent(blob); } catch { continue; }
    const re = /\{"cells":\[/g;
    let m; const rows = [];
    while ((m = re.exec(decoded))) {
      const arr = sliceArray(decoded, m.index + m[0].length - 1);
      if (!arr) continue;
      try { rows.push(JSON.parse(arr)); } catch { }
    }
    if (rows.length) tables.push(rows);
  }

  const out = [];
  for (const cells of tables.flat()) {
    if (!Array.isArray(cells) || cells.length < 4) continue;
    const no = cellText(cells[0]);
    if (!/^\d+$/.test(no)) continue;
    out.push({ no: +no, name: cellText(cells[1]), req: cellList(cells[2]), mons: cellList(cells[3]) });
  }

  /* the three tables run main (209) -> basin (36) -> event (7); the numbering restarts
     at each boundary, which is how we tell them apart */
  let seen = 0, prev = 0;
  for (const r of out) {
    if (r.no <= prev) seen++;
    prev = r.no;
    r.dex = ['main', 'basin', 'event'][Math.min(seen, 2)];
  }

  fs.writeFileSync(outPath, JSON.stringify(out, null, 1));
  const counts = out.reduce((a, r) => ((a[r.dex] = (a[r.dex] || 0) + 1), a), {});
  console.log(`  habitat dex: ${out.length} rows`, JSON.stringify(counts));
  return out;
}

if (process.argv[1] && process.argv[1].endsWith('habitatdex.mjs')) {
  parseHabitatDex('_research/dex_hab.html', '_research/habitat_dex.json');
}
