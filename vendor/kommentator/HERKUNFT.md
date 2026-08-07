# Herkunft der vendorten Dateien

`kommentare.js`, `kommentare.css` und `LICENSE` stammen **unverändert** aus
[daimpad/kommentator](https://github.com/daimpad/kommentator) (MIT). Sie werden
lokal eingecheckt statt von einem CDN geladen — so verlangt es die
Architekturregel „Bibliotheken, wenn überhaupt, als lokal eingecheckte statische
Datei" (s. `CLAUDE.md`).

| | |
| --- | --- |
| Stand | `6c6c302` (Merge von PR #22) |
| Übernommen am | 2026-08-05 |
| Zuvor | `b5fb2a7` |

## Warum diese Datei existiert

Die Dateien tragen **keine Versionsnummer**. Ohne diese Notiz lässt sich nicht
feststellen, welcher Upstream-Stand hier liegt — die Aktualisierung beginnt dann
jedes Mal mit einem Vergleich gegen alle Commits des Quell-Repos.

## Aktualisieren

```sh
git clone --depth 50 https://github.com/daimpad/kommentator /tmp/kommentator
git -C /tmp/kommentator log --oneline <hier eingetragener Stand>..origin/main \
  -- kommentare.js kommentare.css        # was uns überhaupt betrifft
```

Dann die drei Dateien byte-genau übernehmen und **diese Tabelle nachziehen**.

Zwei Dinge dabei prüfen, weil das Quell-Repo auch ein WordPress-Plugin enthält,
das uns nichts angeht:

1. **Kommen neue Vorgaben (Defaults) hinzu, die nach außen wirken?** Beim Stand
   `6c6c302` kam ein `webhook` dazu, über den Kommentare an eine zentrale
   Sammelstelle gehen können. Er ist **opt-in** (`if (options.webhook && …)`),
   und `js/feedback.js` übergibt keinen — es verlässt also nichts den Browser,
   und die Aussage in der Datenschutzerklärung bleibt richtig. Würde so etwas
   je zur Vorgabe, müsste die Erklärung mit.
2. **Nutzt neues CSS `--k-*`-Variablen, die `css/feedback.css` nicht setzt?**
   Nicht überschriebene Variablen fallen auf die Vendor-Werte zurück und brechen
   dann aus der App-CI aus.

Die vendorte Datei selbst wird **nie** angefasst — Anpassungen laufen
ausschließlich über die `--k-*`-Überschreibungen in `css/feedback.css`.
