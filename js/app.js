// App-Einstieg: Boot (Zustand → Sprache → Daten), Hash-Router und Navigation.
// Ansichten rendern in #ansicht; Zustandsänderungen stoßen über das Ereignis
// 'app:rendern' ein Neu-Rendern der aktuellen Route an.

import { renderBaustein } from './ansichten/baustein.js';
import { renderHeim } from './ansichten/heim.js';
import { renderMitmachen, renderRechtstext, renderUeber } from './ansichten/info.js';
import { renderOnboarding } from './ansichten/onboarding.js';
import { renderIndividual, renderKompetenzpfad, renderSpielform, renderThemen, renderUmgebung } from './ansichten/pfad.js';
import { renderProfil } from './ansichten/profil.js';
import { renderRegeln } from './ansichten/regeln.js';
import { renderTraining } from './ansichten/training.js';
import { renderWillkommen } from './ansichten/willkommen.js';
import { ladeDaten } from './daten.js';
import { initI18n, sprache, t, text } from './i18n.js';
import { esc } from './oberflaeche.js';
import { einstellungen, istOnboardingAbgeschlossen, ladeZustand } from './zustand.js';

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
  const aktiv =
    segmente[0] === 'training'
      ? 'training'
      : segmente[0] === 'regeln'
        ? 'regeln'
        : segmente[0] === 'ueber'
          ? 'ueber'
          : segmente[0] === 'mitmachen'
            ? 'mitmachen'
            : segmente[0] === 'profil'
              ? 'profil'
              : 'lernen';
  for (const verweis of document.querySelectorAll('[data-nav]')) {
    const istAktiv = verweis.dataset.nav === aktiv;
    verweis.classList.toggle('aktiv', istAktiv);
    if (istAktiv) verweis.setAttribute('aria-current', 'page');
    else verweis.removeAttribute('aria-current');
  }
  for (const verweis of document.querySelectorAll('[data-footer]')) {
    verweis.classList.toggle('aktiv', verweis.dataset.footer === segmente[0]);
  }
  // Der Bar-Knopf „Mehr" spiegelt die im Menü liegenden Ziele (inkl. Rechtstexte).
  const imMehr = ['regeln', 'ueber', 'mitmachen', 'impressum', 'datenschutz'].includes(segmente[0]);
  const mehr = document.querySelector('.fussnav-mehr');
  if (mehr) {
    mehr.classList.toggle('aktiv', imMehr);
    if (imMehr) mehr.setAttribute('aria-current', 'page');
    else mehr.removeAttribute('aria-current');
  }
}

function beschrifteRahmen() {
  document.title = t('app_titel');
  document.querySelector('.marke-text').textContent = t('app_titel');
  const beschriftungen = {
    lernen: t('nav_lernen'),
    training: t('nav_training'),
    regeln: t('nav_regeln'),
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
}

// Sprachanzeige (rein darstellend, app-info funktion_aktiv:false): zeigt die aktuell
// dargestellte Sprache als Flagge + Kürzel neben dem Hamburger. Die Liste lässt sich
// aufklappen, schaltet aber nichts um — das funktionale Umschalten bleibt im Profil.
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
      return `<li class="sprach-eintrag${istAktiv ? ' aktiv' : ''}"${istAktiv ? ' aria-current="true"' : ''}>
        <span class="sprach-flagge" aria-hidden="true">${esc(e.flagge || '')}</span>
        <span class="sprach-name">${esc(e.eigenname ?? text(e.label) ?? e.kuerzel)}</span>
        <span class="sprach-haken" aria-hidden="true">${istAktiv ? '✓' : ''}</span>
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

  // Erstlauf: Willkommensseite mit den zwei Einstiegen; der Wizard ist einer
  // davon. Tiefe Routen führen bis zur Wahl zurück auf die Startseite.
  const erstlauf = !istOnboardingAbgeschlossen();
  if (erstlauf && segmente.length > 0 && segmente[0] !== 'onboarding') {
    window.location.hash = '#/';
    return;
  }
  document.body.classList.toggle('im-onboarding', segmente[0] === 'onboarding' || erstlauf);
  beschrifteRahmen();

  if (erstlauf && segmente.length === 0) {
    renderWillkommen(el, daten);
    aktualisiereNavigation(segmente);
    return;
  }

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
  } else if (segmente[0] === 'training') {
    renderTraining(el, daten, segmente[1] ? decodeURIComponent(segmente[1]) : null);
  } else if (segmente[0] === 'regeln') {
    renderRegeln(el, daten);
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
  } else {
    renderHeim(el, daten);
  }

  aktualisiereNavigation(segmente);
  if (roh !== letzteRoute) {
    window.scrollTo(0, 0);
    letzteRoute = roh;
    // Einstiegs-Übergang nur bei Routenwechsel, nicht bei Zustands-Neuzeichnung.
    el.classList.remove('einstieg');
    void el.offsetWidth;
    el.classList.add('einstieg');
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
  initSprachanzeige();
  for (const element of document.querySelectorAll('[data-menue-zu], .menue-punkt')) {
    element.addEventListener('click', schliesseMenue);
  }
  window.addEventListener('keydown', (ereignis) => {
    if (ereignis.key === 'Escape') schliesseMenue();
  });

  window.addEventListener('hashchange', rendern);
  window.addEventListener('app:rendern', rendern);
  rendern();
}

boot();
