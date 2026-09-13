import { SECTIONS, ORDER, ABOUT, CONTACT } from './content.js?v=38';
import { PAPERS } from './papers.js?v=5';
import { ART } from './paperart.js?v=1';
import { PAPERS_EXTRA } from './papers-extra.js?v=1';
import { BLOG } from './blog.js?v=1';
import { BLOGART } from './blogart.js?v=4';
const findDoc = id => PAPERS.find(x => x.id === id) || PAPERS_EXTRA.find(x => x.id === id) || BLOG.find(x => x.id === id);
import { setEnabled as setSfxEnabled, sfx } from './sfx.js?v=5';

// ───────────────────────── helpers ─────────────────────────
const $ = (s, r = document) => r.querySelector(s);
const TOUCH = matchMedia('(pointer: coarse)').matches;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const esc = t => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const plain = t => String(t).replace(/<[^>]+>/g, '');
const crumbs = (...parts) => `<nav class="crumbs" aria-label="Breadcrumb">${parts.map(x => `<span>${esc(plain(x))}</span>`).join('<i>/</i>')}</nav>`;
const lerp = (a, b, t) => a + (b - a) * t;
const easeInOutCubic = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutQuint = t => 1 - Math.pow(1 - t, 5);
const easeInQuad = t => t * t;

function tween({ duration, ease = easeInOutCubic, onUpdate, onComplete }) {
  const t0 = performance.now();
  let cancelled = false;
  function frame(now) {
    if (cancelled) return;
    const p = clamp((now - t0) / duration, 0, 1);
    onUpdate(ease(p), p);
    if (p < 1) requestAnimationFrame(frame); else onComplete && onComplete();
  }
  requestAnimationFrame(frame);
  return () => { cancelled = true; };
}

// ───────────────────────── DOM ─────────────────────────
const body = document.body;
const loader = $('#loader');
const scene = $('#scene');
const zoom = $('#zoom');
const deskImg = $('#desk');
const videos = {};             // key → <video> dolly clip
const screenUis = {};          // key → on-screen UI (ENTER hotspot) over the frozen clip
const spot = $('#spot');
const hint = $('#hint');
const nav = $('#nav');
const hotspotsEl = $('#hotspots');
const detailsEl = $('#details');
const candleGlow = $('#candleGlow');
const dustCanvas = $('#dust');

const ZOOM_SCALE = 3.4;
let state = 'idle';           // idle | zooming | detail | returning
let stopGears = null;          // running clockwork sound (orrery), if any
let activeKey = null;
let cancelZoom = null;

// ───────────────────────── build hotspots, nav, details ─────────────────────────
for (const key of ORDER) {
  const s = SECTIONS[key];

  if (s.video) {
    const v = document.createElement('video');
    v.className = 'dolly';
    v.src = s.video;
    v.muted = true; v.playsInline = true; v.preload = 'auto';
    v.style.setProperty('--fade', (s.videoFade || 0.25) + 's');
    zoom.appendChild(v);
    videos[key] = v;
  }

  const h = document.createElement('button');
  h.className = 'hotspot';
  h.dataset.key = key;
  h.style.left = s.x + '%';
  h.style.top = s.y + '%';
  h.setAttribute('aria-label', `Open ${s.title}`);
  h.innerHTML = `<span class="ring"></span><span class="dot"></span>
    <span class="label"><b>${s.label}</b><small>${s.sub}</small></span>`;
  h.addEventListener('mouseenter', () => focusSpot(s));
  h.addEventListener('mouseleave', () => spot.classList.remove('on'));
  h.addEventListener('click', () => open(key));
  hotspotsEl.appendChild(h);

  const n = document.createElement('button');
  n.textContent = s.sub.replace('The ', '');
  n.addEventListener('click', () => open(key));
  n.addEventListener('mouseenter', () => focusSpot(s));
  n.addEventListener('mouseleave', () => spot.classList.remove('on'));
  nav.appendChild(n);

  if (s.landing) { buildLanding(key, s); continue; }

  const d = document.createElement('section');
  d.className = 'detail';
  d.dataset.key = key;
  let cropStyle = '';
  if (s.crop) cropStyle = `style="transform-origin:${s.crop.x}% ${s.crop.y}%; transform:scale(${s.crop.scale})"`;
  else if (s.focus) {
    // slide the image so point x% sits in the middle of the area left of the panel (~28vw)
    const shift = 28 - 50 - (s.focus.x - 50) * s.focus.scale;
    cropStyle = `class="focus" style="--fx:${shift.toFixed(1)}%; --fs:${s.focus.scale}"`;
  }
  d.innerHTML = `
    <div class="detail-bg"><img src="${s.image}" alt="${esc(plain(s.title))}" ${cropStyle} draggable="false"></div>
    <button class="back" aria-label="Back to the desk">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>
      Back to the desk
    </button>
    <aside class="panel">
      <p class="eyebrow">${s.eyebrow}</p>
      <h2>${titleWithEm(s.title)}</h2>
      <p class="blurb">${s.blurb}</p>
      <div class="divider"></div>
      <div class="cards">
        ${s.items.map(it => `
          <article class="card">
            <span class="tag">${it.tag}</span>
            <span class="title">${it.title}</span>
            <span class="desc">${it.desc}</span>
          </article>`).join('')}
      </div>
    </aside>`;
  d.querySelector('.back').addEventListener('click', close);
  detailsEl.appendChild(d);
}

// A section that plays its clip and freezes on the last frame (no panel).
// Optional: an ENTER hotspot on the frozen frame that opens a full page.
function buildLanding(key, s) {
  const d = document.createElement('section');
  d.className = 'detail landing';
  d.dataset.key = key;
  d.innerHTML = `
    <div class="flash"></div>
    <button class="back" aria-label="Back to the desk">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>
      Back to the desk
    </button>`;
  d.querySelector('.back').addEventListener('click', close);
  detailsEl.appendChild(d);

  if (s.enter) {
    const ui = document.createElement('div');
    ui.className = 'screen-ui';
    ui.innerHTML = `
      <button class="enter" aria-label="Enter ${s.title}"
        style="left:${s.enter.x}%; top:${s.enter.y}%; width:${s.enter.w}%; height:${s.enter.h}%">
        <span class="enter-hint">click enter</span>
      </button>`;
    ui.querySelector('.enter').addEventListener('click', () => openPage(key));
    zoom.appendChild(ui);
    screenUis[key] = ui;
  }

  if (!s.page) return;
  if (s.page === 'newspaper') { buildNewspaper(key, s); return; }
  if (s.page === 'dna') { buildDna(key, s); return; }
  if (s.page === 'logbook') { buildLogbook(key, s); return; }
  if (s.projects) { buildConsole(key, s); return; }
  const pg = document.createElement('section');
  pg.className = 'page';
  pg.dataset.key = key;
  pg.innerHTML = `
    <header class="page-top">
      <button class="back" aria-label="Back to the desk">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>
        Back to the desk
      </button>
      <span class="page-brand">Dr. Avana Framroz Patel</span>
    </header>
    <div class="page-inner">
      <section class="hero">
        <p class="eyebrow">${s.eyebrow}</p>
        <h2 class="page-h1">${titleWithEm(s.title)}</h2>
        <p class="blurb">${s.blurb}</p>
      </section>
      <div class="divider"></div>
      <section class="grid">
        ${s.items.map(it => `
          <article class="card">
            <span class="tag">${it.tag}</span>
            <span class="title">${it.title}</span>
            <span class="desc">${it.desc}</span>
          </article>`).join('')}
      </section>
    </div>`;
  pg.querySelector('.back').addEventListener('click', close);
  detailsEl.appendChild(pg);
}

// ───────────────────────── the MedTech console (laptop) ─────────────────────────
function buildConsole(key, s) {
  const pg = document.createElement('section');
  pg.className = 'page console';
  pg.dataset.key = key;
  pg.innerHTML = `
    <div class="con-bg"><div class="con-grid"></div><div class="con-scan"></div></div>
    <header class="page-top">
      <button class="back" aria-label="Back to the desk">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>
        Back to the desk
      </button>
      <span class="con-status"><i></i> SYSTEM ONLINE · ${s.projects.length} MODULES</span>
    </header>
    <div class="con-inner">
      <section class="con-hero">
        <p class="con-eyebrow">${esc(s.eyebrow)} · AI &amp; MEDTECH</p>
        <h2 class="con-title">${titleWithEm(s.title)}</h2>
        <p class="con-blurb">${esc(s.blurb)}</p>
      </section>
      <section class="con-grid-tiles">
        ${s.projects.map(P => `
        <article class="tile" data-project="${P.id}" tabindex="0" role="button">
          <span class="tile-corners" aria-hidden="true"></span>
          <div class="tile-media">
            ${P.media.video
              ? `<video muted loop playsinline preload="none" poster="${P.media.poster || ''}" src="${P.media.video}"></video>`
              : `<img src="${P.media.image}" alt="${esc(P.title)}" loading="lazy">`}
            <span class="tile-code">MODULE ${esc(P.code)}</span>
          </div>
          <div class="tile-text">
            <h2>${esc(P.title)}</h2>
            <p class="tile-kicker">${esc(P.kicker)}</p>
            <p class="tile-tags">${P.tags.map(t => `<span>${esc(t)}</span>`).join('')}</p>
          </div>
          <span class="tile-go">OPEN →</span>
        </article>`).join('')}
      </section>
      <p class="foot con-foot">Select a module</p>
    </div>`;
  pg.querySelector('.back').addEventListener('click', close);
  // hover preview: play the demo silently
  pg.querySelectorAll('.tile').forEach(t => {
    const v = t.querySelector('video');
    if (v) {
      t.addEventListener('mouseenter', () => { v.play().catch(() => {}); });
      t.addEventListener('mouseleave', () => { v.pause(); });
    }
    t.addEventListener('click', () => openProject(key, t.dataset.project));
    t.addEventListener('keydown', e => { if (e.key === 'Enter') openProject(key, t.dataset.project); });
  });
  detailsEl.appendChild(pg);

  s.projects.forEach(P => {
    const pp = document.createElement('section');
    pp.className = 'page console project';
    pp.dataset.key = key; pp.dataset.project = P.id;
    const linkBtn = l => {
      if (l.video) return `<button class="con-btn" data-scroll="media">▶ ${esc(l.label)}</button>`;
      if (l.file) return `<button class="con-btn" data-file="${l.file}" data-title="${esc(l.title || l.label)}">${esc(l.label)}</button>`;
      if (l.paper) return `<button class="con-btn" data-paper="${l.paper}">${esc(l.label)}</button>`;
      if (l.href) return `<a class="con-btn" href="${l.href}" target="_blank" rel="noopener">${esc(l.label)} ↗</a>`;
      return '';
    };
    pp.innerHTML = `
      <div class="con-bg"><div class="con-grid"></div><div class="con-scan"></div></div>
      <header class="page-top">
        <button class="back" aria-label="Back to the modules">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>
          Back to the modules
        </button>
        <span class="con-status"><i></i> MODULE ${esc(P.code)} · ${esc(P.title).toUpperCase()}</span>
      </header>
      <div class="con-inner project-inner">
        <section class="proj-head">
          <p class="con-eyebrow">MODULE ${esc(P.code)} · ${esc(P.kicker)}</p>
          <h2 class="con-title">${esc(P.title)}</h2>
          <p class="proj-tagline">${esc(P.tagline)}</p>
          <p class="tile-tags">${P.tags.map(t => `<span>${esc(t)}</span>`).join('')}</p>
          <div class="proj-actions">${(P.links || []).map(linkBtn).join('')}</div>
        </section>
        <section class="proj-media" id="media-${P.id}">
          <span class="tile-corners" aria-hidden="true"></span>
          ${P.media.video
            ? `<video controls playsinline preload="metadata" poster="${P.media.poster || ''}" src="${P.media.video}"></video>`
            : `<img src="${P.media.image}" alt="${esc(P.title)}">`}
        </section>
        <section class="proj-body">
          <div class="proj-text">${(P.body || []).map(t => `<p>${esc(t)}</p>`).join('')}</div>
          <aside class="proj-side">
            <h3>Capabilities</h3>
            <ul class="proj-features">${(P.features || []).map(f => `<li>${esc(f)}</li>`).join('')}</ul>
          </aside>
        </section>
      </div>`;
    pp.querySelector('.back').addEventListener('click', () => {
      const v = pp.querySelector('video'); if (v) v.pause();
      pp.classList.remove('on');
    });
    pp.querySelectorAll('[data-scroll="media"]').forEach(b => b.addEventListener('click', () => {
      const m = pp.querySelector('.proj-media'); m.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const v = m.querySelector('video'); if (v) v.play().catch(() => {});
    }));
    detailsEl.appendChild(pp);
  });
}
function openProject(key, id) {
  const pp = detailsEl.querySelector(`.page.project[data-key="${key}"][data-project="${id}"]`);
  if (!pp) return;
  pp.classList.add('on');
  requestAnimationFrame(() => { pp.scrollTop = 0; });
  setTimeout(() => { pp.scrollTop = 0; }, 120);
}

// ───────────────────────── the DNA helix (medical portfolio) ─────────────────────────
const dnaScenes = {};
function sectionPageHTML(sec, backLabel, parent) {
  return `
    <header class="page-top">
      <button class="back" aria-label="${backLabel}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>
        ${backLabel}
      </button>
      ${crumbs('The desk', parent || '', sec.title)}
      <span class="page-brand">Dr. Avana Framroz Patel</span>
    </header>
    <div class="page-inner">
      <section class="hero">
        <p class="eyebrow">${sec.eyebrow}</p>
        <h2 class="page-h1">${titleWithEm(sec.title)}</h2>
        <p class="blurb">${sec.blurb}</p>
      </section>
      <div class="divider"></div>
      ${sec.roadmap ? roadmapHTML(sec.roadmap) : sec.groups ? ledgerHTML(sec.groups) : `
      <section class="grid${(sec.items || []).some(it => it.paper) ? ' papers' : ''}">
        ${(sec.items || []).map(it => {
          if (it.paper) {
            const P = findDoc(it.paper); if (!P) return '';
            return `
          <article class="card paper-card has-file" data-paper="${P.id}">
            <span class="tag">${esc(it.tag || P.kind)}${P.year ? ` · ${esc(P.year)}` : ''}</span>
            <span class="title">${esc(P.title)}</span>
            ${P.subtitle ? `<span class="subtitle">${esc(P.subtitle)}</span>` : ''}
            <span class="desc">${esc(P.summary)}</span>
            <span class="view">Read →</span>
          </article>`;
          }
          return `
          <article class="card${it.file ? ' has-file' : ''}" ${it.file ? `data-file="${it.file}" data-title="${esc(it.title)}"` : ''}>
            <span class="tag">${it.tag}</span>
            <span class="title">${it.title}</span>
            <span class="desc">${it.desc}</span>
            ${it.file ? '<span class="view">View document →</span>' : ''}
          </article>`;
        }).join('')}
      </section>`}
    </div>`;
}
function roadmapHTML(R) {
  const fmt = s => new Date(s + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return `
    <div class="road-stage" data-roadmap></div>`;
}
function ledgerHTML(groups) {
  return groups.map((g, gi) => `
    <section class="ledger${g.open ? ' open' : ''}">
      <button class="ledger-head" aria-expanded="${g.open ? 'true' : 'false'}">
        <span class="ledger-title">${esc(g.title)}</span>
        <span class="ledger-count">${g.items.length}</span>
        <span class="ledger-chev" aria-hidden="true"></span>
      </button>
      <div class="ledger-body"><div>
        <ol class="ledger-list">
          ${g.items.map(it => `
          <li class="entry${it.file ? ' has-file' : ''}" ${it.file ? `data-file="${it.file}" data-title="${esc(it.title)}" tabindex="0" role="button"` : ''}>
            <span class="tag">${esc(it.tag)}</span>
            <span class="entry-main"><span class="title">${esc(it.title)}</span><span class="issuer">${esc(it.issuer)}</span></span>
            <span class="date">${esc(it.date)}</span>
            <span class="view" aria-hidden="true">${it.file ? 'View' : ''}</span>
          </li>`).join('')}
        </ol>
      </div></div>
    </section>`).join('');
}
detailsEl.addEventListener('click', e => {
  const head = e.target.closest('.ledger-head');
  if (!head) return;
  const sec = head.parentElement;
  const open = !sec.classList.contains('open');
  sec.classList.toggle('open', open);
  head.setAttribute('aria-expanded', open ? 'true' : 'false');
});

// ───────────────────────── paper reader ─────────────────────────
const reader = document.createElement('section');
reader.className = 'page reader';
reader.innerHTML = `
  <header class="page-top">
    <button class="back" aria-label="Back">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>
      Back
    </button>
    <nav class="crumbs" aria-label="Breadcrumb"></nav>
    <span class="page-brand">Dr. Avana Framroz Patel</span>
  </header>
  <i class="read-progress" aria-hidden="true"></i>
  <article class="paper"></article>`;
detailsEl.appendChild(reader);
// a thin gold line that fills as you read
function trackReading(page) {
  const bar = page.querySelector('.read-progress'); if (!bar) return;
  page.addEventListener('scroll', () => { const max = page.scrollHeight - page.clientHeight; bar.style.transform = `scaleX(${max > 0 ? Math.min(1, page.scrollTop / max) : 0})`; }, { passive: true });
}
trackReading(reader);
reader.querySelector('.back').addEventListener('click', () => closeReader());

function renderBlock(b) {
  switch (b.t) {
    case 'h2': return `<h2>${esc(b.x)}</h2>`;
    case 'h3': return `<h3>${esc(b.x)}</h3>`;
    case 'p': return b.lead ? `<p><strong>${esc(b.lead)}:</strong> ${esc(b.x.replace(/^[^:]+:\s*/, ''))}</p>` : `<p>${esc(b.x)}</p>`;
    case 'ul': return `<ul>${b.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>`;
    case 'ol': return `<ol>${b.items.map(i => `<li>${esc(i)}</li>`).join('')}</ol>`;
    case 'cap': return `<p class="caption"><span class="fig-label">${esc(b.k)} ${esc(b.n)}</span> ${esc(b.x)}</p>`;
    case 'fig': {
      const imgs = b.srcs || (b.src ? [b.src] : []);
      if (imgs.length) return `<figure class="doc-fig${b.k === 'Table' ? ' is-table' : ''}">${imgs.map(u => `<img src="${u}" alt="${esc(b.k)} ${esc(b.n)}" loading="lazy">`).join('')}<figcaption><span class="fig-label">${esc(b.k)} ${esc(b.n)}</span> ${esc(b.x)}</figcaption></figure>`;
      if (b.withheld) return `<p class="figure withheld"><span class="fig-label">${esc(b.k)} ${esc(b.n)}</span> ${esc(b.x)} <span class="fig-note">Withheld: patient images and histopathology are available from the author on request; confidential until publication</span></p>`;
      return `<p class="figure"><span class="fig-label">${esc(b.k)} ${esc(b.n)}</span> ${esc(b.x)} <span class="fig-note">${b.k === 'Table' ? 'table' : 'figure'} not reproduced</span></p>`;
    }
    case 'table': return `<div class="tablewrap"><table>${b.rows.map((r, i) => `<tr>${r.map(c => i === 0 ? `<th>${esc(c)}</th>` : `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</table></div>`;
    case 'refs': return `<ol class="refs">${b.items.map(i => `<li>${esc(i)}</li>`).join('')}</ol>`;
    case 'poster': return `<figure class="doc-fig poster"><span class="poster-label">Summary poster</span>${BLOGART.poster(b.key)}</figure>`;
    case 'art': return `<figure class="doc-fig art">${BLOGART[b.key] ? BLOGART[b.key]() : ''}<figcaption><span class="fig-label">${esc(b.k)} ${esc(b.n)}</span> ${esc(b.x)}</figcaption></figure>`;
    default: return '';
  }
}
function openReader(id) {
  const P = findDoc(id); if (!P) return;
  const body = P.blocks.map(renderBlock).join('');
  // affiliation and confidentiality tags live inside the document, not on the card
  const tags = [];
  if (P.affiliation === 'qmul') tags.push('<span class="paper-tag">Written as part of coursework at Queen Mary University of London, Barts and The London School of Medicine and Dentistry</span>');
  if (P.grade) tags.push(`<span class="paper-tag grade">${esc(P.grade)}</span>`);
  if (P.confidential) tags.push(`<span class="paper-tag confidential">${esc(P.confidential)}</span>`);
  reader.querySelector('.paper').innerHTML = `
    <header class="paper-head">
      <p class="eyebrow">${esc(P.kind)}${P.year ? ` · ${esc(P.year)}` : ''}${P.tag ? ` · ${esc(P.tag)}` : ''}</p>
      <h2 class="page-h1">${esc(P.title)}</h2>
      ${P.subtitle ? `<p class="subtitle">${esc(P.subtitle)}</p>` : ''}
      <p class="byline">${esc(P.authors || 'Avana Framroz Patel')}</p>
      <div class="paper-tags">${tags.join('')}</div>
      <p class="summary">${esc(P.summary)}</p>
      ${P.pdf ? `<p class="paper-links"><a href="#" data-file="${P.pdf}" data-title="${esc(P.title)}">Original document with figures and tables →</a></p>` : ''}
    </header>
    <div class="paper-body">${body}</div>`;
  reader.querySelector('.crumbs').innerHTML = crumbs('The desk', 'Medicine & Surgery', P.kind === 'Blog' ? 'Medical Blog' : 'Research', P.kind === 'Blog' ? 'Post' : P.kind).replace(/^<nav[^>]*>|<\/nav>$/g, '');
  reader.classList.add('on');
  requestAnimationFrame(() => { reader.scrollTop = 0; });
}
function closeReader() { if (!reader.classList.contains('on')) return false; reader.classList.remove('on'); return true; }
detailsEl.addEventListener('click', e => {
  const el = e.target.closest('[data-paper]');
  if (el) openReader(el.dataset.paper);
});

// ───────────────────────── about me ─────────────────────────
const aboutPage = document.createElement('section');
aboutPage.className = 'page about';
aboutPage.innerHTML = `
  <header class="page-top">
    <button class="back" aria-label="Back to the desk">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>
      Back to the desk
    </button>
    <span class="page-brand">${esc(ABOUT.name)}</span>
  </header>
  <section class="about-hero">
    <div class="xray-bg"></div>
    <img class="xray" src="${ABOUT.hero.xray}" alt="X-ray style rendering of the same portrait, revealed under the cursor" draggable="false">
    <canvas class="skin"></canvas>
    <div class="xray-cursor" aria-hidden="true"><span></span></div>
    <div class="about-text">
      <p class="eyebrow">About me · ${esc(ABOUT.where)}</p>
      <h2 class="page-h1">${titleWithEm(ABOUT.name.replace('Dr. ', ''))}</h2>
      <p class="role">${esc(ABOUT.role)}</p>
      <p class="intro">${esc(ABOUT.intro)}</p>
      <p class="about-hint">Move your cursor over the portrait</p>
    </div>
  </section>
  <div class="page-inner about-inner">
    <div class="about-body">
      ${ABOUT.paragraphs.map(t => `<p class="body">${esc(t)}</p>`).join('')}
      ${ABOUT.cv ? `<p class="cv"><a href="#" data-file="${ABOUT.cv}" data-title="Curriculum vitae">View my CV →</a></p>` : ''}
    </div>
    <section class="contact" id="contact">
      <p class="eyebrow">Contact me</p>
      <h2>Get in <em>touch</em></h2>
      <p class="blurb">${esc(CONTACT.blurb)}</p>
      <dl class="contact-rows">
        ${CONTACT.rows.map(r => `<div><dt>${esc(r.k)}</dt><dd>${r.href ? `<a href="${r.href}"${/^https?:/.test(r.href) ? ' target="_blank" rel="noopener"' : ''}>${esc(r.v)}</a>` : esc(r.v)}</dd></div>`).join('')}
      </dl>
      <p class="legal"><a href="privacy.html">Privacy</a><i>·</i><a href="terms.html">Terms</a><i>·</i><span>© 2026 Dr. Avana Framroz Patel</span></p>
    </section>
  </div>`;
detailsEl.appendChild(aboutPage);
let xray = null;
async function mountXray() {
  if (xray) return xray;
  try {
    const mod = await import('./xray.js?v=2');
    xray = mod.createXray(aboutPage.querySelector('.about-hero'), ABOUT.hero);
    window.__xray = xray;   // handy for tuning the alignment from the console
  } catch (err) { console.error('X-ray effect failed to load', err); }
  return xray;
}
function openAbout(toContact) {
  if (state !== 'idle') return;
  aboutPage.classList.add('on'); body.classList.add('about-open');
  mountXray().then(x => x && x.start());
  if (toContact) setTimeout(() => aboutPage.querySelector('#contact').scrollIntoView({ behavior: 'smooth', block: 'start' }), 350);
  else requestAnimationFrame(() => { aboutPage.scrollTop = 0; });
}
function closeAbout() { if (!aboutPage.classList.contains('on')) return false; aboutPage.classList.remove('on'); body.classList.remove('about-open'); if (xray) setTimeout(() => xray.stop(), 900); return true; }
aboutPage.querySelector('.back').addEventListener('click', closeAbout);
$('#aboutBtn').addEventListener('click', () => openAbout(false));
$('#contactBtn').addEventListener('click', () => openAbout(true));

// ───────────────────────── document viewer (PDF / image) ─────────────────────────
const viewer = document.createElement('div');
viewer.className = 'viewer';
viewer.hidden = true;
viewer.innerHTML = `
  <div class="viewer-back"></div>
  <figure class="viewer-frame">
    <div class="viewer-top">
      <span class="viewer-title"></span>
      <a class="viewer-open" target="_blank" rel="noopener">Open in new tab ↗</a>
      <button class="viewer-close" aria-label="Close">✕</button>
    </div>
    <div class="viewer-body"></div>
  </figure>`;
document.body.appendChild(viewer);
function openDoc(file, title) {
  const body = viewer.querySelector('.viewer-body');
  const isImg = /\.(png|jpe?g|webp|gif)$/i.test(file);
  body.innerHTML = isImg
    ? `<img src="${file}" alt="${esc(title)}">`
    : `<iframe src="${file}#toolbar=0&navpanes=0&view=FitH" title="${esc(title)}"></iframe>`;
  viewer.querySelector('.viewer-title').textContent = title;
  viewer.querySelector('.viewer-open').href = file;
  viewer.hidden = false;
  requestAnimationFrame(() => viewer.classList.add('on'));
}
function closeDoc() {
  if (viewer.hidden) return false;
  viewer.classList.remove('on');
  setTimeout(() => { viewer.hidden = true; viewer.querySelector('.viewer-body').innerHTML = ''; }, 350);
  return true;
}
viewer.querySelector('.viewer-back').addEventListener('click', closeDoc);
viewer.querySelector('.viewer-close').addEventListener('click', closeDoc);
detailsEl.addEventListener('click', e => {
  const el = e.target.closest('[data-file]');
  if (el) { e.preventDefault(); openDoc(el.dataset.file, el.dataset.title || ''); }
});
detailsEl.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.matches('[data-file]')) openDoc(e.target.dataset.file, e.target.dataset.title || '');
});
function buildDna(key, s) {
  const D = s.dna;
  const pg = document.createElement('section');
  pg.className = 'page dna';
  pg.dataset.key = key;
  pg.innerHTML = `
    <div class="dna-stage"></div>
    <div class="dna-copy">
      <p class="eyebrow">${D.eyebrow}</p>
      <h2 class="page-h1">${titleWithEm(D.title)}</h2>
      <p class="blurb">${matchMedia('(pointer: coarse)').matches && D.blurbTouch ? D.blurbTouch : D.blurb}</p>
    </div>
    <button class="back" aria-label="Back to the desk">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>
      Back to the desk
    </button>`;
  pg.querySelector('.back').addEventListener('click', close);
  detailsEl.appendChild(pg);

  D.sections.forEach((sec, i) => {
    const sp = document.createElement('section');
    sp.className = 'page section' + (sec.roadmap ? ' has-road' : '');
    sp.dataset.key = key; sp.dataset.sec = i;
    sp.innerHTML = sectionPageHTML(sec, 'Back to the helix', D.title);
    sp.querySelector('.back').addEventListener('click', () => { sp.classList.remove('on'); if (sp._road) sp._road.stop(); if (dnaScenes[key]) dnaScenes[key].resetView(); });
    detailsEl.appendChild(sp);
  });

  pg._openSection = async i => {
    const sp = detailsEl.querySelector(`.page.section[data-key="${key}"][data-sec="${i}"]`);
    if (!sp) return;
    sp.scrollTop = 0; sp.classList.add('on');
    const stage = sp.querySelector('[data-roadmap]');
    if (stage) {
      if (!sp._road) { const mod = await import('./roadmap.js?v=3'); sp._road = mod.createRoadmap(stage, D.sections[i].roadmap); }
      sp._road.arrive();
    }
  };
}
async function mountDna(key, page) {
  if (dnaScenes[key]) return dnaScenes[key];
  const s = SECTIONS[key];
  try {
    const mod = await import('./dna.js?v=24');
    dnaScenes[key] = mod.createDna(page.querySelector('.dna-stage'), s.dna.sections, i => page._openSection(i));
    return dnaScenes[key];
  } catch (err) { console.error('DNA scene failed to load', err); return null; }
}

// ───────────────────────── the logbook ─────────────────────────
function buildLogbook(key, s) {
  const L = s.logbook;
  const cell = v => v ? esc(v) : '';
  const pg = document.createElement('section');
  pg.className = 'page logbook';
  pg.dataset.key = key;
  pg.innerHTML = `
    <header class="page-top">
      <button class="back" aria-label="Back to the desk">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>
        Back to the desk
      </button>
      ${crumbs('The desk', 'Logbook')}
      <span class="page-brand">Dr. Avana Framroz Patel</span>
    </header>
    <div class="page-inner log-inner">
      <section class="hero">
        <p class="eyebrow">${esc(s.eyebrow)}</p>
        <h2 class="page-h1">${titleWithEm('Surgical Logbook')}</h2>
        <p class="blurb">${esc(L.intro)}</p>
      </section>
      <section class="ledger-book">
        <div class="ledger-head-row"><span>Theatre cases</span><span class="count">${L.cases.length} entries</span></div>
        <div class="tablewrap">
          <table class="log-table">
            <thead><tr><th>No.</th><th>Procedure</th><th>Specialty</th><th>Role</th><th>Supervising surgeon</th><th>Where</th><th>When</th></tr></thead>
            <tbody>
              ${L.cases.map((c, i) => `
              <tr>
                <td class="num">${String(i + 1).padStart(2, '0')}</td>
                <td class="proc">${esc(c.procedure)}</td>
                <td>${cell(c.specialty)}</td>
                <td><span class="role">${cell(c.role)}</span></td>
                <td>${cell(c.surgeon)}</td>
                <td>${cell(c.where)}</td>
                <td class="num">${cell(c.when)}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </section>
      <section class="ledger-book">
        <div class="ledger-head-row"><span>Ongoing projects</span><span class="count">${L.projects.length} open</span></div>
        <div class="projects">
          ${L.projects.map(p => `
          <article class="log-project">
            <div class="log-project-top">
              <span class="tag">${esc(p.kind)}</span>
              <span class="status">${esc(p.status)}</span>
            </div>
            <h3>${esc(p.title)}</h3>
            <p class="meta">${[p.where, p.when].filter(Boolean).map(esc).join(' · ')}</p>
            <p class="desc">${esc(p.desc)}</p>
          </article>`).join('')}
        </div>
      </section>
      <p class="foot">Entries are added as the logbook grows</p>
    </div>`;
  pg.querySelector('.back').addEventListener('click', close);
  detailsEl.appendChild(pg);
}

// ───────────────────────── the newspaper (blog) ─────────────────────────
function buildNewspaper(key, s) {
  const pg = document.createElement('section');
  pg.className = 'page newspaper';
  pg.dataset.key = key;
  const P = s.paper;
  const arts = s.articles || [];
  const lead = arts[0];
  const rest = arts.slice(1);
  const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');

  const paras = a => (a.intro || a.body || []);
  const firstPara = a => paras(a)[0] || (a.sections && a.sections[0] && a.sections[0].p[0]) || '';
  pg.innerHTML = `
    <div class="paper">
      <div class="paper-tools">
        <button class="back paper-link" aria-label="Back to the desk">← Back to the desk</button>
        <button class="front-link paper-link" hidden>← Front page</button>
      </div>
      <header class="masthead">
        <div class="ears"><span>${esc(P.volume)}</span><span>${esc(P.motto)}</span></div>
        <h2 class="paper-name">${esc(P.name)}</h2>
        <div class="dateline"><span>${esc(P.est)}</span><span>An account of philosophical, cultural and political concepts that interest me.</span><span>${esc(P.price)}</span></div>
      </header>

      <section class="front">
        ${lead ? `
        <article class="lead" data-i="0">
          <p class="kicker">${esc(lead.kicker)}</p>
          <h2 class="headline"><a href="#" data-i="0">${esc(lead.title)}</a></h2>
          <p class="deck">${esc(lead.deck)}</p>
          <p class="byline">By ${esc(P.byline)} · ${esc(lead.date)}</p>
          ${lead.art && ART[lead.art.id] ? `<figure class="art">${ART[lead.art.id]()}<figcaption>${esc(lead.art.caption)}</figcaption></figure>` : ''}
          <div class="cols dropcap">${paras(lead).map(b => `<p>${esc(b)}</p>`).join('')}</div>
          <p class="more"><a href="#" data-i="0">Continue reading →</a></p>
        </article>` : ''}
        ${rest.length ? `<div class="rule-double"></div>
        <div class="below-fold">
          ${rest.map((a, i) => `
          <article class="teaser">
            <p class="kicker">${esc(a.kicker)}</p>
            <h3 class="headline"><a href="#" data-i="${i + 1}">${esc(a.title)}</a></h3>
            ${a.deck ? `<p class="deck small">${esc(a.deck)}</p>` : ''}
            <p class="byline">${esc(a.date)}</p>
            <p class="excerpt">${esc(firstPara(a))}</p>
            <p class="more"><a href="#" data-i="${i + 1}">Continue reading →</a></p>
          </article>`).join('')}
        </div>` : ''}
      </section>

      <section class="reader" hidden></section>

      <footer class="colophon">${esc(P.name)} · ${esc(P.motto)} · Printed on the desk of ${esc(P.byline)}</footer>
    </div>`;

  const front = pg.querySelector('.front');
  const reader = pg.querySelector('.reader');
  const frontLink = pg.querySelector('.front-link');
  const showFront = () => { reader.hidden = true; front.hidden = false; frontLink.hidden = true; pg.scrollTop = 0; };
  const showArticle = i => {
    const a = arts[i]; if (!a) return;
    const quotes = a.quotes || {};
    const sections = (a.sections || []).map((sec, k) => `
      <h3 class="crosshead">${esc(sec.h)}</h3>
      <div class="cols${k === 0 && !paras(a).length ? ' dropcap' : ''}">${sec.p.map(b => `<p>${esc(b)}</p>`).join('')}</div>
      ${quotes[k] ? `<blockquote class="pull">${esc(quotes[k])}</blockquote>` : ''}`).join('');
    reader.innerHTML = `
      <article class="full">
        <p class="kicker">${esc(a.kicker)}</p>
        <h2 class="headline">${esc(a.title)}</h2>
        <p class="deck">${esc(a.deck)}</p>
        <p class="byline">By ${esc(P.byline)} · ${esc(a.date)}</p>
        ${a.art && ART[a.art.id] ? `<figure class="art">${ART[a.art.id]()}<figcaption>${esc(a.art.caption)}</figcaption></figure>` : ''}
        ${paras(a).length ? `<div class="cols dropcap">${paras(a).map(b => `<p>${esc(b)}</p>`).join('')}</div>` : ''}
        ${sections}
        ${a.bibliography ? `<h3 class="crosshead biblio-head">Bibliography</h3><ol class="biblio">${a.bibliography.map(b => `<li>${esc(b)}</li>`).join('')}</ol>` : ''}
        <p class="end-mark">◆</p>
      </article>`;
    front.hidden = true; reader.hidden = false; frontLink.hidden = false; pg.scrollTop = 0;
  };
  pg.addEventListener('click', e => {
    const a = e.target.closest('a[data-i]');
    if (a) { e.preventDefault(); showArticle(+a.dataset.i); }
  });
  frontLink.addEventListener('click', showFront);
  pg.querySelector('.back').addEventListener('click', close);
  pg._showFront = showFront;
  detailsEl.appendChild(pg);
}

function openPage(key) {
  if (state !== 'detail') return;
  state = 'page';
  const s = SECTIONS[key];
  const detail = detailsEl.querySelector(`.detail[data-key="${key}"]`);
  const page = detailsEl.querySelector(`.page[data-key="${key}"]`);
  if (screenUis[key]) screenUis[key].classList.remove('on');
  if (stopGears && s.page !== 'newspaper') { stopGears(1.4); stopGears = null; }   // ambience ends as the page opens (the paper keeps its own timing)

  if (s.page === 'dna') {
    // fade the eye to black, then let the helix build itself out of the dark
    zoom.style.transformOrigin = '50% 50%';
    zoom.style.transition = 'filter 1.1s ease, transform 3s ease-out';
    requestAnimationFrame(() => { zoom.style.filter = 'brightness(0)'; zoom.style.transform = 'scale(1.12)'; });
    detail.classList.remove('on');
    page.classList.add('dark');
    const ready = mountDna(key, page);
    setTimeout(() => { page.classList.add('on'); }, 700);
    setTimeout(() => {
      page.classList.remove('dark');
      ready.then(sc => { if (sc && state === 'page' && activeKey === key) sc.start({ build: true }); });
    }, 1500);
    return;
  }

  if (s.page === 'logbook') {
    zoom.style.transition = 'filter 1.2s ease';
    requestAnimationFrame(() => { zoom.style.filter = 'blur(10px) brightness(0.35)'; });
    detail.classList.remove('on');
    setTimeout(() => { page.classList.add('on'); page.scrollTop = 0; }, 150);
    return;
  }

  if (s.page === 'newspaper') {
    // the frozen frame slowly yellows and drifts while the paper fades in over it
    zoom.style.transformOrigin = '50% 50%';
    zoom.style.transition = 'filter 1.6s ease, transform 8s ease-out';
    requestAnimationFrame(() => {
      zoom.style.filter = 'sepia(0.55) brightness(0.65)';
      zoom.style.transform = 'scale(1.06)';
    });
    detail.classList.remove('on');
    if (page._showFront) page._showFront();
    setTimeout(() => { page.classList.add('on'); sfx.paper(); }, 250);
    setTimeout(() => { if (stopGears) { stopGears(1.6); stopGears = null; } }, 900);
    return;
  }

  detail.classList.add('entering');            // flash
  // dive the frozen frame into the screen
  const dv = s.dive || { x: 50, y: 50 };
  zoom.style.transformOrigin = `${dv.x}% ${dv.y}%`;
  zoom.style.transition = 'transform 1.1s cubic-bezier(0.7, 0, 0.3, 1), filter 1.1s ease';
  requestAnimationFrame(() => {
    zoom.style.transform = 'scale(2.6)';
    zoom.style.filter = 'brightness(1.5) blur(4px)';
  });
  setTimeout(() => { page.classList.add('on'); page.scrollTop = 0; }, 650);
}

function titleWithEm(t) {
  // italicise the last word for a little typographic flourish
  const parts = t.split(' ');
  if (parts.length < 2) return t;
  const last = parts.pop();
  return `${parts.join(' ')} <em>${last}</em>`;
}

function focusSpot(s) {
  // convert scene % to viewport % (scene is centred and slightly larger than viewport)
  const r = zoom.getBoundingClientRect();
  const px = r.left + (s.x / 100) * r.width;
  const py = r.top + (s.y / 100) * r.height;
  spot.style.setProperty('--sx', (px / innerWidth) * 100 + '%');
  spot.style.setProperty('--sy', (py / innerHeight) * 100 + '%');
  spot.classList.add('on');
}

// ───────────────────────── parallax ─────────────────────────
const mouse = { x: 0, y: 0 };
const cur = { x: 0, y: 0 };
addEventListener('pointermove', e => {
  mouse.x = (e.clientX / innerWidth - 0.5) * 2;
  mouse.y = (e.clientY / innerHeight - 0.5) * 2;
});
let parallaxOn = true;
// On narrow / portrait viewports the 16:9 scene overflows sideways; slide it so the
// desk objects (which live around 43% of the image width) stay centred.
let shiftX = 0;
// On phones and portrait tablets the desk is wider than the screen: it becomes a pannable scene.
// panX is the user's pan (px), panTarget an animated destination (the centre, when a clip plays).
let panX = null, panTarget = null, maxPan = 0, portrait = false;
function computeShift() {
  const sceneW = Math.max(innerWidth * 1.04, innerHeight * 1.04 * 16 / 9);
  const overflow = Math.max(0, sceneW - innerWidth);
  maxPan = overflow / 2;
  portrait = innerWidth / innerHeight < 0.9 && overflow > 120;
  document.body.classList.toggle('portrait', portrait);
  if (portrait) {
    if (panX === null) panX = clamp(sceneW * 0.04, -maxPan, maxPan);   // start on the book and the skull
    panX = clamp(panX, -maxPan, maxPan); shiftX = panX;
    hint.querySelector('span:last-child').textContent = 'Swipe across the desk · tap an object';
  } else {
    panX = null; panTarget = null;
    shiftX = clamp(sceneW * 0.07, 0, overflow / 2);
    hint.querySelector('span:last-child').textContent = 'Click an object on the desk to explore';
  }
}
computeShift();
addEventListener('resize', computeShift);
// touch panning of the desk (portrait only, while nothing is open)
{
  let down = false, sx = 0, startPan = 0, moved = false, lastX = 0, lastT = 0, vel = 0;
  const stageEl = document.getElementById('stage');
  stageEl.addEventListener('pointerdown', e => { if (!portrait || state !== 'idle') return; down = true; moved = false; sx = lastX = e.clientX; startPan = panX; lastT = performance.now(); vel = 0; panTarget = null; });
  stageEl.addEventListener('pointermove', e => {
    if (!down) return;
    const dx = e.clientX - sx; if (Math.abs(dx) > 8) moved = true;
    panX = clamp(startPan + dx, -maxPan, maxPan); shiftX = panX;
    const now = performance.now(); vel = (e.clientX - lastX) / Math.max(1, now - lastT) * 16; lastX = e.clientX; lastT = now;
  });
  const up = () => { if (!down) return; down = false; if (Math.abs(vel) > 1) { panTarget = clamp(panX + vel * 14, -maxPan, maxPan); } };
  stageEl.addEventListener('pointerup', up); stageEl.addEventListener('pointercancel', up);
  // a swipe must not count as a tap on a hotspot
  document.getElementById('hotspots').addEventListener('click', e => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
}
function parallaxLoop() {
  const damp = state === 'idle' ? 0.045 : 0.02;
  cur.x = lerp(cur.x, parallaxOn ? mouse.x : 0, damp);
  cur.y = lerp(cur.y, parallaxOn ? mouse.y : 0, damp);
  if (portrait && panTarget !== null) { panX = lerp(panX, panTarget, 0.08); if (Math.abs(panX - panTarget) < 0.5) { panX = panTarget; panTarget = null; } shiftX = panX; }
  scene.style.transform =
    `translate(-50%, -50%) rotateX(${(-cur.y * 1.1).toFixed(3)}deg) rotateY(${(cur.x * 1.6).toFixed(3)}deg) ` +
    `translate3d(${(cur.x * -14 + shiftX).toFixed(2)}px, ${(cur.y * -10).toFixed(2)}px, 0)`;
  requestAnimationFrame(parallaxLoop);
}
parallaxLoop();

// ───────────────────────── candle flicker ─────────────────────────
let flick = 0.8, flickTarget = 0.8;
setInterval(() => { flickTarget = 0.62 + Math.random() * 0.42; }, 90);
(function flickerLoop() {
  flick = lerp(flick, flickTarget, 0.25);
  candleGlow.style.opacity = flick.toFixed(3);
  candleGlow.style.transform = `translate(-50%,-50%) scale(${(0.94 + flick * 0.1).toFixed(3)})`;
  requestAnimationFrame(flickerLoop);
})();

// ───────────────────────── dust motes ─────────────────────────
const ctx = dustCanvas.getContext('2d');
let motes = [];
function sizeDust() {
  const r = dustCanvas.getBoundingClientRect();
  dustCanvas.width = Math.round(r.width * 0.75);
  dustCanvas.height = Math.round(r.height * 0.75);
  const n = Math.round((dustCanvas.width * dustCanvas.height) / 9000);
  motes = Array.from({ length: n }, () => ({
    x: Math.random() * dustCanvas.width,
    y: Math.random() * dustCanvas.height,
    r: 0.6 + Math.random() * 1.6,
    z: 0.3 + Math.random() * 0.7,           // depth → parallax + brightness
    vx: (Math.random() - 0.5) * 0.12,
    vy: -0.02 - Math.random() * 0.08,
    ph: Math.random() * Math.PI * 2,
  }));
}
sizeDust();
addEventListener('resize', sizeDust);
(function dustLoop(now) {
  const w = dustCanvas.width, h = dustCanvas.height;
  ctx.clearRect(0, 0, w, h);
  const t = now * 0.001;
  for (const m of motes) {
    m.x += m.vx + Math.sin(t * 0.6 + m.ph) * 0.08 + cur.x * 0.25 * m.z;
    m.y += m.vy + Math.cos(t * 0.4 + m.ph) * 0.05 + cur.y * 0.18 * m.z;
    if (m.y < -4) { m.y = h + 4; m.x = Math.random() * w; }
    if (m.x < -4) m.x = w + 4; else if (m.x > w + 4) m.x = -4;
    const tw = 0.45 + 0.55 * Math.sin(t * 1.3 + m.ph * 3);
    const inBeam = m.x < w * 0.62 && m.y < h * 0.7;   // window light lives upper-left
    const a = (inBeam ? 0.55 : 0.22) * tw * m.z;
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.r * m.z, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 224, 170, ${a.toFixed(3)})`;
    ctx.fill();
  }
  requestAnimationFrame(dustLoop);
})(performance.now());

// ───────────────────────── zoom transitions ─────────────────────────
function setZoom(scale, blur, key) {
  const s = SECTIONS[key];
  zoom.style.transformOrigin = `${s.x}% ${s.y}%`;
  zoom.style.transform = `scale(${scale.toFixed(4)})`;
  zoom.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'none';
}

async function open(key) {
  if (state !== 'idle') return;
  state = 'zooming';
  activeKey = key;
  const s = SECTIONS[key];
  const detail = detailsEl.querySelector(`.detail[data-key="${key}"]`);
  body.classList.add('ui-hidden');
  hint.classList.add('gone');
  spot.classList.remove('on');
  parallaxOn = false;

  const reveal = (usedClip = false) => {
    detail.classList.add('on');
    state = 'detail';
    if (s.landing) {
      // the on-screen ENTER button is laid out for the clip's last frame; after a CSS-zoom fallback go straight in
      if (screenUis[key] && usedClip) screenUis[key].classList.add('on');
      const auto = s.autoOpen || (!usedClip && screenUis[key] ? 600 : 0);
      if (auto) setTimeout(() => { if (state === 'detail' && activeKey === key) openPage(key); }, auto);
    }
  };
  // on a pannable (portrait) desk: a clip ends centred on its object, so bring the scene centre into view for the clip,
  // or the object itself into view for the CSS zoom
  const centreObject = () => { if (portrait) { const sceneW = Math.max(innerWidth * 1.04, innerHeight * 1.04 * 16 / 9); panTarget = clamp(-(s.x / 100 - 0.5) * sceneW, -maxPan, maxPan); } };

  const video = videos[key];
  if (video && video.readyState < 2) {
    // clip not buffered yet: hold on the desk briefly and wait for it rather than skipping the video
    try { video.load(); } catch (_) {}
    const ok = await new Promise(res => {
      const done = v => { video.removeEventListener('canplay', onOk); video.removeEventListener('error', onErr); res(v); };
      const onOk = () => done(true), onErr = () => done(false);
      video.addEventListener('canplay', onOk); video.addEventListener('error', onErr);
      setTimeout(() => done(video.readyState >= 2), 9000);
    });
    if (!ok) console.warn('Dolly clip unavailable, using the CSS zoom instead:', s.video);
  }
  if (video && video.readyState >= 2) {
    // rendered dolly clip
    let revealed = false;
    let watchdog = 0;
    const finish = () => {
      if (revealed) return;
      revealed = true;
      clearTimeout(watchdog);
      if (s.landing) {
        // stay on the clip's last frame (or freezeAt); the desk beneath is untouched until we return
        if (s.freezeAt) video.pause();
        reveal(true);
        return;
      }
      // park the desk zoomed-in beneath the detail so the return dolly is seamless
      setZoom(ZOOM_SCALE, 0, key);
      reveal(true);
      setTimeout(() => { video.pause(); video.classList.remove('on'); }, 1100);
    };
    const onTime = () => { if (video.currentTime >= (s.freezeAt || s.revealAt || video.duration - 0.35)) finish(); };
    const fallback = () => {
      // playback blocked or stalled: use the JS dolly instead
      if (revealed) return;
      video.pause(); video.classList.remove('on');
      centreObject();
      dolly(key, () => reveal(false));
      revealed = true;
    };
    if (portrait) panTarget = 0;
    video.playbackRate = s.videoRate || 1;
    video.currentTime = 0;
    video.classList.add('on');
    if (s.sound && sfx[s.sound]) { sfx.unlock(); stopGears = sfx[s.sound]() || null; }
    // poll every frame (timeupdate is too coarse for a precise freeze). If the browser stalls or pauses the
    // clip on its own (some phones do), nudge it once, then hand over to the CSS dolly rather than hang.
    let lastT = -1, lastAdvance = performance.now(), nudged = false;
    const poll = () => {
      if (revealed) return;
      onTime(); if (revealed) return;
      const now = performance.now();
      if (video.currentTime !== lastT) { lastT = video.currentTime; lastAdvance = now; }
      else if (now - lastAdvance > 900 && video.readyState >= 2) {
        if (!nudged) { nudged = true; video.play().catch(() => {}); lastAdvance = now; }
        else if (now - lastAdvance > 1200) { fallback(); return; }
      }
      requestAnimationFrame(poll);
    };
    requestAnimationFrame(poll);
    video.addEventListener('ended', onTime, { once: true });
    // give a still-buffering clip a fair chance before abandoning it for the CSS dolly
    watchdog = setTimeout(fallback, 14000);
    video.play().catch(() => { setTimeout(() => video.play().catch(fallback), 250); });
    return;
  }

  centreObject();
  dolly(key, () => reveal(false));
}

// JS-driven camera dolly into an object
function dolly(key, reveal) {
  let revealed = false;
  cancelZoom = tween({
    duration: 1500,
    ease: easeInOutCubic,
    onUpdate: (e, p) => {
      const sc = lerp(1, ZOOM_SCALE, e);
      const bl = p > 0.55 ? easeInQuad((p - 0.55) / 0.45) * 7 : 0;
      setZoom(sc, bl, key);
      if (!revealed && p >= 0.6) { revealed = true; reveal(); }
    },
    onComplete: () => { if (!revealed) reveal(); },
  });
}

function close() {
  if (state !== 'detail' && state !== 'page') return;
  const key = activeKey;
  const s = SECTIONS[key];
  const detail = detailsEl.querySelector(`.detail[data-key="${key}"]`);
  const page = detailsEl.querySelector(`.page[data-key="${key}"]`);
  const fromPage = state === 'page';
  state = 'returning';
  if (stopGears) { stopGears(0.8); stopGears = null; }
  if (page) page.classList.remove('on');
  detailsEl.querySelectorAll(`.page.section[data-key="${key}"].on, .page.project[data-key="${key}"].on`).forEach(p => { p.classList.remove('on'); p.querySelectorAll('video').forEach(v => v.pause()); });
  closeReader();
  if (dnaScenes[key]) setTimeout(() => dnaScenes[key].stop(), 1000);
  detail.classList.remove('on');
  setTimeout(() => detail.classList.remove('entering'), 900);
  if (screenUis[key]) screenUis[key].classList.remove('on');

  zoom.style.transition = 'none';
  zoom.style.filter = 'none';
  const video = videos[key];
  if (s.landing && video && video.classList.contains('on')) {
    // dissolve the frozen frame into the desk as the camera pulls back
    video.style.transition = fromPage ? 'none' : 'opacity 0.7s ease';
    video.classList.remove('on');
    setTimeout(() => { video.style.transition = ''; video.pause(); }, 800);
    setZoom(ZOOM_SCALE, 7, key);
  }

  tween({
    duration: 1300,
    ease: easeInOutCubic,
    onUpdate: (e, p) => {
      const sc = lerp(ZOOM_SCALE, 1, e);
      const bl = p < 0.4 ? (1 - p / 0.4) * 7 : 0;
      setZoom(sc, bl, key);
    },
    onComplete: () => {
      zoom.style.filter = 'none';
      body.classList.remove('ui-hidden');
      parallaxOn = true;
      state = 'idle';
      activeKey = null;
    },
  });
}

addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (closeDoc()) return; if (closeReader()) return; if (closeAbout()) return;
    const pp = detailsEl.querySelector('.page.project.on'); if (pp) { pp.classList.remove('on'); pp.querySelectorAll('video').forEach(v => v.pause()); return; }
    close();
  }
  if (e.key === 'Enter' && state === 'detail' && activeKey && SECTIONS[activeKey].page) openPage(activeKey);
  if ((e.key === 'Enter' || e.key === ' ') && state === 'idle') { /* no-op */ }
});

// ───────────────────────── ambient sound ─────────────────────────
const ambient = new Audio('assets/audio/ambient.m4a');
ambient.loop = true; ambient.preload = 'auto'; ambient.volume = 0;
const AMBIENT_LEVEL = 0.14;
let ambientOn = true;
try { ambientOn = localStorage.getItem('ambient') !== 'off'; } catch (_) {}
const soundBtn = $('#soundBtn');
function fadeAmbient(to, ms = 1800) {
  const from = ambient.volume, t0 = performance.now();
  const step = now => { const k = Math.min(1, (now - t0) / ms); ambient.volume = Math.max(0, Math.min(1, from + (to - from) * k)); if (k < 1) requestAnimationFrame(step); else if (to === 0) ambient.pause(); };
  requestAnimationFrame(step);
}
function startAmbient() {
  if (!ambientOn) return;
  ambient.play().then(() => fadeAmbient(AMBIENT_LEVEL, 4000)).catch(() => {});
}
function setSoundUI() { if (soundBtn) { soundBtn.classList.toggle('off', !ambientOn); soundBtn.setAttribute('aria-label', ambientOn ? 'Mute ambient sound' : 'Play ambient sound'); } }
if (soundBtn) soundBtn.addEventListener('click', e => {
  e.stopPropagation();
  ambientOn = !ambientOn;
  try { localStorage.setItem('ambient', ambientOn ? 'on' : 'off'); } catch (_) {}
  if (ambientOn) { ambient.play().then(() => fadeAmbient(AMBIENT_LEVEL, 1200)).catch(() => {}); } else fadeAmbient(0, 800);
  setSoundUI();
});
setSoundUI();
setSfxEnabled(() => ambientOn);
// browsers only allow sound after a gesture: the first click or key starts it
// the music belongs to the open window: fade it out when the tab is hidden or the window loses focus, back in on return
let ambientArmed = false, ambientSuspended = false;
function suspendAmbient() { if (!ambientArmed || ambientSuspended) return; ambientSuspended = true; fadeAmbient(0, 600); }
function resumeAmbient() { if (!ambientArmed || !ambientSuspended) return; ambientSuspended = false; if (ambientOn) ambient.play().then(() => fadeAmbient(AMBIENT_LEVEL, 1500)).catch(() => {}); }
document.addEventListener('visibilitychange', () => { if (document.hidden) suspendAmbient(); else if (document.hasFocus()) resumeAmbient(); });
addEventListener('blur', suspendAmbient);
addEventListener('focus', () => { if (!document.hidden) resumeAmbient(); });
const armAmbient = () => { ambientArmed = true; startAmbient(); sfx.unlock(); removeEventListener('pointerdown', armAmbient); removeEventListener('keydown', armAmbient); };
addEventListener('pointerdown', armAmbient); addEventListener('keydown', armAmbient);

// ───────────────────────── boot ─────────────────────────
let booted = false;
function ready() {
  if (booted) return;
  booted = true;
  loader.classList.add('hide');
  // warm the dolly clips so the first click is instant
  for (const v of Object.values(videos)) { if (v.readyState < 2) { try { v.load(); } catch (_) {} } }
}
if (deskImg.complete && deskImg.naturalWidth) ready();
else deskImg.addEventListener('load', ready, { once: true });
setTimeout(ready, 6000); // never trap the visitor on the loader
