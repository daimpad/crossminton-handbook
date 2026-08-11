// KO-Turnier: ein Spaßturnier-Werkzeug, kein Lerninhalt (eigene Entität wie der
// Trainingsplan — kein Fortschritt, keine Baustein-Bindung). Namen eintragen,
// auslosen, pro Match den Sieger antippen — die App baut die nächste Runde
// automatisch auf, bis feststeht, wer gewonnen hat und wer wie weit kam.
//
// Setup-Phase (Namen sammeln) zeichnet lokal neu (wie js/ansichten/turnier.js),
// damit die Texteingabe beim Tippen den Fokus behält; die Bracket-Phase nutzt das
// globale neuRendern() wie der Rest der App (kein Routenwechsel → Scroll bleibt).

import { TEAM_TRENNER, bildePaare, erzeugeTurnier, istAbgeschlossen, mische, platzierungen, rundenName, turnierSpielform, teamName, traegtSiegerEin, turniersieger } from '../ko-turnier.js';
import { t } from '../i18n.js';
import { esc, heroKlein, neuRendern, zeigeToast } from '../oberflaeche.js';
import { koTurnier, loescheKoTurnier, setzeKoTurnier } from '../zustand.js';

// Entwurf der Teilnehmerliste vor dem Auslosen — bewusst Modul-State (wie
// turnier.js' aktiveStufe), nicht im Zustand: eine Zwischenablage, keine Daten.
let entwurfTitel = '';
let entwurfNamen = [];
let entwurfSpielform = 'einzel';
// Nur im Doppel wirksam: 'eintragen' = feste Teams, 'auslosen' = die App würfelt
// die Paare aus den einzeln eingetragenen Spieler:innen.
let entwurfPaarbildung = 'eintragen';

// Was steht in der Entwurfsliste — Personen oder fertige Teams? Der Unterschied
// entscheidet, ob ein Moduswechsel die Liste behalten darf: Einzel und
// „Partner auslosen" sammeln beide EINZELNE Namen, dazwischen bleibt alles
// stehen. Nur der Wechsel zu/von festen Teams ändert die Bedeutung jedes
// Eintrags — dort muss die Liste weichen.
function eintragsArt() {
  return entwurfSpielform === 'doppel' && entwurfPaarbildung === 'eintragen' ? 'team' : 'person';
}

const imDoppel = () => entwurfSpielform === 'doppel';
const lostPartnerAus = () => imDoppel() && entwurfPaarbildung === 'auslosen';

// Wie viele Teams entstehen aus dem aktuellen Entwurf?
function teamAnzahl() {
  if (!imDoppel()) return entwurfNamen.length;
  return entwurfPaarbildung === 'eintragen' ? entwurfNamen.length : Math.floor(entwurfNamen.length / 2);
}

// Beim Auslosen braucht es mindestens zwei Startplätze. Im Auslos-Modus zusätzlich
// eine GERADE Anzahl: sonst bliebe eine Person ohne Partner:in und stünde still
// draußen — das lieber vorher sagen, als sie stumm zu verschlucken.
function auslosbar() {
  if (lostPartnerAus()) return entwurfNamen.length >= 4 && entwurfNamen.length % 2 === 0;
  return entwurfNamen.length >= 2;
}

function wahlHtml(name, wert, aktiv, optionen) {
  return optionen
    .map(
      (o) => `
      <label class="option-karte">
        <input type="radio" name="${esc(name)}" value="${esc(o.wert)}" ${aktiv === o.wert ? 'checked' : ''}>
        <span class="option-inhalt"><strong>${esc(o.titel)}</strong><span class="leise">${esc(o.hinweis)}</span></span>
      </label>`,
    )
    .join('');
}

// Eingabefeld(er) je Modus: ein Namensfeld für Einzel und Auslosung, zwei
// nebeneinander für ein festes Team.
function eingabeHtml() {
  if (eintragsArt() === 'team') {
    return `
      <div class="ko-namen-eingabe ko-team-eingabe">
        <label class="plan-feld"><span>${esc(t('ko_turnier_spieler_1'))}</span>
          <input type="text" id="ko-name-eingabe" maxlength="40" placeholder="${esc(t('ko_turnier_teilnehmer_platzhalter'))}" autocomplete="off"></label>
        <label class="plan-feld"><span>${esc(t('ko_turnier_spieler_2'))}</span>
          <input type="text" id="ko-name-eingabe-2" maxlength="40" placeholder="${esc(t('ko_turnier_teilnehmer_platzhalter'))}" autocomplete="off"></label>
        <button type="submit" class="knopf knopf-sekundaer">${esc(t('hinzufuegen'))}</button>
      </div>`;
  }
  const beschriftung = lostPartnerAus() ? t('ko_turnier_spieler_label') : t('ko_turnier_teilnehmer_label');
  return `
    <div class="ko-namen-eingabe">
      <label class="plan-feld" style="flex:1"><span>${esc(beschriftung)}</span>
        <input type="text" id="ko-name-eingabe" maxlength="40" placeholder="${esc(t('ko_turnier_teilnehmer_platzhalter'))}" autocomplete="off"></label>
      <button type="submit" class="knopf knopf-sekundaer">${esc(t('hinzufuegen'))}</button>
    </div>`;
}

// Zähler unter der Liste — und im Auslos-Modus der Hinweis auf die ungerade Zahl,
// solange er zutrifft.
function bilanzHtml() {
  if (!imDoppel()) return `<p class="leise">${esc(t('ko_turnier_anzahl', { n: entwurfNamen.length }))}</p>`;
  if (entwurfPaarbildung === 'eintragen') {
    return `<p class="leise">${esc(t('ko_turnier_team_anzahl', { n: entwurfNamen.length }))}</p>`;
  }
  const ungerade = entwurfNamen.length % 2 === 1;
  return `
    <p class="leise">${esc(t('ko_turnier_spieler_anzahl', { n: entwurfNamen.length, m: teamAnzahl() }))}</p>
    ${ungerade ? `<p class="ko-hinweis">${esc(t('ko_turnier_ungerade'))}</p>` : ''}`;
}

function leerTextSchluessel() {
  if (eintragsArt() === 'team') return 'ko_turnier_noch_keine_teams';
  return lostPartnerAus() ? 'ko_turnier_noch_keine_spieler' : 'ko_turnier_noch_keine';
}

function setupHtml() {
  const chips = entwurfNamen
    .map(
      (name, i) => `
      <span class="ko-chip">
        ${esc(name)}
        <button type="button" class="ko-chip-entfernen" data-entfernen-namen="${i}" aria-label="${esc(t('ko_turnier_namen_entfernen', { name }))}">
          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </span>`,
    )
    .join('');
  return `
    <form class="karte ko-setup" id="ko-setup-form">
      <h2>${esc(t('ko_turnier_neues'))}</h2>
      <p class="leise">${esc(t('ko_turnier_intro'))}</p>
      <label class="plan-feld"><span>${esc(t('ko_turnier_name_label'))}</span>
        <input type="text" id="ko-titel" maxlength="60" placeholder="${esc(t('ko_turnier_name_platzhalter'))}" value="${esc(entwurfTitel)}"></label>
      <fieldset class="ko-wahl">
        <legend>${esc(t('ko_turnier_spielform'))}</legend>
        ${wahlHtml('ko-spielform', 'spielform', entwurfSpielform, [
          { wert: 'einzel', titel: t('ko_turnier_einzel'), hinweis: t('ko_turnier_einzel_hinweis') },
          { wert: 'doppel', titel: t('ko_turnier_doppel'), hinweis: t('ko_turnier_doppel_hinweis') },
        ])}
      </fieldset>
      ${
        imDoppel()
          ? `<fieldset class="ko-wahl">
        <legend>${esc(t('ko_turnier_paare'))}</legend>
        ${wahlHtml('ko-paarbildung', 'paarbildung', entwurfPaarbildung, [
          { wert: 'eintragen', titel: t('ko_turnier_paare_eintragen'), hinweis: t('ko_turnier_paare_eintragen_hinweis') },
          { wert: 'auslosen', titel: t('ko_turnier_paare_auslosen'), hinweis: t('ko_turnier_paare_auslosen_hinweis') },
        ])}
      </fieldset>`
          : ''
      }
      ${eingabeHtml()}
      ${chips ? `<div class="ko-chip-zeile">${chips}</div>` : `<p class="leise">${esc(t(leerTextSchluessel()))}</p>`}
      ${bilanzHtml()}
      <div class="knopf-zeile" style="justify-content:flex-start">
        <button type="button" class="knopf knopf-primaer" id="ko-auslosen" ${auslosbar() ? '' : 'disabled'}>
          <i class="fa-solid fa-right-left" aria-hidden="true"></i> ${esc(t('ko_turnier_auslosen'))}
        </button>
      </div>
    </form>`;
}

function zeichneSetup(el, fokusNachAdd = false) {
  el.innerHTML = `
    ${heroKlein('fa-flag-checkered', t('ko_turnier_titel'), t('ko_turnier_untertitel'), 'pf-indigo')}
    ${setupHtml()}`;

  el.querySelector('#ko-titel')?.addEventListener('input', (ereignis) => {
    entwurfTitel = ereignis.target.value;
  });

  // Alle Personennamen, die schon vergeben sind. Im Team-Modus steckt in einem
  // Eintrag ein ganzes Paar — geprüft wird trotzdem je Person, sonst könnte
  // dieselbe Person in zwei Teams stehen und im Bracket gegen sich selbst spielen.
  const vergebeneNamen = () =>
    new Set(
      entwurfNamen.flatMap((eintrag) =>
        eintrag.split(TEAM_TRENNER).map((teil) => teil.trim().toLowerCase()),
      ),
    );

  const hinzufuegen = () => {
    const feld = el.querySelector('#ko-name-eingabe');
    const wert = feld.value.trim();
    if (eintragsArt() === 'team') {
      const feld2 = el.querySelector('#ko-name-eingabe-2');
      const wert2 = feld2.value.trim();
      if (!wert || !wert2) {
        zeigeToast(t('ko_turnier_team_unvollstaendig'));
        return;
      }
      if (wert.toLowerCase() === wert2.toLowerCase()) {
        zeigeToast(t('ko_turnier_team_gleich'));
        return;
      }
      const vergeben = vergebeneNamen();
      for (const name of [wert, wert2]) {
        if (vergeben.has(name.toLowerCase())) {
          zeigeToast(t('ko_turnier_spieler_schon_im_team', { name }));
          return;
        }
      }
      entwurfNamen.push(teamName(wert, wert2));
      zeichneSetup(el, true);
      return;
    }
    if (!wert) return;
    if (vergebeneNamen().has(wert.toLowerCase())) {
      zeigeToast(t('ko_turnier_bereits_vorhanden'));
      return;
    }
    entwurfNamen.push(wert);
    zeichneSetup(el, true);
  };
  el.querySelector('#ko-setup-form').addEventListener('submit', (ereignis) => {
    ereignis.preventDefault();
    hinzufuegen();
  });

  // Moduswechsel: die Liste bleibt stehen, solange sie dieselbe Art von Einträgen
  // meint (Einzel ↔ Partner auslosen sammeln beide einzelne Namen). Wechselt die
  // Bedeutung, wird sie geleert — und das wird gesagt, statt sie still zu kippen.
  const wechsle = (setzen) => {
    const vorher = eintragsArt();
    setzen();
    if (entwurfNamen.length && eintragsArt() !== vorher) {
      entwurfNamen = [];
      zeigeToast(t('ko_turnier_wechsel_geleert'));
    }
    zeichneSetup(el);
  };
  for (const eingabe of el.querySelectorAll('input[name="ko-spielform"]')) {
    eingabe.addEventListener('change', () =>
      wechsle(() => {
        entwurfSpielform = eingabe.value;
        // Wer im Einzel schon Namen gesammelt hat und auf Doppel wechselt, will
        // sie nicht verlieren. Im Auslos-Modus behalten sie ihre Bedeutung —
        // also den Modus mitnehmen statt die Eingabe wegzuwerfen. Nur bei leerer
        // Liste bleibt es bei der Vorgabe „feste Teams"; dort gibt es nichts zu
        // retten, und das explizite Eintragen ist der erwartbarere Einstieg.
        if (entwurfSpielform === 'doppel' && entwurfNamen.length) entwurfPaarbildung = 'auslosen';
      }),
    );
  }
  for (const eingabe of el.querySelectorAll('input[name="ko-paarbildung"]')) {
    eingabe.addEventListener('change', () => wechsle(() => { entwurfPaarbildung = eingabe.value; }));
  }

  for (const knopf of el.querySelectorAll('[data-entfernen-namen]')) {
    knopf.addEventListener('click', () => {
      entwurfNamen.splice(Number(knopf.dataset.entfernenNamen), 1);
      // Mit Fokus-Flag neu zeichnen: innerHTML ersetzt den geklickten Knopf, sonst
      // fällt der Fokus auf <body> und Tastaturnutzende verlieren die Stelle.
      zeichneSetup(el, true);
    });
  }

  el.querySelector('#ko-auslosen')?.addEventListener('click', () => {
    // Erst mischen (Auslosung), dann im Auslos-Modus daraus die Paare bilden —
    // die Zufälligkeit steckt schon in der Reihenfolge, bildePaare würfelt nicht
    // ein zweites Mal. Feste Teams werden als Ganzes gemischt.
    const gemischt = mische(entwurfNamen);
    const startplaetze = lostPartnerAus() ? bildePaare(gemischt).teams : gemischt;
    setzeKoTurnier(erzeugeTurnier(entwurfTitel, startplaetze, entwurfSpielform));
    entwurfTitel = '';
    entwurfNamen = [];
    neuRendern();
  });

  if (fokusNachAdd) el.querySelector('#ko-name-eingabe')?.focus();
}

// Im Doppel gewinnt ein Team, keine Einzelperson — die Beschriftungen ziehen
// mit, die Mechanik nicht (für das Bracket ist beides derselbe Teilnehmer).
const championSchluessel = (doppel) => (doppel ? 'ko_turnier_champion_team' : 'ko_turnier_champion');

function championBannerHtml(name, doppel) {
  return `
    <div class="karte ko-champion-banner">
      <p class="ko-champion-zeichen" aria-hidden="true"><i class="fa-solid fa-medal"></i></p>
      <h2>${esc(t(championSchluessel(doppel)))}</h2>
      <p class="ko-champion-name">${esc(name)}</p>
    </div>`;
}

// Rundenbezeichnung: Bracket-übliche Namen (Finale/Halbfinale/…) aus der Engine,
// generischer Fallback „Runde N" für frühe/große Runden ohne besonderen Namen.
function rundenTitel(matchAnzahl, rundenIndex) {
  const schluessel = rundenName(matchAnzahl);
  return schluessel ? t(`ko_turnier_${schluessel}`) : t('ko_turnier_runde_n', { n: rundenIndex + 1 });
}

// Platzierungs-Übersicht: gruppiert die (bereits nach bester Platzierung sortierte)
// Liste aus der Engine unter Rundenbezeichnungen — „wer ist wie weit gekommen".
function platzierungHtml(turnier, doppel) {
  const plaetze = platzierungen(turnier);
  const abgeschlossen = istAbgeschlossen(turnier);
  const gruppen = [];
  for (const p of plaetze) {
    const letzte = gruppen[gruppen.length - 1];
    if (letzte && letzte.schluessel === p.ausgeschiedenInRunde) letzte.namen.push(p.name);
    else gruppen.push({ schluessel: p.ausgeschiedenInRunde, namen: [p.name] });
  }
  const zeilen = gruppen
    .map((g) => {
      let titel;
      if (g.schluessel === null) titel = abgeschlossen ? t(championSchluessel(doppel)) : t('ko_turnier_noch_dabei');
      else titel = rundenTitel(turnier.runden[g.schluessel].length, g.schluessel);
      return `<li class="ko-platz"><span class="ko-platz-titel">${esc(titel)}</span><span class="ko-platz-namen">${g.namen.map(esc).join(', ')}</span></li>`;
    })
    .join('');
  return `
    <section class="karte ko-platzierung">
      <h2>${esc(t('ko_turnier_stand'))}</h2>
      <ul class="ko-platz-liste">${zeilen}</ul>
    </section>`;
}

function matchHtml(rundenIndex, matchIndex, match, doppel) {
  if (match.b === null) {
    return `
      <div class="ko-match ko-match-freilos">
        <span class="ko-match-seite ko-match-sieger">${esc(match.a)}</span>
        <span class="chip">${esc(t('ko_turnier_freilos'))}</span>
      </div>`;
  }
  const seite = (name) => {
    const istSieger = match.sieger === name;
    const istVerlierer = Boolean(match.sieger) && !istSieger;
    const klassen = ['ko-match-seite'];
    if (istSieger) klassen.push('ko-match-sieger');
    if (istVerlierer) klassen.push('ko-match-verlierer');
    return `
      <button type="button" class="${klassen.join(' ')}" data-ko-sieger="${esc(name)}" data-runde="${rundenIndex}" data-match="${matchIndex}"
        aria-pressed="${istSieger}" aria-label="${esc(t(doppel ? 'ko_turnier_als_sieger_team' : 'ko_turnier_als_sieger', { name }))}">
        ${istSieger ? '<i class="fa-solid fa-check" aria-hidden="true"></i> ' : ''}${esc(name)}
      </button>`;
  };
  return `
    <div class="ko-match">
      ${seite(match.a)}
      <span class="ko-match-gegen" aria-hidden="true">${esc(t('ko_turnier_gegen'))}</span>
      ${seite(match.b)}
    </div>`;
}

function bracketHtml(turnier, doppel) {
  return turnier.runden
    .map(
      (runde, ri) => `
      <section class="ko-runde">
        <h3>${esc(rundenTitel(runde.length, ri))}</h3>
        <div class="ko-matches">${runde.map((m, mi) => matchHtml(ri, mi, m, doppel)).join('')}</div>
      </section>`,
    )
    .join('');
}

function zeichneBracket(el, turnier) {
  const abgeschlossen = istAbgeschlossen(turnier);
  const champion = turniersieger(turnier);
  // Ein gespeichertes Turnier von vor dem Doppel trägt kein spielform-Feld —
  // turnierSpielform() liest es als Einzel, ohne Migration.
  const doppel = turnierSpielform(turnier) === 'doppel';
  const untertitel = doppel
    ? t('ko_turnier_teams_anzahl', { n: turnier.teilnehmer.length })
    : t('ko_turnier_teilnehmer_anzahl', { n: turnier.teilnehmer.length });
  el.innerHTML = `
    ${heroKlein('fa-flag-checkered', turnier.titel || t('ko_turnier_titel'), untertitel, 'pf-indigo')}
    ${abgeschlossen ? championBannerHtml(champion, doppel) : ''}
    ${platzierungHtml(turnier, doppel)}
    <div class="ko-bracket">${bracketHtml(turnier, doppel)}</div>
    <div class="knopf-zeile" style="justify-content:flex-start">
      <button type="button" class="knopf knopf-leise" id="ko-neu">
        <i class="fa-solid fa-arrow-rotate-left" aria-hidden="true"></i> ${esc(t('ko_turnier_neu_starten'))}
      </button>
    </div>`;

  for (const knopf of el.querySelectorAll('[data-ko-sieger]')) {
    knopf.addEventListener('click', () => {
      const rundenIndex = Number(knopf.dataset.runde);
      const matchIndex = Number(knopf.dataset.match);
      const neuerSieger = knopf.dataset.koSieger;
      const aktuellesMatch = turnier.runden[rundenIndex][matchIndex];
      const gibtFolgerunden = rundenIndex < turnier.runden.length - 1;
      if (aktuellesMatch.sieger && aktuellesMatch.sieger !== neuerSieger && gibtFolgerunden) {
        if (!window.confirm(t('ko_turnier_sieger_aendern_bestaetigen'))) return;
      }
      setzeKoTurnier(traegtSiegerEin(turnier, rundenIndex, matchIndex, neuerSieger));
      neuRendern();
    });
  }

  el.querySelector('#ko-neu')?.addEventListener('click', () => {
    if (!window.confirm(t('ko_turnier_neu_bestaetigen'))) return;
    loescheKoTurnier();
    entwurfTitel = '';
    entwurfNamen = [];
    neuRendern();
  });
}

export function renderKoTurnier(el) {
  const turnier = koTurnier();
  if (!turnier) zeichneSetup(el);
  else zeichneBracket(el, turnier);
}
