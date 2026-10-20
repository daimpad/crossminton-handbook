// Schreibt die fünf Prototypen der Richtung „Klare Linie“ als <ID>.svg in diesen Ordner.
// node motive.mjs [G-002 …]
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { figur, datei, marker, speeder, schatten, kurve, add, dirv, lerp, winkelVon, schwung, treffer, huelle, zeichne } from './figur.mjs';

const HIER = dirname(fileURLToPath(import.meta.url));
const r1 = (n) => Math.round(n * 10) / 10;
const auf = (x, boden, H, hub = 0) => ({ x, y: boden - 0.23 * H - hub }); // Knöchel über dem Boden
const abstand = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// Boden in Perspektive (Feld), Ecken: hinten links, hinten rechts, vorn rechts, vorn links
const feld = (e) => `<path class="li-feld" d="M${e.map((p) => `${p.x},${p.y}`).join('L')}Z"/>`;
function diagonalenMitte([a, b, c, d]) { // Schnitt der Diagonalen a–c und b–d
  const x1 = a.x, y1 = a.y, x2 = c.x, y2 = c.y, x3 = b.x, y3 = b.y, x4 = d.x, y4 = d.y;
  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
  return { x: x1 + t * (x2 - x1), y: y1 + t * (y2 - y1) };
}

const MOTIVE = {};

// ---------- G-002 Grundposition (Dreiviertel von vorn) ----------
// Dreiviertel statt frontal: nur so werden gebeugtes Knie, vorgeneigter Rumpf und
// angehobene Ferse sichtbar, die Schrittbreite bleibt lesbar. Kamera waagerecht —
// beide Füße stehen auf derselben Bodenlinie.
MOTIVE['G-002'] = () => {
  const boden = 240, H = 29.5, dreh = 32;
  const rx = -Math.cos((dreh * Math.PI) / 180), fx = Math.sin((dreh * Math.PI) / 180);
  const B = { x: 146, y: 145 };
  const fussX = (seitlich, vor) => B.x + (seitlich * rx + vor * fx) * H; // körpereigen → Bild
  const fig = figur({
    H, becken: B, dreh, rumpf: 11, rumpfK: 0.95, kopf: -6,
    beine: {
      rechts: { ziel: auf(fussX(1.08, 0.25), boden, H, 3), knick: -1, fuss: { winkel: 62, k: 0.66 } },
      links: { ziel: auf(fussX(-1.08, 0.25), boden, H, 3), knick: -1, fuss: { winkel: 64, k: 0.64 }, ebene: 'nah' },
    },
    arme: {
      rechts: { winkel: [4, 78], k: [0.92, 0.5], hand: { art: 'griff', winkel: 95 }, schlaeger: { winkel: 206, flaeche: 0.8, k: 0.78 } },
      links: { winkel: [10, 46], k: [0.95, 0.8], hand: { art: 'locker', winkel: 30, daumen: -1 }, ebene: 'nah' },
    },
  });
  const g = fig.gelenke;
  const inhalt = schatten(150, boden, 70)
    + `<path class="li-boden" d="M66,${boden}H234"/>`
    + fig.svg
    + [g.ballen_rechts, g.ballen_links].map((b) => `<circle class="li-punkt" cx="${r1(b.x)}" cy="${r1(boden + 0.2)}" r="3.4"/>`).join('');
  return datei({
    aria: 'Die Grundposition: Füße etwas mehr als schulterbreit, Knie gebeugt, Gewicht auf den Fußballen, Schläger locker vor dem Körper.',
    inhalt, caption: 'Knie gebeugt · Gewicht auf den Fußballen', captionY: 268,
  });
};

// ---------- G-010 Überkopfschlag (von der Seite) ----------
MOTIVE['G-010'] = () => {
  const boden = 248, H = 22;
  const fig = figur({
    H, becken: { x: 104, y: 171 }, dreh: 62, rumpf: -3, kopf: -8,
    beine: {
      links: { ziel: auf(134, boden, H), knick: 1, fuss: { winkel: 90 } },
      rechts: { ziel: auf(70, boden, H, 6), knick: -1, fuss: { winkel: 124 } },
    },
    arme: {
      rechts: { winkel: [187, 180], hand: { art: 'griff' }, schlaeger: { winkel: 140, flaeche: 0.62 } },
      links: { winkel: [12, 128], k: [1, 0.62], hand: { art: 'faust', winkel: 120 } },
    },
  });
  const g = fig.gelenke, rk = g.schlaeger, S = g.schulter_rechts;
  const treff = rk.kopfMitte;
  const sp = add(treff, dirv(110), 19);
  const bahn = kurve([add(sp, dirv(110), 5), { x: 208, y: 24 }, { x: 256, y: 58 }, { x: 278, y: 168 }]);
  const radius = abstand(S, treff), wTreff = winkelVon(S, treff);
  const inhalt = schatten(102, boden, 46)
    + `<path class="li-boden" d="M46,${boden}H194"/>`
    + schwung(S, radius, wTreff + 62, wTreff + 6, 11)
    + fig.svg
    + treffer(treff, 16, wTreff + 30, 6)
    + `<path class="li-bahn" d="${bahn}" marker-end="url(#li010-p)"/>`
    + speeder(sp, 110, 7);
  return datei({
    aria: 'Der Überkopfschlag: hoher Treffpunkt über dem Kopf, gestreckter Schlagarm, die Flugbahn zieht in hohem, tiefem Bogen weit ins gegnerische Feld.',
    inhalt, defs: marker('li010-p'), caption: 'hoher Treffpunkt · tiefer Bogen ins Feld', captionY: 274,
  });
};

// ---------- G-008 Beinarbeit: Ausfallschritt in die Ecke, zurück zur Mitte ----------
MOTIVE['G-008'] = () => {
  const ecken = [{ x: 30, y: 180 }, { x: 214, y: 180 }, { x: 286, y: 250 }, { x: 6, y: 250 }];
  const mitte = diagonalenMitte(ecken);
  const H = 24;
  const vorn = { x: 230, y: 244 }, hinten = { x: 124, y: 222 };
  const fig = figur({
    H, becken: { x: 192, y: 186 }, dreh: 58, rumpf: 22, kopf: 8,
    beine: {
      rechts: { ziel: auf(vorn.x, vorn.y, H), knick: -1, fuss: { winkel: 80, k: 0.85 } },
      links: { ziel: auf(hinten.x, hinten.y, H, 5), knick: -1, fuss: { winkel: 116, k: 0.8 } },
    },
    arme: {
      rechts: { winkel: [62, 50], hand: { art: 'griff' }, schlaeger: { winkel: 40, flaeche: 0.6 } },
      links: { winkel: [-118, -104], k: [0.95, 0.9], hand: { art: 'locker', winkel: -100 } },
    },
  });
  const rk = fig.gelenke.schlaeger;
  const sp = add(rk.kopfMitte, dirv(-60), 16);
  const weg = kurve([{ x: vorn.x - 30, y: vorn.y + 3 }, { x: 176, y: 244 }, { x: mitte.x - 4, y: mitte.y + 20 }, { x: mitte.x - 12, y: mitte.y + 8 }]);
  const inhalt = feld(ecken)
    + `<ellipse class="li-ring" cx="${r1(mitte.x)}" cy="${r1(mitte.y)}" rx="18" ry="6.5"/><ellipse class="li-punkt" cx="${r1(mitte.x)}" cy="${r1(mitte.y)}" rx="6.5" ry="2.5"/>`
    + schatten(vorn.x, vorn.y + 1, 20) + schatten(hinten.x + 6, hinten.y + 1, 15)
    + `<path class="li-weg" d="${weg}" marker-end="url(#li008-p)"/>`
    + fig.svg
    + speeder(sp, -60, 6.5);
  return datei({
    aria: 'Beinarbeit, Bild 2: der Bewegungskreislauf — mit einem Ausfallschritt in die Ecke den Speeder spielen und auf gebogenem Weg zurück zur zentralen Position in der Mitte.',
    inhalt, defs: marker('li008-p', 'li-pfeilg'), caption: 'zur Ecke ausfallen — zurück zur Mitte', captionY: 274,
  });
};

// ---------- G-043 Verständigung im Paar (von hinten) ----------
// Crossminton-Doppel: feste Ordnung vorn/hinten. Der vordere Partner gibt das Zeichen
// verdeckt hinter dem Rücken, der hintere sieht es — beide von hinten gesehen.
MOTIVE['G-043'] = () => {
  const ecken = [{ x: 80, y: 146 }, { x: 228, y: 146 }, { x: 288, y: 252 }, { x: 20, y: 252 }];
  const Hv = 19, Hh = 25;
  const vornFuss = 182, hintenFuss = 244;
  const stand = (fuss, H) => fuss - 3.55 * H; // Becken über dem Boden: Beine fast gestreckt
  const vornFig = figur({
    H: Hv, becken: { x: 184, y: stand(vornFuss, Hv) }, dreh: 180, rumpf: 1,
    beine: {
      links: { ziel: auf(175, vornFuss, Hv), knick: 1, fuss: { winkel: 184, k: 0.32 } },
      rechts: { ziel: auf(194, vornFuss, Hv), knick: -1, fuss: { winkel: 176, k: 0.32 } },
    },
    arme: {
      links: { winkel: [9, 66], k: [1, 0.52], hand: { art: 'zeichen', winkel: 60, fingerWinkel: 4, daumen: 1 } },
      rechts: { winkel: [12, 8], hand: { art: 'griff' }, schlaeger: { winkel: 14, flaeche: 0.45 } },
    },
  });
  const hintenFig = figur({
    H: Hh, becken: { x: 104, y: hintenFuss - 3.57 * Hh }, dreh: 172, blick: 150, rumpf: -1, kopf: 3,
    beine: {
      links: { ziel: auf(92, hintenFuss, Hh), knick: 1, fuss: { winkel: 186, k: 0.32 } },
      rechts: { winkel: [5, 1], k: [0.97, 0.97], fuss: { winkel: 172, k: 0.32 } },
    },
    arme: {
      links: { winkel: [-8, 6], hand: { art: 'locker' } },
      rechts: { winkel: [14, 26], hand: { art: 'griff' }, schlaeger: { winkel: 34, flaeche: 0.5 } },
    },
  });
  const zeichenHand = vornFig.gelenke.hand_links;
  const kopf = hintenFig.gelenke.kopf;
  const blickStart = add(kopf, { x: 0.94, y: -0.34 }, 14);
  const blickZiel = add(zeichenHand, { x: -0.9, y: -0.44 }, 15);
  const blick = kurve([blickStart, { x: (blickStart.x + blickZiel.x) / 2, y: Math.min(blickStart.y, blickZiel.y) - 6 }, blickZiel]);
  const inhalt = feld(ecken)
    + schatten(184, vornFuss, 22) + vornFig.svg
    + `<circle class="li-ring" cx="${r1(zeichenHand.x)}" cy="${r1(zeichenHand.y + 4)}" r="12"/>`
    + schatten(104, hintenFuss, 30) + hintenFig.svg
    + `<path class="li-blick" d="${blick}"/>`;
  return datei({
    aria: 'Verständigung im Paar: zwei Doppelpartner von hinten, die sich zwischen den Punkten abstimmen — einer gibt hinter dem Rücken ein verdecktes Handzeichen.',
    inhalt, caption: 'verdecktes Handzeichen · Verständigung', captionY: 274,
  });
};

// ---------- G-001 Universalgriff (Nahaufnahme, Handarbeit) ----------
// Eine Hand in Nahaufnahme ist kein Ganzkörperskelett: die Figur-Pose hilft hier nicht.
// Gezeichnet wird in einem Griff-Koordinatensystem (a längs zum Schlägerkopf, b quer,
// +b = Handrücken-/Fingerseite, −b = Daumenseite = obere Kante), mit denselben Bausteinen
// wie die Figuren: Kreis-Hüllen, Silhouette kräftig, Innenkanten fein, Haut hell.
// Geometrie: Unterarm waagerecht nach links aus dem Bild, Griff 40° nach rechts oben —
// 140° zwischen Unterarm und Schläger wie beim Händedruck; die Daumenseite liegt im
// Innenwinkel und damit oben.
MOTIVE['G-001'] = () => {
  const O = { x: 158, y: 166 }, M = 1.42; // Maßstab der Nahaufnahme
  const w = (-40 * Math.PI) / 180;
  const u = { x: Math.cos(w), y: Math.sin(w) }, n = { x: -u.y, y: u.x };
  const L = (a, b) => ({ x: O.x + M * (a * u.x + b * n.x), y: O.y + M * (a * u.y + b * n.y) });
  const K = (a, b, r) => ({ ...L(a, b), r: r * M });
  const F = { a: -u.x, b: -n.x }; // Unterarmrichtung (Bild: nach links) im Griffsystem
  const W = (t, r) => K(-34 + F.a * t, -8 + F.b * t, r);
  const seg = (pkte) => 'M' + pkte.map((p) => `${r1(p.x)},${r1(p.y)}`).join('L');
  const hw = 11;
  const griff = huelle([K(-62, 0, hw - 0.5), K(-40, 0, hw - 1), K(52, 0, hw - 1.5)]);
  const kappe = huelle([K(-68, 0, hw + 1.2), K(-63, 0, hw + 1.2)]);
  const schaft = seg([L(54, 0), L(230, 0)]);
  let band = '';
  for (let a = -56; a <= 46; a += 10) band += seg([L(a, -hw + 1), L(a + 8, hw - 1)]);
  const oberkante = seg([L(-58, -hw + 3), L(56, -hw + 3)]);
  const unterarm = huelle([W(0, 14), W(30, 17), W(110, 20), W(200, 21)]);
  const ballen = huelle([K(-34, 6, 14), K(-12, 13, 14), K(10, 12, 12.5), K(22, 8, 10), K(-38, -6, 13)]);
  const finger = [ // vom kleinen Finger zum Zeigefinger: schlank, leicht gestaffelt, Zeigefinger vorgesetzt
    { von: [-17, 17], bis: [-12, -hw + 8], r: 5 },
    { von: [-4, 19], bis: [1, -hw + 6.5], r: 5.6 },
    { von: [9, 19], bis: [15, -hw + 6], r: 5.7 },
    { von: [23, 16], bis: [33, -hw + 5], r: 5.4 },
  ];
  const fingerFormen = finger.map((f) => huelle([K(f.von[0], f.von[1], f.r + 0.8), K((f.von[0] + f.bis[0]) / 2 + 0.5, (f.von[1] + f.bis[1]) / 2, f.r + 0.3), K(f.bis[0], f.bis[1], f.r - 0.4)]));
  const fingerFalten = finger.map((f) => { const m = { a: f.von[0] + (f.bis[0] - f.von[0]) * 0.52, b: f.von[1] + (f.bis[1] - f.von[1]) * 0.52 }; return seg([L(m.a - f.r * 0.7, m.b + 0.6), L(m.a + f.r * 0.7, m.b - 0.6)]); });
  const daumen = huelle([K(-40, -hw - 2, 11), K(-18, -hw - 3.5, 8.2), K(2, -hw - 3, 6.8), K(12, -hw - 2, 6)]);
  const nagel = seg([L(8, -hw - 6.5), L(14, -hw - 5.5)]);
  const handgelenk = kurve([K(-46, -20, 0), K(-50, -6, 0), K(-47, 10, 0)]);
  const schichten = [
    { formen: [unterarm], mat: 'haut', fein: [handgelenk] },
    { roh: `<path class="li-schaft li-schaft-g" d="${schaft}"/><path class="li-griff" d="${griff}"/><path class="li-griffband" d="${band}"/><path class="li-griff" d="${kappe}"/><path class="li-kante" d="${oberkante}"/>` },
    { formen: [ballen], mat: 'haut' },
    ...fingerFormen.map((f, i) => ({ formen: [f], mat: 'haut', fein: [fingerFalten[i]] })),
    { formen: [daumen], mat: 'haut', fein: [nagel] },
  ];
  const spitze = L(4, -hw - 1);
  const vPfad = seg([L(26, -hw - 8), spitze, L(30, -hw + 3)]);
  const vText = L(32, -hw - 22);
  const inhalt = zeichne([], schichten)
    + `<path class="li-v" d="${vPfad}"/><circle class="li-punkt" cx="${r1(spitze.x)}" cy="${r1(spitze.y)}" r="3"/>`
    + `<text class="li-vt" x="${r1(vText.x)}" y="${r1(vText.y)}">V</text>`;
  return datei({
    aria: 'Der Universalgriff: die Hand hält den Griff locker wie einen Händedruck, zwischen Daumen und Zeigefinger bildet sich ein klares V auf der oberen Kante des Griffs.',
    inhalt, caption: 'locker wie ein Händedruck · Daumen-V oben', captionY: 272,
    extraStil: `.li-schaft-g{stroke-width:7}
    .li-griffband{fill:none;stroke:var(--flaeche,#fff);stroke-width:1.1;opacity:.35}
    .li-kante{fill:none;stroke:var(--primaer-weich,#e8f3fe);stroke-width:1.4;stroke-dasharray:4 4;opacity:.9}
    .li-v{fill:none;stroke:var(--primaer,#38a4f1);stroke-width:3.4;stroke-linecap:round;stroke-linejoin:round}
    .li-vt{fill:var(--primaer-tief,#1568ad);font:700 22px/1 system-ui,sans-serif;text-anchor:middle}`,
  });
};

const gewaehlt = process.argv.slice(2);
for (const [id, bau] of Object.entries(MOTIVE)) {
  if (gewaehlt.length && !gewaehlt.includes(id)) continue;
  const pfad = join(HIER, `${id}.svg`);
  writeFileSync(pfad, bau());
  console.log(pfad);
}
