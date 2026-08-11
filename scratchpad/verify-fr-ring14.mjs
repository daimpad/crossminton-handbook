import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const b = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await b.newContext();
const z = { version: 1, einstellungen: { sprache: 'fr', thema: 'hell' }, diagnose: { stufe: 'beginner', trainer: false, herkunft: null, ziel: null } };
await ctx.addInitScript((zz) => localStorage.setItem('crossminton.zustand.v1', JSON.stringify(zz)), z);
const p = await ctx.newPage();
let fehlerTotal = 0;
p.on('console', (m) => { if (m.type() === 'error') fehlerTotal++; });
await p.goto('http://localhost:8000/#/regeln', { waitUntil: 'networkidle' });
await p.waitForTimeout(400);
// alle <details> aufklappen, damit auch eingeklappte Abschnitte im innerText erscheinen
await p.evaluate(() => document.querySelectorAll('#ansicht details').forEach((d) => (d.open = true)));
await p.waitForTimeout(200);
const txt = await p.evaluate(() => document.querySelector('#ansicht').innerText);
await ctx.close();
await b.close();

const checks = {
  grundbegriffe: ["par-dessus un vide", "la zone de sécurité"],
  ausruestung: ["Match Speeder jaune", "anneau anti-vent"],
  wahl: ["Au lieu d'une pièce, tu lances le speeder"],
  punkte_saetze: ["la règle du 15-15", "Si c'est 1-1 en sets"],
  seitenwechsel: ["même tous les 6 points"],
  aufschlag: ["sous la main de frappe du serveur", "Trois services d'affilée", "Météo extrême : 30 secondes"],
  einzel: ["Service et déroulement en simple"],
  doppel: ["A1 → B1 → A2 → B2", "une faute de position"],
  fehler: ["y compris les chaussures et les chaussettes", "aucun mur n'est en jeu ici"],
  in_out: ["La tête décide", "Regarde le capuchon, non le panier", "Trace de glissement à la ligne avant"],
  wiederholungen: ["le même terme qu'au tennis", "Les lets"],
  speeder_im_spiel: ["Fin de l'échange"],
  kommunikation: ["« In » : l'index de la main libre pointe vers le bas", "Un V à deux doigts signifie « let »"]
};
let ok = true;
for (const [sec, muss] of Object.entries(checks)) {
  const treffer = muss.filter((m) => txt.includes(m));
  const gut = treffer.length === muss.length;
  console.log(`${sec}: ${treffer.length}/${muss.length} ${gut ? 'OK' : 'FEHLT: ' + muss.filter((m) => !txt.includes(m)).join(' | ')}`);
  ok = ok && gut;
}
console.log('Konsolenfehler:', fehlerTotal);
console.log(ok && fehlerTotal === 0 ? '\nALLES OK' : '\nFEHLER');
process.exit(ok && fehlerTotal === 0 ? 0 : 1);
