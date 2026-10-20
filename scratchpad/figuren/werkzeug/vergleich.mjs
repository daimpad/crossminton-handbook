// Vergleichsbogen: Zeilen = Motive, Spalten = Original + Richtungen. Hell und dunkel.
// node vergleich.mjs <ausgabe> <repo> <protoordner> G-002 G-010 …
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
import { readFileSync } from 'node:fs';
const [aus, repo, proto, ...ids] = process.argv.slice(2);
const SP = [['Heute', (id) => `${repo}/images/${id}.svg`], ['A · Dynamische Silhouette', (id) => `${proto}/silhouette/${id}.svg`], ['B · Klare Linie', (id) => `${proto}/linie/${id}.svg`], ['C · Geometrisch-modular', (id) => `${proto}/geometrisch/${id}.svg`]];
const HELL = ':root{--primaer:#38a4f1;--primaer-dunkel:#1e8bd6;--schatten-boden:#16202b2e;--primaer-tief:#1568ad;--primaer-weich:#e8f3fe;--tinte:#16202b;--tinte-2:#5a6675;--tinte-3:#656f7e;--flaeche:#fff;--flaeche-2:#f1f5fb;--linie:#e3e8ef;--speeder-korb:#f0c400;--speeder-kappe:#e2402a;--speeder-kappe-tief:#a82412}';
const DUNKEL = ':root{--primaer:#4fb0f4;--primaer-dunkel:#6bbdf6;--schatten-boden:#00000066;--primaer-tief:#9acdf8;--primaer-weich:#143247;--tinte:#e8eef5;--tinte-2:#a2b2c4;--tinte-3:#8795a6;--flaeche:#18232f;--flaeche-2:#1f2c3a;--linie:#2c3a4a;--speeder-korb:#ffd84d;--speeder-kappe:#ff6a52;--speeder-kappe-tief:#ffa593}';
const b = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await (await b.newContext({ viewport: { width: 1240, height: 800 } })).newPage();
for (const [name, tok, bg, ink] of [['hell', HELL, '#fff', '#16202b'], ['dunkel', DUNKEL, '#18232f', '#e8eef5']]) {
  let html = `<div class="kopf"></div>${SP.map(([t]) => `<div class="kopf">${t}</div>`).join('')}`;
  for (const id of ids) html += `<div class="id">${id}</div>` + SP.map(([, f]) => `<div class="z">${readFileSync(f(id), 'utf8')}</div>`).join('');
  await p.setContent(`<!doctype html><meta charset="utf8"><style>${tok}body{margin:0;padding:14px;background:${bg};color:${ink};font:600 14px system-ui,sans-serif;display:grid;grid-template-columns:60px repeat(4,1fr);gap:10px;align-items:center}.kopf{text-align:center;font-size:15px}.id{writing-mode:vertical-rl;transform:rotate(180deg);text-align:center}.z{background:var(--flaeche-2);border-radius:14px;border:1.5px solid var(--linie)}.z svg{display:block;width:100%;height:auto}</style><body>${html}`, { waitUntil: 'networkidle' });
  await p.screenshot({ path: `${aus}-${name}.png`, fullPage: true });
  console.log(`${aus}-${name}.png`);
}
await b.close();
