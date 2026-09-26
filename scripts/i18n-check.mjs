// Struktur-Gate für die Label-Dateien — dependency-frei:
//   node scripts/i18n-check.mjs        (CLI: Exit 1 bei Abweichung)
//   import { pruefeI18nStruktur }       (für tests/engine.test.mjs)
//
// Sichert zu, dass en/fr/pl EXAKT die Schlüsselmenge von de spiegeln (alle
// Namespaces ui/bausteine/grafiken/vokabeln/… — der _meta-Block ist bewusst
// ausgenommen, weil seine Werte je Sprache abweichen dürfen). Damit kann ein
// neuer de-Schlüssel nicht mehr still unübersetzt „durchrutschen": fehlt er in
// einem Skelett, schlägt der Test an und erzwingt die Skelett-Regeneration.
// Der Test prüft NUR die Struktur, nicht ob Werte befüllt sind (Übersetzung
// darf lückenhaft sein — die Laufzeit fällt auf de zurück).

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SPRACHEN = ['en', 'fr', 'pl'];

// Menge aller Blatt-Pfade (dot-joined), _meta auf oberster Ebene ausgenommen.
function schluesselmenge(obj, praefix = '', acc = new Set()) {
  for (const [k, v] of Object.entries(obj)) {
    if (praefix === '' && k === '_meta') continue;
    const pfad = praefix ? `${praefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) schluesselmenge(v, pfad, acc);
    else acc.add(pfad);
  }
  return acc;
}

export function pruefeI18nStruktur(wurzel) {
  const lies = (s) => JSON.parse(readFileSync(join(wurzel, 'data/labels', `${s}.json`), 'utf8'));
  const deSchluessel = schluesselmenge(lies('de'));
  const probleme = [];
  for (const s of SPRACHEN) {
    let daten;
    try { daten = lies(s); } catch (e) { probleme.push(`${s}: nicht ladbar (${e.message})`); continue; }
    const ks = schluesselmenge(daten);
    const fehlend = [...deSchluessel].filter((k) => !ks.has(k));
    const zusatz = [...ks].filter((k) => !deSchluessel.has(k));
    if (fehlend.length) probleme.push(`${s}: ${fehlend.length} fehlende Schlüssel (z. B. ${fehlend.slice(0, 4).join(', ')})`);
    if (zusatz.length) probleme.push(`${s}: ${zusatz.length} überzählige Schlüssel (z. B. ${zusatz.slice(0, 4).join(', ')})`);
  }
  return { ok: probleme.length === 0, probleme };
}

// CLI-Einstieg (nur bei Direktaufruf, nicht beim Import).
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..');
  const { ok, probleme } = pruefeI18nStruktur(wurzel);
  if (ok) {
    console.log('i18n-check: en/fr/pl spiegeln de strukturell ✓');
    process.exit(0);
  }
  console.error('i18n-check: Strukturabweichungen gefunden:');
  for (const p of probleme) console.error('  - ' + p);
  console.error('\nSkelette regenerieren (leere Werte für neue de-Schlüssel ergänzen).');
  process.exit(1);
}
