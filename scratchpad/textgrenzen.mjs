// Misst die Texte ALLER Grafik-SVGs (alle Sprachen) mit Liberation Sans, dem Stellvertreter für
// system-ui auf den Geräten (s. STELLVERTRETER in scripts/grafik-gate.mjs): Caption-Breite (.st,
// höchstens 250) und ob ein Text über den Rand der viewBox läuft (2 Einheiten Luft).
// scratchpad/figuren/gate.mjs prüft dasselbe nur für die generierten Personengrafiken; dieses
// Skript deckt auch die übrigen Diagramme und ihre Sprachzwillinge ab.
//   node scratchpad/textgrenzen.mjs
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
import { readFileSync, readdirSync } from 'node:fs';
import { STELLVERTRETER } from '../scripts/grafik-gate.mjs';
const dir = new URL('../images/', import.meta.url).pathname;
const dateien = readdirSync(dir).filter((n) => /^G-\d{3}(\.\w\w)?\.svg$/.test(n)).sort();
const browser = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
const max = {}, aus = [];
for (const n of dateien) {
  const svg = readFileSync(dir + n, 'utf8');
  await page.setContent(`<!doctype html><meta charset="utf8"><style>${STELLVERTRETER}</style><body style="margin:0">${svg}</body>`);
  const r = await page.evaluate(() => {
    const s = document.querySelector('svg'), [, , w, h] = s.getAttribute('viewBox').split(/[\s,]+/).map(Number);
    return { w, h, t: [...s.querySelectorAll('text')].map((t) => { const b = t.getBBox(); return { st: t.classList.contains('st'), x0: b.x, x1: b.x + b.width, bw: b.width, txt: t.textContent }; }) };
  });
  for (const t of r.t) {
    if (t.st) max[n] = Math.max(max[n] || 0, t.bw);
    if (t.x0 < 2 || t.x1 > r.w - 2) aus.push(`${n}: „${t.txt}“ ${Math.round(t.x0)}–${Math.round(t.x1)} von ${r.w}`);
  }
}
const breit = Object.entries(max).filter(([, b]) => b > 250).map(([n, b]) => `${n} ${Math.round(b)}`);
console.log('Dateien', dateien.length, 'mit .st-Caption', Object.keys(max).length, 'breiteste', Math.round(Math.max(...Object.values(max))));
console.log('Caption > 250:', breit.length, breit.join(', '));
console.log('Text über den Rand:', aus.length); aus.forEach((a) => console.log('  ' + a));
await browser.close();
process.exit(aus.length || breit.length ? 1 : 0);
