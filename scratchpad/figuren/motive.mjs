// motive.mjs — Komposition der generierten Personengrafiken, je Grafik eine Funktion.
// Eine Motivfunktion bekommt die Texte einer Sprache und liefert { datei, figuren, zeichen }:
// die fertige SVG-Datei und die Modelldaten, an denen gate.mjs Balance und Kollision prüft.
// Die Geometrie hängt nie an der Sprache — die vier Fassungen unterscheiden sich nur im Text.
//
// Schreiben nur als Hauptmodul:  node scratchpad/figuren/motive.mjs [G-002 …] [--ziel <ordner>]
// (Standard: images/ im Repo). Beim Import passiert nichts.
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { figur, datei, buehne, add, sub, mul, f, pt, winkel2d, esc, len } from './figur.mjs';
import { speeder, schatten, spur, pfeil, druck, feld, feldProfil, sprechblase } from './bauteile.mjs';
import { G001, G009 } from './hand.mjs';
import { TEXTE, SPRACHEN } from './texte.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));

// Benannte Grundposen (Körperrahmen-Richtungen), damit Motive variieren statt neu zu erfinden.
export const POSEN = {
  bereit: {
    neig: 25, kopf: { neig: -26 }, art: 'stehend',
    beinR: { ober: [0.3, -1, 0.85], unter: [0.04, -1, -0.38], fuss: [0.2, -0.34, 1] },
    beinL: { ober: [-0.3, -1, 0.85], unter: [-0.04, -1, -0.38], fuss: [-0.1, -0.34, 1] },
    armR: { ober: [0.15, -1, 0.5], unter: [-0.55, 0.22, 0.85], hand: [-0.5, 0.35, 0.8] },
    armL: { ober: [-0.15, -1, 0.45], unter: [0.65, 0.4, 0.75], hand: [0.7, 0.45, 0.6], art: 'offen' },
    schlaeger: { hand: 'R', achse: [-0.25, 0.85, 0.45], flaeche: [0.2, -0.45, 1] },
  },
};
const REPO = resolve(HIER, '..', '..');

export const MOTIVE = {
  // Grundposition: Dreiviertelansicht, tief und leicht nach vorn geneigt, Fersen knapp gelöst,
  // Schläger mit dem Kopf nach oben locker vor dem Körper, freie Hand am Schlägerhals.
  'G-002': (t) => {
    const fg = figur({ ...POSEN.bereit, ort: [146, 238], H: 26, blick: 62, kamera: 12 });
    return {
      figuren: [fg], zeichen: [],
      datei: datei({
        aria: t.aria, caption: t.cap, captionY: 268,
        inhalt: [schatten([152, 239], 62, 6.5), fg.svg, druck(fg.punkte.ballenR), druck(fg.punkte.ballenL)].join('\n  '),
      }),
    };
  },
  // Überkopf-Clear: seitlich gestellt, ganz gestreckt, Treffpunkt am höchsten Punkt leicht vor
  // dem Körper; der Oberarm läuft NEBEN dem Kopf. Zwei Bahnen verlassen das Bild in der Luft
  // (12,8 m neutrale Zone, Regel 1.3): defensiv hoch und weit, offensiv flacher und schneller.
  'G-010': (t) => {
    const fg = figur({
      ort: [82, 252], H: 21, blick: 50, kamera: 6, neig: -4, seit: -20, kopf: { neig: -36, dreh: -8 }, art: 'dynamisch',
      beinR: { ober: [0.08, -1, -0.42], unter: [0, -1, -0.55], fuss: [0, -0.9, 1] },
      beinL: { ober: [-0.04, -1, 0.42], unter: [0, -1, 0.08], fuss: [-0.08, -0.06, 1] },
      armR: { ober: [0.42, 1, 0.22], unter: [0.18, 1, 0.38], hand: [0.1, 1, 0.45], vor: true },
      armL: { ober: [-0.15, -0.75, 1], unter: [0.95, 0.25, 0.25], art: 'faust' },
      schlaeger: { hand: 'R', achse: [0.06, 1, 0.38], flaeche: [0, -0.4, 1] },
    });
    const k = fg.punkte.schlaegerKopf, s = fg.punkte.schulterR;
    const r = len(sub(k, s));
    const w = winkel2d(sub(k, s));
    const start = add(k, [17, -5]);
    return {
      figuren: [fg], zeichen: [],
      datei: datei({
        aria: t.aria, caption: t.cap, captionY: 272,
        defs: pfeil('p010') + pfeil('q010', 's-mk', 3.6),
        inhalt: [
          schatten([92, 253], 46, 5),
          spur({ c: s, r, von: w + 70, bis: w + 4, breite: 13 }),
          fg.svg,
          speeder({ p: add(k, [12, -6]), winkel: 72 }),
          `<path class="s-bahn" d="M${pt(start)} C 178,${f(start[1] - 44)} 248,0 296,30" marker-end="url(#p010)"/>`,
          `<path class="s-bahn2" d="M${pt(add(start, [2, 4]))} C 196,${f(start[1] - 10)} 252,38 296,56" marker-end="url(#q010)"/>`,
          `<path class="s-bahn" d="M190,222 L212,222"/><text class="s-lab" x="218" y="225.5">${esc(t.def)}</text>`,
          `<path class="s-bahn2" d="M190,238 L212,238"/><text class="s-lab" x="218" y="241.5">${esc(t.off)}</text>`,
        ].join('\n  '),
      }),
    };
  },
  // Beinarbeit, Bild 2: der Kreislauf auf EINEM Feld in Perspektive. Zentrale Position als
  // Bodenmarke in der Feldmitte, Ausfallschritt in die vordere Vorhand-Ecke (Schlägerbein vorn,
  // Knie über dem Sprunggelenk, Gegenarm nach hinten), Hinweg durchgezogen, Rückweg gestrichelt.
  'G-008': (t) => {
    const b = buehne({ horizont: -30, nahY: 248, mitteX: 150, H0: 22.5, abstand: 4 });
    const st = b.stelle(206, 0.5);
    const fg = figur({
      ort: st.ort, H: st.H, blick: 76, kamera: 16, neig: 18, kopf: { neig: -8 }, art: 'dynamisch',
      beinR: { ober: [0.08, -0.12, 1], unter: [0, -1, 0.06], fuss: [0.06, 0.02, 1] },
      beinL: { ober: [-0.08, -1, -0.8], unter: [0, -0.5, -1], fuss: [0, -0.8, 1] },
      armR: { ober: [0.25, -0.3, 1], unter: [0.1, -0.5, 1], hand: [0.08, -0.55, 1] },
      armL: { ober: [-0.12, -0.35, -1], unter: [-0.04, 0.0, -1], art: 'offen' },
      schlaeger: { hand: 'R', achse: [0.1, -0.5, 1], flaeche: [0.85, 0.3, 0.2] },
    });
    const mitte = b.boden(84, 1.75);
    const sm = b.stelle(84, 1.75);
    const geist = figur({ ...POSEN.bereit, ort: sm.ort, H: sm.H, blick: 70, kamera: 16, geist: true });
    const k = fg.punkte.schlaegerKopf;
    const fuss = fg.punkte.ballenR;
    const hin = `M${pt(add(mitte, [18, -2]))} Q ${pt(b.boden(166, 1.95))} ${pt(b.boden(190, 1.0))}`;
    const rueck = `M${pt(b.boden(166, 0.3))} Q ${pt(b.boden(84, 0.25))} ${pt(add(mitte, [3, 8]))}`;
    return {
      figuren: [fg], zeichen: [],
      datei: datei({
        aria: t.aria, caption: t.cap, captionY: 270,
        defs: pfeil('p008') + pfeil('g008', 's-mkg'),
        inhalt: [
          feld(b, { x0: 4, x1: 280, z0: 0, z1: 3.5, linien: [] }),
          `<ellipse class="s-basis" cx="${f(mitte[0])}" cy="${f(mitte[1])}" rx="${f(20 * b.s(1.55))}" ry="${f(6.4 * b.s(1.55))}"/>`,
          `<ellipse class="s-mk" cx="${f(mitte[0])}" cy="${f(mitte[1])}" rx="5" ry="1.9"/>`,
          geist.svg,
          `<path class="s-wegv" d="${hin}" marker-end="url(#g008)"/>`,
          schatten([fg.punkte.huefte[0] + 2, st.ort[1] + 1], 50 * b.s(0.55), 5.5),
          fg.svg,
          speeder({ p: add(k, [15, 1]), winkel: -95 }),
          `<path class="s-weg" d="${rueck}" marker-end="url(#p008)"/>`,
        ].join('\n  '),
      }),
    };
  },
  // Verständigung im Paar: Profil entlang der Spielrichtung, feste Ordnung vorn/hinten
  // (Regel 7.4/7.5.1). Der Rückraumspieler ruft und nimmt den flachen Mittelball, der
  // Angriffsspieler vorn hebt den Schläger aus der Bahn und lässt ihn vorbei.
  'G-043': (t) => {
    const boden = 238;
    const hinten = figur({
      ort: [64, boden], H: 21, blick: 84, kamera: 8, neig: 14, kopf: { neig: -6 }, koerper: 'b', art: 'dynamisch',
      beinR: { ober: [0.1, -1, 0.62], unter: [0, -1, -0.12], fuss: [0.05, -0.05, 1] },
      beinL: { ober: [-0.1, -1, -0.42], unter: [0, -1, -0.5], fuss: [0, -0.7, 1] },
      armR: { ober: [0.28, -0.25, 1], unter: [0.08, 0.35, 1], hand: [0.05, 0.5, 1] },
      armL: { ober: [-0.4, -0.6, -0.3], unter: [-0.2, -0.4, 0.5], art: 'offen' },
      schlaeger: { hand: 'R', achse: [0.02, 0.6, 1], flaeche: [0.25, 0.1, 1] },
    });
    const vorn = figur({
      ...POSEN.bereit, ort: [232, boden], H: 21, blick: 76, kamera: 8, koerper: 'a', schulter: -18,
      armR: { ober: [0.55, -0.5, -0.35], unter: [0.25, 1, -0.3], hand: [0.15, 1, -0.4] },
      schlaeger: { hand: 'R', achse: [0.15, 1, -0.55], flaeche: [0.9, 0, 0.3] },
    });
    const treff = add(hinten.punkte.schlaegerKopf, [14, -2]);
    const kh = hinten.punkte.kopf;
    return {
      figuren: [hinten, vorn], zeichen: [],
      datei: datei({
        aria: t.aria, caption: t.cap, captionY: 270,
        defs: pfeil('p043'),
        inhalt: [
          feldProfil({ y: boden + 1, x0: 10, x1: 290, marken: [14, 140, 286] }),
          schatten([66, boden + 1], 32, 4.2), schatten([234, boden + 1], 30, 4.2),
          `<path class="s-bahn" d="M296,${f(treff[1] - 30)} Q 200,${f(treff[1] - 40)} ${pt(add(treff, [20, -3]))}" marker-end="url(#p043)"/>`,
          vorn.svg,
          hinten.svg,
          speeder({ p: treff, winkel: -96 }),
          sprechblase({ c: [kh[0] + 4, kh[1] - 52], b: 76, h: 28, spitze: add(kh, [8, -16]), text: esc(t.ruf) }),
        ].join('\n  '),
      }),
    };
  },

  // Blindes Verständnis: derselbe Aufbau wie G-043. Der Angriffsspieler startet zum kurzen Ball,
  // der Rückraumspieler rückt im selben Augenblick in die Mitte nach (Geist = Startposition).
  // Beide Blicklinien gehen nach vorn, keine zum Partner.
  'G-053': (t) => {
    const boden = 238;
    const startH = figur({ ...POSEN.bereit, ort: [36, boden], H: 21, blick: 80, kamera: 8, koerper: 'b', geist: true });
    const hinten = figur({
      ...POSEN.bereit, ort: [86, boden], H: 21, blick: 80, kamera: 8, koerper: 'b', neig: 18, art: 'dynamisch',
      beinR: { ober: [0.12, -1, 0.5], unter: [0, -1, -0.2], fuss: [0.05, -0.3, 1] },
      beinL: { ober: [-0.12, -1, -0.35], unter: [0, -1, -0.35], fuss: [0, -0.6, 1] },
    });
    const vorn = figur({
      ort: [194, boden], H: 21, blick: 82, kamera: 8, neig: 20, kopf: { neig: -6 }, koerper: 'a', art: 'dynamisch',
      beinR: { ober: [0.08, -0.15, 1], unter: [0, -1, 0.06], fuss: [0.06, 0.02, 1] },
      beinL: { ober: [-0.08, -1, -0.8], unter: [0, -0.5, -1], fuss: [0, -0.8, 1] },
      armR: { ober: [0.22, -0.35, 1], unter: [0.08, -0.55, 1], hand: [0.06, -0.6, 1] },
      armL: { ober: [-0.12, -0.35, -1], unter: [-0.04, 0.0, -1], art: 'offen' },
      schlaeger: { hand: 'R', achse: [0.08, -0.55, 1], flaeche: [0.85, 0.3, 0.2] },
    });
    const k = vorn.punkte.schlaegerKopf;
    const blick = (fg, ziel) => { const a = add(fg.punkte.kopf, [9, 1]); return `M${pt(a)} L${pt(ziel)}`; };
    return {
      figuren: [startH, hinten, vorn], zeichen: [],
      datei: datei({
        aria: t.aria, caption: t.cap, captionY: 270,
        defs: pfeil('p053'),
        inhalt: [
          feldProfil({ y: boden + 1, x0: 10, x1: 290, marken: [14, 132, 286] }),
          schatten([94, boden + 1], 30, 4.2), schatten([204, boden + 1], 40, 4.6),
          startH.svg,
          `<path class="s-blick" d="${blick(hinten, [292, hinten.punkte.kopf[1] + 18])}"/>`,
          `<path class="s-blick" d="${blick(vorn, add(k, [18, -8]))}"/>`,
          `<circle class="s-mk" cx="${f(60)}" cy="${f(boden + 12)}" r="2.6"/><path class="s-weg" d="M66,${f(boden + 12)} L104,${f(boden + 12)}" marker-end="url(#p053)"/>`,
          `<circle class="s-mk" cx="${f(176)}" cy="${f(boden + 12)}" r="2.6"/><path class="s-weg" d="M182,${f(boden + 12)} L246,${f(boden + 12)}" marker-end="url(#p053)"/>`,
          hinten.svg,
          vorn.svg,
          speeder({ p: add(k, [16, 2]), winkel: -95 }),
        ].join('\n  '),
      }),
    };
  },
  // Rückhand: Dreiviertelansicht von schräg vorn, Ziel nach LINKS (die Brust zur Betrachterin,
  // der Schlagarm quert sichtbar vor dem Körper). Gewicht auf dem rechten Fuß vorn, Ellbogen auf
  // Brusthöhe statt abgesackt (das wäre das Fehlerbild), Handrücken zum Ziel, freier Arm hinten.
  'G-004': (t) => {
    const fg = figur({
      ort: [168, 244], H: 24, blick: -28, kamera: 9, neig: 14, seit: 10, schulter: -14, kopf: { dreh: -46, neig: 10 }, art: 'dynamisch',
      beinR: { ober: [0.72, -1, 0.35], unter: [0.12, -1, -0.12], fuss: [0.85, -0.05, 0.55] },
      beinL: { ober: [-0.38, -1, -0.25], unter: [-0.2, -1, -0.35], fuss: [-0.25, -0.7, 0.7] },
      armR: { ober: [0.9, -0.65, 0.55], unter: [1, -0.5, 0.3], hand: [1, -0.4, 0.2], vor: true },
      armL: { ober: [-0.6, -0.9, -0.55], unter: [-0.35, -1, -0.3], art: 'offen' },
      schlaeger: { hand: 'R', achse: [1, 0.12, 0.12], flaeche: [1, 0, 0.35] },
    });
    const k = fg.punkte.schlaegerKopf, s = fg.punkte.schulterR;
    const r = len(sub(k, s)), w = winkel2d(sub(k, s));
    return {
      figuren: [fg], zeichen: [],
      datei: datei({
        aria: t.aria, caption: t.cap, captionY: 272,
        defs: pfeil('p004'),
        inhalt: [
          schatten([158, 245], 58, 6),
          spur({ c: s, r: r * 0.95, von: 40, bis: w + 6, breite: 12 }),
          fg.svg,
          speeder({ p: add(k, [-14, 0]), winkel: -90 }),
          `<path class="s-bahn" d="M${pt(add(k, [-30, 0]))} L6,${f(k[1] - 4)}" marker-end="url(#p004)"/>`,
        ].join('\n  '),
      }),
    };
  },

  // Sprung-Smash: Treffen im Scheitel des Sprungs (Füße frei, Schatten unter dem Schwerpunkt),
  // Schere in den Beinen, freier Arm vor der Brust. Die Bahn verlässt das Bild rechts unten
  // (über die 12,8 m), blass daneben die weiche Landung auf beiden Ballen.
  'G-020': (t) => {
    const fg = figur({
      ort: [88, 252], H: 20, blick: 64, kamera: 6, neig: 6, seit: -10, heben: 1.1, kopf: { neig: -28 }, art: 'luft',
      beinR: { ober: [0.05, -1, -0.15], unter: [0, -0.35, -1], fuss: [0, -0.9, -0.2] },
      beinL: { ober: [-0.05, -1, 0.5], unter: [0, -1, 0.05], fuss: [0, -0.9, 0.6] },
      armR: { ober: [0.35, 1, 0.4], unter: [0.12, 1, 0.6], hand: [0.05, 0.85, 1], vor: true },
      armL: { ober: [-0.1, -0.6, 1], unter: [0.95, 0.2, 0.25], art: 'faust' },
      schlaeger: { hand: 'R', achse: [0, 0.75, 1], flaeche: [0, -0.9, 0.6] },
    });
    const land = figur({
      ...POSEN.bereit, ort: [216, 252], H: 20, blick: 64, kamera: 6, geist: true, neig: 18,
      beinR: { ober: [0.3, -1, 0.7], unter: [0.04, -1, -0.32], fuss: [0.2, -0.3, 1] },
      beinL: { ober: [-0.3, -1, 0.7], unter: [-0.04, -1, -0.32], fuss: [-0.1, -0.3, 1] },
    });
    const k = fg.punkte.schlaegerKopf;
    const start = add(k, [16, 6]);
    const sp = fg.punkte.huefte;
    return {
      figuren: [fg, land], zeichen: [],
      datei: datei({
        aria: t.aria, caption: t.cap, captionY: 274,
        defs: pfeil('p020'),
        inhalt: [
          schatten([sp[0] + 4, 253], 30, 3.8),
          land.svg,
          `<path class="s-blick" d="M${pt(add(sp, [12, 6]))} Q ${f(sp[0] + 70)},${f(sp[1] - 20)} ${pt(add(land.punkte.huefte, [-4, -8]))}"/>`,
          fg.svg,
          speeder({ p: add(k, [11, 3]), winkel: 125 }),
          `<path class="s-bahn" d="M${pt(start)} L296,${f(start[1] + 0.62 * (296 - start[0]))}" marker-end="url(#p020)"/>`,
        ].join('\n  '),
      }),
    };
  },
};

// ---------------------------------------------------------------------------
// Schreiben
// ---------------------------------------------------------------------------
export function baue(id, sprache) {
  const bau = MOTIVE[id] ?? { 'G-001': G001, 'G-009': G009 }[id];
  if (!bau) throw new Error(`unbekanntes Motiv ${id}`);
  return bau(TEXTE[id][sprache]);
}
export const IDS = () => [...Object.keys(MOTIVE), ...(G001 ? ['G-001'] : []), ...(G009 ? ['G-009'] : [])].filter((id) => TEXTE[id]).sort();

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const zi = args.indexOf('--ziel');
  const ziel = zi >= 0 ? resolve(args[zi + 1]) : join(REPO, 'images');
  const nur = args.filter((a, i) => a.startsWith('G-') && (zi < 0 || i !== zi + 1));
  mkdirSync(ziel, { recursive: true });
  for (const id of IDS()) {
    if (nur.length && !nur.includes(id)) continue;
    for (const s of SPRACHEN) {
      const r = baue(id, s);
      const name = `${id}${s === 'de' ? '' : '.' + s}.svg`;
      writeFileSync(join(ziel, name), r.datei);
      const w = r.figuren.flatMap((fg) => fg.warnungen);
      if (s === 'de') console.log(`${name}${w.length ? '  ⚠ ' + w.join(' | ') : ''}`);
    }
  }
}
