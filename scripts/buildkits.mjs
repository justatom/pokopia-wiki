/* Parses Bulbapedia's Building page into per-kit build requirements.

   Serebii lists the kits but only names and describes them. Bulbapedia's table is the one
   place that records what a kit actually costs: the materials and their quantities, how
   many Pokémon must help and which specialties they need, and how long the build takes.

   Each row is: picture | name | materials | quantities | required Pokémon | build time,
   with <hr> separating the entries inside the last four cells so they line up by index. */

/** wikitext -> readable text: drop file links, unwrap templates and piped links */
const strip = s => String(s)
  .replace(/\[\[File:[^\]]*\]\]/g, '')
  .replace(/\{\{OBP\|([^|}]+)\|[^}]*\}\}/g, '$1')
  .replace(/\{\{i\|([^|}]+)(\|[^}]*)?\}\}/g, '$1')
  .replace(/\{\{color\|[^|]*\|([^}]*)\}\}/g, '$1')
  .replace(/\{\{poko\|([^|}]+)[^}]*\}\}/g, '$1')
  .replace(/\[\[[^|\]]*\|([^\]]*)\]\]/g, '$1')
  .replace(/\[\[([^\]]*)\]\]/g, '$1')
  .replace(/<\/?[a-z]+[^>]*>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

/** split a cell on <hr>, cleaning each piece */
const parts = cell => String(cell).split(/<hr\s*\/?>/i).map(strip).filter(Boolean);

/** "×1 Pokémon with Build or Engineer" -> { count: 1, specialties: ['Build','Engineer'] }
    "×3 other Pokémon"                  -> { count: 3, specialties: [] }              */
function helper(text) {
  const count = +(text.match(/×\s*(\d+)/) || [])[1] || 1;
  const after = (text.split(/\bwith\b/)[1] || '').trim();
  const specialties = after ? after.split(/\s+or\s+/).map(x => x.trim()).filter(Boolean) : [];
  return { count, specialties, text };
}

/** the headings a table sits under, so event and expansion kits stay distinguishable */
function sections(wiki) {
  const out = []; const re = /^==+\s*(.+?)\s*==+$/gm;
  let m, last = null, idx = 0;
  while ((m = re.exec(wiki))) { if (last) out.push({ name: last, body: wiki.slice(idx, m.index) }); last = m[1]; idx = m.index; }
  if (last) out.push({ name: last, body: wiki.slice(idx) });
  return out;
}

export default function parseBuildKits(wiki) {
  const kits = [];
  for (const sec of sections(wiki)) {
    for (const row of sec.body.split(/^\|-.*$/m)) {
      // cells start at a line-leading "|" that is not the table's closing "|}"
      const cells = row.split(/^\|(?!\})/m).slice(1);
      if (cells.length < 6) continue;
      const name = strip(cells[1]);
      if (!name || name === 'Name') continue;
      const mats = parts(cells[2]), qty = parts(cells[3]);
      kits.push({
        name,
        section: sec.name,
        materials: mats.map((m, i) => ({
          name: m,
          qty: +(String(qty[i] || '').replace(/[^\d]/g, '')) || null,
        })),
        helpers: parts(cells[4]).map(helper),
        time: parts(cells[5]),
      });
    }
  }
  return kits;
}
