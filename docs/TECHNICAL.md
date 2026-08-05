# Technische Dokumentation

Technischer Überblick zum Crossminton-Handbuch. Die verbindliche, vollständige Spezifikation liegt in [`uebergabe-spezifikation.md`](uebergabe-spezifikation.md); dieses Dokument fasst sie für den Einstieg zusammen. Eine tiefere Entwickler-Referenz (Modulgrenzen, Tests, Datenpflege) steht in [`../ENTWICKLUNG.md`](../ENTWICKLUNG.md), die Arbeitsregeln für Beitragende in [`../CLAUDE.md`](../CLAUDE.md).

## Überblick & Ansatz

Die App ist eine inhaltsgetriebene, statische Web-App: Der gesamte Lernstoff liegt in versionierten JSON-Dateien, die Oberfläche rendert daraus Pfade, Bausteine und Reiter. **Kein Build-Schritt, keine Server-Komponente, keine npm-Laufzeitabhängigkeiten** — ES-Module direkt im Browser. Fortschritt lebt in `localStorage`; ein Konto gibt es nicht.

Quellsprache ist Deutsch. Oberfläche **und** Inhalte liegen vollständig in `de`, `en`, `fr` und `pl` vor (616 UI-Labels, 850 Inhaltsknoten, je 100 %). Die Sprachliste steht als `ZIELSPRACHEN`/`SPRACHEN` in `js/i18n.js` — eine Quelle für App und Skripte.

## Datenmodell: der Baustein

Kleinste Lerneinheit ist der Baustein. Alle 108 liegen in einem gemeinsamen Pool (`data/bausteine.*.json`) und tragen ein einheitliches Schema:

1. **Domäne** — genau ein Wert: `technik`, `taktik`, `trainingsgestaltung`, `mentales`, `athletik_kondition`, `ausruestung`.
2. **Kompetenzstufe** — Mehrfach: `beginner`, `fortgeschritten`, `experte`, `trainer` (orthogonal).
3. **Baustein-Typ** — genau einer: `micro`, `vertiefung`, `delta`, `fehlerbild`, `umgebungs_baustein`, `modus_baustein`.
4. **Voraussetzungen** — weiche, nicht-lineare Sortierkanten (sperren nie).
5. **Lernziele** — Spielziele (6 Bereiche, inkl. Umgebungsanpassung) und Vermittlungsziele (Trainer).
6. **Transfer-Herkunft** — Mehrfach: `CM`, `BAD`, `TEN`, `SQ`, `BS`, `SP`, `AT`.
7. **Untergrund** — Liste: `halle` (Default), `sand`, `rasen`, `asche`, `kunstrasen`, `schnee`.
8. **Witterung** — Liste: `wind`, `sonne_blendung`, `naesse`, `hitze`, `kaelte`, `dunkelheit`.
9. **Innere Struktur** — `erklaerteil` (immer) plus höchstens eines von `uebungsteil` / `reflexionsaufgabe`.
10. **Abschluss-Status** — `offen → erledigt`; `beherrscht` vorgehalten, aber inaktiv.
11. **Spielform** — `einzel` (Default) / `doppel`.
12. **Trainings-Metadaten** — nur an Bausteinen mit `uebungsteil`: `geeignete_phase`, `dauer_klasse`, `intensitaet`, `fokus`. Bewusst Klassen statt Minuten (kein Dosierungsversprechen).

Das kanonische Vokabular liegt in `data/bausteine.beginner-technik.json` unter `vokabulare`; weitere Inhaltsdateien tragen keins und dürfen nur bestehende Werte nutzen.

**Identität getrennt von Beschriftung:** sprachneutrale IDs stehen in der Inhalts-JSON, sichtbare Texte in `data/labels/<sprache>.json`. Inhaltstexte sind `"<sprache>":`-Zwillinge neben jedem `"de":`-Knoten.

## Cross-Sport-Deltas

Deltas ersetzen bei passender Herkunft nur den `erklaerteil` eines Basis-Bausteins (`ersetzt_bei_herkunft`, `eigener_uebungsteil: false`) — derselbe Baustein, andere Erklärung, gleiche Übung. Sie sind **keine eigenen Stationen** und greifen nur im Kompetenz- bzw. Spielform-Kontext. Die Onboarding-Herkunftsliste leitet sich automatisch aus dem Delta-Bestand ab. Herkunftsreine Dateien: `data/bausteine.delta-tennis.json` (8), `data/bausteine.delta-squash.json` (6); die 10 Badminton-Deltas liegen inline. Derzeit 24 insgesamt. Die Experten-Stufe ist herkunftsneutral (0 Deltas).

## Weitere Entitäten (außerhalb des Baustein-Pools)

Kein Fortschritt, keine Voraussetzungen, keine Gamification:

- `data/trainingseinheiten.json` — 8 kuratierte Einheiten in drei Phasen (Erwärmung/Hauptteil/Ausklang); Referenzen zeigen 1:1 auf Bausteine mit `uebungsteil`.
- `data/fehlerbilder.json` — 32 Fehlerbilder (Trainer-Layer), je über `basis_baustein` an einen Baustein gehängt und in situ gerendert; `erklaerteil` trägt Symptom / Ursache / Korrektur.
- `data/regeln.json` — der Regeln-Reiter: 13 Abschnitte, 44 Regeln. Quelle: offizielles ICO-Regelwerk, **abgeglichen mit der Fassung 2024/dec**.
- `data/turnierregeln.json` — das Turnier-Regularium als interaktiver Filter: 5 Stufen, 5 Kategorien, 26 Anforderungen, 2 Varianten. Nicht rein kumulativ — jede Anforderung trägt je Stufe eigenen Text und eigene Pflichtigkeit.
- `data/app-info.json` — „Über"/„Mitmachen", Rechtstexte und die Sprachliste. Die Sprachwahl im Kopf schaltet funktional um (`funktion_aktiv: true`).

## Navigation & Pfad-Engine

Es gibt *einen* Pool; die Pfade sind Traversierungen darüber (`js/pfade.js`), Inhalt liegt nie doppelt vor.

- **Kompetenzpfad** — stufen-kumulativ: 34 / 66 / 93 Stationen für Beginner / Fortgeschritten / Experte.
- **Themenpfad** — nach Domäne, ohne Stufenlogik.
- **Individualpfad** — nach selbst gewähltem Ziel, ebenfalls stufen-kumulativ.
- **Trainingspfad** — die kuratierten Einheiten, stufen-kumulativ gefiltert.

Darüber liegen orthogonale Achsen: `spielform` (Doppel über alle drei Stufen, 18 Bausteine) sowie `witterung` / `untergrund` (Outdoor und Spielmodi, Typ `umgebungs_baustein`, 10 Bausteine — aus Kompetenz- und Themenpfad herausgefiltert, damit der Stufen-Ladder frei vom Sonderkontext bleibt).

**Zwei-Ebenen-Logik:** Der Voraussetzungsgraph *sortiert* nur, er *sperrt nie*. Fehlende Voraussetzungen erscheinen als Hinweis, nie als Zugangssperre. Kanten dürfen Stufen- und Domänengrenzen queren, ohne einen Baustein umzuklassifizieren. Der Cross-Sport-Modifikator blendet Deltas passend zur gewählten Herkunft ein.

## Routing, SEO und Auslieferung

- **History-API-Routing**, kein Hash. Ansichten schreiben intern `href="#/…"`; `normalisiereLinks()` zieht das nach jedem Rendern auf echte Pfade. Der Montagepunkt kommt aus `document.baseURI`.
- **Sprache in der URL:** Deutsch präfixlos an der Wurzel, die anderen unter `/en/`, `/fr/`, `/pl/`. Die URL entscheidet, nicht die gespeicherte Vorliebe — sonst zeigte dieselbe Adresse je Besucher anderen Inhalt. Ergibt 596 indexierbare Adressen; `sitemap.xml` ist eingecheckt und wird von `scripts/sitemap.mjs` erzeugt.
- **Titel, Beschreibung, Canonical und JSON-LD** leitet `js/seo.js` je Route aus denselben Funktionen ab, die die Ansicht schon für ihre Überschrift nutzt — keine zweite gepflegte Textliste.
- **Deploy-Prerendering:** `scripts/prerender.mjs` bootet die App einmal in einem Playwright-Tab und legt je Route einen statischen Schnappschuss ab, damit Crawler und Social-Vorschauen ohne JavaScript echten Inhalt sehen. Playwright ist eine reine CI-Werkzeug-Abhängigkeit; lokal bleibt alles buildfrei.
- **Produktion** läuft auf einem eigenen Server unter `crossminton-handbook.de` und zieht den Branch `deploy` per Git-Pull — **dort gibt es keinen Build-Schritt**, was nicht eingecheckt ist, existiert nicht. `.htaccess` ist der SPA-Fallback für Apache, `404.html` derselbe für GitHub Pages (Zweitauftritt).

## Grafiksystem

Alle **63 Diagramme** sind hand-gezeichnetes Inline-SVG, durchnummeriert (`G-001` …) und im Katalog [`../images/grafik-prompts.md`](../images/grafik-prompts.md) dokumentiert. Sie nutzen ausschließlich CI-Tokens (`var(--tinte)`, `var(--primaer)`) und kippen darum automatisch mit dem Hell-/Dunkel-Umschalter.

Je Grafik liegen `G-XXX.svg` **und** `G-XXX.png` vor: die Ansicht rendert zuerst das PNG als sofort sichtbaren Fallback und tauscht es nach dem Rendern gegen das Inline-SVG. Beschriftungen sind übersetzt — zu jeder Grafik existiert ein `G-XXX.<sprache>.svg`/`.png`-Zwilling für `en`, `fr`, `pl`. Integration über das optionale Feld `grafik: ["G-XXX"]` je Baustein (Liste, Sequenzen tragen mehrere); 61 der Grafiken hängen an einem Baustein, zwei sind Referenzgrafiken im Regeln-Reiter.

## Fortschritt, Werkzeuge, Offline

Fortschritt ist **baustein-gebunden**, nie pfad-gebunden: ein in einer Einheit quittierter Übungsteil gilt pool-weit als erledigt. Der Zustand liegt versioniert in `localStorage` (`js/zustand.js`, einziger Zugriffspunkt) und übersteht auch beschädigte oder fremde Stände — ein unbrauchbarer Wert kann die Vorgabe nicht ersetzen.

Darüber hinaus rein clientseitig: **Trainingsplan** (`js/plan.js`, deterministisch, mit PDF- und `.ics`-Export), **KO-Turnier** (`js/ko-turnier.js`), **Volltextsuche** (`js/suche.js`), **Merkliste**.

**Offline** über einen buildfreien Service Worker (`sw.js`, klassisches Skript): die App-Hülle wird vorgeladen, Navigationen laufen netz-zuerst mit gecachter Hülle als Fallback, alles andere stale-while-revalidate. Bei einer neuen Kern-Datei muss sie in `SHELL` aufgenommen **und** der `CACHE`-Name erhöht werden.

## Barrierefreiheit

Farben und Kontraste sind gegen WCAG AA geprüft, hell wie dunkel; Signalfarben folgen einer Ampellogik und sind nie dekorativ. Die App ist vollständig mit der Tastatur bedienbar: jedes Bedienelement liegt im Tab-Ring, der Fokus ist sichtbar, das Hauptmenü ist ein modaler Dialog mit Fokusführung — und der Fokus behält seine Stelle, wenn eine Ansicht sich nach einer Aktion neu aufbaut. `prefers-reduced-motion` wird respektiert.

## Setup & Betrieb

Kein Build-Schritt. `fetch()` der JSON-Inhalte verlangt HTTP — also über einen lokalen Server testen, nicht per `file://`:

```sh
python3 -m http.server 8000        # im Repo-Root
node tests/engine.test.mjs         # Engine-Tests, dependency-frei
node scripts/i18n-check.mjs        # en/fr/pl spiegeln de strukturell
node scripts/sitemap.mjs           # nach jeder Datenänderung
cd data && python3 ../validate.py  # Inhaltsregeln
```

Der Loader muss `untergrund` sowohl als String (Altwert `"halle"`) wie als Liste akzeptieren.

## Projektstruktur

```
.
├── README.md                      ← Konzept & Angebot (nur Übersicht)
├── CLAUDE.md                      ← Arbeitsregeln für Beitragende
├── ENTWICKLUNG.md                 ← tiefe Entwickler-Referenz
├── index.html / 404.html          ← Shell + SPA-Fallback (GitHub Pages)
├── sw.js                          ← Service Worker (offline)
├── .htaccess                      ← SPA-Fallback (Apache/Produktion)
├── manifest.json robots.txt sitemap.xml CNAME
├── css/                           ← app.css, schriften.css, feedback.css
├── js/
│   ├── daten.js graph.js          ← Daten: Indizes + Konsistenzprüfung
│   ├── pfade.js fortschritt.js aktionen.js plan.js ko-turnier.js suche.js
│   │                              ← Engine: rein, DOM-frei, testbar
│   ├── zustand.js                 ← einziger localStorage-Zugriff
│   ├── i18n.js seo.js oberflaeche.js analytics.js version.js
│   ├── ansichten/*.js             ← rendern HTML + binden Events
│   └── app.js                     ← Boot, Router, Menü
├── data/
│   ├── bausteine.*.json           ← Baustein-Pool (23 Dateien, inkl. Deltas)
│   ├── trainingseinheiten.json fehlerbilder.json
│   ├── regeln.json turnierregeln.json app-info.json
│   └── labels/{de,en,fr,pl}.json  ← sichtbare Beschriftungen
├── images/                        ← G-001…G-063 als .svg/.png je Sprache
├── docs/                          ← TECHNICAL.md, Spezifikation, ci.md, Glossare
├── scripts/                       ← sitemap.mjs prerender.mjs routen.mjs i18n-*.mjs
├── vendor/                        ← lokal eingecheckte Fremdbibliotheken
├── rules/                         ← Original-PDFs (Regeln, Turnier)
└── tests/engine.test.mjs          ← dependency-freie Engine-Tests
```

## Weiterführend

Die vollständige Modell- und Entscheidungsdokumentation steht in [`uebergabe-spezifikation.md`](uebergabe-spezifikation.md) — bei Konflikten gewinnt sie. Die Arbeitsregeln und die gesammelten Fallstricke stehen in [`../CLAUDE.md`](../CLAUDE.md).
