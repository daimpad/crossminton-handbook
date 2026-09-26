// Merkliste: die persönliche Wiedervorlage gemerkter Bausteine. Kein neuer Inhalt,
// keine eigene Ordnung — die Bausteine erscheinen in Merk-Reihenfolge, jeder mit
// seinem Fortschritts-Status. Zugänglichkeit ist frei (Zwei-Ebenen-Logik); die
// Liste lässt sich hier auch wieder ausdünnen (Entfernen je Eintrag).

import { projektion } from '../fortschritt.js';
import { label, t } from '../i18n.js';
import { balkenHtml, bausteinIcon, entdeckenAktion, esc, heroKlein, leerHtml, neuRendern, statusPunktHtml } from '../oberflaeche.js';
import { merklisteStationen } from '../pfade.js';
import { merkliste, vergiss } from '../zustand.js';

function eintragHtml(station) {
  const b = station.baustein;
  return `
    <li class="station merk-station ${station.status.absolviert ? 'station-absolviert' : ''}">
      <a class="station-link" href="#/baustein/${esc(b.id)}?kontext=merkliste">
        <span class="station-mitte">
          <span class="station-titel">${bausteinIcon(b.id, 'station-icon')} ${esc(label('baustein', b.id))}</span>
        </span>
        ${statusPunktHtml(station)}
      </a>
      <button type="button" class="merk-entfernen" data-entfernen="${esc(b.id)}"
        aria-label="${esc(t('merken_entfernen'))}" title="${esc(t('merken_entfernen'))}">
        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
      </button>
    </li>`;
}

export function renderMerkliste(el, daten) {
  const stationen = merklisteStationen(daten, merkliste());
  const inhalt =
    stationen.length === 0
      ? leerHtml(t('merkliste_leer'), 'fa-star', entdeckenAktion())
      : `${balkenHtml(projektion(stationen.map((s) => s.baustein)))}
         <ol class="stationsliste">${stationen.map(eintragHtml).join('')}</ol>`;
  el.innerHTML = `${heroKlein('fa-star', t('nav_merkliste'), t('merkliste_untertitel'), 'pf-magenta')}${inhalt}`;

  for (const knopf of el.querySelectorAll('[data-entfernen]')) {
    knopf.addEventListener('click', () => {
      vergiss(knopf.dataset.entfernen);
      neuRendern();
    });
  }
}
