// Erzeugt die englischen Zwillinge G-XXX.en.svg aus G-XXX.svg: ersetzt aria-label
// und die sichtbare .st-Caption, Geometrie bleibt byte-identisch (Ring-16-Muster).
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const M = {
  'G-011': { cap: 'high contact · steeply downward', aria: 'The smash: high contact point above and in front of the head, an aggressive downward swing, the trajectory running steeply and straight into the opposite court.' },
  'G-013': { cap: 'the face brushes · cut and spin', aria: 'The slice: the angled racket face brushes across the speeder instead of hitting it straight; curved motion lines show the cutting path and the resulting spin.' },
  'G-015': { cap: 'early and high — stolen time', aria: 'Taking the speeder early: contact at the highest, earliest point clearly in front of and above the body; a faint lower contact point shows where a slower player would have hit.' },
  'G-016': { cap: 'same preparation — give nothing away', aria: 'Deception, image 1: a deliberately neutral, identical preparation that gives nothing away — full backswing, poised body, no committed shot.' },
  'G-017': { cap: 'one preparation, two options', aria: 'Deception, image 2: the same preparation, with two different shots branching from it — a flat fast drive and a short soft drop; the choice is made only at the last moment.' },
  'G-021': { cap: 'right onto the line · minimal margin', aria: 'Precision to the lines: the speeder lands exactly on a corner line at the very edge of the court; tight target zones and a thin arrow show pinpoint placement with minimal margin.' },
  'G-033': { cap: 'gentle shoulder circles · mobility', aria: 'Mobility and the shoulder: a gentle shoulder and torso mobility movement, one arm circling along a curved motion arc over the shoulder, relaxed upright posture.' },
  'G-034': { cap: 'push off explosively · jump power', aria: 'Explosiveness and jump power: pushing off explosively from a low, loaded stance into a corner, a strong motion arrow from the driving leg upward and forward.' },
  'G-035': { cap: 'short ground contact · fast rebound', aria: 'Reactive strength: the short, springy ground contact of foot and lower leg — minimal contact time, shown by a small compression arc and a fast rebound arrow.' },
  'G-036': { cap: 'efficient, not hectic', aria: 'Movement economy: on the left a player moving efficiently on a smooth, short path; on the right, faded, a hectic version with many scattered extra motion lines.' },
  'G-047': { cap: 'a quick word · as a pair', aria: 'Agreeing as a pair: two doubles partners from behind briefly agree with a simple cue between points, relaxed posture — basic communication as a pair.' },
  'G-054': { cap: 'playing outdoors · open court', aria: 'Playing outdoors: a player on a court without a net under open sky with a simple ground surface, a relaxed, adaptable stance.' },
  'G-056': { cap: 'against the sun · shield the eyes', aria: 'Sun and glare: a player shields the eyes against a low sun while tracking a high speeder; sun and glare rays in one corner, adjusted head position.' },
  'G-057': { cap: 'wet ground · a wide, secure stance', aria: 'Wet conditions and a secure stance: a player with a widened, cautious stance on damp ground, suggested water droplets and a low, secure centre of gravity.' },
  'G-058': { cap: 'heat · shade, pace yourself', aria: 'Heat: a player paces themselves in the heat, the sun high overhead, a sunshade nearby for the breaks in the shade, a calm and measured posture.' },
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
