// The placements roadmap: a 3D road that recedes into the page, one slab per rotation, with
// standing cards along it and a "today" beacon. On open the camera drives from the start of the
// programme to the current date, so a visitor lands on wherever the training is right now.

const DAY = 86400000;
const parse = s => new Date(s + 'T00:00:00');
const fmt = (d, o = { day: 'numeric', month: 'short', year: 'numeric' }) => d.toLocaleDateString('en-GB', o);
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = t => 1 - Math.pow(1 - t, 3);

export function createRoadmap(stage, R, opts = {}) {
  const narrow = (stage.clientWidth || innerWidth) < 600;
  const PX = narrow ? 5 : 9;                      // pixels per day along the road (tighter on phones)
  const PAD = 34;                                 // days of tarmac before the first and after the last placement
  const P = R.placements.map(p => ({ ...p, a: parse(p.from), b: parse(p.to) }));
  const t0 = new Date(P[0].a.getTime() - PAD * DAY);
  const tEnd = new Date(P[P.length - 1].b.getTime() + PAD * DAY);
  const X = d => (d - t0) / DAY * PX;
  const W = X(tEnd);
  const today = opts.today ? parse(opts.today) : new Date(); today.setHours(0, 0, 0, 0);

  const status = p => today < p.a ? 'upcoming' : today > p.b ? 'done' : 'current';
  const days = (a, b) => Math.round((b - a) / DAY);
  const current = P.find(p => status(p) === 'current');

  // ── DOM
  stage.classList.add('road-stage');
  stage.innerHTML = `
    <div class="road-sky"></div>
    <div class="road-world" style="width:${W}px">
      <div class="road-surface">
        ${P.map((p, i) => `<div class="seg ${status(p)}" style="left:${X(p.a)}px;width:${X(p.b) - X(p.a)}px;--hue:${p.hue ?? 40}"></div>`).join('')}
        ${R.years.map(y => `<div class="year-band" style="left:${X(parse(y.from))}px;width:${X(parse(y.to)) - X(parse(y.from))}px"><span>${esc(y.label)}</span><small>${esc(y.trust)}</small></div>`).join('')}
        <div class="done-strip" style="width:${clamp(X(today), 0, W)}px"></div>
        <div class="centre-line"></div>
      </div>
      ${monthTicks(t0, tEnd, X)}
      ${P.map((p, i) => {
        const st = status(p), mid = (X(p.a) + X(p.b)) / 2, total = days(p.a, p.b), done = clamp(days(p.a, today), 0, total);
        return `
        <div class="pin ${st}" style="left:${mid}px;--hue:${p.hue ?? 40}" data-i="${i}">
          <article class="road-card">
            <span class="rc-eyebrow">${esc(st === 'current' ? 'Now' : st === 'done' ? 'Completed' : 'Upcoming')} · Placement ${i + 1}</span>
            <h3>${esc(p.title)}</h3>
            ${p.sub ? `<p class="rc-sub">${esc(p.sub)}</p>` : ''}
            <p class="rc-site">${esc(p.site || p.trust)}</p>
            <p class="rc-dates">${fmt(p.a, { day: 'numeric', month: 'short' })} → ${fmt(p.b)} · ${Math.round(total / 7)} weeks</p>
            ${st === 'current' ? `<div class="rc-bar"><i style="width:${(done / total * 100).toFixed(1)}%"></i></div><p class="rc-progress">Day ${done + 1} of ${total} · ${Math.round(done / total * 100)}% through</p>` : ''}
            ${p.notes ? `<p class="rc-notes">${esc(p.notes)}</p>` : ''}
          </article>
          <i class="pin-stem"></i>
        </div>
        <i class="pin-foot ${st}" style="left:${mid}px;--hue:${p.hue ?? 40}"></i>`;
      }).join('')}
      ${todayMarker()}
    </div>
    <div class="road-hud">
      <button class="road-btn prev" aria-label="Previous placement">‹</button>
      <button class="road-btn today">Today</button>
      <button class="road-btn next" aria-label="Next placement">›</button>
    </div>
    <p class="road-hint">Scroll</p>`;

  function monthTicks(a, b, X) {
    let s = '', d = new Date(a.getFullYear(), a.getMonth() + 1, 1);
    while (d < b) {
      const jan = d.getMonth() === 0;
      s += `<div class="tick${jan ? ' jan' : ''}" style="left:${X(d)}px"><span>${jan ? d.getFullYear() : fmt(d, { month: 'short' })}</span></div>`;
      d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    }
    return s;
  }
  function todayMarker() {
    const x = clamp(X(today), X(P[0].a) - 20 * PX, W - 20 * PX);
    let line2;
    if (today < P[0].a) line2 = `Programme starts in ${days(today, P[0].a)} days`;
    else if (today > P[P.length - 1].b) line2 = 'Programme complete';
    else if (current) line2 = `${current.title} · day ${days(current.a, today) + 1} of ${days(current.a, current.b)}`;
    else line2 = 'Between placements';
    return `
      <div class="now-post" style="left:${x}px">
        <div class="now-label"><span class="now-eyebrow">You are here</span><strong>${fmt(today, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong><small>${esc(line2)}</small></div>
        <i class="now-beam"></i>
      </div>
      <i class="now-foot" style="left:${x}px"></i>`;
  }

  // ── camera
  const world = stage.querySelector('.road-world');
  let cam = 0, target = 0, vel = 0, dragging = false, lastX = 0, lastT = 0, raf = 0, idle = 0;
  const min = X(P[0].a) - 40 * PX, max = X(P[P.length - 1].b) + 40 * PX;
  const nowX = clamp(narrow && current ? (X(today) + (X(current.a) + X(current.b)) / 2) / 2 : X(today), min, max);   // phones: frame the beacon and the current card together
  const apply = () => { world.style.transform = `translate3d(${-cam}px,0,0) rotateX(var(--tilt))`; };
  const setCam = (x, immediate) => { target = clamp(x, min, max); if (immediate) { cam = target; apply(); } };

  let driving = null;
  function driveTo(x, ms = 2600) {
    const from = cam, to = clamp(x, min, max), t0 = performance.now();
    driving = { from, to, t0, ms };
    target = to;
  }
  function tick(now) {
    raf = requestAnimationFrame(tick);
    if (driving) {
      const k = clamp((now - driving.t0) / driving.ms, 0, 1);
      cam = driving.from + (driving.to - driving.from) * ease(k);
      if (k >= 1) driving = null;
    } else if (!dragging) {
      if (Math.abs(vel) > 0.05) { target = clamp(target + vel, min, max); vel *= 0.94; }
      cam += (target - cam) * 0.09;
    }
    idle += 0.016;
    stage.style.setProperty('--sway', (Math.sin(idle * 0.7) * 6).toFixed(2) + 'px');
    apply();
    // the nearest card to the centre of the road is the focused one
    let best = null, bd = Infinity;
    stage.querySelectorAll('.pin').forEach(el => { const d = Math.abs(parseFloat(el.style.left) - cam); if (d < bd) { bd = d; best = el; } el.classList.toggle('focus', false); });
    if (best) best.classList.add('focus');
  }

  // ── input
  stage.addEventListener('pointerdown', e => { if (e.target.closest('.road-btn')) return; dragging = true; driving = null; lastX = e.clientX; lastT = performance.now(); vel = 0; stage.setPointerCapture(e.pointerId); stage.classList.add('dragging'); });
  stage.addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx = e.clientX - lastX, dt = Math.max(1, performance.now() - lastT);
    cam = clamp(cam - dx * 1.4, min, max); target = cam; vel = -dx * 1.4 / dt * 16;
    lastX = e.clientX; lastT = performance.now();
  });
  const endDrag = () => { dragging = false; stage.classList.remove('dragging'); };
  stage.addEventListener('pointerup', endDrag); stage.addEventListener('pointercancel', endDrag);
  stage.addEventListener('wheel', e => { e.preventDefault(); driving = null; const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY; target = clamp(target + d * 1.6, min, max); }, { passive: false });
  stage.addEventListener('click', e => {
    const pin = e.target.closest('.pin'); if (pin && !stage.classList.contains('dragged')) driveTo(parseFloat(pin.style.left), 1400);
  });
  stage.querySelector('.road-btn.today').addEventListener('click', () => driveTo(nowX, 1600));
  const jump = dir => {
    const xs = P.map(p => (X(p.a) + X(p.b)) / 2);
    const i = xs.findIndex(x => dir > 0 ? x > cam + 40 : false);
    const j = dir > 0 ? (i === -1 ? xs.length - 1 : i) : (() => { let k = xs.length - 1; while (k >= 0 && xs[k] >= cam - 40) k--; return Math.max(0, k); })();
    driveTo(xs[j], 1400);
  };
  stage.querySelector('.road-btn.prev').addEventListener('click', () => jump(-1));
  stage.querySelector('.road-btn.next').addEventListener('click', () => jump(1));
  stage.tabIndex = 0;
  stage.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { jump(1); e.preventDefault(); } if (e.key === 'ArrowLeft') { jump(-1); e.preventDefault(); } if (e.key === 'Home') driveTo(nowX, 1200); });

  // ── public
  const api = {
    // arrive: start at the beginning of the road and drive to today
    arrive() { setCam(min + 60, true); cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); setTimeout(() => driveTo(nowX, 3200), 350); },
    stop() { cancelAnimationFrame(raf); },
    today: nowX, X, placements: P, status,
  };
  return api;
}
