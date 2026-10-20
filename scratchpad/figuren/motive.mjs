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
import { figur, datei, buehne, schlaeger3d, add, sub, mul, lerp, norm, dot, f, pt, winkel2d, esc, len, P } from './figur.mjs';
import { speeder, schatten, spur, spurKurve, pfeil, druck, feld, feldProfil, sprechblase, winkel, huetchen } from './bauteile.mjs';
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
// Split-Step-Landung: breiter und tiefer als die Grundposition, Fersen deutlich oben,
// Rumpf etwas weiter vor, Schläger unverändert locker vor dem Körper. Tiefer als ~104° Kniewinkel
// geht es nicht: unter 90° und mit dem Knie vor der Fußspitze verletzte die erste Fassung den
// Gesundheitsrahmen (Leitfaden Abschnitt 6) — und „du landest leicht“ ist keine tiefe Hocke.
// Vorhand-Drive im Treffmoment (Rechtshänder, Ziel = Blickrichtung F): linker Fuß vorn, Gewicht
// vorn, hintere Ferse oben, Brust zum Ziel aufgedreht; Treffpunkt auf Hüfthöhe vor dem Körper,
// Handgelenk ruhig, Schläger in Verlängerung des Unterarms, Fläche senkrecht zum Ziel.
POSEN.drive = {
  neig: 10, kopf: { neig: 12 }, art: 'dynamisch',
  beinL: { ober: [-0.12, -1, 0.78], unter: [0, -1, -0.04], fuss: [-0.12, -0.04, 1] },
  beinR: { ober: [0.2, -1, -0.62], unter: [0.04, -1, -0.62], fuss: [0.3, -0.55, 0.8] },
  armR: { ober: [0.25, -0.65, 0.75], unter: [0.15, -0.3, 1], hand: [0.15, -0.1, 1], vor: true },
  armL: { ober: [-0.45, -0.55, 0.75], unter: [0.6, 0.15, 0.8], hand: [0.7, 0.2, 0.6], art: 'offen' },
  schlaeger: { hand: 'R', achse: [0.7, 0.55, 0.45], flaeche: [-0.45, 0, 0.7] },
};
// Ruhiger Drive: dieselbe Schlagstellung, weniger Vorlage, beide Knie sichtbar gebeugt (das
// hintere stand im harten Drive fast gestreckt) — für Konstanz (G-022) und Funplay (G-062).
POSEN.driveRuhig = {
  ...POSEN.drive, neig: 6,
  beinL: { ober: [-0.12, -1, 0.62], unter: [0, -1, -0.08], fuss: [-0.12, -0.04, 1] },
  beinR: { ober: [0.2, -1, -0.2], unter: [0.04, -1, -0.85], fuss: [0.3, -0.55, 0.8] },
};
POSEN.split = {
  ...POSEN.bereit, neig: 30, kopf: { neig: -28 },
  beinR: { ober: [0.5, -0.75, 1.0], unter: [0.1, -1, -0.45], fuss: [0.3, -0.42, 1] },
  beinL: { ober: [-0.5, -0.75, 1.0], unter: [-0.1, -1, -0.45], fuss: [-0.16, -0.42, 1] },
  armL: { ober: [-0.35, -1, 0.4], unter: [0.4, 0.3, 0.9], hand: [0.5, 0.4, 0.75], art: 'offen' },
};
// Unterhand-Aufschlag (Rechtshänder, Ziel = F), Dossiers G-005/G-006. Bild 1: eben losgelassen, am
// Ende des Ausholens — linker Fuß vorn, beide flach, Gewicht hinten; der Schlagarm hängt wie ein
// Pendel nach hinten unten, der Schläger hinter dem Bein (nichts vor dem Schritt). Bild 2: Treffmoment,
// Gewicht vorn, hintere Ferse oben, Arm fast gestreckt nach vorn, der Schläger hängt steil wie ein
// Pendel, der Kopf knapp vor und unter der Hand. Die Fläche hat Vorrang: ihre Normale zeigt 22° über
// der Waagerechten zum Ziel. „30–45° unter der Waagerechten“ UND „15–20° geöffnet“ (Dossier) gehen
// in der Seitenansicht nicht zusammen — mit Normale in der Zielebene steht der Schaft auf dem
// Schirm bei 90° minus Öffnungswinkel.
POSEN.aufschlagAus = {
  neig: 5, kopf: { neig: 20 }, art: 'stehend',
  beinL: { ober: [-0.12, -1, 0.4], unter: [0, -1, 0.14], fuss: [-0.12, -0.04, 1] },
  beinR: { ober: [0.12, -1, 0.05], unter: [0.04, -1, -0.34], fuss: [0.25, -0.04, 1] },
  armR: { ober: [0.1, -1, -0.22], unter: [0.05, -1, -0.32], hand: [0.04, -1, -0.36] },
  armL: { ober: [-0.1, -0.9, 0.42], unter: [0.05, -0.55, 0.83], hand: [0.05, -0.75, 0.66], art: 'offen' },
  schlaeger: { hand: 'R', achse: [0.12, -0.9, -0.42], flaeche: [0.5, 0.42, -0.75] },
};
POSEN.aufschlagTreff = {
  neig: 12, kopf: { neig: 24 }, art: 'dynamisch',
  beinL: { ober: [-0.12, -1, 0.1], unter: [0, -1, -0.05], fuss: [-0.12, -0.04, 1] },
  beinR: { ober: [0.12, -1, -0.18], unter: [0.04, -1, -0.6], fuss: [0.3, -0.4, 0.85] },
  armR: { ober: [0.15, -0.9, 0.42], unter: [0.1, -0.8, 0.6], hand: [0.1, -0.75, 0.66], vor: true },
  armL: { ober: [-0.35, -0.85, -0.25], unter: [-0.2, -0.55, -0.6], hand: [-0.1, -0.5, -0.7], art: 'offen' },
  schlaeger: { hand: 'R', achse: [0.24, -0.9, 0.36], flaeche: [0, 0.37, 0.93] },
};
const REPO = resolve(HIER, '..', '..');

// Früherer Schläger an der Schlaghand einer Figur, in Körperrahmen-Richtungen (Ausholen, Schwungweg).
// Er trägt die Aussage allein, darum als volle Kontur mit 3:1, nicht blass.
// Wie in figur(): flaeche muss senkrecht zur achse stehen, sonst zeichnet schlaeger3d eine andere Fläche.
const geistSchlaeger = (fg, achse, flaeche) => {
  const schief = dot(norm(achse), norm(flaeche));
  if (Math.abs(schief) > 0.2) fg.warnungen.push(`Geisterschläger: Fläche schief zur Achse (${f(schief)})`);
  return schlaeger3d({
    griff: fg.welt.arme.R.griff, achse: norm(fg.welt.oben.w(achse)), flaeche: norm(fg.welt.oben.w(flaeche)), proj: fg.proj, H: fg.H, geist: 'kontur',
  });
};
// Taktleiste: kleine Speeder auf einer Linie — gleichmäßig (schneller Takt) oder mit Lücke (Taktbruch)
const taktleiste = (xs, y) => `<path class="s-boden" d="M${f(xs[0] - 16)},${f(y + 5)}L${f(xs[xs.length - 1] + 16)},${f(y + 5)}"/>` +
  xs.map((x) => speeder({ p: [x, y], winkel: 90, s: 0.62 })).join('');

// Arm zu einem Zielpunkt führen (Zwei-Gelenk-Kette, Ellbogen zur Polrichtung): liefert ober/unter
// im Körperrahmen der Figur. ziel und pol sind Weltvektoren; die Schulter kommt aus einem ersten
// Durchlauf derselben Pose (fg). Reicht der Arm nicht, wird er gestreckt zum Ziel gezeigt.
const armZiel = (fg, seite, ziel, pol) => {
  const o = fg.welt.oben, S = fg.welt.arme[seite].S, a = P.oberarm, b = P.unterarm;
  const zu = sub(ziel, S), d = Math.min(len(zu), a + b - 1e-6), u = norm(zu);
  const v = norm(sub(pol, mul(u, dot(pol, u))));
  const ca = (a * a + d * d - b * b) / (2 * a * d), sa = Math.sqrt(Math.max(0, 1 - ca * ca));
  const E = add(S, add(mul(u, a * ca), mul(v, a * sa)));
  const W = add(S, mul(u, d));
  const rahmen = (x) => [dot(x, o.R), dot(x, o.U), dot(x, o.F)];
  return { ober: rahmen(norm(sub(E, S))), unter: rahmen(norm(sub(W, E))) };
};

// Gemeinsame Bühne der Aufschlag-Sequenz: dieselbe Kamera und derselbe Boden in Bild 1 und 2.
// fall: Abstand des Fallwegs vor dem Handpunkt (unter den Fingerspitzen) — G-006 trifft genau dort.
const AUFSCHLAG = { ort: [126, 244], H: 24, blick: 72, kamera: 9, fall: 7 };
// Bodenlinie mit der Aufschlaglinie als Marke knapp vor dem vorderen Fuß aus Bild 1
const aufschlagBoden = (fg) => {
  const y = fg.punkte.boden + 0.5, x = fg.punkte.spitzeL[0] + 14;
  return `<path class="s-boden" d="M18,${f(y)}L284,${f(y)}"/><path class="s-linie" d="M${f(x)},${f(y - 5)}L${f(x)},${f(y + 5)}"/>`;
};

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
  // Beinarbeit, Bild 1: der Split-Step, gezeigt in der LANDUNG — auf sie kommt es an. Gegenüber
  // der Grundposition (G-002) breiter, tiefer, Fersen deutlich oben. Der kleine Federweg steht als
  // kurzer Auf-ab-Pfeil daneben (ein großer Sprungpfeil widerspräche „klein“), die vier Winkel am
  // Boden sagen: aus dieser Landung geht es in jede Richtung.
  'G-007': (t) => {
    const fg = figur({ ...POSEN.split, ort: [146, 230], H: 26, blick: 70, kamera: 12 });
    const m = lerp(fg.punkte.ballenR, fg.punkte.ballenL, 0.5), y = 233;
    // Vier kurze Pfeile auf den Diagonalen der Bodenebene, von den Füßen weg: vorn/hinten lag der
    // hintere hinter dem Schienbein, und flachgedrückte Winkel lasen sich als Eckklammern.
    const wink = [[1, 1], [1, -1], [-1, -1], [-1, 1]]
      .map(([sx, sy]) => `<path class="s-rot" d="M${f(m[0] + sx * 46)},${f(y + sy * 7)}L${f(m[0] + sx * 66)},${f(y + sy * 11.5)}" marker-end="url(#p007a)"/>`).join('');
    // zwei Hälften statt marker-start: orient="auto" ließe beide Spitzen nach oben zeigen
    const pf = [92, 168], auf = (r) => `M${f(pf[0])},${f(pf[1] + r * 2)}L${f(pf[0])},${f(pf[1] + r * 15)}`;
    return {
      figuren: [fg], zeichen: [],
      datei: datei({
        aria: t.aria, caption: t.cap, captionY: 270,
        defs: pfeil('p007a'),
        inhalt: [
          schatten([m[0] + 2, y], 66, 6.5),
          wink,
          fg.svg, druck(fg.punkte.ballenR), druck(fg.punkte.ballenL),
          `<path class="s-rot" d="${auf(-1)}" marker-end="url(#p007a)"/>`, `<path class="s-rot" d="${auf(1)}" marker-end="url(#p007a)"/>`,
        ].join('\n  '),
      }),
    };
  },
  // Schnelle Füße: dieselbe Landung in der Feldmitte, dann der Antritt zum Hütchen in der
  // vorderen linken Ecke und zurück (Übungsteil). Die Spur aus vielen kleinen Kontakten ist die
  // Aussage — kurze, schnelle Bodenkontakte statt weniger großer Schritte.
  'G-032': (t) => {
    // Maßstab: H ≥ 20 und die Figur gut 45 % der Bildhöhe — das Feld ist dafür vorn angeschnitten
    const b = buehne({ horizont: -12, nahY: 300, mitteX: 150, H0: 31, abstand: 4 });
    const st = b.stelle(150, 1.7);
    const fg = figur({ ...POSEN.split, ort: st.ort, H: st.H, blick: 58, kamera: 16 });
    const ecken = [[30, 0.9], [270, 0.9], [30, 3.4], [270, 3.4]].map(([x, z]) => b.boden(x, z));
    const ziel = ecken[0];
    // Kontakte im Wechsel links/rechts der Laufachse, zum Ziel hin etwas größer (näher)
    const kontakte = [];
    // Die Kontakte liegen beiderseits der Laufachse; die Lauflinie folgt genau dieser Achse.
    const von = b.boden(128, 1.45), bis = add(ziel, [18, -4]), n = 7;
    const achse = norm(sub(bis, von)), quer = [-achse[1], achse[0]];
    for (let i = 0; i < n; i++) {
      const t0 = (i + 0.6) / (n + 0.4), p0 = add(lerp(von, bis, t0), mul(quer, i % 2 ? 7 : -7));
      kontakte.push(`<ellipse class="s-druck" cx="${f(p0[0])}" cy="${f(p0[1])}" rx="${f(3.6 + t0 * 1.6)}" ry="${f(1.4 + t0 * 0.6)}"/>`);
    }
    // Rückweg grau gestrichelt (Laufwege in --tinte-3), Blau bleibt den Kontakten
    const rueck = `M${pt(add(ziel, [24, 10]))} Q ${pt(b.boden(118, 0.75))} ${pt(b.boden(144, 1.3))}`;
    const hin = `M${pt(von)} L${pt(bis)}`;
    return {
      figuren: [fg], zeichen: [],
      datei: datei({
        aria: t.aria, caption: t.cap, captionY: 272,
        defs: pfeil('g032', 's-mkg', 3.8),
        inhalt: [
          feld(b, { x0: 10, x1: 290, z0: 0.6, z1: 3.8, linien: [] }),
          `<ellipse class="s-basis" cx="${f(b.boden(150, 1.7)[0])}" cy="${f(b.boden(150, 1.7)[1])}" rx="${f(26 * b.s(1.7))}" ry="${f(8 * b.s(1.7))}"/>`,
          ...ecken.slice(1).map((e, i) => huetchen(e, 12 * b.s([0.9, 3.4, 3.4][i]))),
          `<path class="s-wegv" d="${hin}" marker-end="url(#g032)"/>`,
          ...kontakte,
          `<path class="s-wegg" d="${rueck}" marker-end="url(#g032)"/>`,
          huetchen(ziel, 12 * b.s(0.9)),
          schatten([fg.punkte.huefte[0] + 2, st.ort[1] + 1], 44 * b.s(1.7), 5),
          fg.svg, druck(fg.punkte.ballenR), druck(fg.punkte.ballenL),
        ].join('\n  '),
      }),
    };
  },
  // Vorhand-Drive: Dreiviertel von schräg vorn auf der Schlägerseite, Ziel rechts. Kurzer, flacher
  // Bogen auf Hüfthöhe (kein großes Ausholen, vgl. TEN-Delta), Treffpunkt vor dem Körper, die
  // Bahn beginnt am Speeder und verlässt das Bild flach nach rechts.
  'G-003': (t) => {
    // Gewicht auf dem vorderen Fuß: vorderes Bein steiler, Hüfte näher über der vorderen Ferse
    const fg = figur({ ...POSEN.drive, ort: [108, 246], H: 24, blick: 80, kamera: 9,
      beinL: { ober: [-0.12, -1, 0.5], unter: [0, -1, 0.04], fuss: [-0.12, -0.04, 1] },
      beinR: { ober: [0.2, -1, -0.78], unter: [0.04, -1, -0.5], fuss: [0.3, -0.55, 0.8] } });
    const k = fg.punkte.schlaegerKopf, h = fg.punkte.huefte;
    // Speeder knapp vor der Fläche, Kappe voran: eben getroffen und schon unterwegs
    const sp = add(k, [24, 0]);
    return {
      figuren: [fg], zeichen: [],
      datei: datei({
        aria: t.aria, caption: t.cap, captionY: 272,
        defs: pfeil('p003'),
        inhalt: [
          schatten([116, 247], 60, 6),
          spurKurve({ p0: add(h, [-34, 6]), c: add(h, [6, 18]), p1: add(k, [-6, 4]), breite: 12 }),
          fg.svg,
          speeder({ p: sp, winkel: 90 }),
          `<path class="s-bahn" d="M${pt(add(sp, [12, 0]))} L296,${f(sp[1] - 6)}" marker-end="url(#p003)"/>`,
        ].join('\n  '),
      }),
    };
  },
  // Tempowechsel, Bild 1: der gewohnte schnelle Takt. Harter Drive im Durchschwung: der Arm ist
  // über den Treffpunkt hinaus nach vorn gezogen, die Spur beginnt hinter der Hüfte wie in G-019
  // und läuft an der Stelle des Treffpunkts vorbei weiter (keine Speedlines, Leitfaden). Der
  // Speeder ist schon weit voraus, die Bahn flach; die Taktleiste darunter gleichmäßig. Beine und
  // Rumpf deckungsgleich mit G-019, nur Schlagarm und Schläger unterscheiden sich.
  'G-018': (t) => {
    const fg = figur({ ...POSEN.drive, ort: [100, 236], H: 22, blick: 80, kamera: 9,
      armR: { ober: [0.3, -0.5, 0.85], unter: [0.1, -0.1, 1], hand: [0.05, 0, 1], vor: true },
      schlaeger: { hand: 'R', achse: [0.62, 0.55, 0.56], flaeche: [-0.67, 0, 0.74] } });
    const k = fg.punkte.schlaegerKopf, h = fg.punkte.huefte, sp = add(k, [40, -2]);
    // langer Schwungweg: von hinter der Hüfte durch den Treffpunkt bis in den Durchschwung
    const weg = spurKurve({ p0: add(h, [-46, 4]), c: add(h, [4, 26]), p1: add(k, [-6, 6]), breite: 13 });
    return {
      figuren: [fg], zeichen: [],
      datei: datei({
        aria: t.aria, caption: t.cap, captionY: 274,
        defs: pfeil('p018'),
        inhalt: [
          schatten([106, 237], 54, 5.5),
          weg,
          fg.svg,
          speeder({ p: sp, winkel: 90 }),
          `<path class="s-bahn" d="M${pt(add(sp, [12, 0]))} L296,${f(sp[1] + 4)}" marker-end="url(#p018)"/>`,
          taktleiste([112, 142, 172, 202], 254),
        ].join('\n  '),
      }),
    };
  },
  // Tempowechsel, Bild 2: gleiche Bewegung, erst im Treffpunkt das Tempo herausgenommen. Die Spur
  // beginnt hinter der Hüfte wie in G-018 (gleiche Vorbereitung) und endet am Schläger: die Hand
  // bleibt stehen, die Fläche ist sichtbar nach oben geöffnet. Die Bahn steigt weich und verlässt
  // das Bild oben rechts. Die Taktleiste: derselbe Grundtakt wie in G-018, dann die Lücke.
  'G-019': (t) => {
    const fg = figur({ ...POSEN.drive, ort: [100, 236], H: 22, blick: 80, kamera: 9,
      // Schläger wie im Drive, nur die Fläche um die Achse ~40° nach oben gedreht
      schlaeger: { hand: 'R', achse: [0.7, 0.55, 0.45], flaeche: [-0.71, 0.53, 0.45] } });
    const k = fg.punkte.schlaegerKopf, h = fg.punkte.huefte, sp = add(k, [20, -16]);
    // dieselbe Vorbereitung, im Treffpunkt abgebremst: die Spur endet am Schlägerkopf
    const weg = spurKurve({ p0: add(h, [-46, 4]), c: add(h, [4, 26]), p1: add(k, [-6, 6]), breite: 13 });
    return {
      figuren: [fg], zeichen: [],
      datei: datei({
        aria: t.aria, caption: t.cap, captionY: 274,
        defs: pfeil('p019'),
        inhalt: [
          schatten([106, 237], 54, 5.5),
          weg,
          fg.svg,
          // Kappe voran entlang des Bahnanfangs (Tangente zum ersten Kontrollpunkt)
          speeder({ p: sp, winkel: winkel2d([41, -61]) }),
          `<path class="s-bahn" d="M${pt(add(sp, [9, -9]))} C ${f(sp[0] + 50)},${f(sp[1] - 70)} 250,16 296,20" marker-end="url(#p019)"/>`,
          taktleiste([112, 142, 172, 232], 254),
        ].join('\n  '),
      }),
    };
  },
  // Konstanz unter Höchstdruck: ein bewusst unspektakulärer, lehrbuchhafter Drive. Stabile Basis,
  // beide Knie gebeugt, Rumpf ruhig; drei fast deckungsgleiche Bahnen enden in EINER engen
  // Zielmarke (Wiederholbarkeit), die Tafel „15:15“ ist der Druck (Regel 3.2/3.4).
  'G-022': (t) => {
    const fg = figur({ ...POSEN.driveRuhig, ort: [74, 246], H: 23, blick: 80, kamera: 9 });
    const k = fg.punkte.schlaegerKopf, sp = add(k, [22, 0]);
    const ziel = [272, sp[1] - 6];
    // drei fast deckungsgleiche Bahnen, alle gepunktet wie jede Flugbahn (durchgezogen lasen sich
    // die grauen als Bogen und Sehne); in der Mitte nur leicht gefächert, am Ziel wieder beisammen
    const bahnen = [[-8, 's-bahng'], [8, 's-bahng'], [0, 's-bahn']].map(([d, kls]) =>
      `<path class="${kls}" d="M${pt(add(sp, [12, 0]))} Q ${f((sp[0] + ziel[0]) / 2)},${f(sp[1] - 18 + d)} ${pt(add(ziel, [-13, 0]))}"/>`).join('');
    // Bruchzeichen über dem Bündel: das Ziel liegt im Feld gegenüber, nicht zwei Meter vor ihr
    const bx = ziel[0] - 36, by = ziel[1] - 5;
    const bruch = `<path class="s-luecke" d="M${f(bx - 2.5)},${f(by - 10)}L${f(bx + 2.5)},${f(by + 10)}"/>` +
      `<path class="s-bruch" d="M${f(bx - 7)},${f(by - 10)}L${f(bx - 2)},${f(by + 10)}M${f(bx + 2)},${f(by - 10)}L${f(bx + 7)},${f(by + 10)}"/>`;
    return {
      figuren: [fg], zeichen: [],
      datei: datei({
        aria: t.aria, caption: t.cap, captionY: 274,
        inhalt: [
          `<rect class="s-tafel" x="220" y="18" width="62" height="28" rx="6"/><text class="s-zahl" x="251" y="37">${esc(t.stand)}</text>`,
          schatten([80, 247], 54, 5.5),
          fg.svg,
          speeder({ p: sp, winkel: 90 }),
          bahnen, bruch,
          `<circle class="s-ring" cx="${f(ziel[0])}" cy="${f(ziel[1])}" r="11"/><circle class="s-mk" cx="${f(ziel[0])}" cy="${f(ziel[1])}" r="3.4"/>`,
        ].join('\n  '),
      }),
    };
  },
  // Funplay: zwei Spielende auf mittlerer Distanz, ohne Feld (nur Bodenlinie). Die Distanz passt
  // im Figurmaßstab nicht ins Bild, darum ist die Bodenlinie in der Mitte gebrochen wie in G-012.
  // Links ein ruhiger Drive im Treffmoment (Kontrolle vor Kraft, nicht die Pose des harten Drives),
  // rechts die Partnerin in Bereitschaft. Hin flach und ruhig, zurück gestrichelt; darüber eine
  // Strichliste als sprachneutraler Kontaktzähler („zählt die Kontakte am Stück“).
  'G-062': (t) => {
    const links = figur({ ...POSEN.driveRuhig, ort: [44, 246], H: 20, blick: 80, kamera: 8 });
    // Fläche zum Betrachter gedreht: auf der Kante läse sich der Schläger in dieser Ansicht als Strich
    const rechts = figur({ ...POSEN.bereit, ort: [266, 246], H: 20, blick: -66, kamera: 8, koerper: 'b',
      schlaeger: { ...POSEN.bereit.schlaeger, flaeche: [-0.86, -0.42, 0.31] } });
    const a = links.punkte.schlaegerKopf, b = rechts.punkte.schlaegerKopf;
    const scheitel = Math.min(a[1], b[1]) - 30;
    const hin = [add(a, [12, -2]), [(a[0] + b[0]) / 2, scheitel], add(b, [-10, -4])];
    const q = (p0, c, p1, t0) => { const u = 1 - t0; return [u * u * p0[0] + 2 * u * t0 * c[0] + t0 * t0 * p1[0], u * u * p0[1] + 2 * u * t0 * c[1] + t0 * t0 * p1[1]]; };
    const sp = q(...hin, 0.34), sp2 = q(...hin, 0.4);
    const w = winkel2d(sub(sp2, sp));
    const zurueck = `M${pt(add(b, [-12, 10]))} Q ${f((a[0] + b[0]) / 2)},${f(scheitel + 30)} ${pt(add(a, [16, 10]))}`;
    // Strichliste: ein Fünferbündel und zwei Striche
    const xs = 126, ys = 34;
    let strich = '';
    for (let i = 0; i < 4; i++) strich += `M${xs + i * 7},${ys}L${xs + i * 7},${ys + 18}`;
    strich += `M${xs - 4},${ys + 15}L${xs + 25},${ys + 3}`;
    for (let i = 0; i < 2; i++) strich += `M${xs + 38 + i * 7},${ys}L${xs + 38 + i * 7},${ys + 18}`;
    return {
      figuren: [links, rechts], zeichen: [],
      datei: datei({
        aria: t.aria, caption: t.cap, captionY: 274,
        defs: pfeil('p062') + pfeil('q062', 's-mk', 3.6),
        inhalt: [
          `<path class="s-boden" d="M4,246.5L144,246.5M156,246.5L296,246.5"/>`,
          `<path class="s-bruch" d="M141,252.5L147,240.5M153,252.5L159,240.5"/>`,
          schatten([48, 247], 44, 4.5), schatten([266, 247], 40, 4.5),
          `<path class="s-strich" d="${strich}"/>`,
          links.svg, rechts.svg,
          `<path class="s-bahn" d="M${pt(hin[0])} Q ${pt(hin[1])} ${pt(hin[2])}" marker-end="url(#p062)"/>`,
          `<path class="s-bahn2" d="${zurueck}" marker-end="url(#q062)"/>`,
          speeder({ p: sp, winkel: w }),
        ].join('\n  '),
      }),
    };
  },
  // Stopp: Profil quer zur Spielrichtung. Links der Spieler im Treffmoment, blass dahinter der
  // volle Ausholweg des harten Drives (dieselbe Vorbereitung ist die Täuschung), der Ausschwung
  // endet früh. Die neutrale Zone ist gestaucht (Bruchzeichen, 12,8 m); kein senkrechter Strich,
  // der wie ein Netz wirkt — Feldlinien sind nur Bodenmarken. Rechts kleiner und blasser der
  // Gegner tief an seiner Grundlinie; die Bahn steigt flach, fällt steil und endet AM BODEN
  // knapp hinter seiner Frontlinie.
  'G-012': (t) => {
    const y = 232;
    const fg = figur({ ...POSEN.drive, ort: [84, y], H: 20, blick: 84, kamera: 7, neig: 10,
      armR: { ober: [0.25, -0.7, 0.7], unter: [0.12, -0.35, 1], hand: [0.12, -0.15, 1], vor: true },
      schlaeger: { hand: 'R', achse: [0.75, 0.6, 0.12], flaeche: [-0.45, 0.4, 0.8] } });
    // Ausholstellung als blasse Figur am selben Ort: deckungsgleich bis auf Arm und Schläger, nur
    // die sind zu sehen. Der Schläger trägt die Aussage und bekommt die volle Kontur (3:1).
    const ausPose = { ...POSEN.drive, ort: [84, y], H: 20, blick: 84, kamera: 7, neig: 10, geist: true,
      armR: { ober: [0.45, -0.9, -0.3], unter: [0.3, -0.45, -0.85], hand: [0.3, -0.35, -0.9] }, schlaeger: undefined };
    const ausFig = figur(ausPose);
    // ausgeholt auf Hüft- bis Brusthöhe wie der Drive (G-003), nicht auf Kopfhöhe
    const aus = ausFig.svg + geistSchlaeger(ausFig, [0.45, 0.05, -0.9], [0.84, 0.33, 0.44]);
    const gegner = figur({ ...POSEN.bereit, ort: [266, y], H: 15, blick: -84, kamera: 7, koerper: 'b', neig: 20,
      schlaeger: { ...POSEN.bereit.schlaeger, flaeche: [-0.86, -0.42, 0.31] } });
    const k = fg.punkte.schlaegerKopf, sp = add(k, [22, -10]);
    const vorn = 196, ziel = [212, y];
    const linieEigen = 124, bruch = 158;
    // asymmetrisch: lange flache Steigung, Scheitel über der Zone, dann steiler Fall auf den Boden
    const bahn = `M${pt(add(sp, [10, -4]))} C ${f(sp[0] + 48)},${f(sp[1] - 34)} ${f(ziel[0] - 14)},${f(sp[1] - 44)} ${pt(ziel)}`;
    const marken = [8, linieEigen, vorn, 288];
    const bruchZ = `M${bruch - 9},${y + 6}L${bruch - 3},${y - 6}M${bruch + 3},${y + 6}L${bruch + 9},${y - 6}`;
    return {
      figuren: [fg, gegner], zeichen: [],
      datei: datei({
        aria: t.aria, caption: t.cap, captionY: 272,
        defs: pfeil('p012'),
        inhalt: [
          `<path class="s-boden" d="M4,${y}L${bruch - 6},${y}M${bruch + 6},${y}L296,${y}${marken.map((x) => `M${x},${y - 4}L${x},${y + 4}`).join('')}"/>`,
          `<path class="s-bruch" d="${bruchZ}"/>`,
          `<text class="s-lab" x="${bruch}" y="${y + 20}" text-anchor="middle">${esc(t.zone)}</text>`,
          `<ellipse class="s-basis" cx="${f(ziel[0])}" cy="${y}" rx="15" ry="3.2"/>`,
          schatten([88, y + 1], 46, 4.5), schatten([266, y + 1], 30, 3.5),
          `<g class="s-fern">${gegner.svg}</g>`,
          aus,
          fg.svg,
          speeder({ p: sp, winkel: 130 }),
          `<path class="s-bahn" d="${bahn}" marker-end="url(#p012)"/>`,
        ].join('\n  '),
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
      schlaeger: { hand: 'R', achse: [0.02, 0.6, 1], flaeche: [0.48, -0.757, 0.444] },
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

  // Sich absprechen: dieselbe Kamera wie G-043/G-053 (Profil entlang der Spielrichtung, links die
  // Grundlinie). Vor dem Aufschlag, einander zugewandt: der Rückraumspieler steht hinter der
  // Aufschlaglinie, hält den Speeder und sagt in einem Satz das Wichtigste (Regel 7.4: er schlägt
  // auf); der Angriffsspieler steht vor der Linie, die Füße schon nach vorn, und bestätigt mit
  // Nicken und Daumen hoch.
  'G-047': (t) => {
    const boden = 238;
    const hinten = figur({
      ort: [86, boden], H: 21, blick: 58, kamera: 8, neig: 4, seit: 3, kopf: { dreh: 12, neig: -4 }, koerper: 'b',
      beinR: { ober: [0.12, -1, 0.22], unter: [0.02, -1, -0.3], fuss: [0.15, -0.05, 1] },
      beinL: { ober: [-0.12, -1, 0.2], unter: [-0.02, -1, -0.12], fuss: [-0.1, -0.05, 1] },
      armR: { ober: [0.12, -1, 0.3], unter: [0.05, -0.9, 0.45], hand: [0.05, -0.8, 0.6] },
      armL: { ober: [-0.1, -0.92, 0.3], unter: [0.12, 0.85, 0.55], hand: [0.1, 0.6, 0.8] },
      schlaeger: { hand: 'R', achse: [0.1, -0.85, 0.55], flaeche: [0.98, 0.115, 0] },
    });
    const vorn = figur({
      // Drehung verteilt auf Füße, Becken, Rumpf und Hals (mit −95° allein im Rumpf wurde die Figur
      // bauchig); der Daumen hoch steht neben dem Rumpf — die offene Hand zeigte genau auf den
      // Speeder und las sich wie „gib her“ (Prüfung Welle 5)
      ort: [206, boden], H: 21, blick: 20, schulter: -60, kamera: 8, neig: 4, kopf: { dreh: -30, neig: 12 }, koerper: 'a',
      beinR: { ober: [0.12, -1, 0.22], unter: [0.02, -1, -0.12], fuss: [-0.15, -0.05, 1] },
      beinL: { ober: [-0.12, -1, 0.2], unter: [-0.02, -1, -0.12], fuss: [-0.65, -0.05, 0.75] },
      armR: { ober: [0.15, -1, 0.1], unter: [0.05, -0.95, 0.3] },
      armL: { ober: [0.2, -0.85, 0.55], unter: [0.85, 0.5, 0.3], hand: [0.85, 0.5, 0.3], art: 'daumen', vor: true },
      schlaeger: { hand: 'R', achse: [0.05, -0.9, 0.4], flaeche: [1, 0.055, 0] },
    });
    const kh = hinten.punkte.kopf, sp = add(hinten.punkte.handL, [0, 11]);
    const fuss = Math.max(vorn.punkte.spitzeR[0], vorn.punkte.spitzeL[0]);
    return {
      figuren: [hinten, vorn], zeichen: [],
      datei: datei({
        aria: t.aria, caption: t.cap, captionY: 270,
        defs: pfeil('p047', 's-mkg'),
        inhalt: [
          feldProfil({ y: boden + 1, x0: 10, x1: 290, marken: [14, 140, 286] }),
          schatten([86, boden + 1], 30, 4.2), schatten([206, boden + 1], 30, 4.2),
          `<path class="s-wegg" d="M${f(fuss + 6)},${f(boden + 9)}L${f(278)},${f(boden + 9)}" marker-end="url(#p047)"/>`,
          vorn.svg,
          hinten.svg,
          speeder({ p: sp, winkel: 0 }),
          sprechblase({ c: [kh[0] + 30, kh[1] - 44], b: 60, h: 30, spitze: add(kh, [9, -14]), schall: false, zeilen: [1, 0.62] }),
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
          feldProfil({ y: boden + 1, x0: 10, x1: 290, marken: [14, 140, 286] }),
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
  // Aufschlag, Bild 1: der Speeder fällt. Seitlich, Ziel rechts. Die freie Hand hat ihn auf Hüfthöhe
  // vor dem Körper eben losgelassen, er fällt Kappe voran senkrecht (kurzer Fallweg). Ein dünner
  // Bogenpfeil an der Schlägerkopfbahn zeigt den kommenden Schwung von hinten unten nach vorn. Am
  // Boden die Aufschlaglinie als Marke vor dem vorderen Fuß — beide Füße dahinter (Regel 5.1.2).
  'G-005': (t) => {
    const fg = figur({ ...POSEN.aufschlagAus, ort: AUFSCHLAG.ort, H: AUFSCHLAG.H, blick: AUFSCHLAG.blick, kamera: AUFSCHLAG.kamera });
    // eben losgelassen: unter den Fingerspitzen, eine halbe Speederlänge Luft bis zum Korb
    const hand = fg.punkte.handL, sp = add(hand, [AUFSCHLAG.fall, 25]), k = fg.punkte.schlaegerKopf;
    // nur der Anfang des kommenden Schwungs, hinter dem hinteren Bein — er kreuzt kein Schienbein
    const schien = Math.min(fg.punkte.fersR[0], fg.punkte.knieR[0]) - 7;
    const bogen = `M${pt(add(k, [3, 8]))} Q ${f(k[0] + 2)},${f(k[1] + 26)} ${f(schien)},${f(k[1] + 28)}`;
    const fuss = (fg.punkte.fersR[0] + fg.punkte.spitzeL[0]) / 2;
    return {
      figuren: [fg], zeichen: [],
      datei: datei({
        aria: t.aria, caption: t.cap, captionY: 274,
        defs: pfeil('p005') + pfeil('q005', 's-mkg', 4),
        inhalt: [
          aufschlagBoden(fg),
          schatten([fuss, fg.punkte.boden + 1], 43, 5.5),
          `<path class="s-bahnz" d="${bogen}" marker-end="url(#q005)"/>`,
          fg.svg,
          speeder({ p: sp, winkel: 0 }),
          `<path class="s-bahn" d="M${pt(add(sp, [0, 11]))} L${pt(add(sp, [0, 26]))}" marker-end="url(#p005)"/>`,
        ].join('\n  '),
      }),
    };
  },
  // Aufschlag, Bild 2: Treffmoment, dieselbe Kamera. Das Gewicht ist vorn, der vordere Fuß bleibt
  // stehen (die Figur rückt um genau so viel nach vorn). Eine gestrichelte Linie auf Höhe der
  // Schlaghand beginnt hinter der Hand und reicht über den Speeder hinaus — der GANZE Speeder liegt
  // darunter (Regel 5.1.4). Er fällt noch Kappe voran auf die Bespannung; die Bahn startet flach
  // (15–20°) und läuft lang aus dem Bild (kein steiler Anstieg, vgl. BAD-Delta).
  'G-006': (t) => {
    const ref = figur({ ...POSEN.aufschlagAus, ort: AUFSCHLAG.ort, H: AUFSCHLAG.H, blick: AUFSCHLAG.blick, kamera: AUFSCHLAG.kamera });
    const probe = figur({ ...POSEN.aufschlagTreff, ort: AUFSCHLAG.ort, H: AUFSCHLAG.H, blick: AUFSCHLAG.blick, kamera: AUFSCHLAG.kamera });
    const dx = ref.punkte.spitzeL[0] - probe.punkte.spitzeL[0];
    const fg = figur({ ...POSEN.aufschlagTreff, ort: [AUFSCHLAG.ort[0] + dx, AUFSCHLAG.ort[1]], H: AUFSCHLAG.H, blick: AUFSCHLAG.blick, kamera: AUFSCHLAG.kamera });
    const hand = fg.punkte.handR, k = fg.punkte.schlaegerKopf;
    // die Fläche steht fast auf der Kante: die Kappe liegt VOR ihr (rechts am Rahmen), nicht auf ihm
    const kappe = add(k, [9, -2]), sp = add(kappe, [0, -3.4]);
    const start = add(kappe, [6, -1]);
    // steigt flach los und flacht ab (Endtangente ~9°), verlässt das Bild in der Luft
    const bahn = `M${pt(start)} Q ${pt(add(start, [70, -24]))} 296,${f(start[1] - 30)}`;
    // beginnt links neben dem Körper (verdeckt hinter ihm), damit sie nicht als verlängerter Arm wirkt
    const linie = `M${f(hand[0] - 50)},${f(hand[1])}L${f(sp[0] + 24)},${f(hand[1])}`;
    // Schwungweg aus Bild 1: vom Schlägerkopf hinter dem Bein unten durch bis zum Treffpunkt
    const weg = spurKurve({ p0: add(ref.punkte.schlaegerKopf, [4, 6]), c: [ref.punkte.schlaegerKopf[0] + 34, k[1] + 30], p1: add(k, [-4, 3]), breite: 12 });
    // Sequenzprüfung: der hintere Ballen bleibt stehen, getroffen wird auf dem Fallweg aus Bild 1
    const ballenDx = fg.punkte.ballenR[0] - ref.punkte.ballenR[0];
    if (Math.abs(ballenDx) > 2) fg.warnungen.push(`Sequenz: hinterer Ballen wandert ${f(ballenDx)} gegenüber G-005`);
    const fallX = ref.punkte.handL[0] + AUFSCHLAG.fall;
    if (Math.abs(kappe[0] - fallX) > 2) fg.warnungen.push(`Sequenz: Treffpunkt ${f(kappe[0] - fallX)} neben dem Fallweg aus G-005`);
    const fuss = (fg.punkte.fersR[0] + fg.punkte.spitzeL[0]) / 2;
    return {
      figuren: [fg], zeichen: [],
      datei: datei({
        aria: t.aria, caption: t.cap, captionY: 274,
        defs: pfeil('p006'),
        inhalt: [
          aufschlagBoden(ref),
          schatten([fuss, fg.punkte.boden + 1], 43, 5.5),
          weg,
          `<path class="s-hilf" d="${linie}"/>`,
          fg.svg,
          speeder({ p: sp, winkel: 0 }),
          `<path class="s-bahn" d="${bahn}" marker-end="url(#p006)"/>`,
        ].join('\n  '),
      }),
    };
  },
  // Beweglichkeit und Schulter: nach dem Spiel die hintere Schulter des Schlagarms sanft dehnen
  // (Übungsteil). Frontal, leicht zur linken Seite gedreht, damit die greifende Hand vorn liegt.
  // Der Schlagarm liegt quer vor der Brust, die linke Hand fasst ihn knapp oberhalb des Ellbogens
  // und zieht sanft zur linken Schulter; Schultern tief, Rumpf dreht nicht mit. Der Schläger liegt
  // neben dem rechten Fuß am Boden: „nach dem Spiel“, und er macht den Schlagarm eindeutig. Eine
  // weiche Sichel an der Rückseite der rechten Schulter zeigt die Zone des leichten Ziehens, ein
  // kurzer Pfeil über dem Oberarm die Zugrichtung. Kein Schmerzsymbol.
  'G-033': (t) => {
    const basis = {
      ort: [150, 246], H: 24, blick: -12, kamera: 14, art: 'stehend', koerper: 'b',
      beinR: { ober: [0.14, -1, 0.07], unter: [0.03, -1, -0.07], fuss: [0, -0.04, 1] },
      beinL: { ober: [-0.14, -1, 0.07], unter: [-0.03, -1, -0.07], fuss: [0, -0.04, 1] },
      // knapp unter Schulterhöhe (Dossier): der Ellbogen liegt frei unter der linken Schulter
      armR: { ober: [-0.95, -0.12, 0.3], unter: [-0.96, -0.06, -0.05], hand: [-0.95, -0.14, -0.05], vor: true },
      armL: { ober: [-0.1, -1, 0.1], unter: [0, -1, 0.2], art: 'faust', vor: true },
    };
    const probe = figur(basis);
    const aR = probe.welt.arme.R, o = probe.welt.oben;
    // knapp oberhalb des Ellbogens, auf der Vorderseite des Oberarms
    const ziel = add(lerp(aR.S, aR.E, 0.78), add(mul(o.F, 0.12), mul(o.U, 0.04)));
    const fg = figur({ ...basis, armL: { ...armZiel(probe, 'L', ziel, mul(o.U, -1)), art: 'faust', vor: true } });
    const b = fg.welt.becken, fuss = fg.welt.beine.R;
    const boden = fuss.ferse[1] - P.rFerse;
    // mit Lücke neben dem Schuh, sonst verschmolz das Griffende mit der Schuhspitze
    const griff = add([fuss.ferse[0], boden, fuss.ferse[2]], add(mul(b.R, 0.95), mul(b.F, -0.25)));
    const schl = schlaeger3d({ griff, achse: norm(add(mul(b.F, 1), mul(b.R, 0.45))), flaeche: [0, 1, 0], proj: fg.proj, H: fg.H });
    const sR = fg.punkte.schulterR;
    // Zugpfeil über dem Unterarm, rechts neben dem Kopf, eine Strichbreite Abstand: der Arm wird
    // sanft Richtung linke Schulter gezogen (am Schulterende läse er sich als Stoß in die Schulter)
    const hR = fg.punkte.handR;
    const zug0 = add(hR, [-22, -16]), zug1 = add(hR, [-6, -16]);
    // Zone des leichten Ziehens: ein dünner Bogen in --tinte-3 an der Rückseite der rechten Schulter
    // (eine Sichel mit Deckkraft .18 erreichte nur 1,2:1 und verschwand als Miniatur)
    const zone = [215, 240, 265, 290].map((g) => add(sR, [Math.sin((g * Math.PI) / 180) * 14, Math.cos((g * Math.PI) / 180) * 14]));
    return {
      figuren: [fg], zeichen: [],
      datei: datei({
        aria: t.aria, caption: t.cap, captionY: 274,
        defs: pfeil('p033'),
        inhalt: [
          schatten([150, fg.punkte.boden + 1], 46, 5.5),
          schl,
          fg.svg,
          `<path class="s-zone" d="M${pt(zone[0])} A 14 14 0 0 0 ${pt(zone[3])}"/>`,
          `<path class="s-rot" d="M${pt(zug0)} L${pt(zug1)}" marker-end="url(#p033)"/>`,
        ].join('\n  '),
      }),
    };
  },
  // Explosivität: die Feder als Bewegungsfolge von links nach rechts, ein Sprung nach oben mit
  // kleinem Vorwärtsanteil wie zum hohen Ball. Einfedern (Kontur), Absprung in Dreifachstreckung
  // (volle Figur, Fußspitzen eben vom Boden), weiche Landung auf den Ballen (Kontur) — die beiden
  // Konturphasen tragen die Aussage („vordehnen, sofort strecken“ und „weich landen“). Die
  // Schwerpunktbahn läuft hinter den Figuren: kleine Senke beim Einfedern, flacher Bogen. Keine
  // Kästen, Hürden oder Tiefsprünge (Gesundheitsrahmen: Prinzip, keine Dosierung).
  'G-034': (t) => {
    const y = 250, H = 21, kam = 8;
    // enger gesetzt (Dossier: leicht überlappend) — weit auseinander las sich die Folge als Weitsprung
    const ein = figur({ ort: [80, y], H, blick: 90, kamera: kam, art: 'dynamisch', geist: 'kontur',
      neig: 35, kopf: { neig: -24 },
      beinR: { ober: [0.12, -0.6, 0.8], unter: [0.02, -1, -0.25], fuss: [0.15, -0.04, 1] },
      beinL: { ober: [-0.12, -0.6, 0.8], unter: [-0.02, -1, -0.25], fuss: [-0.15, -0.04, 1] },
      armR: { ober: [0.12, -1, -0.12], unter: [0.06, -1, -0.2] },
      armL: { ober: [-0.12, -1, -0.12], unter: [-0.06, -1, -0.2], art: 'offen' } });
    const ab = figur({ ort: [156, y], H, blick: 90, kamera: kam, art: 'luft', heben: 0.22,
      neig: 10, kopf: { neig: -14 },
      beinR: { ober: [0.1, -1, -0.17], unter: [0.04, -1, -0.17], fuss: [0.08, -1, 0.42] },
      beinL: { ober: [-0.1, -1, -0.17], unter: [-0.04, -1, -0.17], fuss: [-0.08, -1, 0.42] },
      armR: { ober: [0.18, 0.55, 0.82], unter: [0.1, 0.75, 0.66], vor: true },
      armL: { ober: [-0.18, 0.55, 0.82], unter: [-0.1, 0.75, 0.66], art: 'offen' },
      // Fläche 30–40° zur Betrachterin gedreht: hochkant las sich der Schläger als Stab
      schlaeger: { hand: 'R', achse: [0, 1, 0.15], flaeche: [0.55, -0.1, 0.83] } });
    const lan = figur({ ort: [224, y], H, blick: 90, kamera: kam, art: 'dynamisch', geist: 'kontur',
      neig: 20, kopf: { neig: -12 },
      beinR: { ober: [0.12, -0.85, 0.55], unter: [0.02, -1, -0.3], fuss: [0.15, -0.3, 1] },
      beinL: { ober: [-0.12, -0.85, 0.55], unter: [-0.02, -1, -0.3], fuss: [-0.15, -0.3, 1] },
      armR: { ober: [0.15, -0.8, 0.5], unter: [0.1, 0.35, 1] },
      armL: { ober: [-0.15, -0.75, 0.55], unter: [-0.1, 0.1, 1], art: 'offen' } });
    const schlEin = geistSchlaeger(ein, [0.1, -0.85, -0.5], [0, 0.5, -0.85]);
    const schlLan = geistSchlaeger(lan, [0.05, 1, 0.05], [0, -0.05, 1]);
    const h1 = ein.punkte.huefte, h2 = ab.punkte.huefte, h3 = lan.punkte.huefte;
    // Schwerpunkt: beginnt in der Kontur, aus dem Einfedern kurz tiefer, steigt durch den Absprung
    // weiter (er ist der Moment direkt nach dem Abheben) und hat den Scheitel erst danach
    const scheitel = [(h2[0] + h3[0]) / 2 - 6, h2[1] - 14];
    const bahn = `M${pt(add(h1, [-2, 2]))} Q ${pt(add(h1, [8, 10]))} ${pt(add(h1, [18, 2]))} C ${pt([h2[0] - 18, h2[1] + 4])} ${pt([h2[0] + 4, scheitel[1] - 2])} ${pt(scheitel)} S ${pt([h3[0] - 4, h3[1] - 16])} ${pt(add(h3, [-2, 0]))}`;
    // vordehnen ↓, sofort strecken ↑ — neben der Konturphase, nicht auf ihr
    // vor den Knien des Einfederns, zwischen Phase 1 und 2: dort liest er sich nicht als Schläger auf und ab
    const dp = [(Math.max(ein.punkte.spitzeR[0], ein.punkte.knieR[0]) + ab.punkte.fersR[0]) / 2, ein.punkte.knieR[1] + 6], halb = (r) => `M${f(dp[0])},${f(dp[1] + r * 2)}L${f(dp[0])},${f(dp[1] + r * 13)}`;
    // Dämpfungsbogen unter den Ballen der Landung
    const b1 = lan.punkte.ballenR, b2 = lan.punkte.ballenL, bm = lerp(b1, b2, 0.5);
    const daempf = `M${f(bm[0] - 16)},${f(y + 6)} Q ${f(bm[0])},${f(y + 13)} ${f(bm[0] + 16)},${f(y + 6)}`;
    return {
      figuren: [ein, ab, lan], zeichen: [],
      datei: datei({
        aria: t.aria, caption: t.cap, captionY: 280,
        defs: pfeil('p034'),
        inhalt: [
          `<path class="s-boden" d="M8,${y + 0.5}L292,${y + 0.5}"/>`,
          schatten([156, y + 1], 28, 3.5),
          `<path class="s-bahng" d="${bahn}"/>`,
          // Schläger vor den Konturen: deren Füllung deckt den Griff in der Hand ab
          schlEin, ein.svg, schlLan, lan.svg,
          ab.svg,
          `<path class="s-rot" d="${halb(-1)}" marker-end="url(#p034)"/>`, `<path class="s-rot" d="${halb(1)}" marker-end="url(#p034)"/>`,
          `<path class="s-rot" d="${daempf}"/>`,
        ].join('\n  '),
      }),
    };
  },
  // Bewegungsökonomie: zwei Felder, beide streng seitlich, Blick nach rechts, gleicher Start (Mittel-
  // marke) und gleiches Ziel (Speeder rechts vorn). Links effizient: am Start als Kontur die
  // Bereitschaft, am Ziel die volle Figur im kontrollierten Ausfallschritt (rechter Fuß vorn,
  // Schienbein senkrecht, Rumpf aufrecht, Treffpunkt vor dem vorderen Fuß); am Boden nur zwei
  // Abdrücke, ein glatter Weg hin und gestrichelt zurück zur Mitte. Rechts hektisch, als Kontur:
  // fünf kleine Abdrücke im Zickzack und einer über das Ziel hinaus, die Figur kippt über das
  // vordere Bein, holt weit aus, der freie Arm fuchtelt — das Knie bleibt aber hinter der
  // Fußspitze, auch im Gegenbeispiel (Gesundheitsrahmen).
  'G-036': (t) => {
    // 330 breit: zwei Bildhälften zu 165 — Startphase, Ausfallschritt und Treffpunkt brauchen bei
    // H = 20 mehr als 150 Einheiten (der Schläger ragte sonst in die rechte Hälfte)
    const y = 226, H = 20, kam = 7, breite = 165;
    const lunge = {
      blick: 90, kamera: kam, H, art: 'dynamisch', neig: 10, kopf: { neig: -6 },
      beinR: { ober: [0.08, -0.62, 0.78], unter: [0.02, -1, 0], fuss: [0.1, -0.04, 1] },
      beinL: { ober: [-0.1, -0.75, -0.65], unter: [-0.05, -0.8, -0.6], fuss: [-0.1, -0.55, 0.83] },
      // Schläger wie im Drive: Fläche zum Ziel, Treffpunkt vor dem vorderen Fuß (als Degen geführt
      // stand die Fläche hochkant und die Normale zeigte 47° nach unten)
      armR: POSEN.drive.armR, schlaeger: POSEN.drive.schlaeger,
      armL: { ober: [-0.1, -0.9, -0.4], unter: [-0.05, -0.85, -0.5], art: 'offen' },
    };
    const hektisch = {
      blick: 90, kamera: kam, H, art: 'dynamisch', neig: 42, kopf: { neig: -18 }, geist: 'kontur',
      beinR: { ober: [0.08, -0.55, 0.83], unter: [0.02, -1, 0.08], fuss: [0.1, -0.04, 1] },
      beinL: { ober: [-0.06, -0.95, -0.3], unter: [-0.03, -0.5, -0.87], fuss: [-0.05, -0.9, 0.4] },
      armR: { ober: [0.2, 0.25, -0.95], unter: [0.1, 0.6, -0.8] },
      // der freie Arm fliegt nach hinten weg: nach oben gerissen verschmolz er im Umriss mit dem
      // Kopf, nach vorn ragte er durch den Speeder aus dem Bild
      armL: { ober: [-0.4, 0.2, -0.9], unter: [-0.3, -0.6, -0.75], art: 'offen' },
    };
    // Start: Grundposition als Kontur, ohne Schläger (der ragte als Stab neben den Schlagarm);
    // die Mittelmarke liegt unter ihren Füßen
    const panel = (x0, eff) => {
      const start = x0 + 17;
      const ghost = figur({ ...POSEN.bereit, schlaeger: undefined, ort: [start, y], H, blick: 90, kamera: kam, geist: 'kontur' });
      const gp = ghost.punkte, mitte = (gp.fersR[0] + gp.spitzeR[0] + gp.fersL[0] + gp.spitzeL[0]) / 4;
      // links steht der hintere Fuß auf der Mitte (ein Schritt nach vorn), rechts ist die Figur in
      // kleinen Schritten zu weit gestolpert — der Speeder hängt ungetroffen vor ihr
      const pose = eff ? lunge : hektisch, probe = figur({ ...pose, ort: [start, y] });
      const ox = eff ? start + (mitte + 2 - probe.punkte.ballenL[0]) : start + 80;
      const fg = figur({ ...pose, ort: [ox, y] });
      return { start, mitte, ghost, fg };
    };
    const L = panel(0, true), R = panel(breite, false);
    const schlR = geistSchlaeger(R.fg, [0.1, 0.4, -0.92], [0, 0.92, 0.4]);
    // derselbe Speeder in beiden Hälften, Kappe voran auf die Bespannung zu
    const zielL = add(L.fg.punkte.schlaegerKopf, [8, 0]), zielR = add(zielL, [breite, 0]);
    if (zielL[0] + 17 > breite) L.fg.warnungen.push(`Speeder links ragt an die Trennlinie (${f(zielL[0])})`);
    const marke = (x) => `<ellipse class="s-basis" cx="${f(x)}" cy="${f(y + 1)}" rx="9" ry="2.6"/>`;
    const abdruck = (x, dy) => `<ellipse class="s-mkg" cx="${f(x)}" cy="${f(y + 1 + dy)}" rx="4.6" ry="1.6"/>`;
    // links ein einziger direkter Ausfallschritt: Weg hin glatt, zurück gestrichelt zur Mitte
    const vorneL = L.fg.punkte.ballenR[0];
    const hin = `M${f(L.mitte + 8)},${f(y + 12)}L${f(vorneL - 4)},${f(y + 12)}`;
    const zurueck = `M${f(vorneL - 8)},${f(y + 21)}L${f(L.mitte + 4)},${f(y + 21)}`;
    // rechts fünf kleine Schritte im Zickzack auf dem ganzen zurückgelegten Weg bis zum vorderen Fuß
    // (zwischen den Beinen sichtbar) — die Spur endet an der Figur, nicht vor ihr
    const vorneR = R.fg.punkte.fersR[0];
    const zick = [0, 1, 2, 3, 4].map((i) => abdruck(lerp([R.mitte + 16, 0], [vorneR - 10, 0], i / 4)[0], i % 2 ? 3.2 : -2.2)).join('');
    return {
      figuren: [L.fg, R.fg], zeichen: [],
      datei: datei({
        aria: t.aria, caption: t.cap, captionY: 274, breite: 2 * breite,
        defs: pfeil('p036', 's-mkg', 3.8),
        inhalt: [
          `<path class="s-bahnz" d="M${breite},34L${breite},${y + 26}"/>`,
          `<path class="s-boden" d="M6,${y + 0.5}L${breite - 8},${y + 0.5}M${breite + 8},${y + 0.5}L${2 * breite - 6},${y + 0.5}"/>`,
          marke(L.mitte), marke(R.mitte),
          zick,
          `<path class="s-wegv" d="${hin}" marker-end="url(#p036)"/>`,
          `<path class="s-wegg" d="${zurueck}" marker-end="url(#p036)"/>`,
          L.ghost.svg, R.ghost.svg,
          schlR, R.fg.svg,
          L.fg.svg,
          speeder({ p: zielL, winkel: 270 }), speeder({ p: zielR, winkel: 270 }),
        ].join('\n  '),
      }),
    };
  },
  'G-004': (t) => {
    const fg = figur({
      ort: [168, 244], H: 24, blick: -28, kamera: 9, neig: 14, seit: 10, schulter: -14, kopf: { dreh: -46, neig: 10 }, art: 'dynamisch',
      beinR: { ober: [0.72, -1, 0.35], unter: [0.12, -1, -0.12], fuss: [0.85, -0.05, 0.55] },
      beinL: { ober: [-0.38, -1, -0.25], unter: [-0.2, -1, -0.35], fuss: [-0.25, -0.7, 0.7] },
      armR: { ober: [0.9, -0.65, 0.55], unter: [1, -0.5, 0.3], hand: [1, -0.4, 0.2], vor: true },
      armL: { ober: [-0.6, -0.9, -0.55], unter: [-0.35, -1, -0.3], art: 'offen' },
      schlaeger: { hand: 'R', achse: [1, 0.12, 0.12], flaeche: [-0.05, -0.469, 0.882] },
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
      ort: [88, 252], H: 20, blick: 48, kamera: 6, neig: 6, seit: -20, heben: 1.1, kopf: { neig: -34, dreh: -8 }, art: 'luft',
      beinR: { ober: [0.05, -1, -0.15], unter: [0, -0.35, -1], fuss: [0, -0.9, -0.2] },
      beinL: { ober: [-0.05, -1, 0.5], unter: [0, -1, 0.05], fuss: [0, -0.9, 0.6] },
      // Treffpunkt hoch über dem Kopf, der Oberarm seitlich neben dem Kopf (wie G-010): senkrecht
      // nach oben schnitt er die Kopfkante, nach vorn gelegt wurde daraus ein Vorwärtsstrecken.
      armR: { ober: [1, 1, 0.3], unter: [0.3, 1, 0.45], hand: [0.1, 1, 0.5], vor: true },
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
          // Kappe voran entlang der Bahn (Steigung 0,62 ≈ 58° im dir()-Maß), nicht quer dazu
          speeder({ p: add(k, [11, 3]), winkel: 58 }),
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
// Motive, an denen noch gezeichnet wird: nicht ausgeliefert, nicht im Gate, nie nach images/
// geschrieben (nur mit --ziel in einen Arbeitsordner). Fertig = aus dieser Menge streichen.
export const IN_ARBEIT = new Set([]);
const ALLE = () => [...Object.keys(MOTIVE), ...(G001 ? ['G-001'] : []), ...(G009 ? ['G-009'] : [])].filter((id) => TEXTE[id]).sort();
export const IDS = () => ALLE().filter((id) => !IN_ARBEIT.has(id));

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const zi = args.indexOf('--ziel');
  const ziel = zi >= 0 ? resolve(args[zi + 1]) : join(REPO, 'images');
  const nur = args.filter((a, i) => a.startsWith('G-') && (zi < 0 || i !== zi + 1));
  for (const id of nur) if (zi < 0 && IN_ARBEIT.has(id)) console.log(`${id} ist in Arbeit — nur mit --ziel <ordner>, nicht nach images/`);
  mkdirSync(ziel, { recursive: true });
  for (const id of zi >= 0 ? ALLE() : IDS()) {
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
