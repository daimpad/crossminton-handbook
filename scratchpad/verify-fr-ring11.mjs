import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const b = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
async function txt(route) {
  const ctx = await b.newContext();
  const z = { version: 1, einstellungen: { sprache: 'fr', thema: 'hell' }, diagnose: { stufe: 'fortgeschritten', trainer: false, herkunft: null, ziel: null } };
  await ctx.addInitScript((zz) => localStorage.setItem('crossminton.zustand.v1', JSON.stringify(zz)), z);
  const p = await ctx.newPage();
  const fehler = [];
  p.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()); });
  await p.goto('http://localhost:8000/#/baustein/' + route + '?kontext=umgebung', { waitUntil: 'networkidle' });
  await p.waitForTimeout(400);
  const t = await p.evaluate(() => document.querySelector('article.baustein').innerText);
  await ctx.close();
  return { t, fehler };
}
const checks = [
  // Outdoor-Thema (erklaerteil + reflexionsaufgabe/uebungsteil)
  ['draussen_spielen', ["Un marin ne peste pas contre le vent", "entre les deux terrains se trouve la zone neutre"]],
  ['wind_lesen_nutzen', ["Le vent est comme un courant en nageant", "Jouer avec le vent", "Cross Speeder"]],
  ['sonne_blendung', ["Le soleil est comme un projecteur", "règle du changement de côtés"]],
  ['naesse_sicherer_stand', ["comme sur un couloir fraîchement lavé"]],
  ['hitze', ["ton corps est comme un moteur qui chauffe"]],
  ['verschiedene_boeden', ["Un bon randonneur choisit son pas", "terre battue", "gazon synthétique", "Lire le sol"]],
  // Spielmodi
  ['spielarten_ueberblick', ["Une bonne chanson reste la même"]],
  ['snowminton', ["comme sur un lac gelé", "t'habilles en couches"]],
  ['beachminton', ["La plage est comme un tapis moelleux", "Fun Series"]],
  ['blackminton', ["comme une luciole dans la nuit", "lumière noire", "Suivre le point lumineux"]],
];
let ok = true, fehlerTotal = 0;
for (const [route, muss] of checks) {
  const r = await txt(route);
  fehlerTotal += r.fehler.length;
  const treffer = muss.filter((m) => r.t.includes(m));
  const gut = treffer.length === muss.length;
  console.log(`${route}: ${treffer.length}/${muss.length} ${gut ? 'OK' : 'FEHLT: ' + muss.filter((m) => !r.t.includes(m)).join(' | ')}`);
  ok = ok && gut;
}
console.log('Konsolenfehler:', fehlerTotal);
await b.close();
console.log(ok && fehlerTotal === 0 ? '\nALLES OK' : '\nFEHLER');
process.exit(ok && fehlerTotal === 0 ? 0 : 1);
