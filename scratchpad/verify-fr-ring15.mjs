import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const b = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await b.newContext();
const z = { version: 1, einstellungen: { sprache: 'fr', thema: 'hell' }, diagnose: { stufe: 'beginner', trainer: false, herkunft: null, ziel: null } };
await ctx.addInitScript((zz) => localStorage.setItem('crossminton.zustand.v1', JSON.stringify(zz)), z);
const p = await ctx.newPage();
let fehlerTotal = 0;
p.on('console', (m) => { if (m.type() === 'error') fehlerTotal++; });
await p.goto('http://localhost:8000/#/turnier', { waitUntil: 'networkidle' });
await p.waitForTimeout(400);

let ok = true;
async function lese() { return p.evaluate(() => document.querySelector('#ansicht').innerText); }
function pruef(name, txt, muss) {
  const treffer = muss.filter((m) => txt.includes(m));
  const gut = treffer.length === muss.length;
  console.log(`${name}: ${treffer.length}/${muss.length} ${gut ? 'OK' : 'FEHLT: ' + muss.filter((m) => !txt.includes(m)).join(' | ')}`);
  ok = ok && gut;
}
async function klick(sel) { await p.click(sel); await p.waitForTimeout(250); }

// Grundgerüst (einleitung, kategorien, stufen-serie, quelle/dokumente)
pruef('grundgeruest', await lese(), [
  "Choisis la catégorie de ton tournoi",
  "Inscription et organisation", "Site et équipement", "Après le tournoi",
  "National Series", "World Series"
]);

// t1000 — strengste Auflagen
await klick('.turnier-stufe[data-stufe="t1000"]');
pruef('t1000', await lese(), [
  "Pour au moins 120 joueurs et joueuses",
  "Au moins 8 terrains",
  "qui n'a pas le droit de jouer lui-même",
  "hymne national des vainqueurs"
]);

// t500 + Doppel-Variante
await klick('.turnier-stufe[data-stufe="t500"]');
await klick('.turnier-variante-knopf[data-variante="doppel"]');
pruef('t500+doppel', await lese(), [
  "Des catégories de double sont disputées, au moins 4 paires chacune",
  "Capacité de salle pour au moins 50 (au lieu de 80)"
]);

// t500 + Junior-Variante
await klick('.turnier-variante-knopf[data-variante="junior"]');
pruef('t500+junior', await lese(), [
  "Catégories juniors (U12/U14/U18 …)",
  "les juniors ne devraient pas être utilisés comme arbitres de match ou de ligne"
]);

// fun — lockere Stufe
await klick('.turnier-stufe[data-stufe="fun"]');
pruef('fun', await lese(), [
  "Tournoi décontracté sans sanction de l'ICO",
  "Garder du matériel de premiers secours à disposition"
]);

await ctx.close();
await b.close();
console.log('Konsolenfehler:', fehlerTotal);
console.log(ok && fehlerTotal === 0 ? '\nALLES OK' : '\nFEHLER');
process.exit(ok && fehlerTotal === 0 ? 0 : 1);
