/* Parses Bulbapedia's "List of items in Pokémon Pokopia" into per-item facts Serebii
   does not publish: whether an item can be painted (and in how many separately coloured
   sections), whether it takes a pattern instead, whether it needs the Expansion Pass, and
   whether it came from an event or a later game version.

   Every row is one {{PokoI}} call. Its parameters are documented on Template:PokoI:

     1 name   2 category   3 description   4 classification   5 recipe   6 paint   7 pattern

   plus named flags, of which these matter: d = Expansion Pass, e = event,
   f=2 = added in version 2.0.0, u=2 = became paintable in 2.0.0. */

const CATEGORY = {
  Fu: 'Furniture', Mi: 'Misc', Ou: 'Outdoor', Ut: 'Utilities', Bu: 'Buildings',
  Bl: 'Blocks', Ki: 'Kits', Na: 'Nature', Na1: 'Nature', Fo: 'Food',
  Ma: 'Materials', Ke: 'Key Items', Ot: 'Other',
};
const CLASSIFICATION = { D: 'Decoration', T: 'Toy', R: 'Relaxation', B: 'Road' };

/** wikitext -> plain text, for descriptions that carry links, moves or tooltips.
    {{p|Ditto}}, {{m|Leafage}}, {{OBP|Build|specialty}} and {{tt|shown|hover}} all render
    as their first argument, so unwrap them the same way. */
const clean = s => String(s)
  .replace(/\{\{tt\|([^|}]*)\|[^}]*\}\}/g, '$1')
  .replace(/\{\{(?:p|m|t|type|OBP|DL|i)\|([^|}]*)(?:\|[^}]*)?\}\}/g, '$1')
  .replace(/\[\[[^|\]]*\|([^\]]*)\]\]/g, '$1')
  .replace(/\[\[([^\]]*)\]\]/g, '$1')
  .replace(/<ref[^>]*\/>/g, '')
  .replace(/<ref[^>]*>[\s\S]*?<\/ref>/g, '')
  .replace(/\s+/g, ' ')
  .trim();

/** split on the pipes that separate parameters, ignoring those inside [[…]] or {{…}} —
    a description like [[Wildflowers|wildflowers]] would otherwise shift every later field */
function splitParams(s) {
  const out = [];
  let depth = 0, start = 0;
  for (let i = 0; i < s.length; i++) {
    const two = s.slice(i, i + 2);
    if (two === '[[' || two === '{{') { depth++; i++; continue; }
    if (two === ']]' || two === '}}') { depth--; i++; continue; }
    if (s[i] === '|' && depth === 0) { out.push(s.slice(start, i)); start = i + 1; }
  }
  out.push(s.slice(start));
  return out;
}

/** every {{PokoI|…}} call, read to its own matching braces rather than the first "}}" —
    rows carry nested {{tt}} and [[…]], which a lazy regex would cut short */
function rows(wiki) {
  const out = [];
  const open = '{{PokoI|';
  let at = 0;
  while ((at = wiki.indexOf(open, at)) >= 0) {
    let depth = 0, i = at;
    for (; i < wiki.length; i++) {
      const two = wiki.slice(i, i + 2);
      if (two === '{{' || two === '[[') { depth++; i++; continue; }
      if (two === '}}' || two === ']]') { depth--; i++; if (!depth) break; continue; }
    }
    out.push(wiki.slice(at + open.length, i - 1));
    at = i;
  }
  return out;
}

export default function parseBulbaItems(wiki) {
  const out = [];
  for (const row of rows(wiki)) {
    const pos = [], flags = {};
    for (const part of splitParams(row)) {
      const kv = /^\s*([a-z0-9]+)=(.*)$/.exec(part);
      if (kv) flags[kv[1]] = kv[2].trim(); else pos.push(clean(part));
    }
    if (!pos[0]) continue;
    out.push({
      name: pos[0],
      cat: CATEGORY[pos[1]] || null,
      desc: pos[2] || '',
      classification: CLASSIFICATION[pos[3]] || null,
      craftable: Boolean(pos[4]),
      /* the paint parameter is usually a count of separately colourable sections, but
         some rows just assert paintability with {{yes}} or Y — keep both readings */
      paintable: Boolean(pos[5]),
      paint: pos[5] ? (Number(pos[5]) || null) : null,
      pattern: Boolean(pos[6]),
      dlc: 'd' in flags,
      event: 'e' in flags,
      addedIn: flags.f === '2' ? '2.0.0' : null,
      // Bulbapedia hosts the sprite under this name; a few items borrow another's image
      file: `Bag ${flags.a || pos[0]}${flags.i ? ` (${flags.i})` : ''} Pokopia Sprite.png`,
    });
  }
  return out;
}
