// Ring 2 (pl): fügt pl-Zwillinge zu den 16 Textknoten in
// data/bausteine.beginner-technik.json (6 erklaerteil-Strings + 6 uebungsteil-
// Objekte + 4 Delta-erklaerteil-Strings). Referenzdatei → strikt byte-identisch:
// nur additive Einfügung von `pl` hinter jedem `fr`, de/en/fr unangetastet.
// Indent-treu (pl-Block spiegelt die Einrückung des fr-Blocks). Glossar: docs/glossar-pl.md.
import { readFileSync, writeFileSync } from 'node:fs';

const S = (t) => t; // string-erklaerteil
// PL-Werte in Dokumentreihenfolge: b0.erklaer, b0.uebung, b1.erklaer, b1.uebung, …,
// b5.erklaer, b5.uebung, delta0..3.erklaer  → [str,obj,str,obj,...,str(×4)]
const PL = [
  // ---- b0 grundposition ----
  S('Między dwoma uderzeniami jest moment, w którym musisz być gotowy na wszystko. Ten moment ma swoją postawę — pozycję podstawową. Z niej ruszasz w każdą stronę.\n\nPomyśl o bramkarzu przed rzutem karnym: lekko naprężony, czujny, gotowy do skoku. Właśnie tego napięcia szukasz. Stopy nieco szerzej niż na szerokość barków, kolana lekko ugięte, ciężar przeniesiony do przodu na przednią część stóp — pięty ledwie dotykają podłoża. Rakietę trzymasz luźno przed ciałem, barki pozostają rozluźnione.\n\nTo aktywna gotowość, nie postawa spoczynkowa. Niska, lekko pochylona do przodu postawa rusza cię szybciej niż jakakolwiek wyprostowana sylwetka. Kto stoi płasko na piętach, traci pierwszy krok.'),
  {
    titel: 'Naładuj się i wystartuj',
    ziel: 'Twoja pozycja podstawowa faktycznie cię przyspiesza — a nie tylko dobrze wygląda.',
    schritte: [
      'Przyjmij pozycję podstawową: stopy nieco szerzej niż na szerokość barków, kolana lekko ugięte, ciężar na przedniej części stóp, rakieta luźno przed ciałem.',
      'Wybierz kierunek — w przód, w tył, w lewo lub w prawo.',
      'Wystartuj eksplozywnie jednym krokiem w tym kierunku.',
      'Wróć do pozycji podstawowej.',
      'Powtarzaj, za każdym razem w inny kierunek.',
    ],
    selbstkontrolle: 'Jak łatwo wychodzi pierwszy krok? Jeśli możesz się odepchnąć, nie prostując się wcześniej, postawa jest dobra. Jeśli musisz się najpierw podnieść lub przenieść ciężar, stoisz zbyt biernie — w postawie zbyt wyprostowanej, zbyt płasko na piętach.',
    abschluss: 'Pozycja podstawowa to twój blok startowy. Czy działa, poznasz dopiero w ruchu.',
  },
  // ---- b1 griff ----
  S('W crossmintonie trzymasz rakietę tak samo do każdego uderzenia. Żadnej zmiany chwytu, żadnych wariantów na forhend i bekhend. Jeden chwyt do wszystkiego — dlatego chwyt uniwersalny.\n\nBrzmi to niepozornie, ale to właśnie powód, dla którego w ogóle nadążasz w szybkiej grze. Speeder leci szybciej, niż zdołasz zmienić chwyt. Kto szuka odpowiedniego chwytu, spóźnia się.\n\nTak go znajdziesz: przytrzymaj rakietę wolną ręką przed sobą, krawędź skierowana do podłoża. Teraz chwyć rakietę tak, jakbyś podawał jej rękę. Między kciukiem a palcem wskazującym tworzy się lekkie „V”. Nic więcej.\n\nO tym, czy jest dobrze czy źle, decydują dwie rzeczy:\n\nNacisk. Trzymaj luźno, bez spinania — mniej więcej tak mocno, jak ściskasz czyjąś dłoń, nie zgniatając jej. Zbyt mocny chwyt odbiera ci czucie i męczy przedramię. Mocno robi się dopiero w chwili kontaktu, potem znów rozluźniasz.\n\nNadgarstek. Na początku trzymasz go spokojnie i prosto. Siła płynie z ramienia, barku i nóg. Z początku przypomina to uderzenie tenisowe i tak właśnie ma być. Dopiero gdy chwyt jest opanowany, a uderzenia wychodzą czysto, nadgarstek może włączyć się do pracy i na końcu strzelić jak bat. Ten bat przyjdzie później — teraz budujesz fundament.'),
  {
    titel: 'Chwyt na ślepo',
    ziel: 'Twoja ręka sama znajduje chwyt uniwersalny — bez patrzenia, bez zastanawiania się.',
    schritte: [
      'Weź rakietę w wolną rękę, krawędź do podłoża.',
      'Chwyć jak do uścisku dłoni, utwórz „V” między kciukiem a palcem wskazującym.',
      'Spójrz na chwilę: czy ułożenie V jest dobre? Czy nacisk jest luźny?',
      'Odłóż rakietę — albo wypuść ją całkiem z ręki.',
      'Powtórz. Dziesięć razy z kontrolnym spojrzeniem.',
    ],
    steigerung: 'Zamknij oczy. Chwyć, nie patrząc. Dopiero potem sprawdź, czy „V” jest na miejscu. Jeśli trafisz je dziesięć razy z rzędu na ślepo, chwyt jest opanowany.',
    selbstkontrolle: 'W grze nie masz czasu, by kontrolować chwyt. Musi być dobry sam z siebie, gdy tylko bierzesz rakietę do ręki.',
    naechste_stufe: 'Gdy chwyt siedzi na ślepo, przenosisz go do pierwszego ruchu uderzenia. Tam sprawdzasz, czy utrzyma się także wtedy, gdy pracuje ramię — to przychodzi przy podstawowym uderzeniu forhendem.',
  },
  // ---- b2 aufschlag ----
  S('Serwis otwiera każdą wymianę. To jedyne uderzenie, które przygotowujesz w zupełnym spokoju — żaden przeciwnik cię nie naciska, speeder spoczywa wyłącznie w twojej dłoni. Właśnie to czyni go idealnym pierwszym uderzeniem.\n\nTrzymasz speedera swobodnie przed sobą i wypuszczasz go. Gdy opada, prowadzisz rakietę od dołu do przodu i trafiasz go w locie. Punkt decydujący: w chwili kontaktu cały speeder znajduje się poniżej twojej dłoni uderzającej. Ten jeden wymóg kształtuje cały ruch — uderzasz od dołu, nie od góry. Serwis powyżej wysokości barku nie jest ważnym serwisem.\n\nDo tego dwa warunki, które czynią serwis ważnym: jedna stopa pozostaje podczas ruchu na podłożu, a uderzasz z tylnej strefy swojego pola. Dopóki ich przestrzegasz, twój serwis się liczy.\n\nPrzy pierwszym kontakcie możesz sobie ułatwić: wypuść speedera z wysokości bioder i trafiaj go nisko, tuż zanim dotknie podłoża. Tak przyzwyczaisz się do momentu opadania. Gdy timing jest opanowany, podnosisz punkt kontaktu — aż znajdzie się tam, gdzie wymaga tego reguła: poniżej dłoni uderzającej.'),
  {
    titel: 'Odczytaj opadanie, potem trafiaj',
    ziel: 'Znaleźć moment, w którym czysto trafiasz opadającego speedera.',
    schritte_teil1: [
      'Trzymaj speedera swobodnie przed sobą, mniej więcej na wysokości bioder.',
      'Wypuść go i jeszcze nie uderzaj — tylko patrz, jak opada.',
      'Powtórz kilka razy, aż wyczujesz, jak szybko i dokąd opada.',
    ],
    schritte_teil2: [
      'Znów wypuść speedera.',
      'Poprowadź rakietę od dołu do przodu i trafiaj go nisko, tuż zanim dotknie podłoża.',
      'Nie przejmuj się jeszcze celem — liczy się tylko to, że trafiasz go czysto.',
    ],
    selbstkontrolle: 'Czy trafiasz speedera równo, czy raz za wcześnie, raz za późno? Jeśli moment kontaktu się waha, poświęć opadaniu jeszcze trochę więcej uwagi, zanim uderzysz.',
    abschluss: 'Serwis udaje się dzięki timingowi, nie sile. Gdy tylko niezawodnie trafiasz punkt opadania, celowanie przychodzi niemal samo — punkt kontaktu podniesiesz później, cel wyznaczysz sobie później.',
  },
  // ---- b3 vorhand_drive ----
  S('Drive forhendowy to twoje uderzenie chleba powszedniego. Płaskie, bezpośrednie, grane po stronie rakiety — uderzenie, którego w grze potrzebujesz najczęściej.\n\nWyobraź sobie, że rakietą strącasz coś ze stołu na wysokości bioder w bok. Właśnie ten ruch powtarzasz: ciężar przechodzi na przednią nogę, tułów obraca się w kierunku uderzenia, a ramię wyprowadza rakietę do przodu. Trafiasz speedera przed ciałem, nie obok siebie i nie za sobą.\n\nCałe uderzenie to jeden, płynny ruch — ciężar, obrót, uderzenie przechodzą jedno w drugie. Siła płynie z tego łańcucha, z nóg i tułowia, nie z szerokiego zamachu ramieniem.\n\nI tu spełniamy to, co zapowiedzieliśmy przy chwycie: na razie trzymasz nadgarstek spokojnie i uderzasz zwięźle. Strzelenie nadgarstka — bat, który nada uderzeniu tempo później — przyjdzie, gdy ten podstawowy ruch będzie opanowany. Najpierw czysty łuk, potem przyspieszenie.'),
  {
    titel: 'Wyszlifować łuk ruchu',
    ziel: 'Ruch uderzenia siedzi jako płynny łańcuch, zanim do gry wejdzie speeder.',
    schritte: [
      'Przyjmij pozycję podstawową, chwyt uniwersalny.',
      'Przenieś ciężar na przednią nogę, obróć tułów w kierunku uderzenia.',
      'Poprowadź rakietę zwięzłym łukiem do przodu, jakbyś strącał coś w bok na wysokości bioder.',
      'Utrzymuj wyobrażony punkt kontaktu wyraźnie przed ciałem.',
      'Wróć do pozycji podstawowej i powtórz.',
    ],
    selbstkontrolle: 'Zwróć uwagę, czy ciężar, obrót i uderzenie przechodzą jedno w drugie. Jeśli ruch się zacina, zwolnij go, aż popłynie. Tempo przyjdzie później, najpierw czysty łuk.',
    naechste_stufe: 'Gdy ruch siedzi, wprowadzasz speedera — podrzuć go sobie krótko, pozwól mu opaść na wysokość bioder i trafiaj go łukiem przed ciałem. Teraz sprawdzasz, czy łańcuch utrzyma się także przy prawdziwym kontakcie.',
  },
  // ---- b4 rueckhand ----
  S('Bekhend grasz po tej stronie ciała, która jest odwrócona od rakiety — tam, gdzie wierzch dłoni wskazuje do przodu. To odpowiednik forhendu i podlega tej samej zasadzie, tylko lustrzanie odwróconej.\n\nJeśli forhend już znasz, pomoże ci ten obraz: wszystko, co tam biegło w jedną stronę, tutaj biegnie w drugą. Ciężar przechodzi na nogę po twojej stronie uderzenia, tułów się otwiera, a rakieta wychodzi przed ciałem do przodu. Speedera także tutaj trafiasz przed ciałem, w zasięgu ramienia uderzającego.\n\nA gdyby forhend nie był akurat w pamięci: ustaw się bokiem do celu, rakietę prowadzisz blisko ciała do przodu i otwierasz ruch w stronę punktu kontaktu. Uderzenie pozostaje zwięzłe, nadgarstek na razie spokojny — tak samo jak przy forhendzie najpierw budujesz czysty łuk, zanim dojdzie tempo.\n\nJeden powód, dla którego bekhend musi być opanowany: w grze jest celowo rozgrywany. Wiele serwisów i ataków szuka strony bekhendowej, bo u większości jest ona słabsza. Niezawodny bekhend odbiera ci właśnie tę powierzchnię do ataku.'),
  {
    titel: 'Wyszlifować lustrzany łuk',
    ziel: 'Ruch bekhendu siedzi jako płynny łańcuch, zanim do gry wejdzie speeder.',
    schritte: [
      'Przyjmij pozycję podstawową, chwyt uniwersalny.',
      'Przenieś ciężar na nogę po stronie uderzenia, otwórz tułów.',
      'Poprowadź rakietę blisko ciała do przodu i otwórz ruch w stronę punktu kontaktu.',
      'Utrzymuj wyobrażony punkt kontaktu wyraźnie przed ciałem.',
      'Wróć do pozycji podstawowej i powtórz.',
    ],
    selbstkontrolle: 'Zwróć uwagę, czy ciężar, obrót i uderzenie przechodzą jedno w drugie. Jeśli ruch się zacina, zwolnij go, aż popłynie. Bekhend z początku wydaje się mniej naturalny niż forhend — to mija z powtórzeniami.',
    naechste_stufe: 'Gdy ruch siedzi, wprowadzasz speedera — podrzuć go sobie krótko, pozwól mu opaść na wysokość bioder i trafiaj go łukiem przed ciałem. Teraz sprawdzasz, czy łańcuch utrzyma się także przy prawdziwym kontakcie.',
  },
  // ---- b5 beinarbeit ----
  S('Do tej pory chodziło o to, jak uderzasz. Teraz chodzi o to, jak w porę docierasz tam, gdzie ląduje speeder. Dobra praca nóg często decyduje bardziej niż samo uderzenie — to ona w porę dostawia cię tam, gdzie ląduje speeder.\n\nWszystko kręci się wokół jednego miejsca i jednego momentu.\n\nMiejsce to środek twojego pola — pozycja centralna. Stąd najszybciej dosięgasz każdego narożnika. Po każdym uderzeniu tam wracasz. Twoja gra zyskuje przez to rytm: wyjście do piłki, uderzenie, powrót do środka. Wciąż od nowa.\n\nMoment to split-step — mały, sprężysty podskok tuż przed tym, jak przeciwnik trafia speedera. Lądujesz lekko na przedniej części obu stóp i właśnie z tego lądowania ruszasz w każdą stronę. Split-step zamienia twoją spokojną gotowość w ukierunkowany ruch. Bez niego stoisz przyklejony do podłoża i tracisz pierwszy krok.\n\nRazem tworzą obieg: czekasz centralnie, ładujesz się split-stepem, ruszasz do piłki, uderzasz, wracasz. Ten obieg to fundament twojej ruchliwości na polu.'),
  {
    titel: 'Przebiegnij obieg',
    ziel: 'Cykl ruchu siedzi jako całość — bez speedera, jako czysta praca nóg.',
    schritte: [
      'Ustaw się w pozycji centralnej swojego pola, w postawie podstawowej.',
      'Zrób mały split-step — sprężysty podskok, lądowanie na przedniej części obu stóp.',
      'Z lądowania ruszaj do jednego narożnika swojego pola i zaznacz tam uderzenie.',
      'Wróć do pozycji centralnej.',
      'Powtarzaj, za każdym razem do innego narożnika.',
    ],
    selbstkontrolle: 'Zwróć uwagę na dwie rzeczy: czy start wychodzi bezpośrednio ze split-stepu, czy jest między nimi przerwa? I czy niezawodnie wracasz do pozycji centralnej, czy po uderzeniu zostajesz w narożniku? Obieg zaczyna nieść dopiero wtedy, gdy oba elementy działają płynnie.',
    abschluss: 'Ten ruch cienia wbudowuje rytm, zanim speeder zacznie naciskać. Gdy obieg siedzi, dostosowanie do prawdziwej piłki przychodzi niemal samo — drogi pozostają te same, porusza się tylko cel.',
  },
  // ---- delta[0] griff_delta_bad ----
  S('Chwytać już umiesz. Chwyt jak przy uścisku dłoni, „V” między kciukiem a palcem wskazującym — wszystko znajome. Nie musisz się tu uczyć niczego nowego.\n\nMusisz coś oduczyć: zmiany chwytu.\n\nW badmintonie zmieniasz nieustannie — chwyt forhendowy, chwyt bekhendowy, kciuk przełożony, zależnie od uderzenia. Ta zmiana siedzi w tobie głęboko i to właśnie ona będzie ci w crossmintonie przeszkadzać. Tutaj nie ma zmiany. Jeden chwyt, każde uderzenie.\n\nZ początku wydaje się to błędne. Twoja ręka chce zmienić chwyt, zwłaszcza na bekhendzie — robiła to tysiące razy. Nie pozwól jej. Trzymaj chwyt uniwersalny także wtedy, gdy twój badmintonowy odruch domaga się kciuka.\n\nMały test: zagraj kilka bekhendów i obserwuj kciuk. Wędruje? To znaczy, że wciąż zmieniasz chwyt. Celem jest, by ręka pozostała spokojna.\n\nNa marginesie: speeder jest cięższy niż lotka, rakieta krótsza i grubiej naciągnięta. Twój chwyt może być dlatego odrobinę mocniejszy niż zwykle, a nadgarstek na początku spokojniejszy. Ale to dostrajanie — jedyna rzecz, która się liczy, to rezygnacja ze zmiany chwytu.'),
  // ---- delta[1] aufschlag_delta_bad ----
  S('Ruch znasz: wypuścić speedera, trafić od dołu. Motorycznie nie musisz się niczego uczyć na nowo.\n\nZmienia się twój cel. W badmintonie unosisz serwis nad siatkę — tuż nad nią, kontrolowanie, w bliskie pole. To wyobrażenie w tobie siedzi. W crossmintonie nie ma siatki, którą trzeba pokonać. Na jej miejscu leży strefa neutralna między polami, a tę pokonujesz odległością, nie wysokością.\n\nTwój serwis idzie więc płaściej i dalej, niż chce tego twój badmintonowy odruch. Nie unosić, lecz nieść do przodu przez strefę — aż głęboko w pole przeciwnika.\n\nMały test: obserwuj tor lotu swojego serwisu. Czy speeder najpierw wznosi się wysoko i opada tuż za nią? To znaczy, że wciąż grasz nad siatką, której nie ma. Celem jest płaski, długi tor.'),
  // ---- delta[2] vorhand_drive_delta_bad ----
  S('Drive znasz. Punkt kontaktu przed ciałem, ciężar do przodu, rotacja w kierunku uderzenia — to wszystko już masz.\n\nJedna rzecz się przesuwa: skąd bierze się siła. W badmintonie grasz drive’a mocno z nadgarstka i palców, a elastyczna rakieta przy tym dokłada swój strzał. Twój sprzęt tutaj jest inny — krótszy, sztywniejszy, z mocniejszym naciągiem, a speeder jest dwa razy cięższy niż lotka. Rakieta prawie nie ustępuje, więc sam nadgarstek nie niesie już uderzenia.\n\nDlatego na początku cofnij impuls z nadgarstka. Twoja siła płynie teraz ze zwięźlejszego, mocniejszego uderzenia — bardziej z tułowia i ramienia, z wyraźnym zaciśnięciem chwytu w punkcie kontaktu. Z początku wydaje się to mniej eleganckie niż twój badmintonowy drive, ale na sztywnym sprzęcie przenosi energię czyściej.\n\nNadgarstek nie zostaje wyłączony na zawsze. Gdy zwięzłe uderzenie siedzi, wbudowujesz go z powrotem w odpowiedniej dawce — ten sam bat, którego pozostali gracze uczą się później, tylko dopasowany do twojego sprzętu.\n\nMały test: zagraj kilka drive’ów i zwróć uwagę na przedramię. Pozostaje luźne, a uderzenie mimo to mocne? To znaczy, że uderzenie niesie ciało. Jeśli siła wyczuwalnie płynie tylko z nadgarstka, cofnij go jeszcze trochę.'),
  // ---- delta[3] rueckhand_delta_bad ----
  S('Na bekhendzie twój badmintonowy nawyk siedzi najgłębiej. Tam zwykle obracasz dłoń w chwyt kciukowy — kciuk na szeroką stronę rączki, co wytwarza siłę przez dźwignię. Właśnie ta zmiana tutaj odpada. Pozostajesz w chwycie uniwersalnym, także na bekhendzie, bez przekładania kciuka.\n\nTo ta sama rezygnacja, którą już znasz z chwytu — na bekhendzie staje się tylko szczególnie odczuwalna, bo twój odruch najsilniej domaga się tu kciuka.\n\nDo tego dochodzi, jak przy forhendzie, zmienione źródło siły: na sztywnym sprzęcie siła płynie ze zwięźlejszego uderzenia całym ciałem, nie z impulsu kciuka czy nadgarstka. Szczegóły znajdziesz we wskazówce do forhendu.\n\nMały test: zagraj kilka bekhendów i zwróć uwagę na kciuk. Jeśli się przekłada, wciąż chwytasz według badmintonowego wzorca. Celem jest, by pozostawał spokojnie na swojej pozycji chwytu uniwersalnego.'),
];

const PFAD = 'data/bausteine.beginner-technik.json';
let s = readFileSync(PFAD, 'utf8');

// Ende einer JSON-String-Literal ab Index i (i zeigt auf öffnendes ").
function stringEnde(text, i) {
  i++;
  while (i < text.length) {
    if (text[i] === '\\') { i += 2; continue; }
    if (text[i] === '"') return i; // schließendes "
    i++;
  }
  throw new Error('String nicht geschlossen ab ' + i);
}
// Ende eines JSON-Objekts ab Index i (i zeigt auf {).
function objektEnde(text, i) {
  let tiefe = 0, inStr = false;
  for (; i < text.length; i++) {
    const c = text[i];
    if (inStr) { if (c === '\\') { i++; continue; } if (c === '"') inStr = false; continue; }
    if (c === '"') inStr = true;
    else if (c === '{') tiefe++;
    else if (c === '}') { tiefe--; if (tiefe === 0) return i; }
  }
  throw new Error('Objekt nicht geschlossen ab ' + i);
}

// Alle "fr": Vorkommen finden.
const re = /"fr"\s*:\s*/g;
const treffer = [];
let m;
while ((m = re.exec(s)) !== null) {
  let j = re.lastIndex; // erstes Zeichen des Werts
  const zeilenStart = s.lastIndexOf('\n', m.index) + 1;
  const baseIndent = s.slice(zeilenStart, m.index); // WS vor "fr"
  let ende, typ;
  if (s[j] === '"') { ende = stringEnde(s, j); typ = 'str'; }
  else if (s[j] === '{') { ende = objektEnde(s, j); typ = 'obj'; }
  else throw new Error('Unerwarteter fr-Wert bei ' + j + ': ' + s.slice(j, j + 20));
  treffer.push({ einf: ende + 1, baseIndent, typ });
}

if (treffer.length !== PL.length) {
  console.error(`fr-Knoten (${treffer.length}) ≠ PL (${PL.length}) — Abbruch.`); process.exit(1);
}
// Typprüfung (erwartet: str,obj ×6, dann str ×4)
const erwartet = [];
for (let k = 0; k < 6; k++) erwartet.push('str', 'obj');
for (let k = 0; k < 4; k++) erwartet.push('str');
for (let k = 0; k < treffer.length; k++) {
  const plTyp = typeof PL[k] === 'string' ? 'str' : 'obj';
  if (treffer[k].typ !== plTyp || treffer[k].typ !== erwartet[k]) {
    console.error(`Typkonflikt bei #${k}: fr=${treffer[k].typ} pl=${plTyp} erwartet=${erwartet[k]} — Abbruch.`);
    process.exit(1);
  }
}

// Von hinten einfügen.
function serialisiere(wert, baseIndent) {
  if (typeof wert === 'string') return JSON.stringify(wert);
  const body = JSON.stringify(wert, null, 2);
  return body.split('\n').map((ln, i) => (i === 0 ? ln : baseIndent + ln)).join('\n');
}
for (let k = treffer.length - 1; k >= 0; k--) {
  const t = treffer[k];
  const ins = ',\n' + t.baseIndent + '"pl": ' + serialisiere(PL[k], t.baseIndent);
  s = s.slice(0, t.einf) + ins + s.slice(t.einf);
}

// Verifikation: gültiges JSON, de/en/fr byte-identisch, pl vollständig & formgleich.
const neu = JSON.parse(s);
const alt = JSON.parse(readFileSync(PFAD, 'utf8')); // noch die Originaldatei? Nein: bereits im Speicher. Nutze git-Vergleich extern.
let plCnt = 0, formFehler = 0;
function gleicheForm(a, b) {
  if (typeof a === 'string') return typeof b === 'string';
  if (Array.isArray(a)) return Array.isArray(b) && a.length === b.length;
  if (a && typeof a === 'object') {
    if (!b || typeof b !== 'object') return false;
    const ka = Object.keys(a), kb = new Set(Object.keys(b));
    return ka.every((k) => kb.has(k) && gleicheForm(a[k], b[k]));
  }
  return true;
}
function pruefe(o) {
  if (Array.isArray(o)) return o.forEach(pruefe);
  if (o && typeof o === 'object') {
    if ('de' in o && ('erklaerteil' in o || true)) { /* generic */ }
    if ('de' in o && ('en' in o)) {
      // Textknoten
      plCnt++;
      if (!('pl' in o) || !gleicheForm(o.de, o.pl)) formFehler++;
    }
    for (const [k, v] of Object.entries(o)) if (!['de', 'en', 'fr', 'pl'].includes(k)) pruefe(v);
  }
}
pruefe(neu);
if (formFehler) { console.error(`${formFehler} pl-Knoten fehlend/formabweichend — Abbruch.`); process.exit(1); }

writeFileSync(PFAD, s, 'utf8');
console.log(`beginner-technik.json: ${plCnt} Textknoten mit pl (formgleich). Datei geschrieben.`);
