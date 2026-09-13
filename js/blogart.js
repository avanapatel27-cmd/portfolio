// Inline SVG figures and summary posters for the medical blog (js/blog.js).
// Everything is drawn in code so it stays crisp at any size and matches the site's palette.

const INK = '#1d2733', BLUE = '#3d6a8a', RED = '#b5443a', GREY = '#8a8f96', BLUE_FILL = '#d5dfe6', RED_FILL = '#f2dcdc', GOLD = '#a8742e', CREAM = '#f5f1e8';
const SANS = "'Manrope', 'Helvetica Neue', Arial, sans-serif";
const SERIF = "'Cormorant Garamond', 'Playfair Display', Georgia, serif";
const MONO = "'JetBrains Mono', Menlo, monospace";

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// greedy word wrap → array of lines
function wrap(text, max) {
  const out = []; let line = '';
  for (const w of String(text).split(/\s+/)) {
    if ((line + ' ' + w).trim().length > max && line) { out.push(line); line = w; } else line = (line + ' ' + w).trim();
  }
  if (line) out.push(line);
  return out;
}
function tspans(text, x, max, lh) {
  return wrap(text, max).map((l, i) => `<tspan x="${x}" dy="${i ? lh : 0}">${esc(l)}</tspan>`).join('');
}
const T = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-family="${o.f || SANS}" font-size="${o.s || 20}" fill="${o.c || INK}" font-weight="${o.w || 400}" text-anchor="${o.a || 'start'}" ${o.i ? 'font-style="italic"' : ''} ${o.ls ? `letter-spacing="${o.ls}"` : ''}>${esc(s)}</text>`;

// ───────────────────────── figures (recreated from the article images) ─────────────────────────

// Figure 1 of the GLP-1 piece: forest plot of residual gastric content, three studies + pooled estimate
function forest() {
  const X1 = 583, DEC = 165; // x of OR = 1 and pixels per decade (log10)
  const lx = v => X1 + DEC * Math.log10(v);
  const rows = [
    { name: 'Sherwin 2023 (n=20)', a: '7/10', b: '1/10', or: 21.00, lo: 1.78, hi: 248.11, w: 30, y: 167, txt: '21.00 (1.78 to 248.11)' },
    { name: 'Sen 2024 (n=124)', a: '35/62', b: '12/62', or: 5.40, lo: 2.41, hi: 12.09, w: 50, y: 275, txt: '5.40 (2.41 to 12.09)' },
    { name: 'Nersessian 2024 (n=220)', a: '43/107', b: '3/113', or: 24.64, lo: 7.34, hi: 82.64, w: 44, y: 383, txt: '24.64 (7.34 to 82.64)' },
  ];
  let s = '';
  s += T(365, 87, 'GLP-1 RA', { w: 700, a: 'middle', s: 21 }) + T(475, 87, 'Control', { w: 700, a: 'middle', s: 21 }) + T(1323, 87, 'OR (95% CI)', { w: 700, a: 'end', s: 21 });
  s += `<line x1="${X1}" y1="60" x2="${X1}" y2="578" stroke="${GREY}" stroke-width="2" stroke-dasharray="7 7"/>`;
  for (const r of rows) {
    s += T(35, r.y + 8, r.name, { s: 22 }) + T(365, r.y + 8, r.a, { a: 'middle', c: BLUE, s: 21 }) + T(475, r.y + 8, r.b, { a: 'middle', c: BLUE, s: 21 }) + T(1323, r.y + 8, r.txt, { a: 'end', s: 21 });
    s += `<line x1="${lx(r.lo)}" y1="${r.y}" x2="${lx(r.hi)}" y2="${r.y}" stroke="${INK}" stroke-width="2.5"/>`;
    s += `<line x1="${lx(r.lo)}" y1="${r.y - 12}" x2="${lx(r.lo)}" y2="${r.y + 12}" stroke="${INK}" stroke-width="2.5"/><line x1="${lx(r.hi)}" y1="${r.y - 12}" x2="${lx(r.hi)}" y2="${r.y + 12}" stroke="${INK}" stroke-width="2.5"/>`;
    s += `<rect x="${lx(r.or) - r.w / 2}" y="${r.y - r.w / 2}" width="${r.w}" height="${r.w}" fill="${BLUE}"/>`;
  }
  const py = 474;
  s += T(35, py + 8, 'Pooled (random effects)', { w: 700, s: 22 }) + T(1323, py + 8, '11.75 (3.67 to 37.68)', { w: 700, a: 'end', s: 21 });
  s += `<polygon points="${lx(3.67)},${py} ${lx(11.75)},${py - 24} ${lx(37.68)},${py} ${lx(11.75)},${py + 24}" fill="${RED}"/>`;
  s += T(35, 558, 'Q = 4.65, df = 2, p = 0.098;   τ² = 0.58;   I² = 57%', { c: BLUE, s: 19 });
  // axis
  s += `<line x1="533" y1="578" x2="1055" y2="578" stroke="${INK}" stroke-width="2"/>`;
  for (const v of [1, 10, 100]) s += `<line x1="${lx(v)}" y1="578" x2="${lx(v)}" y2="590" stroke="${INK}" stroke-width="2"/>` + T(lx(v), 616, String(v), { a: 'middle', s: 21 });
  for (const d of [0.1, 1, 10, 100]) for (let k = 2; k < 10; k++) { const v = d * k; if (v >= 0.5 && v <= 700) s += `<line x1="${lx(v)}" y1="578" x2="${lx(v)}" y2="585" stroke="${INK}" stroke-width="1.5"/>`; }
  s += T(793, 656, 'Odds ratio for increased residual gastric content (log scale)', { a: 'middle', s: 21 });
  return `<svg viewBox="0 0 1360 690" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Forest plot of residual gastric content in GLP-1 receptor agonist users versus controls">${s}</svg>`;
}

// Figure 1 of the punch biopsy piece: apposition vectors of a simple interrupted suture and a figure-of-eight
function suture() {
  const arrow = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${RED}" stroke-width="2.5" marker-end="url(#ah)"/>`;
  const tick = (x, y, ang) => `<line x1="0" y1="-14" x2="0" y2="14" stroke="${BLUE}" stroke-width="3.5" transform="translate(${x} ${y}) rotate(${ang})"/>`;
  let s = `<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${RED}"/></marker>
  <marker id="ag" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${GREY}"/></marker></defs>`;
  const panel = (cx, title, label, note1, note2, body) => {
    let p = T(cx, 100, title, { w: 700, a: 'middle', s: 30 }) + T(cx, 250, label, { a: 'middle', c: RED, s: 21 });
    p += `<circle cx="${cx}" cy="415" r="115" fill="none" stroke="${INK}" stroke-width="3"/>` + body;
    p += T(cx, 578, note1, { a: 'middle', s: 21 }) + T(cx, 598, note2, { a: 'middle', s: 21 });
    p += `<line x1="${cx - 265}" y1="652" x2="${cx + 265}" y2="652" stroke="${GREY}" stroke-width="2.5" marker-start="url(#ag)" marker-end="url(#ag)"/>` + T(cx, 683, 'relaxed skin tension line', { a: 'middle', c: GREY, s: 19 });
    return p;
  };
  // simple interrupted: one horizontal thread
  let a = `<line x1="118" y1="415" x2="473" y2="415" stroke="${BLUE}" stroke-width="4"/>` + tick(118, 415, 0) + tick(473, 415, 0);
  a += `<line x1="80" y1="415" x2="118" y2="415" stroke="${RED}" stroke-width="2.5"/><line x1="473" y1="415" x2="510" y2="415" stroke="${RED}" stroke-width="2.5"/>`;
  a += arrow(150, 415, 225, 415) + arrow(440, 415, 365, 415);
  // figure-of-eight: two crossing threads
  const cx = 987;
  let b = `<line x1="808" y1="368" x2="1165" y2="462" stroke="${BLUE}" stroke-width="4"/><line x1="808" y1="462" x2="1165" y2="368" stroke="${BLUE}" stroke-width="4"/>`;
  b += tick(808, 368, 0) + tick(1165, 462, 0) + tick(808, 462, 0) + tick(1165, 368, 0);
  b += `<line x1="772" y1="358" x2="808" y2="368" stroke="${RED}" stroke-width="2.5"/><line x1="1165" y1="462" x2="1201" y2="472" stroke="${RED}" stroke-width="2.5"/><line x1="772" y1="472" x2="808" y2="462" stroke="${RED}" stroke-width="2.5"/><line x1="1165" y1="368" x2="1201" y2="358" stroke="${RED}" stroke-width="2.5"/>`;
  b += arrow(840, 377, 925, 400) + arrow(1133, 453, 1050, 431) + arrow(840, 453, 925, 431) + arrow(1133, 377, 1050, 400);
  s += panel(295, 'Simple interrupted', 'one apposition vector', 'edges tend to gape', 'perpendicular to the pull', a);
  s += panel(cx, 'Figure-of-eight', 'four-point apposition', 'proposed: even eversion,', 'no dumbbell narrowing', b);
  s += T(640, 742, 'Geometry of the two closures on a circular 4 mm defect. Proposed mechanism only, untested.', { a: 'middle', c: GREY, s: 20, i: 1 });
  return `<svg viewBox="0 0 1280 780" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Apposition vectors of a simple interrupted suture and a figure-of-eight suture on a circular defect">${s}</svg>`;
}

// Figure 1 of the supratip piece: TDP to ASA thresholds by risk stratum
function supratip() {
  const X0 = 35, PX = 212; // x of 4 mm and px per mm
  const mx = v => X0 + PX * (v - 4);
  let s = '';
  s += T(305, 78, 'higher risk of supratip deformity', { a: 'middle', c: RED, s: 21 }) + T(1010, 78, 'lower risk', { a: 'middle', c: BLUE, s: 21 });
  const bar = (y, thr, col, lbl, name) => {
    let b = `<rect x="${X0}" y="${y}" width="${mx(thr) - X0}" height="65" fill="${RED_FILL}"/><rect x="${mx(thr)}" y="${y}" width="${mx(10) - mx(thr)}" height="65" fill="${BLUE_FILL}"/>`;
    b += `<line x1="${mx(thr)}" y1="${y - 17}" x2="${mx(thr)}" y2="${y + 83}" stroke="${col}" stroke-width="5"/>`;
    b += T(mx(thr), y - 30, lbl, { a: 'middle', c: col, w: 700, s: 23 }) + T(47, y + 108, name, { s: 24 });
    return b;
  };
  s += bar(157, 6.0, BLUE, '6.0 mm', 'Low surgical risk score');
  s += bar(315, 7.5, RED, '7.5 mm', 'High surgical risk score');
  s += `<line x1="${mx(6.5)}" y1="300" x2="${mx(6.5)}" y2="395" stroke="${GREY}" stroke-width="3" stroke-dasharray="8 7"/>`;
  s += T(mx(6.5), 411, '6.5 mm: risk rises significantly', { a: 'middle', c: GREY, s: 18 }) + T(mx(6.5), 432, 'below this in high-risk cases', { a: 'middle', c: GREY, s: 18 });
  s += `<line x1="${X0}" y1="470" x2="${mx(10)}" y2="470" stroke="${INK}" stroke-width="2"/>`;
  for (let v = 4; v <= 10; v++) s += `<line x1="${mx(v)}" y1="470" x2="${mx(v)}" y2="480" stroke="${INK}" stroke-width="2"/>` + T(mx(v), 504, String(v), { a: 'middle', s: 22 });
  s += T(671, 546, 'Intraoperative tip-defining point to anterior septal angle (TDP to ASA) distance, mm', { a: 'middle', s: 22 });
  s += T(671, 590, 'Thresholds from Şibar et al., Ann Plast Surg 2024;93(5):551 to 557 (n = 469; 51 deformities, 10.9%). Single-centre retrospective series.', { a: 'middle', c: GREY, s: 18, i: 1 });
  return `<svg viewBox="0 0 1360 620" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Intraoperative TDP to ASA distance thresholds by surgical risk stratum">${s}</svg>`;
}

// CIED audit: the audit cycle as a loop, with the 24-hour standard at its centre
function auditLoop() {
  const cx = 640, cy = 360, R = 230;
  const steps = ['Define the question and a three-month window', 'Extract anonymised alert data', 'Measure: proportion reviewed within 24 h', 'Find the dominant cause of delay', 'One intervention', 'Re-audit'];
  let s = `<defs><marker id="al" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="${BLUE}"/></marker></defs>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${BLUE}" stroke-width="3" stroke-dasharray="4 10"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="128" fill="${RED_FILL}" stroke="${RED}" stroke-width="3"/>`;
  s += T(cx, cy - 8, '24 h', { a: 'middle', c: RED, w: 700, s: 54, f: SERIF }) + T(cx, cy + 28, 'alert review standard', { a: 'middle', c: RED, s: 17 }) + T(cx, cy + 54, 'BHRS 2022 · target 100%', { a: 'middle', c: RED, s: 13, f: MONO });
  steps.forEach((st, i) => {
    const a0 = -Math.PI / 2 + i * (2 * Math.PI / steps.length);
    const x = cx + R * Math.cos(a0), y = cy + R * Math.sin(a0);
    const a1 = a0 + (2 * Math.PI / steps.length) * 0.62;
    s += `<path d="M ${cx + R * Math.cos(a0 + 0.22)} ${cy + R * Math.sin(a0 + 0.22)} A ${R} ${R} 0 0 1 ${cx + R * Math.cos(a1)} ${cy + R * Math.sin(a1)}" fill="none" stroke="${BLUE}" stroke-width="3" marker-end="url(#al)"/>`;
    s += `<circle cx="${x}" cy="${y}" r="30" fill="${BLUE}"/>` + T(x, y + 9, String(i + 1), { a: 'middle', c: '#fff', w: 700, s: 26, f: SERIF });
    const lx = cx + (R + 62) * Math.cos(a0), ly = cy + (R + 62) * Math.sin(a0);
    const anchor = Math.abs(Math.cos(a0)) < 0.2 ? 'middle' : (Math.cos(a0) > 0 ? 'start' : 'end');
    const lines = wrap(st, 24);
    s += `<text x="${lx}" y="${ly - (lines.length - 1) * 11 + 7}" font-family="${SANS}" font-size="19" fill="${INK}" text-anchor="${anchor}">${lines.map((l, k) => `<tspan x="${lx}" dy="${k ? 23 : 0}">${esc(l)}</tspan>`).join('')}</text>`;
  });
  s += T(640, 716, 'One change per cycle. A re-audit after three simultaneous changes tells you nothing about which one worked.', { a: 'middle', c: GREY, s: 19, i: 1 });
  return `<svg viewBox="0 0 1280 740" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="The audit cycle for remote monitoring alert review">${s}</svg>`;
}

// ───────────────────────── summary posters ─────────────────────────
// One template: headline, thesis, a row of key numbers, a numbered flow, side notes, footnote.
function poster(d) {
  const W = 1200, PAD = 56;
  let s = '', y = 0;
  // header band
  s += `<rect x="0" y="0" width="${W}" height="150" fill="${INK}"/>`;
  s += T(PAD, 52, d.eyebrow || 'At a glance', { c: '#e2b25c', f: MONO, s: 14, ls: 4 });
  s += `<text x="${PAD}" y="100" font-family="${SERIF}" font-size="44" font-weight="600" fill="${CREAM}">${tspans(d.title, PAD, 52, 46)}</text>`;
  const tl = wrap(d.title, 52).length;
  const bandH = 150 + (tl - 1) * 46;
  if (tl > 1) s = s.replace(`height="150"`, `height="${bandH}"`);
  y = bandH + 44;
  // thesis
  const th = wrap(d.thesis, 92);
  s += `<text x="${PAD}" y="${y}" font-family="${SERIF}" font-size="26" font-style="italic" fill="${INK}">${th.map((l, i) => `<tspan x="${PAD}" dy="${i ? 32 : 0}">${esc(l)}</tspan>`).join('')}</text>`;
  y += th.length * 32 + 26;
  // stats row
  const n = d.stats.length, cw = (W - PAD * 2 - (n - 1) * 18) / n;
  let statH = 0;
  d.stats.forEach((st, i) => {
    const x = PAD + i * (cw + 18);
    const lines = wrap(st.label, Math.floor(cw / 9.2));
    const h = 118 + lines.length * 21;
    statH = Math.max(statH, h);
    s += `<rect x="${x}" y="${y}" width="${cw}" height="${h}" rx="10" fill="${i % 2 ? RED_FILL : BLUE_FILL}" data-h="${h}"/>`;
    s += T(x + 20, y + 72, st.n, { c: i % 2 ? RED : BLUE, w: 700, s: st.n.length > 9 ? 36 : 50, f: SERIF });
    s += `<text x="${x + 20}" y="${y + 104}" font-family="${SANS}" font-size="17" fill="${INK}">${lines.map((l, k) => `<tspan x="${x + 20}" dy="${k ? 21 : 0}">${esc(l)}</tspan>`).join('')}</text>`;
  });
  // equalise tile heights
  s = s.replace(/height="(\d+)" rx="10" fill="(#[0-9a-f]{6})" data-h="\d+"/g, `height="${statH}" rx="10" fill="$2"`);
  y += statH + 48;
  // flow (left) + notes (right)
  const flowW = 690, notesX = PAD + flowW + 40, notesW = W - notesX - PAD;
  s += T(PAD, y, d.flowTitle, { c: GOLD, f: MONO, s: 13, ls: 4 }) + T(notesX, y, d.notesTitle, { c: GOLD, f: MONO, s: 13, ls: 4 });
  y += 26;
  let fy = y, ny = y;
  d.flow.forEach((f, i) => {
    const lines = wrap(f, 60);
    const h = Math.max(54, lines.length * 24 + 22);
    s += `<circle cx="${PAD + 22}" cy="${fy + 27}" r="20" fill="${BLUE}"/>` + T(PAD + 22, fy + 34, String(i + 1), { a: 'middle', c: '#fff', w: 700, s: 20, f: SERIF });
    if (i < d.flow.length - 1) s += `<line x1="${PAD + 22}" y1="${fy + 47}" x2="${PAD + 22}" y2="${fy + h + 7}" stroke="${BLUE}" stroke-width="2" stroke-dasharray="3 5"/>`;
    s += `<text x="${PAD + 60}" y="${fy + 33}" font-family="${SANS}" font-size="20" fill="${INK}">${lines.map((l, k) => `<tspan x="${PAD + 60}" dy="${k ? 24 : 0}">${esc(l)}</tspan>`).join('')}</text>`;
    fy += h + 8;
  });
  d.notes.forEach(nt => {
    const [head, body] = nt.split('::');
    const hl = wrap(head.trim(), Math.floor(notesW / 10.5)), bl = wrap((body || '').trim(), Math.floor(notesW / 8.8));
    s += `<line x1="${notesX}" y1="${ny + 4}" x2="${notesX}" y2="${ny + hl.length * 23 + bl.length * 21 + 6}" stroke="${RED}" stroke-width="3"/>`;
    s += `<text x="${notesX + 16}" y="${ny + 22}" font-family="${SANS}" font-size="19" font-weight="700" fill="${INK}">${hl.map((l, k) => `<tspan x="${notesX + 16}" dy="${k ? 23 : 0}">${esc(l)}</tspan>`).join('')}</text>`;
    if (bl.length) s += `<text x="${notesX + 16}" y="${ny + 22 + hl.length * 23}" font-family="${SANS}" font-size="17" fill="${INK}">${bl.map((l, k) => `<tspan x="${notesX + 16}" dy="${k ? 21 : 0}">${esc(l)}</tspan>`).join('')}</text>`;
    ny += hl.length * 23 + bl.length * 21 + 26;
  });
  y = Math.max(fy, ny) + 22;
  // footnote
  s += `<line x1="${PAD}" y1="${y}" x2="${W - PAD}" y2="${y}" stroke="${GREY}" stroke-width="1"/>`;
  const fl = wrap(d.foot, 88);
  s += `<text x="${PAD}" y="${y + 30}" font-family="${SANS}" font-size="16" font-style="italic" fill="${GREY}">${fl.map((l, k) => `<tspan x="${PAD}" dy="${k ? 20 : 0}">${esc(l)}</tspan>`).join('')}</text>`;
  s += T(W - PAD, y + 30, 'Dr. Avana Framroz Patel', { a: 'end', c: GREY, f: MONO, s: 13, ls: 3 });
  const H = y + 30 + fl.length * 20 + 36;
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Summary poster: ${esc(d.title)}"><rect width="${W}" height="${H}" fill="${CREAM}"/>${s}</svg>`;
}

const POSTERS = {
  glp1: () => poster({
    eyebrow: 'At a glance · perioperative and reconstructive',
    title: 'GLP-1 receptor agonists in plastic surgery',
    thesis: 'Full stomachs are common, aspiration is rare. Ask, assess on the day, adjust the anaesthetic. For body contouring, wait for weight stability and check nutrition before you cut.',
    stats: [
      { n: '11.75', label: 'pooled odds ratio for retained gastric content on ultrasound (95% CI 3.67 to 37.68)' },
      { n: '47.5% v 8.6%', label: 'fasted patients with increased residual content, GLP-1 RA users versus controls' },
      { n: '0.1 to 0.2%', label: 'reported perioperative aspiration rate; no significant excess over controls in larger analyses' },
      { n: '6 to 12 mo', label: 'documented weight stability before body contouring' },
    ],
    flowTitle: 'On the list',
    flow: [
      'Ask specifically: "Are you on any weight-loss injections?" On the pre-assessment proforma, not in the anaesthetic room.',
      'Continue the drug in asymptomatic maintenance-phase patients; 24 hours of clear fluids first in higher-risk patients.',
      'Assess on the day for nausea, bloating, early satiety or vomiting, whatever the hold duration.',
      'Gastric POCUS where concern persists. It answers the question for the patient in front of you.',
      'Adjust the anaesthetic, not the surgery: rapid sequence induction, or regional and local plus sedation where the procedure allows.',
    ],
    notesTitle: 'Before contouring',
    notes: [
      'Weight stability :: Actively losing or likely to regain means the wrong operation at the wrong time. Agree the drug plan with the prescriber.',
      'Nutrition :: Albumin, iron studies, B12, folate and vitamin D. Low threshold for dietetics.',
      'Facial volume :: Midface hollowing and laxity are the commonest concern; the usual restoration ladder, at higher volume.',
      'Expectations :: Outcomes match bariatric patients, but expectation scores run higher. The consultation has to work harder.',
    ],
    foot: 'Pooled from Sherwin 2023, Sen 2024 and Nersessian 2024: three prospective gastric ultrasound studies, 364 patients, I² 57%. Direction and rough magnitude, not a precise effect size.',
  }),

  suture: () => poster({
    eyebrow: 'At a glance · evidence review and trial design',
    title: 'The figure-of-eight suture for punch biopsy closure',
    thesis: 'A technique in common use on no comparative evidence. The claim is geometric, plausible and untested, and a split-body trial would settle it in a single outpatient service.',
    stats: [
      { n: '0', label: 'comparative studies of figure-of-eight versus simple interrupted closure in skin' },
      { n: '1', label: 'technical note (arthroscopy portals, 2012): no controls, no scar scale, no numbers' },
      { n: '58.9 v 57.1', label: 'blinded VAS at nine months, primary closure versus second intention for punch sites (Christenson 2005)' },
      { n: '44 pairs', label: 'to detect a 0.5 SD difference at 90% power; 55 patients after 20% loss to follow-up' },
    ],
    flowTitle: 'The trial',
    flow: [
      'Adults having two or more 4 mm punch biopsies at paired trunk or proximal limb sites.',
      'Site-level randomisation, sealed envelope opened after the biopsy is taken.',
      'One figure-of-eight and one simple interrupted per patient: same monofilament, same operator, same removal day.',
      'Observer POSAS 2.0 at six months, two blinded assessors scoring standardised photographs.',
      'Paired t-test or Wilcoxon signed-rank on within-patient differences; pre-specified subgroup by site.',
    ],
    notesTitle: 'Design notes',
    notes: [
      'Exclusions :: Keloid or hypertrophic history, immunosuppression, anticoagulation, diabetes, active smoking, head and neck sites.',
      'Secondary outcomes :: Patient POSAS, maximum scar width, closure time, suture-track visibility, dehiscence, infection, bleeding.',
      'Governance :: Two accepted techniques within routine care: full REC approval and consent, no IMP or CTIMP framework.',
      'Why bother :: One of the highest-volume procedures in medicine. Equivalence would be worth knowing too.',
    ],
    foot: 'Single centre, no funding beyond photography, 12 to 18 months of recruitment, a clean answer either way.',
  }),

  supratip: () => poster({
    eyebrow: 'At a glance · open rhinoplasty',
    title: 'Measuring instead of eyeballing: supratip deformity',
    thesis: 'A caliper measurement taken at final tip fixation, tip-defining point to anterior septal angle, predicts supratip deformity at twelve months within risk strata. A number can be audited. An impression cannot.',
    stats: [
      { n: '10.9%', label: 'supratip deformity at twelve months (51 of 469 open rhinoplasties, Şibar 2024)' },
      { n: '> 6.0 mm', label: 'TDP to ASA target in low-risk noses' },
      { n: '> 7.5 mm', label: 'target in high-risk noses; risk rises significantly below 6.5 mm' },
      { n: '7° · 0.02', label: 'expected settling of rotation and Goode ratio over a year, mostly in the first six months' },
    ],
    flowTitle: 'Into theatre',
    flow: [
      'Score the risk before you start: skin thickness, lower lateral cartilage strength, planned hump resection, planned soft-tissue work.',
      'Measure TDP to ASA with calipers at the point of final tip fixation, not by impression.',
      'Target above 6.0 mm in low-risk and above 7.5 mm in high-risk noses, with 6.5 mm as the floor in high-risk cases.',
      'Finish slightly over-rotated and over-projected to absorb the predictable drift.',
      'Record the number. Thirty of your own cases with a twelve-month outcome is an audit.',
    ],
    notesTitle: 'What it measures',
    notes: [
      'Space for the envelope :: Scar and subcutaneous tissue fill the gap between dorsal septum and redraped skin. Enough clearance keeps the break.',
      'Why the threshold rises :: Thick skin and wider dissection mean more fill. A 1.5 mm allowance is small enough to be counterintuitive.',
      'Limitations :: Single centre, retrospective, one team, risk score not externally validated, caliper precision in a bloody field.',
    ],
    foot: 'Şibar et al., Ann Plast Surg 2024;93(5):551 to 557. Settling data from an 84-patient 2026 series measuring nasolabial angle and Goode ratio at 0, 6 and 12 months.',
  }),

  cied: () => poster({
    eyebrow: 'At a glance · audit protocol',
    title: 'Auditing CIED remote monitoring alerts',
    thesis: 'What proportion of remote monitoring alerts are reviewed within 24 hours, and what predicts delay? A process audit against BHRS 2022 and the 2024 UK Delphi consensus that a trainee can actually run.',
    stats: [
      { n: '24 h', label: 'standard for alert review, target 100%. Numeric, time-stamped and almost certainly not met anywhere' },
      { n: '55%', label: 'of 26,713 remotely monitored patients had at least one alert in a year: 82,797 alerts' },
      { n: '200', label: 'alerts: enough to estimate a proportion near 80% to within ±5.5% at 95% confidence' },
      { n: '79 of 114', label: 'Delphi statements reaching 90% agreement; lowest agreement on who has the capacity' },
    ],
    flowTitle: 'The protocol',
    flow: [
      'All alert-initiated transmissions over a defined three-month window, or a random sample of 200.',
      'Extract anonymised fields: device type, manufacturer, alert category and priority, transmission and first-review timestamps, action, day of week, consent.',
      'Proportion within 24 h with Wilson intervals; median (IQR) time to review; χ² by day of week and priority; a weekly run chart.',
      'Register as service evaluation with clinical audit. Not research, no REC. Anonymise at extraction.',
      'Pick the one dominant failure and change one thing, then re-audit.',
    ],
    notesTitle: 'Likely findings',
    notes: [
      'Weekends and bank holidays :: Seven-day alerts into a five-day service make the standard arithmetically unachievable. A staffing question, not a performance one.',
      'Alert burden :: Manufacturer nominal thresholds are not tuned to your service. Reviewing them shrinks the denominator.',
      'Consent :: Often missing in patients implanted before remote monitoring was routine. Cheap to fix.',
      'Triage :: Without priority triage, urgent alerts wait behind fluid-index notifications.',
    ],
    foot: 'Measures a process, not outcomes: faster review is assumed to help and the evidence is indirect. Say what you measured and what you did not.',
  }),
};

export const BLOGART = { forest, suture, supratip, auditLoop, poster: k => POSTERS[k] ? POSTERS[k]() : '' };
