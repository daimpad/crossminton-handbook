// Prüft in der echten App: Baustein mit Grafik lädt, Inline-SVG wird eingetauscht
// (verbessereGrafiken), hell + dunkel + englisch.
import pw from '/opt/node22/lib/node_modules/playwright/index.js';

const browser = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

async function pruefe(theme, sprache, route, erwartetSVG) {
  const ctx = await browser.newContext({ colorScheme: theme === 'dunkel' ? 'dark' : 'light' });
  await ctx.addInitScript(
    ([t, s]) => {
      localStorage.setItem(
        'crossminton.zustand.v1',
        JSON.stringify({ version: 1, einstellungen: { thema: t, sprache: s } }),
      );
    },
    [theme, sprache],
  );
  const page = await ctx.newPage();
  const fehler = [];
  page.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()); });
  await page.goto(`http://localhost:8000/#${route}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  const svgDa = await page.$$eval('#ansicht figure.grafik-platzhalter svg.grafik-svg', (e) => e.length);
  const imgRest = await page.$$eval('#ansicht figure.grafik-platzhalter img', (e) => e.length);
  const aria = await page.$eval('#ansicht figure.grafik-platzhalter svg', (e) => e.getAttribute('aria-label')).catch(() => null);
  console.log(`${theme}/${sprache} ${route}: inline-svg=${svgDa} rest-img=${imgRest} erwartet=${erwartetSVG} aria="${(aria || '').slice(0, 40)}…" fehler=${fehler.length}`);
  if (fehler.length) console.log('   ', fehler.slice(0, 3).join(' | '));
  await ctx.close();
  return svgDa >= erwartetSVG && fehler.length === 0;
}

let ok = true;
// griff → G-001 (1 Grafik); aufschlag → G-005+G-006 (2 Grafiken)
ok = (await pruefe('hell', 'de', '/baustein/griff', 1)) && ok;
ok = (await pruefe('dunkel', 'de', '/baustein/griff', 1)) && ok;
ok = (await pruefe('hell', 'en', '/baustein/griff', 1)) && ok;
ok = (await pruefe('hell', 'de', '/baustein/aufschlag', 2)) && ok;
ok = (await pruefe('dunkel', 'en', '/baustein/smash', 1)) && ok;

await browser.close();
console.log(ok ? '\nALLES OK' : '\nFEHLER');
process.exit(ok ? 0 : 1);
