// Großansicht einer oder mehrerer SVG-Dateien nebeneinander, hell (oder --dunkel), je 420 px.
// node zoom.mjs <ausgabe.png> <datei.svg> […] [--dunkel]
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
import { readFileSync } from 'node:fs';
const args = process.argv.slice(2); const dunkel = args.includes('--dunkel');
const [aus, ...dateien] = args.filter((a) => a !== '--dunkel');
const T = dunkel
  ? ':root{--primaer:#4fb0f4;--primaer-dunkel:#6bbdf6;--schatten-boden:#00000066;--primaer-tief:#9acdf8;--primaer-weich:#143247;--tinte:#e8eef5;--tinte-2:#a2b2c4;--tinte-3:#8795a6;--flaeche:#18232f;--flaeche-2:#1f2c3a;--speeder-korb:#ffd84d;--speeder-kappe:#ff6a52;--speeder-kappe-tief:#ffa593}'
  : '';
const b = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await (await b.newContext({ viewport: { width: 440 * dateien.length, height: 440 } })).newPage();
await p.setContent(`<!doctype html><meta charset="utf8"><style>${T}body{margin:0;display:flex;gap:10px;padding:10px;background:${dunkel ? '#121a23' : '#fff'}}div{width:420px;background:${dunkel ? '#1f2c3a' : '#f1f5fb'};border-radius:12px}svg{display:block;width:420px;height:auto}</style><body>${dateien.map((d) => `<div>${readFileSync(d, 'utf8')}</div>`).join('')}`);
await p.screenshot({ path: aus, fullPage: true });
await b.close();
console.log(aus);
