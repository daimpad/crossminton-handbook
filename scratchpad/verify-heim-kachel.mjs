// Verifiziert die neue KO-Turnier-Kachel auf der Startseite: volle Breite,
// Link funktioniert, Mobil + Desktop, Hell + Dunkel. Screenshots als Beleg.
import pw from '/opt/node22/lib/node_modules/playwright/index.js';

const BASIS = 'http://localhost:8142';
const browser = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const fehler = [];
function melde(schritt, ok) { console.log(`${ok ? '✅' : '❌'} ${schritt}`); if (!ok) process.exitCode = 1; }

// --- Mobil, hell ---
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 1400 } });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') fehler.push('mobil: ' + m.text()); });
  await page.goto(`${BASIS}/#/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  const kachel = await page.$('a[href="#/ko-turnier"].pfad-kachel');
  melde('KO-Turnier-Kachel auf der Startseite vorhanden', kachel !== null);
  const text = await page.$eval('a[href="#/ko-turnier"].pfad-kachel', (el) => el.textContent);
  melde('Kachel zeigt Titel + Kachel-Text', text.includes('KO-Turnier') && /Werkzeug/.test(text));
  const letzteKachel = await page.$eval('.pfad-gitter', (el) => el.lastElementChild.getAttribute('href'));
  melde('KO-Turnier-Kachel steht als letzte im Raster', letzteKachel === '#/ko-turnier');
  const breite = await page.$eval('a[href="#/ko-turnier"].pfad-kachel', (el) => el.getBoundingClientRect().width);
  const gitterBreite = await page.$eval('.pfad-gitter', (el) => el.getBoundingClientRect().width);
  melde('Kachel ist volle Rasterbreite (mobil ohnehin 1-spaltig)', Math.abs(breite - gitterBreite) < 2);
  await page.screenshot({ path: 'scratchpad/heim-1-mobil.png', fullPage: true });
  await kachel.click();
  await page.waitForTimeout(300);
  melde('Klick führt zu #/ko-turnier', page.url().endsWith('#/ko-turnier'));
  await ctx.close();
}

// --- Desktop, hell: Kachel muss über BEIDE Spalten gehen (doppelt so breit) ---
{
  const ctx = await browser.newContext({ viewport: { width: 900, height: 1200 } });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') fehler.push('desktop: ' + m.text()); });
  await page.goto(`${BASIS}/#/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  const breiteKachel = await page.$eval('a[href="#/ko-turnier"].pfad-kachel', (el) => el.getBoundingClientRect().width);
  const breiteNormaleKachel = await page.$eval('a[href="#/profil"].pfad-kachel', (el) => el.getBoundingClientRect().width);
  console.log(`   Desktop-Breiten: KO-Turnier-Kachel ${breiteKachel.toFixed(0)}px, normale Kachel (Profil) ${breiteNormaleKachel.toFixed(0)}px`);
  melde('Desktop: KO-Turnier-Kachel ist ~doppelt so breit wie eine normale Kachel', breiteKachel > breiteNormaleKachel * 1.8);
  await page.screenshot({ path: 'scratchpad/heim-2-desktop.png', fullPage: true });
  await ctx.close();
}

// --- Mobil, dunkel ---
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 1400 }, colorScheme: 'dark' });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') fehler.push('dunkel: ' + m.text()); });
  await page.goto(`${BASIS}/#/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'scratchpad/heim-3-dunkel.png', fullPage: true });
  await ctx.close();
}

console.log('\nKonsolenfehler:', fehler.length ? fehler : '0');
if (fehler.length) process.exitCode = 1;
await browser.close();
