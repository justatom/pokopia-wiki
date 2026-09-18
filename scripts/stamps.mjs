/* Parses Bulbapedia's Stamp rally page into the stamp card's rules, its four rarities and
   the 24 stamps themselves.

   Serebii covers the same feature in four rows — a rarity and what it pays — and its own
   page adds two rules nothing else records. Bulbapedia is the one that names every stamp
   and the rarity it counts as, which is what you want when a card is nearly full and you
   are deciding which stamp to replace.

   Two tables carry it. The first is rarity | reward:

     | [[File:Pikachu Stamp Pokopia.png|100px]]
     | '''Common'''<br>First Stage Pokémon
     | [[File:Pokopia Life Coin.png|30px]] 50 Life Coins

   and the second, under "List of Stamps", is picture | Pokémon | rarity. */

const RARITIES = ['Common', 'Uncommon', 'Rare', 'Mythical'];

/** wikitext -> readable text: drop file links and unwrap the templates this page uses */
const strip = s => String(s)
  .replace(/\[\[File:[^\]]*\]\]/g, '')
  .replace(/\{\{p\|([^|}]+)[^}]*\}\}/g, '$1')
  .replace(/\{\{[^|}]*\|([^}]*)\}\}/g, '$1')
  .replace(/\[\[[^|\]]*\|([^\]]*)\]\]/g, '$1')
  .replace(/\[\[([^\]]*)\]\]/g, '$1')
  .replace(/'''|''/g, '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

/** the four rarities, each with the kind of Pokémon it covers and what it pays */
function rarities(wiki) {
  const out = [];
  for (const m of wiki.matchAll(/\[\[File:([^|\]]+)\|[^\]]*\]\]\s*\n\|\s*'''(\w+)'''<br>([^\n|]+)\n\|[^\n]*?([\d,]+)\s*Life Coins/g)) {
    out.push({
      rarity: m[2],
      kind: strip(m[3]),
      coins: +m[4].replace(/,/g, ''),
      img: m[1].replace(/_/g, ' ').trim(),
    });
  }
  return out;
}

/** every stamp: the Pokémon on it, the rarity it counts as, and its picture */
function stamps(wiki) {
  const i = wiki.search(/==\s*List of Stamps\s*==/);
  if (i < 0) return [];
  const out = [];
  for (const m of wiki.slice(i).matchAll(/\[\[File:([^|\]]+)\|[^\]]*\]\]\s*\n\|\s*\{\{p\|([^|}]+)[^}]*\}\}\s*\n\|\s*(\w+)/g)) {
    if (!RARITIES.includes(m[3])) continue;
    out.push({ name: strip(m[2]), rarity: m[3], img: m[1].replace(/_/g, ' ').trim() });
  }
  return out;
}

/** the paragraphs above the first table — how the rally actually works */
function rules(wiki) {
  const head = wiki.slice(0, wiki.search(/\{\|/));
  return head.split('\n')
    .map(strip)
    .filter(x => x.length > 60 && !/^\{\{/.test(x));
}

export default function parseStamps(wikitext) {
  // the API returns the text as a string with formatversion=2 and as { '*': text } without
  const wiki = String(typeof wikitext === 'object' && wikitext ? wikitext['*'] ?? '' : wikitext);
  return { rules: rules(wiki), rarities: rarities(wiki), stamps: stamps(wiki) };
}
