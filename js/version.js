// Stand der ausgelieferten Fassung — von Hand ist hier nichts zu pflegen.
//
// .github/workflows/version.yml schreibt die Datei bei jedem Push nach `main`
// neu (kurzer Commit-Hash + Datum) und committet sie zurück; der Git-Pull der
// Produktion (Plesk/netcup) zieht sie mit. Das ist der einzige Weg zu einer
// echten Deploy-Nummer, denn dort läuft KEIN Build-Schritt, der etwas einsetzen
// könnte — was nicht eingecheckt ist, existiert in der Produktion nicht.
//
// WARUM ES EIN MODUL IST UND KEINE JSON: Die Nummer soll den Code beschreiben,
// der gerade LÄUFT. Als separat geholte Datei könnte der Service Worker eine
// gecachte Nummer neben frischem Code ausliefern (oder umgekehrt) — die Anzeige
// wäre dann genau dann falsch, wenn man sie braucht. Im Modulgraph teilt sie
// das Schicksal des übrigen Codes und stimmt darum immer.
//
// Der Wert unten ist der Ruhezustand: lokal und in jedem Branch, in dem der
// Workflow noch nicht lief, steht hier `lokal` — ehrlicher als eine erfundene
// Nummer. Die Ansicht blendet das Datum dann weg.
export const VERSION = { commit: '78868c0', datum: '2026-08-11' };
