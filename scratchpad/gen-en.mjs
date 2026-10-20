// Erzeugt die englischen Zwillinge G-XXX.en.svg aus G-XXX.svg: ersetzt aria-label
// und die sichtbare .st-Caption, Geometrie bleibt byte-identisch (Ring-16-Muster).
// Zweite Map V: Diagramme mit mehreren Beschriftungen, alle <text> in Dokumentreihenfolge
// ersetzt wie in gen-fr.mjs. Aufgenommen, als die neun Diagramme mit freigestellten
// Beschriftungen neue Geometrie bekamen — vorher hatten ihre en-Zwillinge keinen Generator.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const M = {
  'G-013': { cap: 'the face brushes · cut and spin', aria: 'The slice: the angled racket face brushes across the speeder instead of hitting it straight; curved motion lines show the cutting path and the resulting spin.' },
  'G-021': { cap: 'right onto the line · minimal margin', aria: 'Precision to the lines: the speeder lands exactly on a corner line at the very edge of the court; tight target zones and a thin arrow show pinpoint placement with minimal margin.' },
};

const V = {
  "G-051": {"aria":"Getting your partner in position: your own stroke sets your partner up in a better attacking position.","texts":["your stroke","partner","get your partner in position"]},
  "G-014": {"aria":"The footwork system: break out from the central base into the corners and return to the center at once.","texts":["base","out to the corner — back to the center"]},
  "G-026": {"aria":"The opponent's backhand: play the Speeder deliberately into the opponent's backhand corner.","texts":["opponent","backhand"]},
  "G-023": {"aria":"The goal of the game: play the Speeder across the neutral zone into the opponent's field.","texts":["opponent's field","NEUTRAL ZONE","your field"]},
  "G-024": {"aria":"Central position: from the center of the field the paths to all four corners are equally short.","texts":["center","equally quick to every corner"]},
  "G-025": {"aria":"Length and depth: play a short ball to the front line or a deep ball to the baseline.","texts":["deep — to the baseline","short — to the front line"]},
  "G-028": {"aria":"Building the point: move the opponent from corner to corner with several strokes until an opening appears.","texts":["1","2","3","open","build the point → opening"]},
  "G-029": {"aria":"Setting up the smash: push deep, force the opponent into a high ball, then finish steeply.","texts":["1","push deep","2","3","push → high → smash"]},
  "G-031": {"aria":"Attacking a weakness systematically: play the Speeder again and again into the same weak corner of the opponent.","texts":["weakness","open up"]},
  "G-040": {"aria":"Serve and return in doubles: the right to serve moves in a fixed order through all four players.","texts":["1","2","3","4","serve","in turn: 1 → 2 → 3 → 4"]},
  "G-046": {"aria":"Serving in doubles, simple: from a fixed order one player serves across the neutral zone.","texts":["1","opposing pair","your pair","serve"]},
  "G-055": {"aria":"Reading and using the wind: the wind pushes the Speeder sideways, so you deliberately aim against the drift.","texts":["Wind →","Target","aim against the drift"]},
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

for (const [id, { aria, texts }] of Object.entries(V)) {
  const de = readFileSync(resolve('images', `${id}.svg`), 'utf8');
  if (de.includes('data-quelle="figuren"')) { console.error(`${id} ist generiert (scratchpad/figuren/) — Eintrag aus der Map entfernen`); process.exit(1); }
  let i = 0;
  let en = de.replace(/(<text\b[^>]*>)([^<]*)(<\/text>)/g, (m, open, _inhalt, close) => {
    if (i >= texts.length) { console.error('zu viele <text> in', id); process.exit(1); }
    return `${open}${esc(texts[i++])}${close}`;
  });
  if (i !== texts.length) { console.error(`Anzahl <text> stimmt nicht bei ${id}: ${i} ersetzt, ${texts.length} erwartet`); process.exit(1); }
  en = en.replace(/aria-label="[^"]*"/, `aria-label="${esc(aria)}"`);
  if (en === de) { console.error('KEINE Ersetzung bei', id); process.exit(1); }
  writeFileSync(resolve('images', `${id}.en.svg`), en);
  console.log('en', id);
}
