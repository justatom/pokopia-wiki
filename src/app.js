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
  let index = null, loading = false, sel = 0, hits = [];

  const openSearch = async () => {
    shell.setAttribute('data-open', '');
    input.focus();
    if (!index && !loading) {
      loading = true;
      try { index = await (await fetch(`${BASE}/search-${LANG}.json`)).json(); }
      catch (e) { index = []; }
      loading = false;
      if (input.value) run();
    }
  };
  const closeSearch = () => { shell.removeAttribute('data-open'); };

  const render = () => {
    if (!hits.length) {
      results.innerHTML = input.value
        ? `<p class="sr-empty">${TH ? 'ไม่พบข้อมูล' : 'Nothing found'}</p>` : '';
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
    $('#searchBtn').addEventListener('click', openSearch);
    $('#searchClose').addEventListener('click', closeSearch);
    shell.addEventListener('click', e => { if (e.target === shell) closeSearch(); });
    let t2;
    input.addEventListener('input', () => { clearTimeout(t2); t2 = setTimeout(run, 90); });
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
