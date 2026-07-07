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

Engine-Logik separat und schnell: `node tests/engine.test.mjs` (kein Ersatz für den Browser-Lauf).

## Stolpersteine

- Ansichten rendern nach Zustandsänderung neu → nach Klicks kurz warten (`waitForTimeout(150–200)`).
- Hash-Routing: direkte Sprünge via `page.goto(BASIS + '#/pfad/kompetenz')` funktionieren.
- „Empfohlen vorher“ erscheint bewusst nur in der Baustein-Ansicht, nicht in den Listen; Listen zeigen nur „Außerhalb deiner Zielauswahl“ (Individualpfad).
