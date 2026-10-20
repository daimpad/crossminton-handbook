// gate.mjs — gemessener Teil des Prüf-Gates (der statische liegt in scripts/grafik-gate.mjs).
// Misst im Browser, was sich am Quelltext nicht ablesen lässt:
//   - Caption (.st) höchstens 250 Einheiten breit (Zeichenzählen taugt für fette 12er-Schrift nicht),
//   - jeder Text vollständig in der viewBox, mit 4 Einheiten Rand,
//   - die Modellwarnungen des Generators (Arm vor dem Kopf, Schwerpunkt außerhalb der Standfläche).
// Gemessen wird mit Liberation Sans (Arial-metrisch) als Stellvertreter für system-ui: der Container
// löst system-ui auf DejaVu Sans auf, die gut 10 % breiter läuft als SF, Segoe UI oder Roboto auf
// den Geräten. Mit DejaVu gemessen fiele fast jede Caption durch, die überall sonst passt.
// Aufruf: node scratchpad/figuren/gate.mjs [G-002 …]   (ohne IDs: alle Figurenmotive)
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
import { baue, IDS } from './motive.mjs';
import { SPRACHEN } from './texte.mjs';
import { STELLVERTRETER } from '../../scripts/grafik-gate.mjs';

const CAPTION_MAX = 250, RAND = 4;
const ids = process.argv.slice(2).filter((a) => a.startsWith('G-'));
const browser = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const seite = await (await browser.newContext()).newPage();
let fehler = 0;
for (const id of ids.length ? ids : IDS()) {
  const befunde = [], hinweise = [];
  for (const s of SPRACHEN) {
    const r = baue(id, s);
    if (s === 'de') for (const w of r.figuren.flatMap((fg) => fg.warnungen)) (w.startsWith('Gesundheitsrahmen') ? befunde : hinweise).push(`Modell: ${w}`);
    await seite.setContent(`<!doctype html><meta charset="utf8"><style>${STELLVERTRETER}</style><body style="margin:0">${r.datei}</body>`);
    const m = await seite.evaluate(() => {
      const svg = document.querySelector('svg'); const [, , w, h] = svg.getAttribute('viewBox').split(' ').map(Number);
      return { w, h, texte: [...svg.querySelectorAll('text')].map((t) => { const b = t.getBBox(); return { cls: t.getAttribute('class'), text: t.textContent, x: b.x, y: b.y, b: b.width, h: b.height }; }) };
    });
    for (const t of m.texte) {
      if (t.cls === 'st' && t.b > CAPTION_MAX) befunde.push(`${s}: Caption ${Math.round(t.b)} breit (max ${CAPTION_MAX}): „${t.text}“`);
      if (t.x < RAND || t.y < RAND || t.x + t.b > m.w - RAND || t.y + t.h > m.h - RAND) befunde.push(`${s}: Text „${t.text}“ ragt aus der viewBox`);
    }
    if (s === 'de') hinweise.push(`Caption ${Math.round(m.texte.find((t) => t.cls === 'st')?.b ?? 0)}`);
  }
  fehler += befunde.length;
  console.log(`${befunde.length ? '✗' : '✓'} ${id}  ${hinweise.join(' · ')}${befunde.map((b) => `\n    - ${b}`).join('')}`);
}
await browser.close();
process.exit(fehler ? 1 : 0);
