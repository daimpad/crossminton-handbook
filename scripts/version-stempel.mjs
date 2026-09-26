// Schreibt den ausgelieferten Stand nach js/version.js.
//
//   node scripts/version-stempel.mjs <kurzer-commit> <YYYY-MM-DD>
//
// Zwei Workflows nutzen das:
//   • .github/workflows/version.yml  — committet das Ergebnis nach main, damit
//     der Repo-Stand stimmt (und der Git-Pull der Produktion es mitnimmt).
//   • .github/workflows/deploy-pages.yml — stempelt es NUR in die Arbeitskopie,
//     bevor prerendert wird.
//
// WARUM BEIDE: Ein Push mit dem GITHUB_TOKEN löst per GitHub-Design keine
// weiteren Workflow-Läufe aus. Der Versions-Commit aus version.yml startet den
// Deploy-Workflow also NICHT — ohne den zweiten Stempel trüge der ausgelieferte
// Stand für immer die Nummer des VORIGEN Commits. Beide stempeln denselben Wert
// (den auslösenden Commit), die Angaben bleiben also deckungsgleich.
//
// Ersetzt genau die eine Wertzeile; der erklärende Kopf von js/version.js bleibt
// stehen. Passt das Format nicht mehr, bricht das Skript ab, statt still nichts
// zu tun — ein stiller Fehlschlag wäre hier besonders tückisch, weil die Anzeige
// dann eine falsche Nummer behauptet.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ZIEL = join(dirname(fileURLToPath(import.meta.url)), '..', 'js', 'version.js');
const MUSTER = /export const VERSION = \{[^}]*\};/;

export function stempele(commit, datum) {
  if (!/^[0-9a-f]{7,40}$/.test(commit)) throw new Error(`Kein Commit-Hash: ${commit}`);
  if (datum && !/^\d{4}-\d{2}-\d{2}$/.test(datum)) throw new Error(`Kein ISO-Datum: ${datum}`);
  const quelle = readFileSync(ZIEL, 'utf8');
  const neu = quelle.replace(MUSTER, `export const VERSION = { commit: '${commit.slice(0, 7)}', datum: '${datum || ''}' };`);
  if (neu === quelle && !MUSTER.test(quelle)) {
    throw new Error('VERSION-Zeile in js/version.js nicht gefunden — Format geändert?');
  }
  writeFileSync(ZIEL, neu);
  return { commit: commit.slice(0, 7), datum: datum || '', veraendert: neu !== quelle };
}

if (process.argv[1] && process.argv[1].endsWith('version-stempel.mjs')) {
  const [commit, datum] = process.argv.slice(2);
  const stand = stempele(commit, datum);
  console.log(
    `[version] js/version.js -> ${stand.commit}${stand.datum ? ` (${stand.datum})` : ''}` +
      (stand.veraendert ? '' : ' — unverändert'),
  );
}
