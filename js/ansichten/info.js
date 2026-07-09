// Info-Reiter „Über" und „Mitmachen": statischer Referenzinhalt aus app-info.json
// (eigene Entität, NICHT im Baustein-Pool — kein Fortschritt, keine Gamification).
// Platzhalter in [eckigen Klammern] bleiben bewusst sichtbar, bis der Betreiber
// sie füllt (Name, Lizenz, GitHub-URL) — sie werden nie erfunden oder verlinkt.

import { t, text } from '../i18n.js';
import { esc } from '../oberflaeche.js';

function istPlatzhalter(wert) {
  return typeof wert === 'string' && wert.trim().startsWith('[');
}

// Externer Absprung. Ein noch nicht gefüllter Platzhalter wird sichtbar gelassen
// (der Betreiber ersetzt ihn), aber nie als Link ausgegeben.
function externerLink(ziel, beschriftung, klasse) {
  if (!ziel || istPlatzhalter(ziel)) {
    return `<span class="${klasse} knopf-inaktiv" role="link" aria-disabled="true">${esc(beschriftung)}</span>
      <span class="info-platzhalter leise">${esc(ziel || '')}</span>`;
  }
  return `<a class="${klasse}" href="${esc(ziel)}" target="_blank" rel="noopener noreferrer">${esc(beschriftung)} <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>`;
}

function abschnittHtml(block) {
  if (!block) return '';
  const eintraege = (block.eintraege || []).map((e) => `<p class="leise">${esc(text(e) ?? '')}</p>`).join('');
  return `<section class="karte"><h2>${esc(text(block.titel) ?? '')}</h2>${eintraege}</section>`;
}

export function renderUeber(el, daten) {
  const u = daten.appInfo?.ueber;
  if (!u) {
    el.innerHTML = `<div class="karte"><p>${esc(t('nicht_gefunden'))}</p></div>`;
    return;
  }
  const absaetze = (u.absaetze || []).map((a) => `<p>${esc(text(a) ?? '')}</p>`).join('');
  const links = (u.links || []).map((l) => `<p class="info-cta">${externerLink(l.ziel, text(l.label) ?? '', 'knopf knopf-sekundaer')}</p>`).join('');
  el.innerHTML = `
    <h1>${esc(text(u.titel) ?? t('nav_ueber'))}</h1>
    ${absaetze}
    ${abschnittHtml(u.danksagungen)}
    ${abschnittHtml(u.credits_lizenz)}
    ${links ? `<section class="karte">${links}</section>` : ''}`;
}

export function renderMitmachen(el, daten) {
  const m = daten.appInfo?.mitmachen;
  if (!m) {
    el.innerHTML = `<div class="karte"><p>${esc(t('nicht_gefunden'))}</p></div>`;
    return;
  }
  const einleitung = (m.einleitung || []).map((e) => `<p class="leise">${esc(text(e) ?? '')}</p>`).join('');
  const karten = (m.moeglichkeiten || [])
    .map(
      (moe) => `
      <section class="karte">
        <h3>${esc(text(moe.titel) ?? '')}</h3>
        <p>${esc(text(moe.text) ?? '')}</p>
        <p class="info-cta">${externerLink(moe.cta_ziel, text(moe.cta_label) ?? '', 'knopf knopf-primaer')}</p>
      </section>`,
    )
    .join('');
  el.innerHTML = `
    <h1>${esc(text(m.titel) ?? t('nav_mitmachen'))}</h1>
    ${einleitung}
    ${karten}`;
}
