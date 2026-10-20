// Ausschnitt einer SVG-Datei vergrößert ansehen: node lupe.mjs <aus.png> <datei.svg> x y b h [--dunkel]
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
import { readFileSync } from 'node:fs';
const args = process.argv.slice(2); const dunkel = args.includes('--dunkel');
const [aus, datei, x, y, b, h] = args.filter((a) => a !== '--dunkel');
const T = dunkel
  ? ':root{--primaer:#4fb0f4;--primaer-dunkel:#6bbdf6;--schatten-boden:#00000066;--primaer-tief:#9acdf8;--primaer-weich:#143247;--tinte:#e8eef5;--tinte-2:#a2b2c4;--tinte-3:#8795a6;--flaeche:#18232f;--flaeche-2:#1f2c3a;--speeder-korb:#ffd84d;--speeder-kappe:#ff6a52;--speeder-kappe-tief:#ffa593}'
  : '';
const svg = readFileSync(datei, 'utf8').replace(/viewBox="[^"]*"/, `viewBox="${x} ${y} ${b} ${h}"`);
const br = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await (await br.newContext({ viewport: { width: 640, height: Math.round(640 * h / b) } })).newPage();
await p.setContent(`<!doctype html><style>${T}body{margin:0;background:${dunkel ? '#1f2c3a' : '#f1f5fb'}}svg{display:block;width:640px;height:auto}</style>${svg}`);
await p.screenshot({ path: aus });
await br.close();
console.log(aus);
