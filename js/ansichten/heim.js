// Heim: Wiedereinstieg („Weiterlernen") plus die vier gleichrangigen Pfade.
// Fortschritt begleitet dezent (Balken je Karte), drängt sich aber nicht vor.

import { projektion } from '../fortschritt.js';
import { label, t } from '../i18n.js';
import { esc, markeHeroGross, ringHtml } from '../oberflaeche.js';
import { kompetenzpfad, spielformen, themenDomaenen, umgebungBausteine } from '../pfade.js';
import { diagnose, kontinuitaet, speicherIstVerfuegbar } from '../zustand.js';
import { zielLabels } from './zielwahl.js';

export function renderHeim(el, daten) {
  const d = diagnose();
  const pfad = kompetenzpfad(daten);
  const pfadProjektion = projektion(pfad.stationen.map((s) => s.baustein));
  const naechste = pfad.stationen.find((s) => !s.status.absolviert);

  let weiterlernen = '';
  if (!d.stufe) {
    // Freier Einstieg ohne Wizard: Einladung statt geführtem Wiedereinstieg.
    weiterlernen = `
      <section class="karte karte-akzent">
        <h2>${esc(t('kapitel_entdecken'))}</h2>
        <p class="leise">${esc(t('onboarding_einladung'))}</p>
        <div class="knopf-zeile" style="justify-content:flex-start">
          <a class="knopf knopf-primaer" href="#/pfad/themen">${esc(t('kapitel_entdecken'))} <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>
          <a class="knopf knopf-sekundaer" href="#/onboarding">${esc(t('onboarding_starten'))}</a>
        </div>
      </section>`;
  } else if (naechste) {
    const nummer = pfad.stationen.indexOf(naechste) + 1;
    weiterlernen = `
      <section class="karte karte-akzent">
        <p class="leise">${esc(t('weiterlernen'))} · ${esc(t('station_x_von_y', { a: nummer, b: pfad.stationen.length }))}</p>
        <h2>${esc(label('baustein', naechste.baustein.id))}</h2>
        <a class="knopf knopf-primaer" href="#/baustein/${esc(naechste.baustein.id)}?kontext=kompetenz">${esc(t('weiter'))} <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>
      </section>`;
  } else if (pfad.stationen.length > 0) {
    weiterlernen = `
      <section class="karte karte-akzent">
        <p class="bestaetigung">${esc(t('leer_weiterlernen'))}</p>
        <a class="knopf knopf-sekundaer" href="#/pfad/themen">${esc(t('pfad_themen'))}</a>
      </section>`;
  }

  const domaenenChips = themenDomaenen(daten)
    .filter((eintrag) => eintrag.anzahl > 0)
    .map((eintrag) => `<span class="chip">${esc(label('domaene', eintrag.domaene))} · ${eintrag.anzahl}</span>`)
    .join('');

  const doppel = spielformen(daten).find((eintrag) => eintrag.spielform === 'doppel');
  const umgebung = umgebungBausteine(daten);

  const zielBeschriftungen = zielLabels(d.ziel);
  const zielZeile = zielBeschriftungen.length > 0
    ? `${esc(t('ziel_aktuell'))}: ${esc(zielBeschriftungen.join(' · '))}`
    : esc(t('ziel_keins'));

  // Eine Pfad-Kachel: farbige Icon-Medaille (Hue je Pfad) + Titel + Kurztext, im
  // gemeinsamen Raster. Konsistentes Muster statt schnöder Abfolge; unterschieden
  // wird über Medaille/Hue, nicht über Flächenfarbe (CI: Blau = Akzent, keine Fläche).
  const kachel = ({ href, hue, icon, titel, meta = '', text = '', extra = '', ring = '', lead = false, alsLink = true }) => {
    const tag = alsLink ? 'a' : 'div';
    const attr = alsLink ? ` href="${esc(href)}"` : '';
    const klassen = `karte ${alsLink ? 'karte-link ' : ''}pfad-kachel ${hue}${lead ? ' pfad-kachel--lead' : ''}`;
    return `
      <${tag} class="${klassen}"${attr}>
        <span class="pfad-medaille"><i class="fa-solid ${icon}" aria-hidden="true"></i></span>
        <div class="pfad-kachel-text">
          <h3>${titel}${meta}</h3>
          ${text ? `<p class="leise">${text}</p>` : ''}
          ${extra}
        </div>
        ${ring}
      </${tag}>`;
  };

  const kompetenzKachel = d.stufe
    ? kachel({
        href: '#/pfad/kompetenz', hue: 'pf-blau', icon: 'fa-chart-line', lead: true,
        titel: esc(t('pfad_kompetenz')),
        meta: ` <span class="chip chip-stufe chip-stufe-${esc(d.stufe)}">${esc(label('kompetenzstufe', d.stufe))}</span>`,
        text: esc(t('pfad_kompetenz_text')),
        ring: `<div class="pfad-kachel-ring">${ringHtml(pfadProjektion, { groesse: 62, staerke: 6 })}</div>`,
      })
    : kachel({
        hue: 'pf-blau', icon: 'fa-chart-line', lead: true, alsLink: false,
        titel: esc(t('pfad_kompetenz')),
        text: esc(t('stufe_fehlt')),
        extra: `<a class="knopf knopf-sekundaer" href="#/onboarding">${esc(t('stufe_waehlen'))}</a>`,
      });

  const trainerKachel = d.trainer
    ? kachel({
        href: '#/pfad/kompetenz/trainer', hue: 'pf-schiefer', icon: 'fa-people-group',
        titel: esc(t('pfad_kompetenz')),
        meta: ` <span class="chip">${esc(label('kompetenzstufe', 'trainer'))}</span>`,
        text: esc(t('n_bausteine', { n: kompetenzpfad(daten, 'trainer').stationen.length })),
      })
    : '';

  const themenKachel = kachel({
    href: '#/pfad/themen', hue: 'pf-teal', icon: 'fa-layer-group',
    titel: esc(t('pfad_themen')),
    text: esc(t('pfad_themen_text')),
    extra: domaenenChips ? `<p class="chip-zeile pfad-kachel-chips">${domaenenChips}</p>` : '',
  });

  const doppelKachel = doppel && doppel.anzahl > 0
    ? kachel({
        href: '#/pfad/spielform/doppel', hue: 'pf-magenta', icon: 'fa-users',
        titel: esc(t('pfad_spielform')),
        meta: ` <span class="chip">${esc(label('spielform', 'doppel'))} · ${doppel.anzahl}</span>`,
        text: esc(t('pfad_spielform_text')),
      })
    : '';

  const umgebungKachel = umgebung.length > 0
    ? kachel({
        href: '#/pfad/umgebung', hue: 'pf-sky', icon: 'fa-mountain',
        titel: esc(t('pfad_umgebung')),
        meta: ` <span class="chip">${esc(t('n_bausteine', { n: umgebung.length }))}</span>`,
        text: esc(t('pfad_umgebung_text')),
      })
    : '';

  const individualKachel = kachel({
    href: '#/pfad/individual', hue: 'pf-violett', icon: 'fa-bullseye',
    titel: esc(t('pfad_individual')),
    text: esc(t('pfad_individual_text')),
    extra: `<p class="leise pfad-kachel-ziel">${zielZeile}</p>`,
  });

  const trainingKachel = kachel({
    href: '#/training', hue: 'pf-indigo', icon: 'fa-table-tennis-paddle-ball',
    titel: esc(t('pfad_training')),
    text: esc(t('pfad_training_text')),
    extra: `<p class="leise">${esc(t('n_einheiten', { n: daten.einheiten.length }))} · ${esc(t('kontinuitaet_stand', { n: kontinuitaet().gesamt }))}</p>`,
  });

  el.innerHTML = `
    ${markeHeroGross()}
    ${speicherIstVerfuegbar() ? '' : `<div class="banner-hinweis">${esc(t('speicher_warnung'))}</div>`}
    ${weiterlernen}
    <h2 class="abschnitt-titel">${esc(t('pfade'))}</h2>
    <div class="pfad-gitter">
      ${kompetenzKachel}
      ${trainerKachel}
      ${themenKachel}
      ${doppelKachel}
      ${umgebungKachel}
      ${individualKachel}
      ${trainingKachel}
    </div>`;
}
