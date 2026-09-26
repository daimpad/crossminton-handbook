import pw from '/opt/node22/lib/node_modules/playwright/index.js';
const b = await pw.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const SHOT = '/home/user/crossminton-handbook/scratchpad';
let ok = true;
const pruef = (name, cond) => { console.log(`${cond ? 'OK  ' : 'FEHL'} ${name}`); ok = ok && cond; };

async function seite(hash, { seed = null, breite = 1180 } = {}) {
  const ctx = await b.newContext({ viewport: { width: breite, height: 1000 } });
  if (seed) await ctx.addInitScript((z) => localStorage.setItem('crossminton.zustand.v1', JSON.stringify(z)), seed);
  const p = await ctx.newPage();
  const fehler = [];
  p.on('console', (m) => { if (m.type() === 'error') fehler.push(m.text()); });
  await p.goto('http://localhost:8000/' + hash, { waitUntil: 'networkidle' });
  await p.waitForTimeout(450);
  return { ctx, p, fehler };
}

// 1) Startseite (frischer Zustand → Default hell, Kürzel aus). Hero-Chips oben rechts.
{
  const { ctx, p, fehler } = await seite('#/');
  const thema = await p.evaluate(() => document.documentElement.dataset.theme);
  const txt = await p.evaluate(() => document.getElementById('ansicht').innerText);
  const chips = await p.evaluate(() => Array.from(document.querySelectorAll('.marke-hero-chips .chip')).map((c) => c.textContent));
  const chipsRechts = await p.evaluate(() => {
    const box = document.querySelector('.marke-hero-chips');
    const hero = document.querySelector('.marke-hero');
    const h1 = document.querySelector('.marke-hero-text h1');
    if (!box || !hero || !h1) return false;
    const cr = box.getBoundingClientRect(), hr = hero.getBoundingClientRect(), tr = h1.getBoundingClientRect();
    const rechtsbuendig = cr.right <= hr.right + 2 && cr.right > hr.left + hr.width * 0.6; // rechte Kante rechts
    const ueberTitel = cr.bottom <= tr.top + 2; // Chips über dem Titel → keine Überlappung
    return rechtsbuendig && ueberTitel;
  });
  pruef('Startseite: Theme-Default hell', thema === 'hell');
  pruef('Startseite: KEIN Willkommen-Wähler ("Bevor du loslegst")', !/Bevor du loslegst|Wähle deinen Einstieg|Direkt ins Handbuch/.test(txt));
  pruef('Startseite: Kacheln vorhanden (Training/Regeln/Profil)', /Training/.test(txt) && /Regeln/.test(txt) && /Profil/.test(txt));
  pruef('Startseite: Hero-Chips = 5 Schlagworte', chips.length === 5 && chips.join('·') === 'Technik·Training·Theorie·Regeln·Ausrüstung');
  pruef('Startseite: Chips oben rechts im Hero (Desktop)', chipsRechts);
  pruef('Startseite: keine Konsolenfehler', fehler.length === 0);
  await p.screenshot({ path: `${SHOT}/v-start.png`, fullPage: false });
  await ctx.close();
}

// 2) Regeln: Quelle-Box weiß + Body-Typo.
{
  const { ctx, p, fehler } = await seite('#/regeln');
  const q = await p.evaluate(() => {
    const box = document.querySelector('.regeln-quelle-box');
    const txt = document.querySelector('.regeln-quelle-text');
    if (!box || !txt) return null;
    return { bg: getComputedStyle(box).backgroundColor, fs: getComputedStyle(txt).fontSize };
  });
  pruef('Regeln: Quelle-Box vorhanden', q !== null);
  pruef('Regeln: Quelle-Hintergrund weiß (rgb 255)', q && /rgb\(255, 255, 255\)/.test(q.bg));
  pruef('Regeln: Quelle-Text Body-Größe (16px)', q && q.fs === '16px');
  pruef('Regeln: keine Konsolenfehler', fehler.length === 0);
  await p.screenshot({ path: `${SHOT}/v-regeln.png`, fullPage: false });
  await ctx.close();
}

// 3) Baustein-Fußnav: "Zur Liste" als rechter CTA (mit Vor + Nächster).
{
  const { ctx, p, fehler } = await seite('#/baustein/ueberkopf_clear?kontext=kompetenz');
  const nav = await p.evaluate(() => {
    const n = document.querySelector('.baustein-fussnav');
    const zl = document.querySelector('.baustein-zur-liste');
    if (!n || !zl) return null;
    const nr = n.getBoundingClientRect(), zr = zl.getBoundingClientRect();
    const leise = zl.classList.contains('knopf-leise');
    return { rechtsHaelfte: zr.left > nr.left + nr.width / 2, leise, text: zl.textContent.trim() };
  });
  pruef('Baustein: "Zur Liste"-Knopf vorhanden', nav !== null);
  pruef('Baustein: "Zur Liste" in der rechten Hälfte', nav && nav.rechtsHaelfte);
  pruef('Baustein: "Zur Liste" ist CTA (nicht leise)', nav && !nav.leise);
  pruef('Baustein: keine Konsolenfehler', fehler.length === 0);
  await p.screenshot({ path: `${SHOT}/v-baustein.png`, fullPage: false });
  await ctx.close();
}

// 4) Über-Reiter: Credits/Lizenz mit Links.
{
  const { ctx, p, fehler } = await seite('#/ueber');
  const info = await p.evaluate(() => {
    const wurzel = document.getElementById('ansicht');
    const txt = wurzel.innerText;
    const hrefs = Array.from(wurzel.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    return { txt, hrefs };
  });
  pruef('Über: "wissenschaftlich fundiert" entfernt', !/wissenschaftlich fundiert/.test(info.txt));
  pruef('Über: ICO/DCV-Eigentum-Zeile gelöscht', !/Eigentum der ICO\/DCV/.test(info.txt));
  pruef('Über: CC BY ausgeschrieben', /Creative Commons Namensnennung 4\.0 International \(CC BY 4\.0\)/.test(info.txt));
  pruef('Über: Damian Paderta → paderta.com', info.hrefs.some((h) => h && h.includes('paderta.com')));
  pruef('Über: nozilla → nozilla.de', info.hrefs.some((h) => h && h.includes('nozilla.de')) && /nozilla \| bits & bytes/.test(info.txt));
  pruef('Über: Lizenz-Links (creativecommons + opensource)', info.hrefs.some((h) => h && h.includes('creativecommons.org')) && info.hrefs.some((h) => h && h.includes('opensource.org')));
  pruef('Über: keine Konsolenfehler', fehler.length === 0);
  await p.screenshot({ path: `${SHOT}/v-ueber.png`, fullPage: false });
  await ctx.close();
}

// 5) Pfad-Liste: kein "Außerhalb"-Hinweis; Transfer-Kürzel (Delta-Chip) standardmäßig aus (herkunft BAD).
{
  const seed = { version: 1, einstellungen: { sprache: 'de', thema: 'hell' }, diagnose: { stufe: 'fortgeschritten', herkunft: 'BAD', trainer: false, ziel: null } };
  const { ctx, p, fehler } = await seite('#/pfad/kompetenz/fortgeschritten', { seed });
  const r = await p.evaluate(() => ({
    hinweise: document.querySelectorAll('.station-hinweis').length,
    ausserhalbText: /Außerhalb deiner Zielauswahl/.test(document.getElementById('ansicht').innerText),
    deltaChips: document.querySelectorAll('.stationsliste .chip-akzent').length,
  }));
  pruef('Pfad: kein .station-hinweis mehr', r.hinweise === 0);
  pruef('Pfad: kein "Außerhalb deiner Zielauswahl"-Text', !r.ausserhalbText);
  pruef('Pfad: Transfer-Kürzel (Delta-Chip) standardmäßig aus (herkunft BAD)', r.deltaChips === 0);
  pruef('Pfad: keine Konsolenfehler', fehler.length === 0);
  await ctx.close();
}

await b.close();
console.log(ok ? '\nALLES OK' : '\nFEHLER');
process.exit(ok ? 0 : 1);
