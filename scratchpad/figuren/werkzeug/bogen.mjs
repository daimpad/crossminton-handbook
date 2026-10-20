// Kachelt beliebige SVG-Dateien zu einem Prüfbogen, hell UND dunkel, mit den
// echten App-Tokens (css/app.css). Zusätzlich je Kachel eine 150px-Miniatur,
// damit man sieht, wie die Grafik auf kleinem Telefon wirkt.
// node bogen.mjs <ausgabe-ohne-endung> <datei.svg> [<datei.svg> …] [--spalten 3]
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
const args = process.argv.slice(2);
const sIdx = args.indexOf('--spalten');
const spalten = sIdx >= 0 ? Number(args[sIdx + 1]) : 3;
const rest = sIdx >= 0 ? args.filter((_, i) => i !== sIdx && i !== sIdx + 1) : args;
const [ausgabe, ...dateien] = rest;
const HELL = ':root{--primaer:#38a4f1;--primaer-tief:#1568ad;--primaer-weich:#e8f3fe;--tinte:#16202b;--tinte-2:#5a6675;--tinte-3:#656f7e;--flaeche:#fff;--flaeche-2:#f1f5fb;--linie:#e3e8ef;--speeder-korb:#f0c400;--speeder-kappe:#e2402a;--speeder-kappe-tief:#a82412;--signal-rot:#f4402a;--signal-gruen:#24bd47;--signal-gelb:#f2d93b}';
const DUNKEL = ':root{--primaer:#4fb0f4;--primaer-tief:#9acdf8;--primaer-weich:#143247;--tinte:#e8eef5;--tinte-2:#a2b2c4;--tinte-3:#8795a6;--flaeche:#18232f;--flaeche-2:#1f2c3a;--linie:#2c3a4a;--speeder-korb:#ffd84d;--speeder-kappe:#ff6a52;--speeder-kappe-tief:#ffa593;--signal-rot:#ff5a44;--signal-gruen:#33cf5a;--signal-gelb:#f2d93b}';
const browser = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext({ deviceScaleFactor: 1, viewport: { width: 1200, height: 800 } });
const page = await ctx.newPage();
for (const [name, tokens, bg, karte, schrift] of [['hell', HELL, '#f1f5fb', '#fff', '#16202b'], ['dunkel', DUNKEL, '#121a23', '#18232f', '#e8eef5']]) {
  const kacheln = dateien.map((d) => { const svg = readFileSync(d, 'utf8'); return `<figure><div class="gross">${svg}</div><div class="klein">${svg}</div><figcaption>${basename(d)}</figcaption></figure>`; }).join('');
  await page.setContent(`<!doctype html><meta charset="utf8"><style>${tokens}
    body{margin:0;background:${bg};color:${schrift};font:600 13px system-ui,sans-serif;display:grid;grid-template-columns:repeat(${spalten},1fr);gap:12px;padding:12px}
    figure{margin:0;background:var(--flaeche-2);border-radius:14px;padding:8px;display:grid;grid-template-columns:1fr 150px;gap:8px;align-items:end}
    figcaption{grid-column:1/-1;text-align:center}
    .gross svg{width:100%;height:auto;display:block}.klein svg{width:150px;height:auto;display:block}
  </style><body>${kacheln}`, { waitUntil: 'networkidle' });
  const pfad = `${ausgabe}-${name}.png`;
  await page.screenshot({ path: pfad, fullPage: true });
  console.log(pfad);
}
await browser.close();
