// E2E: die 15 ergänzten Fehlerbilder — Trainer-Layer an Taktik-, Experten-Technik-,
// Doppel- und Athletik-Bausteinen, in vier Sprachen.
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const BASIS = 'http://localhost:8146';
const browser = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const fehler = [];
page.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()); });
page.on('pageerror', (e) => fehler.push('pageerror: ' + e.message));
const melde = (s, ok) => { console.log(`${ok ? '✅' : '❌'} ${s}`); if (!ok) process.exitCode = 1; };

async function oeffne(baustein, sprache, trainer = true) {
  await page.goto(`${BASIS}/`, { waitUntil: 'networkidle' });
  await page.evaluate(([spr, tr]) => localStorage.setItem('crossminton.zustand.v1', JSON.stringify({
    diagnose: { stufe: 'experte', trainer: tr, herkunft: 'CM', ziel: [] },
    einstellungen: { sprache: spr },
  })), [sprache, trainer]);
  await page.goto(`${BASIS}/#/baustein/${baustein}`, { waitUntil: 'networkidle' });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(350);
  return page.$eval('#ansicht', (el) => el.textContent);
}

// Stichproben über alle vier neu bespielten Bereiche
for (const [baustein, probe] of [
  ['punkt_aufbauen', /Jeder Ball für sich/],
  ['taeuschung', /Die Absicht verraten/],
  ['doppel_grundlagen', /Doppel wie ein Einzel/],
  ['reaktivkraft_bodenkontakt', /Schwerer, langer Bodenkontakt/],
  ['engen_satz_fuehren', /Risiko im entscheidenden Moment/],
]) {
  const t = await oeffne(baustein, 'de');
  melde(`DE: Fehlerbild an ${baustein}`, probe.test(t));
}

// Gegenprobe: ohne Trainer-Perspektive unsichtbar
const ohne = await oeffne('taeuschung', 'de', false);
melde('ohne Trainer-Perspektive bleibt das Fehlerbild verborgen', !/Die Absicht verraten/.test(ohne));

// Übersetzungen
for (const [code, probe] of [['en', /Giving the intention away/], ['fr', /L.intention trahie/], ['pl', /Zdradzony zamiar/]]) {
  const t = await oeffne('taeuschung', code);
  melde(`${code.toUpperCase()}: Fehlerbild an taeuschung übersetzt`, probe.test(t));
}
const frDoppel = await oeffne('das_umschalten_im_doppel', 'fr');
melde('FR: verschachtelte Guillemets in der Ansage brechen nicht', /Attaque/.test(frDoppel) && /Consigne/.test(frDoppel));
await page.screenshot({ path: 'scratchpad/fb15-taeuschung.png', fullPage: true });

console.log('\nKonsolenfehler:', fehler.length ? fehler : '0');
if (fehler.length) process.exitCode = 1;
await browser.close();
