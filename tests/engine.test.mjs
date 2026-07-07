// Engine-Tests gegen die Referenzdaten — ohne Abhängigkeiten, direkt lauffähig:
//   node tests/engine.test.mjs
// Prüft Datenvalidierung, Pfad-Traversierungen, Modifikator, Zwei-Ebenen-Logik,
// Projektionen, Kontinuität und die Vollständigkeit der de-Labels.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { baueIndizes, deltaFuer } from '../js/daten.js';
import { individualpfad, kompetenzpfad, sequenzFuer, stationImKontext, themenDomaenen, themenpfad, trainingsuebersicht } from '../js/pfade.js';
import { globaleProjektion, projektion } from '../js/fortschritt.js';
import { registriereEinheitAbschluss, setzeDiagnose, setzeTeilStatus, setzeZurueck } from '../js/zustand.js';

const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..');
const liesJson = (pfad) => JSON.parse(readFileSync(join(wurzel, pfad), 'utf8'));

const inhalt = liesJson('data/bausteine.beginner-technik.json');
const einheiten = liesJson('data/trainingseinheiten.json');
const labelsDe = liesJson('data/labels/de.json');

let fehler = 0;
let laufend = 0;

function pruefe(beschreibung, bedingung, details = '') {
  laufend += 1;
  if (bedingung) {
    console.log(`  ok ${laufend}: ${beschreibung}`);
  } else {
    fehler += 1;
    console.error(`  FEHLER ${laufend}: ${beschreibung}${details ? ` — ${details}` : ''}`);
  }
}

function gleicheListe(a, b) {
  return a.length === b.length && a.every((wert, i) => wert === b[i]);
}

const daten = baueIndizes(inhalt, einheiten);

console.log('\n[1] Datenvalidierung');
pruefe('Referenzdaten ohne Warnungen', daten.warnungen.length === 0, daten.warnungen.join(' | '));
pruefe('sechs Basisbausteine, vier Deltas', daten.bausteine.length === 6 && daten.deltas.length === 4);
pruefe('Herkunftsliste aus Delta-Bestand generiert = [BAD]', gleicheListe(daten.herkuenfte, ['BAD']));

console.log('\n[2] Kompetenzpfad ohne Herkunft');
setzeZurueck();
setzeDiagnose({ stufe: 'beginner' });
const erwarteteKette = ['grundposition', 'griff', 'aufschlag', 'vorhand_drive', 'rueckhand', 'beinarbeit'];
const pfadOhne = kompetenzpfad(daten);
pruefe(
  'Reihenfolge folgt dem Voraussetzungsgraphen',
  gleicheListe(pfadOhne.stationen.map((s) => s.baustein.id), erwarteteKette),
  pfadOhne.stationen.map((s) => s.baustein.id).join(' → ')
);
pruefe('keine Deltas aktiv', pfadOhne.stationen.every((s) => s.delta === null));
pruefe('keine Skip-Kandidaten', pfadOhne.stationen.every((s) => !s.skipKandidat));
pruefe('Kompetenzpfad Fortgeschritten ist leer (Erstausbau)', kompetenzpfad(daten, 'fortgeschritten').stationen.length === 0);

console.log('\n[3] Cross-Sport-Modifikator (Herkunft BAD)');
setzeDiagnose({ herkunft: 'BAD' });
const pfadBad = kompetenzpfad(daten);
pruefe('Sequenz bleibt unverändert (Ersetzung substituiert nur Inhalt)', gleicheListe(pfadBad.stationen.map((s) => s.baustein.id), erwarteteKette));
const deltaErwartung = {
  grundposition: null,
  griff: 'griff_delta_bad',
  aufschlag: 'aufschlag_delta_bad',
  vorhand_drive: 'vorhand_drive_delta_bad',
  rueckhand: 'rueckhand_delta_bad',
  beinarbeit: null,
};
for (const station of pfadBad.stationen) {
  const erwartet = deltaErwartung[station.baustein.id];
  pruefe(`Delta an ${station.baustein.id}: ${erwartet ?? 'keins (Nicht-Fehlerfall)'}`, (station.delta?.id ?? null) === erwartet);
}
pruefe(
  'Skip-Kandidaten sind genau die delta-freien Bausteine',
  gleicheListe(pfadBad.stationen.filter((s) => s.skipKandidat).map((s) => s.baustein.id), ['grundposition', 'beinarbeit'])
);
pruefe('deltaFuer liefert für unbekannte Herkunft null', deltaFuer(daten, 'griff', 'TEN') === null);

console.log('\n[4] Zwei-Ebenen-Logik: Hinweis statt Sperre');
const griffVorher = pfadBad.stationen.find((s) => s.baustein.id === 'griff');
pruefe('griff meldet fehlende Voraussetzung grundposition', gleicheListe(griffVorher.fehlendeVoraussetzungen, ['grundposition']));
setzeTeilStatus('grundposition', 'erklaerteil', 'erledigt');
setzeTeilStatus('grundposition', 'uebungsteil', 'erledigt');
const griffNachher = kompetenzpfad(daten).stationen.find((s) => s.baustein.id === 'griff');
pruefe('nach Absolvieren verschwindet der Hinweis', griffNachher.fehlendeVoraussetzungen.length === 0);
pruefe('teilweise erledigt zählt nicht als absolviert', (() => {
  setzeTeilStatus('griff', 'erklaerteil', 'erledigt');
  return kompetenzpfad(daten).stationen.find((s) => s.baustein.id === 'aufschlag').fehlendeVoraussetzungen.includes('griff');
})());

console.log('\n[5] Individualpfad');
setzeZurueck();
setzeDiagnose({ stufe: 'beginner', ziel: { dimension: 'spielziele', faktor: 'tempo_haertedosierung' } });
const individuell = individualpfad(daten);
pruefe(
  'Filter + Graph: griff → vorhand_drive → rueckhand',
  gleicheListe(individuell.stationen.map((s) => s.baustein.id), ['griff', 'vorhand_drive', 'rueckhand'])
);
const griffStation = individuell.stationen[0];
pruefe('Voraussetzung außerhalb der Menge nur als Hinweis', gleicheListe(griffStation.ausserhalbMenge, ['grundposition']));
pruefe('ohne Ziel bleibt der Individualpfad leer', individualpfad(daten, null).stationen.length === 0);
pruefe('Vermittlungsziel-Filter liefert leere Menge (Erstausbau)', individualpfad(daten, { dimension: 'vermittlungsziele', faktor: 'fehlerbild_erkennen' }).stationen.length === 0);

console.log('\n[6] Themenpfad');
const technik = themenpfad(daten, 'technik');
pruefe('Domäne technik enthält alle sechs in Graph-Reihenfolge', gleicheListe(technik.stationen.map((s) => s.baustein.id), erwarteteKette));
pruefe('Domänen-Facetten zählen korrekt', themenDomaenen(daten).find((d) => d.domaene === 'taktik').anzahl === 0);
pruefe('Modifikator nicht im Themenpfad verdrahtet', (() => {
  setzeDiagnose({ herkunft: 'BAD' });
  return themenpfad(daten, 'technik').stationen.every((s) => s.delta === null);
})());

console.log('\n[7] Baustein im Kontext');
const imKontext = stationImKontext(daten, 'griff', 'kompetenz');
pruefe('Nachbarn im Kompetenzpfad stimmen', imKontext.vorherige.baustein.id === 'grundposition' && imKontext.naechste.baustein.id === 'aufschlag');
pruefe('Delta im Kompetenz-Kontext aktiv', imKontext.station.delta?.id === 'griff_delta_bad');
pruefe('gleicher Baustein im Themen-Kontext ohne Delta', stationImKontext(daten, 'griff', 'themen:technik').station.delta === null);
pruefe('sequenzFuer versteht kompetenz:trainer (leer im Erstausbau)', sequenzFuer(daten, 'kompetenz:trainer').stationen.length === 0);

console.log('\n[8] Projektionen und Kontinuität');
setzeZurueck();
setzeDiagnose({ stufe: 'beginner' });
pruefe('global 0 von 6', globaleProjektion(daten).absolviert === 0 && globaleProjektion(daten).gesamt === 6);
setzeTeilStatus('griff', 'erklaerteil', 'erledigt');
pruefe('nur Erklärteil erledigt → noch nicht absolviert', globaleProjektion(daten).absolviert === 0 && globaleProjektion(daten).erklaertErledigt === 1);
setzeTeilStatus('griff', 'uebungsteil', 'erledigt');
pruefe('beide Teile erledigt → 1 von 6', globaleProjektion(daten).absolviert === 1);
const pfadProjektion = projektion(kompetenzpfad(daten).stationen.map((s) => s.baustein));
pruefe('pfadbezogene Projektion liest denselben Status', pfadProjektion.absolviert === 1 && pfadProjektion.gesamt === 6);
const uebersicht = trainingsuebersicht(daten);
pruefe('zwei kuratierte Einheiten mit auflösbaren Referenzen', uebersicht.length === 2 && uebersicht.every((e) => e.bausteine.length === 3));
registriereEinheitAbschluss('einheit_fundament');
registriereEinheitAbschluss('einheit_fundament');
const nachher = trainingsuebersicht(daten).find((e) => e.einheit.id === 'einheit_fundament');
pruefe('Kontinuität summiert kumulativ', nachher.absolviertZaehler === 2);

console.log('\n[9] Vollständigkeit der de-Labels');
const fehlend = [];
const hatLabel = (pfad) => {
  let wert = labelsDe;
  for (const teil of pfad) wert = wert?.[teil];
  if (typeof wert !== 'string' || wert === '') fehlend.push(pfad.join('.'));
};
for (const b of daten.bausteine) hatLabel(['bausteine', b.id]);
for (const b of [...daten.bausteine, ...daten.deltas]) for (const g of b.grafik || []) hatLabel(['grafiken', g]);
for (const e of daten.einheiten) hatLabel(['trainingseinheiten', e.id]);
for (const [gruppe, werte] of Object.entries(daten.vokabulare)) {
  if (!Array.isArray(werte)) continue;
  if (gruppe === 'abschluss_status_zustandsraum') continue; // Zustandsraum: beherrscht_INAKTIV ist Datenvermerk, kein UI-Wert
  for (const wert of werte) hatLabel(['vokabeln', gruppe, wert]);
}
for (const [bereich, faktoren] of Object.entries(daten.vokabulare.spielziele || {})) {
  if (bereich.startsWith('_')) continue;
  hatLabel(['spielziele', 'bereiche', bereich]);
  for (const f of faktoren) hatLabel(['spielziele', 'faktoren', f]);
}
for (const [bereich, faktoren] of Object.entries(daten.vokabulare.vermittlungsziele || {})) {
  if (bereich.startsWith('_')) continue;
  hatLabel(['vermittlungsziele', 'bereiche', bereich]);
  for (const f of faktoren) hatLabel(['vermittlungsziele', 'faktoren', f]);
}
pruefe('alle sichtbaren IDs tragen ein de-Label', fehlend.length === 0, fehlend.join(', '));

setzeZurueck();
console.log(`\n${laufend} Prüfungen, ${fehler} Fehler`);
process.exit(fehler === 0 ? 0 : 1);
