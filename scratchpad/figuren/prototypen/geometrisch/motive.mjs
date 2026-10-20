// Schreibt die fünf Prototypen G-002, G-010, G-008, G-043, G-001 als SVG.
// node motive.mjs
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { figur, datei, boden, schatten, bahn, speeder, schlaeger, kapsel, huelle, P, add, mul, sub, richtung, PRAEFIX } from './figur.mjs';
const VARIANTEN = process.argv.includes('--varianten');

const HIER = dirname(fileURLToPath(import.meta.url));
const schreibe = (id, svg) => { writeFileSync(join(HIER, `${id}.svg`), svg); console.log(`${id}.svg`); };

// ---------- G-002 Grundposition ----------
{
  const BODEN = 238;
  const fig = figur({
    ansicht: 'front', becken: [150, 156], rumpfLaenge: 0.92,
    fuesse: {
      rechts: { ziel: [111, BODEN - 9], knick: 1, l1: 0.86, frontal: true, aussen: -1 },
      links: { ziel: [189, BODEN - 9], knick: -1, l1: 0.86, frontal: true, aussen: 1 },
    },
    haende: {
      rechts: { ziel: [146, 163], knick: 1, l2: 0.8, winkel: 140, zOben: 40 },
      links: { ziel: [161, 164], knick: -1, l2: 0.8, winkel: -140, zOben: 40 },
    },
    schlaeger: { hand: 'rechts', winkel: 170, flach: 1 },
  });
  schreibe('G-002', datei({
    aria: 'Die Grundposition: Füße etwas mehr als schulterbreit, Knie gebeugt, Gewicht auf den Fußballen, Schläger locker vor dem Körper.',
    caption: 'Knie gebeugt · Gewicht auf den Fußballen', captionY: 264,
    inhalt: boden(82, 218, BODEN + 1.5) + fig.svg,
  }));
}

// Variante Dreiviertelansicht (Vergleich)
if (VARIANTEN) {
  const BODEN = 238;
  const fig = figur({
    ansicht: 'dreiviertel', blick: 1, becken: [146, 146], neigung: 10, kopf: { neigung: 4 },
    fuesse: {
      rechts: { ballen: [128, BODEN], knick: -1, zehen: 64 },
      links: { ballen: [192, BODEN - 8], knick: -1, zehen: 66 },
    },
    haende: {
      rechts: { ziel: [170, 146], knick: 1, winkel: 140 },
      links: { ziel: [184, 148], knick: 1, winkel: 120 },
    },
    schlaeger: { hand: 'rechts', winkel: 165, flach: 0.85 },
  });
  schreibe('G-002-34', datei({
    aria: 'Variante', caption: 'Knie gebeugt · Gewicht auf den Fußballen', captionY: 264,
    inhalt: boden(84, 222, BODEN + 1.5) + fig.svg,
  }));
}

// ---------- G-010 Überkopfschlag ----------
{
  const BODEN = 244;
  const fig = figur({
    ansicht: 'seite', blick: 1, skala: 0.86, becken: [111, 166], neigung: -6, kopf: { neigung: -12 },
    fuesse: {
      rechts: { ballen: [96, BODEN - 1], knick: -1, zehen: 40 },   // hinten, auf dem Ballen
      links: { ballen: [150, BODEN - 1], knick: -1, zehen: 90 },     // vorn, aufgesetzt
    },
    haende: {
      rechts: { ziel: [132, 76], knick: 1, winkel: 160 },          // Schlagarm gestreckt
      links: { ziel: [128, 150], knick: 1, winkel: 140 },         // freier Arm zieht vor den Körper
    },
    schlaeger: { hand: 'rechts', winkel: 150 },
  });
  const s = fig.punkte.schlaeger;
  const kontakt = add(s.kopf, mul(s.n, 0));
  const spOrt = add(add(s.kopf, mul(s.n, 15)), mul(s.d, 3));
  const sp = speeder({ ort: spOrt, flug: 118 });
  const start = add(spOrt, mul(richtung(118), 10));
  const ende = [266, 196];
  schreibe('G-010', datei({
    aria: 'Der Überkopfschlag: hoher Treffpunkt über dem Kopf, gestreckter Schlagarm, die Flugbahn zieht in hohem, tiefem Bogen weit ins gegnerische Feld.',
    caption: 'hoher Treffpunkt · tiefer Bogen ins Feld', captionY: 270, stilOpt: { bahn: true },
    inhalt: boden(58, 190, BODEN) + bahn(`M${P(start)}C${P([start[0] + 46, start[1] - 40])} ${P([258, 30])} ${P(ende)}`, ende, 4) + fig.svg + sp,
  }));
  void kontakt;
}

// ---------- G-008 Bewegungskreislauf ----------
{
  const M = [122, 222];            // zentrale Position
  const E = [240, 222];            // Ecke, in die ausgefallen wird
  const feld = `M${P([2 * M[0] - E[0], M[1]])}L${P([M[0], M[1] - 32])}L${P(E)}L${P([M[0], M[1] + 32])}Z`;
  const fig = figur({
    ansicht: 'seite', blick: 1, skala: 0.84, becken: [190, 163], neigung: 22, kopf: { neigung: -16 },
    fuesse: {
      rechts: { ballen: [236, 228], knick: -1, zehen: 90 },  // vorderes Bein, Ausfallschritt
      links: { ballen: [148.6, 226], knick: -1, zehen: 56 },   // hinteres Bein gestreckt, auf dem Ballen
    },
    haende: {
      rechts: { ziel: [230, 172], knick: 1, winkel: 118 },
      links: { ziel: [172, 166], knick: -1, winkel: -120 },
    },
    schlaeger: { hand: 'rechts', winkel: 122, flach: 0.8 },
  });
  const s = fig.punkte.schlaeger;
  const sp = speeder({ ort: add(s.spitze, [2, -8]), flug: -70, skala: 0.95 });
  const zurStart = [222, 242];
  const zurEnde = [M[0] + 12, M[1] + 14];
  schreibe('G-008', datei({
    aria: 'Beinarbeit, Bild 2: der Bewegungskreislauf — mit einem Ausfallschritt in die Ecke den Speeder spielen und auf gebogenem Weg zurück zur zentralen Position in der Mitte.',
    caption: 'zur Ecke ausfallen — zurück zur Mitte', captionY: 270, stilOpt: { zur: true, feld: true },
    inhalt: `<path class="${PRAEFIX}-feld" d="${feld}"/><path class="${PRAEFIX}-feldlinie" d="${feld}"/>`
      + `<circle class="${PRAEFIX}-ring" cx="${M[0]}" cy="${M[1]}" r="13"/><ellipse class="${PRAEFIX}-akzent" cx="${M[0]}" cy="${M[1]}" rx="6" ry="4"/>`
      + bahn(`M${P(zurStart)}C${P([200, 262])} ${P([160, 262])} ${P(zurEnde)}`, zurEnde, -48, { klasse: 'zur', spitze: 'zurspitze' })
      + fig.svg + sp,
  }));
}

// ---------- G-043 Verständigung im Paar ----------
{
  // Feste Ordnung (Regel 7.5.1): Angriffsspieler vorn, Rückraumspieler hinten.
  // Von hinten gesehen: vorn (klein, fern) gibt hinter dem Rücken das Zeichen,
  // hinten (groß, nah) sieht es.
  const feld = 'M22,246L278,246L234,170L66,170Z';
  const vorn = figur({
    ansicht: 'ruecken', skala: 0.76, becken: [190, 125], ton: 'fern',
    fuesse: {
      rechts: { ziel: [200, 191], knick: -1, frontal: true, aussen: 1 },
      links: { ziel: [180, 191], knick: 1, frontal: true, aussen: -1 },
    },
    haende: {
      links: { ziel: [188, 122], knick: -1, art: 'zeichen', gross: 1.3, winkel: 168, z: 60 },
      rechts: { ziel: [212, 128], knick: 1, winkel: 180 },
    },
    schlaeger: { hand: 'rechts', winkel: 186, hinten: true, z: -5 },
  });
  const hinten = figur({
    ansicht: 'ruecken', becken: [98, 139], kopf: { neigung: 7 },
    fuesse: {
      rechts: { ziel: [112, 227], knick: -1, frontal: true, aussen: 1 },
      links: { ziel: [84, 227], knick: 1, frontal: true, aussen: -1 },
    },
    haende: {
      rechts: { ziel: [123, 148], knick: -1, winkel: 172 },
      links: { ziel: [73, 150], knick: 1, winkel: -172 },
    },
    schlaeger: { hand: 'rechts', winkel: 8, flach: 0.6 },
  });
  const zeichen = add(vorn.punkte.hand_links, [-2, 6]);
  const blick = `M${P(add(hinten.punkte.kopf, [17, -2]))}Q${P([150, 62])} ${P(add(zeichen, [-14, -14]))}`;
  const licht = `<circle class="${PRAEFIX}-licht" cx="${zeichen[0]}" cy="${zeichen[1]}" r="17"/>`;
  schreibe('G-043', datei({
    aria: 'Verständigung im Paar: zwei Doppelpartner von hinten, die sich zwischen den Punkten abstimmen — einer gibt hinter dem Rücken ein verdecktes Handzeichen.',
    caption: 'verdecktes Handzeichen · Verständigung', captionY: 270, stilOpt: { feld: true, extra: `.${PRAEFIX}-blick{fill:none;stroke:var(--primaer,#38a4f1);stroke-width:2.4;stroke-linecap:round;stroke-dasharray:.1 6;opacity:.8}.${PRAEFIX}-licht{fill:none;stroke:var(--primaer,#38a4f1);stroke-width:2.2;opacity:.9}` },
    inhalt: `<path class="${PRAEFIX}-feld" d="${feld}"/><path class="${PRAEFIX}-feldlinie" d="${feld}M44,208H256"/>`
      + vorn.svg + licht + hinten.svg + `<path class="${PRAEFIX}-blick" d="${blick}"/>`,
  }));
}

// ---------- G-001 Universalgriff (Nahaufnahme) ----------
// Handarbeit mit denselben Grundformen (Kapsel, Kreis-Hülle, Fuge, Naht, zwei Töne):
// Die Ganzkörper-Pose kennt keine Finger; eine eigene Hand-Skelettlogik für ein
// einziges Motiv wäre teurer als diese ~30 Zeilen Geometrie in Griff-Koordinaten.
{
  const p = PRAEFIX;
  const O = [166, 116];                       // Scheitel des V auf der oberen Kante
  const K = 1.12;                             // Maßstab der Nahaufnahme
  const u = norm2([1, -0.5]);                 // Griffachse Richtung Schlägerkopf
  const n = [-u[1], u[0]];                    // quer: + = untere Griffseite im Bild
  const L = (s, v) => add(O, add(mul(u, s * K), mul(n, v * K)));
  const G = 14;                               // halbe Griffbreite
  const griff = kapsel(L(-104, 0), L(52, 0), G * K);
  const kappe = kapsel(L(-110, 0), L(-100, 0), (G + 2.5) * K);
  const wickel = [-92, -74, -54, -34, -14, 6, 26, 44].map((s) => `M${P(L(s - 5, -G + 1.5))}L${P(L(s + 5, G - 1.5))}`).join('');
  const schaft = `M${P(L(52, 0))}L${P(L(90, 0))}M${P(L(90, 0))}L${P(L(104, -8))}M${P(L(90, 0))}L${P(L(104, 8))}`;
  const kopfM = L(134, 0); const ang = (Math.atan2(u[1], u[0]) * 180) / Math.PI;
  const schl = `<path class="${p}-schaft" d="${schaft}"/>`
    + `<ellipse class="${p}-rahmen" cx="${kopfM[0].toFixed(1)}" cy="${kopfM[1].toFixed(1)}" rx="${(32 * K).toFixed(1)}" ry="${(25 * K).toFixed(1)}" transform="rotate(${ang.toFixed(1)} ${P(kopfM)})"/>`
    + `<path class="${p}-band ${p}-fuge" d="${griff}"/><path class="${p}-wickel" d="${wickel}"/>`
    + `<path class="${p}-griff ${p}-fuge" d="${kappe}"/>`
    + `<path class="${p}-kante" d="M${P(L(-98, 0))}L${P(L(50, 0))}"/>`;
  const F = 12;                                // Fingerbreite (vor Maßstab)
  const R = (r) => r * K;
  // Die Hand liegt ÜBER dem Griff (Blick von oben auf den Handrücken). Mittel-, Ring- und
  // kleiner Finger umschließen ihn auf der abgewandten Seite: nur ihre Mittelglieder
  // schauen oben hervor (fern). Daumen unten, Zeigefinger oben: dazwischen tritt der Griff
  // im V Richtung Schlägerkopf aus.
  const kuppen = [-26, -42, -58].map((s, i) => `<path class="${p}-fern ${p}-naht" d="${kapsel(L(s + 4, -G - 2 + i), L(s - 3, -G - 15 + i * 2), R(F / 2))}"/>`).join('');
  const ruecken = huelle([[L(-10, -14), R(8)], [L(-16, 13), R(9)], [L(-62, 26), R(14)], [L(-66, -14), R(12)]]);
  const handgelenk = L(-60, 34);
  const armEnde = add(handgelenk, [-40, 56]);
  const unterarm = kapsel(handgelenk, armEnde, R(16.5));
  const verlauf = `<defs><linearGradient id="gm001-arm" gradientUnits="userSpaceOnUse" x1="${handgelenk[0].toFixed(1)}" y1="${handgelenk[1].toFixed(1)}" x2="${armEnde[0].toFixed(1)}" y2="${armEnde[1].toFixed(1)}"><stop class="${p}-stopp" offset=".45"/><stop class="${p}-stopp ${p}-stopp-aus" offset="1"/></linearGradient></defs>`;
  const zeige1 = kapsel(L(-12, -15), L(6, -25), R(F / 2));
  const zeige2 = kapsel(L(6, -25), L(22, -19), R(F / 2 - 0.4));
  const daumen1 = kapsel(L(-20, 12), L(6, 10), R(7.4));
  const daumen2 = kapsel(L(6, 10), L(28, 3), R(6.6));
  const hand = kuppen
    + `<path fill="url(#gm001-arm)" d="${unterarm}"/>`
    + `<path class="${p}-nah ${p}-fuge" d="${ruecken}"/>`
    + `<path class="${p}-nah ${p}-naht" d="${zeige1}"/><path class="${p}-nah ${p}-naht" d="${zeige2}"/>`
    + `<path class="${p}-nah ${p}-fuge" d="${daumen1}"/><path class="${p}-nah ${p}-naht" d="${daumen2}"/>`;
  // V: Scheitel in der Kuhle zwischen Daumen und Zeigefinger, genau auf der oberen Kante
  const v = `<path class="${p}-v" d="M${P(L(32, -13))}L${P(L(4, -3))}L${P(L(38, 6))}"/>`;
  const vtP = L(54, -24);
  const vt = `<text class="${p}-vt" x="${vtP[0].toFixed(1)}" y="${(vtP[1] + 8).toFixed(1)}">V</text>`;
  schreibe('G-001', datei({
    aria: 'Der Universalgriff: die Hand hält den Griff locker wie einen Händedruck, zwischen Daumen und Zeigefinger bildet sich ein klares V auf der oberen Kante des Griffs.',
    caption: 'locker wie ein Händedruck · Daumen-V oben', captionY: 272,
    stilOpt: { extra: [
      `.${p}-band{fill:var(--primaer-weich,#e8f3fe);stroke:var(--primaer,#38a4f1);stroke-width:3}`,
      `.${p}-wickel{fill:none;stroke:var(--primaer,#38a4f1);stroke-width:2;opacity:.35;stroke-linecap:round}`,
      `.${p}-kante{fill:none;stroke:var(--primaer-tief,#1568ad);stroke-width:2.4;stroke-linecap:round;stroke-dasharray:6 5}`,
      `.${p}-v{fill:none;stroke:var(--primaer,#38a4f1);stroke-width:5;stroke-linecap:round;stroke-linejoin:round}`,
      `.${p}-stopp{stop-color:var(--tinte,#16202b)}`,
      `.${p}-stopp-aus{stop-opacity:0}`,
      `.${p}-vt{fill:var(--primaer-tief,#1568ad);font:700 22px/1 system-ui,sans-serif;text-anchor:middle}`,
    ].join('') },
    inhalt: verlauf + schl + hand + v + vt,
  }));
}
function norm2(a) { const l = Math.hypot(a[0], a[1]); return [a[0] / l, a[1] / l]; }
