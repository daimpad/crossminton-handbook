# Corporate Identity — Crossminton-Handbuch

Kurzer, verbindlicher Leitfaden für das visuelle Erscheinungsbild. Die Werte sind zentral in `css/app.css` als CSS-Variablen (`:root`) hinterlegt — Änderungen dort wirken app-weit. Das Design ist bewusst **fein und ruhig** gehalten: Blau ist Akzent (nicht Flächenfarbe), Überschriften ruhen in Tinte, Tiefe entsteht durch weiche Elevation statt harter Rahmen.

## Hell & Dunkel

Die App trägt **zwei Farbschemata über denselben Variablensatz**: Der Baustein-, Ansichts- und Komponenten-Code liest ausschließlich Tokens (`var(--flaeche)`, `var(--tinte)`, `var(--linie)` …), sodass ein Umschalten der Tokens das ganze Bild kippt.

- **Automatisch (Default):** folgt dem System über `@media (prefers-color-scheme: dark)`.
- **Manuell:** der Profil-Umschalter „Darstellung" (auto / hell / dunkel) setzt `data-theme` auf `<html>`. `data-theme="hell"` erzwingt hell (auch bei dunklem System), `data-theme="dunkel"` erzwingt dunkel. `auto` entfernt die Markierung.
- Ein **Inline-Skript im `<head>`** (`index.html`) setzt `data-theme` vor dem ersten Anstrich → kein Flackern; zur Laufzeit übernimmt `wendeThemaAn()` (`js/oberflaeche.js`). Beide halten die Browser-Leiste (`theme-color`) am effektiven Modus.
- **Hauptfarbe und Ampellogik bleiben in beiden Schemata verbindlich** — im Dunkeln werden die Töne nur angehoben (heller, damit der Kontrast auf dunklem Grund stimmt).

## Farben

### Hauptfarbe (Akzent)

| Rolle | Hell | Dunkel | Variable | Einsatz |
| --- | --- | --- | --- | --- |
| Primär | `#38a4f1` | `#4fb0f4` | `--primaer` | Buttons, aktive Icons, Links, Fortschritt, Aktiv-Zustand |
| Primär dunkel | `#1e8bd6` | `#6bbdf6` | `--primaer-dunkel` | Button-Hover, Marke |
| Primär tief | `#1568ad` | `#9acdf8` | `--primaer-tief` | tiefe Akzente |
| Primär weich | `#e8f3fe` | `#143247` | `--primaer-weich` | dezente Flächen |

### Signalfarben (Ampellogik)

Konsequent nach Bedeutung, nie dekorativ. Je Signal drei Rollen: Grundton (Flächen/Ränder/Punkte), `-text` (lesbarer Text) und `-weich` (zarte Hintergründe).

| Farbe | Hell | Dunkel | Variable | Bedeutung |
| --- | --- | --- | --- | --- |
| 🔴 Rot | `#f4402a` | `#ff5a44` | `--signal-rot` | **offen** — noch nicht bearbeitet (Status-Badge, Statuspunkt) |
| 🟡 Gelb | `#f2d93b` | `#f2d93b` | `--signal-gelb` | **teilweise / Hinweis** — angefangen, Voraussetzungs-Hinweise, Warnbanner |
| 🟢 Grün | `#24bd47` | `#33cf5a` | `--signal-gruen` | **erledigt** — abgeschlossen, Bestätigungen, Meilenstein-Medaille |

Für Text wird die abgedunkelte (hell) bzw. aufgehellte (dunkel) Variante `--signal-*-text` genutzt, damit der Kontrast (WCAG AA) stimmt; die reinen Signalfarben tragen Flächen, Ränder und Punkte, `--signal-*-weich` die zarten Banner-Hintergründe.

### Neutrale

| Rolle | Hell | Dunkel | Variable |
| --- | --- | --- | --- |
| Hintergrund | `#f2f6fc` → `#eaf1fa` (Verlauf) | `#0f151c` → `#131c26` | `--hintergrund` / `--hintergrund-2` |
| Fläche | `#ffffff` | `#18232f` | `--flaeche` |
| Fläche 2 | `#f1f5fb` | `#1f2c3a` | `--flaeche-2` |
| Text | `#16202b` | `#e8eef5` | `--tinte` |
| Text leise | `#5a6675` | `#a2b2c4` | `--tinte-2` |
| Text sehr leise | `#8a94a3` | `#7f8ea0` | `--tinte-3` |
| Linie | `#e9eef6` | `#273543` | `--linie` |
| Linie stark | `#dae3ee` | `#3a4b5e` | `--linie-stark` |

## Typografie

- **Schrift:** [Rubik](https://fonts.google.com/specimen/Rubik) — lokal gehostet (kein CDN), Schnitte 400/500/700, Latin + Latin-Ext. Fallback: System-Sans.
- **Überschriften ruhen in Tinte** (`--ueberschrift` = `--tinte`), **nicht** blau — Blau ist Akzent. Gewicht 600, leicht negatives Tracking (`letter-spacing` −0.01…−0.015em) für einen feineren Satz.
- **Skala mit Luft:** H1 ~1.9rem, H2 ~1.3rem, H3 ~1.05rem, H4 als Kapitälchen-Label (0.78rem, `letter-spacing` 0.06em). Der Abstand zum Fließtext (1rem) trägt die Hierarchie mit.
- **Fließtext:** `--tinte`, 1rem, Zeilenhöhe 1.6; kantengeglättet (`-webkit-font-smoothing: antialiased`).

## Form & Bewegung

- **Radius gestuft:** 14px Standard (`--radius`), 20px für große Flächen/Hero (`--radius-gross`), 9px für kleine Elemente (`--radius-klein`).
- **Weiche, mehrlagige Elevation statt harter Rahmen:** Karten tragen dauerhaft einen zarten Schatten (`--schatten-karte`) plus feine Linie; der harte 1px-Rahmen dominiert das Bild nicht mehr.
- **Hover:** stärkerer, blau getönter Schatten (`--schatten-hover`) plus 2px Anheben — nur auf Zeigergeräten (`@media (hover: hover)`).
- **Übergänge:** 200ms mit weicher Kurve (`--uebergang`, `cubic-bezier(0.33, 1, 0.5, 1)`); Menü und Meilenstein mit eigenem Timing. `prefers-reduced-motion` schaltet alles ab.
- **Gestaffelter Einstieg:** bei Routenwechsel gleiten die Blöcke der Ansicht nacheinander herein (`#ansicht.einstieg > *`, ~45ms Versatz) — nur bei echter Navigation, nicht bei Zustands-Neuzeichnung.
- **Fortschritts-Ring** (`ringHtml`, SVG-Donut) für die Kennzahl im Vordergrund (Profil-Gesamt, Kompetenz-Karte); der schlanke Balken (`balkenHtml`) bleibt für Nebenmetriken.
- **Ikon-Kachel:** der Baustein-Titel trägt sein Icon in einer weichen getönten Rundung (`--primaer-weich`, `--radius-klein`) statt als nacktem Glyph.
- **Leere Zustände** (`leerHtml`) tragen ein ruhiges, zentriertes Icon über dem Hinweis — nie eine nackte Textzeile.
- **Tabellenziffern** (`tabular-nums`) überall, wo Zahlen zählen (Fortschritt, Stationen, Plan); Fließtext bleibt auf ein ruhiges Lesemaß (~64ch) begrenzt.
- **Dunkelmodus-Tiefe:** höher liegende Flächen tragen einen zarten oberen Lichtsaum (`inset`-Highlight), damit Elevation im Dunkeln nicht flach wirkt.

## Icons

- [Font Awesome 6 Free (Solid)](https://fontawesome.com/) — lokal als Subset (`css/schriften.css`), kein CDN.
- **Immer farbig, nie schwarz:** Default Hauptfarbe, Status in Signalfarben, auf farbigen Flächen (Hero, Buttons) weiß per `inherit`.
- **Motive** passend zum Inhalt: Schläger (`fa-table-tennis-paddle-ball`) fürs Training, Menschen/Körperteile für Bausteine (Grundposition = Person, Griff = Hand, Rückhand = Faust, Beinarbeit = Fußspuren), Ball fürs Aufschlagen.
- Weitere Icons ergänzen = eine Codepoint-Zeile in `css/schriften.css`.

## Ton

Sachlich-klar, nicht werblich — konsistent mit der Sprache der Lerninhalte. Begleitend, nicht treibend (siehe Spezifikation, Abschnitt 8.4).
