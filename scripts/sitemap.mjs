// Schreibt sitemap.xml aus den echten Inhaltsdaten — dependency-frei:
//
//   node scripts/sitemap.mjs           # schreibt sitemap.xml
//   node scripts/sitemap.mjs --pruefe  # schreibt nichts, meldet nur Abweichung
//
// WARUM DAS HIER STEHT UND NICHT IM PRERENDER: Die Produktion läuft über einen
// Git-Pull (Plesk/netcup) auf den Repo-Stand — es gibt dort keinen Build-Schritt,
// der etwas erzeugen könnte. Die Sitemap muss also EINGECHECKT und aktuell sein,
// sonst findet Google nur die Startseite. scripts/prerender.mjs erzeugt zwar
// dieselbe Datei, läuft aber ausschließlich im GitHub-Pages-Workflow und schreibt
// nach _site/ (gitignored) — sein Ergebnis erreicht die Produktion nie.
//
// Anders als prerender.mjs braucht dieses Skript KEIN Playwright und keinen
// Server: die Routen hängen nur an den Inhaltsdaten, und die lassen sich mit
// baueIndizes() direkt in Node bauen (dasselbe Muster wie tests/engine.test.mjs).
// Damit bleibt es Teil der buildfreien Werkzeugkette.
//
// Die Routenliste selbst steht in scripts/routen.mjs — gemeinsam mit dem
// Prerender, damit beide nicht auseinanderlaufen. Der Abgleich ist als
// pruefeSitemapAktuell() in tests/engine.test.mjs eingehängt: wer einen Baustein
// hinzufügt und die Sitemap vergisst, bekommt einen roten Test statt einer still
// veralteten Datei.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { baueIndizes, INHALTSDATEIEN } from '../js/daten.js';
import { baueSitemap, sammleRouten, SITE_URL } from './routen.mjs';

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

export function erzeugeSitemap() {
  return baueSitemap(sammleRouten(ladeDatenAusDateien()), SITE_URL);
}

// Für den Engine-Test: stimmt die eingecheckte Datei noch mit den Daten überein?
export function pruefeSitemapAktuell() {
  const erwartet = erzeugeSitemap();
  const vorhanden = readFileSync(ZIEL, 'utf8');
  const zaehle = (text) => (text.match(/<loc>/g) || []).length;
  return {
    aktuell: erwartet === vorhanden,
    erwarteteRouten: zaehle(erwartet),
    vorhandeneRouten: zaehle(vorhanden),
  };
}

function haupt() {
  const nurPruefen = process.argv.includes('--pruefe');
  const stand = pruefeSitemapAktuell();

  if (stand.aktuell) {
    console.log(`[sitemap] aktuell — ${stand.vorhandeneRouten} Routen.`);
    return;
  }
  if (nurPruefen) {
    console.error(
      `[sitemap] VERALTET — eingecheckt ${stand.vorhandeneRouten} Routen, ` +
        `aus den Daten folgen ${stand.erwarteteRouten}. Bitte 'node scripts/sitemap.mjs' laufen lassen.`,
    );
    process.exitCode = 1;
    return;
  }
  writeFileSync(ZIEL, erzeugeSitemap());
  console.log(
    `[sitemap] geschrieben — ${stand.erwarteteRouten} Routen (vorher ${stand.vorhandeneRouten}).`,
  );
}

// Nur ausführen, wenn direkt aufgerufen — als Import (Test) bleibt es still.
if (process.argv[1] && process.argv[1].endsWith('sitemap.mjs')) haupt();
