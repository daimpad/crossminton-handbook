// Erzeugt die französischen Zwillinge G-XXX.fr.svg aus G-XXX.svg: ersetzt jedes
// <text> in Dokumentreihenfolge + die aria-label; Geometrie/Tokens byte-identisch
// (Ring-16-Muster). Danach mit render-svg.mjs die .fr.png rendern.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const M = {
  'G-001': { aria: "La prise universelle : la main tient le manche de façon lâche comme une poignée de main, entre le pouce et l'index se forme un V net sur l'arête supérieure du manche.", texts: ['V', "comme une poignée de main · V en haut"] },
  'G-002': { aria: "La position de base : pieds un peu plus larges que les épaules, genoux fléchis, poids sur l'avant des pieds, raquette tenue de façon lâche devant le corps.", texts: ["genoux fléchis · poids sur l'avant des pieds"] },
  'G-003': { aria: "Le drive de coup droit : poids sur le pied avant, buste tourné vers la direction de frappe, point de frappe compact et à plat nettement devant le corps.", texts: ["à plat et direct · devant le corps"] },
  'G-004': { aria: "Le revers : poids sur le pied côté raquette, buste s'ouvrant vers la direction de frappe, la raquette menée tout près du corps et rencontrant le speeder devant.", texts: ["tout près du corps · frappe devant"] },
  'G-005': { aria: "Service, image 1 : la main libre laisse tomber le speeder à hauteur de hanche, le bras de frappe est bas, prêt à s'élancer vers l'avant par en dessous.", texts: ["le speeder tombe à hauteur de hanche"] },
  'G-006': { aria: "Service, image 2 : la raquette frappe le speeder par en dessous, tout le speeder est au point de frappe nettement sous la main de frappe.", texts: ["frappe sous la main de frappe"] },
  'G-007': { aria: "Jeu de jambes, image 1 : le split-step — un petit saut élastique, réception sur l'avant des deux pieds, genoux fléchis, prêt à repousser dans toutes les directions.", texts: ["petit saut élastique · sur l'avant des pieds"] },
  'G-008': { aria: "Jeu de jambes, image 2 : le cycle de déplacement — d'une fente dans le coin jouer le speeder et revenir par un trajet courbe à la position centrale au milieu.", texts: ["fente vers le coin — retour au centre"] },
  'G-009': { aria: "Le coup de poignet : l'avant-bras reste calme, le poignet est armé en arrière puis fouette vers l'avant — un arc de mouvement courbe et un léger flou à la tête de raquette montrent l'accélération.", texts: ["le poignet fouette · l'avant-bras reste calme"] },
  'G-010': { aria: "Le dégagement au-dessus de la tête : point de frappe haut au-dessus de la tête, bras de frappe tendu, la trajectoire décrit un arc haut et profond loin dans le terrain adverse.", texts: ["point de frappe haut · arc profond au fond"] },
  'G-011': { aria: "Le smash : point de frappe haut au-dessus et devant la tête, frappe agressive vers le bas, la trajectoire file raide et droit dans le terrain adverse.", texts: ["point de frappe haut · raide vers le bas"] },
  'G-012': { aria: "L'amorti : grande préparation, mais contact doux et freiné — le speeder franchit de justesse la zone neutre et tombe juste derrière la ligne avant.", texts: ["court et doux · tombe juste derrière la ligne"] },
  'G-013': { aria: "La coupe : la surface de frappe inclinée effleure le speeder sur le côté au lieu de le frapper droit ; des lignes de mouvement courbes montrent la trajectoire coupante et la rotation qui en résulte.", texts: ["la surface effleure · coupe et rotation"] },
  'G-014': { aria: "Le système de jeu de jambes : s'élancer de la base centrale vers les coins et revenir aussitôt au centre.", texts: ['Base', "vers le coin — retour au centre"] },
  'G-015': { aria: "Prendre le speeder tôt : contact au point le plus haut et le plus précoce, nettement devant et au-dessus du corps ; un point de frappe plus bas et pâle montre où un joueur plus lent aurait frappé.", texts: ["tôt et haut — du temps volé"] },
  'G-016': { aria: "Feinte, image 1 : une préparation volontairement neutre et identique qui ne révèle rien — armé complet, corps posé, aucune frappe décidée.", texts: ['?', "même préparation — ne rien révéler"] },
  'G-017': { aria: "Feinte, image 2 : la même préparation, d'où bifurquent deux frappes différentes — un drive plat et rapide et un amorti court et doux ; le choix ne se fait qu'au dernier moment.", texts: ["une préparation, deux options"] },
  'G-018': { aria: "Changement de rythme, image 1 : une frappe rapide et puissante avec un net flou de mouvement et une trajectoire plate et rapide — tempo élevé.", texts: ["tempo élevé · plat et rapide"] },
  'G-019': { aria: "Changement de rythme, image 2 : une préparation presque identique, maintenant une frappe lente, haute et douce avec un arc léger — une rupture volontaire dans le rythme.", texts: ["rythme brisé · haut et doux"] },
  'G-020': { aria: "Le smash sauté : le joueur frappe au point le plus haut du saut, pieds décollés du sol, avec une trajectoire raide vers le bas dans le terrain adverse.", texts: ["en sautant · raide vers le bas"] },
  'G-021': { aria: "Précision sur les lignes : le speeder atterrit exactement sur une ligne de coin, au bord extrême du terrain ; des zones cibles serrées dans les coins et une flèche fine montrent le placement au point près, avec une marge minimale.", texts: ["pile sur la ligne · marge minimale"] },
  'G-022': { aria: "Constance sous pression maximale : une frappe propre et équilibrée avec une posture calme — base stable, tête calme, accompagnement contrôlé, reproductible de façon fiable.", texts: ["calme et reproductible · sous pression"] },
  'G-023': { aria: "Le but du jeu : jouer le speeder par-dessus la zone neutre dans le terrain adverse.", texts: ["terrain adverse", "ZONE NEUTRE", "ton terrain"] },
  'G-024': { aria: "Position centrale : depuis le milieu du terrain, les trajets vers les quatre coins sont aussi courts.", texts: ['Centre', "aussi vite vers chaque coin"] },
  'G-025': { aria: "Longueur et profondeur : jouer une balle courte à la ligne avant ou une balle profonde à la ligne de fond.", texts: ["profond — à la ligne de fond", "court — à la ligne avant"] },
  'G-026': { aria: "Le revers de l'adversaire : jouer le speeder de façon ciblée dans le coin revers de l'adversaire.", texts: ['adversaire', 'revers'] },
  'G-027': { aria: "Utiliser le service tactiquement : depuis la zone de service, viser différents points cibles dans le terrain adverse.", texts: ["zone de service"] },
  'G-028': { aria: "Construire le point : déplacer l'adversaire de coin en coin par plusieurs frappes, jusqu'à ce qu'une ouverture apparaisse.", texts: ['1', '2', '3', 'ouvert', "construire le point → ouverture"] },
  'G-029': { aria: "Préparer le smash : pousser bas, forcer l'adversaire à la balle haute, puis conclure raide.", texts: ['1', "pousser bas", '2', '3', "pousser → haut → smash"] },
  'G-030': { aria: "Types d'adversaires et contre-mesures : contre l'attaquant, le défenseur et l'adversaire lent, une réponse adaptée à chacun.", texts: ['Attaquant', "retirer du rythme", 'Défenseur', "coin à coin", 'Lent', "angles larges"] },
  'G-031': { aria: "Attaquer une faiblesse systématiquement : jouer le speeder encore et encore dans le même coin faible de l'adversaire.", texts: ['faiblesse', 'ouvrir'] },
  'G-032': { aria: "Pieds rapides : posture basse et athlétique sur l'avant des pieds, petits pas rapides suggérés par de légères lignes de mouvement aux pieds, prêt au changement de direction.", texts: ["pieds rapides et légers sur l'avant"] },
  'G-033': { aria: "Mobilité et l'épaule : une mobilisation douce de l'épaule et du tronc, un bras décrivant un cercle le long d'un arc de mouvement courbe au-dessus de l'épaule, posture détendue et droite.", texts: ["cercles d'épaule doux · mobilité"] },
  'G-034': { aria: "Explosivité et détente : depuis une posture basse et chargée, repousser de façon explosive vers un coin, une forte flèche de mouvement partant de la jambe motrice vers le haut et l'avant.", texts: ["repousser de façon explosive · détente"] },
  'G-035': { aria: "Force réactive : le contact au sol court et élastique du pied et de la jambe — temps de contact minimal, suggéré par un petit arc de compression et une flèche de rebond rapide.", texts: ["contact au sol court · rebond rapide"] },
  'G-036': { aria: "Économie de mouvement : à gauche un joueur qui se déplace efficacement — un trajet lisse et court ; à droite, pâle, une version agitée avec de nombreuses lignes de mouvement supplémentaires éparpillées.", texts: ["efficace plutôt qu'agité"] },
  'G-037': { aria: "Le double comme jeu à part : deux contre deux, chaque paire partage un terrain.", texts: ["paire adverse", "2 contre 2", "votre paire"] },
  'G-038': { aria: "Attaque en paire : un joueur devant, le partenaire derrière — la formation d'attaque avant-arrière.", texts: ['Attaque', 'avant', 'arrière', "Attaque : avant–arrière"] },
  'G-039': { aria: "Défense en paire : les deux joueurs côte à côte, chacun couvre une moitié du terrain.", texts: ["ta moitié", "sa moitié", "Défense : côte à côte"] },
  'G-040': { aria: "Service et renvoi en double : le droit de servir passe dans un ordre fixe à travers les quatre joueurs.", texts: ['1', '2', '3', '4', 'Service', "à tour de rôle : 1 → 2 → 3 → 4"] },
  'G-041': { aria: "Le changement dans le double : passer de la formation d'attaque avant-arrière à la défense côte à côte.", texts: ['Attaque', "avant–arrière", 'Défense', "côte à côte"] },
  'G-042': { aria: "Le déplacement comme une unité : les deux partenaires se déplacent ensemble dans la même direction, à distance constante.", texts: ["se déplacer ensemble — la distance tient"] },
  'G-043': { aria: "L'entente dans la paire : deux partenaires de double vus de dos, qui se coordonnent entre les points — l'un donne un signe de la main caché derrière le dos.", texts: ["signe de la main caché · entente"] },
  'G-044': { aria: "Premiers pas en double : deux partenaires côte à côte à distance confortable.", texts: ["distance confortable", "premiers pas à deux"] },
  'G-045': { aria: "Qui prend la balle : de deux partenaires, l'un prend le speeder central, l'autre lui laisse la place.", texts: ['prendre', 'laisser', "qui prend la balle ?"] },
  'G-046': { aria: "Service en double, simple : depuis un ordre fixe, l'un sert par-dessus la zone neutre.", texts: ['1', "paire adverse", "votre paire", 'Service'] },
  'G-047': { aria: "Se mettre d'accord : deux partenaires de double vus de dos se concertent entre les points d'un geste simple, posture détendue — communication de base en paire.", texts: ["se concerter brièvement · en paire"] },
  'G-048': { aria: "Se laisser de la place : les deux partenaires gardent une distance claire et ne se gênent pas.", texts: ['distance', "se laisser de la place"] },
  'G-049': { aria: "La paire comme système : les deux partenaires couvrent ensemble tout le terrain, liés et coordonnés.", texts: ["comme un système — tout le terrain"] },
  'G-050': { aria: "Lire la paire adverse : reconnaître la brèche entre les deux adversaires et la jouer.", texts: ['adversaires', 'brèche'] },
  'G-051': { aria: "Mettre le partenaire en position : sa propre frappe place le partenaire dans une meilleure position d'attaque.", texts: ["ta frappe", 'partenaire', "mettre le partenaire en position"] },
  'G-052': { aria: "Basculer sans rupture : la paire alterne avec fluidité entre attaque et défense.", texts: ["basculer sans rupture"] },
  'G-053': { aria: "L'entente aveugle : deux partenaires de double se déplacent en parfaite anticipation, sans se regarder — des flèches de mouvement parallèles et en miroir et une bande de perception commune.", texts: ["entente aveugle · sans se regarder"] },
  'G-054': { aria: "Jouer dehors : un joueur sur un terrain sans filet sous le ciel ouvert, avec une surface simple, posture détendue et adaptable.", texts: ["jouer dehors · terrain ouvert"] },
  'G-055': { aria: "Lire et exploiter le vent : le vent décale le speeder sur le côté, c'est pourquoi tu vises volontairement contre la dérive.", texts: ['Vent →', 'cible', "viser contre la dérive"] },
  'G-056': { aria: "Soleil et éblouissement : un joueur protège ses yeux contre un soleil bas tout en suivant un speeder haut ; soleil et rayons éblouissants dans un coin, position de tête adaptée.", texts: ["contre le soleil · protéger les yeux"] },
  'G-057': { aria: "Humidité et appui sûr : un joueur avec une posture élargie et prudente sur un sol mouillé, des gouttes d'eau suggérées et un centre de gravité bas et sûr.", texts: ["sol mouillé · appui large et sûr"] },
  'G-058': { aria: "Chaleur : un joueur répartit ses forces par la chaleur, le soleil haut au-dessus de la tête, une bouteille d'eau à côté, posture calme et mesurée.", texts: ["chaleur · réduire le tempo, boire"] },
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
