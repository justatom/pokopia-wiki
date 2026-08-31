# Pokopia Wiki

A bilingual (English / ไทย) fan encyclopedia for **Pokémon Pokopia** — the Nintendo Switch 2
life-simulation game released 5 March 2026.

Static site, **zero runtime dependencies**, mobile-first. Node 20+ is the only requirement.

---

## What's in it

| Data set | Count |
|---|---|
| Pokémon entries (300 in the main dex, plus Basin and Event dexes) | 367 |
| Habitats — each with a picture, build requirements and the Pokémon it releases | 252 |
| Items with an icon, description and sources | 1,697 |
| Crafting recipes with material costs | 884 |
| Furniture pieces | 140 |
| Building kits | 56 |
| Dishes | 34 |
| Music CDs / Lost Relics / Human Records | 53 / 103 / 163 |
| Outfits, hairstyles and accessories, with pictures and sources | 203 |
| Documented gifts Pokémon give you (Litter drops, emotes, story items) | 57 |
| Pokémon with favourites recorded (ideal habitat + 5 categories + flavour) | 366 |
| Item ↔ favourite-category links across the 43 categories | 2,356 |
| Official patch notes (fully translated to Thai) | 7 versions |

Plus hand-written bilingual guides on habitats and Comfy Level, building rules, crafting,
electricity, water physics, farming, cooking, friendship and trading, Legendaries,
collectibles and Cloud Islands.

### Item cross-links

Items have no page of their own — each is a row on its category page carrying an
`id`, so every reference to one links straight to it (`:target` highlights the row).
That covers recipe materials, habitat build requirements, favourites, gift drops and
cooking ingredients: 52,722 links across the site, all verified to resolve at build.

Serebii misspells three material names (`Linestone`, `Iron ignot`, `Stones`); those are
corrected in `scripts/shape.mjs`. Two upstream entries stay unlinked because there is no
safe reading of them — a mangled `Pok&eacute` and a stray blank row.

### Favourites

Every Pokémon page carries the seven things that Pokémon likes: its **ideal habitat**
(one of six ambiences), **five favourite categories** out of 43, and **one flavour** out of
five — each category showing the actual items in it, with icons.

Two things this data does *not* claim. The game lists the five categories in a fixed order
but nothing published says the first counts for more than the fifth, so the numbers are
presented as the in-game order rather than a strength ranking. And Serebii marks its
per-category item lists as still being filled in, so `data/favorites.json` records
`partial: true` and the site shows each count as a floor (`17+ items`), not a total.

Ideal habitat, the five categories and the flavour come from Bulbapedia's
[List of Pokémon by likes](https://bulbapedia.bulbagarden.net/wiki/List_of_Pok%C3%A9mon_by_likes)
plus the `{{Spindata/Pokopia}}` block on each Basin species' own page; the item lists come
from Serebii's per-category subpages.

### Gifts

`/gifts/` is the inverse of the Favourites system — not what you give a Pokémon, but what
it gives you. It lists the five friendship milestones in order, the 41 Litter drops (fixed
material, repeats near the home, driven by the specialty rather than by friendship), the 15
one-off emote gifts, and the specialties that trade rather than give.

The game shows friendship as a gauge, not a numbered level, and no source publishes a rate
for the random material gifts at high friendship. The page says so instead of quoting a
made-up number; `data/gifts.json` only holds what is documented species by species.

## Thai naming

The game has no official Thai localisation, so:

- **Pokémon** are shown three ways — Thai transliteration of the English name, the English
  name as it appears in game, and the Thai transliteration of the Japanese name.
  Example: **ไซนดาควิล · Cyndaquil · ฮิโนอาราชิ**.
- **Items, habitats and recipes** keep the English name as the primary label (that is what
  is on screen), with a Thai reading underneath generated from a hand-written dictionary of
  1,255 terms in `data/th/terms.json`.

## Running it

About 110 MB of pictures (Pokémon artwork, 1,697 item icons, 252 habitat photos) are
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
  th/               Thai overlays: Pokémon names, term dictionary, patch notes, UI data
  content.mjs       hand-written bilingual prose (game facts, story, characters, guides)
scripts/
  shape.mjs         scraped sources -> data/*.json
  sprites.mjs       downloads PokéAPI sprites into src/sprites/
  build.mjs         data + templates -> dist/
  ui.mjs            page shell, icon set, navigation model, UI strings
  serve.mjs         local preview server
src/
  styles.css        design system (light + dark, mobile-first)
  app.js            search, list filtering, nav drawer, theme toggle
  sprites/          small/ is committed; art/, items/, habitats/ and outfits/ are downloaded
_research/          scraped source data and the parsers that produced data/
```

Adding a language means adding a `data/th`-style overlay plus a `UI strings` block in
`scripts/ui.mjs`, then adding the code to `LANGS` in `scripts/build.mjs`.

## Deploying

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every push to `main`.
It works out `BASE_PATH` automatically and caches the artwork download between runs.

After the first push, enable Pages in **Settings → Pages → Source: GitHub Actions**.

## Sources

Game data was compiled from [Serebii](https://www.serebii.net/pokemonpokopia/),
[Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_Pokopia),
the [Dexerto habitat dex](https://www.dexerto.com/wikis/pokopia/habitat-dex/), the official
Nintendo and Pokémon listings, and [PokéAPI](https://pokeapi.co/) for species names and sprites.
Item icons and habitat pictures are the in-game assets as catalogued by Serebii.

## Licence

Site code: MIT. Pokémon and all related names are trademarks of Nintendo, Creatures Inc. and
GAME FREAK inc. This project is unofficial, unaffiliated and not endorsed by them.
