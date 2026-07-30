// Engine-Tests gegen die Referenzdaten — ohne Abhängigkeiten, direkt lauffähig:
//   node tests/engine.test.mjs
// Prüft Datenvalidierung, Pfad-Traversierungen, Modifikator, Zwei-Ebenen-Logik,
// Projektionen, Kontinuität und die Vollständigkeit der de-Labels.

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { aufgabenTeile, baueIndizes, deltaFuer, einheitReferenzen, fehlerbilderFuer, hatReflexionsaufgabe, hatUebungsteil, niedrigsteStufe, spielformVon, untergrundVon } from '../js/daten.js';
import { individualpfad, kompetenzpfad, merklisteStationen, sequenzFuer, spielformen, spielformpfad, stationImKontext, themenDomaenen, themenpfad, trainingsuebersicht, umgebungspfad, untergruende, witterungen } from '../js/pfade.js';
import { bausteinAbsolviert, globaleProjektion, projektion } from '../js/fortschritt.js';
import { bausteinText, normalisiere, sucheBausteine } from '../js/suche.js';
import { markiereAbsolviert } from '../js/aktionen.js';
import { bausteinIcon, GRAFIK_SPRACHEN, SVG_GRAFIKEN } from '../js/oberflaeche.js';
import { plan as gespPlan, registriereEinheitAbschluss, setzeDiagnose, setzePlan, setzeTeilStatus, setzeZurueck, loeschePlan, koTurnier as gespKoTurnier, setzeKoTurnier, loescheKoTurnier } from '../js/zustand.js';
import { einheitProfil, erzeugePlan, tauscheEinheit, entferneSession, planNachWochen, planbareEinheiten, planAlsIcal } from '../js/plan.js';
import { erzeugeTurnier, istAbgeschlossen, mische, platzierungen, rundenName, traegtSiegerEin, turniersieger } from '../js/ko-turnier.js';
import { pruefeI18nStruktur } from '../scripts/i18n-check.mjs';

const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..');
const liesJson = (pfad) => JSON.parse(readFileSync(join(wurzel, pfad), 'utf8'));

const technik = liesJson('data/bausteine.beginner-technik.json');
const taktik = liesJson('data/bausteine.beginner-taktik.json');
const mentales = liesJson('data/bausteine.beginner-mentales.json');
const athletik = liesJson('data/bausteine.beginner-athletik_kondition.json');
const ausruestung = liesJson('data/bausteine.ausruestung-grundlagen.json');
const ausruestungFg = liesJson('data/bausteine.ausruestung-fortgeschritten.json');
const fgTechnik = liesJson('data/bausteine.fortgeschritten-technik.json');
const fgTaktik = liesJson('data/bausteine.fortgeschritten-taktik.json');
const fgMentales = liesJson('data/bausteine.fortgeschritten-mentales.json');
const fgAthletik = liesJson('data/bausteine.fortgeschritten-athletik_kondition.json');
const trainerGestaltung = liesJson('data/bausteine.trainer-trainingsgestaltung.json');
const experteTechnik = liesJson('data/bausteine.experte-technik.json');
const experteTaktik = liesJson('data/bausteine.experte-taktik.json');
const experteMentales = liesJson('data/bausteine.experte-mentales.json');
const experteAthletik = liesJson('data/bausteine.experte-athletik_kondition.json');
const doppelThema = liesJson('data/bausteine.doppel-thema.json');
const doppelBeginner = liesJson('data/bausteine.doppel-beginner.json');
const doppelExperte = liesJson('data/bausteine.doppel-experte.json');
const outdoorThema = liesJson('data/bausteine.outdoor-thema.json');
const spielmodi = liesJson('data/bausteine.spielmodi.json');
const modusThema = liesJson('data/bausteine.modus-thema.json');
const deltaTennis = liesJson('data/bausteine.delta-tennis.json');
const deltaSquash = liesJson('data/bausteine.delta-squash.json');
const einheiten = liesJson('data/trainingseinheiten.json');
const fehlerbilder = liesJson('data/fehlerbilder.json');
const regeln = liesJson('data/regeln.json');
const appInfo = liesJson('data/app-info.json');
const turnierregeln = liesJson('data/turnierregeln.json');
const labelsDe = liesJson('data/labels/de.json');
const labelsEn = liesJson('data/labels/en.json');

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

const daten = baueIndizes([technik, taktik, mentales, athletik, ausruestung, trainerGestaltung, fgTechnik, fgTaktik, fgMentales, fgAthletik, ausruestungFg, experteTechnik, experteTaktik, experteMentales, experteAthletik, doppelBeginner, doppelThema, doppelExperte, outdoorThema, spielmodi, modusThema, deltaTennis, deltaSquash], einheiten, fehlerbilder, regeln, appInfo, turnierregeln);

const technikKette = ['grundposition', 'griff', 'aufschlag', 'vorhand_drive', 'rueckhand', 'beinarbeit'];
// Taktik-Graph verzweigt: fehler_vermeiden hängt an spielziel_verstehen (nicht
// am Sequenzvorgänger) und landet durch den Tiebreak korrekt zuletzt.
const taktikKette = ['spielziel_verstehen', 'zentrale_position', 'laenge_tiefe', 'rueckhand_des_gegners', 'aufschlag_taktisch', 'fehler_vermeiden'];
// Mentales & Athletik: Sternform — Rahmen-Einstieg als Wurzel, Werkzeuge als
// Blätter in Dateireihenfolge (zweite nicht-lineare Graphform).
const mentalesKette = ['warum_der_kopf_mitspielt', 'routine_vor_dem_aufschlag', 'ruhig_bleiben_wenn_es_eng_wird', 'den_fehler_abhaken', 'bei_der_sache_bleiben'];
const athletikKette = ['warum_athletik_dein_spiel_traegt', 'richtig_aufwaermen', 'beweglichkeit_und_schulter', 'schnelle_fuesse', 'durchhalten', 'erholen'];
// Beginner-Pool: Domänen-Blöcke in Vokabular-Reihenfolge; Doppel-Beginner je Domäne
// angehängt (Taktik 3, Mentales 1, Athletik 1); Ausrüstung (eigene Domäne, sortiert
// zuletzt) als Schluss-Block (Übersicht + Speeder/Schläger/Schuhe/Kleidung) → 33 Bausteine.
const erwarteteKette = [...technikKette, 'funplay', ...taktikKette, 'erste_schritte_doppel', 'wer_nimmt_den_ball', 'aufschlag_im_doppel_einfach', ...mentalesKette, 'sich_absprechen', ...athletikKette, 'einander_platz_lassen', 'deine_ausruestung', 'der_speeder', 'der_schlaeger', 'schuhe_finden', 'funktionskleidung'];
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
// Experte-Technik (dritte Könnensstufe, herkunftsneutral): Täuschung (Rahmen) →
// früh nehmen → Tempo/Rhythmus → Sprung-Smash → Präzision → Konstanz. Weiche
// Voraussetzungen zeigen stufenübergreifend auf die fortgeschrittene Technik.
const experteTechnikKette = ['taeuschung', 'frueh_nehmen', 'tempo_rhythmus_wechsel', 'sprung_smash', 'praezision_an_die_linien', 'konstanz_unter_hoechstdruck'];
// Experte-Taktik (Matchstrategie, herkunftsneutral): Matchplan (Rahmen) → Gegner-Typen
// → aufzwingen → Schwäche angreifen → Matchverlauf → entscheidender Punkt. 2 Übungs-,
// 4 Reflexionsbausteine. Weiche Voraussetzungen auf die fortgeschrittene Taktik.
const experteTaktikKette = ['der_matchplan', 'gegner_typen_gegenrezepte', 'dem_gegner_aufzwingen', 'schwaeche_systematisch_angreifen', 'matchverlauf_steuern', 'entscheidender_punkt'];
// Experte-Mentales (herkunftsneutral, alle Reflexion): Wettkampfzustand (Rahmen) →
// Flow → Druck-Umdeutung → Gelassenheit → mentale Entwicklung. Weiche Voraussetzungen
// stufenübergreifend auf den Fortgeschritten-/Beginner-Mentalblock.
const experteMentalesKette = ['optimaler_wettkampfzustand', 'in_den_flow_finden', 'druck_als_herausforderung', 'gelassen_bei_unfairness', 'mentale_staerke_entwickeln'];
// Experte-Athletik/Kondition (herkunftsneutral, 1 Übung + 4 Reflexion): Saisonform →
// Reaktivkraft (Übung) → Bewegungsökonomie → antizipative Schnelligkeit → langfristig belastbar.
const experteAthletikKette = ['form_ueber_die_saison', 'reaktivkraft_bodenkontakt', 'bewegungsoekonomie', 'antizipative_schnelligkeit', 'langfristig_belastbar'];
// Trainer-Trainingsgestaltung (Sternform, kompetenzstufe ["trainer"]): Rahmen +
// vier Vermittlungstätigkeiten. Orthogonal zur Könnensstufe.
const trainerGestaltungKette = ['was_gutes_vermitteln_ausmacht', 'inhalt_zugaenglich_machen', 'fehler_erkennen_korrigieren', 'uebungen_aufbauen', 'gruppe_fuehren'];
// Doppel-Ausbau nach unten/oben (spielform:doppel, typ micro): erscheinen im
// Kompetenz-/Themenpfad an ihrer Domäne/Stufe, auf der Spielform-Achse als ein Thema.
const doppelBeginnerKette = ['erste_schritte_doppel', 'wer_nimmt_den_ball', 'aufschlag_im_doppel_einfach', 'sich_absprechen', 'einander_platz_lassen'];
const doppelExperteKette = ['paar_als_system', 'gegnerisches_paar_lesen', 'partner_in_position_bringen', 'nahtlos_umschalten', 'blindes_verstaendnis'];
// Outdoor-Querschnitt (typ umgebungs_baustein, fortgeschritten): eigene Umgebungs-Achse,
// aus Kompetenz- und Themenpfad gefiltert (Typ-Filter), erzählgeordnet.
const outdoorKette = ['draussen_spielen', 'wind_lesen_nutzen', 'sonne_blendung', 'naesse_sicherer_stand', 'hitze', 'verschiedene_boeden'];
const spielmodiKette = ['spielarten_ueberblick', 'snowminton', 'beachminton', 'blackminton'];

console.log('\n[1] Datenvalidierung');
pruefe('Referenzdaten ohne Warnungen', daten.warnungen.length === 0, daten.warnungen.join(' | '));
pruefe('108 Basisbausteine (86 + 5 Doppel-Beginner + 5 Doppel-Experte + 6 Outdoor + 4 Spielmodi + 2 Spielformen), 24 Deltas', daten.bausteine.length === 108 && daten.deltas.length === 24);
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
pruefe('Rückverzweigung aufgelöst: fehler_vermeiden am Ende des Taktik-Blocks', pfadOhne.stationen.map((s) => s.baustein.id).slice(7, 13).at(-1) === 'fehler_vermeiden');
pruefe('Sternform aufgelöst: Rahmen-Einstieg vor seinen Werkzeug-Blättern', (() => {
  const ids = pfadOhne.stationen.map((s) => s.baustein.id);
  return ids.indexOf('warum_der_kopf_mitspielt') < ids.indexOf('routine_vor_dem_aufschlag') && ids.indexOf('warum_athletik_dein_spiel_traegt') < ids.indexOf('richtig_aufwaermen');
})());
pruefe('keine Deltas aktiv', pfadOhne.stationen.every((s) => s.delta === null));
pruefe('keine Skip-Kandidaten', pfadOhne.stationen.every((s) => !s.skipKandidat));
pruefe('Beginner ist kumulativ bis Beginner = 34 Beginner-Bausteine (28 + 5 Doppel-Beginner + funplay)', pfadOhne.stationen.length === 34);

console.log('\n[2b] Kompetenzpfad über zwei Stufen (kumulativ)');
const pfadBeginner = kompetenzpfad(daten, 'beginner');
const pfadFg = kompetenzpfad(daten, 'fortgeschritten');
pruefe('Beginner sieht keine Fortgeschritten-Bausteine', pfadBeginner.stationen.every((s) => ![...fgTechnikKette, ...fgTaktikKette].includes(s.baustein.id)));
pruefe('Fortgeschritten kumulativ = Beginner-Block + Fortgeschritten je Domäne (Doppel-Querschnitt hängt an seine Domäne an) (66)', gleicheListe(pfadFg.stationen.map((s) => s.baustein.id), [...erwarteteKette, ...fgTechnikKette, ...fgTaktikKette, ...doppelTaktikKette, ...fgMentalesKette, 'verstaendigung_im_paar', 'mehrfeld', ...fgAthletikKette, 'bewegung_als_einheit', 'die_bespannung', 'griff_und_griffband']));
pruefe('Beginner-Bausteine bleiben an ihrer niedrigsten Stufe (Block vorn)', pfadFg.stationen.slice(0, 28).every((s) => niedrigsteStufe(daten, s.baustein) === 'beginner'));
pruefe('Fortgeschritten-Block folgt geschlossen hinten', pfadFg.stationen.slice(34).every((s) => niedrigsteStufe(daten, s.baustein) === 'fortgeschritten'));
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
pruefe('Skip-Kandidaten sind die delta-freien Bausteine (29 = 34 − 5 mit Delta)', (() => {
  const skip = pfadBad.stationen.filter((s) => s.skipKandidat).map((s) => s.baustein.id);
  return skip.length === 29 && !skip.includes('aufschlag_taktisch') && skip.includes('warum_der_kopf_mitspielt') && skip.includes('erholen');
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
pruefe('Tennis-Deltas ohne eigene Basis-Bausteine (nur delta_bausteine)', (deltaTennis.bausteine || []).length === 0 && deltaTennis.delta_bausteine.length === 8);
pruefe('alle 8 TEN-Deltas an existierende Basis-Bausteine gehängt', deltaTennis.delta_bausteine.every((d) => daten.bausteinVonId.has(d.basis_baustein) && deltaFuer(daten, d.basis_baustein, 'TEN')?.id === d.id));
pruefe('TEN-Kanten treffen beide Stufen (4 Beginner-Technik + 2 Fortgeschritten-Technik)', ['griff', 'aufschlag', 'vorhand_drive', 'rueckhand'].every((id) => niedrigsteStufe(daten, daten.bausteinVonId.get(id)) === 'beginner' && deltaFuer(daten, id, 'TEN')) && ['ueberkopf_clear', 'beinarbeit_system'].every((id) => niedrigsteStufe(daten, daten.bausteinVonId.get(id)) === 'fortgeschritten' && deltaFuer(daten, id, 'TEN')));
// TEN deckt jetzt auch die Taktik-Domäne ab: ein Beginner-Ziel (spielziel_verstehen) und ein Fortgeschritten-Doppel (aufschlag_rueckschlag_doppel).
pruefe('TEN-Deltas erreichen die Taktik-Domäne (spielziel_verstehen beginner, aufschlag_rueckschlag_doppel fortgeschritten/doppel)', (() => {
  const sv = daten.bausteinVonId.get('spielziel_verstehen');
  const doppel = daten.bausteinVonId.get('aufschlag_rueckschlag_doppel');
  return sv.domaene === 'taktik' && niedrigsteStufe(daten, sv) === 'beginner' && deltaFuer(daten, 'spielziel_verstehen', 'TEN')?.id === 'spielziel_verstehen_delta_ten'
    && doppel.domaene === 'taktik' && spielformVon(doppel) === 'doppel' && niedrigsteStufe(daten, doppel) === 'fortgeschritten' && deltaFuer(daten, 'aufschlag_rueckschlag_doppel', 'TEN')?.id === 'aufschlag_rueckschlag_doppel_delta_ten';
})());
pruefe('erstes TEN-Doppel-Delta trägt spielform:doppel und zwei Ziele (doppel_spezifische_loesungen + aufschlag_rueckschlag_eroeffnung)', (() => {
  const d = deltaFuer(daten, 'aufschlag_rueckschlag_doppel', 'TEN');
  return d.spielform === 'doppel' && gleicheListe(d.spielziele.slice().sort(), ['aufschlag_rueckschlag_eroeffnung', 'doppel_spezifische_loesungen']);
})());
// Punkt 2: griff trägt jetzt zwei Herkunfts-Deltas — genau die gewählte greift.
pruefe('griff hat sowohl BAD- als auch TEN-Delta', deltaFuer(daten, 'griff', 'BAD')?.id === 'griff_delta_bad' && deltaFuer(daten, 'griff', 'TEN')?.id === 'griff_delta_ten');
setzeZurueck();
setzeDiagnose({ stufe: 'fortgeschritten', herkunft: 'TEN' });
const pfadFgTen = kompetenzpfad(daten, 'fortgeschritten');
pruefe('Herkunft TEN blendet genau das TEN-Delta ein (BAD ignoriert)', pfadFgTen.stationen.find((s) => s.baustein.id === 'griff').delta?.id === 'griff_delta_ten');
pruefe('kumulativer TEN-Pfad zeigt genau die 8 Tennis-Deltas (6 Technik + 2 Taktik)', (() => {
  const mitDelta = pfadFgTen.stationen.filter((s) => s.delta).map((s) => s.baustein.id);
  return mitDelta.length === 8 && gleicheListe(mitDelta, ['griff', 'aufschlag', 'vorhand_drive', 'rueckhand', 'spielziel_verstehen', 'ueberkopf_clear', 'beinarbeit_system', 'aufschlag_rueckschlag_doppel']);
})());
pruefe('Taktik-Baustein spielziel_verstehen trägt bei TEN das Passierzone-Delta', pfadFgTen.stationen.find((s) => s.baustein.id === 'spielziel_verstehen').delta?.id === 'spielziel_verstehen_delta_ten');
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
pruefe('zentrale_position: bei BAD/TEN kein Delta, bei SQ eines', deltaFuer(daten, 'zentrale_position', 'BAD') === null && deltaFuer(daten, 'zentrale_position', 'TEN') === null && deltaFuer(daten, 'zentrale_position', 'SQ')?.id === 'zentrale_position_delta_sq');
// spielziel_verstehen trägt seit dem TEN-Ausbau zwei Herkunfts-Deltas (TEN Passierzone, SQ Wand) — nur BAD bleibt leer.
pruefe('spielziel_verstehen: bei BAD kein Delta, bei TEN und SQ je eines', deltaFuer(daten, 'spielziel_verstehen', 'BAD') === null && deltaFuer(daten, 'spielziel_verstehen', 'TEN')?.id === 'spielziel_verstehen_delta_ten' && deltaFuer(daten, 'spielziel_verstehen', 'SQ')?.id === 'spielziel_verstehen_delta_sq');
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
  'Beginner-Diagnose: Faktor nur bis Beginner-Stufe (griff, vorhand_drive, rueckhand, funplay)',
  gleicheListe(individuell.stationen.map((s) => s.baustein.id), ['griff', 'vorhand_drive', 'rueckhand', 'funplay'])
);
const griffStation = individuell.stationen[0];
pruefe('Voraussetzung außerhalb der Menge nur als Hinweis', gleicheListe(griffStation.ausserhalbMenge, ['grundposition']));
// Fortgeschritten-Diagnose: kumulativ Beginner + Fortgeschritten (Ziel-Nähe → Domäne → Pool).
setzeDiagnose({ stufe: 'fortgeschritten' });
pruefe(
  'Fortgeschritten-Diagnose: Faktor kumulativ über beide Stufen, inkl. Outdoor-Baustein und Spielform (10, domänen-geordnet)',
  gleicheListe(individualpfad(daten, { dimension: 'spielziele', faktor: 'tempo_haertedosierung' }).stationen.map((s) => s.baustein.id), ['griff', 'vorhand_drive', 'rueckhand', 'handgelenk_peitsche', 'ueberkopf_clear', 'smash', 'schnitt_spin', 'funplay', 'wind_lesen_nutzen', 'rumpfstabilitaet'])
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
pruefe('Altformat (Einzelziel-Objekt) bleibt ohne Migration gültig', individualpfad(daten, { dimension: 'spielziele', faktor: 'tempo_haertedosierung' }).stationen.length === 4);

console.log('\n[6] Themenpfad über fünf Domänen');
pruefe('Domäne technik: Beginner-, Fortgeschritten-, Experten-Block + Spielform (19)', gleicheListe(themenpfad(daten, 'technik').stationen.map((s) => s.baustein.id), [...technikKette, ...fgTechnikKette, ...experteTechnikKette, 'funplay']));
pruefe('Domäne taktik: Beginner + Fortgeschritten + Experte + Doppel-Taktik (alle drei Stufen) (29)', gleicheListe(themenpfad(daten, 'taktik').stationen.map((s) => s.baustein.id), [...taktikKette, ...fgTaktikKette, ...experteTaktikKette, 'erste_schritte_doppel', 'wer_nimmt_den_ball', 'aufschlag_im_doppel_einfach', ...doppelTaktikKette, 'paar_als_system', 'gegnerisches_paar_lesen', 'partner_in_position_bringen']));
pruefe('Domäne mentales: Beginner + Fortgeschritten + Experte + Doppel-Mentales + Spielform zuletzt (19)', gleicheListe(themenpfad(daten, 'mentales').stationen.map((s) => s.baustein.id), [...mentalesKette, ...fgMentalesKette, ...experteMentalesKette, 'sich_absprechen', 'verstaendigung_im_paar', 'blindes_verstaendnis', 'mehrfeld']));
pruefe('Domäne athletik_kondition: Beginner + Fortgeschritten + Experte + Doppel-Athletik (alle drei Stufen) zuletzt (19)', gleicheListe(themenpfad(daten, 'athletik_kondition').stationen.map((s) => s.baustein.id), [...athletikKette, ...fgAthletikKette, ...experteAthletikKette, 'einander_platz_lassen', 'bewegung_als_einheit', 'nahtlos_umschalten']));
// Facetten ohne Trainer-Perspektive: die reine Trainer-Domäne Trainingsgestaltung
// bleibt eine 0-Facette (gated); alle vier Spieler-Domänen tragen jetzt den Experten-Block.
setzeZurueck();
setzeDiagnose({ stufe: 'beginner', trainer: false });
const facetten = themenDomaenen(daten);
const facette = (d) => facetten.find((f) => f.domaene === d).anzahl;
pruefe('Facetten (ohne Trainer, ohne Outdoor): technik=19, taktik=29, mentales=19, athletik=19, ausruestung=7, trainingsgestaltung gated=0', facette('technik') === 19 && facette('taktik') === 29 && facette('mentales') === 19 && facette('athletik_kondition') === 19 && facette('ausruestung') === 7 && facette('trainingsgestaltung') === 0);
pruefe('Modifikator nicht im Themenpfad verdrahtet', (() => {
  setzeDiagnose({ herkunft: 'BAD' });
  return themenpfad(daten, 'mentales').stationen.every((s) => s.delta === null);
})());

console.log('\n[6b] Ausrüstungs-Kapitel (eigene Domäne, Beginner-Übersicht + 4 Beginner + 2 Fortgeschritten, herkunftsneutral)');
const ausrIds = ['deine_ausruestung', 'der_speeder', 'der_schlaeger', 'schuhe_finden', 'funktionskleidung', 'die_bespannung', 'griff_und_griffband'];
const ausrBs = ausrIds.map((id) => daten.bausteinVonId.get(id));
pruefe('7 Ausrüstungs-Bausteine: alle Domäne ausruestung, Wissens-Bausteine (Reflexionsaufgabe statt Übungsteil)', ausrBs.every((b) => b && b.domaene === 'ausruestung' && hatReflexionsaufgabe(b) && !hatUebungsteil(b)));
pruefe('Stufen: 5 Beginner (Übersicht + Speeder/Schläger/Schuhe/Kleidung), 2 Fortgeschritten (Bespannung/Griff)', ausrBs.filter((b) => gleicheListe(b.kompetenzstufe, ['beginner'])).length === 5 && ausrBs.filter((b) => gleicheListe(b.kompetenzstufe, ['fortgeschritten'])).length === 2);
pruefe('eigene Domäne ausruestung im Vokabular + Label, Themen-Facette trägt 7', (daten.vokabulare.domaene || []).includes('ausruestung') && labelsDe.vokabeln.domaene.ausruestung === 'Ausrüstung' && themenDomaenen(daten).find((f) => f.domaene === 'ausruestung')?.anzahl === 7);
pruefe('Themenpfad ausruestung = alle 7 in Pool-Reihenfolge (Beginner-Block, dann Fortgeschritten-Block)', gleicheListe(themenpfad(daten, 'ausruestung').stationen.map((s) => s.baustein.id), ausrIds));
pruefe('Beginner-Kompetenzpfad endet mit dem Ausrüstungs-Block (Domäne sortiert zuletzt), Schluss = Funktionskleidung', gleicheListe(kompetenzpfad(daten, 'beginner').stationen.slice(-5).map((s) => s.baustein.id), ['deine_ausruestung', 'der_speeder', 'der_schlaeger', 'schuhe_finden', 'funktionskleidung']));
pruefe('herkunftsneutral: kein Delta für irgendeine Herkunft, keine Deltas in den Dateien', ausrIds.every((id) => ['BAD', 'TEN', 'SQ', 'CM', 'AT'].every((h) => deltaFuer(daten, id, h) === null)));
pruefe('kein Ausrüstungs-Baustein im Individualpfad (spielziele leer — foundational, über Thema/Pfad erreichbar)', ['windspiel', 'untergrundwechsel', 'tempo_haertedosierung', 'konzentrationskonstanz'].every((z) => !individualpfad(daten, { dimension: 'spielziele', faktor: z }).stationen.some((s) => ausrIds.includes(s.baustein.id))));
pruefe('alle 7 tragen Titel-Label + Icon (Label geliftet, BAUSTEIN_ICONS vollständig)', ausrIds.every((id) => typeof labelsDe.bausteine[id] === 'string' && labelsDe.bausteine[id] !== '' && bausteinIcon(id, '') !== ''));

console.log('\n[7] Baustein im Kontext');
const imKontext = stationImKontext(daten, 'griff', 'kompetenz');
pruefe('Nachbarn im Kompetenzpfad stimmen', imKontext.vorherige.baustein.id === 'grundposition' && imKontext.naechste.baustein.id === 'aufschlag');
pruefe('Delta im Kompetenz-Kontext aktiv', imKontext.station.delta?.id === 'griff_delta_bad');
pruefe('gleicher Baustein im Themen-Kontext ohne Delta', stationImKontext(daten, 'griff', 'themen:technik').station.delta === null);
pruefe('sequenzFuer versteht kompetenz:trainer (die 5 Trainer-Trainingsgestaltungs-Bausteine)', sequenzFuer(daten, 'kompetenz:trainer').stationen.length === 5);

console.log('\n[7a] Merkliste (Wiedervorlage, baustein-gebunden)');
const merkStationen = merklisteStationen(daten, ['aufschlag', 'griff']);
pruefe('merklisteStationen löst IDs in Merk-Reihenfolge auf', merkStationen.length === 2 && merkStationen[0].baustein.id === 'aufschlag' && merkStationen[1].baustein.id === 'griff');
pruefe('merklisteStationen trägt Status je Station', merkStationen.every((s) => s.status && typeof s.status.absolviert === 'boolean'));
pruefe('merklisteStationen filtert unbekannte IDs (kein Fehlerfall)', merklisteStationen(daten, ['griff', 'gibt_es_nicht', 'aufschlag']).length === 2);
pruefe('merklisteStationen bei leerer/fehlender Liste ist leer', merklisteStationen(daten, []).length === 0 && merklisteStationen(daten, null).length === 0);
pruefe('merklisteStationen ist herkunftsneutral (kein Delta, wie Deep-Link)', merklisteStationen(daten, ['griff'])[0].delta === null);
pruefe('sequenzFuer versteht den merkliste-Kontext (Default leer)', sequenzFuer(daten, 'merkliste').art === 'merkliste' && sequenzFuer(daten, 'merkliste').stationen.length === 0);

console.log('\n[7b] Fehlerbilder (Trainer-Layer)');
// Ein Basisbaustein darf MEHRERE Fehlerbilder tragen (griff: zu fester Griff,
// Umklammern/Verdrehen, Umgreifen auf der Rückhand) — sie erscheinen alle in situ.
pruefe('fehlerbilderFuer(griff) liefert alle drei Griff-Fehlerbilder', fehlerbilderFuer(daten, 'griff').length === 3
  && fehlerbilderFuer(daten, 'griff').some((f) => f.id === 'griff_fehler_zu_fest'));
pruefe('fehlerbilderFuer ohne Eintrag liefert leeres Array (Nicht-Fehlerfall)', gleicheListe(fehlerbilderFuer(daten, 'grundschlaege_ueberblick'), []));
pruefe('Fehlerbilder decken 29 Basis-Bausteine ab, 32 Einträge gesamt', (() => {
  const alle = daten.fehlerbilder ?? [];
  return alle.length === 32 && new Set(alle.map((f) => f.basis_baustein)).size === 29;
})());
// Der trainer_layer_offen-Marker ist die redaktionelle Zusage, dass hier ein
// Fehlerbild hingehört — er darf nicht unbedient bleiben.
pruefe('jeder Baustein mit trainer_layer_offen-Marker trägt mindestens ein Fehlerbild', (() => {
  const belegt = new Set((daten.fehlerbilder ?? []).map((f) => f.basis_baustein));
  const offen = daten.bausteine.filter((b) => JSON.stringify(b).includes('trainer_layer_offen') && !belegt.has(b.id));
  return offen.length === 0;
})());
pruefe('jedes Fehlerbild hängt an einem existierenden Baustein und trägt die drei Felder', (daten.fehlerbilder ?? []).every((f) =>
  daten.bausteinVonId.has(f.basis_baustein) && f.erklaerteil?.de?.symptom && f.erklaerteil?.de?.ursache && f.erklaerteil?.de?.korrektur));
// Übersetzungsring abgeschlossen: alle Fehlerbilder tragen die drei Felder in
// allen vier Sprachen (der en/fr/pl-Zwilling muss die Form von .de spiegeln).
pruefe('jedes Fehlerbild ist in en/fr/pl übersetzt (drei Felder je Sprache)', (daten.fehlerbilder ?? []).every((f) =>
  ['de', 'en', 'fr', 'pl'].every((L) => f.erklaerteil?.[L]?.symptom && f.erklaerteil[L].ursache && f.erklaerteil[L].korrektur)));
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
setzeZurueck();
setzeDiagnose({ stufe: 'beginner' });
markiereAbsolviert(daten, 'kompetenz', spielziel);
pruefe('markiereAbsolviert schließt reflexions-only Baustein vollständig (Regression Skip-No-op)', bausteinAbsolviert(spielziel));
pruefe('Titel aus anzeigetitel ins Label geliftet', labelsDe.bausteine.spielziel_verstehen === 'Das Spielziel verstehen');
pruefe('voraussetzungen_querverweis inert (keine Graph-Kante)', (() => {
  const zentral = daten.bausteinVonId.get('zentrale_position');
  return zentral.voraussetzungen_querverweis && gleicheListe(zentral.voraussetzungen, ['spielziel_verstehen']);
})());

console.log('\n[7d] Domänenübergreifende Zieldiagnose über zwei Stufen, Vokabular-Erweiterung, delta_erwartet');
setzeZurueck();
// Beginner-Diagnose: Faktoren nur bis Beginner-Stufe (Fortgeschritten-Bausteine ausgeblendet).
setzeDiagnose({ stufe: 'beginner' });
pruefe('Psychoregulation-Ziel (Bereich 4), Beginner: Beginner-Mentales inkl. Doppel-Absprache', gleicheListe(individualpfad(daten, { dimension: 'spielziele', faktor: 'konzentrationskonstanz' }).stationen.map((s) => s.baustein.id), ['warum_der_kopf_mitspielt', 'den_fehler_abhaken', 'bei_der_sache_bleiben', 'sich_absprechen']));
pruefe('Energetik-Ziel (Bereich 1), Beginner: nur Beginner-Athletik', gleicheListe(individualpfad(daten, { dimension: 'spielziele', faktor: 'rally_ausdauer' }).stationen.map((s) => s.baustein.id), ['beinarbeit', 'warum_athletik_dein_spiel_traegt', 'durchhalten']));
pruefe('satz_match_regeneration, Beginner: genau erholen', gleicheListe(individualpfad(daten, { dimension: 'spielziele', faktor: 'satz_match_regeneration' }).stationen.map((s) => s.baustein.id), ['erholen']));
pruefe('doppel_spezifische_loesungen, Beginner: jetzt belegt durch das Beginner-Doppel (5)', gleicheListe(individualpfad(daten, { dimension: 'spielziele', faktor: 'doppel_spezifische_loesungen' }).stationen.map((s) => s.baustein.id), ['erste_schritte_doppel', 'wer_nimmt_den_ball', 'aufschlag_im_doppel_einfach', 'sich_absprechen', 'einander_platz_lassen']));
// Fortgeschritten-Diagnose: kumulativ Beginner + Fortgeschritten — dieselben Faktoren
// bespielen jetzt zwei Stufen (Psychoregulation, Energetik). Erstaktivierung doppel.
setzeDiagnose({ stufe: 'fortgeschritten' });
pruefe('Psychoregulation-Ziel, Fortgeschritten: kumulativ Beginner + Fortgeschritten-Mentales (inkl. Doppel-Absprache + Verständigung + Spielform)', gleicheListe(individualpfad(daten, { dimension: 'spielziele', faktor: 'konzentrationskonstanz' }).stationen.map((s) => s.baustein.id), ['warum_der_kopf_mitspielt', 'den_fehler_abhaken', 'bei_der_sache_bleiben', 'vom_werkzeug_zum_system', 'selbstgespraech_steuern', 'sich_das_spiel_vorstellen', 'momentum_lesen_und_drehen', 'ueber_das_match_stabil_bleiben', 'sich_absprechen', 'verstaendigung_im_paar', 'mehrfeld']));
pruefe('Energetik-Ziel, Fortgeschritten: kumulativ inkl. intervallausdauer + belastung_steuern', (() => {
  const ids = individualpfad(daten, { dimension: 'spielziele', faktor: 'rally_ausdauer' }).stationen.map((s) => s.baustein.id);
  return ids.includes('durchhalten') && ids.includes('intervallausdauer') && ids.includes('belastung_steuern_regenerieren');
})());
pruefe('satz_match_regeneration, Fortgeschritten: erholen + Fortgeschritten-Regeneration + Outdoor-Hitze', gleicheListe(individualpfad(daten, { dimension: 'spielziele', faktor: 'satz_match_regeneration' }).stationen.map((s) => s.baustein.id), ['erholen', 'intervallausdauer', 'belastung_steuern_regenerieren', 'hitze']));
// Spielziel-Faktor doppel_spezifische_loesungen (Bereich 6): durch den Doppel-Ausbau
// nach unten jetzt noch breiter belegt (Fortgeschritten-Stufe = Beginner + Fortgeschritten).
pruefe('doppel_spezifische_loesungen, Fortgeschritten: breit belegt (13 Doppel-Bausteine, Beginner + Fortgeschritten)', individualpfad(daten, { dimension: 'spielziele', faktor: 'doppel_spezifische_loesungen' }).stationen.length === 13);
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
pruefe('spielformen() bietet nur doppel als eigene Achse (einzel ist Default, kein Thema)', gleicheListe(spielformen(daten).map((s) => s.spielform), ['doppel']) && spielformen(daten)[0].anzahl === 18);
pruefe('Spielform-Achse doppel: 18 Bausteine über alle drei Stufen als ein Thema (Erzählreihenfolge)', gleicheListe(spielformpfad(daten, 'doppel').stationen.map((s) => s.baustein.id), ['doppel_grundlagen', ...doppelBeginnerKette, ...doppelThemaKette.slice(1), ...doppelExperteKette]));
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
// Herkunft TEN: das neue Tennis-Doppel-Delta greift auf derselben Achse; die BAD-Deltas fallen weg.
setzeDiagnose({ herkunft: 'TEN' });
pruefe('Cross-Sport auf der Spielform-Achse: TEN blendet genau das Tennis-Doppel-Delta ein', (() => {
  const mitDelta = spielformpfad(daten, 'doppel').stationen.filter((s) => s.delta).map((s) => `${s.baustein.id}:${s.delta.id}`);
  return gleicheListe(mitDelta, ['aufschlag_rueckschlag_doppel:aufschlag_rueckschlag_doppel_delta_ten']);
})());
pruefe('TEN-Doppel-Delta greift auch in der Baustein-Ansicht im Spielform-Kontext', stationImKontext(daten, 'aufschlag_rueckschlag_doppel', 'spielform:doppel').station.delta?.id === 'aufschlag_rueckschlag_doppel_delta_ten');
setzeDiagnose({ herkunft: 'BAD' });
pruefe('Delta-Bündelung verweist weich auf das Grundlagen-Doppel-Delta', (() => {
  const delta = daten.deltas.find((d) => d.id === 'das_umschalten_im_doppel_delta_bad');
  return gleicheListe(delta.delta_buendelung || [], ['doppel_grundlagen_delta_bad']) && daten.deltas.some((d) => d.id === 'doppel_grundlagen_delta_bad');
})());
pruefe('spielform-Vokabular + Label vorhanden', daten.vokabulare.spielform && daten.vokabulare.spielform.includes('doppel') && labelsDe.vokabeln.spielform.doppel === 'Doppel' && labelsDe.vokabeln.spielform.einzel === 'Einzel');
pruefe('Themen-/Kompetenzpfad bleiben unberührt vom Spielform-Filter (orthogonal): Doppel-Bausteine weiter in ihren Domänen', sequenzFuer(daten, 'themen:mentales').stationen.some((s) => s.baustein.id === 'verstaendigung_im_paar'));

console.log('\n[7f] Regeln (Referenz-Reiter, eigene Entität — nicht im Baustein-Pool)');
pruefe('regeln.json über baueIndizes eingelesen: 13 Abschnitte (inkl. Ausrüstung + Besondere Situationen, ICO 2024)', daten.regeln.abschnitte.length === 13);
const alleRegeln = daten.regeln.abschnitte.flatMap((a) => a.regeln || []);
pruefe('44 Regeln insgesamt, jede mit akkuratem inhalt.de', alleRegeln.length === 44 && alleRegeln.every((r) => typeof r.inhalt?.de === 'string' && r.inhalt.de.trim() !== ''));
pruefe('alle querverweis-IDs lösen auf einen Baustein auf (reine Dokumentation, kein Graph)', alleRegeln.every((r) => (r.querverweis || []).every((id) => daten.bausteinVonId.has(id))));
// ICO-2024-Abgleich: durchgängige 2024er Nummern (keine DCV-2018-Doppelangaben mehr),
// §11 „Besondere Situationen" trägt IN/OUT plus den Turnierablauf.
pruefe('Nummerierung ist reine ICO-2024-Zählung (kein „(ICO …)"-Zusatz mehr)',
  alleRegeln.every((r) => r.nummer === undefined || !/\(ICO/.test(r.nummer)));
pruefe('§11 spezielle_situationen: IN/OUT + Turnierablauf, in dieser Reihenfolge', (() => {
  const s = daten.regeln.abschnitte.find((a) => a.id === 'spezielle_situationen');
  return Boolean(s) && s.regeln.length === 3 && s.regeln.at(-1).nummer === '11.1 – 11.5';
})());
pruefe('Abschnitt ausruestung trägt die Court-Maße (ICO 1.3)', (() => {
  const s = daten.regeln.abschnitte.find((a) => a.id === 'ausruestung');
  return s.regeln.some((r) => r.nummer === '1.3' && /5,5/.test(r.inhalt.de) && /U12/.test(r.inhalt.de));
})());
// Der Reiter ist über alle vier Sprachen vollständig — der Merge hat keine Übersetzung verloren.
pruefe('jede Regel ist in en/fr/pl übersetzt (Merge hat nichts verloren)', alleRegeln.every((r) =>
  ['en', 'fr', 'pl'].every((L) => r.titel?.[L] && r.inhalt?.[L] && (r.erklaerung === undefined || r.erklaerung[L]))));
pruefe('jeder Abschnitt ist in en/fr/pl übersetzt (Titel + optionale Einleitung)', daten.regeln.abschnitte.every((a) =>
  ['en', 'fr', 'pl'].every((L) => a.titel?.[L] && (a.einleitung === undefined || a.einleitung[L]))));
// Der Reiter ist eine getrennte Entität: die Abschnitte liegen unter daten.regeln,
// nie im Pool. (Slug-Überschneidungen wie der Abschnitt "aufschlag" ~ Baustein
// "aufschlag" sind dabei belanglos — zwei Namensräume, kein Lookup übers Regel-Slug.)
pruefe('Regeln erweitern/verunreinigen den Baustein-Pool nicht (108 Bausteine, Abschnitte separat)', daten.bausteine.length === 108 && !daten.bausteine.some((b) => daten.regeln.abschnitte.includes(b)));
pruefe('Regeln tragen keinen Fortschritt/keine Voraussetzungen/Deltas (reiner Referenzinhalt)', alleRegeln.every((r) => r.voraussetzungen === undefined && r.uebungsteil === undefined && r.delta === undefined && r.status === undefined));
pruefe('Quellenangabe sichtbar hinterlegt (Herausgeber + Stand + PDF-Link)', typeof daten.regeln.meta.quelle?.herausgeber === 'string' && daten.regeln.meta.quelle.herausgeber !== '' && typeof daten.regeln.meta.quelle?.stand === 'string' && daten.regeln.meta.quelle.stand !== '' && /^https?:\/\/.*\.pdf$/i.test(daten.regeln.meta.quelle?.link || ''));
pruefe('Regeln-UI-Labels (de) vollständig', ['nav_regeln', 'regeln_titel', 'regeln_intro', 'regel_label', 'regel_bedeutung', 'regeln_quelle', 'regeln_stand', 'regeln_querverweis', 'regeln_quelle_link'].every((k) => typeof labelsDe.ui[k] === 'string' && labelsDe.ui[k] !== ''));
pruefe('nicht auflösbarer querverweis erzeugt eine Warnung (Dokumentations-Check, nie sperrend)', (() => {
  const kaputt = { _meta: {}, abschnitte: [{ id: 'test_regel', titel: { de: 'T' }, regeln: [{ inhalt: { de: 'x' }, querverweis: ['gibt_es_nicht'] }] }] };
  return baueIndizes([technik], einheiten, fehlerbilder, kaputt).warnungen.some((warnung) => warnung.includes('querverweis') && warnung.includes('gibt_es_nicht'));
})());

console.log('\n[7f-t] Turnier-Regularium (Referenz-Filter unter „Regeln", eigene Entität)');
const tr = daten.turnierregeln;
const turnierStufen = ['fun', 't100', 't250', 't500', 't1000'];
pruefe('turnierregeln.json über baueIndizes eingelesen: 5 Stufen, 5 Kategorien, 26 Anforderungen, 2 Varianten', tr.stufen.length === 5 && tr.kategorien.length === 5 && tr.anforderungen.length === 26 && tr.varianten.length === 2);
pruefe('Stufen tragen id/rang/name/serie/punkte, Ränge streng aufsteigend 0…4', gleicheListe(tr.stufen.map((s) => s.id), turnierStufen) && tr.stufen.every((s, i) => s.rang === i && s.name?.de && s.serie?.de && s.punkte?.de));
const alleWerte = tr.anforderungen.flatMap((a) => Object.entries(a.werte));
pruefe('jede Anforderung: bekannte Kategorie, Werte je bekannter Stufe mit gültiger Pflichtstufe + text.de', tr.anforderungen.every((a) => tr.kategorien.some((k) => k.id === a.kategorie) && Object.keys(a.werte).length > 0) && alleWerte.every(([stufe, w]) => turnierStufen.includes(stufe) && ['pflicht', 'empfehlung'].includes(w.stufe) && typeof w.text?.de === 'string' && w.text.de.trim() !== ''));
pruefe('Varianten konsistent: Doppel an 250/500, Junior an 500; jede Stufe listet ihre Variante, jede Variante trägt Abweichungen', (() => {
  const doppel = tr.varianten.find((v) => v.id === 'doppel');
  const junior = tr.varianten.find((v) => v.id === 'junior');
  const stufeListet = (sid, vid) => (tr.stufen.find((s) => s.id === sid)?.varianten || []).includes(vid);
  return gleicheListe(doppel.stufen, ['t250', 't500']) && gleicheListe(junior.stufen, ['t500'])
    && tr.varianten.every((v) => v.stufen.every((s) => (v.abweichungen?.[s] || []).length > 0 && stufeListet(s, v.id)));
})());
// Kern-Mehrwert: „woran bin ich ZUSÄTZLICH gebunden" — je höher die Stufe, desto mehr Auflagen.
pruefe('Anforderungen kumulieren nach Rang: fun < 100er < 250er < 500er ≤ 1000er', (() => {
  const zahl = (sid) => tr.anforderungen.filter((a) => a.werte[sid]).length;
  return zahl('fun') < zahl('t100') && zahl('t100') < zahl('t250') && zahl('t250') < zahl('t500') && zahl('t500') <= zahl('t1000');
})());
pruefe('„neu ab Stufe" real belegt: Beobachter neu ab 250er, Preisgeld neu ab 500er (keine Vorstufen-Werte)', (() => {
  const beob = tr.anforderungen.find((a) => a.id === 'beobachter').werte;
  const preis = tr.anforderungen.find((a) => a.id === 'preisgeld').werte;
  return !beob.fun && !beob.t100 && beob.t250 && !preis.t250 && preis.t500;
})());
pruefe('„verschärft" real belegt: Mindest-Teilnehmerzahl ändert Text von 100er auf 250er', (() => {
  const w = tr.anforderungen.find((a) => a.id === 'min_teilnehmer').werte;
  return w.t100 && w.t250 && w.t100.text.de !== w.t250.text.de;
})());
pruefe('Turnier-Regularium verunreinigt den Baustein-Pool nicht (108 Bausteine, Regularium separat)', daten.bausteine.length === 108 && !tr.anforderungen.some((a) => daten.bausteinVonId.has(a.id)));
pruefe('Anforderungen tragen keinen Fortschritt/keine Voraussetzungen/Deltas (reiner Referenzinhalt)', tr.anforderungen.every((a) => a.voraussetzungen === undefined && a.uebungsteil === undefined && a.delta === undefined && a.status === undefined));
pruefe('Meta trägt Quelle + Stand + verlinkte Dokumente (rules/…)', typeof tr.meta.quelle?.de === 'string' && tr.meta.quelle.de !== '' && typeof tr.meta.stand?.de === 'string' && (tr.meta.dokumente || []).length >= 1 && tr.meta.dokumente.every((d) => typeof d.pfad === 'string' && d.pfad.startsWith('rules/')));
pruefe('Turnier-UI-Labels (de) vollständig', ['turnier_titel', 'turnier_kachel_text', 'turnier_frage', 'turnier_konkurrenz', 'turnier_einzel', 'turnier_auflagen_fuer', 'turnier_davon', 'turnier_neu', 'turnier_verschaerft', 'turnier_pflicht', 'turnier_empfehlung', 'turnier_basis', 'turnier_ggue', 'turnier_wie_zuvor', 'turnier_variante_titel', 'turnier_dokumente', 'turnier_quelle', 'turnier_stand', 'turnier_leer'].every((k) => typeof labelsDe.ui[k] === 'string' && labelsDe.ui[k] !== ''));
pruefe('saubere Referenzdaten: keine Turnier-Warnung im echten Bestand', !daten.warnungen.some((w) => w.includes('Turnier')));
pruefe('kaputte Turnier-Daten erzeugen eine Warnung (unbekannte Stufe, nie sperrend)', (() => {
  const kaputt = { stufen: [{ id: 't100', rang: 1, name: { de: 'x' }, varianten: [] }], kategorien: [{ id: 'org', titel: { de: 'O' } }], anforderungen: [{ id: 'x', kategorie: 'org', werte: { txxx: { stufe: 'pflicht', text: { de: 'y' } } } }], varianten: [] };
  return baueIndizes([technik], einheiten, fehlerbilder, regeln, appInfo, kaputt).warnungen.some((warnung) => warnung.includes('Turnier') && warnung.includes('txxx'));
})());

console.log('\n[7g] Experte-Stufe Technik + Taktik (dritte Könnensstufe, herkunftsneutral)');
setzeZurueck();
pruefe('6 Experte-Technik-Bausteine, alle Technik/Experte mit Übungsteil, keine Deltas', experteTechnik.bausteine.length === 6 && experteTechnik.delta_bausteine.length === 0 && experteTechnik.bausteine.every((b) => b.domaene === 'technik' && gleicheListe(b.kompetenzstufe, ['experte']) && b.uebungsteil));
pruefe('6 Experte-Taktik-Bausteine (2 Übung, 4 Reflexion), 0 Deltas, alle Taktik/Experte', experteTaktik.bausteine.length === 6 && experteTaktik.delta_bausteine.length === 0 && experteTaktik.bausteine.every((b) => b.domaene === 'taktik' && gleicheListe(b.kompetenzstufe, ['experte'])) && experteTaktik.bausteine.filter((b) => b.uebungsteil).length === 2 && experteTaktik.bausteine.filter((b) => b.reflexionsaufgabe).length === 4);
pruefe('5 Experte-Mentales-Bausteine (alle Reflexion), 0 Deltas, alle Mentales/Experte', experteMentales.bausteine.length === 5 && experteMentales.delta_bausteine.length === 0 && experteMentales.bausteine.every((b) => b.domaene === 'mentales' && gleicheListe(b.kompetenzstufe, ['experte']) && b.reflexionsaufgabe && !b.uebungsteil));
pruefe('5 Experte-Athletik-Bausteine (1 Übung, 4 Reflexion), 0 Deltas, alle Athletik/Experte', experteAthletik.bausteine.length === 5 && experteAthletik.delta_bausteine.length === 0 && experteAthletik.bausteine.every((b) => b.domaene === 'athletik_kondition' && gleicheListe(b.kompetenzstufe, ['experte'])) && experteAthletik.bausteine.filter((b) => b.uebungsteil).length === 1 && experteAthletik.bausteine.filter((b) => b.reflexionsaufgabe).length === 4);
const pfadExperte = kompetenzpfad(daten, 'experte');
pruefe('Experte kumulativ = 93 (66 bis Fortgeschritten + 22 Experten-native + 5 Doppel-Experte)', pfadExperte.stationen.length === 93);
pruefe('Experten-Block domänen-geordnet, Doppel-Experte je Domäne eingereiht (27)', gleicheListe(pfadExperte.stationen.slice(-27).map((s) => s.baustein.id), [...experteTechnikKette, ...experteTaktikKette, 'paar_als_system', 'gegnerisches_paar_lesen', 'partner_in_position_bringen', ...experteMentalesKette, 'blindes_verstaendnis', ...experteAthletikKette, 'nahtlos_umschalten']));
pruefe('Fortgeschritten sieht KEINE Experten-Bausteine (alle vier Domänen + Doppel-Experte), bleibt bei 66', kompetenzpfad(daten, 'fortgeschritten').stationen.length === 66 && kompetenzpfad(daten, 'fortgeschritten').stationen.every((s) => ![...experteTechnikKette, ...experteTaktikKette, ...experteMentalesKette, ...experteAthletikKette, ...doppelExperteKette].includes(s.baustein.id)));
pruefe('Experte behält den Beginner-Block vorn (kumulativ aufbauend)', pfadExperte.stationen.slice(0, 28).every((s) => niedrigsteStufe(daten, s.baustein) === 'beginner'));
// Stufenübergreifende weiche Voraussetzungen Experte → Fortgeschritten (ordnen, nie sperren).
pruefe('taeuschung ← kurzes_spiel_stopp + schnitt_spin (Fortgeschritten-Technik)', gleicheListe(daten.bausteinVonId.get('taeuschung').voraussetzungen, ['kurzes_spiel_stopp', 'schnitt_spin']));
pruefe('sprung_smash ← smash (Fortgeschritten) + frueh_nehmen (Experte, intern)', gleicheListe(daten.bausteinVonId.get('sprung_smash').voraussetzungen, ['smash', 'frueh_nehmen']));
pruefe('der_matchplan ← gegner_lesen_muster (Fortgeschritten-Taktik, stufenübergreifend)', gleicheListe(daten.bausteinVonId.get('der_matchplan').voraussetzungen, ['gegner_lesen_muster']));
pruefe('entscheidender_punkt ← engen_satz_fuehren (Fortgeschritten) + matchverlauf_steuern (Experte, intern)', gleicheListe(daten.bausteinVonId.get('entscheidender_punkt').voraussetzungen, ['engen_satz_fuehren', 'matchverlauf_steuern']));
pruefe('Fortgeschritten-Voraussetzungen im kumulativen Experten-Pfad in der Menge (kein Außen-Hinweis)', pfadExperte.stationen.find((s) => s.baustein.id === 'taeuschung').ausserhalbMenge.length === 0);
const idxExp = pfadExperte.stationen.map((s) => s.baustein.id);
pruefe('weiche Kante ordnet: kurzes_spiel_stopp/schnitt_spin vor taeuschung', idxExp.indexOf('kurzes_spiel_stopp') < idxExp.indexOf('taeuschung') && idxExp.indexOf('schnitt_spin') < idxExp.indexOf('taeuschung'));
// Herkunftsneutralität: der Cross-Sport-Modifikator fällt flächig durch (regulärer Nicht-Fehlerfall, Spec 4.2).
pruefe('kein Experten-Baustein (alle vier Domänen) trägt ein Delta — unabhängig von BAD/TEN/SQ', ['BAD', 'TEN', 'SQ'].every((h) => [...experteTechnikKette, ...experteTaktikKette, ...experteMentalesKette, ...experteAthletikKette].every((id) => deltaFuer(daten, id, h) === null)));
setzeDiagnose({ stufe: 'experte', herkunft: 'BAD' });
pruefe('Experte+BAD: kein Delta auf Experten-Ebene eingeblendet, kein Fehlerfall', kompetenzpfad(daten, 'experte').stationen.filter((s) => niedrigsteStufe(daten, s.baustein) === 'experte').every((s) => s.delta === null));
pruefe('herkuenfte bleiben [BAD, TEN, SQ] (Experten-Datei ohne delta_bausteine)', gleicheListe(daten.herkuenfte, ['BAD', 'TEN', 'SQ']));
// Individualpfad experte-kumulativ: dieselben Ziel-Faktoren bespielen jetzt drei Stufen.
pruefe('Individualpfad Experte, konzentrationskonstanz: kumulativ inkl. Experte-Mentales', (() => {
  const ids = individualpfad(daten, { dimension: 'spielziele', faktor: 'konzentrationskonstanz' }).stationen.map((s) => s.baustein.id);
  return ids.includes('warum_der_kopf_mitspielt') && ids.includes('optimaler_wettkampfzustand') && ids.includes('in_den_flow_finden') && ids.includes('gelassen_bei_unfairness');
})());
pruefe('Individualpfad Experte, rally_ausdauer: kumulativ inkl. Experte-Athletik', (() => {
  const ids = individualpfad(daten, { dimension: 'spielziele', faktor: 'rally_ausdauer' }).stationen.map((s) => s.baustein.id);
  return ids.includes('durchhalten') && ids.includes('form_ueber_die_saison') && ids.includes('bewegungsoekonomie');
})());

console.log('\n[7h] Trainer-Trainingsgestaltung (Trainer-Ebene, orthogonal zur Könnensstufe)');
setzeZurueck();
pruefe('5 Trainer-Bausteine: trainingsgestaltung/["trainer"], je Reflexionsaufgabe statt Übungsteil', trainerGestaltung.bausteine.length === 5 && trainerGestaltung.bausteine.every((b) => b.domaene === 'trainingsgestaltung' && gleicheListe(b.kompetenzstufe, ['trainer']) && hatReflexionsaufgabe(daten.bausteinVonId.get(b.id)) && !hatUebungsteil(daten.bausteinVonId.get(b.id))));
pruefe('niedrigsteStufe = trainer (dockt an keine Könnensstufe an)', trainerGestaltung.bausteine.every((b) => niedrigsteStufe(daten, daten.bausteinVonId.get(b.id)) === 'trainer'));
// Trainer-Filterung: nur in der Trainer-Perspektive sichtbar (orthogonal zur Stufe).
setzeDiagnose({ stufe: 'beginner', trainer: false });
pruefe('reiner Beginner (ohne Trainer) sieht die Trainer-Bausteine im Kompetenzpfad NICHT', kompetenzpfad(daten, 'beginner').stationen.every((s) => !trainerGestaltungKette.includes(s.baustein.id)));
pruefe('reiner Beginner: Trainingsgestaltung ist eine 0-Facette (Themenpfad + Facette gated)', themenpfad(daten, 'trainingsgestaltung').stationen.length === 0 && themenDomaenen(daten).find((f) => f.domaene === 'trainingsgestaltung').anzahl === 0);
pruefe('ohne Trainer bleibt der Individualpfad auf ein Vermittlungsziel leer (gated)', individualpfad(daten, { dimension: 'vermittlungsziele', faktor: 'fehlerbild_erkennen' }).stationen.length === 0);
setzeDiagnose({ stufe: 'beginner', trainer: true });
pruefe('Beginner MIT Trainer: Trainer-Pfad zeigt die 5 Bausteine (Sternform, Rahmen zuerst)', gleicheListe(kompetenzpfad(daten, 'trainer').stationen.map((s) => s.baustein.id), trainerGestaltungKette));
pruefe('Trainer-Perspektive: Trainingsgestaltung-Facette trägt jetzt 5', themenpfad(daten, 'trainingsgestaltung').stationen.length === 5 && themenDomaenen(daten).find((f) => f.domaene === 'trainingsgestaltung').anzahl === 5);
pruefe('Trainer-Bausteine bleiben trotzdem aus dem Beginner-Hauptpfad (orthogonal, nicht in der Könnensstufe)', kompetenzpfad(daten, 'beginner').stationen.every((s) => !trainerGestaltungKette.includes(s.baustein.id)));
// Vermittlungsziele im Individualpfad (erste Ziel-Dimension neben den Spielzielen), stufen-unabhängig.
pruefe('Individualpfad (Trainer): fehlerbild_erkennen → fehler_erkennen_korrigieren', gleicheListe(individualpfad(daten, { dimension: 'vermittlungsziele', faktor: 'fehlerbild_erkennen' }).stationen.map((s) => s.baustein.id), ['fehler_erkennen_korrigieren']));
pruefe('Individualpfad (Trainer): demonstrieren_modell_geben → Rahmen + Zugänglich-machen', gleicheListe(individualpfad(daten, { dimension: 'vermittlungsziele', faktor: 'demonstrieren_modell_geben' }).stationen.map((s) => s.baustein.id), ['was_gutes_vermitteln_ausmacht', 'inhalt_zugaenglich_machen']));
pruefe('Trainer-Meta stufen-unabhängig: Beginner-Diagnose, Vermittlungsziel greift dennoch', individualpfad(daten, { dimension: 'vermittlungsziele', faktor: 'einheit_strukturieren' }).stationen.length === 1);
// Zwei Trainer-Layer-Quellen nebeneinander: Pool-Bausteine + technikgebundene Fehlerbilder, kollisionsfrei.
pruefe('zwei Trainer-Quellen kollisionsfrei: Trainingsgestaltung im Pool, Fehlerbilder als eigene Entität daneben', daten.bausteinVonId.has('fehler_erkennen_korrigieren') && !daten.bausteinVonId.has('griff_fehler_zu_fest') && fehlerbilderFuer(daten, 'griff').length === 3);
pruefe('Vermittlungsziele des Blocks decken alle vier Vermittlungstätigkeiten ab', (() => {
  const bereiche = new Set();
  for (const b of trainerGestaltung.bausteine) for (const z of b.vermittlungsziele || []) bereiche.add(daten.vermittlungszielBereichVonFaktor.get(z));
  return bereiche.size === 4;
})());
setzeZurueck();

console.log('\n[7i] App-Info (Reiter Über/Mitmachen + Sprachanzeige, eigene Entität — nicht im Pool)');
pruefe('app-info über baueIndizes eingelesen: ueber + mitmachen + sprachen', Boolean(daten.appInfo.ueber && daten.appInfo.mitmachen && daten.appInfo.sprachen));
pruefe('Über-Reiter: Absätze + Dank/Quellen + Lizenz/Credits + GitHub-Link (in Credits)', (daten.appInfo.ueber.absaetze || []).length >= 1 && (daten.appInfo.ueber.danksagungen?.eintraege || []).length >= 1 && (daten.appInfo.ueber.credits_lizenz?.lizenzen || []).length >= 1 && (daten.appInfo.ueber.credits_lizenz?.credits?.personen || []).length >= 1 && /^https?:\/\//.test(daten.appInfo.ueber.credits_lizenz?.github?.ziel || ''));
pruefe('Mitmachen-Reiter: 3 Möglichkeiten, jede mit cta_label + cta_ziel', (daten.appInfo.mitmachen.moeglichkeiten || []).length === 3 && daten.appInfo.mitmachen.moeglichkeiten.every((m) => m.cta_label?.de && m.cta_ziel));
pruefe('Sprachwahl funktional (funktion_aktiv:true), 4 Sprachen de/en/fr/pl mit Eigenname + Flagge, aktuell de', daten.appInfo.sprachen.funktion_aktiv === true && gleicheListe((daten.appInfo.sprachen.liste || []).map((s) => s.code), ['de', 'en', 'fr', 'pl']) && (daten.appInfo.sprachen.liste || []).every((s) => typeof s.eigenname === 'string' && s.eigenname && s.flagge) && daten.appInfo.sprachen.aktuell === 'de');
pruefe('jede Sprache trägt Flagge + Kürzel + Label', (daten.appInfo.sprachen.liste || []).every((s) => s.flagge && s.kuerzel && s.label?.de));
pruefe('App-Info erweitert den Baustein-Pool nicht (108 Bausteine, eigene Entität)', daten.bausteine.length === 108 && !daten.bausteinVonId.has('ueber') && !daten.bausteinVonId.has('mitmachen'));
pruefe('GitHub-Links gefüllt (echte http-URLs): Credits-Link + alle drei CTAs', /^https?:\/\//.test(daten.appInfo.ueber.credits_lizenz.github.ziel) && daten.appInfo.mitmachen.moeglichkeiten.every((m) => /^https?:\/\//.test(m.cta_ziel)));
pruefe('Lizenzen ausgeschrieben + verlinkt (MIT, CC BY), Credits verlinkt (Damian Paderta, nozilla)', daten.appInfo.ueber.credits_lizenz.lizenzen.some((l) => /MIT/.test(l.name.de)) && daten.appInfo.ueber.credits_lizenz.lizenzen.some((l) => /CC BY/.test(l.name.de)) && daten.appInfo.ueber.credits_lizenz.lizenzen.every((l) => /^https?:\/\//.test(l.ziel)) && daten.appInfo.ueber.credits_lizenz.credits.personen.some((p) => /Damian Paderta/.test(p.name)) && daten.appInfo.ueber.credits_lizenz.credits.personen.some((p) => /nozilla/.test(p.name)) && daten.appInfo.ueber.credits_lizenz.credits.personen.every((p) => /^https?:\/\//.test(p.ziel)));
pruefe('Sprachanzeige-Hinweis aus den Daten entfernt (rein darstellend, keine Anmerkung)', daten.appInfo.sprachen.hinweis === undefined);
pruefe('App-Info trägt Version + Rechtstexte (Impressum/Datenschutz) für den Footer', typeof daten.appInfo.meta.version === 'string' && daten.appInfo.meta.version !== '' && (daten.appInfo.rechtliches?.impressum?.absaetze || []).length >= 1 && (daten.appInfo.rechtliches?.datenschutz?.absaetze || []).length >= 1);
pruefe('Footer-Labels (de) vorhanden (Impressum, Datenschutz)', typeof labelsDe.ui.footer_impressum === 'string' && labelsDe.ui.footer_impressum !== '' && typeof labelsDe.ui.footer_datenschutz === 'string' && labelsDe.ui.footer_datenschutz !== '');
pruefe('Nav-Labels (de) für die neuen Reiter vorhanden', typeof labelsDe.ui.nav_ueber === 'string' && labelsDe.ui.nav_ueber !== '' && typeof labelsDe.ui.nav_mitmachen === 'string' && labelsDe.ui.nav_mitmachen !== '');

console.log('\n[7k] Doppel über alle drei Stufen + Outdoor/Umgebungs-Achse');
setzeZurueck();
pruefe('Beginner-Doppel (5, 3 Übung + 2 Reflexion), 0 Deltas, alle spielform:doppel/beginner', doppelBeginner.bausteine.length === 5 && doppelBeginner.delta_bausteine.length === 0 && doppelBeginner.bausteine.every((b) => b.spielform === 'doppel' && gleicheListe(b.kompetenzstufe, ['beginner'])) && doppelBeginner.bausteine.filter((b) => b.uebungsteil).length === 3 && doppelBeginner.bausteine.filter((b) => b.reflexionsaufgabe).length === 2);
pruefe('Experte-Doppel (5, 2 Übung + 3 Reflexion), 0 Deltas, alle spielform:doppel/experte', doppelExperte.bausteine.length === 5 && doppelExperte.delta_bausteine.length === 0 && doppelExperte.bausteine.every((b) => b.spielform === 'doppel' && gleicheListe(b.kompetenzstufe, ['experte'])) && doppelExperte.bausteine.filter((b) => b.uebungsteil).length === 2 && doppelExperte.bausteine.filter((b) => b.reflexionsaufgabe).length === 3);
pruefe('Spielform-Achse doppel deckt jetzt alle drei Stufen ab', (() => {
  const stufen = new Set(spielformpfad(daten, 'doppel').stationen.map((s) => niedrigsteStufe(daten, s.baustein)));
  return stufen.has('beginner') && stufen.has('fortgeschritten') && stufen.has('experte');
})());
pruefe('6 Outdoor-Bausteine (typ umgebungs_baustein, fortgeschritten, 2 Übung + 4 Reflexion), 0 Deltas', outdoorThema.bausteine.length === 6 && outdoorThema.delta_bausteine.length === 0 && outdoorThema.bausteine.every((b) => b.typ === 'umgebungs_baustein' && gleicheListe(b.kompetenzstufe, ['fortgeschritten'])) && outdoorThema.bausteine.filter((b) => b.uebungsteil).length === 2 && outdoorThema.bausteine.filter((b) => b.reflexionsaufgabe).length === 4);
pruefe('umgebungs_baustein im Typ-Filter: aus Kompetenz- UND Themenpfad gefiltert', !kompetenzpfad(daten, 'experte').stationen.some((s) => s.baustein.typ === 'umgebungs_baustein') && !['taktik', 'athletik_kondition'].some((d) => themenpfad(daten, d).stationen.some((s) => s.baustein.typ === 'umgebungs_baustein')));
pruefe('Umgebungs-Achse: umgebungspfad sammelt alle 10 (Outdoor + Spielmodi) in Erzählreihenfolge', gleicheListe(umgebungspfad(daten).stationen.map((s) => s.baustein.id), [...outdoorKette, ...spielmodiKette]));
pruefe('witterung als Navigationsachse (wind/sonne/naesse/hitze/kaelte/dunkelheit je belegt)', gleicheListe(witterungen(daten).map((e) => e.witterung), ['wind', 'sonne_blendung', 'naesse', 'hitze', 'kaelte', 'dunkelheit']));
pruefe('untergrund als Navigationsachse (sand/rasen/asche/kunstrasen/schnee, ohne halle)', gleicheListe(untergruende(daten).map((e) => e.untergrund), ['sand', 'rasen', 'asche', 'kunstrasen', 'schnee']));
pruefe('untergrund als LISTE: verschiedene_boeden trägt vier Böden, Alt-Baustein bleibt Halle', gleicheListe(untergrundVon(daten.bausteinVonId.get('verschiedene_boeden')), ['sand', 'rasen', 'asche', 'kunstrasen']) && gleicheListe(untergrundVon(daten.bausteinVonId.get('griff')), ['halle']));
pruefe('witterungpfad wind = wind_lesen_nutzen; untergrundpfad sand = verschiedene_boeden', gleicheListe(umgebungspfad(daten, 'witterung', 'wind').stationen.map((s) => s.baustein.id), ['wind_lesen_nutzen']) && gleicheListe(umgebungspfad(daten, 'untergrund', 'sand').stationen.map((s) => s.baustein.id), ['verschiedene_boeden', 'beachminton']));
// Bereich 5 (Umgebungsanpassung) wird real — über den Individualpfad (Outdoor bleibt aus Kompetenz/Themen gefiltert).
setzeDiagnose({ stufe: 'fortgeschritten' });
pruefe('Bereich-5-Ziel windspiel (Fortgeschritten): Outdoor-Bausteine im Individualpfad', gleicheListe(individualpfad(daten, { dimension: 'spielziele', faktor: 'windspiel' }).stationen.map((s) => s.baustein.id), ['draussen_spielen', 'wind_lesen_nutzen']));
pruefe('Bereich-5-Ziel untergrundwechsel (Fortgeschritten): Nässe + Böden + Snow/Beach', gleicheListe(individualpfad(daten, { dimension: 'spielziele', faktor: 'untergrundwechsel' }).stationen.map((s) => s.baustein.id), ['spielarten_ueberblick', 'naesse_sicherer_stand', 'verschiedene_boeden', 'snowminton', 'beachminton']));
pruefe('Outdoor-/Doppel-Titel ins Label geliftet', labelsDe.bausteine.wind_lesen_nutzen === 'Wind lesen und nutzen' && labelsDe.bausteine.paar_als_system === 'Das Paar als System');
pruefe('Umgebungs-UI-Labels (de) vorhanden (pfad_umgebung + Achsen-Überschriften)', ['pfad_umgebung', 'pfad_umgebung_text', 'umgebung_wetter', 'umgebung_boden', 'umgebung_alle'].every((k) => typeof labelsDe.ui[k] === 'string' && labelsDe.ui[k] !== ''));
// Spielmodi-Block (Umgebungs-Varianten Snow/Beach/Black): eigener typ umgebungs_baustein, fortgeschritten.
pruefe('4 Spielmodi-Bausteine (typ umgebungs_baustein, fortgeschritten, 1 Übung + 3 Reflexion), 0 Deltas', spielmodi.bausteine.length === 4 && spielmodi.delta_bausteine.length === 0 && spielmodi.bausteine.every((b) => b.typ === 'umgebungs_baustein' && gleicheListe(b.kompetenzstufe, ['fortgeschritten'])) && spielmodi.bausteine.filter((b) => b.uebungsteil).length === 1 && spielmodi.bausteine.filter((b) => b.reflexionsaufgabe).length === 3);
pruefe('Spielmodi aus Kompetenz- UND Themenpfad gefiltert (typ umgebungs_baustein)', !kompetenzpfad(daten, 'experte').stationen.some((s) => spielmodiKette.includes(s.baustein.id)) && !['taktik', 'athletik_kondition'].some((d) => themenpfad(daten, d).stationen.some((s) => spielmodiKette.includes(s.baustein.id))));
pruefe('neue Umgebungs-Achsenwerte: untergrund/schnee = snowminton; witterung/kaelte = snowminton; witterung/dunkelheit = blackminton', gleicheListe(umgebungspfad(daten, 'untergrund', 'schnee').stationen.map((s) => s.baustein.id), ['snowminton']) && gleicheListe(umgebungspfad(daten, 'witterung', 'kaelte').stationen.map((s) => s.baustein.id), ['snowminton']) && gleicheListe(umgebungspfad(daten, 'witterung', 'dunkelheit').stationen.map((s) => s.baustein.id), ['blackminton']));
pruefe('Spielmodi belegen Bereich-5-Ziele im Individualpfad (temperatur: +Snow/Beach; licht_und_sicht: +Black)', gleicheListe(individualpfad(daten, { dimension: 'spielziele', faktor: 'temperatur' }).stationen.map((s) => s.baustein.id), ['hitze', 'snowminton', 'beachminton']) && gleicheListe(individualpfad(daten, { dimension: 'spielziele', faktor: 'licht_und_sicht' }).stationen.map((s) => s.baustein.id), ['sonne_blendung', 'blackminton']));
pruefe('Spielmodi-Titel + neue Vokabel-Labels geliftet', labelsDe.bausteine.snowminton === 'Snowminton — Spiel auf Schnee' && labelsDe.bausteine.blackminton === 'Blackminton — Spiel im Dunkeln' && labelsDe.vokabeln.untergrund.schnee === 'Schnee' && labelsDe.vokabeln.witterung.kaelte === 'Kälte' && labelsDe.vokabeln.witterung.dunkelheit === 'Dunkelheit');
setzeZurueck();

console.log('\n[8] Projektionen und Kontinuität');
setzeZurueck();
setzeDiagnose({ stufe: 'beginner' });
pruefe('global 0 von 108 (Gesamtpool inkl. Doppel alle drei Stufen + Outdoor + Spielmodi + Spielformen + Trainer + Ausrüstung)', globaleProjektion(daten).absolviert === 0 && globaleProjektion(daten).gesamt === 108);
setzeTeilStatus('griff', 'erklaerteil', 'erledigt');
pruefe('nur Erklärteil erledigt → noch nicht absolviert', globaleProjektion(daten).absolviert === 0 && globaleProjektion(daten).erklaertErledigt === 1);
setzeTeilStatus('griff', 'uebungsteil', 'erledigt');
pruefe('beide Teile erledigt → 1 von 95', globaleProjektion(daten).absolviert === 1);
const pfadProjektion = projektion(kompetenzpfad(daten).stationen.map((s) => s.baustein));
pruefe('Beginner-Pfad-Projektion bei 34 (kumulativ bis Beginner, inkl. Doppel-Beginner + funplay)', pfadProjektion.absolviert === 1 && pfadProjektion.gesamt === 34);
const uebersicht = trainingsuebersicht(daten);
pruefe('Trainingspfad stufen-kumulativ: Beginner sieht die drei Beginner-Einheiten (inkl. Doppel-Beginner)', uebersicht.length === 3 && uebersicht.every((e) => e.einheit.kompetenzstufe === 'beginner'));
pruefe('Beginner-Trainingsliste enthält die Beginner-Doppel-Einheit (spielform:doppel)', uebersicht.some((e) => e.einheit.id === 'doppel_beginner_zusammenspiel' && e.einheit.spielform === 'doppel'));
pruefe('Einheit über drei Phasen aufgelöst (beginner_erste_schlaege: 5 Übungen, Erwärmung→Ausklang)', (() => {
  const e = uebersicht.find((u) => u.einheit.id === 'beginner_erste_schlaege');
  return e && e.bausteine.length === 5 && e.referenzen.length === 5 && e.referenzen[0].phase === 'erwaermung' && e.referenzen.at(-1).phase === 'ausklang';
})());
pruefe('alle Einheit-Referenzen tragen einen Übungsteil (keine Reflexions-Bausteine)', uebersicht.every((u) => u.referenzen.every((r) => hatUebungsteil(r.baustein))));
pruefe('kuratorischer Hinweis je Referenz vorhanden', uebersicht[0].referenzen.every((r) => typeof (r.hinweis?.de) === 'string'));
setzeDiagnose({ stufe: 'fortgeschritten' });
pruefe('Fortgeschritten kumulativ: sechs Einheiten (3 Beginner + 3 Fortgeschritten, inkl. Doppel + Outdoor)', (() => {
  const alle = trainingsuebersicht(daten);
  return alle.length === 6
    && alle.some((u) => u.einheit.id === 'doppel_als_paar_spielen' && u.einheit.spielform === 'doppel')
    && alle.some((u) => u.einheit.id === 'outdoor_wind_und_boden' && u.einheit.kompetenzstufe === 'fortgeschritten');
})());
setzeDiagnose({ stufe: 'experte' });
pruefe('Experte kumulativ: alle acht Einheiten, erstmals zwei Experten-Einheiten sichtbar', (() => {
  const alle = trainingsuebersicht(daten);
  const experten = alle.filter((u) => u.einheit.kompetenzstufe === 'experte').map((u) => u.einheit.id);
  return alle.length === 8 && gleicheListe(experten, ['experte_praezision_und_taeuschung', 'experte_tempo_und_konstanz']);
})());
pruefe('alle 8 Einheiten: jede Referenz löst auf einen Baustein mit Übungsteil auf', trainingsuebersicht(daten).every((u) => u.referenzen.length > 0 && u.referenzen.every((r) => hatUebungsteil(r.baustein))));
setzeDiagnose({ stufe: 'beginner' });
registriereEinheitAbschluss('beginner_erste_schlaege');
registriereEinheitAbschluss('beginner_erste_schlaege');
const nachher = trainingsuebersicht(daten).find((e) => e.einheit.id === 'beginner_erste_schlaege');
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

console.log('\n[10] Grafiksystem (G-XXX-Nummernkreis + Platzhalter-Dateien)');
const grafikRefs = [...daten.bausteine, ...daten.deltas].flatMap((b) => b.grafik || []);
const alleG = Array.from({ length: 63 }, (_, i) => `G-${String(i + 1).padStart(3, '0')}`);
pruefe('alle Baustein-Grafiken folgen dem G-XXX-Schema', grafikRefs.length > 0 && grafikRefs.every((g) => /^G-\d{3}$/.test(g)));
pruefe('57 Bausteine tragen eine Grafik, 61 G-Referenzen (4 Zwei-Bild-Sequenzen)', daten.bausteine.filter((b) => (b.grafik || []).length > 0).length === 57 && grafikRefs.length === 61);
pruefe('Sequenz-Bausteine tragen zwei Grafiken (aufschlag/beinarbeit/taeuschung/tempo_rhythmus_wechsel)', ['aufschlag', 'beinarbeit', 'taeuschung', 'tempo_rhythmus_wechsel'].every((id) => (daten.bausteinVonId.get(id).grafik || []).length === 2));
pruefe('Deltas tragen keine eigene Grafik (nur Basis-Bausteine)', daten.deltas.every((d) => !(d.grafik && d.grafik.length)));
pruefe('jede referenzierte G-XXX hat eine Platzhalter-Datei images/G-XXX.png', [...new Set(grafikRefs)].every((g) => existsSync(join(wurzel, 'images', `${g}.png`))));
pruefe('alle 63 Grafiken G-001..G-063 existieren als Datei', alleG.every((g) => existsSync(join(wurzel, 'images', `${g}.png`))));
pruefe('Regeln-Referenzgrafiken G-060/G-061: Label vorhanden, an keinem Baustein', labelsDe.grafiken['G-060'] && labelsDe.grafiken['G-061'] && !grafikRefs.includes('G-060') && !grafikRefs.includes('G-061'));
pruefe('logo-speeder.svg und grafik-prompts.md liegen in images/', existsSync(join(wurzel, 'images', 'logo-speeder.svg')) && existsSync(join(wurzel, 'images', 'grafik-prompts.md')));
pruefe('SVG_GRAFIKEN: jede Diagramm-Grafik hat .svg UND .png (Inline-SVG + PNG-Fallback)', SVG_GRAFIKEN.size >= 3 && [...SVG_GRAFIKEN].every((g) => existsSync(join(wurzel, 'images', `${g}.svg`)) && existsSync(join(wurzel, 'images', `${g}.png`))));
pruefe('GRAFIK_SPRACHEN: jede Diagramm-Grafik hat je Sprache einen .svg- UND .png-Zwilling (übersetzte Diagramme)', GRAFIK_SPRACHEN.size >= 1 && [...GRAFIK_SPRACHEN].every((lang) => [...SVG_GRAFIKEN].every((g) => existsSync(join(wurzel, 'images', `${g}.${lang}.svg`)) && existsSync(join(wurzel, 'images', `${g}.${lang}.png`)))));
// Jeder Basis-Baustein trägt ein Icon (BAUSTEIN_ICONS in js/oberflaeche.js) — Doppel/Outdoor/Experte inklusive.
pruefe('alle Basis-Bausteine tragen ein Icon (BAUSTEIN_ICONS vollständig)', (() => {
  const ohne = daten.bausteine.filter((b) => bausteinIcon(b.id) === '').map((b) => b.id);
  return ohne.length === 0;
})(), daten.bausteine.filter((b) => bausteinIcon(b.id) === '').map((b) => b.id).join(', '));

console.log('\n[11] Trainingsplan (Engine + Persistenz)');
setzeZurueck();
setzeDiagnose({ stufe: 'fortgeschritten' });
pruefe('planbare Einheiten stufen-kumulativ (Fortgeschritten: 6)', planbareEinheiten(daten).length === 6);
pruefe('Spielform-Filter doppel: nur Doppel-Einheiten', planbareEinheiten(daten, 'doppel').length >= 1 && planbareEinheiten(daten, 'doppel').every((e) => e.spielform === 'doppel'));
const planA = erzeugePlan(daten, { wochen: 3, einheitenProWoche: 2, startISO: '2026-07-13' });
pruefe('erzeugePlan: wochen×proWoche Sessions (3×2=6)', planA.sessions.length === 6);
pruefe('erzeugePlan: Termine verteilt (Mo/Do, wöchentlich)', planA.sessions[0].datum === '2026-07-13' && planA.sessions[1].datum === '2026-07-16' && planA.sessions[2].datum === '2026-07-20');
pruefe('erzeugePlan: Wochen-Gruppierung 3×2', gleicheListe(planNachWochen(planA).map((g) => g.sessions.length), [2, 2, 2]));
pruefe('erzeugePlan: nur planbare (existierende) Einheiten', planA.sessions.every((s) => daten.einheitVonId.has(s.einheit)));

// --- Trainings-Metadaten im Plan (Spez. 13.4) --------------------------------
// Das Profil verdichtet die Baustein-Metadaten der Einheit: Umfang als Klasse,
// Intensität als SPITZE (nicht Mittelwert), Fokus als Vereinigung.
const profilA = einheitProfil(daten, 'beginner_bewegung_und_position');
pruefe('einheitProfil verdichtet Umfang/Intensität/Fokus', Boolean(profilA)
  && profilA.dauer === 'kurz' && profilA.intensitaet === 'hoch'
  && gleicheListe(profilA.fokus, ['kondition', 'koordination', 'technik']));
pruefe('einheitProfil nimmt die Intensitäts-SPITZE, nicht den Mittelwert', (() => {
  const einheit = daten.einheitVonId.get('beginner_bewegung_und_position');
  const stufen = einheitReferenzen(einheit)
    .map((r) => daten.bausteinVonId.get(r.baustein)?.intensitaet)
    .filter(Boolean);
  return stufen.includes('hoch') && !stufen.every((i) => i === 'hoch') && profilA.intensitaet === 'hoch';
})());
pruefe('einheitProfil für unbekannte Einheit liefert null (Nicht-Fehlerfall)', einheitProfil(daten, 'gibt_es_nicht') === null);
pruefe('alle planbaren Einheiten haben ein Profil (alle Übungsbausteine sind getaggt)',
  planbareEinheiten(daten, 'alle').every((e) => einheitProfil(daten, e.id) !== null));
// phasenTreu ist informativ, KEIN Lint: die kuratierten Einheiten nutzen den
// Ausklang als spielerischen Abschluss und setzen dort bewusst Hauptteil-Übungen.
pruefe('phasenTreu ist informativ — der bekannte Ausklang-Befund bleibt sichtbar', (() => {
  const untreu = planbareEinheiten(daten, 'alle')
    .map((e) => einheitProfil(daten, e.id))
    .filter((p) => p && !p.phasenTreu);
  return untreu.length > 0 && untreu.every((p) => p.abweichungen.every((a) => a.phase === 'ausklang'));
})());

// Die Spitze taugt nicht zum Verteilen (7 von 8 Einheiten sind „hoch"), die
// abgestufte Last schon — sie trennt die Einheiten von 1,40 bis 2,80.
pruefe('einheitProfil liefert die abgestufte Last neben der Spitze', (() => {
  const lasten = planbareEinheiten(daten, 'alle').map((e) => einheitProfil(daten, e.id).last);
  return lasten.every((l) => l >= 1 && l <= 3) && new Set(lasten).size > 1
    && Math.max(...lasten) - Math.min(...lasten) > 0.5;
})());
// Die Auswahl ist ein Kompromiss aus Lastwechsel UND Fokus-Abwechslung: eine etwas
// schwerere Einheit darf gewinnen, wenn sie thematisch besser abwechselt. Geprüft
// wird darum die dokumentierte Greedy-Invariante — der Gewählte minimiert das
// Gewicht `lastStrafe + Fokus-Überschneidung` unter den noch übrigen Kandidaten.
pruefe('erzeugePlan minimiert das dokumentierte Auswahl-Gewicht (Lastwechsel + Abwechslung)', (() => {
  const plan = erzeugePlan(daten, { wochen: 4, einheitenProWoche: 2, startISO: '2026-07-13' });
  const ids = plan.sessions.map((s) => s.einheit);
  const pool = planbareEinheiten(daten, 'alle').map((e) => e.id);
  const gewicht = (vor, p) => (vor.last >= 2.0 ? p.last * 2 : 0) + p.fokus.filter((f) => vor.fokus.includes(f)).length;
  for (let i = 1; i < Math.min(ids.length, pool.length); i++) {
    const vor = einheitProfil(daten, ids[i - 1]);
    const uebrig = pool.filter((id) => !ids.slice(0, i).includes(id));
    if (!uebrig.length) break;
    const bestes = Math.min(...uebrig.map((id) => gewicht(vor, einheitProfil(daten, id))));
    if (gewicht(vor, einheitProfil(daten, ids[i])) > bestes + 1e-9) return false;
  }
  return true;
})());
pruefe('erzeugePlan schiebt die schwerste Einheit nach hinten (Progression)', (() => {
  const plan = erzeugePlan(daten, { wochen: 4, einheitenProWoche: 2, startISO: '2026-07-13' });
  const lasten = plan.sessions.map((s) => einheitProfil(daten, s.einheit).last);
  return lasten.indexOf(Math.max(...lasten)) > lasten.indexOf(Math.min(...lasten));
})());
pruefe('erzeugePlan bleibt deterministisch (gleiche Konfig → gleicher Plan)', (() => {
  const a = erzeugePlan(daten, { wochen: 3, einheitenProWoche: 3, startISO: '2026-08-03' });
  const b = erzeugePlan(daten, { wochen: 3, einheitenProWoche: 3, startISO: '2026-08-03' });
  return gleicheListe(a.sessions.map((s) => s.einheit), b.sessions.map((s) => s.einheit));
})());
pruefe('erzeugePlan schöpft den Pool aus, bevor er wiederholt', (() => {
  const pool = planbareEinheiten(daten, 'alle').length;
  const plan = erzeugePlan(daten, { wochen: 3, einheitenProWoche: 2, startISO: '2026-07-13' });
  const erste = plan.sessions.slice(0, Math.min(pool, plan.sessions.length)).map((s) => s.einheit);
  return new Set(erste).size === erste.length;
})());
// Jeder Vokabular-Wert braucht ein de-Label, sonst zeigt die Profil-Zeile die rohe ID.
pruefe('jeder Trainings-Metadaten-Wert trägt ein de-Label', ['dauer_klasse', 'intensitaet', 'fokus', 'geeignete_phase'].every((gruppe) => {
  const werte = technik.vokabulare.trainings_metadaten[gruppe];
  const labels = labelsDe.vokabeln[gruppe] || {};
  return Array.isArray(werte) && werte.length > 0 && werte.every((w) => typeof labels[w] === 'string' && labels[w] !== '');
}));
pruefe('Plan-Profil-UI-Labels (de) vollständig', ['plan_profil', 'plan_dauer', 'plan_intensitaet', 'plan_fokus']
  .every((k) => typeof labelsDe.ui[k] === 'string' && labelsDe.ui[k] !== ''));
pruefe('tauscheEinheit ändert die Einheit einer Session', tauscheEinheit(daten, planA, 0).sessions[0].einheit !== planA.sessions[0].einheit);
pruefe('entferneSession entfernt genau eine', entferneSession(planA, 0).sessions.length === planA.sessions.length - 1);
pruefe('Grenzen gekappt (99 Wochen → 12, 9/Woche → 4 = 48)', erzeugePlan(daten, { wochen: 99, einheitenProWoche: 9, startISO: '2026-07-13' }).sessions.length === 48);
const ical = planAlsIcal(planA, (id) => ({ titel: labelsDe.trainingseinheiten[id] || id, schwerpunkt: 'x' }), '20260711T090000Z');
pruefe('planAlsIcal: gültiges VCALENDAR, eine VEVENT je Session, CRLF', ical.startsWith('BEGIN:VCALENDAR') && ical.trim().endsWith('END:VCALENDAR') && (ical.match(/BEGIN:VEVENT/g) || []).length === planA.sessions.length && ical.includes('\r\n'));
pruefe('planAlsIcal: ganztägige Termine (DTSTART;VALUE=DATE)', ical.includes('DTSTART;VALUE=DATE:20260713'));
loeschePlan();
pruefe('Zustand: kein Plan initial', gespPlan() === null);
setzePlan(planA);
pruefe('Zustand: Plan persistiert und lesbar', gespPlan()?.sessions.length === 6);
loeschePlan();
pruefe('Zustand: Plan löschbar', gespPlan() === null);

// ---- Volltext-Suche (js/suche.js) ----
// Der Titel-Auflöser reicht die de-Titel herein (die Engine kennt keine Labels).
const titelVon = (id) => labelsDe.bausteine[id] || id;
pruefe('normalisiere: Umlaut falten + klein + trim', normalisiere('  Täuschung ') === 'tauschung');
pruefe('bausteinText: nicht leer für einen bekannten Baustein', bausteinText(daten.bausteinVonId.get('aufschlag')).length > 0);

const trefferAufschlag = sucheBausteine(daten, 'Aufschlag', titelVon);
pruefe('Suche „Aufschlag": Treffer enthalten den aufschlag-Baustein', trefferAufschlag.some((tr) => tr.baustein.id === 'aufschlag'));
pruefe('Suche: Titeltreffer rankt oben (Term steht im Titel des ersten Treffers)', normalisiere(titelVon(trefferAufschlag[0].baustein.id)).includes('aufschlag'));
pruefe('Suche: jeder Treffer enthält den Term (Titel oder Inhalt)', trefferAufschlag.every((tr) => normalisiere(`${titelVon(tr.baustein.id)} ${bausteinText(tr.baustein)}`).includes('aufschlag')));

pruefe('Suche umlautfrei „tauschung" findet taeuschung (Titel „Täuschung")', sucheBausteine(daten, 'tauschung', titelVon).some((tr) => tr.baustein.id === 'taeuschung'));
pruefe('Suche UND: unerfüllbarer Zusatzterm → keine Treffer', sucheBausteine(daten, 'aufschlag xyzqwknichtvorhanden', titelVon).length === 0);
pruefe('Suche: leere Anfrage → keine Treffer', sucheBausteine(daten, '   ', titelVon).length === 0);
pruefe('Suche: Kauderwelsch → keine Treffer', sucheBausteine(daten, 'zzxqwvbnmlkj', titelVon).length === 0);
const suchA = sucheBausteine(daten, 'spiel', titelVon).map((tr) => tr.baustein.id);
const suchB = sucheBausteine(daten, 'spiel', titelVon).map((tr) => tr.baustein.id);
pruefe('Suche: deterministische Reihenfolge bei gleicher Anfrage', suchA.length > 0 && gleicheListe(suchA, suchB));

console.log('\n[12] i18n-Struktur & Ring-0-Labels (en)');
// Struktur-Gate: en/fr/pl müssen exakt die de-Schlüsselmenge spiegeln, damit ein
// neuer de-Schlüssel nicht still unübersetzt durchrutscht (Laufzeit fällt sonst auf de).
const i18nStruktur = pruefeI18nStruktur(wurzel);
pruefe('en/fr/pl spiegeln die de-Schlüsselmenge strukturell', i18nStruktur.ok, i18nStruktur.probleme.join('; '));
// Ring-0-Wächter: die UI-Labels sind englisch befüllt (Stichprobe quer über alle
// Namespaces — kein 100%-Zwang, damit neue de-Labels nicht sofort den Build brechen).
pruefe('EN-Labels befüllt (Stichprobe quer über Namespaces)',
  labelsEn.ui.nav_lernen === 'Learn' && labelsEn.ui.pfad_kompetenz !== '' && labelsEn.bausteine.aufschlag !== ''
  && labelsEn.grafiken['G-001'] !== '' && labelsEn.vokabeln.domaene.technik !== ''
  && labelsEn.spielziele.faktoren.rally_ausdauer !== '' && labelsEn.trainingseinheiten.beginner_erste_schlaege !== '');

console.log('\n[13] KO-Turnier (Engine + Persistenz) — Spaßturnier-Werkzeug, kein Lerninhalt');
// Feste 'Zufalls'-Quelle statt Math.random(): die Engine bleibt deterministisch
// testbar, weil sie den Mischer nie selbst aufruft (mische() nimmt sie herein).
let saat = 0.05;
const testZufall = () => { saat = (saat + 0.29) % 1; return saat; };

const sechsNamen = ['Anna', 'Ben', 'Cem', 'Dana', 'Emil', 'Finn'];
const gemischtSechs = mische(sechsNamen, testZufall);
pruefe('mische: liefert eine Permutation derselben Namen', gleicheListe([...gemischtSechs].sort(), [...sechsNamen].sort()));
pruefe('mische: rein (Original bleibt unverändert)', gleicheListe(sechsNamen, ['Anna', 'Ben', 'Cem', 'Dana', 'Emil', 'Finn']));

let ko = erzeugeTurnier('Test-Cup', gemischtSechs);
pruefe('erzeugeTurnier: Titel + Teilnehmerliste übernommen', ko.titel === 'Test-Cup' && gleicheListe([...ko.teilnehmer].sort(), [...sechsNamen].sort()));
// N=6 ist gerade: Runde 1 hat 3 Matches, KEIN Freilos — Freilose entstehen nur bei
// ungerader Teilnehmerzahl, nie durch Auffüllen auf die nächste Zweierpotenz.
pruefe('erzeugeTurnier (N=6): Runde 1 hat 3 Matches, keine Freilose (gerade Teilnehmerzahl)', ko.runden[0].length === 3 && ko.runden[0].every((m) => m.b !== null));
pruefe('erzeugeTurnier: alle 6 Namen kommen in Runde 1 genau einmal vor', gleicheListe([...ko.runden[0].flatMap((m) => [m.a, m.b]).filter(Boolean)].sort(), [...sechsNamen].sort()));

// Runde 1 komplettieren (die offenen 3 Matches entscheiden) → Runde 2 entsteht automatisch.
for (let i = 0; i < ko.runden[0].length; i++) {
  if (!ko.runden[0][i].sieger) ko = traegtSiegerEin(ko, 0, i, ko.runden[0][i].a);
}
// 3 Sieger aus Runde 1 → Runde 2 hat 1 reguläres Match + HÖCHSTENS EIN Freilos
// (nie mehr, das war der ursprüngliche Bug) — macht das Halbfinale trotzdem 2 Matches.
pruefe('traegtSiegerEin: komplette Runde erzeugt automatisch die nächste (Halbfinale, 2 Matches)', ko.runden.length === 2 && ko.runden[1].length === 2);
const freiloseR2 = ko.runden[1].filter((m) => m.b === null);
pruefe('traegtSiegerEin (Runde 2, 3 Sieger aus Runde 1): genau EIN Freilos, nie mehr', freiloseR2.length === 1 && freiloseR2[0].sieger === freiloseR2[0].a);
pruefe('istAbgeschlossen: vor dem Finale falsch', !istAbgeschlossen(ko));
pruefe('turniersieger: vor dem Finale null', turniersieger(ko) === null);

for (let i = 0; i < ko.runden[1].length; i++) {
  if (!ko.runden[1][i].sieger) ko = traegtSiegerEin(ko, 1, i, ko.runden[1][i].a);
}
pruefe('traegtSiegerEin: Halbfinale komplett erzeugt das Finale (1 Match)', ko.runden.length === 3 && ko.runden[2].length === 1);

const finalSieger = ko.runden[2][0].a;
const koVorFinale = ko;
ko = traegtSiegerEin(ko, 2, 0, finalSieger);
pruefe('istAbgeschlossen: nach dem Finale wahr', istAbgeschlossen(ko));
pruefe('turniersieger: liefert den Finalgewinner', turniersieger(ko) === finalSieger);
pruefe('traegtSiegerEin: Immutability (Ursprungsobjekt vor dem Finale unverändert)', koVorFinale.runden.length === 3 && !koVorFinale.runden[2][0].sieger);

pruefe('rundenName: 1→finale, 2→halbfinale, 4→viertelfinale, 8→achtelfinale, 3→kein Name',
  rundenName(1) === 'finale' && rundenName(2) === 'halbfinale' && rundenName(4) === 'viertelfinale' && rundenName(8) === 'achtelfinale' && rundenName(3) === null);

const plaetze = platzierungen(ko);
pruefe('platzierungen: enthält alle 6 Teilnehmer:innen genau einmal', plaetze.length === 6 && gleicheListe([...plaetze.map((p) => p.name)].sort(), [...sechsNamen].sort()));
pruefe('platzierungen: der Champion steht an erster Stelle (ausgeschiedenInRunde null)', plaetze[0].name === finalSieger && plaetze[0].ausgeschiedenInRunde === null);
pruefe('platzierungen: sortiert nach bester Platzierung (Runde absteigend)', plaetze.every((p, i) => i === 0 || (plaetze[i - 1].ausgeschiedenInRunde ?? Infinity) >= (p.ausgeschiedenInRunde ?? Infinity)));
pruefe('platzierungen: Runde-1-Verliererinnen tragen ausgeschiedenInRunde 0', plaetze.some((p) => p.ausgeschiedenInRunde === 0));

// Sieger einer FRÜHEREN (bereits verarbeiteten) Runde nachträglich ändern: die
// darauf aufbauenden späteren Runden müssen verworfen werden (neu zu entscheiden).
const r0Match0 = ko.runden[0][0];
const anderer = r0Match0.a === r0Match0.sieger ? r0Match0.b : r0Match0.a;
if (anderer) {
  const koKorrigiert = traegtSiegerEin(ko, 0, 0, anderer);
  pruefe('traegtSiegerEin (Korrektur einer früheren Runde): spätere Runden werden verworfen', koKorrigiert.runden.length === 2 && koKorrigiert.runden[0][0].sieger === anderer);
  pruefe('traegtSiegerEin (Korrektur): Original bleibt unverändert (Immutability)', ko.runden.length === 3);
}
pruefe('traegtSiegerEin: erneut denselben Sieger eintragen ist ein No-op (identisches Objekt)', traegtSiegerEin(ko, 2, 0, finalSieger) === ko);
pruefe('traegtSiegerEin: unbeteiligter Name ändert nichts (kein Fehlerfall)', traegtSiegerEin(ko, 0, 0, 'Niemand-von-beiden') === ko);

// Randfälle: N=2 (sofortiges Finale), N=8 (keine Freilose nötig).
const koZwei = erzeugeTurnier('Duell', mische(['X', 'Y'], testZufall));
pruefe('erzeugeTurnier (N=2): eine Runde mit einem Match (direktes Finale)', koZwei.runden.length === 1 && koZwei.runden[0].length === 1 && koZwei.runden[0][0].b !== null);
const koAcht = erzeugeTurnier('Acht', mische(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'], testZufall));
pruefe('erzeugeTurnier (N=8): 4 Matches in Runde 1, keine Freilose', koAcht.runden[0].length === 4 && koAcht.runden[0].every((m) => m.b !== null));

// Regressionstest für den ursprünglichen Bug: bei einer Teilnehmerzahl knapp über
// einer Zweierpotenz (hier N=9, „nächste" wäre 16) darf NIE mehr als ein Freilos
// gleichzeitig entstehen — es kaskadiert höchstens eins pro Runde über mehrere
// Runden (9 → 5 → 3 → 2 → 1), statt alle 7 Freilose auf einmal in Runde 1 zu bündeln.
// Eigene Zufallsquelle, damit die nachfolgenden Zustands-Tests unten (die den
// gemeinsamen `testZufall`-Zähler nicht weiterreichen) unberührt bleiben.
let saatNeun = 0.11;
const neunZufall = () => { saatNeun = (saatNeun + 0.17) % 1; return saatNeun; };
const neunNamen = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9'];
let koNeun = erzeugeTurnier('Neun', mische(neunNamen, neunZufall));
let rundenIndexNeun = 0;
let hoechstensEinFreilosJeRunde = true;
let rundenDurchlaufenNeun = 0;
while (!istAbgeschlossen(koNeun)) {
  const runde = koNeun.runden[rundenIndexNeun];
  if (runde.filter((m) => m.b === null).length > 1) hoechstensEinFreilosJeRunde = false;
  for (let i = 0; i < runde.length; i++) {
    if (!koNeun.runden[rundenIndexNeun][i].sieger) koNeun = traegtSiegerEin(koNeun, rundenIndexNeun, i, koNeun.runden[rundenIndexNeun][i].a);
  }
  rundenIndexNeun += 1;
  rundenDurchlaufenNeun += 1;
}
pruefe('erzeugeTurnier (N=9): jede Runde höchstens ein Freilos, nie mehrere gebündelt', hoechstensEinFreilosJeRunde);
pruefe('erzeugeTurnier (N=9): kaskadiert über 4 Runden zum Champion (9→5→3→2→1)', rundenDurchlaufenNeun === 4 && istAbgeschlossen(koNeun));
pruefe('erzeugeTurnier (N=9): alle 9 Teilnehmer:innen tauchen in der Platzierung auf', platzierungen(koNeun).length === 9 && gleicheListe([...platzierungen(koNeun).map((p) => p.name)].sort(), [...neunNamen].sort()));

// Das Freilos ROTIERT: niemand bekommt zwei. Vorher hing es an der letzten
// Listenposition — der Freilos-Gewinner erbte sie und setzte jede Runde erneut
// aus (bei N=5 stand so jemand mit EINEM gespielten Match im Finale, bei N=17 mit
// vier weniger als alle anderen). Die alten Prüfungen deckten das nicht ab: sie
// zählen Freilose je Runde, nie je Person.
function freilosZaehlung(namen) {
  let t = erzeugeTurnier('Freilos-Rotation', namen);
  for (let r = 0; r < namen.length; r++) {
    const runde = t.runden[r];
    if (!runde) break;
    for (let i = 0; i < runde.length; i++) {
      if (!t.runden[r][i].sieger) t = traegtSiegerEin(t, r, i, t.runden[r][i].a);
    }
    if (t.runden.length === r + 1) break;
  }
  const je = new Map();
  for (const runde of t.runden) {
    for (const m of runde) {
      if (m.b === null) je.set(m.a, (je.get(m.a) || 0) + 1);
    }
  }
  return { turnier: t, maximum: Math.max(0, ...je.values()) };
}
const freilosGrossen = [5, 7, 9, 11, 17];
pruefe(
  'Freilos rotiert: bei 5/7/9/11/17 Teilnehmenden bekommt niemand mehr als EINS',
  freilosGrossen.every((n) => freilosZaehlung(Array.from({ length: n }, (_, i) => `P${i + 1}`)).maximum <= 1),
);
// Konkret der Fall, der den Fehler sichtbar machte: bei N=5 muss die Person mit
// dem Runde-1-Freilos in Runde 2 ein echtes Match bestreiten.
const koFuenf = freilosZaehlung(['Anna', 'Ben', 'Cem', 'Dana', 'Emil']).turnier;
const freilosR1 = koFuenf.runden[0].find((m) => m.b === null)?.a;
pruefe(
  'Freilos rotiert: die Freilos-Person aus Runde 1 spielt in Runde 2 ein echtes Match',
  Boolean(freilosR1) && koFuenf.runden[1].some((m) => m.b !== null && (m.a === freilosR1 || m.b === freilosR1)),
);
// Ein Freilos-Match trägt seinen Sieger automatisch; `null` ist kein gültiger
// Sieger und darf ihn nicht löschen (b === null passierte sonst den Beteiligten-Test).
const koGuard = erzeugeTurnier('Guard', ['A', 'B', 'C']);
pruefe(
  'traegtSiegerEin: null als Sieger lässt auch ein Freilos-Match unverändert',
  traegtSiegerEin(koGuard, 0, 1, null) === koGuard,
);

// Fehlerfälle: zu wenig bzw. doppelte Teilnehmer:innen sind ein echter Programmfehler
// (die Ansicht verhindert das schon bei der Eingabe) — kein Nicht-Fehlerfall wie sonst üblich.
let wirftZuWenig = false;
try { erzeugeTurnier('zu wenig', ['Nur Eine']); } catch { wirftZuWenig = true; }
pruefe('erzeugeTurnier: wirft bei < 2 Teilnehmer:innen', wirftZuWenig);
let wirftDuplikat = false;
try { erzeugeTurnier('Duplikat', ['A', 'A']); } catch { wirftDuplikat = true; }
pruefe('erzeugeTurnier: wirft bei doppelten Namen', wirftDuplikat);

// Zustand: ein aktives Turnier zur Zeit, wie der Trainingsplan.
loescheKoTurnier();
pruefe('Zustand: kein KO-Turnier initial', gespKoTurnier() === null);
setzeKoTurnier(koZwei);
pruefe('Zustand: KO-Turnier persistiert und lesbar', gespKoTurnier()?.titel === 'Duell');
loescheKoTurnier();
pruefe('Zustand: KO-Turnier löschbar', gespKoTurnier() === null);

console.log('\n[14] Spielformen (typ modus_baustein) + Trainings-Metadaten');
// Spielformen sind — anders als umgebungs_baustein — NICHT typ-gefiltert: sie tragen
// eine fachliche Domäne, eine Stufe und eine echte Voraussetzung (Spez. 13.2).
const spielformen2 = daten.bausteine.filter((b) => b.typ === 'modus_baustein');
pruefe('zwei modus_baustein im Pool (funplay, mehrfeld)', gleicheListe(spielformen2.map((b) => b.id).sort(), ['funplay', 'mehrfeld']));
pruefe('modus_baustein ist im kanonischen Vokabular gedeckt', technik.vokabulare.baustein_typ.includes('modus_baustein'));
pruefe('Spielformen sind NICHT typ-gefiltert: funplay im Beginner-Kompetenzpfad, mehrfeld im Fortgeschritten-Pfad',
  kompetenzpfad(daten, 'beginner').stationen.some((s) => s.baustein.id === 'funplay')
  && kompetenzpfad(daten, 'fortgeschritten').stationen.some((s) => s.baustein.id === 'mehrfeld'));
pruefe('Spielformen erscheinen an ihrer fachlichen Domäne im Themenpfad (technik/mentales)',
  themenpfad(daten, 'technik').stationen.some((s) => s.baustein.id === 'funplay')
  && themenpfad(daten, 'mentales').stationen.some((s) => s.baustein.id === 'mehrfeld'));
pruefe('Spielformen sind herkunftsneutral (kein Delta für irgendeine Herkunft)',
  spielformen2.every((b) => ['CM', 'BAD', 'TEN', 'SQ'].every((h) => deltaFuer(daten, b.id, h) === null)));
pruefe('Spielformen tragen genau einen Aufgabenteil (Struktur-Regel gilt wie sonst)',
  spielformen2.every((b) => hatUebungsteil(b) !== hatReflexionsaufgabe(b)));

// Trainings-Metadaten: Zuarbeit für den Trainingsplan an JEDEM Übungsbaustein.
const tmVokabular = technik.vokabulare.trainings_metadaten;
const uebungsBausteine = daten.bausteine.filter((b) => hatUebungsteil(b));
pruefe('Trainings-Metadaten-Vokabular ist kanonisch hinterlegt',
  Boolean(tmVokabular) && gleicheListe(tmVokabular.geeignete_phase, ['erwaermung', 'hauptteil', 'ausklang'])
  && gleicheListe(tmVokabular.dauer_klasse, ['kurz', 'mittel', 'lang']));
pruefe('alle 44 Übungsbausteine tragen die vier Trainings-Metadaten-Felder (43 Bestand + funplay)', uebungsBausteine.length === 44
  && uebungsBausteine.every((b) => Array.isArray(b.geeignete_phase) && b.dauer_klasse && b.intensitaet && Array.isArray(b.fokus)));
pruefe('Trainings-Metadaten sind vokabular-konform', uebungsBausteine.every((b) =>
  b.geeignete_phase.length > 0 && b.geeignete_phase.every((ph) => tmVokabular.geeignete_phase.includes(ph))
  && tmVokabular.dauer_klasse.includes(b.dauer_klasse)
  && tmVokabular.intensitaet.includes(b.intensitaet)
  && b.fokus.length > 0 && b.fokus.every((f) => tmVokabular.fokus.includes(f))));
pruefe('Reflexions-Bausteine tragen KEINE Trainings-Metadaten (nur Übungsteile sind planbar)',
  daten.bausteine.filter((b) => hatReflexionsaufgabe(b)).every((b) => b.dauer_klasse === undefined));

setzeZurueck();
console.log(`\n${laufend} Prüfungen, ${fehler} Fehler`);
process.exit(fehler === 0 ? 0 : 1);
