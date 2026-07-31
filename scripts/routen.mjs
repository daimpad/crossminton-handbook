// Die indexierbaren Routen der App — EINE Ableitung, zwei Verbraucher.
//
//   • scripts/sitemap.mjs   (Node, dependency-frei) → schreibt sitemap.xml
//   • scripts/prerender.mjs (im Browser-Tab)        → Snapshots je Route
//
// Beide lesen dieselbe Liste, damit sie nicht auseinanderlaufen. Das ist keine
// Bequemlichkeit: die Sitemap ist in der Produktion (netcup) die einzige Spur,
// über die Google die Unterseiten überhaupt findet — eine still veraltete Liste
// wäre unsichtbar kaputt.
//
// Das Modul ist REIN und DOM-frei: es bekommt fertige `daten` herein (aus
// ladeDaten() im Browser bzw. baueIndizes() in Node) und leitet daraus mit
// denselben Funktionen ab, die auch die Ansichten nutzen — keine zweite,
// gepflegte Routenliste. Es läuft unverändert in Node UND im Browser; darum
// nur relative Importe und kein Zugriff auf fetch/document/process.

import { spielformen, themenDomaenen, untergruende, witterungen } from '../js/pfade.js';

// Absolute Adresse der Produktion — der EINZIGE deploy-abhängige Wert hier.
// prerender.mjs leitet daraus zusätzlich seinen Montagepunkt ab (PRAEFIX), die
// Sitemap ihre <loc>-Einträge. Bei einem Umzug genau diese Zeile ändern
// (dazu index.html/404.html, robots.txt und CNAME — s. CLAUDE.md).
export const SITE_URL = 'https://crossminton-handbook.de';

// Indexierbar ist, was ohne persönlichen Zustand eine echte, eigenständige Seite
// ergibt (Zwei-Ebenen-Logik: nichts ist gesperrt). Bewusst NICHT enthalten:
// /onboarding, /pfad/individual, /plan, /suche, /profil, /merkliste, /ko-turnier
// — sie zeigen ohne localStorage nur ein leeres Formular oder eine rein
// interaktive Ansicht, also keinen indexierbaren Inhalt.
export function sammleRouten(daten) {
  const liste = [];
  const fuege = (pfad, prioritaet) => liste.push({ pfad, prioritaet });

  fuege('/', 1.0);

  fuege('/pfad/kompetenz', 0.8);
  for (const stufe of [...daten.koennensOrdnung, 'trainer']) {
    fuege(`/pfad/kompetenz/${encodeURIComponent(stufe)}`, 0.8);
  }

  fuege('/pfad/themen', 0.8);
  for (const eintrag of themenDomaenen(daten)) {
    if (eintrag.anzahl > 0) fuege(`/pfad/themen/${encodeURIComponent(eintrag.domaene)}`, 0.7);
  }

  for (const eintrag of spielformen(daten)) {
    if (eintrag.anzahl > 0) fuege(`/pfad/spielform/${encodeURIComponent(eintrag.spielform)}`, 0.7);
  }

  fuege('/pfad/umgebung', 0.7);
  for (const eintrag of witterungen(daten)) fuege(`/pfad/witterung/${encodeURIComponent(eintrag.witterung)}`, 0.6);
  for (const eintrag of untergruende(daten)) fuege(`/pfad/untergrund/${encodeURIComponent(eintrag.untergrund)}`, 0.6);

  fuege('/training', 0.8);
  for (const einheit of daten.einheiten) fuege(`/training/${encodeURIComponent(einheit.id)}`, 0.6);

  fuege('/regeln', 0.8);
  fuege('/turnier', 0.7);
  fuege('/ausruestung', 0.8);
  fuege('/ueber', 0.5);
  fuege('/mitmachen', 0.5);
  fuege('/impressum', 0.2);
  fuege('/datenschutz', 0.2);

  for (const baustein of daten.bausteine) fuege(`/baustein/${encodeURIComponent(baustein.id)}`, 0.7);

  return liste;
}

function esc(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function baueSitemap(routen, siteUrl) {
  const eintraege = routen
    .map(
      (r) => `  <url>
    <loc>${esc(siteUrl + r.pfad)}</loc>
    <changefreq>monthly</changefreq>
    <priority>${r.prioritaet.toFixed(1)}</priority>
  </url>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${eintraege}\n</urlset>\n`;
}
