# nginx-Direktiven für die Produktion (Plesk)

Die Produktion auf netcup läuft unter Plesk: **nginx vorn, Apache dahinter**. Zwei Dinge, die die `.htaccess` regeln soll, kommen dort nicht an. Die Direktiven unten holen sie nach. Sie gehören in Plesk, nicht ins Repository: Plesk schreibt die nginx-Konfiguration selbst, eine Datei im Repo würde nie gelesen.

## Befund (gemessen am 20.10.2026)

| Anfrage | Antwort | Soll |
| --- | --- | --- |
| `/regeln`, `/baustein/griff`, `/en` | `301` auf die Fassung mit Schrägstrich | `200`, Snapshot unter derselben Adresse |
| `/regeln/`, `/suche`, `/` | `200`, `Cache-Control: no-cache` | unverändert |
| `/sw.js`, `/css/app.css`, `/js/app.js`, `/images/G-001.svg`, `/index.html` | `200`, **kein** `Cache-Control` | `no-cache` |
| `/data/labels/de.json`, `/sitemap.xml` | `200`, **kein** `Cache-Control` | `no-cache` |

**Der `301` kommt von Apache, nicht von nginx.** Die Umleitungsseite ist Apaches eigene („Apache Server at crossminton-handbook.de Port 443"), und die `.htaccess` wird gelesen: `/suche` hat keinen Snapshot und landet über Regel 4 mit `200` auf der Hülle. Regel 1 schreibt `/regeln` zwar auf `/regeln/index.html` um, aber `mod_dir` schickt trotzdem den Schrägstrich-301 (`DirectorySlash`), weil die Anfrage auf ein Verzeichnis zeigt. Lokal mit Apache 2.4.58 und derselben `.htaccess` nachgestellt, mit demselben Ergebnis.

**Statische Dateien liefert nginx selbst aus**, darum erreicht sie die `Header`-Regel der `.htaccess` nie. Erkennbar am ETag: nginx schreibt `"6abf4d82-a5ce"` (Zeit-Größe, hex), Apache `"c505-65cd58c6ee347"`. JSON und XML gehen zwar über Apache, tragen aber auch dort keine Kopfzeile, weil die `.htaccess` nur `index.html`, `sw.js` und die Grafiken nennt.

**Warum das zählt:**
- Das Canonical jedes Snapshots zeigt auf die Adresse **ohne** Schrägstrich, ausgeliefert wird nach dem 301 aber die **mit**. Für 600 Seiten fallen damit ausgelieferte und kanonische Adresse auseinander, genau das sollte das Prerendering beheben.
- Ohne `Cache-Control` raten Browser eine Frist (rund ein Zehntel der Zeit seit `Last-Modified`). Die App arbeitet mit festen Dateinamen; eine Datei, die einen Monat unverändert lag, kann nach einem Deploy bis zu drei Tage alt aus dem Browser-Cache kommen. Davon betroffen ist auch der Service Worker: `cache.addAll()` bei einem `CACHE`-Bump fragt über denselben Cache und kann so alte Dateien unter dem neuen Cache-Namen ablegen.

## Die Direktiven

```nginx
# Crossminton-Handbuch: zusätzliche nginx-Direktiven (Plesk)
# Begründung und Prüfschritte: docs/plesk-nginx.md im Repository.

# 1. Jede Antwort mit Rückfrage beim Server. Die App arbeitet mit festen
#    Dateinamen; ohne Angabe raten Browser eine Frist und zeigen nach einem
#    Deploy alte Dateien. "no-cache" erlaubt das Zwischenspeichern, verlangt aber
#    vor jeder Nutzung eine Prüfung per ETag (304, wenn unverändert).
#    Die Kopfzeile kommt allein von nginx; Apaches eigene wird ausgeblendet,
#    sonst stünde sie bei manchen Antworten doppelt da.
proxy_hide_header Cache-Control;
add_header Cache-Control "no-cache";

# 2. Vorgerenderte Seite ohne Schrägstrich (/regeln, /baustein/griff, /en):
#    intern auf die Fassung mit Schrägstrich umschreiben. Sonst antwortet Apache
#    mit 301 auf /regeln/, während das Canonical der Seite auf /regeln zeigt.
#    Die Adresse im Browser bleibt unverändert, die Query bleibt erhalten.
if (-f $document_root$uri/index.html) {
    rewrite ^(/.*[^/])$ $1/ last;
}
```

Teil 2 schreibt nur intern um, ohne Weiterleitung: Apache bekommt `/regeln/` und liefert den Snapshot samt seinem `no-cache` aus, im Browser steht weiter `/regeln`. Greift nur, wenn es zu der Adresse einen Snapshot gibt; die Wurzel (`/`), Adressen mit Schrägstrich und alles ohne Snapshot (`/suche`, `/profil`) laufen unverändert weiter.

## Eintragen

1. Plesk → **Websites & Domains** → `crossminton-handbook.de` → **Hosting & DNS** → **Apache & nginx**.
2. Ganz unten das Feld **Zusätzliche nginx-Anweisungen** (engl. *Additional nginx directives*): den Block oben einfügen. Die übrigen Einstellungen auf der Seite bleiben, wie sie sind.
3. **OK** bzw. **Übernehmen**. Plesk prüft die Konfiguration, bevor es sie lädt; bei einem Fehler lehnt es ab und die alte bleibt aktiv.

**Rückbau:** den Block wieder löschen und übernehmen.

## Prüfen

Nach dem Übernehmen, ohne Browser (der Service Worker verdeckt sonst Fehler):

```sh
for u in /regeln /baustein/griff /en /regeln/ /suche / /sw.js /css/app.css /images/G-001.svg /data/labels/de.json /gibtsnicht.png; do
  printf '%-22s' "$u"
  curl -s -o /dev/null -D - "https://crossminton-handbook.de$u" | tr -d '\r' | grep -iE '^HTTP|^cache-control|^location' | tr '\n' ' '
  echo
done
```

Soll:
- alle Seiten (`/regeln` … `/`) `200` mit **genau einer** Zeile `cache-control: no-cache`, keine `location`;
- `/sw.js`, `/css/app.css`, die Grafik und die JSON-Datei `200` mit `cache-control: no-cache`;
- `/gibtsnicht.png` weiter `404`.

Danach im privaten Fenster `/regeln` öffnen: die Adresszeile bleibt ohne Schrägstrich, die Seite rendert.

Fehlt die `cache-control`-Zeile bei einer Dateiart, setzt ein Plesk-Block für diese Dateien eine eigene Kopfzeile, und nginx erbt die Direktive dann nicht. Steht sie doppelt da, blendet ein Plesk-Block die Apache-Kopfzeile nicht aus. Beides schadet nicht, gehört aber gemeldet.

## Lokal geprüft

Nachbau mit nginx 1.24 vor Apache 2.4.58 wie bei Plesk: nginx liefert die Dateien der Plesk-Standardliste selbst aus (`html`, `js`, `css`, `svg`, `png`, …), alles andere geht an Apache mit der `.htaccess` aus dem Repo. Ohne Direktiven: dieselben `301` und dieselben fehlenden Kopfzeilen wie in der Produktion. Mit Direktiven: `/regeln`, `/en`, `/baustein/griff` und `/baustein/griff?kontext=themen:taktik` antworten mit `200` und dem Snapshot; jede Antwort trägt genau ein `Cache-Control: no-cache`, auch ein `304`; `/gibtsnicht.png` bleibt `404`.

## Alternative ohne nginx

`DirectorySlash Off` in der `.htaccess` (vor `RewriteEngine On`) beseitigt den 301 in Apache selbst; im Nachbau geprüft. Die Direktive verlangt `AllowOverride Indexes`. Erlaubt Plesk das nicht, antwortet die **ganze Seite mit 500**, bis der nächste Deploy die Zeile wieder entfernt. Darum der Weg über nginx, den Plesk vor dem Laden prüft. Die Kopfzeilen löst die Alternative ohnehin nicht, solange nginx die statischen Dateien ausliefert.
