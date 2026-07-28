import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const b = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
async function txt(route, herkunft, kontext) {
  const ctx = await b.newContext();
  const z = { version: 1, einstellungen: { sprache: 'fr', thema: 'hell' }, diagnose: { stufe: 'fortgeschritten', trainer: false, herkunft, ziel: null } };
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
  // Tennis-Deltas (TEN) — Delta ersetzt Erklärteil in-situ im Kompetenz-Kontext
  ['griff', 'TEN', 'kompetenz', ["Au tennis, tu changes sans cesse de prise", "ta prise Continental"]],
  ['aufschlag', 'TEN', 'kompetenz', ["tu dois mettre de côté ta frappe de tennis la plus importante"]],
  ['vorhand_drive', 'TEN', 'kompetenz', ["un large coup d'aviron ample"]],
  ['rueckhand', 'TEN', 'kompetenz', ["Ta seconde main quitte la raquette"]],
  ['ueberkopf_clear', 'TEN', 'kompetenz', ["Maintenant, ton service de tennis paie", "la pronation et le coup sec"]],
  ['beinarbeit_system', 'TEN', 'kompetenz', ["le split-step avant la frappe", "une large scène depuis l'arrière"]],
  ['aufschlag_rueckschlag_doppel', 'TEN', 'spielform', ["comme une carte qui fait le tour de la table"]],
  ['spielziel_verstehen', 'TEN', 'kompetenz', ["tu joues par-dessus un fossé", "le no man's land"]],
  // Squash-Deltas (SQ)
  ['griff', 'SQ', 'kompetenz', ["ce sur quoi les autres échouent d'abord", "depuis toute ta vie de squash"]],
  ['spielziel_verstehen', 'SQ', 'kompetenz', ["Le squash est un jeu de murs", "pas de boast"]],
  ['aufschlag', 'SQ', 'kompetenz', ["Ton service de squash vise le mur frontal"]],
  ['vorhand_drive', 'SQ', 'kompetenz', ["le drive bas et serré le long du mur latéral"]],
  ['zentrale_position', 'SQ', 'kompetenz', ["tu reviens au « T » après chaque frappe"]],
  ['schnitt_spin', 'SQ', 'kompetenz', ["Ta coupe de squash domptait la balle au mur"]],
];
let ok = true, fehlerTotal = 0;
for (const [route, herkunft, kontext, muss] of checks) {
  const r = await txt(route, herkunft, kontext);
  fehlerTotal += r.fehler.length;
  const treffer = muss.filter((m) => r.t.includes(m));
  const gut = treffer.length === muss.length;
  console.log(`${route} [${herkunft}]: ${treffer.length}/${muss.length} ${gut ? 'OK' : 'FEHLT: ' + muss.filter((m) => !r.t.includes(m)).join(' | ')}`);
  ok = ok && gut;
}
console.log('Konsolenfehler:', fehlerTotal);
await b.close();
console.log(ok && fehlerTotal === 0 ? '\nALLES OK' : '\nFEHLER');
process.exit(ok && fehlerTotal === 0 ? 0 : 1);
