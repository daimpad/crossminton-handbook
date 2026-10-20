// Erzeugt die französischen Zwillinge G-XXX.fr.svg aus G-XXX.svg: ersetzt jedes
// <text> in Dokumentreihenfolge + die aria-label; Geometrie/Tokens byte-identisch
// (Ring-16-Muster). Danach mit render-svg.mjs die .fr.png rendern.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const M = {
  'G-011': { aria: "Le smash : point de frappe haut au-dessus et devant la tête, frappe agressive vers le bas, la trajectoire file raide et droit dans le terrain adverse.", texts: ["point de frappe haut · raide vers le bas"] },
  'G-013': { aria: "La coupe : la surface de frappe inclinée effleure le speeder sur le côté au lieu de le frapper droit ; des lignes de mouvement courbes montrent la trajectoire coupante et la rotation qui en résulte.", texts: ["la surface effleure · coupe et rotation"] },
  'G-014': { aria: "Le système de jeu de jambes : s'élancer de la base centrale vers les coins et revenir aussitôt au centre.", texts: ['Base', "vers le coin — retour au centre"] },
  'G-015': { aria: "Prendre le speeder tôt : contact au point le plus haut et le plus précoce, nettement devant et au-dessus du corps ; un point de frappe plus bas et pâle montre où un joueur plus lent aurait frappé.", texts: ["tôt et haut — du temps volé"] },
  'G-016': { aria: "Feinte, image 1 : une préparation volontairement neutre et identique qui ne révèle rien — armé complet, corps posé, aucune frappe décidée.", texts: ['?', "même préparation — ne rien révéler"] },
  'G-017': { aria: "Feinte, image 2 : la même préparation, d'où bifurquent deux frappes différentes — un drive plat et rapide et un amorti court et doux ; le choix ne se fait qu'au dernier moment.", texts: ["une préparation, deux options"] },
  'G-021': { aria: "Précision sur les lignes : le speeder atterrit exactement sur une ligne de coin, au bord extrême du terrain ; des zones cibles serrées dans les coins et une flèche fine montrent le placement au point près, avec une marge minimale.", texts: ["pile sur la ligne · marge minimale"] },
  'G-023': { aria: "Le but du jeu : jouer le speeder par-dessus la zone neutre dans le terrain adverse.", texts: ["terrain adverse", "ZONE NEUTRE", "ton terrain"] },
  'G-024': { aria: "Position centrale : depuis le milieu du terrain, les trajets vers les quatre coins sont aussi courts.", texts: ['Centre', "aussi vite vers chaque coin"] },
  'G-025': { aria: "Longueur et profondeur : jouer une balle courte à la ligne avant ou une balle profonde à la ligne de fond.", texts: ["profond — à la ligne de fond", "court — à la ligne avant"] },
  'G-026': { aria: "Le revers de l'adversaire : jouer le speeder de façon ciblée dans le coin revers de l'adversaire.", texts: ['adversaire', 'revers'] },
  'G-027': { aria: "Utiliser le service tactiquement : depuis la zone de service, viser différents points cibles dans le terrain adverse.", texts: ["zone de service"] },
  'G-028': { aria: "Construire le point : déplacer l'adversaire de coin en coin par plusieurs frappes, jusqu'à ce qu'une ouverture apparaisse.", texts: ['1', '2', '3', 'ouvert', "construire le point → ouverture"] },
  'G-029': { aria: "Préparer le smash : pousser bas, forcer l'adversaire à la balle haute, puis conclure raide.", texts: ['1', "pousser bas", '2', '3', "pousser → haut → smash"] },
  'G-030': { aria: "Types d'adversaires et contre-mesures : contre l'attaquant, le défenseur et l'adversaire lent, une réponse adaptée à chacun.", texts: ['Attaquant', "retirer du rythme", 'Défenseur', "coin à coin", 'Lent', "angles larges"] },
  'G-031': { aria: "Attaquer une faiblesse systématiquement : jouer le speeder encore et encore dans le même coin faible de l'adversaire.", texts: ['faiblesse', 'ouvrir'] },
  'G-035': { aria: "Force réactive : le contact au sol court et élastique du pied et de la jambe — temps de contact minimal, suggéré par un petit arc de compression et une flèche de rebond rapide.", texts: ["contact au sol court · rebond rapide"] },
  'G-037': { aria: "Le double comme jeu à part : deux contre deux, chaque paire partage un terrain.", texts: ["paire adverse", "2 contre 2", "votre paire"] },
  'G-038': { aria: "Attaque en paire : un joueur devant, le partenaire derrière — la formation d'attaque avant-arrière.", texts: ['Attaque', 'avant', 'arrière', "Attaque : avant–arrière"] },
  'G-039': { aria: "Défense en paire : les deux se placent plus en retrait et plus écartés, l'un devant, l'autre derrière — chacun couvre sa zone.", texts: ["avant", "arrière", "Défense : en retrait, écartés"] },
  'G-040': { aria: "Service et renvoi en double : le droit de servir passe dans un ordre fixe à travers les quatre joueurs.", texts: ['1', '2', '3', '4', 'Service', "à tour de rôle : 1 → 2 → 3 → 4"] },
  'G-041': { aria: "Le changement dans le double : passer de l'attaque avant-arrière à la défense — les deux reculent et s'écartent, l'ordre avant-arrière reste.", texts: ["Attaque", "avant–arrière", "Défense", "en retrait, écartés"] },
  'G-042': { aria: "Le déplacement comme une unité : les deux partenaires se déplacent ensemble dans la même direction, à distance constante.", texts: ["se déplacer ensemble — la distance tient"] },
  'G-044': { aria: "Premiers pas en double : deux partenaires côte à côte à distance confortable.", texts: ["distance confortable", "premiers pas à deux"] },
  'G-045': { aria: "Qui prend la balle : de deux partenaires, l'un prend le speeder central, l'autre lui laisse la place.", texts: ['prendre', 'laisser', "qui prend la balle ?"] },
  'G-046': { aria: "Service en double, simple : depuis un ordre fixe, l'un sert par-dessus la zone neutre.", texts: ['1', "paire adverse", "votre paire", 'Service'] },
  'G-048': { aria: "Se laisser de la place : les deux partenaires gardent une distance claire et ne se gênent pas.", texts: ['distance', "se laisser de la place"] },
  'G-049': { aria: "La paire comme système : les deux partenaires couvrent ensemble tout le terrain, liés et coordonnés.", texts: ["comme un système — tout le terrain"] },
  'G-050': { aria: "Lire la paire adverse : reconnaître la brèche entre les deux adversaires et la jouer.", texts: ['adversaires', 'brèche'] },
  'G-051': { aria: "Mettre le partenaire en position : sa propre frappe place le partenaire dans une meilleure position d'attaque.", texts: ["ta frappe", 'partenaire', "mettre le partenaire en position"] },
  'G-052': { aria: "Basculer sans rupture : la paire alterne avec fluidité entre attaque et défense — l'ordre avant-arrière reste.", texts: ["avant", "Attaque", "Défense", "basculer sans rupture"] },
  'G-054': { aria: "Jouer dehors : un joueur sur un terrain sans filet sous le ciel ouvert, avec une surface simple, posture détendue et adaptable.", texts: ["jouer dehors · terrain ouvert"] },
  'G-055': { aria: "Lire et exploiter le vent : le vent décale le speeder sur le côté, c'est pourquoi tu vises volontairement contre la dérive.", texts: ['Vent →', 'cible', "viser contre la dérive"] },
  'G-056': { aria: "Soleil et éblouissement : un joueur protège ses yeux contre un soleil bas tout en suivant un speeder haut ; soleil et rayons éblouissants dans un coin, position de tête adaptée.", texts: ["contre le soleil · protéger les yeux"] },
  'G-057': { aria: "Humidité et appui sûr : un joueur avec une posture élargie et prudente sur un sol mouillé, des gouttes d'eau suggérées et un centre de gravité bas et sûr.", texts: ["sol mouillé · appui large et sûr"] },
  'G-058': { aria: "Chaleur : un joueur répartit ses forces par la chaleur, le soleil haut au-dessus de la tête, un parasol à côté pour les pauses à l'ombre, posture calme et mesurée.", texts: ["chaleur · ombre, répartir ses forces"] },
  'G-059': { aria: "Différentes surfaces : sable, gazon, terre battue et gazon synthétique demandent chacun un autre jeu de jambes.", texts: ['Sable', 'Gazon', "Terre battue", "Gazon synth.", "chaque sol — son jeu de jambes"] },
  'G-060': { aria: "Terrain de Crossminton coté : deux terrains de 5,50 sur 5,50 m, zone neutre de 12,80 m, ligne de service à 3,00 m de la ligne avant.", texts: ['TERRAIN', "zone de service", "ligne de service", 'TERRAIN', "zone de service", "ZONE NEUTRE", "pas de filet — le speeder doit passer", "5,50 m", "5,50 m", "12,80 m", "3,00 m"] },
  'G-061': { aria: "Gestes de l'arbitre : IN, OUT, temps mort, let, changement de côtés et faute de service en aperçu.", texts: ["IN — dedans", "OUT — à côté", "temps mort (T)", 'let', "changement de côtés", "faute de service"] },
};

// Schrift-Nachzug NUR im fr-SVG bei französischer Überlänge (Ring-16-Regel:
// „Position/Größe nachziehen"). Reduziert font:<w> <px> in der genannten Klasse.
const TWEAKS = {
  'G-040': [{ cls: 'st', px: 11 }],   // Umlauf-Caption "à tour de rôle : 1 → 2 → 3 → 4"
  'G-061': [{ cls: 'cap', px: 10.5 }], // 3-Spalten-Handzeichen-Grid, längere fr-Label
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
let n = 0;
for (const [id, { aria, texts }] of Object.entries(M)) {
  const de = readFileSync(resolve('images', `${id}.svg`), 'utf8');
  // Personengrafiken entstehen in scratchpad/figuren/ (motive.mjs + texte.mjs) samt allen vier
  // Sprachen; dieses Skript würde ihre Übersetzung mit veralteten Texten überschreiben.
  if (de.includes('data-quelle="figuren"')) { console.error(`${id} ist generiert (scratchpad/figuren/) — Eintrag aus der Map entfernen`); process.exit(1); }
  let i = 0;
  let fr = de.replace(/(<text\b[^>]*>)([^<]*)(<\/text>)/g, (m, open, _inhalt, close) => {
    if (i >= texts.length) { console.error('zu viele <text> in', id); process.exit(1); }
    return `${open}${esc(texts[i++])}${close}`;
  });
  if (i !== texts.length) { console.error(`Anzahl <text> stimmt nicht bei ${id}: ${i} ersetzt, ${texts.length} erwartet`); process.exit(1); }
  fr = fr.replace(/aria-label="[^"]*"/, `aria-label="${esc(aria)}"`);
  for (const { cls, px } of TWEAKS[id] || []) {
    const re = new RegExp('(\\.' + cls + '\\{[^}]*?font:\\s*\\d+\\s+)(\\d+(?:\\.\\d+)?)(px)');
    const vorher = fr;
    fr = fr.replace(re, `$1${px}$3`);
    if (fr === vorher) { console.error(`TWEAK ohne Wirkung bei ${id}.${cls}`); process.exit(1); }
  }
  if (fr === de) { console.error('KEINE Ersetzung bei', id); process.exit(1); }
  writeFileSync(resolve('images', `${id}.fr.svg`), fr);
  n++;
}
console.log('fr-SVGs erzeugt:', n);
