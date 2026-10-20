// Misst die Texte ALLER Grafik-SVGs (alle Sprachen) mit Liberation Sans, dem Stellvertreter für
// system-ui auf den Geräten (s. STELLVERTRETER in scripts/grafik-gate.mjs):
//   - Caption-Breite (.st, höchstens 250),
//   - ob ein Text über den Rand der viewBox läuft (2 Einheiten Luft),
//   - ob eine Linie, Bahn oder Kontur durch einen Text läuft, der keinen Halo trägt
//     (paint-order: stroke in der Farbe seines Grundes). Ausgenommen sind Texte in einer <g>
//     (die Zahlen in den Badges, die ihre Kreise selbst decken) und gedrehte Texte, deren
//     getBBox() die Drehung nicht kennt.
// scratchpad/figuren/gate.mjs prüft Breite und Ränder nur für die generierten Personengrafiken;
// dieses Skript deckt auch die übrigen Diagramme und ihre Sprachzwillinge ab.
//   node scratchpad/textgrenzen.mjs
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
import { readFileSync, readdirSync } from 'node:fs';
import { STELLVERTRETER } from '../scripts/grafik-gate.mjs';
const dir = new URL('../images/', import.meta.url).pathname;
const dateien = readdirSync(dir).filter((n) => /^G-\d{3}(\.\w\w)?\.svg$/.test(n)).sort();
const browser = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
const max = {}, aus = [], kreuzt = [];
for (const n of dateien) {
  const svg = readFileSync(dir + n, 'utf8');
  await page.setContent(`<!doctype html><meta charset="utf8"><style>${STELLVERTRETER}</style><body style="margin:0">${svg}</body>`);
  const r = await page.evaluate(() => {
    const s = document.querySelector('svg'), [, , w, h] = s.getAttribute('viewBox').split(/[\s,]+/).map(Number);
    const formen = [...s.querySelectorAll('path,line,circle,rect,ellipse,polyline,polygon')]
      .filter((f) => !f.closest('marker,defs,mask,clipPath'))
      .filter((f) => getComputedStyle(f).stroke !== 'none' || f.tagName === 'circle');
    const texte = [...s.querySelectorAll('text')].map((t) => {
      const b = t.getBBox(), halo = getComputedStyle(t).paintOrder.startsWith('stroke');
      let treffer = '';
      if (!halo && !t.closest('g') && !t.hasAttribute('transform')) {
        for (const f of formen) {
          const L = f.getTotalLength ? f.getTotalLength() : 0;
          for (let i = 0; i <= L && !treffer; i += 1) {
            const q = f.getPointAtLength(i);
            if (q.x > b.x && q.x < b.x + b.width && q.y > b.y && q.y < b.y + b.height) treffer = `${f.tagName}.${f.getAttribute('class') || ''}`;
          }
          if (treffer) break;
        }
      }
      return { st: t.classList.contains('st'), x0: b.x, x1: b.x + b.width, bw: b.width, txt: t.textContent, treffer };
    });
    return { w, h, t: texte };
  });
  for (const t of r.t) {
    if (t.st) max[n] = Math.max(max[n] || 0, t.bw);
    if (t.x0 < 2 || t.x1 > r.w - 2) aus.push(`${n}: „${t.txt}“ ${Math.round(t.x0)}–${Math.round(t.x1)} von ${r.w}`);
    if (t.treffer) kreuzt.push(`${n}: „${t.txt}“ ← ${t.treffer}`);
  }
}
const breit = Object.entries(max).filter(([, b]) => b > 250).map(([n, b]) => `${n} ${Math.round(b)}`);
console.log('Dateien', dateien.length, 'mit .st-Caption', Object.keys(max).length, 'breiteste', Math.round(Math.max(...Object.values(max))));
console.log('Caption > 250:', breit.length, breit.join(', '));
console.log('Text über den Rand:', aus.length); aus.forEach((a) => console.log('  ' + a));
console.log('Linie durch Text ohne Halo:', kreuzt.length); kreuzt.forEach((a) => console.log('  ' + a));
await browser.close();
process.exit(aus.length || breit.length || kreuzt.length ? 1 : 0);
