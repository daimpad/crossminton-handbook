// Gemeinsame Zielwahl (Onboarding, Profil, Individualpfad): genau ein Faktor
// aus Spielzielen — bei Trainer-Perspektive zusätzlich Vermittlungsziele.
// Primärordnung der Vokabulare bleibt sichtbar: Faktoren gruppiert nach Bereich.

import { label, t } from '../i18n.js';
import { esc } from '../oberflaeche.js';

function bereichsGruppen(vokabular, dimension, bereichGruppe, faktorGruppe, aktivFaktor) {
  return Object.entries(vokabular || {})
    .filter(([bereich]) => !bereich.startsWith('_'))
    .map(([bereich, faktoren]) => {
      const optionen = faktoren
        .map((faktor) => {
          const gewaehlt = aktivFaktor === faktor ? 'checked' : '';
          return `
            <label class="option-zeile">
              <input type="radio" name="zielwahl" value="${esc(dimension)}::${esc(faktor)}" ${gewaehlt}>
              <span>${esc(label(faktorGruppe, faktor))}</span>
            </label>`;
        })
        .join('');
      return `
        <fieldset class="ziel-bereich">
          <legend>${esc(label(bereichGruppe, bereich))}</legend>
          ${optionen}
        </fieldset>`;
    })
    .join('');
}

export function zielwahlHtml(daten, aktuellesZiel, { mitVermittlungszielen = false } = {}) {
  const aktivSpiel = aktuellesZiel?.dimension === 'spielziele' ? aktuellesZiel.faktor : null;
  const aktivVermittlung = aktuellesZiel?.dimension === 'vermittlungsziele' ? aktuellesZiel.faktor : null;
  let html = `
    <div class="zielwahl">
      <h3 class="ziel-dimension">${esc(t('spielziele_gruppe'))}</h3>
      ${bereichsGruppen(daten.vokabulare.spielziele, 'spielziele', 'spielziel_bereich', 'spielziel_faktor', aktivSpiel)}`;
  if (mitVermittlungszielen) {
    html += `
      <h3 class="ziel-dimension">${esc(t('vermittlungsziele_gruppe'))}</h3>
      ${bereichsGruppen(daten.vokabulare.vermittlungsziele, 'vermittlungsziele', 'vermittlungsziel_bereich', 'vermittlungsziel_faktor', aktivVermittlung)}`;
  }
  return `${html}</div>`;
}

export function gewaehltesZiel(container) {
  const radio = container.querySelector('input[name="zielwahl"]:checked');
  if (!radio) return null;
  const [dimension, faktor] = radio.value.split('::');
  return { dimension, faktor };
}
