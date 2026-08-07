// End-to-End: PL aktiv → ein Diagramm-Baustein rendert die .pl-Variante + polnischen Text.
import pw from '/opt/node22/lib/node_modules/playwright/index.js';

const browser = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext();
const page = await ctx.newPage();
const fehler = [];
page.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()); });
page.on('pageerror', (e) => fehler.push('pageerror: ' + e.message));

// Sprache pl vorab setzen (verschmelze füllt Defaults).
await page.addInitScript(() => {
  localStorage.setItem('crossminton.zustand.v1', JSON.stringify({ einstellungen: { sprache: 'pl' } }));
});

const BASIS = 'http://localhost:8137';
// griff trägt Grafik G-001; erklaerteil polnisch → enthält "chwyt".
await page.goto(`${BASIS}/#/baustein/griff`, { waitUntil: 'networkidle' });
await page.waitForTimeout(800); // verbessereGrafiken (fetch → inline-SVG)

const img = await page.$('figure.grafik-platzhalter img');
const imgSrc = img ? await img.getAttribute('src') : null;

// nach dem SVG-Tausch: sichtbarer <text> im Diagramm
const svgText = await page.$$eval('figure.grafik-platzhalter svg text', (ns) => ns.map((n) => n.textContent).join(' | ')).catch(() => '');
const svgAria = await page.$eval('figure.grafik-platzhalter svg', (s) => s.getAttribute('aria-label')).catch(() => '');
const bodyText = await page.$eval('#ansicht', (el) => el.textContent);

const htmlSprache = await page.evaluate(() => document.documentElement.lang);
const polnischImText = /chwyt|forhend|bekhend|uścisk/i.test(bodyText);
const svgPolnisch = /uścisk|kciuk/i.test(svgText + ' ' + (svgAria || ''));

console.log('html lang       :', htmlSprache);
console.log('img src         :', imgSrc);
console.log('svg <text>      :', svgText.slice(0, 90));
console.log('svg aria-label  :', (svgAria || '').slice(0, 70));
console.log('PL im Body-Text :', polnischImText);
console.log('PL im Diagramm  :', svgPolnisch);
console.log('Konsolenfehler  :', fehler.length ? fehler : '0');

// Zweiter Check: ein Diagramm mit .pl.png-Fallback vor dem Tausch (Outdoor G-059)
await page.goto(`${BASIS}/#/baustein/verschiedene_boeden`, { waitUntil: 'networkidle' });
const img2 = await page.$('figure.grafik-platzhalter img');
const img2Src = img2 ? await img2.getAttribute('src') : null;
console.log('boeden img src  :', img2Src);

const ok = polnischImText && svgPolnisch && fehler.length === 0 && /\.pl\.png$/.test(img2Src || '');
console.log(ok ? '\n✅ RING 16 E2E GRÜN' : '\n❌ FEHLGESCHLAGEN');
await browser.close();
process.exit(ok ? 0 : 1);
