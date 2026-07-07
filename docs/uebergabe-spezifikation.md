# Crossminton-Lernapp — Übergabespezifikation (Erstausbau)

Diese Spezifikation bündelt alle konzeptionellen und technischen Entscheidungen für die Umsetzung. Sie ist als Arbeitsgrundlage für die Implementierung gedacht und referenziert die Inhaltsdaten in `bausteine.beginner-technik.json`.

---

## 1. Zweck und Geltungsbereich

Zu bauen ist eine **clientseitige, mobil-orientierte Lernanwendung** für Crossminton. Sie vermittelt Inhalte in kleinen, durchklickbaren Einheiten (Bausteinen), führt die lernende Person über mehrere Zugangswege (Pfade) durch den Stoff und begleitet den Fortschritt mit einem zurückhaltenden Gamification-Layer.

**Im Erstausbau enthalten:** das Datenmodell, die Pfad-Engine (vier Pfade plus Cross-Sport-Modifikator), die Onboarding-Diagnostik, der Gamification-Layer in seiner Grundform, die mehrsprachige Struktur (Quellsprache Deutsch), sowie der Beginner-Technikpfad als vollständiger Referenzinhalt.

**Ausdrücklich nicht im Erstausbau:** serverseitige Komponenten, geräteübergreifende Synchronisation, Mastery-Checks (nur strukturell vorgehalten), Trainingseinheiten-Generierung (nur kuratiert), Inhalte jenseits des Beginner-Technikpfads, Grafiken (nur als KI-Prompts vorbereitet), Befüllung der Zielsprachen (nur strukturell angelegt).

---

## 2. Architektureller Rahmen

- **Rein clientseitig**, HTML/CSS/JS, so weit wie möglich ohne Server. Keine Server-Komponente, kein Build-Zwang über das Nötige hinaus.
- **Inhalte als statische Datendateien** (JSON), die zur Laufzeit geladen werden. Siehe `bausteine.beginner-technik.json`.
- **Fortschritt lokal** im Browser gehalten (z. B. localStorage). Er ist zunächch gerätegebunden.
- **Mobil-orientiert**: kleine Einheiten, gut auf kleinem Schirm lesbar, durchklickbar.
- **Mehrsprachigkeit im Datenmodell verankert** (siehe Abschnitt 3), Quellsprache Deutsch, Zielsprachen Englisch, Französisch, Polnisch.
- **Offene Ausbaustufen** (strukturell mitdenken, nicht umsetzen): Offline-Fähigkeit (etwa als PWA — durch die statischen Inhalte fast beiläufig erreichbar); schlanke Server-Komponente für geräteübergreifenden Fortschritt und zentrale Inhaltspflege.

---

## 3. Datenmodell

### 3.1 Grundprinzip: Trennung von Inhalt und Pfad

Es gibt **einen** Pool aus Bausteinen. Alle Zugänge (Pfade) sind Traversierungen durch denselben Pool. Ein Baustein wird einmal geführt und über mehrere Pfade eingehängt; Inhalt wird nicht dupliziert.

### 3.2 Der Baustein

Kern-Entität. Trägt zehn Metadaten-Felder (Vokabulare in `bausteine…json` unter `vokabulare`):

1. **Domäne** — genau ein Primärwert (Grenzfall: optionaler Zweitwert). Werte: `technik, taktik, trainingsgestaltung, mentales, athletik_kondition`.
2. **Kompetenzstufe** — Mehrfachzuordnung erlaubt. Werte: `beginner, fortgeschritten, experte, trainer`. `trainer` dockt bevorzugt an eine Könnensstufe an; eigenständig nur für technikübergreifendes Meta-Wissen.
3. **Baustein-Typ** — genau ein Wert. Werte: `micro, vertiefung, delta, fehlerbild, umgebungs_baustein`.
4. **Voraussetzungen** — Liste von Baustein-IDs oder leer. Domänenübergreifend erlaubt. Wirkung: weiche Empfehlung (siehe Abschnitt 4).
5. **Lernziele** — zwei getrennte Dimensionen, beide kontrolliert-erweiterbar, Mehrfachwerte:
   - *Spielziele*: 6 Oberbereiche, 21 Faktoren (Primärordnung: limitierender Faktor; sekundäre Facette: Spielsituation).
   - *Vermittlungsziele*: 4 Vermittlungstätigkeiten, 13 Faktoren (sekundäre Facette: Lernphase; Adressatengruppe als späterer Modifikator).
6. **Transfer-Herkunft** — Mehrfachwerte, dezent sichtbar, per Schalter ausblendbar. Werte: `CM, BAD, TEN, SQ, BS`. Konvention: mehrere Kürzel nur bei substanziell verschiedenen Herkünften; jedes Kürzel höchstens einmal pro Baustein (Belegvielfalt derselben Herkunft gehört in die Quellendokumentation).
7. **Untergrund** — Modifikator-Dimension, Default `halle`. Werte: `halle, sand, rasen, asche, kunstrasen`.
8. **Witterung** — nur outdoor, sonst leer. Werte: `wind, sonne_blendung, naesse, hitze`.
9. **Innere Abschnittsstruktur** — `erklaerteil` (immer), `uebungsteil` (verpflichtend bei Technik, sonst optional).
10. **Abschluss-Status** — siehe Abschnitt 8. Erweiterbarer Zustandsraum; im Erstausbau aktiv: `offen → erledigt`, getrennt für Erklär- und Übungsteil.

### 3.3 Mehrsprachigkeit

Sprachneutrale **Identität** (IDs, Kürzel, Faktor-IDs, Relationen) ist strikt getrennt von sprachabhängiger **Beschriftung** (Baustein-Texte, sichtbare Vokabel-Labels). Übersetzbar sind: alle Baustein-Texte (Erklärteil, Übungsteil, Delta) *und* alle sichtbaren Labels (Domänennamen, Stufen, Lernziel-Faktoren, ausgeschriebene Transfer-Herkünfte). Die Kürzel selbst bleiben sprachneutral. Im Erstausbau ist nur `de` befüllt; `en, fr, pl` sind strukturell angelegt.

### 3.4 Die Trainingseinheit

Eigene Entität, getrennt vom Baustein. Enthält eine **geordnete Referenzliste auf Übungsteile** von Bausteinen (nicht auf ganze Bausteine). Im Erstausbau **kuratiert** (von Hand befüllt); die Struktur hält die spätere regelbasierte Generierung offen, ohne sie umzusetzen.

---

## 4. Relationen und Graph

### 4.1 Voraussetzungsrelation (Feld 4) — zwei Lesarten

Formal eine gerichtete Kante, semantisch zwei Typen (nicht strukturell getrennt, beide über den weichen Mechanismus):
- *Motorisches Aufbauen* — die Bewegung baut auf einer anderen auf (Aufschlag ← Griff).
- *Didaktisches Sinnstiften* — ein Baustein gibt einem anderen erst einen Bezugspunkt (Beinarbeit ← Vorhand/Rückhand: Bewegung zum Ball braucht einen zu spielenden Schlag).

Beide wirken als **Default-Sortierkriterium, nicht als Zugangssperre** (siehe 4.4). Eine spätere Differenzierung über ein Typ-Attribut ist vorgemerkt, nicht Teil des Erstausbaus.

### 4.2 Ersetzungsrelation „ersetzt-bei-Herkunft"

Gerichtete, **bedingte** Kante zwischen einem Delta-Baustein und dem Erklärteil eines Basisbausteins. Kategorial verschieden von der Voraussetzung: Die Voraussetzung ordnet eine Sequenz, die Ersetzung substituiert eine Darstellung.
- **Bedingung:** aktiv nur, wenn die im diagnostischen Zustand hinterlegte Herkunft der Herkunft des Deltas entspricht. Dann tritt der Delta-Erklärteil an die Stelle des Basis-Erklärteils. Der **Übungsteil des Basisbausteins bleibt stets erhalten**.
- **Optional:** Existiert für eine Herkunft kein Delta, ist das **kein Fehlerfall** — der reguläre Basis-Erklärteil wird gezeigt (z. B. Grundposition, Beinarbeit für Badminton-Umsteiger).
- **Kardinalität:** ein Basisbaustein kann mehrere eingehende Ersetzungskanten tragen (je Herkunft eine); zur Laufzeit greift höchstens eine.
- Die Relation verändert **nicht die Sequenz**, nur den Inhalt der Station. Sie ist die Grundlage der Modifikator-Operation „Delta-Einblendung" (Abschnitt 6).

### 4.3 Delta-Bündelung und Delta-auf-Delta-Verweise

Kumulieren an einem Baustein mehrere bereits behandelte Herkunftsanpassungen, bündelt der Delta sie **inhaltlich** (kein neuer Typ). Verweise auf vorausgehende Deltas laufen über die weiche Voraussetzung und sind **reine Lektüreempfehlungen**, keine harten Abhängigkeiten. Der dominante Anpassungspunkt wird eigenständig ausgetragen, nachgeordnete werden referenziert (Beispiel: `rueckhand_delta_bad`).

### 4.4 Zwei-Ebenen-Logik (übergreifend, alle Pfade)

**Sortierung** und **Zugänglichkeit** sind getrennt. Der Voraussetzungsgraph bestimmt die Default-Reihenfolge; die Zugänglichkeit bleibt davon unabhängig frei. Springt die Person aus der Reihe, erscheint ein **Hinweis** auf die nicht absolvierte Voraussetzung, ohne den Zugriff zu verwehren.

---

## 5. Baustein-Typen und innere Struktur

- **Micro** — kompakter Lernkern (Standardfall im Erstausbau).
- **Vertiefung** — ausführlichere Einheit mit Grafik (im Erstausbau nicht befüllt, strukturell vorgesehen).
- **Delta** — Cross-Sport-Anpassung. Trägt **nur einen Erklärteil, keinen eigenen Übungsteil** (Delta-Übungsregel). An dessen Stelle steht eine im Erklärteil eingebettete Selbstkontrolle (keine formale Einheit, kein eigener Abschluss-Status). Der Übungsteil des Basisbausteins gilt. Regel für alle Deltas, bewusst lockerbar, falls eine künftige Kombination eine genuin neue motorische Teilaufgabe erzeugt.
- **Fehlerbild** — Troubleshooting (Symptom → Ursache → Korrektur). Im Erstausbau als Trainer-Layer je Baustein vermerkt (`trainer_layer_offen`), noch nicht ausformuliert.
- **Umgebungs-Baustein** — eigenständige Outdoor-Themen (begründete Ausnahme; im reinen Hallen-Beginnerpfad nicht vorhanden).

**Erklär-/Übungsteil-Trennung:** Jeder Baustein trennt innerlich. Der Kompetenzpfad durchläuft die ganze Einheit; der Trainingspfad steuert gezielt den Übungsteil an. Fortschritt wird für beide Teile **getrennt** quittiert.

**Relational-selbsttragendes Muster** (redaktionelle Konvention, keine Datenstruktur): Ein Baustein darf eine graphinterne Beziehung nutzen (relationale Schicht), muss aber bei isoliertem Zugriff verständlich bleiben (selbsttragende Schicht). Beispiel: `rueckhand` (`relational_selbsttragend: true`).

---

## 6. Traversierungsregeln

Vier gleichrangige Pfade plus ein überlagernder Modifikator. Alle erben die Zwei-Ebenen-Logik (4.4).

### 6.1 Kompetenzpfad (zugleich Standard-Basispfad des Modifikators)
- Filtert nach Kompetenzstufe.
- Ein mehrfach zugeordneter Baustein erscheint **einmalig an seiner niedrigsten Stufe**.
- Sortierung innerhalb einer Stufe: **Voraussetzungsgraph primär, Domäne sekundär** (bei gleichrangigen Bausteinen).

### 6.2 Individualpfad
- Filtert nach gewähltem Ziel (Spielziel-/Vermittlungsziel-Faktoren).
- Voraussetzungen **außerhalb** der gefilterten Menge werden **nur als Hinweis** angezeigt, nicht automatisch aufgenommen (Autonomie der Zielwahl).
- Sortierung: **Voraussetzungsgraph primär** (soweit innerhalb der Menge), **Ziel-Nähe sekundär** als Füllkriterium.

### 6.3 Themenpfad
- Facettennavigation nach Domäne, **geordnet-explorativ**: Graph liefert eine **angebotene Default-Sortierung**, von der frei abgewichen werden kann.

### 6.4 Trainingspfad
- Steuert **Übungsteile** an (nicht ganze Bausteine).
- Einheiten sind **kuratiert** (eigene Entität mit Referenzliste, Abschnitt 3.4). Generierung strukturell offen, nicht umgesetzt.

### 6.5 Cross-Sport-Modifikator (kein eigener Pfad)
Überlagernde Schicht über einem Basispfad (Standard: Kompetenzpfad; über jeden Basispfad legbar, aber initial nur Kompetenzpfad verdrahtet). Erbt die Sequenz des Basispfads und führt drei Operationen aus:
1. **Delta-Einblendung** — via Ersetzungsrelation (4.2): bei passender Herkunft tritt das Delta an die Stelle des Erklärteils.
2. **Optionales Überspringen** — Bausteine, die der Umsteiger nachweislich beherrscht und für die kein Delta nötig ist, können als erledigt vormarkiert werden.
3. **Kennzeichnung** — die Herkunft steuert die dezent sichtbaren Transfer-Kürzel.

---

## 7. Onboarding-/Diagnostiklogik

Erhebt den **diagnostischen Zustand** (Stufe, Herkunft, Ziel). Dieser ist **revidierbar** und wird als persistente, veränderbare Eigenschaft der Person modelliert; die Pfade lesen ihn bei jeder Traversierung neu.

### 7.1 Erhebungsumfang (gestaffelt)
- **Stufe: obligatorisch** (konstitutiv — ohne sie keine Sequenz).
- **Herkunft: überspringbar.** Default bei Auslassung: kein Modifikator.
- **Ziel: überspringbar.** Default bei Auslassung: Kompetenzpfad.

### 7.2 Stufen-Selbsteinschätzung (zwei getrennte Fragen)
Über **verhaltensnahe Anker** (Wiedererkennung statt abstraktem Etikett), Bezugspunkt: Spielfähigkeit im Ballwechsel.
- **Frage 1 — Könnensstufe** (Kontinuum): Beginner / Fortgeschritten / Experte.
- **Frage 2 — Vermittlungsperspektive** (orthogonal, quer): Trainer ja/nein, **additiv** freigeschaltet.

Anker-Texte siehe Anhang A.

### 7.3 Herkunft und Modifikator
Im Onboarding werden **nur implementierte Herkünfte** angeboten (abgeleitet aus dem Bestand vorhandener Delta-Bausteine), im Erstausbau: Badminton + „keine Vorerfahrung". Die Auswahlliste wird nicht fest verdrahtet, sondern aus dem Delta-Bestand generiert — sie bleibt so automatisch synchron mit dem Ausbaustand.

### 7.4 Ziel und Pfadwahl (entkoppelt)
Die Zielangabe aktiviert den Individualpfad **nicht automatisch**. Zieläußerung und Pfadwahl sind getrennte Schritte; ein Ziel bleibt in jedem Fall gespeichert und wirksam (kann auch im Kompetenzpfad die Sichtbarkeit relevanter Bausteine beeinflussen).

### 7.5 Fortschritt bei Zustandswechsel
Fortschritt ist **baustein-gebunden**: ein absolvierter Baustein bleibt absolviert, unabhängig vom Pfad und unabhängig von Zustandsänderungen.

---

## 8. Gamification

### 8.1 Fortschritts-Repräsentation (projektionsbasiert)
Der baustein-gebundene Abschluss-Status ist die **invariante Datengrundlage**. Fortschrittsgrößen sind **Projektionen** darüber:
- **global** (über den Gesamtpool),
- **pfadbezogen** (über die jeweilige Pfad-Teilmenge).

Beide lesen denselben Status, aggregieren nur über verschiedene Mengen. Domänen-Ebene als weitere Projektion offen, nicht umgesetzt.

### 8.2 Abschluss-Status als erweiterbarer Zustandsraum
Zustände: `offen`, `erledigt` (aktiv), `beherrscht` (**vorgesehen, im Erstausbau inaktiv**). „gelesen → erledigt" getrennt für Erklär- und Übungsteil. Die spätere Mastery-Nachrüstung ist damit eine **Aktivierung des Vorgesehenen**, keine Datenmigration.

### 8.3 Gratifikation (drei Granularitäten, zurückhaltend)
1. **Baustein-Abschluss** — nur bestätigende Quittierung, **keine** eigenständige Gratifikation (Hochfrequenz-Ereignis; Abnutzung vermeiden).
2. **Sequenzabschluss** — zwei distinkte Anlässe:
   - *Pfadabschluss* = Kompetenz-Meilenstein (würdigt einen erarbeiteten Zustandswechsel).
   - *Trainingseinheit-Abschluss* = Bestätigung einer Sitzung; zugleich Anknüpfungspunkt der Kontinuität.
3. **Kontinuität** — **kumulative Logik ohne Abbruchmechanik**: absolvierte Sitzungen summieren sich; Pausen entwerten den Stand nicht (keine Streak-Bestrafung; respektiert Regeneration und Autonomie).

Falls `beherrscht` später aktiviert wird, fügt sich ein Anlass „nachgewiesene Beherrschung" in die Meilenstein-Ebene ein.

### 8.4 Sichtbarkeit und Tonalität
**Begleitend, nicht treibend.** Fortschritt und Würdigung jederzeit einsehbar, ohne sich vor den Inhalt zu drängen. Tonalität sachlich-klar, nicht werblich — konsistent mit der Sprache der Bausteine.

---

## 9. Inhaltsausschnitt als Referenzdaten

Vollständiger **Beginner-Technikpfad** in `bausteine.beginner-technik.json` als echte Testdaten für die Engine:

- **Sechs Basisbausteine** (Reihenfolge im Graphen): `grundposition → griff → aufschlag → vorhand_drive → rueckhand → beinarbeit`.
- **Vier Delta-Bausteine** (Herkunft Badminton): zu Griff, Aufschlag, Vorhand-Drive, Rückhand. Grundposition und Beinarbeit **ohne** Delta (belegt den Nicht-Fehlerfall, 4.2).
- `rueckhand_delta_bad` demonstriert die Delta-Bündelung (4.3).
- Alle Bausteine vollständig getaggt; `de` befüllt, Zielsprachen strukturell offen.

Diese Daten sollen die Pfad-Engine, den Modifikator und die Onboarding-Logik real durchspielbar machen.

---

## 10. Offene inhaltliche Arbeit (noch nicht in den Daten)

- **Grafiken**: acht KI-Prompts vorbereitet (Anhang B), Bilder noch nicht erzeugt. Stil: illustrative, reduzierte vektorähnliche Zeichnung, transparenter/weißer Hintergrund.
- **Trainer-Layer / Fehlerbilder**: je Baustein vermerkt (`trainer_layer_offen`), noch nicht geschrieben.
- **Zielsprachen** `en, fr, pl`: Struktur angelegt, Übersetzung ausstehend.
- **Unerprobte Vokabulare**: Vermittlungsziele, Untergrund, Witterung sind noch nicht durch Inhalt erprobt (Status „unkonsolidiert, da ungenutzt"). Der Doppel-Faktor „doppel_spezifische_loesungen" (Spielziele, Bereich 6) ist als beobachtungsbedürftig markiert (mögliche spätere Aufspaltung).
- **Höhere Stufen der Beinarbeit**: vollständiges Beinarbeit-System als getrennte Fortgeschrittenen-/Experten-Bausteine; dort ist ein Delta zu erwarten (netzlose Feldgeometrie weicht von Badminton ab).

---

## Anhang A — Verhaltensnahe Stufen-Anker (Quellsprache de)

**Frage 1 — Wo stehst du im Spiel?**

- **Beginner:** Du bist neu im Crossminton oder hast erst ein paar Mal gespielt. Der Speeder geht mal übers Feld, mal daneben — noch fühlt sich vieles ungewohnt an. Du willst die Grundlagen von Grund auf lernen.
- **Fortgeschritten:** Du hältst einen Ballwechsel zuverlässig am Laufen. Vorhand, Rückhand und Aufschlag sitzen im Grundsatz, und du bewegst dich brauchbar im Feld. Jetzt willst du sicherer und variabler werden.
- **Experte:** Du gestaltest lange Ballwechsel aktiv und setzt den Gegner gezielt unter Druck. Du variierst Tempo, Länge und Platzierung bewusst und liest das Spiel. Du suchst den Feinschliff und taktische Tiefe.

**Frage 2 — Lernst du auch, um es anderen beizubringen?**

- **Trainer-Perspektive:** Du willst Crossminton nicht nur selbst spielen, sondern anderen vermitteln — Fehler erkennen, korrigieren, Übungen und Trainingseinheiten aufbauen. Diese Sicht schaltest du zusätzlich zu deiner Spielstufe frei.

---

## Anhang B — Grafik-Prompts (KI-Generierung)

**Fester Stil-Block** (jedem Prompt voranstellen):
> Illustrative, reduced vector-style drawing, clean flat lines, minimal detail, limited flat color palette, no background or plain white background, easily abstractable, instructional sports-diagram aesthetic.

**Motiv-Teile:**

- **grundposition_leitgrafik:** A single player shown from the front in the crossminton ready position: feet slightly more than shoulder-width apart, knees bent, weight forward on the balls of the feet, heels barely touching the ground, torso slightly inclined forward, racket held loosely in front of the body, shoulders relaxed. Alert, spring-loaded posture. Full figure, centered.
- **griff_leitgrafik:** Close-up of a hand holding a crossminton racket handle in a neutral universal grip, viewed from above and slightly to the side so the top of the hand is visible. The grip resembles a relaxed handshake; a clear V-shape is formed between thumb and index finger, aligned with the top edge of the handle. Fingers relaxed, not clenched. Focus on the hand and upper handle; the rest of the racket fades out or is cropped.
- **aufschlag_seq_1** (Bild 1 von 2): A single player from the side, about to serve in crossminton. The non-racket hand releases the speeder at hip height; the speeder is falling. Racket arm prepared low, ready to swing forward from below. One foot clearly on the ground. Calm, prepared stance.
- **aufschlag_seq_2** (Bild 2 von 2): A single player from the side at the moment of a crossminton serve contact. The racket meets the speeder from below; the entire speeder is clearly below the level of the racket hand at the point of impact. Forward, uninterrupted swing. One foot on the ground.
- **vorhand_drive_leitgrafik:** A single player from the side hitting a forehand drive in crossminton. Weight shifted onto the front foot, torso rotated toward the hitting direction, racket meeting the speeder in a compact arc clearly in front of the body, wrist held firm and quiet. Flat, direct swing path.
- **rueckhand_leitgrafik:** A single player from the side hitting a backhand in crossminton, mirrored to the non-racket side of the body. Weight shifted onto the racket-side foot, torso opening toward the hitting direction, racket guided close past the body and meeting the speeder in front of the body. Compact swing.
- **beinarbeit_seq_1** (Bild 1 von 2): A single player from the front in the central position of the square, performing a small split-step: a low springy hop, landing on the balls of both feet, knees bent, ready to push off in any direction. Motion lines suggesting the light upward hop.
- **beinarbeit_seq_2** (Bild 2 von 2): A single player from a slightly elevated angle showing the movement cycle in one square: a lunge step reaching toward one corner to play the speeder, with a curved arrow indicating the return path back to the central position in the middle of the square.
