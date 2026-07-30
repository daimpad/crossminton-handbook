// SEO Tier 2, Baustein 2 (docs/seo-tier2-konzept.md): erzeugt beim Deploy für
// jede kanonische Route eine statische Snapshot-Datei (Titel/Description/
// Canonical/Social-Vorschau + gerendertes #ansicht-HTML) sowie die vollständige
// sitemap.xml. Läuft AUSSCHLIESSLICH im Deploy-Workflow
// (.github/workflows/deploy-pages.yml) — die Laufzeit-App und der lokale
// Betrieb (python3 -m http.server) bleiben unverändert buildfrei. Playwright
// ist eine reine CI-Werkzeug-Abhängigkeit (per `npm install --no-save` im
// Workflow-Schritt), keine Repo-/npm-Laufzeitabhängigkeit.
//
// Die Routenliste UND das gerenderte HTML kommen aus derselben Quelle wie die
// Laufzeit-App: ein echter Playwright-Tab lädt die Seite einmal (ladeDaten(),
// Boot), leitet daraus die Routenliste ab (dieselben reinen Funktionen aus
// js/daten.js/js/pfade.js) und durchläuft sie per SPA-Navigation (pushState +
// popstate) — genau der Pfad, den ein Klick im Browser auch nimmt. Titel/
// Description/Canonical stammen vom Client selbst (js/seo.js über js/app.js),
// nicht von einer zweiten, parallelen Zuordnung hier.
//
//   node scripts/prerender.mjs [ausgabeverzeichnis]      (Default: _site)

import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { cpSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..');
const ZIEL = join(REPO, process.argv[2] || '_site');
const SITE_URL = 'https://daimpad.github.io/crossminton-handbook';
const PORT = 8123;

function esc(wert) {
  return String(wert ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

// --- 1. Staging-Verzeichnis: vollständige Kopie der Statik (kein Build). ---
// Nur Entwickler-/VCS-Beiwerk bleibt draußen — alles, was heute schon über
// `path: .` mit hochgeladen wird, bleibt es auch über den Umweg. Kopiert wird
// EINTRAG FÜR EINTRAG (nicht die Wurzel als Ganzes) — ZIEL liegt selbst unter
// REPO, und Node verweigert ein rekursives cp() in eine eigene Unterverzeichnis.
const AUSSCHLUSS = new Set(['.git', 'node_modules', relative(REPO, ZIEL).split('/')[0]]);
function kopiere() {
  mkdirSync(ZIEL, { recursive: true });
  for (const eintrag of readdirSync(REPO)) {
    if (AUSSCHLUSS.has(eintrag)) continue;
    cpSync(join(REPO, eintrag), join(ZIEL, eintrag), { recursive: true });
  }
}

// --- 2. Lokaler Server über der Kopie (fetch() der JSON braucht HTTP). ---
// Zugriffs-Log unterdrückt (149 Routen wären reines Rauschen) — Fehlerausgabe
// bleibt gepuffert und wird nur bei einem Fehlschlag ausgegeben (siehe haupt()).
function starteServer() {
  const proc = spawn('python3', ['-m', 'http.server', String(PORT), '--directory', ZIEL], {
    stdio: ['ignore', 'ignore', 'pipe'],
  });
  proc.stderrPuffer = [];
  proc.stderr.on('data', (chunk) => proc.stderrPuffer.push(chunk));
  return proc;
}

async function warteAufServer() {
  for (let versuch = 0; versuch < 50; versuch++) {
    try {
      const antwort = await fetch(`http://localhost:${PORT}/`);
      if (antwort.ok) return;
    } catch {
      // Server noch nicht bereit — kurz warten und erneut versuchen.
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error('Lokaler Server nicht erreichbar (Timeout).');
}

// --- 3. Routenliste + Snapshots: ein einziger Tab, ein einziger ladeDaten()-Lauf. ---
// Prerender-würdig ist, was ohne persönlichen Zustand eine echte, eigenständige
// Seite ergibt (Zwei-Ebenen-Logik: nichts ist gesperrt). Bewusst ausgeschlossen:
// /onboarding, /pfad/individual, /plan, /suche, /profil, /merkliste,
// /ko-turnier — alle zeigen ohne localStorage-Zustand nur ein leeres Formular
// oder eine personalisierte/interaktive Ansicht, keinen indexierbaren Inhalt.
async function ermittleRouten(page) {
  return page.evaluate(async () => {
    const [{ ladeDaten }, pfade] = await Promise.all([import('/js/daten.js'), import('/js/pfade.js')]);
    const daten = await ladeDaten();
    const { themenDomaenen, spielformen, witterungen, untergruende } = pfade;
    const liste = [];
    const fuege = (pfad, prioritaet) => liste.push({ pfad, prioritaet });

    fuege('/', 1.0);

    fuege('/pfad/kompetenz', 0.8);
    for (const stufe of [...daten.koennensOrdnung, 'trainer']) {
      fuege(`/pfad/kompetenz/${encodeURIComponent(stufe)}`, 0.8);
    }

    fuege('/pfad/themen', 0.8);
    for (const eintrag of themenDomaenen(daten)) {
      if (eintrag.anzahl > 0) fuege(`/pfad/themen/${encodeURIComponent(eintrag.domaene)}`, 0.7);
    }

    for (const eintrag of spielformen(daten)) {
      if (eintrag.anzahl > 0) fuege(`/pfad/spielform/${encodeURIComponent(eintrag.spielform)}`, 0.7);
    }

    fuege('/pfad/umgebung', 0.7);
    for (const eintrag of witterungen(daten)) fuege(`/pfad/witterung/${encodeURIComponent(eintrag.witterung)}`, 0.6);
    for (const eintrag of untergruende(daten)) fuege(`/pfad/untergrund/${encodeURIComponent(eintrag.untergrund)}`, 0.6);

    fuege('/training', 0.8);
    for (const einheit of daten.einheiten) fuege(`/training/${encodeURIComponent(einheit.id)}`, 0.6);

    fuege('/regeln', 0.8);
    fuege('/turnier', 0.7);
    fuege('/ausruestung', 0.8);
    fuege('/ueber', 0.5);
    fuege('/mitmachen', 0.5);
    fuege('/impressum', 0.2);
    fuege('/datenschutz', 0.2);

    for (const baustein of daten.bausteine) fuege(`/baustein/${encodeURIComponent(baustein.id)}`, 0.7);

    return liste;
  });
}

async function erfasseSchnappschuss(page, pfad) {
  return page.evaluate((ziel) => {
    window.history.pushState({}, '', ziel);
    window.dispatchEvent(new PopStateEvent('popstate'));
    return {
      titel: document.title,
      beschreibung: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
      inhalt: document.getElementById('ansicht').innerHTML,
    };
  }, pfad);
}

// --- 4. Vorlage → Snapshot-Datei. Die Startseite behält ihren handgepflegten
// Tier-1-Kopf unangetastet (schon die beste verfügbare Kopie); alle anderen
// Routen bekommen Titel/Description/Canonical/Social-Vorschau überschrieben. ---
function baueSnapshot(vorlage, route) {
  let html = vorlage.replace('<main id="ansicht" tabindex="-1"></main>', `<main id="ansicht" tabindex="-1">${route.inhalt}</main>`);
  if (route.pfad === '/') return html;
  const kanonisch = `${SITE_URL}${route.pfad}`;
  const ersetze = (muster, wert) => {
    html = html.replace(muster, `$1${esc(wert)}$2`);
  };
  ersetze(/(<title>)[^<]*(<\/title>)/, route.titel);
  ersetze(/(<meta name="description" content=")[^"]*(">)/, route.beschreibung);
  ersetze(/(<link rel="canonical" href=")[^"]*(">)/, kanonisch);
  ersetze(/(<meta property="og:title" content=")[^"]*(">)/, route.titel);
  ersetze(/(<meta property="og:description" content=")[^"]*(">)/, route.beschreibung);
  ersetze(/(<meta property="og:url" content=")[^"]*(">)/, kanonisch);
  ersetze(/(<meta property="og:image:alt" content=")[^"]*(">)/, route.titel);
  ersetze(/(<meta name="twitter:title" content=")[^"]*(">)/, route.titel);
  ersetze(/(<meta name="twitter:description" content=")[^"]*(">)/, route.beschreibung);
  return html;
}

function zielDatei(pfad) {
  if (pfad === '/') return join(ZIEL, 'index.html');
  return join(ZIEL, pfad.replace(/^\//, ''), 'index.html');
}

// --- 5. sitemap.xml aus derselben Routenliste (löst den Tier-1-Platzhalter ab). ---
function baueSitemap(routen) {
  const eintraege = routen
    .map(
      (r) => `  <url>
    <loc>${esc(SITE_URL + r.pfad)}</loc>
    <changefreq>monthly</changefreq>
    <priority>${r.prioritaet.toFixed(1)}</priority>
  </url>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${eintraege}\n</urlset>\n`;
}

async function haupt() {
  console.log(`[prerender] Staging-Kopie → ${relative(REPO, ZIEL)}`);
  kopiere();

  const server = starteServer();
  const browser = await chromium.launch();
  try {
    try {
      await warteAufServer();
    } catch (fehler) {
      process.stderr.write(Buffer.concat(server.stderrPuffer).toString());
      throw fehler;
    }
    const page = await browser.newPage();
    const fehler = [];
    page.on('pageerror', (e) => fehler.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error') fehler.push(m.text());
    });

    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'load' });
    const routen = await ermittleRouten(page);
    console.log(`[prerender] ${routen.length} Routen ermittelt`);

    const vorlage = readFileSync(join(ZIEL, 'index.html'), 'utf8');
    for (const route of routen) {
      const schnappschuss = await erfasseSchnappschuss(page, route.pfad);
      const vollstaendig = { ...route, ...schnappschuss };
      const datei = zielDatei(route.pfad);
      mkdirSync(dirname(datei), { recursive: true });
      writeFileSync(datei, baueSnapshot(vorlage, vollstaendig));
    }

    if (fehler.length > 0) {
      throw new Error(`Laufzeitfehler während des Prerenderns:\n${fehler.join('\n')}`);
    }

    writeFileSync(join(ZIEL, 'sitemap.xml'), baueSitemap(routen));
    console.log(`[prerender] ${routen.length} Snapshots + sitemap.xml geschrieben`);
  } finally {
    await browser.close();
    server.kill();
  }
}

haupt().catch((fehler) => {
  console.error('[prerender] fehlgeschlagen:', fehler);
  process.exitCode = 1;
});
