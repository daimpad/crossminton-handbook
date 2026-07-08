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
- **Mehrere Inhaltsdateien, ein Pool.** `INHALTSDATEIEN` in `js/daten.js` listet die zu mischenden `bausteine.<stufe>-<domaene>.json`; `baueIndizes` konkateniert deren `bausteine`/`delta_bausteine`. Die erste Datei mit `vokabulare` ist die kanonische Quelle — weitere Blöcke tragen keins und dürfen nur existierende Vokabel-Werte nutzen. Neue Datei = ein Eintrag in `INHALTSDATEIEN` plus Titel-Lift (s. u.).
- **Herkunftsreine Delta-Dateien sind erlaubt** (`bausteine.delta-<herkunft>.json`, z. B. `delta-tennis`): nur `delta_bausteine`, keine Basis-Bausteine. Sie docken per `basis_baustein` an Bausteine *anderer* Dateien an, auch stufen-/domänenübergreifend — `baueIndizes` mischt sie wie jede andere Datei, `deltaVonSchluessel` ist auf `basis::herkunft` indiziert. Die **Onboarding-Herkunftsliste (`daten.herkuenfte`) leitet sich allein aus dem Delta-Bestand ab** — eine neue Herkunft wird wählbar, sobald ein Delta sie trägt (kein separater Schritt). Ein Baustein kann Deltas mehrerer Herkünfte tragen (z. B. `griff` → `griff_delta_bad` und `griff_delta_ten`); zur Laufzeit blendet `deltaFuer(id, diagnose().herkunft)` genau das der gewählten Herkunft ein. Deltas tragen nie einen Übungsteil und kein eigenes Label (die H1 nutzt den Basis-Titel); `anzeigetitel` am Delta ist redaktionell/inert.
- **`reflexionsaufgabe` ist ein eigener Aufgabenteil** (Taktik-Domäne), Geschwister des Übungsteils mit eigenem `erledigt`-Status — nicht Teil des Erklärteils. `aufgabenTeile()` in `js/daten.js` gibt die quittierbaren Teile ({uebungsteil, reflexionsaufgabe}); „absolviert" = Erklärteil + alle Aufgabenteile. Pro Baustein liegt genau eines von beiden vor.
- **Titel dürfen inline stehen** (`anzeigetitel.de` im Baustein), müssen aber nach `labels/de.json` geliftet werden — der Laufzeit-Titelpfad bleibt einheitlich das Label-File. Der Lift-Schritt (kleines Node-Skript) läuft bei jeder Datenänderung mit der Skelett-Regeneration.
- **`voraussetzungen_querverweis` ist Dokumentation**, keine Graph-Kante (wie `*_hinweis`/`*_beleg`). Der Graph liest ausschließlich `voraussetzungen`. Der Voraussetzungsgraph darf verzweigen (nicht nur lineare Ketten) — `topoSortiere` (Kahn) löst das auf.
- **JSON der Referenzinhalte nicht umformatieren** — der *Inhalt* von `data/bausteine.beginner-technik.json` bleibt byte-identisch. Einzige erlaubte Änderung: koordinierte Vokabular-Erweiterungen in `vokabulare` (z. B. neue `transfer_herkunft`-Kürzel), minimal und formattreu, mit Label in `labels/de.json`. Andere Vokabular-Werte (Domänen, Stufen) analog.
- **Sternförmiger Graph** ist zulässig (Mentales/Athletik): alle Werkzeug-Bausteine hängen an einem Rahmen-Einstieg, nicht aneinander. `topoSortiere` löst das als Baum auf (Wurzel zuerst, Blätter in Pool-Reihenfolge). Zusammen mit der Taktik-Rückverzweigung die zweite nicht-lineare Graphform.
- **Kompetenzpfad ist über Könnensstufen kumulativ** (`js/pfade.js`): `kompetenzpfad(stufe)` zeigt alle Bausteine *bis einschließlich* der gewählten Stufe (ein Fortgeschrittener sieht Beginner + Fortgeschritten), jeder einmalig an seiner niedrigsten Stufe. `kompetenzVergleicher` sortiert Stufe primär → Stufen-Blöcke. Trainer bleibt orthogonal-exakt. `voraussetzungen` dürfen stufenübergreifend zeigen (weiche Kante, ordnet nie sperrt) — der Baustein wird dabei nie umklassifiziert.
- **Weiche Kanten dürfen Stufen- UND Domänengrenze zugleich queren** (Fortgeschritten-Taktik → Fortgeschritten-Technik, z. B. `punkt_aufbauen` → `ueberkopf_clear`/`kurzes_spiel_stopp`). Wie jede Voraussetzung: sie *ordnet* nur (Technik-Block vor Taktik-Block innerhalb der Stufe), reklassifiziert nie und sperrt nie. Klassifiziert wird ausschließlich über die eigenen `domaene`/`kompetenzstufe`-Felder, nie über die Kanten. Im kumulativen Pfad landen die Ziel-Bausteine in der Menge (kein „Außerhalb"-Hinweis); im Themenpfad kumuliert die Domäne stufenübergreifend (Taktik = Beginner- dann Fortgeschritten-Block).
- **Individualpfad ist ebenfalls stufen-kumulativ** (`js/pfade.js`, `individualpfad`): Er filtert nach Zielfaktor(en) *und* nach der Diagnose-Stufe — bei gesetzter Stufe nur Bausteine bis einschließlich dieser Stufe (ein Beginner sieht die Beginner-Leiter eines Faktors, ein Fortgeschrittener Beginner + Fortgeschritten). Ohne bekannte Stufe (`indexOf < 0`, z. B. „direkt ins Handbuch" — dann aber ohnehin kein Ziel) wird nicht gefiltert, nie verbergen. Anders als der Kompetenzpfad bleiben die Stationen ziel-nah → domänen-geordnet (nicht stufen-blockiert): `zielVergleicher` sortiert Ziel-Treffer primär, Stufe steckt nur in der Mengen-Auswahl. Ein Faktor, dessen einziger Beleg auf einer höheren Stufe liegt (z. B. `doppel_spezifische_loesungen`), ergibt für einen Beginner eine leere Menge — kein Fehlerfall.
- **`spielform` ist eine eigene Metadaten-Dimension** (zweite Feld-Erweiterung nach `reflexionsaufgabe`), **orthogonal zur Domäne**: Werte `einzel` (Default) / `doppel`; fehlendes Feld = `einzel` (`spielformVon()` in `js/daten.js`), alle Alt-Bausteine gelten damit ohne Migration als Einzel. Ein Doppel-Baustein trägt *weiter* seine fachliche `domaene`/`kompetenzstufe` und erscheint unverändert in Kompetenz-/Themen-/Individualpfad — `spielform` klassifiziert nichts um. Zusätzlich bündelt die **Spielform-Achse** (`spielformpfad`, Route `#/pfad/spielform/doppel`) alle `spielform:doppel`-Bausteine domänenübergreifend zu *einem* Thema (Ordnung: reine Pool-/Erzählreihenfolge via `poolVergleicher`, nicht domänen-blockiert). Die Achse ist eine Perspektive wie der Kompetenzpfad: der **Cross-Sport-Modifikator ist hier verdrahtet** (Herkunft → Delta, auch in `stationImKontext` für den `spielform:`-Kontext), denn die Herkunft ist gerade beim Doppel inhaltlich relevant (Badminton-Umstieg). `einzel` ist kein Thema (praktisch alle Bausteine) — `spielformen()` bietet nur ausgezeichnete Spielformen an. Vokabular in der kanonischen Technik-Datei, Label unter `vokabeln.spielform`.

## Sprache

Quellsprache ist Deutsch; Code, Kommentare und UI-Texte sind auf Deutsch gehalten. Tonalität sachlich-klar, nicht werblich — konsistent mit den Lerninhalten.
