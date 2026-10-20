// bauteile.mjs — wiederkehrende Bildteile der Personengrafiken: Speeder, Bodenschatten,
// Bewegungsspur, Pfeilspitzen, Feld in Perspektive, Sprechblase.
import { add, sub, mul, dir, kreis, pt, f, norm } from './figur.mjs';

// Speeder: Schlagkappe voran, Korb dahinter, bewusst gut doppelt so groß wie maßstäblich.
// winkel = Flugrichtung (2D, 0 = unten, 90 = rechts, 180 = oben).
export function speeder({ p, winkel, s = 1 }) {
  const u = dir(winkel), n = [-u[1], u[0]];
  const kopf = add(p, mul(u, 3.4 * s));
  const k1 = add(p, mul(n, 2.7 * s)), k2 = add(p, mul(n, -2.7 * s));
  const o = add(p, mul(u, -10 * s)), o1 = add(o, mul(n, 5.6 * s)), o2 = add(o, mul(n, -5.6 * s));
  return `<path class="s-korb" d="M${pt(k1)}L${pt(o1)}Q${pt(add(o, mul(u, -1.8 * s)))} ${pt(o2)}L${pt(k2)}Z"/>` +
    `<path class="s-kappe" d="${kreis(kopf, 3.8 * s)}"/>`;
}

// Bodenschatten: zwei flache Ellipsen in --schatten-boden (das Token ist hell ein Tinte-Hauch,
// dunkel ein Schwarz-Hauch — ein Verlauf über --tinte wurde im Dunkelmodus zum Lichthof).
export const schatten = (c, rx, ry) =>
  `<ellipse class="s-schw" cx="${f(c[0])}" cy="${f(c[1])}" rx="${f(rx)}" ry="${f(ry)}"/>` +
  `<ellipse class="s-sch" cx="${f(c[0])}" cy="${f(c[1])}" rx="${f(rx * 0.64)}" ry="${f(ry * 0.62)}"/>`;

// Bewegungsspur: Sichel entlang eines Kreisbogens, zum Ende hin breiter.
export function spur({ c, r, von, bis, breite = 10, schritte = 28, start = 0.08 }) {
  const aussen = [], innen = [];
  for (let i = 0; i <= schritte; i++) {
    const t = i / schritte, g = von + (bis - von) * t, w = breite * (start + (1 - start) * Math.pow(t, 1.4)), d = dir(g);
    aussen.push(add(c, mul(d, r + w * 0.25))); innen.push(add(c, mul(d, r - w * 0.75)));
  }
  return `<path class="s-spur" d="M${[...aussen, ...innen.reverse()].map(pt).join('L')}Z"/>`;
}

// Pfeilspitze als Marker (id wird zur Laufzeit präfixiert, url(#…) zieht vereinzele() mit)
export const pfeil = (id, kls = 's-mk', g = 4.4) => `<marker id="${id}" viewBox="0 0 10 10" markerWidth="${g}" markerHeight="${g}" refX="5" refY="5" orient="auto"><path d="M1,1.2 L9.4,5 L1,8.8 Z" class="${kls}"/></marker>`;

// Druckmarke unter einem Fußballen
export const druck = (p) => `<ellipse class="s-druck" cx="${f(p[0])}" cy="${f(p[1] + 4.4)}" rx="6" ry="1.9"/>`;

// Feld in Perspektive über eine buehne(): Rechteck von x0..x1 (Bildschirm-x an der vordersten
// Linie) und Tiefe z0..z1, dazu Querlinien bei den Tiefen in `linien`. Linien sind Bodenmarken.
export function feld(b, { x0, x1, z0, z1, linien = [], laengs = [] }) {
  const q = (x, z) => b.boden(x, z);
  const ecken = [q(x0, z0), q(x1, z0), q(x1, z1), q(x0, z1)];
  const flaeche = `<path class="s-feld" d="M${ecken.map(pt).join('L')}Z"/>`;
  let d = `M${ecken.map(pt).join('L')}Z`;
  for (const z of linien) d += `M${pt(q(x0, z))}L${pt(q(x1, z))}`;
  for (const x of laengs) d += `M${pt(q(x, z0))}L${pt(q(x, z1))}`;
  return flaeche + `<path class="s-linie" d="${d}"/>`;
}

// Feld im Profil (Seitenansicht): Bodenlinie mit kurzen Querstrichen für die Feldlinien.
export function feldProfil({ y, x0, x1, marken = [] }) {
  let d = `M${f(x0)},${f(y)}L${f(x1)},${f(y)}`;
  for (const x of marken) d += `M${f(x)},${f(y - 3.5)}L${f(x)},${f(y + 3.5)}`;
  return `<path class="s-boden" d="${d}"/>`;
}

// Sprechblase mit Spitze zum Sprecher; Text wird über `text` (escaped vom Aufrufer) gesetzt.
export function sprechblase({ c, b, h, spitze, text, schall = true }) {
  const [x, y] = c, r = h / 2;
  const links = x - b / 2, rechts = x + b / 2, oben = y - h / 2, unten = y + h / 2;
  const sx = Math.max(links + r, Math.min(rechts - r, spitze[0] + (x - spitze[0]) * 0.55));
  const d = `M${f(links + r)},${f(oben)}L${f(rechts - r)},${f(oben)}A${f(r)},${f(r)} 0 0 1 ${f(rechts - r)},${f(unten)}` +
    `L${f(sx + 6)},${f(unten)}L${pt(spitze)}L${f(sx - 5)},${f(unten)}L${f(links + r)},${f(unten)}A${f(r)},${f(r)} 0 0 1 ${f(links + r)},${f(oben)}Z`;
  let s = '';
  if (schall) {
    for (const [dx, dy, l] of [[1, -0.55, 7], [1.15, 0, 8], [1, 0.55, 7]]) {
      const a = [rechts + 4, y + dy * h * 0.6], u = norm([dx, dy * 0.9]);
      s += `M${pt(a)}L${pt(add(a, mul(u, l)))}`;
    }
  }
  return `<path class="s-blase" d="${d}"/>` + (s ? `<path class="s-schall" d="${s}"/>` : '') +
    `<text class="s-ruf" x="${f(x)}" y="${f(y + 5.2)}">${text}</text>`;
}

// Gebogene Bahn als kubische Kurve, optional mit Pfeil
export const bahn = (kls, punkte, marker) => `<path class="${kls}" d="M${pt(punkte[0])} C ${punkte.slice(1).map(pt).join(' ')}"${marker ? ` marker-end="url(#${marker})"` : ''}/>`;
export const strecke = (a, b) => sub(b, a);
