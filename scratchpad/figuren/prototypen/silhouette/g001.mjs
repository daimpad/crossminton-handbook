// g001.mjs — G-001 Universalgriff (Nahaufnahme). BEWUSST HANDGEZEICHNET:
// Eine Hand-Nahaufnahme hat keine Ganzkörper-Pose; das Skelett aus figur.mjs ist hier das
// falsche Werkzeug. Es gelten aber dieselben Stilregeln und dieselben Primitive (kapsel/glatt):
// gefüllte Volumen in Tinte, Freistellung durch Hintergrundkontur zwischen überlappenden
// Teilen, die ferne Seite (Fingerkuppen hinter dem Griff) eine Stufe heller,
// --primaer nur für den Schläger und die V-Marke.
// Lokaler Rahmen des Griffs: x = Griffachse Richtung Schlägerkopf, y quer, −y = obere Kante.
import { kapsel, glatt, gruppe, datei } from './figur.mjs';

const r1 = (n) => Math.round(n * 10) / 10;
const W = -40; // Drehung des Griffs auf dem Bildschirm (Grad)
const O = [134, 150]; // Mitte der Faust auf dem Bildschirm
const S = 1.22; // Maßstab der Nahaufnahme
const zuBild = ([x, y]) => { const a = (W * Math.PI) / 180; x *= S; y *= S; return [r1(O[0] + x * Math.cos(a) - y * Math.sin(a)), r1(O[1] + x * Math.sin(a) + y * Math.cos(a))]; };

export function G001() {
  const g = 12.5; // halbe Griffbreite
  // Schläger: Griff (Griffband) → Hals → Schaft → Kopf (angeschnitten, gibt den Kontext)
  const griff = `<path class="s-griff" d="M-96,${-g - 1.5} L58,${-g} L58,${g} L-96,${g + 1.5} Q-104,0 -96,${-g - 1.5}Z"/>`;
  let band = '';
  for (let x = -90; x < 54; x += 11) band += `M${x},${g + 1}L${x + 9},${-g - 1}`;
  const schaft = `<path class="s-rsch2" d="M58,0 L118,0"/>`;
  const hals = `<path class="s-rh2" d="M118,0 L150,-15 M118,0 L150,15"/>`;
  const kopfMitte = 206;
  const kopf = `<ellipse class="s-rf" cx="${kopfMitte}" cy="0" rx="62" ry="45"/><ellipse class="s-rr2" cx="${kopfMitte}" cy="0" rx="62" ry="45"/>`;
  let saiten = '';
  for (const q of [-28, -14, 0, 14, 28]) { const h = 45 * Math.sqrt(1 - (q / 45) ** 2) * 0.95; saiten += `M${kopfMitte - 62 * Math.sqrt(1 - (q / 45) ** 2) * 0.95},${q}L${kopfMitte + 62 * Math.sqrt(1 - (q / 45) ** 2) * 0.95},${q}`; void h; }
  for (const q of [-40, -20, 0, 20, 40]) { const h = 45 * Math.sqrt(1 - (q / 62) ** 2) * 0.95; saiten += `M${kopfMitte + q},${-h}L${kopfMitte + q},${h}`; }
  const obereKante = `<path class="s-kante" d="M-92,${-g + 4} L56,${-g + 4}"/>`;

  // Hand, von der Daumenseite. Daumen und Zeigefinger bilden das V; seine Spitze (Daumenbeuge)
  // sitzt hinten auf der oberen Kante, beide Schenkel öffnen sich zum Schlägerkopf.
  // Handballen, Daumen, Zeigefinger: nah (Tinte). Mittel-, Ring- und kleiner Finger umgreifen
  // den Griff auf der fernen Seite; nur ihre Kuppen zeigen sich unter der Kante — eine Stufe heller.
  const unterarm = kapsel([-34, 8], 22, [-70, 74], 26);
  const ballen = glatt([[-50, -8], [-40, -21], [-22, -25], [-8, -22], [-6, -8], [-12, 8], [-22, 20], [-40, 22], [-52, 10]], 0.6);
  const kuppen = [[-8, 13], [5, 14], [17, 13]].map(([x, y]) => kapsel([x, y], 6.6, [x - 2, y + 9], 6.1));
  const zeige = [kapsel([-16, -18], 8.6, [10, -20], 7.8), kapsel([10, -20], 7.8, [26, -10], 7.2), kapsel([26, -10], 7.2, [29, 10], 6.6), kapsel([29, 10], 6.6, [24, 21], 6)];
  const daumen = [kapsel([-30, 0], 11.5, [-10, -2], 9.6), kapsel([-10, -2], 9.6, [8, 4], 8), kapsel([8, 4], 8, [16, 6], 7)];

  const v = `<path class="s-v" d="M9,-31 L-27,-17 L9,-6"/>`;

  const inhalt = [
    `<g transform="translate(${O[0]} ${O[1]}) rotate(${W}) scale(${S})">`,
    kopf, `<path class="s-rs" d="${saiten}"/>`, hals, schaft,
    griff, `<path class="s-band" d="${band}"/>`, obereKante,
    gruppe('s-f', kuppen),
    `<path fill="url(#arm001)" d="${unterarm}"/>`,
    gruppe('s-k', [ballen]),
    gruppe('s-x2', zeige), gruppe('s-k', zeige),
    gruppe('s-x2', daumen), gruppe('s-k', daumen),
    v,
    `</g>`,
    (() => { const p = zuBild([-10, -46]); return `<text class="s-lt" x="${p[0]}" y="${p[1]}">V</text>`; })(),
  ].join('\n  ');
  return datei({
    aria: 'Der Universalgriff: die Hand hält den Griff locker wie einen Händedruck, zwischen Daumen und Zeigefinger bildet sich ein klares V auf der oberen Kante des Griffs.',
    caption: 'locker wie ein Händedruck · Daumen-V oben', captionY: 272,
    inhalt,
    defs: `<linearGradient id="arm001" gradientUnits="userSpaceOnUse" x1="-40" y1="28" x2="-66" y2="72"><stop offset="0" class="s-ag0"/><stop offset="1" class="s-ag1"/></linearGradient>`,
  });
}
