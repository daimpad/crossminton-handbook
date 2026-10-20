// Erzeugt die polnischen Zwillinge G-XXX.pl.svg aus G-XXX.svg: ersetzt jedes
// <text> in Dokumentreihenfolge + die aria-label; Geometrie/Tokens byte-identisch
// (Ring-16-Muster). Danach mit render-svg.mjs die .pl.png rendern.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const M = {
  'G-011': { aria: 'Smecz: wysoki punkt kontaktu nad i przed głową, agresywne uderzenie w dół, tor lotu prowadzi stromo i prosto w pole przeciwnika.', texts: ['wysoki kontakt · stromo w dół'] },
  'G-013': { aria: 'Podcięcie: ukośna powierzchnia rakiety muska speedera z boku zamiast trafić go prosto; wygięte linie ruchu pokazują tnący tor i powstającą rotację.', texts: ['powierzchnia muska · podcięcie i rotacja'] },
  'G-014': { aria: 'System pracy nóg: wyrywać się z centralnej bazy w rogi i natychmiast wracać do środka.', texts: ['Baza', 'w róg — powrót do środka'] },
  'G-015': { aria: 'Brać speedera wcześnie: kontakt w najwyższym, najwcześniejszym punkcie wyraźnie przed i nad ciałem; blady niższy punkt kontaktu pokazuje, gdzie trafiłby wolniejszy gracz.', texts: ['wcześnie i wysoko — skradziony czas'] },
  'G-016': { aria: 'Zwód, obraz 1: celowo neutralne, identyczne przygotowanie, które nic nie zdradza — pełny zamach do tyłu, spokojne ciało, żadnego zdecydowanego uderzenia.', texts: ['?', 'to samo przygotowanie — nic nie zdradzić'] },
  'G-017': { aria: 'Zwód, obraz 2: to samo przygotowanie, z którego odgałęziają się dwa różne uderzenia — płaski, szybki drive i krótki, miękki skrót; wybór zapada dopiero w ostatniej chwili.', texts: ['jedno przygotowanie, dwie możliwości'] },
  'G-021': { aria: 'Precyzja przy liniach: speeder ląduje dokładnie na linii narożnej na skrajnym brzegu pola; ciasne strefy celu w rogach i cienka strzałka pokazują umiejscowienie co do punktu z minimalnym marginesem.', texts: ['dokładnie na linię · minimalny margines'] },
  'G-023': { aria: 'Cel gry: zagrać speedera nad strefą neutralną w pole przeciwnika.', texts: ['pole przeciwnika', 'STREFA NEUTRALNA', 'twoje pole'] },
  'G-024': { aria: 'Pozycja centralna: ze środka pola drogi do wszystkich czterech rogów są jednakowo krótkie.', texts: ['Środek', 'jednakowo szybko do każdego rogu'] },
  'G-025': { aria: 'Długość i głębia: zagrać krótką piłkę na przednią linię lub głęboką piłkę na linię końcową.', texts: ['głęboko — na linię końcową', 'krótko — na linię przednią'] },
  'G-026': { aria: 'Bekhend przeciwnika: zagrać speedera celowo w róg bekhendowy przeciwnika.', texts: ['przeciwnik', 'bekhend'] },
  'G-027': { aria: 'Wykorzystać serwis taktycznie: ze strefy serwisu rozgrywać różne punkty celu w polu przeciwnika.', texts: ['strefa serwisu'] },
  'G-028': { aria: 'Budować punkt: ruszać przeciwnika kilkoma uderzeniami z rogu do rogu, aż powstanie otwarcie.', texts: ['1', '2', '3', 'wolne', 'budować punkt → otwarcie'] },
  'G-029': { aria: 'Przygotować smecza: naciskać nisko, zmusić przeciwnika do wysokiej piłki, potem stromo zakończyć.', texts: ['1', 'naciskać nisko', '2', '3', 'nacisk → wysoko → smecz'] },
  'G-030': { aria: 'Typy przeciwników i kontrśrodki: przeciw atakującemu, broniącemu i powolnemu przeciwnikowi po jednej pasującej odpowiedzi.', texts: ['Atakujący', 'zdjąć tempo', 'Broniący', 'z rogu w róg', 'Powolny', 'szerokie kąty'] },
  'G-031': { aria: 'Systematycznie atakować słabość: rozgrywać speedera wciąż w ten sam słaby róg przeciwnika.', texts: ['słabość', 'otwierać'] },
  'G-033': { aria: 'Ruchomość i bark: łagodna mobilizacja barku i tułowia, ramię krąży po wygiętym łuku ruchu nad barkiem, rozluźniona, wyprostowana postawa.', texts: ['łagodne krążenia barku · ruchomość'] },
  'G-034': { aria: 'Eksplozywność i skoczność: z niskiej, naładowanej postawy eksplozywnie odbić się w róg, silna strzałka ruchu z odbijającej nogi ku górze i przodowi.', texts: ['eksplozywne odbicie · skoczność'] },
  'G-035': { aria: 'Siła reaktywna: krótki, sprężysty kontakt stopy i podudzia z podłożem — minimalny czas kontaktu, zaznaczony małym łukiem kompresji i szybką strzałką odbicia.', texts: ['krótki kontakt · szybkie odbicie'] },
  'G-036': { aria: 'Ekonomia ruchu: po lewej gracz, który porusza się efektywnie — gładka, krótka droga; po prawej blado nerwowa wersja z wieloma rozproszonymi dodatkowymi liniami ruchu.', texts: ['efektywnie zamiast nerwowo'] },
  'G-037': { aria: 'Debel jako osobna gra: dwóch na dwóch, każda para dzieli jedno pole.', texts: ['para przeciwna', '2 na 2', 'wasza para'] },
  'G-038': { aria: 'Atak w parze: jeden gracz z przodu, partner za nim — formacja ataku przód-tył.', texts: ['Atak', 'przód', 'tył', 'Atak: przód–tył'] },
  'G-039': { aria: "Obrona w parze: para stoi głębiej i szerzej, jeden z przodu, drugi z tyłu — każdy kryje swój obszar.", texts: ["przód", "tył", "Obrona: głębiej i szerzej"] },
  'G-040': { aria: 'Serwis i odbiór w deblu: prawo serwisu wędruje w ustalonej kolejności przez wszystkich czterech graczy.', texts: ['1', '2', '3', '4', 'Serwis', 'po kolei: 1 → 2 → 3 → 4'] },
  'G-041': { aria: "Przełączanie w deblu: przejść z ataku przód-tył do obrony — para cofa się i rozstawia szerzej, porządek przód-tył zostaje.", texts: ["Atak", "przód–tył", "Obrona", "głębiej i szerzej"] },
  'G-042': { aria: 'Ruch jako jedność: obaj partnerzy przesuwają się wspólnie w tym samym kierunku, z niezmiennym odstępem.', texts: ['wspólne przesunięcie — odstęp trzyma'] },
  'G-044': { aria: 'Pierwsze kroki w deblu: dwóch partnerów obok siebie w wygodnym odstępie.', texts: ['wygodny odstęp', 'pierwsze kroki we dwoje'] },
  'G-045': { aria: 'Kto bierze piłkę: z dwóch partnerów jeden bierze środkowego speedera, drugi zostawia mu miejsce.', texts: ['brać', 'zostawić', 'kto bierze piłkę?'] },
  'G-046': { aria: 'Serwis w deblu, prosty: z ustalonej kolejności jeden serwuje nad strefą neutralną.', texts: ['1', 'para przeciwna', 'wasza para', 'Serwis'] },
  'G-047': { aria: 'Uzgadniać się: dwóch partnerów debla od tyłu uzgadnia się między punktami krótkim gestem, rozluźniona postawa — prosta komunikacja jako para.', texts: ['krótkie uzgodnienie · jako para'] },
  'G-048': { aria: 'Zostawiać sobie miejsce: obaj partnerzy trzymają wyraźny odstęp i nie wchodzą sobie w drogę.', texts: ['odstęp', 'zostawiać sobie miejsce'] },
  'G-049': { aria: 'Para jako system: obaj partnerzy wspólnie kryją całe pole, połączeni i skoordynowani.', texts: ['jako jeden system — całe pole'] },
  'G-050': { aria: 'Czytać parę przeciwną: rozpoznać lukę między dwoma przeciwnikami i ją rozegrać.', texts: ['przeciwnicy', 'luka'] },
  'G-051': { aria: 'Ustawić partnera w pozycji: własne uderzenie stawia partnera w lepszej pozycji do ataku.', texts: ['twoje uderzenie', 'partner', 'ustawić partnera w pozycji'] },
  'G-052': { aria: "Płynnie przełączać: para przechodzi płynnie między atakiem a obroną — porządek przód-tył zostaje.", texts: ["przód", "Atak", "Obrona", "płynnie przełączać"] },
  'G-054': { aria: 'Grać na dworze: gracz na polu bez siatki pod otwartym niebem z prostym podłożem, rozluźniona, elastyczna postawa.', texts: ['gra na dworze · otwarte pole'] },
  'G-055': { aria: 'Czytać i wykorzystać wiatr: wiatr znosi speedera na bok, dlatego celujesz świadomie pod znoszenie.', texts: ['Wiatr →', 'cel', 'celować pod znoszenie'] },
  'G-056': { aria: 'Słońce i oślepienie: gracz osłania oczy przed niskim słońcem, śledząc wysokiego speedera; słońce i oślepiające promienie w rogu, dostosowana postawa głowy.', texts: ['pod słońce · osłonić oczy'] },
  'G-057': { aria: 'Wilgoć i pewna postawa: gracz z poszerzoną, ostrożną postawą na mokrym podłożu, zaznaczone krople wody i niski, pewny środek ciężkości.', texts: ['mokre podłoże · szeroka, pewna postawa'] },
  'G-058': { aria: 'Upał: gracz rozkłada siły w upale, słońce wysoko nad głową, obok parasol na przerwy w cieniu, spokojna, rozważna postawa.', texts: ['upał · cień, rozkładać siły'] },
  'G-059': { aria: 'Różne podłoża: piasek, trawa, mączka i sztuczna trawa wymagają za każdym razem innej pracy nóg.', texts: ['Piasek', 'Trawa', 'Mączka', 'Szt. trawa', 'każde podłoże — inna praca nóg'] },
  'G-060': { aria: 'Wymiarowane pole Crossminton: dwa pola 5,50 na 5,50 m, strefa neutralna 12,80 m, linia serwisowa 3,00 m od linii przedniej.', texts: ['POLE GRY', 'strefa serwisu', 'linia serwisowa', 'POLE GRY', 'strefa serwisu', 'STREFA NEUTRALNA', 'bez siatki — speeder musi przelecieć', '5,50 m', '5,50 m', '12,80 m', '3,00 m'] },
  'G-061': { aria: 'Znaki sędziowskie: IN, OUT, przerwa, powtórzenie, zmiana stron i błąd serwisowy w przeglądzie.', texts: ['IN — w polu', 'OUT — obok', 'przerwa (T)', 'powtórzenie', 'zmiana stron', 'błąd serwisowy'] },
};

// Schrift-Nachzug NUR im pl-SVG bei polnischer Überlänge (Ring-16-Regel:
// „Position/Größe nachziehen"). Reduziert font:<w> <px> in der genannten Klasse.
const TWEAKS = {
  // wird nach der Sichtprüfung befüllt
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
let n = 0;
for (const [id, { aria, texts }] of Object.entries(M)) {
  const de = readFileSync(resolve('images', `${id}.svg`), 'utf8');
  // Personengrafiken entstehen in scratchpad/figuren/ (motive.mjs + texte.mjs) samt allen vier
  // Sprachen; dieses Skript würde ihre Übersetzung mit veralteten Texten überschreiben.
  if (de.includes('data-quelle="figuren"')) { console.error(`${id} ist generiert (scratchpad/figuren/) — Eintrag aus der Map entfernen`); process.exit(1); }
  let i = 0;
  let pl = de.replace(/(<text\b[^>]*>)([^<]*)(<\/text>)/g, (m, open, _inhalt, close) => {
    if (i >= texts.length) { console.error('zu viele <text> in', id); process.exit(1); }
    return `${open}${esc(texts[i++])}${close}`;
  });
  if (i !== texts.length) { console.error(`Anzahl <text> stimmt nicht bei ${id}: ${i} ersetzt, ${texts.length} erwartet`); process.exit(1); }
  pl = pl.replace(/aria-label="[^"]*"/, `aria-label="${esc(aria)}"`);
  for (const { cls, px } of TWEAKS[id] || []) {
    const re = new RegExp('(\\.' + cls + '\\{[^}]*?font:\\s*\\d+\\s+)(\\d+(?:\\.\\d+)?)(px)');
    const vorher = pl;
    pl = pl.replace(re, `$1${px}$3`);
    if (pl === vorher) { console.error(`TWEAK ohne Wirkung bei ${id}.${cls}`); process.exit(1); }
  }
  if (pl === de) { console.error('KEINE Ersetzung bei', id); process.exit(1); }
  writeFileSync(resolve('images', `${id}.pl.svg`), pl);
  n++;
}
console.log('pl-SVGs erzeugt:', n);
