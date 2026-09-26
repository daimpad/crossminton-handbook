# Manifest — Inhaltsdateien und ihr Ort im Repository

Diese Übersicht listet alle aktuellen Inhaltsdateien mit ihrem Soll-Pfad im
Projekt-Repository. Sie beantwortet zwei Fragen: **Was gehört wohin**, und
**welche Datei überschreibt eine ältere Version**.

## Ablauf in vier Schritten

1. **Herunterladen** — alle unten gelisteten Dateien aus dem Ausgabeverzeichnis speichern.
2. **Einordnen** — in die Zielstruktur legen (siehe Baum). Wo die Inhalts-JSONs
   genau liegen, hängt vom Aufbau der App ab; frag Claude Code „wo liegen die
   Inhaltsdateien?" und nutze dort `data/` oder `content/`.
3. **Committen** — Dateien versionieren, damit ältere Stände überschrieben und
   nachvollziehbar sind.
4. **Verdrahten** — den jeweils mitgelieferten „Prompt für Claude Code" weitergeben
   für die technische Integration.

Merksatz: **Ich schreibe und prüfe den Inhalt, du transportierst die Dateien ins
Repo, Claude Code verdrahtet sie technisch.**

## Zielstruktur

```
dein-projekt/
├── README.md
├── glossar.md
├── uebergabe-spezifikation.md
├── offene-inhalte.md
├── MANIFEST.md
├── validate.py
├── docs/
│   └── TECHNICAL.md
├── images/
│   ├── grafik-prompts.md
│   ├── logo-speeder.svg
│   └── G-001.png … G-061.png
└── data/            (oder content/ — je nach App-Aufbau)
    ├── bausteine.*.json   (19 Dateien)
    ├── trainingseinheiten.json
    ├── regeln.json
    └── app-info.json
```

## Inhalts-JSONs → `data/` (oder `content/`)

Alle folgenden Dateien überschreiben vorhandene ältere Versionen im Repo. Sie sind
gegen die Validierungs-Suite geprüft (Stand: grün).

| Datei | Inhalt |
|---|---|
| `bausteine.beginner-technik.json` | Beginner-Technik **und kanonisches Vokabular** (Feld `vokabulare` — Referenzquelle für alle Wertelisten) |
| `bausteine.beginner-taktik.json` | Beginner-Taktik |
| `bausteine.beginner-mentales.json` | Beginner-Mentales |
| `bausteine.beginner-athletik_kondition.json` | Beginner-Athletik/Kondition |
| `bausteine.fortgeschritten-technik.json` | Fortgeschritten-Technik (inkl. BAD-Deltas inline) |
| `bausteine.fortgeschritten-taktik.json` | Fortgeschritten-Taktik (inkl. BAD-Deltas inline) |
| `bausteine.fortgeschritten-mentales.json` | Fortgeschritten-Mentales |
| `bausteine.fortgeschritten-athletik_kondition.json` | Fortgeschritten-Athletik/Kondition |
| `bausteine.experte-technik.json` | Experte-Technik (herkunftsneutral, 0 Deltas) |
| `bausteine.experte-taktik.json` | Experte-Taktik (herkunftsneutral) |
| `bausteine.experte-mentales.json` | Experte-Mentales (herkunftsneutral) |
| `bausteine.experte-athletik_kondition.json` | Experte-Athletik/Kondition (herkunftsneutral) |
| `bausteine.trainer-trainingsgestaltung.json` | Trainer-Ebene, Vermittlungsziele |
| `bausteine.doppel-beginner.json` | Doppel, Beginner (`spielform: doppel`) |
| `bausteine.doppel-thema.json` | Doppel, Fortgeschritten (inkl. BAD-Deltas inline) |
| `bausteine.doppel-experte.json` | Doppel, Experte (herkunftsneutral) |
| `bausteine.outdoor-thema.json` | Umgebungs-Bausteine; aktiviert die Achsen `witterung` und `untergrund` |
| `bausteine.delta-tennis.json` | 8 Tennis-Deltas (herkunftsrein) |
| `bausteine.delta-squash.json` | 6 Squash-Deltas (herkunftsrein) |
| `trainingseinheiten.json` | 8 kuratierte Trainingseinheiten (referenzieren Übungsteil-Bausteine) |
| `regeln.json` | Regeln-Reiter (ICO/DCV, Feb 2018) |
| `app-info.json` | Über/Mitmachen, Sprach-Anzeige de/en/fr/pl/ja |

## Dokumentation und Root

| Datei | Soll-Pfad | Inhalt |
|---|---|---|
| `README.md` | Root | Konzept/Angebot, Speeder-Logo, Lizenz-Trennung Code (MIT) / Inhalt (CC BY-SA 4.0) |
| `glossar.md` | Root | Verbindliche Terminologie + Stilregeln; Grundlage der Übersetzungen |
| `uebergabe-spezifikation.md` | Root | Einzige Quelle der Wahrheit: Schema, Konventionen, Dateiliste |
| `offene-inhalte.md` | Root | Liste der noch offenen Inhaltsarbeiten |
| `MANIFEST.md` | Root | Diese Übersicht |
| `validate.py` | Root | Validierungs-Suite; Aufruf `python3 validate.py data/` (Pfad = Ort der JSONs) |
| `TECHNICAL.md` | `docs/` | Technische Doku: Datenmodell, Delta-System, Navigations-Engine, Grafiksystem |

## Bilder → `images/`

| Datei | Inhalt |
|---|---|
| `grafik-prompts.md` | Katalog G-001 … G-061 mit Bildbeschreibung und EN-Prompt je Eintrag, plus Abdeckungs-Audit |
| `logo-speeder.svg` | Speeder-Logo (README-Kopf) |
| `G-001.png … G-061.png` | 61 farbcodierte Platzhalter, benannt nach G-Nummer, für 1:1-Ersatz durch finale Grafiken |

## Prüfen nach dem Einordnen

Sobald die JSONs im Repo liegen, bestätigt ein Lauf der Suite die Integrität:

```
python3 validate.py data/      # bzw. content/
```

Exit-Code 0 heißt: Schema, Voraussetzungen, Deltas, Vokabular, Trainings-Referenzen
und Sprachregeln sind stimmig. Exit-Code 1 listet jeden Fund mit Datei und Baustein-ID.
