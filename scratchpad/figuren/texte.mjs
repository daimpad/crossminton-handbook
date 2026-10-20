// texte.mjs — alle sichtbaren und vorgelesenen Texte der generierten Grafiken, je Sprache.
// Maßgeblich für die Personengrafiken ist allein diese Datei (nicht mehr gen-en/fr/pl.mjs).
// Terminologie nach docs/glossar-*.md und dem übersetzten Bausteinbestand.
// Je Grafik: aria (vorgelesen), cap (Caption unten), dazu benannte Zusatztexte im Bild.

export const SPRACHEN = ['de', 'en', 'fr', 'pl'];

export const TEXTE = {
  'G-001': {
    de: { aria: 'Der Universalgriff: die rechte Hand hält den Griff locker wie zum Handschlag, die Schlagfläche steht hochkant, und zwischen Daumen und Zeigefinger liegt ein V auf der oberen Kante des Griffs.', cap: 'locker wie ein Handschlag · V oben', v: 'V' },
    en: { aria: 'The universal grip: the right hand holds the handle loosely, as if shaking hands, the racket face stands on edge, and a V forms between thumb and index finger on the top edge of the handle.', cap: 'loose like a handshake · V on top', v: 'V' },
    fr: { aria: 'La prise universelle : la main droite tient le manche souplement, comme pour une poignée de main, le cadre est sur la tranche, et un V se forme entre le pouce et l\'index sur l\'arête supérieure du manche.', cap: 'comme une poignée de main · V en haut', v: 'V' },
    pl: { aria: 'Chwyt uniwersalny: prawa dłoń trzyma rączkę luźno jak przy uścisku dłoni, główka rakiety stoi na krawędzi, a między kciukiem a palcem wskazującym tworzy się V na górnej krawędzi rączki.', cap: 'luźno jak uścisk dłoni · V kciuka u góry', v: 'V' },
  },
  'G-002': {
    de: { aria: 'Die Grundposition: Füße etwas mehr als schulterbreit, Knie gebeugt, Gewicht auf den Fußballen, Schläger locker vor dem Körper.', cap: 'Knie gebeugt · Gewicht auf den Fußballen' },
    en: { aria: 'The ready position: feet a little more than shoulder-width apart, knees bent, weight on the balls of the feet, racket held loosely in front of the body.', cap: 'knees bent · weight on the balls of the feet' },
    fr: { aria: 'La position de base : pieds un peu plus larges que les épaules, genoux fléchis, poids sur l\'avant des pieds, raquette tenue de façon lâche devant le corps.', cap: 'genoux fléchis · poids sur l\'avant des pieds' },
    pl: { aria: 'Pozycja podstawowa: stopy nieco szerzej niż na szerokość barków, kolana ugięte, ciężar na przodostopiu, rakieta luźno przed ciałem.', cap: 'kolana ugięte · ciężar na przodostopiu' },
  },
  'G-004': {
    de: { aria: 'Die Rückhand: Gewicht auf dem schlägerseitigen Fuß, Oberkörper öffnet zur Schlagrichtung, der Schläger wird eng am Körper vorbei nach vorn geführt.', cap: 'eng am Körper vorbei · Treffpunkt vorn' },
    en: { aria: 'The backhand: weight on the racket-side foot, torso opening to the hitting direction, the racket guided close past the body and meeting the speeder in front.', cap: 'close past the body · contact in front' },
    fr: { aria: 'Le revers : poids sur le pied côté raquette, le buste s\'ouvre vers la direction de frappe, la raquette passe tout près du corps vers l\'avant.', cap: 'tout près du corps · frappe devant' },
    pl: { aria: 'Bekhend: ciężar na stopie po stronie rakiety, tułów otwiera się w kierunku uderzenia, rakieta prowadzona blisko ciała do przodu.', cap: 'blisko ciała · punkt kontaktu z przodu' },
  },
  'G-007': {
    de: { aria: 'Beinarbeit, Bild 1: der Split-Step in der Landung nach einem kleinen, federnden Hüpfer. Beide Fußballen setzen gleichzeitig auf, die Fersen bleiben oben, die Knie sind tief gebeugt. Winkel am Boden zeigen: aus dieser Landung geht es in jede Richtung.', cap: 'kleiner federnder Hüpfer · auf die Ballen' },
    en: { aria: 'Footwork, image 1: the split-step, landing after a small, springy hop. Both balls of the feet touch down at the same time, the heels stay up, the knees are deeply bent. Chevrons on the ground show that from this landing you can go in any direction.', cap: 'a small springy hop · onto the balls' },
    fr: { aria: 'Jeu de jambes, image 1 : le split-step, à la réception d\'un petit saut élastique. L\'avant des deux pieds se pose en même temps, les talons restent levés, les genoux sont bien fléchis. Des chevrons au sol montrent que de cette réception on part dans toutes les directions.', cap: 'petit saut élastique · sur l\'avant des pieds' },
    pl: { aria: 'Praca nóg, obraz 1: split-step w chwili lądowania po małym, sprężystym podskoku. Przodostopia obu stóp dotykają podłoża jednocześnie, pięty zostają w górze, kolana są mocno ugięte. Znaki na podłożu pokazują, że z tego lądowania ruszasz w każdym kierunku.', cap: 'mały sprężysty podskok · na przodostopie' },
  },
  'G-008': {
    de: { aria: 'Beinarbeit, Bild 2: der Bewegungskreislauf — mit einem Ausfallschritt in die Ecke den Speeder spielen und auf gebogenem Weg zurück zur zentralen Position in der Mitte.', cap: 'zur Ecke ausfallen — zurück zur Mitte' },
    en: { aria: 'Footwork, image 2: the movement cycle — lunge into the corner to play the speeder and return on a curved path to the central position in the middle.', cap: 'lunge to the corner — back to the middle' },
    fr: { aria: 'Jeu de jambes, image 2 : le cycle de déplacement — une fente vers le coin pour jouer le speeder, puis un retour en courbe vers la position centrale au milieu.', cap: 'fente vers le coin — retour au centre' },
    pl: { aria: 'Praca nóg, obraz 2: cykl ruchu — wykrokiem w róg zagrać speedera i łukiem wrócić do pozycji centralnej na środku.', cap: 'wykrok w róg — powrót do środka' },
  },
  'G-009': {
    de: { aria: 'Der Handgelenk-Schnapp in Nahaufnahme: blass die Ausholphase mit zurückgelegtem Handgelenk, kräftig der Treffmoment. Der Unterarm hat eingedreht, das Handgelenk ist nach vorn geschnappt, der Speeder fliegt los.', cap: 'spät schnappen · Unterarm dreht ein' },
    en: { aria: 'The wrist snap in close-up: faint, the backswing with the wrist laid back; bold, the moment of contact. The forearm has rotated in, the wrist has snapped forward, and the speeder flies off.', cap: 'snap late · the forearm rotates in' },
    fr: { aria: 'Le coup de poignet en gros plan : en pâle, la préparation, poignet cassé vers l\'arrière ; en plein, l\'impact. L\'avant-bras a pivoté, le poignet a claqué vers l\'avant, et le speeder part.', cap: 'claquer tard · l\'avant-bras pivote' },
    pl: { aria: 'Ruch nadgarstka w zbliżeniu: blado zamach z odchylonym nadgarstkiem, wyraźnie moment uderzenia. Przedramię się wkręciło, nadgarstek strzelił do przodu, a speeder odlatuje.', cap: 'strzał późno · przedramię się wkręca' },
  },
  'G-010': {
    de: { aria: 'Der Überkopf-Clear: seitlich gestellt und ganz gestreckt trifft der Spieler den Speeder am höchsten Punkt, leicht vor dem Körper. Zwei Bahnen verlassen das Bild: der defensive Clear hoch und weit, der offensive Clear flacher und schneller.', cap: 'hoch treffen · weit ins hintere Feld', def: 'defensiv', off: 'offensiv' },
    en: { aria: 'The overhead clear: turned side-on and fully stretched, the player meets the speeder at the highest point, slightly in front of the body. Two trajectories leave the picture: the defensive clear high and far, the offensive clear flatter and faster.', cap: 'hit high · deep into the back court', def: 'defensive', off: 'offensive' },
    fr: { aria: 'Le dégagement : de profil et en pleine extension, le joueur frappe le speeder au point le plus haut, légèrement devant le corps. Deux trajectoires sortent de l\'image : le dégagement défensif, haut et long, le dégagement offensif, plus tendu et plus rapide.', cap: 'frapper haut · loin au fond du terrain', def: 'défensif', off: 'offensif' },
    pl: { aria: 'Clear nad głową: ustawiony bokiem i w pełni wyprostowany gracz trafia speedera w najwyższym punkcie, lekko przed ciałem. Dwa tory wychodzą poza obraz: clear defensywny wysoko i daleko, clear ofensywny płaściej i szybciej.', cap: 'uderz wysoko · daleko w głąb pola', def: 'defensywny', off: 'ofensywny' },
  },
  'G-020': {
    de: { aria: 'Der Sprung-Smash: der Spieler trifft im höchsten Punkt des Sprungs, die Beine in Schrittstellung, und schlägt den Speeder steil nach vorn unten. Blass daneben die weiche Landung auf beiden Ballen, schlagbereit.', cap: 'im Sprung · steil nach unten' },
    en: { aria: 'The jump smash: the player hits at the top of the jump, legs in a scissor position, and drives the speeder steeply forward and down. Faint beside it, the soft landing on the balls of both feet, ready to play on.', cap: 'in the jump · steeply downward' },
    fr: { aria: 'Le smash sauté : le joueur frappe au sommet du saut, jambes en ciseaux, et envoie le speeder raide vers l\'avant et vers le bas. En pâle à côté, la réception souple sur l\'avant des deux pieds, prêt à rejouer.', cap: 'en sautant · raide vers le bas' },
    pl: { aria: 'Smecz z wyskoku: gracz trafia w najwyższym punkcie wyskoku, nogi w nożycach, i bije speedera stromo do przodu w dół. Obok blado miękkie lądowanie na przodostopiu obu stóp, w gotowości do dalszej gry.', cap: 'z wyskoku · stromo w dół' },
  },
  'G-032': {
    de: { aria: 'Schnelle Füße: aus der Landung des Split-Steps in der Feldmitte mit kurzen, schnellen Schritten zu einem Hütchen in der Ecke und zurück zur Mitte. Viele kleine Bodenkontakte statt weniger großer Schritte.', cap: 'schnelle, leichte Füße auf den Ballen' },
    en: { aria: 'Fast feet: from the split-step landing in the middle of the court, short quick steps to a cone in the corner and back to the middle. Many small ground contacts instead of a few big steps.', cap: 'fast, light feet on the balls' },
    fr: { aria: 'Pieds rapides : depuis la réception du split-step au centre du terrain, de petits pas rapides jusqu\'à un plot dans le coin, puis retour au centre. Beaucoup de petits appuis plutôt que quelques grands pas.', cap: 'pieds rapides et légers sur l\'avant' },
    pl: { aria: 'Szybkie stopy: z lądowania po split-stepie na środku pola krótkimi, szybkimi krokami do pachołka w rogu i z powrotem na środek. Wiele małych kontaktów z podłożem zamiast kilku dużych kroków.', cap: 'szybkie, lekkie stopy na przodostopiu' },
  },
  'G-043': {
    de: { aria: 'Verständigung im Paar: zwei Doppelpartner hintereinander im eigenen Feld, beide mit Blick zum Gegner. Der Rückraumspieler ruft „Meiner!“ und nimmt den Speeder, der Angriffsspieler vorn lässt ihn vorbei.', cap: '„Meiner!“ · kurz, laut, eindeutig', ruf: 'Meiner!' },
    en: { aria: 'Communication as a pair: two doubles partners one behind the other in their own court, both facing the opponents. The rear-court player calls “Mine!” and takes the speeder; the attacking player in front lets it pass.', cap: '“Mine!” · short, loud, clear', ruf: 'Mine!' },
    fr: { aria: 'S\'entendre à deux : deux partenaires de double l\'un derrière l\'autre dans leur terrain, tous deux tournés vers l\'adversaire. Le joueur de fond crie « À moi ! » et prend le speeder, le joueur d\'attaque devant le laisse passer.', cap: '« À moi ! » · bref, fort, clair', ruf: 'À moi !' },
    pl: { aria: 'Porozumienie w parze: dwaj partnerzy deblowi jeden za drugim na własnym polu, obaj zwróceni do przeciwnika. Gracz tylny woła „Moja!” i bierze speedera, gracz atakujący z przodu go przepuszcza.', cap: '„Moja!” · krótko, głośno, jasno', ruf: 'Moja!' },
  },
  'G-053': {
    de: { aria: 'Blindes Verständnis: zwei Doppelpartner hintereinander, beide mit Blick nach vorn zum Speeder. Der Angriffsspieler startet zum kurzen Ball, und im selben Augenblick rückt der Rückraumspieler in die frei werdende Mitte nach, ohne hinzusehen.', cap: 'blindes Verständnis · ohne hinzusehen' },
    en: { aria: 'Blind understanding: two doubles partners one behind the other, both looking ahead at the speeder. The attacking player goes for the short ball, and at the same moment the rear-court player moves up into the space it leaves, without looking.', cap: 'blind understanding · without looking' },
    fr: { aria: 'Entente aveugle : deux partenaires de double l\'un derrière l\'autre, tous deux le regard vers le speeder. Le joueur d\'attaque part sur la balle courte, et au même instant le joueur de fond monte dans l\'espace libéré, sans regarder.', cap: 'entente aveugle · sans se regarder' },
    pl: { aria: 'Ślepe porozumienie: dwaj partnerzy deblowi jeden za drugim, obaj patrzą przed siebie na speedera. Gracz atakujący rusza do krótkiej piłki, a w tej samej chwili gracz tylny wchodzi w zwolnione miejsce, bez patrzenia.', cap: 'ślepe porozumienie · bez patrzenia' },
  },
};
