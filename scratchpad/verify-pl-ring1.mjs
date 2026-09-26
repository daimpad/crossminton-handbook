import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const b = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
let ok = true, fehler = 0;
const z = { version: 1, einstellungen: { sprache: 'pl', thema: 'hell' }, diagnose: { stufe: 'beginner', trainer: false, herkunft: null, ziel: null } };
async function txt(route) {
  const ctx = await b.newContext();
  await ctx.addInitScript((zz) => localStorage.setItem('crossminton.zustand.v1', JSON.stringify(zz)), z);
  const p = await ctx.newPage();
  p.on('console', (m) => { if (m.type() === 'error') { fehler++; console.log('  [err]', m.text().slice(0,100)); } });
  await p.goto('http://localhost:8000/#/' + route, { waitUntil: 'networkidle' });
  await p.waitForTimeout(350);
  const t = await p.evaluate(() => document.body.innerText);
  await ctx.close(); return t;
}
function pruef(name, t, muss) {
  const miss = muss.filter((m) => !t.includes(m));
  console.log(`${miss.length ? 'FEHLER' : 'OK '} ${name}${miss.length ? ' — fehlt: ' + miss.join(' | ') : ''}`);
  ok = ok && miss.length === 0;
}
pruef('Über', await txt('ueber'), ['narzędzie do nauki crossmintona', 'Podziękowania i źródła', 'Licencja i twórcy', 'Uznanie autorstwa']);
pruef('Mitmachen', await txt('mitmachen'), ['otwarty projekt', 'Pomóż w tłumaczeniu', 'pull request', 'Uruchom tryb opinii']);
pruef('Impressum', await txt('impressum'), ['Odpowiedzialny za treść', '§ 5 TMG', 'lipiec 2026']);
pruef('Datenschutz', await txt('datenschutz'), ['w całości w twojej przeglądarce', 'RODO', 'GitHub, Inc.']);
console.log('\nKonsolenfehler:', fehler);
await b.close();
console.log(ok && fehler === 0 ? 'ALLES OK' : 'FEHLER'); process.exit(ok && fehler === 0 ? 0 : 1);
