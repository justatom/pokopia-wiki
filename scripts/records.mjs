/* Parses Bulbapedia's Human Records page.

   Serebii lists the 163 records by name, location and reward but leaves the Description
   column empty for every one — the text of the records, which is the whole point of them,
   is only written down on Bulbapedia. There each record is a row of
   Name | Location | Contents | Reward, grouped under the kind of object it is.

   Contents keep their paragraph breaks: the source wraps lines with <br> for layout and
   separates real paragraphs with a blank line, so only the latter survives. */

/** wikitext -> plain text, keeping paragraph breaks as \n\n */
const clean = s => String(s)
  .replace(/\[\[File:[^\]]*\]\]/g, '')
  .replace(/\{\{na\}\}/gi, '')
  .replace(/\{\{tt\|([^|}]*)\|[^}]*\}\}/g, '$1')
  .replace(/\{\{(?:p|m|t|ga|type|OBP|DL|i|poko)\|([^|}]*)(?:\|[^}]*)?\}\}/g, '$1')
  .replace(/\[\[[^|\]]*\|([^\]]*)\]\]/g, '$1')
  .replace(/\[\[([^\]]*)\]\]/g, '$1')
  .replace(/<ref[^>]*>[\s\S]*?<\/ref>/g, '')
  .replace(/<br\s*\/?>/gi, ' ')          // layout wraps, not real breaks
  .replace(/[ \t]+/g, ' ')
  .split(/\n\s*\n/).map(x => x.trim()).filter(Boolean).join('\n\n')
  .replace(/^"|"$/g, '')
  .trim();

/** the headings a table sits under name the kind of object each record is */
function sections(wiki) {
  const out = []; const re = /^==+\s*(.+?)\s*==+$/gm;
  let m, last = null, idx = 0;
  while ((m = re.exec(wiki))) { if (last) out.push({ name: last, body: wiki.slice(idx, m.index) }); last = m[1]; idx = m.index; }
  if (last) out.push({ name: last, body: wiki.slice(idx) });
  return out;
}

const SINGULAR = {
  Newspapers: 'Newspaper', 'Diary Entries': 'Diary entry', Magazines: 'Magazine',
  Notes: 'Note', Letters: 'Letter', Papers: 'Paper', Photos: 'Photo',
};

export default function parseRecords(wiki) {
  const out = [];
  for (const sec of sections(wiki)) {
    const type = SINGULAR[sec.name];
    if (!type) continue;
    for (const row of sec.body.split(/^\|-.*$/m)) {
      const cells = row.split(/^\|(?!\})/m).slice(1);
      if (cells.length < 5) continue;
      const name = clean(cells[1]);
      if (!name || name === 'Name') continue;
      /* Photo records carry the photograph itself, with alt text describing the scene —
         which is the only written account of what is in the picture. */
      const shot = /\[\[File:(Pokopia Human Records [^|\]]+)([^\]]*)\]\]/i.exec(cells[3]);
      const alt = shot && /\|alt=([^|\]]*)/.exec(shot[2]);
      out.push({
        type,
        name,
        location: clean(cells[2]),
        content: clean(cells[3]),
        photo: shot ? shot[1].trim().replace(/ /g, '_') : null,
        photoAlt: alt ? alt[1].trim() : null,
        reward: clean(cells[4]) || null,
      });
    }
  }
  return out;
}
