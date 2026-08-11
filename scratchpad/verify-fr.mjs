// Prüft die französische UI: Startseite + ein Baustein rendern französische Labels,
// Inhalt fällt (erwartet) auf Deutsch zurück, keine Konsolenfehler.
import pw from '/opt/node22/lib/node_modules/playwright/index.js';

const browser = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext();
await ctx.addInitScript(() =>
  localStorage.setItem('crossminton.zustand.v1', JSON.stringify({ version: 1, einstellungen: { sprache: 'fr', thema: 'hell' } })),
);
const page = await ctx.newPage();
const fehler = [];
page.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()); });

await page.goto('http://localhost:8000/#/', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
const heim = await page.evaluate(() => document.body.innerText);
const heimOk = ["S'entraîner", 'Découvrir les chapitres', "Manuel d'apprentissage"].filter((t) => heim.includes(t));

await page.goto('http://localhost:8000/#/baustein/griff?kontext=kompetenz', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
const bs = await page.evaluate(() => {
  const art = document.querySelector('article.baustein');
  return {
    h1: art.querySelector('h1')?.textContent.trim(),
    hatExplication: /Explication/.test(art.textContent),
    hatClassification: /Classification/.test(art.textContent),
  };
});

console.log('Startseite franz. Treffer:', JSON.stringify(heimOk));
console.log('Baustein H1 (soll franz.):', bs.h1);
console.log('Abschnitt „Explication" da:', bs.hatExplication, '| „Classification" da:', bs.hatClassification);
console.log('Konsolenfehler:', fehler.length, fehler.slice(0, 2).join(' | '));

const ok = heimOk.length >= 2 && bs.h1 === 'La prise universelle' && bs.hatExplication && fehler.length === 0;
await browser.close();
console.log(ok ? '\nALLES OK' : '\nFEHLER');
process.exit(ok ? 0 : 1);
