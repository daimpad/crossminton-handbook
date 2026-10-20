# Personengrafiken neu zeichnen: Strategie

**Stand:** Oktober 2026 · **Status:** Strategie steht, Stilentscheidung und Pilot stehen aus.

Die Grafiken mit Personen wirken banal und teilweise seltsam. Dieses Dokument legt fest, wie alle 32 dieser Grafiken neu entstehen. Der Schwerpunkt liegt auf der Ästhetik. Didaktik, Sachrichtigkeit und die technischen Regeln der App dürfen dabei nicht leiden. Es stützt sich auf drei Grundlagen:

- **Dossiers** zu allen 32 Grafiken: Motiv, didaktischer Kern aus dem Bausteintext, präzise Soll-Pose, Mängel nach Art und Schwere. Sie liegen maschinenlesbar in `scratchpad/figuren/dossiers.json`.
- **Prototypen** in drei Stilrichtungen an fünf Referenzmotiven (G-001, G-002, G-008, G-010, G-043), jeweils aus einem kleinen parametrischen Generator. Sie liegen in `scratchpad/figuren/prototypen/`.
- **Zwei unabhängige Gutachten** zu den Prototypen. Das eine bewertet Gestaltung und Didaktik, das andere Umsetzung und Qualitätssicherung.

## 1. Ziel

Jede Personengrafik soll eine Figur zeigen, die nach Sport aussieht: mit Gewicht, Spannung, glaubwürdigen Gelenken, echten Händen, Füßen und einem Crossminton-Schläger. Die Grafik trägt genau die eine Aussage ihres Bausteins und bleibt auf einem kleinen Telefon lesbar. Sie kippt wie bisher über die Tokens zwischen Hell und Dunkel und ist in allen vier Sprachen vorhanden. Alle 32 Grafiken folgen einem gemeinsamen Kanon, damit sie zusammen wie ein Satz wirken und nicht wie 32 Einzelstücke.

## 2. Umfang

Betroffen sind **32 Grafiken**. Jede liegt in vier Sprachen als SVG und PNG vor, zusammen also 128 SVG- und 128 PNG-Dateien.

| Art | Nummern |
| --- | --- |
| Ganzfiguren | G-002 bis G-008, G-010 bis G-012, G-015 bis G-020, G-022, G-032 bis G-034, G-036, G-054, G-056 bis G-058 |
| Zwei Personen | G-043, G-047, G-053, G-062 |
| Körperteil in Nahaufnahme | G-001 (Hand am Griff), G-009 (Unterarm und Handgelenk), G-035 (Fuß und Unterschenkel) |

**Nicht betroffen** sind die 35 Grafiken ohne Personen: Felddiagramme, Taktikschemata, Regelgrafiken und die Speeder-Konstruktionszeichnung G-064 bis G-067. Sie bleiben, wie sie sind. Die neuen Figuren müssen neben ihnen stimmig wirken. G-045 ist ein Punktdiagramm und gehört nicht zu den Personengrafiken. Es zeigt die Doppelpartner aber auf gleicher Tiefe und sollte deshalb gesondert gegen die Regeln 7.4 und 7.5.1 geprüft werden.

**Bleibt unverändert:** Nummern und Dateinamen (`G-XXX.svg`, `.png`, `.<sprache>.svg`/`.png`), die Zuordnung zu den Bausteinen, `SVG_GRAFIKEN` und `GRAFIK_SPRACHEN` in `js/oberflaeche.js` sowie die Einbindung über `grafikFigurHtml` und `verbessereGrafiken`.

## 3. Befund: warum die Bilder banal und seltsam wirken

Die Dossiers nennen über alle 32 Grafiken dieselben Ursachen. Darum hilft es nicht, einzelne Bilder auszubessern. Gebraucht wird ein neuer gemeinsamer Bauplan.

### Ästhetik und Anatomie

- **Ein Baukasten für alles.** Der Rumpf ist ein senkrechter Strich. Arme und Beine entspringen je einem Punkt, es gibt weder Schulter- noch Hüftbreite. Ellbogen und Knie fehlen weitgehend, die Beine stehen als fast gestreckter Zirkel (Kniewinkel 165 bis 175°). Der freie Arm ist fast überall ein Stummel ohne Ellbogen.
- **Proportionen eines Kindermännchens.** Der Kopf nimmt etwa 18 % der Körperhöhe ein, real sind es rund 13 %. Die Beine sind zu kurz. Bei 14 Einheiten Strichstärke wirkt die Figur wie ein WC-Schild, der Schläger mit 5,5 Einheiten wie Draht. Figurhöhen schwanken zwischen 140 und 190 Einheiten, Kopfradien zwischen 12 und 16.
- **Keine Hände, keine Füße.** Gerade die Kernaussagen zu Fußballen, Fersen, Griff und Handrücken lassen sich so nicht zeigen. Die Hand in G-001 liest sich als Rechen.
- **Keine Tiefe.** Nahe und ferne Gliedmaßen sind gleich schwarz. Welches Bein vorn steht und welcher Arm frei ist, bleibt mehrdeutig.
- **Schläger im Schritt.** In G-002, G-007 und G-032 hängt der Schläger senkrecht zwischen den Beinen, in G-005 liegt der Kopf vor den Oberschenkeln. Das ist die stärkste Ursache für die seltsame Anmutung, denn die Lesart ist unfreiwillig anzüglich.
- **Schablonen-Recycling.** Die Paare G-002/G-007, G-003/G-004, G-010/G-011 und G-005/G-006 sind koordinatengleich oder fast gleich. Sechs Schlagbilder teilen dasselbe Skelett, nur der Schlagarm wechselt. Deshalb sehen alle Schläge gleich aus.
- **Kein Gewicht.** Der Rumpf ist bei Vorwärtsschlägen 5 bis 13° nach hinten geneigt. Füße schweben über der Bodenlinie oder versinken in ihr. Hilfszeichen liegen auf der Figur, etwa Wischlinien auf dem Arm oder ein Lot durch den Kopf.

### Sachliche Fehler, die beim Neuzeichnen mitbehoben werden

- **Schläger und Speeder sind nicht als solche erkennbar.** Der Schläger ist ein offener Ring an einem kurzen Stiel ohne Griff, er liest sich als Lupe oder Kelle. Die Schlagfläche zeigt in Seitenansichten zur Betrachterin statt zum Ziel. Der Speeder ist ein blauer Punkt oder fehlt ganz, Kappe und Korb sind nicht zu sehen. Damit lassen sich Aussagen wie „der ganze Speeder unterhalb der Hand“ in G-006 nicht prüfen.
- **Flugbahnen im Badminton-Maßstab.** Clear (G-010), Smash (G-011), Sprung-Smash (G-020), Stopp (G-012) und der Stopp-Zweig in G-017 landen ein bis eineinhalb Körperlängen vor der Figur. Im Crossminton läge der Speeder damit in der neutralen Zone, denn zwischen den Feldern liegen 12,8 m (Regel 1.3). Die senkrechte Linie in G-012 liest sich als Netz.
- **Doppel Seite an Seite.** G-043 und G-053 zeigen die Partner nebeneinander, G-047 wirkt ebenso. Das widerspricht der festen Ordnung vorn/hinten nach Regel 7.4 und 7.5.1, wie sie der Doppel-Fallstrick in `CLAUDE.md` beschreibt.
- **Treffpunkte.** Der Drive trifft in G-003, G-012, G-018, G-019 und G-022 auf Schulter- oder Kopfhöhe. Der Bausteintext verlangt Hüft- bis Brusthöhe. G-004 zeigt mit tiefem Ellbogen ausgerechnet das Fehlerbild der Rückhand. G-015 dreht die Zeitrichtung um, weil der „spätere“ Treffpunkt weiter vorn liegt.
- **Gesundheitsrahmen.** Die Caption „trinken“ in G-058 ist in allen vier Sprachen eine Trinkvorgabe. Der Baustein schließt Trink-, Ernährungs- und Belastungsvorgaben ausdrücklich aus. Die Bewegung in G-033 ist so nicht ausführbar. G-057 behauptet einen breiten Stand, der Text verlangt kurze Schritte.
- **Farbrolle.** Die Sonne in G-054, G-056 und G-058 ist in `--primaer` gezeichnet. Eine blaue Sonne liest sich als Mond oder UI-Symbol und zieht den Akzent vom Kern ab.

### Texte und Technik

- **Captions.** Elf Captions sollten inhaltlich geändert werden: G-005, G-009, G-010, G-011, G-033, G-035, G-043, G-054, G-056, G-057, G-058. Die Vorschläge stehen in den Dossiers. G-001, G-009 und G-035 sind im PNG an beiden Rändern abgeschnitten. Die Faustregel „bis etwa 46 Zeichen“ ist für fette 12 px zu großzügig, sicher sind etwa 40 Zeichen. Besser ist es, die Breite zu messen statt Zeichen zu zählen.
- **Beschreibungen widersprechen dem Bild.** `aria-label` und Katalogeinträge in `images/grafik-prompts.md` nennen Dinge, die das Bild nicht zeigt, etwa „von hinten“, „gespiegelte Pfeile“ oder „tiefe Sonne“. Beim Neuzeichnen werden Caption, `aria-label` und Katalogeintrag gemeinsam neu geschrieben.
- **PNG-Fallbacks in falscher Größe.** Die PNGs der betroffenen Grafiken liegen in 2560 × 2560 statt 600 × 600 vor. Sie stammen aus der Zeit vor der viewBox-Korrektur in `scratchpad/render-svg.mjs`. Die Fallback-Werte nennen für `--tinte-3` noch `#6b7686`, das Token steht inzwischen auf `#656f7e`.

## 4. Bestand im Einzelnen

Priorität A heißt: Leitgrafik eines zentralen Beginner-Bausteins oder auffällig misslungen (20 Grafiken). B sind die übrigen 12. Aufwand S/M/L ist der geschätzte Zeichenaufwand (2 / 19 / 11). Die vollständigen Dossiers samt Soll-Pose stehen in `scratchpad/figuren/dossiers.json`.

| Nr. | Baustein | Posenfamilie | Prio | Aufwand | Wichtigster Befund |
| --- | --- | --- | --- | --- | --- |
| G-001 | griff | Nahaufnahme Hand | A | L | Hand liest sich als Rechen, das V schwebt als umgekehrter Winkel neben dem Zeigefinger |
| G-002 | grundposition | Bereitschaft | A | M | Schläger hängt kopfüber im Schritt, keine Füße, keine Vorneigung |
| G-003 | vorhand_drive | Grundschlag | A | L | Treffpunkt auf Schulterhöhe statt Hüfthöhe, Schlagfläche zeigt zur Betrachterin |
| G-004 | rueckhand | Grundschlag | A | L | Kaum von G-003 zu unterscheiden, tiefer Ellbogen zeigt das Fehlerbild |
| G-005 | aufschlag | Aufschlag | A | M | Schlägerkopf vor den Oberschenkeln, Speeder ist ein Punkt, Caption mehrdeutig |
| G-006 | aufschlag | Aufschlag | A | M | Speeder überlappt den Rahmen, Kernaussage „ganz unterhalb der Hand“ nicht prüfbar |
| G-007 | beinarbeit | Bereitschaft | A | M | Schläger hängt zwischen den Beinen wie in G-002 |
| G-008 | beinarbeit | Ausfallschritt | A | L | Zentrale Position schwebt in der Luft, Füße schweben über dem Boden |
| G-009 | handgelenk_peitsche | Nahaufnahme Unterarm | B | M | Caption „Unterarm bleibt ruhig“ widerspricht dem Text, der das Eindrehen verlangt |
| G-010 | ueberkopf_clear | Überkopf | B | M | Bahn landet in der neutralen Zone, Treffpunkt zu weit vorn |
| G-011 | smash | Überkopf | A | S | Bahn endet 1,5 m vor der Figur, Caption lädt zum Fehlbild ein |
| G-012 | kurzes_spiel_stopp | Grundschlag | A | L | Senkrechte Linie liest sich als Netz, Badminton-Maßstab |
| G-015 | frueh_nehmen | Überkopf | B | M | Der „spätere“ Treffpunkt liegt vorn, die Zeitrichtung ist umgekehrt |
| G-016 | taeuschung | Überkopf | A | M | Vorbereitung weicht von G-017 ab, obwohl der Text „identisch“ verlangt |
| G-017 | taeuschung | Überkopf | A | M | Kontakt auf Kopfhöhe statt Vorbereitung, Stopp-Zweig im Netzmaß |
| G-018 | tempo_rhythmus_wechsel | Grundschlag | B | M | Wischlinien liegen auf dem Arm, kein Speeder |
| G-019 | tempo_rhythmus_wechsel | Grundschlag | B | S | Unterschied zu G-018 liegt fast nur im Pfeil |
| G-020 | sprung_smash | Überkopf und Sprung | B | L | Bahn endet vor den eigenen Füßen |
| G-022 | konstanz_unter_hoechstdruck | Grundschlag | B | M | Mischansicht aus frontalen Beinen und seitlichem Arm |
| G-032 | schnelle_fuesse | Bereitschaft | A | M | Schläger hängt aus dem Schritt, Figur fast deckungsgleich mit G-002 |
| G-033 | beweglichkeit_und_schulter | Athletik | A | M | Gezeigte Bewegung ist nicht ausführbar, Caption trifft den Text nicht |
| G-034 | explosivitaet | Athletik | B | L | Abdruckbein ohne Streckung, Pfeil durch den Oberschenkel |
| G-035 | reaktivkraft_bodenkontakt | Nahaufnahme Fuß | A | M | Fuß berührt den Boden nicht, Caption abgeschnitten |
| G-036 | bewegungsoekonomie | Bewegung | B | L | Die „effiziente“ Figur steht reglos, beide ohne Schläger |
| G-043 | verstaendigung_im_paar | Doppel | A | L | Partner Seite an Seite, Widerspruch zu Regel 7.4/7.5.1 |
| G-047 | sich_absprechen | Doppel | A | M | Kein Gespräch erkennbar, Nebeneinander wirkt wie Seite an Seite |
| G-053 | blindes_verstaendnis | Doppel | A | L | Partner laufen parallel seitwärts, das Badminton-Muster |
| G-054 | draussen_spielen | Draußen | B | L | Weder Felder mit Passierzone noch Wind zu sehen, Schläger kopfüber |
| G-056 | sonne_blendung | Draußen | B | M | Salut-Pose ohne Schläger, Text empfiehlt Kopfdrehen statt Abschirmen |
| G-057 | naesse_sicherer_stand | Draußen | A | M | Reitersitz statt kurzer Schritte, Caption widerspricht dem Text |
| G-058 | hitze | Draußen | B | M | Caption „trinken“ verletzt den Gesundheitsrahmen |
| G-062 | funplay | Grundschlag | A | M | Schlägerköpfe berühren sich in der Mitte, Schläger als Pfanne |

## 5. Stilrichtungen im Vergleich

Drei Richtungen wurden an denselben fünf Motiven umgesetzt, jeweils aus einem parametrischen Generator und in mindestens drei Prüfrunden verfeinert:

- **A · Dynamische Silhouette:** gefüllte, verjüngte Volumenfiguren in der Tradition von Sportpiktogrammen. Ein 3D-Skelett mit festen Längen wird projiziert, die ferne Körperseite ist eine Stufe heller.
- **B · Klare Linie:** Lehrbuchzeichnung mit Kontur, heller Füllung, angedeuteter Sportkleidung und natürlichen Proportionen.
- **C · Geometrisch-modular:** Gliederpuppe aus Kreis, Trapez und Kapseln mit Fugen und zwei Tönen für die Tiefe.

![Stilvergleich hell: heute und drei Richtungen an fünf Motiven](grafik-strategie/stilvergleich-hell.png)

![Stilvergleich dunkel](grafik-strategie/stilvergleich-dunkel.png)

Die Gutachten vergeben je Kriterium 1 bis 10 Punkte. Die Tabelle zeigt beide Wertungen, Gestaltung / Umsetzung:

| Kriterium | A Silhouette | B Linie | C Geometrisch |
| --- | --- | --- | --- |
| Ästhetik | 8 / 7 | 6 / 7 | 6 / 5 |
| Glaubwürdige Anatomie | 7 / 6 | 7 / 6 | 5 / 5 |
| Didaktische Klarheit | 8 / 8 | 7 / 7 | 7 / 6 |
| Lesbarkeit bei 150 px | 9 / 8 | 6 / 6 | 9 / 8 |
| Hell und dunkel | 7 / 8 | 7 / 7 | 9 / 8 |
| Passung zur CI | 7 / 8 | 6 / 6 | 8 / 7 |
| Skalierbarkeit auf 32 Grafiken | 8 / 8 | 7 / 6 | 7 / 7 |
| Technische Konformität | 9 / 8 | 8 / 7 | 8 / 9 |
| **Summe** | **63 / 61** | **54 / 52** | **59 / 55** |

**Beide Gutachten empfehlen unabhängig voneinander Richtung A.** Nur sie erreicht das Kernziel: Gewicht, Vorlage und Streckung lesen sich auf einen Blick, und die Figuren wirken nach Sport statt nach Clipart. Klein ist sie am besten lesbar, und die Hauptfarbe bleibt konsequent Akzent. Technisch ist sie schlank: 5 bis 15 KB je Datei, und `pruefe.mjs` meldet keinen Befund. Ihr 3D-Skelett garantiert einheitliche Proportionen, auch bei schwierigen Posen wie Sprung, diagonalem Ausfall oder Rückenansicht.

- **B** wirkt am menschlichsten, liest sich aber als generische E-Learning-Illustration. Bei 150 px wird sie unruhig, und die Shirts in `--primaer-weich` machen die Hauptfarbe zur Fläche. Das bricht die CI-Regel. Die Dateien sind drei- bis siebenmal so groß.
- **C** passt formal am besten zu den Diagrammen und ist hell wie dunkel am saubersten. Sie bleibt aber eine Gliederpuppe und löst das Problem „banal“ nur zur Hälfte. Eine brauchbare Dreiviertelansicht fehlt, und viele Technikmotive brauchen gerade diese.

**Übernahmen in A:**

- **aus B:** das perspektivische Feld für Szenen mit Ortsaussage und eine Kinnandeutung am Kopf, die die Blickrichtung zeigt, ohne Gesicht;
- **aus C:** die Erreichbarkeits- und Balance-Warnungen als hartes Prüf-Gate und der Verzicht auf Verläufe, wo eine flache Lösung reicht.

**Mängel von A, die vor der Serie behoben werden müssen:**

- **Bodenschatten im Dunkeln.** Er ist ein Radialverlauf in `--tinte` und wird im Dunkelmodus zu einem hellen Lichthof.
- **Rumpf.** Gesäß und Lende wölben sich zu weit nach hinten. In Rückenansicht wirkt der Rumpf sackartig (G-002, G-043).
- **Freistellungsrand.** Er ist mit 3,4 px zu präsent und wirkt wie ein Aufkleberrand.
- **Arm und Kopf.** In G-010 schneidet der Schlagarm in die Kopfkante, der Gegenarm zeigt nicht zum Speeder.
- **Kopf.** Er ist eine reine Ellipse ohne Blickrichtung.
- **Hand in G-001.** Sie ist eine schwere dunkle Masse, der Daumen liest sich als Wurst.
- **Gleiche Figur.** Alle Figuren haben dieselbe, männlich codierte Proportion. Doppelpartner sind nicht zu unterscheiden.
- **Escaping.** Der Generator escapt `aria-label` und Caption nicht.

## 6. Stilleitfaden (Zielbild auf Basis von A)

Die Zahlen gelten als Startwerte für den Pilot und werden dort festgezurrt. Maßgeblich ist danach `scratchpad/figuren/figur.mjs` (Proportionstabelle `P`), nicht dieses Dokument.

**Figur**

- **Proportion:** Die Kopfeinheit H ist die Kopfhöhe, aufrecht misst die Figur etwa 7,6 H. Ganzfiguren füllen 45 bis 65 % der Bildhöhe, H ist nie kleiner als 20 px.
- **Zwei Körpertypen:** Einer hat breitere Schultern, einer ein breiteres Becken und schmalere Schultern. Sie wechseln über die Serie, und in Doppelszenen unterscheiden sie die Partner.
- **Formen:** Gliedmaßen sind verjüngte Kapseln mit Muskelbauch, der Rumpf ist eine eigene Kontur mit Schulter-, Taillen- und Beckenbreite. Es gibt keine Konturstriche, nur Flächen.
- **Kopf:** eine Ellipse mit kleinem Kinn- bzw. Kieferansatz in Blickrichtung, ohne Gesicht und ohne Mimik.
- **Hände:** Faust oder offene Hand. Am Griff liegt die Hand immer über dem Griff.
- **Füße:** Schuhe mit Ferse, Ballen und Spitze. Die Sohle steht exakt auf dem Boden. Steht die Figur auf dem Ballen, hebt sich die Ferse sichtbar.
- **Tiefe:** Die ferne Körperseite steht in `--tinte-2`. Ein Arm vor dem Rumpf bekommt einen feinen Freistellungsrand von etwa 2,4 px in `--flaeche-2`, aber nur dort, wo er den Rumpf wirklich überdeckt.

**Material**

- **Schläger als Komponente:** Er ist etwa ein Drittel der Körperhöhe lang. Nach Regel 1.2 sind höchstens 61 cm erlaubt, gezeichnet wird ein gängiges Maß um 58 cm. Der ovale, besaitete Kopf ist eine echt projizierte Ellipse und macht etwa 45 % der Länge aus. Dazu kommen Schaft und ein Griff mit Griffband. Der Winkel der Schlagfläche muss über die Verkürzung lesbar sein. In Seitenansicht zeigt die Fläche zum Ziel, nicht zur Betrachterin.
- **Speeder als Komponente:** Er hat eine halbrunde Kappe und einen kegeligen Korb und ist bewusst auf etwa doppelte Größe überzeichnet, in allen Bildern gleich groß. Er fliegt immer Kappe voran. Im Treffmoment liegt er mit der Kappe an der Besaitung. Farben: `--speeder-kappe` und `--speeder-korb` wie in G-064 bis G-067.

**Farbe je Rolle**

| Rolle | Token |
| --- | --- |
| Körper, nahe Seite | `--tinte` |
| Körper, ferne Seite | `--tinte-2` |
| Schläger, Flugbahn, aktive Marke (Fußballen, Treffpunkt, Handzeichen, V) | `--primaer`, Griffband `--primaer-tief` |
| Geisterphasen, Laufwege, Blicklinien, Feldlinien | `--tinte-3`, Geister mit etwa 35 % Deckkraft |
| Speeder | `--speeder-kappe`, `--speeder-korb` |
| Bodenschatten | neues Token `--schatten-boden`, siehe Abschnitt 11 |
| Sonne in Draußen-Motiven | neues Token `--sonne`, ausdrücklich nicht `--signal-gelb` |

Ampelfarben bleiben tabu. Harte Farben, `rgb()` und `style=`-Attribute sind ausgeschlossen. `--primaer` trägt in jedem Bild genau das eine didaktische Element und dessen Werkzeug, also Schläger und Bahn. Hilfslinien bekommen es nie.

**Raum und Bewegung**

- **Boden:** ein flacher Schatten genau auf Fußhöhe. Gestrichelte Linien bleiben gedachten Linien vorbehalten, etwa Bahnen, Blicklinien oder der Aufschlagbereich. Nahaufnahmen haben keinen Boden.
- **Feld:** Szenen mit Ortsaussage zeigen ein perspektivisches Feld in `--tinte-3` mit niedriger Deckkraft. Das betrifft Ecke und Mitte, vorn und hinten im Doppel sowie die Draußen-Motive. Linien sind Bodenmarken, nie aufragend, und ein Netz gibt es nicht.
- **Flugbahnen im Crossminton-Maßstab:** Clear, Smash und Drive verlassen das Bild noch in der Luft, wahlweise mit einer kleinen Bruchmarke. Winkel dürfen didaktisch übertrieben sein, aber nicht unmöglich. Die Bahn ist asymmetrisch: lang steigend, steiler fallend.
- **Bewegung:** Bewegung entsteht über Diagonalen, Körperspannung, eine dezente Schwungsichel und Geisterphasen. Es gibt keine Speedlines und keinen Zierrat. Zeichen liegen nie auf der Figur, sie halten mindestens eine Strichbreite Abstand.
- **Sequenzen** (G-005/006, G-016/017, G-018/019, G-010/011, G-002/007) entstehen aus einer Vorlage. Sie sind deckungsgleich bis auf das didaktisch Gemeinte, und dieser Unterschied muss deutlich sein.

**Konventionen**

- **Rechtshänder, Spielrichtung nach rechts.**
  - Vorhand und Aufschlag mit linkem Fuß vorn, Rückhand mit rechtem Fuß vorn, Ausfallschritt mit dem Schlägerbein vorn.
  - Die Rückhand wird als echte Gegenansicht gezeichnet. Ein bloßes Spiegelbild der Vorhand genügt nicht.
- **Ansicht:** Technikbilder in Dreiviertelansicht, damit Kniebeuge, Vorlage und Fersenhebung lesbar bleiben. Reine Frontal- oder Rückenansicht nur, wo das Motiv sie verlangt.
- **Doppel:** feste Ordnung vorn/hinten nach Regel 7.4 und 7.5.1, nie Seite an Seite, nie „am Netz“. Die Tiefe ergibt sich aus einer gemeinsamen Kamera und nicht aus pro Figur gesetzter Größe. Sonst wirkt ein Partner wie ein Kind neben einem Erwachsenen.
- **Gesundheitsrahmen:**
  - keine Extremwinkel, das Knie nie unter 90° und immer über den Zehen;
  - Landungen federnd;
  - keine Trink-, Ernährungs- oder Belastungsvorgaben, weder im Bild noch in der Caption.

**Text**

- **Caption:** höchstens 270 Einheiten gemessene Breite bei 600 12 px, das sind etwa 40 Zeichen. Die Breite wird gemessen, nicht gezählt. Position wie bisher unten mit `.st`.
- **aria-label:** beschreibt, was das Bild tatsächlich zeigt. Caption, `aria-label` und Katalogeintrag werden zusammen geschrieben.
- **Reihenfolge der Texte:** Die Zahl und Reihenfolge der `<text>`-Elemente einer Grafik ist fest, weil die Sprachzwillinge sie der Reihe nach ersetzen.

## 7. Technischer Ansatz

**Ein Figurensystem statt 32 Handzeichnungen.** Grundlage ist der Generator der Richtung A (`scratchpad/figuren/prototypen/silhouette/figur.mjs`, rund 330 Zeilen, abhängigkeitsfrei). Er wird nach `scratchpad/figuren/` gehoben und ausgebaut. Das Verzeichnis gehört zu `NUR_ENTWICKLUNG` und wird also nicht ausgeliefert.

| Datei | Aufgabe |
| --- | --- |
| `figur.mjs` | Skelett, Proportionen `P` (zwei Körpertypen), Projektion, Tiefenstaffelung, Bodenkontakt, gemeinsame Kamera für Mehrpersonenszenen |
| `bauteile.mjs` | Schläger, Speeder, Hand-Modul (Griff, Handgelenk, Fuß-Nahaufnahme), Feld, Bahn, Weg, Geisterphase, Schatten |
| `posen.mjs` | benannter Posenkatalog je Familie (bereit, ausholen, treffen, ausfallen, abspringen, landen), damit Motive variieren statt neu zu erfinden |
| `motive.mjs` | je Grafik 20 bis 40 Zeilen Komposition, Texte in allen vier Sprachen aus einer Map, schreibt `G-XXX.svg` und die drei Zwillinge nach `images/` |
| `gate.mjs` | Prüf-Gate, siehe unten; bricht mit Exit-Code 1 ab |
| `werkzeug/bogen.mjs`, `werkzeug/vergleich.mjs` | Prüf- und Vergleichsbögen hell und dunkel mit 150-px-Miniatur |

**Prüf-Gate (`gate.mjs`)** prüft jede erzeugte Datei in allen vier Sprachen:

- die Regeln aus Test [22]: nur Klassenselektoren, keine At-Regeln, keine Kommentare im Stilblock;
- nur erlaubte Tokens, keine harten Farben, kein `style=`, `role="img"` und `aria-label` vorhanden, Texte escaped;
- Balance: Hüftlot innerhalb der Standfläche, Kopf bei Vorlage höchstens über dem vorderen Fuß, Sohle auf dem Boden, weder schwebend noch eingesunken;
- Kollisionen: kein naher Arm schneidet den Kopf, kein Zeichen liegt auf der Figur;
- Figurhöhe 45 bis 65 % der Bildhöhe, Abstand zur Caption mindestens 8 Einheiten;
- Caption-Breite gemessen (Playwright, `getComputedTextLength`), höchstens 270 Einheiten, in allen vier Sprachen;
- Sprachzwillinge identisch zur deutschen Fassung außerhalb von `<text>` und `aria-label`.

**Sprachzwillinge** entstehen direkt in `motive.mjs` aus einer Textmap, nicht mehr über `gen-en/fr/pl.mjs`. Für die 32 Grafiken werden deren Einträge damit überflüssig. Die übrigen 35 Grafiken laufen weiter über die alten Skripte, die Ausnahmen G-040, G-061 und G-030.en bleiben unberührt. Terminologie nach `docs/glossar-en.md`, `-fr.md`, `-pl.md`, zum Beispiel Zurufe „Meiner!“ / “Mine!” / « À moi ! » / „Moja!“.

**PNG-Fallbacks** werden mit `scratchpad/render-svg.mjs` in 600 × 600 neu gerendert, alle vier Sprachen. Weil der Freistellungsrand und der Schatten auf dem Bildhintergrund beruhen, bekommt das PNG den hellen Bildhintergrund `--flaeche-2` statt Transparenz. Im Dunkelmodus erscheint vor dem SVG-Tausch dann kurz eine helle, aber lesbare Kachel. Heute sind es dunkle Figuren auf dunklem Grund.

**Einbindung:** Dateinamen und Nummern bleiben, deshalb ist kein Code an der Einbindung nötig. Neue Tokens (`--schatten-boden`, `--sonne`) kommen in alle drei Token-Blöcke von `css/app.css` und nach `docs/ci.md`. Zum Abschluss wird `CACHE` in `sw.js` erhöht. Die SVGs stehen nicht in der Hülle, aber ein frischer Cache sorgt dafür, dass Wiederkehrende die neuen Bilder sofort sehen.

**Tests:** Test [10] (Paarigkeit SVG/PNG, alle Sprachen) und [22] (Stilblöcke) laufen unverändert mit. Zusätzlich sollte `gate.mjs` in `tests/engine.test.mjs` eingehängt werden, mindestens für die statischen Regeln, damit eine spätere Handänderung nicht unbemerkt aus dem Kanon fällt.

## 8. Vorgehen in Phasen

1. **Entscheidungen** (Abschnitt 11): Stilrichtung, Körpertypen, Umfang der Sachkorrekturen, Abnahmeweg.
2. **Fundament:** Generator heben und die Mängel aus Abschnitt 5 beheben (Schatten-Token, Rumpf, Freistellung, Kopf, Kollision, Escaping). Dann Hand-Modul, gemeinsame Kamera, Posenkatalog, Prüf-Gate und Textmap. Dazu ein **Kontextbogen**: neue Figuren neben G-024, G-040, G-055 und G-064 in der Optik einer Baustein-Seite, hell und dunkel. Er zeigt, ob die dunkle Masse neben den hellen Liniendiagrammen zu schwer wirkt.
3. **Pilot mit 9 Grafiken zur Abnahme:**
   - die fünf Referenzmotive G-001, G-002, G-008, G-010 und G-043 in überarbeiteter Fassung;
   - die vier schwierigsten Fälle: G-004 (Rückhand, Arm vor dem Rumpf), G-020 (Sprung-Smash, beide Füße in der Luft), G-053 (Doppel in Bewegung) und G-009 (Unterarm-Nahaufnahme mit Eindrehen).

   Abgenommen wird im Browser auf der echten Baustein-Seite. Erst danach beginnt die Serie.
4. **Serie in Posenfamilien.** Jede Familie baut auf einer sauberen Grundpose auf. Die Wellen laufen als Workflow mit Zeichnen, Gate und unabhängiger Sach- und Bildprüfung je Grafik:

   | Welle | Familie | Grafiken |
   | --- | --- | --- |
   | 1 | Bereitschaft | G-002, G-007, G-032 |
   | 2 | Grundschlag | G-003, G-004, G-012, G-018, G-019, G-022, G-062 |
   | 3 | Aufschlag | G-005, G-006 |
   | 4 | Überkopf und Sprung | G-010, G-011, G-015, G-016, G-017, G-020 |
   | 5 | Bewegung und Athletik | G-008, G-033, G-034, G-036 |
   | 6 | Doppel | G-043, G-047, G-053 |
   | 7 | Draußen | G-054, G-056, G-057, G-058 |
   | 8 | Nahaufnahmen | G-001, G-009, G-035 |

5. **Abschluss:**
   - PNGs rendern, Gate und alle Pflichtprüfungen aus `CLAUDE.md`, Browser-Durchlauf nach dem `verify`-Skill in allen vier Sprachen, hell und dunkel, mobil und Desktop;
   - danach `images/grafik-prompts.md` (Motive, Stilbeschreibung, Rezept), `docs/ci.md` (Tokens) und `CLAUDE.md` (Grafik-Fallstricke) nachziehen, `CACHE` erhöhen;
   - ein PR je Welle oder je zwei Wellen, damit jede Abnahme klein bleibt.

## 9. Abnahmekriterien je Grafik

- Die Aussage des Bausteins ist ohne Caption erkennbar.
- Die Pose entspricht der Soll-Pose im Dossier, und die Sachprüfung gegen Bausteintext und `data/regeln.json` ist bestanden.
- Die Figur steht im Gleichgewicht, Füße und Hände sind glaubwürdig, nichts wächst durch etwas anderes.
- Schläger und Speeder sind als Crossminton-Material erkennbar, die Schlagfläche zeigt in die richtige Richtung.
- Bei 150 px ist die Grafik lesbar, hell und dunkel wirkt sie gleich ruhig.
- Das Gate ist grün, in allen vier Sprachen, und die Tests [10] und [22] sind grün.
- Caption, `aria-label` und Katalogeintrag beschreiben das Bild, wie es ist.
- Sequenzbilder sind deckungsgleich bis auf den gemeinten Unterschied.

## 10. Risiken und Gegenmittel

| Risiko | Gegenmittel |
| --- | --- |
| Die Serie driftet stilistisch auseinander | Ein Generator, feste Proportionstabelle, Posenkatalog, Gate; Handarbeit nur in Nahaufnahmen und nur aus denselben Primitiven |
| Anatomiefehler in schwierigen Posen (Sprung, Rückhand, Rückenansicht) | Diese Fälle stehen im Pilot vorn; Balance- und Kollisionsprüfung im Gate; Großansicht in jeder Prüfrunde |
| Die dunklen Figurflächen wirken neben den hellen Diagrammen zu schwer | Kontextbogen in Phase 2; als Ausweichstufe `--tinte-2` für die nahe Seite testen |
| Badminton-Gewohnheit schleicht sich ein (Seite an Seite, Netz, kurze Bahnen) | feste Prüfzeilen gegen Regel 1.3, 7.4 und 7.5.1 bei jeder Doppel- und Schlaggrafik; kein Test fängt das |
| Übersetzungen sprengen die Caption | Breite wird in allen vier Sprachen gemessen; Kürzung je Sprache in der Textmap statt Schriftverkleinerung |
| PNG-Fallback weicht vom SVG ab | PNG mit hellem Bildhintergrund rendern, im Durchlauf offline gegenprüfen |
| Wiederkehrende sehen alte Bilder | `CACHE` erhöhen; Prüfung im privaten Fenster |

## 11. Offene Entscheidungen

Die Empfehlung steht jeweils zuerst.

1. **Stilrichtung:** A Dynamische Silhouette mit den Übernahmen aus B und C (empfohlen). Alternativen sind B oder C pur.
2. **Körpertypen:** zwei Körpertypen im Wechsel, im Doppel zur Unterscheidung der Partner (empfohlen). Alternative ist eine einheitliche, neutral gehaltene Figur.
3. **Sachkorrekturen:** mitkorrigieren (empfohlen), also Flugbahnen, Doppelordnung, Treffpunkte, Gesundheitsrahmen sowie elf Captions samt Übersetzungen. Alternative ist ein reiner Stilwechsel bei gleichem Inhalt. Der Gesundheitsrahmen in G-058 sollte in jedem Fall korrigiert werden.
4. **Abnahmeweg:** Pilot mit 9 Grafiken, dann Serie in Wellen (empfohlen). Alternative ist alles in einem Zug.
5. **Bodenschatten:** neues Token `--schatten-boden` nach dem Vorbild der Speeder-Tokens (empfohlen). Alternative ist eine dünne durchgezogene Bodenlinie ohne Schatten.
6. **Speederfarben:** Produktfarben wie in G-064 bis G-067 (empfohlen). Die Ausnahme von der Ampelregel ist dort schon begründet. Alternative wären Primärtöne.
7. **Sonne:** eigenes Token `--sonne` (empfohlen). Alternative ist eine neutrale Kontur in `--tinte-3`.
8. **Grundposition G-002:** Dreiviertelansicht mit mittig gehaltenem Schläger (empfohlen), damit Kniebeuge und Fersenhebung lesbar sind und das Bild nicht als Ausholen gelesen wird. Fachlich sollte das eine Trainerin oder ein Trainer bestätigen.

**Nicht Teil dieses Vorhabens, aber aufgefallen:**

- G-045 sollte gegen die Doppelordnung geprüft werden.
- Zur Laufzeit überschreibt `verbessereGrafiken()` das beschreibende `aria-label` mit dem kurzen Titel aus `labels/<sprache>.json`. Screenreader hören also nur „Leitgrafik: der Smash“. Ob dort künftig ein beschreibender Alternativtext stehen soll, ist eine eigene Entscheidung.

## 12. Wo was liegt

| Pfad | Inhalt |
| --- | --- |
| `docs/grafik-strategie.md` | dieses Dokument |
| `docs/grafik-strategie/stilvergleich-{hell,dunkel}.png` | Vergleichsbogen heute und A/B/C |
| `scratchpad/figuren/dossiers.json` | 32 Dossiers und Querbefunde |
| `scratchpad/figuren/prototypen/{silhouette,linie,geometrisch}/` | Generatoren und Prototyp-SVGs der drei Richtungen; `node motive.mjs` erzeugt die SVGs byte-identisch neu |
| `scratchpad/figuren/werkzeug/pruefe.mjs` | Regelprüfung für SVGs (Grundlage des Gates) |
| `scratchpad/figuren/werkzeug/bogen.mjs`, `vergleich.mjs` | Prüf- und Vergleichsbögen hell und dunkel |
