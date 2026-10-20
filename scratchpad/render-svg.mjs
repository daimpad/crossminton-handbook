// Rendert G-XXX.svg → G-XXX.png (2×, Hell-Fallback-Werte). Transparent, außer bei Grafiken, die mit
// --flaeche-2 freistellen — die generierten Personengrafiken (data-quelle="figuren", Freistellungsrand)
// und die Speeder-Tafeln (Halo hinter den Beschriftungen): die stehen auf deckendem --flaeche-2, weil
// das Freigestellte auf dunklem Grund als heller Saum stünde.
// Aufruf: node scratchpad/render-svg.mjs G-001 G-002 G-010
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PNG_STAND, STELLVERTRETER, PNG_GRUND, hash } from '../scripts/grafik-gate.mjs';

const ids = process.argv.slice(2);
if (!ids.length) { console.error('keine IDs'); process.exit(1); }

const browser = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext({ deviceScaleFactor: 2 });
const page = await ctx.newPage();

for (const id of ids) {
  const svgPfad = resolve('images', `${id}.svg`);
  const svg = readFileSync(svgPfad, 'utf8');
  const figuren = svg.includes('data-quelle="figuren"');
  const grund = figuren || svg.includes('var(--flaeche-2');
  // Groesse aus der viewBox: ohne width/height liefe das SVG auf die volle
  // Fensterbreite, und das PNG kaeme in 2560 statt 600 Pixeln heraus.
  const [, , vbBreite, vbHoehe] = (svg.match(/viewBox="([^"]+)"/)?.[1] || '0 0 300 300').split(/[\s,]+/).map(Number);
  await page.setContent(
    `<!doctype html><meta charset="utf8"><style>svg{display:block;width:${vbBreite}px;height:${vbHoehe}px}${figuren ? STELLVERTRETER : ''}${grund ? `svg{background:${PNG_GRUND}}` : ''}</style><body style="margin:0">${svg}</body>`,
    { waitUntil: 'networkidle' },
  );
  const el = await page.$('svg');
  await el.screenshot({ path: resolve('images', `${id}.png`), omitBackground: true });
  // Generierte Personengrafiken: festhalten, aus welchem SVG-Stand das PNG stammt
  // (scripts/grafik-gate.mjs meldet ein PNG, das älter ist als sein SVG).
  if (figuren) {
    const stand = existsSync(PNG_STAND) ? JSON.parse(readFileSync(PNG_STAND, 'utf8')) : {};
    stand[`${id}.svg`] = hash(svg);
    writeFileSync(PNG_STAND, JSON.stringify(Object.fromEntries(Object.entries(stand).sort()), null, 1) + '\n');
  }
  console.log('gerendert', id);
}

await browser.close();
