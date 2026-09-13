// Engraved-style illustrations for Second Opinion, drawn as inline SVG.
const INK = '#1d1712';
const defs = `
  <defs>
    <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
      <line x1="0" y1="0" x2="0" y2="6" stroke="${INK}" stroke-width="0.7" opacity="0.55"/>
    </pattern>
    <pattern id="hatch2" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-40)">
      <line x1="0" y1="0" x2="0" y2="5" stroke="${INK}" stroke-width="0.6" opacity="0.35"/>
    </pattern>
  </defs>`;
const wobble = (x1, y1, x2, y2, amp = 3, n = 8) => {
  let d = `M${x1} ${y1}`;
  for (let i = 1; i <= n; i++) {
    const t = i / n, x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t + Math.sin(i * 2.1) * amp;
    d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
};

export const ART = {
  seams() {
    const layers = ['Medicine', 'Biology', 'Chemistry', 'Physics'];
    const joins = ['body / person', 'cells / mind', 'reactions / organism'];
    let s = `<svg viewBox="0 0 720 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Four strata: physics, chemistry, biology, medicine, with leaky joins">${defs}`;
    const x0 = 150, w = 300, top = 26, h = 58;
    layers.forEach((name, i) => {
      const y = top + i * h;
      const fill = i % 2 ? 'url(#hatch2)' : 'url(#hatch)';
      s += `<rect x="${x0}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="none"/>`;
      s += `<rect x="${x0}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${INK}" stroke-width="1.3"/>`;
      s += `<text x="${x0 + w / 2}" y="${y + h / 2 + 6}" text-anchor="middle" font-family="Playfair Display, Georgia, serif" font-size="19" font-weight="700" fill="${INK}" style="paint-order:stroke" stroke="#efe4cc" stroke-width="6">${name}</text>`;
    });
    // leaky joins: wobbly seams that overspill the block edges, with labels
    joins.forEach((label, i) => {
      const y = top + (i + 1) * h;
      s += `<path d="${wobble(x0 - 22, y, x0 + w + 22, y, 4, 14)}" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>`;
      for (let k = 0; k < 6; k++) {
        const cx = x0 + 30 + k * 50, cy = y + (k % 2 ? 6 : -6);
        s += `<circle cx="${cx}" cy="${cy}" r="1.8" fill="${INK}"/>`;
      }
      s += `<path d="M${x0 + w + 26} ${y} h 40" stroke="${INK}" stroke-width="0.9" fill="none"/>`;
      s += `<text x="${x0 + w + 72}" y="${y + 4}" font-family="Libre Baskerville, Georgia, serif" font-style="italic" font-size="12.5" fill="${INK}">${label}</text>`;
    });
    // annotation on the left
    s += `<text x="${x0 - 30}" y="${top + 10}" text-anchor="end" font-family="Libre Baskerville, Georgia, serif" font-size="11.5" font-style="italic" fill="${INK}">the tallest stack we have</text>`;
    s += `<path d="M${x0 - 26} ${top + 4} q 12 -14 26 0" fill="none" stroke="${INK}" stroke-width="0.9"/>`;
    s += `<text x="${x0 - 30}" y="${top + 4 * h - 12}" text-anchor="end" font-family="Libre Baskerville, Georgia, serif" font-size="11.5" font-style="italic" fill="${INK}">the ground floor</text>`;
    s += `<text x="${x0 + w / 2}" y="${top + 4 * h + 24}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9.5" letter-spacing="2" fill="${INK}">PHILOSOPHY LIVES IN THE JOINS</text>`;
    return s + '</svg>';
  },

  balance() {
    let s = `<svg viewBox="0 0 720 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A balance weighing theory against practice">${defs}`;
    const cx = 360, base = 262;
    // pillar and base
    s += `<path d="M${cx - 70} ${base} h 140" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>`;
    s += `<path d="M${cx} ${base} V 96" stroke="${INK}" stroke-width="2.2"/>`;
    s += `<rect x="${cx - 6}" y="${base - 6}" width="12" height="6" fill="url(#hatch)" stroke="${INK}" stroke-width="1"/>`;
    // beam, slightly tilted toward practice
    const tilt = 3;
    s += `<path d="M${cx - 190} ${96 + tilt} L${cx + 190} ${96 - tilt}" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`;
    s += `<circle cx="${cx}" cy="96" r="5" fill="#efe4cc" stroke="${INK}" stroke-width="1.6"/>`;
    // pans
    const pan = (px, py, label, sub) => {
      s += `<path d="M${px} ${py} L${px - 34} ${py + 70} M${px} ${py} L${px + 34} ${py + 70}" stroke="${INK}" stroke-width="1" fill="none"/>`;
      s += `<path d="M${px - 62} ${py + 70} q 62 30 124 0" fill="url(#hatch2)" stroke="${INK}" stroke-width="1.6"/>`;
      s += `<path d="M${px - 62} ${py + 70} h 124" stroke="${INK}" stroke-width="1.6"/>`;
      s += `<text x="${px}" y="${py + 118}" text-anchor="middle" font-family="Playfair Display, Georgia, serif" font-weight="700" font-size="17" fill="${INK}">${label}</text>`;
      s += `<text x="${px}" y="${py + 136}" text-anchor="middle" font-family="Libre Baskerville, Georgia, serif" font-style="italic" font-size="11.5" fill="${INK}">${sub}</text>`;
    };
    pan(cx - 190, 96 + tilt, 'Theory', 'Flexner, 1910: the foundation');
    pan(cx + 190, 96 - tilt, 'Practice', 'Osler: the bedside');
    // books on theory pan, a hand on practice pan
    const lx = cx - 190, ly = 96 + tilt + 70;
    s += `<rect x="${lx - 26}" y="${ly - 34}" width="52" height="10" fill="url(#hatch)" stroke="${INK}" stroke-width="1"/>`;
    s += `<rect x="${lx - 22}" y="${ly - 24}" width="44" height="10" fill="none" stroke="${INK}" stroke-width="1"/>`;
    s += `<rect x="${lx - 28}" y="${ly - 14}" width="56" height="10" fill="url(#hatch2)" stroke="${INK}" stroke-width="1"/>`;
    const rx = cx + 190, ry = 96 - tilt + 70;
    s += `<path d="M${rx - 22} ${ry - 4} c 0 -14 6 -22 10 -28 M${rx - 12} ${ry - 4} c 0 -16 4 -26 8 -32 M${rx - 2} ${ry - 4} c 0 -16 4 -26 8 -30 M${rx + 8} ${ry - 4} c 0 -12 3 -20 7 -24 M${rx - 22} ${ry - 4} h 30 c 6 0 6 -12 -2 -14" fill="none" stroke="${INK}" stroke-width="1.2" stroke-linecap="round"/>`;
    s += `<text x="${cx}" y="42" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9.5" letter-spacing="2" fill="${INK}">EACH ONE MAKING THE OTHER LEGIBLE</text>`;
    return s + '</svg>';
  },

  selection() {
    let s = `<svg viewBox="0 0 720 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Directional and stabilising selection curves">${defs}`;
    const bell = (cx, sd, base, height, w) => {
      let d = '';
      for (let i = 0; i <= 60; i++) {
        const x = cx - w / 2 + (w * i) / 60, z = (x - cx) / sd, y = base - height * Math.exp(-0.5 * z * z);
        d += (i ? ' L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
      }
      return d;
    };
    const panel = (ox, title, sub, shift, narrow) => {
      const base = 215, w = 260, cx = ox + w / 2;
      s += `<path d="M${ox} ${base} h ${w}" stroke="${INK}" stroke-width="1.2"/>`;
      s += `<path d="M${ox} ${base} V 70" stroke="${INK}" stroke-width="1.2"/>`;
      // before (hatched, dashed) and after (solid)
      s += `<path d="${bell(cx, 46, base, 110, w)}" fill="url(#hatch2)" stroke="${INK}" stroke-width="1" stroke-dasharray="4 3"/>`;
      s += `<path d="${bell(cx + shift, narrow ? 28 : 46, base, narrow ? 138 : 110, w)}" fill="none" stroke="${INK}" stroke-width="2.2"/>`;
      if (shift) s += `<path d="M${cx} 60 h ${shift - 8}" stroke="${INK}" stroke-width="1.2" marker-end="url(#arrow)"/>`;
      else s += `<path d="M${cx - 60} 60 h 40 M${cx + 60} 60 h -40" stroke="${INK}" stroke-width="1.2" marker-end="url(#arrow)"/>`;
      s += `<text x="${cx}" y="${base + 20}" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9.5" letter-spacing="2" fill="${INK}">HEIGHT →</text>`;
      s += `<text x="${cx}" y="${base + 46}" text-anchor="middle" font-family="Playfair Display, Georgia, serif" font-weight="700" font-size="16" fill="${INK}">${title}</text>`;
      s += `<text x="${cx}" y="${base + 64}" text-anchor="middle" font-family="Libre Baskerville, Georgia, serif" font-style="italic" font-size="11.5" fill="${INK}">${sub}</text>`;
    };
    s += `<defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="${INK}"/></marker></defs>`;
    panel(70, 'Directional', 'men: taller fathers, more children', 34, false);
    panel(400, 'Stabilising', 'women: average height did best', 0, true);
    s += `<text x="360" y="30" text-anchor="middle" font-family="JetBrains Mono, monospace" font-size="9.5" letter-spacing="2" fill="${INK}">94,516 PARTICIPANTS · DUTCH LIFELINES COHORT · STULP ET AL. 2015</text>`;
    return s + '</svg>';
  },
};
