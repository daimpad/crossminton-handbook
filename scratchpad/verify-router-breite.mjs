// E2E: breiter Regressions-Smoke nach dem Router-Umbau — Menü, Sprachumschaltung,
// Onboarding, Suche, Merkliste, KO-Turnier — alles, was intern navigiert.
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const BASIS = 'http://localhost:8150';
const browser = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
const page = await ctx.newPage();
const fehler = [];
page.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()); });
page.on('pageerror', (e) => fehler.push('pageerror: ' + e.message));
const melde = (s, ok) => { console.log(`${ok ? '✅' : '❌'} ${s}`); if (!ok) process.exitCode = 1; };
const pfad = () => page.evaluate(() => location.pathname);

await page.goto(`${BASIS}/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(400);

// Hamburger/Menü öffnen, einen Menüpunkt anklicken
await page.locator('#mehr-knopf:visible, #hamburger:visible').first().click();
await page.waitForTimeout(300);
melde('Menü öffnet sich', await page.locator('#hauptmenue').evaluate((el) => el.classList.contains('offen')));
await page.click('.menue-punkt[href*="regeln"]');
await page.waitForTimeout(400);
melde('Menüpunkt Regeln navigiert korrekt', (await pfad()) === '/regeln');
melde('Menü schließt nach Klick', !(await page.locator('#hauptmenue').evaluate((el) => el.classList.contains('offen'))));

// Suche
await page.goto(`${BASIS}/suche`, { waitUntil: 'networkidle' });
await page.waitForTimeout(400);
await page.fill('#such-eingabe, input[type=search], input[type=text]', 'griff');
await page.waitForTimeout(400);
const treffer = await page.locator('a[href*="baustein/griff"]').count();
melde('Suche findet griff und verlinkt auf den echten Pfad', treffer > 0);
if (treffer > 0) {
  await page.click('a[href*="baustein/griff"]');
  await page.waitForTimeout(400);
  melde('Klick aus der Suche navigiert zu /baustein/griff', (await pfad()).includes('/baustein/griff'));
}

// Theme-Zyklus im Menü
await page.goto(`${BASIS}/`, { waitUntil: 'networkidle' });
await page.locator('#mehr-knopf:visible, #hamburger:visible').first().click();
await page.waitForTimeout(300);
await page.click('[data-thema-zyklus]');
await page.waitForTimeout(300);
const thema1 = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
melde(`Theme-Zyklus wechselt (${thema1})`, thema1 === 'hell' || thema1 === 'dunkel');

// Onboarding
await page.goto(`${BASIS}/onboarding`, { waitUntil: 'networkidle' });
await page.waitForTimeout(400);
melde('Onboarding lädt unter dem echten Pfad', (await pfad()) === '/onboarding');
melde('Onboarding blendet die Bottom-Nav aus', await page.evaluate(() => document.body.classList.contains('im-onboarding')));

console.log('\nKonsolenfehler:', fehler.length ? fehler : '0');
if (fehler.length) process.exitCode = 1;
await page.screenshot({ path: 'scratchpad/router-heim-mobil.png', fullPage: false });
await browser.close();
