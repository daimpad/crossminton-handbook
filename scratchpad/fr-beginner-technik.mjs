// Fügt fr-Zwillinge in data/bausteine.beginner-technik.json ein — additiv, format-
// treu: erklaerteil-fr als String nach "en", uebungsteil-fr als Objekt nach der
// en-Objekt-Schließung (Einrückung wie de/en). de/en bleiben byte-identisch.
import { readFileSync, writeFileSync } from 'node:fs';

const PFAD = 'data/bausteine.beginner-technik.json';
const daten = JSON.parse(readFileSync(PFAD, 'utf8'));
const byId = {};
for (const b of [...daten.bausteine, ...daten.delta_bausteine]) byId[b.id] = b;

const FR = {
  grundposition: {
    e: "Entre deux frappes, il y a un instant où tu dois être prêt à tout. Cet instant a une posture — la position de base. C'est d'elle que tu pars dans toutes les directions.\n\nPense à un gardien face à un penalty : légèrement chargé, en éveil, prêt à bondir. C'est exactement cette tension que tu cherches. Les pieds un peu plus larges que les épaules, les genoux légèrement fléchis, le poids porté vers l'avant sur la plante des pieds — les talons touchent à peine le sol. Tu tiens la raquette souplement devant toi, les épaules restent détendues.\n\nC'est une disponibilité active, pas une position de repos. L'appui bas, légèrement penché vers l'avant, te met en mouvement plus vite que n'importe quelle posture droite. Qui reste à plat sur les talons perd le premier pas.",
    u: {
      titel: "Se charger et s'élancer",
      ziel: "Ta position de base te rend vraiment plus rapide — pas seulement plus élégant.",
      schritte: [
        "Prends la position de base : pieds un peu plus larges que les épaules, genoux légèrement fléchis, poids sur la plante des pieds, raquette souple devant toi.",
        "Choisis une direction — avant, arrière, gauche ou droite.",
        "Élance-toi de façon explosive d'un seul pas dans cette direction.",
        "Reviens à la position de base.",
        "Répète, à chaque fois dans une autre direction.",
      ],
      selbstkontrolle: "Le premier pas vient-il facilement ? Si tu peux t'élancer sans te redresser d'abord, la posture est bonne. Si tu dois d'abord te relever ou déplacer ton poids, tu étais trop passif — trop droit, trop à plat sur les talons.",
      abschluss: "La position de base est ton bloc de départ. Tu ne sais si elle fonctionne qu'une fois en mouvement.",
    },
  },
  griff: {
    e: "Au Crossminton, tu tiens la raquette de la même manière pour chaque frappe. Pas de changement de prise, pas de variantes pour le coup droit et le revers. Une seule prise pour tout — d'où le nom de prise universelle.\n\nCela paraît anodin, mais c'est la raison pour laquelle tu arrives à suivre dans le jeu rapide. Le speeder va plus vite que tu ne pourrais changer de prise. Qui cherche la bonne prise arrive trop tard.\n\nVoici comment la trouver : tiens la raquette devant toi avec la main libre, la tranche vers le sol. Maintenant, saisis-la comme si tu lui serrais la main. Un léger « V » se forme entre le pouce et l'index. Ce n'est rien de plus.\n\nDeux choses font la différence entre bon et mauvais :\n\nLa pression. Tiens souplement, sans crispation — à peu près aussi fermement que tu serres une main sans l'écraser. Une prise trop serrée t'enlève le toucher et fatigue l'avant-bras. Ça ne se raffermit qu'au moment de la frappe, puis tu relâches à nouveau.\n\nLe poignet. Au début, tu le gardes calme et droit. La force vient du bras, de l'épaule et des jambes. Au début, cela ressemble à une frappe de tennis, et c'est exactement ce qu'il faut. Ce n'est qu'une fois la prise acquise et les frappes propres que le poignet peut participer et, à la fin, claquer comme un fouet. Ce fouet viendra plus tard — pour l'instant, tu bâtis les fondations.",
    u: {
      titel: "Saisir à l'aveugle",
      ziel: "Ta main trouve la prise universelle toute seule — sans regarder, sans réfléchir.",
      schritte: [
        "Prends la raquette dans la main libre, tranche vers le sol.",
        "Saisis comme pour une poignée de main, forme le « V » entre le pouce et l'index.",
        "Jette un œil : le V est-il correct ? La pression est-elle souple ?",
        "Repose la raquette — ou lâche-la complètement.",
        "Répète. Dix fois avec un coup d'œil de contrôle.",
      ],
      steigerung: "Ferme les yeux. Saisis sans regarder. Ce n'est qu'ensuite que tu vérifies si le « V » est bon. Si tu le réussis dix fois de suite à l'aveugle, la prise est acquise.",
      selbstkontrolle: "En match, tu n'as pas le temps de contrôler ta prise. Elle doit être bonne d'elle-même dès que tu manies la raquette.",
      naechste_stufe: "Une fois la prise acquise à l'aveugle, tu l'emportes dans le premier geste de frappe. Là, tu vérifies si elle tient aussi quand le bras travaille — ce sera dans le drive de coup droit.",
    },
  },
  aufschlag: {
    e: "Le service ouvre chaque échange. C'est la seule frappe que tu prépares en toute tranquillité — aucun adversaire ne te met sous pression, le speeder repose dans ta seule main. C'est précisément ce qui en fait la frappe idéale pour commencer.\n\nTu tiens le speeder librement devant toi et tu le laisses tomber. Pendant qu'il descend, tu amènes la raquette du bas vers l'avant et tu le frappes dans sa chute. Le point décisif : au moment de la frappe, tout le speeder est en dessous de ta main. Cette seule exigence façonne tout le geste — tu frappes par en dessous, pas par en haut. Un service au-dessus de l'épaule n'est pas un service valable.\n\nÀ cela s'ajoutent deux conditions qui rendent le service valable : un pied reste au sol pendant le geste, et tu frappes depuis la zone arrière de ton terrain. Tant que tu respectes ces deux points, ton service compte.\n\nPour les premiers contacts, tu peux te faciliter la tâche : laisse tomber le speeder à hauteur de hanche et frappe-le bas, juste avant qu'il touche le sol. Ainsi tu t'habitues au moment de la chute. Une fois le timing en place, tu remontes le point de frappe — jusqu'à ce qu'il soit là où la règle l'exige : en dessous de la main.",
    u: {
      titel: "Lire la chute, puis frapper",
      ziel: "Trouver le moment où tu frappes proprement le speeder qui tombe.",
      schritte_teil1: [
        "Tiens le speeder librement devant toi, à peu près à hauteur de hanche.",
        "Laisse-le tomber et ne frappe pas encore — regarde seulement comment il descend.",
        "Répète quelques fois, jusqu'à sentir à quelle vitesse et où il tombe.",
      ],
      schritte_teil2: [
        "Laisse de nouveau tomber le speeder.",
        "Amène la raquette du bas vers l'avant et frappe-le bas, juste avant qu'il atteigne le sol.",
        "Ne te soucie pas encore d'une cible — seul compte le fait de le frapper proprement.",
      ],
      selbstkontrolle: "Frappes-tu le speeder de façon régulière, ou tantôt trop tôt, tantôt trop tard ? Si le moment de frappe est dispersé, accorde un peu plus d'attention à la chute avant de frapper.",
      abschluss: "Le service réussit par le timing, pas par la force. Dès que tu frappes le point de chute de façon fiable, viser vient presque tout seul — tu remonteras le point de frappe plus tard, et tu te fixeras une cible plus tard.",
    },
  },
  vorhand_drive: {
    e: "Le drive de coup droit est ta frappe de base, celle du quotidien. Plate, directe, jouée du côté de ta raquette — la frappe dont tu as le plus souvent besoin en match.\n\nImagine que tu balaies quelque chose d'une table à hauteur de hanche avec la raquette. C'est exactement ce geste que tu suis : le poids passe sur le pied avant, le buste tourne dans la direction de la frappe, et le bras amène la raquette vers l'avant. Tu frappes le speeder devant ton corps, ni à côté de toi ni derrière toi.\n\nToute la frappe est un geste unique et fluide — poids, rotation et frappe s'enchaînent. La force vient de cette chaîne, des jambes et du tronc, pas d'un grand armé du bras.\n\nEt ici, nous tenons la promesse faite à propos de la prise : pour l'instant, tu gardes le poignet calme et tu frappes de façon compacte. Le claquement du poignet — le fouet qui donnera plus tard de la vitesse à la frappe — viendra une fois ce geste de base acquis. D'abord l'arc propre, ensuite l'accélération.",
    u: {
      titel: "Ancrer l'arc",
      ziel: "Le geste de frappe est acquis comme une chaîne fluide, avant qu'un speeder entre en jeu.",
      schritte: [
        "Prends la position de base, prise universelle.",
        "Déplace le poids sur le pied avant, tourne le buste dans la direction de la frappe.",
        "Amène la raquette vers l'avant dans un arc compact, comme si tu balayais quelque chose sur le côté à hauteur de hanche.",
        "Garde le point de frappe imaginé nettement devant ton corps.",
        "Reviens à la position de base et répète.",
      ],
      selbstkontrolle: "Observe si le poids, la rotation et la frappe s'enchaînent. Si le geste se bloque, ralentis-le jusqu'à ce qu'il coule. La vitesse vient plus tard, d'abord l'arc propre.",
      naechste_stufe: "Une fois le geste acquis, tu y intègres un speeder — lance-le-toi brièvement, laisse-le tomber à hauteur de hanche et frappe-le dans l'arc devant ton corps. Là, tu vérifies si la chaîne tient aussi avec un vrai contact.",
    },
  },
  rueckhand: {
    e: "Le revers se joue du côté de ton corps opposé à la raquette — là où le dos de la main pointe vers l'avant. C'est le pendant du coup droit et il suit le même principe, simplement en miroir.\n\nSi tu connais déjà le coup droit, cette image t'aide : tout ce qui allait d'un côté là-bas va de l'autre côté ici. Le poids passe sur le pied de ton côté de frappe, le buste s'ouvre, et la raquette vient vers l'avant devant le corps. Ici aussi, tu frappes le speeder devant toi, à portée de ton bras de frappe.\n\nEt si le coup droit n'est pas frais dans ta tête : place-toi de côté par rapport à la cible, guide la raquette vers l'avant tout près du corps et ouvre le geste vers le point de frappe. La frappe reste compacte, le poignet d'abord calme — comme pour le coup droit, tu construis l'arc propre avant que la vitesse s'ajoute.\n\nUne raison pour laquelle le revers doit être solide : en match, il est visé délibérément. Beaucoup de services et d'attaques cherchent le côté revers, parce que c'est le plus faible chez la plupart. Un revers fiable retire justement cette surface d'attaque à ton adversaire.",
    u: {
      titel: "Ancrer l'arc en miroir",
      ziel: "Le geste de revers est acquis comme une chaîne fluide, avant qu'un speeder entre en jeu.",
      schritte: [
        "Prends la position de base, prise universelle.",
        "Déplace le poids sur le pied de ton côté de frappe, ouvre le buste.",
        "Guide la raquette vers l'avant tout près du corps et ouvre le geste vers le point de frappe.",
        "Garde le point de frappe imaginé nettement devant ton corps.",
        "Reviens à la position de base et répète.",
      ],
      selbstkontrolle: "Observe si le poids, la rotation et la frappe s'enchaînent. Si le geste se bloque, ralentis-le jusqu'à ce qu'il coule. Le revers semble d'abord plus inhabituel que le coup droit — cela s'estompe avec les répétitions.",
      naechste_stufe: "Une fois le geste acquis, tu y intègres un speeder — lance-le-toi brièvement, laisse-le tomber à hauteur de hanche et frappe-le dans l'arc devant ton corps. Là, tu vérifies si la chaîne tient aussi avec un vrai contact.",
    },
  },
  beinarbeit: {
    e: "Jusqu'ici, il s'agissait de comment tu frappes. Maintenant, il s'agit de comment tu arrives à temps là où le speeder atterrit. Un bon jeu de jambes décide souvent plus que la frappe elle-même — il t'amène à temps là où le speeder arrive.\n\nTout tourne autour d'un lieu et d'un instant.\n\nLe lieu, c'est le milieu de ton terrain — la position centrale. De là, tu atteins chaque coin le plus vite. Après chaque frappe, tu y reviens. Ton jeu y gagne un rythme : sortir vers la balle, frapper, revenir au centre. Encore et encore.\n\nL'instant, c'est le split-step — un petit bond élastique, juste avant que ton adversaire frappe le speeder. Tu atterris légèrement sur la plante des deux pieds, et c'est de cet atterrissage que tu pars dans toutes les directions. Le split-step transforme ta disponibilité calme en mouvement dirigé. Sans lui, tu es planté au sol et tu perds le premier pas.\n\nEnsemble, les deux forment un cycle : tu attends au centre, tu te charges avec le split-step, tu pars vers la balle, tu frappes, tu reviens. Ce cycle est le fondement de ta mobilité sur le terrain.",
    u: {
      titel: "Faire tourner le cycle",
      ziel: "Le cycle de déplacement est acquis dans son ensemble — sans speeder, comme pur jeu de jambes.",
      schritte: [
        "Place-toi en position centrale de ton terrain, en position de base.",
        "Fais un petit split-step — bond élastique, atterrissage sur la plante des deux pieds.",
        "Depuis l'atterrissage, élance-toi vers un coin de ton terrain et esquisse-y une frappe.",
        "Reviens à la position centrale.",
        "Répète, à chaque fois vers un autre coin.",
      ],
      selbstkontrolle: "Observe deux choses : le départ vient-il directement du split-step, ou y a-t-il une pause entre les deux ? Et reviens-tu de façon fiable à la position centrale, ou restes-tu dans le coin après la frappe ? Le cycle ne porte que lorsque les deux tournent rond.",
      abschluss: "Ce déplacement à vide installe le rythme avant qu'un speeder mette la pression. Une fois le cycle acquis, l'adaptation à la vraie balle vient presque toute seule — les trajets restent les mêmes, seule la cible se déplace alors.",
    },
  },
  griff_delta_bad: {
    e: "Tu sais déjà saisir. La prise en poignée de main, le « V » entre le pouce et l'index — tout est familier. Tu n'as rien de nouveau à apprendre ici.\n\nTu dois désapprendre quelque chose : le changement de prise.\n\nAu badminton, tu changes sans cesse — prise de coup droit, prise de revers, pouce posé, selon la frappe. Ce changement est ancré profondément en toi, et c'est justement lui qui te gênera au Crossminton. Ici, pas de changement. Une prise, chaque frappe.\n\nAu début, cela semble faux. Ta main veut changer de prise, surtout en revers — elle l'a fait mille fois. Ne la laisse pas faire. Garde la prise universelle même quand ton réflexe de badminton réclame le pouce.\n\nUn petit test : joue quelques revers et observe ton pouce. Se déplace-t-il ? Alors tu changes encore de prise. L'objectif est que la main reste calme.\n\nAu passage : le speeder est plus lourd qu'un volant, la raquette plus courte et au cordage plus épais. Ta prise peut donc être un cran plus ferme que d'habitude, et le poignet reste plus calme au début. Mais ça, c'est du réglage fin — la seule chose qui compte, c'est de renoncer au changement de prise.",
  },
  aufschlag_delta_bad: {
    e: "Tu connais le geste : laisser tomber le speeder, frapper par en dessous. Sur le plan moteur, rien à réapprendre.\n\nCe qui change, c'est ta cible. Au badminton, tu lèves le service par-dessus le filet — juste au-dessus, contrôlé, dans une zone proche. Cette image est ancrée en toi. Au Crossminton, il n'y a pas de filet à franchir. À sa place se trouve la zone neutre entre les terrains, et tu la franchis par la distance plutôt que par la hauteur.\n\nTon service part donc plus plat et plus loin que ne le veut ton réflexe de badminton. Ne le lève pas, porte-le vers l'avant à travers la zone — jusqu'au fond du terrain adverse.\n\nUn petit test : observe la trajectoire de ton service. Le speeder monte-t-il d'abord haut pour retomber juste derrière ? Alors tu joues encore par-dessus un filet qui n'est pas là. L'objectif est une trajectoire plate et longue.",
  },
  vorhand_drive_delta_bad: {
    e: "Tu connais le drive. Point de frappe devant le corps, poids vers l'avant, rotation dans la direction de la frappe — tout cela, tu l'apportes avec toi.\n\nUne chose se déplace : d'où vient la force. Au badminton, tu joues le drive surtout depuis le poignet et les doigts, et la raquette flexible claque avec. Ton matériel ici est différent — plus court, plus rigide, au cordage plus tendu, et le speeder est deux fois plus lourd qu'un volant. La raquette ne fléchit presque pas, donc le poignet seul ne porte plus la frappe.\n\nRetiens donc d'abord l'impulsion du poignet. Ta force vient maintenant d'une frappe plus compacte et plus ferme — davantage du tronc et du bras, avec un serrage net dans la prise au point de frappe. Au début, cela semble moins élégant que ton drive de badminton, mais cela transmet mieux l'énergie sur ce matériel rigide.\n\nLe poignet n'est pas écarté pour toujours. Une fois la frappe compacte acquise, tu le réintègres à doses mesurées — le même fouet que les autres joueurs apprennent plus tard, simplement adapté à ton matériel.\n\nUn petit test : joue quelques drives et fais attention à ton avant-bras. Reste-t-il souple alors que la frappe est puissante ? Alors le corps porte la frappe. Si la force vient sensiblement du seul poignet, retiens-le encore un peu.",
  },
  rueckhand_delta_bad: {
    e: "C'est en revers que ton habitude de badminton est la plus ancrée. Là, tu tournes d'ordinaire vers la prise du pouce — le pouce sur le côté large du manche, qui crée la force par le levier. C'est justement ce changement qui disparaît ici. Tu restes en prise universelle, en revers aussi, sans poser le pouce.\n\nC'est le même renoncement que tu as déjà rencontré avec la prise — en revers, il est simplement particulièrement sensible, car ton réflexe réclame ici le pouce le plus fortement.\n\nÀ cela s'ajoute, comme pour le coup droit, la source de force modifiée : sur ce matériel rigide, la force vient de la frappe du corps plus compacte, pas d'une impulsion du pouce ou du poignet. Tu trouveras les détails dans la note du coup droit.\n\nUn petit test : joue quelques revers et observe ton pouce. S'il se pose, tu saisis encore selon le schéma du badminton. L'objectif est qu'il reste calmement à sa position de prise universelle.",
  },
};

let s = readFileSync(PFAD, 'utf8');
let eingefuegt = 0;

function ersetze(needle, replacement, wo) {
  const count = s.split(needle).length - 1;
  if (count !== 1) { console.error(`FEHLER (${count}×): ${wo}`); process.exit(1); }
  s = s.replace(needle, replacement);
  eingefuegt++;
}

// fr-Objekt so einrücken, dass Inhalt auf 10, Schließung auf 8 Leerzeichen sitzt
function renderObj(obj) {
  return JSON.stringify(obj, null, 2).split('\n').map((l, i) => (i === 0 ? l : '        ' + l)).join('\n');
}

for (const [id, t] of Object.entries(FR)) {
  const b = byId[id];
  // erklaerteil (String nach "en")
  const enE = b.erklaerteil.en;
  ersetze(`"en": ${JSON.stringify(enE)}`, `"en": ${JSON.stringify(enE)},\n        "fr": ${JSON.stringify(t.e)}`, `${id}.erklaerteil`);
  // uebungsteil (Objekt nach en-Objekt-Schließung)
  if (t.u) {
    const enU = b.uebungsteil.en;
    const keys = Object.keys(enU);
    const k2 = keys[keys.length - 2];
    const k1 = keys[keys.length - 1];
    // Zwei-Feld-Anker (selbstkontrolle + letztes Feld) — eindeutig, weil
    // selbstkontrolle je Baustein differiert (naechste_stufe teilen sich zwei).
    const anchor = `          ${JSON.stringify(k2)}: ${JSON.stringify(enU[k2])},\n          ${JSON.stringify(k1)}: ${JSON.stringify(enU[k1])}\n        }`;
    ersetze(anchor, `${anchor},\n        "fr": ${renderObj(t.u)}`, `${id}.uebungsteil`);
  }
}

JSON.parse(s); // Validität
writeFileSync(PFAD, s);
console.log(`Einfügungen: ${eingefuegt} (erwartet 16)`);
