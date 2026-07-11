# Technische Dokumentation

Technischer Überblick zum Crossminton-Handbuch. Die verbindliche, vollständige Spezifikation liegt in [`uebergabe-spezifikation.md`](uebergabe-spezifikation.md); dieses Dokument fasst sie für den Einstieg zusammen. Eine tiefere Entwickler-Referenz (Modulgrenzen, Tests, Datenpflege) steht in [`../ENTWICKLUNG.md`](../ENTWICKLUNG.md).

## Überblick & Ansatz

Die App ist eine inhaltsgetriebene, statische Web-App: Der gesamte Lernstoff liegt in versionierten JSON-Dateien, die Oberfläche rendert daraus Pfade, Bausteine und Reiter. Kein Backend ist für den Erstausbau nötig; Offline-Fähigkeit (PWA) ergibt sich aus den statischen Inhalten fast beiläufig. Eine schlanke Server-Komponente für geräteübergreifenden Fortschritt ist als spätere Ausbaustufe vorgesehen.

Quellsprache ist Deutsch; die Struktur ist mehrsprachig angelegt (`de`, `en`, `fr`, `pl`, `ja`).

## Datenmodell: der Baustein

Kleinste Lerneinheit ist der Baustein. Alle Bausteine liegen in einem gemeinsamen Pool (`data/bausteine.*.json`) und tragen ein einheitliches Schema mit elf Feldern:

1. **Domäne** — genau ein Wert: `technik`, `taktik`, `trainingsgestaltung`, `mentales`, `athletik_kondition`.
2. **Kompetenzstufe** — Mehrfach: `beginner`, `fortgeschritten`, `experte`, `trainer` (orthogonal).
3. **Baustein-Typ** — genau einer: `micro`, `vertiefung`, `delta`, `fehlerbild`, `umgebungs_baustein`.
4. **Voraussetzungen** — weiche, nicht-lineare Sortierkanten (sperren nie).
5. **Lernziele** — Spielziele (6 Bereiche, inkl. Umgebungsanpassung) und Vermittlungsziele (Trainer).
6. **Transfer-Herkunft** — Mehrfach: `CM`, `BAD`, `TEN`, `SQ`, `BS`, `SP`, `AT`.
7. **Untergrund** — `halle` (Default) / `sand` / `rasen` / `asche` / `kunstrasen`; als Liste geführt.
8. **Witterung** — Liste: `wind`, `sonne_blendung`, `naesse`, `hitze`.
9. **Innere Struktur** — `erklaerteil` (immer) plus höchstens eines von `uebungsteil` / `reflexionsaufgabe`.
10. **Abschluss-Status** — `offen → erledigt`; `beherrscht` vorgehalten.
11. **Spielform** — `einzel` (Default) / `doppel`.

Das kanonische Vokabular liegt in `data/bausteine.beginner-technik.json` unter `vokabulare`.

## Cross-Sport-Deltas

Deltas ersetzen bei passender Herkunft nur den `erklaerteil` eines Basis-Bausteins (`ersetzt_bei_herkunft`, `eigener_uebungsteil: false`). Sie greifen selektiv — nur dort, wo eine mitgebrachte Gewohnheit wirklich kollidiert. Die Onboarding-Herkunftsliste leitet sich automatisch aus dem Delta-Bestand ab. Herkunftsreine Dateien: `data/bausteine.delta-tennis.json`, `data/bausteine.delta-squash.json`; Badminton-Deltas liegen inline. Die Experten-Stufe ist herkunftsneutral (0 Deltas).

## Weitere Entitäten (außerhalb des Baustein-Pools)

- `data/trainingseinheiten.json` — kuratierte Einheiten in drei Phasen (Erwärmung/Hauptteil/Ausklang); Referenzen zeigen 1:1 auf Bausteine mit `uebungsteil`.
- `data/regeln.json` — der Regeln-Reiter (eigener Referenzbereich, kein Lerninhalt); Quelle: ICO/DCV, Stand Februar 2018.
- `data/app-info.json` — Info-Reiter „Über"/„Mitmachen" plus Sprach-Anzeige (`funktion_aktiv: false` im Erstausbau).

## Navigation & Pfad-Engine

Vier Domänen-Pfade bilden den Kern. Darüber liegen orthogonale Navigationsachsen:

- `spielform` — der Doppel-Zugang (Doppel über alle drei Stufen).
- `witterung` / `untergrund` — der Outdoor-/Umgebungs-Zugang (Typ `umgebungs_baustein`).

Der Cross-Sport-Modifikator blendet Deltas passend zur gewählten Herkunft ein. Voraussetzungen ordnen innerhalb eines Pfades weich, ohne zu sperren.

## Grafiksystem

Ein zentrales Bild pro Baustein (wo sinnvoll). Alle Bild-Prompts sind durchnummeriert (`G-001` …) in [`../images/grafik-prompts.md`](../images/grafik-prompts.md) gesammelt; je Nummer eine Platzhalter-Datei `images/G-XXX.png`. Integration: optionales Feld `grafik: ["G-XXX"]` je Baustein — der Loader zieht darüber die Bilddatei und zeigt sie in der Baustein-Ansicht. Die Abdeckung (welche Reiter bebildert sind, welche Bausteine bewusst ohne Bild bleiben) ist dort dokumentiert. Erzeugte Bilder ersetzen die Platzhalter 1:1 unter gleichem Namen.

## Fortschritt & Gamification

Fortschritt ist baustein-gebunden: Ein in einer Einheit quittierter Übungsteil gilt pool-weit als erledigt. Sequenz- und Einheit-Abschlüsse sind Gratifikations-Anlässe.

## Setup & Betrieb

Die App braucht keinen Build-Schritt. `fetch()` der JSON-Inhalte verlangt HTTP — also über einen lokalen Server testen, nicht per `file://`:

```sh
# lokal ausliefern (Beispiel)
python3 -m http.server 8080
# oder ein beliebiger statischer Server
# als PWA: Service Worker registrieren, Inhalte cachen
```

Die JSON-Inhalte werden zur Laufzeit geladen; der Loader muss `untergrund` sowohl als String (Altwert `"halle"`) wie als Liste akzeptieren. Engine-Tests laufen dependency-frei mit `node tests/engine.test.mjs`.

## Projektstruktur (Inhaltsschicht)

```
.
├── README.md                     ← Konzept & Angebot (nur Übersicht)
├── ENTWICKLUNG.md                ← tiefe Entwickler-Referenz
├── index.html                    ← Shell (Bottom-Bar, Header, Footer)
├── css/                          ← app.css, schriften.css
├── js/                           ← Daten-, Engine-, Ansichts-Schicht (ES-Module)
├── docs/
│   ├── TECHNICAL.md              ← dieses Dokument
│   ├── uebergabe-spezifikation.md← verbindliche Vollspezifikation
│   └── ci.md                     ← Farben, Typografie, Icons
├── images/
│   ├── grafik-prompts.md         ← alle Bild-Prompts, durchnummeriert
│   ├── logo-speeder.svg
│   └── G-001.png … G-061.png     ← nummerierte Platzhalter
├── data/
│   ├── bausteine.*.json          ← Baustein-Pool (inkl. Deltas)
│   ├── trainingseinheiten.json
│   ├── regeln.json
│   ├── app-info.json
│   └── labels/{de,en,fr,pl}.json ← sichtbare Beschriftungen
└── tests/engine.test.mjs         ← dependency-freie Engine-Tests
```

## Weiterführend

Die vollständige Modell- und Entscheidungsdokumentation (u. a. Herkunftsneutralität der Experten-Stufe, herkunftsreine Delta-Konvention, `untergrund` als Liste, Grafik-Anhang) steht in [`uebergabe-spezifikation.md`](uebergabe-spezifikation.md).
