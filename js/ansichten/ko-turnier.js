// KO-Turnier: ein Spaßturnier-Werkzeug, kein Lerninhalt (eigene Entität wie der
// Trainingsplan — kein Fortschritt, keine Baustein-Bindung). Namen eintragen,
// auslosen, pro Match den Sieger antippen — die App baut die nächste Runde
// automatisch auf, bis feststeht, wer gewonnen hat und wer wie weit kam.
//
// Setup-Phase (Namen sammeln) zeichnet lokal neu (wie js/ansichten/turnier.js),
// damit die Texteingabe beim Tippen den Fokus behält; die Bracket-Phase nutzt das
// globale neuRendern() wie der Rest der App (kein Routenwechsel → Scroll bleibt).

import { erzeugeTurnier, istAbgeschlossen, mische, platzierungen, rundenName, traegtSiegerEin, turniersieger } from '../ko-turnier.js';
import { t } from '../i18n.js';
import { esc, heroKlein, neuRendern, zeigeToast } from '../oberflaeche.js';
import { koTurnier, loescheKoTurnier, setzeKoTurnier } from '../zustand.js';

// Entwurf der Teilnehmerliste vor dem Auslosen — bewusst Modul-State (wie
// turnier.js' aktiveStufe), nicht im Zustand: eine Zwischenablage, keine Daten.
let entwurfTitel = '';
let entwurfNamen = [];

function setupHtml() {
  const chips = entwurfNamen
    .map(
      (name, i) => `
      <span class="ko-chip">
        ${esc(name)}
        <button type="button" class="ko-chip-entfernen" data-entfernen-namen="${i}" aria-label="${esc(t('ko_turnier_namen_entfernen', { name }))}">
          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </span>`,
    )
    .join('');
  const bereit = entwurfNamen.length >= 2;
  return `
    <form class="karte ko-setup" id="ko-setup-form">
      <h2>${esc(t('ko_turnier_neues'))}</h2>
      <p class="leise">${esc(t('ko_turnier_intro'))}</p>
      <label class="plan-feld"><span>${esc(t('ko_turnier_name_label'))}</span>
        <input type="text" id="ko-titel" maxlength="60" placeholder="${esc(t('ko_turnier_name_platzhalter'))}" value="${esc(entwurfTitel)}"></label>
      <div class="ko-namen-eingabe">
        <label class="plan-feld" style="flex:1"><span>${esc(t('ko_turnier_teilnehmer_label'))}</span>
          <input type="text" id="ko-name-eingabe" maxlength="40" placeholder="${esc(t('ko_turnier_teilnehmer_platzhalter'))}" autocomplete="off"></label>
        <button type="submit" class="knopf knopf-sekundaer">${esc(t('hinzufuegen'))}</button>
      </div>
      ${chips ? `<div class="ko-chip-zeile">${chips}</div>` : `<p class="leise">${esc(t('ko_turnier_noch_keine'))}</p>`}
      <p class="leise">${esc(t('ko_turnier_anzahl', { n: entwurfNamen.length }))}</p>
      <div class="knopf-zeile" style="justify-content:flex-start">
        <button type="button" class="knopf knopf-primaer" id="ko-auslosen" ${bereit ? '' : 'disabled'}>
          <i class="fa-solid fa-right-left" aria-hidden="true"></i> ${esc(t('ko_turnier_auslosen'))}
        </button>
      </div>
    </form>`;
}

function zeichneSetup(el, fokusNachAdd = false) {
  el.innerHTML = `
    ${heroKlein('fa-flag-checkered', t('ko_turnier_titel'), t('ko_turnier_untertitel'), 'pf-indigo')}
    ${setupHtml()}`;

  el.querySelector('#ko-titel')?.addEventListener('input', (ereignis) => {
    entwurfTitel = ereignis.target.value;
  });

  const hinzufuegen = () => {
    const feld = el.querySelector('#ko-name-eingabe');
    const wert = feld.value.trim();
    if (!wert) return;
    if (entwurfNamen.some((n) => n.toLowerCase() === wert.toLowerCase())) {
      zeigeToast(t('ko_turnier_bereits_vorhanden'));
      return;
    }
    entwurfNamen.push(wert);
    zeichneSetup(el, true);
  };
  el.querySelector('#ko-setup-form').addEventListener('submit', (ereignis) => {
    ereignis.preventDefault();
    hinzufuegen();
  });

  for (const knopf of el.querySelectorAll('[data-entfernen-namen]')) {
    knopf.addEventListener('click', () => {
      entwurfNamen.splice(Number(knopf.dataset.entfernenNamen), 1);
      // Mit Fokus-Flag neu zeichnen: innerHTML ersetzt den geklickten Knopf, sonst
      // fällt der Fokus auf <body> und Tastaturnutzende verlieren die Stelle.
      zeichneSetup(el, true);
    });
  }

  el.querySelector('#ko-auslosen')?.addEventListener('click', () => {
    const turnier = erzeugeTurnier(entwurfTitel, mische(entwurfNamen));
    setzeKoTurnier(turnier);
    entwurfTitel = '';
    entwurfNamen = [];
    neuRendern();
  });

  if (fokusNachAdd) el.querySelector('#ko-name-eingabe')?.focus();
}

function championBannerHtml(name) {
  return `
    <div class="karte ko-champion-banner">
      <p class="ko-champion-zeichen" aria-hidden="true"><i class="fa-solid fa-medal"></i></p>
      <h2>${esc(t('ko_turnier_champion'))}</h2>
      <p class="ko-champion-name">${esc(name)}</p>
    </div>`;
}

// Rundenbezeichnung: Bracket-übliche Namen (Finale/Halbfinale/…) aus der Engine,
// generischer Fallback „Runde N" für frühe/große Runden ohne besonderen Namen.
function rundenTitel(matchAnzahl, rundenIndex) {
  const schluessel = rundenName(matchAnzahl);
  return schluessel ? t(`ko_turnier_${schluessel}`) : t('ko_turnier_runde_n', { n: rundenIndex + 1 });
}

// Platzierungs-Übersicht: gruppiert die (bereits nach bester Platzierung sortierte)
// Liste aus der Engine unter Rundenbezeichnungen — „wer ist wie weit gekommen".
function platzierungHtml(turnier) {
  const plaetze = platzierungen(turnier);
  const abgeschlossen = istAbgeschlossen(turnier);
  const gruppen = [];
  for (const p of plaetze) {
    const letzte = gruppen[gruppen.length - 1];
    if (letzte && letzte.schluessel === p.ausgeschiedenInRunde) letzte.namen.push(p.name);
    else gruppen.push({ schluessel: p.ausgeschiedenInRunde, namen: [p.name] });
  }
  const zeilen = gruppen
    .map((g) => {
      let titel;
      if (g.schluessel === null) titel = abgeschlossen ? t('ko_turnier_champion') : t('ko_turnier_noch_dabei');
      else titel = rundenTitel(turnier.runden[g.schluessel].length, g.schluessel);
      return `<li class="ko-platz"><span class="ko-platz-titel">${esc(titel)}</span><span class="ko-platz-namen">${g.namen.map(esc).join(', ')}</span></li>`;
    })
    .join('');
  return `
    <section class="karte ko-platzierung">
      <h2>${esc(t('ko_turnier_stand'))}</h2>
      <ul class="ko-platz-liste">${zeilen}</ul>
    </section>`;
}

function matchHtml(rundenIndex, matchIndex, match) {
  if (match.b === null) {
    return `
      <div class="ko-match ko-match-freilos">
        <span class="ko-match-seite ko-match-sieger">${esc(match.a)}</span>
        <span class="chip">${esc(t('ko_turnier_freilos'))}</span>
      </div>`;
  }
  const seite = (name) => {
    const istSieger = match.sieger === name;
    const istVerlierer = Boolean(match.sieger) && !istSieger;
    const klassen = ['ko-match-seite'];
    if (istSieger) klassen.push('ko-match-sieger');
    if (istVerlierer) klassen.push('ko-match-verlierer');
    return `
      <button type="button" class="${klassen.join(' ')}" data-ko-sieger="${esc(name)}" data-runde="${rundenIndex}" data-match="${matchIndex}"
        aria-pressed="${istSieger}" aria-label="${esc(t('ko_turnier_als_sieger', { name }))}">
        ${istSieger ? '<i class="fa-solid fa-check" aria-hidden="true"></i> ' : ''}${esc(name)}
      </button>`;
  };
  return `
    <div class="ko-match">
      ${seite(match.a)}
      <span class="ko-match-gegen" aria-hidden="true">${esc(t('ko_turnier_gegen'))}</span>
      ${seite(match.b)}
    </div>`;
}

function bracketHtml(turnier) {
  return turnier.runden
    .map(
      (runde, ri) => `
      <section class="ko-runde">
        <h3>${esc(rundenTitel(runde.length, ri))}</h3>
        <div class="ko-matches">${runde.map((m, mi) => matchHtml(ri, mi, m)).join('')}</div>
      </section>`,
    )
    .join('');
}

function zeichneBracket(el, turnier) {
  const abgeschlossen = istAbgeschlossen(turnier);
  const champion = turniersieger(turnier);
  el.innerHTML = `
    ${heroKlein('fa-flag-checkered', turnier.titel || t('ko_turnier_titel'), t('ko_turnier_teilnehmer_anzahl', { n: turnier.teilnehmer.length }), 'pf-indigo')}
    ${abgeschlossen ? championBannerHtml(champion) : ''}
    ${platzierungHtml(turnier)}
    <div class="ko-bracket">${bracketHtml(turnier)}</div>
    <div class="knopf-zeile" style="justify-content:flex-start">
      <button type="button" class="knopf knopf-leise" id="ko-neu">
        <i class="fa-solid fa-arrow-rotate-left" aria-hidden="true"></i> ${esc(t('ko_turnier_neu_starten'))}
      </button>
    </div>`;

  for (const knopf of el.querySelectorAll('[data-ko-sieger]')) {
    knopf.addEventListener('click', () => {
      const rundenIndex = Number(knopf.dataset.runde);
      const matchIndex = Number(knopf.dataset.match);
      const neuerSieger = knopf.dataset.koSieger;
      const aktuellesMatch = turnier.runden[rundenIndex][matchIndex];
      const gibtFolgerunden = rundenIndex < turnier.runden.length - 1;
      if (aktuellesMatch.sieger && aktuellesMatch.sieger !== neuerSieger && gibtFolgerunden) {
        if (!window.confirm(t('ko_turnier_sieger_aendern_bestaetigen'))) return;
      }
      setzeKoTurnier(traegtSiegerEin(turnier, rundenIndex, matchIndex, neuerSieger));
      neuRendern();
    });
  }

  el.querySelector('#ko-neu')?.addEventListener('click', () => {
    if (!window.confirm(t('ko_turnier_neu_bestaetigen'))) return;
    loescheKoTurnier();
    entwurfTitel = '';
    entwurfNamen = [];
    neuRendern();
  });
}

export function renderKoTurnier(el) {
  const turnier = koTurnier();
  if (!turnier) zeichneSetup(el);
  else zeichneBracket(el, turnier);
}
