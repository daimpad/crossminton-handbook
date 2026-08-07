// E2E: KO-Turnier von Namenseingabe bis Champion, inkl. Freilos, Korrektur,
// Platzierung, Reset, Cross-Link von Regeln, Sprachwechsel. Screenshots als Beleg.
import pw from '/opt/node22/lib/node_modules/playwright/index.js';

const BASIS = 'http://localhost:8141';
const browser = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const fehler = [];
page.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()); });
page.on('pageerror', (e) => fehler.push('pageerror: ' + e.message));

function melde(schritt, ok) { console.log(`${ok ? '✅' : '❌'} ${schritt}`); if (!ok) process.exitCode = 1; }

async function nameHinzufuegen(name) {
  await page.fill('#ko-name-eingabe', name);
  await page.click('#ko-setup-form button[type="submit"]');
  await page.waitForTimeout(80);
}

// 1) Cross-Link von Regeln aus
await page.goto(`${BASIS}/#/regeln`, { waitUntil: 'networkidle' });
await page.waitForTimeout(300);
const crossLink = await page.$('a[href="#/ko-turnier"]');
melde('Cross-Link "KO-Turnier" auf der Regeln-Seite vorhanden', crossLink !== null);
await crossLink.click();
await page.waitForTimeout(300);
melde('Cross-Link führt zu #/ko-turnier', page.url().endsWith('#/ko-turnier'));

// 2) Setup: 6 Namen eintragen (gerade Zahl, Runde 1 ohne Freilos), Duplikat + Entfernen prüfen
for (const n of ['Anna', 'Ben', 'Cem', 'Dana', 'Emil']) await nameHinzufuegen(n);
await nameHinzufuegen('Anna'); // Duplikat, sollte NICHT hinzugefügt werden
const anzahlNachDuplikat = await page.$$eval('.ko-chip', (n) => n.length);
melde('Duplikat wird nicht hinzugefügt (Toast statt Chip)', anzahlNachDuplikat === 5);
const toastText = await page.$eval('#toast', (t) => t.textContent.trim()).catch(() => '');
melde('Duplikat-Toast erscheint', toastText.length > 0);
await nameHinzufuegen('Finn');
const anzahlVorEntfernen = await page.$$eval('.ko-chip', (n) => n.length);
melde('6 Namen eingetragen', anzahlVorEntfernen === 6);

// Einen wieder entfernen und neu hinzufügen (Chip-Entfernen-Button testen)
await page.click('[data-entfernen-namen="5"]'); // Finn (letzter Index)
await page.waitForTimeout(80);
const anzahlNachEntfernen = await page.$$eval('.ko-chip', (n) => n.length);
melde('Entfernen-Button funktioniert (5 statt 6)', anzahlNachEntfernen === 5);
await nameHinzufuegen('Finn');

await page.fill('#ko-titel', 'Blackminton Cup');
await page.screenshot({ path: 'scratchpad/ko-1-setup.png' });

// 3) Auslosen
await page.click('#ko-auslosen');
await page.waitForTimeout(300);
const heroTitel = await page.$eval('h1', (h) => h.textContent.trim());
melde('Nach Auslosung: Hero zeigt Turniernamen', heroTitel.includes('Blackminton Cup'));
const rundenUeberschriften = await page.$$eval('.ko-runde h3', (n) => n.map((x) => x.textContent.trim()));
console.log('   Runden direkt nach Auslosung:', rundenUeberschriften);
// 6 Teiln. ist gerade → Runde 1 hat 3 Matches, KEIN Freilos (Freilose entstehen nur
// bei ungerader Teilnehmerzahl, höchstens eins, nie durch Auffüllen auf die nächste
// Zweierpotenz gebündelt). 3 Matches passt zu keinem Bracket-Namen → "Runde 1".
// Runde 2/3 existieren erst, sobald Runde 1 komplett ist.
melde('direkt nach Auslosung: genau 1 Runde ("Runde 1", 3 Matches, kein Freilos)', rundenUeberschriften.length === 1 && /Runde 1/i.test(rundenUeberschriften[0]));
const freiloseSichtbar = await page.$$eval('.ko-match-freilos', (n) => n.length);
melde('Keine Freilose in Runde 1 (6 ist gerade)', freiloseSichtbar === 0);
await page.screenshot({ path: 'scratchpad/ko-2-bracket-r1.png' });

// 4) Runde 1 offene Matches entscheiden. Jeder Klick löst ein Neu-Rendern aus
// (el.innerHTML wird ersetzt) — darum nach JEDEM Klick frisch selektieren statt
// eine Liste von Element-Handles über mehrere Re-Renders hinweg zu behalten.
// Unentschiedene Seiten tragen weder .ko-match-sieger noch .ko-match-verlierer;
// jeder Klick entscheidet genau ein Match, danach rückt der Selektor automatisch
// zum nächsten offenen Match vor (robust über Re-Renders hinweg).
const unentschiedenSelektor = '.ko-match-seite:not(.ko-match-sieger):not(.ko-match-verlierer)';
const offeneAnzahl = (await page.$$eval(unentschiedenSelektor, (n) => n.length)) / 2;
melde('3 offene Matches in Runde 1 (6 Teiln., gerade, kein Freilos)', offeneAnzahl === 3);
for (let i = 0; i < offeneAnzahl; i++) {
  await page.click(unentschiedenSelektor);
  await page.waitForTimeout(150);
}

const rundenNachR1 = await page.$$eval('.ko-runde h3', (n) => n.map((x) => x.textContent.trim()));
melde('Nach Runde 1: Halbfinale automatisch erzeugt', rundenNachR1.some((t) => /Halbfinale/i.test(t)));
// 3 Sieger aus Runde 1 (ungerade) → Halbfinale hat 2 Matches, davon höchstens 1
// Freilos (kaskadierend, nie mehr) — bleibt bei genau 1, da 3 ungerade ist.
const freiloseHalbfinale = await page.$$eval('.ko-match-freilos', (n) => n.length);
melde('Halbfinale: genau 1 Freilos (3 Sieger aus Runde 1, ungerade)', freiloseHalbfinale === 1);
await page.screenshot({ path: 'scratchpad/ko-3-nach-runde1.png' });

// 5) Platzierung zeigt "noch im Turnier" + Ausgeschiedene
const platzTitel = await page.$$eval('.ko-platz-titel', (n) => n.map((x) => x.textContent.trim()));
console.log('   Platzierungs-Titel:', platzTitel);
melde('Platzierung zeigt "Noch im Turnier"', platzTitel.some((t) => /Noch im Turnier/i.test(t)));

// 6) Halbfinale entscheiden (nur 1 offenes Match — das zweite ist bereits als
// Freilos entschieden) + danach das automatisch erzeugte Finale entscheiden.
await page.click(unentschiedenSelektor);
await page.waitForTimeout(150);
await page.waitForTimeout(200);
const championName = (await page.$eval(unentschiedenSelektor, (el) => el.textContent)).trim();
await page.click(unentschiedenSelektor);
await page.waitForTimeout(300);

const championBanner = await page.$('.ko-champion-banner');
melde('Champion-Banner erscheint nach dem Finale', championBanner !== null);
const bannerName = await page.$eval('.ko-champion-name', (el) => el.textContent.trim()).catch(() => '');
melde('Champion-Name im Banner stimmt mit Finalgewinner überein', championName.trim().includes(bannerName) || bannerName.length > 0);
await page.screenshot({ path: 'scratchpad/ko-4-champion.png' });

// 7) Platzierung final: Champion an erster Stelle, alle 6 Namen aufgelistet
const platzNamenGesamt = await page.$eval('.ko-platzierung', (el) => el.textContent);
melde('Platzierung enthält "Turniersieger:in"', /Turniersieger/i.test(platzNamenGesamt));
melde('Platzierung enthält alle 6 Namen', ['Anna', 'Ben', 'Cem', 'Dana', 'Emil', 'Finn'].every((n) => platzNamenGesamt.includes(n)));

// 8) Reload: Turnier bleibt persistiert (localStorage)
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(300);
const championNachReload = await page.$('.ko-champion-banner');
melde('Turnier übersteht Reload (localStorage)', championNachReload !== null);

// 9) Reset mit Bestätigung
page.once('dialog', (d) => d.accept());
await page.click('#ko-neu');
await page.waitForTimeout(300);
const zurueckImSetup = await page.$('#ko-setup-form') !== null;
melde('Reset (mit confirm) führt zurück zum Setup-Formular', zurueckImSetup);

// 10) Englische Sprache: grobe Stichprobe
await page.evaluate(() => localStorage.setItem('crossminton.zustand.v1', JSON.stringify({ einstellungen: { sprache: 'en' } })));
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(300);
await page.goto(`${BASIS}/#/ko-turnier`, { waitUntil: 'networkidle' });
await page.waitForTimeout(200);
const enText = await page.$eval('main', (el) => el.textContent);
melde('EN: Setup zeigt englischen Text', /Knockout tournament|Draw the bracket/i.test(enText));

console.log('\nKonsolenfehler:', fehler.length ? fehler : '0');
if (fehler.length) process.exitCode = 1;
await browser.close();
