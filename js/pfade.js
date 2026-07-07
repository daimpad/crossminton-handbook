// Pfad-Engine: vier gleichrangige Traversierungen über denselben Baustein-Pool
// plus Cross-Sport-Modifikator (Spez. 6). Alles reine Funktionen über
// Daten + Zustand → annotierte Stationslisten; kein DOM.
//
// Zwei-Ebenen-Logik (4.4): der Graph sortiert nur. Zugänglichkeit ist überall
// frei; nicht absolvierte Voraussetzungen werden als Hinweis mitgegeben.

import { deltaFuer, domaenenVon, hatReflexionsaufgabe, hatUebungsteil, niedrigsteStufe } from './daten.js';
import { fehlendeVoraussetzungen, topoSortiere } from './graph.js';
import { absolviertNachId, bausteinAbsolviert } from './fortschritt.js';
import { diagnose, kontinuitaet, teilStatus } from './zustand.js';

// Gleichrangige Bausteine: Domäne sekundär (Reihenfolge des Vokabulars),
// Pool-Reihenfolge tertiär — deterministisch.
function standardVergleicher(daten) {
  const domaenenOrdnung = daten.vokabulare.domaene || [];
  const domIdx = (b) => {
    const idx = domaenenOrdnung.indexOf(domaenenVon(b)[0]);
    return idx === -1 ? domaenenOrdnung.length : idx;
  };
  return (a, b) => domIdx(a) - domIdx(b) || daten.poolIndex.get(a.id) - daten.poolIndex.get(b.id);
}

// Ziele normalisieren: erlaubt sind null, ein Einzelziel {dimension, faktor},
// ein Ziel mit Faktorliste sowie eine Liste von Zielen (Mehrfachauswahl).
// Ältere gespeicherte Einzelziele bleiben so ohne Migration gültig.
export function zielEintraege(ziel) {
  if (!ziel) return [];
  const liste = Array.isArray(ziel) ? ziel : [ziel];
  return liste.flatMap((eintrag) => {
    if (!eintrag || !eintrag.faktor) return [];
    const dimension = eintrag.dimension === 'vermittlungsziele' ? 'vermittlungsziele' : 'spielziele';
    const faktoren = Array.isArray(eintrag.faktor) ? eintrag.faktor : [eintrag.faktor];
    return faktoren.map((faktor) => ({ dimension, faktor }));
  });
}

function zielTreffer(baustein, eintraege) {
  return eintraege.filter((eintrag) => (baustein[eintrag.dimension] || []).includes(eintrag.faktor)).length;
}

// Individualpfad: Graph primär, Ziel-Nähe sekundär als Füllkriterium (6.2).
function zielVergleicher(daten, eintraege) {
  const standard = standardVergleicher(daten);
  return (a, b) => zielTreffer(b, eintraege) - zielTreffer(a, eintraege) || standard(a, b);
}

function baueStation(daten, baustein, mengenIds, herkunft) {
  const absolviert = absolviertNachId(daten);
  const fehlend = fehlendeVoraussetzungen(baustein, absolviert);
  const delta = deltaFuer(daten, baustein.id, herkunft);
  return {
    baustein,
    // Delta-Einblendung (4.2): ersetzt nur den Erklärteil dieser Station,
    // nie die Sequenz. Kein Delta für eine Herkunft ist kein Fehlerfall.
    delta,
    fehlendeVoraussetzungen: fehlend,
    ausserhalbMenge: fehlend.filter((id) => !mengenIds.has(id)),
    // Überspringen-Kandidat (6.5): Umsteiger-Herkunft aktiv, keine Anpassung
    // nötig, noch nicht absolviert — Vormarkierung bestätigt die Person selbst.
    skipKandidat: Boolean(herkunft) && !delta && !bausteinAbsolviert(baustein),
    status: {
      erklaerteil: teilStatus(baustein.id, 'erklaerteil'),
      uebungsteil: hatUebungsteil(baustein) ? teilStatus(baustein.id, 'uebungsteil') : null,
      reflexionsaufgabe: hatReflexionsaufgabe(baustein) ? teilStatus(baustein.id, 'reflexionsaufgabe') : null,
      absolviert: bausteinAbsolviert(baustein),
    },
  };
}

function zuStationen(daten, bausteine, vergleicher, herkunft) {
  const { reihenfolge } = topoSortiere(bausteine, vergleicher);
  const mengenIds = new Set(bausteine.map((b) => b.id));
  return reihenfolge.map((b) => baueStation(daten, b, mengenIds, herkunft || null));
}

// 6.1 Kompetenzpfad — zugleich Standard-Basispfad des Cross-Sport-Modifikators:
// nur hier ist der Modifikator initial verdrahtet (Delta, Skip, Kennzeichnung).
export function kompetenzpfad(daten, stufe = diagnose().stufe) {
  const herkunft = diagnose().herkunft;
  const menge = daten.bausteine.filter((b) => niedrigsteStufe(daten, b) === stufe);
  return {
    art: 'kompetenz',
    stufe,
    herkunft,
    stationen: zuStationen(daten, menge, standardVergleicher(daten), herkunft),
  };
}

// 6.3 Themenpfad — Facetten nach Domäne, geordnet-explorativ.
export function themenDomaenen(daten) {
  return (daten.vokabulare.domaene || []).map((domaene) => ({
    domaene,
    anzahl: daten.bausteine.filter((b) => domaenenVon(b).includes(domaene)).length,
  }));
}

export function themenpfad(daten, domaene) {
  const menge = daten.bausteine.filter((b) => domaenenVon(b).includes(domaene));
  return {
    art: 'themen',
    domaene,
    stationen: zuStationen(daten, menge, standardVergleicher(daten), null),
  };
}

// 6.2 Individualpfad — filtert nach Zielfaktor(en); Voraussetzungen außerhalb
// der Menge bleiben Hinweis (ausserhalbMenge), werden nie aufgenommen.
export function individualpfad(daten, ziel = diagnose().ziel) {
  const eintraege = zielEintraege(ziel);
  if (eintraege.length === 0) return { art: 'individual', ziel: null, eintraege, stationen: [] };
  const menge = daten.bausteine.filter((b) => zielTreffer(b, eintraege) > 0);
  return {
    art: 'individual',
    ziel,
    eintraege,
    stationen: zuStationen(daten, menge, zielVergleicher(daten, eintraege), null),
  };
}

// 6.4 Trainingspfad — steuert Übungsteile über kuratierte Einheiten an.
export function trainingsuebersicht(daten) {
  const zaehler = kontinuitaet().jeEinheit;
  return daten.einheiten.map((einheit) => ({
    einheit,
    bausteine: einheit.uebungsteile.map((id) => daten.bausteinVonId.get(id)).filter(Boolean),
    absolviertZaehler: zaehler[einheit.id] || 0,
  }));
}

// Kontext-Strings der Ansichten: 'kompetenz', 'kompetenz:trainer',
// 'themen:<domaene>', 'individual'.
export function sequenzFuer(daten, kontext) {
  const [art, parameter] = String(kontext || 'kompetenz').split(':');
  if (art === 'themen') return themenpfad(daten, parameter);
  if (art === 'individual') return individualpfad(daten);
  return kompetenzpfad(daten, parameter || diagnose().stufe);
}

// Station für die Baustein-Ansicht, inkl. Nachbarn im gewählten Pfadkontext.
// Liegt der Baustein außerhalb der Sequenz (z. B. Deep-Link), entsteht eine
// Einzelstation ohne Navigation — zugänglich bleibt er immer.
export function stationImKontext(daten, bausteinId, kontext) {
  const sequenz = sequenzFuer(daten, kontext);
  const index = sequenz.stationen.findIndex((s) => s.baustein.id === bausteinId);
  if (index >= 0) {
    return {
      sequenz,
      station: sequenz.stationen[index],
      index,
      vorherige: sequenz.stationen[index - 1] || null,
      naechste: sequenz.stationen[index + 1] || null,
    };
  }
  const baustein = daten.bausteinVonId.get(bausteinId);
  if (!baustein) return null;
  const herkunft = sequenz.art === 'kompetenz' ? diagnose().herkunft : null;
  return {
    sequenz,
    station: baueStation(daten, baustein, new Set(), herkunft),
    index: -1,
    vorherige: null,
    naechste: null,
  };
}
