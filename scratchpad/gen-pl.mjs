// Erzeugt die polnischen Zwillinge G-XXX.pl.svg aus G-XXX.svg: ersetzt jedes
// <text> in Dokumentreihenfolge + die aria-label; Geometrie/Tokens byte-identisch
// (Ring-16-Muster). Danach mit render-svg.mjs die .pl.png rendern.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const M = {
  'G-001': { aria: 'Chwyt uniwersalny: dłoń trzyma rączkę luźno jak uścisk dłoni, między kciukiem a palcem wskazującym tworzy się wyraźne V na górnej krawędzi rączki.', texts: ['V', 'luźno jak uścisk dłoni · V kciuka u góry'] },
  'G-002': { aria: 'Pozycja podstawowa: stopy nieco szerzej niż na szerokość barków, kolana ugięte, ciężar na przodostopiu, rakieta luźno przed ciałem.', texts: ['kolana ugięte · ciężar na przodostopiu'] },
  'G-003': { aria: 'Drive forhendowy: ciężar na przedniej stopie, tułów obrócony w kierunku uderzenia, zwarty, płaski punkt kontaktu wyraźnie przed ciałem.', texts: ['płasko i bezpośrednio · przed ciałem'] },
  'G-004': { aria: 'Bekhend: ciężar na stopie po stronie rakiety, tułów otwiera się w kierunku uderzenia, rakieta prowadzona blisko ciała do przodu i trafia speedera z przodu.', texts: ['blisko ciała · punkt kontaktu z przodu'] },
  'G-005': { aria: 'Serwis, obraz 1: wolna ręka upuszcza speedera na wysokości bioder, ramię uderzające jest nisko, gotowe do zamachu od dołu do przodu.', texts: ['speeder spada na wysokość bioder'] },
  'G-006': { aria: 'Serwis, obraz 2: rakieta trafia speedera od dołu, cały speeder jest w punkcie kontaktu wyraźnie poniżej dłoni uderzającej.', texts: ['punkt kontaktu poniżej dłoni'] },
  'G-007': { aria: 'Praca nóg, obraz 1: split-step — mały sprężysty podskok, lądowanie na przodostopiu obu stóp, kolana ugięte, gotowe do odbicia w każdym kierunku.', texts: ['mały sprężysty podskok · na przodostopie'] },
  'G-008': { aria: 'Praca nóg, obraz 2: obieg ruchu — wykrokiem w róg zagrać speedera i łukiem wrócić do pozycji centralnej pośrodku.', texts: ['wykrok w róg — powrót do środka'] },
  'G-009': { aria: 'Strzał nadgarstka: przedramię pozostaje spokojne, nadgarstek jest odchylony do tyłu i strzela do przodu — wygięty łuk ruchu i lekkie rozmycie główki rakiety pokazują przyspieszenie.', texts: ['nadgarstek strzela · przedramię spokojne'] },
  'G-010': { aria: 'Uderzenie nad głową: wysoki punkt kontaktu nad głową, wyprostowane ramię uderzające, tor lotu ciągnie wysokim, głębokim łukiem daleko w pole przeciwnika.', texts: ['wysoki kontakt · głęboki łuk w pole'] },
  'G-011': { aria: 'Smecz: wysoki punkt kontaktu nad i przed głową, agresywne uderzenie w dół, tor lotu prowadzi stromo i prosto w pole przeciwnika.', texts: ['wysoki kontakt · stromo w dół'] },
  'G-012': { aria: 'Skrót: duży zamach, ale miękki, wyhamowany kontakt — speeder ledwo przekracza strefę neutralną i spada tuż za przednią linią.', texts: ['krótko i miękko · tuż za linią'] },
  'G-013': { aria: 'Podcięcie: ukośna powierzchnia rakiety muska speedera z boku zamiast trafić go prosto; wygięte linie ruchu pokazują tnący tor i powstającą rotację.', texts: ['powierzchnia muska · podcięcie i rotacja'] },
  'G-014': { aria: 'System pracy nóg: wyrywać się z centralnej bazy w rogi i natychmiast wracać do środka.', texts: ['Baza', 'w róg — powrót do środka'] },
  'G-015': { aria: 'Brać speedera wcześnie: kontakt w najwyższym, najwcześniejszym punkcie wyraźnie przed i nad ciałem; blady niższy punkt kontaktu pokazuje, gdzie trafiłby wolniejszy gracz.', texts: ['wcześnie i wysoko — skradziony czas'] },
  'G-016': { aria: 'Zwód, obraz 1: celowo neutralne, identyczne przygotowanie, które nic nie zdradza — pełny zamach do tyłu, spokojne ciało, żadnego zdecydowanego uderzenia.', texts: ['?', 'to samo przygotowanie — nic nie zdradzić'] },
  'G-017': { aria: 'Zwód, obraz 2: to samo przygotowanie, z którego odgałęziają się dwa różne uderzenia — płaski, szybki drive i krótki, miękki skrót; wybór zapada dopiero w ostatniej chwili.', texts: ['jedno przygotowanie, dwie możliwości'] },
  'G-018': { aria: 'Zmiana tempa, obraz 1: szybkie, mocne uderzenie z wyraźnym rozmyciem ruchu i płaskim, szybkim torem lotu — wysokie tempo.', texts: ['wysokie tempo · płasko i szybko'] },
  'G-019': { aria: 'Zmiana tempa, obraz 2: niemal identyczne przygotowanie, teraz powolne, wysokie, miękkie uderzenie z łagodnym łukiem — celowe złamanie rytmu.', texts: ['złamany rytm · wysoko i miękko'] },
  'G-020': { aria: 'Smecz z wyskoku: gracz trafia w najwyższym punkcie wyskoku, stopy oderwane od podłoża, ze stromym torem lotu w dół w pole przeciwnika.', texts: ['z wyskoku · stromo w dół'] },
  'G-021': { aria: 'Precyzja przy liniach: speeder ląduje dokładnie na linii narożnej na skrajnym brzegu pola; ciasne strefy celu w rogach i cienka strzałka pokazują umiejscowienie co do punktu z minimalnym marginesem.', texts: ['dokładnie na linię · minimalny margines'] },
  'G-022': { aria: 'Stałość pod najwyższą presją: czyste, zrównoważone uderzenie ze spokojną postawą — stabilna baza, spokojna główka, kontrolowane wyprowadzenie, niezawodnie powtarzalne.', texts: ['spokojnie i powtarzalnie · pod presją'] },
  'G-023': { aria: 'Cel gry: zagrać speedera nad strefą neutralną w pole przeciwnika.', texts: ['pole przeciwnika', 'STREFA NEUTRALNA', 'twoje pole'] },
  'G-024': { aria: 'Pozycja centralna: ze środka pola drogi do wszystkich czterech rogów są jednakowo krótkie.', texts: ['Środek', 'jednakowo szybko do każdego rogu'] },
  'G-025': { aria: 'Długość i głębia: zagrać krótką piłkę na przednią linię lub głęboką piłkę na linię końcową.', texts: ['głęboko — na linię końcową', 'krótko — na linię przednią'] },
  'G-026': { aria: 'Bekhend przeciwnika: zagrać speedera celowo w róg bekhendowy przeciwnika.', texts: ['przeciwnik', 'bekhend'] },
  'G-027': { aria: 'Wykorzystać serwis taktycznie: ze strefy serwisu rozgrywać różne punkty celu w polu przeciwnika.', texts: ['strefa serwisu'] },
  'G-028': { aria: 'Budować punkt: ruszać przeciwnika kilkoma uderzeniami z rogu do rogu, aż powstanie otwarcie.', texts: ['1', '2', '3', 'wolne', 'budować punkt → otwarcie'] },
  'G-029': { aria: 'Przygotować smecza: naciskać nisko, zmusić przeciwnika do wysokiej piłki, potem stromo zakończyć.', texts: ['1', 'naciskać nisko', '2', '3', 'nacisk → wysoko → smecz'] },
  'G-030': { aria: 'Typy przeciwników i kontrśrodki: przeciw atakującemu, broniącemu i powolnemu przeciwnikowi po jednej pasującej odpowiedzi.', texts: ['Atakujący', 'zdjąć tempo', 'Broniący', 'z rogu w róg', 'Powolny', 'szerokie kąty'] },
  'G-031': { aria: 'Systematycznie atakować słabość: rozgrywać speedera wciąż w ten sam słaby róg przeciwnika.', texts: ['słabość', 'otwierać'] },
  'G-032': { aria: 'Szybkie stopy: niska, atletyczna postawa na przodostopiu, małe szybkie kroki zaznaczone lekkimi liniami ruchu przy stopach, gotowe do zmiany kierunku.', texts: ['szybkie, lekkie stopy na przodostopiu'] },
  'G-033': { aria: 'Ruchomość i bark: łagodna mobilizacja barku i tułowia, ramię krąży po wygiętym łuku ruchu nad barkiem, rozluźniona, wyprostowana postawa.', texts: ['łagodne krążenia barku · ruchomość'] },
  'G-034': { aria: 'Eksplozywność i skoczność: z niskiej, naładowanej postawy eksplozywnie odbić się w róg, silna strzałka ruchu z odbijającej nogi ku górze i przodowi.', texts: ['eksplozywne odbicie · skoczność'] },
  'G-035': { aria: 'Siła reaktywna: krótki, sprężysty kontakt stopy i podudzia z podłożem — minimalny czas kontaktu, zaznaczony małym łukiem kompresji i szybką strzałką odbicia.', texts: ['krótki kontakt · szybkie odbicie'] },
  'G-036': { aria: 'Ekonomia ruchu: po lewej gracz, który porusza się efektywnie — gładka, krótka droga; po prawej blado nerwowa wersja z wieloma rozproszonymi dodatkowymi liniami ruchu.', texts: ['efektywnie zamiast nerwowo'] },
  'G-037': { aria: 'Debel jako osobna gra: dwóch na dwóch, każda para dzieli jedno pole.', texts: ['para przeciwna', '2 na 2', 'wasza para'] },
  'G-038': { aria: 'Atak w parze: jeden gracz z przodu, partner za nim — formacja ataku przód-tył.', texts: ['Atak', 'przód', 'tył', 'Atak: przód–tył'] },
  'G-039': { aria: 'Obrona w parze: obaj gracze obok siebie, każdy kryje jedną połowę pola.', texts: ['twoja połowa', 'połowa partnera', 'Obrona: obok siebie'] },
  'G-040': { aria: 'Serwis i odbiór w deblu: prawo serwisu wędruje w ustalonej kolejności przez wszystkich czterech graczy.', texts: ['1', '2', '3', '4', 'Serwis', 'po kolei: 1 → 2 → 3 → 4'] },
  'G-041': { aria: 'Przełączanie w deblu: z formacji ataku przód-tył przejść do obrony obok siebie.', texts: ['Atak', 'przód–tył', 'Obrona', 'obok siebie'] },
  'G-042': { aria: 'Ruch jako jedność: obaj partnerzy przesuwają się wspólnie w tym samym kierunku, z niezmiennym odstępem.', texts: ['wspólne przesunięcie — odstęp trzyma'] },
  'G-043': { aria: 'Porozumienie w parze: dwóch partnerów debla od tyłu, którzy dogadują się między punktami — jeden daje za plecami ukryty znak ręką.', texts: ['ukryty znak ręką · porozumienie'] },
  'G-044': { aria: 'Pierwsze kroki w deblu: dwóch partnerów obok siebie w wygodnym odstępie.', texts: ['wygodny odstęp', 'pierwsze kroki we dwoje'] },
  'G-045': { aria: 'Kto bierze piłkę: z dwóch partnerów jeden bierze środkowego speedera, drugi zostawia mu miejsce.', texts: ['brać', 'zostawić', 'kto bierze piłkę?'] },
  'G-046': { aria: 'Serwis w deblu, prosty: z ustalonej kolejności jeden serwuje nad strefą neutralną.', texts: ['1', 'para przeciwna', 'wasza para', 'Serwis'] },
  'G-047': { aria: 'Uzgadniać się: dwóch partnerów debla od tyłu uzgadnia się między punktami krótkim gestem, rozluźniona postawa — prosta komunikacja jako para.', texts: ['krótkie uzgodnienie · jako para'] },
  'G-048': { aria: 'Zostawiać sobie miejsce: obaj partnerzy trzymają wyraźny odstęp i nie wchodzą sobie w drogę.', texts: ['odstęp', 'zostawiać sobie miejsce'] },
  'G-049': { aria: 'Para jako system: obaj partnerzy wspólnie kryją całe pole, połączeni i skoordynowani.', texts: ['jako jeden system — całe pole'] },
  'G-050': { aria: 'Czytać parę przeciwną: rozpoznać lukę między dwoma przeciwnikami i ją rozegrać.', texts: ['przeciwnicy', 'luka'] },
  'G-051': { aria: 'Ustawić partnera w pozycji: własne uderzenie stawia partnera w lepszej pozycji do ataku.', texts: ['twoje uderzenie', 'partner', 'ustawić partnera w pozycji'] },
  'G-052': { aria: 'Płynnie przełączać: para przechodzi płynnie między atakiem a obroną.', texts: ['płynnie przełączać'] },
  'G-053': { aria: 'Ślepe porozumienie: dwóch partnerów debla porusza się w doskonałej antycypacji, nie patrząc na siebie — odbite, jednakowo skierowane strzałki ruchu i wspólne pasmo percepcji.', texts: ['ślepe porozumienie · bez patrzenia'] },
  'G-054': { aria: 'Grać na dworze: gracz na polu bez siatki pod otwartym niebem z prostym podłożem, rozluźniona, elastyczna postawa.', texts: ['gra na dworze · otwarte pole'] },
  'G-055': { aria: 'Czytać i wykorzystać wiatr: wiatr znosi speedera na bok, dlatego celujesz świadomie pod znoszenie.', texts: ['Wiatr →', 'cel', 'celować pod znoszenie'] },
  'G-056': { aria: 'Słońce i oślepienie: gracz osłania oczy przed niskim słońcem, śledząc wysokiego speedera; słońce i oślepiające promienie w rogu, dostosowana postawa głowy.', texts: ['pod słońce · osłonić oczy'] },
  'G-057': { aria: 'Wilgoć i pewna postawa: gracz z poszerzoną, ostrożną postawą na mokrym podłożu, zaznaczone krople wody i niski, pewny środek ciężkości.', texts: ['mokre podłoże · szeroka, pewna postawa'] },
  'G-058': { aria: 'Upał: gracz rozkłada siły w upale, słońce wysoko nad głową, butelka wody obok, spokojna, rozważna postawa.', texts: ['upał · zwolnić tempo, pić'] },
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
