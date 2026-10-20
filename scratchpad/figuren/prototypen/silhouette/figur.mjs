// figur.mjs — Stilrichtung „Dynamische Silhouette“
// Abhängigkeitsfreier Generator (ES-Modul): Pose als Daten → gefüllte Volumenfigur als SVG-Fragment.
//
// Prinzip: ein kleines 3D-Skelett mit FESTEN Segmentlängen (Kopfeinheiten), orthografisch
// projiziert. Eine Pose gibt nur Richtungen an; Proportionen, Verkürzung, Tiefenstaffelung
// (ferne Seite heller, Zeichenreihenfolge) und Freistellung ergeben sich daraus. Damit sehen
// alle Grafiken gleich gebaut aus, und dieselbe Pose lässt sich aus anderer Blickrichtung zeigen.
//
// Körperrahmen: Richtungen werden als [R, U, F] angegeben —
//   R = zur rechten Körperseite der Figur, U = nach oben, F = in Blickrichtung der Figur.
// Welt: x = Bildschirm rechts, y = oben, z = zum Betrachter.
// blick (Grad): 0 = Figur schaut zum Betrachter, 90 = nach rechts, 180 = vom Betrachter weg, -90 = links.

// ---------------------------------------------------------------------------
// Proportionen in Kopfeinheiten (H = Kopfhöhe). EINE Stelle für alle Figuren.
// Gesamthöhe aufrecht ≈ 7,6 H (Kopf 1 · Lücke 0,16 · Rumpf 2,55 · Bein 3,63 · Fuß 0,3)
// ---------------------------------------------------------------------------
export const P = {
  kopfB: 0.80, kopfH: 1.0, kopfLuecke: 0.14,
  rumpf: 2.55,                        // Halsansatz → Hüftgelenk-Mitte
  schulter: 1.0, taille: 0.58, huefte: 0.66, // halbe Breiten frontal
  oberarm: 1.40, unterarm: 1.16, oberschenkel: 1.85, unterschenkel: 1.78, fuss: 1.0,
  // Radien (Verjüngung: proximal kräftiger als distal)
  rSchulter: 0.25, rEllbogen: 0.16, rUnterarmBauch: 0.185, rHandgelenk: 0.11, rFaust: 0.17,
  rHuefte: 0.31, rOberschenkelBauch: 0.32, rKnie: 0.225, rWade: 0.255, rKnoechel: 0.13,
  rFerse: 0.16, rBallen: 0.15, rSpitze: 0.105,
};

// ---------------------------------------------------------------------------
// Vektorhilfen (2D und 3D)
// ---------------------------------------------------------------------------
const rad = (g) => (g * Math.PI) / 180;
export const dir = (g) => [Math.sin(rad(g)), Math.cos(rad(g))]; // 2D: 0 = unten, 90 = rechts, 180 = oben
export const add = (a, b) => a.map((v, i) => v + b[i]);
export const sub = (a, b) => a.map((v, i) => v - b[i]);
export const mul = (a, s) => a.map((v) => v * s);
export const lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
const len = (a) => Math.hypot(...a);
const norm = (a) => mul(a, 1 / (len(a) || 1));
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const f = (n) => (Math.round(n * 10) / 10).toString();
export const pt = (p) => `${f(p[0])},${f(p[1])}`;
// Drehung von v um die (normierte) Achse k um g Grad (Rodrigues)
const dreheUm = (v, k, g) => { const c = Math.cos(rad(g)), s = Math.sin(rad(g)); return add(add(mul(v, c), mul(cross(k, v), s)), mul(k, dot(k, v) * (1 - c))); };

// ---------------------------------------------------------------------------
// Formprimitive (2D)
// ---------------------------------------------------------------------------
function bogenFlags(c, von, nach, ueber) {
  const a = (p) => Math.atan2(p[1] - c[1], p[0] - c[0]);
  const N = (x) => ((x % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const d = N(a(nach) - a(von)), u = N(a(ueber) - a(von));
  return u < d ? { gross: d > Math.PI ? 1 : 0, sweep: 1 } : { gross: 2 * Math.PI - d > Math.PI ? 1 : 0, sweep: 0 };
}
export const kreis = (c, r) => `M${f(c[0] - r)},${f(c[1])}a${f(r)},${f(r)} 0 1 0 ${f(2 * r)},0a${f(r)},${f(r)} 0 1 0 ${f(-2 * r)},0Z`;
// Verjüngte Kapsel: zwei Kreise, äußere Tangenten — der Grundbaustein jedes Glieds.
export function kapsel(c1, r1, c2, r2) {
  const d = sub(c2, c1), L = len(d);
  if (L < Math.abs(r1 - r2) + 0.01) return kreis(r1 >= r2 ? c1 : c2, Math.max(r1, r2));
  const u = norm(d), n = [-u[1], u[0]], k = (r1 - r2) / L, s = Math.sqrt(Math.max(0, 1 - k * k));
  const vp = add(mul(u, k), mul(n, s)), vm = add(mul(u, k), mul(n, -s));
  const a1 = add(c1, mul(vp, r1)), a2 = add(c2, mul(vp, r2)), b2 = add(c2, mul(vm, r2)), b1 = add(c1, mul(vm, r1));
  const g2 = bogenFlags(c2, a2, b2, add(c2, mul(u, r2))), g1 = bogenFlags(c1, b1, a1, add(c1, mul(u, -r1)));
  return `M${pt(a1)}L${pt(a2)}A${f(r2)},${f(r2)} 0 ${g2.gross} ${g2.sweep} ${pt(b2)}L${pt(b1)}A${f(r1)},${f(r1)} 0 ${g1.gross} ${g1.sweep} ${pt(a1)}Z`;
}
// Geschlossene Catmull-Rom-Kurve → glatte Bézier-Kontur
export function glatt(punkte, spannung = 0.5) {
  const n = punkte.length, q = (i) => punkte[(i + n) % n];
  let d = `M${pt(q(0))}`;
  for (let i = 0; i < n; i++) {
    const p0 = q(i - 1), p1 = q(i), p2 = q(i + 1), p3 = q(i + 2);
    d += `C${pt(add(p1, mul(sub(p2, p0), spannung / 3)))} ${pt(sub(p2, mul(sub(p3, p1), spannung / 3)))} ${pt(p2)}`;
  }
  return d + 'Z';
}
// Jede Form als eigener Pfad: mehrere Teilpfade in EINEM <path> löschten sich bei
// gegenläufigem Umlaufsinn (nonzero) gegenseitig aus.
export const gruppe = (cls, ds) => (ds.length ? `<g class="${cls}">${ds.map((d) => `<path d="${d}"/>`).join('')}</g>` : '');

// ---------------------------------------------------------------------------
// Kamera
// ---------------------------------------------------------------------------
function kamera(H, hoehe = 8) {
  const e = rad(hoehe);
  return {
    // Welt (Einheiten H) → Bildschirm (px, Ursprung später verschoben); Tiefe für die Reihenfolge
    p: (v) => [v[0] * H, -(v[1] * Math.cos(e)) * H + v[2] * Math.sin(e) * H],
    tiefe: (v) => v[2] * Math.cos(e) + v[1] * Math.sin(e),
  };
}

// ---------------------------------------------------------------------------
// Rumpf: 2D-Kontur zwischen projiziertem Hals und Hüfte; Breite folgt der Drehung.
// [Anteil entlang der Wirbelsäule, Halbbreite frontal, Profil vorn, Profil hinten] in H
// ---------------------------------------------------------------------------
const RUMPF = [
  [0.0, 0.26, 0.16, -0.16],
  [0.06, 0.72, 0.32, -0.34],
  [0.16, P.schulter, 0.46, -0.36],
  [0.36, 0.86, 0.56, -0.34],
  [0.62, P.taille, 0.40, -0.31],
  [0.86, P.huefte, 0.34, -0.34],
  [1.0, 0.5, 0.22, -0.23],
  [1.08, 0.18, 0.06, -0.08],
];
function rumpfKontur(N, Hp, H, sinB, cosB, anteilHuefte) {
  const achse = sub(Hp, N), Ls = len(achse) / anteilHuefte, u = norm(achse), n = [u[1], -u[0]];
  const c = Math.abs(cosB), s = sinB; // c: frontal-Anteil, s: Profil nach rechts (+) / links (−)
  const re = [], li = [];
  for (const [t, fb, pv, ph] of RUMPF) {
    const b = add(N, mul(u, t * Ls));
    const xr = fb * c + (s >= 0 ? pv : -ph) * Math.abs(s);
    const xl = -fb * c + (s >= 0 ? ph : -pv) * Math.abs(s);
    re.push(add(b, mul(n, xr * H))); li.push(add(b, mul(n, xl * H)));
  }
  return glatt([...re, ...li.reverse()], 0.6);
}

// ---------------------------------------------------------------------------
// Die Figur
// ---------------------------------------------------------------------------
// pose = {
//   ort: [x, bodenY]   Bildschirm-x der Hüftmitte, y der Bodenlinie (tiefster Sohlenpunkt landet dort)
//   H:   Kopfhöhe px (Standard 25) · kamera: Blickhöhe in Grad (Standard 8, leicht von oben)
//   blick: Grad (s. o.) · huefte: Drehung des Beckens gegen blick · schulter: Drehung des Oberkörpers gegen das Becken
//   neig: Vorneigung des Rumpfs (Grad, + = nach vorn), seit: Seitneigung (+ = zur rechten Seite)
//   kopf: {neig, dreh} Nicken (+ = nach vorn/unten) und Drehen gegen den Rumpf
//   armR, armL: {ober:[R,U,F], unter:[R,U,F], hand?:[R,U,F], art:'faust'|'offen'|'keine'}  (Rahmen: Oberkörper)
//   beinR, beinL: {ober, unter, fuss?:[R,U,F]}  (Rahmen: Becken)
//   schlaeger: {hand:'R'|'L', achse:[R,U,F], flaeche:[R,U,F]} (Rahmen: Oberkörper; flaeche = Schlagflächen-Normale)
//   heben: zusätzliche Höhe über dem Boden in H (Sprung) · ton: 'auto' | 'gleich' (beide Seiten Tinte)
//   frei: nahe Arme mit Hintergrundkontur freistellen (Standard true)
// }
export function figur(pose) {
  const H = pose.H ?? 25, cam = kamera(H, pose.kamera ?? 8);
  const up = [0, 1, 0];
  const rahmen = (blickG, neig = 0, seit = 0) => {
    let F = [Math.sin(rad(blickG)), 0, Math.cos(rad(blickG))], U = up;
    let R = cross(F, U); // rechte Körperseite
    if (neig) { U = dreheUm(U, R, -neig); F = dreheUm(F, R, -neig); }
    if (seit) { U = dreheUm(U, F, seit); R = dreheUm(R, F, seit); }
    return { R, U, F, w: (v) => add(add(mul(R, v[0]), mul(U, v[1])), mul(F, v[2])) };
  };
  const bB = (pose.blick ?? 0) + (pose.huefte ?? 0);
  const becken = rahmen(bB);
  const oben = rahmen(bB + (pose.schulter ?? 0), pose.neig ?? 0, pose.seit ?? 0);

  // Skelett in Welt-Einheiten (H), Hüftmitte im Ursprung
  const HM = [0, 0, 0];
  const N = oben.w([0, P.rumpf, 0]);
  const schulterY = -0.17 * P.rumpf, sq = P.schulter - 0.2;
  const S = { R: add(N, oben.w([sq, schulterY, -0.04])), L: add(N, oben.w([-sq, schulterY, -0.04])) };
  const hq = P.huefte * 0.55;
  const HG = { R: becken.w([hq, 0, 0]), L: becken.w([-hq, 0, 0]) };
  const kopfR = rahmen(bB + (pose.schulter ?? 0) + (pose.kopf?.dreh ?? 0), (pose.neig ?? 0) + (pose.kopf?.neig ?? 0), pose.seit ?? 0);
  const KM = add(N, kopfR.w([0, P.kopfLuecke + P.kopfH / 2, 0.06]));

  const glied = (start, a, laengen, fr) => {
    const p1 = add(start, mul(norm(fr.w(a.ober)), laengen[0]));
    const p2 = add(p1, mul(norm(fr.w(a.unter)), laengen[1]));
    return [start, p1, p2];
  };
  const arme = {}, beine = {};
  for (const s of ['R', 'L']) {
    const a = pose[`arm${s}`];
    if (a) {
      const [S0, E, W] = glied(S[s], a, [P.oberarm, P.unterarm], oben);
      const hd = norm(oben.w(a.hand ?? a.unter));
      arme[s] = { S: S0, E, W, hd, art: a.art ?? 'faust', griff: add(W, mul(hd, 0.2)) };
    }
    const b = pose[`bein${s}`];
    const [H0, K, A] = glied(HG[s], b, [P.oberschenkel, P.unterschenkel], becken);
    const fd = norm(becken.w(b.fuss ?? [0, -0.1, 1]));
    const ferse = add(add(A, [0, -0.17, 0]), mul(fd, -0.14));
    const spitze = add(ferse, mul(fd, P.fuss));
    beine[s] = { H: H0, K, A, ferse, spitze, fd };
  }
  // Auf den Boden stellen: tiefster Sohlenpunkt (Ferse/Spitze minus Radius) auf y = 0
  const sohle = Math.min(...['R', 'L'].flatMap((s) => [beine[s].ferse[1] - P.rFerse, beine[s].spitze[1] - P.rSpitze]));
  const hebe = -sohle + (pose.heben ?? 0);
  const [ox, oy] = pose.ort;
  const proj = (v) => { const q = cam.p(add(v, [0, hebe, 0])); return [ox + q[0], oy + q[1]]; };
  const tief = (v) => cam.tiefe(v);
  const vornBecken = proj(becken.F).map((v, i) => v - proj([0, 0, 0])[i]);
  const vornOben = proj(oben.F).map((v, i) => v - proj([0, 0, 0])[i]);
  const vornScale = (v) => mul(v, 1 / H); // 2D-Vektor in px je H → Faktor

  // Glieder als 2D-Formen
  const bauch = (a, ra, b, rb, t, r, versatz, vorn) => {
    const m = add(lerp(a, b, t), mul(vornScale(vorn), versatz * H));
    return [kapsel(a, ra, m, r), kapsel(m, r, b, rb)];
  };
  const armFormen = (a) => {
    const S2 = proj(a.S), E2 = proj(a.E), W2 = proj(a.W), G2 = proj(a.griff);
    const teile = [kapsel(S2, P.rSchulter * H, E2, P.rEllbogen * H),
      ...bauch(E2, P.rEllbogen * H, W2, P.rHandgelenk * H, 0.3, P.rUnterarmBauch * H, 0.0, vornOben)];
    let hand = [];
    if (a.art === 'faust') hand = [kapsel(W2, P.rHandgelenk * H, G2, P.rFaust * H)];
    else if (a.art === 'offen') {
      const m = proj(add(a.W, mul(a.hd, 0.22))), sp = proj(add(a.W, mul(a.hd, 0.56)));
      hand = [kapsel(W2, P.rHandgelenk * H, m, 0.15 * H), kapsel(m, 0.145 * H, sp, 0.09 * H)];
    }
    return { teile, hand, G2, W2 };
  };
  const beinFormen = (b) => {
    const H2 = proj(b.H), K2 = proj(b.K), A2 = proj(b.A), F2 = proj(b.ferse), T2 = proj(b.spitze), B2 = proj(lerp(b.ferse, b.spitze, 0.68));
    return [
      ...bauch(H2, P.rHuefte * H, K2, P.rKnie * H, 0.36, P.rOberschenkelBauch * H, 0.06, vornBecken),
      ...bauch(K2, P.rKnie * H, A2, P.rKnoechel * H, 0.3, P.rWade * H, -0.07, vornBecken),
      kapsel(A2, P.rKnoechel * H, F2, P.rFerse * H), kapsel(F2, P.rFerse * H, B2, P.rBallen * H), kapsel(B2, P.rBallen * H, T2, P.rSpitze * H),
    ];
  };

  // Tiefenstaffelung: Seite, deren Schulter/Hüfte hinter der Rumpfmitte liegt, wird „fern“ (heller).
  const zR = tief(S.R) + tief(HG.R), zL = tief(S.L) + tief(HG.L);
  const gleich = pose.ton === 'gleich' || Math.abs(zR - zL) < 0.35;
  const fern = gleich ? null : zR < zL ? 'R' : 'L';
  const kls = (s) => (s === fern ? 's-f' : 's-k');

  const kopfM = proj(KM), sinB = Math.sin(rad(bB + (pose.schulter ?? 0))), cosB = Math.cos(rad(bB + (pose.schulter ?? 0)));
  const kopfAchse = sub(proj(add(KM, kopfR.U)), kopfM);
  const kopfW = (Math.atan2(kopfAchse[0], -kopfAchse[1]) * 180) / Math.PI;
  const kopf = `<ellipse cx="${f(kopfM[0])}" cy="${f(kopfM[1])}" rx="${f((P.kopfB / 2) * H)}" ry="${f((P.kopfH / 2) * H)}" transform="rotate(${f(kopfW)} ${f(kopfM[0])} ${f(kopfM[1])})"/>`;
  const rumpf = rumpfKontur(proj(N), proj(HM), H, sinB, cosB, 0.86);

  // Schläger
  const sch = pose.schlaeger;
  let schl = '';
  if (sch) {
    const a = arme[sch.hand];
    schl = schlaeger3d({ griff: a.griff, achse: norm(oben.w(sch.achse)), flaeche: norm(oben.w(sch.flaeche ?? [0, 0, 1])), proj, H });
  }

  // Ebene je Arm, aus der Tiefe: liegt der Arm (Mitte Ellbogen–Handgelenk) vor der Rumpfmitte,
  // wird er nach dem Rumpf gezeichnet, in Tinte und freigestellt — sonst davor, im Ton seiner Seite.
  // Eine Pose kann es je Arm erzwingen: armR.vor = true|false.
  const rumpfZ = tief(lerp(N, HM, 0.4));
  const vorRumpf = (s) => {
    const a = pose[`arm${s}`];
    if (a?.vor !== undefined) return a.vor;
    return (tief(arme[s].E) + tief(arme[s].W)) / 2 > rumpfZ + 0.15;
  };
  const schichten = [];
  const zeichneArm = (s, freistellen) => {
    const a = armFormen(arme[s]);
    const mitSchl = sch && sch.hand === s;
    if (freistellen && (pose.frei ?? true)) schichten.push(gruppe('s-x', [...a.teile, ...a.hand]));
    const k = freistellen ? 's-k' : kls(s);
    schichten.push(gruppe(k, a.teile));
    if (mitSchl) schichten.push(schl);
    schichten.push(gruppe(k, a.hand));
  };
  const reihenfolge = ['R', 'L'].sort((x, y) => (tief(S[x]) - tief(S[y])));
  // 1) fernes Bein, Arme hinter dem Rumpf
  for (const s of reihenfolge) if (s === fern) schichten.push(gruppe(kls(s), beinFormen(beine[s])));
  for (const s of reihenfolge) if (arme[s] && !vorRumpf(s)) zeichneArm(s, false);
  // 2) Rumpf + nahe Beine, Kopf
  schichten.push(gruppe('s-k', [rumpf, ...['R', 'L'].filter((s) => s !== fern).flatMap((s) => beinFormen(beine[s]))]));
  schichten.push(`<g class="s-k">${kopf}</g>`);
  // 3) Arme vor dem Rumpf, freigestellt
  for (const s of reihenfolge) if (arme[s] && vorRumpf(s)) zeichneArm(s, true);
  const P2 = (v) => proj(v);
  return {
    svg: schichten.join('\n  '), H, proj: P2,
    punkte: {
      kopf: kopfM, hals: proj(N), huefte: proj(HM),
      handR: arme.R && proj(arme.R.griff), handL: arme.L && proj(arme.L.griff),
      schulterR: proj(S.R), schulterL: proj(S.L),
      ballenR: proj(lerp(beine.R.ferse, beine.R.spitze, 0.68)), ballenL: proj(lerp(beine.L.ferse, beine.L.spitze, 0.68)),
      fersR: proj(beine.R.ferse), fersL: proj(beine.L.ferse), spitzeR: proj(beine.R.spitze), spitzeL: proj(beine.L.spitze),
      schlaegerKopf: sch && proj(add(arme[sch.hand].griff, mul(norm(oben.w(sch.achse)), 1.62))),
      boden: oy,
    },
    welt: { arme, beine, oben, becken },
  };
}

// ---------------------------------------------------------------------------
// Schläger (Crossminton: Squash-ähnlich, max. 58 cm ≈ 2,55 H; ovaler besaiteter Kopf,
// offener Hals, Schaft, Griff mit Griffband). Kopf als echte projizierte Ellipse.
// ---------------------------------------------------------------------------
export function schlaeger3d({ griff, achse, flaeche, proj, H }) {
  const quer = norm(cross(flaeche, achse));
  const at = (s, q = 0) => add(add(griff, mul(achse, s)), mul(quer, q));
  const mitte = at(1.62), a = 0.6, b = 0.44;
  const ellipse = (fa = 1, fb = 1, n = 40) => {
    const ps = [];
    for (let i = 0; i < n; i++) { const t = (2 * Math.PI * i) / n; ps.push(proj(add(add(mitte, mul(achse, Math.cos(t) * a * fa)), mul(quer, Math.sin(t) * b * fb)))); }
    return glatt(ps, 0.5);
  };
  // Saiten: drei längs, drei quer
  let saiten = '';
  const sichtbar = Math.abs(flaeche[2]); // wie frontal die Fläche zum Betrachter steht
  if (sichtbar > 0.35) {
    for (const q of [-0.5, 0, 0.5]) { const h = a * Math.sqrt(1 - q * q) * 0.93; saiten += `M${pt(proj(add(mitte, add(mul(quer, q * b), mul(achse, -h)))))}L${pt(proj(add(mitte, add(mul(quer, q * b), mul(achse, h)))))}`; }
    for (const q of [-0.5, 0, 0.5]) { const w = b * Math.sqrt(1 - q * q) * 0.91; saiten += `M${pt(proj(add(mitte, add(mul(achse, q * a), mul(quer, -w)))))}L${pt(proj(add(mitte, add(mul(achse, q * a), mul(quer, w)))))}`; }
  }
  const unten = add(mitte, mul(achse, -a * 0.94));
  const hals = proj(at(0.98)), hl = proj(add(unten, mul(quer, -b * 0.4))), hr = proj(add(unten, mul(quer, b * 0.4)));
  const ende = proj(at(-0.3)), griffEnde = proj(at(0.44));
  return [
    `<path class="s-rf" d="${ellipse()}"/>`,
    saiten ? `<path class="s-rs" d="${saiten}"/>` : '',
    `<path class="s-rh" d="M${pt(hl)}L${pt(hals)}L${pt(hr)}"/>`,
    `<path class="s-rsch" d="M${pt(griffEnde)}L${pt(hals)}"/>`,
    `<path class="s-rr" d="${ellipse()}"/>`,
    `<path class="s-rg" d="M${pt(ende)}L${pt(griffEnde)}"/>`,
  ].join('');
}

// Speeder: Schlagkappe voran, Korb dahinter. winkel = Flugrichtung (2D).
export function speeder({ p, winkel, s = 1 }) {
  const u = dir(winkel), n = [-u[1], u[0]];
  const kopf = add(p, mul(u, 3.4 * s));
  const k1 = add(p, mul(n, 2.7 * s)), k2 = add(p, mul(n, -2.7 * s));
  const o = add(p, mul(u, -10 * s)), o1 = add(o, mul(n, 5.6 * s)), o2 = add(o, mul(n, -5.6 * s));
  return `<path class="s-korb" d="M${pt(k1)}L${pt(o1)}Q${pt(add(o, mul(u, -1.8 * s)))} ${pt(o2)}L${pt(k2)}Z"/>` +
    `<path class="s-kappe" d="${kreis(kopf, 3.8 * s)}"/>`;
}

// Bodenschatten: weiche Ellipse mit Radialverlauf (id wird zur Laufzeit präfixiert)
export const schatten = (c, rx, ry, id) => `<ellipse cx="${f(c[0])}" cy="${f(c[1])}" rx="${f(rx)}" ry="${f(ry)}" fill="url(#${id})"/>`;
export const schattenDef = (id) => `<radialGradient id="${id}"><stop offset="0" class="s-sch0"/><stop offset=".55" class="s-sch1"/><stop offset="1" class="s-sch2"/></radialGradient>`;

// Bewegungsspur: Sichel entlang eines Kreisbogens, zum Ende (aktuelle Position) hin breiter.
export function spur({ c, r, von, bis, breite = 10, schritte = 28, start = 0.08 }) {
  const aussen = [], innen = [];
  for (let i = 0; i <= schritte; i++) {
    const t = i / schritte, g = von + (bis - von) * t, w = breite * (start + (1 - start) * Math.pow(t, 1.4)), d = dir(g);
    aussen.push(add(c, mul(d, r + w * 0.25))); innen.push(add(c, mul(d, r - w * 0.75)));
  }
  return `<path class="s-spur" d="M${[...aussen, ...innen.reverse()].map(pt).join('L')}Z"/>`;
}

// Pfeilspitze für Bahnen (Marker)
export const pfeil = (id, kls = 's-mk') => `<marker id="${id}" viewBox="0 0 10 10" markerWidth="4.4" markerHeight="4.4" refX="5" refY="5" orient="auto"><path d="M1,1.2 L9.4,5 L1,8.8 Z" class="${kls}"/></marker>`;

// ---------------------------------------------------------------------------
// Stil — nur Klassenselektoren, keine At-Regeln, keine Kommentare (Test [22])
// ---------------------------------------------------------------------------
export const STIL = {
  's-k': 'fill:var(--tinte,#16202b)',
  's-f': 'fill:var(--tinte-2,#5a6675)',
  's-x': 'fill:var(--flaeche-2,#f1f5fb);stroke:var(--flaeche-2,#f1f5fb);stroke-width:3.4;stroke-linejoin:round',
  's-rf': 'fill:var(--primaer,#38a4f1);opacity:.14',
  's-rs': 'fill:none;stroke:var(--primaer,#38a4f1);stroke-width:.9;opacity:.6',
  's-rr': 'fill:none;stroke:var(--primaer,#38a4f1);stroke-width:2.8;stroke-linejoin:round',
  's-rh': 'fill:none;stroke:var(--primaer,#38a4f1);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round',
  's-rsch': 'fill:none;stroke:var(--primaer,#38a4f1);stroke-width:3;stroke-linecap:round',
  's-rg': 'fill:none;stroke:var(--primaer-tief,#1568ad);stroke-width:5.4;stroke-linecap:round',
  's-korb': 'fill:var(--speeder-korb,#f0c400)',
  's-kappe': 'fill:var(--speeder-kappe,#e2402a)',
  's-sch0': 'stop-color:var(--tinte,#16202b);stop-opacity:.22',
  's-sch1': 'stop-color:var(--tinte,#16202b);stop-opacity:.1',
  's-sch2': 'stop-color:var(--tinte,#16202b);stop-opacity:0',
  's-spur': 'fill:var(--primaer,#38a4f1);opacity:.2',
  's-bahn': 'fill:none;stroke:var(--primaer,#38a4f1);stroke-width:3;stroke-dasharray:.1 7;stroke-linecap:round',
  's-weg': 'fill:none;stroke:var(--primaer,#38a4f1);stroke-width:3.2;stroke-dasharray:8 6;stroke-linecap:round',
  's-blick': 'fill:none;stroke:var(--tinte-3,#656f7e);stroke-width:2;stroke-dasharray:.1 5.5;stroke-linecap:round',
  's-mk': 'fill:var(--primaer,#38a4f1)',
  's-mkg': 'fill:var(--tinte-3,#656f7e)',
  's-akz': 'fill:var(--primaer,#38a4f1)',
  's-akzl': 'fill:none;stroke:var(--primaer,#38a4f1);stroke-linecap:round;stroke-linejoin:round',
  's-basis': 'fill:var(--primaer-weich,#e8f3fe);stroke:var(--primaer,#38a4f1);stroke-width:1.6',
  's-griff': 'fill:var(--primaer-weich,#e8f3fe);stroke:var(--primaer,#38a4f1);stroke-width:2.4;stroke-linejoin:round',
  's-band': 'fill:none;stroke:var(--primaer,#38a4f1);stroke-width:1.4;opacity:.45',
  's-rr2': 'fill:none;stroke:var(--primaer,#38a4f1);stroke-width:5',
  's-rh2': 'fill:none;stroke:var(--primaer,#38a4f1);stroke-width:4;stroke-linecap:round;stroke-linejoin:round',
  's-rsch2': 'fill:none;stroke:var(--primaer,#38a4f1);stroke-width:7;stroke-linecap:round',
  's-ag0': 'stop-color:var(--tinte,#16202b);stop-opacity:1',
  's-ag1': 'stop-color:var(--tinte,#16202b);stop-opacity:0',
  's-zeichen': 'fill:none;stroke:var(--primaer,#38a4f1);stroke-width:5;stroke-linecap:round',
  's-druck': 'fill:var(--primaer,#38a4f1)',
  's-x2': 'fill:var(--flaeche-2,#f1f5fb);stroke:var(--flaeche-2,#f1f5fb);stroke-width:2.2;stroke-linejoin:round',
  's-kante': 'fill:none;stroke:var(--primaer,#38a4f1);stroke-width:1.6;stroke-dasharray:5 5;opacity:.7',
  's-v': 'fill:none;stroke:var(--primaer,#38a4f1);stroke-width:5;stroke-linecap:round;stroke-linejoin:round',
  's-lt': 'fill:var(--primaer-tief,#1568ad);font:700 22px/1 system-ui,sans-serif;text-anchor:middle',
  'st': 'fill:var(--tinte-3,#656f7e);font:600 12px/1 system-ui,sans-serif;text-anchor:middle',
};

// Komplette Datei: nur tatsächlich benutzte Klassen landen im <style>.
export function datei({ aria, caption, captionY, inhalt, defs = '' }) {
  const alles = inhalt + defs;
  const benutzt = Object.entries(STIL).filter(([k]) => k === 'st' || new RegExp(`class="${k}"`).test(alles));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" role="img" aria-label="${aria}">
  <style>
${benutzt.map(([k, v]) => `    .${k}{${v}}`).join('\n')}
  </style>
${defs ? `  <defs>${defs}</defs>\n` : ''}  ${inhalt}
  <text class="st" x="150" y="${captionY}">${caption}</text>
</svg>
`;
}
