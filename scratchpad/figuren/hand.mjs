// hand.mjs — Nahaufnahmen der Schlaghand: G-001 (Universalgriff) und G-009 (Handgelenk-Peitsche).
// Eine Nahaufnahme hat keine Ganzkörper-Pose; das Skelett aus figur.mjs ist hier das falsche
// Werkzeug. Es gelten aber dieselben Stilregeln und Primitive (kapsel/glatt): gefüllte Volumen in
// Tinte, Freistellung durch eine schmale Hintergrundkontur zwischen überlappenden Teilen, die
// ferne Seite eine Stufe heller, der Akzent nur für Schläger, V-Marke und Bewegungszeichen.
//
// Beide Grafiken teilen EINE Hand: faust() zeichnet sie im lokalen Rahmen des Griffs —
// x = Griffachse Richtung Schlägerkopf, y = quer, −y = obere Kante (Daumenseite). Blick von der
// Daumenseite leicht auf den Handrücken, so wie man die eigene rechte Hand sieht.
import { kapsel, glatt, gruppe, datei, add, mul, f, pt } from './figur.mjs';
import { speeder, pfeil } from './bauteile.mjs';

const G = 10; // halbe Griffbreite

// Fingerkette aus verjüngten Kapseln: [[x,y,r], …]
const kette = (glieder) => glieder.slice(1).map((b, i) => kapsel(glieder[i].slice(0, 2), glieder[i][2], b.slice(0, 2), b[2]));

// Die Hand am Griff. Gibt Teil-Zeichnungen zurück, damit die Motive die Reihenfolge bestimmen.
export function faust({ geist = false } = {}) {
  const K = geist ? 's-gk' : 's-k', X = geist ? null : 's-x3';
  // Mittel-, Ring- und kleiner Finger: Knöchelreihe schräg über den Griff, die Glieder
  // legen sich gerundet um die untere Kante. Locker: kleine Lücken, keine gepresste Faust.
  const finger = [
    [[-29, 9, 4.9], [-25.5, 17, 4.5], [-29, 22.5, 4]],
    [[-21, 5.5, 5.4], [-16, 15.5, 5], [-19.5, 22, 4.5]],
    [[-12.5, 1.5, 5.8], [-6.5, 13, 5.3], [-10, 21, 4.8]],
  ];
  // Zeigefinger als „Abzugsfinger“ nach vorn unten abgespreizt: unterer Schenkel des V
  const zeige = [[-3, 1, 5.8], [10, 6, 5.3], [15, 14, 4.8], [12, 20.5, 4.3]];
  // Handrücken: Handgelenk bis Knöchelreihe
  const ruecken = glatt([[-50, -4], [-38, -8.5], [-25, -8], [-15, -5.5], [-7, -2], [-1, 3.5], [-9, 7.5], [-21, 11.5], [-34, 12.5], [-48, 9.5]], 0.55);
  // Daumen: liegt auf der oberen Kante und steigt leicht an — oberer Schenkel des V. Er ist
  // kurz und verjüngt sich bis zur Kuppe, die sich schon über die Kante legt.
  const daumen = [[-34, -5.5, 6.8], [-20, -9.6, 5.6], [-8.5, -11.8, 5], [0.5, -11, 4.6]];
  const teile = [];
  for (const fi of [...finger, zeige]) {
    const k = kette(fi);
    if (X) teile.push(gruppe(X, k));
    teile.push(gruppe(K, k));
  }
  // Daumen und Handrücken sind EINE Fläche (keine Freistellung um den Daumen: die machte ihn
  // zur „Wurst“). Getrennt sind Daumen und Zeigefinger nur durch die Kerbe des V.
  teile.push(gruppe(K, [ruecken, ...kette(daumen)]));
  // V: Hautfalte zwischen Daumen und Zeigefinger, Spitze zum Griffende, Öffnung zum Kopf.
  // Als Punkte im lokalen Rahmen, damit das Motiv die Marke in Bildkoordinaten zeichnet
  // (gleiche Strichstärke bei jedem Maßstab).
  return { hand: teile.join(''), v: [[0.5, -6.6], [-12, -5.6], [7.5, -1.4]] };
}

// Schläger im lokalen Griffrahmen: Griff mit Griffband, Hals, Schaft, Kopf (Rahmen + Saiten).
// kopfB = sichtbare Breite des Kopfes quer zur Achse (hochkant schmal, offen breit).
export function schlaeger({ griffVon = -58, griffBis = 30, kopfMitte = 150, kopfL = 62, kopfB = 24, geist = false }) {
  const g = G;
  if (geist) {
    // Die Ausholphase trägt hier allein die Aussage: volle Kontur mit 3:1 statt blasser Begleitlinie
    return `<path class="s-zsch" d="M${griffVon},0 L${kopfMitte - kopfL},0"/>` +
      `<ellipse class="s-zr" cx="${kopfMitte}" cy="0" rx="${kopfL}" ry="${kopfB}"/>`;
  }
  const griff = `<path class="s-griff" d="M${griffVon},${-g - 1.6} L${griffBis},${-g} L${griffBis},${g} L${griffVon},${g + 1.6} Q${griffVon - 7},0 ${griffVon},${-g - 1.6}Z"/>`;
  let band = '';
  for (let x = griffVon + 6; x < griffBis - 6; x += 10) band += `M${x},${g}L${x + 8},${-g}`;
  const schaft = `<path class="s-rsch2" d="M${griffBis},0 L${kopfMitte - kopfL - 22},0"/>`;
  const hals = `<path class="s-rh2" d="M${kopfMitte - kopfL - 22},0 L${kopfMitte - kopfL + 4},${-kopfB * 0.55} M${kopfMitte - kopfL - 22},0 L${kopfMitte - kopfL + 4},${kopfB * 0.55}"/>`;
  let saiten = '';
  for (let i = 1; i < 6; i++) { const q = -kopfB + (2 * kopfB * i) / 6, w = kopfL * Math.sqrt(1 - (q / kopfB) ** 2) * 0.96; saiten += `M${f(kopfMitte - w)},${f(q)}L${f(kopfMitte + w)},${f(q)}`; }
  for (let i = 1; i < 8; i++) { const q = -kopfL + (2 * kopfL * i) / 8, h = kopfB * Math.sqrt(1 - (q / kopfL) ** 2) * 0.94; saiten += `M${f(kopfMitte + q)},${f(-h)}L${f(kopfMitte + q)},${f(h)}`; }
  const kopf = `<ellipse class="s-rf" cx="${kopfMitte}" cy="0" rx="${kopfL}" ry="${kopfB}"/><path class="s-rs" d="${saiten}"/><ellipse class="s-rr2" cx="${kopfMitte}" cy="0" rx="${kopfL}" ry="${kopfB}"/>`;
  return kopf + hals + schaft + griff + `<path class="s-band" d="${band}"/>`;
}

// Unterarm vom Handgelenk aus dem Bild, mit Auslauf (Verlauf zur Fläche)
const UNTERARM = (id, von = [-48, 5], bis = [-78, 9]) => `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${von[0]}" y1="${von[1]}" x2="${bis[0]}" y2="${bis[1]}"><stop offset="0" class="s-ag0"/><stop offset="0.45" class="s-ag0"/><stop offset="1" class="s-ag1"/></linearGradient>`;
const unterarm = (id, ende = [-80, 10], rEnde = 14.2) => `<path fill="url(#${id})" d="${kapsel([-44, 4], 13, ende, rEnde)}"/>`;

const r1 = (n) => Math.round(n * 10) / 10;
const rahmen = (O, W, S) => (p) => { const a = (W * Math.PI) / 180, x = p[0] * S, y = p[1] * S; return [r1(O[0] + x * Math.cos(a) - y * Math.sin(a)), r1(O[1] + x * Math.sin(a) + y * Math.cos(a))]; };

export function G001(t) {
  const O = [140, 166], W = -36, S = 1.55, zuBild = rahmen(O, W, S);
  const h = faust();
  const v = h.v.map(zuBild), lt = zuBild([12, -24]);
  const inhalt = [
    `<g transform="translate(${O[0]} ${O[1]}) rotate(${W}) scale(${S})">`,
    schlaeger({ griffVon: -54, griffBis: 26, kopfMitte: 140, kopfL: 58, kopfB: 14 }),
    unterarm('u001'),
    h.hand,
    `</g>`,
    `<path class="s-v" d="M${v.map(pt).join('L')}"/>`,
    `<text class="s-lt" x="${lt[0]}" y="${lt[1]}">${t.v}</text>`,
  ].join('\n  ');
  return { figuren: [], zeichen: [], datei: datei({ aria: t.aria, caption: t.cap, captionY: 272, inhalt, defs: UNTERARM('u001') }) };
}

// G-009 Handgelenk-Peitsche: Seitenansicht, der Unterarm steigt von links unten ins Bild. Blass die
// Ausholphase mit zurückgelegtem Handgelenk und geöffneter Fläche, kräftig der Treffmoment: der
// Unterarm hat eingedreht (Pfeil um den Unterarm), das Handgelenk ist nach vorn geschnappt, die
// Fläche steht zum Ziel (hochkant, schmal) und der Speeder geht ab. Der Unterarm selbst bleibt
// in beiden Phasen gleich — der Schnapp kommt aus Rotation und Handgelenk, nicht aus Ausholen.
export function G009(t) {
  const HG = [-44, 4]; // Handgelenk im lokalen Griffrahmen
  const P0 = [104, 204], S = 0.82, A = -28, ZURUECK = 58;
  const phase = (a) => (p) => {
    const r = (a * Math.PI) / 180, x = (p[0] - HG[0]) * S, y = (p[1] - HG[1]) * S;
    return [r1(P0[0] + x * Math.cos(r) - y * Math.sin(r)), r1(P0[1] + x * Math.sin(r) + y * Math.cos(r))];
  };
  const tf = (a) => `translate(${P0[0]} ${P0[1]}) rotate(${a}) scale(${S}) translate(${-HG[0]} ${-HG[1]})`;
  const treff = phase(A);
  const kopfM = 140, kopfL = 58;
  const h = faust();
  // Bahn des Schlägerkopfs: Kreisbogen um das Handgelenk, Pfeil endet VOR dem Kopf
  const r = (kopfM + kopfL * 0.55 - HG[0]) * S;
  const bogen = (von, bis) => { const a = (von * Math.PI) / 180, b = (bis * Math.PI) / 180; return `M${f(P0[0] + r * Math.cos(a))},${f(P0[1] + r * Math.sin(a))} A${f(r)},${f(r)} 0 0 1 ${f(P0[0] + r * Math.cos(b))},${f(P0[1] + r * Math.sin(b))}`; };
  const bahn = `<path class="s-bahn" d="${bogen(A - ZURUECK + 6, A - 7)}" marker-end="url(#p009)"/>`;
  // Tempostriche hinter dem Kopf, auf der Seite, von der er kommt
  const tempo = [0, 1, 2].map((i) => { const rr = (kopfM - HG[0] + 10 - i * 22) * S; const a = ((A - 12) * Math.PI) / 180, b = ((A - 4) * Math.PI) / 180; return `M${f(P0[0] + rr * Math.cos(a))},${f(P0[1] + rr * Math.sin(a))} A${f(rr)},${f(rr)} 0 0 1 ${f(P0[0] + rr * Math.cos(b))},${f(P0[1] + rr * Math.sin(b))}`; }).join('');
  // Eindrehen: Ellipsenbogen um den Unterarm kurz vor dem Handgelenk
  const um = treff([-86, 11]), ua = A - 9.5;
  const ell = (c, rx, ry, w, von, bis) => { const pts = []; for (let i = 0; i <= 20; i++) { const g = ((von + (bis - von) * i / 20) * Math.PI) / 180; const x = rx * Math.cos(g), y = ry * Math.sin(g), q = (w * Math.PI) / 180; pts.push([c[0] + x * Math.cos(q) - y * Math.sin(q), c[1] + x * Math.sin(q) + y * Math.cos(q)]); } return `M${pts.map(pt).join('L')}`; };
  const dreh = `<path class="s-rot" d="${ell(um, 5.5, 16, ua, 205, 480)}" marker-end="url(#p009b)"/>`;
  // Speeder an der Besaitung, Flugrichtung = Bewegung des Kopfs (Tangente)
  const kopfMitte = treff([kopfM, 0]), flug = A + 90, fl = [Math.cos((flug * Math.PI) / 180), Math.sin((flug * Math.PI) / 180)];
  const sp = add(kopfMitte, mul(fl, 12));
  const spWinkel = (Math.atan2(fl[0], fl[1]) * 180) / Math.PI;
  const flugbahn = `<path class="s-bahn2" d="M${pt(add(sp, mul(fl, 14)))}L${pt(add(sp, mul(fl, 44)))}" marker-end="url(#p009)"/>`;
  const inhalt = [
    `<g transform="${tf(A - ZURUECK)}">`, schlaeger({ geist: true, kopfMitte: kopfM, kopfL, kopfB: 17 }), `</g>`,
    bahn, `<path class="s-tempo" d="${tempo}"/>`,
    `<g transform="${tf(A)}">`, unterarm('u009', [-128, 18], 15.5), schlaeger({ kopfMitte: kopfM, kopfL, kopfB: 9 }), h.hand, `</g>`,
    dreh,
    flugbahn, speeder({ p: sp, winkel: spWinkel }),
  ].join('\n  ');
  return { figuren: [], zeichen: [], datei: datei({ aria: t.aria, caption: t.cap, captionY: 274, inhalt,
    defs: UNTERARM('u009', [-92, 11], [-126, 17]) + pfeil('p009') + pfeil('p009b', 's-mk', 3.6) }) };
}
