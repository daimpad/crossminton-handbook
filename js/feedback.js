// Feedback-Modus (opt-in über ?feedback in der URL): bindet den Kommentator
// (daimpad/kommentator, lokal in vendor/kommentator/) ein, damit Rezensent:innen
// die aktuelle Ansicht markieren, kommentieren und als JSON oder E-Mail
// zurückschicken können. Wird NUR geladen, wenn der Flag gesetzt ist — normale
// Besucher merken nichts davon (keine Extra-Bytes, kein Extra-UI).
//
// Der Kommentator ist ein klassisches Skript (window.Kommentare), kein ES-Modul;
// wir laden CSS + JS daher dynamisch nach. Er scoped sein Thema über eigene
// Klassen (kommentare-dark/-light), nie über <html data-theme> — kein Konflikt
// mit dem App-Thema; wir reichen nur den passenden Wert hinein und halten ihn
// beim Umschalten nach.

import { einstellungen } from './zustand.js';

// App-Thema (auto/hell/dunkel) → Kommentator-Thema (auto/light/dark).
function kommentatorThema() {
  const abbildung = { hell: 'light', dunkel: 'dark', auto: 'auto' };
  return abbildung[einstellungen().thema] || 'auto';
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

// Bindet den Kommentator ein, sobald ?feedback gesetzt ist. Fehler bleiben
// lokal — schlägt das Laden fehl, läuft die App unverändert weiter.
export async function initFeedbackWennGewuenscht({ email = '' } = {}) {
  if (!feedbackGewuenscht()) return;
  ladeStil('vendor/kommentator/kommentare.css');
  try {
    await ladeSkript('vendor/kommentator/kommentare.js');
  } catch {
    return;
  }
  if (!window.Kommentare) return;
  const instanz = window.Kommentare.init({
    container: '#ansicht', // die Lern-Inhalte; Kopf/Navigation bleiben außen vor
    autor: 'Gast',
    toolbarMode: 'floating', // Knopf unten rechts öffnet das Menü
    notes: 'floating', // schwebende Notizspalte — baut das Seitenlayout nicht um
    resizable: true,
    help: true,
    themeToggle: false, // das Thema steuert die App, nicht der Kommentator
    theme: kommentatorThema(),
    email: email || undefined,
    emailSubject: 'Feedback Crossminton-Handbuch',
  });
  // Thema mitführen, wenn es im Menü/Profil umgeschaltet wird (wendeThemaAn
  // sendet 'app:thema'). Fehler ignorieren — der Kommentator ist optional.
  window.addEventListener('app:thema', () => {
    try {
      instanz.setTheme(kommentatorThema());
    } catch {
      /* egal */
    }
  });
}
