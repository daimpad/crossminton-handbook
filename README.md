# Crossminton-Handbuch

Clientseitige, mobil-orientierte Lernapp für Crossminton (Erstausbau). Kein Server, kein Build-Schritt: HTML/CSS/JS als ES-Module, Inhalte aus statischen JSON-Dateien, Fortschritt baustein-gebunden in `localStorage`. Konzeptionelle Grundlage: [`docs/uebergabe-spezifikation.md`](docs/uebergabe-spezifikation.md).

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

Abgedeckt: Datenvalidierung, Kompetenz-/Themen-/Individualpfad, Cross-Sport-Modifikator (Delta-Einblendung, Skip-Kandidaten, Nicht-Fehlerfall), Zwei-Ebenen-Logik, Projektionen, Kontinuität und die Vollständigkeit der de-Labels.

## Struktur

```
index.html                 App-Shell (SPA, Hash-Routing)
css/app.css                mobile-first, hell/dunkel, Systemschriften
js/
  app.js                   Boot, Router, Navigation
  daten.js                 JSON laden, Indizes, Konsistenzprüfung
  graph.js                 topologische Sortierung, Voraussetzungs-Checks
  pfade.js                 Pfad-Engine: 4 Traversierungen + Cross-Sport-Modifikator
  fortschritt.js           Projektionen über den baustein-gebundenen Status
  aktionen.js              Quittierungen + Meilenstein-Erkennung
  zustand.js               localStorage-Store (Diagnose, Fortschritt, Kontinuität, Einstellungen)
  i18n.js                  t()/label()/text() mit de-Fallback
  oberflaeche.js           geteilte UI-Helfer
  ansichten/               Onboarding, Heim, Pfadlisten, Baustein, Training, Profil, Zielwahl
data/
  bausteine.beginner-technik.json   Referenzinhalt (unverändert übernommen)
  trainingseinheiten.json           kuratierte Beispiel-Einheiten (redaktionell ersetzbar)
  labels/de.json                    alle sichtbaren Beschriftungen (Quellsprache)
  labels/{en,fr,pl}.json            strukturgleiche Gerüste, unbefüllt → Fallback auf de
docs/uebergabe-spezifikation.md     Spezifikation
tests/engine.test.mjs               Engine-Tests (node, dependency-frei)
```

## Datenpflege

- **Inhalte** (`data/bausteine.beginner-technik.json`): Quellformat gemäß Spezifikation, Abschnitt 3. Neue Bausteine brauchen zusätzlich einen Anzeigetitel in `data/labels/de.json` unter `bausteine` (die Engine-Tests prüfen das mit).
- **Beschriftungen** (`data/labels/de.json`): Erstfassungen aus der Implementierung — redaktionell prüfen. Offen vermerkt: das ausgeschriebene Label für die Transfer-Herkunft `BS`.
- **Trainingseinheiten** (`data/trainingseinheiten.json`): im Erstausbau kuratierte Beispiele; frei ersetzbar. Referenziert werden Baustein-IDs, deren Übungsteil gemeint ist.
- **Übersetzungen**: Werte in `data/labels/{en,fr,pl}.json` befüllen; leere Werte fallen zur Laufzeit auf `de` zurück. Baustein-Texte werden je Sprache direkt in der Inhaltsdatei ergänzt (`erklaerteil.en` usw.).

## Bewusste Ausbaustufen (strukturell vorgehalten, nicht umgesetzt)

- Offline-Fähigkeit als PWA (statische Inhalte, relative Pfade — Manifest + Service Worker genügen später).
- Schlanke Server-Komponente für geräteübergreifenden Fortschritt.
- Abschluss-Status `beherrscht` (Mastery): im Zustandsraum vorgesehen, heute inaktiv — Aktivierung ohne Datenmigration.
- Regelbasierte Generierung von Trainingseinheiten; Fehlerbild-/Trainer-Layer; Grafiken (Platzhalter mit Bildunterschriften sind eingebaut, KI-Prompts siehe Spezifikation, Anhang B).
