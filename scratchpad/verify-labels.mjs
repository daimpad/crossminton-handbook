// Prüft: keine Herkunfts-Kürzel-Chips mehr am Baustein, keine „Transfer-Herkunft"-
// Zeile in der Einordnung, und „Empfohlen vorher" erscheint NACH der Einordnung.
import pw from '/opt/node22/lib/node_modules/playwright/index.js';

const browser = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext();
// frischer Zustand (nichts absolviert) → Voraussetzungs-Banner sichtbar
await ctx.addInitScript(() =>
  localStorage.setItem('crossminton.zustand.v1', JSON.stringify({ version: 1, einstellungen: { sprache: 'de', thema: 'hell', transferKuerzelSichtbar: true } })),
);
const page = await ctx.newPage();
const fehler = [];
page.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()); });
await page.goto('http://localhost:8000/#/baustein/vorhand_drive?kontext=kompetenz', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);

const r = await page.evaluate(() => {
  const art = document.querySelector('article.baustein');
  const chips = [...art.querySelectorAll('.chip')].map((c) => c.textContent.trim());
  const kuerzelChips = chips.filter((t) => /^(CM|BAD|TEN|SQ|AT|SP)$/.test(t));
  const einordnungText = art.querySelector('.einordnung')?.textContent || '';
  const hatTransferZeile = /Transfer-Herkunft/.test(einordnungText);
  const einordnung = art.querySelector('.einordnung');
  const banner = art.querySelector('.banner-hinweis');
  let bannerNachEinordnung = null;
  if (einordnung && banner) {
    // DOCUMENT_POSITION_FOLLOWING (4) → banner steht NACH einordnung
    bannerNachEinordnung = !!(einordnung.compareDocumentPosition(banner) & Node.DOCUMENT_POSITION_FOLLOWING);
  }
  return { chips, kuerzelChips, hatTransferZeile, bannerDa: !!banner, bannerNachEinordnung, bannerText: banner?.textContent.trim().slice(0, 40) };
});

console.log('Chips am Baustein:', JSON.stringify(r.chips));
console.log('Herkunfts-Kürzel-Chips (soll leer):', JSON.stringify(r.kuerzelChips));
console.log('Einordnung hat „Transfer-Herkunft"-Zeile (soll false):', r.hatTransferZeile);
console.log('Banner „Empfohlen vorher" vorhanden:', r.bannerDa, '| Text:', r.bannerText);
console.log('Banner NACH Einordnung (soll true):', r.bannerNachEinordnung);
console.log('Konsolenfehler:', fehler.length, fehler.slice(0, 2).join(' | '));

const ok = r.kuerzelChips.length === 0 && !r.hatTransferZeile && r.bannerDa && r.bannerNachEinordnung === true && fehler.length === 0;
await browser.close();
console.log(ok ? '\nALLES OK' : '\nFEHLER');
process.exit(ok ? 0 : 1);
