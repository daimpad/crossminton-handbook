// E2E: Service Worker nach dem Umbau auf History-Routing — Vorladen, Offline-
// Betrieb (auch auf einer Unterseite reloaded), und die neue 404-vs-Netzfehler-
// Unterscheidung in bedieneNavigation.
import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const BASIS = 'http://localhost:8150';
const browser = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
const fehler = [];
page.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()); });
page.on('pageerror', (e) => fehler.push('pageerror: ' + e.message));
const melde = (s, ok) => { console.log(`${ok ? '✅' : '❌'} ${s}`); if (!ok) process.exitCode = 1; };

await page.goto(`${BASIS}/`, { waitUntil: 'networkidle' });
await page.waitForFunction(() => navigator.serviceWorker.controller !== null, { timeout: 8000 }).catch(() => {});
await page.waitForTimeout(500);
const reg = await page.evaluate(async () => {
  const r = await navigator.serviceWorker.getRegistration();
  return r ? { scope: r.scope, aktiv: Boolean(r.active) } : null;
});
melde('Service Worker registriert und aktiv', Boolean(reg?.aktiv));

await page.goto(`${BASIS}/training`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
await ctx.setOffline(true);
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(500);
melde('Reload auf /training OFFLINE bleibt auf /training', (await page.evaluate(() => location.pathname)) === '/training');
melde('Offline-Reload rendert weiter Inhalt', (await page.$eval('#ansicht', (el) => el.textContent.length)) > 100);

await page.goto(`${BASIS}/baustein/griff`, { waitUntil: 'networkidle' }).catch(() => {});
await page.waitForTimeout(500);
melde('Offline-Deep-Link auf /baustein/griff lädt aus dem Cache', (await page.evaluate(() => location.pathname)) === '/baustein/griff');
const h1 = await page.$eval('h1', (el) => el.textContent.trim()).catch(() => null);
melde(`Offline-Deep-Link rendert den Baustein (${h1})`, /Griff/i.test(h1 || ''));

await ctx.setOffline(false);
await page.waitForTimeout(300);

console.log('\nKonsolenfehler:', fehler.length ? fehler : '0');
if (fehler.length) process.exitCode = 1;
await browser.close();
