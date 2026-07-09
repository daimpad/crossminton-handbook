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
  // Mentales
  warum_der_kopf_mitspielt: 'fa-brain',
  routine_vor_dem_aufschlag: 'fa-list-check',
  ruhig_bleiben_wenn_es_eng_wird: 'fa-wind',
  den_fehler_abhaken: 'fa-arrow-rotate-left',
  bei_der_sache_bleiben: 'fa-eye',
  // Athletik / Kondition
  warum_athletik_dein_spiel_traegt: 'fa-heart-pulse',
  richtig_aufwaermen: 'fa-fire',
  beweglichkeit_und_schulter: 'fa-child-reaching',
  schnelle_fuesse: 'fa-shoe-prints',
  durchhalten: 'fa-gauge-high',
  erholen: 'fa-bed',
  // Fortgeschritten-Technik
  handgelenk_peitsche: 'fa-bolt',
  ueberkopf_clear: 'fa-arrow-up-long',
  smash: 'fa-hammer',
  kurzes_spiel_stopp: 'fa-feather',
  schnitt_spin: 'fa-arrows-spin',
  beinarbeit_system: 'fa-shoe-prints',
  // Fortgeschritten-Taktik
  umschalten: 'fa-right-left',
  punkt_aufbauen: 'fa-layer-group',
  smash_vorbereiten: 'fa-bomb',
  gegner_lesen_muster: 'fa-magnifying-glass',
  doppel_grundlagen: 'fa-users',
  engen_satz_fuehren: 'fa-flag-checkered',
  // Fortgeschritten-Mentales
  vom_werkzeug_zum_system: 'fa-toolbox',
  selbstgespraech_steuern: 'fa-comment-dots',
  sich_das_spiel_vorstellen: 'fa-film',
  momentum_lesen_und_drehen: 'fa-water',
  ueber_das_match_stabil_bleiben: 'fa-anchor',
  // Fortgeschritten-Athletik / Kondition
  gezielt_trainieren: 'fa-chart-line',
  explosivitaet: 'fa-rocket',
  rumpfstabilitaet: 'fa-tree',
  intervallausdauer: 'fa-stopwatch',
  belastung_steuern_regenerieren: 'fa-scale-balanced',
  // Doppel-Thema (Querschnitt über Domänen, spielform:doppel)
  doppel_als_eigenes_spiel: 'fa-people-group',
  angriff_im_paar: 'fa-hand-fist',
  verteidigung_im_paar: 'fa-shield',
  bewegung_als_einheit: 'fa-people-arrows',
  verstaendigung_im_paar: 'fa-comments',
  aufschlag_rueckschlag_doppel: 'fa-repeat',
  das_umschalten_im_doppel: 'fa-rotate',
  // Experte-Technik (Feinschliff, Täuschung) — herkunftsneutral
  taeuschung: 'fa-chess',
  frueh_nehmen: 'fa-bolt',
  tempo_rhythmus_wechsel: 'fa-gauge-high',
  sprung_smash: 'fa-hammer',
  praezision_an_die_linien: 'fa-crosshairs',
  konstanz_unter_hoechstdruck: 'fa-anchor',
  // Trainer-Trainingsgestaltung (Vermittlung, Trainer-Ebene)
  was_gutes_vermitteln_ausmacht: 'fa-lightbulb',
  inhalt_zugaenglich_machen: 'fa-feather',
  fehler_erkennen_korrigieren: 'fa-stethoscope',
  uebungen_aufbauen: 'fa-layer-group',
  gruppe_fuehren: 'fa-users',
};

export function bausteinIcon(bausteinId, klasse = '') {
  const icon = BAUSTEIN_ICONS[bausteinId];
  return icon ? `<i class="fa-solid ${icon} ${klasse}" aria-hidden="true"></i>` : '';
}
