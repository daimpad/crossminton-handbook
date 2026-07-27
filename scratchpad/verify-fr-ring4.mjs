import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const b = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
async function txt(id) {
  const ctx = await b.newContext();
  await ctx.addInitScript(() => localStorage.setItem('crossminton.zustand.v1', JSON.stringify({ version: 1, einstellungen: { sprache: 'fr', thema: 'hell' } })));
  const p = await ctx.newPage();
  const fehler = [];
  p.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()); });
  await p.goto('http://localhost:8000/#/baustein/' + id + '?kontext=kompetenz', { waitUntil: 'networkidle' });
  await p.waitForTimeout(400);
  const t = await p.evaluate(() => document.querySelector('article.baustein').innerText);
  await ctx.close();
  return { t, fehler };
}
const checks = [
  ['der_speeder', ["Le speeder est la balle du Crossminton", "Le Fun Speeder rouge est le plus léger", "un anneau de vent ou un speeder plus lourd"]],
  ['wer_nimmt_den_ball', ["Le piège le plus fréquent dans le double", "« À moi ! »", "À moi ou à toi", "Attribuer clairement et tôt les balles"]],
];
let ok = true, fehlerTotal = 0;
for (const [id, muss] of checks) {
  const r = await txt(id);
  fehlerTotal += r.fehler.length;
  const treffer = muss.filter((m) => r.t.includes(m));
  const gut = treffer.length === muss.length;
  console.log(`${id}: ${treffer.length}/${muss.length} ${gut ? 'OK' : 'FEHLT: ' + muss.filter((m) => !r.t.includes(m)).join(' | ')}`);
  ok = ok && gut;
}
console.log('Konsolenfehler:', fehlerTotal);
await b.close();
console.log(ok && fehlerTotal === 0 ? '\nALLES OK' : '\nFEHLER');
process.exit(ok && fehlerTotal === 0 ? 0 : 1);
