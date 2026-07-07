# Corporate Identity — Crossminton-Handbuch

Kurzer, verbindlicher Leitfaden für das visuelle Erscheinungsbild. Die Werte sind zentral in `css/app.css` als CSS-Variablen (`:root`) hinterlegt — Änderungen dort wirken app-weit.

## Farben

### Hauptfarbe

| Rolle | Hex | Variable | Einsatz |
| --- | --- | --- | --- |
| Primär | `#38a4f1` | `--primaer` | Buttons, aktive Icons, Akzente, Fortschritt |
| Primär dunkel | `#1e8bd6` | `--primaer-dunkel` | Überschriften (H1/H2), Button-Hover |
| Primär tief | `#1671b5` | `--primaer-tief` | Links, aktive Navigation |
| Primär weich | `#e7f4fe` | `--primaer-weich` | Flächen, Chip-Hintergründe |

### Signalfarben (Ampellogik)

Konsequent nach Bedeutung, nie dekorativ:

| Farbe | Hex | Variable | Bedeutung |
| --- | --- | --- | --- |
| 🔴 Rot | `#f91f05` | `--signal-rot` | **offen** — noch nicht bearbeitet (Status-Badge, Statuspunkt) |
| 🟡 Gelb | `#f4e248` | `--signal-gelb` | **teilweise / Hinweis** — angefangen, Voraussetzungs-Hinweise, Warnbanner |
| 🟢 Grün | `#25c449` | `--signal-gruen` | **erledigt** — abgeschlossen, Bestätigungen, Meilenstein-Medaille (Gold-Ton) |

Für Text auf hellem Grund werden abgedunkelte Varianten genutzt (`--signal-*-text`), damit der Kontrast (WCAG AA) stimmt; die reinen Signalfarben tragen Flächen, Ränder und Punkte.

### Neutrale

| Rolle | Hex | Variable |
| --- | --- | --- |
| Hintergrund | `#f5f9fd` | `--hintergrund` |
| Fläche | `#ffffff` | `--flaeche` |
| Text | `#1f2933` | `--tinte` |
| Text leise | `#5f6b7a` | `--tinte-2` |
| Linie | `#e1e9f2` | `--linie` |

## Typografie

- **Schrift:** [Rubik](https://fonts.google.com/specimen/Rubik) — lokal gehostet (kein CDN), Schnitte 400/500/700, Latin + Latin-Ext. Fallback: System-Sans.
- **H1/H2:** immer Blau (`--ueberschrift` = `--primaer-dunkel`), 700/600.
- **Fließtext:** `--tinte`, 1rem, Zeilenhöhe 1.55.

## Form & Bewegung

- **Radius:** 10px für alle Container (`--radius`).
- **Hover:** leichter Schlagschatten (`--schatten-hover`) plus 2px Anheben — nur auf Zeigergeräten (`@media (hover: hover)`).
- **Übergänge:** 220ms als Standard (`--uebergang`); Ansichtswechsel gleiten ein, Menü und Meilenstein mit eigenem Timing. `prefers-reduced-motion` schaltet alles ab.

## Icons

- [Font Awesome 6 Free (Solid)](https://fontawesome.com/) — lokal als Subset (`css/schriften.css`), kein CDN.
- **Immer farbig, nie schwarz:** Default Hauptfarbe, Status in Signalfarben, auf farbigen Flächen (Hero, Buttons) weiß per `inherit`.
- **Motive** passend zum Inhalt: Schläger (`fa-table-tennis-paddle-ball`) fürs Training, Menschen/Körperteile für Bausteine (Grundposition = Person, Griff = Hand, Rückhand = Faust, Beinarbeit = Fußspuren), Ball fürs Aufschlagen.
- Weitere Icons ergänzen = eine Codepoint-Zeile in `css/schriften.css`.

## Ton

Sachlich-klar, nicht werblich — konsistent mit der Sprache der Lerninhalte. Begleitend, nicht treibend (siehe Spezifikation, Abschnitt 8.4).
