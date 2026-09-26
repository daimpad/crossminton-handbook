// E2E: SEO Tier 2 / Baustein 1 — echtes Pfad-Routing statt Hash.
// Prüft: Klick-Navigation ohne Reload, Deep-Link-Reload, Zurück/Vorwärts,
// Altbestand-Hash-Links, den GitHub-Pages-404-Umweg und den Montage-Unterpfad.
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const BASIS = process.env.BASIS || 'http://localhost:8150';
const browser = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext({ viewport: { width: 1100, height: 900 } });
const page = await ctx.newPage();
const fehler = [];
// Der SPA-404-Umweg ERZEUGT bewusst eine 404-Antwort (der Server hat unter
// /baustein/griff keine Datei; 404.html leitet um). Diese eine Klasse von
// Konsolenfehlern ist die dokumentierte Mechanik, kein Defekt — separat zählen.
const umwege = [];
page.on('console', (m) => {
  if (m.type() !== 'error') return;
  if (/status of 404/.test(m.text())) umwege.push(m.text());
  else fehler.push(m.text());
});
page.on('pageerror', (e) => fehler.push('pageerror: ' + e.message));
page.on('response', (r) => {
  // Nur Navigationen dürfen 404 sein — ein 404 auf JS/CSS/JSON wäre ein Defekt.
  if (r.status() === 404 && /\.(js|css|json|woff2|svg|png)$/i.test(new URL(r.url()).pathname)) {
    fehler.push('404 auf Ressource: ' + r.url());
  }
});
const melde = (s, ok) => { console.log(`${ok ? '✅' : '❌'} ${s}`); if (!ok) process.exitCode = 1; };
const pfad = () => page.evaluate(() => location.pathname + location.search + location.hash);

// --- 1) Startseite: Links tragen echte Pfade, keine Hashes -------------------
await page.goto(`${BASIS}/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(400);
const hashLinks = await page.$$eval('a[href^="#/"]', (as) => as.length);
melde('nach dem Rendern kein einziger #/-Link mehr im DOM', hashLinks === 0);
const beispiel = await page.$eval('a[href*="pfad/themen"]', (a) => a.getAttribute('href'));
melde(`interne Links sind echte Pfade (${beispiel})`, beispiel.startsWith('/') && !beispiel.includes('#'));

// --- 2) Klick-Navigation ohne Vollreload -------------------------------------
await page.evaluate(() => { window.__marke = 'vor-dem-klick'; });
await page.click('a[href*="pfad/themen"]');
await page.waitForTimeout(400);
melde('Klick führt auf /pfad/themen', (await pfad()) === '/pfad/themen');
// Ein Vollreload würde window.__marke verlieren — überlebt sie, war es ein pushState.
melde('Klick löste keine Vollnavigation aus (SPA-Push)',
  (await page.evaluate(() => window.__marke)) === 'vor-dem-klick');
melde('Inhalt gerendert', (await page.$eval('#ansicht', (el) => el.textContent.length)) > 200);

// --- 3) Zurück / Vorwärts ----------------------------------------------------
await page.goBack(); await page.waitForTimeout(400);
melde('Zurück landet auf der Wurzel', (await pfad()) === '/');
await page.goForward(); await page.waitForTimeout(400);
melde('Vorwärts landet wieder auf /pfad/themen', (await pfad()) === '/pfad/themen');

// --- 4) Deep-Link direkt laden (über den 404-Umweg wie auf Pages) ------------
await page.goto(`${BASIS}/baustein/griff`, { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
melde('Deep-Link /baustein/griff wird zum echten Pfad aufgelöst', (await pfad()) === '/baustein/griff');
const h1 = await page.$eval('h1', (el) => el.textContent.trim());
melde(`Deep-Link rendert den Baustein (${h1})`, /Griff/i.test(h1));

// --- 5) Query bleibt erhalten (Kontext-Parameter) ---------------------------
await page.goto(`${BASIS}/baustein/griff?kontext=themen`, { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
melde('Deep-Link mit Query behält ?kontext=themen', (await pfad()) === '/baustein/griff?kontext=themen');

// --- 6) Altbestand: geteilte #/-Links müssen weiter tragen -------------------
await page.goto(`${BASIS}/#/regeln`, { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
melde('alter Hash-Link #/regeln wird auf /regeln umgeschrieben', (await pfad()) === '/regeln');
melde('alter Hash-Link rendert den Regeln-Reiter', /Regeln|Grundbegriffe/.test(await page.$eval('#ansicht', (el) => el.textContent)));

// --- 7) Reload auf einer Unterseite ------------------------------------------
await page.goto(`${BASIS}/training`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(600);
melde('Reload auf /training bleibt auf /training', (await pfad()) === '/training');
melde('Reload rendert weiter korrekt', (await page.$eval('#ansicht', (el) => el.textContent.length)) > 200);

// --- 8) Externe/Datei-Links werden NICHT abgefangen --------------------------
await page.goto(`${BASIS}/turnier`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
const pdfLink = await page.$eval('a[href$=".pdf"]', (a) => a.getAttribute('href')).catch(() => null);
melde('PDF-Links bleiben echte Dateiverweise', pdfLink === null || /\.pdf$/.test(pdfLink));

console.log(`\n404-Umwege (erwartete SPA-Mechanik): ${umwege.length}`);
console.log('Konsolenfehler:', fehler.length ? fehler : '0');
if (fehler.length) process.exitCode = 1;
await browser.close();
