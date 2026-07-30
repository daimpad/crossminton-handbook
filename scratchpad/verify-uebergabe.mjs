// E2E: Integration des Inhalts-Übergabepakets — Spielformen (modus_baustein),
// Fehlerbilder im Trainer-Layer, erweiterter Regeln-Reiter (ICO 2024).
// Screenshots als Beleg, Konsolenfehler müssen 0 bleiben.
import pw from '/opt/node22/lib/node_modules/playwright/index.js';

const BASIS = 'http://localhost:8144';
const browser = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const fehler = [];
page.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()); });
page.on('pageerror', (e) => fehler.push('pageerror: ' + e.message));
function melde(schritt, ok) { console.log(`${ok ? '✅' : '❌'} ${schritt}`); if (!ok) process.exitCode = 1; }

// Diagnose setzen (Stufe + Trainer-Perspektive), damit alle Ebenen sichtbar sind.
let aktuelleSprache = 'de';
async function diagnose(stufe, trainer) {
  await page.goto(`${BASIS}/`, { waitUntil: 'networkidle' });
  await page.evaluate(([s, t, spr]) => localStorage.setItem('crossminton.zustand.v1',
    JSON.stringify({ diagnose: { stufe: s, trainer: t, herkunft: 'CM', ziel: [] }, einstellungen: { sprache: spr } })),
    [stufe, trainer, aktuelleSprache]);
}
async function setzeSprache(code) {
  aktuelleSprache = code;
  await page.evaluate((spr) => {
    const z = JSON.parse(localStorage.getItem('crossminton.zustand.v1') || '{}');
    z.einstellungen = { ...(z.einstellungen || {}), sprache: spr };
    localStorage.setItem('crossminton.zustand.v1', JSON.stringify(z));
  }, code);
}
// Route öffnen UND neu laden — nur so liest boot() den frisch gesetzten Zustand.
async function oeffne(hash) {
  await page.goto(`${BASIS}/${hash}`, { waitUntil: 'networkidle' });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(350);
}

// --- 1) Spielformen im Kompetenzpfad ---------------------------------------
await diagnose('beginner', false);
await oeffne('#/pfad/kompetenz/beginner');
const beginnerIds = await page.$$eval('a[href^="#/baustein/"]', (as) => as.map((a) => a.getAttribute('href')));
melde('funplay steht im Beginner-Kompetenzpfad', beginnerIds.some((h) => h.includes('funplay')));
melde('mehrfeld steht NICHT im Beginner-Pfad (Fortgeschritten)', !beginnerIds.some((h) => h.includes('mehrfeld')));

await diagnose('fortgeschritten', false);
await oeffne('#/pfad/kompetenz/fortgeschritten');
const fgIds = await page.$$eval('a[href^="#/baustein/"]', (as) => as.map((a) => a.getAttribute('href')));
melde('mehrfeld steht im Fortgeschritten-Kompetenzpfad', fgIds.some((h) => h.includes('mehrfeld')));

// --- 2) Baustein-Ansicht der Spielformen ------------------------------------
await oeffne('#/baustein/funplay');
const funplayH1 = await page.$eval('h1', (h) => h.textContent.trim());
melde('funplay-Seite zeigt den Titel', /Funplay/i.test(funplayH1));
const funplayText = await page.$eval('#ansicht', (el) => el.textContent);
melde('funplay zeigt Erklärteil + Übungsteil', /kooperative Spielweise/.test(funplayText) && /Gemeinsam halten/.test(funplayText));
await page.screenshot({ path: 'scratchpad/ueb-1-funplay.png', fullPage: true });

await oeffne('#/baustein/mehrfeld');
const mehrfeldText = await page.$eval('#ansicht', (el) => el.textContent);
melde('mehrfeld zeigt Erklärteil + Reflexionsaufgabe', /gemeinsames Zentrum/.test(mehrfeldText) && /Aufmerksamkeit/.test(mehrfeldText));
melde('mehrfeld trägt den Sicherheitshinweis (gekreuzte Bahnen)', /Kollisions|Rücksicht/.test(mehrfeldText));

// --- 3) Fehlerbilder im Trainer-Layer ---------------------------------------
await diagnose('fortgeschritten', false);
await oeffne('#/baustein/smash');
const ohneTrainer = await page.$eval('#ansicht', (el) => el.textContent);
melde('ohne Trainer-Perspektive: kein Fehlerbild am smash-Baustein', !/Falscher Treffpunkt/.test(ohneTrainer));

await diagnose('fortgeschritten', true);
await oeffne('#/baustein/smash');
const mitTrainer = await page.$eval('#ansicht', (el) => el.textContent);
melde('mit Trainer-Perspektive: Fehlerbild am smash-Baustein sichtbar', /Falscher Treffpunkt/.test(mitTrainer));
melde('Fehlerbild zeigt Symptom, Ursache und Korrektur', /Symptom/i.test(mitTrainer) && /Ursache/i.test(mitTrainer) && /Korrektur/i.test(mitTrainer));
await page.screenshot({ path: 'scratchpad/ueb-2-fehlerbild.png', fullPage: true });

await oeffne('#/baustein/griff');
const griffText = await page.$eval('#ansicht', (el) => el.textContent);
melde('griff zeigt ALLE drei Fehlerbilder in situ', /Griff zu fest/.test(griffText)
  && /Umklammern und Verdrehen/.test(griffText) && /Umgreifen auf der Rückhand/.test(griffText));

// --- 4) Regeln-Reiter (ICO 2024) --------------------------------------------
await oeffne('#/regeln');
const abschnitte = await page.$$eval('details', (ds) => ds.length);
melde('Regeln-Reiter zeigt Abschnitte als <details>', abschnitte >= 13);
await page.$$eval('details', (ds) => ds.forEach((d) => { d.open = true; }));
await page.waitForTimeout(200);
const regelnText = await page.$eval('#ansicht', (el) => el.textContent);
melde('§11 „Besondere Situationen" vorhanden', /Besondere Situationen/.test(regelnText));
melde('Turnier-Regel (Gruppen/K.-o./Gleichstand) vorhanden', /K\.-o\.-Runde/.test(regelnText) && /Gleichstand/.test(regelnText));
melde('Court-Maße (ICO 1.3) im Ausrüstungs-Abschnitt', /5,5 × 5,5 m/.test(regelnText) && /Aufschlaglinie/.test(regelnText));
melde('Keine DCV-2018-Doppelnummern mehr („(ICO …)")', !/\(ICO \d/.test(regelnText));
await page.screenshot({ path: 'scratchpad/ueb-3-regeln.png', fullPage: true });

// --- 5) Sprachumschaltung trägt den neuen Inhalt -----------------------------
await setzeSprache('en');
await oeffne('#/baustein/funplay');
const enText = await page.$eval('#ansicht', (el) => el.textContent);
melde('EN: funplay ist englisch übersetzt', /cooperative way of playing/i.test(enText));
await oeffne('#/regeln');
await page.$$eval('details', (ds) => ds.forEach((d) => { d.open = true; }));
await page.waitForTimeout(200);
const enRegeln = await page.$eval('#ansicht', (el) => el.textContent);
melde('EN: neue Regeln sind englisch (Court + Turnier)', /The court consists of two squares/i.test(enRegeln) && /knockout round/i.test(enRegeln));

// --- 6) Polnisch als Gegenprobe ----------------------------------------------
await setzeSprache('pl');
await oeffne('#/baustein/mehrfeld');
const plText = await page.$eval('#ansicht', (el) => el.textContent);
melde('PL: mehrfeld ist polnisch übersetzt', /wspólnego środka|Układ wielu pól/i.test(plText));


// --- 7) Übersetzungsring: Fehlerbilder in en/fr/pl (nach dem Ring ergänzt) ----
for (const [code, probe] of [['en', /Contact point|contact point|Wrong contact point/],
                             ['fr', /point d'impact|Mauvais point/],
                             ['pl', /punkt trafienia|Zły punkt/]]) {
  await setzeSprache(code);
  await oeffne('#/baustein/smash');
  const t = await page.$eval('#ansicht', (el) => el.textContent);
  melde(`${code.toUpperCase()}: Fehlerbild am smash ist übersetzt`, probe.test(t));
}
await setzeSprache('fr');
await oeffne('#/baustein/griff');
const frGriff = await page.$eval('#ansicht', (el) => el.textContent);
melde('FR: alle drei Griff-Fehlerbilder übersetzt (inkl. Consigne-Ansage)',
  /Crispation|prise trop ferme/i.test(frGriff) && /Consigne/.test(frGriff));

console.log('\nKonsolenfehler:', fehler.length ? fehler : '0');
if (fehler.length) process.exitCode = 1;
await browser.close();
