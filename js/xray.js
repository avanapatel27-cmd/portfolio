// Cursor "X-ray vision": the portrait sits on a canvas; moving the pointer erases
// fluid blobs + pixel flecks that heal over time, revealing the X-ray layer beneath.
export function createXray(hero, opts) {
  const { photo, xray, align = { k: 1, tx: 0, ty: 0 } } = opts;
  const canvas = hero.querySelector('canvas.skin');
  const xrayImg = hero.querySelector('img.xray');
  const cursor = hero.querySelector('.xray-cursor');
  // a white "x-rayed" copy of the text, revealed through the same blobs
  const textEl = hero.querySelector('.about-text');
  let textX = null;
  if (textEl) {
    textX = textEl.cloneNode(true);
    textX.classList.add('about-text-xray');
    textX.setAttribute('aria-hidden', 'true');
    hero.appendChild(textX);
  }
  const ctx = canvas.getContext('2d');
  const img = new Image(); img.src = photo;
  let W = 0, H = 0, dpr = 1, ox = 0, oy = 0, dw = 0, dh = 0, ready = false;

  function layout() {
    const r = hero.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
    dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!img.naturalWidth) return;
    const s = Math.max(W / img.naturalWidth, H / img.naturalHeight);   // cover, anchored right/centre
    dw = img.naturalWidth * s; dh = img.naturalHeight * s;
    ox = W - dw; oy = (H - dh) / 2;
    // the X-ray gets the same cover mapping plus its own alignment (scale k, offset tx/ty as fractions of the photo)
    xrayImg.style.left = (ox + align.tx * dw) + 'px';
    xrayImg.style.top = (oy + align.ty * dh) + 'px';
    xrayImg.style.width = (dw * align.k) + 'px';
    xrayImg.style.height = (dh * align.k) + 'px';
    ready = true;
  }
  img.addEventListener('load', layout);
  const ro = new ResizeObserver(layout); ro.observe(hero);

  // ── blobs
  const blobs = [];      // { x, y, r, born, seed }
  const flecks = [];     // { x, y, s, born }
  let last = { x: -1, y: -1, t: 0 };
  let inside = false;
  const now = () => performance.now();

  function addAt(x, y, speed) {
    const base = 46 + Math.min(80, speed * 0.9);
    blobs.push({ x, y, r: base, born: now(), seed: Math.random() * 6.28 });
    if (blobs.length > 70) blobs.shift();
    // a few pixel flecks scattered around the head of the trail
    const n = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.28, d = base * (0.9 + Math.random() * 0.8);
      const s = 5 + Math.random() * 11;
      flecks.push({ x: Math.round((x + Math.cos(a) * d) / s) * s, y: Math.round((y + Math.sin(a) * d) / s) * s, s, born: now() + Math.random() * 120 });
    }
    if (flecks.length > 160) flecks.splice(0, flecks.length - 160);
  }

  function onMove(e) {
    const r = hero.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    inside = x >= 0 && y >= 0 && x <= r.width && y <= r.height;
    if (cursor) { cursor.style.transform = `translate(${x}px, ${y}px)`; cursor.classList.toggle('on', inside); }
    if (!inside) return;
    const t = now();
    const speed = last.t ? Math.hypot(x - last.x, y - last.y) / Math.max(1, t - last.t) * 16 : 0;
    // interpolate so fast moves leave a continuous trail
    if (last.t && Math.hypot(x - last.x, y - last.y) > 18) {
      const steps = Math.min(8, Math.ceil(Math.hypot(x - last.x, y - last.y) / 18));
      for (let i = 1; i <= steps; i++) addAt(last.x + (x - last.x) * i / steps, last.y + (y - last.y) * i / steps, speed);
    } else addAt(x, y, speed);
    last = { x, y, t };
  }
  const onLeave = () => { inside = false; if (cursor) cursor.classList.remove('on'); last = { x: -1, y: -1, t: 0 }; };
  hero.addEventListener('pointermove', onMove);
  hero.addEventListener('pointerleave', onLeave);
  hero.addEventListener('pointerdown', onMove);

  const LIFE = 1500, GROW = 220;
  let raf = 0, running = false;
  function frame() {
    if (!running) return;
    const t = now();
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, W, H);
    if (ready) ctx.drawImage(img, ox, oy, dw, dh);
    ctx.globalCompositeOperation = 'destination-out';
    // fluid blobs: grow quickly, wobble, then dissolve
    for (let i = blobs.length - 1; i >= 0; i--) {
      const b = blobs[i], age = t - b.born;
      if (age > LIFE) { blobs.splice(i, 1); continue; }
      const g = Math.min(1, age / GROW), e = 1 - Math.pow(Math.max(0, (age - GROW) / (LIFE - GROW)), 1.6);
      const wob = 1 + 0.12 * Math.sin(t * 0.006 + b.seed) + 0.06 * Math.sin(t * 0.011 + b.seed * 2);
      const r = b.r * (1 - Math.pow(1 - g, 3)) * e * wob;
      if (r < 1) continue;
      const grd = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r);
      grd.addColorStop(0, 'rgba(0,0,0,1)'); grd.addColorStop(0.62, 'rgba(0,0,0,0.95)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(b.x, b.y, r, 0, 6.2832); ctx.fill();
      // satellite droplets
      for (let k = 0; k < 2; k++) {
        const a = b.seed + k * 2.4 + t * 0.0012, d = r * 1.15, rr = r * 0.22 * e;
        if (rr < 1) continue;
        ctx.beginPath(); ctx.arc(b.x + Math.cos(a) * d, b.y + Math.sin(a) * d, rr, 0, 6.2832); ctx.fillStyle = 'rgba(0,0,0,0.9)'; ctx.fill();
      }
    }
    // mirror the blobs onto the white text copy as a CSS mask
    if (textX) {
      const tr = textX.getBoundingClientRect(), hr = hero.getBoundingClientRect();
      const ox = tr.left - hr.left, oy = tr.top - hr.top;
      const parts = [];
      for (const b of blobs) {
        const age = t - b.born; if (age > LIFE) continue;
        const g = Math.min(1, age / GROW), e = 1 - Math.pow(Math.max(0, (age - GROW) / (LIFE - GROW)), 1.6);
        const wob = 1 + 0.12 * Math.sin(t * 0.006 + b.seed) + 0.06 * Math.sin(t * 0.011 + b.seed * 2);
        const r = b.r * (1 - Math.pow(1 - g, 3)) * e * wob;
        if (r < 1) continue;
        parts.push(`radial-gradient(circle at ${(b.x - ox).toFixed(1)}px ${(b.y - oy).toFixed(1)}px, #000 ${(r * 0.62).toFixed(1)}px, transparent ${r.toFixed(1)}px)`);
      }
      const m = parts.length ? parts.join(',') : 'linear-gradient(transparent, transparent)';
      textX.style.webkitMaskImage = m; textX.style.maskImage = m;
    }
    // pixel flecks: hard-edged squares that blink out
    for (let i = flecks.length - 1; i >= 0; i--) {
      const f = flecks[i], age = t - f.born;
      if (age < 0) continue;
      if (age > 700) { flecks.splice(i, 1); continue; }
      ctx.fillStyle = `rgba(0,0,0,${(1 - age / 700).toFixed(3)})`;
      ctx.fillRect(f.x, f.y, f.s, f.s);
    }
    raf = requestAnimationFrame(frame);
  }
  return {
    start() { if (running) return; running = true; layout(); raf = requestAnimationFrame(frame); },
    stop() { running = false; cancelAnimationFrame(raf); },
    setAlign(a) { Object.assign(align, a); layout(); },
    layout,
  };
}
