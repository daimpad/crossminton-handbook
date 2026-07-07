// Heim: Wiedereinstieg („Weiterlernen") plus die vier gleichrangigen Pfade.
// Fortschritt begleitet dezent (Balken je Karte), drängt sich aber nicht vor.

import { projektion } from '../fortschritt.js';
import { label, t } from '../i18n.js';
import { balkenHtml, esc } from '../oberflaeche.js';
import { kompetenzpfad, themenDomaenen } from '../pfade.js';
import { diagnose, kontinuitaet, speicherIstVerfuegbar } from '../zustand.js';

export function renderHeim(el, daten) {
  const d = diagnose();
  const pfad = kompetenzpfad(daten);
  const pfadProjektion = projektion(pfad.stationen.map((s) => s.baustein));
  const naechste = pfad.stationen.find((s) => !s.status.absolviert);

  let weiterlernen = '';
  if (!d.stufe) {
    // Freier Einstieg ohne Wizard: Einladung statt geführtem Wiedereinstieg.
    weiterlernen = `
      <section class="karte karte-akzent">
        <h2>${esc(t('kapitel_entdecken'))}</h2>
        <p class="leise">${esc(t('onboarding_einladung'))}</p>
        <div class="knopf-zeile" style="justify-content:flex-start">
          <a class="knopf knopf-primaer" href="#/pfad/themen">${esc(t('kapitel_entdecken'))} <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>
          <a class="knopf knopf-sekundaer" href="#/onboarding">${esc(t('onboarding_starten'))}</a>
        </div>
      </section>`;
  } else if (naechste) {
    const nummer = pfad.stationen.indexOf(naechste) + 1;
    weiterlernen = `
      <section class="karte karte-akzent">
        <p class="leise">${esc(t('weiterlernen'))} · ${esc(t('station_x_von_y', { a: nummer, b: pfad.stationen.length }))}</p>
        <h2>${esc(label('baustein', naechste.baustein.id))}</h2>
        <a class="knopf knopf-primaer" href="#/baustein/${esc(naechste.baustein.id)}?kontext=kompetenz">${esc(t('weiter'))} <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>
      </section>`;
  } else if (pfad.stationen.length > 0) {
    weiterlernen = `
      <section class="karte karte-akzent">
        <p class="bestaetigung">${esc(t('leer_weiterlernen'))}</p>
        <a class="knopf knopf-sekundaer" href="#/pfad/themen">${esc(t('pfad_themen'))}</a>
      </section>`;
  }

  const domaenenChips = themenDomaenen(daten)
    .filter((eintrag) => eintrag.anzahl > 0)
    .map((eintrag) => `<span class="chip">${esc(label('domaene', eintrag.domaene))} · ${eintrag.anzahl}</span>`)
    .join('');

  const zielZeile = d.ziel
    ? `${esc(t('ziel_aktuell'))}: ${esc(label(d.ziel.dimension === 'vermittlungsziele' ? 'vermittlungsziel_faktor' : 'spielziel_faktor', d.ziel.faktor))}`
    : esc(t('ziel_keins'));

  const trainerKarte = d.trainer
    ? `
      <a class="karte karte-link" href="#/pfad/kompetenz/trainer">
        <h3>${esc(t('pfad_kompetenz'))} <span class="chip">${esc(label('kompetenzstufe', 'trainer'))}</span></h3>
        <p class="leise">${esc(t('n_bausteine', { n: kompetenzpfad(daten, 'trainer').stationen.length }))}</p>
      </a>`
    : '';

  const kompetenzKarte = d.stufe
    ? `
    <a class="karte karte-link" href="#/pfad/kompetenz">
      <h3>${esc(t('pfad_kompetenz'))} <span class="chip">${esc(label('kompetenzstufe', d.stufe))}</span></h3>
      <p class="leise">${esc(t('pfad_kompetenz_text'))}</p>
      ${balkenHtml(pfadProjektion)}
    </a>`
    : `
    <div class="karte">
      <h3>${esc(t('pfad_kompetenz'))}</h3>
      <p class="leise">${esc(t('stufe_fehlt'))}</p>
      <a class="knopf knopf-sekundaer" href="#/onboarding">${esc(t('stufe_waehlen'))}</a>
    </div>`;

  el.innerHTML = `
    ${speicherIstVerfuegbar() ? '' : `<div class="banner-hinweis">${esc(t('speicher_warnung'))}</div>`}
    ${weiterlernen}
    <h2 class="abschnitt-titel">${esc(t('pfade'))}</h2>
    ${kompetenzKarte}
    ${trainerKarte}
    <a class="karte karte-link" href="#/pfad/themen">
      <h3>${esc(t('pfad_themen'))}</h3>
      <p class="leise">${esc(t('pfad_themen_text'))}</p>
      <p class="chip-zeile">${domaenenChips}</p>
    </a>
    <a class="karte karte-link" href="#/pfad/individual">
      <h3>${esc(t('pfad_individual'))}</h3>
      <p class="leise">${esc(t('pfad_individual_text'))}</p>
      <p class="leise">${zielZeile}</p>
    </a>
    <a class="karte karte-link" href="#/training">
      <h3>${esc(t('pfad_training'))}</h3>
      <p class="leise">${esc(t('pfad_training_text'))}</p>
      <p class="leise">${esc(t('n_einheiten', { n: daten.einheiten.length }))} · ${esc(t('kontinuitaet_stand', { n: kontinuitaet().gesamt }))}</p>
    </a>`;
}
