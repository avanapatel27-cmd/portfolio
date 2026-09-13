// Synthesised UI sounds for the helix: metallic clinks, chimes and a build shimmer.
// Everything is generated with the Web Audio API, so there are no audio files to load.
let ctx = null, master = null, verb = null;
let enabled = () => true;
export function setEnabled(fn) { enabled = fn; }

function ensure() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume().catch(() => {}); return ctx; }
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain(); master.gain.value = 0.7; master.connect(ctx.destination);
  // a small synthetic hall: noise burst convolution for a metallic tail
  const len = Math.floor(ctx.sampleRate * 1.6), buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6) * 0.5; }
  verb = ctx.createConvolver(); verb.buffer = buf;
  const wet = ctx.createGain(); wet.gain.value = 0.35; verb.connect(wet); wet.connect(master);
  return ctx;
}
function out(node, wetAmt = 1) { node.connect(master); if (verb && wetAmt > 0) { const g = ctx.createGain(); g.gain.value = wetAmt; node.connect(g); g.connect(verb); } }

// metallic partial set (inharmonic, bell-like)
const PARTIALS = [1, 2.32, 3.01, 4.17, 5.43];
function bell(freq, dur, gain, { bright = 1, detune = 0, wet = 1, at = 0 } = {}) {
  const c = ensure(); if (!c || !enabled()) return;
  const t0 = c.currentTime + at;
  const g = c.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(gain, t0 + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  out(g, wet);
  PARTIALS.forEach((p, i) => {
    const o = c.createOscillator(); o.type = i === 0 ? 'sine' : 'triangle';
    o.frequency.value = freq * p; o.detune.value = detune + (i ? (Math.random() - 0.5) * 6 : 0);
    const pg = c.createGain(); pg.gain.value = (i === 0 ? 1 : 0.55 / (i + 1)) * (i > 2 ? bright : 1);
    o.connect(pg); pg.connect(g); o.start(t0); o.stop(t0 + dur + 0.05);
  });
  // a tiny transient click
  const n = c.createBufferSource(); const nb = c.createBuffer(1, 600, c.sampleRate); const d = nb.getChannelData(0);
  for (let i = 0; i < 600; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / 600);
  n.buffer = nb; const ng = c.createGain(); ng.gain.value = gain * 0.35; const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 3000;
  n.connect(hp); hp.connect(ng); out(ng, 0.4); n.start(t0);
}

// clockwork: brass gear ticks (filtered noise clicks with a metallic ring) over a soft whirr
function gears() {
  const c = ensure(); if (!c || !enabled()) return () => {};
  const t0 = c.currentTime;
  const bus = c.createGain(); bus.gain.setValueAtTime(0, t0); bus.gain.linearRampToValueAtTime(1, t0 + 0.8); out(bus, 0.9);
  // whirr: gently modulated band-passed noise
  const len = Math.floor(c.sampleRate * 6), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource(); src.buffer = buf; src.loop = true;
  const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 3;
  const lfo = c.createOscillator(); lfo.frequency.value = 7.2; const lg = c.createGain(); lg.gain.value = 260; lfo.connect(lg); lg.connect(bp.frequency); lfo.start(t0);
  const wg = c.createGain(); wg.gain.value = 0.09; src.connect(bp); bp.connect(wg); wg.connect(bus); src.start(t0);
  // escapement ticks: two interleaved trains, tick-tock, with a faint brass ring
  let stopped = false; let n = 0; let timer = null;
  const tick = () => {
    if (stopped || !enabled()) return;
    const t = c.currentTime;
    const nb = c.createBuffer(1, 400, c.sampleRate); const nd = nb.getChannelData(0);
    for (let i = 0; i < 400; i++) nd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / 400, 3);
    const ns = c.createBufferSource(); ns.buffer = nb;
    const hp = c.createBiquadFilter(); hp.type = 'bandpass'; hp.frequency.value = n % 2 ? 2600 : 1900; hp.Q.value = 2.5;
    const g = c.createGain(); g.gain.value = 0.42; ns.connect(hp); hp.connect(g); g.connect(bus); ns.start(t);
    const o = c.createOscillator(); o.type = 'triangle'; o.frequency.value = (n % 2 ? 3100 : 2300) + (Math.random() - 0.5) * 60;
    const og = c.createGain(); og.gain.setValueAtTime(0.06, t); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
    o.connect(og); og.connect(bus); o.start(t); o.stop(t + 0.1);
    n++;
    timer = setTimeout(tick, 118 + (n % 2 ? 22 : 0) + Math.random() * 12);
  };
  tick();
  return (fade = 1.2) => {
    if (stopped) return; stopped = true; clearTimeout(timer);
    const t = c.currentTime; bus.gain.cancelScheduledValues(t); bus.gain.setValueAtTime(bus.gain.value, t); bus.gain.linearRampToValueAtTime(0, t + fade);
    setTimeout(() => { try { src.stop(); lfo.stop(); } catch (_) {} }, fade * 1000 + 100);
  };
}

// a book opening: a run of soft page flicks (short band-passed noise flutters with a paper thump)
function pages() {
  const c = ensure(); if (!c || !enabled()) return () => {};
  const t0 = c.currentTime + 0.25;
  const bus = c.createGain(); bus.gain.value = 0.9; out(bus, 0.5);
  let t = t0;
  for (let k = 0; k < 7; k++) {
    const dur = 0.07 + Math.random() * 0.05;
    const len = Math.floor(c.sampleRate * (dur + 0.05)), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) { const x = i / len; d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * Math.min(1, x * 1.6)) * Math.pow(1 - x, 1.4); }
    const src = c.createBufferSource(); src.buffer = buf;
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.setValueAtTime(2600 + Math.random() * 900, t); bp.frequency.exponentialRampToValueAtTime(900, t + dur); bp.Q.value = 1.2;
    const g = c.createGain(); g.gain.value = 0.3 + Math.random() * 0.08; src.connect(bp); bp.connect(g); g.connect(bus); src.start(t);
    // the page landing: a low, short thump
    const th = c.createOscillator(); th.type = 'sine'; th.frequency.setValueAtTime(140, t + dur); th.frequency.exponentialRampToValueAtTime(60, t + dur + 0.08);
    const tg = c.createGain(); tg.gain.setValueAtTime(0.0001, t + dur); tg.gain.linearRampToValueAtTime(0.05, t + dur + 0.01); tg.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.12);
    th.connect(tg); tg.connect(bus); th.start(t + dur); th.stop(t + dur + 0.14);
    t += 0.16 + k * 0.03 + Math.random() * 0.06;
  }
  return () => {};
}

// digital ambience for the laptop: a low machine hum, a faint high shimmer and sparse soft data blips
function tech() {
  const c = ensure(); if (!c || !enabled()) return () => {};
  const t0 = c.currentTime;
  const bus = c.createGain(); bus.gain.setValueAtTime(0, t0); bus.gain.linearRampToValueAtTime(1, t0 + 1.2); out(bus, 0.6);
  const hum = c.createOscillator(); hum.type = 'sawtooth'; hum.frequency.value = 55;
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 240; lp.Q.value = 0.7;
  const hg = c.createGain(); hg.gain.value = 0.06; hum.connect(lp); lp.connect(hg); hg.connect(bus); hum.start(t0);
  const air = c.createOscillator(); air.type = 'sine'; air.frequency.value = 1760;
  const trem = c.createOscillator(); trem.frequency.value = 0.35; const tg = c.createGain(); tg.gain.value = 0.004; trem.connect(tg);
  const ag = c.createGain(); ag.gain.value = 0.006; tg.connect(ag.gain); air.connect(ag); ag.connect(bus); air.start(t0); trem.start(t0);
  const NOTES = [1318.5, 1760, 2093, 2637, 3136];
  let stopped = false, timer = null;
  const blip = () => {
    if (stopped || !enabled()) return;
    const t = c.currentTime, n = 1 + (Math.random() < 0.3 ? 2 : 0);
    for (let k = 0; k < n; k++) {
      const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = NOTES[Math.floor(Math.random() * NOTES.length)];
      const g = c.createGain(); const at = t + k * 0.07;
      g.gain.setValueAtTime(0.0001, at); g.gain.linearRampToValueAtTime(0.035, at + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, at + 0.06);
      o.connect(g); g.connect(bus); o.start(at); o.stop(at + 0.08);
    }
    timer = setTimeout(blip, 220 + Math.random() * 520);
  };
  timer = setTimeout(blip, 500);
  return (fade = 1.2) => {
    if (stopped) return; stopped = true; clearTimeout(timer);
    const t = c.currentTime; bus.gain.cancelScheduledValues(t); bus.gain.setValueAtTime(bus.gain.value, t); bus.gain.linearRampToValueAtTime(0, t + fade);
    setTimeout(() => { try { hum.stop(); air.stop(); trem.stop(); } catch (_) {} }, fade * 1000 + 100);
  };
}

export const sfx = {
  gears, pages, tech,
  // a broadsheet being unfolded: two soft noise sweeps and a settle
  paper() {
    const c = ensure(); if (!c || !enabled()) return;
    const t0 = c.currentTime;
    const sweep = (at, dur, f0, f1, gain) => {
      const len = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / len);
      const src = c.createBufferSource(); src.buffer = buf;
      const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.2; bp.frequency.setValueAtTime(f0, t0 + at); bp.frequency.exponentialRampToValueAtTime(f1, t0 + at + dur);
      const g = c.createGain(); g.gain.value = gain; src.connect(bp); bp.connect(g); out(g, 0.5); src.start(t0 + at);
    };
    sweep(0, 0.45, 1200, 4200, 0.28); sweep(0.32, 0.6, 3800, 900, 0.22); sweep(0.85, 0.25, 2500, 1200, 0.12);
  },
  unlock() { const c = ensure(); if (c && c.state === 'suspended') c.resume(); },
  // hand the audio hardware back (phones pause a playing clip when another audio source holds focus)
  suspend() { return ctx && ctx.state === 'running' ? ctx.suspend().catch(() => {}) : Promise.resolve(); },
  resume() { return ctx && ctx.state === 'suspended' ? ctx.resume().catch(() => {}) : Promise.resolve(); },
  // diagnostics: context state and the peak output level over the next `ms` milliseconds
  probe(ms = 800) {
    const c = ensure(); if (!c) return Promise.resolve({ state: 'none' });
    const an = c.createAnalyser(); an.fftSize = 2048; master.connect(an); const buf = new Float32Array(an.fftSize);
    return new Promise(res => { let peak = 0; const t0 = performance.now(); const step = () => { an.getFloatTimeDomainData(buf); for (const v of buf) peak = Math.max(peak, Math.abs(v)); if (performance.now() - t0 < ms) requestAnimationFrame(step); else { master.disconnect(an); res({ state: c.state, peak: +peak.toFixed(3), enabled: enabled() }); } }; step(); });
  },
  hover() { bell(1560 + Math.random() * 120, 0.42, 0.2, { bright: 1.1, wet: 0.8 }); },
  select() { bell(880, 0.9, 0.26, { wet: 1.2 }); bell(1320, 1.1, 0.22, { at: 0.09, wet: 1.4 }); bell(1760, 1.4, 0.16, { at: 0.18, wet: 1.6 }); },
  back() { bell(1180, 0.6, 0.18, { wet: 1 }); bell(790, 0.8, 0.16, { at: 0.08, wet: 1.2 }); },
  tick(pitchIdx = 0) { const base = [1040, 1240, 1560, 1860, 2080][pitchIdx % 5]; bell(base + (Math.random() - 0.5) * 40, 0.22, 0.08, { bright: 0.7, wet: 0.5 }); },
  // a rising, breathy metallic shimmer for the build: filtered noise sweep under the ticks
  shimmer(seconds = 4) {
    const c = ensure(); if (!c || !enabled()) return;
    const t0 = c.currentTime;
    const len = Math.floor(c.sampleRate * seconds), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource(); src.buffer = buf;
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 14;
    bp.frequency.setValueAtTime(600, t0); bp.frequency.exponentialRampToValueAtTime(5200, t0 + seconds);
    const g = c.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.09, t0 + seconds * 0.35); g.gain.linearRampToValueAtTime(0, t0 + seconds);
    src.connect(bp); bp.connect(g); out(g, 1.5); src.start(t0); src.stop(t0 + seconds + 0.1);
    // a low resonant hum that settles as the strand locks in
    const o = c.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(110, t0); o.frequency.exponentialRampToValueAtTime(220, t0 + seconds);
    const og = c.createGain(); og.gain.setValueAtTime(0, t0); og.gain.linearRampToValueAtTime(0.04, t0 + 0.6); og.gain.linearRampToValueAtTime(0, t0 + seconds);
    o.connect(og); out(og, 0.6); o.start(t0); o.stop(t0 + seconds + 0.1);
  },
};
