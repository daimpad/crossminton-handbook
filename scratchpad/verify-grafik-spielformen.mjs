// E2E: die neuen Spielform-Grafiken G-062/G-063 — Inline-SVG-Tausch, Theme-Fähigkeit
// (hell UND dunkel), Sprachvarianten.
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const BASIS = 'http://localhost:8147';
const browser = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const fehler = [];
page.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()); });
page.on('pageerror', (e) => fehler.push('pageerror: ' + e.message));
const melde = (s, ok) => { console.log(`${ok ? '✅' : '❌'} ${s}`); if (!ok) process.exitCode = 1; };

async function oeffne(baustein, sprache = 'de', thema = 'hell') {
  await page.goto(`${BASIS}/`, { waitUntil: 'networkidle' });
  await page.evaluate(([spr, th]) => localStorage.setItem('crossminton.zustand.v1', JSON.stringify({
    diagnose: { stufe: 'fortgeschritten', trainer: false, herkunft: 'CM', ziel: [] },
    einstellungen: { sprache: spr, thema: th },
  })), [sprache, thema]);
  await page.goto(`${BASIS}/#/baustein/${baustein}`, { waitUntil: 'networkidle' });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(700); // verbessereGrafiken tauscht per fetch
}

for (const [baustein, nr] of [['funplay', 'G-062'], ['mehrfeld', 'G-063']]) {
  await oeffne(baustein);
  const figur = await page.$(`figure`);
  melde(`${baustein}: Grafik-Figur gerendert`, figur !== null);
  const svgDa = await page.$eval('.grafik-bild', (el) => el.tagName.toLowerCase());
  melde(`${baustein}: PNG wurde gegen Inline-SVG getauscht (${nr})`, svgDa === 'svg');
  // Theme-Fähigkeit: das SVG darf keine harten Hex-Farben tragen, nur var(--token)
  const hart = await page.$eval('.grafik-bild', (el) => {
    const roh = el.outerHTML;
    const treffer = roh.match(/(?:stroke|fill)\s*:\s*#[0-9a-f]{3,6}/gi) || [];
    return treffer.filter((t) => !/var\(/.test(t)).length;
  });
  melde(`${baustein}: Farben laufen über Tokens (keine harte Hex-Farbe außerhalb var())`, hart === 0);
  const alt = await page.$eval('.grafik-bild', (el) => el.getAttribute('aria-label') || '');
  melde(`${baustein}: aria-label ist gesetzt (übersetzter alt)`, alt.length > 10);
}

// Dunkelmodus: dieselbe Grafik muss ohne Nachladen tragen
await oeffne('funplay', 'de', 'dunkel');
const thema = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
melde('Dunkelmodus aktiv', thema === 'dunkel');
melde('Grafik im Dunkelmodus vorhanden', await page.$('.grafik-bild') !== null);
await page.screenshot({ path: 'scratchpad/g062-dunkel.png', fullPage: true });

// Sprachvarianten: die Caption kippt mit der Grafik-Sprache
for (const [code, probe] of [['en', /keeping it up together/i], ['fr', /tenir ensemble/i], ['pl', /utrzymać razem/i]]) {
  await oeffne('funplay', code);
  const txt = await page.$eval('.grafik-bild', (el) => el.textContent || '');
  melde(`${code.toUpperCase()}: Caption der Grafik übersetzt`, probe.test(txt));
}

console.log('\nKonsolenfehler:', fehler.length ? fehler : '0');
if (fehler.length) process.exitCode = 1;
await browser.close();
