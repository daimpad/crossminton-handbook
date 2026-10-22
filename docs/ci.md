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
| Text sehr leise | `#656f7e` | `#8795a6` | `--tinte-3` |
| Linie | `#e9eef6` | `#273543` | `--linie` |
| Linie stark | `#dae3ee` | `#3a4b5e` | `--linie-stark` |

## Grafiken

Die 67 Grafiken in `images/` sind Inline-SVG und lesen dieselben Tokens wie die Oberfläche; sie kippen darum mit dem Thema, ohne eigene `@media`-Regel. 32 davon sind Personengrafiken im Stil „Dynamische Silhouette“, erzeugt von `scratchpad/figuren/` (Strategie in `docs/grafik-strategie.md`); die übrigen 35 sind Diagramme (Feld, Bahnen, Zonen, Regelskizzen, die Speeder-Konstruktionszeichnung).

### Farbrollen

| Rolle | Variable |
| --- | --- |
| Körper, nahe Seite | `--tinte` |
| Körper, ferne Seite; Sohle, Mütze, Stangen | `--tinte-2` |
| Geisterphasen und Umrisse, Laufwege, Blicklinien, Pfeile, Feld- und Bodenlinien, Sonne, Caption | `--tinte-3` |
| Akzent: das eine didaktische Element und sein Werkzeug (Schläger, Flugbahn, Feder, Treffpunkt) | `--primaer-dunkel` |
| Ortsmarke am Boden, Schirm, Griff-Fläche in Nahaufnahmen (mit Rand in `--primaer-dunkel`) | `--primaer-weich` |
| Freistellungsrand, Füllung von Umrissfiguren, Halo hinter Linien und Beschriftungen | `--flaeche-2` |
| Halo hinter Beschriftungen in einer hellen Zone (Passierzone, Zielzone) | `--primaer-weich` |
| Bodenschatten | `--schatten-boden` |
| Speeder | `--speeder-korb`, `--speeder-korb-flaeche`, `--speeder-kappe`, `--speeder-kappe-tief` |

- **Die Hauptfarbe trägt genau ein Element** je Bild, Hilfslinien bekommen sie nie. In den Personengrafiken ist das `--primaer-dunkel`, denn `--primaer` erreicht auf `--flaeche-2` hell nur 2,48:1; die älteren Diagramme nutzen `--primaer` weiter für ihre Bahnen und Pfeile.
- **Ampelfarben sind tabu.** Rot, Gelb und Grün bedeuten in der App einen Zustand (offen, Hinweis, erledigt), in einer Grafik würden sie ihn behaupten.
- **Keine harten Farben**, kein `rgb()`, kein `style=`-Attribut. Jedes Token steht als `var(--token,#hellwert)`; der Fallback ist der Hellwert aus `:root`, denn mit ihm entsteht das PNG. `scripts/grafik-gate.mjs` prüft das für die Personengrafiken.
- Die geplanten Tokens `--grafik-akzent` und `--sonne` sind entfallen: Akzent ist `--primaer-dunkel`, die Sonne ein Umriss in `--tinte-3`.

### Kontrast

Jedes Element, das eine Aussage trägt, erreicht hell und dunkel mindestens **3:1 gegen `--flaeche-2`** (den Grund von `.grafik-bild`) und gegen die Fläche, vor der es liegt (WCAG 1.4.11). Gemessen:

| Token gegen `--flaeche-2` | Hell | Dunkel |
| --- | --- | --- |
| `--tinte` | 15,05:1 | 12,15:1 |
| `--tinte-2` | 5,34:1 | 6,56:1 |
| `--tinte-3` | 4,65:1 | 4,65:1 |
| `--tinte-3` mit Deckkraft 0,8 (Feldlinien `s-linie`) | 3,19:1 | 3,52:1 |
| `--primaer-dunkel` | 3,36:1 | 6,92:1 |
| `--primaer` | 2,48:1 | 5,98:1 |
| `--speeder-kappe` | 3,84:1 | 5,03:1 |
| `--speeder-korb` | 1,52:1 | 10,26:1 |

- Der helle Korb trägt seinen Kontrast über die Kontur, nie über die Fläche.
- Zwei Paare unter 3:1 lassen sich nicht über ein anderes Token lösen: `--tinte-2` gegen `--tinte` (hell 2,82:1, dunkel 1,85:1) und Blasses über Deckkraft (ein Speeder mit 40 % kam hell auf 1,2:1). Getrennt wird dort mit einer Naht oder einem Halo in `--flaeche-2`, ein gedachter Gegenstand steht als deckender Umriss.
- Keine Linie läuft durch eine Beschriftung: der Text wird versetzt oder bekommt einen Halo (`paint-order: stroke`, Breite 4–5) in der Farbe seines Grundes. `scratchpad/textgrenzen.mjs` meldet jede Kreuzung ohne Halo.
- Beschriftungen in der Grafik nutzen `--tinte-3` oder dunkler; eine Caption ist höchstens 250 Einheiten breit, gemessen mit Liberation Sans als Stellvertreter für `system-ui` (`scratchpad/textgrenzen.mjs` prüft alle 324 Dateien). Mit DejaVu Sans, der breitesten Schrift, die `system-ui` treffen kann, läuft ebenfalls nichts über den Rand (`textgrenzen.mjs --dejavu`).

### Die Speeder-Ausnahme

Der Speeder trägt seine echten Farben (Typ MATCH: gelber Korb, rote Kappe) über eigene Tokens. Sie laufen bewusst **nicht** über `--signal-gelb`/`--signal-rot`: die Ampel bedeutet einen Zustand, am Speeder ist die Farbe eine Sacheigenschaft. Wer weitere Produktfarben braucht, legt ebenso eigene Tokens an.

### Grafik-Tokens

Gelesen nur von den Grafiken in `images/`, je hell und in beiden Dunkel-Blöcken von `css/app.css` gesetzt:

| Rolle | Hell | Dunkel | Variable |
| --- | --- | --- | --- |
| Speeder-Korb | `#f0c400` | `#ffd84d` | `--speeder-korb` |
| Speeder-Korbfläche (Konstruktionszeichnung) | `#f1e7b5` | `#b3901e` | `--speeder-korb-flaeche` |
| Speeder-Kappe | `#e2402a` | `#ff6a52` | `--speeder-kappe` |
| Speeder-Kappe tief | `#a82412` | `#ffa593` | `--speeder-kappe-tief` |
| Bodenschatten | `#16202b2e` | `#00000066` | `--schatten-boden` |

`--schatten-boden` ist ein eigenes Token, weil ein Verlauf über `--tinte` im Dunkeln zum Lichthof wurde. `--speeder-korb-flaeche` ebenso, weil der Korb mit Deckkraft über dem dunklen Grund Oliv ergab — eine Fläche, die in beiden Themen gelb lesen soll, braucht einen deckenden Wert je Thema.

### PNG-Fallback

Zu jedem SVG liegt ein PNG in doppelter viewBox-Größe, gerendert mit den Hellwerten. Es lädt nur, wenn das SVG nicht zu holen ist (offline vor dem ersten Abruf, Netzfehler); bis das SVG da ist, hält die Ansicht den Platz frei. Jedes PNG steht auf deckendem `--flaeche-2`. Im Dunkelmodus erscheint es darum als helle, lesbare Kachel; transparent stünden dunkle Linien auf dunklem Grund, und was mit `--flaeche-2` freistellt (Freistellungsrand der Figuren, Halo hinter den Beschriftungen der Speeder-Tafeln), als heller Saum.

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
