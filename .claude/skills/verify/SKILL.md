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

1. Onboarding: Beginner → Trainer nein → Herkunft Badminton → Ziel wählen → Vormarkieren-Schritt (erscheint nur mit Herkunft; Kandidaten = delta-freie Bausteine).
2. Kompetenzpfad: 6 Stationen in Graph-Reihenfolge, 4 BAD-Chips, 2 Skip-Knöpfe.
3. Baustein „griff“ im Kontext `kompetenz`: Delta-Text ersetzt Basistext („Du musst etwas verlernen“), Übungsteil bleibt regulär; im Kontext `themen:technik` erscheint der Basistext.
4. Getrennte Quittierung (Erklär-/Übungsteil), Toggle rücknehmbar, localStorage prüfen, Reload überlebt.
5. Training: Einheit durchsteppen → Kontinuität zählt; quittiert nur Übungsteile (globale Projektion steigt erst mit gelesenen Erklärteilen — kein Bug).
6. Kompetenzpfad vollenden → Meilenstein-Überlagerung.
7. Profil: Sprachwechsel en (Fallback-Hinweis), Reset mit confirm → zurück ins Onboarding.

Engine-Logik separat und schnell: `node tests/engine.test.mjs` (kein Ersatz für den Browser-Lauf).

## Stolpersteine

- Ansichten rendern nach Zustandsänderung neu → nach Klicks kurz warten (`waitForTimeout(150–200)`).
- Hash-Routing: direkte Sprünge via `page.goto(BASIS + '#/pfad/kompetenz')` funktionieren.
- „Empfohlen vorher“ erscheint bewusst nur in der Baustein-Ansicht, nicht in den Listen; Listen zeigen nur „Außerhalb deiner Zielauswahl“ (Individualpfad).
