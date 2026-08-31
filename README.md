# Pokopia Wiki

A bilingual (English / ไทย) fan encyclopedia for **Pokémon Pokopia** — the Nintendo Switch 2
life-simulation game released 5 March 2026.

Static site, **zero runtime dependencies**, mobile-first. Node 20+ is the only requirement.

---

## What's in it

| Data set | Count |
|---|---|
| Pokémon entries (300 in the main dex, plus Basin and Event dexes) | 367 |
| Habitats — each with build requirements and the Pokémon it releases | 252 |
| Items with descriptions and sources | 1,697 |
| Crafting recipes with material costs | 884 |
| Furniture pieces | 140 |
| Building kits | 56 |
| Dishes | 34 |
| Music CDs / Lost Relics / Human Records | 53 / 103 / 163 |
| Official patch notes (fully translated to Thai) | 7 versions |

Plus hand-written bilingual guides on habitats and Comfy Level, building rules, crafting,
electricity, water physics, farming, cooking, friendship and trading, Legendaries,
collectibles and Cloud Islands.

## Thai naming

The game has no official Thai localisation, so:

- **Pokémon** are shown three ways — Thai transliteration of the English name, the English
  name as it appears in game, and the Thai transliteration of the Japanese name.
  Example: **ไซนดาควิล · Cyndaquil · ฮิโนอาราชิ**.
- **Items, habitats and recipes** keep the English name as the primary label (that is what
  is on screen), with a Thai reading underneath generated from a hand-written dictionary of
  1,255 terms in `data/th/terms.json`.

## Running it

```bash
npm run build    # downloads missing sprites, then generates dist/
npm run dev      # build + serve on http://localhost:4321
```

Other scripts:

```bash
npm run data        # regenerate data/*.json from the scraped sources in _research/
npm run sprites     # download any missing PokéAPI sprites into src/sprites/
npm run build:fast  # build without checking sprites
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
  sprites/          small/ is committed; art/ is downloaded (see .gitignore)
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

## Licence

Site code: MIT. Pokémon and all related names are trademarks of Nintendo, Creatures Inc. and
GAME FREAK inc. This project is unofficial, unaffiliated and not endorsed by them.
