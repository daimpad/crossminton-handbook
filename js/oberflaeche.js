// Kleine Oberflächen-Helfer, die alle Ansichten teilen: Escaping, Absätze,
// Fortschrittsbalken, Status-Punkte, Überlagerungen und das Neu-Rendern-Signal.

import { label, t } from './i18n.js';

export function esc(wert) {
  return String(wert ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

// Erklärtexte trennen Absätze mit Leerzeilen.
export function absaetze(text) {
  return String(text ?? '')
    .split(/\n\s*\n/)
    .map((absatz) => `<p>${esc(absatz.trim())}</p>`)
    .join('');
}

export function balkenHtml(projektion, beschriftung = '') {
  const prozent = Math.round(projektion.quote * 100);
  const textZeile = beschriftung || t('bausteine_erledigt', { a: projektion.absolviert, b: projektion.gesamt });
  return `
    <div class="fortschritt-zeile">
      <div class="balken" role="progressbar" aria-valuenow="${prozent}" aria-valuemin="0" aria-valuemax="100" aria-label="${esc(textZeile)}">
        <div class="balken-fuellung" style="width:${prozent}%"></div>
      </div>
      <span class="leise">${esc(textZeile)}</span>
    </div>`;
}

export function statusPunktHtml(station) {
  const { erklaerteil, uebungsteil, reflexionsaufgabe, absolviert } = station.status;
  let klasse = 'offen';
  let beschriftung = t('status_offen');
  if (absolviert) {
    klasse = 'voll';
    beschriftung = t('status_absolviert');
  } else if (erklaerteil === 'erledigt' || uebungsteil === 'erledigt' || reflexionsaufgabe === 'erledigt') {
    klasse = 'teil';
    beschriftung = t('status_teilweise');
  }
  return `<span class="status-punkt status-${klasse}" role="img" aria-label="${esc(beschriftung)}" title="${esc(beschriftung)}"></span>`;
}

export function zeigeUeberlagerung(innenHtml) {
  const wurzel = document.getElementById('dialog-wurzel');
  wurzel.innerHTML = `<div class="ueberlagerung" role="dialog" aria-modal="true">${innenHtml}</div>`;
  wurzel.querySelector('[data-schliessen]')?.focus();
}

export function schliesseUeberlagerung() {
  const wurzel = document.getElementById('dialog-wurzel');
  if (wurzel) wurzel.innerHTML = '';
}

// Sequenzabschluss-Gratifikation (Spez. 8.3): würdigend, aber zurückhaltend.
export function zeigeMeilenstein(meilenstein) {
  const istKompetenz = meilenstein.art === 'kompetenz';
  const textZeile = istKompetenz
    ? t('meilenstein_kompetenz', { pfad: `${t('pfad_kompetenz')} (${label('kompetenzstufe', meilenstein.stufe)})` })
    : t('meilenstein_individual');
  zeigeUeberlagerung(`
    <div class="meilenstein-karte">
      <p class="meilenstein-zeichen" aria-hidden="true"><i class="fa-solid fa-medal"></i></p>
      <h2>${esc(t('meilenstein_titel'))}</h2>
      <p>${esc(textZeile)}</p>
      <p class="leise">${esc(t('meilenstein_weiter'))}</p>
      <button class="knopf knopf-primaer" data-schliessen>${esc(t('weiter'))}</button>
    </div>`);
  document.querySelector('#dialog-wurzel [data-schliessen]').addEventListener('click', () => {
    schliesseUeberlagerung();
    neuRendern();
  });
}

// Ansichten stoßen ein Neu-Rendern an, ohne app.js zu importieren (kein Zyklus).
export function neuRendern() {
  window.dispatchEvent(new CustomEvent('app:rendern'));
}

// Sichtbare Baustein-Icons (Font Awesome, immer farbig): Körper, Hand, Schläger,
// Wege. Neue Bausteine ohne Eintrag bekommen schlicht kein Icon — kein Fehlerfall.
const BAUSTEIN_ICONS = {
  grundposition: 'fa-person',
  griff: 'fa-hand',
  aufschlag: 'fa-baseball',
  vorhand_drive: 'fa-table-tennis-paddle-ball',
  rueckhand: 'fa-hand-back-fist',
  beinarbeit: 'fa-shoe-prints',
  // Taktik
  spielziel_verstehen: 'fa-bullseye',
  zentrale_position: 'fa-crosshairs',
  laenge_tiefe: 'fa-ruler-horizontal',
  rueckhand_des_gegners: 'fa-user-slash',
  aufschlag_taktisch: 'fa-chess',
  fehler_vermeiden: 'fa-shield-halved',
};

export function bausteinIcon(bausteinId, klasse = '') {
  const icon = BAUSTEIN_ICONS[bausteinId];
  return icon ? `<i class="fa-solid ${icon} ${klasse}" aria-hidden="true"></i>` : '';
}
