// Info-Reiter „Über" und „Mitmachen": statischer Referenzinhalt aus app-info.json
// (eigene Entität, NICHT im Baustein-Pool — kein Fortschritt, keine Gamification).
// Platzhalter in [eckigen Klammern] bleiben bewusst sichtbar, bis der Betreiber
// sie füllt (Name, Lizenz, GitHub-URL) — sie werden nie erfunden oder verlinkt.

import { aktiviereFeedback, feedbackAktiv } from '../feedback.js';
import { label, t, text } from '../i18n.js';
import { esc, externesZiel, heroKlein } from '../oberflaeche.js';
import { VERSION } from '../version.js';

function istPlatzhalter(wert) {
  return typeof wert === 'string' && wert.trim().startsWith('[');
}

// Externer Absprung. Ein noch nicht gefüllter Platzhalter wird sichtbar gelassen
// (der Betreiber ersetzt ihn), aber nie als Link ausgegeben.
function externerLink(ziel, beschriftung, klasse) {
  if (istPlatzhalter(ziel) || !externesZiel(ziel)) {
    return `<span class="${klasse} knopf-inaktiv" role="link" aria-disabled="true">${esc(beschriftung)}</span>
      <span class="info-platzhalter leise">${esc(ziel || '')}</span>`;
  }
  return `<a class="${klasse}" href="${esc(ziel)}" target="_blank" rel="noopener noreferrer">${esc(beschriftung)} <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>`;
}

// Kein Brands-Font eingebunden (nur fa-solid) — das GitHub-Logo daher als Inline-SVG.
const GITHUB_SVG =
  '<svg class="github-logo" viewBox="0 0 16 16" width="18" height="18" aria-hidden="true" focusable="false"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>';

function abschnittHtml(block) {
  if (!block) return '';
  const eintraege = (block.eintraege || []).map((e) => `<p class="leise">${esc(text(e) ?? '')}</p>`).join('');
  const github =
    block.github && block.github.ziel && !istPlatzhalter(block.github.ziel)
      ? `<p class="info-cta"><a class="knopf knopf-sekundaer info-github" href="${esc(block.github.ziel)}" target="_blank" rel="noopener noreferrer">${GITHUB_SVG} ${esc(text(block.github.label) ?? 'GitHub')}</a></p>`
      : '';
  return `<section class="karte"><h2>${esc(text(block.titel) ?? '')}</h2>${eintraege}${github}</section>`;
}

// Verweis auf einen Baustein MITTEN im Fließtext. Die Marke steht in der
// Inhalts-JSON — sprachneutral, wie überall sonst die Identität:
//
//   [[baustein:griff]]            → Beschriftung kommt aus dem Label, also übersetzt
//   [[baustein:umschalten|Text]]  → eigene Beschriftung, wenn der Titel im Satz klemmt
//
// Der ID-freie Normalfall ist der bessere: er hält die Beschriftung automatisch
// in der aktiven Sprache und dupliziert keinen Text in die Übersetzungen.
const BAUSTEIN_MARKE = /\[\[baustein:([a-z0-9_]+)(?:\|([^\]]*))?\]\]/g;

// ERST escapen, DANN die Marken auflösen. Das ist die sichere Reihenfolge: die
// Marke selbst trägt keine HTML-Sonderzeichen und übersteht esc() unverändert,
// der eingesetzte Anker ist vollständig selbst gebaut. Umgekehrt (erst ersetzen,
// dann escapen) würde der Anker gleich wieder zu Text.
function fliesstextHtml(wert, daten) {
  return esc(text(wert) ?? '').replace(BAUSTEIN_MARKE, (_treffer, id, eigene) => {
    // Unbekannte ID: lieber lesbarer Text ohne Link als ein toter Verweis.
    if (!daten?.bausteinVonId?.has(id)) return eigene || esc(label('baustein', id));
    // `eigene` stammt aus dem bereits escapten Text — kein zweites Mal escapen.
    const beschriftung = eigene || esc(label('baustein', id));
    return `<a href="#/baustein/${encodeURIComponent(id)}">${beschriftung}</a>`;
  });
}

// Erzählende Kapitel („Was es ist", „Wozu", …) als eigene Karten. Anders als
// abschnittHtml sind das normale Absätze, keine .leise-Fußnoten — und sie dürfen
// Baustein-Verweise tragen.
function kapitelHtml(kapitel, daten) {
  if (!Array.isArray(kapitel)) return '';
  return kapitel
    .map((k) => {
      const absaetze = (k.absaetze || []).map((a) => `<p>${fliesstextHtml(a, daten)}</p>`).join('');
      if (!absaetze) return '';
      return `<section class="karte"><h2>${esc(text(k.titel) ?? '')}</h2>${absaetze}</section>`;
    })
    .join('');
}

// Inline-Absprung im Fließtext (Lizenzname/Credit-Name als echter Link). Nicht-
// externe/Platzhalter-Ziele bleiben unverlinkter Text.
function inlineLink(ziel, beschriftung) {
  return externesZiel(ziel)
    ? `<a href="${esc(ziel)}" target="_blank" rel="noopener noreferrer">${esc(beschriftung)}</a>`
    : esc(beschriftung);
}

// Lizenz/Credits: strukturiert mit externen Links — die Lizenzen ausgeschrieben und
// verlinkt, die Credits als verlinkte Namen (Damian Paderta, nozilla). Eigener
// Renderer statt des generischen abschnittHtml, weil hier echte <a> gebraucht werden.
function creditsLizenzHtml(block) {
  if (!block) return '';
  const lizenzen = (block.lizenzen || [])
    .map((l) => `<p class="leise">${esc(text(l.rolle) ?? '')}: ${inlineLink(l.ziel, text(l.name) ?? '')}</p>`)
    .join('');
  const c = block.credits;
  const credits = c
    ? `<p class="leise">${esc(text(c.praefix) ?? '')}: ${(c.personen || []).map((p) => inlineLink(p.ziel, p.name)).join(' · ')}</p>`
    : '';
  const github =
    block.github && block.github.ziel && !istPlatzhalter(block.github.ziel)
      ? `<p class="info-cta"><a class="knopf knopf-sekundaer info-github" href="${esc(block.github.ziel)}" target="_blank" rel="noopener noreferrer">${GITHUB_SVG} ${esc(text(block.github.label) ?? 'GitHub')}</a></p>`
      : '';
  return `<section class="karte"><h2>${esc(text(block.titel) ?? '')}</h2>${lizenzen}${credits}${github}${versionHtml()}</section>`;
}

// Stand der ausgelieferten Fassung — bewusst die letzte, leiseste Zeile der
// Seite. Das Datum kommt nur mit, wenn es eines gibt: lokal und in Branches, in
// denen .github/workflows/version.yml noch nicht lief, steht in js/version.js
// der Ruhezustand `lokal` ohne Datum (s. den Kopf der Datei).
function versionHtml() {
  if (!VERSION?.commit) return '';
  const stand = VERSION.datum ? `${VERSION.commit} · ${VERSION.datum}` : VERSION.commit;
  return `<p class="version-zeile">${esc(t('version'))} ${esc(stand)}</p>`;
}

export function renderUeber(el, daten) {
  const u = daten.appInfo?.ueber;
  if (!u) {
    el.innerHTML = `<div class="karte"><p>${esc(t('nicht_gefunden'))}</p></div>`;
    return;
  }
  const absaetze = (u.absaetze || []).map((a) => `<p>${esc(text(a) ?? '')}</p>`).join('');
  const links = (u.links || []).map((l) => `<p class="info-cta">${externerLink(l.ziel, text(l.label) ?? '', 'knopf knopf-sekundaer')}</p>`).join('');
  el.innerHTML = `
    ${heroKlein('fa-compass', text(u.titel) ?? t('nav_ueber'), '', 'pf-blau')}
    ${absaetze ? `<section class="karte">${absaetze}</section>` : ''}
    ${kapitelHtml(u.kapitel, daten)}
    ${abschnittHtml(u.danksagungen)}
    ${creditsLizenzHtml(u.credits_lizenz)}
    ${links ? `<section class="karte">${links}</section>` : ''}
    ${rechtlicheLinksHtml()}`;
}

// Impressum + Datenschutz zusätzlich ganz unten im „Über"-Reiter. Sie liegen
// sonst NUR im „Mehr"-Menü — und dort ganz am Ende, also genau dort, wo die
// Lade auf kurzen Viewports abschnitt. Ein zweiter Weg an der Stelle, an der
// man rechtliche Angaben ohnehin sucht; die Menü-Einträge bleiben bestehen.
function rechtlicheLinksHtml() {
  // Schlichtes <p> statt <nav>: zwei Links brauchen kein eigenes Landmark, und
  // ein aria-label dafür wäre ein unsichtbarer fünfter Übersetzungsschlüssel.
  // Die Schwesterzeile im Menü (.menue-rechtliches) macht es genauso.
  return `
    <p class="info-rechtliches">
      <a href="#/impressum">${esc(t('footer_impressum'))}</a>
      <span aria-hidden="true">·</span>
      <a href="#/datenschutz">${esc(t('footer_datenschutz'))}</a>
    </p>`;
}

// Rechtstexte (Impressum / Datenschutz): schlichte Titel-+-Absätze-Ansicht aus
// app-info.json `rechtliches`. Platzhalter in [eckigen Klammern] bleiben sichtbar.
export function renderRechtstext(el, daten, schluessel) {
  const block = daten.appInfo?.rechtliches?.[schluessel];
  if (!block) {
    el.innerHTML = `<div class="karte"><p>${esc(t('nicht_gefunden'))}</p></div>`;
    return;
  }
  const absaetze = (block.absaetze || []).map((a) => `<p>${esc(text(a) ?? '')}</p>`).join('');
  el.innerHTML = `
    <h1>${esc(text(block.titel) ?? '')}</h1>
    <section class="karte">${absaetze}</section>`;
}

export function renderMitmachen(el, daten) {
  const m = daten.appInfo?.mitmachen;
  if (!m) {
    el.innerHTML = `<div class="karte"><p>${esc(t('nicht_gefunden'))}</p></div>`;
    return;
  }
  const einleitung = (m.einleitung || []).map((e) => `<p class="leise">${esc(text(e) ?? '')}</p>`).join('');
  const karten = (m.moeglichkeiten || [])
    .map(
      (moe) => `
      <section class="karte">
        <h3>${esc(text(moe.titel) ?? '')}</h3>
        <p>${esc(text(moe.text) ?? '')}</p>
        <p class="info-cta">${externerLink(moe.cta_ziel, text(moe.cta_label) ?? '', 'knopf knopf-primaer')}</p>
      </section>`,
    )
    .join('');
  // Feedback direkt auf der Seite (Kommentator, js/feedback.js). Der Knopf startet
  // den Modus ohne Reload; ist er schon aktiv (Knopf zuvor oder ?feedback-Link),
  // steht stattdessen der Hinweis.
  const fb = m.feedback;
  const feedbackKarte = fb
    ? `
      <section class="karte karte-akzent">
        <h3>${esc(text(fb.titel) ?? '')}</h3>
        <p>${esc(text(fb.text) ?? '')}</p>
        <div id="feedback-bereich" class="info-cta">
          ${
            feedbackAktiv()
              ? `<p class="bestaetigung">${esc(text(fb.aktiv) ?? '')}</p>`
              : `<button class="knopf knopf-primaer" id="feedback-start"><i class="fa-solid fa-comment-dots" aria-hidden="true"></i> ${esc(text(fb.knopf) ?? '')}</button>`
          }
        </div>
      </section>`
    : '';

  el.innerHTML = `
    ${heroKlein('fa-comments', text(m.titel) ?? t('nav_mitmachen'), '', 'pf-blau')}
    ${einleitung}
    ${karten}
    ${feedbackKarte}`;

  el.querySelector('#feedback-start')?.addEventListener('click', async (ereignis) => {
    const knopf = ereignis.currentTarget;
    knopf.disabled = true;
    await aktiviereFeedback();
    const bereich = el.querySelector('#feedback-bereich');
    if (bereich) bereich.innerHTML = `<p class="bestaetigung">${esc(text(fb.aktiv) ?? '')}</p>`;
  });
}
