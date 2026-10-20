// Erzeugt die englischen Zwillinge G-XXX.en.svg aus G-XXX.svg: ersetzt aria-label
// und die sichtbare .st-Caption, Geometrie bleibt byte-identisch (Ring-16-Muster).
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const M = {
  'G-013': { cap: 'the face brushes · cut and spin', aria: 'The slice: the angled racket face brushes across the speeder instead of hitting it straight; curved motion lines show the cutting path and the resulting spin.' },
  'G-021': { cap: 'right onto the line · minimal margin', aria: 'Precision to the lines: the speeder lands exactly on a corner line at the very edge of the court; tight target zones and a thin arrow show pinpoint placement with minimal margin.' },
  'G-035': { cap: 'short ground contact · fast rebound', aria: 'Reactive strength: the short, springy ground contact of foot and lower leg — minimal contact time, shown by a small compression arc and a fast rebound arrow.' },
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

for (const [id, { cap, aria }] of Object.entries(M)) {
  const de = readFileSync(resolve('images', `${id}.svg`), 'utf8');
  // Personengrafiken entstehen in scratchpad/figuren/ (motive.mjs + texte.mjs) samt allen vier
  // Sprachen; dieses Skript würde ihre Übersetzung mit veralteten Texten überschreiben.
  if (de.includes('data-quelle="figuren"')) { console.error(`${id} ist generiert (scratchpad/figuren/) — Eintrag aus der Map entfernen`); process.exit(1); }
  let en = de.replace(/aria-label="[^"]*"/, `aria-label="${esc(aria)}"`);
  en = en.replace(/(<text class="st"[^>]*>)[^<]*(<\/text>)/, `$1${esc(cap)}$2`);
  if (en === de) { console.error('KEINE Ersetzung bei', id); process.exit(1); }
  writeFileSync(resolve('images', `${id}.en.svg`), en);
  console.log('en', id);
}
