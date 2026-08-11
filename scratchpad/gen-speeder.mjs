// Erzeugt die vier Speeder-Konstruktionsgrafiken G-064 … G-067 im Repo-Stil:
// viewBox 300 breit, Farben ausschliesslich var(--token, #fallback), kurze
// .st-Caption, aria-label als ganzer Satz.
//
// ORIENTIERUNG: Schlagkappe OBEN, Korboeffnung unten — so wie Tafel B der
// Vorlage (von oben nach unten: ⌀26 Schlagkappe, ⌀30 Kragen, Korblaenge,
// wellenfoermiger Rand, ⌀50).
//
// MASSSTAB 3 Einheiten je mm:
//   Gesamthoehe 60 mm = 180 u   Korb ⌀50 = r75   Kragen ⌀30 = r45   Kappe ⌀26 = r39
//
// KONUSWINKEL 47,8 Grad: Der Bezug ist der ENDRING ⌀19, nicht der Kragen ⌀30.
// Ueber die Korblaenge 35 mm ergibt ⌀19 → ⌀50 exakt 2*atan(15,5/35) = 47,8 Grad;
// vom Kragen aus waeren es nur 31,9. Damit ist die Vorlage in sich stimmig, und
// die Geometrie hier haelt den Wert ein, statt ihn bloss anzuschreiben:
//   Kappe   54 →  99 (45 u = 15 mm), r39 (⌀26)
//   Kragen  99 → 129 (30 u = 10 mm), r45 (⌀30)
//   Endring     bei 129,             r28,5 (⌀19)  ← hier setzen die Stiele an
//   Konus  129 → 234 (105 u = 35 mm), r28,5 → r75 (⌀50)  = 47,8 Grad
// Der Winkel wird ueber den rechnerischen Konus-SCHEITEL bemasst (der Bogen
// liegt auf beiden Flanken auf) — so, wie ein Kegelwinkel bemasst gehoert.
//
// FARBEN: Originalfarben des Typs MATCH — gelber Korb, rote Schlagkappe. Sie
// laufen ueber EIGENE Tokens (--speeder-korb / --speeder-kappe) und nicht ueber
// --signal-gelb/-rot: die Ampel bedeutet in dieser App einen Zustand, hier ist
// die Farbe eine Sacheigenschaft des Balls. Beides auf denselben Token zu legen
// hiesse die Ampel zu verwaessern. Hell/Dunkel kippen ueber die Tokens mit.
import { writeFileSync } from 'node:fs';

const ZIEL = 'images';

const STIL = `  <style>
    .kontur{fill:none;stroke:var(--tinte,#16202b);stroke-width:2.6;stroke-linejoin:round;stroke-linecap:round}
    .schnitt{fill:var(--tinte,#16202b);opacity:.14}
    .kappe{fill:var(--speeder-kappe,#e2402a)}
    .kappenlinie{fill:none;stroke:var(--speeder-kappe-tief,#a82412);stroke-width:2;stroke-linecap:round}
    .stiel{fill:none;stroke:var(--tinte,#16202b);stroke-width:1.5;opacity:.45}
    .korbflaeche{fill:var(--speeder-korb,#f0c400);opacity:.28}
    .masz{fill:none;stroke:var(--tinte-3,#6b7686);stroke-width:1.2}
    .hilfslinie{fill:none;stroke:var(--tinte-3,#6b7686);stroke-width:1;stroke-dasharray:4 4;opacity:.85}
    .achse{fill:none;stroke:var(--tinte-3,#6b7686);stroke-width:1;stroke-dasharray:9 4 2 4;opacity:.7}
    .pfeil{fill:var(--tinte-3,#6b7686)}
    .maszzahl{fill:var(--tinte,#16202b);font:700 12px/1 system-ui,sans-serif;text-anchor:middle}
    .ico{fill:var(--primaer-tief,#1568ad);font:600 10px/1 system-ui,sans-serif;text-anchor:middle}
    .teil{fill:var(--tinte-3,#6b7686);font:600 11px/1 system-ui,sans-serif}
    .teilr{fill:var(--tinte-3,#6b7686);font:600 11px/1 system-ui,sans-serif;text-anchor:end}
    .st{fill:var(--tinte-3,#6b7686);font:600 12px/1 system-ui,sans-serif;text-anchor:middle}
  </style>
  <defs>
    <marker id="mp" viewBox="0 0 10 10" markerWidth="7" markerHeight="7" refX="8.5" refY="5" orient="auto">
      <path d="M1,1 L9,5 L1,9 Z" class="pfeil"/>
    </marker>
    <marker id="mp2" viewBox="0 0 10 10" markerWidth="7" markerHeight="7" refX="8.5" refY="5" orient="auto-start-reverse">
      <path d="M1,1 L9,5 L1,9 Z" class="pfeil"/>
    </marker>
  </defs>`;

const svg2 = (breite, hoehe, aria, inhalt) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${breite} ${hoehe}" role="img" aria-label="${aria}">
${STIL}

${inhalt}
</svg>
`;

const svg = (hoehe, aria, inhalt) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 ${hoehe}" role="img" aria-label="${aria}">
${STIL}

${inhalt}
</svg>
`;

// Gemeinsame Silhouette: Kappe oben, Korboeffnung unten.
const MX = 132;
const Y_KAPPE_OBEN = 54, Y_KRAGEN_OBEN = 99, Y_KRAGEN_UNTEN = 129, Y_RAND = 234;
const R_KAPPE = 39, R_KRAGEN = 45, R_ENDRING = 28.5, R_RAND = 75;

// Rechnerischer Scheitel des Konus: dort schneiden sich die verlaengerten
// Flanken. Von hier aus wird der Oeffnungswinkel bemasst.
const KONUS_STEIGUNG = (R_RAND - R_ENDRING) / (Y_RAND - Y_KRAGEN_UNTEN);
const Y_SCHEITEL = Y_KRAGEN_UNTEN - R_ENDRING / KONUS_STEIGUNG;
const KONUS_WINKEL = 2 * Math.atan(KONUS_STEIGUNG); // = 47,8 Grad
// Bogen so weit unten, dass er frei vor dem Korb liegt und nicht die Kappe kreuzt.
const BOGEN_R = 104;
const bogenPunkt = (vorzeichen) => [
  MX + vorzeichen * BOGEN_R * Math.sin(KONUS_WINKEL / 2),
  Y_SCHEITEL + BOGEN_R * Math.cos(KONUS_WINKEL / 2),
];

// Wellenrand am unteren Korbrand (vier Bögen über die volle Breite)
const welleUnten = (mx, y, r) => {
  const b = (2 * r) / 4;
  return `M${mx - r},${y} q ${b / 2},9 ${b},0 q ${b / 2},-9 ${b},0 q ${b / 2},9 ${b},0 q ${b / 2},-9 ${b},0`;
};

// ---------------------------------------------------------------- G-064
// Perspektivische Uebersicht fuer den Ausruestungs-Einstieg: benennt die drei
// Baugruppen, ohne zu bemassen (Tafel A der Vorlage ist ausdruecklich unbemasst).
{
  const cx = 128, kappeY = 66, kragenY = 118, randY = 236;
  const rx = 74, ry = 24, krx = 40, kry = 13;
  const stiele = [];
  for (let i = 0; i <= 12; i++) {
    const t = -Math.PI + (i / 12) * Math.PI * 2;
    const x1 = cx + krx * Math.cos(t), y1 = kragenY + kry * Math.sin(t);
    const x2 = cx + rx * Math.cos(t), y2 = randY + ry * Math.sin(t);
    stiele.push(`  <path class="stiel" d="M${x1.toFixed(1)},${y1.toFixed(1)} L${x2.toFixed(1)},${y2.toFixed(1)}"/>`);
  }
  const inhalt = `  <!-- Korbmantel zwischen Kragen und Oeffnung -->
  <path class="korbflaeche" d="M${cx - krx},${kragenY} L${cx - rx},${randY} A${rx},${ry} 0 0 0 ${cx + rx},${randY} L${cx + krx},${kragenY} A${krx},${kry} 0 0 1 ${cx - krx},${kragenY} Z"/>
${stiele.join('\n')}
  <ellipse class="kontur" cx="${cx}" cy="${randY}" rx="${rx}" ry="${ry}"/>
  <path class="kontur" d="M${cx - krx},${kragenY} L${cx - rx},${randY}"/>
  <path class="kontur" d="M${cx + krx},${kragenY} L${cx + rx},${randY}"/>

  <!-- Schlagkappe oben: das kennzeichnende Teil, darum in der Hauptfarbe -->
  <path class="kappe" d="M${cx - krx},${kragenY} L${cx - 34},${kappeY + 6} A34,26 0 0 1 ${cx + 34},${kappeY + 6} L${cx + krx},${kragenY} A${krx},${kry} 0 0 1 ${cx - krx},${kragenY} Z"/>
  <path class="kappenlinie" d="M${cx - 19},${kappeY + 10} A21,10 0 0 1 ${cx + 19},${kappeY + 10}"/>
  <ellipse class="kontur" cx="${cx}" cy="${kragenY}" rx="${krx}" ry="${kry}"/>

  <path class="masz" d="M${cx + 30},${kappeY + 8} L214,${kappeY + 8}"/>
  <path class="masz" d="M${cx + krx + 6},${kragenY + 4} L214,${kragenY + 22}"/>
  <path class="masz" d="M${cx + 54},${randY - 46} L214,${randY - 40}"/>
  <text class="teil" x="218" y="${kappeY + 12}">Schlagkappe</text>
  <text class="teil" x="218" y="${kragenY + 26}">Kragen</text>
  <text class="teil" x="218" y="${randY - 36}">Korb</text>

  <text class="st" x="150" y="284">Schlagkappe, Kragen und Korb</text>`;
  writeFileSync(`${ZIEL}/G-064.svg`, svg(300,
    'Perspektivische Ansicht eines Speeders: oben die Schlagkappe als Gewicht, darunter der Kragen, daran der offene Korb aus Längsstielen.',
    inhalt));
}

// ---------------------------------------------------------------- G-065
// Profil mit den ICO-Massen: die eigentliche Lehr-Aussage des Blattes.
{
  const stiele = [-0.62, -0.3, 0.3, 0.62].map((f) => {
    const oben = MX + f * R_ENDRING, unten = MX + f * R_RAND;
    return `  <path class="stiel" d="M${oben.toFixed(1)},${Y_KRAGEN_UNTEN} L${unten.toFixed(1)},${Y_RAND}"/>`;
  });
  const [bx, by] = bogenPunkt(1);
  const inhalt = `  <path class="korbflaeche" d="M${MX - R_ENDRING},${Y_KRAGEN_UNTEN} L${MX - R_RAND},${Y_RAND} L${MX + R_RAND},${Y_RAND} L${MX + R_ENDRING},${Y_KRAGEN_UNTEN} Z"/>
${stiele.join('\n')}
  <path class="achse" d="M${MX},40 L${MX},250"/>

  <!-- Schlagkappe oben -->
  <path class="kappe" d="M${MX - R_KAPPE},${Y_KRAGEN_OBEN} L${MX - R_KAPPE},${Y_KAPPE_OBEN + 20} A${R_KAPPE},20 0 0 1 ${MX + R_KAPPE},${Y_KAPPE_OBEN + 20} L${MX + R_KAPPE},${Y_KRAGEN_OBEN} Z"/>
  <path class="kappenlinie" d="M${MX - 20},${Y_KAPPE_OBEN + 16} A22,11 0 0 1 ${MX + 20},${Y_KAPPE_OBEN + 16}"/>

  <!-- Kragen: geschlossener Zylinder zwischen Kappe und Korb -->
  <path class="kontur" d="M${MX - R_KRAGEN},${Y_KRAGEN_OBEN} L${MX - R_KRAGEN},${Y_KRAGEN_UNTEN} M${MX + R_KRAGEN},${Y_KRAGEN_OBEN} L${MX + R_KRAGEN},${Y_KRAGEN_UNTEN}"/>
  <path class="kontur" d="M${MX - R_KRAGEN},${Y_KRAGEN_OBEN} L${MX + R_KRAGEN},${Y_KRAGEN_OBEN}"/>

  <!-- Korb: setzt am Endring an und laeuft bis zum wellenfoermigen Rand -->
  <path class="kontur" d="M${MX - R_KRAGEN},${Y_KRAGEN_UNTEN} L${MX - R_ENDRING},${Y_KRAGEN_UNTEN} L${MX - R_RAND},${Y_RAND}"/>
  <path class="kontur" d="M${MX + R_KRAGEN},${Y_KRAGEN_UNTEN} L${MX + R_ENDRING},${Y_KRAGEN_UNTEN} L${MX + R_RAND},${Y_RAND}"/>
  <path class="kontur" d="${welleUnten(MX, Y_RAND, R_RAND)}"/>

  <!-- Konuswinkel: Bogen um den rechnerischen Scheitel, liegt auf beiden Flanken
       auf. Die duenn gestrichelten Verlaengerungen zeigen, worauf er sich bezieht. -->
  <path class="hilfslinie" d="M${MX},${Y_SCHEITEL.toFixed(1)} L${MX - R_ENDRING},${Y_KRAGEN_UNTEN} M${MX},${Y_SCHEITEL.toFixed(1)} L${MX + R_ENDRING},${Y_KRAGEN_UNTEN}"/>
  <path class="masz" d="M${(2 * MX - bx).toFixed(1)},${by.toFixed(1)} A${BOGEN_R},${BOGEN_R} 0 0 1 ${bx.toFixed(1)},${by.toFixed(1)}" marker-start="url(#mp2)" marker-end="url(#mp)"/>
  <text class="maszzahl" x="${MX}" y="${(by - 8).toFixed(1)}">47,8°</text>

  <!-- Gesamthoehe rechts -->
  <path class="hilfslinie" d="M${MX + R_KAPPE},${Y_KAPPE_OBEN} L254,${Y_KAPPE_OBEN}"/>
  <path class="hilfslinie" d="M${MX + R_RAND},${Y_RAND} L254,${Y_RAND}"/>
  <path class="masz" d="M248,${Y_KAPPE_OBEN} L248,${Y_RAND}" marker-start="url(#mp2)" marker-end="url(#mp)"/>
  <text class="maszzahl" x="272" y="${(Y_KAPPE_OBEN + Y_RAND) / 2 - 3}">60</text>
  <text class="ico" x="272" y="${(Y_KAPPE_OBEN + Y_RAND) / 2 + 11}">57–63</text>

  <!-- Kappendurchmesser oben -->
  <path class="masz" d="M${MX - R_KAPPE},38 L${MX + R_KAPPE},38" marker-start="url(#mp2)" marker-end="url(#mp)"/>
  <text class="maszzahl" x="${MX}" y="28">⌀ 26</text>
  <text class="ico" x="${MX}" y="15">ICO 25–27</text>

  <!-- Korbdurchmesser unten -->
  <path class="masz" d="M${MX - R_RAND},262 L${MX + R_RAND},262" marker-start="url(#mp2)" marker-end="url(#mp)"/>
  <text class="maszzahl" x="${MX}" y="280">⌀ 50</text>
  <text class="ico" x="${MX}" y="293">ICO 47–53</text>

  <!-- Kragen -->
  <path class="masz" d="M${MX - R_KRAGEN},${(Y_KRAGEN_OBEN + Y_KRAGEN_UNTEN) / 2} L52,${(Y_KRAGEN_OBEN + Y_KRAGEN_UNTEN) / 2}"/>
  <text class="teilr" x="48" y="${(Y_KRAGEN_OBEN + Y_KRAGEN_UNTEN) / 2 - 3}">Kragen</text>
  <text class="teilr" x="48" y="${(Y_KRAGEN_OBEN + Y_KRAGEN_UNTEN) / 2 + 10}">⌀ 30</text>

  <!-- Korblaenge 35: die Strecke, ueber die der Konus den Winkel aufspannt -->
  <path class="hilfslinie" d="M${MX - R_ENDRING},${Y_KRAGEN_UNTEN} L26,${Y_KRAGEN_UNTEN}"/>
  <path class="hilfslinie" d="M${MX - R_RAND},${Y_RAND} L26,${Y_RAND}"/>
  <path class="masz" d="M32,${Y_KRAGEN_UNTEN} L32,${Y_RAND}" marker-start="url(#mp2)" marker-end="url(#mp)"/>
  <text class="maszzahl" x="14" y="${(Y_KRAGEN_UNTEN + Y_RAND) / 2 - 3}">35</text>
  <text class="teil" x="2" y="${(Y_KRAGEN_UNTEN + Y_RAND) / 2 + 10}">Korb</text>

  <text class="st" x="150" y="326">Maße in mm · blau das ICO-Fenster</text>`;
  writeFileSync(`${ZIEL}/G-065.svg`, svg(340,
    'Profil eines Speeders mit den Maßen in Millimetern: Gesamthöhe 60, Schlagkappe 26, Kragen 30 und Korböffnung 50 — jeweils mit dem zulässigen ICO-Toleranzfenster in Blau.',
    inhalt));
}

// ---------------------------------------------------------------- G-066
// Laengsschnitt: was innen steckt. Die Wand ist als Band mit Staerke gezeichnet
// und gerastert, damit es als Schnitt lesbar ist statt als zweite Aussenansicht.
{
  const W = 8;
  const rk = R_KRAGEN, re = R_ENDRING, rr = R_RAND;
  const MX = 168; // eigene Mittelachse: breitere Tafel, linke Label-Spalte
  const inhalt = `  <path class="achse" d="M${MX},40 L${MX},250"/>

  <!-- geschnittene Korbwand links und rechts (Band mit Wandstaerke) -->
  <path class="schnitt" d="M${MX - re},${Y_KRAGEN_UNTEN} L${MX - rr},${Y_RAND} L${MX - rr + W + 3},${Y_RAND} L${MX - re + W},${Y_KRAGEN_UNTEN} Z"/>
  <path class="schnitt" d="M${MX + re},${Y_KRAGEN_UNTEN} L${MX + rr},${Y_RAND} L${MX + rr - W - 3},${Y_RAND} L${MX + re - W},${Y_KRAGEN_UNTEN} Z"/>
  <path class="kontur" d="M${MX - re},${Y_KRAGEN_UNTEN} L${MX - rr},${Y_RAND} M${MX - re + W},${Y_KRAGEN_UNTEN} L${MX - rr + W + 3},${Y_RAND}"/>
  <path class="kontur" d="M${MX + re},${Y_KRAGEN_UNTEN} L${MX + rr},${Y_RAND} M${MX + re - W},${Y_KRAGEN_UNTEN} L${MX + rr - W - 3},${Y_RAND}"/>

  <!-- Oeffnungsrand nach innen gebogen -->
  <path class="kontur" d="M${MX - rr},${Y_RAND} q 2,-11 ${W + 3},-2"/>
  <path class="kontur" d="M${MX + rr},${Y_RAND} q -2,-11 ${-(W + 3)},-2"/>

  <!-- Querrippe: verbindet die Stiele auf halber Korbhoehe -->
  <path class="kontur" d="M${MX - 58},${(Y_KRAGEN_UNTEN + Y_RAND) / 2} L${MX + 58},${(Y_KRAGEN_UNTEN + Y_RAND) / 2}"/>

  <!-- Kragen mit Pressring, darin der Endring -->
  <path class="schnitt" d="M${MX - rk},${Y_KRAGEN_OBEN} L${MX + rk},${Y_KRAGEN_OBEN} L${MX + rk},${Y_KRAGEN_UNTEN} L${MX - rk},${Y_KRAGEN_UNTEN} Z"/>
  <path class="kontur" d="M${MX - rk},${Y_KRAGEN_OBEN} L${MX - rk},${Y_KRAGEN_UNTEN} M${MX + rk},${Y_KRAGEN_OBEN} L${MX + rk},${Y_KRAGEN_UNTEN} M${MX - rk},${Y_KRAGEN_UNTEN} L${MX + rk},${Y_KRAGEN_UNTEN}"/>
  <path class="kontur" d="M${MX - 28},${Y_KRAGEN_OBEN} L${MX - 28},${Y_KRAGEN_UNTEN} M${MX + 28},${Y_KRAGEN_OBEN} L${MX + 28},${Y_KRAGEN_UNTEN}"/>

  <!-- Schlagkappe im Schnitt, mit Loch an der Spitze -->
  <path class="kappe" d="M${MX - R_KAPPE},${Y_KRAGEN_OBEN} L${MX - R_KAPPE},${Y_KAPPE_OBEN + 20} A${R_KAPPE},20 0 0 1 ${MX + R_KAPPE},${Y_KAPPE_OBEN + 20} L${MX + R_KAPPE},${Y_KRAGEN_OBEN} Z"/>
  <!-- Loch an der Spitze: kleine Kerbe, kein Schlitz durch die ganze Kappe -->
  <path class="schnitt" d="M${MX - 6},${Y_KAPPE_OBEN + 2} L${MX + 6},${Y_KAPPE_OBEN + 2} L${MX + 6},${Y_KAPPE_OBEN + 16} L${MX - 6},${Y_KAPPE_OBEN + 16} Z"/>
  <path class="kontur" d="M${MX - 6},${Y_KAPPE_OBEN + 2} L${MX - 6},${Y_KAPPE_OBEN + 16} M${MX + 6},${Y_KAPPE_OBEN + 2} L${MX + 6},${Y_KAPPE_OBEN + 16}"/>

  <path class="masz" d="M${MX},${Y_KAPPE_OBEN - 2} L${MX + 46},34"/>
  <text class="teil" x="232" y="30">Loch ⌀ 4</text>
  <path class="masz" d="M${MX + 34},${Y_KRAGEN_OBEN + 10} L246,${Y_KRAGEN_OBEN + 4}"/>
  <text class="teil" x="250" y="${Y_KRAGEN_OBEN + 8}">Endring ⌀ 19</text>
  <path class="masz" d="M${MX + rk},${Y_KRAGEN_UNTEN - 6} L246,${Y_KRAGEN_UNTEN + 16}"/>
  <text class="teil" x="250" y="${Y_KRAGEN_UNTEN + 20}">Pressring</text>
  <path class="masz" d="M${MX + 50},${(Y_KRAGEN_UNTEN + Y_RAND) / 2} L246,${(Y_KRAGEN_UNTEN + Y_RAND) / 2 + 12}"/>
  <text class="teil" x="250" y="${(Y_KRAGEN_UNTEN + Y_RAND) / 2 + 16}">Querrippe</text>

  <path class="masz" d="M${MX - rk - 12},${Y_KRAGEN_UNTEN + 34} L74,${Y_KRAGEN_UNTEN + 22}"/>
  <text class="teil" x="6" y="${Y_KRAGEN_UNTEN + 26}">Längsstiel</text>
  <path class="masz" d="M${MX - rr + 4},${Y_RAND - 2} L92,${Y_RAND + 18}"/>
  <text class="teil" x="6" y="${Y_RAND + 32}">Öffnungsrand,</text>
  <text class="teil" x="6" y="${Y_RAND + 45}">nach innen gebogen</text>

  <text class="st" x="180" y="326">Längsschnitt: Wand, Ring, Schlagkappe</text>`;
  writeFileSync(`${ZIEL}/G-066.svg`, svg2(360, 340,
    'Längsschnitt durch einen Speeder: das Loch mit 4 Millimetern in der Schlagkappe, der Endring mit 19 Millimetern, der Pressring am Kragen, die Querrippe zwischen den Längsstielen und der nach innen gebogene Öffnungsrand.',
    inhalt));
}

// ---------------------------------------------------------------- G-067
// Draufsicht auf die Korboeffnung: 16 Stiele, 22,5 Grad Teilung.
{
  const cx = 146, cy = 136, rA = 84, rI = 30;
  const stiele = [], welle = [];
  for (let i = 0; i < 16; i++) {
    const t = (i * 22.5 * Math.PI) / 180, t2 = ((i + 1) * 22.5 * Math.PI) / 180, tm = (t + t2) / 2;
    stiele.push(`  <path class="stiel" d="M${(cx + rI * Math.cos(t)).toFixed(1)},${(cy + rI * Math.sin(t)).toFixed(1)} L${(cx + rA * Math.cos(t)).toFixed(1)},${(cy + rA * Math.sin(t)).toFixed(1)}"/>`);
    welle.push(`  <path class="kontur" d="M${(cx + rA * Math.cos(t)).toFixed(1)},${(cy + rA * Math.sin(t)).toFixed(1)} Q${(cx + (rA - 8) * Math.cos(tm)).toFixed(1)},${(cy + (rA - 8) * Math.sin(tm)).toFixed(1)} ${(cx + rA * Math.cos(t2)).toFixed(1)},${(cy + rA * Math.sin(t2)).toFixed(1)}"/>`);
  }
  // Teilungswinkel: Bogen zwischen zwei benachbarten Stielen, oben rechts
  const ra = 56, ta = -3 * 22.5, tb = -2 * 22.5;
  const bx1 = cx + ra * Math.cos((ta * Math.PI) / 180), by1 = cy + ra * Math.sin((ta * Math.PI) / 180);
  const bx2 = cx + ra * Math.cos((tb * Math.PI) / 180), by2 = cy + ra * Math.sin((tb * Math.PI) / 180);
  const inhalt = `  <circle class="korbflaeche" cx="${cx}" cy="${cy}" r="${rA}"/>
${stiele.join('\n')}
${welle.join('\n')}
  <circle class="kappe" cx="${cx}" cy="${cy}" r="${rI}"/>
  <circle class="kappenlinie" cx="${cx}" cy="${cy}" r="${rI - 9}"/>

  <path class="masz" d="M${bx1.toFixed(1)},${by1.toFixed(1)} A${ra},${ra} 0 0 1 ${bx2.toFixed(1)},${by2.toFixed(1)}" marker-start="url(#mp2)" marker-end="url(#mp)"/>
  <path class="masz" d="M${(cx + 62).toFixed(1)},${(cy - 34).toFixed(1)} L242,${(cy - 52).toFixed(1)}"/>
  <text class="teil" x="246" y="${cy - 48}">22,5°</text>

  <path class="masz" d="M${cx - rA},${cy - rA - 18} L${cx + rA},${cy - rA - 18}" marker-start="url(#mp2)" marker-end="url(#mp)"/>
  <text class="maszzahl" x="${cx}" y="${cy - rA - 26}">⌀ 50</text>

  <path class="masz" d="M${cx - rI + 4},${cy + 16} L${cx + 44},${cy + 74}"/>
  <text class="teil" x="${cx + 48}" y="${cy + 78}">Schlagkappe</text>
  <text class="teil" x="${cx + 48}" y="${cy + 91}">dahinter</text>

  <text class="st" x="150" y="288">16 Längsstiele · Teilung 22,5°</text>`;
  writeFileSync(`${ZIEL}/G-067.svg`, svg(300,
    'Draufsicht in die Korböffnung eines Speeders: sechzehn Längsstiele im Winkelabstand von 22,5 Grad, der wellenförmige Öffnungsrand und die dahinter liegende Schlagkappe.',
    inhalt));
}

console.log('G-064 … G-067 neu gezeichnet (Kappe oben).');
