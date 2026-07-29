import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const b = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const z = { version: 1, einstellungen: { sprache: 'pl', thema: 'hell' }, diagnose: { stufe: 'beginner', trainer: false, herkunft: null, ziel: null } };

// 1) Startseite mobil (Bottom-Bar sichtbar)
let ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
await ctx.addInitScript((zz) => localStorage.setItem('crossminton.zustand.v1', JSON.stringify(zz)), z);
let p = await ctx.newPage();
await p.goto('http://localhost:8000/#/', { waitUntil: 'networkidle' });
await p.waitForTimeout(300);
const nav = await p.evaluate(() => [...document.querySelectorAll('.fussnav a, .fussnav button')].map(e => e.innerText.trim()).filter(Boolean));
console.log('Bottom-Nav (mobil):', JSON.stringify(nav));
await ctx.close();

// 2) Regeln: wo steht die Quelle?
ctx = await b.newContext();
await ctx.addInitScript((zz) => localStorage.setItem('crossminton.zustand.v1', JSON.stringify(zz)), z);
p = await ctx.newPage();
await p.goto('http://localhost:8000/#/regeln', { waitUntil: 'networkidle' });
await p.waitForTimeout(300);
const quelleHits = await p.evaluate(() => {
  const txt = document.body.innerText;
  return { hatZrodlo: txt.includes('Źródło'), hatStanNa: txt.includes('Stan na'),
    quellzeilen: txt.split('\n').filter(l => /Źródło|Stan na|crossminton\.de|ICO|DCV/i.test(l)).slice(0,6) };
});
console.log('Regeln Quelle:', JSON.stringify(quelleHits, null, 1));
await ctx.close();
await b.close();
