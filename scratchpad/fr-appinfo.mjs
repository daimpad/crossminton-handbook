// Fügt fr-Zwillinge in data/app-info.json ein: nach jedem exakten "en": "<wert>"
// wird ", "fr": "<übersetzung>"" eingeschoben. de/en bleiben byte-identisch.
// Selbstprüfend: jeder Bedarf muss genau einmal matchen.
import { readFileSync, writeFileSync } from 'node:fs';

const M = [
  ['About this app', 'À propos de cette app'],
  ['This app is a scientifically grounded learning tool for Crossminton. It teaches the game in small, building modules — from your first strokes to fine-tuning at expert level.',
   "Cette app est un outil d'apprentissage du Crossminton à base scientifique. Elle transmet le jeu par petits modules progressifs — des premières frappes à la finition au niveau expert."],
  ["You choose your own way through the material: by skill level, by personal goal, by topic or as a guided training session. If you come from another racket sport, you get targeted notes on where familiar movements differ in Crossminton. There's also a dedicated doubles topic and a Rules tab with the official rules of play.",
   "Tu choisis ton propre chemin dans la matière : par niveau, par objectif personnel, par thème ou comme séance guidée. Si tu viens d'un autre sport de raquette, tu reçois des repères ciblés là où les gestes habituels diffèrent au Crossminton. Il y a aussi un thème double dédié et un onglet Règles avec les règles officielles du jeu."],
  ['The content is kept factual and rests on established fundamentals from training theory and sports science. The app aims to guide you toward practicing on your own, not to keep you busy.',
   "Les contenus sont factuels et s'appuient sur des fondements établis de la théorie de l'entraînement et des sciences du sport. L'app veut te guider vers une pratique autonome, pas t'occuper en permanence."],
  ['Thanks and sources', 'Remerciements et sources'],
  ['The rules of play are taken from the official Crossminton rules of the International Crossminton Organisation (ICO), represented in Germany by the Deutscher Crossminton Verband (DCV); the rendering is reconciled with the ICO version 2024/dec.',
   "Les règles du jeu proviennent des règles officielles du Crossminton de l'International Crossminton Organisation (ICO), représentée en Allemagne par le Deutscher Crossminton Verband (DCV) ; la reproduction est alignée sur la version ICO 2024/déc."],
  ['The subject-matter fundamentals draw on literature and materials from Crossminton, training science and sport psychology, as well as transfer experience from related racket sports.',
   "Les fondements techniques s'appuient sur la littérature et des supports issus du Crossminton, des sciences de l'entraînement et de la psychologie du sport, ainsi que sur des expériences de transfert depuis des sports de raquette apparentés."],
  ['The following people contributed to the content: XXX. Thanks to everyone who helped test and improve it.',
   'Les personnes suivantes ont contribué au contenu : XXX. Merci à toutes celles et ceux qui ont aidé à tester et à améliorer.'],
  ['License and credits', 'Licence et crédits'],
  ['Software license: MIT License.', 'Licence logicielle : MIT License.'],
  ['Content and text: CC BY 4.0.', 'Contenus et textes : CC BY 4.0.'],
  ['Credits: Damian Paderta.', 'Crédits : Damian Paderta.'],
  ['The rules of play remain the property of the ICO/DCV and are reproduced here for learning purposes.',
   "Les règles du jeu restent la propriété de l'ICO/DCV et sont reproduites ici à des fins d'apprentissage."],
  ['Source code and contributions: see GitHub', 'Code source et contributions : voir GitHub'],
  ['Contribute', 'Participer'],
  ["This app is an open project and thrives on contributions. You don't have to be a pro — even pointing out a mistake or an unclear wording helps.",
   "Cette app est un projet ouvert qui vit des contributions. Pas besoin d'être un pro — signaler une erreur ou une formulation peu claire aide déjà."],
  ['Report mistakes or suggest improvements', 'Signaler des erreurs ou proposer des améliorations'],
  ['Spotted a factual error, a typo or a confusing explanation? Have an idea for how a module could be better? Report it via the Issues on GitHub — short and informal is fine.',
   'Tu as repéré une erreur factuelle, une faute de frappe ou une explication ambiguë ? Tu as une idée pour améliorer un module ? Signale-le via les Issues sur GitHub — bref et informel suffit.'],
  ['Report a mistake or idea', 'Signaler une erreur ou une idée'],
  ['Help with translation', 'Aider à la traduction'],
  ["The app is built for multiple languages. If you're fluent in one of the target languages, you can help translate and review the content. The language files live under data/labels/ — every language brings the app closer to more players.",
   "L'app est conçue pour le multilinguisme. Si tu maîtrises bien l'une des langues cibles, tu peux aider à traduire et à relire les contenus. Les fichiers de langue se trouvent sous data/labels/ — chaque langue rapproche l'app de plus de joueuses et joueurs."],
  ['Contribute a translation', 'Contribuer à la traduction'],
  ['Contribute code', 'Contribuer au code'],
  ['Enjoy coding? Improvements to the app itself are welcome. Fork the project, make your change and send a pull request on GitHub.',
   "Tu aimes développer ? Les améliorations de l'app elle-même sont bienvenues. Forke le projet, intègre ta modification et envoie une pull request sur GitHub."],
  ['Contribute on GitHub', 'Contribuer sur GitHub'],
  ['Comment right on the page', 'Commenter directement sur la page'],
  ['The quickest way to give feedback is right here in the app: highlight a passage, add your comment, and send all your feedback at the end together as a file or email. Nothing is stored — your notes stay in this session only.',
   "Le plus rapide pour donner un retour, c'est directement ici dans l'app : surligne un passage, ajoute ton commentaire et envoie tous tes retours à la fin, regroupés dans un fichier ou un e-mail. Rien n'est enregistré — tes notes restent uniquement dans cette session."],
  ['Start feedback mode', 'Démarrer le mode retour'],
  ['Feedback mode is running — the round button at the bottom right opens the tools for highlighting, commenting and sending.',
   'Le mode retour est actif — le bouton rond en bas à droite ouvre les outils pour surligner, commenter et envoyer.'],
  ['Legal notice', 'Mentions légales'],
  ['Information pursuant to § 5 TMG / § 18 MStV for non-commercial projects by associations.',
   "Informations conformément au § 5 TMG / § 18 MStV pour les projets non commerciaux d'associations."],
  ['Responsible for the content: Damian Paderta', 'Responsable du contenu : Damian Paderta'],
  ['Contact: contact@nozilla.de', 'Contact : contact@nozilla.de'],
  ['As of: July 2026', 'Mise à jour : juillet 2026'],
  ['Privacy', 'Confidentialité'],
  ['This app runs entirely in your browser. Your learning progress and your details are stored locally only (localStorage) and never transmitted to a server.',
   'Cette app fonctionne entièrement dans ton navigateur. Ta progression et tes informations sont enregistrées uniquement en local (localStorage) et ne sont jamais transmises à un serveur.'],
  ['There is no tracking, no analytics and no sharing with third parties. No cookies are set for advertising or analytics purposes.',
   "Il n'y a aucun suivi, aucune analyse et aucune transmission à des tiers. Aucun cookie n'est déposé à des fins publicitaires ou d'analyse."],
  ['When accessed via GitHub Pages, server logs (including your IP address) are processed by GitHub, Inc. for technical reasons; their privacy policy applies in addition.',
   "Lors de l'accès via GitHub Pages, des journaux serveur (dont l'adresse IP) sont traités pour des raisons techniques par GitHub, Inc. ; leur politique de confidentialité s'applique en complément."],
  ['Controller under the GDPR: Damian Paderta. Contact: contact@nozilla.de',
   'Responsable au sens du RGPD : Damian Paderta. Contact : contact@nozilla.de'],
  ['German', 'Allemand'],
  ['English', 'Anglais'],
  ['French', 'Français'],
  ['Polish', 'Polonais'],
];

let s = readFileSync('data/app-info.json', 'utf8');
for (const [en, fr] of M) {
  const needle = `"en": ${JSON.stringify(en)}`;
  const count = s.split(needle).length - 1;
  if (count !== 1) { console.error(`FEHLER: ${count}× Treffer für en=${JSON.stringify(en).slice(0, 50)}`); process.exit(1); }
  s = s.replace(needle, `${needle}, "fr": ${JSON.stringify(fr)}`);
}
// _meta-Hinweis aktualisieren (inert)
s = s.replace(
  '"Ring 1: englische Inhaltstexte (en-Zwillinge) ergaenzt. fr/pl folgen; leere/fehlende Werte fallen zur Laufzeit auf de zurueck."',
  '"Ring 1: englische UND franzoesische Inhaltstexte (en-/fr-Zwillinge) ergaenzt. pl folgt; leere/fehlende Werte fallen zur Laufzeit auf de zurueck."',
);
JSON.parse(s); // Validitätscheck
writeFileSync('data/app-info.json', s);
console.log(`fr-Zwillinge eingefügt: ${M.length}`);
