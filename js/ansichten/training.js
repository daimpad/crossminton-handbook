// Trainingspfad (Spez. 6.4): kuratierte Einheiten steuern gezielt Übungsteile an.
// Eine Sitzung ist flüchtig und wiederholbar; ihr Abschluss zählt kumulativ
// (Kontinuität ohne Abbruchmechanik, 8.3.3) und quittiert nebenbei offene
// Übungsteile baustein-gebunden.

import { projektion } from '../fortschritt.js';
import { label, t, text } from '../i18n.js';
import { bausteinIcon, esc, neuRendern } from '../oberflaeche.js';
import { kompetenzpfad, trainingsuebersicht } from '../pfade.js';
import { kontinuitaet, registriereEinheitAbschluss, setzeTeilStatus, teilStatus } from '../zustand.js';
import { uebungsteilHtml } from './baustein.js';

let sitzung = null;

function kompetenzQuote(daten) {
  const stationen = kompetenzpfad(daten).stationen;
  if (stationen.length === 0) return null;
  return projektion(stationen.map((s) => s.baustein)).quote;
}

function renderListe(el, daten) {
  sitzung = null;
  const uebersicht = trainingsuebersicht(daten);
  const karten = uebersicht
    .map(({ einheit, bausteine, absolviertZaehler }) => {
      const zaehlerText = absolviertZaehler > 0 ? t('mal_absolviert', { n: absolviertZaehler }) : t('noch_nicht_absolviert');
      const chips = bausteine.map((b) => `<span class="chip">${esc(label('baustein', b.id))}</span>`).join(' ');
      return `
        <div class="karte">
          <h3>${esc(label('einheit', einheit.id))}</h3>
          <p class="leise">${esc(text(einheit.beschreibung) ?? '')}</p>
          <p class="chip-zeile">${chips}</p>
          <p class="leise">${esc(t('uebungen_anzahl', { n: einheit.uebungsteile.length }))} · ${esc(zaehlerText)}</p>
          <a class="knopf knopf-primaer" href="#/training/${esc(einheit.id)}"><i class="fa-solid fa-play" aria-hidden="true"></i> ${esc(t('einheit_starten'))}</a>
        </div>`;
    })
    .join('');
  el.innerHTML = `
    <h1>${esc(t('pfad_training'))}</h1>
    <p class="leise">${esc(t('pfad_training_text'))}</p>
    <div class="karte">
      <h3>${esc(t('kontinuitaet'))}</h3>
      <p>${esc(t('kontinuitaet_stand', { n: kontinuitaet().gesamt }))}</p>
      <p class="leise">${esc(t('kontinuitaet_text'))}</p>
    </div>
    ${karten || `<div class="karte"><p class="leise">${esc(t('leer_training'))}</p></div>`}`;
}

function renderAbschluss(el, daten, einheit) {
  const gesamt = kontinuitaet().gesamt;
  const kontinuitaetText = gesamt === 1 ? t('kontinuitaet_erste') : t('kontinuitaet_stand', { n: gesamt });
  // Vollendet die Sitzung nebenbei den Kompetenzpfad, wird das sachlich mitgewürdigt.
  const quoteNachher = kompetenzQuote(daten);
  const meilensteinZeile =
    sitzung.kompetenzQuoteVorher !== null && sitzung.kompetenzQuoteVorher < 1 && quoteNachher === 1
      ? `<p>${esc(t('meilenstein_kompetenz', { pfad: t('pfad_kompetenz') }))}</p>`
      : '';
  el.innerHTML = `
    <section class="karte karte-akzent einheit-abschluss">
      <p class="bestaetigung">${esc(t('einheit_abgeschlossen'))}</p>
      <h1>${esc(label('einheit', einheit.id))}</h1>
      <p>${esc(kontinuitaetText)}</p>
      <p class="leise">${esc(t('kontinuitaet_text'))}</p>
      ${meilensteinZeile}
      <a class="knopf knopf-primaer" href="#/training">${esc(t('zur_liste'))}</a>
    </section>`;
}

function renderDurchlauf(el, daten, einheit) {
  const bausteinId = einheit.uebungsteile[sitzung.index];
  const baustein = daten.bausteinVonId.get(bausteinId);
  const istLetzte = sitzung.index === einheit.uebungsteile.length - 1;

  el.innerHTML = `
    <section class="einheit-durchlauf">
      <p class="leise">${esc(label('einheit', einheit.id))} · ${esc(t('uebung_x_von_y', { a: sitzung.index + 1, b: einheit.uebungsteile.length }))}</p>
      <h1>${bausteinIcon(baustein.id, 'baustein-icon')} ${esc(label('baustein', baustein.id))}</h1>
      <p><a class="leise" href="#/baustein/${esc(baustein.id)}?kontext=kompetenz">${esc(t('zum_baustein'))} →</a></p>
      ${uebungsteilHtml(text(baustein.uebungsteil))}
      <div class="knopf-zeile">
        <a class="knopf knopf-leise" href="#/training">${esc(t('abbrechen'))}</a>
        <button class="knopf knopf-primaer" id="uebung-weiter">${esc(istLetzte ? t('einheit_abschliessen') : t('uebung_erledigt_weiter'))}</button>
      </div>
      <p class="leise">${esc(t('einheit_abbrechen_hinweis'))}</p>
    </section>`;

  el.querySelector('#uebung-weiter').addEventListener('click', () => {
    // Baustein-gebundene Quittierung bleibt bestehen — auch über Sitzungen hinaus (7.5).
    if (teilStatus(baustein.id, 'uebungsteil') !== 'erledigt') {
      setzeTeilStatus(baustein.id, 'uebungsteil', 'erledigt');
    }
    if (istLetzte) {
      registriereEinheitAbschluss(einheit.id);
      sitzung.fertig = true;
    } else {
      sitzung.index += 1;
    }
    neuRendern();
  });
}

export function renderTraining(el, daten, einheitId) {
  if (!einheitId) {
    renderListe(el, daten);
    return;
  }
  const einheit = daten.einheitVonId.get(einheitId);
  if (!einheit || einheit.uebungsteile.length === 0) {
    el.innerHTML = `<div class="karte"><p>${esc(t('nicht_gefunden'))}</p><a class="knopf knopf-sekundaer" href="#/training">${esc(t('zur_liste'))}</a></div>`;
    return;
  }
  if (!sitzung || sitzung.einheitId !== einheitId) {
    sitzung = { einheitId, index: 0, fertig: false, kompetenzQuoteVorher: kompetenzQuote(daten) };
  }
  if (sitzung.fertig) renderAbschluss(el, daten, einheit);
  else renderDurchlauf(el, daten, einheit);
}
