// figur.mjs — Figurengenerator der Personengrafiken (Stil „Dynamische Silhouette“,
// s. docs/grafik-strategie.md). Abhängigkeitsfrei, ES-Modul.
//
// Prinzip: ein kleines 3D-Skelett mit FESTEN Segmentlängen in Kopfeinheiten (H), orthografisch
// projiziert. Eine Pose gibt nur Richtungen an; Proportionen, Verkürzung, Tiefenstaffelung
// (ferne Seite heller, Zeichenreihenfolge), Freistellung und Bodenkontakt ergeben sich daraus.
// Damit sind alle Grafiken gleich gebaut, und eine Pose lässt sich aus anderer Blickrichtung zeigen.
//
// Körperrahmen: Richtungen als [R, U, F] — R = rechte Körperseite der Figur, U = oben,
// F = Blickrichtung der Figur. Welt: x = Bildschirm rechts, y = oben, z = zum Betrachter.
// blick (Grad): 0 = Figur schaut zum Betrachter, 90 = nach rechts, 180 = vom Betrachter weg.

// ---------------------------------------------------------------------------
// Proportionen in Kopfeinheiten (H = Kopfhöhe). EINE Stelle für alle Figuren.
// Gesamthöhe aufrecht ≈ 7,6 H. Zwei Körpertypen unterscheiden sich nur in den Breiten:
// a = breitere Schultern, b = schmalere Schultern und breiteres Becken.
// ---------------------------------------------------------------------------
export const P = {
  kopfB: 0.80, kopfH: 1.0, kopfLuecke: 0.14,
  rumpf: 2.55, // Halsansatz → Hüftgelenk-Mitte
  oberarm: 1.40, unterarm: 1.16, oberschenkel: 1.85, unterschenkel: 1.78, fuss: 1.0,
  // Radien (Verjüngung: proximal kräftiger als distal)
  rSchulter: 0.25, rEllbogen: 0.16, rUnterarmBauch: 0.185, rHandgelenk: 0.11, rFaust: 0.17,
  rHuefte: 0.31, rOberschenkelBauch: 0.32, rKnie: 0.225, rWade: 0.255, rKnoechel: 0.13,
  rFerse: 0.16, rBallen: 0.15, rSpitze: 0.105,
};
export const KOERPER = {
  a: { schulter: 1.0, brust: 0.86, taille: 0.58, huefte: 0.64, glied: 1 },
  b: { schulter: 0.86, brust: 0.76, taille: 0.54, huefte: 0.72, glied: 0.92 },
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
export const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
export const len = (a) => Math.hypot(...a);
export const norm = (a) => mul(a, 1 / (len(a) || 1));
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const f = (n) => (Math.round(n * 10) / 10).toString();
export const pt = (p) => `${f(p[0])},${f(p[1])}`;
export const winkel2d = (v) => (Math.atan2(v[0], v[1]) * 180) / Math.PI;
// Drehung von v um die (normierte) Achse k um g Grad (Rodrigues)
const dreheUm = (v, k, g) => { const c = Math.cos(rad(g)), s = Math.sin(rad(g)); return add(add(mul(v, c), mul(cross(k, v), s)), mul(k, dot(k, v) * (1 - c))); };
// Abstand Punkt–Strecke (2D)
export const abstandStrecke = (p, a, b) => { const ab = sub(b, a), t = Math.max(0, Math.min(1, dot(sub(p, a), ab) / (dot(ab, ab) || 1))); return len(sub(p, add(a, mul(ab, t)))); };

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
    p: (v) => [v[0] * H, -(v[1] * Math.cos(e)) * H + v[2] * Math.sin(e) * H],
    tiefe: (v) => v[2] * Math.cos(e) + v[1] * Math.sin(e),
  };
}

// Gemeinsame Bühne für Mehrpersonen- und Feldszenen: Lochkamera über einer Bodenebene.
// tiefe 0 = vorderste Bodenlinie (Bildschirm-y nahY), größere Tiefe rückt zum Horizont,
// wird kleiner und rückt zur Bildmitte. Figuren UND Feldlinien nutzen dieselbe Abbildung,
// darum passen Größe und Bodenhöhe zusammen (kein „Kind neben Erwachsenem“).
export function buehne({ horizont = 40, nahY = 250, mitteX = 150, H0 = 24, abstand = 6 }) {
  const s = (z) => abstand / (abstand + z);
  return {
    s,
    boden: (x, z) => [mitteX + (x - mitteX) * s(z), horizont + (nahY - horizont) * s(z)],
    stelle: (x, z) => ({ ort: [mitteX + (x - mitteX) * s(z), horizont + (nahY - horizont) * s(z)], H: H0 * s(z) }),
  };
}

// ---------------------------------------------------------------------------
// Rumpf: 2D-Kontur zwischen projiziertem Hals und Hüfte; Breite folgt der Drehung.
// [Anteil entlang der Wirbelsäule, Halbbreite frontal, Profil vorn, Profil hinten] in H.
// Die Rückseite ist bewusst flach gehalten: tiefe Gesäß- und Lendenwerte ergaben in
// Rückenansicht und bei Vorlage einen sackartigen Rumpf.
// ---------------------------------------------------------------------------
const rumpfTabelle = (k) => [
  [0.0, 0.26, 0.16, -0.16],
  [0.06, 0.62 + 0.1 * k.schulter, 0.30, -0.26],
  [0.16, k.schulter, 0.44, -0.28],
  [0.36, k.brust, 0.52, -0.25],
  [0.62, k.taille, 0.36, -0.20],
  [0.86, k.huefte, 0.30, -0.24],
  [1.0, k.huefte * 0.76, 0.20, -0.19],
  [1.08, 0.18, 0.06, -0.08],
];
const pnorm = (a, b, p = 1.5) => (Math.abs(a) ** p + Math.abs(b) ** p) ** (1 / p);
function rumpfKontur(N, Hp, H, sinB, cosB, anteilHuefte, k) {
  const achse = sub(Hp, N), Ls = len(achse) / anteilHuefte, u = norm(achse), n = [u[1], -u[0]];
  const c = Math.abs(cosB), s = sinB; // c: frontal-Anteil, s: Profil nach rechts (+) / links (−)
  const re = [], li = [];
  for (const [t, fb, pv, ph] of rumpfTabelle(k)) {
    const b = add(N, mul(u, t * Ls));
    // Projizierte Ausdehnung des Querschnitts: zwischen Ellipse (p = 2) und Kasten (Summe).
    // Die reine Summe überschätzte die Breite in Dreiviertelansicht und ergab einen Buckel.
    const vorn = s >= 0 ? pv : -ph, hinten = s >= 0 ? ph : -pv;
    const xr = pnorm(fb * c, vorn * s), xl = -pnorm(fb * c, hinten * s);
    re.push(add(b, mul(n, xr * H))); li.push(add(b, mul(n, xl * H)));
  }
  return glatt([...re, ...li.reverse()], 0.6);
}

// ---------------------------------------------------------------------------
// Die Figur
// ---------------------------------------------------------------------------
// pose = {
//   ort: [x, bodenY]   Bildschirm-x der Hüftmitte, y der Bodenlinie (tiefster Sohlenpunkt landet dort)
//   H: Kopfhöhe px (Standard 25) · kamera: Blickhöhe in Grad (Standard 8) · koerper: 'a' | 'b'
//   blick · huefte (Becken gegen blick) · schulter (Oberkörper gegen Becken)
//   neig: Vorneigung des Rumpfs (+ = nach vorn) · seit: Seitneigung (+ = zur rechten Seite)
//   kopf: {neig, dreh} · armR/armL: {ober, unter, hand?, art:'faust'|'offen'|'daumen'|'keine', vor?}
//   beinR/beinL: {ober, unter, fuss?} · schlaeger: {hand, achse, flaeche}
//   heben: zusätzliche Höhe über dem Boden in H (Sprung) · ton: 'auto' | 'gleich'
//   frei: nahe Arme freistellen (Standard true) · geist: true = blasse Geisterphase,
//     'kontur' = Phase, die eine Aussage trägt: nur der Umriss in --tinte-3 (Leitfaden, Kontrast 3:1)
//   art: 'stehend' | 'dynamisch' | 'luft' (für die Balance-Prüfung)
// }
export function figur(pose) {
  const H = pose.H ?? 25, cam = kamera(H, pose.kamera ?? 8);
  const k = KOERPER[pose.koerper ?? 'a'];
  const up = [0, 1, 0];
  const rahmen = (blickG, neig = 0, seit = 0) => {
    let F = [Math.sin(rad(blickG)), 0, Math.cos(rad(blickG))], U = up;
    let R = cross(F, U);
    if (neig) { U = dreheUm(U, R, -neig); F = dreheUm(F, R, -neig); }
    if (seit) { U = dreheUm(U, F, seit); R = dreheUm(R, F, seit); }
    return { R, U, F, w: (v) => add(add(mul(R, v[0]), mul(U, v[1])), mul(F, v[2])) };
  };
  const bB = (pose.blick ?? 0) + (pose.huefte ?? 0);
  const becken = rahmen(bB);
  const oben = rahmen(bB + (pose.schulter ?? 0), pose.neig ?? 0, pose.seit ?? 0);

  const HM = [0, 0, 0];
  const N = oben.w([0, P.rumpf, 0]);
  const schulterY = -0.17 * P.rumpf, sq = k.schulter - 0.2;
  const S = { R: add(N, oben.w([sq, schulterY, -0.04])), L: add(N, oben.w([-sq, schulterY, -0.04])) };
  const hq = k.huefte * 0.58;
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
    // Bei gehobener Ferse liegen die Zehen flach auf, der Fuß knickt im Ballen. Ein gerader Fuß
    // bohrte die Zehenspitze unter den Ballen — sie setzte den Boden, und der flache andere Fuß
    // schwebte (Prüfung Welle 4). In der Luft bleibt der Fuß gestreckt (Sprung: Spitzen nach unten).
    const ballen = add(ferse, mul(fd, P.fuss * 0.68));
    const gehoben = fd[1] < -0.15 && (pose.art ?? 'stehend') !== 'luft';
    const zehen = gehoben ? norm([fd[0], 0, fd[2]]) : fd;
    const spitze = add(ballen, mul(zehen, P.fuss * 0.32));
    beine[s] = { H: H0, K, A, ferse, ballen, spitze, fd };
  }
  const unterseite = (b) => Math.min(b.ferse[1] - P.rFerse, b.ballen[1] - P.rBallen, b.spitze[1] - P.rSpitze);
  // Bodenkontakt erzwingen: wer nicht springt, steht mit beiden Füßen am Boden. Ein Fuß über der
  // Sohle wird abgesenkt, das Knie dazu per Zwei-Gelenk-Kette in seiner Beugerichtung neu gesetzt
  // (Hüfte und Fußstellung bleiben). Reicht das Bein nicht, bleibt es — die Prüfung unten meldet es.
  // Ein bewusst gehobener Fuß (Schritt) steht in frei_fuss.
  // Reicht das schwebende Bein nicht (schon gestreckt), wird statt dessen der tiefere Fuß angehoben:
  // sein Knie beugt sich etwas mehr.
  const versetze = (s, d) => {
    const b = beine[s], A2 = add(b.A, [0, -d, 0]), zu = sub(A2, b.H), l = len(zu), l1 = P.oberschenkel, l2 = P.unterschenkel;
    if (l > l1 + l2 - 1e-3 || l < Math.abs(l1 - l2) + 1e-3) return false;
    const u = norm(zu), bug = sub(b.K, b.H), v = norm(sub(bug, mul(u, dot(bug, u))));
    const ca = (l1 * l1 + l * l - l2 * l2) / (2 * l1 * l), sa = Math.sqrt(Math.max(0, 1 - ca * ca));
    const um = (p) => add(p, [0, -d, 0]);
    beine[s] = { ...b, K: add(b.H, add(mul(u, l1 * ca), mul(v, l1 * sa))), A: A2, ferse: um(b.ferse), ballen: um(b.ballen), spitze: um(b.spitze) };
    return true;
  };
  let korrektur = null;
  if ((pose.art ?? 'stehend') !== 'luft') {
    const frei = pose.frei_fuss ?? [];
    const [hoch, tief] = unterseite(beine.R) > unterseite(beine.L) ? ['R', 'L'] : ['L', 'R'];
    const d = unterseite(beine[hoch]) - unterseite(beine[tief]);
    if (d > 0.02 && !frei.includes(hoch)) korrektur = versetze(hoch, d) ? { fuss: hoch, d } : versetze(tief, -d) ? { fuss: tief, d: -d } : null;
  }
  const sohle = Math.min(unterseite(beine.R), unterseite(beine.L));
  const hebe = -sohle + (pose.heben ?? 0);
  const [ox, oy] = pose.ort;
  const proj = (v) => { const q = cam.p(add(v, [0, hebe, 0])); return [ox + q[0], oy + q[1]]; };
  const tief = (v) => cam.tiefe(v);
  const vornBecken = proj(becken.F).map((v, i) => v - proj([0, 0, 0])[i]);
  const vornOben = proj(oben.F).map((v, i) => v - proj([0, 0, 0])[i]);
  const vornScale = (v) => mul(v, 1 / H);
  const g = k.glied;

  const bauch = (a, ra, b, rb, t, r, versatz, vorn) => {
    const m = add(lerp(a, b, t), mul(vornScale(vorn), versatz * H));
    return [kapsel(a, ra, m, r), kapsel(m, r, b, rb)];
  };
  const armFormen = (a) => {
    const S2 = proj(a.S), E2 = proj(a.E), W2 = proj(a.W), G2 = proj(a.griff);
    const teile = [kapsel(S2, P.rSchulter * H * g, E2, P.rEllbogen * H * g),
      ...bauch(E2, P.rEllbogen * H * g, W2, P.rHandgelenk * H * g, 0.3, P.rUnterarmBauch * H * g, 0.0, vornOben)];
    let hand = [];
    if (a.art === 'faust') hand = [kapsel(W2, P.rHandgelenk * H * g, G2, P.rFaust * H * g)];
    else if (a.art === 'offen') {
      const m = proj(add(a.W, mul(a.hd, 0.22))), sp = proj(add(a.W, mul(a.hd, 0.56)));
      hand = [kapsel(W2, P.rHandgelenk * H * g, m, 0.15 * H * g), kapsel(m, 0.145 * H * g, sp, 0.09 * H * g)];
    } else if (a.art === 'daumen') {
      // Daumen hoch: Faust, der Daumen steht senkrecht nach oben (Welt, nicht Unterarm), etwas zur
      // Handgelenkseite versetzt — mittig auf der Faust las er sich wie ein erhobener Zeigefinger.
      // Dicke und Länge so, dass er als 150-px-Miniatur noch zu sehen ist (Prüfung Welle 5).
      const fuss = add(a.griff, mul(a.hd, -0.08));
      const d1 = proj(add(fuss, [0, 0.08, 0])), d2 = proj(add(fuss, [0, 0.46, 0]));
      hand = [kapsel(W2, P.rHandgelenk * H * g, G2, P.rFaust * H * g), kapsel(d1, 0.105 * H * g, d2, 0.09 * H * g)];
    }
    return { teile, hand, G2, W2, S2, E2 };
  };
  const beinFormen = (b) => {
    const H2 = proj(b.H), K2 = proj(b.K), A2 = proj(b.A), F2 = proj(b.ferse), T2 = proj(b.spitze), B2 = proj(b.ballen);
    return [
      ...bauch(H2, P.rHuefte * H * g, K2, P.rKnie * H * g, 0.36, P.rOberschenkelBauch * H * g, 0.05, vornBecken),
      ...bauch(K2, P.rKnie * H * g, A2, P.rKnoechel * H * g, 0.3, P.rWade * H * g, -0.06, vornBecken),
      kapsel(A2, P.rKnoechel * H * g, F2, P.rFerse * H), kapsel(F2, P.rFerse * H, B2, P.rBallen * H), kapsel(B2, P.rBallen * H, T2, P.rSpitze * H),
    ];
  };

  // Tiefenstaffelung: Seite, deren Schulter/Hüfte hinter der Rumpfmitte liegt, wird „fern“ (heller).
  const zR = tief(S.R) + tief(HG.R), zL = tief(S.L) + tief(HG.L);
  const gleich = pose.ton === 'gleich' || Math.abs(zR - zL) < 0.35;
  const fern = gleich ? null : zR < zL ? 'R' : 'L';
  const KN = pose.geist === 'kontur' ? 's-gu' : pose.geist ? 's-gk' : 's-k';
  const KF = pose.geist === 'kontur' ? 's-gu' : pose.geist ? 's-gf' : 's-f';
  const kls = (s) => (s === fern ? KF : KN);

  // Kopf: Ellipse plus Kiefer- und Kinnansatz in Blickrichtung. Ohne Gesicht, aber mit Richtung.
  const kopfM = proj(KM);
  const sinB = Math.sin(rad(bB + (pose.schulter ?? 0))), cosB = Math.cos(rad(bB + (pose.schulter ?? 0)));
  const kopfAchse = sub(proj(add(KM, kopfR.U)), kopfM);
  const kopfW = (Math.atan2(kopfAchse[0], -kopfAchse[1]) * 180) / Math.PI;
  const kinn1 = proj(add(KM, kopfR.w([0, -0.2, 0.1]))), kinn2 = proj(add(KM, kopfR.w([0, -0.34, 0.25])));
  const kopf = [
    `<ellipse cx="${f(kopfM[0])}" cy="${f(kopfM[1])}" rx="${f((P.kopfB / 2) * H)}" ry="${f((P.kopfH / 2) * H)}" transform="rotate(${f(kopfW)} ${f(kopfM[0])} ${f(kopfM[1])})"/>`,
    `<path d="${kapsel(kinn1, 0.3 * H, kinn2, 0.13 * H)}"/>`,
  ].join('');
  const rumpf = rumpfKontur(proj(N), proj(HM), H, sinB, cosB, 0.86, k);

  const sch = pose.schlaeger;
  let schl = '';
  if (sch) {
    const a = arme[sch.hand];
    schl = schlaeger3d({ griff: a.griff, achse: norm(oben.w(sch.achse)), flaeche: norm(oben.w(sch.flaeche ?? [0, 0, 1])), proj, H, geist: pose.geist });
  }

  // Ebene je Arm: liegt der Arm vor der Rumpfmitte, wird er nach dem Rumpf gezeichnet,
  // in der nahen Tönung und freigestellt — sonst davor, im Ton seiner Seite.
  const rumpfZ = tief(lerp(N, HM, 0.4));
  const vorRumpf = (s) => {
    const a = pose[`arm${s}`];
    if (a?.vor !== undefined) return a.vor;
    return (tief(arme[s].E) + tief(arme[s].W)) / 2 > rumpfZ + 0.15;
  };
  const schichten = [];
  const formen = {};
  const zeichneArm = (s, freistellen) => {
    const a = armFormen(arme[s]);
    formen[s] = a;
    const mitSchl = sch && sch.hand === s;
    if (freistellen && (pose.frei ?? true) && !pose.geist) schichten.push(gruppe('s-x', [...a.teile, ...a.hand]));
    const kl = freistellen ? KN : kls(s);
    schichten.push(gruppe(kl, a.teile));
    if (mitSchl) schichten.push(schl);
    schichten.push(gruppe(kl, a.hand));
  };
  const reihenfolge = ['R', 'L'].sort((x, y) => (tief(S[x]) - tief(S[y])));
  for (const s of reihenfolge) if (s === fern) schichten.push(gruppe(kls(s), beinFormen(beine[s])));
  for (const s of reihenfolge) if (arme[s] && !vorRumpf(s)) zeichneArm(s, false);
  schichten.push(gruppe(KN, [rumpf, ...['R', 'L'].filter((s) => s !== fern).flatMap((s) => beinFormen(beine[s]))]));
  schichten.push(`<g class="${KN}">${kopf}</g>`);
  for (const s of reihenfolge) if (arme[s] && vorRumpf(s)) zeichneArm(s, true);

  // Prüfdaten für das Gate: Kollision eines nahen Arms mit dem Kopf, Balance je Posenart.
  const warnungen = [];
  const kopfR2 = (P.kopfH / 2) * H;
  for (const s of ['R', 'L']) {
    if (!arme[s] || !vorRumpf(s)) continue;
    const a = formen[s];
    const d = Math.min(abstandStrecke(kopfM, a.S2, a.E2) - P.rSchulter * H * g, abstandStrecke(kopfM, a.E2, a.W2) - P.rEllbogen * H * g);
    if (d < kopfR2 * 0.5) warnungen.push(`Arm ${s} verdeckt den Kopf (Abstand ${f(d)} < ${f(kopfR2 * 0.5)})`);
  }
  // Gesundheitsrahmen (docs/grafik-strategie.md, Abschnitt 6): Kniewinkel nie unter 90°, das Knie
  // ragt in Blickrichtung nicht über die Zehenspitze. Gilt für jedes Bein mit Bodenkontakt; in der
  // Luft (art 'luft') darf ein Bein angezogen sein. scratchpad/figuren/gate.mjs bricht daran ab.
  if ((pose.art ?? 'stehend') !== 'luft') {
    for (const s of ['R', 'L']) {
      const b = beine[s], a1 = sub(b.H, b.K), a2 = sub(b.A, b.K);
      const kw = (Math.acos(Math.max(-1, Math.min(1, dot(a1, a2) / (len(a1) * len(a2))))) * 180) / Math.PI;
      if (kw < 90) warnungen.push(`Gesundheitsrahmen: Kniewinkel ${s} ${f(kw)}° < 90°`);
      // Ein nachgezogenes Bein (Sprunggelenk deutlich hinter der Hüfte, wie das hintere Bein im
      // Drive) hat sein Knie zwangsläufig vor der Fußspitze; die Regel meint das belastete Bein.
      const nachgezogen = dot(sub(b.A, b.H), becken.F) < -0.4;
      const vor = dot(sub(b.K, b.spitze), becken.F);
      if (vor > 0.05 && !nachgezogen) warnungen.push(`Gesundheitsrahmen: Knie ${s} ${f(vor)} H vor der Fußspitze`);
    }
  }
  // Rumpfdrehung: mehr als etwa 60° zwischen Becken und Schultern schafft kein Körper, und die
  // Rumpfkontur folgt den Schultern — die Figur wird bauchig (G-047 mit −95°, Prüfung Welle 5).
  if (Math.abs(pose.schulter ?? 0) > 60) warnungen.push(`Rumpf um ${f(pose.schulter)}° gegen das Becken gedreht (höchstens 60°)`);
  // Schlagfläche: flaeche muss senkrecht zur achse stehen, sonst zeichnet schlaeger3d eine andere
  // Fläche als gemeint (die Fläche zeigte zur Betrachterin statt zum Ziel, Prüfung Welle 2).
  if (sch) {
    const schief = dot(norm(oben.w(sch.achse)), norm(oben.w(sch.flaeche ?? [0, 0, 1])));
    if (Math.abs(schief) > 0.2) warnungen.push(`Schlägerfläche steht schief zur Achse (achse·flaeche ${f(schief)})`);
  }
  // Bodenkontakt: wer nicht springt, steht mit beiden Füßen am Boden. Der tiefste Punkt bestimmt den
  // Boden; liegt die Sohle des anderen Fußes mehr als 0,1 H darüber, schwebt er (G-036, Prüfung
  // Welle 4: im Ausfallschritt setzte der Ballen des hinteren Fußes den Boden, der vordere hing).
  // Ein Bein, das bewusst in der Luft ist (Schritt, Nachziehen), meldet die Pose mit frei: ['L'].
  if ((pose.art ?? 'stehend') !== 'luft') {
    for (const s of ['R', 'L']) {
      if ((pose.frei_fuss ?? []).includes(s)) continue;
      const unten = unterseite(beine[s]);
      if (unten - sohle > 0.1) warnungen.push(`Bodenkontakt: Fuß ${s} schwebt ${f(unten - sohle)} H`);
    }
  }
  // Schwerpunkt grob: zwischen Hüfte und Halsansatz, näher an der Hüfte (Beine und Rumpf).
  const fussX = ['R', 'L'].flatMap((s) => [proj(beine[s].ferse)[0], proj(beine[s].spitze)[0]]);
  const sx = lerp(proj(HM), proj(N), 0.3)[0];
  if ((pose.art ?? 'stehend') === 'stehend' && (sx < Math.min(...fussX) - 0.15 * H || sx > Math.max(...fussX) + 0.15 * H)) {
    warnungen.push(`Schwerpunkt außerhalb der Standfläche (${f(sx)}, Füße ${f(Math.min(...fussX))}–${f(Math.max(...fussX))})`);
  }

  return {
    // Kontur: alle Teile einmal dick in --tinte-3 gestrichen, darüber dieselben Teile in der
    // Hintergrundfarbe gefüllt — übrig bleibt nur der äußere Umriss, ohne innere Überlappungen.
    svg: pose.geist === 'kontur'
      ? schichten.join('\n  ') + '\n  ' + schichten.filter((x) => x.startsWith('<g class="s-gu">')).join('\n  ').replaceAll('class="s-gu"', 'class="s-gi"')
      : schichten.join('\n  '),
    H, proj, warnungen, korrektur,
    punkte: {
      kopf: kopfM, hals: proj(N), huefte: proj(HM), kopfRadius: kopfR2,
      handR: arme.R && proj(arme.R.griff), handL: arme.L && proj(arme.L.griff),
      handgelenkR: arme.R && proj(arme.R.W), handgelenkL: arme.L && proj(arme.L.W),
      ellbogenR: arme.R && proj(arme.R.E), ellbogenL: arme.L && proj(arme.L.E),
      schulterR: proj(S.R), schulterL: proj(S.L), knieR: proj(beine.R.K), knieL: proj(beine.L.K),
      ballenR: proj(beine.R.ballen), ballenL: proj(beine.L.ballen),
      fersR: proj(beine.R.ferse), fersL: proj(beine.L.ferse), spitzeR: proj(beine.R.spitze), spitzeL: proj(beine.L.spitze),
      schlaegerKopf: sch && proj(add(arme[sch.hand].griff, mul(norm(oben.w(sch.achse)), 1.62))),
      schlaegerNormale: sch && (() => {
        const ac = norm(oben.w(sch.achse)), q = norm(cross(norm(oben.w(sch.flaeche ?? [0, 0, 1])), ac));
        return sub(proj(add(arme[sch.hand].griff, norm(cross(ac, q)))), proj(arme[sch.hand].griff));
      })(),
      boden: oy, sohle: oy - (pose.heben ?? 0) * H,
    },
    welt: { arme, beine, oben, becken },
  };
}

// ---------------------------------------------------------------------------
// Schläger (Crossminton, Squash-ähnlich; Regel 1.2: höchstens 61 cm, gezeichnet ≈ 58 cm
// ≈ 2,55 H). Ovaler besaiteter Kopf als echte projizierte Ellipse, offener Hals, Schaft,
// Griff mit Griffband.
// ---------------------------------------------------------------------------
export function schlaeger3d({ griff, achse, flaeche, proj, H, geist = false }) {
  const quer = norm(cross(flaeche, achse));
  const at = (s, q = 0) => add(add(griff, mul(achse, s)), mul(quer, q));
  const mitte = at(1.62), a = 0.6, b = 0.44;
  const ellipse = (n = 40) => {
    const ps = [];
    for (let i = 0; i < n; i++) { const t = (2 * Math.PI * i) / n; ps.push(proj(add(add(mitte, mul(achse, Math.cos(t) * a)), mul(quer, Math.sin(t) * b)))); }
    return glatt(ps, 0.5);
  };
  let saiten = '';
  // Sichtbarkeit an der GEZEICHNETEN Normale messen: flaeche ist nur die Wunschrichtung, gezeichnet
  // wird die Ebene aus achse und quer. Lag flaeche schief zur achse, fehlte die Bespannung genau
  // dann, wenn man frontal auf die Fläche sah (Prüfung Welle 2).
  const sichtbar = Math.abs(norm(cross(achse, quer))[2]);
  if (sichtbar > 0.35 && !geist) {
    for (const q of [-0.5, 0, 0.5]) { const h = a * Math.sqrt(1 - q * q) * 0.93; saiten += `M${pt(proj(add(mitte, add(mul(quer, q * b), mul(achse, -h)))))}L${pt(proj(add(mitte, add(mul(quer, q * b), mul(achse, h)))))}`; }
    for (const q of [-0.5, 0, 0.5]) { const w = b * Math.sqrt(1 - q * q) * 0.91; saiten += `M${pt(proj(add(mitte, add(mul(achse, q * a), mul(quer, -w)))))}L${pt(proj(add(mitte, add(mul(achse, q * a), mul(quer, w)))))}`; }
  }
  const unten = add(mitte, mul(achse, -a * 0.94));
  const hals = proj(at(0.98)), hl = proj(add(unten, mul(quer, -b * 0.4))), hr = proj(add(unten, mul(quer, b * 0.4)));
  const ende = proj(at(-0.3)), griffEnde = proj(at(0.44));
  // geist: true = blasse Begleitphase einer Geisterfigur; 'kontur' = eine Phase, die allein die
  // Aussage trägt (Ausholen, Schwungweg) — dann volle Kontur mit 3:1 (Leitfaden, Kontrast).
  const p = geist === 'kontur' ? 's-z' : geist ? 's-g' : 's-r';
  return [
    geist ? '' : `<path class="s-rf" d="${ellipse()}"/>`,
    saiten ? `<path class="s-rs" d="${saiten}"/>` : '',
    `<path class="${p}h" d="M${pt(hl)}L${pt(hals)}L${pt(hr)}"/>`,
    `<path class="${p}sch" d="M${pt(griffEnde)}L${pt(hals)}"/>`,
    `<path class="${p}r" d="${ellipse()}"/>`,
    `<path class="${p}g" d="M${pt(ende)}L${pt(griffEnde)}"/>`,
  ].join('');
}

// ---------------------------------------------------------------------------
// Stil — nur Klassenselektoren, keine At-Regeln, keine Kommentare (Test [22]).
// Präfix s- an jeder Klasse: App-Klassen wie .kopf greifen sonst in die Grafik (die
// Druckregel blendete .kopf aus). Akzent ist --primaer-dunkel: --primaer erreicht auf
// --flaeche-2 nur 2,48:1, --primaer-dunkel 3,36:1 hell und 6,92:1 dunkel (WCAG 1.4.11).
// ---------------------------------------------------------------------------
const AKZ = 'var(--primaer-dunkel,#1e8bd6)';
export const STIL = {
  's-k': 'fill:var(--tinte,#16202b)',
  's-f': 'fill:var(--tinte-2,#5a6675)',
  's-gk': 'fill:var(--tinte-3,#656f7e);opacity:.3',
  's-gf': 'fill:var(--tinte-3,#656f7e);opacity:.2',
  's-gu': 'fill:var(--tinte-3,#656f7e);stroke:var(--tinte-3,#656f7e);stroke-width:3.8;stroke-linejoin:round',
  's-gi': 'fill:var(--flaeche-2,#f1f5fb)',
  's-x': 'fill:var(--flaeche-2,#f1f5fb);stroke:var(--flaeche-2,#f1f5fb);stroke-width:2.4;stroke-linejoin:round',
  's-rf': 'fill:var(--primaer,#38a4f1);opacity:.14',
  's-rs': `fill:none;stroke:${AKZ};stroke-width:.8;opacity:.55`,
  's-rr': `fill:none;stroke:${AKZ};stroke-width:2.6;stroke-linejoin:round`,
  's-rh': `fill:none;stroke:${AKZ};stroke-width:2.1;stroke-linecap:round;stroke-linejoin:round`,
  's-rsch': `fill:none;stroke:${AKZ};stroke-width:2.8;stroke-linecap:round`,
  's-rg': 'fill:none;stroke:var(--tinte-2,#5a6675);stroke-width:5.2;stroke-linecap:round',
  's-gr': 'fill:none;stroke:var(--tinte-3,#656f7e);stroke-width:2;opacity:.45',
  's-gh': 'fill:none;stroke:var(--tinte-3,#656f7e);stroke-width:1.6;opacity:.45;stroke-linecap:round;stroke-linejoin:round',
  's-gsch': 'fill:none;stroke:var(--tinte-3,#656f7e);stroke-width:2.2;opacity:.45;stroke-linecap:round',
  's-gg': 'fill:none;stroke:var(--tinte-3,#656f7e);stroke-width:4;opacity:.35;stroke-linecap:round',
  's-zr': 'fill:none;stroke:var(--tinte-3,#656f7e);stroke-width:2;opacity:.85',
  's-zh': 'fill:none;stroke:var(--tinte-3,#656f7e);stroke-width:1.6;opacity:.85;stroke-linecap:round;stroke-linejoin:round',
  's-zsch': 'fill:none;stroke:var(--tinte-3,#656f7e);stroke-width:2.2;opacity:.85;stroke-linecap:round',
  's-zg': 'fill:none;stroke:var(--tinte-3,#656f7e);stroke-width:4;opacity:.7;stroke-linecap:round',
  's-korb': 'fill:var(--speeder-korb,#f0c400);stroke:var(--tinte-2,#5a6675);stroke-width:.9;stroke-linejoin:round',
  's-kappe': 'fill:var(--speeder-kappe,#e2402a)',
  's-sch': 'fill:var(--schatten-boden,#16202b2e)',
  's-schw': 'fill:var(--schatten-boden,#16202b2e);opacity:.5',
  's-spur': `fill:${AKZ};opacity:.18`,
  's-bahn': `fill:none;stroke:${AKZ};stroke-width:2.8;stroke-dasharray:.1 6.5;stroke-linecap:round`,
  's-bahn2': `fill:none;stroke:${AKZ};stroke-width:2.2;stroke-dasharray:6 5;stroke-linecap:round`,
  's-bahnz': 'fill:none;stroke:var(--tinte-3,#656f7e);stroke-width:1.6;stroke-linecap:round',
  's-bahng': 'fill:none;stroke:var(--tinte-3,#656f7e);stroke-width:2;stroke-dasharray:.1 5.5;stroke-linecap:round',
  's-weg': `fill:none;stroke:${AKZ};stroke-width:3;stroke-dasharray:8 6;stroke-linecap:round`,
  's-wegg': 'fill:none;stroke:var(--tinte-3,#656f7e);stroke-width:3;stroke-dasharray:8 6;stroke-linecap:round',
  's-wegv': 'fill:none;stroke:var(--tinte-3,#656f7e);stroke-width:3;stroke-linecap:round',
  's-blick': 'fill:none;stroke:var(--tinte-3,#656f7e);stroke-width:1.8;stroke-dasharray:.1 5;stroke-linecap:round',
  's-mk': `fill:${AKZ}`,
  's-mkg': 'fill:var(--tinte-3,#656f7e)',
  's-spk': 'fill:var(--flaeche-2,#f1f5fb);stroke:var(--tinte-3,#656f7e);stroke-width:1.6;stroke-linejoin:round',
  's-hart': `fill:none;stroke:${AKZ};stroke-width:3.2;stroke-linecap:round`,
  's-gabel': 'fill:none;stroke:var(--tinte-2,#5a6675);stroke-width:1.8',
  's-feld': 'fill:var(--tinte-3,#656f7e);opacity:.07',
  's-linie': 'fill:none;stroke:var(--tinte-3,#656f7e);stroke-width:1.6;opacity:.75;stroke-linecap:round',
  's-boden': 'fill:none;stroke:var(--tinte-3,#656f7e);stroke-width:1.6;opacity:.55;stroke-linecap:round',
  's-basis': 'fill:var(--primaer-weich,#e8f3fe);stroke:var(--primaer-dunkel,#1e8bd6);stroke-width:1.6',
  's-druck': `fill:${AKZ}`,
  's-blase': 'fill:var(--flaeche,#ffffff);stroke:var(--tinte,#16202b);stroke-width:2;stroke-linejoin:round',
  's-ruf': 'fill:var(--tinte,#16202b);font:800 15px/1 system-ui,sans-serif;text-anchor:middle',
  's-zeile': 'fill:none;stroke:var(--tinte-2,#5a6675);stroke-width:3;stroke-linecap:round',
  's-schall': `fill:none;stroke:${AKZ};stroke-width:2.2;stroke-linecap:round`,
  's-lab': 'fill:var(--tinte-2,#5a6675);font:600 10.5px/1 system-ui,sans-serif',
  's-griff': 'fill:var(--primaer-weich,#e8f3fe);stroke:var(--primaer-dunkel,#1e8bd6);stroke-width:2.2;stroke-linejoin:round',
  's-band': `fill:none;stroke:${AKZ};stroke-width:1.3;opacity:.4`,
  's-rr2': `fill:none;stroke:${AKZ};stroke-width:4.4`,
  's-rh2': `fill:none;stroke:${AKZ};stroke-width:3.6;stroke-linecap:round;stroke-linejoin:round`,
  's-rsch2': `fill:none;stroke:${AKZ};stroke-width:6;stroke-linecap:round`,
  's-x2': 'fill:var(--flaeche-2,#f1f5fb);stroke:var(--flaeche-2,#f1f5fb);stroke-width:2;stroke-linejoin:round',
  's-v': `fill:none;stroke:${AKZ};stroke-width:4;stroke-linecap:round;stroke-linejoin:round`,
  's-lt': 'fill:var(--primaer-tief,#1568ad);font:700 18px/1 system-ui,sans-serif;text-anchor:middle',
  's-rot': `fill:none;stroke:${AKZ};stroke-width:2.6;stroke-linecap:round`,
  's-x3': 'fill:var(--flaeche-2,#f1f5fb);stroke:var(--flaeche-2,#f1f5fb);stroke-width:1.5;stroke-linejoin:round',
  's-tempo': `fill:none;stroke:${AKZ};stroke-width:2;stroke-linecap:round;opacity:.5`,
  's-chev': `fill:none;stroke:${AKZ};stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round`,
  's-kegel': 'fill:var(--primaer-weich,#e8f3fe);stroke:var(--primaer-dunkel,#1e8bd6);stroke-width:1.6;stroke-linejoin:round',
  's-tafel': 'fill:var(--flaeche,#ffffff);stroke:var(--tinte-3,#656f7e);stroke-width:1.6',
  's-zahl': 'fill:var(--tinte,#16202b);font:800 15px/1 system-ui,sans-serif;text-anchor:middle',
  's-ring': `fill:none;stroke:${AKZ};stroke-width:2.4`,
  's-strich': 'fill:none;stroke:var(--tinte-2,#5a6675);stroke-width:2.2;stroke-linecap:round',
  's-bruch': 'fill:none;stroke:var(--tinte-3,#656f7e);stroke-width:1.8;stroke-linecap:round',
  's-hilf': 'fill:none;stroke:var(--tinte-3,#656f7e);stroke-width:1.4;stroke-dasharray:5 4',
  's-zone': 'fill:none;stroke:var(--tinte-3,#656f7e);stroke-width:1.8;stroke-linecap:round',
  's-luecke': 'fill:none;stroke:var(--flaeche-2,#f1f5fb);stroke-width:8',
  's-fern': 'opacity:.55',
  's-schnitt': 'fill:none;stroke:var(--flaeche-2,#f1f5fb);stroke-width:2.2;stroke-linecap:round',
  's-ag0': 'stop-color:var(--tinte,#16202b);stop-opacity:1',
  's-ag1': 'stop-color:var(--tinte,#16202b);stop-opacity:0',
  'st': 'fill:var(--tinte-3,#656f7e);font:600 12px/1 system-ui,sans-serif;text-anchor:middle',
};

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Komplette Datei: nur tatsächlich benutzte Klassen landen im <style>. data-quelle markiert
// die Datei als generiert — die alten Übersetzungsskripte (gen-en/fr/pl) brechen davor ab.
// breite: nur wo zwei Felder nebeneinander bei H ≥ 20 nicht in 300 passen (G-036); nahe quadratisch halten
export function datei({ aria, caption, captionY, inhalt, defs = '', breite = 300 }) {
  const alles = inhalt + defs;
  const benutzt = Object.entries(STIL).filter(([k]) => k === 'st' || new RegExp(`class="${k}"`).test(alles));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${breite} 300" role="img" data-quelle="figuren" aria-label="${esc(aria)}">
  <style>
${benutzt.map(([k, v]) => `    .${k}{${v}}`).join('\n')}
  </style>
${defs ? `  <defs>${defs}</defs>\n` : ''}  ${inhalt}
  <text class="st" x="${breite / 2}" y="${captionY}">${esc(caption)}</text>
</svg>
`;
}
