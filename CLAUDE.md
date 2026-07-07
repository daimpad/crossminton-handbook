# CLAUDE.md

Leitfaden für Beitragende und KI-Assistenten, die an dieser Codebasis arbeiten. Kurz halten, was der Code schon sagt; hier steht nur, was man **wissen muss, bevor** man etwas ändert.

## Was das ist

Clientseitige Lernapp für Crossminton. Rein statisch: HTML/CSS/JS als ES-Module, **kein Build-Schritt, keine Server-Komponente, keine npm-Laufzeitabhängigkeiten**. Inhalte kommen aus JSON in `data/`, Fortschritt lebt in `localStorage`. Maßgeblich ist die Spezifikation in `docs/uebergabe-spezifikation.md` — bei Konflikten gewinnt sie.

## Nicht verhandelbare Architektur

- **Rein clientseitig.** Keine Abhängigkeit, die einen Bundler oder eine Laufzeit voraussetzt. Bibliotheken, wenn überhaupt, als lokal eingecheckte statische Datei (so wie die Schriften).
- **Inhalt getrennt vom Pfad.** Es gibt *einen* Baustein-Pool; die vier Pfade sind Traversierungen darüber (`js/pfade.js`). Inhalt wird nie dupliziert.
- **Identität getrennt von Beschriftung.** Sprachneutrale IDs stehen in der Inhalts-JSON, sichtbare Texte in `data/labels/<sprache>.json`. Nie einen Anzeigetext hart in JS/HTML schreiben — immer `t()`, `label()` oder `text()` aus `js/i18n.js`.
- **Fortschritt ist baustein-gebunden.** Status hängt am Baustein, nie am Pfad (Spez. 7.5). Der Zustandsraum ist erweiterbar: `offen → erledigt` aktiv, `beherrscht` vorgesehen, aber inaktiv — keine Datenmigration bei späterer Aktivierung.
- **Zwei-Ebenen-Logik (Spez. 4.4).** Der Voraussetzungsgraph *sortiert* nur, er *sperrt nie*. Fehlende Voraussetzungen erscheinen als Hinweis, nie als Zugangssperre.

## Wo was liegt

| Ebene | Dateien | Regel |
| --- | --- | --- |
| Daten | `js/daten.js`, `js/graph.js` | reine Funktionen, kein DOM; Indizes + Konsistenzprüfung |
| Engine | `js/pfade.js`, `js/fortschritt.js`, `js/aktionen.js` | reine Funktionen über Daten+Zustand → annotierte Listen; **kein DOM** |
| Zustand | `js/zustand.js` | einziger localStorage-Zugriff, versioniertes Schema |
| i18n | `js/i18n.js` | alle sichtbaren Texte laufen hier durch |
| Ansichten | `js/ansichten/*.js` | rendern HTML-Strings + binden Events; lesen die Engine, mutieren nie direkt |
| Shell | `js/app.js` | Boot, Hash-Router, Menü |

Faustregel: **Logik gehört in die Engine (testbar, DOM-frei), nicht in die Ansichten.** Neue Regeln zuerst in `js/pfade.js`/`js/fortschritt.js`, dann in `tests/engine.test.mjs` absichern.

## Verifikation (Pflicht vor jedem Commit)

```sh
node tests/engine.test.mjs          # Engine gegen die Referenzdaten (dependency-frei)
python3 -m http.server 8000         # dann im Browser durchklicken
```

Für den End-to-End-Durchlauf (Playwright, mobil + Desktop) siehe `.claude/skills/verify/SKILL.md` — dort steht der komplette Fahrplan inkl. der heiklen Stellen (Delta nur im Kompetenz-Kontext, Ampel-Status, Wizard-Ausstieg, Hamburger). **Verifikation heißt: die laufende App beobachten, nicht nur Tests laufen lassen.**

## CI / Design

Farben, Typografie und Icon-Regeln stehen in `docs/ci.md` und sind als CSS-Variablen in `css/app.css` (`:root`) zentralisiert. Verbindlich:

- **Hauptfarbe `#38a4f1`**; H1/H2 immer blau.
- **Signalfarben nach Ampellogik**, nie dekorativ: Rot `#f91f05` = offen, Gelb `#f4e248` = teilweise/Hinweis, Grün `#25c449` = erledigt.
- **Icons immer farbig, nie schwarz** (Font Awesome Solid, lokal). Neue Icons: eine Codepoint-Zeile in `css/schriften.css`; Baustein-Icons in `js/oberflaeche.js` (`BAUSTEIN_ICONS`).
- **Container-Radius 10px**, Hover-Schatten nur auf Zeigergeräten, `prefers-reduced-motion` respektieren.

## Fallstricke

- **`file://` funktioniert nicht** — `fetch()` der JSON braucht HTTP. Immer über einen lokalen Server testen.
- **Nach Datenänderung Skelette neu erzeugen:** `data/labels/{en,fr,pl}.json` sind strukturgleiche Gerüste von `de.json`; beim Hinzufügen neuer de-Schlüssel die Skelette regenerieren (leere Werte fallen zur Laufzeit auf de zurück).
- **Deltas sind keine eigenen Stationen.** Ein Delta ersetzt nur den Erklärteil in situ und nur im Kompetenz-Kontext bei passender Herkunft; der Übungsteil bleibt der reguläre (Spez. 4.2/5).
- **Fehlerbilder (Trainer-Layer) sind auch keine Stationen.** Eigene Entitäten in `data/fehlerbilder.json` (`fehlerbild_bausteine`), je über `basis_baustein` an einen Baustein gehängt — analog zur Delta-Signatur, aber gerendert als in-situ Sektion in der Baustein-Ansicht, nur wenn `diagnose().trainer` gesetzt ist. Nie im Baustein-Pool, nie in einer Pfad-Sequenz. `erklaerteil.de` trägt die drei Felder `symptom`/`ursache`/`korrektur`, kein eigener Übungsteil. Neue Fehlerbilder brauchen einen Titel in `labels/de.json` unter `fehlerbilder` (Test prüft das mit).
- **Ziele sind eine Liste** (Mehrfachauswahl). `zielEintraege()` in `js/pfade.js` normalisiert alte Einzelziel-Objekte mit — beim Umgang mit `diagnose().ziel` nie ein einzelnes `{dimension, faktor}` annehmen.
- **JSON der Referenzinhalte nicht umformatieren** — `data/bausteine.beginner-technik.json` wurde byte-identisch übernommen.

## Sprache

Quellsprache ist Deutsch; Code, Kommentare und UI-Texte sind auf Deutsch gehalten. Tonalität sachlich-klar, nicht werblich — konsistent mit den Lerninhalten.
