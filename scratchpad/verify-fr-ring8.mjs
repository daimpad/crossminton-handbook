import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const b = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
async function txt(route) {
  const ctx = await b.newContext();
  const z = { version: 1, einstellungen: { sprache: 'fr', thema: 'hell' }, diagnose: { stufe: 'experte', trainer: false, herkunft: null, ziel: null } };
  await ctx.addInitScript((zz) => localStorage.setItem('crossminton.zustand.v1', JSON.stringify(zz)), z);
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
  // Experte-Technik (erklaerteil + uebungsteil, teils teil1/teil2)
  ['taeuschung', ["La feinte, c'est un visage de poker", "Même préparation, décision tardive"]],
  ['frueh_nehmen', ["Le temps est la ressource la plus précieuse", "Saisir au point le plus haut"]],
  ['sprung_smash', ["ressemble à un joueur de volley qui s'élève", "La hauteur pour l'angle"]],
  ['konstanz_unter_hoechstdruck', ["comme un pont bien bâti dans la tempête", "Tenir la qualité quand ça compte"]],
  // Experte-Taktik (erklaerteil + uebungsteil + reflexionsaufgabe + Score-Format)
  ['der_matchplan', ["Un match est une partie d'échecs", "prends deux minutes pour un plan"]],
  ['gegner_typen_gegenrezepte', ["Tu es un médecin qui pose d'abord le diagnostic"]],
  ['dem_gegner_aufzwingen', ["Tu es le metteur en scène de l'échange", "Chaque échange avec une intention"]],
  ['matchverlauf_steuern', ["Tu es le barreur d'un bateau", "à 12-6 qu'à 6-12"]],
  ['entscheidender_punkt', ["c'est le penalty du Crossminton", "le point à 14-14"]],
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
