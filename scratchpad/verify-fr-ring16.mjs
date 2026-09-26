import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const b = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
let ok = true, fehlerTotal = 0;
function pruef(name, html, mussSvgText, mussFrPng) {
  // nach verbessereGrafiken: Inline-<svg> mit fr-<text>; sonst PNG-Fallback mit .fr.png
  const svgHit = mussSvgText.every((m) => html.includes(m));
  const pngHit = html.includes(mussFrPng);
  const gut = svgHit && pngHit === false ? true : (svgHit || pngHit);
  console.log(`${name}: svg-fr-Text ${svgHit ? 'OK' : 'FEHLT'} | ${mussFrPng} ${pngHit ? 'referenziert' : '—'} → ${gut ? 'OK' : 'FEHLER'}`);
  ok = ok && gut;
}
async function holen(route) {
  const ctx = await b.newContext();
  const z = { version: 1, einstellungen: { sprache: 'fr', thema: 'hell' }, diagnose: { stufe: 'beginner', trainer: false, herkunft: null, ziel: null } };
  await ctx.addInitScript((zz) => localStorage.setItem('crossminton.zustand.v1', JSON.stringify(zz)), z);
  const p = await ctx.newPage();
  p.on('console', (m) => { if (m.type() === 'error') fehlerTotal++; });
  await p.goto('http://localhost:8000/#/' + route, { waitUntil: 'networkidle' });
  await p.waitForTimeout(800); // verbessereGrafiken (fetch + SVG-Tausch) abwarten
  // Details aufklappen (Regeln-Referenzgrafiken)
  await p.evaluate(() => document.querySelectorAll('#ansicht details').forEach((d) => (d.open = true)));
  await p.waitForTimeout(600);
  const html = await p.evaluate(() => document.querySelector('#ansicht').innerHTML);
  await ctx.close();
  return html;
}

// griff → G-001 (Caption "comme une poignée de main · V en haut")
pruef('griff/G-001', await holen('baustein/griff?kontext=kompetenz'), ['comme une poignée de main'], 'G-001.fr.png');
// spielziel_verstehen → G-023 (Feld-Diagramm "ZONE NEUTRE" / "terrain adverse")
pruef('spielziel/G-023', await holen('baustein/spielziel_verstehen?kontext=kompetenz'), ['ZONE NEUTRE', 'terrain adverse'], 'G-023.fr.png');
// zentrale_position → G-024 ("Centre")
pruef('zentrale/G-024', await holen('baustein/zentrale_position?kontext=kompetenz'), ['aussi vite vers chaque coin'], 'G-024.fr.png');
// Regeln-Reiter → G-060 (Feldmaße) + G-061 (Handzeichen)
pruef('regeln/G-060+061', await holen('regeln'), ['pas de filet — le speeder doit passer', 'faute de service'], 'G-060.fr.png');

console.log('Konsolenfehler:', fehlerTotal);
await b.close();
console.log(ok && fehlerTotal === 0 ? '\nALLES OK' : '\nFEHLER');
process.exit(ok && fehlerTotal === 0 ? 0 : 1);
