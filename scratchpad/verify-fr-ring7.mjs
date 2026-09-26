import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const b = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
async function txt(route, herkunft) {
  const ctx = await b.newContext();
  const z = { version: 1, einstellungen: { sprache: 'fr', thema: 'hell' }, diagnose: { stufe: 'fortgeschritten', herkunft, trainer: false, ziel: null } };
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
  // Ausrüstung-Fortgeschritten (erklaerteil + reflexionsaufgabe)
  ['die_bespannung?kontext=kompetenz', null, ["Le cordage est l'endroit où le Crossminton", "cela délimite la marge dans laquelle tu peux évoluer"]],
  ['griff_und_griffband?kontext=kompetenz', null, ["L'épaisseur du manche est une donnée discrète", "déclencheurs du tennis elbow"]],
  // Doppel-Thema (erklaerteil + uebungsteil + reflexionsaufgabe + Guillemets)
  ['doppel_als_eigenes_spiel?kontext=kompetenz', null, ["Dans l'introduction au double", "un couple de danseurs"]],
  ['angriff_im_paar?kontext=kompetenz', null, ["Vous êtes le marteau et l'enclume", "Pression et conclusion"]],
  ['bewegung_als_einheit?kontext=kompetenz', null, ["deux essuie-glaces sur un pare-brise", "Au lien invisible"]],
  ['verstaendigung_im_paar?kontext=kompetenz', null, ["Aucun double ne fonctionne en silence", "« À moi ! »"]],
  // Doppel BAD-Delta (ersetzt Erklärteil in situ, herkunft BAD)
  ['das_umschalten_im_doppel?kontext=kompetenz', 'BAD', ["La transition entre attaque et défense, tu la connais bien du double de badminton", "propres au Crossminton"]],
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
