// SEO Tier 2, Baustein 2 (docs/seo-tier2-konzept.md): erzeugt beim Deploy für
// jede kanonische Route eine statische Snapshot-Datei (Titel/Description/
// Canonical/Social-Vorschau + gerendertes #ansicht-HTML). Läuft AUSSCHLIESSLICH
// im Deploy-Workflow
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
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// Die Routenliste teilt sich dieses Skript mit scripts/sitemap.mjs — eine
// Ableitung, zwei Verbraucher (s. scripts/routen.mjs). Die sitemap.xml wird
// hier NICHT erzeugt: die eingecheckte ist die maßgebliche (die Produktion hat
// keinen Build-Schritt), kopiere() trägt sie unverändert ins Staging.
import { loeseRahmenLinks, mitSprache, SITE_URL } from './routen.mjs';
import { QUELLSPRACHE, SPRACHEN } from '../js/i18n.js';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..');
const ZIEL = join(REPO, process.argv[2] || '_site');
const PORT = 8123;

// Montagepunkt der Produktion, aus SITE_URL abgeleitet (kein weiterer
// deploy-abhängiger Wert). '/crossminton-handbook' auf Pages, '' bei Custom
// Domain. WARUM das hier gebraucht wird: die Ansichten schreiben ihre Links als
// '#/…', und `normalisiereLinks()` zieht sie beim Rendern auf ECHTE Pfade —
// also auf `WURZEL + rest`. WURZEL kommt aus dem <base>, das sich aus dem Pfad
// ergibt, unter dem das Dokument ausgeliefert wird. Prerendern wir unter '/',
// werden Links als '/pfad/themen' eingebacken; unter '/crossminton-handbook/'
// ausgeliefert zeigen die dann NEBEN die App und liefern einen echten 404
// (genau dieser Fehler war live). Darum wird zum Prerendern unter dem
// Produktions-Präfix ausgeliefert — s. praefixSymlink().
const PRAEFIX = new URL(SITE_URL).pathname.replace(/\/$/, '');

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

// Damit der Prerender-Tab unter dem PRODUKTIONS-Präfix lädt (und nicht unter '/'),
// bekommt das Staging-Verzeichnis einen Symlink auf sich selbst, benannt wie der
// Präfix: eine Anfrage auf '/crossminton-handbook/pfad/themen' landet damit auf
// '_site/pfad/themen'. So sieht das <base>-Skript denselben Montagepunkt wie im
// Deploy, und `normalisiereLinks()` backt Links mit Präfix ein. Der Symlink wird
// nach dem Erfassen wieder entfernt — er darf nie ins Artefakt gelangen.
function praefixSymlink(anlegen) {
  if (!PRAEFIX) return;
  const pfad = join(ZIEL, PRAEFIX.replace(/^\//, ''));
  rmSync(pfad, { force: true, recursive: false });
  if (anlegen) symlinkSync('.', pfad, 'dir');
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
// Welche Routen indexierbar sind (und welche bewusst nicht), steht in
// scripts/routen.mjs — dieselbe Ableitung nutzt scripts/sitemap.mjs für die
// eingecheckte sitemap.xml, damit beide nicht auseinanderlaufen.
async function ermittleRouten(page) {
  return page.evaluate(async () => {
    // Über document.baseURI auflösen, nicht wurzel-absolut ('/js/daten.js') —
    // der Tab läuft unter dem Produktions-Präfix, nicht unter '/'.
    const modul = (name) => import(new URL(name, document.baseURI).href);
    const [{ ladeDaten }, { sammleRoutenAlleSprachen }] = await Promise.all([
      modul('js/daten.js'),
      modul('scripts/routen.mjs'),
    ]);
    return sammleRoutenAlleSprachen(await ladeDaten());
  });
}

async function erfasseSchnappschuss(page, pfad) {
  // Der Tab läuft unter dem Produktions-Präfix — die Route muss es mittragen,
  // sonst deutet parsePfad() sie falsch.
  const ziel = PRAEFIX + pfad;
  await page.evaluate((z) => {
    window.history.pushState({}, '', z);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, ziel);
  // Auf das Fertig-Signal warten. Überquert die Navigation eine Sprachgrenze,
  // lädt rendern() erst die Labels nach und zeichnet DANACH — ohne das Warten
  // erfasste man die vorige Sprache unter der neuen Adresse.
  await page.waitForFunction((z) => document.documentElement.dataset.route === z, ziel, { timeout: 15000 });
  // Zweites Warten: die Grafiken reicht verbessereGrafiken() NACH dem Zeichnen
  // nach (jedes SVG wird einzeln geholt), dataset.route steht schon davor. Ohne
  // das erfasste der Schnappschuss einen zufälligen Zwischenstand — auf
  // /baustein/aufschlag lag die erste Grafik als Inline-SVG vor, die zweite noch
  // als PNG. Kurzer Deckel und verschlucktes Zeitüberschreiten: scheitert ein
  // Abruf, bleibt das PNG stehen (gültiger Zustand), der Deploy läuft weiter.
  await page
    .waitForFunction(
      () => [...document.querySelectorAll('#ansicht figure.grafik-platzhalter')]
        .every((figur) => figur.querySelector('svg.grafik-svg')),
      null,
      { timeout: 5000 },
    )
    .catch(() => {});
  return page.evaluate(() => ({
    titel: document.title,
    beschreibung: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
    inhalt: document.getElementById('ansicht').innerHTML,
    // Strukturierte Daten: vom Client erzeugt (js/seo.js), hier nur eingesammelt
    // — nicht in Node zweitgerechnet. Die URLs darin tragen noch die
    // localhost-Herkunft; die zieht schemaFuerAusgabe() gerade.
    schema: document.head.querySelector('script[type="application/ld+json"][data-seite]')?.textContent || '',
    sprachAlternativen: [...document.querySelectorAll('link[rel="alternate"][hreflang]')].map((l) => ({
      hreflang: l.getAttribute('hreflang'),
      href: l.getAttribute('href'),
    })),
    lang: document.documentElement.lang,
  }));
}

// Selbstprüfung gegen genau den Fehler, der Baustein 2 zunächst live brach:
// ein <a>-Link im Schnappschuss, der wurzel-absolut NEBEN den Montagepunkt zeigt
// (z. B. '/pfad/themen' statt '/crossminton-handbook/pfad/themen'), liefert
// ausgeliefert einen echten 404. Lieber den Deploy abbrechen als das ausrollen.
function pruefeLinks(html, pfad) {
  if (!PRAEFIX) return;
  const daneben = new Set();
  for (const treffer of html.matchAll(/<a\s[^>]*?href="(\/[^"/][^"]*|\/)"/g)) {
    const ziel = treffer[1];
    if (ziel === PRAEFIX || ziel.startsWith(`${PRAEFIX}/`)) continue;
    daneben.add(ziel);
  }
  if (daneben.size > 0) {
    throw new Error(
      `Schnappschuss ${pfad} trägt ${daneben.size} Link(s) außerhalb des Montagepunkts ` +
        `${PRAEFIX}/ — ausgeliefert wären das 404er: ${[...daneben].slice(0, 5).join(', ')}`,
    );
  }
}

// --- 4. Vorlage → Snapshot-Datei. Die Startseite behält ihren handgepflegten
// Tier-1-Kopf unangetastet (schon die beste verfügbare Kopie); alle anderen
// Routen bekommen Titel/Description/Canonical/Social-Vorschau überschrieben. ---
// hreflang-Verweise für eine Route. Bewusst HIER gebaut und nicht aus dem Tab
// übernommen: die Angaben des Clients tragen dessen Herkunft (localhost:8123),
// ausgeliefert wird aber SITE_URL. Genutzt wird dieselbe mitSprache()-Regel wie
// in der Sitemap, damit Adressen aus beiden Quellen deckungsgleich sind.
function alternativenHtml(basisPfad) {
  return [...SPRACHEN.map((s) => [s, mitSprache(basisPfad, s)]), ['x-default', basisPfad]]
    .map(([h, p]) => `  <link rel="alternate" hreflang="${esc(h)}" href="${esc(SITE_URL + p)}">`)
    .join('\n');
}

// Die vom Client erzeugten JSON-LD-URLs zeigen auf den Prerender-Server;
// ausgeliefert wird SITE_URL. Reiner Herkunfts-Tausch — die Ableitung selbst
// bleibt beim Client, hier wird nichts zweitgerechnet.
function schemaFuerAusgabe(roh) {
  return roh.replaceAll(`http://localhost:${PORT}${PRAEFIX}`, SITE_URL);
}

function baueSnapshot(vorlage, route) {
  let html = vorlage.replace('<main id="ansicht" tabindex="-1"></main>', `<main id="ansicht" tabindex="-1">${route.inhalt}</main>`);

  // Sprache und hreflang gehören auf JEDE Seite — auch auf die deutsche Wurzel.
  // Fehlte dort der Rückverweis, wäre die Verknüpfung nicht wechselseitig, und
  // Google verwirft einseitige hreflang-Angaben.
  html = html.replace('<html lang="de">', `<html lang="${esc(route.lang || QUELLSPRACHE)}">`);
  // Funktion als Ersatz, nicht String: ein '$&' oder '$1' im eingesetzten Text
  // würde sonst von String.replace als Rückverweis gedeutet und verstümmelt.
  const vorKopfEnde = (teil) => {
    html = html.replace('</head>', () => `${teil}\n</head>`);
  };
  vorKopfEnde(alternativenHtml(route.basisPfad ?? route.pfad));
  // Die Startseite trägt nur ihren WebSite-Block; seiteSchema() liefert dort
  // nichts, der Zweig ist also für '/' ohnehin leer.
  if (route.schema) {
    vorKopfEnde(`  <script type="application/ld+json">${schemaFuerAusgabe(route.schema)}</script>`);
  }

  // Kopf, Menü-Lade und Bottom-Bar stammen unverändert aus der Vorlage und
  // tragen darum noch die Rohform '#/…'. Für einen Crawler wären das
  // Fragment-Links auf dieselbe Seite — die komplette Navigation ein totes
  // Ende. Hier auf echte Pfade ziehen, mit demselben Sprachpräfix wie die
  // Seite selbst, damit ein englischer Snapshot auch englisch weiterverlinkt.
  html = loeseRahmenLinks(html, route.sprache ?? QUELLSPRACHE, PRAEFIX);

  // Nur die deutsche Wurzel behält ihren handgepflegten Tier-1-Kopf.
  if (route.pfad === '/') return html;
  const kanonisch = `${SITE_URL}${route.pfad}`;
  const ersetze = (muster, wert) => {
    html = html.replace(muster, (_treffer, vor, nach) => `${vor}${esc(wert)}${nach}`);
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

// --- 5. Abschluss. Die sitemap.xml kommt eingecheckt aus dem Repo (kopiere()),
// sie wird hier bewusst NICHT überschrieben: erzeugt wird sie von
// scripts/sitemap.mjs, wo git für die lastmod-Angaben verfügbar ist. ---
async function haupt() {
  console.log(`[prerender] Staging-Kopie → ${relative(REPO, ZIEL)}`);
  kopiere();
  praefixSymlink(true);

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

    // Unter dem Produktions-Präfix laden, damit eingebackene Links es mittragen.
    await page.goto(`http://localhost:${PORT}${PRAEFIX}/`, { waitUntil: 'load' });
    const routen = await ermittleRouten(page);
    console.log(`[prerender] ${routen.length} Routen ermittelt (Montagepunkt ${PRAEFIX || '/'})`);

    const vorlage = readFileSync(join(ZIEL, 'index.html'), 'utf8');
    for (const route of routen) {
      const schnappschuss = await erfasseSchnappschuss(page, route.pfad);
      const vollstaendig = { ...route, ...schnappschuss };
      const html = baueSnapshot(vorlage, vollstaendig);
      pruefeLinks(html, route.pfad);
      const datei = zielDatei(route.pfad);
      mkdirSync(dirname(datei), { recursive: true });
      writeFileSync(datei, html);
    }

    if (fehler.length > 0) {
      throw new Error(`Laufzeitfehler während des Prerenderns:\n${fehler.join('\n')}`);
    }

    console.log(`[prerender] ${routen.length} Snapshots geschrieben (sitemap.xml kommt eingecheckt mit)`);
  } finally {
    await browser.close();
    server.kill();
    praefixSymlink(false); // darf nie ins Pages-Artefakt gelangen
  }
}

haupt().catch((fehler) => {
  console.error('[prerender] fehlgeschlagen:', fehler);
  process.exitCode = 1;
});
