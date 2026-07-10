# Crossminton-Lernapp — Übergabespezifikation (Erstausbau)

Diese Spezifikation bündelt alle konzeptionellen und technischen Entscheidungen für die Umsetzung. Sie ist als Arbeitsgrundlage für die Implementierung gedacht und referenziert die Inhaltsdaten in den `bausteine.*.json`-Dateien.

> **Stand nach vollständigem Dreistufen-Ausbau, Doppel über alle drei Stufen, Outdoor-Themenblock, erweiterten Cross-Sport-Deltas, Trainingseinheiten, Regeln- und Info-Reitern.** Neu gegenüber der vorigen Fassung: das **Doppel über alle drei Stufen** (Beginner/Fortgeschritten/Experte), der **Outdoor-Themenblock** (aktiviert Typ `umgebungs_baustein` sowie `witterung`/`untergrund` als Navigationsachsen und die Umgebungsanpassungs-Spielziele) und zusätzliche **Tennis-Deltas** (Doppel, Taktik); zuletzt der **auf acht Einheiten ausgebaute Trainingsbestand** (Experten-, Outdoor- und Beginner-Doppel-Einheit ergänzt). Bereits zuvor abgebildet: die komplette Experten-Stufe (herkunftsneutral, 11.5), die Info-Reiter samt Sprach-Anzeige, `spielform`, die herkunftsreine Delta-Konvention, Trainingseinheiten und Regeln-Reiter. Details gebündelt in Abschnitt 11; vollständige Datenlage in Abschnitt 9.

---

## 1. Zweck und Geltungsbereich

Zu bauen ist eine **clientseitige, mobil-orientierte Lernanwendung** für Crossminton. Sie vermittelt Inhalte in kleinen, durchklickbaren Einheiten (Bausteinen), führt die lernende Person über mehrere Zugangswege (Pfade) durch den Stoff und begleitet den Fortschritt mit einem zurückhaltenden Gamification-Layer.

**Im Erstausbau enthalten:** das Datenmodell (inkl. `spielform` sowie `witterung`/`untergrund` als Umgebungsachsen), die Pfad-Engine (vier Pfade plus Cross-Sport-Modifikator, plus `spielform` und die Umgebungsachsen als Navigationszugänge), der **Regeln-Reiter** und die **Info-Reiter „Über"/„Mitmachen"** (mit display-only Sprach-Anzeige), die Onboarding-Diagnostik, der Gamification-Layer in seiner Grundform, die mehrsprachige Struktur (Quellsprache Deutsch). Referenzinhalt: **alle vier Spieler-Domänen über alle drei Könnensstufen** plus Trainingsgestaltung auf Trainer-Stufe, das **Doppel-Thema über alle drei Stufen** (Beginner/Fortgeschritten/Experte), ein **Outdoor-Themenblock**, **Cross-Sport-Deltas für drei Herkünfte** (Badminton, Tennis, Squash), ein **kuratierter Trainingseinheiten-Bestand** und die vollständigen **Spielregeln** im Regeln-Reiter.

**Ausdrücklich nicht im Erstausbau:** serverseitige Komponenten, geräteübergreifende Synchronisation, Mastery-Checks (nur strukturell vorgehalten), Trainingseinheiten-Generierung (nur kuratiert), funktionales Sprach-Umschalten (`app-info.sprachen.funktion_aktiv: false` — Anzeige only), Grafiken (nur Technik-Prompts für Beginner vorbereitet), Befüllung der Zielsprachen (nur strukturell angelegt; Japanisch bislang nur in der Sprach-Anzeige, ohne Inhaltsübersetzung).

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

Kern-Entität. Trägt elf Metadaten-Felder (Vokabulare in `bausteine…json` unter `vokabulare`):

1. **Domäne** — genau ein Primärwert (Grenzfall: optionaler Zweitwert). Werte: `technik, taktik, trainingsgestaltung, mentales, athletik_kondition`.
2. **Kompetenzstufe** — Mehrfachzuordnung erlaubt. Werte: `beginner, fortgeschritten, experte, trainer`. `trainer` dockt bevorzugt an eine Könnensstufe an; eigenständig nur für technikübergreifendes Meta-Wissen.
3. **Baustein-Typ** — genau ein Wert. Werte: `micro, vertiefung, delta, fehlerbild, umgebungs_baustein`.
4. **Voraussetzungen** — Liste von Baustein-IDs oder leer. Domänenübergreifend erlaubt. Wirkung: weiche Empfehlung (siehe Abschnitt 4).
5. **Lernziele** — zwei getrennte Dimensionen, beide kontrolliert-erweiterbar, Mehrfachwerte:
   - *Spielziele*: 6 Oberbereiche, 21 Faktoren (Primärordnung: limitierender Faktor; sekundäre Facette: Spielsituation).
   - *Vermittlungsziele*: 4 Vermittlungstätigkeiten, 13 Faktoren (sekundäre Facette: Lernphase; Adressatengruppe als späterer Modifikator).
6. **Transfer-Herkunft** — Mehrfachwerte, dezent sichtbar, per Schalter ausblendbar. Werte: `CM, BAD, TEN, SQ, BS, SP, AT` (`SP` = Sportpsychologie, `AT` = Athletik-/Trainingswissenschaft — beide koordiniert ergänzt, siehe Abschnitt 11.2). Konvention: mehrere Kürzel nur bei substanziell verschiedenen Herkünften; jedes Kürzel höchstens einmal pro Baustein (Belegvielfalt derselben Herkunft gehört in die Quellendokumentation).
7. **Untergrund** — Modifikator-Dimension, Default `halle`. Werte: `halle, sand, rasen, asche, kunstrasen`.
8. **Witterung** — nur outdoor, sonst leer. Werte: `wind, sonne_blendung, naesse, hitze`.
9. **Innere Abschnittsstruktur** — `erklaerteil` (immer) plus **höchstens eines** von `uebungsteil` oder `reflexionsaufgabe` (siehe 3.5). `uebungsteil` verpflichtend bei Technik, sonst optional.
10. **Abschluss-Status** — siehe Abschnitt 8. Erweiterbarer Zustandsraum; im Erstausbau aktiv: `offen → erledigt`, **getrennt quittiert** für Erklärteil und den jeweiligen Aufgabenteil (Übungsteil oder Reflexionsaufgabe).
11. **Spielform** — orthogonal zur Domäne, ein Wert. Werte: `einzel` (Default) / `doppel`. Fehlendes Feld = `einzel`. Als Navigationsachse nutzbar (siehe 3.6 und 6.6). Koordiniert ergänzt, siehe 11.2.

### 3.3 Mehrsprachigkeit

Sprachneutrale **Identität** (IDs, Kürzel, Faktor-IDs, Relationen) ist strikt getrennt von sprachabhängiger **Beschriftung** (Baustein-Texte, sichtbare Vokabel-Labels). Übersetzbar sind: alle Baustein-Texte (Erklärteil, Übungsteil, Delta) *und* alle sichtbaren Labels (Domänennamen, Stufen, Lernziel-Faktoren, ausgeschriebene Transfer-Herkünfte). Die Kürzel selbst bleiben sprachneutral. Im Erstausbau ist nur `de` befüllt; `en, fr, pl` sind strukturell angelegt.

### 3.4 Die Trainingseinheit

Eigene Entität, getrennt vom Baustein (Datei `trainingseinheiten.json`, nicht im Baustein-Pool). Enthält eine **nach drei Phasen** (Erwärmung / Hauptteil / Ausklang) geordnete **Referenzliste auf Übungsteile** von Bausteinen (nicht auf ganze Bausteine); jede Referenz nennt die Baustein-ID (1:1 zum Übungsteil) plus optionalen kuratorischen Hinweis. Im Erstausbau **kuratiert** (acht Einheiten, von Hand befüllt); die Struktur hält die spätere regelbasierte Generierung offen, ohne sie umzusetzen. Referenzen zeigen ausnahmslos auf Bausteine **mit** Übungsteil. Details und Schema in Abschnitt 9.

### 3.5 Der Aufgabenteil: `uebungsteil` vs. `reflexionsaufgabe`

Ein Baustein trägt neben dem `erklaerteil` **höchstens einen** Aufgabenteil. Zwei Ausprägungen, gleichrangig (Geschwister), je mit eigenem Abschluss-Status:

- **`uebungsteil`** — eine motorische Übung. Strukturiert (Felder: `titel`, `ziel`, `schritte` oder `schritte_teil1`/`schritte_teil2`, optional `steigerung`, `selbstkontrolle`, `abschluss`, `naechste_stufe`). Verpflichtend in der Technik-Domäne.
- **`reflexionsaufgabe`** — eine gedankliche, beobachtende oder planerisch-anwendende Aufgabe, dort, wo keine Bewegung automatisiert wird. Schlichte Form: `{ "de": "Fließtext" }`. Trägt einen **eigenen** `offen → erledigt`-Status wie der Übungsteil und zählt in den Fortschritt.

**Regel:** nie beide zugleich. Die Domänen verteilen sich so: Technik durchgehend `uebungsteil`; Taktik und Athletik gemischt; Mentales und Trainingsgestaltung durchgehend `reflexionsaufgabe`.

### 3.6 Die Dimension `spielform` (Querschnittsthema)

`spielform` ist eine zur Domäne **orthogonale** Dimension. Ein Baustein behält seine fachliche Domäne (Taktik, Athletik, Mentales, Technik) und trägt zusätzlich `spielform: doppel`, wenn er zum Doppel-Thema gehört. Alle bestehenden Bausteine sind implizit `einzel` (fehlendes Feld = `einzel`); sie werden nicht angefasst.

Der Zweck ist ein **Querschnittsthema**: Das Doppel streut über mehrere Domänen, bleibt aber über die eine Achse `spielform` als zusammenhängendes Thema navigierbar (siehe 6.6). Damit lässt sich ein bereichsübergreifendes Thema abbilden, ohne die Domänen-Zuordnung aufzulösen oder das Domänen-Vokabular zu verunreinigen.

---

## 4. Relationen und Graph

### 4.1 Voraussetzungsrelation (Feld 4) — zwei Lesarten

Formal eine gerichtete Kante, semantisch zwei Typen (nicht strukturell getrennt, beide über den weichen Mechanismus):
- *Motorisches Aufbauen* — die Bewegung baut auf einer anderen auf (Aufschlag ← Griff).
- *Didaktisches Sinnstiften* — ein Baustein gibt einem anderen erst einen Bezugspunkt (Beinarbeit ← Vorhand/Rückhand: Bewegung zum Ball braucht einen zu spielenden Schlag).

Beide wirken als **Default-Sortierkriterium, nicht als Zugangssperre** (siehe 4.4). Eine spätere Differenzierung über ein Typ-Attribut ist vorgemerkt, nicht Teil des Erstausbaus.

Voraussetzungen dürfen **stufenübergreifend** zeigen: Fortgeschritten-Bausteine verweisen auf Beginner-Bausteine (z. B. `handgelenk_peitsche → vorhand_drive`, `beinarbeit_system → beinarbeit`), teils zugleich stufen- und domänenübergreifend (z. B. `punkt_aufbauen → ueberkopf_clear + kurzes_spiel_stopp`). Auch das sind weiche Kanten: Der fortgeschrittene Baustein bleibt auf seiner Stufe, die Beginner-Voraussetzung ist nur ein Hinweis — kein Baustein wird zwischen Stufen verschoben.

### 4.2 Ersetzungsrelation „ersetzt-bei-Herkunft"

Gerichtete, **bedingte** Kante zwischen einem Delta-Baustein und dem Erklärteil eines Basisbausteins. Kategorial verschieden von der Voraussetzung: Die Voraussetzung ordnet eine Sequenz, die Ersetzung substituiert eine Darstellung.
- **Bedingung:** aktiv nur, wenn die im diagnostischen Zustand hinterlegte Herkunft der Herkunft des Deltas entspricht. Dann tritt der Delta-Erklärteil an die Stelle des Basis-Erklärteils. Der **Übungsteil des Basisbausteins bleibt stets erhalten**.
- **Optional:** Existiert für eine Herkunft kein Delta, ist das **kein Fehlerfall** — der reguläre Basis-Erklärteil wird gezeigt (z. B. Grundposition, Beinarbeit für Badminton-Umsteiger).
- **Kardinalität:** ein Basisbaustein kann mehrere eingehende Ersetzungskanten tragen (je Herkunft eine); zur Laufzeit greift höchstens eine. Real: `griff`, `aufschlag`, `vorhand_drive` tragen inzwischen je ein Delta für **alle drei** Herkünfte (`_bad`, `_ten`, `_sq`) — genau das der gewählten Herkunft greift, die anderen werden ignoriert.
- Die Relation verändert **nicht die Sequenz**, nur den Inhalt der Station. Sie ist die Grundlage der Modifikator-Operation „Delta-Einblendung" (Abschnitt 6).

**Ein Delta ist nicht immer Abbau.** Es kann auch eine mitgebrachte Stärke einlösen (positiver Transfer), etwa `ueberkopf_clear_delta_ten` (Tennisaufschlag → Überkopf) oder `griff_delta_sq` (Squash bringt den Ein-Griff schon mit). Strukturell identisch, inhaltlich anders gelagert.

### 4.3 Delta-Bündelung und Delta-auf-Delta-Verweise

Kumulieren an einem Baustein mehrere bereits behandelte Herkunftsanpassungen, bündelt der Delta sie **inhaltlich** (kein neuer Typ). Verweise auf vorausgehende Deltas laufen über die weiche Voraussetzung und sind **reine Lektüreempfehlungen**, keine harten Abhängigkeiten. Der dominante Anpassungspunkt wird eigenständig ausgetragen, nachgeordnete werden referenziert (Beispiel: `rueckhand_delta_bad`).

### 4.4 Zwei-Ebenen-Logik (übergreifend, alle Pfade)

**Sortierung** und **Zugänglichkeit** sind getrennt. Der Voraussetzungsgraph bestimmt die Default-Reihenfolge; die Zugänglichkeit bleibt davon unabhängig frei. Springt die Person aus der Reihe, erscheint ein **Hinweis** auf die nicht absolvierte Voraussetzung, ohne den Zugriff zu verwehren.

---

## 5. Baustein-Typen und innere Struktur

- **Micro** — kompakter Lernkern (Standardfall im Erstausbau).
- **Vertiefung** — ausführlichere Einheit mit Grafik (im Erstausbau nicht befüllt, strukturell vorgesehen).
- **Delta** — Cross-Sport-Anpassung. Trägt **nur einen Erklärteil, keinen eigenen Übungsteil** (Delta-Übungsregel). An dessen Stelle steht eine im Erklärteil eingebettete Selbstkontrolle (keine formale Einheit, kein eigener Abschluss-Status). Der Übungsteil des Basisbausteins gilt. Regel für alle Deltas, bewusst lockerbar, falls eine künftige Kombination eine genuin neue motorische Teilaufgabe erzeugt.
- **Fehlerbild** — Troubleshooting (Symptom → Ursache → Korrektur). **Eigene Entität** mit `basis_baustein`-Relation (analog zum Delta), `kompetenzstufe: ["trainer"]`, `erklaerteil` mit den drei benannten Feldern `symptom`/`ursache`/`korrektur`, kein Übungsteil. Wohnt in `data/fehlerbilder.json`. Je Technik-Baustein als `trainer_layer_offen` vermerkt; Ausformulierung parallel im Bau.
- **Umgebungs-Baustein** — eigenständige Outdoor-Themen (begründete Ausnahme; im reinen Hallen-Beginnerpfad nicht vorhanden).

**Erklär-/Übungsteil-Trennung:** Jeder Baustein trennt innerlich. Der Kompetenzpfad durchläuft die ganze Einheit; der Trainingspfad steuert gezielt den Übungsteil an. Fortschritt wird für beide Teile **getrennt** quittiert.

**Relational-selbsttragendes Muster** (redaktionelle Konvention, keine Datenstruktur): Ein Baustein darf eine graphinterne Beziehung nutzen (relationale Schicht), muss aber bei isoliertem Zugriff verständlich bleiben (selbsttragende Schicht). Beispiel: `rueckhand` (`relational_selbsttragend: true`).

---

## 6. Traversierungsregeln

Vier gleichrangige Pfade plus ein überlagernder Modifikator. Alle erben die Zwei-Ebenen-Logik (4.4).

### 6.1 Kompetenzpfad (zugleich Standard-Basispfad des Modifikators)
- Filtert nach Kompetenzstufe. **Zwei Stufen sind real** (Beginner, Fortgeschritten): Ein Beginner sieht die Fortgeschritten-Bausteine nicht im Hauptpfad; ein Fortgeschrittener sieht Beginner **und** Fortgeschritten (aufbauend).
- Ein mehrfach zugeordneter Baustein erscheint **einmalig an seiner niedrigsten Stufe**.
- Sortierung innerhalb einer Stufe: **Voraussetzungsgraph primär, Domäne sekundär** (bei gleichrangigen Bausteinen). Stufenübergreifende Voraussetzungen (4.1) ordnen, ohne die Stufenzuordnung zu verändern.

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

### 6.6 `spielform` als Navigationsachse
Zusätzlich zu den vier Pfaden bietet `spielform` einen eigenen Zugang: Alle `spielform:doppel`-Bausteine bilden ein zusammenhängendes **Doppel-Thema**, quer über die Domänen (Taktik, Athletik, Mentales). Der Default-Zugang zeigt `einzel`; das Doppel-Thema ist als eigene Ansicht wählbar. Diese Achse ist orthogonal zu Stufe und Domäne — sie filtert nach Spielform, nicht statt, sondern zusätzlich zur fachlichen Einordnung. Das Doppel ist über alle drei Stufen bespielt (Dateien 14, 20, 21).

### 6.7 `witterung` und `untergrund` als Umgebungsachsen
Analog zu `spielform` bilden die Umgebungs-Dimensionen einen eigenen Zugang: Alle Bausteine vom Typ `umgebungs_baustein` (der **Outdoor-Themenblock**, Datei 22) sind über **`witterung`** (wind, sonne_blendung, naesse, hitze) und **`untergrund`** (sand, rasen, asche, kunstrasen) navigierbar. Ein Umgebungs-/Outdoor-Zugang kann nach diesen Achsen gruppieren. Beide sind orthogonal zu Stufe, Domäne und `spielform`; fehlende Werte bzw. `untergrund: halle` = Halle/kein Umgebungsbezug (Default). Outdoor gilt für Einzel und Doppel gleichermaßen (`spielform` dort bewusst nicht gesetzt).

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
Im Onboarding werden **nur implementierte Herkünfte** angeboten (abgeleitet aus dem Bestand vorhandener Delta-Bausteine): inzwischen **Badminton, Tennis und Squash** plus „keine Vorerfahrung". Die Auswahlliste wird nicht fest verdrahtet, sondern aus dem Delta-Bestand generiert — sie bleibt so automatisch synchron mit dem Ausbaustand. (Prüfpunkt: Dass mit den `_ten`- und `_sq`-Deltas Tennis und Squash automatisch erscheinen, ist der Test dieser Ableitung.)

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

## 9. Inhaltsdaten als Referenz

Alle Dateien im gemeinsamen Pool, vollständig getaggt, `de` befüllt, Zielsprachen strukturell offen. Zwei Namenskonventionen: `bausteine.<stufe>-<domaene>.json` für Inhaltsblöcke und `bausteine.delta-<herkunft>.json` für herkunftsreine Delta-Dateien (siehe 11.4).

**Beginner (5 Blöcke):**
1. **`bausteine.beginner-technik.json`** — 6 Basisbausteine (`grundposition → griff → aufschlag → vorhand_drive → rueckhand → beinarbeit`) + 4 Badminton-Deltas. Grundposition und Beinarbeit **ohne** Delta (Nicht-Fehlerfall, 4.2). `rueckhand_delta_bad` zeigt Delta-Bündelung; `rueckhand` das relational-selbsttragende Muster. **Kanonische Vokabular-Quelle.**
2. **`bausteine.beginner-taktik.json`** — 6 Bausteine + 1 Badminton-Delta. Führt `reflexionsaufgabe` ein. Rückverzweigung `fehler_vermeiden → spielziel_verstehen`.
3. **`bausteine.beginner-mentales.json`** — 5 Bausteine, 0 Deltas. Sternförmig. Psychoregulations-Ziele (Bereich 4). Führt `SP` ein.
4. **`bausteine.beginner-athletik_kondition.json`** — 6 Bausteine, 0 Deltas. Sternförmig. Energetik-Ziele (Bereich 1). Führt `AT` ein. Strenger Gesundheitsrahmen.
5. **`bausteine.trainer-trainingsgestaltung.json`** — 5 Bausteine, 0 Deltas, `["trainer"]`. Sternförmig. **Vermittlungsziele**. Dateiname-Abweichung: `trainer` an Stufen-Stelle.

**Fortgeschritten (4 Blöcke):**
6. **`bausteine.fortgeschritten-technik.json`** — 6 Bausteine + 3 Badminton-Deltas. Löst den Peitsche-Faden ein (`handgelenk_peitsche`). Erste stufenübergreifende Voraussetzungen. `beinarbeit_system_delta_bad` = der Geometrie-Delta.
7. **`bausteine.fortgeschritten-taktik.json`** — 6 Bausteine + 1 Doppel-Delta. Dichteste Voraussetzungsvernetzung (stufen- + domänenübergreifend). Aktiviert `doppel_spezifische_loesungen` erstmals (via `doppel_grundlagen`).
8. **`bausteine.fortgeschritten-mentales.json`** — 5 Bausteine, 0 Deltas. Vertieft die Psychoregulations-Ziele.
9. **`bausteine.fortgeschritten-athletik_kondition.json`** — 5 Bausteine, 0 Deltas. Vertieft die Energetik-Ziele. Strenger Gesundheitsrahmen (programmiernahe Themen als Reflexion, Verweis auf Fachanleitung).

**Experte (4 Blöcke, herkunftsneutral — 0 Deltas; siehe 11.5):**
10. **`bausteine.experte-technik.json`** — 6 Bausteine, 0 Deltas, alle `uebungsteil`. Täuschung, früh nehmen, Tempo-/Rhythmuswechsel, Sprung-Smash, Präzision an die Linien, Konstanz unter Höchstdruck. Erste Experten-Stufe überhaupt; stufenübergreifende Voraussetzungen auf die fortgeschrittene Technik. Sprung-Smash mit Gesundheitshinweis.
11. **`bausteine.experte-taktik.json`** — 6 Bausteine, 0 Deltas (2 `uebungsteil`, 4 `reflexionsaufgabe`). Matchplan, Gegner-Archetypen und Gegenrezepte, eigenes Spiel aufzwingen, Schwäche systematisch angreifen, Matchverlauf steuern, entscheidender Punkt.
12. **`bausteine.experte-mentales.json`** — 5 Bausteine, 0 Deltas, durchgehend `reflexionsaufgabe`. Optimaler Wettkampfzustand, Flow, Druck als Herausforderung deuten, Gelassenheit bei Unfairness, mentale Entwicklung. Strikter Wellbeing-Rahmen.
13. **`bausteine.experte-athletik_kondition.json`** — 5 Bausteine, 0 Deltas (1 `uebungsteil`, 4 `reflexionsaufgabe`). Formaufbau über die Saison, Reaktivkraft, Bewegungsökonomie, antizipative Schnelligkeit, langfristige Belastbarkeit. Strenger Gesundheitsrahmen (keine Dosierungen; Verletzung/Programmierung an qualifizierte Anleitung verwiesen).

**Querschnitt-Thema (1 Block):**
14. **`bausteine.doppel-thema.json`** — 7 Bausteine + 1 Delta, alle `spielform: doppel`, über drei Domänen (Taktik 5, Athletik 1, Mentales 1). Führt die Dimension `spielform` ein (11.2). `doppel_grundlagen` (aus Datei 7) ist nachträglich mit `spielform: doppel` zu markieren.

**Herkunftsreine Delta-Dateien (2):**
15. **`bausteine.delta-tennis.json`** — 8 Tennis-Deltas: 6 Technik (4 Beginner, 2 Fortgeschritten; `ueberkopf_clear_delta_ten` als positiver Transfer) plus ein Doppel-Delta (`aufschlag_rueckschlag_doppel`, Aufschlagstruktur) und ein Taktik-Delta (`spielziel_verstehen`, Netz → Passierzone). Aktiviert `TEN` im Onboarding.
16. **`bausteine.delta-squash.json`** — 6 Squash-Deltas (Technik + Taktik, 2 Stufen). Aktiviert `SQ`. Drei positive Transfers, drei Divergenzen; **kein** Rückhand-Delta (bewusst). Deltas auf zuvor delta-freien Taktik-Bausteinen.

Ergänzend im Bau: **`data/fehlerbilder.json`** (Trainer-Layer, technikgebunden, eigene Entität; siehe Abschnitt 5).

**Eigene Entitäten außerhalb des Baustein-Pools (gebaut):**
17. **`trainingseinheiten.json`** — 8 kuratierte Trainingseinheiten, je in drei Phasen (Erwärmung/Hauptteil/Ausklang), Referenzen per Baustein-ID auf Übungsteile (1:1). Einheiten: „Erste Schläge" und „Bewegung und Position" (Beginner), „Erstes Zusammenspiel im Doppel" (Beginner, `spielform: doppel`), „Angriff aufbauen" und „Wind und Boden" (Fortgeschritten; letztere eine Outdoor-Einheit über die `umgebungs_baustein`-Übungsteile), „Als Paar spielen" (Fortgeschritten, `spielform: doppel`), „Präzision und Täuschung" und „Tempo und Konstanz" (Experte). Trägt `kompetenzstufe` und `spielform` zur stufen-kumulativen Filterung im Trainingspfad (Beginner sieht 3, Fortgeschritten 6, Experte alle 8). Alle 39 Übungsteil-Referenzen (30 distinkte Bausteine) gegen den Bestand validiert. Entity-Schema in der Datei unter `_meta.entity_schema`. Speist den Trainingspfad (6.4).
18. **`regeln.json`** — der **Regeln-Reiter**: eigener Top-Level-Referenzbereich (kein Lerninhalt, keine Voraussetzungen/Deltas/Fortschritt/Gamification). 11 Abschnitte, 36 Regeln, jede mit akkuratem Regelinhalt (`inhalt`, mit Quell-Regelnummer) und Erklärung in Du-Form (`erklaerung`); optionale `querverweis`-Felder als Absprung zu Lernbausteinen (reine Dokumentation, gegen Bestand geprüft). **Quelle:** offizielle ICO/DCV-Spielregeln, Stand Februar 2018 (in `_meta.quelle`); Herausgeber und Stand im Reiter sichtbar zu halten. Entity-Schema in der Datei unter `_meta.entity_schema`.
19. **`app-info.json`** — die Info-Reiter **„Über"** und **„Mitmachen"** plus die **Sprach-Anzeige-Konfiguration**. „Über": App-Text, Dank/Quellen, Lizenz/Credits, GitHub-Link (Betreiber-Angaben als eckige-Klammer-Platzhalter). „Mitmachen": Einleitung plus drei CTA-Blöcke (`fehler_melden`, `uebersetzen`, `code_beitragen`) mit `cta_label` und `cta_ziel`. `sprachen`: Liste **de/en/fr/pl/ja** (Kürzel + Flagge), `aktuell: de`, **`funktion_aktiv: false`** — die Sprach-Anzeige neben dem Hamburger-Icon ist im Erstausbau reine Darstellung, kein funktionales Umschalten. Statischer Inhalt, kein Fortschritt/Gamification. Entity-Beschreibung in der Datei unter `_meta`.

**Weitere Querschnitt-Themen (Doppel-Ausbau und Outdoor):**
20. **`bausteine.doppel-beginner.json`** — 5 Bausteine, alle `spielform: doppel`, Beginner, 0 Deltas. Sanfter Doppel-Einstieg: erste Schritte, wer nimmt den Ball, einfacher Aufschlag, sich absprechen, einander Platz lassen. Querschnitt Taktik/Mentales/Athletik (3 `uebungsteil`, 2 `reflexionsaufgabe`).
21. **`bausteine.doppel-experte.json`** — 5 Bausteine, alle `spielform: doppel`, Experte, **0 Deltas (herkunftsneutral, 11.5)**. Paar als System, gegnerisches Paar lesen, Partner in Position bringen, nahtlos umschalten, blindes Verständnis (2 `uebungsteil`, 3 `reflexionsaufgabe`). Damit ist das Doppel über **alle drei Stufen** bespielt; `doppel_spezifische_loesungen` durchgängig belegt.
22. **`bausteine.outdoor-thema.json`** — 6 Bausteine vom Typ **`umgebungs_baustein`** (erstmals genutzt), fortgeschritten, 0 Deltas, Querschnitt Taktik/Athletik. Draußen spielen, Wind, Sonne/Blendung, Nässe, Hitze, verschiedene Böden. Aktiviert **`witterung`** und **`untergrund`** als Navigationsachsen (6.7) und belegt die Umgebungsanpassungs-Spielziele (`windspiel`, `untergrundwechsel`, `licht_und_sicht`, `temperatur`). **`untergrund` als Liste** (koordinierte Erweiterung, 11.6). Gesundheitsrahmen bei Nässe/Hitze strikt.

Diese Daten machen Pfad-Engine, Modifikator, Onboarding, `spielform`-Navigation, Trainingspfad und Regeln-Reiter real durchspielbar; durch beide Ziel-Dimensionen über zwei Stufen auch der Individualpfad.

---

## 10. Offene inhaltliche Arbeit (noch nicht in den Daten)

- **Experten-Stufe**: über alle vier Spieler-Domänen bespielt (Technik, Taktik, Mentales, Athletik) — herkunftsneutral, 0 Deltas. Der Dreistufen-Pfad steht damit vollständig. Erledigt; verbleibende Experten-Ausbauten (z. B. Experten-Doppel, Experten-Einheit) sind optional.
- **Grafiken**: KI-Prompts liegen vor für die **gesamte Technik-Domäne über alle drei Stufen** (Beginner 8, Fortgeschritten 6, Experte 6), den **Doppel-Block** (7) und eine **illustrierbare Taktik-Auswahl** (9); Anhang B. Bilder noch nicht erzeugt. Offen: die stärker abstrakten Taktik-Bausteine (Schema-/Metapher-Motive) sowie **Mentales** und **Athletik** (überwiegend abstrakt/reflexiv — Diagramm-/Metapher-Motive gezielt zu wählen). Stil: illustrative, reduzierte vektorähnliche Zeichnung, transparenter/weißer Hintergrund.
- **Fehlerbilder** (Trainer-Layer, technikgebunden): je Technik-Baustein als `trainer_layer_offen` vermerkt; parallel im Bau (`data/fehlerbilder.json`).
- **Weitere Cross-Sport-Tiefe**: Deltas bestehen für Badminton (10, inkl. Doppel), Tennis (8, inkl. Doppel und Taktik) und Squash (6, Technik + Taktik). Offen bleiben u. a. weitere Bausteine je Herkunft; **bewusst ausgelassen**: ein Squash-Doppel-Delta (Squash wird praktisch nur im Einzel gespielt — keine kollidierende Gewohnheit, Selektivitätsprinzip) sowie Deltas für Mentales/Athletik (sportartübergreifend).
- **Zielsprachen** `en, fr, pl` (plus `ja` bislang nur in der Sprach-Anzeige): Struktur angelegt, Übersetzung ausstehend. Labels für `BS`, `SP`, `AT`, `spielform`, `witterung`, `untergrund` aufzunehmen.
- **Outdoor / Umgebung**: mit dem Outdoor-Themenblock erstmals bespielt — der Typ `umgebungs_baustein` ist genutzt, `witterung` und `untergrund` sind belegt und als Navigationsachsen aktiv, die Umgebungsanpassungs-Spielziele sind belegt. Erweiterbar (z. B. weitere Böden/Bedingungen, Outdoor auf anderen Stufen). Der Faktor `doppel_spezifische_loesungen` ist über alle drei Doppel-Stufen belegt.
- **Trainingseinheiten**: kuratierter Bestand auf 8 Einheiten ausgebaut — über alle drei Stufen (inkl. erstmals zwei Experten-Einheiten), dazu eine Outdoor- und eine Beginner-Doppel-Einheit. Darüber hinaus erweiterbar; regelbasierte Generierung strukturell offen.
- **Ungenutzter Typ**: `vertiefung` (ausführlichere Einheit mit Grafik) noch nicht genutzt; `umgebungs_baustein` nun aktiv.

---

## 11. Verbindliche Modellentscheidungen und Vokabularstand

### 11.1 Vier Modellentscheidungen (gelten für alle Inhalte)

1. **`reflexionsaufgabe` ist eigenständiger Aufgabenteil** — Geschwister des Übungsteils, kein Unterfeld des Erklärteils. Eigener Abschluss-Status, getrennt quittiert, zählt in den Fortschritt. Jeder Baustein höchstens **eines** von `{uebungsteil, reflexionsaufgabe}`. Details in 3.5.
2. **Ein gemeinsamer Pool.** Alle `bausteine.*.json` werden gemischt. Die **Technik-Datei ist die kanonische Vokabular-Quelle**; neue Content-Dateien tragen kein eigenes `vokabulare`-Feld und nutzen nur dort existierende Werte. Neue Vokabel-Werte nur **koordiniert angesagt** (siehe 11.2), nicht still. Dateikonvention: `bausteine.<stufe>-<domaene>.json` (Ausnahme: `trainer` an Stufen-Stelle bei reinen Trainer-Blöcken).
3. **`voraussetzungen` = weiche Sortierkanten.** Der Graph ordnet, sperrt nie. Kanten dürfen domänenübergreifend zeigen und müssen **keine lineare Kette** bilden — Rückverzweigung (z. B. `fehler_vermeiden → spielziel_verstehen`) und Sternform (Werkzeug-Bausteine an einem Rahmen) sind zulässig und kommen vor. Voraussetzungen nach inhaltlicher Abhängigkeit setzen, nicht nach Sequenzposition.
4. **Dokumentationsfelder sind keine Graph-Kanten.** `voraussetzungen_querverweis` und alle `*_hinweis` / `*_beleg`-Felder sind reine Dokumentation; die Engine liest sie **nicht** als Kanten. Sie tragen inhaltliche Fäden zwischen Domänen (z. B. Taktik-`zentrale_position` ← Technik-`beinarbeit`).

### 11.2 Koordinierte Erweiterungen (angesagt, nicht still)

**Neue Werte in bestehendem Feld** (`transfer_herkunft`), in der kanonischen Technik-Datei zu führen, mit übersetzbarem Label:
- **`SP`** → „Sportpsychologie" (Mentales-Block).
- **`AT`** → „Athletik-/Trainingswissenschaft" (Athletik-Block).

Vollständiger `transfer_herkunft`-Wertebereich: `CM, BAD, TEN, SQ, BS, SP, AT`.

**Neues Feld** (zweite Feld-Erweiterung nach `reflexionsaufgabe`):
- **`spielform`** (Doppel-Block) → Werte `einzel` (Default, = fehlendes Feld) / `doppel`, Label de `{einzel: "Einzel", doppel: "Doppel"}`. Orthogonal zur Domäne, eigene Navigationsachse (3.6, 6.6). Umzusetzen: Feld einführen (fehlend = `einzel`), Navigationsachse anbieten, den Bestandsbaustein `doppel_grundlagen` nachträglich mit `spielform: doppel` markieren.

### 11.3 Graphformen im Bestand (zur Prüfung der Sortierlogik)

Die Sortierung muss vier Formen korrekt auflösen: die **lineare Kette** (Technik), die **Rückverzweigung** (Taktik: `fehler_vermeiden`), den **Stern** (Mentales, Athletik, Trainingsgestaltung) und die **stufenübergreifende Kante** (Fortgeschritten → Beginner, teils zugleich domänenübergreifend). Keine Form sperrt den Zugriff; alle wirken nur als Default-Ordnung.

### 11.4 Herkunftsreine Delta-Dateien (Konvention)

Deltas können entweder in der Datei ihres Basis-Bausteins liegen (so die Badminton-Deltas) oder in einer **herkunftsreinen Delta-Datei** `bausteine.delta-<herkunft>.json` gebündelt sein (so Tennis und Squash). Eine solche Datei enthält **nur** `delta_bausteine`, keine Basis-Bausteine; sie docken per `basis_baustein` an Bausteine anderer Dateien und über mehrere Stufen/Domänen an. Für die Engine ändert das nichts (ein gemeinsamer Pool) — der Loader muss reine Delta-Dateien korrekt einmischen und die `ersetzt_bei_herkunft`-Kanten dateiübergreifend auflösen. Der Zweck ist redaktionell: die Deltas einer Herkunft bleiben eine kohärente, prüfbare Einheit.

### 11.5 Herkunftsneutralität der Experten-Stufe (verankert)

Die **Experten-Stufe trägt in keiner Domäne Cross-Sport-Deltas** (`delta_bausteine` leer in allen vier Experten-Blöcken). Begründung: Das Delta ist eine Hilfe für die *frühe* Umgewöhnung aus dem Herkunftssport; wer im Crossminton Experte ist, hat sich vollständig umgewöhnt, die Herkunft ist keine relevante Störgröße mehr. Folge für den Modifikator (4.2): Der Cross-Sport-Modus greift auf Experten-Ebene **nicht in den Inhalt ein** — unabhängig von der gewählten Herkunft wird keine Delta-Einblendung erwartet; das ist der reguläre Nicht-Fehlerfall, hier flächig für die ganze Stufe. Mentales und Athletik sind ohnehin über alle Stufen delta-frei (sportartübergreifend).

### 11.6 Umgebungs-Dimensionen aktiv; `untergrund` als Liste (koordiniert)

Mit dem Outdoor-Themenblock (Datei 22) sind erstmals aktiv: der Baustein-Typ `umgebungs_baustein`, die Dimensionen `witterung` und `untergrund` (als Navigationsachsen, 6.7) sowie die Umgebungsanpassungs-Spielziele (`windspiel`, `untergrundwechsel`, `licht_und_sicht`, `temperatur`). **Koordinierte Erweiterung:** `untergrund` wird als **Liste** geführt (mehrere Böden je Baustein möglich), parallel zu `witterung`. Ein bestehender String-Wert `"halle"` ist als ein-elementige Liste `["halle"]` zu lesen; ein fehlendes Feld = Halle/Default. Bestandsbausteine werden nicht angefasst; der Loader muss `untergrund` sowohl als String (Altwert) wie als Liste akzeptieren.

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

**Fortgeschritten-Technik (6 Motive):**

- **handgelenk_peitsche_leitgrafik:** Close-up of a forearm, wrist and racket head from the side, showing the whip-like wrist action of an advanced crossminton stroke. The wrist is first laid back (cocked), then snaps forward; depict the snap with a curved motion arc and a slight blur at the racket head to convey speed. The forearm stays relatively quiet while wrist and racket head accelerate. Loose, relaxed grip. Focus on wrist and racket head; forearm entering from the edge of the frame.
- **ueberkopf_clear_leitgrafik:** A single player from the side hitting an overhead clear in crossminton. Full upward extension: contact point high above and slightly in front of the head, hitting arm stretched up, body elongated, clear forward follow-through. A curved trajectory arrow shows a high, deep arc travelling far into the back of the opposite square. Powerful but controlled posture.
- **smash_leitgrafik:** A single player from the side hitting a smash in crossminton. High contact point above and in front of the head, aggressive downward swing, body driving forward and down. A straight, steep trajectory arrow points sharply downward toward the opposite square. Explosive, committed posture; the speeder angled steeply down.
- **kurzes_spiel_stopp_leitgrafik:** A single player from the side playing a soft stop/drop shot in crossminton. The preparation looks like a firm shot, but the contact is gentle and decelerated. A short, soft trajectory arc shows the speeder barely clearing the passing zone and dropping just behind the front line of the opposite square. Emphasis on the light, cushioned touch and quiet racket; implied contrast between big preparation and soft contact.
- **schnitt_spin_leitgrafik:** Close-up of a racket face meeting the speeder with a slicing, brushing motion in crossminton. The racket face is angled and moves across the speeder rather than straight through it; curved motion lines indicate the brushing cut and the resulting spin on the speeder. Focus on the contact point, the angled racket face and the slicing path.
- **beinarbeit_system_leitgrafik:** A single player from a slightly elevated top-down angle in the center of one square, illustrating the footwork system of advanced crossminton. From a central base position (with a small split-step indicated), several curved arrows fan out to the corners and sides of the square and back, showing the repeating pattern of pushing off to reach the speeder and recovering to base. Balanced, spring-loaded center posture; clean diagrammatic arrows.

**Experten-Technik (6 Motive):**

- **taeuschung_seq_1** (Bild 1 von 2): A single player from the side in the preparation phase of an advanced crossminton stroke, with a deliberately neutral, identical preparation that gives nothing away — full backswing, poised body, "poker face" stance. The posture reads as ambiguous, not committed to any particular shot.
- **taeuschung_seq_2** (Bild 2 von 2): The same player and identical preparation as before, now with two divergent dashed trajectory arrows branching from the racket — one flat and fast (a hard drive), one short and soft (a drop) — illustrating that the same preparation can produce different shots, chosen only at the last moment. Branching arrows clearly diverging.
- **frueh_nehmen_leitgrafik:** A single player from the side taking the speeder at the earliest, highest possible point in crossminton, contact clearly in front of and above the body, meeting the speeder on the rise. A ghosted lower contact point with a small arrow indicates where a slower player would have hit, emphasizing the stolen time. Compact, early, assertive stance.
- **tempo_rhythmus_wechsel_seq_1** (Bild 1 von 2): A single player from the side hitting a fast, hard crossminton shot, with strong motion blur and a flat, fast straight trajectory arrow, conveying high pace.
- **tempo_rhythmus_wechsel_seq_2** (Bild 2 von 2): The same player from the side with a near-identical preparation, now hitting a slow, high, soft shot — a gentle high arc trajectory arrow and a relaxed, decelerated contact — illustrating a deliberate break in tempo from the same-looking setup.
- **sprung_smash_leitgrafik:** A single player in the air at the apex of a jump, hitting a jump smash in crossminton. Elevated contact point high above the head, steep downward trajectory arrow toward the opposite square, athletic airborne posture with the hitting arm extended. Controlled elevation; body balanced for a soft landing.
- **praezision_an_die_linien_leitgrafik:** A top-down diagram of a crossminton square with the speeder landing exactly on a corner line at the very edge of the square. Small tight target zones marked in the corners and along the lines, with a thin arrow showing the speeder threaded precisely to the edge, illustrating minimal margin and pinpoint placement.
- **konstanz_unter_hoechstdruck_leitgrafik:** A single player from the side executing a clean, textbook-perfect, balanced crossminton stroke with calm, composed posture — steady base, quiet head, controlled follow-through. The image conveys reliability and composure, a repeatable stroke held together under pressure rather than a flashy one. Minimal, controlled, balanced.

**Doppel-Thema (7 Motive):** *(alle `spielform: doppel`)*

- **doppel_als_eigenes_spiel_leitgrafik:** Top-down diagram of a crossminton court set for doubles — two players in each of the two opposing squares (four players total), separated by the passing zone. Emphasize the shared square: two players occupying one square as a pair. Simple distinct markers for players, clean court outline.
- **angriff_im_paar_leitgrafik:** Top-down diagram of one square showing the doubles attacking formation: one player positioned forward near the front line (attacker) and the partner positioned behind (back-space player), a clear front-back stagger. Distinct markers for the two roles; an arrow suggesting the forward attacking orientation.
- **verteidigung_im_paar_leitgrafik:** Top-down diagram of one square showing the doubles defensive formation: the two players positioned side by side, each covering one half of the square, sharing the width. Distinct markers; a dashed line dividing the two covered halves.
- **aufschlag_rueckschlag_doppel_leitgrafik:** Top-down diagram of both squares illustrating the doubles serve rotation: four players as distinct markers (two per side), with numbered arrows 1–4 showing the serve passing in the fixed sequence from the first server to the opposing attacker, then to each partner in turn and back. Clear numbered rotation arrows (text labels optional, may be added manually).
- **das_umschalten_im_doppel_leitgrafik:** Top-down diagram showing the transition between formations in doubles: on one side the front-back attacking stagger, transforming via curved rotation arrows into the side-by-side defensive formation, illustrating the switch between attack and defense. Two small formation states linked by rotation arrows.
- **bewegung_als_einheit_leitgrafik:** Top-down diagram of one square showing the two doubles partners moving together as a connected unit — both shifting in the same direction to cover the speeder, maintaining constant spacing, with a subtle connecting band between the pair and parallel movement arrows.
- **verstaendigung_im_paar_leitgrafik:** A pair of crossminton doubles partners shown from behind, communicating between points — one giving a discreet hand signal behind the back, with brief eye contact or a short cue suggested by a small signal motif. Conveys coordination and communication as a pair. Clean instructional style.

**Taktik (9 Motive, illustrierbare Auswahl):** *(die stärker abstrakten Taktik-Bausteine — `fehler_vermeiden`, `umschalten`, `gegner_lesen_muster`, `engen_satz_fuehren`, `der_matchplan`, `dem_gegner_aufzwingen`, `matchverlauf_steuern`, `entscheidender_punkt` — bleiben bewusst ohne Leitgrafik; ein erzwungenes Diagramm trüge dort wenig. Schema-/Metapher-Motive dafür sind ein späterer, eigener Schritt.)*

- **spielziel_verstehen_leitgrafik:** Top-down diagram of the full crossminton court (two squares separated by the passing zone), with a trajectory arrow carrying the speeder across the passing zone to land inside the far square. Illustrates the basic goal: cross the zone, land in the opposite square.
- **zentrale_position_leitgrafik:** Top-down diagram of one square with a single player marker at the central recovery position, and thin arrows radiating outward to all four corners, showing roughly equal reach to every part of the court from that base. Emphasize the balanced central spot.
- **laenge_tiefe_leitgrafik:** Top-down diagram of the opposite square with two target zones marked — one short near the front line, one deep near the back line — and two trajectory arrows showing a short drop versus a deep clear. Illustrates varying length and depth.
- **rueckhand_des_gegners_leitgrafik:** Top-down diagram of the opposite square with the opponent marked and their backhand corner highlighted as a target zone, and an arrow directing the speeder to that backhand corner. Illustrates targeting the opponent's backhand.
- **aufschlag_taktisch_leitgrafik:** Top-down diagram showing serve placement options from the serve zone: thin arrows to different target points in the opposite square (corners and body), illustrating tactical variety in the serve.
- **punkt_aufbauen_leitgrafik:** Top-down diagram of a rally being constructed: numbered trajectory arrows (1, 2, 3) moving the opponent from corner to corner across their square, ending with an opening. Illustrates building the point by moving the opponent.
- **smash_vorbereiten_leitgrafik:** Top-down diagram of a setup: a deep, pressing shot forces the opponent to send back a weak high ball (upward arrow), which is then put away with a steep downward smash arrow. Illustrates forcing the lift, then finishing.
- **gegner_typen_gegenrezepte_leitgrafik:** Schematic three-panel diagram of opponent archetypes — an attacker, a defender/retriever, and a slow mover — each with a short counter-strategy indication (slow the pace; move corner to corner; wide angles). Clean schematic.
- **schwaeche_systematisch_angreifen_leitgrafik:** Top-down diagram of the opposite square with one corner marked as a weakness and several repeated arrows returning to that corner, plus one or two other arrows opening it up. Illustrates systematically attacking a single weak zone.
