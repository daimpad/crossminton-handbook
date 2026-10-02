// Heim: Marken-Hero mit Einstiegs-CTAs plus die Bereich-Kacheln als Raster.
// Jede Kachel trägt eine eigene Hue (Icon-Medaille) + einen CTA. Der frühere
// Weiterlernen-/„Kapitel entdecken"-Container ist in den Hero gewandert; der
// Hero-CTA „Kapitel entdecken" bleibt daneben bestehen. Reihenfolge fest
// vorgegeben: Themenpfad (volle Breite, einzige „lead"-Kachel) / Training /
// Individual / Umgebung / Doppel / Ausrüstung / Regeln / Profil / KO-Turnier —
// die reguläre 2-Spalten-Reihe hat damit eine gerade Anzahl (acht) Kacheln,
// KO-Turnier bildet mit Profil das letzte Paar. Neun Kacheln auf sieben Hues —
// Themenpfad und Ausrüstung tragen bewusst je eine bereits vergebene Hue
// (Teal wie KO-Turnier, Violett wie Individual — beide diagonal genug entfernt
// im Gitter, um nicht als Verwechslung zu wirken).

import { label, t } from '../i18n.js';
import { esc, markeHeroGross } from '../oberflaeche.js';
import { spielformen, umgebungBausteine } from '../pfade.js';
import { diagnose, speicherIstVerfuegbar } from '../zustand.js';
import { zielLabels } from './zielwahl.js';

export function renderHeim(el, daten) {
  const d = diagnose();
  const doppel = spielformen(daten).find((eintrag) => eintrag.spielform === 'doppel');
  const umgebung = umgebungBausteine(daten);
  const zielBeschriftungen = zielLabels(d.ziel);

  // Einstiegs-CTAs im Hero: „Kapitel entdecken" öffnet den Themen-Einstieg,
  // „Onboarding" die geführte Ersteinrichtung.
  const heroCta = `
    <div class="knopf-zeile marke-hero-cta">
      <a class="knopf knopf-primaer" href="#/pfad/themen">${esc(t('kapitel_entdecken'))} <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>
      <a class="knopf knopf-sekundaer" href="#/onboarding">${esc(t('onboarding'))}</a>
    </div>`;

  // Eine Bereich-Kachel: farbige Icon-Medaille (Hue) + Titel + Kurztext + CTA.
  // Die ganze Kachel ist ein Link; der CTA verstärkt die Aktion sichtbar.
  const cta = `<span class="pfad-cta">${esc(t('ansehen'))} <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span>`;
  const kachel = ({ href, hue, icon, titel, meta = '', text = '', extra = '', lead = false }) => `
    <a class="karte karte-link pfad-kachel ${hue}${lead ? ' pfad-kachel--lead' : ''}" href="${esc(href)}">
      <span class="pfad-medaille"><i class="fa-solid ${icon}" aria-hidden="true"></i></span>
      <div class="pfad-kachel-text">
        <h3>${titel}${meta}</h3>
        ${text ? `<p class="leise">${text}</p>` : ''}
        ${extra}
        ${cta}
      </div>
    </a>`;

  // Ganz oben, über die volle Breite: der Themenpfad-Einstieg — der breiteste
  // Weg ins Handbuch, entsprechend prominent platziert.
  const themenKachel = kachel({
    href: '#/pfad/themen', hue: 'pf-teal', icon: 'fa-layer-group', lead: true,
    titel: esc(t('pfad_themen')),
    text: esc(t('pfad_themen_text')),
  });

  const trainingKachel = kachel({
    href: '#/training', hue: 'pf-indigo', icon: 'fa-table-tennis-paddle-ball',
    titel: esc(t('pfad_training')),
    meta: ` <span class="chip">${esc(t('n_einheiten', { n: daten.einheiten.length }))}</span>`,
    text: esc(t('pfad_training_text')),
  });

  // Individualpfad zeigt gewählte Ziele — der Leer-Zustand („Keine Ziele gewählt")
  // erscheint hier nicht mehr; ohne Ziel bleibt nur Beschreibung + CTA.
  const individualKachel = kachel({
    href: '#/pfad/individual', hue: 'pf-violett', icon: 'fa-bullseye',
    titel: esc(t('pfad_individual')),
    text: esc(t('pfad_individual_text')),
    extra: zielBeschriftungen.length > 0
      ? `<p class="leise pfad-kachel-ziel">${esc(t('ziel_aktuell'))}: ${esc(zielBeschriftungen.join(' · '))}</p>`
      : '',
  });

  const umgebungKachel = umgebung.length > 0
    ? kachel({
        href: '#/pfad/umgebung', hue: 'pf-sky', icon: 'fa-mountain',
        titel: esc(t('pfad_umgebung')),
        meta: ` <span class="chip">${esc(t('n_bausteine', { n: umgebung.length }))}</span>`,
        text: esc(t('pfad_umgebung_text')),
      })
    : '';

  const doppelKachel = doppel && doppel.anzahl > 0
    ? kachel({
        href: '#/pfad/spielform/doppel', hue: 'pf-magenta', icon: 'fa-users',
        titel: esc(t('pfad_spielform')),
        meta: ` <span class="chip">${esc(label('spielform', 'doppel'))} · ${doppel.anzahl}</span>`,
        text: esc(t('pfad_spielform_text')),
      })
    : '';

  const ausruestungKachel = kachel({
    href: '#/ausruestung', hue: 'pf-violett', icon: 'fa-toolbox',
    titel: esc(t('nav_ausruestung')),
    text: esc(t('ausruestung_untertitel')),
  });

  const regelnKachel = kachel({
    href: '#/regeln', hue: 'pf-schiefer', icon: 'fa-book-open',
    titel: esc(t('nav_regeln')),
    text: esc(t('regeln_kachel')),
  });

  const profilKachel = kachel({
    href: '#/profil', hue: 'pf-blau', icon: 'fa-user',
    titel: esc(t('nav_profil')),
    text: esc(t('profil_intro')),
  });

  // Als letzte reguläre Kachel neben Profil (ergänzt die Zeile zu zweit) — sonst
  // nur über das „Mehr"-Menü erreichbar und für viele schwer zu finden.
  const koTurnierKachel = kachel({
    href: '#/ko-turnier', hue: 'pf-teal', icon: 'fa-flag-checkered',
    titel: esc(t('ko_turnier_titel')),
    text: esc(t('ko_turnier_kachel_text')),
  });

  el.innerHTML = `
    ${markeHeroGross(heroCta)}
    ${speicherIstVerfuegbar() ? '' : `<div class="banner-hinweis">${esc(t('speicher_warnung'))}</div>`}
    <h2 class="abschnitt-titel">${esc(t('pfade'))}</h2>
    <div class="pfad-gitter">
      ${themenKachel}
      ${trainingKachel}
      ${individualKachel}
      ${umgebungKachel}
      ${doppelKachel}
      ${ausruestungKachel}
      ${regelnKachel}
      ${profilKachel}
      ${koTurnierKachel}
    </div>`;
}
