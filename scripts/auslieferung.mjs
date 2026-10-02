// Was NICHT in die Auslieferung gehört: Werkzeuge, Tests und Doku für die
// Entwicklung. scripts/prerender.mjs kopiert die ganze Statik nach _site und
// nimmt diese Einträge nach dem Erfassen wieder heraus — erst danach, weil der
// Prerender-Tab scripts/routen.mjs selbst lädt. Ohne diesen Schritt gingen sie
// über den Branch deploy mit in die Produktion: rund 1,5 MB, darunter die
// Übersetzungs- und Grafikskripte aus scratchpad/ und diese Entwicklerdoku.
//
// Bewusst eine Liste der AUSGESCHLOSSENEN Einträge statt der erlaubten: eine
// vergessene Laufzeitdatei bräche die Produktion, eine vergessene
// Entwicklerdatei kostet nur ein paar Kilobyte. Test [25] hält fest, dass jeder
// Eintrag existiert (ein Tippfehler ließe ihn still durch) und dass kein
// Laufzeitverweis — Service-Worker-Hülle, index.html, 404.html, Manifest,
// Modul-Importe, Turnier-PDFs — in einen davon zeigt. Der Deploy-Workflow prüft
// das Ergebnis noch einmal am fertigen _site.
export const NUR_ENTWICKLUNG = Object.freeze([
  '.claude',
  '.github',
  '.gitignore',
  'CLAUDE.md',
  'ENTWICKLUNG.md',
  'MANIFEST.md',
  'README.md',
  'docs',
  'scratchpad',
  'scripts',
  'tests',
  'validate.py',
]);
