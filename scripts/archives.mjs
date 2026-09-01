/* Downloads pictures that only the Bulbagarden Archives has.

     src/sprites/builds/  the finished building behind each kit, without the kit badge
     src/sprites/items/   sprites for the items Serebii's list omits, saved under our
                          own item id so itemPic() finds them like any other
     src/sprites/records/ the photographs among the Human Records

   An upload path on the Archives is a hash of the file name and cannot be derived from
   it, so every file is resolved through the API first, 40 titles per call. */
import fs from 'node:fs';
import path from 'node:path';

const API = 'https://archives.bulbagarden.net/w/api.php';
const UA = 'PokopiaWiki/1.0 (static site build script for a Pokémon Pokopia fan wiki)';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const j = p => JSON.parse(fs.readFileSync(p, 'utf8'));

/** where these files actually live, keyed by the file name we asked for */
async function resolve(names) {
  const found = new Map();
  for (let i = 0; i < names.length; i += 40) {
    const u = new URL(API);
    u.search = new URLSearchParams({
      action: 'query', prop: 'imageinfo', iiprop: 'url',
      titles: names.slice(i, i + 40).map(n => `File:${n.replace(/_/g, ' ')}`).join('|'),
      format: 'json', formatversion: '2',
    });
    try {
      const body = await (await fetch(u, { headers: { 'User-Agent': UA } })).text();
      if (!body.startsWith('{')) throw new Error('no JSON from the Archives');
      for (const page of JSON.parse(body).query?.pages || []) {
        const url = page.imageinfo?.[0]?.url;
        if (url) found.set(page.title.replace(/^File:/, '').replace(/ /g, '_'), url);
      }
    } catch (e) { console.error('  !', String(e.message || e)); }
    await sleep(400);
  }
  return found;
}

let bytes = 0, missed = 0;

/** wants: [{ file, dest }] — the Archives file name and where to put it */
async function grabAll(label, wants) {
  const todo = wants.filter(w => !fs.existsSync(w.dest));
  if (!todo.length) { console.log(`${label} ${wants.length}/${wants.length}  cached`); return; }
  const found = await resolve([...new Set(todo.map(w => w.file))]);
  let done = 0;
  for (const w of todo) {
    done++;
    const url = found.get(w.file);
    if (!url) { missed++; console.error(`  ! not on the Archives: ${w.file}`); continue; }
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const buf = Buffer.from(await r.arrayBuffer());
      fs.mkdirSync(path.dirname(w.dest), { recursive: true });
      fs.writeFileSync(w.dest, buf);
      bytes += buf.length;
    } catch (e) { missed++; console.error(`  ! ${String(e.message || e)} ${w.file}`); }
    process.stderr.write(`${label} ${done}/${todo.length}  ${(bytes / 1e6).toFixed(1)}MB   \r`);
    await sleep(250);
  }
  process.stderr.write('\n');
}

await grabAll('builds  ', j('data/buildkits.json')
  .filter(k => k.build)
  .map(k => ({ file: k.build, dest: path.join('src/sprites/builds', k.build) })));

/* Items Serebii does not list have no icon of their own; Bulbapedia's sprite is saved
   under our item id so nothing downstream has to know where it came from. */
await grabAll('newitems', j('data/items.json')
  .filter(i => !i.img && i.bulbaFile)
  .map(i => ({ file: i.bulbaFile.replace(/ /g, '_'), dest: path.join('src/sprites/items', `${i.id}.png`) })));

/* the photographs among the Human Records — the only ones with a picture of their own */
await grabAll('photos  ', j('data/humanrecords.json')
  .filter(r => r.photo)
  .map(r => ({ file: r.photo, dest: path.join('src/sprites/records', r.photo) })));

console.log(`archives ${(bytes / 1e6).toFixed(1)}MB${missed ? `, ${missed} missing` : ''}`);
