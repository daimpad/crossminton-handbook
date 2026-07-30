// E2E: Trainings-Metadaten im Plan-Generator — Profil-Zeile je Session, in vier Sprachen.
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const BASIS = 'http://localhost:8145';
const browser = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const fehler = [];
page.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()); });
page.on('pageerror', (e) => fehler.push('pageerror: ' + e.message));
const melde = (s, ok) => { console.log(`${ok ? '✅' : '❌'} ${s}`); if (!ok) process.exitCode = 1; };

async function vorbereiten(sprache) {
  await page.goto(`${BASIS}/`, { waitUntil: 'networkidle' });
  await page.evaluate((spr) => localStorage.setItem('crossminton.zustand.v1', JSON.stringify({
    diagnose: { stufe: 'experte', trainer: false, herkunft: 'CM', ziel: [] },
    einstellungen: { sprache: spr },
  })), sprache);
  await page.goto(`${BASIS}/#/plan`, { waitUntil: 'networkidle' });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
}

await vorbereiten('de');
melde('Plan-Seite lädt mit Konfig-Formular', await page.$('#plan-form') !== null);
await page.click('#plan-form button[type=submit]');
await page.waitForTimeout(500);
const sessions = await page.$$('.plan-session');
melde('Plan erzeugt Sessions (4×2=8)', sessions.length === 8);
const profile = await page.$$('.plan-profil');
melde('jede Session trägt eine Profil-Zeile', profile.length === sessions.length);
const txt = await page.$eval('.plan-uebersicht', (el) => el.textContent);
melde('Profil nennt Umfang, Intensität und Fokus', /Umfang:/.test(txt) && /Intensität:/.test(txt) && /Fokus:/.test(txt));
melde('Profil zeigt Label-Werte, keine rohen IDs', !/kurz|mittel|hoch|kondition|koordination/.test(
  await page.$eval('.plan-profil', (el) => el.textContent)));
await page.screenshot({ path: 'scratchpad/plan-profil-de.png', fullPage: true });

// Lastwechsel sichtbar: die schwerste Einheit steht nicht an erster Stelle
const ersteTitel = await page.$eval('.plan-session h4', (el) => el.textContent.trim());
melde('leichte Einheit eröffnet den Plan (Lastwechsel greift)', /erste Schläge|Erste Schläge/i.test(ersteTitel));

for (const [code, probe] of [['en', /Volume:.*Intensity:.*Focus:/s], ['fr', /Volume\s*:.*Intensité\s*:.*Accent\s*:/s], ['pl', /Objętość:.*Intensywność:.*Akcent:/s]]) {
  await vorbereiten(code);
  await page.click('#plan-form button[type=submit]');
  await page.waitForTimeout(500);
  const t = await page.$eval('.plan-uebersicht', (el) => el.textContent);
  melde(`${code.toUpperCase()}: Profil-Zeile übersetzt`, probe.test(t));
}

console.log('\nKonsolenfehler:', fehler.length ? fehler : '0');
if (fehler.length) process.exitCode = 1;
await browser.close();
