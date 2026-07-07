// App-Einstieg: Boot (Zustand → Sprache → Daten), Hash-Router und Navigation.
// Ansichten rendern in #ansicht; Zustandsänderungen stoßen über das Ereignis
// 'app:rendern' ein Neu-Rendern der aktuellen Route an.

import { renderBaustein } from './ansichten/baustein.js';
import { renderHeim } from './ansichten/heim.js';
import { renderOnboarding } from './ansichten/onboarding.js';
import { renderIndividual, renderKompetenzpfad, renderThemen } from './ansichten/pfad.js';
import { renderProfil } from './ansichten/profil.js';
import { renderTraining } from './ansichten/training.js';
import { renderWillkommen } from './ansichten/willkommen.js';
import { ladeDaten } from './daten.js';
import { initI18n, t } from './i18n.js';
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
  const aktiv = segmente[0] === 'training' ? 'training' : segmente[0] === 'profil' ? 'profil' : 'lernen';
  for (const verweis of document.querySelectorAll('[data-nav]')) {
    const istAktiv = verweis.dataset.nav === aktiv;
    verweis.classList.toggle('aktiv', istAktiv);
    if (istAktiv) verweis.setAttribute('aria-current', 'page');
    else verweis.removeAttribute('aria-current');
  }
}

function beschrifteRahmen() {
  document.title = t('app_titel');
  document.querySelector('.marke-text').textContent = t('app_titel');
  const beschriftungen = { lernen: t('nav_lernen'), training: t('nav_training'), profil: t('nav_profil') };
  for (const verweis of document.querySelectorAll('[data-nav]')) {
    verweis.querySelector('.nav-text').textContent = beschriftungen[verweis.dataset.nav];
  }
  document.querySelector('.menue-titel').textContent = t('menue');
  document.getElementById('hamburger').setAttribute('aria-label', t('menue'));
  document.querySelector('.menue-schliessen').setAttribute('aria-label', t('menue_schliessen'));
}

// Hamburger-Menü (Desktop): Lade gleitet von rechts herein, Punkte gestaffelt.
function oeffneMenue() {
  const menue = document.getElementById('hauptmenue');
  menue.hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => menue.classList.add('offen')));
  document.getElementById('hamburger').setAttribute('aria-expanded', 'true');
}

function schliesseMenue() {
  const menue = document.getElementById('hauptmenue');
  if (menue.hidden) return;
  menue.classList.remove('offen');
  document.getElementById('hamburger').setAttribute('aria-expanded', 'false');
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
  } else if (segmente[0] === 'pfad' && segmente[1] === 'individual') {
    renderIndividual(el, daten);
  } else if (segmente[0] === 'training') {
    renderTraining(el, daten, segmente[1] ? decodeURIComponent(segmente[1]) : null);
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
