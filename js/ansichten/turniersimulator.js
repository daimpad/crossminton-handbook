// Turniersimulator: ein Planungswerkzeug für Turnierleitungen, kein Lerninhalt
// (wie das KO-Turnier — kein Fortschritt, keine Baustein-Bindung). Regler und
// Zahlenfelder steuern die Engine js/turniersimulator.js; jede Änderung rechnet
// den ganzen Plan neu und zeichnet nur den Ergebnis-Bereich, damit der gerade
// bediente Regler Fokus und Position behält (dasselbe Muster wie suche.js).
//
// Das Szenario steht in der Adresse (?felder=8&modus=rr …), damit es sich als
// Link teilen lässt. Geschrieben wird verzögert über ersetzeQuery(): Browser
// drosseln replaceState bei schnellem Ziehen, und der Router muss die neue
// Adresse kennen, sonst hielte er das nächste rendern() für einen Seitenwechsel.

import { sprache, t } from '../i18n.js';
import { rundenName } from '../ko-turnier.js';
import { ANNAHMEN, GRENZEN, STANDARD, WARTEN_HINWEIS, ausQuery, erwarteteSaetze, simuliere, stundenMinuten, uhrzeit, zuQuery } from '../turniersimulator.js';
import { ersetzeQuery, esc, heroKlein, neuRendern, teileLink } from '../oberflaeche.js';

// Ab so vielen Matches zeichnet die Zeitleiste die Belegung je Feld statt jedes
// einzelnen Matches — tausende Balken wären weder lesbar noch flüssig.
const ZEITLEISTE_EINZELN_BIS = 1200;
// Die Ablauf-Tabelle ist die Text-Alternative zur Zeitleiste; bei sehr großen
// Turnieren genügen die ersten Einträge.
const ABLAUF_ZEILEN = 300;
// Mindestbreite einer Zeitleisten-Spur in Pixeln (css/app.css: .ts-gantt 34rem
// minus 4,6rem Feldname). Darunter scrollt die Zeitleiste waagerecht.
const SPUR_MIN_PX = 470;

// Modul-Zustand: das aktuelle Szenario und die verzögerten Aufgaben. Kein Zustand
// im localStorage — das Szenario lebt in der Adresse.
let einstellungen = { ...STANDARD };
let schreibZeitgeber = null;
let ansageZeitgeber = null;
let rechenAnfrage = 0;
let letztesErgebnis = null;
const offeneAbschnitte = {};

const zahlFormat = () => new Intl.NumberFormat(sprache(), { maximumFractionDigits: 1 });
const prozentFormat = () => new Intl.NumberFormat(sprache(), { style: 'percent', maximumFractionDigits: 0 });

function dauerText(minuten) {
  const { h, m } = stundenMinuten(minuten);
  return h > 0 ? t('ts_dauer_hm', { h, m: String(m).padStart(2, '0') }) : t('ts_dauer_m', { m });
}

function uhrText(minuten) {
  const { text, tag } = uhrzeit(einstellungen.start, minuten);
  return tag > 0 ? t('ts_uhr_tag', { uhr: text, n: tag + 1 }) : text;
}

function konkurrenzName(id) {
  return t(`ts_konkurrenz_${id}`);
}

// Gruppen heißen wie auf jedem Turnierplan A, B, C … und nach Z weiter mit AA,
// AB — bei 128 Einträgen in Dreiergruppen sind es 42.
function gruppenBuchstabe(nr) {
  let text = '';
  for (let n = nr + 1; n > 0; n = Math.floor((n - 1) / 26)) text = String.fromCharCode(65 + ((n - 1) % 26)) + text;
  return text;
}

function rundenTitel(eintrag) {
  if (eintrag.phase === 'gruppe') return t('ts_gruppe_runde', { g: gruppenBuchstabe(eintrag.gruppeNr), n: eintrag.runde + 1 });
  if (eintrag.rundenGroesse) {
    const schluessel = rundenName(eintrag.rundenGroesse);
    if (schluessel) return t(`ko_turnier_${schluessel}`);
  }
  // Nach einer Gruppenphase hieße „Runde 1" zweierlei — dort ist es die K.-o.-Runde.
  if (einstellungen.modus === 'gruppen') return t('ts_ko_runde_n', { n: eintrag.runde + 1 });
  return t('ko_turnier_runde_n', { n: eintrag.runde + 1 });
}

function rundenKurz(eintrag) {
  if (eintrag.phase === 'gruppe') return gruppenBuchstabe(eintrag.gruppeNr);
  if (eintrag.rundenGroesse) {
    const schluessel = rundenName(eintrag.rundenGroesse);
    if (schluessel) return t(`ts_${schluessel}_kurz`);
  }
  return t('ts_runde_kurz', { n: eintrag.runde + 1 });
}

// ---------- Steuerung ----------

function reglerHtml(name, beschriftung, { einheit = '', hinweis = '' } = {}) {
  const g = GRENZEN[name];
  const wert = einstellungen[name];
  // Das Zahlenfeld nennt die Einheit mit („Spielzeit je Match min"), sonst
  // hörte man nur die nackte Zahl.
  const beschriftetVon = einheit ? `ts-${name}-titel ts-${name}-einheit` : `ts-${name}-titel`;
  return `
    <div class="ts-regler">
      <label class="ts-regler-titel" id="ts-${esc(name)}-titel" for="ts-${esc(name)}">${esc(beschriftung)}</label>
      <div class="ts-regler-zeile">
        <input type="range" id="ts-${esc(name)}" data-regler="${esc(name)}" min="${esc(g.min)}" max="${esc(g.max)}" step="${esc(g.schritt)}" value="${esc(wert)}"${einheit ? ` data-einheit="${esc(einheit)}"` : ''}>
        <input type="number" class="ts-zahl" data-zahl="${esc(name)}" min="${esc(g.min)}" max="${esc(g.max)}" step="${esc(g.schritt)}" value="${esc(wert)}" inputmode="numeric" aria-labelledby="${esc(beschriftetVon)}">
        ${einheit ? `<span class="ts-einheit" id="ts-${esc(name)}-einheit">${esc(einheit)}</span>` : ''}
      </div>
      ${hinweis ? `<p class="ts-feldhinweis">${esc(hinweis)}</p>` : ''}
    </div>`;
}

function segmentHtml(name, legende, optionen) {
  const aktiv = einstellungen[name];
  const knoepfe = optionen
    .map(
      (o) => `
        <label class="ts-segment-option" data-option="${esc(o.wert)}">
          <input type="radio" name="ts-${esc(name)}" data-wahl="${esc(name)}" value="${esc(o.wert)}" ${aktiv === o.wert ? 'checked' : ''}>
          <span>${esc(o.titel)}</span>
        </label>`,
    )
    .join('');
  return `
    <fieldset class="ts-segment" data-gruppe="${esc(name)}">
      <legend>${esc(legende)}</legend>
      <div class="ts-segment-reihe">${knoepfe}</div>
      <p class="ts-feldhinweis" data-hinweis="${esc(name)}"></p>
    </fieldset>`;
}

// Hinweistexte unter den Auswahl-Gruppen: erklären die GEWÄHLTE Option.
const HINWEISE = {
  wertung: (w) => t(`ts_wertung_${w}_hinweis`),
  modus: (w) => t(`ts_modus_${w}_hinweis`),
  satz: (w) => t(w === 'zeit' ? 'ts_zeitspiel_hinweis' : 'ts_nach_punkten_hinweis'),
  saetze: (w) => t(`ts_saetze_${w}_hinweis`),
};

function hallenzeitText() {
  return t('ts_hallenzeit_wert', { dauer: dauerText(einstellungen.halle), uhr: uhrText(einstellungen.halle) });
}

function formularHtml() {
  const e = einstellungen;
  return `
    <form class="karte ts-eingaben" id="ts-form" novalidate>
      <div class="ts-live" id="ts-live" aria-hidden="true"></div>

      <h2 class="karte-titel">${esc(t('ts_gruppe_teilnehmende'))}</h2>
      ${reglerHtml('felder', t('ts_felder'))}
      ${segmentHtml('form', t('ts_spielform'), [
        { wert: 'einzel', titel: t('ts_einzel') },
        { wert: 'doppel', titel: t('ts_doppel') },
      ])}
      <div class="ts-paar">
        ${reglerHtml('maenner', t('ts_maenner'))}
        ${reglerHtml('frauen', t('ts_frauen'))}
      </div>
      <p class="ts-bilanz" id="ts-bilanz"></p>
      ${segmentHtml('wertung', t('ts_wertung'), [
        { wert: 'getrennt', titel: t('ts_wertung_getrennt') },
        { wert: 'offen', titel: t('ts_wertung_offen') },
        { wert: 'mixed', titel: t('ts_wertung_mixed') },
      ])}

      <h2 class="karte-titel">${esc(t('ts_gruppe_modus'))}</h2>
      ${segmentHtml('modus', t('ts_modus'), [
        { wert: 'rr', titel: t('ts_modus_rr') },
        { wert: 'gruppen', titel: t('ts_modus_gruppen') },
        { wert: 'ko', titel: t('ts_modus_ko') },
      ])}
      <div data-nur-modus="gruppen">
        ${reglerHtml('gruppe', t('ts_gruppengroesse'), { hinweis: t('ts_gruppengroesse_hinweis') })}
      </div>
      ${segmentHtml('satz', t('ts_begrenzung'), [
        { wert: 'punkte', titel: t('ts_nach_punkten') },
        { wert: 'zeit', titel: t('ts_zeitspiel') },
      ])}
      <div data-nur-satz="punkte">
        ${segmentHtml('saetze', t('ts_gewinnsaetze'), [
          { wert: 1, titel: '1' },
          { wert: 2, titel: '2' },
          { wert: 3, titel: '3' },
        ])}
        ${reglerHtml('punkte', t('ts_punkte'))}
      </div>
      <div data-nur-satz="zeit">
        ${reglerHtml('minuten', t('ts_spielzeit'), { einheit: t('ts_einheit_min') })}
      </div>
      ${reglerHtml('puffer', t('ts_puffer'), { einheit: t('ts_einheit_min'), hinweis: t('ts_puffer_hinweis') })}
      <p class="ts-matchdauer" id="ts-matchdauer"></p>

      <h2 class="karte-titel">${esc(t('ts_gruppe_halle'))}</h2>
      <div class="ts-paar">
        <div class="ts-regler">
          <label class="ts-regler-titel" for="ts-start">${esc(t('ts_beginn'))}</label>
          <input type="time" id="ts-start" class="ts-uhr" value="${esc(e.start)}" step="300">
        </div>
        <div class="ts-regler">
          <label class="ts-regler-titel" for="ts-halle">${esc(t('ts_hallenzeit'))}</label>
          <div class="ts-regler-zeile">
            <input type="range" id="ts-halle" data-regler="halle" min="${esc(GRENZEN.halle.min)}" max="${esc(GRENZEN.halle.max)}" step="${esc(GRENZEN.halle.schritt)}" value="${esc(e.halle)}" aria-describedby="ts-halle-wert">
          </div>
          <output class="ts-feldhinweis" id="ts-halle-wert" for="ts-halle">${esc(hallenzeitText())}</output>
        </div>
      </div>

      <div class="knopf-zeile ts-aktionen">
        <button type="button" class="knopf knopf-sekundaer" id="ts-teilen"><i class="fa-solid fa-share-nodes" aria-hidden="true"></i> ${esc(t('ts_teilen'))}</button>
        <button type="button" class="knopf knopf-sekundaer" id="ts-drucken"><i class="fa-solid fa-print" aria-hidden="true"></i> ${esc(t('ts_drucken'))}</button>
        <button type="button" class="knopf knopf-leise" id="ts-zuruecksetzen"><i class="fa-solid fa-arrow-rotate-left" aria-hidden="true"></i> ${esc(t('ts_zuruecksetzen'))}</button>
      </div>
    </form>`;
}

// Sichtbarkeit und Hinweise der Steuerung an das Szenario anpassen, OHNE das
// Formular neu zu zeichnen (sonst verlöre der bediente Regler den Fokus).
function aktualisiereSteuerung(form) {
  const e = einstellungen;
  for (const gruppe of form.querySelectorAll('[data-nur-satz]')) gruppe.hidden = gruppe.dataset.nurSatz !== e.satz;
  for (const gruppe of form.querySelectorAll('[data-nur-modus]')) gruppe.hidden = gruppe.dataset.nurModus !== e.modus;
  const mixed = form.querySelector('[data-gruppe="wertung"] [data-option="mixed"]');
  if (mixed) mixed.hidden = e.form !== 'doppel';
  for (const radio of form.querySelectorAll('[data-wahl]')) radio.checked = String(e[radio.dataset.wahl]) === radio.value;
  for (const absatz of form.querySelectorAll('[data-hinweis]')) {
    const name = absatz.dataset.hinweis;
    absatz.textContent = HINWEISE[name] ? HINWEISE[name](e[name]) : '';
    absatz.hidden = !HINWEISE[name];
  }
  for (const regler of form.querySelectorAll('[data-regler]')) {
    regler.value = String(e[regler.dataset.regler]);
    // Ein Regler nennt sonst nur die nackte Zahl („8"), die Hallenzeit gar in
    // Minuten („360") — vorgelesen wird der Wert mit Einheit.
    const vorlesen = regler.dataset.regler === 'halle'
      ? dauerText(e.halle)
      : regler.dataset.einheit ? `${e[regler.dataset.regler]} ${regler.dataset.einheit}` : '';
    if (vorlesen) regler.setAttribute('aria-valuetext', vorlesen);
  }
  for (const feld of form.querySelectorAll('[data-zahl]')) {
    // Ein Feld, in das gerade getippt wird, nicht überschreiben — „1" auf dem
    // Weg zu „16" wäre sonst sofort auf das Minimum geklemmt.
    if (document.activeElement !== feld) feld.value = String(e[feld.dataset.zahl]);
  }
  // <output> ist eine Live-Region: nur schreiben, wenn sich der Text ändert —
  // sonst sagte der Screenreader die Hallenzeit bei jedem Schritt JEDES Reglers an.
  const halle = form.querySelector('#ts-halle-wert');
  const halleText = hallenzeitText();
  if (halle && halle.textContent !== halleText) halle.textContent = halleText;
  const start = form.querySelector('#ts-start');
  if (start && document.activeElement !== start && start.value !== e.start) start.value = e.start;
}

// ---------- Ergebnis ----------

function meldungenHtml(meldungen) {
  return meldungen.map(([farbe, icon, satz]) => `
      <div class="ts-meldung ts-meldung-${esc(farbe)}">
        <i class="fa-solid ${esc(icon)}" aria-hidden="true"></i><p>${esc(satz)}</p>
      </div>`).join('');
}

// Wer nicht mitspielt, und warum: auch im Leerzustand, denn genau dort erklärt
// es, weshalb noch kein Match entsteht (im Doppel zählen Paare, nicht Personen).
function teilnahmeHinweise(r) {
  const hinweise = [];
  if (r.uebrig > 0) hinweise.push(['gelb', 'fa-user-group', t('ts_uebrig_hinweis', { n: r.uebrig })]);
  for (const k of r.konkurrenzen) {
    if (k.eintraege === 1) hinweise.push(['gelb', 'fa-circle-info', t('ts_einzeln_hinweis', { konkurrenz: konkurrenzName(k.id) })]);
  }
  return hinweise;
}

function statusHtml(r) {
  if (r.matchZahl === 0) return meldungenHtml([['info', 'fa-circle-info', t('ts_leer')], ...teilnahmeHinweise(r)]);
  const e = r.einstellungen;
  const meldungen = [];
  if (r.passtInHalle) {
    const weniger = r.felderNoetig !== null && r.felderNoetig < e.felder ? ` ${t('ts_status_weniger_felder', { n: r.felderNoetig, m: e.felder })}` : '';
    meldungen.push(['gruen', 'fa-circle-check', t('ts_status_passt', { rest: dauerText(e.halle - r.gesamt.typ) }) + weniger]);
  } else {
    let rat;
    if (r.felderNoetig !== null) rat = t('ts_status_felder_noetig', { n: r.felderNoetig });
    // Warum auch die Höchstzahl an Feldern nicht reicht: schon ein einzelnes
    // Match ist länger als die Hallenzeit, oder die Kette eigener Spiele ist es,
    // oder es sind schlicht zu viele Matches. Nur der zutreffende Grund wird
    // genannt — beim einzelnen Match gibt es keine Kette, und das K.-o.-System
    // änderte nichts.
    else if (r.matchDauer.typ > e.halle) rat = t('ts_status_match_zu_lang');
    else rat = t(`ts_status_keine_feldzahl_${r.ketteZuLang ? '' : 'menge_'}${e.modus}`, { n: GRENZEN.felder.max });
    meldungen.push(['rot', 'fa-triangle-exclamation', `${t('ts_status_zu_lang', { dauer: dauerText(r.gesamt.typ), zuviel: dauerText(r.gesamt.typ - e.halle) })} ${rat}`]);
  }
  if (r.langesWarten) {
    const rat = r.felderFuerWarten !== null && r.felderFuerWarten > e.felder
      ? t('ts_warten_felder', { n: r.felderFuerWarten, mittel: dauerText(WARTEN_HINWEIS.mittel), laengste: dauerText(WARTEN_HINWEIS.laengste) })
      : t('ts_warten_ohne_felder');
    meldungen.push(['gelb', 'fa-hourglass-half', `${t('ts_warten', { mittel: dauerText(r.warten.mittel), laengste: dauerText(r.warten.laengste) })} ${rat}`]);
  }
  meldungen.push(...teilnahmeHinweise(r));
  const engpass = r.engpass
    ? `<p class="ts-engpass"><span class="chip">${esc(t(`ts_engpass_${r.engpass}`))}</span> ${esc(t(`ts_engpass_${r.engpass}_text`))}</p>`
    : '';
  return `${meldungenHtml(meldungen)}${engpass}`;
}

function kennzahl(icon, titel, wert, zeilen, extra = '') {
  return `
    <div class="ts-kpi">
      <p class="ts-kpi-titel"><i class="fa-solid ${esc(icon)}" aria-hidden="true"></i> ${esc(titel)}</p>
      <p class="ts-kpi-wert">${esc(wert)}</p>
      ${extra}
      ${zeilen.filter(Boolean).map((z) => `<p class="ts-kpi-text">${esc(z)}</p>`).join('')}
    </div>`;
}

function kennzahlenHtml(r) {
  const e = r.einstellungen;
  const zahl = zahlFormat();
  const leer = r.matchZahl === 0;
  const spanne = r.gesamt.schnell !== null && !leer
    ? t('ts_kpi_spanne', { von: dauerText(r.gesamt.schnell), bis: dauerText(r.gesamt.langsam) })
    : '';
  const prozent = Math.round(r.auslastung * 100);
  const meter = `<div class="ts-meter" role="presentation"><span style="width:${esc(Math.min(100, prozent))}%"></span></div>`;
  const spiele = r.spieleJePerson;
  return `
    <div class="ts-kpis">
      ${kennzahl('fa-clock', t('ts_kpi_dauer'), leer ? '–' : dauerText(r.gesamt.typ), [leer ? '' : t('ts_kpi_ende', { uhr: uhrText(r.gesamt.typ) }), spanne])}
      ${kennzahl('fa-chart-gantt', t('ts_kpi_matches'), zahl.format(r.matchZahl), [leer ? '' : t('ts_kpi_matchdauer', { dauer: dauerText(r.matchDauer.typ) })])}
      ${kennzahl('fa-gauge-high', t('ts_kpi_auslastung'), leer ? '–' : prozentFormat().format(r.auslastung), [t('ts_kpi_auslastung_text')], leer ? '' : meter)}
      ${kennzahl('fa-users', t('ts_kpi_spiele'), leer ? '–' : zahl.format(spiele.mittel), [
        leer ? '' : spiele.min === spiele.max ? t('ts_kpi_spiele_gleich') : t('ts_kpi_spiele_spanne', { min: zahl.format(spiele.min), max: zahl.format(spiele.max) }),
      ])}
      ${kennzahl('fa-hourglass-half', t('ts_kpi_warten'), leer ? '–' : dauerText(r.warten.mittel), [leer ? '' : t('ts_kpi_warten_text', { laengste: dauerText(r.warten.laengste) })])}
      ${kennzahl('fa-table-cells', t('ts_kpi_felder'), leer || r.felderNoetig === null ? '–' : zahl.format(r.felderNoetig), [
        leer ? '' : r.felderNoetig === null ? t('ts_kpi_felder_keine', { n: GRENZEN.felder.max }) : t('ts_kpi_felder_text', { n: e.felder }),
      ])}
    </div>`;
}

// Achsen-Schritt: so viele Beschriftungen, wie nebeneinander passen. Über
// Mitternacht hinaus trägt jede den Tag mit („09:00 (Tag 2)") und ist gut
// doppelt so breit — eine feste Höchstzahl ließ sie dann ineinanderlaufen.
// Gerechnet wird mit der Mindestbreite der Spur (dem Telefon); der Abstand
// zweier Marken muss anderthalb Beschriftungen fassen, weil die erste und die
// letzte bündig statt mittig sitzen.
const ACHSE_ZEICHEN_PX = 7;
const ACHSE_RAND_PX = 10;
function achsenSchritt(spanne) {
  const schritte = [15, 30, 60, 120, 180, 240, 360, 720, 1440, 2880, 7200, 14400, 43200];
  const breite = (m) => uhrText(m).length * ACHSE_ZEICHEN_PX + ACHSE_RAND_PX;
  const passt = (s) => {
    const stellen = Math.ceil(spanne / s);
    let breiteste = 0;
    for (let i = 0; i <= stellen; i++) breiteste = Math.max(breiteste, breite(i * s));
    return SPUR_MIN_PX / stellen >= breiteste * 1.5;
  };
  return schritte.find((s) => passt(s)) ?? Math.ceil(spanne / 2 / 1440) * 1440;
}

function zeitleisteHtml(r) {
  const e = r.einstellungen;
  if (r.matchZahl === 0) return '';
  const ende = Math.max(r.gesamt.typ, e.halle);
  const schritt = achsenSchritt(ende);
  const spanne = Math.ceil(ende / schritt) * schritt;
  const pos = (minuten) => (minuten / spanne) * 100;
  const prozent = (x) => `${x.toFixed(3)}%`;

  const achse = [];
  for (let m = 0; m <= spanne; m += schritt) {
    achse.push(`<span class="ts-achse-marke" style="left:${esc(prozent(pos(m)))}">${esc(uhrText(m))}</span>`);
  }

  const zusammengefasst = r.matchZahl > ZEITLEISTE_EINZELN_BIS;
  const zeilen = [];
  for (let f = 0; f < e.felder; f++) {
    const eigene = r.ablauf.filter((a) => a.feld === f);
    let balken;
    if (zusammengefasst) {
      // Belegung je Feld: Matches mit nur der Wechselzeit dazwischen verschmelzen.
      const bloecke = [];
      for (const a of eigene) {
        const letzter = bloecke[bloecke.length - 1];
        if (letzter && a.start - letzter.ende <= e.puffer + 0.01) letzter.ende = a.ende;
        else bloecke.push({ start: a.start, ende: a.ende });
      }
      balken = bloecke.map((b) => {
        const ueber = b.ende > e.halle + 0.01 ? ' ts-ueber' : '';
        return `<span class="ts-balken ts-balken-belegt${esc(ueber)}" style="left:${esc(prozent(pos(b.start)))};width:${esc(prozent(pos(b.ende - b.start)))}" title="${esc(uhrText(b.start) + '–' + uhrText(b.ende))}"></span>`;
      });
    } else {
      balken = eigene.map((a) => {
        const breite = pos(a.ende - a.start);
        // Beschriftung nur, wo sie bei der Mindestbreite der Spur passt.
        const platz = (breite / 100) * SPUR_MIN_PX >= 26;
        const ueber = a.ende > e.halle + 0.01 ? ' ts-ueber' : '';
        const titel = t('ts_balken_titel', { konkurrenz: konkurrenzName(a.konkurrenz), runde: rundenTitel(a), von: uhrText(a.start), bis: uhrText(a.ende) });
        return `<span class="ts-balken ts-art-${esc(a.art)}${esc(ueber)}" style="left:${esc(prozent(pos(a.start)))};width:${esc(prozent(breite))}" title="${esc(titel)}">${platz ? esc(rundenKurz(a)) : ''}</span>`;
      });
    }
    zeilen.push(`
      <div class="ts-zeile">
        <span class="ts-zeile-name">${esc(t('ts_feld', { n: f + 1 }))}</span>
        <div class="ts-spur">${balken.join('')}</div>
      </div>`);
  }

  const halleLinks = pos(e.halle);
  // Die Beschriftung steht rechts der Linie, wenn sie dort in die Spur passt,
  // sonst links. Ein fester Prozentwert reichte nicht: über Mitternacht und auf
  // Französisch ist sie gut doppelt so breit („Fin du créneau 02:15 (jour 2)").
  // Geschätzt wie die Achsen-Beschriftung, an der Mindestbreite der Spur.
  const halleText = t('ts_hallenende', { uhr: uhrText(e.halle) });
  const halleBreite = halleText.length * ACHSE_ZEICHEN_PX + ACHSE_RAND_PX;
  const halleLinksDavon = ((100 - halleLinks) / 100) * SPUR_MIN_PX < halleBreite;
  const ueberzeit = e.halle < spanne
    ? `<div class="ts-ueberzeit${r.passtInHalle ? '' : ' ts-ueberzeit-aktiv'}${halleLinksDavon ? ' ts-hallenende-links' : ''}" style="left:${esc(prozent(halleLinks))}">
        <span class="ts-hallenende">${esc(halleText)}</span>
      </div>`
    : '';

  const arten = [...new Set(r.konkurrenzen.filter((k) => k.matches > 0).map((k) => k.id))];
  const legende = zusammengefasst
    ? `<p class="ts-feldhinweis">${esc(t('ts_zeitleiste_zusammen'))}</p>`
    : `<div class="chip-zeile ts-legende">
        ${arten.map((id) => {
          const art = r.konkurrenzen.find((k) => k.id === id).art;
          return `<span class="chip"><span class="ts-legende-farbe ts-art-${esc(art)}" aria-hidden="true"></span>${esc(konkurrenzName(id))}</span>`;
        }).join('')}
        ${r.passtInHalle ? '' : `<span class="chip"><span class="ts-legende-farbe ts-ueber-muster" aria-hidden="true"></span>${esc(t('ts_legende_ueber'))}</span>`}
      </div>`;

  return `
    <section class="karte ts-zeitleiste-karte">
      <h2 class="karte-titel"><i class="fa-solid fa-chart-gantt" aria-hidden="true"></i> ${esc(t('ts_zeitleiste'))}</h2>
      <p class="leise">${esc(t('ts_zeitleiste_text'))}</p>
      ${legende}
      <figure class="ts-zeitleiste">
        <figcaption class="nur-sr">${esc(t('ts_zeitleiste_alt', { matches: r.matchZahl, felder: e.felder, von: uhrText(0), bis: uhrText(r.gesamt.typ) }))}</figcaption>
        <div class="ts-gantt" aria-hidden="true">
          <div class="ts-zeile ts-achse-zeile">
            <span class="ts-zeile-name"></span>
            <div class="ts-achse">${achse.join('')}</div>
          </div>
          <div class="ts-zeilen">
            ${zeilen.join('')}
            <div class="ts-overlay">${ueberzeit}</div>
          </div>
        </div>
      </figure>
    </section>`;
}

function konkurrenzenHtml(r) {
  if (!r.konkurrenzen.length) return '';
  const zahl = zahlFormat();
  const doppel = r.einstellungen.form === 'doppel';
  return `
    <section class="karte">
      <h2 class="karte-titel"><i class="fa-solid fa-users" aria-hidden="true"></i> ${esc(t('ts_konkurrenzen'))}</h2>
      <ul class="ts-konkurrenzen">
        ${r.konkurrenzen.map((k) => `
          <li>
            <span class="ts-konkurrenz-name"><span class="ts-legende-farbe ts-art-${esc(k.art)}" aria-hidden="true"></span>${esc(konkurrenzName(k.id))}</span>
            <span class="chip-zeile">
              <span class="chip">${esc(t(doppel ? 'ts_eintraege_paare' : 'ts_eintraege_personen', { n: zahl.format(k.eintraege) }))}</span>
              ${k.gruppen ? `<span class="chip">${esc(t('ts_gruppen_n', { n: zahl.format(k.gruppen) }))}</span>` : ''}
              <span class="chip">${esc(t('ts_matches_n', { n: zahl.format(k.matches) }))}</span>
              <span class="chip">${esc(t('ts_runden_n', { n: zahl.format(k.runden) }))}</span>
            </span>
          </li>`).join('')}
      </ul>
    </section>`;
}

function ablaufHtml(r) {
  if (r.matchZahl === 0) return '';
  const zeilen = [...r.ablauf].sort((a, b) => a.start - b.start || a.feld - b.feld);
  const gezeigt = zeilen.slice(0, ABLAUF_ZEILEN);
  return `
    <details class="regel-abschnitt karte ts-ablauf" data-aufklapp="ablauf">
      <summary><h2>${esc(t('ts_ablauf'))}</h2></summary>
      ${zeilen.length > gezeigt.length ? `<p class="leise">${esc(t('ts_ablauf_gekuerzt', { n: gezeigt.length, m: zeilen.length }))}</p>` : ''}
      <div class="ts-tabelle-rahmen">
        <table class="ts-tabelle">
          <thead><tr>
            <th scope="col">${esc(t('ts_spalte_zeit'))}</th>
            <th scope="col">${esc(t('ts_spalte_feld'))}</th>
            <th scope="col">${esc(t('ts_spalte_konkurrenz'))}</th>
            <th scope="col">${esc(t('ts_spalte_runde'))}</th>
          </tr></thead>
          <tbody>
            ${gezeigt.map((a) => `
              <tr${a.ende > r.einstellungen.halle + 0.01 ? ' class="ts-zeile-ueber"' : ''}>
                <td>${esc(`${uhrText(a.start)}–${uhrText(a.ende)}`)}${a.ende > r.einstellungen.halle + 0.01 ? ` <span class="chip chip-rot ts-chip-ueber">${esc(t('ts_legende_ueber'))}</span>` : ''}</td>
                <td>${esc(t('ts_feld', { n: a.feld + 1 }))}</td>
                <td>${esc(konkurrenzName(a.konkurrenz))}</td>
                <td>${esc(rundenTitel(a))}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </details>`;
}

// Nur auf Papier: das Formular fehlt dort, also stehen die Einstellungen als
// Eckdaten oben, dazu der Link, mit dem sich das Szenario wieder öffnen lässt
// (beim Drucken nachgetragen, s. beforeprint).
function druckKopfHtml(r) {
  const e = r.einstellungen;
  const minuten = (n) => `${n} ${t('ts_einheit_min')}`;
  const zeilen = [
    [t('ts_felder'), e.felder],
    [t('ts_spielform'), t(e.form === 'doppel' ? 'ts_doppel' : 'ts_einzel')],
    [t('ts_maenner'), e.maenner],
    [t('ts_frauen'), e.frauen],
    [t('ts_wertung'), t(`ts_wertung_${e.wertung}`)],
    [t('ts_modus'), t(`ts_modus_${e.modus}`)],
    ...(e.modus === 'gruppen' ? [[t('ts_gruppengroesse'), e.gruppe]] : []),
    [t('ts_begrenzung'), t(e.satz === 'zeit' ? 'ts_zeitspiel' : 'ts_nach_punkten')],
    ...(e.satz === 'zeit'
      ? [[t('ts_spielzeit'), minuten(e.minuten)]]
      : [[t('ts_gewinnsaetze'), e.saetze], [t('ts_punkte'), e.punkte]]),
    [t('ts_puffer'), minuten(e.puffer)],
    [t('ts_beginn'), e.start],
    [t('ts_hallenzeit'), hallenzeitText()],
  ];
  return `
    <section class="karte ts-druck-kopf">
      <h2 class="karte-titel">${esc(t('ts_druck_eckdaten'))}</h2>
      <dl class="ts-druck-eckdaten">
        ${zeilen.map(([titel, wert]) => `<div><dt>${esc(titel)}</dt><dd>${esc(wert)}</dd></div>`).join('')}
      </dl>
      <p class="ts-druck-link">${esc(t('ts_druck_link'))}: <span data-druck-link>${esc(window.location.href)}</span></p>
    </section>`;
}

function annahmenHtml(r) {
  const e = r.einstellungen;
  const zahl = zahlFormat();
  const sek = ANNAHMEN.sekundenJePunkt;
  const prozent = prozentFormat();
  const absaetze = e.satz === 'zeit'
    ? [t('ts_annahmen_zeitspiel')]
    : [
        t('ts_annahmen_punkte', {
          typ: sek.typ, schnell: sek.schnell, langsam: sek.langsam,
          anteil: prozent.format(ANNAHMEN.verliererAnteil), punkte: e.punkte,
          satzpunkte: zahl.format(Math.round(e.punkte * (1 + ANNAHMEN.verliererAnteil))),
        }),
      ];
  // Bei einem Gewinnsatz gibt es genau einen Satz — da ist nichts zu erklären.
  if (e.satz !== 'zeit' && e.saetze > 1) {
    absaetze.push(t('ts_annahmen_saetze', { chance: prozent.format(ANNAHMEN.satzchanceFavorit), saetze: e.saetze, mittel: zahl.format(erwarteteSaetze(e.saetze)) }));
  }
  absaetze.push(t('ts_annahmen_planung'));
  if (e.modus === 'ko') absaetze.push(t('ts_annahmen_ko'));
  if (e.modus === 'gruppen') absaetze.push(t('ts_annahmen_gruppen'));
  return `
    <details class="regel-abschnitt karte ts-annahmen" data-aufklapp="annahmen">
      <summary><h2>${esc(t('ts_annahmen'))}</h2></summary>
      ${absaetze.map((a) => `<p>${esc(a)}</p>`).join('')}
    </details>`;
}

function liveHtml(r) {
  if (r.matchZahl === 0) return `<span>${esc(t('ts_live_leer'))}</span>`;
  const chip = r.passtInHalle
    ? `<span class="chip chip-gruen">${esc(t('ts_chip_passt'))}</span>`
    : `<span class="chip chip-rot">${esc(t('ts_chip_zu_lang'))}</span>`;
  return `
    <span class="ts-live-wert"><i class="fa-solid fa-clock" aria-hidden="true"></i> ${esc(dauerText(r.gesamt.typ))}</span>
    <span class="ts-live-wert">${esc(t('ts_matches_n', { n: zahlFormat().format(r.matchZahl) }))}</span>
    ${chip}`;
}

function bilanzText(r) {
  const zahl = zahlFormat();
  // Alle Eingetragenen, auch wer ohne Partner:in bleibt — die Summe soll zu den
  // beiden Reglern passen; wer übrig ist, steht gleich daneben.
  const teile = [t('ts_personen', { n: zahl.format(r.einstellungen.maenner + r.einstellungen.frauen) })];
  if (r.einstellungen.form === 'doppel') {
    const paare = r.konkurrenzen.reduce((s, k) => s + k.eintraege, 0);
    teile.push(t('ts_paare', { n: zahl.format(paare) }));
    if (r.uebrig) teile.push(t('ts_uebrig', { n: zahl.format(r.uebrig) }));
  }
  return teile.join(' · ');
}

function matchdauerText(r) {
  const d = r.matchDauer;
  if (r.einstellungen.satz === 'zeit') return t('ts_matchdauer', { dauer: dauerText(d.typ) });
  return t('ts_matchdauer_spanne', { dauer: dauerText(d.typ), von: dauerText(d.schnell), bis: dauerText(d.langsam) });
}

function ansageText(r) {
  if (r.matchZahl === 0) return t('ts_leer');
  const status = r.passtInHalle ? t('ts_chip_passt') : t('ts_chip_zu_lang');
  return t('ts_ansage', { dauer: dauerText(r.gesamt.typ), n: r.matchZahl, status });
}

// Rechnen und den Ergebnis-Bereich zeichnen. Läuft höchstens einmal je Frame —
// ein gezogener Regler feuert sonst dutzende input-Ereignisse pro Sekunde.
function zeichneErgebnis(el) {
  const r = simuliere(einstellungen);
  letztesErgebnis = r;
  const ziel = el.querySelector('#ts-ergebnis');
  if (ziel) {
    // Aufgeklappte Abschnitte bleiben offen — wer die Ablauf-Tabelle liest und
    // dabei einen Regler zieht, soll sie nicht jedes Mal neu öffnen müssen.
    for (const d of ziel.querySelectorAll('details[data-aufklapp]')) offeneAbschnitte[d.dataset.aufklapp] = d.open;
    ziel.innerHTML = `${druckKopfHtml(r)}${statusHtml(r)}${kennzahlenHtml(r)}${zeitleisteHtml(r)}${konkurrenzenHtml(r)}${ablaufHtml(r)}${annahmenHtml(r)}`;
    for (const d of ziel.querySelectorAll('details[data-aufklapp]')) d.open = Boolean(offeneAbschnitte[d.dataset.aufklapp]);
  }
  const live = el.querySelector('#ts-live');
  if (live) live.innerHTML = liveHtml(r);
  const bilanz = el.querySelector('#ts-bilanz');
  if (bilanz) bilanz.textContent = bilanzText(r);
  const matchdauer = el.querySelector('#ts-matchdauer');
  if (matchdauer) matchdauer.textContent = r.matchZahl || r.konkurrenzen.length ? matchdauerText(r) : '';
}

function planeNeuberechnung(el) {
  if (rechenAnfrage) return;
  rechenAnfrage = requestAnimationFrame(() => {
    rechenAnfrage = 0;
    zeichneErgebnis(el);
    planeAnsage(el);
  });
  planeAdresse();
}

function planeAdresse() {
  clearTimeout(schreibZeitgeber);
  schreibZeitgeber = setTimeout(schreibeAdresse, 400);
}

// Die Query gehört nicht dem Simulator allein: ?feedback (Kommentator) und
// fremde Parameter bleiben stehen, ersetzt werden nur die eigenen Schlüssel.
// Fremde Teile wandern unverändert mit — URLSearchParams schriebe „feedback"
// als „feedback=" und kodierte fremde Werte um.
const EIGENE_SCHLUESSEL = new Set(Object.keys(STANDARD));
function queryMitSzenario(szenario) {
  const schluesselVon = (teil) => {
    try {
      return decodeURIComponent(teil.split('=')[0].replace(/\+/g, ' '));
    } catch {
      return null; // kaputt kodiert: kein eigener Schlüssel, bleibt stehen
    }
  };
  const fremde = window.location.search.replace(/^\?/, '').split('&')
    .filter((teil) => teil && !EIGENE_SCHLUESSEL.has(schluesselVon(teil)));
  return [...fremde, ...(szenario ? [szenario] : [])].join('&');
}

// Steht der Simulator (noch) in der Adresse? Geprüft wird das Pfadsegment, nicht
// das Pfadende: ausgeliefert wird die Seite auch als „/turniersimulator/" (das
// Verzeichnis ihres Snapshots, auf GitHub Pages nach einer 301), und dort schrieb
// ein Vergleich auf das Ende nie — der geteilte Link trug den alten Stand, ein
// Sprachwechsel nahm jede Änderung zurück.
function simulatorInAdresse() {
  return window.location.pathname.split('/').includes('turniersimulator');
}

function schreibeAdresse() {
  clearTimeout(schreibZeitgeber);
  schreibZeitgeber = null;
  // Wer kurz nach dem Ziehen die Seite wechselt, darf das Szenario nicht an die
  // Adresse der neuen Seite gehängt bekommen — auch nicht, während ein
  // Sprachwechsel noch lädt und das alte Formular schon unter der neuen
  // Adresse steht.
  if (!document.getElementById('ts-form') || !simulatorInAdresse()) return;
  ersetzeQuery(queryMitSzenario(zuQuery(einstellungen)));
}

// Ein ausstehender Schreibvorgang gehört zu dem Verlaufseintrag, auf dem gezogen
// wurde. Zurück/Vor verlässt ihn — dann verfällt er, statt das Szenario in den
// angesteuerten Eintrag zu schreiben. Der Sprachwechsel dagegen bleibt auf der
// Seite und liest gleich die Adresse: dort wird vorher geschrieben (app:sprache
// kommt, bevor der Umschalter die Query übernimmt). Beide Lauscher hängen beim
// Laden des Moduls, also vor dem popstate-Lauscher des Routers.
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    clearTimeout(schreibZeitgeber);
    schreibZeitgeber = null;
  });
  window.addEventListener('app:sprache', () => {
    if (schreibZeitgeber) schreibeAdresse();
  });
  // Drucken (Knopf oder Strg+P): Spielplan und Annahmen gehören aufs Papier,
  // ein geschlossenes <details> druckt der Browser aber nicht mit. Aufgeklappt
  // wird nur für den Druck, afterprint stellt den vorigen Zustand wieder her.
  // Der Link wird vorher geschrieben, sonst stünde ein Stand von vor dem
  // letzten Ziehen auf dem Papier.
  let vorDruck = null;
  window.addEventListener('beforeprint', () => {
    const ergebnis = document.getElementById('ts-ergebnis');
    if (!ergebnis || vorDruck) return;
    if (schreibZeitgeber) schreibeAdresse();
    const link = ergebnis.querySelector('[data-druck-link]');
    if (link) link.textContent = window.location.href;
    vorDruck = {};
    for (const d of ergebnis.querySelectorAll('details[data-aufklapp]')) {
      vorDruck[d.dataset.aufklapp] = d.open;
      d.open = true;
    }
  });
  window.addEventListener('afterprint', () => {
    if (!vorDruck) return;
    // Über den Schlüssel, nicht über das Element: zeichnet der Simulator
    // währenddessen neu (ein gerade gezogener Regler), sind es schon andere.
    for (const d of document.querySelectorAll('#ts-ergebnis details[data-aufklapp]')) {
      if (d.dataset.aufklapp in vorDruck) d.open = vorDruck[d.dataset.aufklapp];
    }
    vorDruck = null;
  });
}

function planeAnsage(el) {
  clearTimeout(ansageZeitgeber);
  ansageZeitgeber = setTimeout(() => {
    const ansage = el.querySelector('#ts-ansage');
    if (ansage && letztesErgebnis) ansage.textContent = ansageText(letztesErgebnis);
  }, 900);
}

// Die Live-Leiste klebt direkt unter der Kopfzeile. Deren Höhe schwankt (der
// Schriftzug bricht auf schmalen Telefonen um, dazu die Sicherheitszone oben),
// darum wird sie gemessen statt geschätzt. Ein Beobachter genügt: die Kopfzeile
// steht fest in index.html und überlebt jedes Neuzeichnen.
let kopfBeobachter = null;
function beobachteKopf() {
  if (kopfBeobachter || typeof ResizeObserver === 'undefined') return;
  const kopf = document.querySelector('.kopf');
  if (!kopf) return;
  kopfBeobachter = new ResizeObserver(() => {
    document.documentElement.style.setProperty('--kopf-hoehe', `${kopf.offsetHeight}px`);
  });
  kopfBeobachter.observe(kopf);
}

function uebernimm(name, wert) {
  einstellungen = ausQuery({ ...einstellungen, [name]: wert });
}

// Jedes Zeichnen bekommt eine Nummer. Ein Feld, das beim Neuzeichnen noch den
// Fokus hat, feuert beim Entfernen sein ausstehendes change-Ereignis — der
// Lauscher des ALTEN Formulars schriebe dann in das gerade geladene Szenario
// (gemessen: Zurück während des Tippens trug den getippten Wert in den
// angesteuerten Verlaufseintrag). Lauscher eines älteren Zeichnens schweigen.
let zeichnung = 0;

export function renderTurniersimulator(el) {
  const nummer = ++zeichnung;
  const aktuell = () => nummer === zeichnung;
  // Ein noch ausstehender Adress-Schreibvorgang gewinnt gegen die Adresse: wer
  // gerade gezogen hat und sofort die Sprache wechselt, nähme sonst den alten
  // Stand mit. Ohne ausstehenden Vorgang ist die Adresse die Quelle.
  if (schreibZeitgeber) schreibeAdresse();
  else einstellungen = ausQuery(new URLSearchParams(window.location.search));

  el.innerHTML = `
    ${heroKlein('fa-chart-gantt', t('ts_titel'), t('ts_untertitel'), 'pf-teal')}
    <p class="ts-intro">${esc(t('ts_intro'))}</p>
    ${formularHtml()}
    <p class="nur-sr" id="ts-ansage" aria-live="polite"></p>
    <div class="ts-ergebnis" id="ts-ergebnis"></div>`;

  beobachteKopf();
  const form = el.querySelector('#ts-form');
  aktualisiereSteuerung(form);
  zeichneErgebnis(el);

  form.addEventListener('submit', (ereignis) => ereignis.preventDefault());
  form.addEventListener('input', (ereignis) => {
    if (!aktuell()) return;
    const feld = ereignis.target;
    if (feld.dataset.regler) {
      uebernimm(feld.dataset.regler, feld.value);
    } else if (feld.dataset.zahl) {
      // Nur gültige Zwischenstände übernehmen; das Feld selbst bleibt, wie getippt.
      if (feld.value === '' || !feld.checkValidity()) return;
      uebernimm(feld.dataset.zahl, feld.value);
    } else if (feld.dataset.wahl) {
      uebernimm(feld.dataset.wahl, feld.dataset.wahl === 'saetze' ? Number(feld.value) : feld.value);
    } else if (feld.id === 'ts-start') {
      if (!/^\d{2}:\d{2}$/.test(feld.value)) return;
      uebernimm('start', feld.value);
    } else {
      return;
    }
    aktualisiereSteuerung(form);
    planeNeuberechnung(el);
  });
  // Nach dem Tippen (Verlassen/Enter) zeigt das Zahlenfeld den gültigen Wert.
  form.addEventListener('change', (ereignis) => {
    if (!aktuell()) return;
    const feld = ereignis.target;
    if (feld.dataset.zahl) {
      // Ein geleertes Feld bekommt den letzten gültigen Wert zurück — nicht den
      // Standard, das verstellte sonst still Plan und Link.
      if (feld.value !== '') uebernimm(feld.dataset.zahl, feld.value);
      feld.value = String(einstellungen[feld.dataset.zahl]);
      aktualisiereSteuerung(form);
      planeNeuberechnung(el);
    } else if (feld.id === 'ts-start' && !/^\d{2}:\d{2}$/.test(feld.value)) {
      // Ebenso die geleerte Uhrzeit: sie zeigt wieder, womit gerechnet wird.
      feld.value = einstellungen.start;
    }
  });

  el.querySelector('#ts-teilen').addEventListener('click', () => {
    schreibeAdresse();
    teileLink(window.location.href, t('ts_titel'));
  });
  el.querySelector('#ts-drucken').addEventListener('click', () => window.print());
  el.querySelector('#ts-zuruecksetzen').addEventListener('click', () => {
    clearTimeout(schreibZeitgeber);
    schreibZeitgeber = null;
    einstellungen = { ...STANDARD };
    ersetzeQuery(queryMitSzenario(''));
    neuRendern();
  });
}

