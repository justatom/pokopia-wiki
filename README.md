# Pokopia Wiki

A bilingual (English / ไทย) fan encyclopedia for **Pokémon Pokopia** — the Nintendo Switch 2
life-simulation game released 5 March 2026.

Static site, **zero runtime dependencies**, mobile-first. Node 20+ is the only requirement.
1,139 pages, built from JSON in a couple of seconds.

**Live: <https://justatom.github.io/pokopia-wiki/>**

---

## What's in it

| Data set | Count |
|---|---|
| Pokémon entries (300 in the main dex, plus Basin and Event dexes) | 367 |
| — with ideal habitat, five favourite categories and a flavour | 366 |
| — with time-of-day and weather conditions | 294 |
| Habitats — each with a picture, build requirements and the Pokémon it releases | 252 |
| Items with an icon, description and sources | 1,777 |
| — with the favourite categories they count as | 715 |
| — paintable, with how many sections colour separately | 463 |
| — needing the Expansion Pass | 233 |
| Item ↔ favourite-category links, across all 43 categories | 2,356 |
| Pokémon ↔ favourite-category links | 1,817 |
| Crafting recipes with material costs | 884 |
| Building kits, 55 with materials, helper Pokémon and build time | 56 |
| Shop unlocks by Environment Level, 520 linked to their item | 524 |
| Toys, each with its categories and every Pokémon that likes it | 140 |
| Furniture pieces | 140 |
| Paint patterns, with where each is found and what it costs | 116 |
| Outfits, hairstyles and accessories, with pictures and sources | 203 |
| Human Records — 126 with their text, 18 of them photographs | 170 |
| Documented gifts Pokémon give you (Litter drops, emotes, story items) | 57 |
| Dishes, with equipment, ingredients and the helper each needs | 34 |
| Music CDs / Lost Relics | 53 / 103 |
| Official patch notes (fully translated to Thai) | 7 versions |

Plus hand-written bilingual guides on habitats and Comfy Level, building rules, crafting,
electricity, water physics, farming, cooking, friendship and trading, Legendaries,
collectibles and Cloud Islands.

## How the data hangs together

Most of the work here is not fetching data but joining it. Three things tie the site
together, and they are worth knowing before changing anything.

### Item cross-links

Items have no page of their own — each is a row on its category page carrying an `id`, so
every reference anywhere links straight to it and `:target` highlights the row on arrival.
That covers recipe materials, habitat build requirements, favourite lists, gift drops,
cooking ingredients, building-kit costs, toy entries and shop unlocks: **215,234 links**,
every one verified to resolve against the built HTML.

References resolve loosely, because the sources are not consistent with themselves —
`"Tall Grass x 4"`, `"Hedge (any) x 4"`, `"Sea grape"` for the item *Sea grapes*, and
`"Seaglass Fragments"` for *Sea glass fragments* all find their item. Three material names
Serebii misspells (`Linestone`, `Iron ignot`, `Stones`) are corrected in `shape.mjs`, and
one kit it names two different ways on two of its own pages is aliased in `build.mjs`.

### Favourites

Every Pokémon likes one of six **ambiences** (its ideal habitat), five of 43 **categories**,
and one of five **flavours**. Matching items raise Comfy Level and friendship faster, and
are worth 50% more when trading. Each Pokémon page lists all seven with the actual items
in each category; each item says which categories it counts as; each toy says how many
Pokémon those categories please.

Two things this data deliberately does *not* claim. The game lists the five categories in
a fixed order, but nothing published says the first counts for more than the fifth, so the
numbers are presented as the in-game order and not a ranking. And Serebii marks its
per-category item lists as still being filled in — 715 of 1,777 items are catalogued — so
counts render as a floor (`17+ items`) and each page states its own coverage rather than
letting a blank read as "belongs to nothing".

### Gifts

`/gifts/` is the inverse of Favourites: not what you give a Pokémon, but what it gives you.
Three channels are documented per species — 41 Litter drops (a fixed material, repeating
near the home, driven by the specialty rather than by friendship), 15 one-off emote gifts,
and Chef Dente's items.

The game shows friendship as a gauge rather than a numbered level, and no source publishes
a rate for the random material gifts. The five milestones are described by what visibly
changes, and the frequency column says "undocumented" where that is the honest answer.

## What the sources do and do not have

Every page states its own gaps rather than leaving them to look like oversights. The
recurring ones:

- **Time and weather** are per-Pokémon and real — 23 night-only, 8 day-only, 8 with weather
  restrictions — but only for the 294 species Pokopia Lab covers. The Legendaries have no
  conditions at all (they do not spawn from habitats), and the Expansion Pass and event
  dexes are not covered there yet.
- **Dream Islands** have no wild Pokémon and no fixed map: each trip generates a new island
  that the day's end throws away. What is predictable is what you find, which the doll
  decides — so that is what `/dream-islands/` lists, with 112–152 finds per island.
- **Human Records**: Serebii names all 163 and leaves every description blank. Bulbapedia
  writes out 126 of them. The remaining 44 say that nobody has written them down.
- **Building kits**: 55 of 56 have their materials, helpers and build time. The Mysterious
  mural kit is on neither source.
- **Pictures**: 9 items and 4 shop unlocks have no image or entry upstream and fall back to
  a line icon or plain text.

## Thai

The game has no official Thai localisation, so:

- **Pokémon** are shown three ways — Thai transliteration of the English name, the English
  name as it appears in game, and the Thai transliteration of the Japanese name.
  Example: **ไซนดาควิล · Cyndaquil · ฮิโนอาราชิ**.
- **Items, habitats and recipes** keep the English name as the primary label (that is what
  is on screen), with a Thai reading underneath generated from a hand-written dictionary of
  1,255 terms in `data/th/terms.json`.
- **Item descriptions** are translated in full — all 1,776, in the game's warm, chatty
  voice rather than word for word. They live in `data/th/items.json`, keyed by item id;
  492 items share their description with another item (every leaf kit opens the same way,
  every flower seed reads alike), so a translation is written once and reaches the rest
  through the English text. Anything left untranslated falls back to the original.
- **Human Records** are translated in full — all 126, 37,304 characters, written in the
  game's warm, chatty register rather than word for word, so a seasick sailor's diary still
  trails off mid-sentence and a Team R grunt still sounds like one. See
  `data/th/records.json`.
- **Specialties, moves, favourite categories, ambiences and flavours** have Thai in
  `data/th/misc.json`; patch notes in `data/th/patches.json`.

## Running it

About 127 MB of pictures — Pokémon artwork, 1,697 item icons, 252 habitat photos, 203
outfits, 116 patterns, 55 building renders, 18 record photographs, 3,137 files in all — are
downloaded rather than committed, so the first build takes a few minutes. Later builds skip
anything already on disk.

```bash
npm run build    # downloads missing pictures, then generates dist/
npm run dev      # build + serve on http://localhost:4321
```

Other scripts:

```bash
npm run data        # regenerate data/*.json from the scraped sources in _research/
npm run sprites     # download any missing pictures into src/sprites/
npm run build:fast  # build without checking pictures
```

Set `BASE_PATH` when the site is served from a subdirectory, e.g. a GitHub Pages project site:

```bash
BASE_PATH=/pokopia-wiki node scripts/build.mjs
```

## Layout

```
data/               canonical JSON — the single source of truth
  th/               Thai overlays: Pokémon names, terms, records, patch notes, UI data
  content.mjs       hand-written bilingual prose (game facts, story, characters, guides)
scripts/
  scrape.mjs        fetches every upstream source into _research/
  shape.mjs         scraped sources -> data/*.json
  build.mjs         data + templates -> dist/
  ui.mjs            page shell, icon set, navigation model, UI strings
  serve.mjs         local preview server
  sprites.mjs       downloads every picture into src/sprites/
  archives.mjs      the pictures only the Bulbagarden Archives has
  labtimes.mjs      per-Pokémon time of day and weather, from Pokopia Lab
  bulbaitems.mjs    parses Bulbapedia's item table (paint, DLC, event, recipe flags)
  buildkits.mjs     parses Bulbapedia's building-kit requirements
  records.mjs       parses Bulbapedia's Human Records
  habitatdex.mjs    parses the Dexerto habitat dex
src/
  styles.css        design system (light + dark, mobile-first)
  app.js            search, list filtering, nav drawer, theme toggle
  sprites/          small/ is committed; the rest are downloaded (see sprites.mjs)
_research/          scraped source data and the parsed caches that produced data/
```

Adding a language means adding a `data/th`-style overlay plus a `UI strings` block in
`scripts/ui.mjs`, then adding the code to `LANGS` in `scripts/build.mjs`.

### Scraping notes

Worth knowing before touching `scrape.mjs`, because each of these cost a debugging session:

- **Serebii** wants a browser User-Agent and drops the connection when pushed, so requests
  retry with backoff.
- **Bulbapedia's** Cloudflare rule is the opposite: a browser-looking User-Agent on
  `api.php` gets challenged, so those calls identify as a script.
- **Bulbapedia's wikitext** carries `[[links|like this]]` and `{{m|Leafage}}` inside
  template parameters, so both the row scan and the parameter split have to count braces.
  A lazy regex silently truncates rows and shifts every field after the description.
- **The Bulbagarden Archives** stores uploads under a hash of the file name, so file URLs
  cannot be derived and must be resolved through its API first.
- **Pokopia Lab** puts state in the class list, not the text: a condition that does not
  apply keeps its chip and carries `opacity-30`. Reading labels alone reports every Pokémon
  as unrestricted.

## Deploying

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every push to `main`.
It works out `BASE_PATH` automatically and caches the 127 MB of pictures between runs, so
only the first build pays the download cost and the upstream sites are not re-crawled.

After the first push, enable Pages in **Settings → Pages → Source: GitHub Actions**.

## Sources

Game data was compiled from [Serebii](https://www.serebii.net/pokemonpokopia/),
[Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_Pokopia) and the
[Bulbagarden Archives](https://archives.bulbagarden.net/), the
[Dexerto habitat dex](https://www.dexerto.com/wikis/pokopia/habitat-dex/), the official
Nintendo and Pokémon listings, [Pokopia Lab](https://pokopialab.com/) for per-Pokémon time
of day and weather, and [PokéAPI](https://pokeapi.co/) for species names and sprites.
Item icons, habitat pictures and building renders are the in-game assets as catalogued by
those wikis.

## Licence

Site code: MIT. Pokémon and all related names are trademarks of Nintendo, Creatures Inc. and
GAME FREAK inc. This project is unofficial, unaffiliated and not endorsed by them.
