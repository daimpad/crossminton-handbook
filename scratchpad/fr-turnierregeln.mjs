// Dedizierter fr-Einfüger für data/turnierregeln.json (letzter Content-Ring):
// ANDERS als sonst werden auch die _meta-Knoten mitübersetzt, weil sie echte
// text()-gerenderte {de,en}-Zwillinge sind. Viele identische de-Texte über
// Stufen — daher de→fr-Wörterbuch (gleiches de → gleiches fr) plus
// cursor-basierter Dokument-Walker (inline-fügend, dupe-sicher). _meta.dokumente
// pfad/stufe/id etc. bleiben (keine {de,en}-Knoten). de/en byte-identisch.
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const pfad = 'data/turnierregeln.json';

const MAP = {
  "Turnier-Regularium": "Règlement de tournoi",
  "Wähle die Kategorie deines Turniers. Die Liste zeigt, woran ein offizielles Turnier gebunden ist — und hebt hervor, was mit jeder Stufe neu dazukommt oder strenger wird.": "Choisis la catégorie de ton tournoi. La liste montre ce à quoi un tournoi officiel est tenu — et met en évidence ce qui s'ajoute ou se renforce à chaque niveau.",
  "ICO Tournament Regulations (Fassung 2024/dec) + ICO Tournament Standards je Kategorie · International Crossminton Organisation (ICO) / Deutscher Crossminton Verband (DCV)": "ICO Tournament Regulations (version 2024/dec) + ICO Tournament Standards par catégorie · International Crossminton Organisation (ICO) / Deutscher Crossminton Verband (DCV)",
  "ICO-Fassung 2024/dec": "Version ICO 2024/dec",
  "Auszug der wichtigsten Anforderungen zur schnellen Orientierung. Der allgemeine Rahmen (Aufbau, Modus, Offizielle, Spielerkleidung) folgt der ICO Tournament Regulations 2024/dec; die stufenspezifischen Zahlen (Mindest-Teilnehmer, Kategorien, Felder, Fristen, Gebühren) stehen in den separaten ICO-Tournament-Standards je Kategorie. Verbindlich ist stets das vollständige offizielle Regelwerk — im Zweifel dort prüfen.": "Extrait des exigences les plus importantes pour une orientation rapide. Le cadre général (organisation, mode, officiels, tenue des joueurs) suit les ICO Tournament Regulations 2024/dec ; les chiffres spécifiques à chaque niveau (participants minimum, catégories, terrains, délais, frais) figurent dans les ICO Tournament Standards séparés, par catégorie. Le règlement officiel complet fait toujours foi — en cas de doute, s'y référer.",
  "ICO Tournament Regulations (2024/dec)": "ICO Tournament Regulations (2024/dec)",
  "Allgemeines Regelwerk: Aufbau, Turniermodus, Offizielle, Spielerkleidung.": "Règlement général : organisation, mode de tournoi, officiels, tenue des joueurs.",
  "ICO-Turnierstandards (Original-PDFs)": "Standards de tournoi ICO (PDF originaux)",
  "100/250/500/1000 Punkte inkl. Doppel-, Junior- und Fun-Varianten.": "100/250/500/1000 points, y compris les variantes double, junior et fun.",
  "DCV-Spielordnung": "Règlement des compétitions du DCV",
  "DCV-Schiedsrichterordnung": "Règlement d'arbitrage du DCV",
  "DCV-Spielregeln Crossminton": "Règles de jeu Crossminton du DCV",
  "Fun": "Fun",
  "Lokal / Fun": "Local / Fun",
  "ohne Wertung": "sans classement",
  "Lockeres Turnier ohne ICO-Sanktionierung — es gelten die Spielregeln, sonst keine Auflagen.": "Tournoi décontracté sans sanction de l'ICO — les règles de jeu s'appliquent, mais aucune autre exigence.",
  "100er": "100",
  "National Series": "National Series",
  "100 Punkte": "100 points",
  "Einstiegs-Ranglistenturnier auf nationaler Ebene.": "Tournoi de classement d'entrée au niveau national.",
  "250er": "250",
  "International Series": "International Series",
  "250 Punkte": "250 points",
  "Internationales Ranglistenturnier.": "Tournoi de classement international.",
  "500er": "500",
  "World Series": "World Series",
  "500 Punkte": "500 points",
  "Großes Weltranglisten-Turnier.": "Grand tournoi du classement mondial.",
  "1000er": "1000",
  "1000 Punkte": "1000 points",
  "Höchste Kategorie mit den strengsten Auflagen.": "Catégorie la plus élevée, avec les exigences les plus strictes.",
  "Anmeldung & Organisation": "Inscription et organisation",
  "Teilnehmer & Auslosung": "Participants et tirage au sort",
  "Anlage & Ausrüstung": "Site et équipement",
  "Ablauf & Schiedsgericht": "Déroulement et arbitrage",
  "Nach dem Turnier": "Après le tournoi",
  "Regelwerk": "Règlement",
  "Es gelten die offiziellen ICO-Spielregeln (Feld, Zählweise, Aufschlag).": "Les règles de jeu officielles de l'ICO s'appliquent (terrain, comptage, service).",
  "Durchführung nach ICO-Turnierordnung, ICO-Spielregeln und ICO-Schiedsrichterordnung.": "Déroulement selon le règlement de tournoi de l'ICO, les règles de jeu de l'ICO et le règlement d'arbitrage de l'ICO.",
  "Spieler-Lizenz": "Licence du joueur",
  "Keine ICO-Lizenz nötig, aber ein Spielerprofil in der Tournament Software (durch den nationalen Administrator).": "Aucune licence ICO nécessaire, mais un profil de joueur dans le Tournament Software (via l'administrateur national).",
  "Gültige ICO-Lizenz für alle Spieler:innen.": "Licence ICO valide pour tous les joueurs et joueuses.",
  "Turnier-Antrag & Kalender": "Demande de tournoi et calendrier",
  "Anmeldung in der Tournament Software, 1 Monat vorher.": "Inscription dans le Tournament Software, 1 mois à l'avance.",
  "Termin 1 Monat vorher bei der ICO; danach offizielle Ankündigung in der Tournament Software.": "Date communiquée à l'ICO 1 mois à l'avance ; ensuite annonce officielle dans le Tournament Software.",
  "Termin bis zum Vorjahres-Stichtag (23.11.); Kalenderfreigabe durch das ICO-Board; Ankündigung 3 Monate vorher.": "Date au plus tard à la date limite de l'année précédente (23 novembre) ; validation du calendrier par le conseil de l'ICO ; annonce 3 mois à l'avance.",
  "Meldeschluss der Spieler": "Clôture des inscriptions des joueurs",
  "Mindestens 7 Tage vor Turnierbeginn.": "Au moins 7 jours avant le début du tournoi.",
  "Mindestens 14 Tage vor Turnierbeginn.": "Au moins 14 jours avant le début du tournoi.",
  "Organisation": "Organisation",
  "1 benannter Organisator.": "1 organisateur désigné.",
  "1 Vollzeit-Organisator (Empfehlung: spielt nicht selbst mit).": "1 organisateur à plein temps (recommandation : ne joue pas lui-même).",
  "1 Vollzeit-Organisator, der nicht selbst mitspielen darf.": "1 organisateur à plein temps, qui n'a pas le droit de jouer lui-même.",
  "Unabhängiger Beobachter": "Observateur indépendant",
  "Mindestens 1 unabhängiger Beobachter; ICO-Sponsoring nach erreichtem Standard-Prozentsatz.": "Au moins 1 observateur indépendant ; parrainage de l'ICO selon le pourcentage de standard atteint.",
  "Mindestens 1 unabhängiger Beobachter; Standards werden vom ICO-Board abgenommen.": "Au moins 1 observateur indépendant ; les standards sont validés par le conseil de l'ICO.",
  "Kategorien (für die Wertung)": "Catégories (pour le classement)",
  "Mindestens 2 Einzel-Kategorien; je mind. 4 gemeldete Spieler:innen.": "Au moins 2 catégories de simple ; au moins 4 joueurs et joueuses inscrits chacune.",
  "Mindestens 4 Einzel-Kategorien (Damen und Open verpflichtend); je mind. 4 Spieler:innen.": "Au moins 4 catégories de simple (Dames et Open obligatoires) ; au moins 4 joueurs et joueuses chacune.",
  "Mindestens 6 Einzel-Kategorien (Damen und Open verpflichtend); je mind. 4 Spieler:innen.": "Au moins 6 catégories de simple (Dames et Open obligatoires) ; au moins 4 joueurs et joueuses chacune.",
  "Mindestens 6 Kategorien (Erwachsene, Junioren, Senioren); je mind. 8 Spieler:innen.": "Au moins 6 catégories (adultes, juniors, seniors) ; au moins 8 joueurs et joueuses chacune.",
  "Mindest-Teilnehmerzahl": "Nombre minimum de participants",
  "Mindestens 10 Spieler:innen.": "Au moins 10 joueurs et joueuses.",
  "Mindestens 25 Spieler:innen.": "Au moins 25 joueurs et joueuses.",
  "Mindestens 50 Spieler:innen.": "Au moins 50 joueurs et joueuses.",
  "Mindestens 80 Spieler:innen.": "Au moins 80 joueurs et joueuses.",
  "Mindest-Kapazität der Halle": "Capacité minimale de la salle",
  "Für mindestens 10 Spieler:innen.": "Pour au moins 10 joueurs et joueuses.",
  "Für mindestens 50 Spieler:innen (Feld darf begrenzt werden, nicht darunter).": "Pour au moins 50 joueurs et joueuses (le nombre d'inscrits peut être limité, pas en dessous).",
  "Für mindestens 80 Spieler:innen (Feld darf begrenzt werden, nicht darunter).": "Pour au moins 80 joueurs et joueuses (le nombre d'inscrits peut être limité, pas en dessous).",
  "Für mindestens 120 Spieler:innen; die Teilnehmerzahl darf nicht begrenzt werden.": "Pour au moins 120 joueurs et joueuses ; le nombre de participants ne peut pas être limité.",
  "Auslosung & Setzung": "Tirage au sort et têtes de série",
  "Setzung nach ICO-Rangliste; Auslosung im Tournament Planner, .tp-Datei vorab zur Prüfung an die ICO.": "Têtes de série selon le classement ICO ; tirage dans le Tournament Planner, fichier .tp envoyé à l'ICO pour vérification au préalable.",
  "Setzung nach ICO-Rangliste; Auslosung im Tournament Planner, .tp-Datei mind. 3 Tage vorher zur Prüfung an die ICO.": "Têtes de série selon le classement ICO ; tirage dans le Tournament Planner, fichier .tp envoyé à l'ICO pour vérification au moins 3 jours à l'avance.",
  "Setzung nach ICO-Rangliste; Auslosung im Tournament Planner, .tp-Datei mind. 7 Tage vorher zur Prüfung an die ICO.": "Têtes de série selon le classement ICO ; tirage dans le Tournament Planner, fichier .tp envoyé à l'ICO pour vérification au moins 7 jours à l'avance.",
  "Spielfeld & Markierung": "Terrain et marquage",
  "Feldmaße und Markierung nach Regelwerk.": "Dimensions du terrain et marquage selon le règlement.",
  "Feldmaße und Markierung (Feldnummern, Aufschlaglinie …) nach ICO-Standard.": "Dimensions du terrain et marquage (numéros de terrain, ligne de service …) selon le standard ICO.",
  "Hallenhöhe": "Hauteur de la salle",
  "Halle mindestens 7 m hoch (über allen Feldern); Ausnahmen nur mit ICO-Genehmigung.": "Salle d'au moins 7 m de hauteur (au-dessus de tous les terrains) ; exceptions uniquement avec l'autorisation de l'ICO.",
  "Anzahl Spielfelder": "Nombre de terrains",
  "Mindestens 4 Felder.": "Au moins 4 terrains.",
  "Mindestens 6 Felder.": "Au moins 6 terrains.",
  "Mindestens 8 Felder.": "Au moins 8 terrains.",
  "Lage zum Flughafen": "Distance à l'aéroport",
  "Höchstens 100 km zu einem internationalen Flughafen.": "Au plus 100 km d'un aéroport international.",
  "Anzeigetafeln": "Tableaux d'affichage",
  "Eine Anzeigetafel pro Feld.": "Un tableau d'affichage par terrain.",
  "Center Court": "Center court",
  "Gestalteter, gebrandeter Center Court empfohlen.": "Un center court aménagé et floqué est recommandé.",
  "Eigens gebrandeter, gestalteter Center Court (alle ICO-Sponsoren).": "Center court spécialement floqué et aménagé (tous les sponsors de l'ICO).",
  "Medizinische Versorgung": "Soins médicaux",
  "Erste-Hilfe-Material bereithalten.": "Garder du matériel de premiers secours à disposition.",
  "Medizinische Versorgung durch den Veranstalter; Sanitäranlagen nötig.": "Soins médicaux assurés par l'organisateur ; installations sanitaires nécessaires.",
  "Oberschiedsrichter (Head Umpire)": "Arbitre en chef (Head Umpire)",
  "1 lizenzierter Head Umpire (Empfehlung: spielt nicht selbst mit).": "1 Head Umpire licencié (recommandation : ne joue pas lui-même).",
  "Match- & Linienrichter": "Arbitres de match et de ligne",
  "Match- & Linienrichter in den Finals aller Kategorien.": "Arbitres de match et de ligne dans les finales de toutes les catégories.",
  "Match- & Linienrichter ab dem Halbfinale aller Kategorien.": "Arbitres de match et de ligne à partir des demi-finales de toutes les catégories.",
  "Match- & Linienrichter ab dem Halbfinale aller Kategorien (Match-Umpire lizenziert oder erfahren).": "Arbitres de match et de ligne à partir des demi-finales de toutes les catégories (arbitre de match licencié ou expérimenté).",
  "Spielerkleidung (Name & Land)": "Tenue des joueurs (nom et pays)",
  "Oberteil mit Name und Land (oder Länderkürzel) auf dem Rücken — ab dem Halbfinale (International Series).": "Haut avec le nom et le pays (ou le code pays) dans le dos — à partir des demi-finales (International Series).",
  "Oberteil (T-Shirt) mit Name und Land (oder Länderkürzel) auf dem Rücken — in allen Spielen (World Series).": "Haut (T-shirt) avec le nom et le pays (ou le code pays) dans le dos — dans tous les matchs (World Series).",
  "Moderation": "Animation",
  "Vollzeit-Moderator empfohlen (nennt die ICO-Sponsoren).": "Un animateur à plein temps est recommandé (nomme les sponsors de l'ICO).",
  "1 Vollzeit-Moderator, der die ICO-Sponsoren ansagt.": "1 animateur à plein temps qui annonce les sponsors de l'ICO.",
  "Live-Stream": "Diffusion en direct",
  "Live-Stream inkl. ICO-Partner-Werbung empfohlen.": "Diffusion en direct avec la publicité des partenaires de l'ICO recommandée.",
  "Live-Stream inkl. ICO-Partner-Werbung.": "Diffusion en direct avec la publicité des partenaires de l'ICO.",
  "Siegerehrung": "Remise des prix",
  "Ehrung mit Podium und ICO-/Sponsor-Werbung; Urkunden/Medaillen für die Plätze 1–3 empfohlen.": "Cérémonie avec podium et publicité ICO/sponsor ; diplômes/médailles pour les places 1 à 3 recommandés.",
  "Ehrung mit Podium, Ansager; Urkunden und Medaillen/Pokale für die Plätze 1–3.": "Cérémonie avec podium et annonceur ; diplômes et médailles/coupes pour les places 1 à 3.",
  "Ehrung mit Podium, Ansager, Nationalhymne der Sieger; Urkunden und Medaillen/Pokale.": "Cérémonie avec podium, annonceur et hymne national des vainqueurs ; diplômes et médailles/coupes.",
  "Preisgeld": "Dotation",
  "Preisgeld für Sieger und Finalist der Damen- und der Open-Einzelkonkurrenz.": "Dotation pour le vainqueur et le finaliste des divisions de simple Dames et Open.",
  "Spielergebühr": "Frais par joueur",
  "2,50 € je Spieler:in an die ICO (nach dem Turnier verrechnet).": "2,50 € par joueur ou joueuse à l'ICO (facturé après le tournoi).",
  "Ergebnisse & Turnierbericht": "Résultats et rapport de tournoi",
  "Ergebnisse über den Tournament Planner veröffentlichen.": "Publier les résultats via le Tournament Planner.",
  "Offiziellen ICO-Turnierbericht (mit Fotos) 1 Tag nach dem Turnier senden.": "Envoyer le rapport de tournoi officiel de l'ICO (avec photos) 1 jour après le tournoi.",
  "Doppel": "Double",
  "Es werden Doppel-Kategorien ausgespielt (mind. 4 Kategorien; Open-, Damen- oder Mixed-Doppel verpflichtend), je mind. 4 Paare.": "Des catégories de double sont disputées (au moins 4 catégories ; double Open, Dames ou Mixte obligatoire), au moins 4 paires chacune.",
  "Mindestens 30 Spieler:innen und Hallen-Kapazität für 30 (statt 25 bzw. 50).": "Au moins 30 joueurs et joueuses et une capacité de salle pour 30 (au lieu de 25 ou 50).",
  "Anders als im Einzel darf im Doppel die Gruppenphase entfallen — reines K.-o. ist zulässig (Entscheidung spätestens direkt nach dem Meldeschluss).": "Contrairement au simple, la phase de poules peut être supprimée en double — un tableau à élimination directe pur est autorisé (décision au plus tard juste après la clôture des inscriptions).",
  "Es werden Doppel-Kategorien ausgespielt, je mind. 4 Paare.": "Des catégories de double sont disputées, au moins 4 paires chacune.",
  "Hallen-Kapazität für mindestens 50 (statt 80).": "Capacité de salle pour au moins 50 (au lieu de 80).",
  "Junior": "Junior",
  "Junioren-Kategorien (U12/U14/U18 …); U12 und U14 werden zusammengelegt.": "Catégories juniors (U12/U14/U18 …) ; U12 et U14 sont regroupées.",
  "Mindestens 4 Einzel-Kategorien und mindestens 4 Felder (statt 6/6).": "Au moins 4 catégories de simple et au moins 4 terrains (au lieu de 6/6).",
  "Mindestens 30 Spieler:innen und Kapazität für 30 (statt 50/80).": "Au moins 30 joueurs et joueuses et une capacité pour 30 (au lieu de 50/80).",
  "Antrag 3 Monate vorher; Junioren sollen nicht als Match-/Linienrichter eingesetzt werden.": "Demande 3 mois à l'avance ; les juniors ne devraient pas être utilisés comme arbitres de match ou de ligne.",
  "Kein Preisgeld und keine Spielergebühr; Sachpreise für die Podestplätze empfohlen.": "Pas de dotation ni de frais par joueur ; des prix en nature pour les places du podium sont recommandés."
};

const daten = JSON.parse(readFileSync(pfad, 'utf8'));
let s = readFileSync(pfad, 'utf8');
let cursor = 0, n = 0;

function insertAfterEn(deValue, enValue, wo) {
  const frValue = MAP[deValue];
  if (frValue == null) { console.error('fehlende fr für de:', JSON.stringify(deValue), '@', wo); process.exit(1); }
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

// Dokument-Walker in exakter Datei-Reihenfolge
function walk(a, p) {
  if (a && typeof a === 'object' && !Array.isArray(a)) {
    if ('de' in a && 'en' in a) { insertAfterEn(a.de, a.en, p); return; }
    for (const k of Object.keys(a)) walk(a[k], p + '.' + k);
  } else if (Array.isArray(a)) a.forEach((x, i) => walk(x, p + '[' + i + ']'));
}
walk(daten, '');

JSON.parse(s);
writeFileSync(pfad, s);

// de/en-Byte-Identität + fr-Formtreue prüfen
const neu = JSON.parse(readFileSync(pfad, 'utf8'));
const alt = JSON.parse(execSync(`git show HEAD:${pfad}`).toString());
let de = 0, en = 0, fr = 0; const diffs = [];
const chk = (x, o, p) => {
  if (x && typeof x === 'object' && !Array.isArray(x)) {
    if ('de' in x && 'en' in x) {
      de++; if (JSON.stringify(x.de) !== JSON.stringify(o?.de)) diffs.push('de≠' + p);
      en++; if (JSON.stringify(x.en) !== JSON.stringify(o?.en)) diffs.push('en≠' + p);
      if ('fr' in x) { fr++; if (typeof x.fr !== typeof x.de) diffs.push('frForm≠' + p); }
    }
    for (const k of Object.keys(x)) chk(x[k], o?.[k], p + '.' + k);
  } else if (Array.isArray(x)) x.forEach((y, i) => chk(y, o?.[i], p + '[' + i + ']'));
};
chk(neu, alt, '');
const deEn = diffs.filter((d) => d.startsWith('de') || d.startsWith('en'));
console.log(`${pfad}: Einfügungen ${n} | de:${de} en:${en} fr:${fr} | de/en≠HEAD: ${deEn.length ? deEn.join(';') : 'KEINE'} | fr-Form: ${diffs.filter((d) => d.startsWith('fr')).length ? diffs.filter((d) => d.startsWith('fr')).join(';') : 'OK'}`);
if (deEn.length || fr !== de) { console.error('ABBRUCH: Integritätsfehler'); process.exit(1); }
