// Tracking (GoatCounter, vendor/goatcounter/count.js): zählt Seitenaufrufe der
// SPA ohne Cookies und ohne dauerhafte Kennung — s. Datenschutzerklärung.
// count.js zählt von sich aus nur den initialen Dokument-Load automatisch;
// für die SPA ist das per data-goatcounter-settings='{"no_onload":true}' in
// index.html abgeschaltet — sonst zählte nur der allererste Aufruf, jeder
// Routenwechsel per pushState bliebe unsichtbar. Stattdessen ruft js/app.js
// zaehleAufruf() bei jedem ECHTEN Routenwechsel auf (nicht bei bloßem
// Neu-Zeichnen derselben Route), mit dem reinen Pfad ohne Query — interne
// Query-Parameter (z. B. ?kontext=…) sind Navigations-Rückweg, keine eigene
// Seite, und sollen die Statistik nicht zersplittern.
//
// Über das Skript hinaus respektieren wir zusätzlich Do-Not-Track (count.js
// selbst prüft das nicht): ist DNT gesetzt, wird gar nicht erst gezählt.
//
// Lädt/fehlt das Tracking-Skript (kein data-goatcounter-Tag, Netzwerkfehler,
// Adblocker), ist zaehleAufruf() ein stilles No-op — kein Fehlerfall.

const MAX_VERSUCHE = 100; // ~5s bei 50ms-Takt, dann aufgeben (Skript kam nie)

let warteschlange = [];
let bereit = false;

function doNotTrack() {
  const wert = navigator.doNotTrack ?? window.doNotTrack ?? navigator.msDoNotTrack;
  return wert === '1' || wert === 'yes';
}

function sendeZaehlung(pfad) {
  if (typeof window.goatcounter?.count === 'function') window.goatcounter.count({ path: pfad });
}

function verarbeiteWarteschlange() {
  bereit = true;
  const anstehend = warteschlange;
  warteschlange = [];
  for (const pfad of anstehend) sendeZaehlung(pfad);
}

// Bereitschaft aktiv abfragen statt auf das 'load'-Ereignis des Script-Tags zu
// warten: count.js läuft als async KLASSISCHES Skript unabhängig vom ES-Modul-
// Graph und kann bereits geladen UND ausgeführt sein, bevor dieses Modul
// überhaupt importiert wird — ein dann erst angehängter 'load'-Listener hätte
// das Ereignis endgültig verpasst (Warteschlange liefe nie leer). Polling ist
// robust gegen diese Ladereihenfolge.
function pruefeBereitschaft(versuch = 0) {
  if (typeof window.goatcounter?.count === 'function') {
    verarbeiteWarteschlange();
    return;
  }
  if (versuch >= MAX_VERSUCHE) return; // Skript kam nie (Netzwerkfehler u. Ä.) — Warteschlange verfällt still
  window.setTimeout(() => pruefeBereitschaft(versuch + 1), 50);
}

if (document.querySelector('script[data-goatcounter]')) pruefeBereitschaft();
else bereit = true; // kein Tag im DOM — nichts abzuwarten, sendeZaehlung() ist dann ohnehin ein No-op

export function zaehleAufruf(pfad) {
  if (doNotTrack()) return;
  if (bereit) sendeZaehlung(pfad);
  else warteschlange.push(pfad);
}
