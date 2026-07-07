// App-Einstieg: Boot (Zustand → Sprache → Daten), Hash-Router und Navigation.
// Ansichten rendern in #ansicht; Zustandsänderungen stoßen über das Ereignis
// 'app:rendern' ein Neu-Rendern der aktuellen Route an.

import { renderBaustein } from './ansichten/baustein.js';
import { renderHeim } from './ansichten/heim.js';
import { renderOnboarding } from './ansichten/onboarding.js';
import { renderIndividual, renderKompetenzpfad, renderThemen } from './ansichten/pfad.js';
import { renderProfil } from './ansichten/profil.js';
import { renderTraining } from './ansichten/training.js';
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
  document.querySelector('.marke').textContent = t('app_titel');
  const beschriftungen = { lernen: t('nav_lernen'), training: t('nav_training'), profil: t('nav_profil') };
  for (const verweis of document.querySelectorAll('[data-nav]')) {
    verweis.querySelector('.nav-text').textContent = beschriftungen[verweis.dataset.nav];
  }
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

  if (!istOnboardingAbgeschlossen() && segmente[0] !== 'onboarding') {
    window.location.hash = '#/onboarding';
    return;
  }
  document.body.classList.toggle('im-onboarding', segmente[0] === 'onboarding');
  beschrifteRahmen();

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

  window.addEventListener('hashchange', rendern);
  window.addEventListener('app:rendern', rendern);
  rendern();
}

boot();
