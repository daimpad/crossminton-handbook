import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const b = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
function neuCtx() {
  return b.newContext().then(async (ctx) => {
    const z = { version: 1, einstellungen: { sprache: 'fr', thema: 'hell' }, diagnose: { stufe: 'experte', trainer: false, herkunft: null, ziel: null } };
    await ctx.addInitScript((zz) => localStorage.setItem('crossminton.zustand.v1', JSON.stringify(zz)), z);
    return ctx;
  });
}
let ok = true, fehlerTotal = 0;
function pruef(name, text, muss) {
  const treffer = muss.filter((m) => text.includes(m));
  const gut = treffer.length === muss.length;
  console.log(`${name}: ${treffer.length}/${muss.length} ${gut ? 'OK' : 'FEHLT: ' + muss.filter((m) => !text.includes(m)).join(' | ')}`);
  ok = ok && gut;
}

// A) Listenansicht #/training — titel(label)+schwerpunkt+beschreibung aller 8 Einheiten
{
  const ctx = await neuCtx();
  const p = await ctx.newPage();
  p.on('console', (m) => { if (m.type() === 'error') fehlerTotal++; });
  await p.goto('http://localhost:8000/#/training', { waitUntil: 'networkidle' });
  await p.waitForTimeout(400);
  const txt = await p.evaluate(() => document.querySelector('#ansicht').innerText);
  pruef('liste', txt, [
    "de la prise au drive de coup droit en passant par le service",
    "Être à temps sur le speeder",
    "du fouet à la frappe au-dessus de la tête puis au smash",
    "l'attaque en tenaille et la défense sans faille",
    "Feinter l'adversaire et toucher les lignes",
    "Varier le tempo et rester constant sous pression",
    "le contrôle de la longueur qui, dehors, décide entre gagner et perdre",
    "les trois fondements d'un jeu collectif sûr"
  ]);
  await ctx.close();
}

// B) Durchlauf einer Einheit — jeder hinweis (schrittweise)
async function durchlauf(einheitId) {
  const ctx = await neuCtx();
  const p = await ctx.newPage();
  p.on('console', (m) => { if (m.type() === 'error') fehlerTotal++; });
  await p.goto('http://localhost:8000/#/training/' + einheitId, { waitUntil: 'networkidle' });
  await p.waitForTimeout(300);
  const hinweise = [];
  for (let i = 0; i < 8; i++) {
    const weiter = await p.$('#uebung-weiter');
    if (!weiter) break;
    const h = await p.evaluate(() => { const e = document.querySelector('.einheit-hinweis'); return e ? e.innerText : ''; });
    if (h) hinweise.push(h);
    await weiter.click();
    await p.waitForTimeout(200);
  }
  await ctx.close();
  return hinweise.join(' ||| ');
}

pruef('durchlauf:beginner_erste_schlaege', await durchlauf('beginner_erste_schlaege'), [
  "réveiller l'épaule et les jambes",
  "elle porte toutes les frappes qui suivent",
  "idéal comme deuxième étape",
  "c'est là qu'est l'axe de la séance",
  "sur une cible en profondeur"
]);
pruef('durchlauf:experte_tempo_und_konstanz', await durchlauf('experte_tempo_und_konstanz'), [
  "température de service",
  "briser le rythme de l'adversaire",
  "la note de santé sur la charge de saut",
  "les changements de tempo et le saut",
  "quand la pression est la plus forte"
]);

console.log('Konsolenfehler:', fehlerTotal);
await b.close();
console.log(ok && fehlerTotal === 0 ? '\nALLES OK' : '\nFEHLER');
process.exit(ok && fehlerTotal === 0 ? 0 : 1);
