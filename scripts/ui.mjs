/* Shared HTML building blocks for the static generator. */

export const esc = s => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export const TYPE_COLORS = {
  Normal: '#8f8f7e', Fire: '#d5643a', Water: '#3f7fc1', Electric: '#c9a01e', Grass: '#4e9a4a',
  Ice: '#4fa8ac', Fighting: '#b2453a', Poison: '#8a4b96', Ground: '#b08a45', Flying: '#7f8dc9',
  Psychic: '#c9557c', Bug: '#7d9a2a', Rock: '#9c8b4e', Ghost: '#5f5a8c', Dragon: '#5a5ac0',
  Dark: '#5b4f47', Steel: '#7a8a95', Fairy: '#c26fa1',
};

/* Minimal, consistent line icons — 24×24 grid, currentColor stroke. */
const P = {
  home: '<path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',
  dex: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 3v18M11 8h6M11 12h6"/>',
  leaf: '<path d="M5 19C4 12 8 5 19 5c0 11-7 15-14 14z"/><path d="M5 19c3-4 6-6 10-8"/>',
  box: '<path d="M3 8.5 12 4l9 4.5v7L12 20l-9-4.5z"/><path d="m3 8.5 9 4.5 9-4.5M12 13v7"/>',
  hammer: '<path d="m14 6 4 4M3 21l7-7"/><path d="M11 9 9 7l3-3 6 6-3 3-2-2z"/>',
  sparkles: '<path d="m12 3 1.8 4.7L18.5 9l-4.7 1.8L12 15l-1.8-4.2L5.5 9l4.7-1.3z"/><path d="M18 16.5 19 19l2.5 1-2.5 1L18 23.5 17 21l-2.5-1L17 19z"/>',
  map: '<path d="m9 4 6 3 5-3v13l-5 3-6-3-5 3V7z"/><path d="M9 4v13M15 7v13"/>',
  users: '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 6a3 3 0 0 1 0 6M17.5 20a6 6 0 0 0-2-4.5"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 0-2 2z"/><path d="M4 19a2 2 0 0 1 2-2h13"/>',
  disc: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.6"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14-4L4 9"/><path d="M4 5v4h4"/><path d="M4 13a8 8 0 0 0 14 4l2-2"/><path d="M20 19v-4h-4"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  close: '<path d="M6 6 18 18M18 6 6 18"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/>',
  chef: '<path d="M7 21h10v-6H7z"/><path d="M6 15a4 4 0 0 1-1-7.8A4 4 0 0 1 12 4a4 4 0 0 1 7 3.2A4 4 0 0 1 18 15"/>',
  bolt: '<path d="M13 2 4 14h6l-1 8 9-12h-6z"/>',
  droplet: '<path d="M12 3s6 6.2 6 10a6 6 0 0 1-12 0c0-3.8 6-10 6-10z"/>',
  package: '<path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z"/><path d="M7.5 5.2 16.5 9.8M3 7.5l9 4.5 9-4.5M12 12v9"/>',
  star: '<path d="m12 3.5 2.6 5.6 6 .8-4.4 4.2 1.1 6-5.3-2.9L6.7 20l1.1-6L3.4 9.9l6-.8z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
};

export const icon = (name, cls = '') =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${cls ? ` class="${cls}"` : ''}>${P[name] || P.info}</svg>`;

export const LOGO = `<svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
<circle cx="20" cy="20" r="18" fill="var(--moss-soft)"/>
<path d="M8 27c0-8 5-14 15-14 0 9-6 14-15 14z" fill="var(--moss)"/>
<path d="M8 27c3-4 7-7 11-8.5" stroke="var(--paper)" stroke-width="1.6" stroke-linecap="round"/>
<circle cx="26.5" cy="14" r="4.5" fill="var(--clay)"/>
<circle cx="26.5" cy="14" r="1.6" fill="var(--paper)"/>
</svg>`;

export const typePill = t =>
  `<span class="type" style="background:${TYPE_COLORS[t] || '#777'}">${esc(t)}</span>`;

/* ---------- page shell ---------- */
export function layout({ lang, base, title, desc, path, body, altPath, head = '', bodyClass = '' }) {
  const t = lang === 'th' ? TH : EN;
  const other = lang === 'en' ? 'th' : 'en';
  const nav = NAV.map(g => `
      <div class="nav-sec">${esc(t.navsec[g.sec])}</div>
      ${g.links.map(l => `<a href="${base}/${lang}${l.href}"${path === l.href ? ' aria-current="page"' : ''}>${icon(l.icon)}<span>${esc(t.nav[l.key])}</span></a>`).join('')}`).join('');

  return `<!doctype html>
<html lang="${lang === 'th' ? 'th' : 'en'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)} · ${esc(t.site)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#faf7f1" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#121614" media="(prefers-color-scheme: dark)">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="${lang === 'th' ? 'th_TH' : 'en_US'}">
<link rel="alternate" hreflang="en" href="${base}/en${altPath ?? path}">
<link rel="alternate" hreflang="th" href="${base}/th${altPath ?? path}">
<link rel="icon" href="${base}/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai+Looped:wght@400;500;600&family=Noto+Serif+Thai:wght@500;600&family=Noto+Serif:wght@500;600&display=swap">
<link rel="stylesheet" href="${base}/styles.css">
${head}
<script>try{var m=localStorage.getItem('pkp-theme');if(m)document.documentElement.dataset.theme=m}catch(e){}</script>
</head>
<body class="${bodyClass}" data-base="${base}" data-lang="${lang}">
<a class="skip" href="#main">${esc(t.skip)}</a>
<header class="site-head">
  <div class="wrap head-row">
    <a class="brand" href="${base}/${lang}/">${LOGO}<span>${esc(t.site)}<small>${esc(t.tagline)}</small></span></a>
    <button class="icon-btn" id="searchBtn" aria-label="${esc(t.search)}">${icon('search')}</button>
    <button class="icon-btn wide-only" id="themeBtn" aria-label="${esc(t.theme)}">${icon('sun')}</button>
    <div class="lang-switch wide-only">
      <a href="${base}/en${altPath ?? path}"${lang === 'en' ? ' aria-current="true"' : ''} hreflang="en">EN</a>
      <a href="${base}/th${altPath ?? path}"${lang === 'th' ? ' aria-current="true"' : ''} hreflang="th">ไทย</a>
    </div>
    <button class="icon-btn" id="menuBtn" aria-label="${esc(t.menu)}" aria-expanded="false">${icon('menu')}</button>
  </div>
  <nav class="nav-panel" id="navPanel" aria-label="${esc(t.menu)}"><div class="wrap">
    <div class="panel-tools narrow-only">
      <div class="lang-switch">
        <a href="${base}/en${altPath ?? path}"${lang === 'en' ? ' aria-current="true"' : ''} hreflang="en">EN</a>
        <a href="${base}/th${altPath ?? path}"${lang === 'th' ? ' aria-current="true"' : ''} hreflang="th">ไทย</a>
      </div>
      <button class="icon-btn" id="themeBtn2" aria-label="${esc(t.theme)}">${icon('sun')}</button>
    </div>
    <div class="nav-grid">${nav}</div></div></nav>
</header>

<div class="search-shell" id="searchShell" role="dialog" aria-modal="true" aria-label="${esc(t.search)}">
  <div class="search-box">
    <div class="search-input-row">
      ${icon('search')}
      <input id="searchInput" type="search" placeholder="${esc(t.searchPlaceholder)}" autocomplete="off" spellcheck="false">
      <button class="icon-btn" id="searchClose" aria-label="${esc(t.close)}">${icon('close')}</button>
    </div>
    <div class="search-results" id="searchResults"></div>
  </div>
</div>

<main id="main">${body}</main>

<footer class="site-foot"><div class="wrap stack" style="--gap:10px">
  <p>${t.footer}</p>
  <p><a href="${base}/${lang}/about/">${esc(t.nav.about)}</a></p>
</div></footer>
<script src="${base}/app.js" defer></script>
</body>
</html>`;
}

/* ---------- navigation model ---------- */
export const NAV = [
  {
    sec: 'start', links: [
      { key: 'home', href: '/', icon: 'home' },
      { key: 'basics', href: '/guides/', icon: 'book' },
      { key: 'story', href: '/story/', icon: 'sparkles' },
    ]
  },
  {
    sec: 'creatures', links: [
      { key: 'pokedex', href: '/pokedex/', icon: 'dex' },
      { key: 'characters', href: '/characters/', icon: 'users' },
      { key: 'specialties', href: '/specialties/', icon: 'star' },
      { key: 'moves', href: '/moves/', icon: 'bolt' },
    ]
  },
  {
    sec: 'world', links: [
      { key: 'locations', href: '/locations/', icon: 'map' },
      { key: 'habitats', href: '/habitats/', icon: 'leaf' },
      { key: 'building', href: '/building/', icon: 'hammer' },
    ]
  },
  {
    sec: 'things', links: [
      { key: 'items', href: '/items/', icon: 'box' },
      { key: 'recipes', href: '/recipes/', icon: 'package' },
      { key: 'furniture', href: '/furniture/', icon: 'home' },
      { key: 'cooking', href: '/cooking/', icon: 'chef' },
      { key: 'collections', href: '/collections/', icon: 'disc' },
    ]
  },
  {
    sec: 'live', links: [
      { key: 'events', href: '/events/', icon: 'calendar' },
      { key: 'updates', href: '/updates/', icon: 'refresh' },
      { key: 'dlc', href: '/dlc/', icon: 'sparkles' },
      { key: 'about', href: '/about/', icon: 'info' },
    ]
  },
];

/* ---------- UI strings ---------- */
export const EN = {
  site: 'Pokopia Wiki',
  tagline: 'Pokémon Pokopia database',
  skip: 'Skip to content',
  search: 'Search',
  searchPlaceholder: 'Search Pokémon, items, habitats, recipes…',
  close: 'Close',
  menu: 'Menu',
  theme: 'Toggle theme',
  footer: 'A fan-made reference for Pokémon Pokopia. Pokémon and all related names are trademarks of Nintendo, Creatures Inc. and GAME FREAK inc. This site is unofficial and not affiliated with them.',
  navsec: { start: 'Start here', creatures: 'Pokémon', world: 'The world', things: 'Things', live: 'Live' },
  nav: {
    home: 'Home', basics: 'Guides', story: 'Story', pokedex: 'Pokédex', characters: 'Characters',
    specialties: 'Specialties', moves: 'Moves', locations: 'Locations', habitats: 'Habitats',
    building: 'Building', items: 'Items', recipes: 'Crafting', furniture: 'Furniture',
    cooking: 'Cooking', collections: 'Collectibles', events: 'Events', updates: 'Updates',
    dlc: 'Expansion Pass', about: 'About',
  },
  showMore: 'Show more',
  results: n => `${n} result${n === 1 ? '' : 's'}`,
  noResults: 'Nothing found',
  all: 'All',
  filter: 'Filter…',
};

export const TH = {
  site: 'Pokopia Wiki',
  tagline: 'ฐานข้อมูล Pokémon Pokopia',
  skip: 'ข้ามไปยังเนื้อหา',
  search: 'ค้นหา',
  searchPlaceholder: 'ค้นหาโปเกมอน ไอเทม ที่อยู่อาศัย สูตรคราฟต์…',
  close: 'ปิด',
  menu: 'เมนู',
  theme: 'สลับธีมสว่าง/มืด',
  footer: 'เว็บอ้างอิงที่ทำโดยแฟนเกม Pokémon Pokopia — ชื่อ Pokémon และชื่อที่เกี่ยวข้องทั้งหมดเป็นเครื่องหมายการค้าของ Nintendo, Creatures Inc. และ GAME FREAK inc. เว็บนี้ไม่ใช่เว็บทางการและไม่มีส่วนเกี่ยวข้องกับบริษัทดังกล่าว',
  navsec: { start: 'เริ่มต้น', creatures: 'โปเกมอน', world: 'โลกในเกม', things: 'ของในเกม', live: 'อัปเดต' },
  nav: {
    home: 'หน้าแรก', basics: 'คู่มือ', story: 'เนื้อเรื่อง', pokedex: 'โปเกเด็กซ์', characters: 'ตัวละคร',
    specialties: 'ความถนัด', moves: 'ท่าของดิตโต้', locations: 'สถานที่', habitats: 'ที่อยู่อาศัย',
    building: 'การสร้างบ้าน', items: 'ไอเทม', recipes: 'สูตรคราฟต์', furniture: 'เฟอร์นิเจอร์',
    cooking: 'การทำอาหาร', collections: 'ของสะสม', events: 'อีเวนต์', updates: 'แพตช์อัปเดต',
    dlc: 'Expansion Pass', about: 'เกี่ยวกับเว็บนี้',
  },
  showMore: 'ดูเพิ่ม',
  results: n => `${n} รายการ`,
  noResults: 'ไม่พบข้อมูล',
  all: 'ทั้งหมด',
  filter: 'กรอง…',
};

export const T = { en: EN, th: TH };
