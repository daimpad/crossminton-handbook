// Rendert G-XXX.svg → G-XXX.png (2×, transparent, Hell-Fallback-Werte).
// Aufruf: node scratchpad/render-svg.mjs G-001 G-002 G-010
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ids = process.argv.slice(2);
if (!ids.length) { console.error('keine IDs'); process.exit(1); }

const browser = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext({ deviceScaleFactor: 2 });
const page = await ctx.newPage();

for (const id of ids) {
  const svgPfad = resolve('images', `${id}.svg`);
  const svg = readFileSync(svgPfad, 'utf8');
  await page.setContent(
    `<!doctype html><meta charset="utf8"><body style="margin:0">${svg}</body>`,
    { waitUntil: 'networkidle' },
  );
  const el = await page.$('svg');
  await el.screenshot({ path: resolve('images', `${id}.png`), omitBackground: true });
  console.log('gerendert', id);
}

await browser.close();
