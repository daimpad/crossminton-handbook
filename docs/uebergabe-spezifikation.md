# Crossminton-Lernapp — Übergabespezifikation (Erstausbau)

Diese Spezifikation bündelt alle konzeptionellen und technischen Entscheidungen für die Umsetzung. Sie ist als Arbeitsgrundlage für die Implementierung gedacht und referenziert die Inhaltsdaten in den `bausteine.*.json`-Dateien.

> **Stand nach Beginner- und Fortgeschritten-Ausbau, Doppel-Thema und drei Cross-Sport-Herkünften.** Gegenüber der vorigen Fassung (fünf Beginner-Domänen) neu abgebildet: die Dimension `spielform` (einzel/doppel), der Doppel-Themenblock, die vier Fortgeschritten-Blöcke, stufenübergreifende Voraussetzungen, die herkunftsreine Delta-Konvention und die Herkünfte Tennis (`TEN`) und Squash (`SQ`). Details gebündelt in Abschnitt 11; vollständige Dateiliste in Abschnitt 9.

---

## 1. Zweck und Geltungsbereich

Zu bauen ist eine **clientseitige, mobil-orientierte Lernanwendung** für Crossminton. Sie vermittelt Inhalte in kleinen, durchklickbaren Einheiten (Bausteinen), führt die lernende Person über mehrere Zugangswege (Pfade) durch den Stoff und begleitet den Fortschritt mit einem zurückhaltenden Gamification-Layer.

**Im Erstausbau enthalten:** das Datenmodell (inkl. der Dimension `spielform`), die Pfad-Engine (vier Pfade plus Cross-Sport-Modifikator, plus `spielform` als Navigationsachse), die Onboarding-Diagnostik, der Gamification-Layer in seiner Grundform, die mehrsprachige Struktur (Quellsprache Deutsch). Referenzinhalt: **alle fünf Domänen auf Beginner-Niveau** (Technik, Taktik, Mentales, Athletik/Kondition; Trainingsgestaltung auf Trainer-Stufe), **die vier Spieler-Domänen zusätzlich auf Fortgeschritten-Niveau**, ein **Doppel-Themenblock** (Querschnitt über drei Domänen) und **Cross-Sport-Deltas für drei Herkünfte** (Badminton, Tennis, Squash).

**Ausdrücklich nicht im Erstausbau:** serverseitige Komponenten, geräteübergreifende Synchronisation, Mastery-Checks (nur strukturell vorgehalten), Trainingseinheiten-Generierung (nur kuratiert), die **Experten-Stufe** (noch nicht bespielt), Grafiken (nur Technik-Prompts vorbereitet), Befüllung der Zielsprachen (nur strukturell angelegt).

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

Eigene Entität, getrennt vom Baustein. Enthält eine **geordnete Referenzliste auf Übungsteile** von Bausteinen (nicht auf ganze Bausteine). Im Erstausbau **kuratiert** (von Hand befüllt); die Struktur hält die spätere regelbasierte Generierung offen, ohne sie umzusetzen.

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
Zusätzlich zu den vier Pfaden bietet `spielform` einen eigenen Zugang: Alle `spielform:doppel`-Bausteine bilden ein zusammenhängendes **Doppel-Thema**, quer über die Domänen (Taktik, Athletik, Mentales). Der Default-Zugang zeigt `einzel`; das Doppel-Thema ist als eigene Ansicht wählbar. Diese Achse ist orthogonal zu Stufe und Domäne — sie filtert nach Spielform, nicht statt, sondern zusätzlich zur fachlichen Einordnung.

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

**Querschnitt-Thema (1 Block):**
10. **`bausteine.doppel-thema.json`** — 7 Bausteine + 1 Delta, alle `spielform: doppel`, über drei Domänen (Taktik 5, Athletik 1, Mentales 1). Führt die Dimension `spielform` ein (11.2). `doppel_grundlagen` (aus Datei 7) ist nachträglich mit `spielform: doppel` zu markieren.

**Herkunftsreine Delta-Dateien (2):**
11. **`bausteine.delta-tennis.json`** — 6 Tennis-Deltas (4 Beginner-, 2 Fortgeschritten-Technik). Aktiviert `TEN` im Onboarding. Enthält `ueberkopf_clear_delta_ten` als positiven Transfer.
12. **`bausteine.delta-squash.json`** — 6 Squash-Deltas (Technik + Taktik, 2 Stufen). Aktiviert `SQ`. Drei positive Transfers, drei Divergenzen; **kein** Rückhand-Delta (bewusst). Deltas auf zuvor delta-freien Taktik-Bausteinen.

Ergänzend im Bau: **`data/fehlerbilder.json`** (Trainer-Layer, technikgebunden, eigene Entität; siehe Abschnitt 5).

Diese Daten machen Pfad-Engine, Modifikator, Onboarding, `spielform`-Navigation und — durch beide Ziel-Dimensionen über zwei Stufen — den Individualpfad real durchspielbar.

---

## 10. Offene inhaltliche Arbeit (noch nicht in den Daten)

- **Experten-Stufe**: die dritte Könnensstufe ist in keiner Domäne bespielt. Der Onboarding-Anker existiert (Anhang A), Inhalt fehlt.
- **Grafiken**: acht KI-Prompts nur für den Beginner-Technikpfad (Anhang B), Bilder nicht erzeugt. Fortgeschritten-Technik, die weiteren Domänen und der Doppel-Block haben noch keine Grafik-Prompts. Stil: illustrative, reduzierte vektorähnliche Zeichnung, transparenter/weißer Hintergrund.
- **Fehlerbilder** (Trainer-Layer, technikgebunden): je Technik-Baustein als `trainer_layer_offen` vermerkt; parallel im Bau (`data/fehlerbilder.json`).
- **Weitere Cross-Sport-Tiefe**: Tennis- und Squash-Deltas decken bislang v. a. die Technik-Kerne (Squash zusätzlich zwei Taktik-Bausteine). Deltas für weitere Bausteine/Domänen und für das Doppel je Herkunft sind offen.
- **Zielsprachen** `en, fr, pl`: Struktur angelegt, Übersetzung ausstehend. Labels für `BS`, `SP`, `AT`, `spielform` aufzunehmen.
- **Unerprobte Vokabulare**: Untergrund und Witterung noch nicht durch Inhalt erprobt (kein Outdoor-Block). Der Faktor `doppel_spezifische_loesungen` ist mit dem Doppel-Block nun breit belegt; die Beobachtung auf mögliche Aufspaltung bleibt bestehen.
- **Trainingseinheiten**: über den kuratierten Erstbestand hinaus aufzubauen.

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
