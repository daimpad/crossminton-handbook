// Service Worker — macht das Handbuch offline-fähig. Buildfrei und rein statisch:
// ein klassisches SW-Skript (kein Modul, kein Bundler), das den App-Kern beim
// ersten Besuch vorlädt und danach aus dem Cache bedient.
//
// Zwei Strategien:
//   • Navigationen (das HTML-Dokument): erst Netz, bei Ausfall die gecachte
//     index.html — so bekommt man online stets die frische Hülle, offline die
//     zuletzt gesehene. Deep-Links (…/baustein/x) laden dasselbe Dokument; eine
//     404-Antwort des Servers wird dabei verworfen (s. bedieneNavigation).
//   • Alles andere (JS, CSS, JSON, Schriften, Grafiken): stale-while-revalidate —
//     sofort aus dem Cache, parallel im Hintergrund aktualisiert. Nicht
//     vorgeladene Dateien (Baustein-Grafiken) landen dabei beim ersten Abruf
//     im Cache und sind danach offline verfügbar.
//
// Alle Pfade sind RELATIV zum SW-Standort (Wurzel des Deployments), damit das
// Skript sowohl unter „/" (lokaler Server, wie auch die Produktion unter der
// Custom Domain crossminton-handbook.de) als auch unter einem Unterpfad
// (z. B. „/crossminton-handbook/" bei github.io) ohne <base>-Tag funktioniert.
// Bei inhaltlicher Änderung an
// Kern-Dateien den CACHE-Namen erhöhen — dann lädt der neue SW die Hülle frisch
// und räumt die alten Caches weg.

const CACHE = 'crossminton-v51';

// App-Hülle: alles, was für den ersten Start ohne Netz nötig ist. Die
// Baustein-Grafiken (images/G-XXX.png) sind bewusst NICHT dabei — sie sind viele
// und werden beim Ansehen lazy nachgecacht.
const SHELL = [
  './',
  'index.html',
  '404.html',
  'manifest.json',
  'assets/images/speeder.svg',
  // images/logo-speeder.svg ist byte-identisch, wird aber NUR von README.md auf
  // GitHub genutzt — die App fordert es nie an. Es lag doppelt in der Hülle und
  // kostete 88 KB Precache ohne Gegenwert.
  'css/app.css',
  'css/feedback.css',
  'css/schriften.css',
  // Anders als vendor/kommentator/ (nur im Feedback-Modus nachgeladen) lädt
  // dieses Skript unconditioniert auf jeder Seite (index.html) — gehört daher
  // in die Hülle, nicht in den lazy/SWR-Bereich.
  'vendor/goatcounter/count.js',
  'js/aktionen.js',
  'js/analytics.js',
  'js/app.js',
  'js/daten.js',
  'js/feedback.js',
  'js/fortschritt.js',
  'js/graph.js',
  'js/i18n.js',
  'js/ko-turnier.js',
  'js/oberflaeche.js',
  'js/pfade.js',
  'js/plan.js',
  'js/seo.js',
  'js/suche.js',
  'js/version.js',
  'js/zustand.js',
  'js/ansichten/baustein.js',
  'js/ansichten/heim.js',
  'js/ansichten/info.js',
  'js/ansichten/ko-turnier.js',
  'js/ansichten/merkliste.js',
  'js/ansichten/onboarding.js',
  'js/ansichten/pfad.js',
  'js/ansichten/plan.js',
  'js/ansichten/profil.js',
  'js/ansichten/regeln.js',
  'js/ansichten/suche.js',
  'js/ansichten/training.js',
  'js/ansichten/turnier.js',
  'js/ansichten/zielwahl.js',
  'data/app-info.json',
  'data/bausteine.ausruestung-fortgeschritten.json',
  'data/bausteine.ausruestung-grundlagen.json',
  'data/bausteine.beginner-athletik_kondition.json',
  'data/bausteine.beginner-mentales.json',
  'data/bausteine.beginner-taktik.json',
  'data/bausteine.beginner-technik.json',
  'data/bausteine.delta-squash.json',
  'data/bausteine.delta-tennis.json',
  'data/bausteine.doppel-beginner.json',
  'data/bausteine.doppel-experte.json',
  'data/bausteine.doppel-thema.json',
  'data/bausteine.experte-athletik_kondition.json',
  'data/bausteine.experte-mentales.json',
  'data/bausteine.experte-taktik.json',
  'data/bausteine.experte-technik.json',
  'data/bausteine.fortgeschritten-athletik_kondition.json',
  'data/bausteine.fortgeschritten-mentales.json',
  'data/bausteine.fortgeschritten-taktik.json',
  'data/bausteine.fortgeschritten-technik.json',
  'data/bausteine.modus-thema.json',
  'data/bausteine.outdoor-thema.json',
  'data/bausteine.spielmodi.json',
  'data/bausteine.trainer-trainingsgestaltung.json',
  'data/fehlerbilder.json',
  'data/regeln.json',
  'data/trainingseinheiten.json',
  'data/turnierregeln.json',
  'data/labels/de.json',
  'data/labels/en.json',
  'data/labels/fr.json',
  'data/labels/pl.json',
  'assets/fonts/fa-solid-900.woff2',
  'assets/fonts/rubik-latin-400-normal.woff2',
  'assets/fonts/rubik-latin-500-normal.woff2',
  'assets/fonts/rubik-latin-700-normal.woff2',
  'assets/fonts/rubik-latin-ext-400-normal.woff2',
  'assets/fonts/rubik-latin-ext-500-normal.woff2',
  'assets/fonts/rubik-latin-ext-700-normal.woff2',
];

// Installation: Hülle vorladen. addAll ist atomar — fehlt EINE Datei, schlägt
// die Installation fehl und der alte SW bleibt aktiv (die App bleibt nutzbar).
self.addEventListener('install', (ereignis) => {
  ereignis.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()),
  );
});

// Aktivierung: alte Cache-Versionen wegräumen, dann sofort die Kontrolle über
// offene Seiten übernehmen (clients.claim), damit der neue SW ohne Reload greift.
self.addEventListener('activate', (ereignis) => {
  ereignis.waitUntil(
    caches
      .keys()
      .then((namen) => Promise.all(namen.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

// Navigationsanfragen: erst Netz (frische Hülle), bei Ausfall gecachte index.html.
function bedieneNavigation(anfrage) {
  const huelle = () => caches.match('index.html').then((treffer) => treffer || caches.match('./'));
  return fetch(anfrage)
    .then((antwort) => {
      // Seit dem Pfad-Routing (SEO Tier 2, Baustein 1) trifft eine Navigation auf
      // /baustein/griff — dort liegt auf GitHub Pages keine Datei, der Server
      // antwortet mit 404.html. Diese Antwort NICHT ausliefern: sonst sieht der
      // Nutzer die Umleitungsseite statt der App. Stattdessen die gecachte Hülle,
      // die den Pfad selbst auflöst. Erst ohne Cache-Treffer greift die 404-Antwort
      // (dann übernimmt deren Umleitung).
      if (!antwort || !antwort.ok) {
        return huelle().then((treffer) => treffer || antwort);
      }
      return antwort;
    })
    .catch(huelle);
}

// Übrige Anfragen: stale-while-revalidate. Cache-Treffer sofort ausliefern,
// parallel frisch holen und den Cache aktualisieren; ohne Treffer aufs Netz warten.
function bedieneRest(anfrage) {
  return caches.open(CACHE).then((cache) =>
    cache.match(anfrage).then((gecacht) => {
      const ausNetz = fetch(anfrage)
        .then((antwort) => {
          // Nur vollständige, gleiche-Herkunft-Antworten cachen (keine Fehler/opaque).
          if (antwort && antwort.status === 200 && antwort.type === 'basic') {
            cache.put(anfrage, antwort.clone());
          }
          return antwort;
        })
        .catch(() => gecacht);
      return gecacht || ausNetz;
    }),
  );
}

self.addEventListener('fetch', (ereignis) => {
  const anfrage = ereignis.request;
  // Nur GET und nur gleiche Herkunft — POST/andere Domains laufen unangetastet
  // durchs Netz (z. B. der optionale Feedback-Export).
  if (anfrage.method !== 'GET' || new URL(anfrage.url).origin !== self.location.origin) return;

  if (anfrage.mode === 'navigate') {
    ereignis.respondWith(bedieneNavigation(anfrage));
    return;
  }
  ereignis.respondWith(bedieneRest(anfrage));
});
