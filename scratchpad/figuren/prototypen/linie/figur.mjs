// Stilrichtung „Klare Linie, menschliche Proportion“ — parametrischer Figurengenerator.
//
// Eine Figur ist DATEN: Beckenpunkt, Drehung des Körpers zur Kamera, Neigung des
// Rumpfs und je Gliedmaße entweder zwei Winkel oder ein Zielpunkt (Zwei-Knochen-IK).
// Alle Längen und Breiten stehen in Kopfhöhen (P, R) und gelten für jede Grafik gleich;
// nur der Maßstab H (Pixel je Kopfhöhe) wechselt mit dem Motiv.
//
// Zeichnen in drei Durchgängen (darum „kräftig außen, fein innen“):
//   1. ferne Körperseite: eigener Umriss + Füllung, als Gruppe aufgehellt (.li-fern)
//   2. EIN kräftiger Umriss um alle nahen Teile zusammen = die Silhouette
//   3. je Schicht (Bein, Hose, Rumpf, Kopf, Arm, Schläger, Hand …) ein mittlerer
//      Umriss + Füllung — so bleibt nur dort eine Linie stehen, wo ein Teil vor
//      einem anderen liegt; zuletzt feine Innenlinien (Säume, Gelenkfalten, Ohr).
//
// Winkel auf dem Bildschirm: 0° = nach unten, 90° = nach rechts, 180° = nach oben,
// −90° = nach links. Drehung `dreh`: 0 = Blick zur Kamera, 90 = Profil nach rechts,
// 180 = Rücken, −90 = Profil nach links.

export const P = { // Segmentlängen in Kopfhöhen (Figur ≈ 7,1 Köpfe)
  oberarm: 1.38, unterarm: 1.16, oberschenkel: 1.78, unterschenkel: 1.66,
  schulterY: 2.02, schulterX: 0.7, hueftX: 0.36, halsY: 2.3, hals: 0.24,
};
export const R = { // Radien in Kopfhöhen
  schulter: 0.19, oberarmMitte: 0.165, ellbogen: 0.125, unterarmMitte: 0.14, handgelenk: 0.09,
  huefte: 0.27, oberschenkelMitte: 0.235, knie: 0.16, wade: 0.185, knoechel: 0.095, hals: 0.14,
};

export const LINIE = { aussen: 2.7, innen: 1.15, fein: 1.05 };

const rad = (g) => (g * Math.PI) / 180;
const r1 = (n) => Math.round(n * 10) / 10;
export const dirv = (g) => ({ x: Math.sin(rad(g)), y: Math.cos(rad(g)) });
export const add = (a, b, s = 1) => ({ x: a.x + b.x * s, y: a.y + b.y * s });
export const lerp = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
const len = (v) => Math.hypot(v.x, v.y);
const norm = (v) => { const l = len(v) || 1; return { x: v.x / l, y: v.y / l }; };
const perp = (v) => ({ x: -v.y, y: v.x });
export const winkelVon = (a, b) => (Math.atan2(b.x - a.x, b.y - a.y) * 180) / Math.PI;

// ---------- Geometrie: Hülle von Kreisen, Pfade ----------
function kreisPunkte(k, n) {
  const p = [];
  for (let i = 0; i < n; i++) { const t = (i / n) * Math.PI * 2; p.push({ x: k.x + k.r * Math.cos(t), y: k.y + k.r * Math.sin(t) }); }
  return p;
}
function konvex(pts) {
  const s = pts.slice().sort((a, b) => a.x - b.x || a.y - b.y);
  const cr = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lo = [], hi = [];
  for (const p of s) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (const p of s.reverse()) { while (hi.length >= 2 && cr(hi[hi.length - 2], hi[hi.length - 1], p) <= 0) hi.pop(); hi.push(p); }
  return lo.slice(0, -1).concat(hi.slice(0, -1));
}
function vereinfache(pts, eps = 0.12) { // entfernt fast gerade Zwischenpunkte (gegen den zuletzt behaltenen)
  if (pts.length < 8) return pts;
  const out = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const a = out[out.length - 1], b = pts[i], c = pts[(i + 1) % pts.length];
    const fl = Math.abs((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) / (len({ x: c.x - a.x, y: c.y - a.y }) || 1);
    if (fl > eps) out.push(b);
  }
  return out;
}
export function huellePunkte(kreise) {
  const pts = kreise.flatMap((k) => kreisPunkte(k, Math.max(14, Math.round(k.r * 3.2))));
  return vereinfache(konvex(pts));
}
export const polyPfad = (pts) => 'M' + pts.map((p) => `${r1(p.x)},${r1(p.y)}`).join('L') + 'Z';
export const huelle = (kreise) => polyPfad(huellePunkte(kreise));
// Konvexes Polygon gegen konvexes Polygon schneiden (Sutherland–Hodgman) — für Haar im Kopf.
export function schneide(subjekt, clip) {
  let out = subjekt;
  let fl = 0; for (let i = 0; i < clip.length; i++) { const p = clip[i], q = clip[(i + 1) % clip.length]; fl += p.x * q.y - q.x * p.y; }
  const ori = Math.sign(fl) || 1;
  for (let i = 0; i < clip.length; i++) {
    const a = clip[i], b = clip[(i + 1) % clip.length];
    const innen = (p) => ori * ((b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x)) >= 0;
    const schnitt = (p, q) => { const dx = q.x - p.x, dy = q.y - p.y, ex = b.x - a.x, ey = b.y - a.y; const t = (ex * (a.y - p.y) - ey * (a.x - p.x)) / (ex * dy - ey * dx); return { x: p.x + dx * t, y: p.y + dy * t }; };
    const neu = [];
    for (let j = 0; j < out.length; j++) {
      const p = out[j], q = out[(j + 1) % out.length];
      if (innen(q)) { if (!innen(p)) neu.push(schnitt(p, q)); neu.push(q); } else if (innen(p)) neu.push(schnitt(p, q));
    }
    out = neu; if (!out.length) break;
  }
  return out;
}
const kurve = (pkte) => { // weiche offene Linie durch Punkte (Catmull-Rom → Bézier)
  let d = `M${r1(pkte[0].x)},${r1(pkte[0].y)}`;
  for (let i = 0; i < pkte.length - 1; i++) {
    const p0 = pkte[i - 1] ?? pkte[i], p1 = pkte[i], p2 = pkte[i + 1], p3 = pkte[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 }, c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += `C${r1(c1.x)},${r1(c1.y)} ${r1(c2.x)},${r1(c2.y)} ${r1(p2.x)},${r1(p2.y)}`;
  }
  return d;
};
export { kurve };

// ---------- Stil ----------
// Klassen tragen das Präfix li-, damit sie neben Altgrafiken auf einer Seite nicht kollidieren.
export function stil(extra = '') {
  return `<style>
    .li-u{fill:var(--tinte,#16202b);stroke:var(--tinte,#16202b);stroke-width:${LINIE.aussen * 2};stroke-linejoin:round}
    .li-m{fill:var(--tinte,#16202b);stroke:var(--tinte,#16202b);stroke-width:${LINIE.innen * 2};stroke-linejoin:round}
    .li-fern{opacity:.7}
    .li-haut{fill:var(--flaeche,#fff)}
    .li-shirt{fill:var(--primaer-weich,#e8f3fe)}
    .li-hose{fill:var(--tinte-2,#5a6675);fill-opacity:.32}
    .li-schuh{fill:var(--tinte-2,#5a6675)}
    .li-sohle{fill:none;stroke:var(--flaeche,#fff);stroke-width:1.2;stroke-linecap:round;opacity:.9}
    .li-zeichen{fill:var(--primaer,#38a4f1)}
    .li-haar{fill:var(--tinte-2,#5a6675)}
    .li-fein{fill:none;stroke:var(--tinte,#16202b);stroke-width:${LINIE.fein};stroke-linecap:round;stroke-linejoin:round;opacity:.6}
    .li-griff{fill:var(--primaer-tief,#1568ad)}
    .li-schaft{fill:none;stroke:var(--primaer,#38a4f1);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
    .li-rahmen{fill:var(--primaer,#38a4f1);fill-opacity:.13;stroke:var(--primaer,#38a4f1);stroke-width:2.6}
    .li-saite{fill:none;stroke:var(--primaer,#38a4f1);stroke-width:.7;opacity:.55}
    .li-bahn{fill:none;stroke:var(--primaer,#38a4f1);stroke-width:2.6;stroke-linecap:round;stroke-dasharray:.1 6.4}
    .li-schwung{fill:none;stroke:var(--primaer,#38a4f1);stroke-width:7;stroke-linecap:round;opacity:.22}
    .li-schwungf{fill:var(--primaer,#38a4f1);opacity:.2}
    .li-strahl{fill:none;stroke:var(--primaer,#38a4f1);stroke-width:2.2;stroke-linecap:round}
    .li-pfeil{fill:var(--primaer,#38a4f1)}
    .li-pfeilg{fill:var(--tinte-3,#656f7e)}
    .li-weg{fill:none;stroke:var(--tinte-3,#656f7e);stroke-width:2.2;stroke-linecap:round;stroke-dasharray:6 5}
    .li-ring{fill:none;stroke:var(--primaer,#38a4f1);stroke-width:1.6}
    .li-punkt{fill:var(--primaer,#38a4f1)}
    .li-boden{fill:none;stroke:var(--tinte-3,#656f7e);stroke-width:1.4;stroke-linecap:round;opacity:.55}
    .li-feld{fill:var(--tinte,#16202b);fill-opacity:.04;stroke:var(--tinte-3,#656f7e);stroke-width:1.3;stroke-linejoin:round;opacity:.8}
    .li-schatten{fill:var(--tinte,#16202b);opacity:.09}
    .li-kappe{fill:var(--speeder-kappe,#e2402a);stroke:var(--tinte,#16202b);stroke-width:.9}
    .li-korb{fill:var(--speeder-korb,#f0c400);stroke:var(--tinte,#16202b);stroke-width:.9;stroke-linejoin:round}
    .li-blick{fill:none;stroke:var(--tinte-3,#656f7e);stroke-width:1.6;stroke-linecap:round;stroke-dasharray:2 4}
    .st{fill:var(--tinte-3,#656f7e);font:600 12px/1 system-ui,sans-serif;text-anchor:middle}${extra ? '\n    ' + extra : ''}
  </style>`;
}

// Pfeilspitze; id muss je Datei eindeutig sein (wird zur Laufzeit ohnehin präfixt).
export const marker = (id, klasse = 'li-pfeil') =>
  `<marker id="${id}" viewBox="0 0 10 10" markerWidth="5.2" markerHeight="5.2" refX="5" refY="5" orient="auto"><path d="M0.5,1.2 L9.5,5 L0.5,8.8 L2.6,5 Z" class="${klasse}"/></marker>`;

// ---------- Requisiten ----------
// Crossminton-Schläger (58 cm ≈ 2,3 Köpfe): Griff mit Griffband, schlanker Schaft,
// geschlossener Hals, ovaler besaiteter Kopf. `flaeche` 0..1 = wie weit die Schlagfläche
// zur Kamera zeigt (1 = frontal, 0,3 = fast Kante).
export function schlaeger(griff, winkel, H, { flaeche = 0.75, k = 1 } = {}) {
  const u0 = dirv(winkel), u = { x: u0.x * k, y: u0.y * k }, n = perp(u0);
  const end = add(griff, u, -0.3 * H);
  const griffEnde = add(end, u, 0.62 * H);
  const hals = add(end, u, 1.08 * H);
  const kopfL = 1.06 * H, kopfB = 0.84 * H * flaeche;
  const mitte = add(end, u, 1.08 * H + 0.12 * H + kopfL / 2);
  const ry = kopfL / 2, rx = kopfB / 2;
  // Kopf als Ellipse in Schlägerrichtung
  const ell = (t) => add(add(mitte, u, Math.cos(t) * ry), n, Math.sin(t) * rx);
  const kopf = []; for (let i = 0; i < 48; i++) kopf.push(ell((i / 48) * Math.PI * 2));
  const halsL = ell(Math.PI + 0.55), halsR = ell(Math.PI - 0.55);
  const griffBreite = 0.13 * H;
  const griffForm = huelle([{ ...end, r: griffBreite * 0.62 }, { ...lerp(end, griffEnde, 0.15), r: griffBreite / 2 }, { ...griffEnde, r: griffBreite * 0.45 }]);
  // Saiten: Sehnen der Ellipse
  let saiten = '';
  for (const s of [-0.5, 0, 0.5]) { // längs
    const a = add(add(mitte, n, s * rx), u, -ry * Math.sqrt(1 - s * s) * 0.92), b = add(add(mitte, n, s * rx), u, ry * Math.sqrt(1 - s * s) * 0.92);
    saiten += `M${r1(a.x)},${r1(a.y)}L${r1(b.x)},${r1(b.y)}`;
  }
  for (const s of [-0.55, -0.18, 0.18, 0.55]) { // quer
    const a = add(add(mitte, u, s * ry), n, -rx * Math.sqrt(1 - s * s) * 0.9), b = add(add(mitte, u, s * ry), n, rx * Math.sqrt(1 - s * s) * 0.9);
    saiten += `M${r1(a.x)},${r1(a.y)}L${r1(b.x)},${r1(b.y)}`;
  }
  const svg = `<g><path class="li-schaft" d="M${r1(griffEnde.x)},${r1(griffEnde.y)}L${r1(hals.x)},${r1(hals.y)}L${r1(halsL.x)},${r1(halsL.y)}M${r1(hals.x)},${r1(hals.y)}L${r1(halsR.x)},${r1(halsR.y)}"/>`
    + `<path class="li-rahmen" d="${polyPfad(kopf)}"/><path class="li-saite" d="${saiten}"/>`
    + `<path class="li-griff" d="${griffForm}"/></g>`;
  return { svg, kopfMitte: mitte, kopfSpitze: add(mitte, u, ry), u: u0, n };
}

// Speeder, Kopf voran: Schlagkappe vorn in Flugrichtung, Korb dahinter. Bewusst größer
// als maßstäblich (sonst unsichtbar), aber in festem Verhältnis zur Figur.
export function speeder(spitze, flugWinkel, groesse = 9) {
  const u = dirv(flugWinkel), n = perp(u);
  const kappeM = add(spitze, u, -groesse * 0.42);
  const kragen = add(spitze, u, -groesse * 0.9);
  const ende = add(spitze, u, -groesse * 2.3);
  const korb = [add(kragen, n, groesse * 0.36), add(ende, n, groesse * 0.82), add(ende, n, -groesse * 0.82), add(kragen, n, -groesse * 0.36)];
  const kappe = huelle([{ ...kappeM, r: groesse * 0.45 }, { ...kragen, r: groesse * 0.36 }]);
  return `<g><path class="li-korb" d="${polyPfad(korb)}"/><path class="li-kappe" d="${kappe}"/></g>`;
}

// ---------- Figur ----------
function zweiKnochen(s, ziel, l1, l2, knick) {
  const d0 = { x: ziel.x - s.x, y: ziel.y - s.y };
  let d = len(d0); const dn = norm(d0);
  d = Math.min(Math.max(d, Math.abs(l1 - l2) + 0.01), l1 + l2 - 0.01);
  const a = Math.acos((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)) * knick;
  const m = { x: dn.x * Math.cos(a) - dn.y * Math.sin(a), y: dn.x * Math.sin(a) + dn.y * Math.cos(a) };
  const mitte = add(s, m, l1);
  const ende = add(s, dn, d);
  return [mitte, ende];
}

function glied(start, spec, l1, l2, H) {
  const k = spec.k ?? [1, 1];
  if (spec.ziel) return zweiKnochen(start, spec.ziel, l1 * H * k[0], l2 * H * k[1], spec.knick ?? 1);
  const m = add(start, dirv(spec.winkel[0]), l1 * H * k[0]);
  return [m, add(m, dirv(spec.winkel[1]), l2 * H * k[1])];
}

// Hand: Faust (greift), locker (offen, Finger leicht gebeugt) oder Zeichen (zwei Finger).
function hand(w, spec, H, unterarmWinkel) {
  const art = spec.art ?? 'locker';
  const wi = spec.winkel ?? unterarmWinkel;
  const u = dirv(wi), n = perp(u), dm = spec.daumen ?? 1;
  const kreise = [];
  const fein = [];
  if (art === 'locker') {
    kreise.push({ ...add(w, u, 0.14 * H), r: 0.12 * H }, { ...add(add(w, u, 0.34 * H), n, -0.02 * H * dm), r: 0.115 * H },
      { ...add(add(w, u, 0.6 * H), n, -0.05 * H * dm), r: 0.075 * H }, { ...add(add(w, u, 0.3 * H), n, 0.13 * H * dm), r: 0.06 * H });
    const a = add(add(w, u, 0.44 * H), n, -0.02 * H * dm), b = add(add(w, u, 0.62 * H), n, 0.03 * H * dm);
    fein.push(`M${r1(a.x)},${r1(a.y)}Q${r1(b.x)},${r1(b.y)} ${r1(add(b, u, -0.04 * H).x)},${r1(add(b, n, 0.06 * H * dm).y)}`);
  } else {
    kreise.push({ ...add(w, u, 0.13 * H), r: 0.125 * H }, { ...add(w, u, 0.3 * H), r: 0.135 * H }, { ...add(add(w, u, 0.2 * H), n, 0.12 * H * dm), r: 0.065 * H });
    const a = add(add(w, u, 0.36 * H), n, -0.11 * H), b = add(add(w, u, 0.36 * H), n, 0.09 * H);
    if (art !== 'griff') fein.push(`M${r1(a.x)},${r1(a.y)}L${r1(b.x)},${r1(b.y)}`);
  }
  let finger = [];
  if (art === 'zeichen') { // Zeige- und Mittelfinger gestreckt
    const fw = spec.fingerWinkel ?? wi;
    for (const [off, l, dw] of [[-0.05, 0.42, -9], [0.06, 0.45, 7]]) {
      const b = add(add(w, u, 0.34 * H), n, off * H), e = add(b, dirv(fw + dw), l * H);
      finger.push(huelle([{ ...b, r: 0.052 * H }, { ...e, r: 0.045 * H }]));
    }
  }
  return { form: huelle(kreise), finger, fein, mitte: add(w, u, 0.24 * H), u };
}

function kniescheibe(kn, oben, H) { // frontal: kleiner Bogen unter dem Knie
  const n = perp(oben), a = add(add(kn, n, -0.08 * H), oben, 0.02 * H), b = add(add(kn, n, 0.08 * H), oben, 0.02 * H), c = add(kn, oben, 0.12 * H);
  return `M${r1(a.x)},${r1(a.y)}Q${r1(c.x)},${r1(c.y)} ${r1(b.x)},${r1(b.y)}`;
}
function schuh(a, spec, H) {
  const k = spec.k ?? 1;
  const u = dirv(spec.winkel ?? 90);
  let n = perp(u); if (n.y < 0) n = { x: -n.x, y: -n.y };
  const s = (1 - k) * 0.1 * H;
  const fl = (p) => [{ ...add(p, { x: 1, y: 0 }, s), r: 0 }, { ...add(p, { x: 1, y: 0 }, -s), r: 0 }];
  const ferse = add(add(a, n, 0.1 * H), u, -0.13 * H * Math.max(k, 0.35));
  const ballen = add(add(a, n, 0.12 * H), u, 0.55 * H * k);
  const spitze = add(add(a, n, 0.1 * H), u, 0.84 * H * k);
  const kreise = [{ ...a, r: 0.12 * H }, { ...ferse, r: 0.12 * H }, { ...ballen, r: 0.11 * H }, { ...spitze, r: 0.085 * H }];
  for (const p of [ballen, spitze]) for (const q of fl(p)) kreise.push({ ...q, r: p === ballen ? 0.11 * H : 0.085 * H });
  // Sohlenlinie als feine helle Naht knapp über der Unterkante
  const s1 = add(add(ferse, n, 0.06 * H), u, -0.02 * H), s2 = add(add(spitze, n, 0.04 * H), u, -0.02 * H);
  const sohle = k > 0.5 ? `M${r1(s1.x)},${r1(s1.y)}L${r1(s2.x)},${r1(s2.y)}` : '';
  return { form: huelle(kreise), sohle, ballen: add(ballen, n, 0.11 * H), ferse: add(ferse, n, 0.12 * H) };
}

export function figur(pose) {
  const H = pose.H;
  const d = rad(pose.dreh ?? 0);
  const f = { x: Math.sin(d), z: Math.cos(d) }; // Blickrichtung
  const rv = { x: -Math.cos(d), z: Math.sin(d) }; // körpereigenes Rechts
  const a = rad(pose.rumpf ?? 0);
  const sv = { x: Math.cos(a), y: Math.sin(a) }, su = { x: Math.sin(a), y: -Math.cos(a) };
  const ky = pose.rumpfK ?? 1;
  const B = pose.becken;
  const proj = (x, y, z) => {
    const X = (x * rv.x + z * f.x) * H, Y = y * H * ky;
    return { x: B.x + X * sv.x + Y * su.x, y: B.y + X * sv.y + Y * su.y, z: x * rv.z + z * f.z };
  };
  const K = (x, y, z, r) => ({ ...proj(x, y, z), r: r * H });

  // Rumpf (Shirt) und Becken (Hose) als Hüllen
  const brust = huelle([
    K(P.schulterX, P.schulterY, -0.03, 0.2), K(-P.schulterX, P.schulterY, -0.03, 0.2),
    K(0.33, 2.2, -0.03, 0.15), K(-0.33, 2.2, -0.03, 0.15),
    K(0, 1.62, 0.26, 0.3), K(0, 1.74, -0.24, 0.3), K(0.5, 1.58, 0.03, 0.27), K(-0.5, 1.58, 0.03, 0.27),
    K(0.4, 1.12, 0, 0.24), K(-0.4, 1.12, 0, 0.24), K(0, 1.16, 0.18, 0.26), K(0, 1.2, -0.17, 0.26),
  ]);
  const bauch = huelle([
    K(0.4, 1.1, 0, 0.22), K(-0.4, 1.1, 0, 0.22), K(0, 1.05, 0.14, 0.25), K(0, 1.05, -0.12, 0.24),
    K(0.43, 0.42, 0, 0.2), K(-0.43, 0.42, 0, 0.2), K(0, 0.36, 0.13, 0.23), K(0, 0.38, -0.15, 0.24),
  ]);
  const becken = huelle([
    K(0.4, 0.62, 0, 0.22), K(-0.4, 0.62, 0, 0.22), K(P.hueftX + 0.04, 0.08, 0, 0.29), K(-P.hueftX - 0.04, 0.08, 0, 0.29),
    K(0, 0.12, 0.12, 0.26), K(0, 0.12, -0.18, 0.3), K(0, -0.16, 0, 0.2),
  ]);
  const hemd = []; // Saum unten
  { const l = proj(0.5, 0.25, 0), m = proj(0, 0.18, 0.1 * Math.sign(f.z || 1)), r = proj(-0.5, 0.25, 0); hemd.push(kurve([l, m, r])); }

  // Kopf
  const kopfW = rad((pose.rumpf ?? 0) + (pose.kopf ?? 0));
  const hu = { x: Math.sin(kopfW), y: -Math.cos(kopfW) }, hv = { x: Math.cos(kopfW), y: Math.sin(kopfW) };
  const db = rad(pose.blick ?? pose.dreh ?? 0);
  const fx = Math.sin(db), fz = Math.cos(db);
  const N = proj(0, P.halsY, 0);
  const halsOben = add(N, hu, P.hals * H);
  const C = add(add(halsOben, hu, 0.5 * H), hv, 0.1 * fx * H);
  const KP = (x, y) => add(add(C, hv, x * H), hu, y * H);
  const kopfKreise = [
    { ...KP(-0.06 * fx, 0.08), r: 0.4 * H }, { ...KP(0.09 * fx, -0.18), r: 0.3 * H }, { ...KP(0.2 * fx, -0.36), r: 0.14 * H },
  ];
  if (Math.abs(fx) > 0.35) kopfKreise.push({ ...KP(0.41 * fx, -0.05), r: 0.065 * H });
  const kopfPkte = huellePunkte(kopfKreise);
  const haarKreis = kreisPunkte({ ...KP(-0.22 * fx, 0.36 + 0.26 * fz), r: 0.47 * H }, 40);
  const haar = schneide(haarKreis, kopfPkte);
  const kopfFein = [];
  if (Math.abs(fx) > 0.3 && fz > -0.6) { // Ohr
    const o = KP(-0.05 * fx, -0.03);
    kopfFein.push(`M${r1(add(o, hu, 0.1 * H).x)},${r1(add(o, hu, 0.1 * H).y)}Q${r1(add(add(o, hv, -0.11 * fx * H), hu, 0.02 * H).x)},${r1(add(add(o, hv, -0.11 * fx * H), hu, 0.02 * H).y)} ${r1(add(o, hu, -0.1 * H).x)},${r1(add(o, hu, -0.1 * H).y)}`);
  }
  const halsForm = huelle([{ ...N, r: R.hals * 1.1 * H }, { ...add(halsOben, hu, 0.1 * H), r: R.hals * H }]);

  // Gliedmaßen
  const seiten = { rechts: 1, links: -1 };
  const schichten = { fern: [], nahBeine: [], rumpf: [], nahArme: [] };
  const gelenke = { kopf: C, hals: N };
  const hosenNah = [];
  const ebeneVon = (seite, spec) => spec.ebene ?? (proj(seiten[seite] * P.schulterX, 0, 0).z < -0.3 ? 'fern' : 'nah');

  for (const [seite, spec] of Object.entries(pose.beine ?? {})) {
    const s = seiten[seite];
    const Hh = proj(s * P.hueftX, 0, 0);
    const [Kn, A] = glied(Hh, spec, P.oberschenkel, P.unterschenkel, H);
    const fussZ = spec.fuss ?? {};
    const sh = schuh(A, fussZ, H);
    // Wade nach hinten, Kniescheibe nach vorn (nur so weit die Figur seitlich steht)
    const shin = norm({ x: A.x - Kn.x, y: A.y - Kn.y }); let hinten = perp(shin); if (hinten.x * f.x > 0) hinten = { x: -hinten.x, y: -hinten.y };
    const seitlich = Math.abs(f.x);
    const thigh = norm({ x: Kn.x - Hh.x, y: Kn.y - Hh.y }); let vorn = perp(thigh); if (vorn.x * f.x < 0) vorn = { x: -vorn.x, y: -vorn.y };
    const ober = huelle([{ ...Hh, r: R.huefte * H }, { ...add(lerp(Hh, Kn, 0.42), vorn, 0.03 * H * seitlich), r: R.oberschenkelMitte * H }, { ...Kn, r: R.knie * H }]);
    const unter = huelle([{ ...Kn, r: R.knie * H }, { ...add(lerp(Kn, A, 0.3), hinten, 0.06 * H * seitlich), r: R.wade * H }, { ...lerp(Kn, A, 0.7), r: 0.12 * H }, { ...A, r: R.knoechel * H }]);
    const hose = huelle([{ ...Hh, r: (R.huefte + 0.04) * H }, { ...lerp(Hh, Kn, 0.5), r: (R.oberschenkelMitte + 0.035) * H }]);
    const saumA = add(lerp(Hh, Kn, 0.5), perp(thigh), (R.oberschenkelMitte + 0.035) * H), saumB = add(lerp(Hh, Kn, 0.5), perp(thigh), -(R.oberschenkelMitte + 0.035) * H);
    // Kniefalte: kleiner Bogen auf der Vorderseite
    const kf1 = add(add(Kn, vorn, R.knie * 0.55 * H), thigh, -0.08 * H), kf2 = add(add(Kn, vorn, R.knie * 0.75 * H), thigh, 0.06 * H);
    const ebene = spec.ebene ?? (proj(s * P.hueftX, 0, 0).z < -0.15 ? 'fern' : 'nah');
    const liste = [
      { formen: [ober, unter], mat: 'haut', fein: seitlich > 0.4 ? [`M${r1(kf1.x)},${r1(kf1.y)}L${r1(kf2.x)},${r1(kf2.y)}`] : [kniescheibe(Kn, thigh, H)] },
      { formen: [sh.form], mat: 'schuh', roh: sh.sohle ? `<path class="li-sohle" d="${sh.sohle}"/>` : '' },
    ];
    if (ebene === 'fern') { liste.splice(1, 0, { formen: [hose], mat: 'hose' }); schichten.fern.push(...liste); }
    else { schichten.nahBeine.push(...liste); hosenNah.push(hose); }
    gelenke[`huefte_${seite}`] = Hh; gelenke[`knie_${seite}`] = Kn; gelenke[`knoechel_${seite}`] = A;
    gelenke[`ballen_${seite}`] = sh.ballen; gelenke[`ferse_${seite}`] = sh.ferse;
  }

  for (const [seite, spec] of Object.entries(pose.arme ?? {})) {
    const s = seiten[seite];
    const S = proj(s * P.schulterX, P.schulterY, -0.03);
    const [E, W] = glied(S, spec, P.oberarm, P.unterarm, H);
    const ua = norm({ x: W.x - E.x, y: W.y - E.y });
    const ober = huelle([{ ...S, r: R.schulter * H }, { ...lerp(S, E, 0.45), r: R.oberarmMitte * H }, { ...E, r: R.ellbogen * H }]);
    const unter = huelle([{ ...E, r: R.ellbogen * H }, { ...lerp(E, W, 0.28), r: R.unterarmMitte * H }, { ...W, r: R.handgelenk * H }]);
    const oa = norm({ x: E.x - S.x, y: E.y - S.y });
    const aermel = huelle([{ ...S, r: (R.schulter + 0.025) * H }, { ...lerp(S, E, 0.36), r: (R.oberarmMitte + 0.018) * H }]);
    const hd = hand(W, spec.hand ?? {}, H, winkelVon(E, W));
    const liste = [{ formen: [ober, unter], mat: 'haut' }, { formen: [aermel], mat: 'shirt' }];
    let rk = null;
    if (spec.schlaeger) {
      rk = schlaeger(hd.mitte, spec.schlaeger.winkel, H, spec.schlaeger);
      liste.push({ roh: rk.svg });
    }
    if (hd.finger.length) liste.push({ formen: hd.finger, mat: 'zeichen' });
    liste.push({ formen: [hd.form], mat: 'haut', fein: hd.fein });
    const ebene = ebeneVon(seite, spec);
    (ebene === 'fern' ? schichten.fern : schichten.nahArme).push(...liste);
    gelenke[`schulter_${seite}`] = S; gelenke[`ellbogen_${seite}`] = E; gelenke[`handgelenk_${seite}`] = W; gelenke[`hand_${seite}`] = hd.mitte;
    if (rk) gelenke.schlaeger = rk;
    // Ellbogenfalte: kurzer feiner Strich in der Armbeuge, nur bei deutlicher Beugung
    const beuge = Math.acos(Math.max(-1, Math.min(1, oa.x * ua.x + oa.y * ua.y))) * 180 / Math.PI;
    if (beuge > 35) {
      let innen = { x: ua.x - oa.x, y: ua.y - oa.y }; const il = Math.hypot(innen.x, innen.y) || 1; innen = { x: innen.x / il, y: innen.y / il };
      const a1 = add(E, innen, R.ellbogen * 0.2 * H), a2 = add(E, innen, R.ellbogen * 0.95 * H);
      liste[0].fein = [`M${r1(a1.x)},${r1(a1.y)}L${r1(a2.x)},${r1(a2.y)}`];
    }
  }

  // Rumpf + Kopf in der Mitte
  schichten.rumpf.push({ formen: [becken, ...hosenNah], mat: 'hose' }, { formen: [brust, bauch], mat: 'shirt', fein: [] },
    { formen: [halsForm], mat: 'haut' }, { formen: [polyPfad(kopfPkte)], mat: 'haut', haar: haar.length > 2 ? polyPfad(haar) : '', fein: kopfFein });

  const reihenfolge = pose.vorneZuerst ? [...schichten.rumpf, ...schichten.nahBeine, ...schichten.nahArme] : [...schichten.nahBeine, ...schichten.rumpf, ...schichten.nahArme];
  const svg = zeichne(schichten.fern, reihenfolge);
  return { svg, gelenke, H };
}

function schichtSvg(s) {
  let o = '';
  if (s.roh && !s.formen) return s.roh;
  for (const d of s.formen) o += `<path class="li-m" d="${d}"/>`;
  for (const d of s.formen) {
    if (s.mat === 'hose') o += `<path class="li-haut" d="${d}"/>`;
    o += `<path class="li-${s.mat}" d="${d}"/>`;
  }
  if (s.haar) o += `<path class="li-haar" d="${s.haar}"/>`;
  if (s.roh) o += s.roh;
  for (const d of s.fein ?? []) o += `<path class="li-fein" d="${d}"/>`;
  return o;
}

export function zeichne(fern, nah) {
  let o = '';
  if (fern.length) {
    o += '<g class="li-fern">';
    for (const s of fern) for (const d of s.formen ?? []) o += `<path class="li-u" d="${d}"/>`;
    o += fern.map(schichtSvg).join('') + '</g>';
  }
  o += '<g>';
  for (const s of nah) for (const d of s.formen ?? []) o += `<path class="li-u" d="${d}"/>`;
  o += '</g>' + nah.map(schichtSvg).join('');
  return o;
}

// Schwung-Sichel: Weg des Schlägerkopfs als spitz zulaufende, halbtransparente Fläche
// um einen Drehpunkt (Schulter) von Winkel `von` bis `bis` (Bildschirmwinkel wie dirv).
export function schwung(zentrum, radius, von, bis, breite = 9) {
  const aus = [], inn = [], n = 24;
  for (let i = 0; i <= n; i++) {
    const t = i / n, w = von + (bis - von) * t, b = breite * Math.sin(Math.min(t * 1.15, 1) * Math.PI / 2) ** 1.4;
    aus.push(add(zentrum, dirv(w), radius + b / 2)); inn.unshift(add(zentrum, dirv(w), radius - b / 2));
  }
  return `<path class="li-schwungf" d="${polyPfad([...aus, ...inn])}"/>`;
}
// Treffer: drei kurze Strahlen um einen Punkt
export function treffer(p, r = 14, richtung = 0, laenge = 6) {
  let d = '';
  for (const w of [-40, 0, 40]) { const u = dirv(richtung + w), a = add(p, u, r), b = add(p, u, r + laenge); d += `M${r1(a.x)},${r1(a.y)}L${r1(b.x)},${r1(b.y)}`; }
  return `<path class="li-strahl" d="${d}"/>`;
}
// Bodenschatten unter einer Figur (flache Ellipse)
export const schatten = (cx, cy, rx, ry = rx * 0.16) => `<ellipse class="li-schatten" cx="${r1(cx)}" cy="${r1(cy)}" rx="${r1(rx)}" ry="${r1(ry)}"/>`;

export function datei({ aria, inhalt, defs = '', caption, captionY = 272, extraStil = '' }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" role="img" aria-label="${aria}">
  ${stil(extraStil)}
  ${defs ? `<defs>${defs}</defs>` : ''}
  ${inhalt}
  <text class="st" x="150" y="${captionY}">${caption}</text>
</svg>
`;
}
