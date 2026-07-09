---
name: verify
description: Build-freie Web-App im Browser verifizieren — Server starten, per Playwright durchklicken, Screenshots als Beleg.
---

# Verifikation: Crossminton-Handbuch

Reine Client-App ohne Build. Oberfläche = Browser (mobil gedacht, 390×844).

## Starten

```sh
python3 -m http.server 8765   # im Repo-Root; fetch() braucht HTTP, file:// scheitert
```

## Fahren (Playwright)

Chromium liegt unter `/opt/pw-browsers/chromium` (Symlink auf das Binary). `playwright-core`
in ein Scratch-Verzeichnis installieren und mit `executablePath` starten — kein
`playwright install`:

```js
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const kontext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, locale: 'de-DE' });
```

Frischer `newContext()` = leerer localStorage = Erstlauf (Onboarding). Zustand liegt
unter dem Schlüssel `crossminton.zustand.v1` und lässt sich per `page.evaluate` prüfen.
`confirm()`-Dialoge (Zurücksetzen) mit `page.on('dialog', d => d.accept())` abfangen.
Konsolen-/Seitenfehler mitschneiden — Soll ist null.

## Flüsse, die sich lohnen

0. Willkommensseite (Erstlauf, leerer localStorage): Hero + zwei CTAs. `#wk-handbuch` → Themenpfad ohne Angaben; `.cta-karte[href="#/onboarding"]` → Wizard. Tiefe Route vor der Wahl leitet auf `#/`.
1. Onboarding: Beginner → Trainer nein → Herkunft Badminton → Ziel wählen (Mehrfachauswahl, Checkboxen) → Vormarkieren-Schritt (erscheint nur mit Herkunft; Kandidaten = delta-freie Bausteine).
2. Kompetenzpfad: 6 Stationen in Graph-Reihenfolge, 4 BAD-Chips, 2 Skip-Knöpfe.
3. Baustein „griff“ im Kontext `kompetenz`: Delta-Text ersetzt Basistext („Du musst etwas verlernen“), Übungsteil bleibt regulär; im Kontext `themen:technik` erscheint der Basistext.
4. Getrennte Quittierung (Erklär-/Übungsteil), Toggle rücknehmbar, localStorage prüfen, Reload überlebt.
5. Training: Einheit durchsteppen → Kontinuität zählt; quittiert nur Übungsteile (globale Projektion steigt erst mit gelesenen Erklärteilen — kein Bug).
6. Kompetenzpfad vollenden → Meilenstein-Überlagerung.
7. Profil: Sprachwechsel en (Fallback-Hinweis), Reset mit confirm → zurück ins Onboarding.
8. Wizard-Ausstieg: `#ob-direkt` auf Schritt 1 → Kapitelübersicht ohne Angaben; Heim/Kompetenzpfad/Profil zeigen dann Stufe-nachholen-Zustände.
9. Desktop (≥768px): Bottom-Bar verborgen, Hamburger `#hamburger` öffnet `#hauptmenue` (Klasse `offen`, ~400ms Übergang), Escape/Klick schließt; Schriften prüfbar via `document.fonts.check('1rem Rubik')` und `'900 1rem "Font Awesome 6 Free"'`.
10. CI/Design: H1-Farbe == `rgb(30, 139, 214)` (blau); Icons nie `rgb(0,0,0)`; Status-Badges tragen `.chip-rot` (offen) bzw. `.chip-gruen` (erledigt) in `.abschnitt-kopf`.
11. Trainer-Layer / Fehlerbilder: `.trainer-layer` erscheint in der Baustein-Ansicht NUR wenn `diagnose().trainer` gesetzt ist und für den Baustein ein Fehlerbild existiert (Beispiel: `griff`); nie als eigene Station (auch nicht im Trainer-Kompetenzpfad). Zustand vor dem Boot seeden (`context.addInitScript`, Schlüssel `crossminton.zustand.v1`), sonst liest die SPA `trainer:true` nicht.
12. Fünf Domänen (Technik/Taktik/Mentales/Athletik befüllt, Trainingsgestaltung leer): Kompetenzpfad Beginner = 23 Stationen in Domänen-Blöcken (Technik→Taktik→Mentales→Athletik), `erholen` zuletzt. Themenpfad listet alle fünf Facetten (Trainingsgestaltung als inaktive 0-Facette). Sternform (Mentales/Athletik): Rahmen-Einstieg zuerst, Werkzeuge folgen. Reflexionsaufgabe (z. B. `spielziel_verstehen`, `erholen`): eigener Abschnitt mit „Mitgenommen"-Button; Athletik mischt Übung (`richtig_aufwaermen`) und Reflexion (`erholen`). Individualpfad domänenübergreifend: `konzentrationskonstanz`→Mentales, `rally_ausdauer`→Athletik. Cross-Sport: `aufschlag_taktisch` trägt bei BAD im Kompetenz-Kontext das Delta.
13. Zwei Stufen kumulativ (Beginner + Fortgeschritten, vier befüllte Domänen je Stufe): Kompetenzpfad ist kumulativ. Beginner-Diagnose → 23 Stationen (kein Fortgeschritten sichtbar). Fortgeschritten-Diagnose (`#/pfad/kompetenz/fortgeschritten`) → 52 Stationen: Beginner-Block (1–23), dann Fortgeschritten je Domäne (Technik → Taktik → Mentales → Athletik); die sieben Doppel-Querschnitt-Bausteine (`spielform:doppel`) hängen an ihre jeweilige Domäne an (fünf an Taktik, je einer an Athletik/Mentales). Stufenübergreifende weiche Voraussetzung erscheint als „Empfohlen vorher"-Hinweis (z. B. `beinarbeit_system` → `beinarbeit`, `intervallausdauer` → `durchhalten`, `vom_werkzeug_zum_system` → `warum_der_kopf_mitspielt`), sperrt nie. Cross-Sport BAD: 10 Deltas im kumulativen Pfad (Mentales/Athletik ohne Delta; zwei Doppel-Taktik-Deltas an `doppel_grundlagen` und `das_umschalten_im_doppel`).
14. Fortgeschritten-Taktik über Domänengrenze: Der Taktik-Block (Station 30–35) trägt gemischte weiche Voraussetzungen — `punkt_aufbauen` verweist auf die fortgeschrittene **Technik** (`ueberkopf_clear` + `kurzes_spiel_stopp`, andere Domäne, gleiche Stufe), `smash_vorbereiten` auf `smash`. Diese Kanten *ordnen* nur: der Technik-Block steht deshalb vor dem Taktik-Block, kein Baustein wird zwischen Domäne/Stufe verschoben. `rumpfstabilitaet` (Athletik) trägt einen `voraussetzungen_querverweis` auf `handgelenk_peitsche` — reine Dokumentation, keine Kante. `doppel_grundlagen` im Kompetenz-Kontext mit Herkunft BAD zeigt das Delta (Basistext im Themen-Kontext). Reflexion vs. Übung: Mentales durchgehend `reflexionsaufgabe`; Athletik mischt (Übung nur bei `rumpfstabilitaet`/`intervallausdauer`, sonst Reflexion — Gesundheitsrahmen, keine präskriptiven Dosen).
15. Individualpfad stufen-kumulativ (`#/pfad/individual`): Der Individualpfad filtert nach Zielfaktor *und* Diagnose-Stufe. Gleicher Faktor, zwei Diagnosen: `konzentrationskonstanz` bei Beginner → 3 (nur Beginner-Mentales), bei Fortgeschritten → 9 (kumulativ Beginner + Fortgeschritten-Mentales inkl. `verstaendigung_im_paar`). `doppel_spezifische_loesungen` bei Beginner → **leer** (alle Belege liegen auf Fortgeschritten), bei Fortgeschritten → **8** (durch den Doppel-Block breit belegt). Reihenfolge bleibt ziel-nah → domänen-geordnet (nicht stufen-blockiert wie der Kompetenzpfad). Themenpfad kumuliert je Domäne stufenübergreifend (inkl. Doppel-Anhang): Technik = 12, Taktik = 17, Mentales = 11, Athletik = 12.
16. Spielform-Achse — Doppel als Querschnittsthema (`#/pfad/spielform/doppel`): NEUE Metadaten-Dimension `spielform` (Default `einzel`, fehlend = einzel — alle Alt-Bausteine unangetastet). Die Achse bündelt alle acht `spielform:doppel`-Bausteine domänenübergreifend zu **einem** Thema in Erzählreihenfolge: `doppel_grundlagen` (Einstieg) → `doppel_als_eigenes_spiel` → Angriff → Verteidigung → Bewegung (Athletik) → Verständigung (Mentales) → Aufschlag → Umschalten. Erreichbar über die „Das Doppel"-Karte auf der Heim-Ansicht. **Orthogonal**: dieselben Bausteine erscheinen weiter in ihren Domänen (Themen-/Kompetenzpfad) — die Achse ist ein zusätzlicher Filter, kein Umzug. Cross-Sport ist hier verdrahtet wie im Kompetenzpfad: mit Herkunft BAD tragen `doppel_grundlagen` und `das_umschalten_im_doppel` ihr Delta (Chip in der Liste, Delta-Erklärteil + Bündelungs-Link auf `doppel_grundlagen` in der Baustein-Ansicht bei Kontext `spielform:doppel`).
17. Zweite Cross-Sport-Herkunft Tennis (`bausteine.delta-tennis.json`, herkunftsrein — nur Deltas): Im Onboarding-Herkunftsschritt erscheinen jetzt **Badminton UND Tennis** (Ableitung aus dem Delta-Bestand, `daten.herkuenfte` = [BAD, TEN]). Mit Diagnose-Herkunft TEN tragen im Kompetenzpfad genau sechs Technik-Bausteine ihr TEN-Delta: `griff`, `aufschlag`, `vorhand_drive`, `rueckhand` (Beginner) + `ueberkopf_clear`, `beinarbeit_system` (Fortgeschritten). Mehrfach-Herkunft: `griff` und `ueberkopf_clear` tragen **beide** Chips (BAD + TEN) — je nach Diagnose greift genau eines (`griff` mit TEN → „Continental-Griff"-Text, mit BAD → „verlernen"-Text; nie beide). `ueberkopf_clear` mit TEN ist ein **positiver** Transfer („Jetzt zahlt sich dein Tennisaufschlag aus"), strukturell wie die abbauenden Deltas; der Übungsteil bleibt der reguläre. `rueckhand` mit TEN bündelt auf `griff_delta_ten` + `vorhand_drive_delta_ten` (Lektüre-Links im Erklärteil).

Engine-Logik separat und schnell: `node tests/engine.test.mjs` (kein Ersatz für den Browser-Lauf).

## Stolpersteine

- Ansichten rendern nach Zustandsänderung neu → nach Klicks kurz warten (`waitForTimeout(150–200)`).
- Hash-Routing: direkte Sprünge via `page.goto(BASIS + '#/pfad/kompetenz')` funktionieren.
- „Empfohlen vorher“ erscheint bewusst nur in der Baustein-Ansicht, nicht in den Listen; Listen zeigen nur „Außerhalb deiner Zielauswahl“ (Individualpfad).
