// Route → Titel/Beschreibung für <title> und <meta name="description">. Eine
// Quelle für den Client (js/app.js setzt sie live je Route) UND den
// Deploy-Prerender (scripts/prerender.mjs, SEO Tier 2 Baustein 2, s.
// docs/seo-tier2-konzept.md) — sonst liefe die Zuordnung doppelt auseinander.
// Rein/DOM-frei wie der Rest der Engine.

import { label, t, text } from './i18n.js';
import { ausschnitt, bausteinText } from './suche.js';

function kuerzen(roh, laenge = 160) {
  return ausschnitt(roh, null, laenge);
}

export function seiteMeta(daten, segmente) {
  const app = t('app_titel');
  const mit = (teil) => (teil ? `${teil} — ${app}` : app);
  const standard = { titel: mit(null), beschreibung: t('hero_untertitel') };
  const [a, b, c] = segmente;
  if (!a) return standard;

  if (a === 'baustein' && b) {
    const baustein = daten.bausteinVonId.get(b);
    if (baustein) {
      const beschreibung = kuerzen(bausteinText(baustein));
      return { titel: mit(label('baustein', baustein.id)), beschreibung: beschreibung || standard.beschreibung };
    }
  }

  if (a === 'training' && b) {
    const einheit = daten.einheitVonId.get(b);
    if (einheit) {
      const beschreibung = kuerzen(text(einheit.beschreibung) ?? text(einheit.schwerpunkt) ?? '');
      return { titel: mit(label('einheit', einheit.id)), beschreibung: beschreibung || standard.beschreibung };
    }
  }
  if (a === 'training') return { titel: mit(t('pfad_training')), beschreibung: t('pfad_training_text') };

  if (a === 'plan') return { titel: mit(t('plan_titel')), beschreibung: t('pfad_training_text') };

  if (a === 'pfad' && b === 'kompetenz') {
    const stufe = c ? decodeURIComponent(c) : null;
    return {
      titel: mit(stufe ? `${t('pfad_kompetenz')} — ${label('kompetenzstufe', stufe)}` : t('pfad_kompetenz')),
      beschreibung: t('pfad_kompetenz_text'),
    };
  }
  if (a === 'pfad' && b === 'themen') {
    const domaene = c ? decodeURIComponent(c) : null;
    return {
      titel: mit(domaene ? label('domaene', domaene) : t('pfad_themen')),
      beschreibung: domaene ? t('vorgeschlagene_reihenfolge') : t('pfad_themen_text'),
    };
  }
  if (a === 'pfad' && b === 'spielform') {
    // pfad_spielform ("Das Doppel") ist bereits wertspezifisch — dieselbe
    // Überschrift, die die Live-Seite selbst als H1 zeigt (renderSpielform);
    // ein Suffix mit label('spielform', …) wäre hier nur eine Dopplung.
    return { titel: mit(t('pfad_spielform')), beschreibung: t('pfad_spielform_text') };
  }
  if (a === 'pfad' && b === 'umgebung') {
    return { titel: mit(t('pfad_umgebung')), beschreibung: t('pfad_umgebung_text') };
  }
  if (a === 'pfad' && (b === 'witterung' || b === 'untergrund')) {
    const wert = c ? decodeURIComponent(c) : null;
    return {
      titel: mit(wert ? `${t('pfad_umgebung')} — ${label(b, wert)}` : t('pfad_umgebung')),
      beschreibung: t('pfad_umgebung_text'),
    };
  }
  if (a === 'pfad' && b === 'individual') {
    return { titel: mit(t('pfad_individual')), beschreibung: t('hero_untertitel') };
  }

  if (a === 'regeln') return { titel: mit(t('regeln_titel')), beschreibung: t('regeln_intro') };
  if (a === 'turnier') {
    const einleitung = kuerzen(text(daten.turnierregeln?.meta?.einleitung) ?? '');
    return { titel: mit(t('turnier_titel')), beschreibung: einleitung || standard.beschreibung };
  }
  if (a === 'ausruestung') return { titel: mit(label('domaene', 'ausruestung')), beschreibung: t('ausruestung_intro') };

  if (a === 'ueber' && daten.appInfo) {
    const beschreibung = kuerzen(text(daten.appInfo.ueber.absaetze?.[0]) ?? '');
    return { titel: mit(text(daten.appInfo.ueber.titel)), beschreibung: beschreibung || standard.beschreibung };
  }
  if (a === 'mitmachen' && daten.appInfo) {
    const beschreibung = kuerzen(text(daten.appInfo.mitmachen.einleitung?.[0]) ?? '');
    return { titel: mit(text(daten.appInfo.mitmachen.titel)), beschreibung: beschreibung || standard.beschreibung };
  }
  if (a === 'impressum' && daten.appInfo) {
    const rechtstext = daten.appInfo.rechtliches?.impressum;
    const beschreibung = kuerzen(text(rechtstext?.absaetze?.[0]) ?? '');
    return { titel: mit(text(rechtstext?.titel)), beschreibung: beschreibung || standard.beschreibung };
  }
  if (a === 'datenschutz' && daten.appInfo) {
    const rechtstext = daten.appInfo.rechtliches?.datenschutz;
    const beschreibung = kuerzen(text(rechtstext?.absaetze?.[0]) ?? '');
    return { titel: mit(text(rechtstext?.titel)), beschreibung: beschreibung || standard.beschreibung };
  }

  return standard;
}
