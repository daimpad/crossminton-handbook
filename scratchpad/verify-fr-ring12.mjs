import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const b = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
async function txt(route, kontext) {
  const ctx = await b.newContext();
  const z = { version: 1, einstellungen: { sprache: 'fr', thema: 'hell' }, diagnose: { stufe: 'fortgeschritten', trainer: true, herkunft: null, ziel: null } };
  await ctx.addInitScript((zz) => localStorage.setItem('crossminton.zustand.v1', JSON.stringify(zz)), z);
  const p = await ctx.newPage();
  const fehler = [];
  p.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()); });
  await p.goto('http://localhost:8000/#/baustein/' + route + '?kontext=' + kontext, { waitUntil: 'networkidle' });
  await p.waitForTimeout(400);
  const t = await p.evaluate(() => document.querySelector('article.baustein').innerText);
  await ctx.close();
  return { t, fehler };
}
const checks = [
  // Trainer-Trainingsgestaltung (erklaerteil + reflexionsaufgabe), kontext=kompetenz
  ['was_gutes_vermitteln_ausmacht', 'kompetenz', ["Vois-toi comme un jardinier", "Ta propre histoire d'apprentissage"]],
  ['inhalt_zugaenglich_machen', 'kompetenz', ["« Serre la main à la raquette »", "un point nodal"]],
  ['fehler_erkennen_korrigieren', 'kompetenz', ["Sois un diagnosticien, non un commentateur"]],
  ['uebungen_aufbauen', 'kompetenz', ["Construis un escalier, non un mur", "règle de provocation"]],
  ['gruppe_fuehren', 'kompetenz', ["Tu es l'hôte, non le surveillant", "un corps de séance avec un axe clair"]],
  // Fehlerbild — in-situ im griff-Baustein, nur bei trainer:true (symptom/ursache/korrektur)
  ['griff', 'kompetenz', ["L'avant-bras fatigue tôt", "au moment de la frappe", "comme pour une poignée de main"]],
];
let ok = true, fehlerTotal = 0;
for (const [route, kontext, muss] of checks) {
  const r = await txt(route, kontext);
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
