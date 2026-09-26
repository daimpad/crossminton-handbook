// Dedizierter fr-Einfüger für data/trainingseinheiten.json:
// eigene Entität (Top-Key trainingseinheiten), Knoten sind titel/schwerpunkt/
// beschreibung + je Referenz ein hinweis (verschachtelt in phasen). Alle {de,en}
// String-Zwillinge. Cursor-basiert (Dokumentreihenfolge), formattreu:
// fügt "fr" nach "en" ein mit dem Einzug der "en"-Zeile. titel spiegelt fr.json.
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const pfad = 'data/trainingseinheiten.json';

const FR = {
  beginner_erste_schlaege: {
    titel: "Premières frappes",
    schwerpunkt: "Frapper les coups de base avec sûreté",
    beschreibung: "La première séance pour débutants : de la prise au drive de coup droit en passant par le service, clôturée par un jeu de cible ludique sur la longueur.",
    hinweise: {
      richtig_aufwaermen: "Courte séquence d'échauffement — mettre la circulation en route, réveiller l'épaule et les jambes.",
      griff: "D'abord la prise universelle — elle porte toutes les frappes qui suivent.",
      aufschlag: "Peut se travailler sans partenaire ; idéal comme deuxième étape.",
      vorhand_drive: "La frappe de base par excellence ; c'est là qu'est l'axe de la séance.",
      laenge_tiefe: "Application ludique : jouer le drive appris sur une cible en profondeur."
    }
  },
  beginner_bewegung_und_position: {
    titel: "Déplacement et position",
    schwerpunkt: "Être à temps sur le speeder — position de base, démarrage, retour",
    beschreibung: "La séance de déplacement pour débutants : la position centrale, les pieds rapides et le cycle de déplacement, clôturée par un entretien de la mobilité.",
    hinweise: {
      richtig_aufwaermen: "Avant le travail de déplacement, bien préparer surtout les jambes.",
      grundposition: "La posture de départ chargée comme point de départ de chaque déplacement.",
      schnelle_fuesse: "Démarrage et changement de direction — répétitions courtes et propres.",
      beinarbeit: "Le cycle du split-step, du trajet vers la balle et du retour ; l'axe de la séance.",
      beweglichkeit_und_schulter: "Retour au calme : entretien doux de la mobilité, quand le corps est chaud."
    }
  },
  fortgeschritten_angriff_aufbauen: {
    titel: "Construire l'attaque",
    schwerpunkt: "Créer l'attaque et la conclure",
    beschreibung: "Séance d'attaque avancée : du fouet à la frappe au-dessus de la tête puis au smash, ensuite la préparation tactique de la conclusion. Clôture par un entretien de l'épaule après le travail au-dessus de la tête.",
    hinweise: {
      richtig_aufwaermen: "Avant le travail au-dessus de la tête et de force explosive, s'échauffer à fond, surtout l'épaule de frappe.",
      handgelenk_peitsche: "La source de puissance d'abord — elle porte le dégagement et le smash.",
      ueberkopf_clear: "Le point de frappe haut comme base de l'attaque par le haut.",
      smash: "La constance avant la vitesse ; plusieurs smashes placés plutôt qu'un seul puissant.",
      smash_vorbereiten: "Le cœur tactique de la séance : placer le smash à partir de la situation préparée.",
      beweglichkeit_und_schulter: "Retour au calme : soigner l'épaule de frappe sollicitée d'un seul côté après le travail au-dessus de la tête."
    }
  },
  doppel_als_paar_spielen: {
    titel: "Jouer en paire",
    schwerpunkt: "Attaquer et défendre comme une unité",
    beschreibung: "Séance de double : le déplacement coordonné en paire, l'attaque en tenaille et la défense sans faille, clôturée par des intervalles proches du jeu.",
    hinweise: {
      richtig_aufwaermen: "S'échauffer ensemble ; la préparation du déplacement vous accorde déjà l'un à l'autre.",
      bewegung_als_einheit: "D'abord le déplacement coordonné — il porte aussi bien l'attaque que la défense.",
      angriff_im_paar: "La tenaille faite de pression (à l'arrière) et de conclusion (à l'avant).",
      verteidigung_im_paar: "Couvrir sans faille, retirer du rythme, guetter le moment de bascule ; l'axe conjointement avec l'attaque.",
      intervallausdauer: "Clôture proche du jeu : échanges intenses avec courte récupération, joués en double."
    }
  },
  experte_praezision_und_taeuschung: {
    titel: "Précision et feinte",
    schwerpunkt: "Feinter l'adversaire et toucher les lignes",
    beschreibung: "Une séance experte pour l'acuité et la finesse : être tôt sur le speeder, dissimuler son intention, placer avec précision sur les lignes — et transposer le tout dans une partie où tu imposes ton jeu à l'adversaire.",
    hinweise: {
      beweglichkeit_und_schulter: "Réveiller l'épaule et le tronc — la base de mouvements propres au-dessus de la tête et de feinte.",
      frueh_nehmen: "D'abord prendre la balle tôt : cela te procure le temps qui rend la feinte et la précision possibles.",
      taeuschung: "En t'appuyant sur le temps gagné, dissimuler l'intention — même préparation, autre direction.",
      praezision_an_die_linien: "L'axe : placer les balles feintées avec précision sur les lignes, là où elles font le plus mal.",
      dem_gegner_aufzwingen: "Application en partie : imposer ton jeu à l'adversaire avec des balles prises tôt, feintées et précises."
    }
  },
  experte_tempo_und_konstanz: {
    titel: "Rythme et constance",
    schwerpunkt: "Varier le tempo et rester constant sous pression",
    beschreibung: "Une séance experte pour le rythme et la résistance : changer le tempo volontairement, se détendre du sol de façon explosive et placer la frappe puissante en sautant — clôturée par le maintien de la qualité sous la pression maximale.",
    hinweise: {
      schnelle_fuesse: "Amener le jeu de jambes à température de service — préparer le démarrage et le contact au sol pour le travail réactif qui suit.",
      tempo_rhythmus_wechsel: "Varier le tempo volontairement pour briser le rythme de l'adversaire.",
      sprung_smash: "Placer la conclusion puissante en sautant — avec la note de santé sur la charge de saut indiquée dans le module.",
      reaktivkraft_bodenkontakt: "Travailler le contact au sol court et explosif qui porte les changements de tempo et le saut.",
      konstanz_unter_hoechstdruck: "Intégration : garder le tempo et la puissance propres même quand la pression est la plus forte."
    }
  },
  outdoor_wind_und_boden: {
    titel: "Vent et surface",
    schwerpunkt: "S'adapter dehors au vent et à la surface",
    beschreibung: "Une séance en plein air pour le jeu dehors : adapter le jeu de jambes au sol changeant, lire et exploiter le vent — et appliquer le contrôle de la longueur qui, dehors, décide entre gagner et perdre.",
    hinweise: {
      schnelle_fuesse: "Réveiller le jeu de jambes — particulièrement important dehors, parce que le sol change la poussée.",
      verschiedene_boeden: "D'abord lire la surface et adapter le jeu de jambes au sable, au gazon, à la terre battue ou au gazon synthétique.",
      wind_lesen_nutzen: "Ensuite intégrer le vent : adapter la puissance et la longueur à la direction du vent, viser contre la dérive.",
      laenge_tiefe: "Application : employer le contrôle de la longueur de façon ciblée — dehors, sous l'influence du vent, il est la clé."
    }
  },
  doppel_beginner_zusammenspiel: {
    titel: "Premier jeu collectif en double",
    schwerpunkt: "Servir en paire, attribuer la balle, laisser de la place",
    beschreibung: "La première séance de double pour paires débutantes : le service dans un ordre simple, l'attribution claire de la balle par l'appel et le fait de se laisser mutuellement de la place — les trois fondements d'un jeu collectif sûr.",
    hinweise: {
      schnelle_fuesse: "Réveiller le jeu de jambes — en double, la base pour s'esquiver rapidement l'un l'autre.",
      aufschlag_im_doppel_einfach: "D'abord le service en double dans un ordre simple et fixe — c'est ainsi que vous entrez proprement dans le jeu.",
      wer_nimmt_den_ball: "Ensuite l'accord de base le plus important : attribuer la balle tôt et clairement à l'un des deux.",
      einander_platz_lassen: "Application : se déplacer en relation l'un avec l'autre et se laisser volontairement de la place — à la corde invisible."
    }
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
  const lineStart = s.lastIndexOf('\n', pos) + 1;
  const indent = s.slice(lineStart, pos); // Whitespace vor "en"
  const insertion = `,\n${indent}"fr": ${JSON.stringify(frValue)}`;
  const insertAt = pos + needle.length;
  s = s.slice(0, insertAt) + insertion + s.slice(insertAt);
  cursor = insertAt + insertion.length;
  n++;
}

for (const unit of daten.trainingseinheiten) {
  const fr = FR[unit.id];
  if (!fr) { console.error('fehlende Einheit:', unit.id); process.exit(1); }
  insertAfterEn(unit.titel.en, fr.titel, unit.id + '.titel');
  insertAfterEn(unit.schwerpunkt.en, fr.schwerpunkt, unit.id + '.schwerpunkt');
  insertAfterEn(unit.beschreibung.en, fr.beschreibung, unit.id + '.beschreibung');
  for (const phase of ['erwaermung', 'hauptteil', 'ausklang']) {
    for (const ref of unit.phasen[phase] || []) {
      insertAfterEn(ref.hinweis.en, fr.hinweise[ref.baustein], `${unit.id}.${phase}.${ref.baustein}`);
    }
  }
}

JSON.parse(s);
writeFileSync(pfad, s);

// de/en-Byte-Identität + fr-Formtreue prüfen
const neu = JSON.parse(readFileSync(pfad, 'utf8'));
const alt = JSON.parse(execSync(`git show HEAD:${pfad}`).toString());
let de = 0, en = 0, fr = 0; const diffs = [];
const walk = (a, o, p) => {
  if (a && typeof a === 'object' && !Array.isArray(a)) {
    if ('de' in a) { de++; if (JSON.stringify(a.de) !== JSON.stringify(o?.de)) diffs.push('de≠' + p); }
    if ('en' in a) { en++; if (JSON.stringify(a.en) !== JSON.stringify(o?.en)) diffs.push('en≠' + p); }
    if ('fr' in a) { fr++; if (typeof a.fr !== typeof a.de) diffs.push('frForm≠' + p); }
    for (const k of Object.keys(a)) walk(a[k], o?.[k], p + '.' + k);
  } else if (Array.isArray(a)) a.forEach((x, i) => walk(x, o?.[i], p + '[' + i + ']'));
};
walk(neu, alt, '');
const deEn = diffs.filter((d) => d.startsWith('de') || d.startsWith('en'));
console.log(`${pfad}: Einfügungen ${n} | de:${de} en:${en} fr:${fr} | de/en≠HEAD: ${deEn.length ? deEn.join(';') : 'KEINE'} | fr-Form: ${diffs.filter((d) => d.startsWith('fr')).length ? diffs.filter((d) => d.startsWith('fr')).join(';') : 'OK'}`);
if (deEn.length || fr !== de) { console.error('ABBRUCH: Integritätsfehler'); process.exit(1); }
