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
  ['spielziel_verstehen?kontext=themen:taktik', null, ["Avant de penser tactique", "trial of strength" === '' ? '' : "épreuve de force", "surestiment nettement la première voie"]],
  ['warum_der_kopf_mitspielt?kontext=kompetenz', null, ["Ton savoir-faire est une voiture", "La nervosité en fait partie"]],
  ['richtig_aufwaermen?kontext=kompetenz', null, ["s'échauffer, c'est se réchauffer", "La courte séquence d'échauffement", "circulation en route"]],
  ['aufschlag_taktisch?kontext=kompetenz', 'BAD', ["la tactique de service tourne autour du filet", "L'objectif est le service plat et long"]],
];
let ok = true, fehlerTotal = 0;
for (const [route, herkunft, muss] of checks) {
  const r = await txt(route, herkunft);
  fehlerTotal += r.fehler.length;
  const treffer = muss.filter((m) => m && r.t.includes(m));
  const gut = treffer.length === muss.filter(Boolean).length;
  console.log(`${route.split('?')[0]}${herkunft ? ' [' + herkunft + ']' : ''}: ${treffer.length}/${muss.filter(Boolean).length} ${gut ? 'OK' : 'FEHLT: ' + muss.filter((m) => m && !r.t.includes(m)).join(' | ')}`);
  ok = ok && gut;
}
console.log('Konsolenfehler:', fehlerTotal);
await b.close();
console.log(ok && fehlerTotal === 0 ? '\nALLES OK' : '\nFEHLER');
process.exit(ok && fehlerTotal === 0 ? 0 : 1);
