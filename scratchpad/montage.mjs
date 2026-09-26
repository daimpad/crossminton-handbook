// Baut aus mehreren G-XXX.svg eine Kachel-Montage (ein Screenshot für viele Figuren).
// Aufruf: node scratchpad/montage.mjs G-003 G-004 ... [--dark]
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const dark = args.includes('--dark');
const ids = args.filter((a) => a !== '--dark');

const kacheln = ids
  .map((id) => {
    const svg = readFileSync(resolve('images', `${id}.svg`), 'utf8');
    return `<figure><div class="halt">${svg}</div><figcaption>${id}</figcaption></figure>`;
  })
  .join('');

const bg = dark ? '#12181f' : '#ffffff';
const fg = dark ? '#e7edf3' : '#16202b';
// data-theme setzt die dunklen Tokens; im Hellfall greifen die var()-Fallbacks.
const tokens = dark
  ? `:root{--tinte:#e7edf3;--tinte-3:#93a1b0;--primaer:#4db2f5;--primaer-tief:#8fccf8}`
  : '';

const browser = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext({ deviceScaleFactor: 1.4 });
const page = await ctx.newPage();
await page.setContent(
  `<!doctype html><meta charset="utf8"><style>
    ${tokens}
    body{margin:0;background:${bg};color:${fg};font:600 15px system-ui,sans-serif;
      display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:12px}
    figure{margin:0;text-align:center}
    .halt{aspect-ratio:1;background:${dark ? '#1a222c' : '#f5f7fa'};border-radius:10px}
    svg{width:100%;height:100%}
    figcaption{margin-top:4px}
  </style><body>${kacheln}`,
  { waitUntil: 'networkidle' },
);
await page.screenshot({ path: resolve('scratchpad', dark ? 'montage-dark.png' : 'montage.png'), fullPage: true });
await browser.close();
console.log('montage', dark ? 'dark' : 'hell', ids.length);
