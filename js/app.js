// App-Einstieg: Boot (Zustand → Sprache → Daten), Hash-Router und Navigation.
// Ansichten rendern in #ansicht; Zustandsänderungen stoßen über das Ereignis
// 'app:rendern' ein Neu-Rendern der aktuellen Route an.

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
import { initI18n, setzeSprache, sprache, t, text } from './i18n.js';
import { esc, wendeThemaAn } from './oberflaeche.js';
import { einstellungen, ladeZustand, merkliste, setzeEinstellung } from './zustand.js';

let daten = null;
let letzteRoute = null;

function parseHash() {
  const roh = window.location.hash.replace(/^#\/?/, '');
  const [pfadTeil, queryTeil] = roh.split('?');
  return {
    segmente: pfadTeil.split('/').filter(Boolean),
    query: new URLSearchParams(queryTeil || ''),
    roh,
  };
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
  const aktiv = navFuer[segmente[0]] || 'lernen';
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

function beschrifteRahmen() {
  document.title = t('app_titel');
  document.querySelector('.marke-text').textContent = t('app_titel');
  const beschriftungen = {
    lernen: t('nav_lernen'),
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
    if (neu !== sprache()) {
      try {
        await setzeSprache(neu);
        setzeEinstellung('sprache', neu);
      } catch {
        /* Sprache nicht ladbar → bei der aktuellen bleiben */
      }
    }
    schliesse();
    rendern();
  });
  document.addEventListener('click', (ereignis) => {
    if (!wurzel.contains(ereignis.target)) schliesse();
  });
  window.addEventListener('keydown', (ereignis) => {
    if (ereignis.key === 'Escape') schliesse();
  });
  window.addEventListener('hashchange', schliesse); // bei Navigation zuklappen
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

function oeffneMenue() {
  const menue = document.getElementById('hauptmenue');
  menue.hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => menue.classList.add('offen')));
  setzeMenueTrigger(true);
}

function schliesseMenue() {
  const menue = document.getElementById('hauptmenue');
  if (menue.hidden) return;
  menue.classList.remove('offen');
  setzeMenueTrigger(false);
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

function rendern() {
  const { segmente, query, roh } = parseHash();
  const el = document.getElementById('ansicht');

  // Kein erzwungenes Onboarding: Der Erstbesuch landet auf der vollen Startseite
  // (renderHeim mit allen Kacheln), nicht auf einer Abfrage. Der Wizard bleibt
  // optional über die Hero-CTA „Onboarding" (#/onboarding) und das Profil
  // erreichbar. Nur die Onboarding-Ansicht selbst blendet die Bottom-Nav aus
  // (fokussierter Ablauf); überall sonst bleibt die normale Navigation sichtbar.
  document.body.classList.toggle('im-onboarding', segmente[0] === 'onboarding');
  beschrifteRahmen();

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

  aktualisiereNavigation(segmente);
  if (roh !== letzteRoute) {
    const ersterLauf = letzteRoute === null;
    window.scrollTo(0, 0);
    letzteRoute = roh;
    // Einstiegs-Übergang nur bei Routenwechsel, nicht bei Zustands-Neuzeichnung.
    el.classList.remove('einstieg');
    void el.offsetWidth;
    el.classList.add('einstieg');
    // Tastatur-/Screenreader-Fokus auf den neuen Inhalt lenken (nicht beim Erstaufbau).
    if (!ersterLauf) el.focus({ preventScroll: true });
  }
}

async function boot() {
  ladeZustand();
  const el = document.getElementById('ansicht');
  try {
    await initI18n(einstellungen().sprache);
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

  window.addEventListener('hashchange', rendern);
  window.addEventListener('app:rendern', rendern);
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
