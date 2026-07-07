// Fortschritts-Projektionen (Spez. 8.1): der baustein-gebundene Abschluss-Status
// ist die invariante Datengrundlage; alles hier wird live darüber berechnet
// und nie gespeichert.

import { hatUebungsteil } from './daten.js';
import { teilStatus } from './zustand.js';

// „Absolviert" = Erklärteil erledigt und, falls vorhanden, Übungsteil erledigt.
export function bausteinAbsolviert(baustein) {
  if (teilStatus(baustein.id, 'erklaerteil') !== 'erledigt') return false;
  if (hatUebungsteil(baustein) && teilStatus(baustein.id, 'uebungsteil') !== 'erledigt') return false;
  return true;
}

export function absolviertNachId(daten) {
  return (id) => {
    const baustein = daten.bausteinVonId.get(id);
    return baustein ? bausteinAbsolviert(baustein) : false;
  };
}

// Projektion über eine beliebige Baustein-Menge (global, pfadbezogen, …).
export function projektion(bausteine) {
  const p = {
    gesamt: bausteine.length,
    absolviert: 0,
    quote: 0,
    erklaertErledigt: 0,
    uebungGesamt: 0,
    uebungErledigt: 0,
  };
  for (const b of bausteine) {
    if (bausteinAbsolviert(b)) p.absolviert += 1;
    if (teilStatus(b.id, 'erklaerteil') === 'erledigt') p.erklaertErledigt += 1;
    if (hatUebungsteil(b)) {
      p.uebungGesamt += 1;
      if (teilStatus(b.id, 'uebungsteil') === 'erledigt') p.uebungErledigt += 1;
    }
  }
  p.quote = p.gesamt === 0 ? 0 : p.absolviert / p.gesamt;
  return p;
}

export function globaleProjektion(daten) {
  return projektion(daten.bausteine);
}
