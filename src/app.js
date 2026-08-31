/* Pokopia Wiki — progressive enhancement only. Everything works without JS;
   this adds search, list filtering, the nav drawer and the theme toggle. */
(() => {
  const html = document.documentElement;
  const BASE = document.body.dataset.base || '';
  const LANG = document.body.dataset.lang || 'en';
  const TH = LANG === 'th';
  const $ = s => document.querySelector(s);

  /* ---------- theme ---------- */
  const toggleTheme = () => {
    const dark = html.dataset.theme
      ? html.dataset.theme === 'dark'
      : matchMedia('(prefers-color-scheme: dark)').matches;
    const next = dark ? 'light' : 'dark';
    html.dataset.theme = next;
    try { localStorage.setItem('pkp-theme', next); } catch (e) { }
  };
  document.querySelectorAll('#themeBtn, #themeBtn2').forEach(b => b.addEventListener('click', toggleTheme));

  /* ---------- nav drawer ---------- */
  const menuBtn = $('#menuBtn'), navPanel = $('#navPanel');
  if (menuBtn && navPanel) menuBtn.addEventListener('click', () => {
    const open = navPanel.hasAttribute('data-open');
    navPanel.toggleAttribute('data-open', !open);
    menuBtn.setAttribute('aria-expanded', String(!open));
  });

  /* ---------- list filtering (items / recipes / habitats / dex …) ---------- */
  const filterInput = $('#listFilter'), chipBar = $('#listChips'),
    countEl = $('#listCount'), emptyEl = $('#listEmpty');
  const rowsRoot = $('#listRows');
  if (rowsRoot) {
    const rows = [...rowsRoot.querySelectorAll('[data-s]')];
    let q = '', cat = '';
    const apply = () => {
      let shown = 0;
      for (const el of rows) {
        const okQ = !q || el.dataset.s.includes(q);
        const okC = !cat || (el.dataset.cat || '').split(' ').includes(cat) || el.dataset.cat === cat;
        const ok = okQ && okC;
        el.hidden = !ok;
        if (ok) shown++;
      }
      // hide section headings whose grid ended up empty
      rowsRoot.querySelectorAll('.dex-grid, .rows').forEach(grid => {
        const any = [...grid.children].some(c => !c.hidden);
        const head = grid.previousElementSibling;
        grid.hidden = !any;
        if (head && head.classList.contains('sec-title')) head.hidden = !any;
      });
      if (countEl) countEl.textContent = TH ? `${shown} รายการ` : `${shown} result${shown === 1 ? '' : 's'}`;
      if (emptyEl) emptyEl.hidden = shown > 0;
    };
    let timer;
    if (filterInput) filterInput.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => { q = filterInput.value.trim().toLowerCase(); apply(); }, 120);
    });
    if (chipBar) chipBar.addEventListener('click', e => {
      const chip = e.target.closest('.chip'); if (!chip) return;
      [...chipBar.children].forEach(c => c.setAttribute('aria-pressed', String(c === chip)));
      cat = chip.dataset.cat || '';
      apply();
    });
  }

  /* ---------- search overlay ---------- */
  const shell = $('#searchShell'), input = $('#searchInput'), results = $('#searchResults');
  let index = null, failed = false, loading = null, sel = 0, hits = [];

  /* The index is ~125 KB over the wire, so it can easily still be in flight when someone
     opens the overlay and types straight away. Start it on the first hint of intent, tell
     the user it is loading rather than claiming nothing matched, and let a failure be
     retried — an error used to stick as a permanent empty result until a page reload. */
  const loadIndex = () => {
    if (index || loading) return loading;
    failed = false;
    loading = fetch(`${BASE}/search-${LANG}.json`)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(j => { index = j; })
      .catch(() => { failed = true; })
      .then(() => { loading = null; if (shell.hasAttribute('data-open')) run(); });
    return loading;
  };

  const openSearch = () => {
    shell.setAttribute('data-open', '');
    input.focus();
    loadIndex();
    run();
  };
  const closeSearch = () => { shell.removeAttribute('data-open'); };

  const render = () => {
    if (!hits.length) {
      const msg = !input.value ? ''
        : failed ? (TH ? 'โหลดข้อมูลค้นหาไม่สำเร็จ — พิมพ์อีกครั้งเพื่อลองใหม่' : 'Could not load the search index — type again to retry')
          : !index ? (TH ? 'กำลังโหลด…' : 'Loading…')
            : (TH ? 'ไม่พบข้อมูล' : 'Nothing found');
      results.innerHTML = msg ? `<p class="sr-empty">${msg}</p>` : '';
      return;
    }
    results.innerHTML = hits.map((h, i) => `<a class="sr-item" href="${BASE}${h.u}"${i === sel ? ' data-sel' : ''}>
${h.i ? `<img src="${BASE}${h.i}" alt="" loading="lazy" width="34" height="34">` : ''}
<span><span class="sr-name">${escape2(h.n)}</span>${h.s ? `<br><span class="sr-sub">${escape2(h.s)}</span>` : ''}</span>
<span class="sr-kind">${escape2(h.k)}</span></a>`).join('');
  };
  const escape2 = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const run = () => {
    const q = input.value.trim().toLowerCase();
    if (!q || !index) { hits = []; sel = 0; render(); return; }
    const starts = [], contains = [];
    for (const e of index) {
      const i = e.q.indexOf(q);
      if (i === 0) starts.push(e);
      else if (i > 0) contains.push(e);
      if (starts.length + contains.length > 400) break;
    }
    hits = starts.concat(contains).slice(0, 40);
    sel = 0;
    render();
  };

  if (shell) {
    const btn = $('#searchBtn');
    btn.addEventListener('click', openSearch);
    // start the download on the first sign someone is heading for search, so that by the
    // time the overlay opens the index is usually already there
    ['pointerenter', 'touchstart', 'focus'].forEach(ev =>
      btn.addEventListener(ev, loadIndex, { once: true, passive: true }));
    $('#searchClose').addEventListener('click', closeSearch);
    shell.addEventListener('click', e => { if (e.target === shell) closeSearch(); });
    let t2;
    input.addEventListener('input', () => {
      loadIndex();                       // retries if an earlier attempt failed
      clearTimeout(t2); t2 = setTimeout(run, 90);
    });
    document.addEventListener('keydown', e => {
      if ((e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) {
        e.preventDefault(); openSearch(); return;
      }
      if (!shell.hasAttribute('data-open')) return;
      if (e.key === 'Escape') { closeSearch(); return; }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        sel = Math.max(0, Math.min(hits.length - 1, sel + (e.key === 'ArrowDown' ? 1 : -1)));
        render();
        results.querySelector('[data-sel]')?.scrollIntoView({ block: 'nearest' });
      }
      if (e.key === 'Enter' && hits[sel]) { location.href = BASE + hits[sel].u; }
    });
  }
})();
