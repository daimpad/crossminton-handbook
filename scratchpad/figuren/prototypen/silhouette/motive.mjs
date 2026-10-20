// motive.mjs — schreibt die fünf Prototypen der Richtung „Dynamische Silhouette“.
// node motive.mjs [G-002 …]  → <ID>.svg im selben Ordner
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { figur, datei, schatten, schattenDef, spur, speeder, pfeil, dir, add, mul, sub } from './figur.mjs';
import { G001 } from './g001.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
const winkel2d = (v) => (Math.atan2(v[0], v[1]) * 180) / Math.PI;

export const MOTIVE = {
  'G-008': () => {
    const fg = figur({
      ort: [176, 226], H: 22, blick: 82, kamera: 16, neig: 28, kopf: { neig: -10 },
      beinR: { ober: [0.05, -0.55, 1], unter: [0, -1, 0.12], fuss: [0.05, 0.05, 1] },
      beinL: { ober: [-0.05, -1, -0.75], unter: [0, -0.55, -1], fuss: [0, -0.75, 1] },
      armR: { ober: [0.25, -0.35, 1], unter: [0.12, -0.5, 1], hand: [0.1, -0.55, 1] },
      armL: { ober: [-0.15, -0.3, -1], unter: [-0.05, 0.05, -1] },
      schlaeger: { hand: 'R', achse: [0.12, -0.45, 1], flaeche: [0.9, 0.35, 0] },
    });
    const k = fg.punkte.schlaegerKopf;
    const basis = [66, 214];
    const ecke = fg.punkte.spitzeR;
    return datei({
      aria: 'Beinarbeit, Bild 2: der Bewegungskreislauf — mit einem Ausfallschritt in die Ecke den Speeder spielen und auf gebogenem Weg zurück zur zentralen Position in der Mitte.',
      caption: 'zur Ecke ausfallen — zurück zur Mitte', captionY: 266,
      defs: schattenDef('s008') + pfeil('p008'),
      inhalt: [
        `<ellipse class="s-basis" cx="${basis[0]}" cy="${basis[1]}" rx="22" ry="7"/>`,
        `<ellipse class="s-mk" cx="${basis[0]}" cy="${basis[1]}" rx="6" ry="2.4"/>`,
        schatten([fg.punkte.huefte[0] + 6, 227], 70, 7, 's008'),
        fg.svg,
        speeder({ p: add(k, [14, -4]), winkel: -105 }),
        `<path class="s-weg" d="M${ecke[0] + 4},${ecke[1] + 13} C ${ecke[0] - 30},256 ${basis[0] + 70},252 ${basis[0] + 27},${basis[1] + 6}" marker-end="url(#p008)"/>`,
      ].join('\n  '),
    });
  },

  'G-043': () => {
    const hinten = figur({
      ort: [100, 250], H: 25, blick: 152, kamera: 10, neig: 6, kopf: { neig: 16, dreh: 10 },
      beinR: { ober: [0.3, -1, 0.4], unter: [0.03, -1, -0.15], fuss: [0.3, -0.25, 1] },
      beinL: { ober: [-0.3, -1, 0.4], unter: [-0.03, -1, -0.15], fuss: [-0.3, -0.25, 1] },
      armR: { ober: [0.28, -1, 0.05], unter: [0.12, -1, 0.3], hand: [0.1, -0.9, 0.4] },
      armL: { ober: [-0.2, -1, 0.2], unter: [-0.05, -1, 0.45] },
      schlaeger: { hand: 'R', achse: [0.3, -0.75, 0.6], flaeche: [0.9, 0.35, 0] },
    });
    const vorn = figur({
      ort: [198, 202], H: 22.5, blick: 152, kamera: 10, neig: 10, kopf: { neig: -4 },
      beinR: { ober: [0.35, -1, 0.45], unter: [0.03, -1, -0.2], fuss: [0.3, -0.3, 1] },
      beinL: { ober: [-0.35, -1, 0.45], unter: [-0.03, -1, -0.2], fuss: [-0.3, -0.3, 1] },
      armL: { ober: [-0.25, -1, -0.5], unter: [1, -0.1, -0.35], hand: [1, -0.3, -0.3] },
      armR: { ober: [0.28, -1, 0.05], unter: [0.12, -1, 0.3], hand: [0.1, -0.9, 0.4] },
      schlaeger: { hand: 'R', achse: [0.3, -0.75, 0.6], flaeche: [0.9, 0.35, 0] },
    });
    const h = vorn.punkte.handL, kh = hinten.punkte.kopf;
    const finger = [[-0.3, 1], [0.22, 1]].map(([dx, dy]) => `M${h[0] + dx * 3},${h[1] + 2} l${dx * 11},${dy * 12.5}`).join('');
    return datei({
      aria: 'Verständigung im Paar: zwei Doppelpartner von hinten, die sich zwischen den Punkten abstimmen — einer gibt hinter dem Rücken ein verdecktes Handzeichen.',
      caption: 'verdecktes Handzeichen · Verständigung', captionY: 258,
      defs: schattenDef('s043'),
      inhalt: [
        schatten([196, 201], 36, 5, 's043'),
        vorn.svg,
        `<path class="s-zeichen" d="${finger}"/>`,
        schatten([100, 251], 44, 6.5, 's043'),
        `<path class="s-blick" d="M${kh[0] + 13},${kh[1] + 2} Q ${(kh[0] + h[0]) / 2},${(kh[1] + h[1]) / 2 + 24} ${h[0] - 12},${h[1] + 8}"/>`,
        hinten.svg,
      ].join('\n  '),
    });
  },

  'G-002': () => {
    const fg = figur({
      ort: [140, 240], H: 27, blick: 68, kamera: 14, neig: 24, kopf: { neig: -24 },
      beinR: { ober: [0.45, -1, 0.75], unter: [0.08, -1, -0.3], fuss: [0.25, -0.5, 1] },
      beinL: { ober: [-0.45, -1, 0.75], unter: [-0.08, -1, -0.3], fuss: [-0.08, -0.5, 1] },
      armR: { ober: [0.12, -0.45, 0.9], unter: [-0.1, 0.95, 0.65], hand: [-0.1, 1, 0.55] },
      armL: { ober: [-0.12, -0.5, 0.85], unter: [0.2, 0.6, 1], hand: [0.25, 0.6, 1] },
      schlaeger: { hand: 'R', achse: [-0.1, 1, 0.42], flaeche: [0.75, -0.3, 0.6] },
    });
    return datei({
      aria: 'Die Grundposition: Füße etwas mehr als schulterbreit, Knie gebeugt, Gewicht auf den Fußballen, Schläger locker vor dem Körper.',
      caption: 'Knie gebeugt · Gewicht auf den Fußballen', captionY: 264,
      defs: schattenDef('s002'),
      inhalt: [schatten([146, 240], 74, 8, 's002'), fg.svg,
        ...['R', 'L'].map((s) => { const b = fg.punkte[`ballen${s}`]; return `<ellipse class="s-druck" cx="${b[0].toFixed(1)}" cy="${(b[1] + 4.6).toFixed(1)}" rx="6.5" ry="2"/>`; }),
      ].join('\n  '),
    });
  },

  'G-010': () => {
    const fg = figur({
      ort: [106, 246], H: 21, blick: 58, kamera: 6, neig: -5, seit: -20, kopf: { neig: -16 },
      beinR: { ober: [0.1, -1, -0.5], unter: [0, -1, -0.62], fuss: [0, -0.9, 1] },
      beinL: { ober: [-0.05, -1, 0.45], unter: [0, -1, 0.06], fuss: [-0.1, -0.05, 1] },
      armR: { ober: [0.28, 1, 0.12], unter: [0.08, 1, 0.42], hand: [0.02, 1, 0.5] },
      armL: { ober: [0.15, -0.25, 1], unter: [0.05, -0.75, 0.7] },
      schlaeger: { hand: 'R', achse: [0, 1, 0.45], flaeche: [0, -0.45, 1] },
    });
    const k = fg.punkte.schlaegerKopf, s = fg.punkte.schulterR;
    const r = Math.hypot(k[0] - s[0], k[1] - s[1]);
    return datei({
      aria: 'Der Überkopfschlag: hoher Treffpunkt über dem Kopf, gestreckter Schlagarm, die Flugbahn zieht in hohem, tiefem Bogen weit ins gegnerische Feld.',
      caption: 'hoher Treffpunkt · tiefer Bogen ins Feld', captionY: 270,
      defs: schattenDef('s010') + pfeil('p010'),
      inhalt: [
        schatten([118, 244], 58, 6, 's010'),
        spur({ c: s, r, von: winkel2d(sub(k, s)) + 75, bis: winkel2d(sub(k, s)) + 6, breite: 15 }),
        fg.svg,
        speeder({ p: add(k, [16, -10]), winkel: 70 }),
        `<path class="s-bahn" d="M${k[0] + 30},${k[1] - 14} C 222,4 264,40 272,176" marker-end="url(#p010)"/>`,
      ].join('\n  '),
    });
  },
};

const nur = process.argv.slice(2);
for (const [id, bau] of Object.entries({ ...MOTIVE, 'G-001': G001 })) {
  if (nur.length && !nur.includes(id)) continue;
  writeFileSync(join(HIER, `${id}.svg`), bau());
  console.log(join(HIER, `${id}.svg`));
}
