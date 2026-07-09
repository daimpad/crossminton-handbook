# Crossminton-Handbuch

Clientseitige, mobil-orientierte Lernapp für Crossminton. Kein Server, kein Build-Schritt: HTML/CSS/JS als ES-Module, Inhalte aus statischen JSON-Dateien, Fortschritt baustein-gebunden in `localStorage`, mehrsprachig strukturiert (Quellsprache Deutsch befüllt). Konzeptionelle Grundlage: [`docs/uebergabe-spezifikation.md`](docs/uebergabe-spezifikation.md); visuelles Erscheinungsbild: [`docs/ci.md`](docs/ci.md).

**Live:** https://daimpad.github.io/crossminton-handbook/

## Was die App kann

- **Willkommensseite** mit zwei Einstiegen: direkt ins Handbuch (alle Kapitel frei, ohne Angaben) oder der geführte Weg über die Stufen-Diagnostik.
- **Vier Pfade** durch denselben Baustein-Pool: Kompetenz-, Themen-, Individual- und Trainingspfad, dazu die Spielform-Achse (das Doppel als Querschnittsthema über Domänen) und der Cross-Sport-Modifikator (angepasste Erklärungen für Umsteiger, z. B. aus Badminton).
- **Getrennte Fortschritts-Quittierung** je Erklär- und Übungsteil, Projektionen (global/pfadbezogen), Meilensteine und kumulative Kontinuität — alles lokal im Browser.
- **Mobil zuerst**, hell, mit lokaler Schrift (Rubik) und Font-Awesome-Icons; Bottom-Bar auf dem Handy, Hamburger-Menü ab Tablet.

## Starten

Die Inhalte werden zur Laufzeit per `fetch()` geladen — dafür braucht es HTTP (ein Doppelklick auf `index.html` genügt nicht, `file://` blockiert das Laden). Lokal reicht ein Einzeiler im Projektordner:

```sh
python3 -m http.server 8000
# oder: npx serve
```

Dann `http://localhost:8000` öffnen.

## Veröffentlichen

Die App ist reine Statik — **auf dem Server braucht es weder Node noch Python**, keine Datenbank, keine Laufzeitumgebung. Node/Python dienen oben nur als lokale Vorschau-Server.

- **GitHub Pages** (eingerichtet): Jeder Push auf `main` veröffentlicht automatisch über [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) nach `https://daimpad.github.io/crossminton-handbook/`. Vorher laufen die Engine-Tests als Qualitätsschranke.
- **Eigener Webspace**: alle Dateien des Repos (ohne `.git`, `.github`, `tests`, `docs`) per FTP/SFTP in ein Verzeichnis hochladen — fertig. Es genügt jeder Webserver, der Dateien ausliefert (Apache, nginx, Shared Hosting). Alle Pfade sind relativ, die App läuft daher auch in Unterverzeichnissen.

## Tests

Die Pfad-Engine wird ohne Abhängigkeiten direkt unter Node gegen die Referenzdaten geprüft:

```sh
node tests/engine.test.mjs
```

Abgedeckt: Datenvalidierung, Kompetenz-/Themen-/Individualpfad (inkl. Mehrfach-Zielauswahl), Cross-Sport-Modifikator (Delta-Einblendung, Skip-Kandidaten, Nicht-Fehlerfall), Zwei-Ebenen-Logik, Projektionen, Kontinuität und die Vollständigkeit der de-Labels.

Ein durchgehender End-to-End-Browsertest (Playwright, mobil + Desktop) liegt außerhalb des Repos in der Entwicklungsumgebung; sein Ablauf ist in `.claude/skills/verify/SKILL.md` dokumentiert.

## Struktur

```
index.html                 App-Shell (SPA, Hash-Routing) + Modul-Auffangnetz
css/app.css                Design & CI (#38a4f1 + Signalfarben), mobile Bottom-Bar / Desktop-Hamburger
css/schriften.css          lokale Schriften: Rubik + Font-Awesome-Subset (Icons ergänzen = eine Codepoint-Zeile)
assets/fonts/              woff2-Dateien inkl. Lizenzen (OFL / FA Free)
js/
  app.js                   Boot, Router, Navigation, Hamburger-Menü
  daten.js                 JSON laden, Indizes, Konsistenzprüfung
  graph.js                 topologische Sortierung, Voraussetzungs-Checks
  pfade.js                 Pfad-Engine: 4 Traversierungen + Cross-Sport-Modifikator
  fortschritt.js           Projektionen über den baustein-gebundenen Status
  aktionen.js              Quittierungen + Meilenstein-Erkennung
  zustand.js               localStorage-Store (Diagnose, Fortschritt, Kontinuität, Einstellungen)
  i18n.js                  t()/label()/text() mit de-Fallback
  oberflaeche.js           geteilte UI-Helfer, Baustein-Icons
  ansichten/               Willkommen, Onboarding, Heim, Pfadlisten, Baustein, Training, Profil, Zielwahl
data/
  bausteine.beginner-technik.json   Referenzinhalt Technik; kanonisches Vokabular (nur koordinierte Erweiterungen)
  bausteine.beginner-taktik.json    Inhaltsblock Taktik (reflexionsaufgabe, Rückverzweigung im Graph)
  bausteine.beginner-mentales.json  Inhaltsblock Mentales (Sternform-Graph, durchgehend Reflexionsaufgaben)
  bausteine.beginner-athletik_kondition.json  Inhaltsblock Athletik (Sternform, Übung + Reflexion gemischt)
  bausteine.fortgeschritten-technik.json  erste Stufe über Beginner; stufenübergreifende Voraussetzungen
  bausteine.fortgeschritten-taktik.json   Fortgeschritten-Taktik; weiche Kanten über Stufen- UND Domänengrenze
  bausteine.fortgeschritten-mentales.json Fortgeschritten-Mentales (mentales System; durchgehend Reflexionsaufgaben)
  bausteine.fortgeschritten-athletik_kondition.json  Fortgeschritten-Athletik (Gesundheitsrahmen; Reflexion + qualitative Übung)
  bausteine.doppel-thema.json       Doppel als Querschnittsthema über Domänen (Dimension spielform:doppel)
  bausteine.delta-tennis.json       herkunftsreine Delta-Datei (nur delta_bausteine, Herkunft TEN, über zwei Stufen)
  bausteine.delta-squash.json       herkunftsreine Delta-Datei (Herkunft SQ; auch auf zuvor delta-freie Taktik-Bausteine)
  fehlerbilder.json                 Trainer-Layer je Baustein (Symptom/Ursache/Korrektur), in-situ gerendert
  trainingseinheiten.json           kuratierte Einheiten in drei Phasen (Erwärmung/Hauptteil/Ausklang), stufen-/spielform-getaggt
  labels/de.json                    alle sichtbaren Beschriftungen (Quellsprache)
  labels/{en,fr,pl}.json            strukturgleiche Gerüste, unbefüllt → Fallback auf de
docs/uebergabe-spezifikation.md     Spezifikation (Erstausbau)
docs/ci.md                          Corporate Identity: Farben, Typo, Icons
tests/engine.test.mjs               Engine-Tests (node, dependency-frei)
CLAUDE.md                           Leitfaden für Beitragende / KI-Assistenten
```

## Datenpflege

- **Inhalte** (`data/bausteine.<stufe>-<domaene>.json`): Quellformat gemäß Spezifikation, Abschnitt 3. Mehrere Inhaltsdateien werden zu einem Pool gemischt — neue Datei in `INHALTSDATEIEN` (`js/daten.js`) eintragen; nur die Technik-Datei trägt das kanonische `vokabulare`. Bausteine können einen inline-`anzeigetitel` tragen (wird nach `labels/de.json` geliftet) und in der Taktik-Domäne statt des Übungsteils eine `reflexionsaufgabe` (eigener quittierbarer Aufgabenteil). Ein passendes Icon lässt sich in `js/oberflaeche.js` (`BAUSTEIN_ICONS`) ergänzen. Die Engine-Tests prüfen Titel-Vollständigkeit, Reihenfolge und Reflexions-Status mit.
- **Beschriftungen** (`data/labels/de.json`): Erstfassungen aus der Implementierung — redaktionell prüfen. Offen vermerkt: das ausgeschriebene Label für die Transfer-Herkunft `BS`.
- **Fehlerbilder / Trainer-Layer** (`data/fehlerbilder.json`): eigene Entitäten mit `basis_baustein`-Relation, `typ: "fehlerbild"`, `kompetenzstufe: ["trainer"]`, `erklaerteil.de` mit den Feldern `symptom`/`ursache`/`korrektur`, kein Übungsteil. Werden nur in der Trainer-Perspektive in-situ im Basisbaustein gezeigt, nie als eigene Station. Jedes braucht einen Titel in `data/labels/de.json` unter `fehlerbilder`. Im Erstausbau ein Platzhalter-Beispiel — die redaktionelle Serie ersetzt es.
- **Trainingseinheiten** (`data/trainingseinheiten.json`): kuratierte Einheiten, gegliedert in drei Phasen (`phasen.{erwaermung, hauptteil, ausklang}`) mit je `{baustein, hinweis}`-Referenzen auf Bausteine, deren **Übungsteil** gemeint ist (nie Reflexions-Bausteine). Jede Einheit trägt `titel` (nach `labels/de.json` geliftet), `kompetenzstufe` (steuert die stufen-kumulative Filterung im Trainingspfad), `spielform`, `schwerpunkt` und `beschreibung`. Frei ersetzbar/erweiterbar.
- **Übersetzungen**: Werte in `data/labels/{en,fr,pl}.json` befüllen; leere Werte fallen zur Laufzeit auf `de` zurück. Baustein-Texte werden je Sprache direkt in der Inhaltsdatei ergänzt (`erklaerteil.en` usw.).

## Bewusste Ausbaustufen (strukturell vorgehalten, nicht umgesetzt)

- Offline-Fähigkeit als PWA (statische Inhalte, relative Pfade — Manifest + Service Worker genügen später).
- Schlanke Server-Komponente für geräteübergreifenden Fortschritt.
- Abschluss-Status `beherrscht` (Mastery): im Zustandsraum vorgesehen, heute inaktiv — Aktivierung ohne Datenmigration.
- Regelbasierte Generierung von Trainingseinheiten; Fehlerbild-/Trainer-Layer; Grafiken (Platzhalter mit Bildunterschriften sind eingebaut, KI-Prompts siehe Spezifikation, Anhang B).
