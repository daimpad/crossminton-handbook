// Feedback-Modus: bindet den Kommentator (daimpad/kommentator, lokal in
// vendor/kommentator/) ein, damit Rezensent:innen die aktuelle Ansicht
// markieren, kommentieren und als JSON oder E-Mail zurückschicken können.
//
// Zwei Wege ihn zu starten, beide über dieselbe Aktivierung:
//   • ?feedback in der URL  → automatisch beim Booten (teilbarer Link)
//   • Knopf unter „Mitmachen" → aktiviereFeedback() auf Klick (ohne Reload)
// Normale Besucher ohne beides laden nichts davon (keine Extra-Bytes/-UI).
//
// Der Kommentator ist ein klassisches Skript (window.Kommentare), kein ES-Modul;
// CSS + JS werden dynamisch nachgeladen. Sein Thema scoped er über eigene
// Klassen (kommentare-dark/-light), nie über <html data-theme> — kein Konflikt
// mit dem App-Thema; wir reichen den passenden Wert hinein und führen ihn nach.
// Sein CI wird über css/feedback.css an das App-CI angeglichen.
//
// Seine Oberfläche spricht die App-Sprache: Von Haus aus ist sie deutsch, die
// Übersetzungen reichen wir über options.texte hinein. Sie liegen in
// data/labels/<sprache>.json unter "kommentator", mit den Schlüsseln des
// Kommentators. Wechselt die Sprache, während er läuft, baut neuAufbauen() ihn
// mit den neuen Texten neu auf und übernimmt dabei alle Kommentare.

import { label, t } from './i18n.js';
import { einstellungen } from './zustand.js';

const KONTAKT_EMAIL = 'contact@nozilla.de';
let aktiv = false;
let instanz = null;
let autor = '';

// Die Kommentator-Texte, die mit den Optionen unten sichtbar werden können.
// Schlüssel = die des Kommentators (TEXTE in vendor/kommentator/kommentare.js).
export const KOMMENTATOR_TEXTE = [
  'notizenKopf', 'leer', 'kommentarPlatzhalter', 'abbrechen', 'speichern', 'bearbeiten', 'loeschen',
  'ladenBtn', 'ladenTitel', 'herunterladenJson', 'herunterladenMd', 'druckenBtn', 'emailBtn',
  'emailIntro', 'emailAnhangHinweis', 'downloadKopf', 'keineNotizen', 'quelleLabel', 'exportiertLabel',
  'titel', 'autorLabel', 'einKommentar', 'mehrereKommentare', 'leseFehler', 'markierungAria', 'von',
  'hilfeAria', 'hilfeTitel', 'hilfeSchliessen', 'hilfeHinweis', 'menuAria', 'menuTitel',
  'elementBtn', 'elementBtnAktiv', 'elementAria', 'elementLabel',
  'punktBtn', 'punktBtnAktiv', 'punktAria', 'punktLabel',
];

// Die Hilfe-Schritte in Anzeigereihenfolge. Der Kommentator erwartet eine Liste
// von [Titel, Text]; die Labels halten sie als Objekt, weil das Nachschlagen
// nur Zeichenketten liefert.
export const KOMMENTATOR_HILFE = ['markieren', 'verbinden', 'bearbeiten', 'herunterladen', 'zusammenfuehren'];

// Bewusst NICHT übergeben: mit den Optionen unten nie sichtbar oder sprachneutral.
// Wer eine dieser Optionen ändert, übersetzt die betroffenen Texte und nimmt sie
// in KOMMENTATOR_TEXTE auf. Test [23] hält fest, dass jeder Text des Kommentators
// in genau einer der Listen steht — ein neuer Text nach einer Aktualisierung
// fällt so auf, statt in allen Sprachen deutsch zu erscheinen.
export const KOMMENTATOR_OHNE_UEBERSETZUNG = {
  hilfeBtn: 'sprachneutrales Zeichen „?"',
  platzhalterName: 'sprachneutrales Zeichen „—"',
  herunterladenBtn: 'vom Kommentator nicht mehr verwendet',
  emailBetreff: 'ersetzt durch die Option emailSubject (ui.feedback_betreff)',
  themeAria: 'nur mit themeToggle; das Thema steuert hier die App',
  groesseAria: 'nur im mitfließenden Layout; hier notes: floating',
  hilfeSenden: 'nur mit Meldestelle (webhook); hier keine',
  hilfeHinweisSenden: 'nur mit Meldestelle (webhook)',
  sendenBtn: 'nur mit Meldestelle (webhook)',
  sendenTitel: 'nur mit Meldestelle (webhook)',
  sendenOk: 'nur mit Meldestelle (webhook)',
  sendenLeer: 'nur mit Meldestelle (webhook)',
  sendenFehler: 'nur mit Meldestelle (webhook)',
  artText: 'Datenwert für die Meldestelle, keine Oberfläche',
  artElement: 'Datenwert für die Meldestelle, keine Oberfläche',
  artPunkt: 'Datenwert für die Meldestelle, keine Oberfläche',
  aktionNeu: 'Datenwert für die Meldestelle, keine Oberfläche',
  aktionGeaendert: 'Datenwert für die Meldestelle, keine Oberfläche',
  aktionGeloescht: 'Datenwert für die Meldestelle, keine Oberfläche',
};

// options.texte in der aktiven Sprache. Das Nachschlagen lässt sich hereinreichen,
// damit der Test den Aufbau ohne geladene Labels prüfen kann.
export function kommentatorTexte(nachschlagen = (pfad) => label('kommentator', pfad)) {
  const texte = {};
  for (const schluessel of KOMMENTATOR_TEXTE) texte[schluessel] = nachschlagen(schluessel);
  texte.hilfeSchritte = KOMMENTATOR_HILFE.map((schritt) => [
    nachschlagen(`hilfeSchritte.${schritt}.titel`),
    nachschlagen(`hilfeSchritte.${schritt}.text`),
  ]);
  return texte;
}

// App-Thema (auto/hell/dunkel) → Kommentator-Thema (auto/light/dark).
function kommentatorThema() {
  const abbildung = { hell: 'light', dunkel: 'dark', auto: 'auto' };
  return abbildung[einstellungen().thema] || 'auto';
}

function optionen() {
  return {
    container: '#ansicht', // die Lern-Inhalte; Kopf/Navigation bleiben außen vor
    autor,
    toolbarMode: 'floating', // Knopf unten rechts öffnet das Menü
    notes: 'floating', // schwebende Notizspalte — baut das Seitenlayout nicht um
    resizable: true,
    help: true,
    themeToggle: false, // das Thema steuert die App, nicht der Kommentator
    theme: kommentatorThema(),
    email: KONTAKT_EMAIL,
    emailSubject: t('feedback_betreff'),
    texte: kommentatorTexte(),
  };
}

// Sprachwechsel bei laufendem Kommentator: seine Texte stehen fest, sobald er
// gebaut ist, einen Weg zum Austauschen kennt er nicht. Darum abbauen und neu
// aufbauen. Die Kommentare leben nur im Speicher; sie werden vorher gesichert
// und danach wieder eingelesen. Offen bleibt dabei nur ein halb geschriebener
// Kommentar, das Menü ist danach zu.
function neuAufbauen() {
  if (!instanz) return; // Skript lädt noch — init() nimmt dann ohnehin die neue Sprache
  const annotationen = instanz.getAnnotations();
  const alterAutor = autor;
  autor = t('feedback_autor');
  // Eigentum hängt am Namen (author === autor), und der Platzhaltername ist
  // übersetzt („Gast" → „Guest"). Ohne Umschreiben gälten die eigenen Kommentare
  // danach als fremd: nicht mehr zu bearbeiten und aus dem Export verschwunden.
  for (const a of annotationen) {
    if (a.creator && a.creator.name === alterAutor) a.creator.name = autor;
  }
  instanz.destroy();
  instanz = null; // wirft init(), bleibt kein abgebautes Werkzeug zurück
  instanz = window.Kommentare.init(optionen());
  instanz.import(annotationen);
}

function feedbackGewuenscht() {
  try {
    return new URLSearchParams(window.location.search).has('feedback');
  } catch {
    return false;
  }
}

function ladeStil(href) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

function ladeSkript(src) {
  return new Promise((aufloesen, ablehnen) => {
    const skript = document.createElement('script');
    skript.src = src;
    skript.onload = aufloesen;
    skript.onerror = () => ablehnen(new Error(`Skript nicht ladbar: ${src}`));
    document.body.appendChild(skript);
  });
}

export function feedbackAktiv() {
  return aktiv;
}

// Startet den Kommentator (idempotent). Fehler bleiben lokal — schlägt das Laden
// fehl, läuft die App unverändert weiter.
export async function aktiviereFeedback() {
  if (aktiv) return;
  aktiv = true;
  ladeStil('vendor/kommentator/kommentare.css');
  ladeStil('css/feedback.css'); // CI-Angleichung, NACH der Vendor-CSS
  try {
    await ladeSkript('vendor/kommentator/kommentare.js');
  } catch {
    aktiv = false;
    return;
  }
  if (!window.Kommentare) {
    aktiv = false;
    return;
  }
  autor = t('feedback_autor');
  instanz = window.Kommentare.init(optionen());
  // Thema mitführen, wenn es im Menü/Profil umgeschaltet wird (wendeThemaAn
  // sendet 'app:thema'), ebenso die Sprache (setzeSprache sendet 'app:sprache').
  // Fehler ignorieren — der Kommentator ist optional.
  window.addEventListener('app:thema', () => {
    try {
      if (instanz) instanz.setTheme(kommentatorThema());
    } catch {
      /* egal */
    }
  });
  window.addEventListener('app:sprache', () => {
    try {
      neuAufbauen();
    } catch {
      /* egal */
    }
  });
}

// Beiläufig beim Booten: nur der teilbare ?feedback-Link aktiviert automatisch.
export function initFeedbackWennGewuenscht() {
  if (feedbackGewuenscht()) aktiviereFeedback();
}
