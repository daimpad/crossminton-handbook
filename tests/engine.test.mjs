// Engine-Tests gegen die Referenzdaten — ohne Abhängigkeiten, direkt lauffähig:
//   node tests/engine.test.mjs
// Prüft Datenvalidierung, Pfad-Traversierungen, Modifikator, Zwei-Ebenen-Logik,
// Projektionen, Kontinuität und die Vollständigkeit der de-Labels.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { aufgabenTeile, baueIndizes, deltaFuer, fehlerbilderFuer, hatReflexionsaufgabe, hatUebungsteil, niedrigsteStufe, spielformVon } from '../js/daten.js';
import { individualpfad, kompetenzpfad, sequenzFuer, spielformen, spielformpfad, stationImKontext, themenDomaenen, themenpfad, trainingsuebersicht } from '../js/pfade.js';
import { bausteinAbsolviert, globaleProjektion, projektion } from '../js/fortschritt.js';
import { registriereEinheitAbschluss, setzeDiagnose, setzeTeilStatus, setzeZurueck } from '../js/zustand.js';

const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..');
const liesJson = (pfad) => JSON.parse(readFileSync(join(wurzel, pfad), 'utf8'));

const technik = liesJson('data/bausteine.beginner-technik.json');
const taktik = liesJson('data/bausteine.beginner-taktik.json');
const mentales = liesJson('data/bausteine.beginner-mentales.json');
const athletik = liesJson('data/bausteine.beginner-athletik_kondition.json');
const fgTechnik = liesJson('data/bausteine.fortgeschritten-technik.json');
const fgTaktik = liesJson('data/bausteine.fortgeschritten-taktik.json');
const fgMentales = liesJson('data/bausteine.fortgeschritten-mentales.json');
const fgAthletik = liesJson('data/bausteine.fortgeschritten-athletik_kondition.json');
const doppelThema = liesJson('data/bausteine.doppel-thema.json');
const deltaTennis = liesJson('data/bausteine.delta-tennis.json');
const deltaSquash = liesJson('data/bausteine.delta-squash.json');
const einheiten = liesJson('data/trainingseinheiten.json');
const fehlerbilder = liesJson('data/fehlerbilder.json');
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

const daten = baueIndizes([technik, taktik, mentales, athletik, fgTechnik, fgTaktik, fgMentales, fgAthletik, doppelThema, deltaTennis, deltaSquash], einheiten, fehlerbilder);

const technikKette = ['grundposition', 'griff', 'aufschlag', 'vorhand_drive', 'rueckhand', 'beinarbeit'];
// Taktik-Graph verzweigt: fehler_vermeiden hängt an spielziel_verstehen (nicht
// am Sequenzvorgänger) und landet durch den Tiebreak korrekt zuletzt.
const taktikKette = ['spielziel_verstehen', 'zentrale_position', 'laenge_tiefe', 'rueckhand_des_gegners', 'aufschlag_taktisch', 'fehler_vermeiden'];
// Mentales & Athletik: Sternform — Rahmen-Einstieg als Wurzel, Werkzeuge als
// Blätter in Dateireihenfolge (zweite nicht-lineare Graphform).
const mentalesKette = ['warum_der_kopf_mitspielt', 'routine_vor_dem_aufschlag', 'ruhig_bleiben_wenn_es_eng_wird', 'den_fehler_abhaken', 'bei_der_sache_bleiben'];
const athletikKette = ['warum_athletik_dein_spiel_traegt', 'richtig_aufwaermen', 'beweglichkeit_und_schulter', 'schnelle_fuesse', 'durchhalten', 'erholen'];
// Beginner-Pool: Domänen-Blöcke in Vokabular-Reihenfolge (technik, taktik,
// trainingsgestaltung[leer], mentales, athletik_kondition).
const erwarteteKette = [...technikKette, ...taktikKette, ...mentalesKette, ...athletikKette];
// Fortgeschritten-Technik (Kraftquelle → Überkopf → Finesse → Beinarbeit-System).
const fgTechnikKette = ['handgelenk_peitsche', 'ueberkopf_clear', 'smash', 'kurzes_spiel_stopp', 'schnitt_spin', 'beinarbeit_system'];
// Fortgeschritten-Taktik: Umschalten (Rahmen) → Punkt aufbauen → Smash vorbereiten
// → Gegner lesen → Doppel → engen Satz führen. Gemischte weiche Voraussetzungen
// über Stufen- UND Domänengrenze (punkt_aufbauen → fortgeschrittene Technik).
const fgTaktikKette = ['umschalten', 'punkt_aufbauen', 'smash_vorbereiten', 'gegner_lesen_muster', 'doppel_grundlagen', 'engen_satz_fuehren'];
// Fortgeschritten-Mentales (Werkzeug→System→Selbstgespräch→Vorstellung→Momentum→Match)
// und Fortgeschritten-Athletik (Rahmen→Explosivität→Rumpf→Intervall→Belastung):
// beide stufenübergreifend an ihre Beginner-Gegenstücke gehängt, ohne Delta.
const fgMentalesKette = ['vom_werkzeug_zum_system', 'selbstgespraech_steuern', 'sich_das_spiel_vorstellen', 'momentum_lesen_und_drehen', 'ueber_das_match_stabil_bleiben'];
const fgAthletikKette = ['gezielt_trainieren', 'explosivitaet', 'rumpfstabilitaet', 'intervallausdauer', 'belastung_steuern_regenerieren'];
// Doppel-Querschnitt (spielform:doppel, NEUE Metadaten-Dimension): orthogonal zur
// Domäne. In Kompetenz-/Themenpfad hängen die Bausteine an ihre Domäne an
// (Pool-Reihenfolge); auf der Spielform-Achse bilden sie EIN Thema. `doppelTaktikKette`
// = die fünf Taktik-Doppel-Bausteine; die Athletik-/Mentales-Doppel je einer.
const doppelTaktikKette = ['doppel_als_eigenes_spiel', 'angriff_im_paar', 'verteidigung_im_paar', 'aufschlag_rueckschlag_doppel', 'das_umschalten_im_doppel'];
// Spielform-Achse (Erzählreihenfolge): Einstieg doppel_grundlagen + Querschnitt, quer über Taktik/Athletik/Mentales.
const doppelThemaKette = ['doppel_grundlagen', 'doppel_als_eigenes_spiel', 'angriff_im_paar', 'verteidigung_im_paar', 'bewegung_als_einheit', 'verstaendigung_im_paar', 'aufschlag_rueckschlag_doppel', 'das_umschalten_im_doppel'];

console.log('\n[1] Datenvalidierung');
pruefe('Referenzdaten ohne Warnungen', daten.warnungen.length === 0, daten.warnungen.join(' | '));
pruefe('52 Basisbausteine (Doppel-Querschnitt inkl.), 22 Deltas (16 + 6 Squash)', daten.bausteine.length === 52 && daten.deltas.length === 22);
pruefe('Herkunftsliste aus Delta-Bestand generiert = [BAD, TEN, SQ]', gleicheListe(daten.herkuenfte, ['BAD', 'TEN', 'SQ']));

console.log('\n[2] Kompetenzpfad ohne Herkunft');
setzeZurueck();
setzeDiagnose({ stufe: 'beginner' });
const pfadOhne = kompetenzpfad(daten);
pruefe(
  'Reihenfolge: Technik-Block dann Taktik-Block, fehler_vermeiden zuletzt',
  gleicheListe(pfadOhne.stationen.map((s) => s.baustein.id), erwarteteKette),
  pfadOhne.stationen.map((s) => s.baustein.id).join(' → ')
);
pruefe('Rückverzweigung aufgelöst: fehler_vermeiden am Ende des Taktik-Blocks', pfadOhne.stationen.map((s) => s.baustein.id).slice(6, 12).at(-1) === 'fehler_vermeiden');
pruefe('Sternform aufgelöst: Rahmen-Einstieg vor seinen Werkzeug-Blättern', (() => {
  const ids = pfadOhne.stationen.map((s) => s.baustein.id);
  return ids.indexOf('warum_der_kopf_mitspielt') < ids.indexOf('routine_vor_dem_aufschlag') && ids.indexOf('warum_athletik_dein_spiel_traegt') < ids.indexOf('richtig_aufwaermen');
})());
pruefe('keine Deltas aktiv', pfadOhne.stationen.every((s) => s.delta === null));
pruefe('keine Skip-Kandidaten', pfadOhne.stationen.every((s) => !s.skipKandidat));
pruefe('Beginner ist kumulativ bis Beginner = nur 23 Beginner-Bausteine', pfadOhne.stationen.length === 23);

console.log('\n[2b] Kompetenzpfad über zwei Stufen (kumulativ)');
const pfadBeginner = kompetenzpfad(daten, 'beginner');
const pfadFg = kompetenzpfad(daten, 'fortgeschritten');
pruefe('Beginner sieht keine Fortgeschritten-Bausteine', pfadBeginner.stationen.every((s) => ![...fgTechnikKette, ...fgTaktikKette].includes(s.baustein.id)));
pruefe('Fortgeschritten kumulativ = Beginner-Block + Fortgeschritten je Domäne (Doppel-Querschnitt hängt an seine Domäne an) (52)', gleicheListe(pfadFg.stationen.map((s) => s.baustein.id), [...erwarteteKette, ...fgTechnikKette, ...fgTaktikKette, ...doppelTaktikKette, ...fgMentalesKette, 'verstaendigung_im_paar', ...fgAthletikKette, 'bewegung_als_einheit']));
pruefe('Beginner-Bausteine bleiben an ihrer niedrigsten Stufe (Block vorn)', pfadFg.stationen.slice(0, 23).every((s) => niedrigsteStufe(daten, s.baustein) === 'beginner'));
pruefe('Fortgeschritten-Block folgt geschlossen hinten', pfadFg.stationen.slice(23).every((s) => niedrigsteStufe(daten, s.baustein) === 'fortgeschritten'));
pruefe('stufenübergreifende weiche Voraussetzung: handgelenk_peitsche ← vorhand_drive (Beginner)', (() => {
  const st = pfadFg.stationen.find((s) => s.baustein.id === 'handgelenk_peitsche');
  const idx = pfadFg.stationen.map((s) => s.baustein.id);
  return gleicheListe(st.baustein.voraussetzungen, ['vorhand_drive']) && idx.indexOf('vorhand_drive') < idx.indexOf('handgelenk_peitsche');
})());
pruefe('Beginner-Voraussetzung ist im kumulativen Pfad in der Menge (kein Außen-Hinweis)', kompetenzpfad(daten, 'fortgeschritten').stationen.find((s) => s.baustein.id === 'beinarbeit_system').ausserhalbMenge.length === 0);

console.log('\n[2c] Gemischte weiche Voraussetzungen (Stufen- UND Domänengrenze)');
// punkt_aufbauen verweist auf fortgeschrittene Technik (andere Domäne, gleiche
// Stufe) und bleibt dennoch taktik/fortgeschritten — die Kante ordnet nur.
const idxFg = pfadFg.stationen.map((s) => s.baustein.id);
const pa = pfadFg.stationen.find((s) => s.baustein.id === 'punkt_aufbauen');
pruefe('punkt_aufbauen bleibt taktik/fortgeschritten trotz Technik-Voraussetzungen', pa.baustein.domaene === 'taktik' && niedrigsteStufe(daten, pa.baustein) === 'fortgeschritten');
pruefe('gemischte Voraussetzung: umschalten (Taktik) + ueberkopf_clear + kurzes_spiel_stopp (Technik)', gleicheListe(pa.baustein.voraussetzungen, ['umschalten', 'ueberkopf_clear', 'kurzes_spiel_stopp']));
pruefe('Technik-Voraussetzungen sind im kumulativen Pfad in der Menge (kein Außen-Hinweis)', pa.ausserhalbMenge.length === 0);
pruefe('domänenübergreifende Kante ordnet: ueberkopf_clear + kurzes_spiel_stopp vor punkt_aufbauen', idxFg.indexOf('ueberkopf_clear') < idxFg.indexOf('punkt_aufbauen') && idxFg.indexOf('kurzes_spiel_stopp') < idxFg.indexOf('punkt_aufbauen'));
pruefe('smash_vorbereiten (Taktik) nach smash (Technik) einsortiert', idxFg.indexOf('smash') < idxFg.indexOf('smash_vorbereiten'));
pruefe('kein Baustein zwischen Domänen/Stufen verschoben (Technik-Block vor Taktik-Block innerhalb Fortgeschritten)', idxFg.indexOf('beinarbeit_system') < idxFg.indexOf('umschalten'));

console.log('\n[3] Cross-Sport-Modifikator (Herkunft BAD)');
setzeDiagnose({ herkunft: 'BAD' });
const pfadBad = kompetenzpfad(daten);
pruefe('Sequenz bleibt unverändert (Ersetzung substituiert nur Inhalt)', gleicheListe(pfadBad.stationen.map((s) => s.baustein.id), erwarteteKette));
const deltaErwartung = {
  griff: 'griff_delta_bad',
  aufschlag: 'aufschlag_delta_bad',
  vorhand_drive: 'vorhand_drive_delta_bad',
  rueckhand: 'rueckhand_delta_bad',
  aufschlag_taktisch: 'aufschlag_taktisch_delta_bad',
};
for (const station of pfadBad.stationen) {
  const erwartet = deltaErwartung[station.baustein.id] ?? null;
  pruefe(`Delta an ${station.baustein.id}: ${erwartet ?? 'keins'}`, (station.delta?.id ?? null) === erwartet);
}
pruefe('Taktik-Delta greift domänenübergreifend im selben Modifikator', pfadBad.stationen.find((s) => s.baustein.id === 'aufschlag_taktisch').delta?.id === 'aufschlag_taktisch_delta_bad');
pruefe('Skip-Kandidaten sind die delta-freien Bausteine (18 = 23 − 5 mit Delta)', (() => {
  const skip = pfadBad.stationen.filter((s) => s.skipKandidat).map((s) => s.baustein.id);
  return skip.length === 18 && !skip.includes('aufschlag_taktisch') && skip.includes('warum_der_kopf_mitspielt') && skip.includes('erholen');
})());
pruefe('deltaFuer liefert für unbekannte Herkunft null', deltaFuer(daten, 'griff', 'BS') === null);
// Cross-Sport über zwei Stufen: der kumulative Fortgeschritten-Pfad blendet
// Beginner- UND Fortgeschritten-Deltas ein (10: 5 + 3 Technik + 2 Doppel-Taktik).
const pfadFgBad = kompetenzpfad(daten, 'fortgeschritten');
pruefe('Fortgeschritten-Deltas greifen im kumulativen Pfad', ['handgelenk_peitsche', 'ueberkopf_clear', 'beinarbeit_system'].every((id) => pfadFgBad.stationen.find((s) => s.baustein.id === id).delta?.id === `${id}_delta_bad`));
pruefe('Geometrie-Delta an beinarbeit_system aktiv', pfadFgBad.stationen.find((s) => s.baustein.id === 'beinarbeit_system').delta?.id === 'beinarbeit_system_delta_bad');
pruefe('Doppel-Deltas (Taktik) greifen im kumulativen Pfad (Grundlagen + Umschalten)', pfadFgBad.stationen.find((s) => s.baustein.id === 'doppel_grundlagen').delta?.id === 'doppel_grundlagen_delta_bad' && pfadFgBad.stationen.find((s) => s.baustein.id === 'das_umschalten_im_doppel').delta?.id === 'das_umschalten_im_doppel_delta_bad');
pruefe('kumulativer BAD-Pfad zeigt 10 Deltas (5 Beginner + 3 Technik + 2 Doppel-Taktik)', pfadFgBad.stationen.filter((s) => s.delta).length === 10);
pruefe('handgelenk_peitsche-Delta bündelt auf vorhand_drive_delta_bad', gleicheListe(pfadFgBad.stationen.find((s) => s.baustein.id === 'handgelenk_peitsche').delta.delta_buendelung, ['vorhand_drive_delta_bad']));

console.log('\n[3b] Cross-Sport-Modifikator (Herkunft TEN) — herkunftsreine Delta-Datei, zweite Herkunft');
// Punkt 1: reine Delta-Datei ohne Basis-Bausteine; Kanten docken über zwei Stufen an.
pruefe('Tennis-Deltas ohne eigene Basis-Bausteine (nur delta_bausteine)', (deltaTennis.bausteine || []).length === 0 && deltaTennis.delta_bausteine.length === 6);
pruefe('alle 6 TEN-Deltas an existierende Basis-Bausteine gehängt', deltaTennis.delta_bausteine.every((d) => daten.bausteinVonId.has(d.basis_baustein) && deltaFuer(daten, d.basis_baustein, 'TEN')?.id === d.id));
pruefe('TEN-Kanten treffen beide Stufen (4 Beginner-Technik + 2 Fortgeschritten)', ['griff', 'aufschlag', 'vorhand_drive', 'rueckhand'].every((id) => niedrigsteStufe(daten, daten.bausteinVonId.get(id)) === 'beginner' && deltaFuer(daten, id, 'TEN')) && ['ueberkopf_clear', 'beinarbeit_system'].every((id) => niedrigsteStufe(daten, daten.bausteinVonId.get(id)) === 'fortgeschritten' && deltaFuer(daten, id, 'TEN')));
// Punkt 2: griff trägt jetzt zwei Herkunfts-Deltas — genau die gewählte greift.
pruefe('griff hat sowohl BAD- als auch TEN-Delta', deltaFuer(daten, 'griff', 'BAD')?.id === 'griff_delta_bad' && deltaFuer(daten, 'griff', 'TEN')?.id === 'griff_delta_ten');
setzeZurueck();
setzeDiagnose({ stufe: 'fortgeschritten', herkunft: 'TEN' });
const pfadFgTen = kompetenzpfad(daten, 'fortgeschritten');
pruefe('Herkunft TEN blendet genau das TEN-Delta ein (BAD ignoriert)', pfadFgTen.stationen.find((s) => s.baustein.id === 'griff').delta?.id === 'griff_delta_ten');
pruefe('kumulativer TEN-Pfad zeigt genau die 6 Tennis-Deltas', (() => {
  const mitDelta = pfadFgTen.stationen.filter((s) => s.delta).map((s) => s.baustein.id);
  return mitDelta.length === 6 && gleicheListe(mitDelta, ['griff', 'aufschlag', 'vorhand_drive', 'rueckhand', 'ueberkopf_clear', 'beinarbeit_system']);
})());
pruefe('positiver Transfer ueberkopf_clear trägt das TEN-Delta (strukturell wie die abbauenden)', pfadFgTen.stationen.find((s) => s.baustein.id === 'ueberkopf_clear').delta?.id === 'ueberkopf_clear_delta_ten');
pruefe('rueckhand_delta_ten bündelt auf griff_delta_ten + vorhand_drive_delta_ten', gleicheListe(pfadFgTen.stationen.find((s) => s.baustein.id === 'rueckhand').delta.delta_buendelung, ['griff_delta_ten', 'vorhand_drive_delta_ten']));
pruefe('kein TEN-Delta mit eigenem Übungsteil (Delta-Regel)', deltaTennis.delta_bausteine.every((d) => d.eigener_uebungsteil === false && d.uebungsteil == null));

console.log('\n[3c] Cross-Sport-Modifikator (Herkunft SQ) — dritte Herkunft, Deltas auf bisher delta-freien Bausteinen');
// Punkt 1: Squash als dritte Onboarding-Herkunft (Ableitung aus dem Delta-Bestand).
pruefe('Squash-Deltas ohne eigene Basis-Bausteine (nur delta_bausteine)', (deltaSquash.bausteine || []).length === 0 && deltaSquash.delta_bausteine.length === 6);
pruefe('Herkunftsliste trägt jetzt drei Herkünfte, SQ als dritte', daten.herkuenfte[2] === 'SQ');
pruefe('alle 6 SQ-Deltas an existierende Basis-Bausteine gehängt', deltaSquash.delta_bausteine.every((d) => daten.bausteinVonId.has(d.basis_baustein) && deltaFuer(daten, d.basis_baustein, 'SQ')?.id === d.id));
// Punkt 2: Mehrfach-Deltas wachsen — griff/aufschlag/vorhand_drive tragen alle drei.
pruefe('griff/aufschlag/vorhand_drive tragen je BAD-, TEN- UND SQ-Delta', ['griff', 'aufschlag', 'vorhand_drive'].every((id) => deltaFuer(daten, id, 'BAD') && deltaFuer(daten, id, 'TEN') && deltaFuer(daten, id, 'SQ')));
// Punkt 3: Deltas auf bisher delta-freien Basis-Bausteinen (Taktik, erstmals).
pruefe('spielziel_verstehen/zentrale_position: bei BAD/TEN kein Delta, bei SQ eines', ['spielziel_verstehen', 'zentrale_position'].every((id) => deltaFuer(daten, id, 'BAD') === null && deltaFuer(daten, id, 'TEN') === null && deltaFuer(daten, id, 'SQ')?.id === `${id}_delta_sq`));
setzeZurueck();
setzeDiagnose({ stufe: 'fortgeschritten', herkunft: 'SQ' });
const pfadFgSq = kompetenzpfad(daten, 'fortgeschritten');
pruefe('Herkunft SQ blendet genau das SQ-Delta ein (BAD/TEN ignoriert)', pfadFgSq.stationen.find((s) => s.baustein.id === 'griff').delta?.id === 'griff_delta_sq');
pruefe('kumulativer SQ-Pfad zeigt genau die 6 Squash-Deltas (inkl. 2 Taktik)', (() => {
  const mitDelta = pfadFgSq.stationen.filter((s) => s.delta).map((s) => s.baustein.id);
  return mitDelta.length === 6 && gleicheListe(mitDelta.slice().sort(), ['aufschlag', 'griff', 'schnitt_spin', 'spielziel_verstehen', 'vorhand_drive', 'zentrale_position']);
})());
pruefe('positive Transfers (griff, zentrale_position, schnitt_spin) tragen das SQ-Delta', ['griff', 'zentrale_position', 'schnitt_spin'].every((id) => pfadFgSq.stationen.find((s) => s.baustein.id === id).delta?.id === `${id}_delta_sq`));
pruefe('Taktik-Baustein spielziel_verstehen trägt bei SQ das Wand-Delta', pfadFgSq.stationen.find((s) => s.baustein.id === 'spielziel_verstehen').delta?.id === 'spielziel_verstehen_delta_sq');
pruefe('bewusst kein SQ-Rückhand-Delta (Squash-Rückhand transferiert glatt)', deltaFuer(daten, 'rueckhand', 'SQ') === null);
pruefe('vorhand_drive_delta_sq bündelt auf griff_delta_sq', gleicheListe(pfadFgSq.stationen.find((s) => s.baustein.id === 'vorhand_drive').delta.delta_buendelung, ['griff_delta_sq']));
pruefe('kein SQ-Delta mit eigenem Übungsteil (Delta-Regel)', deltaSquash.delta_bausteine.every((d) => d.eigener_uebungsteil === false && d.uebungsteil == null));

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

console.log('\n[5] Individualpfad (über Könnensstufen kumulativ, wie der Kompetenzpfad)');
setzeZurueck();
// Beginner-Diagnose: nur die Beginner-Leiter des Faktors, nicht die Fortgeschritten-Bausteine.
setzeDiagnose({ stufe: 'beginner', ziel: { dimension: 'spielziele', faktor: 'tempo_haertedosierung' } });
const individuell = individualpfad(daten);
pruefe(
  'Beginner-Diagnose: Faktor nur bis Beginner-Stufe (griff, vorhand_drive, rueckhand)',
  gleicheListe(individuell.stationen.map((s) => s.baustein.id), ['griff', 'vorhand_drive', 'rueckhand'])
);
const griffStation = individuell.stationen[0];
pruefe('Voraussetzung außerhalb der Menge nur als Hinweis', gleicheListe(griffStation.ausserhalbMenge, ['grundposition']));
// Fortgeschritten-Diagnose: kumulativ Beginner + Fortgeschritten (Ziel-Nähe → Domäne → Pool).
setzeDiagnose({ stufe: 'fortgeschritten' });
pruefe(
  'Fortgeschritten-Diagnose: Faktor kumulativ über beide Stufen (8, domänen-geordnet)',
  gleicheListe(individualpfad(daten, { dimension: 'spielziele', faktor: 'tempo_haertedosierung' }).stationen.map((s) => s.baustein.id), ['griff', 'vorhand_drive', 'rueckhand', 'handgelenk_peitsche', 'ueberkopf_clear', 'smash', 'schnitt_spin', 'rumpfstabilitaet'])
);
setzeDiagnose({ stufe: 'beginner' });
pruefe('ohne Ziel bleibt der Individualpfad leer', individualpfad(daten, null).stationen.length === 0);
pruefe('Vermittlungsziel-Filter liefert leere Menge (Erstausbau)', individualpfad(daten, { dimension: 'vermittlungsziele', faktor: 'fehlerbild_erkennen' }).stationen.length === 0);
pruefe('Mehrfachauswahl: domänenübergreifende Vereinigungsmenge (Beginner-Stufe)', (() => {
  const ids = individualpfad(daten, [
    { dimension: 'spielziele', faktor: 'tempo_haertedosierung' },
    { dimension: 'spielziele', faktor: 'wiederholte_antrittsschnelligkeit' },
  ]).stationen.map((s) => s.baustein.id);
  // technik (tempo + antritt), taktik (zentrale_position), athletik (schnelle_fuesse)
  return ids.includes('griff') && ids.includes('zentrale_position') && ids.includes('schnelle_fuesse');
})());
pruefe('Altformat (Einzelziel-Objekt) bleibt ohne Migration gültig', individualpfad(daten, { dimension: 'spielziele', faktor: 'tempo_haertedosierung' }).stationen.length === 3);

console.log('\n[6] Themenpfad über fünf Domänen');
pruefe('Domäne technik: Beginner- dann Fortgeschritten-Block (12)', gleicheListe(themenpfad(daten, 'technik').stationen.map((s) => s.baustein.id), [...technikKette, ...fgTechnikKette]));
pruefe('Domäne taktik: Beginner + Fortgeschritten + Doppel-Taktik angehängt (17)', gleicheListe(themenpfad(daten, 'taktik').stationen.map((s) => s.baustein.id), [...taktikKette, ...fgTaktikKette, ...doppelTaktikKette]));
pruefe('Domäne mentales: Beginner + Fortgeschritten + Doppel-Mentales angehängt (11)', gleicheListe(themenpfad(daten, 'mentales').stationen.map((s) => s.baustein.id), [...mentalesKette, ...fgMentalesKette, 'verstaendigung_im_paar']));
pruefe('Domäne athletik_kondition: Beginner + Fortgeschritten + Doppel-Athletik angehängt (12)', gleicheListe(themenpfad(daten, 'athletik_kondition').stationen.map((s) => s.baustein.id), [...athletikKette, ...fgAthletikKette, 'bewegung_als_einheit']));
const facetten = themenDomaenen(daten);
const facette = (d) => facetten.find((f) => f.domaene === d).anzahl;
pruefe('Facetten inkl. Doppel-Querschnitt: technik=12, taktik=17, mentales=11, athletik=12, trainingsgestaltung leer', facette('technik') === 12 && facette('taktik') === 17 && facette('mentales') === 11 && facette('athletik_kondition') === 12 && facette('trainingsgestaltung') === 0);
pruefe('Modifikator nicht im Themenpfad verdrahtet', (() => {
  setzeDiagnose({ herkunft: 'BAD' });
  return themenpfad(daten, 'mentales').stationen.every((s) => s.delta === null);
})());

console.log('\n[7] Baustein im Kontext');
const imKontext = stationImKontext(daten, 'griff', 'kompetenz');
pruefe('Nachbarn im Kompetenzpfad stimmen', imKontext.vorherige.baustein.id === 'grundposition' && imKontext.naechste.baustein.id === 'aufschlag');
pruefe('Delta im Kompetenz-Kontext aktiv', imKontext.station.delta?.id === 'griff_delta_bad');
pruefe('gleicher Baustein im Themen-Kontext ohne Delta', stationImKontext(daten, 'griff', 'themen:technik').station.delta === null);
pruefe('sequenzFuer versteht kompetenz:trainer (leer im Erstausbau)', sequenzFuer(daten, 'kompetenz:trainer').stationen.length === 0);

console.log('\n[7b] Fehlerbilder (Trainer-Layer)');
pruefe('fehlerbilderFuer(griff) liefert das Fehlerbild', fehlerbilderFuer(daten, 'griff').length === 1 && fehlerbilderFuer(daten, 'griff')[0].id === 'griff_fehler_zu_fest');
pruefe('fehlerbilderFuer ohne Eintrag liefert leeres Array (Nicht-Fehlerfall)', gleicheListe(fehlerbilderFuer(daten, 'aufschlag'), []));
const fb = fehlerbilderFuer(daten, 'griff')[0];
pruefe('Fehlerbild trägt typ fehlerbild und Trainer-Stufe', fb.typ === 'fehlerbild' && fb.kompetenzstufe.includes('trainer'));
pruefe('Fehlerbild ohne eigenen Übungsteil (Trainer-Layer-Regel)', !hatUebungsteil(fb));
pruefe('Fehlerbild trägt die drei benannten Felder', ['symptom', 'ursache', 'korrektur'].every((f) => typeof fb.erklaerteil.de[f] === 'string' && fb.erklaerteil.de[f].trim() !== ''));
pruefe('Fehlerbild ist nie eine Station (nicht im Baustein-Pool)', !daten.bausteinVonId.has('griff_fehler_zu_fest'));
pruefe('Fehlerbild taucht in keiner Pfad-Sequenz auf', ['kompetenz', 'kompetenz:trainer', 'themen:technik'].every((k) => !sequenzFuer(daten, k).stationen.some((s) => s.baustein.id === 'griff_fehler_zu_fest')));
pruefe('leeres Erklärfeld erzeugt eine Warnung', (() => {
  const kaputt = { fehlerbild_bausteine: [{ ...fb, id: 'test_leer', erklaerteil: { de: { symptom: 'x', ursache: '', korrektur: 'y' } } }] };
  return baueIndizes([technik], einheiten, kaputt).warnungen.some((warnung) => warnung.includes('test_leer') && warnung.includes('ursache'));
})());

console.log('\n[7c] Reflexionsaufgabe (Taktik)');
const spielziel = daten.bausteinVonId.get('spielziel_verstehen');
pruefe('Taktik-Baustein trägt Reflexionsaufgabe statt Übungsteil', hatReflexionsaufgabe(spielziel) && !hatUebungsteil(spielziel));
pruefe('aufgabenTeile liefert reflexionsaufgabe', gleicheListe(aufgabenTeile(spielziel), ['reflexionsaufgabe']));
pruefe('Taktik-Baustein mit Übungsteil bleibt Übungsteil', hatUebungsteil(daten.bausteinVonId.get('laenge_tiefe')) && !hatReflexionsaufgabe(daten.bausteinVonId.get('laenge_tiefe')));
setzeZurueck();
setzeDiagnose({ stufe: 'beginner' });
setzeTeilStatus('spielziel_verstehen', 'erklaerteil', 'erledigt');
pruefe('nur Erklärteil erledigt → Reflexions-Baustein noch nicht absolviert', !bausteinAbsolviert(spielziel));
setzeTeilStatus('spielziel_verstehen', 'reflexionsaufgabe', 'erledigt');
pruefe('Erklärteil + Reflexion erledigt → absolviert', bausteinAbsolviert(spielziel));
pruefe('Titel aus anzeigetitel ins Label geliftet', labelsDe.bausteine.spielziel_verstehen === 'Das Spielziel verstehen');
pruefe('voraussetzungen_querverweis inert (keine Graph-Kante)', (() => {
  const zentral = daten.bausteinVonId.get('zentrale_position');
  return zentral.voraussetzungen_querverweis && gleicheListe(zentral.voraussetzungen, ['spielziel_verstehen']);
})());

console.log('\n[7d] Domänenübergreifende Zieldiagnose über zwei Stufen, Vokabular-Erweiterung, delta_erwartet');
setzeZurueck();
// Beginner-Diagnose: Faktoren nur bis Beginner-Stufe (Fortgeschritten-Bausteine ausgeblendet).
setzeDiagnose({ stufe: 'beginner' });
pruefe('Psychoregulation-Ziel (Bereich 4), Beginner: nur Beginner-Mentales', gleicheListe(individualpfad(daten, { dimension: 'spielziele', faktor: 'konzentrationskonstanz' }).stationen.map((s) => s.baustein.id), ['warum_der_kopf_mitspielt', 'den_fehler_abhaken', 'bei_der_sache_bleiben']));
pruefe('Energetik-Ziel (Bereich 1), Beginner: nur Beginner-Athletik', gleicheListe(individualpfad(daten, { dimension: 'spielziele', faktor: 'rally_ausdauer' }).stationen.map((s) => s.baustein.id), ['beinarbeit', 'warum_athletik_dein_spiel_traegt', 'durchhalten']));
pruefe('satz_match_regeneration, Beginner: genau erholen', gleicheListe(individualpfad(daten, { dimension: 'spielziele', faktor: 'satz_match_regeneration' }).stationen.map((s) => s.baustein.id), ['erholen']));
pruefe('doppel_spezifische_loesungen, Beginner: leer (Baustein liegt auf Fortgeschritten)', individualpfad(daten, { dimension: 'spielziele', faktor: 'doppel_spezifische_loesungen' }).stationen.length === 0);
// Fortgeschritten-Diagnose: kumulativ Beginner + Fortgeschritten — dieselben Faktoren
// bespielen jetzt zwei Stufen (Psychoregulation, Energetik). Erstaktivierung doppel.
setzeDiagnose({ stufe: 'fortgeschritten' });
pruefe('Psychoregulation-Ziel, Fortgeschritten: kumulativ Beginner + Fortgeschritten-Mentales (inkl. Doppel-Verständigung)', gleicheListe(individualpfad(daten, { dimension: 'spielziele', faktor: 'konzentrationskonstanz' }).stationen.map((s) => s.baustein.id), ['warum_der_kopf_mitspielt', 'den_fehler_abhaken', 'bei_der_sache_bleiben', 'vom_werkzeug_zum_system', 'selbstgespraech_steuern', 'sich_das_spiel_vorstellen', 'momentum_lesen_und_drehen', 'ueber_das_match_stabil_bleiben', 'verstaendigung_im_paar']));
pruefe('Energetik-Ziel, Fortgeschritten: kumulativ inkl. intervallausdauer + belastung_steuern', (() => {
  const ids = individualpfad(daten, { dimension: 'spielziele', faktor: 'rally_ausdauer' }).stationen.map((s) => s.baustein.id);
  return ids.includes('durchhalten') && ids.includes('intervallausdauer') && ids.includes('belastung_steuern_regenerieren');
})());
pruefe('satz_match_regeneration, Fortgeschritten: erholen + Fortgeschritten-Regeneration', gleicheListe(individualpfad(daten, { dimension: 'spielziele', faktor: 'satz_match_regeneration' }).stationen.map((s) => s.baustein.id), ['erholen', 'intervallausdauer', 'belastung_steuern_regenerieren']));
// Spielziel-Faktor doppel_spezifische_loesungen (Bereich 6): durch den Doppel-Block
// jetzt BREIT belegt — alle acht Doppel-Bausteine tragen ihn (Fortgeschritten-Stufe).
pruefe('doppel_spezifische_loesungen, Fortgeschritten: breit belegt (alle 8 Doppel-Bausteine)', individualpfad(daten, { dimension: 'spielziele', faktor: 'doppel_spezifische_loesungen' }).stationen.length === 8);
pruefe('SP und AT im Transfer-Vokabular ergänzt', daten.vokabulare.transfer_herkunft.includes('SP') && daten.vokabulare.transfer_herkunft.includes('AT'));
pruefe('SP/AT tragen ausgeschriebene Labels', labelsDe.vokabeln.transfer_herkunft.SP === 'Sportpsychologie' && labelsDe.vokabeln.transfer_herkunft.AT === 'Athletik-/Trainingswissenschaft');
pruefe('delta_erwartet ist Dokumentation, keine Delta-Kante', (() => {
  const b = daten.bausteinVonId.get('beweglichkeit_und_schulter');
  return typeof b.delta_erwartet === 'string' && deltaFuer(daten, 'beweglichkeit_und_schulter', 'BAD') === null && deltaFuer(daten, 'beweglichkeit_und_schulter', 'TEN') === null;
})());

console.log('\n[7e] Spielform-Achse (NEUE Metadaten-Dimension spielform, Doppel-Querschnitt)');
setzeZurueck();
pruefe('spielform fehlt = einzel (Alt-Bausteine unangetastet)', spielformVon(daten.bausteinVonId.get('griff')) === 'einzel');
pruefe('doppel_grundlagen nachträglich als spielform:doppel markiert', spielformVon(daten.bausteinVonId.get('doppel_grundlagen')) === 'doppel');
pruefe('spielformen() bietet nur doppel als eigene Achse (einzel ist Default, kein Thema)', gleicheListe(spielformen(daten).map((s) => s.spielform), ['doppel']) && spielformen(daten)[0].anzahl === 8);
pruefe('Spielform-Achse doppel: 8 Bausteine als ein Thema, quer über Domänen (Erzählreihenfolge)', gleicheListe(spielformpfad(daten, 'doppel').stationen.map((s) => s.baustein.id), doppelThemaKette));
pruefe('Doppel-Thema queert drei Domänen (Taktik, Athletik, Mentales)', (() => {
  const domaenen = new Set(spielformpfad(daten, 'doppel').stationen.map((s) => s.baustein.domaene));
  return domaenen.has('taktik') && domaenen.has('athletik_kondition') && domaenen.has('mentales');
})());
// Cross-Sport-Modifikator ist auf der Spielform-Achse verdrahtet (wie im Kompetenzpfad).
setzeDiagnose({ herkunft: 'BAD' });
pruefe('Cross-Sport auf der Spielform-Achse: BAD blendet die zwei Doppel-Deltas ein', (() => {
  const mitDelta = spielformpfad(daten, 'doppel').stationen.filter((s) => s.delta).map((s) => `${s.baustein.id}:${s.delta.id}`);
  return gleicheListe(mitDelta, ['doppel_grundlagen:doppel_grundlagen_delta_bad', 'das_umschalten_im_doppel:das_umschalten_im_doppel_delta_bad']);
})());
pruefe('Delta greift auch in der Baustein-Ansicht im Spielform-Kontext', stationImKontext(daten, 'das_umschalten_im_doppel', 'spielform:doppel').station.delta?.id === 'das_umschalten_im_doppel_delta_bad');
pruefe('Delta-Bündelung verweist weich auf das Grundlagen-Doppel-Delta', (() => {
  const delta = daten.deltas.find((d) => d.id === 'das_umschalten_im_doppel_delta_bad');
  return gleicheListe(delta.delta_buendelung || [], ['doppel_grundlagen_delta_bad']) && daten.deltas.some((d) => d.id === 'doppel_grundlagen_delta_bad');
})());
pruefe('spielform-Vokabular + Label vorhanden', daten.vokabulare.spielform && daten.vokabulare.spielform.includes('doppel') && labelsDe.vokabeln.spielform.doppel === 'Doppel' && labelsDe.vokabeln.spielform.einzel === 'Einzel');
pruefe('Themen-/Kompetenzpfad bleiben unberührt vom Spielform-Filter (orthogonal): Doppel-Bausteine weiter in ihren Domänen', sequenzFuer(daten, 'themen:mentales').stationen.some((s) => s.baustein.id === 'verstaendigung_im_paar'));

console.log('\n[8] Projektionen und Kontinuität');
setzeZurueck();
setzeDiagnose({ stufe: 'beginner' });
pruefe('global 0 von 52', globaleProjektion(daten).absolviert === 0 && globaleProjektion(daten).gesamt === 52);
setzeTeilStatus('griff', 'erklaerteil', 'erledigt');
pruefe('nur Erklärteil erledigt → noch nicht absolviert', globaleProjektion(daten).absolviert === 0 && globaleProjektion(daten).erklaertErledigt === 1);
setzeTeilStatus('griff', 'uebungsteil', 'erledigt');
pruefe('beide Teile erledigt → 1 von 52', globaleProjektion(daten).absolviert === 1);
const pfadProjektion = projektion(kompetenzpfad(daten).stationen.map((s) => s.baustein));
pruefe('Beginner-Pfad-Projektion bleibt bei 23 (kumulativ bis Beginner)', pfadProjektion.absolviert === 1 && pfadProjektion.gesamt === 23);
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
for (const fbEintrag of daten.fehlerbilder) hatLabel(['fehlerbilder', fbEintrag.id]);
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
