// A glossy, segmented double helix (Three.js) with four glowing gene markers.
// Drag to turn, scroll to zoom, click a marker to fly in. Builds itself strand by strand on start.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { sfx } from './sfx.js?v=5';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const easeOutBack = t => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function softDisc(size = 128, inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)') {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, inner); g.addColorStop(0.35, inner.replace(',1)', ',0.55)')); g.addColorStop(1, outer);
  x.fillStyle = g; x.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function ringTex(size = 256) {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const x = c.getContext('2d');
  x.strokeStyle = 'rgba(255, 200, 110, 1)'; x.lineWidth = size * 0.035;
  x.shadowColor = 'rgba(255,170,60,0.9)'; x.shadowBlur = size * 0.08;
  x.beginPath(); x.arc(size / 2, size / 2, size * 0.36, 0, Math.PI * 2); x.stroke();
  x.lineWidth = size * 0.012; x.globalAlpha = 0.7;
  x.beginPath(); x.arc(size / 2, size / 2, size * 0.46, 0, Math.PI * 2); x.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function createDna(container, sections, onSelect) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  container.appendChild(renderer.domElement);
  const canvas = renderer.domElement;
  canvas.style.touchAction = 'none';

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050b17);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);

  // ── lights
  scene.add(new THREE.AmbientLight(0x1b2b4d, 0.5));
  const key = new THREE.DirectionalLight(0xcfe3ff, 1.8); key.position.set(4, 6, 6); scene.add(key);
  const warm = new THREE.PointLight(0xff9a3c, 3.2, 24, 2); warm.position.set(-4, -3, 3); scene.add(warm);
  const cool = new THREE.PointLight(0x3fa9ff, 3.6, 24, 2); cool.position.set(3.5, 2.5, -1); scene.add(cool);

  // ── background glow + bokeh
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: softDisc(256, 'rgba(60,120,210,1)'), transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }));
  glow.position.set(2.2, 1.6, -7); glow.scale.set(16, 16, 1); scene.add(glow);
  const glow2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: softDisc(256, 'rgba(255,140,60,1)'), transparent: true, opacity: 0.2, depthWrite: false, blending: THREE.AdditiveBlending }));
  glow2.position.set(-3.5, -3, -6); glow2.scale.set(11, 11, 1); scene.add(glow2);

  const N = 170;
  const pPos = new Float32Array(N * 3), pCol = new Float32Array(N * 3), pVel = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    pPos[i * 3] = (Math.random() - 0.5) * 22; pPos[i * 3 + 1] = (Math.random() - 0.5) * 14; pPos[i * 3 + 2] = -6 + Math.random() * 9;
    const c = Math.random() < 0.35 ? new THREE.Color(0xffa040) : new THREE.Color(0x4aa8ff);
    pCol[i * 3] = c.r; pCol[i * 3 + 1] = c.g; pCol[i * 3 + 2] = c.b;
    pVel[i] = 0.05 + Math.random() * 0.12;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
  const pMat = new THREE.PointsMaterial({ map: softDisc(64), size: 0.42, vertexColors: true, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending });
  scene.add(new THREE.Points(pGeo, pMat));

  // ── the helix
  const tilt = new THREE.Group(); tilt.rotation.set(0.28, 0, -0.66); scene.add(tilt);
  const spin = new THREE.Group(); tilt.add(spin);

  const navy = new THREE.MeshPhysicalMaterial({ color: 0x0b1428, metalness: 0.5, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.1, envMapIntensity: 1.3 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xf0b14a, metalness: 1, roughness: 0.22, emissive: 0x7a4a10, emissiveIntensity: 0.55, envMapIntensity: 1.4 });
  const blue = new THREE.MeshStandardMaterial({ color: 0x2a7fff, emissive: 0x2f9dff, emissiveIntensity: 2.2, roughness: 0.4, metalness: 0.2 });
  const goldGlow = new THREE.MeshStandardMaterial({ color: 0xffc966, emissive: 0xffa030, emissiveIntensity: 1.7, roughness: 0.3, metalness: 0.6 });

  const R = 1.15, pitch = 4.8, len = 22, step = 0.36;
  const up = new THREE.Vector3(0, 1, 0), fwd = new THREE.Vector3(0, 0, 1);
  const pos = (t, ph) => new THREE.Vector3(Math.cos((t / pitch) * Math.PI * 2 + ph) * R, t - len / 2, Math.sin((t / pitch) * Math.PI * 2 + ph) * R);

  const parts = [];   // { mesh, t, kind, base }  for the build animation
  const addPart = (mesh, t, kind) => { mesh.userData.base = mesh.scale.clone(); parts.push({ mesh, t, kind, base: mesh.scale.clone() }); spin.add(mesh); return mesh; };

  for (const ph of [0, Math.PI]) {
    let i = 0;
    for (let t = 0; t < len; t += step, i++) {
      const a = pos(t, ph), b = pos(t + step, ph);
      const dir = b.clone().sub(a); const L = dir.length(); dir.normalize();
      const seg = new THREE.Mesh(new THREE.CapsuleGeometry(0.135, L * 0.8, 6, 16), navy);
      seg.position.copy(a).add(b).multiplyScalar(0.5);
      seg.quaternion.setFromUnitVectors(up, dir);
      addPart(seg, t, 'strand');
      if (i % 3 === 1) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.038, 10, 30), gold);
        ring.position.copy(a); ring.quaternion.setFromUnitVectors(fwd, dir);
        addPart(ring, t, 'strand');
      }
    }
  }

  const markers = [];
  const hits = [];
  const rungStep = 0.66;
  const nodeTs = [0.375, 0.458, 0.542, 0.625].map(f => f * len);
  const ringMap = ringTex();
  let nodeIdx = 0;
  for (let t = rungStep / 2; t < len; t += rungStep) {
    const a = pos(t, 0), b = pos(t, Math.PI);
    const dir = b.clone().sub(a).normalize();
    const half = R * 0.78;
    const isNode = nodeIdx < nodeTs.length && Math.abs(t - nodeTs[nodeIdx]) < rungStep / 2;
    const isBlue = !isNode && (Math.floor(t / rungStep) % 4 === 2);
    const mat = isNode ? goldGlow : (isBlue ? blue : navy);
    for (const [from, sgn] of [[a, 1], [b, -1]]) {
      const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, half, 12), mat);
      cyl.position.copy(from).add(dir.clone().multiplyScalar(sgn * half / 2));
      cyl.quaternion.setFromUnitVectors(up, dir);
      addPart(cyl, t, 'rung');
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.03, 8, 20), gold);
      band.position.copy(from).add(dir.clone().multiplyScalar(sgn * 0.26));
      band.quaternion.setFromUnitVectors(fwd, dir);
      addPart(band, t, 'rung');
    }
    if (isNode) {
      const centre = a.clone().add(b).multiplyScalar(0.5);
      const core = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 32), goldGlow);
      core.position.copy(centre); addPart(core, t, 'marker');
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: ringMap, transparent: true, opacity: 0.85, depthWrite: false, depthTest: false }));
      halo.position.copy(centre); halo.scale.set(1.2, 1.2, 1); addPart(halo, t, 'marker');
      const hit = new THREE.Mesh(new THREE.SphereGeometry(0.62, 8, 8), new THREE.MeshBasicMaterial({ visible: false }));
      hit.position.copy(centre); hit.userData.i = nodeIdx; spin.add(hit); hits.push(hit);
      markers.push({ core, halo, hit, i: nodeIdx, centre, t });
      nodeIdx++;
    }
  }

  // ── labels (HTML, projected)
  const labelsEl = document.createElement('div');
  labelsEl.className = 'dna-labels';
  container.appendChild(labelsEl);
  const labels = markers.map(m => {
    const sec = sections[m.i] || {};
    const b = document.createElement('button');
    b.className = 'dna-label'; b.tabIndex = 0; b.setAttribute('role', 'button');
    b.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); b.click(); } });
    b.innerHTML = `<span class="n">0${m.i + 1}</span><span class="t">${sec.label || sec.title || ''}</span><small>${sec.hint || ''}</small>`;
    b.addEventListener('click', () => select(m.i));
    b.addEventListener('mouseenter', () => setHover(m.i));
    b.addEventListener('mouseleave', () => setHover(-1));
    labelsEl.appendChild(b);
    return b;
  });

  // ── post
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), 0.62, 0.6, 0.62));
  composer.addPass(new OutputPass());

  // ── camera state (focus point + distance + user orbit offsets)
  const homeDist = () => { const a = (container.clientWidth || 1) / (container.clientHeight || 1); return 11.5 * (a < 0.75 ? 1.9 : a < 1 ? 1.55 : a < 1.35 ? 1.25 : 1); };
  const view = { focus: new THREE.Vector3(0, 0, 0), dist: homeDist(), ox: 0, oy: 0 };  // current
  const goal = { focus: new THREE.Vector3(0, 0, 0), dist: homeDist() };                // eased toward
  const userSpin = { y: 0, vy: 0, x: 0 };                                             // drag offsets
  let autoSpin = 0.11;
  const mouse = { x: 0, y: 0 };
  let focusedMarker = -1;
  let flight = null;   // { t0, dur, fromFocus, toMarker, fromDist, toDist, twistFrom, twistTo }

  // ── interaction: hover / click / drag / wheel
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let hover = -1;
  function setHover(i) {
    if (hover === i) return;
    hover = i;
    if (i >= 0) sfx.hover();
    labels.forEach((l, k) => l.classList.toggle('hot', k === i));
    canvas.style.cursor = i >= 0 ? 'pointer' : (drag.on ? 'grabbing' : 'grab');
  }
  const drag = { on: false, x: 0, y: 0, moved: 0, lastX: 0, lastT: 0 };
  const toNdc = e => {
    const r = canvas.getBoundingClientRect();
    ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  };
  canvas.addEventListener('pointerdown', e => {
    drag.on = true; drag.x = e.clientX; drag.y = e.clientY; drag.moved = 0; drag.lastX = e.clientX; drag.lastT = performance.now();
    userSpin.vy = 0; canvas.setPointerCapture(e.pointerId); canvas.style.cursor = 'grabbing';
  });
  canvas.addEventListener('pointermove', e => {
    toNdc(e); mouse.x = ndc.x; mouse.y = ndc.y;
    if (drag.on) {
      const dx = e.clientX - drag.lastX; const now = performance.now();
      userSpin.y += dx * 0.006;
      userSpin.x = clamp(userSpin.x + (e.clientY - drag.y) * 0.0035, -0.7, 0.7); drag.y = e.clientY;
      userSpin.vy = dx / Math.max(1, now - drag.lastT) * 6;
      drag.lastX = e.clientX; drag.lastT = now;
      drag.moved += Math.abs(dx) + Math.abs(e.movementY || 0);
      return;
    }
    ray.setFromCamera(ndc, camera);
    const h = ray.intersectObjects(hits, false);
    setHover(h.length ? h[0].object.userData.i : -1);
  });
  const endDrag = e => {
    if (!drag.on) return;
    drag.on = false; canvas.style.cursor = hover >= 0 ? 'pointer' : 'grab';
    if (drag.moved < 6) { toNdc(e); ray.setFromCamera(ndc, camera); const h = ray.intersectObjects(hits, false); if (h.length) select(h[0].object.userData.i); }
  };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('wheel', e => { e.preventDefault(); goal.dist = clamp(goal.dist + e.deltaY * 0.012, 5.5, homeDist() * 1.5); }, { passive: false });
  // pinch to zoom on touch screens
  const touches = new Map(); let pinch0 = 0, dist0 = 0;
  const span = () => { const p = [...touches.values()]; return Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y); };
  canvas.addEventListener('pointerdown', e => { if (e.pointerType !== 'touch') return; touches.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (touches.size === 2) { pinch0 = span(); dist0 = goal.dist; drag.on = false; } });
  canvas.addEventListener('pointermove', e => { if (!touches.has(e.pointerId)) return; touches.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (touches.size === 2 && pinch0 > 0) { drag.on = false; goal.dist = clamp(dist0 * pinch0 / Math.max(20, span()), 5.5, homeDist() * 1.5); } });
  const untouch = e => { touches.delete(e.pointerId); if (touches.size < 2) pinch0 = 0; };
  canvas.addEventListener('pointerup', untouch); canvas.addEventListener('pointercancel', untouch);
  canvas.style.cursor = 'grab';

  // ── fly to a marker (twist + zoom + new angle), then hand over to the page
  function select(i) {
    if (flight || building) return;
    sfx.select();
    focusedMarker = i;
    flight = { t0: performance.now(), dur: 1500, fromDist: view.dist, toDist: 3.6, twist: 1.35, twistDone: 0, marker: i, fromOy: view.oy, toOy: 0.55 };
    labels.forEach(l => l.classList.add('away'));
    setTimeout(() => { if (onSelect) onSelect(i); }, 1050);
  }
  function resetView() {
    sfx.back();
    focusedMarker = -1;
    flight = { t0: performance.now(), dur: 1500, fromDist: view.dist, toDist: homeDist(), twist: -0.6, twistDone: 0, marker: -1, fromOy: view.oy, toOy: 0 };
    labels.forEach(l => l.classList.remove('away'));
  }

  // ── build animation (strands first, then rungs, then markers)
  let building = false, buildStart = 0;
  const BUILD = 4.2;
  let lastTick = 0, tickN = 0;
  function applyBuild(T) {
    const p = clamp((T - buildStart) / BUILD, 0, 1);
    const head = p * (len + 6) - 2;                // build front along the axis
    let appeared = 0;
    for (const q of parts) {
      const delay = q.kind === 'strand' ? 0 : (q.kind === 'rung' ? 2.2 : 3.4);
      const s = clamp((head - q.t - delay) / 1.6, 0, 1);
      const e = s <= 0 ? 0 : easeOutBack(s);
      if (!q.mesh.visible && s > 0.001) appeared++;
      q.mesh.visible = s > 0.001;
      q.mesh.scale.set(q.base.x * e, q.base.y * e, q.base.z * (q.mesh.isSprite ? 1 : e));
    }
    if (appeared && T - lastTick > 0.11) { lastTick = T; sfx.tick(tickN++); }
    if (p >= 1) { building = false; labels.forEach(l => l.classList.add('ready')); sfx.select(); }
  }

  // ── size / loop
  let w = 1, h = 1;
  function resize() {
    w = container.clientWidth || 1; h = container.clientHeight || 1;
    renderer.setSize(w, h, false); composer.setSize(w, h);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    tilt.rotation.z = w / h < 1 ? -0.14 : -0.66;           // upright on phones and portrait tablets, leaning on wide screens
    if (!flight && focusedMarker < 0) goal.dist = homeDist();
  }
  const ro = new ResizeObserver(resize); ro.observe(container); resize();

  const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();
  let running = false, raf = 0, last = 0, t0 = 0;
  function frame(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
    const T = (now - t0) / 1000;

    if (building) applyBuild(T);

    // spin: auto + user drag + inertia + flight twist
    if (!drag.on) { userSpin.y += userSpin.vy * dt; userSpin.vy *= Math.pow(0.05, dt); }
    let twistStep = 0;
    if (flight) {
      const k = clamp((now - flight.t0) / flight.dur, 0, 1), e = easeInOut(k);
      const twistNow = flight.twist * e; twistStep = twistNow - flight.twistDone; flight.twistDone = twistNow;
      goal.dist = flight.fromDist + (flight.toDist - flight.fromDist) * e;
      view.oy = flight.fromOy + (flight.toOy - flight.fromOy) * e;
      if (k >= 1) flight = null;
    }
    spin.rotation.y += dt * autoSpin * (focusedMarker >= 0 ? 0.35 : 1) + twistStep;
    tilt.rotation.x = 0.28 + userSpin.x;
    spin.rotation.y += (userSpin.y - (spin.userData.uy || 0)); spin.userData.uy = userSpin.y;

    // focus point: origin, or the focused marker
    if (focusedMarker >= 0) markers[focusedMarker].core.getWorldPosition(goal.focus); else goal.focus.set(0, 0, 0);
    view.focus.lerp(goal.focus, 1 - Math.pow(0.02, dt));
    view.dist += (goal.dist - view.dist) * (1 - Math.pow(0.03, dt));
    container.classList.toggle('zoomed', view.dist < 9.2 || focusedMarker >= 0);
    view.ox += (mouse.x * 0.55 - view.ox) * 0.04;
    const my = mouse.y * 0.35 + Math.sin(T * 0.25) * 0.12;
    camera.position.set(view.focus.x + view.ox + Math.sin(view.oy) * view.dist, view.focus.y + my + Math.sin(view.oy * 0.6) * view.dist * 0.35, view.focus.z + Math.cos(view.oy) * view.dist);
    camera.lookAt(view.focus);

    // bokeh drift
    const arr = pGeo.attributes.position.array;
    for (let i = 0; i < N; i++) { arr[i * 3 + 1] += pVel[i] * dt; if (arr[i * 3 + 1] > 7) arr[i * 3 + 1] = -7; }
    pGeo.attributes.position.needsUpdate = true;

    // markers pulse + labels
    markers.forEach((m, k) => {
      const hot = hover === k || focusedMarker === k;
      const pulse = 1 + Math.sin(T * 2.2 + k) * 0.06;
      if (!building) { m.halo.scale.set(1.2 * (hot ? 1.5 : 1) * pulse, 1.2 * (hot ? 1.5 : 1) * pulse, 1); m.core.scale.setScalar(hot ? 1.35 : 1); }
      m.core.getWorldPosition(tmp); tmp2.copy(tmp).project(camera);
      const l = labels[k];
      const lh = l.offsetHeight || 60;
      const x = (tmp2.x * 0.5 + 0.5) * w, y = Math.min(h - lh - 8 + 22, Math.max(30, (-tmp2.y * 0.5 + 0.5) * h));
      const lw = l.offsetWidth || 200, flip = x + lw + 24 > w - 6 && (x - lw - 24 > 0 || x > w / 2);
      l.classList.toggle('flip', flip);
      const tx = Math.min(Math.max(flip ? x - lw : x, flip ? 26 : 0), w - lw - (flip ? 0 : 24));   // never off screen, whichever side
      l.style.transform = `translate(${tx.toFixed(1)}px, ${y.toFixed(1)}px)`;
      l.style.visibility = tmp2.z < 1 ? '' : 'hidden';
    });
    composer.render();
    raf = requestAnimationFrame(frame);
  }

  return {
    start({ build = true } = {}) {
      if (running) return;
      running = true; last = performance.now(); t0 = last; resize();
      if (build) { building = true; buildStart = 0; tickN = 0; labels.forEach(l => l.classList.remove('ready')); for (const q of parts) q.mesh.visible = false; sfx.unlock(); sfx.shimmer(BUILD); }
      raf = requestAnimationFrame(frame);
    },
    stop() { running = false; cancelAnimationFrame(raf); },
    resetView,
    dispose() { this.stop(); ro.disconnect(); renderer.dispose(); },
  };
}
