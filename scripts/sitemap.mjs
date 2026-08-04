// Schreibt sitemap.xml aus den echten Inhaltsdaten — dependency-frei:
//
//   node scripts/sitemap.mjs           # schreibt sitemap.xml
//   node scripts/sitemap.mjs --pruefe  # schreibt nichts, meldet nur Abweichung
//
// WARUM DAS HIER STEHT UND NICHT IM PRERENDER: Die Produktion läuft über einen
// Git-Pull (Plesk/netcup) auf den Repo-Stand — es gibt dort keinen Build-Schritt,
// der etwas erzeugen könnte. Die Sitemap muss also EINGECHECKT und aktuell sein,
// sonst findet Google nur die Startseite. scripts/prerender.mjs erzeugt darum
// KEINE eigene Sitemap mehr; er trägt die eingecheckte unverändert ins Staging.
//
// Anders als prerender.mjs braucht dieses Skript KEIN Playwright und keinen
// Server: die Routen hängen nur an den Inhaltsdaten, und die lassen sich mit
// baueIndizes() direkt in Node bauen (dasselbe Muster wie tests/engine.test.mjs).
// Damit bleibt es Teil der buildfreien Werkzeugkette.
//
// Die Routenliste selbst steht in scripts/routen.mjs — gemeinsam mit dem
// Prerender, damit beide nicht auseinanderlaufen. Der Abgleich ist als
// pruefeSitemapAktuell() in tests/engine.test.mjs eingehängt.

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { baueIndizes, INHALTSDATEIEN } from '../js/daten.js';
import { sammleRouten, SITE_URL } from './routen.mjs';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
const ZIEL = join(WURZEL, 'sitemap.xml');

const liesJson = (pfad) => JSON.parse(readFileSync(join(WURZEL, pfad), 'utf8'));

// Spiegelt ladeDaten() aus js/daten.js — dort per fetch(), hier per readFileSync.
// Die Dateiliste kommt aus demselben exportierten INHALTSDATEIEN, es gibt also
// keine zweite zu pflegende Aufzählung.
export function ladeDatenAusDateien() {
  return baueIndizes(
    INHALTSDATEIEN.map(liesJson),
    liesJson('data/trainingseinheiten.json'),
    liesJson('data/fehlerbilder.json'),
    liesJson('data/regeln.json'),
    liesJson('data/app-info.json'),
    liesJson('data/turnierregeln.json'),
  );
}

// --- lastmod ---------------------------------------------------------------
// Google wertet <lastmod> aus, ignoriert <changefreq> und <priority> erklärtermaßen
// — aber nur, solange lastmod glaubwürdig bleibt. Eine Datei-mtime taugt dafür
// nicht: nach einem frischen Klon tragen alle Dateien den Auscheck-Zeitpunkt, die
// Sitemap behauptete dann „alles heute geändert". Maßgeblich ist deshalb das
// Commit-Datum der zugrundeliegenden Datendatei.
//
// Bewusste Ungenauigkeit: eine Inhaltsdatei trägt viele Bausteine, eine Änderung
// an einem datiert also alle in derselben Datei neu. Das über-meldet mild und ist
// allemal ehrlicher als gar keine oder eine erfundene Angabe.
//
// Die Label-Dateien zählen BEWUSST NICHT mit. Sie tragen die sichtbaren Titel und
// die gesamte Bedienoberfläche, ändern sich also häufig aus Gründen, die mit dem
// Seiteninhalt nichts zu tun haben — rechnete man sie ein, trügen fast alle 149
// Routen dasselbe Datum und die Angabe verlöre genau die Aussagekraft, für die
// Google sie liest.
function commitDatum(datei) {
  try {
    const aus = execFileSync('git', ['log', '-1', '--format=%cs', '--', datei], {
      cwd: WURZEL,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(aus) ? aus : '';
  } catch {
    // Kein git, flacher Klon oder Datei noch nie committet — dann lieber gar
    // kein lastmod als ein falsches.
    return '';
  }
}

const neuestes = (daten) => daten.filter(Boolean).sort().at(-1) || '';

// Ordnet jeder Route die Datei zu, aus der ihr Inhalt stammt. Aggregierende
// Routen (Startseite, Pfad-Achsen) hängen an allen Inhaltsdateien zugleich.
function baueDatumsIndex() {
  const jeDatei = new Map(INHALTSDATEIEN.map((d) => [d, commitDatum(d)]));
  const inhaltNeuestes = neuestes([...jeDatei.values()]);

  // baueIndizes merkt sich nicht, aus welcher Datei ein Baustein kam — hier
  // einmal nachgeschlagen.
  const dateiVonBaustein = new Map();
  for (const datei of INHALTSDATEIEN) {
    const roh = liesJson(datei);
    for (const b of roh.bausteine || []) dateiVonBaustein.set(b.id, datei);
  }

  const einheiten = commitDatum('data/trainingseinheiten.json');
  const appInfo = commitDatum('data/app-info.json');
  const regeln = commitDatum('data/regeln.json');
  const turnier = commitDatum('data/turnierregeln.json');

  return (pfad) => {
    if (pfad.startsWith('/baustein/')) {
      const id = decodeURIComponent(pfad.slice('/baustein/'.length));
      const datei = dateiVonBaustein.get(id);
      return datei ? jeDatei.get(datei) : inhaltNeuestes;
    }
    if (pfad === '/training' || pfad.startsWith('/training/')) return einheiten;
    if (pfad === '/regeln') return regeln;
    if (pfad === '/turnier') return turnier;
    if (['/ueber', '/mitmachen', '/impressum', '/datenschutz'].includes(pfad)) return appInfo;
    // Startseite, Pfad-Achsen, Ausrüstungsseite: hängen am gesamten Bestand.
    return inhaltNeuestes;
  };
}

function esc(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function baueSitemap(routen, siteUrl, datumFuer = () => '') {
  const eintraege = routen
    .map((r) => {
      const stand = datumFuer(r.pfad);
      return [
        '  <url>',
        `    <loc>${esc(siteUrl + r.pfad)}</loc>`,
        ...(stand ? [`    <lastmod>${stand}</lastmod>`] : []),
        `    <priority>${r.prioritaet.toFixed(1)}</priority>`,
        '  </url>',
      ].join('\n');
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${eintraege}\n</urlset>\n`;
}

export function erzeugeSitemap() {
  return baueSitemap(sammleRouten(ladeDatenAusDateien()), SITE_URL, baueDatumsIndex());
}

// Für den Engine-Test. Verglichen wird die ROUTENMENGE, nicht die Datei Byte für
// Byte: lastmod hängt am Commit-Datum, und die Sitemap entsteht zwangsläufig VOR
// dem Commit, der die Datenänderung trägt — ein Byte-Vergleich wäre nach jedem
// Datencommit rot, ohne dass etwas kaputt wäre. Geprüft wird deshalb, was
// tatsächlich brechen kann: fehlende, überzählige oder doppelte Routen. Dass
// jedes lastmod wohlgeformt ist, prüft der Test zusätzlich.
export function pruefeSitemapAktuell() {
  const vorhanden = readFileSync(ZIEL, 'utf8');
  const routenAus = (xml) => [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);

  const erwartet = routenAus(erzeugeSitemap());
  const gefunden = routenAus(vorhanden);
  const fehlend = erwartet.filter((u) => !gefunden.includes(u));
  const ueberzaehlig = gefunden.filter((u) => !erwartet.includes(u));
  const staende = [...vorhanden.matchAll(/<lastmod>([^<]*)<\/lastmod>/g)].map((m) => m[1]);

  return {
    aktuell: fehlend.length === 0 && ueberzaehlig.length === 0,
    erwarteteRouten: erwartet.length,
    vorhandeneRouten: gefunden.length,
    fehlend,
    ueberzaehlig,
    mitLastmod: staende.length,
    lastmodWohlgeformt: staende.every((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)),
  };
}

function haupt() {
  const nurPruefen = process.argv.includes('--pruefe');
  const stand = pruefeSitemapAktuell();

  if (stand.aktuell) {
    console.log(
      `[sitemap] aktuell — ${stand.vorhandeneRouten} Routen, ${stand.mitLastmod} mit lastmod.`,
    );
    if (nurPruefen) return;
  } else if (nurPruefen) {
    console.error(
      `[sitemap] VERALTET — eingecheckt ${stand.vorhandeneRouten} Routen, aus den Daten folgen ` +
        `${stand.erwarteteRouten}.` +
        (stand.fehlend.length ? ` Fehlt: ${stand.fehlend.slice(0, 3).join(', ')}` : '') +
        (stand.ueberzaehlig.length ? ` Überzählig: ${stand.ueberzaehlig.slice(0, 3).join(', ')}` : '') +
        ` Bitte 'node scripts/sitemap.mjs' laufen lassen.`,
    );
    process.exitCode = 1;
    return;
  }

  // Auch bei unveränderter Routenmenge neu schreiben: die lastmod-Angaben
  // wandern mit jedem Commit weiter.
  const neu = erzeugeSitemap();
  const veraendert = neu !== readFileSync(ZIEL, 'utf8');
  writeFileSync(ZIEL, neu);
  console.log(
    veraendert
      ? `[sitemap] geschrieben — ${stand.erwarteteRouten} Routen (Routen/Stände aktualisiert).`
      : `[sitemap] unverändert — ${stand.erwarteteRouten} Routen.`,
  );
}

// Nur ausführen, wenn direkt aufgerufen — als Import (Test) bleibt es still.
if (process.argv[1] && process.argv[1].endsWith('sitemap.mjs')) haupt();
