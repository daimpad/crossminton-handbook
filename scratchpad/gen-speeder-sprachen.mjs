// Erzeugt die en/fr/pl-Zwillinge der vier Speeder-Konstruktionsgrafiken.
// Ring-16-Muster: NUR <text>-Inhalt und aria-label werden ersetzt, Geometrie und
// Tokens bleiben byte-identisch. Anders als gen-en.mjs (nur Caption) tragen diese
// Tafeln viele Beschriftungen, darum eine Zuordnung je Zeichenkette.
//
// TERMINOLOGIE aus dem Bestand, nicht erfunden:
//   Kopf des Speeders — regeln.json: "der Kopf entscheidet" → head / tête / główka
//   Korb/Flugkleid    — der_speeder: skirt / jupe / spódniczka
// Dezimaltrennzeichen: en Punkt (22.5°), de/fr/pl Komma (22,5°).
import { readFileSync, writeFileSync } from 'node:fs';

const ZIEL = 'images';

const KARTE = {
  'G-064': {
    aria: {
      en: 'Perspective view of a Speeder: the head as the weight on top, below it the collar, and attached to it the open skirt made of longitudinal ribs.',
      fr: "Vue en perspective d'un speeder : en haut la tête, qui fait le poids, en dessous la collerette et, fixée à elle, la jupe ouverte formée de nervures longitudinales.",
      pl: 'Widok perspektywiczny speedera: u góry główka jako ciężarek, pod nią kołnierz, a przy nim otwarta spódniczka z podłużnych żeber.',
    },
    text: {
      'Schlagkappe': { en: 'Head', fr: 'Tête', pl: 'Główka' },
      'Kragen': { en: 'Collar', fr: 'Collerette', pl: 'Kołnierz' },
      'Korb': { en: 'Skirt', fr: 'Jupe', pl: 'Spódniczka' },
      'Schlagkappe, Kragen und Korb': { en: 'Head, collar and skirt', fr: 'Tête, collerette et jupe', pl: 'Główka, kołnierz i spódniczka' },
    },
  },
  'G-065': {
    aria: {
      en: 'Profile of a Speeder with the dimensions in millimetres: overall height 60, head 26, collar 30 and skirt opening 50 — each with the permitted ICO tolerance window in blue.',
      fr: "Profil d'un speeder avec les cotes en millimètres : hauteur totale 60, tête 26, collerette 30 et ouverture de la jupe 50 — chacune avec la fenêtre de tolérance ICO admise, en bleu.",
      pl: 'Profil speedera z wymiarami w milimetrach: wysokość całkowita 60, główka 26, kołnierz 30 i otwór spódniczki 50 — każdy z dopuszczalnym oknem tolerancji ICO na niebiesko.',
    },
    text: {
      'Kragen': { en: 'Collar', fr: 'Collerette', pl: 'Kołnierz' },
      'Maße in mm · blau das ICO-Fenster': {
        en: 'Dimensions in mm · ICO window in blue',
        fr: 'Cotes en mm · fenêtre ICO en bleu',
        pl: 'Wymiary w mm · okno ICO na niebiesko',
      },
    },
  },
  'G-066': {
    aria: {
      en: 'Longitudinal section through a Speeder: the 4-millimetre hole in the head, the end ring of 19 millimetres, the press ring at the collar, the cross rib between the longitudinal ribs and the opening rim bent inwards.',
      fr: "Coupe longitudinale d'un speeder : le trou de 4 millimètres dans la tête, la bague d'extrémité de 19 millimètres, la bague de serrage à la collerette, la nervure transversale entre les nervures longitudinales et le bord d'ouverture recourbé vers l'intérieur.",
      pl: 'Przekrój podłużny speedera: otwór o średnicy 4 milimetrów w główce, pierścień końcowy 19 milimetrów, pierścień zaciskowy przy kołnierzu, żebro poprzeczne między żebrami podłużnymi oraz krawędź otworu wygięta do wewnątrz.',
    },
    text: {
      'Loch ⌀ 4': { en: 'Hole ⌀ 4', fr: 'Trou ⌀ 4', pl: 'Otwór ⌀ 4' },
      'Endring ⌀ 19': { en: 'End ring ⌀ 19', fr: "Bague d'extrémité ⌀ 19", pl: 'Pierścień końcowy ⌀ 19' },
      'Pressring': { en: 'Press ring', fr: 'Bague de serrage', pl: 'Pierścień zaciskowy' },
      'Querrippe': { en: 'Cross rib', fr: 'Nervure transversale', pl: 'Żebro poprzeczne' },
      'Längsstiel': { en: 'Rib', fr: 'Nervure', pl: 'Żebro' },
      'Öffnungsrand,': { en: 'Opening rim,', fr: "Bord d'ouverture,", pl: 'Krawędź otworu,' },
      'nach innen gebogen': { en: 'bent inwards', fr: "recourbé vers l'intérieur", pl: 'wygięta do wewnątrz' },
      'Längsschnitt: Wand, Ring, Schlagkappe': {
        en: 'Section: wall, ring, head',
        fr: 'Coupe : paroi, bague, tête',
        pl: 'Przekrój: ścianka, pierścień, główka',
      },
    },
  },
  'G-067': {
    aria: {
      en: 'Top view into the skirt opening of a Speeder: sixteen longitudinal ribs at an angular spacing of 22.5 degrees, the wavy opening rim and the head lying behind it.',
      fr: "Vue de dessus dans l'ouverture de la jupe d'un speeder : seize nervures longitudinales espacées de 22,5 degrés, le bord d'ouverture ondulé et la tête située derrière.",
      pl: 'Widok z góry w otwór spódniczki speedera: szesnaście żeber podłużnych w odstępie kątowym 22,5 stopnia, falista krawędź otworu i leżąca za nią główka.',
    },
    text: {
      '22,5°': { en: '22.5°', fr: '22,5°', pl: '22,5°' },
      'Schlagkappe': { en: 'Head', fr: 'Tête', pl: 'Główka' },
      'dahinter': { en: 'behind', fr: 'derrière', pl: 'z tyłu' },
      '16 Längsstiele · Teilung 22,5°': {
        en: '16 ribs · 22.5° spacing',
        fr: '16 nervures · pas de 22,5°',
        pl: '16 żeber · podział 22,5°',
      },
    },
  },
};

const escAttr = (s) => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
let geschrieben = 0;
const offen = [];

for (const [id, eintrag] of Object.entries(KARTE)) {
  const basis = readFileSync(`${ZIEL}/${id}.svg`, 'utf8');
  // Jeder sichtbare Textknoten MUSS in der Karte stehen (ausser reine Zahlen und
  // ICO-Angaben, die in allen Sprachen gleich lauten) — sonst faellt still Deutsch durch.
  const unbekannt = [...basis.matchAll(/<text[^>]*>([^<]*)<\/text>/g)]
    .map((m) => m[1])
    .filter((t) => !(t in eintrag.text) && !/^(⌀ ?)?[\d.,–]+°?$|^ICO [\d–]+$/.test(t));
  if (unbekannt.length) offen.push(`${id}: ${unbekannt.join(' | ')}`);

  for (const sprache of ['en', 'fr', 'pl']) {
    let s = basis;
    s = s.replace(/aria-label="[^"]*"/, `aria-label="${escAttr(eintrag.aria[sprache])}"`);
    for (const [de, uebersetzt] of Object.entries(eintrag.text)) {
      // Auf VORHANDENSEIN pruefen, nicht auf Veraenderung: wo die Uebersetzung
      // gleich lautet (fr/pl "22,5°"), waere das Ersetzen ein No-op und ein
      // Veraenderungs-Test schlueg falschen Alarm.
      if (!s.includes(`>${de}</text>`)) offen.push(`${id}/${sprache}: "${de}" nicht gefunden`);
      s = s.replaceAll(`>${de}</text>`, `>${uebersetzt[sprache]}</text>`);
    }
    writeFileSync(`${ZIEL}/${id}.${sprache}.svg`, s);
    geschrieben++;

    // Gegenprobe: ausser <text> und aria darf sich nichts unterscheiden.
    const strip = (x) => x.replace(/<text[^>]*>[^<]*<\/text>/g, '<text/>').replace(/aria-label="[^"]*"/, 'aria-label=""');
    if (strip(s) !== strip(basis)) offen.push(`${id}/${sprache}: Geometrie weicht ab!`);
  }
}

console.log(`${geschrieben} Sprachvarianten geschrieben.`);
if (offen.length) {
  console.log('OFFEN:\n- ' + offen.join('\n- '));
  process.exit(1);
}
console.log('Alle Textknoten übersetzt, Geometrie überall byte-identisch.');
