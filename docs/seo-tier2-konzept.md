# SEO Tier 2 — Konzept (Entwurf, noch nicht umgesetzt)

Ziel: Aus der Startseite-only-Auffindbarkeit echte, indexierbare URLs machen —
**ohne** das „buildfrei"-Prinzip der Laufzeit-App zu verletzen. Tier 1 (Social-
Vorschau, PWA-Manifest, strukturierte Daten, robots/Sitemap-Grundgerüst,
noscript-Inhalt) ist bereits umgesetzt; dies hier ist der nächste, größere
Schritt und **bewusst als Plan** gehalten.

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
