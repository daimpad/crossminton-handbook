import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const b = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
async function txt(route, herkunft) {
  const ctx = await b.newContext();
  const z = { version: 1, einstellungen: { sprache: 'fr', thema: 'hell' }, diagnose: { herkunft } };
  await ctx.addInitScript((zz) => localStorage.setItem('crossminton.zustand.v1', JSON.stringify(zz)), z);
  const p = await ctx.newPage();
  const fehler = [];
  p.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()); });
  await p.goto('http://localhost:8000/#/baustein/' + route, { waitUntil: 'networkidle' });
  await p.waitForTimeout(400);
  const t = await p.evaluate(() => document.querySelector('article.baustein').innerText);
  await ctx.close();
  return { t, fehler };
}
const checks = [
  // Technik-Basis (erklaerteil + uebungsteil)
  ['handgelenk_peitsche?kontext=kompetenz', null, ["puisé la puissance dans le bras", "Faire claquer le poignet au bon moment", "un timing propre l'emporte sur la force brute"]],
  // Basis mit schritte_teil1/teil2
  ['beinarbeit_system?kontext=kompetenz', null, ["Quatre types de pas le portent", "le chassé sur le côté", "Fais-toi maintenant lancer des speeders"]],
  // Technik BAD-Delta (ersetzt Erklärteil in situ)
  ['handgelenk_peitsche?kontext=kompetenz', 'BAD', ["Le fouet, tu n'as pas à l'apprendre", "davantage de l'avant-bras qui pivote"]],
  // Taktik-Basis (erklaerteil + reflexionsaufgabe)
  ['umschalten?kontext=kompetenz', null, ["Chaque échange oscille entre deux états", "fais attention aux rôles"]],
  // Taktik-Basis mit uebungsteil
  ['doppel_grundlagen?kontext=kompetenz', null, ["Le double est un jeu à part entière", "En paire, tenir la répartition attaque/fond"]],
  // Taktik BAD-Delta
  ['doppel_grundlagen?kontext=kompetenz', 'BAD', ["Tes réflexes de double bien rodés", "dans le carré sans filet"]],
];
let ok = true, fehlerTotal = 0;
for (const [route, herkunft, muss] of checks) {
  const r = await txt(route, herkunft);
  fehlerTotal += r.fehler.length;
  const treffer = muss.filter((m) => r.t.includes(m));
  const gut = treffer.length === muss.length;
  console.log(`${route.split('?')[0]}${herkunft ? ' [' + herkunft + ']' : ''}: ${treffer.length}/${muss.length} ${gut ? 'OK' : 'FEHLT: ' + muss.filter((m) => !r.t.includes(m)).join(' | ')}`);
  ok = ok && gut;
}
console.log('Konsolenfehler:', fehlerTotal);
await b.close();
console.log(ok && fehlerTotal === 0 ? '\nALLES OK' : '\nFEHLER');
process.exit(ok && fehlerTotal === 0 ? 0 : 1);
