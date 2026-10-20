// Geometrisch-modularer Figurenbaukasten für die Crossminton-Grafiken.
// Abhängigkeitsfrei, ES-Modul. Eine Figur entsteht aus einer Posenbeschreibung
// (Daten), nie aus handgezogenen Pfaden: Becken + Rumpfneigung legen den Rumpf fest,
// Hände und Füße werden als ZIELPUNKTE angegeben und per Zwei-Glied-IK mit festen
// Gliedlängen erreicht. Dadurch haben alle Figuren dieselben Proportionen.
//
// Winkelkonvention überall: Grad, 0 = nach unten, 90 = nach rechts, 180 = nach oben,
// -90 = nach links (Bildschirmkoordinaten, y nach unten).

export const PRAEFIX = 'gm';

// Maße in viewBox-Einheiten bei skala 1. Kopfeinheit K = 28 (Kopfdurchmesser).
export const MASS = {
  kopfR: 14,          // Kopf: Kreis, Ø 1 K
  hals: 4.5,          // Luft zwischen Rumpfoberkante und Kopf (schwebender Kopf, Piktogramm-Logik)
  rumpf: 50,          // Schulterlinie → Hüftlinie, 1,8 K
  schulter: 19,       // halbe Schulterbreite (Gelenkmitte) frontal
  schulterEinzug: 5,  // Rumpf-Eckkreis sitzt so weit innerhalb des Schultergelenks: Arm tritt seitlich aus
  huefte: 9.5,         // halbe Hüftbreite (Gelenkmitte) frontal
  tiefeOben: 30,      // Rumpftiefe Brust im Profil
  tiefeUnten: 25,     // Rumpftiefe Becken im Profil
  eckeOben: 7,        // Eckradius Rumpf oben (= Armradius + 1,5)
  eckeUnten: 7.5,     // Eckradius Rumpf unten (= Beinradius)
  oberarm: 33, unterarm: 30,
  oberschenkel: 45, unterschenkel: 44,
  arm: 11,            // Kapselbreite Arme
  bein: 15,           // Kapselbreite Beine
  hand: { l: 13, b: 11 },
  fuss: { l: 21, ferse: 6, spitze: 4.2 },
  fuge: 3,            // Fugenbreite (Hintergrundfarbe) zwischen Körperteilen (sichtbar ±1,5)
  naht: 1.8,          // feinere Naht an Ellbogen, Knie, Hand- und Fußgelenk
  schlaeger: { laenge: 62, griff: 19, ueberstand: 7, kopfL: 28, kopfB: 22 },
};

// ---------- Vektor-Helfer ----------
const rad = (g) => (g * Math.PI) / 180;
export const richtung = (g) => [Math.sin(rad(g)), Math.cos(rad(g))];
export const winkelVon = (a, b) => (Math.atan2(b[0] - a[0], b[1] - a[1]) * 180) / Math.PI;
export const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
export const mul = (a, s) => [a[0] * s, a[1] * s];
export const len = (a) => Math.hypot(a[0], a[1]);
export const norm = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l]; };
export const lerp = (a, b, t) => a + (b - a) * t;
export const punkt = (p, g, l) => add(p, mul(richtung(g), l));
const f = (n) => (Math.round(n * 10) / 10).toString();
export const P = (p) => `${f(p[0])},${f(p[1])}`;

// ---------- Grundformen ----------
// Kapsel zwischen zwei Mittelpunkten mit Radius r (exakte Halbkreise).
export function kapsel(a, b, r) {
  const d = norm(sub(b, a)); const n = [-d[1], d[0]];
  const a1 = add(a, mul(n, r)), a2 = sub(a, mul(n, r)), b1 = add(b, mul(n, r)), b2 = sub(b, mul(n, r));
  if (len(sub(b, a)) < 0.01) return kreisPfad(a, r);
  return `M${P(a1)}L${P(b1)}A${f(r)},${f(r)} 0 0 0 ${P(b2)}L${P(a2)}A${f(r)},${f(r)} 0 0 0 ${P(a1)}Z`;
}
export const kreisPfad = (c, r) => `M${P([c[0] - r, c[1]])}a${f(r)},${f(r)} 0 1 0 ${f(2 * r)},0a${f(r)},${f(r)} 0 1 0 ${f(-2 * r)},0Z`;

// Konvexe Hülle aus Kreisen, im Uhrzeigersinn angegeben (Bildschirm): exakte Ecken.
// Für gerundete Trapeze (Rumpf), Füße, Handflächen.
export function huelle(eingabe) {
  // Reihenfolge selbst bestimmen: im Uhrzeigersinn (Bildschirm) um den Schwerpunkt
  const cx = eingabe.reduce((a, k) => a + k[0][0], 0) / eingabe.length, cy = eingabe.reduce((a, k) => a + k[0][1], 0) / eingabe.length;
  const kreise = [...eingabe].sort((a, b) => Math.atan2(a[0][1] - cy, a[0][0] - cx) - Math.atan2(b[0][1] - cy, b[0][0] - cx));
  const n = kreise.length; const tang = [];
  for (let i = 0; i < n; i++) {
    const [c1, r1] = kreise[i], [c2, r2] = kreise[(i + 1) % n];
    const d = sub(c2, c1); const L = len(d); const phi = Math.atan2(d[1], d[0]);
    const al = Math.acos(Math.max(-1, Math.min(1, (r1 - r2) / L)));
    const w = phi - al; // äußere Tangente links der Laufrichtung (y nach unten → außen bei Uhrzeigersinn)
    tang.push([add(c1, [r1 * Math.cos(w), r1 * Math.sin(w)]), add(c2, [r2 * Math.cos(w), r2 * Math.sin(w)])]);
  }
  let d = `M${P(tang[0][0])}`;
  for (let i = 0; i < n; i++) {
    const [, ende] = tang[i]; const [start] = tang[(i + 1) % n]; const r = kreise[(i + 1) % n][1];
    d += `L${P(ende)}A${f(r)},${f(r)} 0 0 1 ${P(start)}`;
  }
  return d + 'Z';
}

// Zwei-Glied-IK: Wurzel, Ziel, Längen, Knickrichtung (+1/-1) → Mittelgelenk + erreichtes Ende.
export function ik(wurzel, ziel, a, b, knick = 1) {
  const v = sub(ziel, wurzel); let d = len(v);
  const dmax = a + b - 0.01, dmin = Math.abs(a - b) + 0.01;
  const dd = Math.max(dmin, Math.min(dmax, d));
  if (d > dmax + 1 && !ik.still) console.warn(`IK: Ziel ${P(ziel)} um ${f(d - dmax)} zu weit`);
  const ende = add(wurzel, mul(norm(v), dd));
  const cosA = (a * a + dd * dd - b * b) / (2 * a * dd);
  const A = Math.acos(Math.max(-1, Math.min(1, cosA)));
  const phi = Math.atan2(v[1], v[0]) + knick * A;
  return { mitte: add(wurzel, [a * Math.cos(phi), a * Math.sin(phi)]), ende };
}

// ---------- Stil ----------
// Ein Stilblock je Datei; nur Klassenselektoren (Repo-Test [22]).
export function stil({ bahn = false, zur = false, feld = false, extra = '' } = {}) {
  const p = PRAEFIX;
  return [
    `.${p}-nah{fill:var(--tinte,#16202b)}`,
    `.${p}-fern{fill:var(--tinte-3,#656f7e)}`,
    `.${p}-fuge{stroke:var(--flaeche-2,#f1f5fb);stroke-width:${MASS.fuge};stroke-linejoin:round;paint-order:stroke}`,
    `.${p}-naht{stroke:var(--flaeche-2,#f1f5fb);stroke-width:${MASS.naht};stroke-linejoin:round;paint-order:stroke}`,
    `.${p}-griff{fill:var(--primaer-tief,#1568ad)}`,
    `.${p}-schaft{fill:none;stroke:var(--primaer,#38a4f1);stroke-width:4;stroke-linecap:round;stroke-linejoin:round}`,
    `.${p}-rahmen{fill:var(--primaer-weich,#e8f3fe);stroke:var(--primaer,#38a4f1);stroke-width:4.2}`,
    `.${p}-saite{fill:none;stroke:var(--primaer,#38a4f1);stroke-width:1.1;opacity:.5}`,
    `.${p}-korb{fill:var(--speeder-korb,#f0c400)}`,
    `.${p}-kappe{fill:var(--speeder-kappe,#e2402a)}`,
    `.${p}-kragen{fill:var(--speeder-kappe-tief,#a82412)}`,
    `.${p}-boden{fill:none;stroke:var(--tinte-3,#656f7e);stroke-width:3;stroke-linecap:round;opacity:.45}`,
    `.${p}-schatten{fill:var(--tinte-3,#656f7e);opacity:.16}`,
    bahn ? `.${p}-bahn{fill:none;stroke:var(--primaer,#38a4f1);stroke-width:3.4;stroke-linecap:round;stroke-dasharray:.1 8}` : '',
    bahn ? `.${p}-spitze{fill:var(--primaer,#38a4f1);stroke:var(--primaer,#38a4f1);stroke-width:2;stroke-linejoin:round}` : '',
    zur ? `.${p}-zur{fill:none;stroke:var(--tinte-3,#656f7e);stroke-width:3;stroke-linecap:round;stroke-dasharray:9 7}` : '',
    zur ? `.${p}-zurspitze{fill:var(--tinte-3,#656f7e);stroke:var(--tinte-3,#656f7e);stroke-width:2;stroke-linejoin:round}` : '',
    feld ? `.${p}-feld{fill:var(--tinte-3,#656f7e);opacity:.09}` : '',
    feld ? `.${p}-feldlinie{fill:none;stroke:var(--tinte-3,#656f7e);stroke-width:2;opacity:.5;stroke-linejoin:round}` : '',
    `.${p}-akzent{fill:var(--primaer,#38a4f1)}`,
    `.${p}-ring{fill:none;stroke:var(--primaer,#38a4f1);stroke-width:2.6}`,
    `.st{fill:var(--tinte-3,#656f7e);font:600 12px/1 system-ui,sans-serif;text-anchor:middle}`,
    extra,
  ].filter(Boolean).join('\n    ');
}

const form = (d, ton, fein = false) => `<path class="${PRAEFIX}-${ton} ${PRAEFIX}-${fein ? 'naht' : 'fuge'}" d="${d}"/>`;

// ---------- Requisiten ----------
// Schläger: Griffpunkt (Handmitte) + Richtung Griff→Kopf. flach (0..1) verkürzt die
// Kopfbreite (Rahmen schräg gesehen). Liefert {svg, kopf, spitze}.
export function schlaeger({ griff, winkel, skala = 1, flach = 1 }) {
  const S = MASS.schlaeger; const k = skala; const d = richtung(winkel); const n = [-d[1], d[0]];
  const butt = sub(griff, mul(d, S.ueberstand * k));
  const griffEnde = add(butt, mul(d, S.griff * k));
  const kopfFuss = add(butt, mul(d, (S.laenge - S.kopfL) * k));
  const kopfMitte = add(kopfFuss, mul(d, (S.kopfL / 2) * k));
  const a = (S.kopfL / 2) * k, b = Math.max(2.5, (S.kopfB / 2) * k * flach);
  const herz = sub(kopfFuss, mul(d, 6 * k));
  const rot = (winkelVon([0, 0], d) * -1) + 90; // Ellipsen-x-Achse entlang d
  const ang = (Math.atan2(d[1], d[0]) * 180) / Math.PI;
  // Saiten analytisch als Sehnen der Ellipse (lokale Achsen u entlang d, v quer)
  const saiten = [];
  for (const t of [-0.5, 0, 0.5]) { // Längssaiten
    const v = t * b; const u = a * Math.sqrt(1 - (v * v) / (b * b)) - 1.5;
    saiten.push([add(kopfMitte, add(mul(d, -u), mul(n, v))), add(kopfMitte, add(mul(d, u), mul(n, v)))]);
  }
  if (flach > 0.45) for (const t of [-0.5, 0, 0.5]) { // Quersaiten
    const u = t * a; const v = b * Math.sqrt(1 - (u * u) / (a * a)) - 1.5;
    saiten.push([add(kopfMitte, add(mul(d, u), mul(n, -v))), add(kopfMitte, add(mul(d, u), mul(n, v)))]);
  }
  const p = PRAEFIX;
  const svg = [
    `<path class="${p}-schaft" d="M${P(griffEnde)}L${P(herz)}M${P(add(herz, mul(n, 0)))}L${P(add(kopfFuss, mul(n, b * 0.55)))}M${P(herz)}L${P(add(kopfFuss, mul(n, -b * 0.55)))}"/>`,
    `<ellipse class="${p}-rahmen" cx="${f(kopfMitte[0])}" cy="${f(kopfMitte[1])}" rx="${f(a)}" ry="${f(b)}" transform="rotate(${f(ang)} ${P(kopfMitte)})"/>`,
    `<path class="${p}-saite" d="${saiten.map(([s, e]) => `M${P(s)}L${P(e)}`).join('')}"/>`,
    `<path class="${p}-griff ${p}-fuge" d="${kapsel(butt, griffEnde, 3.6 * k)}"/>`,
  ].join('');
  void rot;
  return { svg, kopf: kopfMitte, spitze: add(kopfMitte, mul(d, a)), butt, d, n };
}

// Speeder: Kopf (Schlagkappe) voran in Flugrichtung.
export function speeder({ ort, flug, skala = 1 }) {
  const k = skala; const d = richtung(flug); const n = [-d[1], d[0]]; const p = PRAEFIX;
  const kappe = ort; const kr = 4.6 * k;
  const ring = sub(kappe, mul(d, 3.2 * k));
  const ende = sub(kappe, mul(d, 15 * k));
  const korb = `M${P(add(ring, mul(n, 3.4 * k)))}L${P(add(ende, mul(n, 7 * k)))}Q${P(sub(ende, mul(d, 1.8 * k)))} ${P(add(ende, mul(n, -7 * k)))}L${P(add(ring, mul(n, -3.4 * k)))}Z`;
  return `<g><path class="${p}-korb ${p}-fuge" d="${korb}"/><path class="${p}-kragen" d="${kapsel(add(ring, mul(n, 3.6 * k)), add(ring, mul(n, -3.6 * k)), 1.6 * k)}"/><circle class="${p}-kappe ${p}-fuge" cx="${f(kappe[0])}" cy="${f(kappe[1])}" r="${f(kr)}"/></g>`;
}

// Bewegungsbahn mit gerundeter Pfeilspitze (ohne Marker, damit nichts kollidiert).
export function bahn(d, ende, flugwinkel, { klasse = 'bahn', spitze = 'spitze', gross = 1 } = {}) {
  const r = richtung(flugwinkel); const n = [-r[1], r[0]]; const s = 7 * gross;
  const tip = add(ende, mul(r, s * 0.6));
  const p1 = add(sub(ende, mul(r, s * 0.6)), mul(n, s * 0.62));
  const p2 = add(sub(ende, mul(r, s * 0.6)), mul(n, -s * 0.62));
  return `<path class="${PRAEFIX}-${klasse}" d="${d}"/><path class="${PRAEFIX}-${spitze}" d="M${P(tip)}L${P(p1)}L${P(p2)}Z"/>`;
}

export const boden = (x1, x2, y) => `<path class="${PRAEFIX}-boden" d="M${f(x1)},${f(y)}H${f(x2)}"/>`;
export const schatten = (cx, cy, rx, ry = 4) => `<ellipse class="${PRAEFIX}-schatten" cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}"/>`;

// ---------- Hand / Fuß ----------
function handForm(handgelenk, g, art, k, ton) {
  const H = MASS.hand; const d = richtung(g); const n = [-d[1], d[0]];
  const p = PRAEFIX;
  if (art === 'zeichen') { // zwei gestreckte Finger (Victory-Zeichen), Akzentfarbe
    const m = add(handgelenk, mul(d, 6 * k));
    const f1 = [add(m, mul(d, 3 * k)), add(add(m, mul(d, 15 * k)), mul(n, 4.5 * k))];
    const f2 = [add(m, mul(d, 3 * k)), add(add(m, mul(d, 15 * k)), mul(n, -4.5 * k))];
    return `<path class="${p}-akzent ${p}-fuge" d="${kapsel(...f1, 2.5 * k)}"/><path class="${p}-akzent ${p}-fuge" d="${kapsel(...f2, 2.5 * k)}"/>` + form(kapsel(add(handgelenk, mul(d, 2 * k)), add(handgelenk, mul(d, 7 * k)), 6.2 * k), ton);
  }
  if (art === 'offen') { // flache Hand
    return form(kapsel(add(handgelenk, mul(d, 3 * k)), add(handgelenk, mul(d, 13 * k)), 5.2 * k), ton, true);
  }
  // Faust / Griffhand: kurze breite Kapsel
  return form(kapsel(add(handgelenk, mul(d, 3.5 * k)), add(handgelenk, mul(d, (H.l - 4) * k)), (H.b / 2) * k), ton, true);
}

// Fuß: Hülle aus Fersen- und Ballenkreis. zehen = Richtung Knöchel→Ballen (Grad):
// 90 = flach nach rechts, kleiner = Ferse angehoben (Ballen tiefer als Ferse).
// frontal: Fuß von vorn/hinten (verkürzt, leicht nach außen gedreht), aussen = ±1 im Bild.
function fussForm(knoechel, zehen, k, ton, { frontal = false, aussen = 1 } = {}) {
  const F = MASS.fuss;
  if (frontal) {
    return form(huelle([[add(knoechel, [-aussen * 2 * k, 2.5 * k]), F.ferse * k], [add(knoechel, [aussen * 7.5 * k, 4.5 * k]), F.spitze * k]]), ton);
  }
  const d = richtung(zehen);
  const ballen = add(knoechel, mul(d, F.l * k));
  const ballenM = add(ballen, mul([-d[1], d[0]], (d[0] >= 0 ? 1 : -1) * 0));
  const r2 = F.spitze * k, r1 = F.ferse * k;
  // Ferse etwas hinter dem Knöchel, Ballen um seinen Radius angehoben, damit die Sohle die Zielhöhe trifft
  const ferse = add(add(knoechel, mul(d, -2.5 * k)), [0, (r2 - r1) * Math.abs(d[0])]);
  const kreise = d[0] >= 0 ? [[ferse, r1], [ballenM, r2]] : [[ballenM, r2], [ferse, r1]];
  return form(huelle(kreise), ton, true);
}

// ---------- Figur ----------
// Pose (alle Punkte in viewBox-Einheiten):
// {
//   ansicht: 'front' | 'ruecken' | 'seite' | 'dreiviertel', blick: 1 (nach rechts) | -1,
//   skala, becken:[x,y], neigung: Grad (+ = Oberkörper nach rechts/vorn gekippt),
//   breite: 0..1 (optional, sonst aus Ansicht), kopf: {neigung, vor} (vor = Versatz quer),
//   nah: 'rechts'|'links'|'beide' (Körperseite in --tinte),
//   haende: {rechts:{ziel:[x,y], knick, art:'faust'|'offen'|'zeichen', winkel?}, links:{…}},
//   fuesse: {rechts:{ziel:[x,y], knick, zehen: Grad, verkuerzt, ferse}, links:{…}},
//   schlaeger: {hand:'rechts', winkel, flach, vorn: bool},
// }
// Rückgabe: {svg, punkte}
const ANSICHT = { front: 1, ruecken: 1, dreiviertel: 0.62, seite: 0 };

export function figur(pose) {
  const M = MASS; const k = pose.skala ?? 1; const p = PRAEFIX;
  const w = pose.breite ?? ANSICHT[pose.ansicht ?? 'front'];
  const t = pose.neigung ?? 0;
  const oben = richtung(180 - t);           // Rumpfachse nach oben (t > 0: nach rechts gekippt)
  const quer = [-oben[1], oben[0]];         // nach rechts im Bild (bei t=0: [1,0])
  const becken = pose.becken;
  const schulterM = add(becken, mul(oben, M.rumpf * k * (pose.rumpfLaenge ?? 1)));
  // Seitenvorzeichen im Bild: front → rechts der Person = links im Bild.
  // Seitenlage im Bild: front → rechte Körperseite links im Bild; Dreiviertel (von vorn,
  // Blick nach rechts) ebenso; Rücken/Profil → rechts im Bild.
  const vz = pose.ansicht === 'front' || (pose.ansicht === 'dreiviertel' && (pose.blick ?? 1) > 0) ? { rechts: -1, links: 1 } : { rechts: 1, links: -1 };
  if (pose.seitentausch) { vz.rechts *= -1; vz.links *= -1; }
  const sHalb = lerp(M.tiefeOben / 2 - M.eckeOben, M.schulter - M.schulterEinzug, w) * k;
  const hHalb = lerp(M.tiefeUnten / 2 - M.eckeUnten, M.huefte, w) * k;
  const gelenkS = lerp(0, M.schulter, w) * k, gelenkH = lerp(0, M.huefte, w) * k;
  const sv = pose.schulterVersatz ?? 0, hv = pose.hueftVersatz ?? 0; // Verdrehung (Profil): Versatz quer
  const schulter = { rechts: add(schulterM, mul(quer, vz.rechts * gelenkS + sv * k)), links: add(schulterM, mul(quer, vz.links * gelenkS - sv * k)) };
  const huefte = { rechts: add(becken, mul(quer, vz.rechts * gelenkH + hv * k)), links: add(becken, mul(quer, vz.links * gelenkH - hv * k)) };
  // Rumpf: Hülle aus 4 Eckkreisen (Uhrzeigersinn: oben links, oben rechts, unten rechts, unten links)
  const ro = M.eckeOben * k, ru = M.eckeUnten * k;
  const vorS = (pose.brustVor ?? 0) * k;
  const rumpf = huelle([
    [add(add(schulterM, mul(quer, -sHalb + vorS)), [0, 0]), ro],
    [add(schulterM, mul(quer, sHalb + vorS)), ro],
    [add(becken, mul(quer, hHalb)), ru],
    [add(becken, mul(quer, -hHalb)), ru],
  ]);
  const kn = pose.kopf ?? {};
  const kopfM = add(add(schulterM, mul(richtung(180 - t - (kn.neigung ?? 0)), (ro + M.hals + M.kopfR) * k)), mul(quer, (kn.vor ?? 0) * k));

  const nah = pose.nah ?? (pose.ansicht === 'seite' || pose.ansicht === 'dreiviertel' ? ((pose.blick ?? 1) > 0 ? 'rechts' : 'links') : 'beide');
  const ton = (seite) => (nah === 'beide' || nah === seite ? 'nah' : 'fern');
  const ebenen = []; // [z, svg]
  const punkte = { kopf: kopfM, schulter, huefte, becken, schulterM };

  for (const seite of ['rechts', 'links']) {
    const tn = pose.ton ?? pose.tone?.[seite] ?? ton(seite);
    // Bein
    const fu = pose.fuesse?.[seite];
    if (fu) {
      // Fuß über den Bodenkontakt des Ballens setzen: Knöchel = Ballen − Fußvektor − Radius
      const zehenW = fu.zehen ?? ((pose.blick ?? 1) > 0 ? 90 : -90);
      const zielK = fu.ballen ? sub(sub(fu.ballen, [0, MASS.fuss.spitze * k]), mul(richtung(zehenW), MASS.fuss.l * k)) : fu.ziel;
      const { mitte: knie, ende: knoechel } = ik(huefte[seite], zielK, M.oberschenkel * k * (fu.l1 ?? 1), M.unterschenkel * k * (fu.l2 ?? 1), fu.knick ?? 1);
      const r = (M.bein / 2) * k;
      const zehen = zehenW;
      ebenen.push([fu.z ?? (tn === 'nah' ? 20 : 5), form(kapsel(huefte[seite], knie, r), tn) + form(kapsel(knie, knoechel, r * 0.93), tn, true) + fussForm(knoechel, zehen, k, tn, fu)]);
      punkte[`knie_${seite}`] = knie; punkte[`knoechel_${seite}`] = knoechel;
    }
    // Arm
    const ha = pose.haende?.[seite];
    if (ha) {
      const { mitte: ell, ende: hg } = ik(schulter[seite], ha.ziel, M.oberarm * k * (ha.l1 ?? 1), M.unterarm * k * (ha.l2 ?? 1), ha.knick ?? 1);
      const r = (M.arm / 2) * k;
      const hw = ha.winkel ?? winkelVon(ell, hg);
      const profil = (pose.ansicht ?? 'front') === 'seite' || pose.ansicht === 'dreiviertel';
      const zOben = ha.zOben ?? (tn === 'nah' ? (profil ? 40 : 25) : 0);
      ebenen.push([zOben, form(kapsel(schulter[seite], ell, r), tn)]);
      let teile = form(kapsel(ell, hg, r * 0.95), tn, true);
      const handSvg = handForm(hg, hw, ha.art ?? 'faust', k * (ha.gross ?? 1), tn);
      const handMitte = add(hg, mul(richtung(hw), 6 * k));
      let schl = '';
      if (pose.schlaeger && pose.schlaeger.hand === seite) {
        const s = schlaeger({ griff: handMitte, winkel: pose.schlaeger.winkel, skala: k, flach: pose.schlaeger.flach ?? 1 });
        punkte.schlaeger = s; schl = s.svg;
      }
      const zArm = ha.z ?? (tn === 'nah' ? 45 : 1);
      if (pose.schlaeger?.hand === seite && pose.schlaeger.hinten) ebenen.push([pose.schlaeger.z ?? -10, schl]), schl = '';
      ebenen.push([zArm, teile + schl + handSvg]);
      punkte[`ellbogen_${seite}`] = ell; punkte[`hand_${seite}`] = handMitte;
    }
  }
  const tr = pose.ton ?? 'nah';
  ebenen.push([30, `<path class="${p}-${tr} ${p}-fuge" d="${rumpf}"/>`]);
  ebenen.push([31, `<circle class="${p}-${tr} ${p}-fuge" cx="${f(kopfM[0])}" cy="${f(kopfM[1])}" r="${f(M.kopfR * k)}"/>`]);
  ebenen.sort((a, b) => a[0] - b[0]);
  return { svg: `<g>${ebenen.map((e) => e[1]).join('')}</g>`, punkte };
}

// Rahmen-SVG
export function datei({ aria, caption, captionY = 270, stilOpt, inhalt }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" role="img" aria-label="${aria}">
  <style>
    ${stil(stilOpt)}
  </style>
  ${inhalt}
  <text class="st" x="150" y="${captionY}">${caption}</text>
</svg>
`;
}
