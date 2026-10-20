// Erzeugt die englischen Zwillinge G-XXX.en.svg aus G-XXX.svg: ersetzt aria-label
// und die sichtbare .st-Caption, Geometrie bleibt byte-identisch (Ring-16-Muster).
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const M = {
  'G-003': { cap: 'flat and direct · in front of the body', aria: 'The forehand drive: weight on the front foot, torso turned to the hitting direction, a compact flat contact point clearly in front of the body.' },
  'G-005': { cap: 'speeder drops at hip height', aria: 'Serve, image 1: the non-racket hand releases the speeder at hip height; the racket arm is low, ready to swing forward from below.' },
  'G-006': { cap: 'contact below the racket hand', aria: 'Serve, image 2: the racket meets the speeder from below; at contact the whole speeder is clearly below the level of the racket hand.' },
  'G-007': { cap: 'a small springy hop · onto the balls', aria: 'Footwork, image 1: the split-step — a small springy hop, landing on the balls of both feet, knees bent, ready to push off in any direction.' },
  'G-011': { cap: 'high contact · steeply downward', aria: 'The smash: high contact point above and in front of the head, an aggressive downward swing, the trajectory running steeply and straight into the opposite court.' },
  'G-012': { cap: 'short and soft · drops just behind the line', aria: 'The stop: a big preparation but a soft, decelerated contact — the speeder barely clears the neutral zone and drops just behind the front line.' },
  'G-013': { cap: 'the face brushes · cut and spin', aria: 'The slice: the angled racket face brushes across the speeder instead of hitting it straight; curved motion lines show the cutting path and the resulting spin.' },
  'G-015': { cap: 'early and high — stolen time', aria: 'Taking the speeder early: contact at the highest, earliest point clearly in front of and above the body; a faint lower contact point shows where a slower player would have hit.' },
  'G-016': { cap: 'same preparation — give nothing away', aria: 'Deception, image 1: a deliberately neutral, identical preparation that gives nothing away — full backswing, poised body, no committed shot.' },
  'G-017': { cap: 'one preparation, two options', aria: 'Deception, image 2: the same preparation, with two different shots branching from it — a flat fast drive and a short soft drop; the choice is made only at the last moment.' },
  'G-018': { cap: 'high pace · flat and fast', aria: 'Change of pace, image 1: a fast, hard shot with clear motion blur and a flat, fast trajectory — high pace.' },
  'G-019': { cap: 'broken rhythm · high and soft', aria: 'Change of pace, image 2: an almost identical preparation, now a slow, high, soft shot with a gentle arc — a deliberate break in rhythm.' },
  'G-021': { cap: 'right onto the line · minimal margin', aria: 'Precision to the lines: the speeder lands exactly on a corner line at the very edge of the court; tight target zones and a thin arrow show pinpoint placement with minimal margin.' },
  'G-022': { cap: 'calm and repeatable · under pressure', aria: 'Consistency under pressure: a clean, balanced stroke with calm posture — steady base, quiet head, controlled follow-through, reliably repeatable.' },
  'G-032': { cap: 'fast, light feet on the balls', aria: 'Fast feet: a low, athletic stance on the balls of the feet, small rapid steps suggested by light motion lines at the feet, ready to change direction.' },
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
