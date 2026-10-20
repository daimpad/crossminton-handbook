// bein.mjs — Nahaufnahme des Beins: G-035 (Reaktivkraft, der kurze Bodenkontakt).
// Wie hand.mjs ohne Ganzkörper-Pose: streng seitlich, das rechte Bein von der Oberschenkelmitte bis
// zu den Zehen, Zehen nach rechts. Phase ist der tiefste Punkt des Kontakts, der Umkehrpunkt vom
// Einfedern zum Abdruck: Knie leicht gebeugt, Schienbein nach vorn geneigt, der Schuh steht NUR mit
// dem Vorfuß auf der Bodenlinie, die Ferse schwebt knapp darüber. Die Achillessehne ist als Feder
// im Akzent gezeichnet — sie trägt die Aussage „Sehnen wirken wie Federn“. Blasse Umrissfüße zeigen
// Anflug (links oben) und Abflug (rechts oben), eine enge V-Bahn dazwischen das „kurz“.
// Kein Sprungkasten, keine Hürde, kein Tiefsprung (Gesundheitsrahmen: es geht nur um das Gefühl in
// Bewegungen, die man ohnehin spielt).
import { kapsel, glatt, gruppe, datei, add, sub, mul, norm, f, pt } from './figur.mjs';
import { pfeil } from './bauteile.mjs';

const BODEN = 232;
const r1 = (n) => Math.round(n * 10) / 10;
// Drehung um einen Punkt (Grad, im Uhrzeigersinn in Bildkoordinaten)
const dreh = (c, w) => (p) => { const a = (w * Math.PI) / 180, x = p[0] - c[0], y = p[1] - c[1]; return [r1(c[0] + x * Math.cos(a) - y * Math.sin(a)), r1(c[1] + x * Math.sin(a) + y * Math.cos(a))]; };
const schieb = (d) => (p) => [r1(p[0] + d[0]), r1(p[1] + d[1])];

// Schuh im Bildrahmen der Kontaktphase: Ballen auf dem Boden, Ferse um gut eine Fingerbreite
// angehoben. Sohle und Obermaterial getrennt, damit die Sohle als Fläche auf der Linie liegt.
const SOHLE = [[190, 229], [186, 232], [168, 232], [140, 229.4], [117, 226.4], [112, 223], [113, 219.6], [118, 221], [140, 224], [168, 227], [186, 227.4], [191, 226]];
const OBER = [[113, 219.6], [111, 208], [113, 197], [121, 193], [131, 193.5], [140, 199], [152, 207], [166, 214.5], [180, 219.5], [190, 222.5], [191, 226], [186, 227.4], [168, 227], [140, 224], [118, 221]];
const KNOECHEL = [123, 199];
// Außenkontur des ganzen Schuhs (Sohle unten, Obermaterial oben) für die Umrissfüße
const AUSSEN = [[191, 226], [186, 232], [168, 232], [140, 229.4], [117, 226.4], [112, 223], [111, 208], [113, 197], [121, 193], [131, 193.5], [140, 199], [152, 207], [166, 214.5], [180, 219.5], [190, 222.5]];

function bein() {
  const knie = [143, 116], huefte = [130, 34];
  // Schienbein: Kapsel vom Knöchel zum Knie; Wade als weicher Bauch an der Rückseite
  const schien = kapsel(KNOECHEL, 8.6, knie, 12.5);
  // Wade im oberen Drittel, läuft zur Achillessehne hin schmal aus
  const wade = glatt([[116, 180], [111, 162], [110, 145], [113.5, 130], [122, 120], [132, 123], [132, 150], [126, 177]], 0.5);
  const knieKappe = kapsel(knie, 13.5, add(knie, [3, -6]), 12.8);
  const oberschenkel = kapsel(knie, 13, huefte, 17);
  return { schien, wade, knieKappe, oberschenkel, knie, huefte };
}

// Feder: Zickzack zwischen zwei Punkten, quer zur Achse um amp ausgelenkt
function feder(a, b, windungen, amp) {
  const u = norm(sub(b, a)), n = [-u[1], u[0]], L = Math.hypot(...sub(b, a));
  const pts = [a];
  for (let i = 0; i < windungen * 2; i++) pts.push(add(add(a, mul(u, (L * (i + 0.5)) / (windungen * 2))), mul(n, i % 2 ? -amp : amp)));
  pts.push(b);
  return `M${pts.map(pt).join('L')}`;
}

// Umrissfuß (Anflug/Abflug): derselbe Schuh samt kurzem Schienbein-Stück, verschoben und gedreht.
// Zwei Formen, EIN Umriss: erst beide dick gestrichen, darüber beide gefüllt (wie geist: 'kontur').
function geistFuss(d, w) {
  const tf = (p) => dreh(add(KNOECHEL, d), w)(schieb(d)(p));
  const schuh = glatt(AUSSEN.map(tf), 0.35);
  const k = tf(KNOECHEL), oben = tf([KNOECHEL[0] + 6, KNOECHEL[1] - 30]);
  const formen = [schuh, kapsel(k, 8.6, oben, 9.4)];
  return { umriss: gruppe('s-konturu', formen), flaeche: gruppe('s-konturf', formen), knoechel: k };
}

export function G035(t) {
  const b = bein();
  // Anflug mit gestrecktem Fuß (Landung auf dem Vorfuß), Abflug nach dem Abdruck noch stärker gestreckt
  const anflug = geistFuss([-66, -96], 14), abflug = geistFuss([62, -104], 30);
  // V-Bahn des Knöchels: Anflug → Kontakt → Abflug; hinter dem Bein gezeichnet, das Bein deckt die
  // Spitze. Eng, damit „kurz“ zu sehen ist.
  const spitze = KNOECHEL;
  const rein = `M${pt(add(anflug.knoechel, [6, 16]))}L${pt(add(spitze, [-20, -40]))}`;
  const raus = `M${pt(add(spitze, [16, -16]))}L${pt(add(abflug.knoechel, [-8, 14]))}`;
  // Achillessehne: vom Ende der Wade zur Ferse, knapp hinter der Rückkante
  const sehne = feder([113.5, 176], [109.5, 205], 4, 3.2);
  const inhalt = [
    `<path class="s-linie" d="M8,${BODEN + 0.8}L292,${BODEN + 0.8}"/>`,
    anflug.umriss, abflug.umriss, anflug.flaeche, abflug.flaeche,
    `<path class="s-wegv" d="${rein}" marker-end="url(#g035)"/>`,
    `<path class="s-wegv" d="${raus}" marker-end="url(#g035)"/>`,
    `<path fill="url(#o035)" d="${b.oberschenkel}"/>`,
    gruppe('s-k', [b.knieKappe, b.schien, b.wade]),
    `<path class="s-x3" d="${glatt(OBER, 0.35)}"/>`,
    `<path class="s-k" d="${glatt(OBER, 0.35)}"/>`,
    `<path class="s-sohle" d="${glatt(SOHLE, 0.35)}"/>`,
    `<path class="s-sehnex" d="${sehne}"/>`,
    `<path class="s-sehne" d="${sehne}"/>`,
  ].join('\n  ');
  const defs = `<linearGradient id="o035" gradientUnits="userSpaceOnUse" x1="${b.knie[0]}" y1="${b.knie[1]}" x2="${b.huefte[0]}" y2="${b.huefte[1]}"><stop offset="0" class="s-ag0"/><stop offset="0.5" class="s-ag0"/><stop offset="1" class="s-ag1"/></linearGradient>` + pfeil('g035', 's-mkg', 3.8);
  return { figuren: [], zeichen: [], datei: datei({ aria: t.aria, caption: t.cap, captionY: 272, inhalt, defs }) };
}
