import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const b = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
async function txt(route, kontext = 'kompetenz') {
  const ctx = await b.newContext();
  const z = { version: 1, einstellungen: { sprache: 'fr', thema: 'hell' }, diagnose: { stufe: 'experte', trainer: false, herkunft: null, ziel: null } };
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
  // Experte-Mentales (erklaerteil + reflexionsaufgabe; Guillemets in druck)
  ['optimaler_wettkampfzustand', ["comme la température de fonctionnement d'un moteur", "Repense à deux ou trois de tes meilleurs matchs"], 'kompetenz'],
  ['in_den_flow_finden', ["Cet état s'appelle le flow", "comme un courant qui te porte"], 'kompetenz'],
  ['druck_als_herausforderung', ["La pression est comme le vent pour un marin", "« surtout, il ne faut pas que je perde maintenant »"], 'kompetenz'],
  ['gelassen_bei_unfairness', ["L'injustice est comme le mauvais temps lors d'une randonnée", "ton geste pour tourner la page"], 'kompetenz'],
  ['mentale_staerke_entwickeln', ["La force mentale n'est pas un état figé", "ta boîte à outils personnelle"], 'kompetenz'],
  // Experte-Athletik (erklaerteil + uebungsteil + reflexionsaufgabe)
  ['form_ueber_die_saison', ["comme la croissance dans un jardin au fil de l'année", "un entraîneur ou un spécialiste des sciences de l'entraînement"], 'kompetenz'],
  ['reaktivkraft_bodenkontakt', ["comme une balle qui rebondit du sol", "Court et élastique"], 'kompetenz'],
  ['bewegungsoekonomie', ["Un coureur expérimenté glisse sur le parcours", "revenir calmement et promptement à une position centrale"], 'kompetenz'],
  ['antizipative_schnelligkeit', ["comme lire les nuages avant la pluie", "la position de la raquette"], 'kompetenz'],
  ['langfristig_belastbar', ["Ton corps est ton instrument", "médecine du sport, physiothérapie"], 'kompetenz'],
  // Doppel-Experte (spielform:doppel — erklaerteil + uebungsteil)
  ['paar_als_system', ["comme un duo musical bien rodé", "L'image de la corde invisible"], 'spielform'],
  ['gegnerisches_paar_lesen', ["comme un mur de deux pierres", "la brèche entre les deux"], 'spielform'],
  ['partner_in_position_bringen', ["Donner la passe", "Tu es le passeur qui centre"], 'spielform'],
  ['nahtlos_umschalten', ["comme une porte tambour", "Faire tourner attaque et défense"], 'spielform'],
  ['blindes_verstaendnis', ["comme deux mains d'une même personne", "L'entente aveugle ne se force pas"], 'spielform'],
];
let ok = true, fehlerTotal = 0;
for (const [route, muss, kontext] of checks) {
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
