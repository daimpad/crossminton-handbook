// Verifiziert Impressum + Datenschutz in der laufenden App: rendert beide
// Routen in de + en, prüft Kernfakten im Text, macht Screenshots.
import pw from '/opt/node22/lib/node_modules/playwright/index.js';

const BASIS = 'http://localhost:8140';
const browser = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext({ viewport: { width: 800, height: 1100 } });
const page = await ctx.newPage();
const fehler = [];
page.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()); });
page.on('pageerror', (e) => fehler.push('pageerror: ' + e.message));

function melde(schritt, ok) { console.log(`${ok ? '✅' : '❌'} ${schritt}`); if (!ok) process.exitCode = 1; }

await page.goto(`${BASIS}/#/impressum`, { waitUntil: 'networkidle' });
await page.waitForTimeout(300);
const impressumText = await page.$eval('main', (el) => el.textContent);
melde('Impressum: private/nicht-kommerziell + § 5 DDG erwähnt', /privates, nicht-kommerzielles Projekt/.test(impressumText) && /§ 5 Digitale-Dienste-Gesetz \(DDG/.test(impressumText));
melde('Impressum: Name + Kontakt vorhanden', /Damian Paderta/.test(impressumText) && /contact@nozilla\.de/.test(impressumText));
melde('Impressum: keine alte "Vereine"-Formulierung mehr', !/Vereinen/.test(impressumText));
melde('Impressum: keine kaputten Anführungszeichen/Artefakte', !/undefined|NaN|\[object/.test(impressumText));
await page.screenshot({ path: 'scratchpad/rechts-1-impressum-de.png', fullPage: true });

await page.goto(`${BASIS}/#/datenschutz`, { waitUntil: 'networkidle' });
await page.waitForTimeout(300);
const dsText = await page.$eval('main', (el) => el.textContent);
melde('Datenschutz: netcup als Hoster genannt (nicht mehr GitHub Pages)', /netcup GmbH/.test(dsText) && !/GitHub Pages/.test(dsText) && !/GitHub, Inc\./.test(dsText));
melde('Datenschutz: netcup-Anschrift enthalten', /Karlsruhe/.test(dsText));
melde('Datenschutz: localStorage + § 25 TDDDG erwähnt', /localStorage/.test(dsText) && /TDDDG/.test(dsText));
melde('Datenschutz: Feedback-Tool (mailto, session-only) erklärt', /Feedback-Modus/.test(dsText) && /E-Mail-Programm/.test(dsText));
melde('Datenschutz: DSGVO-Rechte (Art. 15-21) aufgeführt', /Art\. 15/.test(dsText) && /Art\. 21/.test(dsText));
melde('Datenschutz: keine kaputten Anführungszeichen/Artefakte', !/undefined|NaN|\[object/.test(dsText));
await page.screenshot({ path: 'scratchpad/rechts-2-datenschutz-de.png', fullPage: true });

// Sprachwechsel: englische Version prüfen (Struktur/Fakten identisch, andere Sprache)
await page.evaluate(() => {
  localStorage.setItem('crossminton.zustand.v1', JSON.stringify({ einstellungen: { sprache: 'en' } }));
});
await page.goto(`${BASIS}/#/datenschutz`, { waitUntil: 'networkidle' });
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(300);
const dsTextEn = await page.$eval('main', (el) => el.textContent);
melde('EN: Datenschutz zeigt englischen Text (netcup GmbH, GDPR)', /netcup GmbH/.test(dsTextEn) && /GDPR/.test(dsTextEn) && /Karlsruhe/.test(dsTextEn));
await page.screenshot({ path: 'scratchpad/rechts-3-datenschutz-en.png', fullPage: true });

// Menü-Link -> Impressum/Datenschutz weiter erreichbar (Navigation nicht kaputt).
// Bei 800px Breite greift die Desktop-Navigation (Hamburger statt "Mehr"-Button).
await page.goto(`${BASIS}/#/`, { waitUntil: 'networkidle' });
await page.click('#hamburger');
await page.waitForTimeout(200);
const linksVorhanden = await page.$$eval('[data-footer]', (n) => n.length) === 2;
melde('Menü: Impressum + Datenschutz weiterhin verlinkt', linksVorhanden);

console.log('\nKonsolenfehler:', fehler.length ? fehler : '0');
if (fehler.length) process.exitCode = 1;
await browser.close();
