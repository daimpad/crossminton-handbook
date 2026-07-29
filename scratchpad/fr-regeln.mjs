// Dedizierter fr-Einfüger für data/regeln.json:
// eigene Entität (Top-Key abschnitte). Knoten sind INLINE-Objekte
// {"de":..., "en":...}. Cursor-basiert (Dokumentreihenfolge), inline-fügend
// (", \"fr\": ..." direkt nach "en"), dupe-sicher. Abschnitt-/Regel-Titel
// werden DIREKT übersetzt (nicht label-geliftet). _meta bleibt unangetastet.
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const pfad = 'data/regeln.json';

const FR = {
  grundbegriffe: {
    titel: "Notions de base",
    einleitung: "Quelques notions qui reviennent sans cesse dans les règles. Qui les connaît comprend le reste sans peine.",
    regeln: [
      { t: "Le court, le terrain et la zone de sécurité",
        i: "Le court se compose de deux terrains disposés parallèlement l'un à l'autre, à une distance de 12,80 m. La zone de sécurité est la surface autour des terrains et entre eux.",
        e: "Vous ne jouez pas par-dessus un filet, mais par-dessus un vide. Entre ton terrain et celui de l'adversaire se trouve un espace libre de 12,80 m — la zone de sécurité. Le speeder ne doit pas y être joué ; il doit franchir la zone jusque dans le terrain adverse." },
      { t: "Le speeder et la raquette",
        i: "La balle s'appelle le speeder. On joue avec une raquette.",
        e: "Le speeder est la balle spéciale du Crossminton — plus lourde et plus rapide qu'un volant, avec une trajectoire stable." },
      { t: "Simple et double",
        i: "Simple : un joueur dans chaque terrain. Double : deux joueurs dans chaque terrain.",
        e: "En simple, tu fais face seul à ton adversaire. En double, tu partages ton terrain avec un partenaire — avec ses propres règles, voir la section double." },
      { t: "Serveur, relanceur et échange",
        i: "Le serveur est la partie qui sert, le relanceur celle qui renvoie. Un échange est la suite de frappes depuis le service jusqu'au moment où le speeder est hors jeu.",
        e: "Chaque échange commence par un service et court jusqu'à ce que le speeder touche le sol ou qu'une faute survienne. Cette suite s'appelle un échange." }
    ]
  },
  ausruestung: {
    titel: "Équipement (speeder et raquette)",
    einleitung: "La version ICO 2024 a son propre chapitre équipement. Il définit quels speeders et quelles raquettes sont conformes aux règles — le reste du choix reste libre.",
    regeln: [
      { t: "Dimensions du speeder",
        i: "Le speeder pèse au moins 8 et au plus 10 grammes (dans la catégorie U12 : 6 à 10 grammes). Il mesure 57 à 63 mm de haut, et le panier mesure 47 à 53 mm à son point le plus large. La tête est un capuchon hémisphérique en thermoplastique, de 25 à 27 mm de diamètre. La balle de match officielle est le Match Speeder jaune ; en U12, le Fun Speeder rouge est obligatoire.",
        e: "Tous les speeders ne conviennent pas au tournoi : le poids, la hauteur et le capuchon sont précisément définis. En compétition, tu joues le Match Speeder jaune, et chez les plus jeunes le Fun Speeder rouge, plus lent." },
      { t: "Anneau anti-vent, vent et changement de forme",
        i: "Un anneau de caoutchouc directement sous le capuchon peut dépasser le poids maximal de 1 gramme. Par vent fort, un autre speeder peut être utilisé après consultation de l'organisateur et avec l'accord de l'arbitre en chef. La forme du speeder ne doit pas changer avant ni pendant le match ; les actions qui pourraient l'influencer — comme le mettre dans la poche du pantalon — sont interdites.",
        e: "Contre le vent, un anneau anti-vent est autorisé (il peut alourdir un peu la balle), et par grand vent, sur accord, un speeder plus lourd aussi. Ce que tu n'as pas le droit de faire : modifier la forme du speeder — pas même par la poche du pantalon." },
      { t: "Dimensions de la raquette",
        i: "La raquette mesure au plus 61 cm de long, et la tête au plus 650 cm² (dimensions extérieures). En U12, la longueur et la taille de la tête peuvent différer. Aucun dispositif n'est autorisé qui modifie la qualité de vol du speeder, influence artificiellement ses propriétés ou met en danger les adversaires ou les partenaires.",
        e: "Seules deux limites supérieures sont réglementées — la longueur et la tête — plus une interdiction de sécurité et de manipulation. Le poids, le matériau, l'équilibre, le cordage et la prise restent ton choix libre." }
    ]
  },
  wahl: {
    titel: "Le choix avant le début du jeu",
    regeln: [
      { t: "Qui choisit quoi",
        i: "Avant le début du jeu, un choix est effectué — habituellement en lançant le speeder ; la direction vers laquelle le capuchon pointe au sol décide. La partie gagnante décide soit de servir ou de relancer en premier, soit du côté où elle commence. La partie perdante décide de l'option restante.",
        e: "Au lieu d'une pièce, tu lances le speeder : le côté vers lequel le capuchon pointe au sol gagne le choix. Qui gagne choisit l'une des options — service/relance ou côté. L'autre revient à l'adversaire." },
      { t: "Les rôles en double",
        i: "En double, la partie qui sert indique à celle qui relance qui sert en premier (le joueur de fond). La partie qui relance décide librement qui est le joueur d'attaque et qui est le joueur de fond.",
        e: "Dès avant la première balle, en double, vous fixez vos rôles — qui commence à l'avant comme joueur d'attaque et qui à l'arrière comme joueur de fond." }
    ]
  },
  punkte_saetze: {
    titel: "Points et sets",
    regeln: [
      { t: "Best of 3",
        i: "Un match se joue en Best of 3 sets : deux sets gagnés sont nécessaires pour gagner le match.",
        e: "Tu dois gagner deux sets. Si c'est 1-1 en sets, le troisième décide." },
      { t: "16 points — et la règle du 15-15",
        i: "La partie qui atteint 16 points la première gagne le set — à une exception près : à 15-15, la partie qui a 2 points d'avance gagne.",
        e: "Normalement, il suffit d'atteindre 16 le premier. Mais si le score devient 15-15, tu dois prendre deux points d'écart — à 15-15, le jeu continue donc jusqu'à ce qu'une partie mène de deux points. Cela rend les sets serrés particulièrement éprouvants pour les nerfs." },
      { t: "Le système de rallye-point",
        i: "Qui gagne un échange reçoit le point — indépendamment de qui a servi. Une partie gagne l'échange quand l'autre commet une faute ou que le speeder touche le sol dans le terrain adverse.",
        e: "Chaque échange rapporte un point, peu importe qui a servi. Il n'y a pas de « service sans chance de marquer » — chaque échange compte." },
      { t: "Qui commence le set suivant",
        i: "La partie qui a perdu un set commence le set suivant au service.",
        e: "Petite compensation : si tu perds un set, tu sers au suivant." }
    ]
  },
  seitenwechsel: {
    titel: "Le changement de côtés",
    regeln: [
      { t: "Quand on change de côtés",
        i: "Les parties changent de côtés : après le premier set ; après le deuxième set s'il y a un troisième ; et dans le troisième set tous les 6 points joués.",
        e: "Pour que personne ne soit désavantagé par la lumière, le vent ou la surface, vous changez de côtés — entre les sets et, dans le set décisif, même tous les 6 points." },
      { t: "Un changement de côtés oublié",
        i: "Si un changement de côtés a été manqué, il a lieu dès que l'erreur est remarquée et que le speeder n'est pas en jeu. Le score reste inchangé.",
        e: "Si vous oubliez le changement, vous le rattrapez simplement dès qu'on s'en aperçoit — les points restent tels quels." }
    ]
  },
  aufschlag: {
    titel: "Le service",
    einleitung: "Le service a les règles les plus précises de tout le jeu. Qui les connaît ne donne pas de points par des services invalides.",
    regeln: [
      { t: "Depuis la zone de service",
        i: "Le serveur se tient dans la partie arrière du terrain (la zone de service), sans franchir, au moment de la frappe, la ligne de service (imaginaire) avec une partie du pied.",
        e: "Tu sers depuis la zone arrière de ton terrain et tu ne dois pas, ce faisant, franchir vers l'avant la ligne de service." },
      { t: "Un pied au sol",
        i: "Du début à la fin du service, un pied du serveur doit toucher le sol.",
        e: "Tu ne dois pas sauter au service — un pied reste au sol tout du long." },
      { t: "Le speeder sous la main de frappe",
        i: "Au moment du contact avec la raquette, tout le speeder doit être sous la main de frappe du serveur.",
        e: "C'est la règle de service centrale : tu frappes le speeder par en dessous. Tout le speeder est, au moment de la frappe, plus bas que ta main de frappe — un service au-dessus de la hauteur de l'épaule est invalide." },
      { t: "Vers l'avant et sans délai",
        i: "Une fois le service commencé, la raquette doit être menée vers l'avant jusqu'à la fin du mouvement (sans interruption). Le service ne doit pas être retardé volontairement dès que les deux parties sont prêtes.",
        e: "Le geste de service se déroule d'un seul trait vers l'avant — tu ne dois pas l'arrêter ni le feinter. Et quand les deux sont prêts, tu joues sans traîner." },
      { t: "Seulement quand le relanceur est prêt",
        i: "Le serveur ne peut commencer que si le relanceur est prêt. Le relanceur est prêt lorsqu'il est perceptible qu'il veut renvoyer le service.",
        e: "Ne sers pas tant que ton adversaire n'est pas en place. Ce n'est que lorsqu'il est visiblement prêt que tu peux servir." },
      { t: "Trois services d'affilée",
        i: "Chaque partie effectue 3 services consécutifs avant que l'autre partie n'obtienne le droit de servir.",
        e: "Tu sers trois fois de suite, puis le droit de servir passe à l'adversaire. Cela donne au jeu son rythme." },
      { t: "À partir de 15-15, après chaque point",
        i: "À un score de 15-15, le droit de servir change après chaque point.",
        e: "Dans la phase finale d'un set serré, personne ne peut plus prendre l'avantage sur trois services — à partir de 15-15, le droit de servir passe après chaque point." },
      { t: "Libre après le service",
        i: "Après le service, le serveur peut sortir de la zone de service.",
        e: "Dès que le service est parti, tu es libre — tu te déplaces normalement dans le terrain et joues l'échange." },
      { t: "Météo extrême : 30 secondes",
        i: "Par conditions météo extrêmes, le service doit être effectué au plus tard 30 secondes après la fin du point précédent.",
        e: "Dehors, par vent, chaleur ou froid, le jeu ne doit pas s'enliser : après chaque point, tu as alors au plus 30 secondes jusqu'au service suivant. Cette exigence est venue avec la version 2024." }
    ]
  },
  einzel: {
    titel: "Le simple",
    regeln: [
      { t: "Service et déroulement en simple",
        i: "Le service se fait depuis l'arrière du court (la zone de service), de n'importe quelle position à l'intérieur. Pendant l'échange, le serveur et le relanceur jouent le speeder à tour de rôle depuis n'importe quelle position, jusqu'à ce qu'il soit hors jeu.",
        e: "En simple, c'est simple : servir depuis la zone arrière, puis vous jouez à tour de rôle où vous voulez, jusqu'à la fin de l'échange." }
    ]
  },
  doppel: {
    titel: "Le double",
    einleitung: "Le double a ses propres règles pour les rôles, l'ordre de service et la position. Les connaître évite des pertes de points évitables.",
    regeln: [
      { t: "Les rôles en double",
        i: "Un joueur de la partie qui sert sert depuis la zone de service. Chaque joueur de la partie qui relance est considéré comme relanceur. Après le service, le speeder peut être joué par n'importe quel joueur de la partie, de n'importe quelle position (attention à la règle de position).",
        e: "Vous vous répartissez en joueur d'attaque (à l'avant) et joueur de fond (à l'arrière). Après le service, chacun de vous peut prendre le speeder — tant que vous respectez la règle de position." },
      { t: "L'ordre de service",
        i: "Le droit de servir change dans un ordre fixe : du joueur de fond de la partie A (qui sert au début) au joueur d'attaque de la partie B (qui sert alors et devient joueur de fond), puis au partenaire de A, puis au partenaire de B, puis de nouveau au premier serveur. Personne ne peut servir en dehors de cet ordre.",
        e: "Le service passe dans une chaîne fixe à travers les quatre joueurs : A1 → B1 → A2 → B2 → de nouveau A1. Celui qui sert est toujours le joueur de fond. Vous devez avoir cet ordre en tête." },
      { t: "La règle de position",
        i: "Faute de position pendant l'échange : au moment de la frappe, le joueur de fond place une partie de son pied le plus proche de la ligne de fond devant le pied de son partenaire — ou l'attaquant place son pied le plus proche de la ligne de fond derrière le pied de son partenaire. Les deux sont une faute de position.",
        e: "Au moment de la frappe, l'ordre doit être correct : le joueur d'attaque reste à l'avant, le joueur de fond à l'arrière. Si vous inversez l'ordre au moment de la frappe, c'est une faute." },
      { t: "Conséquence de la faute de position",
        i: "Si une faute de position est sanctionnée au service ou pendant l'échange au renvoi, le point est immédiatement perdu, bien que l'échange ne soit pas encore terminé.",
        e: "Une faute de position met fin à l'échange immédiatement à votre désavantage — le point est perdu, même si vous êtes justement en train d'attaquer. C'est pourquoi une répartition nette des rôles paie." },
      { t: "Annoncer les rôles en début de set",
        i: "Au début du set, la partie qui relance annonce d'abord qui est le joueur d'attaque et qui est le joueur de fond, puis la partie qui sert.",
        e: "Avant chaque set, vous fixez ouvertement vos rôles, pour qu'il soit clair pour tous qui joue à l'avant et qui à l'arrière." }
    ]
  },
  fehler: {
    titel: "Les fautes",
    einleitung: "Une faute met fin à l'échange et donne le point à l'autre partie. Voici les principaux types de faute.",
    regeln: [
      { t: "Service invalide",
        i: "Un service qui n'est pas exécuté conformément aux règles de service est une faute.",
        e: "Tout ce qui figure dans la section service s'applique : mauvaise position, saut, speeder frappé trop haut, geste interrompu — chaque infraction est une faute." },
      { t: "Speeder dehors, au plafond ou sur un mur",
        i: "Faute lorsque le speeder touche le court en dehors des lignes (non sur ou à l'intérieur des lignes) ou touche le plafond ou les murs latéraux.",
        e: "Sur la ligne compte comme dedans. En dehors, au plafond ou sur un mur, c'est faute. Contrairement au squash, aucun mur n'est en jeu ici." },
      { t: "Le speeder touche un joueur ou un objet",
        i: "Faute lorsque le speeder touche un joueur ou ses vêtements — y compris les chaussures et les chaussettes —, ou un objet ou une personne en dehors du court.",
        e: "Si le speeder te touche, touche tes vêtements, tes chaussures ou tes chaussettes, ou quelque chose en dehors du court, l'échange est perdu. La version 2024 nomme les chaussures et les chaussettes explicitement — une raison de plus pour des vêtements près du corps." },
      { t: "Attraper, lancer, double touche",
        i: "Faute lorsque le speeder est attrapé/arrêté avec la raquette puis lancé, ou lorsqu'il est touché deux fois par le même joueur. Ce n'est pas une faute si le speeder touche le cadre et le cordage en même temps dans une seule frappe.",
        e: "Tu dois frapper le speeder proprement, ne pas l'attraper puis le lancer, et ne le toucher qu'une fois. S'il touche à la fois le cadre et les cordes dans une seule frappe, c'est autorisé." },
      { t: "Double touche entre partenaires, speeder pas passé",
        i: "Faute lorsque le speeder est touché par un joueur puis par son partenaire, ou lorsqu'il touche la raquette et ne vole ensuite pas en direction de l'autre côté du court.",
        e: "En double, un seul de vous peut toucher le speeder par frappe. Et ta frappe doit effectivement amener le speeder de l'autre côté." },
      { t: "Gêner, distraire, entrer dans le terrain",
        i: "Faute lorsqu'un joueur, le speeder étant en jeu, entre dans le court adverse avec la raquette ou le corps, empêche l'adversaire d'effectuer une frappe correcte ou le distrait en criant ou en gesticulant.",
        e: "Reste chez toi : ne pas entrer dans le terrain adverse, ne pas gêner l'adversaire et ne pas le déranger en criant ou par des gestes." }
    ]
  },
  in_out: {
    titel: "In ou out — la décision de ligne",
    einleitung: "Ce n'est pas le speeder entier qui décide si une balle est « in », mais sa tête. La version 2024 l'a précisé explicitement.",
    regeln: [
      { t: "La tête décide",
        i: "La tête (le capuchon) du speeder touche le sol la première. Si la tête touche la ligne, la balle est « in ». Si la tête ne touche pas la ligne, la balle est « out » — même si une autre partie du speeder touche la ligne.",
        e: "Regarde le capuchon, non le panier : ce n'est que si la tête touche la ligne que la balle compte comme dedans. Si seul le panier effleure la ligne tandis que la tête atterrit à côté, elle est dehors." },
      { t: "Trace de glissement à la ligne avant",
        i: "Si le speeder atterrit avant la ligne avant et laisse une trace de glissement visible, il ne compte comme « in » que si la trace est au plus aussi longue que la tête du speeder.",
        e: "Si le speeder glisse jusque dans la ligne depuis l'avant de la ligne avant, la longueur de la trace de glissement décide : si elle est plus longue que la tête, le premier contact au sol était trop en avant — la balle est dehors. Cela aussi est nouveau dans la version 2024." }
    ]
  },
  wiederholungen: {
    titel: "Les lets",
    regeln: [
      { t: "Ce qu'est un let",
        i: "Lors d'un let, le service du dernier échange est invalide, et le joueur qui a servi en dernier répète le service.",
        e: "Un let (le même terme qu'au tennis) signifie : l'échange ne compte pas, il n'y a pas de point, le même service est rejoué." },
      { t: "Quand un let est joué",
        i: "Let lorsque, entre autres : le serveur frappe avant que le relanceur ne soit prêt ; une faute est commise en même temps des deux côtés ; le speeder est défectueux ou se déforme ; deux speeders se rencontrent en l'air ; une ligne est déplacée pendant l'échange ; le jeu est perturbé ; ou un objet tombe dans le terrain pendant l'échange.",
        e: "Chaque fois que survient quelque chose d'injuste ou d'imprévu qui n'est imputable à aucun des deux côtés, l'échange est rejoué au lieu d'attribuer un point. La version 2024 nomme en plus deux speeders qui entrent en collision et une ligne déplacée en cours de jeu." }
    ]
  },
  speeder_im_spiel: {
    titel: "Quand le speeder est hors jeu",
    regeln: [
      { t: "Fin de l'échange",
        i: "Le speeder n'est plus en jeu lorsqu'il touche le sol du court ou lorsqu'il y a une faute ou un let.",
        e: "L'échange se termine au moment où le speeder touche le sol ou qu'une faute ou un let survient. Jusque-là, il est en jeu." }
    ]
  },
  kommunikation: {
    titel: "Se comprendre sans arbitre",
    einleitung: "Dans les matchs sans arbitre, vous signalez les décisions par un simple geste de la main libre.",
    regeln: [
      { t: "Les trois gestes de la main",
        i: "« In » : l'index de la main libre pointe vers le bas. « Out » : l'index pointe vers le haut. « Let » : l'index et le majeur pointent vers le haut en formant un « V ».",
        e: "Retiens la direction : index vers le bas signifie « dedans » (le speeder était dans le terrain), vers le haut signifie « dehors ». Un V à deux doigts signifie « let ». C'est ainsi que vous tranchez les balles équitablement sans arbitre." }
    ]
  }
};

const daten = JSON.parse(readFileSync(pfad, 'utf8'));
let s = readFileSync(pfad, 'utf8');
let cursor = 0, n = 0;

function insertAfterEn(enValue, frValue, wo) {
  if (frValue == null) { console.error('fehlende fr:', wo); process.exit(1); }
  const needle = `"en": ${JSON.stringify(enValue)}`;
  const pos = s.indexOf(needle, cursor);
  if (pos < 0) { console.error(`FEHLER: kein Treffer ab Cursor: ${wo}`); process.exit(1); }
  const davor = s.slice(Math.max(0, pos - 16), pos);
  let insertion;
  if (davor.includes('\n')) {
    const lineStart = s.lastIndexOf('\n', pos) + 1;
    const indent = s.slice(lineStart, pos);
    insertion = `,\n${indent}"fr": ${JSON.stringify(frValue)}`;
  } else {
    insertion = `, "fr": ${JSON.stringify(frValue)}`;
  }
  const insertAt = pos + needle.length;
  s = s.slice(0, insertAt) + insertion + s.slice(insertAt);
  cursor = insertAt + insertion.length;
  n++;
}

for (const abschnitt of daten.abschnitte) {
  const fr = FR[abschnitt.id];
  if (!fr) { console.error('fehlender Abschnitt:', abschnitt.id); process.exit(1); }
  insertAfterEn(abschnitt.titel.en, fr.titel, `${abschnitt.id}.titel`);
  if (abschnitt.einleitung) insertAfterEn(abschnitt.einleitung.en, fr.einleitung, `${abschnitt.id}.einleitung`);
  abschnitt.regeln.forEach((regel, idx) => {
    const r = fr.regeln[idx];
    if (!r) { console.error('fehlende Regel:', abschnitt.id, idx); process.exit(1); }
    insertAfterEn(regel.titel.en, r.t, `${abschnitt.id}[${idx}].titel`);
    insertAfterEn(regel.inhalt.en, r.i, `${abschnitt.id}[${idx}].inhalt`);
    if (regel.erklaerung) insertAfterEn(regel.erklaerung.en, r.e, `${abschnitt.id}[${idx}].erklaerung`);
  });
}

JSON.parse(s);
writeFileSync(pfad, s);

// de/en-Byte-Identität + fr-Formtreue prüfen (nur abschnitte; _meta ausgenommen)
const neu = JSON.parse(readFileSync(pfad, 'utf8'));
const alt = JSON.parse(execSync(`git show HEAD:${pfad}`).toString());
let de = 0, en = 0, fr = 0; const diffs = [];
const walk = (a, o, p) => {
  if (a && typeof a === 'object' && !Array.isArray(a)) {
    if ('de' in a && 'en' in a) {
      de++; if (JSON.stringify(a.de) !== JSON.stringify(o?.de)) diffs.push('de≠' + p);
      en++; if (JSON.stringify(a.en) !== JSON.stringify(o?.en)) diffs.push('en≠' + p);
      if ('fr' in a) { fr++; if (typeof a.fr !== typeof a.de) diffs.push('frForm≠' + p); }
    }
    for (const k of Object.keys(a)) walk(a[k], o?.[k], p + '.' + k);
  } else if (Array.isArray(a)) a.forEach((x, i) => walk(x, o?.[i], p + '[' + i + ']'));
};
walk(neu.abschnitte, alt.abschnitte, 'abschnitte');
const deEn = diffs.filter((d) => d.startsWith('de') || d.startsWith('en'));
console.log(`${pfad}: Einfügungen ${n} | de:${de} en:${en} fr:${fr} | de/en≠HEAD: ${deEn.length ? deEn.join(';') : 'KEINE'} | fr-Form: ${diffs.filter((d) => d.startsWith('fr')).length ? diffs.filter((d) => d.startsWith('fr')).join(';') : 'OK'}`);
if (deEn.length || fr !== de) { console.error('ABBRUCH: Integritätsfehler'); process.exit(1); }
