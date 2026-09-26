// Reproduziert den Nutzer-Fall: im laufenden Betrieb (Start auf de) auf einem
// Diagramm-Baustein die Sprache im Kopf auf pl umschalten → kippt das Diagramm?
import pw from '/opt/node22/lib/node_modules/playwright/index.js';

const browser = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext();
const page = await ctx.newPage();
const fehler = [];
page.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()); });
page.on('pageerror', (e) => fehler.push('pageerror: ' + e.message));

const BASIS = 'http://localhost:8138';
await page.goto(`${BASIS}/#/baustein/griff`, { waitUntil: 'networkidle' });
await page.waitForTimeout(700); // verbessereGrafiken

const svgTextDe = await page.$$eval('figure.grafik-platzhalter svg text', (ns) => ns.map((n) => n.textContent).join(' | ')).catch(() => '(kein svg)');
console.log('VOR Umschalten (de):', svgTextDe);

// Sprache im Kopf öffnen + auf pl klicken
await page.click('#sprach-knopf');
await page.waitForTimeout(150);
const plKnopf = await page.$('[data-sprach-code="pl"]');
if (!plKnopf) { console.log('❌ kein pl-Knopf im Kopf gefunden'); await browser.close(); process.exit(1); }
await plKnopf.click();
await page.waitForTimeout(1000); // setzeSprache (fetch labels) + rendern + verbessereGrafiken

const htmlLang = await page.evaluate(() => document.documentElement.lang);
const svgTextPl = await page.$$eval('figure.grafik-platzhalter svg text', (ns) => ns.map((n) => n.textContent).join(' | ')).catch(() => '(kein svg)');
const svgUrl = await page.$eval('figure.grafik-platzhalter svg', () => null).catch(() => null);
// Falls noch <img> (SVG-Tausch nicht erfolgt): dessen src
const imgSrc = await page.$eval('figure.grafik-platzhalter img', (i) => i.getAttribute('src')).catch(() => '(kein img)');
const bodyPl = /chwyt|uścisk/i.test(await page.$eval('#ansicht', (el) => el.textContent));

console.log('NACH Umschalten html lang:', htmlLang);
console.log('NACH Umschalten (pl) svg :', svgTextPl);
console.log('img src (falls kein Tausch):', imgSrc);
console.log('PL im Body-Text          :', bodyPl);
console.log('Konsolenfehler           :', fehler.length ? fehler : '0');

const diagrammPolnisch = /uścisk|kciuk/i.test(svgTextPl);
console.log(diagrammPolnisch ? '\n✅ Diagramm kippt beim Umschalten auf Polnisch' : '\n❌ Diagramm bleibt Deutsch (Bug reproduziert)');
await browser.close();
process.exit(diagrammPolnisch ? 0 : 1);
