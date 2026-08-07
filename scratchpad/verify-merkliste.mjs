// E2E: Floating-Aktionen (Teilen + Merken) auf dem Baustein, Toast, Merk-Zähler,
// Merkliste-Ansicht mit Entfernen. Screenshots als Beleg.
import pw from '/opt/node22/lib/node_modules/playwright/index.js';

const BASIS = 'http://localhost:8139';
const browser = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 });
await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASIS });
const page = await ctx.newPage();
const fehler = [];
page.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()); });
page.on('pageerror', (e) => fehler.push('pageerror: ' + e.message));

function melde(schritt, ok) { console.log(`${ok ? '✅' : '❌'} ${schritt}`); if (!ok) process.exitCode = 1; }

// 1) Baustein öffnen — FAB-Leiste vorhanden?
await page.goto(`${BASIS}/#/baustein/griff?kontext=kompetenz`, { waitUntil: 'networkidle' });
await page.waitForTimeout(400);
melde('FAB-Leiste mit Teilen + Merken sichtbar', await page.$$eval('.fab-leiste .fab', (n) => n.length) === 2);
await page.screenshot({ path: 'scratchpad/merk-1-baustein.png' });

// 2) Merken klicken → aktiv + Toast
await page.click('[data-merken]');
await page.waitForTimeout(300);
const gemerkt = await page.$eval('[data-merken]', (b) => b.classList.contains('fab-aktiv') && b.getAttribute('aria-pressed') === 'true');
melde('Merken-Knopf wird aktiv (fab-aktiv, aria-pressed)', gemerkt);
const toastAn = await page.$eval('#toast', (t) => t.classList.contains('toast-sichtbar') && t.textContent.trim().length > 0);
melde('Toast erscheint mit Text', toastAn);
await page.screenshot({ path: 'scratchpad/merk-2-gemerkt.png' });

// 3) Teilen klicken → in Zwischenablage (kein navigator.share in headless) + Toast „Link kopiert"
await page.click('[data-teilen]');
await page.waitForTimeout(300);
const toastText = await page.$eval('#toast', (t) => t.textContent.trim());
const clip = await page.evaluate(() => navigator.clipboard.readText().catch(() => ''));
melde('Teilen kopiert die Baustein-URL in die Zwischenablage', clip.includes('#/baustein/griff'));
console.log('   Toast nach Teilen:', JSON.stringify(toastText), '| Clipboard:', JSON.stringify(clip));

// 4) Menü öffnen → Merk-Zähler (Badge) zeigt 1
await page.click('#mehr-knopf');
await page.waitForTimeout(300);
const badge = await page.$eval('[data-merk-anzahl]', (b) => ({ text: b.textContent.trim(), hidden: b.hidden }));
melde('Menü-Badge zeigt Anzahl 1', badge.text === '1' && badge.hidden === false);
await page.screenshot({ path: 'scratchpad/merk-3-menue.png' });

// 5) Über den Menüpunkt zur Merkliste (schließt das Menü mit) → griff ist gelistet
await page.click('a[data-nav="merkliste"]');
await page.waitForTimeout(400);
await page.waitForTimeout(400);
const inListe = await page.$$eval('.merk-station .station-titel', (n) => n.map((x) => x.textContent).join(' | '));
melde('Merkliste listet den gemerkten Baustein', /Griff|Universalgriff|griff/i.test(inListe));
await page.screenshot({ path: 'scratchpad/merk-4-liste.png' });

// 6) Entfernen → Leerzustand
await page.click('[data-entfernen]');
await page.waitForTimeout(400);
const leer = await page.$('.leer-zustand') != null;
melde('Entfernen leert die Liste (Leerzustand mit Ausweg)', leer);

// 7) Persistenz: neu laden → Merkliste bleibt leer (entfernt), erneut merken hält über Reload
await page.goto(`${BASIS}/#/baustein/aufschlag?kontext=kompetenz`, { waitUntil: 'networkidle' });
await page.waitForTimeout(300);
await page.click('[data-merken]');
await page.waitForTimeout(200);
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(400);
const nochAktiv = await page.$eval('[data-merken]', (b) => b.classList.contains('fab-aktiv'));
melde('Merken übersteht einen Reload (localStorage)', nochAktiv);

console.log('\nKonsolenfehler:', fehler.length ? fehler : '0');
if (fehler.length) process.exitCode = 1;
await browser.close();
