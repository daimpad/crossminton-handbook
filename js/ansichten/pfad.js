// Stationslisten der drei Baustein-Pfade. Überall gilt die Zwei-Ebenen-Logik:
// die Liste ordnet, sperrt aber nichts — Hinweise statt Zugangssperren.

import { markiereAbsolviert } from '../aktionen.js';
import { projektion } from '../fortschritt.js';
import { label, t } from '../i18n.js';
import { balkenHtml, bausteinIcon, esc, neuRendern, statusPunktHtml, zeigeMeilenstein } from '../oberflaeche.js';
import { individualpfad, kompetenzpfad, spielformen, spielformpfad, themenDomaenen, themenpfad } from '../pfade.js';
import { einstellungen, setzeDiagnose } from '../zustand.js';
import { gewaehlteZiele, zielLabels, zielwahlHtml } from './zielwahl.js';

// In der Liste ordnet bereits die Reihenfolge; der „Empfohlen vorher"-Hinweis
// gehört zum Zugriffsmoment und lebt in der Baustein-Ansicht (Spez. 4.4).
// Hier erscheint nur, was die Liste selbst nicht zeigen kann: Voraussetzungen
// außerhalb der gefilterten Menge (Individualpfad, 6.2).
function hinweisZeilen(station) {
  if (station.status.absolviert || station.ausserhalbMenge.length === 0) return '';
  const namen = station.ausserhalbMenge.map((id) => label('baustein', id)).join(', ');
  return `<span class="station-hinweis">${esc(`${t('ausserhalb_auswahl')} ${namen}`)}</span>`;
}

function stationslisteHtml(stationen, kontext, { mitSkip = false } = {}) {
  const kuerzelSichtbar = einstellungen().transferKuerzelSichtbar;
  const eintraege = stationen
    .map((station, i) => {
      // Kennzeichnung (6.5.3): die Herkunft steuert die dezenten Kürzel.
      const deltaChip =
        station.delta && kuerzelSichtbar
          ? `<span class="chip chip-akzent" title="${esc(t('delta_hinweis', { herkunft: label('transfer_herkunft', station.delta.ersetzt_bei_herkunft) }))}">${esc(station.delta.ersetzt_bei_herkunft)}</span>`
          : '';
      const skipKnopf =
        mitSkip && station.skipKandidat
          ? `<button class="knopf knopf-leise station-skip" data-skip="${esc(station.baustein.id)}">${esc(t('kann_ich_schon'))}</button>`
          : '';
      return `
        <li class="station ${station.status.absolviert ? 'station-absolviert' : ''}">
          <a class="station-link" href="#/baustein/${esc(station.baustein.id)}?kontext=${encodeURIComponent(kontext)}">
            <span class="station-nummer" aria-hidden="true">${i + 1}</span>
            <span class="station-mitte">
              <span class="station-titel">${bausteinIcon(station.baustein.id, 'station-icon')} ${esc(label('baustein', station.baustein.id))} ${deltaChip}</span>
              ${hinweisZeilen(station)}
            </span>
            ${statusPunktHtml(station)}
          </a>
          ${skipKnopf}
        </li>`;
    })
    .join('');
  return `<ol class="stationsliste">${eintraege}</ol>`;
}

function bindeSkip(el, daten, kontext, stationen) {
  for (const knopf of el.querySelectorAll('[data-skip]')) {
    knopf.addEventListener('click', () => {
      const station = stationen.find((s) => s.baustein.id === knopf.dataset.skip);
      if (!station) return;
      const { meilenstein } = markiereAbsolviert(daten, kontext, station.baustein);
      if (meilenstein) zeigeMeilenstein(meilenstein);
      else neuRendern();
    });
  }
}

export function renderKompetenzpfad(el, daten, stufe) {
  const pfad = kompetenzpfad(daten, stufe || undefined);
  const kontext = stufe ? `kompetenz:${stufe}` : 'kompetenz';
  if (!pfad.stufe) {
    // Ohne Stufe keine Sequenz (Spez. 7.1) — der Zugriff auf die Inhalte
    // bleibt über Themen-/Individualpfad trotzdem frei.
    el.innerHTML = `
      <h1>${esc(t('pfad_kompetenz'))}</h1>
      <div class="karte">
        <p class="leise">${esc(t('stufe_fehlt'))}</p>
        <div class="knopf-zeile" style="justify-content:flex-start">
          <a class="knopf knopf-primaer" href="#/onboarding">${esc(t('stufe_waehlen'))}</a>
          <a class="knopf knopf-leise" href="#/pfad/themen">${esc(t('kapitel_entdecken'))}</a>
        </div>
      </div>`;
    return;
  }
  const inhalt =
    pfad.stationen.length === 0
      ? `<div class="karte"><p class="leise">${esc(t('leer_stufe'))}</p></div>`
      : `${balkenHtml(projektion(pfad.stationen.map((s) => s.baustein)))}${stationslisteHtml(pfad.stationen, kontext, { mitSkip: Boolean(pfad.herkunft) })}`;
  el.innerHTML = `
    <h1>${esc(t('pfad_kompetenz'))} <span class="chip">${esc(label('kompetenzstufe', pfad.stufe))}</span></h1>
    <p class="leise">${esc(t('pfad_kompetenz_text'))}</p>
    ${inhalt}`;
  bindeSkip(el, daten, kontext, pfad.stationen);
}

export function renderThemen(el, daten, domaene) {
  if (!domaene) {
    const zeilen = themenDomaenen(daten)
      .map((eintrag) => {
        const beschriftung = `<h3>${esc(label('domaene', eintrag.domaene))}</h3><p class="leise">${esc(t('n_bausteine', { n: eintrag.anzahl }))}</p>`;
        return eintrag.anzahl > 0
          ? `<a class="karte karte-link" href="#/pfad/themen/${esc(eintrag.domaene)}">${beschriftung}</a>`
          : `<div class="karte karte-inaktiv">${beschriftung}</div>`;
      })
      .join('');
    el.innerHTML = `<h1>${esc(t('pfad_themen'))}</h1><p class="leise">${esc(t('pfad_themen_text'))}</p>${zeilen}`;
    return;
  }
  const pfad = themenpfad(daten, domaene);
  const inhalt =
    pfad.stationen.length === 0
      ? `<div class="karte"><p class="leise">${esc(t('leer_domaene'))}</p></div>`
      : `${balkenHtml(projektion(pfad.stationen.map((s) => s.baustein)))}${stationslisteHtml(pfad.stationen, `themen:${domaene}`)}`;
  el.innerHTML = `
    <h1>${esc(label('domaene', domaene))}</h1>
    <p class="leise">${esc(t('vorgeschlagene_reihenfolge'))}</p>
    ${inhalt}`;
}

// Spielform-Achse (Querschnittsthema): rendert alle Bausteine einer Spielform
// domänenübergreifend als ein Thema. Der Cross-Sport-Modifikator ist verdrahtet
// (Delta-Chip in der Liste), analog zum Kompetenzpfad.
export function renderSpielform(el, daten, spielform) {
  const gewaehlt = spielform || spielformen(daten).find((s) => s.anzahl > 0)?.spielform || null;
  const pfad = gewaehlt ? spielformpfad(daten, gewaehlt) : { stationen: [] };
  const inhalt =
    pfad.stationen.length === 0
      ? `<div class="karte"><p class="leise">${esc(t('leer_domaene'))}</p></div>`
      : `${balkenHtml(projektion(pfad.stationen.map((s) => s.baustein)))}${stationslisteHtml(pfad.stationen, `spielform:${gewaehlt}`)}`;
  el.innerHTML = `
    <h1>${esc(t('pfad_spielform'))}</h1>
    <p class="leise">${esc(t('pfad_spielform_text'))}</p>
    ${inhalt}`;
}

export function renderIndividual(el, daten) {
  const pfad = individualpfad(daten);
  if (!pfad.ziel) {
    el.innerHTML = `
      <h1>${esc(t('pfad_individual'))}</h1>
      <p class="leise">${esc(t('ziel_hinweis'))}</p>
      <form id="zielform">${zielwahlHtml(daten, null, { mitVermittlungszielen: true })}</form>
      <div class="knopf-zeile"><button class="knopf knopf-primaer" id="ziel-uebernehmen">${esc(t('uebernehmen'))}</button></div>`;
    el.querySelector('#zielform').addEventListener('submit', (ereignis) => ereignis.preventDefault());
    el.querySelector('#ziel-uebernehmen').addEventListener('click', () => {
      const ziele = gewaehlteZiele(el);
      if (!ziele) return;
      setzeDiagnose({ ziel: ziele });
      neuRendern();
    });
    return;
  }

  const zielChips = zielLabels(pfad.ziel)
    .map((beschriftung) => `<span class="chip chip-akzent">${esc(beschriftung)}</span>`)
    .join(' ');
  const inhalt =
    pfad.stationen.length === 0
      ? `<div class="karte"><p class="leise">${esc(t('leer_ziel'))}</p></div>`
      : `${balkenHtml(projektion(pfad.stationen.map((s) => s.baustein)))}${stationslisteHtml(pfad.stationen, 'individual')}`;
  el.innerHTML = `
    <h1>${esc(t('pfad_individual'))}</h1>
    <p class="chip-zeile">${esc(t('ziel_aktuell'))}: ${zielChips}</p>
    ${inhalt}
    <details class="karte">
      <summary>${esc(t('ziel_aendern'))}</summary>
      <form id="zielform">${zielwahlHtml(daten, pfad.ziel, { mitVermittlungszielen: true })}</form>
      <div class="knopf-zeile">
        <button class="knopf knopf-leise" id="ziel-entfernen">${esc(t('ziel_entfernen'))}</button>
        <button class="knopf knopf-primaer" id="ziel-uebernehmen">${esc(t('uebernehmen'))}</button>
      </div>
    </details>`;
  el.querySelector('#zielform').addEventListener('submit', (ereignis) => ereignis.preventDefault());
  el.querySelector('#ziel-uebernehmen').addEventListener('click', () => {
    const ziele = gewaehlteZiele(el);
    if (!ziele) return;
    setzeDiagnose({ ziel: ziele });
    neuRendern();
  });
  el.querySelector('#ziel-entfernen').addEventListener('click', () => {
    setzeDiagnose({ ziel: null });
    neuRendern();
  });
}
