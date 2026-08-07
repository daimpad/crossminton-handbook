// App-Einstieg: Boot (Zustand → Sprache → Daten), Pfad-Router und Navigation.
// Ansichten rendern in #ansicht; Zustandsänderungen stoßen über das Ereignis
// 'app:rendern' ein Neu-Rendern der aktuellen Route an.
//
// Der Router läuft über die History API (echte Pfade wie /baustein/griff), nicht
// mehr über den Hash — nur so sind die Inhalte einzeln indexierbar (SEO Tier 2,
// Baustein 1 aus docs/seo-tier2-konzept.md).

import { zaehleAufruf } from './analytics.js';
import { renderBaustein } from './ansichten/baustein.js';
import { renderHeim } from './ansichten/heim.js';
import { renderMitmachen, renderRechtstext, renderUeber } from './ansichten/info.js';
import { renderKoTurnier } from './ansichten/ko-turnier.js';
import { renderMerkliste } from './ansichten/merkliste.js';
import { renderOnboarding } from './ansichten/onboarding.js';
import { renderPlan } from './ansichten/plan.js';
import { renderAusruestung, renderIndividual, renderKompetenzpfad, renderSpielform, renderThemen, renderUmgebung } from './ansichten/pfad.js';
import { renderProfil } from './ansichten/profil.js';
import { renderRegeln } from './ansichten/regeln.js';
import { renderSuche } from './ansichten/suche.js';
import { renderTraining } from './ansichten/training.js';
import { renderTurnier } from './ansichten/turnier.js';
import { ladeDaten } from './daten.js';
import { initFeedbackWennGewuenscht } from './feedback.js';
import { initI18n, QUELLSPRACHE, SPRACHEN, setzeSprache, sprache, t, text, ZIELSPRACHEN } from './i18n.js';
import { esc, wendeThemaAn } from './oberflaeche.js';
import { seiteMeta, seiteSchema } from './seo.js';
import { einstellungen, ladeZustand, merkliste, setzeEinstellung } from './zustand.js';

let daten = null;
let letzteRoute = null;

// Startseite behält ihren handgepflegten Tier-1-Kopf aus index.html (reichhaltige
// OG-Beschreibung + Produktions-Canonical) — einmalig gesichert, bevor der erste
// rendern()-Lauf ihn anfassen könnte, und bei jeder Rückkehr zu '/' wiederhergestellt
// (sonst bliebe nach einem Ausflug auf eine andere Route eine falsche Beschreibung
// hängen). Dieselbe Ausnahme trifft scripts/prerender.mjs (baueSnapshot()).
const urspruenglicherKopf = {
  titel: document.title,
  beschreibung: document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
  kanonisch: document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '',
};

// App-Wurzel (Montagepunkt) = das <base href> aus index.html. Das Inline-Skript
// dort setzt es vor allen anderen Tags auf den Montagepunkt ('/' lokal,
// '/crossminton-handbook/' auf Pages) — es ist die EINE Quelle der Wahrheit und
// bleibt korrekt, auch wenn das Dokument unter einer verschachtelten Route
// ausgeliefert wird (404-Umweg oder Service-Worker-Cache). Genau darum wurde das
// <base> eingeführt: relative Pfade allein tragen verschachtelte Routen nicht.
export const WURZEL = new URL(document.baseURI).pathname;

// Präfix der aktiven Sprache — Deutsch bleibt präfixlos (s. ZIELSPRACHEN).
function sprachPraefix(s = sprache()) {
  return ZIELSPRACHEN.includes(s) ? s : '';
}

// Dieselbe Route unter einer anderen Sprache: '/baustein/griff' + 'en'
// → '/en/baustein/griff'. Grundlage für den Sprachumschalter und die
// hreflang-Angaben.
export function routeInSprache(segmente, ziel) {
  return WURZEL + [sprachPraefix(ziel), ...segmente].filter(Boolean).join('/');
}

// '#/baustein/griff', '/baustein/griff' oder ein bereits montagepunkt-absoluter
// Pfad ('/crossminton-handbook/baustein/griff') → echte, korrekte URL.
function zuUrl(ziel) {
  const eingabe = String(ziel ?? '');
  // Rohform aus den Ansichten ('#/…'): braucht Montagepunkt UND Sprachpräfix.
  // Sie ist die EINZIGE Form, an der sich das zuverlässig festmachen lässt —
  // ein fertiger Pfad wie '/baustein/griff' ist in der deutschen Fassung nicht
  // von einer noch nicht präfigierten Route zu unterscheiden.
  if (eingabe.startsWith('#/')) {
    return WURZEL + [sprachPraefix(), eingabe.slice(2)].filter(Boolean).join('/');
  }
  // Alles andere ist bereits ein echter Pfad (Klick-Interceptor, Prerender-
  // Schnappschuss) und trägt den Montagepunkt samt Präfix schon. IDEMPOTENT:
  // ohne diese Prüfung käme unter Unterpfad-Deploy der Montagepunkt doppelt
  // davor — der Pfad zeigte ins Leere. Lokal an der Wurzel (WURZEL === '/')
  // fällt das nicht auf, weil das Verdoppeln dort ein No-op ist.
  const roh = eingabe.replace(/^#/, '');
  if (roh.startsWith(WURZEL)) return roh;
  return WURZEL + roh.replace(/^\//, '');
}

function parsePfad() {
  const pfad = window.location.pathname;
  const roh = (pfad.startsWith(WURZEL) ? pfad.slice(WURZEL.length) : pfad.replace(/^\//, ''))
    + window.location.search;
  const [pfadTeil, queryTeil] = roh.split('?');
  const segmente = pfadTeil.split('/').filter(Boolean);
  // Führendes Sprachsegment abtrennen: '/en/baustein/griff' ist dieselbe Route
  // wie '/baustein/griff', nur in einer anderen Sprache. Die URL bestimmt die
  // Sprache — sonst zeigte dieselbe Adresse je nach gespeicherter Vorliebe
  // verschiedene Inhalte, und genau das darf für Suchmaschinen nicht passieren.
  const urlSprache = ZIELSPRACHEN.includes(segmente[0]) ? segmente.shift() : QUELLSPRACHE;
  return {
    segmente,
    query: new URLSearchParams(queryTeil || ''),
    roh,
    sprache: urlSprache,
  };
}

// hreflang-Angaben je Route: dieselbe Seite in allen vier Sprachen. Ohne sie
// gälten die Fassungen als konkurrierende Dubletten statt als Übersetzungen
// derselben Seite — Google entscheidet dann selbst, welche es zeigt, und oft
// gar keine. `x-default` zeigt auf die deutsche Fassung als Ausgangspunkt.
//
// Absolute URLs sind Pflicht: relative hreflang-Angaben ignoriert Google.
// Die Tags werden bei jedem Rendern neu gesetzt und dabei WIEDERVERWENDET
// (nicht angehäuft) — sonst wüchse der Kopf mit jedem Routenwechsel.
function setzeSprachAlternativen(segmente) {
  const kopf = document.head;
  const eintraege = [
    ...SPRACHEN.map((s) => [s, routeInSprache(segmente, s)]),
    ['x-default', routeInSprache(segmente, QUELLSPRACHE)],
  ];
  for (const [hreflang, pfad] of eintraege) {
    let el = kopf.querySelector(`link[rel="alternate"][hreflang="${hreflang}"]`);
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', 'alternate');
      el.setAttribute('hreflang', hreflang);
      kopf.appendChild(el);
    }
    el.setAttribute('href', window.location.origin + pfad);
  }
}

// Strukturierte Daten je Route (js/seo.js): wo die Seite im Aufbau steht und,
// wo es zutrifft, was sie inhaltlich ist. GENAU EIN wiederverwendetes Tag —
// würde bei jedem Routenwechsel eins angehängt, behauptete die Seite bald,
// mehrere verschiedene Dinge zugleich zu sein. Die Startseite bekommt keins
// (seiteSchema liefert dort null): sie trägt den handgepflegten WebSite-Block
// aus index.html, und der beschreibt sie bereits vollständig.
function setzeSeitenSchema(segmente) {
  const schema = seiteSchema(daten, segmente, (teil) => window.location.origin + routeInSprache(teil, sprache()));
  let el = document.head.querySelector('script[type="application/ld+json"][data-seite]');
  if (!schema) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.dataset.seite = '';
    document.head.appendChild(el);
  }
  // '<' als < ausschreiben: textContent eines <script> wird NICHT als HTML
  // geparst, ein '</script>' in einem Titel beendete das Element aber trotzdem.
  // Gültiges JSON, und die Möglichkeit ist damit zu.
  el.textContent = JSON.stringify(schema).replaceAll('<', '\\u003c');
}

// Die Ansichten schreiben ihre Links weiter als href="#/…" — das ist eine
// stabile, gut testbare Schreibweise und hält den Umbau aus 13 Ansichtsdateien
// heraus. Nach jedem Rendern werden sie hier EINMAL auf echte Pfade normalisiert;
// im DOM (und damit im späteren Prerender-Schnappschuss) stehen also nie Hashes.
// Idempotent: bereits umgeschriebene Links tragen kein '#/' mehr.
// Die Links IM RAHMEN (Kopfzeile, Menü-Lade, Bottom-Bar) stehen statisch in
// index.html und überleben jedes Neu-Rendern — anders als der Inhalt von
// #ansicht, der bei jedem Lauf frisch mit '#/…' erzeugt wird. Wechselt die
// Sprache zur Laufzeit, müssen sie darum ERNEUT aufgelöst werden; sonst zeigt
// die halbe Oberfläche weiter in die alte Sprache (der Inhalt war englisch,
// die Navigation deutsch — ein Klick warf einen zurück). Weil ein fertiger
// Pfad seine Sprache nicht mehr verrät, merkt sich der Rahmen dafür seine
// Rohform in `data-roh`; scripts/routen.mjs schreibt sie in die Snapshots mit.
export function normalisiereLinks(wurzelEl = document) {
  for (const a of wurzelEl.querySelectorAll('a[href^="#/"]')) {
    const roh = a.getAttribute('href');
    if (!a.closest('#ansicht')) a.dataset.roh = roh;
    a.setAttribute('href', zuUrl(roh));
  }
  for (const a of wurzelEl.querySelectorAll('a[data-roh]')) {
    a.setAttribute('href', zuUrl(a.dataset.roh));
  }
}

// Programmatische Navigation: Pfad in die History schieben und neu rendern.
function navigiere(ziel, { ersetzen = false } = {}) {
  const url = zuUrl(ziel);
  if (url === window.location.pathname + window.location.search) return;
  if (ersetzen) window.history.replaceState({}, '', url);
  else window.history.pushState({}, '', url);
  rendern();
}

function aktualisiereNavigation(segmente) {
  const navFuer = {
    training: 'training',
    plan: 'training',
    regeln: 'regeln',
    turnier: 'regeln',
    ausruestung: 'ausruestung',
    ueber: 'ueber',
    mitmachen: 'mitmachen',
    profil: 'profil',
    merkliste: 'merkliste',
    'ko-turnier': 'ko-turnier',
    suche: 'suche',
  };
  // Der Kompetenzpfad hat einen eigenen Menüpunkt — beide Pfad-Routen teilen
  // sich aber das erste Segment 'pfad', darum hier am zweiten unterscheiden.
  const aktiv = segmente[0] === 'pfad' && segmente[1] === 'kompetenz' ? 'kompetenz' : navFuer[segmente[0]] || 'lernen';
  for (const verweis of document.querySelectorAll('[data-nav]')) {
    const istAktiv = verweis.dataset.nav === aktiv;
    verweis.classList.toggle('aktiv', istAktiv);
    if (istAktiv) verweis.setAttribute('aria-current', 'page');
    else verweis.removeAttribute('aria-current');
  }
  for (const verweis of document.querySelectorAll('[data-footer]')) {
    const istAktiv = verweis.dataset.footer === segmente[0];
    verweis.classList.toggle('aktiv', istAktiv);
    if (istAktiv) verweis.setAttribute('aria-current', 'page');
    else verweis.removeAttribute('aria-current');
  }
  // Der Bar-Knopf „Mehr" spiegelt die im Menü liegenden Ziele (inkl. Rechtstexte).
  const imMehr = ['suche', 'regeln', 'turnier', 'ausruestung', 'merkliste', 'ko-turnier', 'ueber', 'mitmachen', 'impressum', 'datenschutz'].includes(segmente[0]);
  const mehr = document.querySelector('.fussnav-mehr');
  if (mehr) {
    mehr.classList.toggle('aktiv', imMehr);
    if (imMehr) mehr.setAttribute('aria-current', 'page');
    else mehr.removeAttribute('aria-current');
  }
  aktualisiereMerkAnzahl();
}

// Merk-Zähler am Menüpunkt: zeigt die Anzahl gemerkter Bausteine (ab 1), sonst
// verborgen. Läuft bei jedem Rendern mit und reagiert auf das 'app:merk'-Ereignis
// (Umschalten aus der Baustein-Ansicht ohne Neu-Rendern).
function aktualisiereMerkAnzahl() {
  const anzahl = merkliste().length;
  for (const abzeichen of document.querySelectorAll('[data-merk-anzahl]')) {
    abzeichen.textContent = anzahl > 0 ? String(anzahl) : '';
    abzeichen.hidden = anzahl === 0;
  }
}

// Titel + Meta-Description + Canonical sind je Route eigenständig (seo.js, SEO
// Tier 2 Baustein 2) — dieselbe Zuordnung nutzt auch der Deploy-Prerender.
function beschrifteRahmen(segmente) {
  // Die Ausnahme für den handgepflegten Tier-1-Kopf gilt nur für die DEUTSCHE
  // Wurzel. '/en' hat nach dem Abtrennen des Sprachpräfixes ebenfalls leere
  // Segmente, bekäme sonst also den deutschen Kopf samt Canonical auf '/'.
  const istDeutscheWurzel = segmente.length === 0 && sprache() === QUELLSPRACHE;
  const { titel, beschreibung, kanonisch } = istDeutscheWurzel
    ? urspruenglicherKopf
    : { ...seiteMeta(daten, segmente), kanonisch: window.location.origin + window.location.pathname };
  document.title = titel;
  document.querySelector('meta[name="description"]')?.setAttribute('content', beschreibung);
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', kanonisch);
  setzeSprachAlternativen(segmente);
  setzeSeitenSchema(segmente);
  // Fertig-Signal: welche Route steht gerade wirklich im DOM. Nötig, weil ein
  // Sprachwechsel asynchron ist (Labels nachladen) — wer von außen zusieht, kann
  // an `lang` allein nicht erkennen, ob der Inhalt schon nachgezogen hat. Der
  // Prerender wartet darauf, bevor er einen Schnappschuss nimmt.
  document.documentElement.dataset.route = window.location.pathname;
  document.querySelector('.marke-text').textContent = t('app_titel');
  const beschriftungen = {
    lernen: t('nav_lernen'),
    kompetenz: t('pfad_kompetenz'),
    training: t('nav_training'),
    regeln: t('nav_regeln'),
    ausruestung: t('nav_ausruestung'),
    merkliste: t('nav_merkliste'),
    'ko-turnier': t('nav_ko_turnier'),
    suche: t('nav_suche'),
    ueber: t('nav_ueber'),
    mitmachen: t('nav_mitmachen'),
    profil: t('nav_profil'),
    mehr: t('nav_mehr'),
  };
  for (const verweis of document.querySelectorAll('[data-nav]')) {
    const ziel = verweis.querySelector('.nav-text');
    if (ziel && beschriftungen[verweis.dataset.nav]) ziel.textContent = beschriftungen[verweis.dataset.nav];
  }
  document.querySelector('.menue-titel').textContent = t('menue');
  document.getElementById('hamburger').setAttribute('aria-label', t('menue'));
  // Statische aria-Labels des Rahmens mitübersetzen — sie standen sonst dauerhaft
  // auf Deutsch, auch in en/fr/pl (die Lade trägt ihren Namen über aria-labelledby
  // auf .menue-titel, das oben schon gesetzt wird).
  document.querySelector('.fussnav')?.setAttribute('aria-label', t('nav_hauptnavigation'));
  document.getElementById('kopf-suche')?.setAttribute('aria-label', t('nav_suche'));
  document.querySelector('.menue-schliessen').setAttribute('aria-label', t('menue_schliessen'));
  // Impressum/Datenschutz stehen mit Icon im „Mehr"-Menü — nur den .nav-text-Träger
  // ersetzen, wenn vorhanden (Icon nicht zerstören).
  for (const verweis of document.querySelectorAll('[data-footer]')) {
    const beschriftung = { impressum: t('footer_impressum'), datenschutz: t('footer_datenschutz') }[verweis.dataset.footer];
    if (!beschriftung) continue;
    const ziel = verweis.querySelector('.nav-text');
    if (ziel) ziel.textContent = beschriftung;
    else verweis.textContent = beschriftung;
  }
  setzeSprachanzeige();
  aktualisiereThemaMenue();
}

// Themen-Steuerung im Menü (Darstellung): aktuelle Wahl beschriften + markieren.
// Das Umschalten selbst wird einmalig in boot() verdrahtet. Läuft bei jedem
// Rendern mit, damit Sprachwechsel und Auswahl aktuell bleiben.
function aktualisiereThemaMenue() {
  const aktiv = einstellungen().thema || 'hell';
  const beschriftung = { auto: t('thema_auto_kurz'), hell: t('thema_hell'), dunkel: t('thema_dunkel') };
  const knopf = document.querySelector('[data-thema-zyklus]');
  if (!knopf) return;
  const etikett = knopf.querySelector('[data-thema-label]');
  if (etikett) etikett.textContent = beschriftung[aktiv] || beschriftung.auto;
  knopf.setAttribute('aria-label', `${t('thema')}: ${beschriftung[aktiv] || ''} — ${t('thema_wechseln')}`);
}

// Sprachwahl im Kopf (app-info funktion_aktiv:true): die Weltkugel zeigt die aktuelle
// Sprache; das Untermenü listet de/en/fr/pl mit Flagge + Eigenname und schaltet beim
// Klick funktional um (parallel zum Profil-Selektor). Die aktive ist markiert (✓).
function spracheEintrag() {
  const s = daten?.appInfo?.sprachen;
  if (!s) return null;
  const liste = s.liste || [];
  const aktiv = sprache();
  return liste.find((e) => e.code === aktiv) || liste.find((e) => e.code === s.aktuell) || liste[0] || null;
}

// Der Kopf zeigt konstant eine Weltkugel; das Untermenü listet die Sprachen und
// markiert die aktive mit Häkchen + Hervorhebung. Wird bei jedem Rendern frisch
// aufgebaut, damit die Markierung der aktiven Sprache aktuell bleibt.
function setzeSprachanzeige() {
  const knopf = document.getElementById('sprach-knopf');
  const liste = document.getElementById('sprach-liste');
  const s = daten?.appInfo?.sprachen;
  if (!knopf || !s) return;
  const eintrag = spracheEintrag();
  if (eintrag) knopf.setAttribute('aria-label', `${t('sprache')}: ${eintrag.eigenname ?? text(eintrag.label) ?? eintrag.kuerzel}`);
  if (!liste) return;
  const aktivCode = eintrag?.code;
  // Flagge + Sprachname in der jeweiligen Heimatsprache (Eigenname), aktive markiert.
  liste.innerHTML = (s.liste || [])
    .map((e) => {
      const istAktiv = e.code === aktivCode;
      return `<li>
        <button type="button" class="sprach-eintrag${istAktiv ? ' aktiv' : ''}" data-sprach-code="${esc(e.code)}"${istAktiv ? ' aria-current="true"' : ''}>
          <span class="sprach-flagge" aria-hidden="true">${esc(e.flagge || '')}</span>
          <span class="sprach-name">${esc(e.eigenname ?? text(e.label) ?? e.kuerzel)}</span>
          <span class="sprach-haken" aria-hidden="true">${istAktiv ? '✓' : ''}</span>
        </button>
      </li>`;
    })
    .join('');
}

function initSprachanzeige() {
  const wurzel = document.getElementById('sprach-anzeige');
  const knopf = document.getElementById('sprach-knopf');
  const liste = document.getElementById('sprach-liste');
  if (!wurzel || !knopf || !liste || !daten?.appInfo?.sprachen) return;
  const schliesse = () => {
    liste.hidden = true;
    knopf.setAttribute('aria-expanded', 'false');
  };
  knopf.addEventListener('click', (ereignis) => {
    ereignis.stopPropagation();
    const offen = knopf.getAttribute('aria-expanded') === 'true';
    liste.hidden = offen;
    knopf.setAttribute('aria-expanded', String(!offen));
  });
  // Sprachwahl im Kopf schaltet die App funktional um (lädt die Labels, persistiert
  // die Einstellung und rendert global neu — beschriftet Navigation/Menü/Kopf mit).
  liste.addEventListener('click', async (ereignis) => {
    const ziel = ereignis.target.closest('[data-sprach-code]');
    if (!ziel) return;
    const neu = ziel.dataset.sprachCode;
    schliesse();
    if (neu === sprache()) return;
    try {
      await setzeSprache(neu);
      setzeEinstellung('sprache', neu);
    } catch {
      /* Sprache nicht ladbar → bei der aktuellen bleiben */
      rendern();
      return;
    }
    // NAVIGIEREN, nicht nur neu rendern: die Sprache steckt in der URL, damit
    // jede Fassung eine eigene, teilbare und indexierbare Adresse hat. Die
    // aktuelle Route bleibt dabei erhalten — wer auf /regeln steht, landet auf
    // /en/regeln, nicht auf der Startseite. Die Query muss ausdrücklich mit:
    // routeInSprache() baut nur aus den Segmenten, und `?kontext=` steckt da
    // nicht drin — ohne sie verlöre ein Sprachwechsel auf einer Baustein-Seite
    // den Rückweg „Zur Liste" (und die Fußnavigation ihre Sequenz).
    navigiere(routeInSprache(parsePfad().segmente, neu) + window.location.search, { ersetzen: true });
  });
  document.addEventListener('click', (ereignis) => {
    if (!wurzel.contains(ereignis.target)) schliesse();
  });
  window.addEventListener('keydown', (ereignis) => {
    if (ereignis.key === 'Escape') schliesse();
  });
  window.addEventListener('popstate', schliesse); // bei Navigation zuklappen
  window.addEventListener('app:navigiert', schliesse);
  setzeSprachanzeige();
}

// Menü öffnen zwei Auslöser: der Hamburger (Kopf, ab Tablet) und „Mehr"
// (Bottom-Bar, mobil). Beide teilen dieselbe Lade und denselben aria-Zustand.
function setzeMenueTrigger(offen) {
  for (const id of ['hamburger', 'mehr-knopf']) {
    const el = document.getElementById(id);
    if (el) el.setAttribute('aria-expanded', String(offen));
  }
}

// Fokusführung des Menüs (SC 2.4.3): Die Lade ist ein modales Overlay — per Maus
// blockiert der Schleier den Hintergrund, per Tastatur tat er das nicht. Ohne
// Führung liefen bis zu 13 Tab-Schritte unsichtbar hinter dem Schleier durch die
// Startseiten-Kacheln, bevor der Fokus die Lade überhaupt erreichte. Dasselbe
// Muster setzt zeigeUeberlagerung() in js/oberflaeche.js schon korrekt um; hier
// wird es für das Hauptmenü nachgezogen (eigene Umsetzung, weil das Menü statisch
// in index.html steht und nicht über dialog-wurzel läuft).
let menueVorherigerFokus = null;

function fokussierbare(wurzel) {
  return [...wurzel.querySelectorAll('a[href], button:not([disabled]), input, select, [tabindex]:not([tabindex="-1"])')]
    .filter((el) => el.offsetParent !== null || el === document.activeElement);
}

function menueTasten(ereignis) {
  if (ereignis.key !== 'Tab') return;
  const lade = document.querySelector('#hauptmenue .menue-lade');
  if (!lade) return;
  const ziele = fokussierbare(lade);
  if (ziele.length === 0) return;
  const erstes = ziele[0];
  const letztes = ziele[ziele.length - 1];
  // Zirkulieren statt in den verdeckten Hintergrund zu entkommen.
  if (ereignis.shiftKey && (document.activeElement === erstes || document.activeElement === lade)) {
    ereignis.preventDefault();
    letztes.focus();
  } else if (!ereignis.shiftKey && document.activeElement === letztes) {
    ereignis.preventDefault();
    erstes.focus();
  }
}

function oeffneMenue() {
  const menue = document.getElementById('hauptmenue');
  menueVorherigerFokus = document.activeElement;
  menue.hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => menue.classList.add('offen')));
  setzeMenueTrigger(true);
  document.addEventListener('keydown', menueTasten, true);
  menue.querySelector('.menue-lade')?.focus();
}

function schliesseMenue() {
  const menue = document.getElementById('hauptmenue');
  if (menue.hidden) return;
  menue.classList.remove('offen');
  setzeMenueTrigger(false);
  document.removeEventListener('keydown', menueTasten, true);
  // Fokus zurück auf den Auslöser (Hamburger bzw. „Mehr"), nicht auf <body>.
  if (menueVorherigerFokus && typeof menueVorherigerFokus.focus === 'function') {
    menueVorherigerFokus.focus();
  }
  menueVorherigerFokus = null;
  window.setTimeout(() => {
    menue.hidden = true;
  }, 400);
}

function renderFehler(el, fehler) {
  el.innerHTML = `
    <div class="karte">
      <h1>${esc(t('fehler_laden_titel'))}</h1>
      <p class="leise">${esc(t('fehler_laden_text'))}</p>
      <p class="leise"><code>${esc(fehler?.message ?? fehler)}</code></p>
      <button class="knopf knopf-primaer" id="neu-laden">${esc(t('erneut_versuchen'))}</button>
    </div>`;
  el.querySelector('#neu-laden').addEventListener('click', () => window.location.reload());
}

// Fokus über eine Zustands-Neuzeichnung retten.
//
// Eine Ansicht zeichnet sich neu, indem sie #ansicht komplett ersetzt. Das
// fokussierte Element ist danach ein anderes Objekt — der Fokus fällt auf
// <body>. Mit der Maus merkt das niemand; ohne Zeigergerät beginnt jede weitere
// Bedienung wieder ganz oben. Beim Abhaken eines Erklärteils sind das elf Tabs
// pro Klick, beim KO-Turnier bei 16 Teilnehmenden acht Matches je Runde.
//
// Die Handhabe ist bewusst KEIN Selektor-String (dann müsste jeder Attributwert
// CSS-escaped werden, und ein Baustein-Titel mit Anführungszeichen bräche ihn),
// sondern die dataset-Karte selbst: nach dem Zeichnen wird das Element gesucht,
// dessen data-Attribute alle übereinstimmen. Die Aktions-Knöpfe der App tragen
// ohnehin durchgängig welche (data-quittiere, data-index, data-ko-sieger …).
//
// Verschwindet das Element ganz — der eben entfernte Merklisten-Eintrag ist ja
// weg —, greift der Platz-Ersatz: unter den gleichartigen Knöpfen (gleiches Tag,
// gleiche data-Schlüssel) der an derselben Stelle, notfalls der letzte. Der
// Fokus landet dann auf dem nachgerückten Nachbarn, so wie man es von jeder
// Liste kennt, statt am Seitenanfang. Erst wenn gar keiner mehr da ist (Liste
// leer), bleibt es beim Zurückfallen — dann gibt es auch nichts zu fokussieren.
function fokusHandhabe() {
  const a = document.activeElement;
  if (!a || typeof a.closest !== 'function' || !a.closest('#ansicht')) return null;
  const daten = { ...a.dataset };
  if (!a.id && !Object.keys(daten).length) return null;
  const tag = a.tagName.toLowerCase();
  const gleichartige = geschwisterGleicherArt(a.closest('#ansicht'), tag, Object.keys(daten));
  return { id: a.id, tag, daten, platz: gleichartige.indexOf(a) };
}

// Alle Elemente, die dieselbe Rolle spielen: gleiches Tag, exakt dieselben
// data-Schlüssel (Werte dürfen abweichen — das sind gerade die Listenplätze).
function geschwisterGleicherArt(wurzel, tag, schluessel) {
  if (!wurzel || !schluessel.length) return [];
  return [...wurzel.querySelectorAll(tag)].filter((el) => {
    const eigene = Object.keys(el.dataset);
    return eigene.length === schluessel.length && schluessel.every((k) => k in el.dataset);
  });
}

function stelleFokusHer(handhabe) {
  if (!handhabe) return;
  const wurzel = document.getElementById('ansicht');
  if (handhabe.id) {
    const el = wurzel.querySelector(`[id="${handhabe.id}"]`);
    if (el) {
      el.focus({ preventScroll: true });
      return;
    }
  }
  const schluessel = Object.keys(handhabe.daten);
  if (!schluessel.length) return;
  const gleichartige = geschwisterGleicherArt(wurzel, handhabe.tag, schluessel);
  const genau = gleichartige.find((el) => schluessel.every((k) => el.dataset[k] === handhabe.daten[k]));
  const ziel = genau ?? gleichartige[Math.min(handhabe.platz, gleichartige.length - 1)];
  ziel?.focus({ preventScroll: true });
}

function rendern() {
  const { segmente, query, roh, sprache: ausUrl } = parsePfad();
  const el = document.getElementById('ansicht');
  // Vor dem Zeichnen merken — danach gibt es das Element nicht mehr.
  const gemerkterFokus = fokusHandhabe();

  // Sprache mit der URL abgleichen, BEVOR gerendert wird. Nötig, weil eine
  // Navigation die Sprachgrenze überqueren kann, ohne durch den Umschalter zu
  // gehen: der Zurück-Knopf über einen Sprachwechsel hinweg, ein Deep-Link aus
  // einem anderen Tab, und im Prerender der Durchlauf per pushState. Ohne den
  // Abgleich stünde englischer Inhalt unter deutscher Adresse — genau die
  // Verwechslung, die die Sprachpräfixe verhindern sollen. Nach dem Laden ruft
  // sich rendern() selbst erneut auf; scheitert es, bleibt die alte Sprache.
  if (ausUrl !== sprache()) {
    setzeSprache(ausUrl).then(rendern, () => {});
    return;
  }

  // Kein erzwungenes Onboarding: Der Erstbesuch landet auf der vollen Startseite
  // (renderHeim mit allen Kacheln), nicht auf einer Abfrage. Der Wizard bleibt
  // optional über die Hero-CTA „Onboarding" (#/onboarding) und das Profil
  // erreichbar. Nur die Onboarding-Ansicht selbst blendet die Bottom-Nav aus
  // (fokussierter Ablauf); überall sonst bleibt die normale Navigation sichtbar.
  document.body.classList.toggle('im-onboarding', segmente[0] === 'onboarding');
  beschrifteRahmen(segmente);

  if (segmente[0] === 'onboarding') {
    renderOnboarding(el, daten);
  } else if (segmente[0] === 'pfad' && segmente[1] === 'kompetenz') {
    renderKompetenzpfad(el, daten, segmente[2] || null);
  } else if (segmente[0] === 'pfad' && segmente[1] === 'themen') {
    renderThemen(el, daten, segmente[2] ? decodeURIComponent(segmente[2]) : null);
  } else if (segmente[0] === 'pfad' && segmente[1] === 'spielform') {
    renderSpielform(el, daten, segmente[2] ? decodeURIComponent(segmente[2]) : null);
  } else if (segmente[0] === 'pfad' && segmente[1] === 'umgebung') {
    renderUmgebung(el, daten, null, null);
  } else if (segmente[0] === 'pfad' && (segmente[1] === 'witterung' || segmente[1] === 'untergrund')) {
    renderUmgebung(el, daten, segmente[1], segmente[2] ? decodeURIComponent(segmente[2]) : null);
  } else if (segmente[0] === 'pfad' && segmente[1] === 'individual') {
    renderIndividual(el, daten);
  } else if (segmente[0] === 'plan') {
    renderPlan(el, daten);
  } else if (segmente[0] === 'training') {
    renderTraining(el, daten, segmente[1] ? decodeURIComponent(segmente[1]) : null);
  } else if (segmente[0] === 'suche') {
    renderSuche(el, daten);
  } else if (segmente[0] === 'regeln') {
    renderRegeln(el, daten);
  } else if (segmente[0] === 'ausruestung') {
    renderAusruestung(el, daten);
  } else if (segmente[0] === 'turnier') {
    renderTurnier(el, daten);
  } else if (segmente[0] === 'ueber') {
    renderUeber(el, daten);
  } else if (segmente[0] === 'mitmachen') {
    renderMitmachen(el, daten);
  } else if (segmente[0] === 'impressum') {
    renderRechtstext(el, daten, 'impressum');
  } else if (segmente[0] === 'datenschutz') {
    renderRechtstext(el, daten, 'datenschutz');
  } else if (segmente[0] === 'baustein' && segmente[1]) {
    renderBaustein(el, daten, decodeURIComponent(segmente[1]), query.get('kontext') || 'kompetenz');
  } else if (segmente[0] === 'profil') {
    renderProfil(el, daten);
  } else if (segmente[0] === 'merkliste') {
    renderMerkliste(el, daten);
  } else if (segmente[0] === 'ko-turnier') {
    renderKoTurnier(el, daten);
  } else {
    renderHeim(el, daten);
  }

  // Die Ansichten haben gerade '#/…'-Links geschrieben — hier einmal auf echte
  // Pfade ziehen (samt dem statischen Rahmen aus index.html, der beim ersten
  // Lauf noch Hashes trägt).
  normalisiereLinks(document);
  aktualisiereNavigation(segmente);
  if (roh !== letzteRoute) {
    const ersterLauf = letzteRoute === null;
    window.scrollTo(0, 0);
    letzteRoute = roh;
    zaehleAufruf(window.location.pathname);
    // Einstiegs-Übergang nur bei Routenwechsel, nicht bei Zustands-Neuzeichnung.
    el.classList.remove('einstieg');
    void el.offsetWidth;
    el.classList.add('einstieg');
    // Tastatur-/Screenreader-Fokus auf den neuen Inhalt lenken (nicht beim Erstaufbau).
    if (!ersterLauf) el.focus({ preventScroll: true });
  } else {
    // Gleiche Route, also eine Zustands-Neuzeichnung: den Fokus dorthin
    // zurückgeben, wo er war. Bei einem Routenwechsel wäre das falsch — dort
    // gehört er an den Anfang des neuen Inhalts (Zweig oben).
    stelleFokusHer(gemerkterFokus);
  }
}

// Wer eine andere Sprache eingestellt hat und eine präfixlose Adresse aufruft,
// wird EINMAL auf die eigene Sprachfassung umgeschrieben — die Vorliebe bleibt
// also wirksam, ohne dass dieselbe URL für verschiedene Leute verschiedene
// Inhalte zeigt. Ein Crawler hat keinen localStorage und bekommt an der Wurzel
// darum immer die deutsche Fassung; die Umschreibung ist für ihn unsichtbar.
// replaceState statt pushState: der Zurück-Knopf soll nicht in einer Schleife
// zwischen den beiden Adressen hängen.
//
// Die Query muss ausdrücklich mitgeführt werden — routeInSprache() baut allein
// aus den Segmenten, `?kontext=` steckt da nicht drin. Ohne sie verlor ein
// geteilter Deep-Link seinen Rückweg, sobald die empfangende Person eine andere
// Sprache eingestellt hatte. Der Hash ist an dieser Stelle bereits aufgelöst
// (der Alt-Link-Umschreiber in boot() läuft davor) und darf nicht mehr auftauchen.
function folgeSprachVorliebe() {
  const { segmente, sprache: ausUrl } = parsePfad();
  const gewuenscht = einstellungen().sprache;
  if (ausUrl !== QUELLSPRACHE) return; // URL sagt schon, was gilt
  if (!ZIELSPRACHEN.includes(gewuenscht)) return; // keine abweichende Vorliebe
  window.history.replaceState({}, '', routeInSprache(segmente, gewuenscht) + window.location.search);
}

async function boot() {
  ladeZustand();
  const el = document.getElementById('ansicht');
  try {
    // Die URL entscheidet, nicht die gespeicherte Vorliebe: dieselbe Adresse
    // muss für jeden dieselbe Sprache zeigen, sonst sieht ein Crawler etwas
    // anderes als der Mensch. Die Vorliebe wirkt nur an einer präfixlosen
    // Adresse — s. folgeSprachVorliebe() weiter unten.
    await initI18n(parsePfad().sprache);
    daten = await ladeDaten();
  } catch (fehler) {
    try {
      await initI18n('de');
    } catch {
      // Ohne Labels bleibt nur die nackte Fehlermeldung — t() fällt auf Schlüssel zurück.
    }
    renderFehler(el, fehler);
    return;
  }
  for (const warnung of daten.warnungen) console.warn('[daten]', warnung);
  // Altbestand: vor Tier 2 geteilte Links tragen '#/…' (die Teilen-Funktion gab
  // sie so aus). Einmal auf den echten Pfad umschreiben, damit sie weiter tragen.
  //
  // MUSS VOR folgeSprachVorliebe() LAUFEN. Die schreibt eine präfixlose Adresse
  // auf die eingestellte Sprache um — und weil sie die URL aus den Segmenten neu
  // baut, fällt ein noch nicht aufgelöster Hash dabei weg. Stand der Umschreiber
  // danach, landete '/#/baustein/griff' bei jemandem mit englischer Voreinstellung
  // auf '/en' statt auf dem Baustein: der geteilte Link war schlicht verloren.
  // In dieser Reihenfolge wird erst '/baustein/griff' daraus, dann '/en/baustein/griff'.
  if (/^#\//.test(window.location.hash)) {
    const ziel = window.location.hash.replace(/^#\/?/, '');
    window.history.replaceState({}, '', zuUrl(ziel));
  }
  folgeSprachVorliebe();

  document.getElementById('hamburger').addEventListener('click', oeffneMenue);
  document.getElementById('mehr-knopf')?.addEventListener('click', oeffneMenue);
  // Skip-Link: Fokus auf den Inhalt lenken, OHNE den Hash zu ändern — der Router
  // würde "#ansicht" sonst als (unbekannte) Route deuten und die Startseite zeigen.
  // #ansicht trägt tabindex="-1", ist also programmatisch fokussierbar.
  document.querySelector('.zum-inhalt')?.addEventListener('click', (ereignis) => {
    ereignis.preventDefault();
    el.focus();
    el.scrollIntoView();
  });
  initSprachanzeige();
  // Navigierende Menüpunkte UND die Knopfleisten-Links (Profil/Suche) schließen das
  // Menü; der Theme-Zyklus-Knopf (ein <button>) bleibt bewusst außen vor.
  for (const element of document.querySelectorAll('[data-menue-zu], .menue-punkt, .menue-mini, a.menue-knopf')) {
    element.addEventListener('click', schliesseMenue);
  }
  // Darstellung im Menü: ein Knopf schaltet auto → hell → dunkel durch, wendet die
  // Wahl sofort an und schließt das Menü bewusst nicht (Wirkung bleibt sichtbar).
  document.querySelector('[data-thema-zyklus]')?.addEventListener('click', () => {
    const reihenfolge = ['auto', 'hell', 'dunkel'];
    const jetzt = einstellungen().thema || 'hell';
    const naechste = reihenfolge[(reihenfolge.indexOf(jetzt) + 1) % reihenfolge.length];
    setzeEinstellung('thema', naechste);
    wendeThemaAn(naechste);
    aktualisiereThemaMenue();
  });
  window.addEventListener('keydown', (ereignis) => {
    if (ereignis.key === 'Escape') schliesseMenue();
  });

  window.addEventListener('popstate', rendern);
  window.addEventListener('app:rendern', rendern);
  window.addEventListener('app:gehe-zu', (ereignis) => navigiere(ereignis.detail?.ziel ?? '/'));
  // Interne Links abfangen und über die History navigieren, statt die Seite neu
  // zu laden. Fremde Ziele, neue Tabs (Modifier/Mittelklick), Downloads und
  // target=_blank bleiben unangetastet.
  document.addEventListener('click', (ereignis) => {
    if (ereignis.defaultPrevented || ereignis.button !== 0) return;
    if (ereignis.metaKey || ereignis.ctrlKey || ereignis.shiftKey || ereignis.altKey) return;
    const a = ereignis.target.closest?.('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    const roh = a.getAttribute('href');
    // Ein paar Ansichten patchen ihren Ergebnis-Bereich LOKAL statt über den
    // globalen rendern()-Zyklus (Suche hält so den Eingabe-Fokus, KO-Turnier den
    // Setup-Entwurf) — deren frisch eingefügte Links haben `normalisiereLinks()`
    // dabei nie gesehen und tragen noch rohes `#/…`. `new URL('#/x', …)` würde
    // das als reines Fragment lesen (pathname bliebe unverändert, der Klick liefe
    // ins Leere) — darum wird ein '#/'-Präfix hier direkt erkannt, nicht über die
    // URL-Auflösung.
    if (roh.startsWith('#/')) {
      ereignis.preventDefault();
      navigiere(roh);
      window.dispatchEvent(new CustomEvent('app:navigiert'));
      return;
    }
    const url = new URL(roh, window.location.href);
    if (url.origin !== window.location.origin) return;
    if (!url.pathname.startsWith(WURZEL)) return; // z. B. die PDFs unter rules/
    if (/\.[a-z0-9]{2,5}$/i.test(url.pathname)) return; // echte Dateien (PDF, PNG …)
    ereignis.preventDefault();
    navigiere(url.pathname + url.search);
    window.dispatchEvent(new CustomEvent('app:navigiert'));
  });
  // Merk-Zähler ohne Neu-Rendern nachziehen (Umschalten aus der Baustein-Ansicht).
  window.addEventListener('app:merk', aktualisiereMerkAnzahl);
  rendern();

  // Feedback-Modus (nur bei ?feedback in der URL): Kommentator nachladen. Läuft
  // beiläufig — schlägt es fehl, bleibt die App davon unberührt. Der Knopf unter
  // „Mitmachen" startet ihn alternativ ohne Reload (aktiviereFeedback).
  initFeedbackWennGewuenscht();

  registriereServiceWorker();
}

// Offline-Fähigkeit: den Service Worker beiläufig registrieren. Jeder Fehler
// (kein SW-Support, file://) wird verschluckt — die App bleibt unberührt.
// Relativer Pfad, damit die Registrierung unter „/" wie unter Unterpfad greift.
// boot() ist async und wartet auf i18n+Daten; das 'load'-Ereignis kann dabei
// schon gefeuert haben. Darum: ist die Seite fertig, sofort registrieren, sonst
// auf 'load' warten — sonst verpasste ein zu spät gesetzter Listener das Ereignis.
function registriereServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  const registriere = () => navigator.serviceWorker.register('sw.js').catch(() => {});
  if (document.readyState === 'complete') registriere();
  else window.addEventListener('load', registriere, { once: true });
}

boot();
