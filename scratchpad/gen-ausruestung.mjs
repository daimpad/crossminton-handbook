// Erzeugt die Diagramme der Welle A in allen vier Sprachen: die Ausrüstungs-Grafiken G-068
// (Griffstärke), G-069 (Schläger im Vergleich), G-070 (Saitenstärke und Härte der Bespannung),
// G-073 (Schuhe: Laufwege im Vergleich), das Taktik-Diagramm G-071 (Fehler vermeiden) und aus
// Welle B das Athletik-Diagramm G-076 (antizipative Schnelligkeit), aus Welle C die Night-Speeder-
// Tafel G-079 (Blackminton).
//   node scratchpad/gen-ausruestung.mjs
// Anders als die Speeder-Tafeln stehen die Texte hier direkt im Generator (TEXTE), je Sprache;
// die Geometrie hängt nie an der Sprache, die vier Fassungen unterscheiden sich nur im Text.
//
// Stilregeln wie bei den übrigen Grafiken: Farben nur als var(--token, #hellwert), Klassen mit
// dem Präfix s- (außer der Caption .st), der Stilblock nur aus Klassenselektoren (Test [22]).
// Akzent (--primaer-dunkel) trägt genau das eine didaktische Element je Bild.
//
// SACHGRUNDLAGE (Texte der Bausteine, nicht erfunden):
//   G-068 griff_und_griffband: zwischen Fingerspitzen und Handballen etwa ein Zeigefinger
//         Platz; zu dünn → die Fingerspitzen bohren sich in den Ballen. Dieselbe Hand auf
//         einem dünneren Griff reicht weiter herum: die Länge der Hand ist in beiden
//         Fassungen gleich (LAENGE), nur der Griff wechselt.
//   G-069 der_schlaeger: höchstens 61 cm lang, Kopf höchstens 650 cm²; kürzer als der
//         Squashschläger, robuster als der Badmintonschläger. Maßstab 3 Einheiten je cm.
//         Vergleichslängen: Badminton 67,5 cm, Squash 68,5 cm (übliche Längen, Regelgrenzen
//         68 bzw. 68,6 cm). Der Crossminton-Kopf mit 30 × 26 cm hat 612 cm² (≤ 650).
//   G-070 die_bespannung: Saite bis etwa 1,25 mm, Badminton rund 0,65 mm (Maßstab 40 je mm);
//         Trampolin-Modell: weich → mehr Kraft, hart → mehr Kontrolle.
//   G-071 fehler_vermeiden: Punkte gehen verloren, wenn der Speeder ins Aus oder in die
//         Passierzone geht; sicher spielen heißt, ihn mit Sicherheitsabstand nach innen zu
//         setzen statt auf die Linie. Feld 5,5 m = 180 Einheiten, Abstand nach innen 24 (gut
//         70 cm, ein Schritt).
//   G-073 schuhe_finden: Badminton- und Squashschuhe sind für vor und zurück gebaut (Netz,
//         Frontwand); das Crossminton-Feld ist ein Quadrat mit vier gleichwertigen Ecken um ein
//         Zentrum, gefragt ist der sichere Ausfallschritt in jede Richtung.
//   G-076 antizipative_schnelligkeit: wer die Vorbereitung des Gegners liest, startet früher und
//         ist eher am Ball, ohne schneller zu laufen. Beide Laufwege sind darum gleich lang
//         (gleiches Tempo), nur der Start liegt verschieden.
//   G-079 blackminton: Night Speeder mit durchsichtiger Kappe, in die ein Speedlight (Knicklicht)
//         gedrückt wird; es leuchtet rund drei Stunden. Im Dunkeln bleibt vom Speeder nur der
//         Lichtpunkt, dessen Bahn man liest. Schlagkappe oben wie in G-065 (2 Einheiten je mm:
//         Kappe ⌀26 × 15, Kragen ⌀30 × 10, Korb ⌀19 → ⌀50 über 35 mm).
import { writeFileSync } from 'node:fs';

const ZIEL = 'images';
const SPRACHEN = ['de', 'en', 'fr', 'pl'];
const r1 = (n) => Math.round(n * 10) / 10;
const P = (x, y) => `${r1(x)},${r1(y)}`;

const STIL = `  <style>
    .s-griff{fill:var(--flaeche,#fff);stroke:var(--tinte-2,#5a6675);stroke-width:1.6;stroke-linejoin:round}
    .s-hand{fill:var(--tinte,#16202b);stroke:var(--flaeche-2,#f1f5fb);stroke-width:2;stroke-linejoin:round}
    .s-kerbe{fill:none;stroke:var(--flaeche-2,#f1f5fb);stroke-width:1.6;stroke-linecap:round}
    .s-links{text-anchor:start}
    .s-rechts{text-anchor:end}
    .s-druck{fill:none;stroke:var(--tinte-3,#656f7e);stroke-width:1.6;stroke-linecap:round}
    .s-finger{fill:var(--primaer-weich,#e8f3fe);stroke:var(--primaer-dunkel,#1e8bd6);stroke-width:2}
    .s-rahmen{fill:none;stroke:var(--tinte-3,#656f7e);stroke-width:1.6}
    .s-saiten{fill:none;stroke:var(--tinte-3,#656f7e);stroke-width:0.6;opacity:.7}
    .s-schaft{fill:none;stroke:var(--tinte-3,#656f7e);stroke-linecap:round}
    .s-cmkopf{fill:var(--primaer-weich,#e8f3fe);stroke:var(--primaer-dunkel,#1e8bd6);stroke-width:3.4}
    .s-cmsaiten{fill:none;stroke:var(--primaer-dunkel,#1e8bd6);stroke-width:0.7;opacity:.55}
    .s-cmschaft{fill:none;stroke:var(--primaer-dunkel,#1e8bd6);stroke-linecap:round}
    .s-masz{fill:none;stroke:var(--tinte-3,#656f7e);stroke-width:1.2}
    .s-pfeil{fill:var(--tinte-3,#656f7e)}
    .s-apfeil{fill:var(--primaer-dunkel,#1e8bd6)}
    .s-saite{fill:var(--tinte,#16202b)}
    .s-saite2{fill:none;stroke:var(--tinte,#16202b);stroke-width:1.6}
    .s-bett{fill:none;stroke:var(--tinte,#16202b);stroke-width:2.2;stroke-linecap:round}
    .s-rahmenstueck{fill:var(--tinte-2,#5a6675)}
    .s-faecher{fill:var(--primaer-weich,#e8f3fe);stroke:var(--primaer-dunkel,#1e8bd6);stroke-width:1;stroke-dasharray:2 3}
    .s-flug{fill:none;stroke:var(--primaer-dunkel,#1e8bd6);stroke-width:2.4;stroke-linecap:round}
    .s-ball{fill:var(--tinte,#16202b)}
    .s-trenner{fill:none;stroke:var(--tinte-3,#656f7e);stroke-width:1;stroke-dasharray:3 4;opacity:.7}
    .s-titel{fill:var(--tinte,#16202b);font:700 12px/1 system-ui,sans-serif;text-anchor:middle}
    .s-name{fill:var(--tinte-2,#5a6675);font:600 11px/1 system-ui,sans-serif;text-anchor:middle}
    .s-name2{fill:var(--primaer-tief,#1568ad);font:700 11px/1 system-ui,sans-serif;text-anchor:middle}
    .s-teil{fill:var(--tinte-3,#656f7e);font:600 10px/1 system-ui,sans-serif;text-anchor:middle;paint-order:stroke;stroke:var(--flaeche-2,#f1f5fb);stroke-width:3;stroke-linejoin:round}
    .s-teilw{fill:var(--tinte,#16202b);font:600 10px/1 system-ui,sans-serif;text-anchor:middle;paint-order:stroke;stroke:var(--primaer-weich,#e8f3fe);stroke-width:3;stroke-linejoin:round}
    .s-zahl{fill:var(--tinte,#16202b);font:700 11px/1 system-ui,sans-serif;text-anchor:middle;paint-order:stroke;stroke:var(--flaeche-2,#f1f5fb);stroke-width:4;stroke-linejoin:round}
    .st{fill:var(--tinte-3,#656f7e);font:600 12px/1 system-ui,sans-serif;text-anchor:middle}
  </style>`;

// Zusätzliche Klassen der späteren Diagramme (G-071, G-073). Diese Grafiken bekommen nur die
// Klassen, die sie benutzen (stilFuer); G-068–G-070 behalten ihren Stilblock unverändert.
const STIL_NEU = `    .s-feld{fill:none;stroke:var(--tinte,#16202b);stroke-width:2.4}
    .s-sicher{fill:var(--primaer-weich,#e8f3fe);stroke:var(--primaer-dunkel,#1e8bd6);stroke-width:1.4;stroke-dasharray:5 4}
    .s-risiko{fill:none;stroke:var(--tinte-3,#656f7e);stroke-width:1.8;stroke-dasharray:5 4}
    .s-kreuz{fill:none;stroke:var(--tinte-2,#5a6675);stroke-width:2.4;stroke-linecap:round}
    .s-punkt{fill:var(--primaer-dunkel,#1e8bd6)}
    .s-spieler{fill:var(--tinte,#16202b);stroke:var(--flaeche-2,#f1f5fb);stroke-width:2}
    .s-weg{fill:none;stroke:var(--tinte-3,#656f7e);stroke-width:2.6;stroke-linecap:round}
    .s-wegn{fill:none;stroke:var(--tinte-3,#656f7e);stroke-width:1.2;stroke-linecap:round;opacity:.8}
    .s-wegc{fill:none;stroke:var(--primaer-dunkel,#1e8bd6);stroke-width:2.6;stroke-linecap:round}
    .s-wand{fill:none;stroke:var(--tinte,#16202b);stroke-width:5;stroke-linecap:round}
    .s-zone{fill:var(--tinte-3,#656f7e);font:700 10px/1 system-ui,sans-serif;letter-spacing:.5px;text-anchor:start;paint-order:stroke;stroke:var(--flaeche-2,#f1f5fb);stroke-width:4;stroke-linejoin:round}
    .s-tsicher{fill:var(--primaer-tief,#1568ad);font:700 11px/1 system-ui,sans-serif;text-anchor:middle;paint-order:stroke;stroke:var(--primaer-weich,#e8f3fe);stroke-width:4;stroke-linejoin:round}
    .s-achse{fill:none;stroke:var(--tinte-2,#5a6675);stroke-width:1.6}
    .s-marke{fill:none;stroke:var(--tinte-3,#656f7e);stroke-width:1.2;stroke-dasharray:3 4}
    .s-lauf{fill:none;stroke:var(--primaer-dunkel,#1e8bd6);stroke-width:7;stroke-linecap:round}
    .s-laufg{fill:none;stroke:var(--tinte-3,#656f7e);stroke-width:7;stroke-linecap:round}
    .s-reserve{fill:none;stroke:var(--primaer-dunkel,#1e8bd6);stroke-width:1.4;stroke-dasharray:2 3}
    .s-spaet{fill:none;stroke:var(--tinte-2,#5a6675);stroke-width:1.4}
    .s-start{fill:var(--flaeche-2,#f1f5fb);stroke:var(--tinte,#16202b);stroke-width:1.8}
    .s-tlinks{fill:var(--tinte,#16202b);font:700 11px/1 system-ui,sans-serif;text-anchor:start;paint-order:stroke;stroke:var(--flaeche-2,#f1f5fb);stroke-width:5;stroke-linejoin:round}
    .s-akzenth{fill:var(--primaer-tief,#1568ad);font:700 11px/1 system-ui,sans-serif;text-anchor:middle;paint-order:stroke;stroke:var(--flaeche-2,#f1f5fb);stroke-width:4;stroke-linejoin:round}
    .s-kappeklar{fill:var(--flaeche,#fff);stroke:var(--tinte-3,#656f7e);stroke-width:1.6}
    .s-kragen{fill:var(--tinte-2,#5a6675)}
    .s-korbfl{fill:var(--speeder-korb-flaeche,#f1e7b5);stroke:var(--speeder-korb,#f0c400);stroke-width:1.8;stroke-linejoin:round}
    .s-stiel{fill:none;stroke:var(--speeder-korb,#f0c400);stroke-width:1.3}
    .s-glimm{fill:var(--primaer-weich,#e8f3fe)}
    .s-licht{fill:var(--primaer-dunkel,#1e8bd6)}
    .s-punkt1{fill:var(--primaer-dunkel,#1e8bd6);opacity:.3}
    .s-punkt2{fill:var(--primaer-dunkel,#1e8bd6);opacity:.6}
    .s-tleise{fill:var(--tinte-3,#656f7e);font:600 10px/1 system-ui,sans-serif;text-anchor:start;paint-order:stroke;stroke:var(--flaeche-2,#f1f5fb);stroke-width:4;stroke-linejoin:round}`;

function stilFuer(inhalt) {
  const benutzt = new Set([...inhalt, MARKER].join('\n').match(/class="[^"]*"/g).flatMap((k) => k.slice(7, -1).split(' ')));
  const zeilen = (STIL.split('\n').slice(1, -1).join('\n') + '\n' + STIL_NEU).split('\n');
  return `  <style>\n${zeilen.filter((z) => benutzt.has(z.trim().slice(1, z.trim().indexOf('{')))).join('\n')}\n  </style>`;
}

const MARKER = `  <defs>
    <marker id="mp" viewBox="0 0 10 10" markerWidth="7" markerHeight="7" refX="8.5" refY="5" orient="auto-start-reverse">
      <path d="M1,1 L9,5 L1,9 Z" class="s-pfeil"/>
    </marker>
    <marker id="ma" viewBox="0 0 10 10" markerWidth="6" markerHeight="6" refX="8" refY="5" orient="auto">
      <path d="M1,1 L9,5 L1,9 Z" class="s-apfeil"/>
    </marker>
  </defs>`;

const datei = (breite, hoehe, aria, inhalt, stil = STIL) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${breite} ${hoehe}" role="img" aria-label="${aria}">
${stil}
${MARKER}

${inhalt.join('\n')}
</svg>
`;

const text = (klasse, x, y, t) => `  <text class="${klasse}" x="${r1(x)}" y="${r1(y)}">${t}</text>`;

// ---------------------------------------------------------------------------------------------
// G-068 Griffstärke: zwei Griffe im Schnitt (Blick auf das Griffende), die Hand als Band darum.

const RAD = Math.PI / 180;
const polar = (c, r, w) => [c[0] + r * Math.cos(w * RAD), c[1] + r * Math.sin(w * RAD)];
// Achteckiger Griff (Kanten oben/unten waagerecht)
const achteck = (c, r) => `M${Array.from({ length: 8 }, (_, i) => P(...polar(c, r, 22.5 + 45 * i))).join('L')}Z`;

// Die Hand als Band um den Griff: beginnt am Handballen (dick) und läuft im Uhrzeigersinn um den
// Griff bis zu den Fingerspitzen (dünner). Innen liegt sie am Griff an, s = 0 … 1 entlang der Hand.
// Die Länge der Hand ist in beiden Fassungen gleich; auf dem dünnen Griff reicht sie darum weiter
// herum — über eine volle Runde hinaus, und die Fingerspitzen liegen auf dem Ballen.
const K = 1.12;              // Maßstab der Griffgrafik
const LAENGE = 214 * K;      // Länge der Hand entlang der Mittellinie
const MITTE = 8 * K;         // Abstand der Mittellinie von der Innenkante
const dicke = (s) => K * (s < 0.22 ? 25 - s * 14 : s < 0.5 ? 21.9 - (s - 0.22) * 28 : 14 - (s - 0.5) * 7);

// Ein Abschnitt des Bandes von s0 bis s1 als geschlossener Pfad mit runden Enden (nur wo die Hand
// wirklich endet). hub hebt den Abschnitt nach außen, damit er auf dem Ballen aufliegt.
function abschnitt(c, rInnen, wStart, bogen, s0, s1, { hub = 0, kappe0 = false, kappe1 = false } = {}) {
  const n = Math.max(8, Math.round((s1 - s0) * 80)), aussen = [], innen = [];
  for (let i = 0; i <= n; i++) {
    const s = s0 + ((s1 - s0) * i) / n, w = wStart + bogen * s;
    innen.push(polar(c, rInnen + hub, w));
    aussen.push(polar(c, rInnen + hub + dicke(s), w));
  }
  const bogenZu = (a, b) => { const r = Math.hypot(a[0] - b[0], a[1] - b[1]) / 2; return `A${r1(r)},${r1(r)} 0 0 1 ${P(...b)}`; };
  return `M${aussen.map((p) => P(...p)).join('L')}` + (kappe1 ? bogenZu(aussen[n], innen[n]) : `L${P(...innen[n])}`) +
    `L${innen.slice(0, n).reverse().map((p) => P(...p)).join('L')}` + (kappe0 ? bogenZu(innen[0], aussen[0]) : '') + 'Z';
}

// Fingergelenke als schmale Kerben quer über das Band (Freistellung in --flaeche-2)
const kerben = (c, rInnen, wStart, bogen, liste, hub = 0) => liste.map((s) => {
  const w = wStart + bogen * s, a = polar(c, rInnen + hub + 2, w), b = polar(c, rInnen + hub + dicke(s) - 2, w);
  return `M${P(...a)}L${P(...b)}`;
}).join('');

// Leere Kerben-Liste ergibt keinen Pfad (ein leeres d wäre ungültig)
const kerbenPfad = (d) => (d ? [`  <path class="s-kerbe" d="${d}"/>`] : []);

function hand(c, rInnen, wStart) {
  const bogen = (LAENGE / (rInnen + MITTE)) / RAD;
  const voll = 360 / bogen; // s, bei dem die Hand eine volle Runde erreicht
  const teile = [];
  if (voll >= 1) {
    teile.push(`  <path class="s-hand" d="${abschnitt(c, rInnen, wStart, bogen, 0, 1, { kappe0: true, kappe1: true })}"/>`);
    teile.push(...kerbenPfad(kerben(c, rInnen, wStart, bogen, [0.56, 0.78])));
  } else {
    // Bis kurz vor die volle Runde am Griff, der Rest liegt außen auf dem Ballen.
    const knick = voll - 0.04;
    teile.push(`  <path class="s-hand" d="${abschnitt(c, rInnen, wStart, bogen, 0, knick, { kappe0: true })}"/>`);
    teile.push(...kerbenPfad(kerben(c, rInnen, wStart, bogen, [0.56, 0.78].filter((s) => s < knick))));
    teile.push(`  <path class="s-hand" d="${abschnitt(c, rInnen, wStart, bogen, knick - 0.02, 1, { hub: 9 * K, kappe1: true })}"/>`);
    teile.push(...kerbenPfad(kerben(c, rInnen, wStart, bogen, [0.56, 0.78].filter((s) => s >= knick), 9 * K)));
  }
  return { teile, wEnde: wStart + bogen, bogen };
}

function G068(t) {
  const L = [80, 158], R = [218, 158];
  const rL = 20 * K, rR = 30 * K; // Griff: zu dünn / passend
  const iL = rL + 2, iR = rR + 2; // Innenkante der Hand
  // Passend: die Lücke liegt oben; Ballen rechts davon, Fingerspitzen links.
  const bogenR = (LAENGE / (iR + MITTE)) / RAD;
  const startR = -90 + (360 - bogenR) / 2 + 3;
  const hR = hand(R, iR, startR);
  const hL = hand(L, iL, startR);
  const mf = polar(R, iR + MITTE, -90 + 3);
  // Druckzeichen an der Stelle, wo die Fingerspitzen auf dem Ballen liegen
  const dp = polar(L, iL + 38, startR + 14);
  const druck = `M${P(dp[0] - 6, dp[1] - 2)}l5,-5M${P(dp[0] + 1, dp[1] + 2)}l7,-3M${P(dp[0] - 10, dp[1] - 7)}l2,-7`;
  const ballen = polar(R, iR + 26, startR + 6), spitze = polar(R, iR + 22, hR.wEnde - 6);
  const inhalt = [
    text('s-teil', 150, 22, t.blick),
    text('s-titel', L[0], 46, t.zuduenn),
    text('s-titel', R[0], 46, t.passend),
    `  <path class="s-trenner" d="M149,140 L149,236"/>`,
    `  <path class="s-griff" d="${achteck(L, rL)}"/>`,
    `  <path class="s-griff" d="${achteck(R, rR)}"/>`,
    ...hL.teile,
    ...hR.teile,
    `  <path class="s-druck" d="${druck}"/>`,
    `  <circle class="s-finger" cx="${r1(mf[0])}" cy="${r1(mf[1])}" r="${r1(8.5 * K)}"/>`,
    text('s-teil', L[0], 76, t.keinplatz),
    text('s-teil', mf[0], 80, t.finger),
    `  <text class="s-teil s-links" x="${r1(ballen[0] + 4)}" y="${r1(ballen[1] - 4)}">${t.ballen}</text>`,
    `  <text class="s-teil s-rechts" x="${r1(spitze[0] - 4)}" y="${r1(spitze[1] - 4)}">${t.spitzen}</text>`,
    text('st', 150, 268, t.cap),
  ];
  return datei(300, 300, t.aria, inhalt);
}

// ---------------------------------------------------------------------------------------------
// G-069 Schläger im Vergleich, maßstäblich (3 Einheiten je cm), Kopf oben.

const CM = 3, BASIS = 236;
function schlaeger(x, { laenge, kopfL, kopfB, griffL, griffB, schaftB, rahmen, kopfKlasse, saitenKlasse, schaftKlasse }) {
  const unten = BASIS, oben = BASIS - laenge * CM;
  const ry = (kopfL * CM) / 2, rx = (kopfB * CM) / 2, cy = oben + ry;
  const griffOben = unten - griffL * CM, gb = (griffB * CM) / 2;
  let saiten = '';
  for (let i = 1; i < 7; i++) { const q = -rx + (2 * rx * i) / 7, h = ry * Math.sqrt(1 - (q / rx) ** 2) * 0.93; saiten += `M${P(x + q, cy - h)}L${P(x + q, cy + h)}`; }
  for (let i = 1; i < 9; i++) { const q = -ry + (2 * ry * i) / 9, w = rx * Math.sqrt(1 - (q / ry) ** 2) * 0.93; saiten += `M${P(x - w, cy + q)}L${P(x + w, cy + q)}`; }
  return [
    `  <path class="${schaftKlasse}" stroke-width="${schaftB}" d="M${P(x, cy + ry)}L${P(x, griffOben)}"/>`,
    `  <rect class="${kopfKlasse}" x="${r1(x - gb)}" y="${r1(griffOben)}" width="${r1(2 * gb)}" height="${r1(unten - griffOben)}" rx="${r1(gb * 0.6)}"/>`,
    `  <ellipse class="${kopfKlasse}" cx="${r1(x)}" cy="${r1(cy)}" rx="${r1(rx)}" ry="${r1(ry)}" stroke-width="${rahmen}"/>`,
    `  <path class="${saitenKlasse}" d="${saiten}"/>`,
  ].join('\n');
}

function G069(t) {
  const xB = 62, xC = 190, xS = 304;
  const cm = { laenge: 61, kopfL: 30, kopfB: 26, griffL: 19, griffB: 3, schaftB: 7, rahmen: 3.4, kopfKlasse: 's-cmkopf', saitenKlasse: 's-cmsaiten', schaftKlasse: 's-cmschaft' };
  const oben = BASIS - cm.laenge * CM, kopfMitte = oben + (cm.kopfL * CM) / 2;
  const xM = 140;
  const inhalt = [
    schlaeger(xB, { laenge: 67.5, kopfL: 25, kopfB: 20, griffL: 20, griffB: 2.6, schaftB: 2.2, rahmen: 1.6, kopfKlasse: 's-rahmen', saitenKlasse: 's-saiten', schaftKlasse: 's-schaft' }),
    schlaeger(xS, { laenge: 68.5, kopfL: 27, kopfB: 21.5, griffL: 24, griffB: 2.8, schaftB: 4, rahmen: 2.4, kopfKlasse: 's-rahmen', saitenKlasse: 's-saiten', schaftKlasse: 's-schaft' }),
    schlaeger(xC, cm),
    `  <path class="s-masz" d="M${P(xM - 8, oben)}L${P(xC - 8, oben)}M${P(xM - 8, BASIS)}L${P(xC - 30, BASIS)}"/>`,
    `  <path class="s-masz" d="M${P(xM, oben + 2)}L${P(xM, BASIS - 2)}" marker-start="url(#mp)" marker-end="url(#mp)"/>`,
    text('s-zahl', xM, (oben + BASIS) / 2 + 4, t.laenge),
    text('s-teilw', xC, kopfMitte - 3, t.kopf),
    text('s-teilw', xC, kopfMitte + 10, t.flaeche),
    text('s-name', xB, 254, t.badminton),
    text('s-name2', xC, 254, t.crossminton),
    text('s-name', xS, 254, t.squash),
    text('st', 180, 286, t.cap),
  ];
  return datei(360, 300, t.aria, inhalt);
}

// ---------------------------------------------------------------------------------------------
// G-070 Bespannung: oben die Saite im Querschnitt (40 Einheiten je mm), unten das Trampolin-Modell.

function bett(cx, tiefe, faecher, flugLaenge) {
  const y0 = 200, halb = 56, ballY = y0 + tiefe - 7;
  const kurve = `M${P(cx - halb, y0)} Q${P(cx, y0 + tiefe * 2)} ${P(cx + halb, y0)}`;
  const spitze = [cx, ballY - 14 - flugLaenge];
  const w = faecher * RAD, r = flugLaenge + 14;
  const facher = `M${P(cx, ballY - 8)} L${P(cx + r * Math.sin(-w), ballY - 8 - r * Math.cos(w))} A${r1(r)},${r1(r)} 0 0 1 ${P(cx + r * Math.sin(w), ballY - 8 - r * Math.cos(w))} Z`;
  return [
    `  <path class="s-faecher" d="${facher}"/>`,
    `  <rect class="s-rahmenstueck" x="${r1(cx - halb - 8)}" y="${y0 - 6}" width="8" height="12" rx="2"/>`,
    `  <rect class="s-rahmenstueck" x="${r1(cx + halb)}" y="${y0 - 6}" width="8" height="12" rx="2"/>`,
    `  <path class="s-bett" d="${kurve}"/>`,
    `  <circle class="s-ball" cx="${r1(cx)}" cy="${r1(ballY)}" r="6"/>`,
    `  <path class="s-flug" d="M${P(cx, ballY - 10)}L${P(...spitze)}" marker-end="url(#ma)"/>`,
  ].join('\n');
}

function G070(t) {
  const MM = 40;
  const cC = [100, 74], cB = [212, 74];
  const inhalt = [
    text('s-teil', 150, 22, t.querschnitt),
    `  <circle class="s-saite" cx="${cC[0]}" cy="${cC[1]}" r="${r1(1.25 * MM / 2)}"/>`,
    `  <circle class="s-saite2" cx="${cB[0]}" cy="${cB[1]}" r="${r1(0.65 * MM / 2)}"/>`,
    text('s-name2', cC[0], 118, t.crossminton),
    text('s-zahl', cC[0], 132, t.dickeC),
    text('s-name', cB[0], 118, t.badminton),
    text('s-zahl', cB[0], 132, t.dickeB),
    `  <path class="s-trenner" d="M24,146 L276,146"/>`,
    bett(82, 22, 22, 46),
    bett(218, 8, 10, 30),
    text('s-titel', 82, 238, t.weich),
    text('s-teil', 82, 251, t.kraft),
    text('s-titel', 218, 238, t.hart),
    text('s-teil', 218, 251, t.kontrolle),
    text('st', 150, 282, t.cap),
  ];
  return datei(300, 300, t.aria, inhalt);
}

// ---------------------------------------------------------------------------------------------
// G-071 Fehler vermeiden: das gegnerische Feld von oben, davor die Passierzone. Der sichere Ball
// landet einen Schritt innerhalb der Linien, die knappen landen im Aus oder in der Zone.

const kreuz = (x, y, r = 5) => `M${P(x - r, y - r)}L${P(x + r, y + r)}M${P(x + r, y - r)}L${P(x - r, y + r)}`;

function G071(t) {
  const F = [60, 30, 180], IN = 24; // Feld x, y, Kante; Sicherheitsabstand
  const unten = F[1] + F[2], ab = [150, 270];
  const sicher = [128, 124], aus = [264, 98], zone = [222, 238];
  const inhalt = [
    `  <rect class="s-sicher" x="${F[0] + IN}" y="${F[1] + IN}" width="${F[2] - 2 * IN}" height="${F[2] - 2 * IN}"/>`,
    `  <rect class="s-feld" x="${F[0]}" y="${F[1]}" width="${F[2]}" height="${F[2]}"/>`,
    text('s-teil', 150, F[1] + 16, t.linie),
    text('s-tsicher', 150, F[1] + IN + 20, t.sicher),
    text('s-teilw', 150, F[1] + IN + 33, t.schritt),
    `  <text class="s-zone" x="16" y="${unten + 26}">${t.zone}</text>`,
    `  <path class="s-risiko" d="M${P(...ab)} Q${P(246, 190)} ${P(aus[0] - 2, aus[1] + 4)}"/>`,
    `  <path class="s-risiko" d="M${P(...ab)} Q${P(196, 236)} ${P(zone[0] - 4, zone[1] + 2)}"/>`,
    `  <path class="s-flug" d="M${P(...ab)} Q${P(132, 200)} ${P(sicher[0], sicher[1] + 9)}" marker-end="url(#ma)"/>`,
    `  <circle class="s-punkt" cx="${sicher[0]}" cy="${sicher[1]}" r="5.5"/>`,
    `  <path class="s-kreuz" d="${kreuz(...aus)}${kreuz(...zone)}"/>`,
    text('s-teil', aus[0] + 2, aus[1] - 11, t.aus),
    text('st', 150, 290, t.cap),
  ];
  return datei(300, 300, t.aria, inhalt, stilFuer(inhalt));
}

// ---------------------------------------------------------------------------------------------
// G-073 Schuhe: Laufwege von oben. Links Badminton/Squash (vor und zurück, zum Netz bzw. zur
// Frontwand), rechts das Crossminton-Quadrat (vier gleichwertige Ecken, Ausfallschritt in jede
// Richtung).

function G073(t) {
  const L = [76, 146], R = [222, 146];
  const pfeil = (klasse, von, nach, marker) => `  <path class="${klasse}" d="M${P(...von)}L${P(...nach)}"${marker ? ` marker-end="url(#${marker})"` : ''}/>`;
  const zu = (c, dx, dy, k = 1) => [c[0] + dx * k, c[1] + dy * k];
  const inhalt = [
    text('s-name', L[0], 34, t.links),
    text('s-name2', R[0], 34, t.rechts),
    `  <path class="s-trenner" d="M149,52 L149,236"/>`,
    // Badminton/Squash: schmales, langes Feld, die Wand (Netz/Frontwand) oben
    `  <rect class="s-feld" x="${L[0] - 38}" y="62" width="76" height="160"/>`,
    `  <path class="s-wand" d="M${L[0] - 38},62 L${L[0] + 38},62"/>`,
    text('s-teil', L[0], 54, t.wand),
    pfeil('s-weg', zu(L, 0, -12), zu(L, 0, -64), 'mp'),
    pfeil('s-weg', zu(L, 0, 12), zu(L, 0, 64), 'mp'),
    pfeil('s-wegn', zu(L, -12, 0), zu(L, -28, 0), 'mp'),
    pfeil('s-wegn', zu(L, 12, 0), zu(L, 28, 0), 'mp'),
    `  <circle class="s-spieler" cx="${L[0]}" cy="${L[1]}" r="7.5"/>`,
    // Crossminton: Quadrat, vier gleichwertige Ecken, Wege in jede Richtung
    `  <rect class="s-feld" x="${R[0] - 62}" y="${R[1] - 62}" width="124" height="124"/>`,
    ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, y]) => pfeil('s-wegc', zu(R, x * 9, y * 9), zu(R, x * 44, y * 44), 'ma')),
    ...[[-1, 0], [1, 0], [0, -1], [0, 1]].map(([x, y]) => pfeil('s-wegc', zu(R, x * 12, y * 12), zu(R, x * 46, y * 46), 'ma')),
    `  <circle class="s-spieler" cx="${R[0]}" cy="${R[1]}" r="7.5"/>`,
    text('s-titel', L[0], 248, t.vorzurueck),
    text('s-titel', R[0], 248, t.jederichtung),
    text('st', 150, 284, t.cap),
  ];
  return datei(300, 300, t.aria, inhalt, stilFuer(inhalt));
}

// ---------------------------------------------------------------------------------------------
// G-076 Antizipative Schnelligkeit: oben die Zeitachse mit drei Augenblicken (der Gegner holt aus,
// er trifft, der Speeder ist bei dir), darunter zwei gleich lange Laufwege. Wer die Vorbereitung
// liest, startet beim Ausholen und ist vor dem Speeder da; wer auf den Ball wartet, startet erst
// nach dem Treffen und kommt zu spät — bei gleichem Tempo.

function G076(t) {
  const xA = 62, xT = 142, xS = 244, WEG = 124;
  const y0 = 70, y1 = 142, y2 = 218;
  const lauf = (klasse, x, y) => [
    `  <path class="${klasse}" d="M${x},${y} L${x + WEG},${y}"/>`,
    `  <circle class="s-start" cx="${x}" cy="${y}" r="5"/>`,
  ];
  const inhalt = [
    `  <path class="s-achse" d="M24,${y0} L280,${y0}" marker-end="url(#mp)"/>`,
    ...[xA, xT, xS].map((x) => `  <path class="s-achse" d="M${x},${y0 - 6} L${x},${y0 + 6}"/>`),
    `  <path class="s-marke" d="M${xT},${y0 - 20} L${xT},${y0 - 8}"/>`,
    `  <path class="s-marke" d="M${xA},${y0 + 8} L${xA},${y1 + 10}M${xT},${y0 + 8} L${xT},${y2 + 10}M${xS},${y0 + 8} L${xS},${y2 + 16}"/>`,
    text('s-teil', xA, y0 - 14, t.ausholen),
    text('s-teil', xT, y0 - 26, t.trifft),
    text('s-teil', xS, y0 - 14, t.ankunft),
    text('s-teil', 280, y0 + 18, t.zeit),
    `  <text class="s-tlinks" x="24" y="${y1 - 18}">${t.liest}</text>`,
    ...lauf('s-lauf', xA, y1),
    `  <path class="s-reserve" d="M${xA + WEG + 6},${y1} L${xS - 2},${y1}"/>`,
    text('s-akzenth', (xA + WEG + xS) / 2, y1 + 22, t.reserve),
    `  <text class="s-tlinks" x="24" y="${y2 - 18}">${t.wartet}</text>`,
    ...lauf('s-laufg', xT, y2),
    `  <path class="s-spaet" d="M${xS},${y2 + 14} L${xT + WEG},${y2 + 14}M${xT + WEG},${y2 + 9} L${xT + WEG},${y2 + 19}"/>`,
    text('s-name', (xS + xT + WEG) / 2 + 8, y2 + 30, t.spaet),
    text('st', 150, 284, t.cap),
  ];
  return datei(300, 300, t.aria, inhalt, stilFuer(inhalt));
}

// ---------------------------------------------------------------------------------------------
// G-079 Blackminton: links der Night Speeder im Profil (Kappe oben, durchsichtig, darin das
// Speedlight mit Glimmen), rechts unten die Bahn des Lichtpunkts als Punktfolge, die zum Ende hin
// kräftiger wird — so sieht man ihn im Dunkeln.

function G079(t) {
  const MM = 2.6, cx = 82, y0 = 50;
  const yK = y0 + 15 * MM, yR = yK + 10 * MM, yE = yR + 35 * MM;
  const rK = 13 * MM, rR = 15 * MM, rE = 9.5 * MM, rO = 25 * MM;
  const kappe = `M${cx - rK},${yK} L${cx - rK},${y0 + rK * 0.55} Q${cx - rK},${y0} ${cx},${y0} Q${cx + rK},${y0} ${cx + rK},${y0 + rK * 0.55} L${cx + rK},${yK} Z`;
  const korb = `M${cx - rE},${yR} L${cx - rO},${yE} Q${cx},${yE + 8} ${cx + rO},${yE} L${cx + rE},${yR} Z`;
  let stiele = '';
  for (const u of [-0.66, -0.33, 0, 0.33, 0.66]) stiele += `M${r1(cx + u * rE)},${yR} L${r1(cx + u * rO)},${r1(yE + (1 - u * u) * 7)}`;
  const licht = `M${cx - 4},${y0 + 10} h8 v${yR - y0 - 18} a4,4 0 0 1 -8,0 Z`;
  // Lichtspur: Punkte auf einem Bogen, das letzte ist der leuchtende Speeder
  const spur = [];
  const n = 9;
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1), x = 168 + 116 * u, y = 252 - 104 * u - 40 * u * (1 - u);
    spur.push([x, y, u]);
  }
  const [lx, ly] = spur[n - 1];
  const inhalt = [
    `  <circle class="s-glimm" cx="${cx}" cy="${y0 + 34}" r="44"/>`,
    `  <path class="s-korbfl" d="${korb}"/>`,
    `  <path class="s-stiel" d="${stiele}"/>`,
    `  <rect class="s-kragen" x="${cx - rR}" y="${yK}" width="${2 * rR}" height="${yR - yK}" rx="3"/>`,
    `  <path class="s-kappeklar" d="${kappe}"/>`,
    `  <path class="s-licht" d="${licht}"/>`,
    `  <path class="s-masz" d="M${r1(cx + rK + 4)},${y0 + 14} L136,${y0 + 6}M${cx + 7},${y0 + 46} L136,${y0 + 52}"/>`,
    `  <text class="s-tlinks" x="140" y="${y0 + 10}">${t.kappe}</text>`,
    `  <text class="s-tlinks" x="140" y="${y0 + 56}">${t.licht}</text>`,
    `  <text class="s-tleise" x="140" y="${y0 + 70}">${t.dauer}</text>`,
    ...spur.slice(0, -1).map(([x, y, u]) => `  <circle class="${u < 0.5 ? 's-punkt1' : 's-punkt2'}" cx="${r1(x)}" cy="${r1(y)}" r="${r1(2 + 2 * u)}"/>`),
    `  <circle class="s-glimm" cx="${r1(lx)}" cy="${r1(ly)}" r="13"/>`,
    `  <circle class="s-licht" cx="${r1(lx)}" cy="${r1(ly)}" r="5.5"/>`,
    text('s-akzenth', 206, 266, t.folgen),
    text('st', 150, 288, t.cap),
  ];
  return datei(300, 300, t.aria, inhalt, stilFuer(inhalt));
}

// ---------------------------------------------------------------------------------------------

export const TEXTE = {
  'G-068': {
    de: {
      aria: 'Zwei Griffe im Schnitt, mit Blick auf das Griffende, und die Hand als Band darum. Links ist der Griff zu dünn: dieselbe Hand reicht so weit herum, dass sich die Fingerspitzen in den Handballen drücken. Rechts passt er: zwischen Fingerspitzen und Handballen bleibt etwa die Breite eines Zeigefingers frei.',
      blick: 'Blick auf das Griffende', zuduenn: 'zu dünn', passend: 'passend', keinplatz: 'kein Platz',
      finger: '1 Finger', ballen: 'Ballen', spitzen: 'Fingerspitzen', cap: 'ein Finger Platz bis zum Ballen',
    },
    en: {
      aria: 'Two handles in cross-section, seen from the end of the handle, with the hand as a band around them. On the left the handle is too thin: the same hand reaches so far round that the fingertips press into the heel of the hand. On the right it fits: about the width of an index finger stays free between the fingertips and the heel of the hand.',
      blick: 'looking at the end of the handle', zuduenn: 'too thin', passend: 'right size', keinplatz: 'no room',
      finger: '1 finger', ballen: 'heel', spitzen: 'fingertips', cap: 'one finger of room to the heel of the hand',
    },
    fr: {
      aria: 'Deux manches en coupe, vus depuis le bout du manche, avec la main comme une bande autour. À gauche, le manche est trop fin : la même main fait le tour si loin que le bout des doigts s\'enfonce dans le talon de la main. À droite, il convient : entre le bout des doigts et le talon de la main reste à peu près la largeur d\'un index.',
      blick: 'vue sur le bout du manche', zuduenn: 'trop fin', passend: 'adapté', keinplatz: 'pas de place',
      finger: '1 doigt', ballen: 'talon', spitzen: 'bout des doigts', cap: 'un doigt de place jusqu\'au talon',
    },
    pl: {
      aria: 'Dwie rączki w przekroju, widziane od końca rączki, z dłonią jako opaską wokół nich. Po lewej rączka jest za cienka: ta sama dłoń sięga tak daleko, że opuszki palców wbijają się w nasadę dłoni. Po prawej pasuje: między opuszkami a nasadą dłoni zostaje mniej więcej szerokość palca wskazującego.',
      blick: 'widok na koniec rączki', zuduenn: 'za cienka', passend: 'w sam raz', keinplatz: 'brak miejsca',
      finger: '1 palec', ballen: 'nasada', spitzen: 'opuszki', cap: 'palec przerwy do nasady dłoni',
    },
  },
  'G-069': {
    de: {
      aria: 'Drei Schläger maßstäblich nebeneinander. Links ein Badmintonschläger, lang und filigran, rechts ein Squashschläger, ebenfalls lang. In der Mitte der Crossminton-Schläger: kürzer, mit kräftigerem Rahmen. Die Regeln erlauben höchstens 61 Zentimeter Länge und einen Kopf von höchstens 650 Quadratzentimetern.',
      laenge: 'max. 61 cm', kopf: 'Kopf', flaeche: 'max. 650 cm²', badminton: 'Badminton', crossminton: 'Crossminton', squash: 'Squash',
      cap: 'kürzer als Squash, robuster als Badminton',
    },
    en: {
      aria: 'Three rackets side by side, to scale. On the left a badminton racket, long and delicate; on the right a squash racket, also long. In the middle the Crossminton racket: shorter, with a sturdier frame. The rules allow a length of at most 61 centimetres and a head of at most 650 square centimetres.',
      laenge: 'max. 61 cm', kopf: 'head', flaeche: 'max. 650 cm²', badminton: 'Badminton', crossminton: 'Crossminton', squash: 'Squash',
      cap: 'squash: longer · badminton: more fragile',
    },
    fr: {
      aria: 'Trois raquettes côte à côte, à l\'échelle. À gauche une raquette de badminton, longue et fine ; à droite une raquette de squash, longue elle aussi. Au milieu la raquette de crossminton : plus courte, avec un cadre plus robuste. Le règlement autorise une longueur de 61 centimètres au plus et une tête de 650 centimètres carrés au plus.',
      laenge: 'max. 61 cm', kopf: 'tête', flaeche: 'max. 650 cm²', badminton: 'Badminton', crossminton: 'Crossminton', squash: 'Squash',
      cap: 'plus courte qu\'au squash, plus robuste',
    },
    pl: {
      aria: 'Trzy rakiety obok siebie, w skali. Po lewej rakieta do badmintona, długa i delikatna, po prawej rakieta do squasha, również długa. Pośrodku rakieta do crossmintona: krótsza, z mocniejszą ramą. Przepisy dopuszczają długość najwyżej 61 centymetrów i główkę najwyżej 650 centymetrów kwadratowych.',
      laenge: 'maks. 61 cm', kopf: 'główka', flaeche: 'maks. 650 cm²', badminton: 'Badminton', crossminton: 'Crossminton', squash: 'Squash',
      cap: 'krótsza niż do squasha, mocniejsza',
    },
  },
  'G-070': {
    de: {
      aria: 'Oben zwei Saiten im Querschnitt, vergrößert: die Crossminton-Saite mit bis zu 1,25 Millimetern ist fast doppelt so dick wie die Badmintonsaite mit rund 0,65 Millimetern. Unten das Trampolin-Modell: Eine weiche Bespannung gibt tief nach und schleudert den Speeder weit, aber gestreut zurück, also mehr Kraft. Eine harte gibt wenig nach, der Speeder fliegt kürzer und genauer, also mehr Kontrolle.',
      querschnitt: 'Saite im Querschnitt, vergrößert', crossminton: 'Crossminton', badminton: 'Badminton', dickeC: 'bis 1,25 mm', dickeB: 'ca. 0,65 mm',
      weich: 'weich', kraft: 'mehr Kraft', hart: 'hart', kontrolle: 'mehr Kontrolle', cap: 'dicke Saite · Härte als Stellschraube',
    },
    en: {
      aria: 'Above, two strings in cross-section, magnified: the Crossminton string of up to 1.25 millimetres is almost twice as thick as the badminton string of about 0.65 millimetres. Below, the trampoline model: a soft stringing gives deeply and sends the Speeder back far but scattered, so more power. A hard one gives little, the Speeder flies shorter and more precisely, so more control.',
      querschnitt: 'string in cross-section, magnified', crossminton: 'Crossminton', badminton: 'Badminton', dickeC: 'up to 1.25 mm', dickeB: 'approx. 0.65 mm',
      weich: 'soft', kraft: 'more power', hart: 'hard', kontrolle: 'more control', cap: 'thick string · tension as the key setting',
    },
    fr: {
      aria: 'En haut, deux cordes en coupe, agrandies : la corde de crossminton, jusqu\'à 1,25 millimètre, est presque deux fois plus épaisse que la corde de badminton, d\'environ 0,65 millimètre. En bas, le modèle du trampoline : un cordage souple cède profondément et renvoie le speeder loin mais de façon dispersée, donc plus de puissance. Un cordage dur cède peu, le speeder part plus court et plus précis, donc plus de contrôle.',
      querschnitt: 'corde en coupe, agrandie', crossminton: 'Crossminton', badminton: 'Badminton', dickeC: 'jusqu\'à 1,25 mm', dickeB: 'env. 0,65 mm',
      weich: 'souple', kraft: 'plus de puissance', hart: 'dur', kontrolle: 'plus de contrôle', cap: 'corde épaisse · la tension comme réglage',
    },
    pl: {
      aria: 'U góry dwie struny w przekroju, powiększone: struna do crossmintona, do 1,25 milimetra, jest prawie dwa razy grubsza niż struna do badmintona, około 0,65 milimetra. Na dole model trampoliny: miękki naciąg ugina się głęboko i odbija speedera daleko, ale z rozrzutem, czyli więcej siły. Twardy ugina się mało, speeder leci krócej i dokładniej, czyli więcej kontroli.',
      querschnitt: 'struna w przekroju, powiększona', crossminton: 'Crossminton', badminton: 'Badminton', dickeC: 'do 1,25 mm', dickeB: 'ok. 0,65 mm',
      weich: 'miękki', kraft: 'więcej siły', hart: 'twardy', kontrolle: 'więcej kontroli', cap: 'gruba struna · twardość jako regulacja',
    },
  },
  'G-071': {
    de: {
      aria: 'Das gegnerische Feld von oben, davor die Passierzone. Ein Schritt innerhalb der Linien liegt das sichere Zielgebiet, dorthin fliegt der sichere Ball. Zwei knappe Bälle gehen daneben: einer landet knapp hinter der Seitenlinie im Aus, einer zu kurz in der Passierzone. Beides sind eigene Fehler.',
      linie: 'knapp an der Linie: riskant', sicher: 'sicher', schritt: 'ein Schritt nach innen', zone: 'Passierzone', aus: 'Aus',
      cap: 'innen spielen, nicht auf die Linie',
    },
    en: {
      aria: 'The opponent\'s field from above, with the neutral zone in front of it. One step inside the lines lies the safe target area, where the safe ball goes. Two tight balls miss: one lands just beyond the sideline, out, and one falls short into the neutral zone. Both are your own errors.',
      linie: 'close to the line: risky', sicher: 'safe', schritt: 'one step inside', zone: 'neutral zone', aus: 'out',
      cap: 'play inside, not onto the line',
    },
    fr: {
      aria: 'Le terrain adverse vu de dessus, avec la zone neutre devant. Un pas à l\'intérieur des lignes se trouve la zone cible sûre, où part la balle sûre. Deux balles trop justes manquent : l\'une tombe juste derrière la ligne de côté, dehors, l\'autre trop court dans la zone neutre. Ce sont deux fautes directes.',
      linie: 'près de la ligne : risqué', sicher: 'sûr', schritt: 'un pas à l\'intérieur', zone: 'zone neutre', aus: 'dehors',
      cap: 'jouer à l\'intérieur, pas sur la ligne',
    },
    pl: {
      aria: 'Pole przeciwnika z góry, przed nim strefa neutralna. Krok w głąb od linii leży bezpieczny obszar docelowy, tam leci pewna piłka. Dwie ryzykowne piłki chybiają: jedna ląduje tuż za linią boczną na aucie, druga za krótko w strefie neutralnej. Obie to własne błędy.',
      linie: 'tuż przy linii: ryzyko', sicher: 'pewnie', schritt: 'krok w głąb pola', zone: 'strefa neutralna', aus: 'aut',
      cap: 'graj do środka, nie na linię',
    },
  },
  'G-073': {
    de: {
      aria: 'Laufwege von oben im Vergleich. Links ein Badminton- oder Squashfeld: lang und schmal, die Wege führen vor zum Netz oder zur Frontwand und zurück, zur Seite nur kurz. Rechts das Crossminton-Feld: ein Quadrat mit vier gleichwertigen Ecken, die Wege führen aus der Mitte gleich weit in jede Richtung, zur Seite und diagonal. Darum braucht der Schuh seitlichen Halt.',
      links: 'Badminton · Squash', rechts: 'Crossminton', wand: 'Netz · Frontwand', vorzurueck: 'vor und zurück', jederichtung: 'in jede Richtung',
      cap: 'seitlicher Halt zählt',
    },
    en: {
      aria: 'Movement paths from above, compared. On the left a badminton or squash court: long and narrow, the paths go forward to the net or the front wall and back, only briefly to the side. On the right the Crossminton field: a square with four equal corners, the paths lead from the centre equally far in every direction, sideways and diagonally. That is why the shoe needs lateral support.',
      links: 'Badminton · Squash', rechts: 'Crossminton', wand: 'net · front wall', vorzurueck: 'forward and back', jederichtung: 'in every direction',
      cap: 'lateral support matters',
    },
    fr: {
      aria: 'Déplacements vus de dessus, comparés. À gauche un terrain de badminton ou de squash : long et étroit, les déplacements vont vers le filet ou le mur avant et reviennent, sur le côté seulement un peu. À droite le terrain de crossminton : un carré aux quatre coins équivalents, les déplacements partent du centre aussi loin dans toutes les directions, sur le côté et en diagonale. C\'est pourquoi la chaussure doit offrir un maintien latéral.',
      links: 'Badminton · Squash', rechts: 'Crossminton', wand: 'filet · mur avant', vorzurueck: 'avant et arrière', jederichtung: 'dans tous les sens',
      cap: 'le maintien latéral compte',
    },
    pl: {
      aria: 'Drogi ruchu z góry, w porównaniu. Po lewej kort do badmintona lub squasha: długi i wąski, drogi prowadzą do przodu, do siatki lub ściany frontowej, i z powrotem, w bok tylko krótko. Po prawej pole do crossmintona: kwadrat z czterema równorzędnymi narożnikami, drogi prowadzą ze środka równie daleko w każdą stronę, w bok i po skosie. Dlatego but potrzebuje bocznego oparcia.',
      links: 'Badminton · Squash', rechts: 'Crossminton', wand: 'siatka · ściana', vorzurueck: 'przód i tył', jederichtung: 'w każdą stronę',
      cap: 'liczy się boczne oparcie',
    },
  },
  'G-076': {
    de: {
      aria: 'Eine Zeitachse mit drei Augenblicken: der Gegner holt aus, der Gegner trifft, der Speeder ist bei dir. Darunter zwei gleich lange Laufwege, also dasselbe Tempo. Wer die Vorbereitung des Gegners liest, startet schon beim Ausholen und steht bereit, bevor der Speeder ankommt. Wer auf den Ball wartet, startet erst nach dem Treffen und kommt zu spät.',
      ausholen: 'Gegner holt aus', trifft: 'Gegner trifft', ankunft: 'Speeder bei dir', zeit: 'Zeit',
      liest: 'liest die Vorbereitung', wartet: 'wartet auf den Ball', reserve: 'Zeit übrig', spaet: 'zu spät',
      cap: 'früher starten statt schneller laufen',
    },
    en: {
      aria: 'A timeline with three moments: the opponent winds up, the opponent hits, the Speeder reaches you. Below, two runs of equal length, so the same pace. Whoever reads the opponent\'s preparation starts as the opponent winds up and is ready before the Speeder arrives. Whoever waits for the ball only starts after the hit and is too late.',
      ausholen: 'opponent winds up', trifft: 'opponent hits', ankunft: 'Speeder arrives', zeit: 'time',
      liest: 'reads the preparation', wartet: 'waits for the ball', reserve: 'time to spare', spaet: 'too late',
      cap: 'start earlier instead of running faster',
    },
    fr: {
      aria: 'Une ligne du temps avec trois instants : l\'adversaire arme, l\'adversaire frappe, le speeder arrive sur toi. En dessous, deux déplacements de même longueur, donc à la même vitesse. Qui lit la préparation de l\'adversaire part dès l\'armé et est prêt avant l\'arrivée du speeder. Qui attend la balle ne part qu\'après la frappe et arrive trop tard.',
      ausholen: 'armé adverse', trifft: 'frappe adverse', ankunft: 'le speeder arrive', zeit: 'temps',
      liest: 'lit la préparation', wartet: 'attend la balle', reserve: 'du temps en plus', spaet: 'trop tard',
      cap: 'partir plus tôt plutôt que courir plus vite',
    },
    pl: {
      aria: 'Oś czasu z trzema momentami: przeciwnik bierze zamach, przeciwnik uderza, speeder jest przy tobie. Pod nią dwie drogi tej samej długości, czyli to samo tempo. Kto czyta przygotowanie przeciwnika, rusza już przy zamachu i jest gotowy, zanim speeder dotrze. Kto czeka na piłkę, rusza dopiero po uderzeniu i spóźnia się.',
      ausholen: 'zamach przeciwnika', trifft: 'uderzenie przeciwnika', ankunft: 'speeder przy tobie', zeit: 'czas',
      liest: 'czyta przygotowanie', wartet: 'czeka na piłkę', reserve: 'zapas czasu', spaet: 'za późno',
      cap: 'ruszaj wcześniej, zamiast biec szybciej',
    },
  },
  'G-079': {
    de: {
      aria: 'Blackminton. Links ein Night Speeder im Profil, die Kappe oben: Sie ist durchsichtig, und in ihr steckt ein Speedlight, ein Knicklicht, das rund drei Stunden leuchtet. Rechts unten die Flugbahn im Dunkeln als Folge von Lichtpunkten, die zum Speeder hin kräftiger werden. Mehr als diesen Punkt sieht man nachts nicht, man folgt seiner Bahn.',
      kappe: 'durchsichtige Kappe', licht: 'Speedlight', dauer: 'Knicklicht, leuchtet ca. 3 h', folgen: 'dem Lichtpunkt folgen',
      cap: 'nachts bleibt nur die Bahn des Lichts',
    },
    en: {
      aria: 'Blackminton. On the left a Night Speeder in profile, cap on top: the cap is transparent, and a Speedlight sits inside it, a glow stick that shines for about three hours. Bottom right, the flight path in the dark as a series of light points that grow stronger towards the Speeder. At night you see nothing but this point and follow its path.',
      kappe: 'transparent cap', licht: 'Speedlight', dauer: 'glow stick, lasts about 3 h', folgen: 'follow the point of light',
      cap: 'at night only the path of light remains',
    },
    fr: {
      aria: 'Blackminton. À gauche, un Night Speeder de profil, la coiffe en haut : elle est transparente et contient un Speedlight, un bâton lumineux qui éclaire environ trois heures. En bas à droite, la trajectoire dans l\'obscurité, une suite de points lumineux de plus en plus nets vers le speeder. La nuit, on ne voit que ce point et on suit sa trajectoire.',
      kappe: 'coiffe transparente', licht: 'Speedlight', dauer: 'bâton lumineux, env. 3 h', folgen: 'suivre le point lumineux',
      cap: 'la nuit, il ne reste que la trace lumineuse',
    },
    pl: {
      aria: 'Blackminton. Po lewej Night Speeder z profilu, nakładką do góry: jest przezroczysta, a w środku tkwi Speedlight, świetlik chemiczny, który świeci około trzech godzin. W prawym dolnym rogu tor lotu w ciemności jako ciąg punktów świetlnych, coraz wyraźniejszych w stronę speedera. Nocą widać tylko ten punkt i podąża się za jego torem.',
      kappe: 'przezroczysta nakładka', licht: 'Speedlight', dauer: 'świetlik, około 3 godzin', folgen: 'podążaj za punktem światła',
      cap: 'nocą zostaje tylko tor światła',
    },
  },
};

const BAU = { 'G-068': G068, 'G-069': G069, 'G-070': G070, 'G-071': G071, 'G-073': G073, 'G-076': G076, 'G-079': G079 };
for (const [id, bau] of Object.entries(BAU)) {
  for (const s of SPRACHEN) {
    const name = `${ZIEL}/${id}${s === 'de' ? '' : '.' + s}.svg`;
    writeFileSync(name, bau(TEXTE[id][s]));
  }
  console.log('geschrieben', id);
}
