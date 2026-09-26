// Route → Titel/Beschreibung/strukturierte Daten für den Dokumentkopf. Eine
// Quelle für den Client (js/app.js setzt sie live je Route) UND den
// Deploy-Prerender (scripts/prerender.mjs, SEO Tier 2 Baustein 2, s.
// docs/seo-tier2-konzept.md) — sonst liefe die Zuordnung doppelt auseinander.
// Rein/DOM-frei wie der Rest der Engine.
//
// BEWUSST NICHT importiert: js/pfade.js. Es zöge js/zustand.js mit, und damit
// hinge der Dokumentkopf am persönlichen Fortschritt — dieselbe Adresse ergäbe
// je Besucher andere Auszeichnungen. Die Eltern-Regel in elternRouten() ist
// darum ausbuchstabiert statt aus den Pfad-Funktionen abgeleitet; ein Test
// hält dafür fest, dass jede Eltern-Route wirklich existiert.

import { domaenenVon, hatUebungsteil, niedrigsteStufe } from './daten.js';
import { label, sprache, t, text } from './i18n.js';
import { ausschnitt, bausteinText } from './suche.js';

function kuerzen(roh, laenge = 160) {
  return ausschnitt(roh, null, laenge);
}

// Bloßer Seitenname (ohne den " — Crossminton-Handbuch"-Zusatz) plus
// Beschreibung. Zwei Verbraucher: seiteMeta() hängt den App-Namen an, die
// Brotkrumen brauchen ihn genau ohne.
function seiteInhalt(daten, segmente) {
  const standard = { name: null, beschreibung: t('hero_untertitel') };
  const [a, b, c] = segmente;
  if (!a) return standard;

  if (a === 'baustein' && b) {
    const baustein = daten.bausteinVonId.get(b);
    if (baustein) {
      const beschreibung = kuerzen(bausteinText(baustein));
      return { name: label('baustein', baustein.id), beschreibung: beschreibung || standard.beschreibung };
    }
  }

  if (a === 'training' && b) {
    const einheit = daten.einheitVonId.get(b);
    if (einheit) {
      const beschreibung = kuerzen(text(einheit.beschreibung) ?? text(einheit.schwerpunkt) ?? '');
      return { name: label('einheit', einheit.id), beschreibung: beschreibung || standard.beschreibung };
    }
  }
  if (a === 'training') return { name: t('pfad_training'), beschreibung: t('pfad_training_text') };

  if (a === 'plan') return { name: t('plan_titel'), beschreibung: t('pfad_training_text') };

  if (a === 'pfad' && b === 'kompetenz') {
    const stufe = c ? decodeURIComponent(c) : null;
    return {
      name: stufe ? `${t('pfad_kompetenz')} — ${label('kompetenzstufe', stufe)}` : t('pfad_kompetenz'),
      beschreibung: t('pfad_kompetenz_text'),
    };
  }
  if (a === 'pfad' && b === 'themen') {
    const domaene = c ? decodeURIComponent(c) : null;
    return {
      name: domaene ? label('domaene', domaene) : t('pfad_themen'),
      beschreibung: domaene ? t('vorgeschlagene_reihenfolge') : t('pfad_themen_text'),
    };
  }
  if (a === 'pfad' && b === 'spielform') {
    // pfad_spielform ("Das Doppel") ist bereits wertspezifisch — dieselbe
    // Überschrift, die die Live-Seite selbst als H1 zeigt (renderSpielform);
    // ein Suffix mit label('spielform', …) wäre hier nur eine Dopplung.
    return { name: t('pfad_spielform'), beschreibung: t('pfad_spielform_text') };
  }
  if (a === 'pfad' && b === 'umgebung') {
    return { name: t('pfad_umgebung'), beschreibung: t('pfad_umgebung_text') };
  }
  if (a === 'pfad' && (b === 'witterung' || b === 'untergrund')) {
    const wert = c ? decodeURIComponent(c) : null;
    return {
      name: wert ? `${t('pfad_umgebung')} — ${label(b, wert)}` : t('pfad_umgebung'),
      beschreibung: t('pfad_umgebung_text'),
    };
  }
  if (a === 'pfad' && b === 'individual') {
    return { name: t('pfad_individual'), beschreibung: t('hero_untertitel') };
  }

  if (a === 'regeln') return { name: t('regeln_titel'), beschreibung: t('regeln_intro') };
  if (a === 'turnier') {
    const einleitung = kuerzen(text(daten.turnierregeln?.meta?.einleitung) ?? '');
    return { name: t('turnier_titel'), beschreibung: einleitung || standard.beschreibung };
  }
  if (a === 'ausruestung') return { name: label('domaene', 'ausruestung'), beschreibung: t('ausruestung_intro') };

  // `daten.appInfo` ist immer ein Objekt (baueIndizes baut es unbedingt) — nullbar
  // sind die Abschnitte darin. Fehlt einer, warnt pruefeDaten nur (nie sperrend),
  // also muss auch hier degradiert statt geworfen werden — wie in den
  // Schwesterzweigen impressum/datenschutz unten.
  if (a === 'ueber') {
    const abschnitt = daten.appInfo?.ueber;
    const beschreibung = kuerzen(text(abschnitt?.absaetze?.[0]) ?? '');
    return { name: text(abschnitt?.titel), beschreibung: beschreibung || standard.beschreibung };
  }
  if (a === 'mitmachen') {
    const abschnitt = daten.appInfo?.mitmachen;
    const beschreibung = kuerzen(text(abschnitt?.einleitung?.[0]) ?? '');
    return { name: text(abschnitt?.titel), beschreibung: beschreibung || standard.beschreibung };
  }
  if (a === 'impressum') {
    const rechtstext = daten.appInfo?.rechtliches?.impressum;
    const beschreibung = kuerzen(text(rechtstext?.absaetze?.[0]) ?? '');
    return { name: text(rechtstext?.titel), beschreibung: beschreibung || standard.beschreibung };
  }
  if (a === 'datenschutz') {
    const rechtstext = daten.appInfo?.rechtliches?.datenschutz;
    const beschreibung = kuerzen(text(rechtstext?.absaetze?.[0]) ?? '');
    return { name: text(rechtstext?.titel), beschreibung: beschreibung || standard.beschreibung };
  }

  return standard;
}

export function seiteMeta(daten, segmente) {
  const { name, beschreibung } = seiteInhalt(daten, segmente);
  const app = t('app_titel');
  return { titel: name ? `${name} — ${app}` : app, beschreibung };
}

// Nur der Seitenname — die Startseite hat keinen eigenen (null).
export function seiteName(daten, segmente) {
  return seiteInhalt(daten, segmente).name;
}

// --- Strukturierte Daten (JSON-LD) ------------------------------------------
// Die Startseite trägt ihren handgepflegten WebSite-Block aus index.html; hier
// entstehen die SEITENbezogenen Angaben: wo die Seite im Aufbau steht
// (BreadcrumbList) und, wo es zutrifft, was sie inhaltlich ist
// (LearningResource). Beides ist aus dem Bestand abgeleitet, nichts behauptet.

const LIZENZ = 'https://creativecommons.org/licenses/by-sa/4.0/';

// Eltern-Routen einer Seite, von oben nach unten (ohne Startseite, ohne die
// Seite selbst). Jede muss eine WIRKLICH existierende Route sein — sonst führt
// die Brotkrume ins Leere; tests/engine.test.mjs prüft das gegen sammleRouten().
function elternRouten(daten, segmente) {
  const [a, b, c] = segmente;

  if (a === 'baustein' && b) {
    const baustein = daten.bausteinVonId.get(b);
    if (!baustein) return [];
    // Umgebungs-Bausteine sind aus dem Themenpfad HERAUSGEFILTERT (js/pfade.js) —
    // ihre Domänen-Seite enthielte sie gar nicht. Ihr Zuhause ist die Umgebungs-Achse.
    if (baustein.typ === 'umgebungs_baustein') return [['pfad', 'umgebung']];
    // Reine Trainer-Bausteine: '/pfad/themen/trainingsgestaltung' ist KEINE Route
    // (die Facette ist hinter diagnose().trainer gegated und damit 0-zählig).
    if (niedrigsteStufe(daten, baustein) === 'trainer') return [['pfad', 'kompetenz', 'trainer']];
    // Mehrfach zugeordnete Bausteine ordnen sich unter ihrer ersten Domäne ein —
    // dieselbe, unter der sie auch die Themen-Facette führt.
    return [['pfad', 'themen'], ['pfad', 'themen', domaenenVon(baustein)[0]]];
  }

  if ((a === 'training' && b) || a === 'plan') return [['training']];
  if (a === 'turnier') return [['regeln']];
  if (a === 'pfad' && (b === 'themen' || b === 'kompetenz') && c) return [['pfad', b]];
  if (a === 'pfad' && (b === 'witterung' || b === 'untergrund')) return [['pfad', 'umgebung']];
  return [];
}

function brotkrumen(daten, segmente, urlVon) {
  const spur = [[], ...elternRouten(daten, segmente), segmente];
  return {
    '@type': 'BreadcrumbList',
    itemListElement: spur.map((teil, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: seiteName(daten, teil) || t('app_titel'),
      item: urlVon(teil),
    })),
  };
}

// Lerninhalt im engeren Sinn: die Bausteine und die kuratierten
// Trainingseinheiten. Übersichts- und Referenzseiten (Regeln, Turnier, Über …)
// bekommen bewusst KEINE LearningResource — sie sind Nachschlagewerk, keine
// Lerneinheit, und eine falsche Auszeichnung ist schlechter als keine.
function lernressource(daten, segmente, urlVon) {
  const [a, b] = segmente;
  const basis = () => {
    const { name, beschreibung } = seiteInhalt(daten, segmente);
    return {
      '@type': 'LearningResource',
      name,
      description: beschreibung,
      url: urlVon(segmente),
      inLanguage: sprache(),
      isAccessibleForFree: true,
      license: LIZENZ,
    };
  };

  if (a === 'baustein' && b) {
    const baustein = daten.bausteinVonId.get(b);
    if (!baustein) return null;
    const stufe = niedrigsteStufe(daten, baustein);
    return {
      ...basis(),
      // Ein Baustein trägt genau einen quittierbaren Aufgabenteil: einen
      // Übungsteil (Bewegung) oder eine Reflexionsaufgabe (Nachdenken).
      learningResourceType: hatUebungsteil(baustein) ? 'exercise' : 'lesson',
      ...(stufe ? { educationalLevel: label('kompetenzstufe', stufe) } : {}),
      about: domaenenVon(baustein).map((d) => ({ '@type': 'Thing', name: label('domaene', d) })),
    };
  }

  if (a === 'training' && b && daten.einheitVonId.get(b)) {
    return { ...basis(), learningResourceType: 'exercise' };
  }
  return null;
}

// `urlVon(segmente)` liefert die absolute URL einer Route in der AKTIVEN Sprache
// — hereingereicht, weil die Engine weder Herkunft noch Montagepunkt kennt
// (dasselbe Muster wie der Titel-Auflöser in sucheBausteine()). Dadurch bleiben
// auch die Brotkrumen in der Sprache der Seite.
export function seiteSchema(daten, segmente, urlVon) {
  if (!segmente.length) return null; // Startseite: nur der WebSite-Block
  const knoten = [brotkrumen(daten, segmente, urlVon)];
  const lern = lernressource(daten, segmente, urlVon);
  if (lern) knoten.push(lern);
  return { '@context': 'https://schema.org', '@graph': knoten };
}
