import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const b = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
let ok = true, fehlerTotal = 0;
function pruef(name, html, muss) {
  const treffer = muss.filter((m) => html.includes(m));
  const gut = treffer.length === muss.length;
  console.log(`${gut ? 'OK ' : 'FEHLER'} ${name}: ${treffer.length}/${muss.length}${gut ? '' : ' — fehlt: ' + muss.filter((m) => !html.includes(m)).join(' | ')}`);
  ok = ok && gut;
}
async function holen(route, z) {
  const ctx = await b.newContext();
  await ctx.addInitScript((zz) => localStorage.setItem('crossminton.zustand.v1', JSON.stringify(zz)), z);
  const p = await ctx.newPage();
  p.on('console', (m) => { if (m.type() === 'error') { fehlerTotal++; console.log('  [console.error]', m.text().slice(0, 120)); } });
  await p.goto('http://localhost:8000/#/' + route, { waitUntil: 'networkidle' });
  await p.waitForTimeout(400);
  const html = await p.evaluate(() => document.body.innerText);
  await ctx.close();
  return html;
}
const zBeginner = { version: 1, einstellungen: { sprache: 'pl', thema: 'hell' }, diagnose: { stufe: 'beginner', trainer: false, herkunft: null, ziel: null } };
const zTrainer = { version: 1, einstellungen: { sprache: 'pl', thema: 'hell' }, diagnose: { stufe: 'experte', trainer: true, herkunft: 'TEN', ziel: null } };

// Startseite: Hero + Bottom-Nav + Kacheln
pruef('Startseite', await holen('', zBeginner),
  ['Podręcznik nauki i treningu', 'Nauka', 'Trening', 'Profil', 'Więcej', 'Odkryj rozdziały']);
// Themenpfad: Domänen-Facetten
pruef('Themenpfad', await holen('pfad/themen', zBeginner),
  ['Technika', 'Taktyka', 'Sprzęt']);
// Kompetenzpfad: Baustein-Titel polnisch
pruef('Kompetenzpfad', await holen('pfad/kompetenz/beginner', zBeginner),
  ['Chwyt uniwersalny', 'Serwis', 'Pozycja podstawowa']);
// Baustein-Ansicht: Buttons + Abschnitte
pruef('Baustein griff', await holen('baustein/griff?kontext=kompetenz', zBeginner),
  ['Objaśnienie', 'Ćwiczenie', 'Klasyfikacja']);
// Profil: Einstellungen + Status
pruef('Profil', await holen('profil', zBeginner),
  ['Ustawienia', 'Język', 'Wygląd', 'Poziom', 'Postępy']);
// Regeln-Reiter
pruef('Regeln', await holen('regeln', zBeginner),
  ['Zasady gry', 'Regulamin turniejowy', 'Źródło']);
// Trainingsplan
pruef('Plan', await holen('plan', zBeginner),
  ['Plan treningowy', 'Tygodnie', 'Wygeneruj plan']);
// Trainer + Delta (Perspektive): Warstwa trenera sichtbar + Delta-Hinweis TEN
pruef('Trainer/Delta', await holen('baustein/griff?kontext=kompetenz', zTrainer),
  ['Warstwa trenera', 'przechodzących z']);

console.log('\nKonsolenfehler:', fehlerTotal);
await b.close();
console.log(ok && fehlerTotal === 0 ? '\nALLES OK' : '\nFEHLER');
process.exit(ok && fehlerTotal === 0 ? 0 : 1);
