import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const b = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
async function txt(route) {
  const ctx = await b.newContext();
  await ctx.addInitScript(() => localStorage.setItem('crossminton.zustand.v1', JSON.stringify({ version: 1, einstellungen: { sprache: 'fr', thema: 'hell' } })));
  const p = await ctx.newPage();
  const fehler = [];
  p.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()); });
  await p.goto('http://localhost:8000/#/baustein/' + route + '?kontext=kompetenz', { waitUntil: 'networkidle' });
  await p.waitForTimeout(400);
  const t = await p.evaluate(() => document.querySelector('article.baustein').innerText);
  await ctx.close();
  return { t, fehler };
}
const checks = [
  // Mentales — erklaerteil + reflexionsaufgabe + Guillemets
  ['vom_werkzeug_zum_system', ["un jeu mental que tu entraînes exactement comme tes frappes", "formule deux ou trois objectifs de processus"]],
  ['selbstgespraech_steuern', ["recadrer le dialogue intérieur négatif", "« à plat et long »"]],
  ['momentum_lesen_und_drehen', ["Le rythme des trois services au Crossminton", "le courant d'une rivière"]],
  ['ueber_das_match_stabil_bleiben', ["ta stabilité mentale comme un culbuto"]],
  // Athletik — erklaerteil + uebungsteil + reflexionsaufgabe
  ['gezielt_trainieren', ["la base avant la spécialisation", "un encadrement qualifié"]],
  ['rumpfstabilitaet', ["Le tronc est comme le tronc d'un arbre", "Maintenir le tronc stable", "la planche sur les avant-bras"]],
  ['intervallausdauer', ["Le Crossminton n'est pas une course de fond", "Jouer intensément, récupérer brièvement"]],
  ['belastung_steuern_regenerieren', ["comme le fait de tendre un arc", "Comment est ton sommeil ?"]],
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
