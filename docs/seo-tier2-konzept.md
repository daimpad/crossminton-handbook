# SEO Tier 2 — Konzept

Ziel: Aus der Startseite-only-Auffindbarkeit echte, indexierbare URLs machen —
**ohne** das „buildfrei"-Prinzip der Laufzeit-App zu verletzen. Tier 1 (Social-
Vorschau, PWA-Manifest, strukturierte Daten, robots/Sitemap-Grundgerüst,
noscript-Inhalt) ist umgesetzt. **Baustein 1 (History-Routing) und Baustein 2
(Prerendering + volle Sitemap) sind jetzt beide umgesetzt** — die Abweichungen
vom ursprünglichen Plan stehen am Ende dieses Dokuments.

## Warum überhaupt

Zwei strukturelle Bremsen begrenzen die Auffindbarkeit:

1. **Hash-Routing (`#/pfad/...`)** — Suchmaschinen behandeln alles hinter `#`
   als dieselbe Seite. Es existiert faktisch nur **eine** URL (die Wurzel).
2. **Clientseitiges Rendering** — das ausgelieferte HTML ist bis auf den Loader
   leer; der Inhalt kommt per JS + `fetch`. Nicht-JS-Crawler (Bing, Social,
   Messenger) sehen nichts; Googlebot rendert verzögert und unzuverlässig.

Tier 2 behebt beides: **echte Pfad-URLs** (Baustein 1) und **statische
HTML-Schnappschüsse je URL** (Baustein 2).

## Baustein 1 — History-API-Routing statt Hash

**Was:** `#/pfad/kompetenz/beginner` → `/pfad/kompetenz/beginner`.

**Änderungen:**
- `js/app.js`: Router von `window.location.hash` auf die History API umstellen
  (`history.pushState`, `popstate`-Ereignis, `location.pathname`). Ein globaler
  Klick-Handler fängt interne `<a>`-Klicks ab und ruft `pushState` statt einer
  Vollnavigation. `parseHash()` → `parsePfad()`, liest `pathname` relativ zur
  `<base href>`.
- `index.html`: `<base href="/crossminton-handbook/">` setzen (Pages-Unterpfad),
  interne Links von `href="#/..."` auf `href="/crossminton-handbook/..."` (oder
  relative Pfade) umstellen. Betrifft Kopf, Bottom-Bar, Menü.
- **Alle `#/`-Links** in den Ansichten (`js/ansichten/*.js`) und im Router
  mitziehen — das ist die eigentliche Fleißarbeit (Deep-Links, Querverweise,
  `stationImKontext`-Rückwege, Plan-/Trainings-Links).

**Der GitHub-Pages-Fallstrick:** Pages liefert für `/pfad/...` einen 404, weil
die Datei nicht existiert. Lösung ist der etablierte **SPA-404-Trick**: eine
`404.html`, die den angefragten Pfad in einen Query-Parameter kodiert und nach
`index.html` weiterleitet; ein kleines Inline-Skript in `index.html` stellt den
Pfad vor dem Boot wieder her (`history.replaceState`). Bewährt (rafgraph/
spa-github-pages), rein statisch, kein Server nötig.

**Aufwand:** mittel–hoch. Kein neuer Build, aber viele Link-Stellen und ein
sorgfältiger Router-Umbau. Vollständige Playwright-Regression nötig (jede Route,
Deep-Link, Zurück-Button, Reload auf Unterseite).

## Baustein 2 — Prerendering zur Deploy-Zeit

**Was:** Für jede sinnvolle URL wird beim Deploy eine **statische HTML-Datei**
mit fertig gerendertem Inhalt erzeugt (`/pfad/kompetenz/beginner/index.html`
usw.). Crawler bekommen sofort vollen Text; die App „hydratisiert" beim Laden
im Browser wie gewohnt.

**Wichtig fürs Prinzip:** Die **Laufzeit-App bleibt buildfrei** — Entwicklung
und lokaler Betrieb laufen unverändert über `python3 -m http.server`. Das
Prerendering passiert **ausschließlich im GitHub-Action** vor dem Pages-Upload.
Kein Bundler, keine npm-Laufzeitabhängigkeit im Repo.

**Umsetzung im Workflow (`deploy-pages.yml`):**
1. `python3 -m http.server` im Hintergrund starten.
2. Mit **Playwright** (in CI ohnehin verfügbar) die Routenliste abfahren — die
   URLs lassen sich deterministisch aus den Daten ableiten (`daten.bausteine`,
   `regeln.abschnitte`, Pfad-Achsen), also **keine manuelle Pflege**.
3. Je Route das gerenderte `#ansicht`-HTML plus route-spezifische `<title>`/
   `<meta description>`/`<link canonical>` in eine statische Datei schreiben.
4. Parallel die **vollständige `sitemap.xml`** aus derselben Routenliste
   generieren.
5. Den so angereicherten Ordner als Pages-Artefakt hochladen.

**Route-spezifische Meta-Daten:** Titel/Description je Baustein aus den Labels
und Erklärteilen ableiten (z. B. „Der Aufschlag — Crossminton-Handbuch"). Das
ist der eigentliche SEO-Gewinn: einzigartige Titel/Snippets je Seite.

**Aufwand:** mittel. Ein Prerender-Skript (~150–250 Zeilen) + Workflow-Schritte.
Risiko gering, weil es die App nicht verändert, sondern nur ihren Output
einfängt.

## Reihenfolge & Risiko

1. **Baustein 1 zuerst** (echte URLs) — ohne ihn gibt es nichts zu prerendern.
2. **Baustein 2 danach** (Snapshots + Sitemap).
3. Danach **Google Search Console** einrichten, Sitemap einreichen, Indexierung
   beobachten.

Beide Bausteine sind rückbaubar und berühren keine Daten/Engine-Logik. Der
größte Testaufwand liegt in Baustein 1 (Router). Empfehlung: Baustein 1 als
eigenes PR mit voller Playwright-Regression, Baustein 2 als zweites PR.

## Realistische Erwartung

Deutschsprachige Nischen-App. Selbst mit perfekter Technik bleibt das Volumen
klein; die Hebel sind dann **einzigartige URLs mit gutem Titel/Snippet** und
**Backlinks** (crossminton.de, DCV, Vereine). Tier 2 macht die Inhalte
überhaupt erst auffindbar — das ist die Voraussetzung, nicht die Garantie.

## Offene Entscheidung

- **Custom Domain** (z. B. `handbuch.crossminton.de`) statt `github.io`-Unterpfad?
  Würde `<base href>` vereinfachen (`/` statt `/crossminton-handbook/`) und wirkt
  vertrauenswürdiger. Erfordert DNS-Zugriff und einen `CNAME`-Eintrag.

## Baustein 1 — Stand nach Umsetzung (Abweichungen vom Plan)

Der Router läuft jetzt über die History API (`js/app.js`: `parsePfad`,
`navigiere`, `WURZEL`, `normalisiereLinks`, `geheZu`), der SPA-404-Trick ist als
`404.html` umgesetzt, `sw.js` unterscheidet 404-Antworten (SPA-Umweg) von echten
Netzfehlern in `bedieneNavigation`. Drei Punkte weichen vom ursprünglichen Plan
ab, alle aus demselben Grund:

**`<base href>` ist doch nötig, entgegen der ursprünglichen Architekturregel
„läuft ohne `<base>`-Tag an jedem Montagepunkt".** Der Grund: Wird das Dokument
unter einer VERSCHACHTELTEN Route ausgeliefert (`/baustein/griff` — per
404-Umweg oder aus dem Service-Worker-Cache), tragen rein relative Pfade
(`js/app.js`) nicht mehr — sie würden zu `/baustein/js/app.js` auflösen. Das
`<base>`-Element wird in `index.html` als ALLERERSTES Element im `<head>`
gesetzt (nach `<meta charset>`, das aus Spezifikationsgründen in den ersten
1024 Byte stehen muss) und per Inline-Skript synchron auf den tatsächlichen
Montagepunkt korrigiert — der Wert steht doppelt (index.html + 404.html) und
ist der einzige deploy-abhängige Wert im gesamten Mechanismus.

**Der Modul-Graph wird per JS vorgeladen, nicht mehr über statische
`<link rel=modulepreload>`-Tags.** Chromiums Preload-Scanner liest solche
Hinweise aus den rohen Antwort-Bytes, BEVOR das `<base>`-Skript läuft — er
sähe also immer den `<base>`-Platzhalter, nicht den korrigierten Wert, und
würde unter einem Unterpfad-Deploy bei JEDEM Seitenaufruf 21 falsche Anfragen
auslösen. Die Lösung: dieselbe Ressourcenliste wird im `<base>`-Skript selbst
per `document.createElement('link')` mit der bereits korrekten absoluten URL
eingefügt — der Vorteil (paralleles Vorladen) bleibt, das Ratemuster entfällt.

**Ein kleiner, bewusst akzeptierter Rest bleibt:** die paar echten,
notwendigerweise statischen Tags (`css/schriften.css`, `css/app.css`,
`js/app.js` als `<script type=module>`, das Kopf-Logo) lösen aus demselben
Grund beim Preload-Scanner unter Unterpfad-Deploy falsch auf — sichtbar als
eine Handvoll harmloser 404-Einträge in der Konsole bei JEDEM Seitenaufruf
auf GitHub Pages. Das sind reine Doppelanfragen: der eigentliche Parser
erreicht dieselben Tags erst NACH dem synchronen `<base>`-Skript und lädt sie
korrekt — die Seite rendert vollständig und funktional richtig (verifiziert:
Playwright bestätigt Rendering, Klickpfade, Deep-Links, Reload). Diese vier
Ressourcen dynamisch statt statisch einzubinden würde den ersten Anstrich auf
JS verzögern (aktuell rendert die Seite ohne JS-Wartezeit) und die
`<noscript>`-Fallback-Garantie aufweichen — das wiegt schwerer als saubere
Konsolen-Logs. Der Effekt ist read-only, ändert nichts am Ergebnis und tritt
NUR unter Unterpfad-Deploy auf; lokal (Montage unter `/`) bleibt die Konsole
vollständig sauber (Playwright-Testsuite bestätigt 0 Fehler bei Root-Montage).

## Baustein 2 — Stand nach Umsetzung (Abweichungen vom Plan)

Ein neues, geteiltes Modul **`js/seo.js`** (`seiteMeta(daten, segmente)`) leitet
Titel + Beschreibung je Route aus genau den Funktionen/Labels ab, die die
jeweilige Ansicht selbst schon für ihre Überschrift nutzt (`kompetenzpfad`,
`themenDomaenen`, `bausteinText()`/`ausschnitt()` aus `js/suche.js` für die
Baustein-Beschreibung, `app-info.json` für Über/Mitmachen/Impressum/
Datenschutz). **Eine Quelle für zwei Verbraucher:** `js/app.js` ruft es bei
jedem `rendern()` auf und setzt `document.title` + `<meta name="description">`
+ `<link rel="canonical">` **live im Client** — das war im ursprünglichen Plan
nicht vorgesehen (der sprach nur vom Prerender-Output), schließt aber dieselbe
Lücke für JEDEN Aufruf, nicht nur den ersten: ohne das bliebe der Browser-Tab-
Titel nach einer SPA-Navigation für immer generisch. `scripts/prerender.mjs`
liest denselben, bereits vom Client gesetzten Wert einfach aus dem DOM aus
(`document.title` etc.) — es gibt **keine zweite, parallele Titel-Zuordnung**.

**Die Startseite behält ihren handgepflegten Tier-1-Kopf unangetastet** (reichhaltige
OG-Beschreibung + Produktions-Canonical aus `index.html`) — sowohl im
Prerender (`baueSnapshot()` überspringt `pfad === '/'`) als auch im Live-Client
(`beschrifteRahmen()` sichert die drei Original-Werte einmalig beim Modul-Load
und stellt sie bei jeder Rückkehr zu `/` wieder her, statt sie durch die
generische `seiteMeta()`-Zuordnung zu ersetzen). Diese Ausnahme stand nicht im
ursprünglichen Plan, war aber nötig: ohne sie hätte der erste Client-Boot die
sorgfältig formulierte Tier-1-Beschreibung sofort durch einen generischen
Platzhalter überschrieben — ein Playwright-Rauchtest deckte das auf (Titel/
Beschreibung vor und nach einem Ausflug auf eine andere Route verglichen).

**Das Prerendern läuft über einen einzigen Tab mit SPA-In-Page-Navigation,
nicht über 149 einzelne `page.goto()`-Aufrufe.** `scripts/prerender.mjs` bootet
die App genau einmal (ein `ladeDaten()`-Lauf), leitet daraus per
`page.evaluate()` die Routenliste ab (dieselben reinen Funktionen aus
`js/daten.js`/`js/pfade.js` — keine zweite, gepflegte Liste) und durchläuft sie
per `history.pushState` + `popstate` (derselbe Weg, den auch ein Klick nimmt).
Das ist schneller (~2 s für alle 149 Routen lokal) und schließt aus, dass die
Routenliste aus dem Skript und die Routenliste der App-Laufzeit auseinanderlaufen.

**Node erlaubt kein rekursives `cp()` in eine eigene Unterverzeichnis** — das
Staging-Verzeichnis `_site` liegt unter dem Repo-Wurzelverzeichnis, darum kopiert
`kopiere()` Eintrag für Eintrag (`readdirSync` + `cpSync` je Top-Level-Datei/
-Ordner, `.git`/`node_modules`/`_site` ausgenommen) statt eines einzigen
`cpSync(REPO, ZIEL, {recursive:true})`-Aufrufs.

**Playwright ist eine reine CI-Werkzeug-Abhängigkeit**, installiert im
`deploy`-Job per `npm install --no-save playwright@1.56.1` — kein
`package.json` im Repo, `node_modules`/`_site` sind gitignored. Lokale
Entwicklung bleibt vollständig unverändert buildfrei über
`python3 -m http.server`; das eingecheckte `sitemap.xml` zeigt weiterhin nur
die Startseite (Platzhalter für den lokalen Betrieb) und wird ausschließlich
beim Deploy durch die vollständige, generierte Fassung ersetzt.

### Nachtrag: zwei Unterpfad-Fehler, die erst live auffielen

Beide Fehler hatten dieselbe Wurzel — **lokal wird unter `/` entwickelt, ausgeliefert
wird unter `/crossminton-handbook/`**, und beide Fehler sind bei Wurzel-Montage
ein No-op. Genau darum fiel keiner in der lokalen Prüfung auf:

1. **Der Prerender backte wurzel-relative Links ein.** Der Tab lief unter `/`, also
   zog `normalisiereLinks()` die Links auf `/pfad/themen` statt
   `/crossminton-handbook/pfad/themen`. Ausgeliefert zeigten sie neben die App →
   echter 404 auf jeder prerenderten Seite. **Fix:** Der Prerender liefert das
   Staging-Verzeichnis jetzt unter dem Produktions-Präfix aus (Selbst-Symlink,
   `praefixSymlink()`), sieht also denselben Montagepunkt wie der Deploy.
2. **`zuUrl()` verdoppelte den Präfix.** Der Klick-Interceptor reicht
   `url.pathname` herein — der trägt den Montagepunkt schon, weil die Links im DOM
   nach `normalisiereLinks()` absolut sind. `zuUrl()` stellte WURZEL trotzdem
   erneut davor: `/crossminton-handbook/crossminton-handbook/pfad/themen`. Das
   war ein **Baustein-1-Fehler**, kein Prerender-Fehler; er zeigte sich als
   „Klick tut nichts, ich bleibe auf derselben Seite" (der Router deutete die
   Doppel-Route als unbekannt und rendert dann die Startseite). **Fix:**
   `zuUrl()` ist jetzt idempotent — ein bereits montagepunkt-absoluter Pfad wird
   unverändert übernommen.

**Daraus zwei dauerhafte Konsequenzen.** Erstens prüft `scripts/prerender.mjs` per
`pruefeLinks()` jeden Schnappschuss darauf, dass kein `<a href>` wurzel-absolut
neben den Montagepunkt zeigt, und **bricht den Deploy mit Exit-Code 1 ab**, statt
so etwas noch einmal auszurollen. Zweitens gilt für alles, was Pfade baut: **unter
einem simulierten Unterpfad verifizieren, nicht nur unter `/`** — die
Wurzel-Montage verdeckt genau diese Fehlerklasse.

**Ergebnis:** 149 statische Routen (108 Bausteine, alle Pfad-Achsen,
8 Trainingseinheiten, Regeln/Turnier/Ausrüstung/Über/Mitmachen/Impressum/
Datenschutz), verifiziert per lokalem Prerender-Testlauf (Titel/Beschreibung/
Canonical/Social-Vorschau je Snapshot stichprobenartig geprüft, 0 Laufzeitfehler
über alle Routen, sitemap.xml als wohlgeformtes XML mit 149 eindeutigen
`<loc>`-Einträgen bestätigt) und einem Playwright-Rauchtest der Live-App
(Klick-Navigation, Browser-Zurück, Deep-Link-Reload, Rückkehr zur Startseite —
0 unerwartete Konsolenfehler).
