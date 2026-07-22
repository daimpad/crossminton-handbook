# Grafik-Prompts — Crossminton-Handbuch

Zentrale, durchnummerierte Sammlung aller Bild-Prompts der App. Jede Nummer `G-XXX` steht für genau ein Bild und entspricht einer Platzhalter-Datei `G-XXX.png` in diesem Ordner. Sobald ein Bild erzeugt ist, ersetzt es den gleichnamigen Platzhalter — die Zuordnung Baustein ↔ Nummer ↔ Datei ↔ Prompt bleibt dabei stabil.

**Nummernkreis nach Reitern:** Technik (G-001–022), Taktik (G-023–031), Athletik & Kondition (G-032–036), Doppel (G-037–053), Outdoor (G-054–059), Regeln (G-060–061).

**Gemeinsamer Stil** (jedem Prompt voranstellen): illustrative, reduced vector-style drawing, clean flat lines, minimal detail, limited flat colour palette, no background or plain white background, easily abstractable, instructional sports-diagram aesthetic. Keine Fotorealistik, keine Marken/Logos.

**Integration:** je Baustein ein optionales Feld `grafik: ["G-XXX"]` (Liste, mehrere Bilder je Baustein möglich); der Loader zieht darüber die Bilddatei und zeigt sie in der Baustein-Ansicht. Bausteine ohne Eintrag zeigen kein Bild (siehe Abdeckung).

**Zwei Bildquellen (Trennlinie: Raum/Geometrie vs. Körper/Textur):**
- **Diagramme** (Feld, Positionen, Flugbahnen, Formationen, Bemaßung) werden als **theme-fähiges Inline-SVG** hand-gezeichnet — nutzen die CI-Tokens, kippen mit dem Umschalter, sind gestochen scharf und winzig. Nummern im `SVG_GRAFIKEN`-Set (`js/oberflaeche.js`); zu jeder liegt **`G-XXX.svg` UND `G-XXX.png`** (Fallback) vor. **Erledigt: G-023, G-024, G-025, G-026, G-027, G-031, G-037, G-038, G-039, G-042, G-060.** Kandidaten (rein diagrammatisch): Taktik-Sequenzen (G-028 Punkt aufbauen, G-029 Smash vorbereiten, G-030 Gegner-Typen), restliche Doppel-Positionen (G-040 Aufschlag-Rotation, G-041 Umschalten, G-044–046, 048–052), G-014, G-055, G-059, G-061.
- **Illustrationen** (Griff, Schlag, Körperhaltung, Bewegung, Outdoor-Szene) kommen aus dem **KI-Bildgenerator** über die Prompts unten — als `G-XXX.png`. Für ein einheitliches Set jedem Prompt den gemeinsamen Stil (oben) voranstellen und transparenten/schlichten Hintergrund verlangen.

## Abdeckung (Audit)

Bebildert sind die Reiter, in denen ein zentrales Bild das Verständnis trägt: **Technik** (alle Bausteine), die **illustrierbare Taktik-Auswahl**, **bewegungsnahe Athletik-Bausteine**, das **Doppel** über alle drei Stufen, **Outdoor** und zwei **Referenzgrafiken** im Regeln-Reiter.

Bewusst **ohne Leitgrafik** bleiben:

- **Mentales** (alle Stufen) — reflexiv/abstrakt; ein Motorik-Bild trüge nichts bei. Kandidaten für spätere Metapher-Motive.
- **Abstrakte Taktik** — `fehler_vermeiden`, `umschalten`, `gegner_lesen_muster`, `doppel_grundlagen`, `engen_satz_fuehren`, `der_matchplan`, `dem_gegner_aufzwingen`, `matchverlauf_steuern`, `entscheidender_punkt`.
- **Konditionelle Athletik** — `warum_athletik_dein_spiel_traegt`, `richtig_aufwaermen`, `durchhalten`, `erholen`, `gezielt_trainieren`, `rumpfstabilitaet`, `intervallausdauer`, `belastung_steuern_regenerieren`, `form_ueber_die_saison`, `antizipative_schnelligkeit`, `langfristig_belastbar` — Belastungs-/Regenerationsthemen ohne sinnvolles Einzelbild (Gesundheitsrahmen).
- **Trainer-Trainingsgestaltung** — Meta-Ebene, kein Lernbild.
- **Spielmodi** (`spielarten_ueberblick`, `snowminton`, `beachminton`, `blackminton`) — vorerst bildlos; die Umgebungs-Varianten sind gute Kandidaten für spätere Atmosphäre-Motive (Schnee/Sand/Nacht, Nummernkreis ab G-062). Der Grafik-Test bleibt bis dahin bei 55/59.

Für Metapher-/Schema-Motive der abstrakten Bausteine ist ein eigener, späterer Durchgang vorgesehen.

---

## Technik (G-001–022)

**G-001** · `images/G-001.png` · `griff` · Beginner  
*Leitgrafik: der Universalgriff mit V-Stellung*  
Close-up of a hand holding a crossminton racket handle in a neutral universal grip, viewed from above and slightly to the side so the top of the hand is visible. The grip resembles a relaxed handshake; a clear V-shape is formed between thumb and index finger, aligned with the top edge of the handle. Fingers relaxed, not clenched. Focus on the hand and upper handle; the rest of the racket fades out or is cropped.

**G-002** · `images/G-002.png` · `grundposition` · Beginner  
*Leitgrafik: die Grundposition*  
A single player shown from the front in the crossminton ready position: feet slightly more than shoulder-width apart, knees bent, weight forward on the balls of the feet, heels barely touching the ground, torso slightly inclined forward, racket held loosely in front of the body, shoulders relaxed. Alert, spring-loaded posture. Full figure, centered.

**G-003** · `images/G-003.png` · `vorhand_drive` · Beginner  
*Leitgrafik: der Vorhand-Drive*  
A single player from the side hitting a forehand drive in crossminton. Weight shifted onto the front foot, torso rotated toward the hitting direction, racket meeting the speeder in a compact arc clearly in front of the body, wrist held firm and quiet. Flat, direct swing path.

**G-004** · `images/G-004.png` · `rueckhand` · Beginner  
*Leitgrafik: die Rückhand*  
A single player from the side hitting a backhand in crossminton, mirrored to the non-racket side of the body. Weight shifted onto the racket-side foot, torso opening toward the hitting direction, racket guided close past the body and meeting the speeder in front of the body. Compact swing.

**G-005** · `images/G-005.png` · `aufschlag` · Beginner  
*Aufschlag, Bild 1: der Speeder fällt*  
A single player from the side, about to serve in crossminton. The non-racket hand releases the speeder at hip height; the speeder is falling. Racket arm prepared low, ready to swing forward from below. One foot clearly on the ground. Calm, prepared stance.

**G-006** · `images/G-006.png` · `aufschlag` · Beginner  
*Aufschlag, Bild 2: Treffpunkt unterhalb der Schlaghand*  
A single player from the side at the moment of a crossminton serve contact. The racket meets the speeder from below; the entire speeder is clearly below the level of the racket hand at the point of impact. Forward, uninterrupted swing. One foot on the ground.

**G-007** · `images/G-007.png` · `beinarbeit` · Beginner  
*Beinarbeit, Bild 1: der Split-Step*  
A single player from the front in the central position of the square, performing a small split-step: a low springy hop, landing on the balls of both feet, knees bent, ready to push off in any direction. Motion lines suggesting the light upward hop.

**G-008** · `images/G-008.png` · `beinarbeit` · Beginner  
*Beinarbeit, Bild 2: der Bewegungskreislauf*  
A single player from a slightly elevated angle showing the movement cycle in one square: a lunge step reaching toward one corner to play the speeder, with a curved arrow indicating the return path back to the central position in the middle of the square.

**G-009** · `images/G-009.png` · `handgelenk_peitsche` · Fortgeschritten  
*Leitgrafik: der Handgelenk-Schnapp*  
Close-up of a forearm, wrist and racket head from the side, showing the whip-like wrist action of an advanced crossminton stroke. The wrist is first laid back (cocked), then snaps forward; depict the snap with a curved motion arc and a slight blur at the racket head to convey speed. The forearm stays relatively quiet while wrist and racket head accelerate. Loose, relaxed grip. Focus on wrist and racket head; forearm entering from the edge of the frame.

**G-010** · `images/G-010.png` · `ueberkopf_clear` · Fortgeschritten  
*Leitgrafik: der Überkopfschlag*  
A single player from the side hitting an overhead clear in crossminton. Full upward extension: contact point high above and slightly in front of the head, hitting arm stretched up, body elongated, clear forward follow-through. A curved trajectory arrow shows a high, deep arc travelling far into the back of the opposite square. Powerful but controlled posture.

**G-011** · `images/G-011.png` · `smash` · Fortgeschritten  
*Leitgrafik: der Smash*  
A single player from the side hitting a smash in crossminton. High contact point above and in front of the head, aggressive downward swing, body driving forward and down. A straight, steep trajectory arrow points sharply downward toward the opposite square. Explosive, committed posture; the speeder angled steeply down.

**G-012** · `images/G-012.png` · `kurzes_spiel_stopp` · Fortgeschritten  
*Leitgrafik: der Stopp*  
A single player from the side playing a soft stop/drop shot in crossminton. The preparation looks like a firm shot, but the contact is gentle and decelerated. A short, soft trajectory arc shows the speeder barely clearing the passing zone and dropping just behind the front line of the opposite square. Emphasis on the light, cushioned touch and quiet racket; implied contrast between big preparation and soft contact.

**G-013** · `images/G-013.png` · `schnitt_spin` · Fortgeschritten  
*Leitgrafik: der Schnitt*  
Close-up of a racket face meeting the speeder with a slicing, brushing motion in crossminton. The racket face is angled and moves across the speeder rather than straight through it; curved motion lines indicate the brushing cut and the resulting spin on the speeder. Focus on the contact point, the angled racket face and the slicing path.

**G-014** · `images/G-014.png` · `beinarbeit_system` · Fortgeschritten  
*Leitgrafik: das Beinarbeit-System*  
A single player from a slightly elevated top-down angle in the center of one square, illustrating the footwork system of advanced crossminton. From a central base position (with a small split-step indicated), several curved arrows fan out to the corners and sides of the square and back, showing the repeating pattern of pushing off to reach the speeder and recovering to base. Balanced, spring-loaded center posture; clean diagrammatic arrows.

**G-015** · `images/G-015.png` · `frueh_nehmen` · Experte  
*Leitgrafik: Den Speeder früh nehmen*  
A single player from the side taking the speeder at the earliest, highest possible point in crossminton, contact clearly in front of and above the body, meeting the speeder on the rise. A ghosted lower contact point with a small arrow indicates where a slower player would have hit, emphasizing the stolen time. Compact, early, assertive stance.

**G-016** · `images/G-016.png` · `taeuschung` · Experte  
*Täuschung, Bild 1: die identische Vorbereitung*  
A single player from the side in the preparation phase of an advanced crossminton stroke, with a deliberately neutral, identical preparation that gives nothing away — full backswing, poised body, "poker face" stance. The posture reads as ambiguous, not committed to any particular shot.

**G-017** · `images/G-017.png` · `taeuschung` · Experte  
*Täuschung, Bild 2: die späte Entscheidung*  
The same player and identical preparation as before, now with two divergent dashed trajectory arrows branching from the racket — one flat and fast (a hard drive), one short and soft (a drop) — illustrating that the same preparation can produce different shots, chosen only at the last moment. Branching arrows clearly diverging.

**G-018** · `images/G-018.png` · `tempo_rhythmus_wechsel` · Experte  
*Tempowechsel, Bild 1: das hohe Tempo*  
A single player from the side hitting a fast, hard crossminton shot, with strong motion blur and a flat, fast straight trajectory arrow, conveying high pace.

**G-019** · `images/G-019.png` · `tempo_rhythmus_wechsel` · Experte  
*Tempowechsel, Bild 2: der gebrochene Rhythmus*  
The same player from the side with a near-identical preparation, now hitting a slow, high, soft shot — a gentle high arc trajectory arrow and a relaxed, decelerated contact — illustrating a deliberate break in tempo from the same-looking setup.

**G-020** · `images/G-020.png` · `sprung_smash` · Experte  
*Leitgrafik: Der Sprung-Smash*  
A single player in the air at the apex of a jump, hitting a jump smash in crossminton. Elevated contact point high above the head, steep downward trajectory arrow toward the opposite square, athletic airborne posture with the hitting arm extended. Controlled elevation; body balanced for a soft landing.

**G-021** · `images/G-021.png` · `praezision_an_die_linien` · Experte  
*Leitgrafik: Präzision an die Linien*  
A top-down diagram of a crossminton square with the speeder landing exactly on a corner line at the very edge of the square. Small tight target zones marked in the corners and along the lines, with a thin arrow showing the speeder threaded precisely to the edge, illustrating minimal margin and pinpoint placement.

**G-022** · `images/G-022.png` · `konstanz_unter_hoechstdruck` · Experte  
*Leitgrafik: Konstanz unter Höchstdruck*  
A single player from the side executing a clean, textbook-perfect, balanced crossminton stroke with calm, composed posture — steady base, quiet head, controlled follow-through. The image conveys reliability and composure, a repeatable stroke held together under pressure rather than a flashy one. Minimal, controlled, balanced.

## Taktik (G-023–031)

**G-023** · `images/G-023.png` · `spielziel_verstehen` · Beginner  
*Leitgrafik: Das Spielziel verstehen*  
Top-down diagram of the full crossminton court (two squares separated by the passing zone), with a trajectory arrow carrying the speeder across the passing zone to land inside the far square. Illustrates the basic goal: cross the zone, land in the opposite square.

**G-024** · `images/G-024.png` · `zentrale_position` · Beginner  
*Leitgrafik: Zentrale Position und Feldkontrolle*  
Top-down diagram of one square with a single player marker at the central recovery position, and thin arrows radiating outward to all four corners, showing roughly equal reach to every part of the court from that base. Emphasize the balanced central spot.

**G-025** · `images/G-025.png` · `laenge_tiefe` · Beginner  
*Leitgrafik: Länge und Tiefe als einfachste Waffe*  
Top-down diagram of the opposite square with two target zones marked — one short near the front line, one deep near the back line — and two trajectory arrows showing a short drop versus a deep clear. Illustrates varying length and depth.

**G-026** · `images/G-026.png` · `rueckhand_des_gegners` · Beginner  
*Leitgrafik: Die Rückhand des Gegners lesen*  
Top-down diagram of the opposite square with the opponent marked and their backhand corner highlighted as a target zone, and an arrow directing the speeder to that backhand corner. Illustrates targeting the opponent's backhand.

**G-027** · `images/G-027.png` · `aufschlag_taktisch` · Beginner  
*Leitgrafik: Den Aufschlag taktisch nutzen*  
Top-down diagram showing serve placement options from the serve zone: thin arrows to different target points in the opposite square (corners and body), illustrating tactical variety in the serve.

**G-028** · `images/G-028.png` · `punkt_aufbauen` · Fortgeschritten  
*Leitgrafik: Den Punkt aufbauen — lang und kurz*  
Top-down diagram of a rally being constructed: numbered trajectory arrows (1, 2, 3) moving the opponent from corner to corner across their square, ending with an opening. Illustrates building the point by moving the opponent.

**G-029** · `images/G-029.png` · `smash_vorbereiten` · Fortgeschritten  
*Leitgrafik: Den Smash vorbereiten*  
Top-down diagram of a setup: a deep, pressing shot forces the opponent to send back a weak high ball (upward arrow), which is then put away with a steep downward smash arrow. Illustrates forcing the lift, then finishing.

**G-030** · `images/G-030.png` · `gegner_typen_gegenrezepte` · Experte  
*Leitgrafik: Gegner-Typen und Gegenrezepte*  
Schematic three-panel diagram of opponent archetypes — an attacker, a defender/retriever, and a slow mover — each with a short counter-strategy indication (slow the pace; move corner to corner; wide angles). Clean schematic.

**G-031** · `images/G-031.png` · `schwaeche_systematisch_angreifen` · Experte  
*Leitgrafik: Eine Schwäche systematisch angreifen*  
Top-down diagram of the opposite square with one corner marked as a weakness and several repeated arrows returning to that corner, plus one or two other arrows opening it up. Illustrates systematically attacking a single weak zone.

## Athletik & Kondition (G-032–036)

**G-032** · `images/G-032.png` · `schnelle_fuesse` · Beginner  
*Leitgrafik: Schnelle Füße*  
A single player from the front doing a quick-feet footwork drill in crossminton, low athletic stance on the balls of the feet, small rapid steps suggested by light motion lines at the feet, knees bent, ready to change direction. Emphasis on fast, light ground contact.

**G-033** · `images/G-033.png` · `beweglichkeit_und_schulter` · Beginner  
*Leitgrafik: Beweglichkeit und die Schulter*  
A single player performing a gentle shoulder and torso mobility movement, one arm circling along a curved motion arc across the shoulder, relaxed upright posture. Warm-up character, smooth range of motion.

**G-034** · `images/G-034.png` · `explosivitaet` · Fortgeschritten  
*Leitgrafik: Explosivität und Sprungkraft*  
A single player pushing off explosively from a low loaded stance toward one corner, a strong upward-forward motion arrow from the driving leg, dynamic athletic posture conveying power and jump strength.

**G-035** · `images/G-035.png` · `reaktivkraft_bodenkontakt` · Experte  
*Leitgrafik: Reaktivkraft — der schnelle Bodenkontakt*  
Close-up side view of a player's foot and lower leg at a short, springy ground contact — minimal contact time shown by a small compression arc and a quick rebound arrow, illustrating reactive strength and a stiff, elastic bounce.

**G-036** · `images/G-036.png` · `bewegungsoekonomie` · Experte  
*Leitgrafik: Bewegungsökonomie — effizient statt hektisch*  
Side-by-side contrast of one player moving efficiently — a smooth, minimal, economical path with a clean short arrow — versus a faded hectic version with scattered extra motion lines. Illustrates economical, unhurried movement.

## Doppel (G-037–053)

**G-037** · `images/G-037.png` · `doppel_als_eigenes_spiel` · Fortgeschritten  
*Leitgrafik: Das Doppel als eigenes Spiel*  
Top-down diagram of a crossminton court set for doubles — two players in each of the two opposing squares (four players total), separated by the passing zone. Emphasize the shared square: two players occupying one square as a pair. Simple distinct markers for players, clean court outline.

**G-038** · `images/G-038.png` · `angriff_im_paar` · Fortgeschritten  
*Leitgrafik: Angriff im Paar*  
Top-down diagram of one square showing the doubles attacking formation: one player positioned forward near the front line (attacker) and the partner positioned behind (back-space player), a clear front-back stagger. Distinct markers for the two roles; an arrow suggesting the forward attacking orientation.

**G-039** · `images/G-039.png` · `verteidigung_im_paar` · Fortgeschritten  
*Leitgrafik: Verteidigung im Paar*  
Top-down diagram of one square showing the doubles defensive formation: the two players positioned side by side, each covering one half of the square, sharing the width. Distinct markers; a dashed line dividing the two covered halves.

**G-040** · `images/G-040.png` · `aufschlag_rueckschlag_doppel` · Fortgeschritten  
*Leitgrafik: Aufschlag und Rückschlag im Doppel*  
Top-down diagram of both squares illustrating the doubles serve rotation: four players as distinct markers (two per side), with numbered arrows 1–4 showing the serve passing in the fixed sequence from the first server to the opposing attacker, then to each partner in turn and back. Clear numbered rotation arrows (text labels optional, may be added manually).

**G-041** · `images/G-041.png` · `das_umschalten_im_doppel` · Fortgeschritten  
*Leitgrafik: Das Umschalten im Doppel*  
Top-down diagram showing the transition between formations in doubles: on one side the front-back attacking stagger, transforming via curved rotation arrows into the side-by-side defensive formation, illustrating the switch between attack and defense. Two small formation states linked by rotation arrows.

**G-042** · `images/G-042.png` · `bewegung_als_einheit` · Fortgeschritten  
*Leitgrafik: Bewegung als Einheit*  
Top-down diagram of one square showing the two doubles partners moving together as a connected unit — both shifting in the same direction to cover the speeder, maintaining constant spacing, with a subtle connecting band between the pair and parallel movement arrows.

**G-043** · `images/G-043.png` · `verstaendigung_im_paar` · Fortgeschritten  
*Leitgrafik: Verständigung im Paar*  
A pair of crossminton doubles partners shown from behind, communicating between points — one giving a discreet hand signal behind the back, with brief eye contact or a short cue suggested by a small signal motif. Conveys coordination and communication as a pair. Clean instructional style.

**G-044** · `images/G-044.png` · `erste_schritte_doppel` · Beginner  
*Leitgrafik: Erste Schritte im Doppel*  
Top-down diagram of one square with two beginner partners taking their first steps as a pair, comfortable spacing, simple distinct markers and a friendly connecting line between them. Illustrates the very first doubles setup.

**G-045** · `images/G-045.png` · `wer_nimmt_den_ball` · Beginner  
*Leitgrafik: Wer nimmt den Ball*  
Top-down diagram of one doubles square with an incoming speeder in the middle between the two partners, one partner clearly stepping in to take it (highlighted) while the other yields, a small call motif. Illustrates who takes the ball.

**G-046** · `images/G-046.png` · `aufschlag_im_doppel_einfach` · Beginner  
*Leitgrafik: Aufschlag im Doppel, einfach*  
Top-down diagram of both squares showing a simple doubles serve in fixed order: four player markers, a single numbered arrow showing the underarm serve crossing the passing zone. Clean, beginner-friendly.

**G-047** · `images/G-047.png` · `sich_absprechen` · Beginner  
*Leitgrafik: Sich absprechen*  
Two doubles partners shown from behind between points, briefly agreeing with a simple gesture or short cue, relaxed friendly posture. Illustrates basic communication as a pair.

**G-048** · `images/G-048.png` · `einander_platz_lassen` · Beginner  
*Leitgrafik: Einander Platz lassen*  
Top-down diagram of one doubles square where the two partners move along an invisible connecting band, keeping clear space between them, with parallel movement arrows and a dashed spacing line. Illustrates leaving each other room.

**G-049** · `images/G-049.png` · `paar_als_system` · Experte  
*Leitgrafik: Das Paar als System*  
Top-down diagram of one square where the two partners act as one connected system — a clear connecting band, coordinated arrows and shared coverage of the whole square. Illustrates the pair as a single unit.

**G-050** · `images/G-050.png` · `gegnerisches_paar_lesen` · Experte  
*Leitgrafik: Das gegnerische Paar lesen*  
Top-down diagram of the opposite doubles square with the opposing pair marked and small read-cues (formation, gaps) highlighted, an eye or focus motif on the reading player. Illustrates reading the opposing pair.

**G-051** · `images/G-051.png` · `partner_in_position_bringen` · Experte  
*Leitgrafik: Den Partner in Position bringen*  
Top-down diagram of one square where one partner's shot (arrow) sets up the other partner, moving them into an attacking position along a curved positioning arrow. Illustrates bringing the partner into position.

**G-052** · `images/G-052.png` · `nahtlos_umschalten` · Experte  
*Leitgrafik: Nahtlos umschalten*  
Top-down diagram showing a smooth, seamless transition of a doubles pair between attacking front-back and defensive side-by-side formations, fluid rotation arrows with no gap. Illustrates seamless switching.

**G-053** · `images/G-053.png` · `blindes_verstaendnis` · Experte  
*Leitgrafik: Blindes Verständnis*  
Two doubles partners moving in perfect anticipation without looking at each other, mirrored coordinated movement arrows and a subtle shared-awareness motif. Illustrates blind, instinctive understanding.

## Outdoor (G-054–059)

**G-054** · `images/G-054.png` · `draussen_spielen` · Fortgeschritten  
*Leitgrafik: Draußen spielen*  
A single player on an outdoor crossminton court without a net, open sky and a simple ground surface indicated, relaxed adaptable stance. Illustrates the outdoor setting in general.

**G-055** · `images/G-055.png` · `wind_lesen_nutzen` · Fortgeschritten  
*Leitgrafik: Wind lesen und nutzen*  
Top-down diagram of an outdoor court with wind-direction arrows sweeping across the field and a trajectory adjusted against the drift, a small wind motif. Illustrates reading and using the wind.

**G-056** · `images/G-056.png` · `sonne_blendung` · Fortgeschritten  
*Leitgrafik: Sonne und Blendung*  
A single player shading the eyes against a low sun while tracking a high speeder, sun and glare rays indicated in one corner, adjusted head position. Illustrates dealing with sun and glare.

**G-057** · `images/G-057.png` · `naesse_sicherer_stand` · Fortgeschritten  
*Leitgrafik: Nässe und sicherer Stand*  
A single player with a widened, cautious stance on a damp surface, small water droplets and a secure low centre of gravity indicated. Illustrates a safe stance in wet conditions.

**G-058** · `images/G-058.png` · `hitze` · Fortgeschritten  
*Leitgrafik: Hitze*  
A single player pacing themselves in heat, sun high overhead, a water bottle nearby and a calm, measured posture. Illustrates managing play in heat.

**G-059** · `images/G-059.png` · `verschiedene_boeden` · Fortgeschritten  
*Leitgrafik: Verschiedene Böden*  
A small comparison strip of different ground surfaces — sand, grass, ash, artificial turf — each a simple textured patch with a foot icon, illustrating adapting footwork to different surfaces.

## Regeln (G-060–061)

**G-060** · `images/G-060.png` · — (Regeln-Referenz, ohne Baustein) · —  
*Referenzgrafik: das bemaßte Spielfeld*  
Precise top-down technical diagram of a crossminton court: two 5.5 x 5.5 m squares separated by a 12.8 m passing zone, serve line 3 m from the front line, dimensions labeled. Clean instructional blueprint style, transparent/white background.

**G-061** · `images/G-061.png` · — (Regeln-Referenz, ohne Baustein) · —  
*Referenzgrafik: die Schiedsrichter-Handzeichen*  
A clean multi-panel reference sheet of crossminton umpire hand signals (in; out; time-out 'T'; repeated play; change of ends; service-line fault), each panel a simple line figure with a caption slot. Reduced vector reference style, transparent/white background.

