// Ring 5 (pl): Fortgeschritten-Technik (18) + Fortgeschritten-Taktik (20) = 38 Knoten
// (inkl. 3 Technik-BAD-Deltas + 1 Taktik-BAD-Delta). anzeigetitel spiegeln Ring-0-Labels.
import { insertPl } from './pl-core.mjs';

const TECHNIK = [
  // b0 erklaerteil (Peitsche)
  'W części dla początkujących nadgarstek świadomie pozostawał spokojny, a siła szła z ramienia, barku i nóg. To był fundament. Teraz budujesz na nim ruch, który nadaje uderzeniu jego właściwe tempo: strzelenie nadgarstka. Bat, który był wciąż zapowiadany.\n\nWyobraź sobie, jak strzela bat: rączka ledwie się rusza, ale na końcu sznura powstaje ogromna prędkość. Dokładnie tak działa twoje uderzenie. Ramię i ciało wprawiają rakietę w drogę, a w ostatniej chwili przed trafieniem przedramię wkręca się do środka, a nadgarstek strzela do przodu. To ostatnie strzelenie zwielokrotnia prędkość główki rakiety, bez wkładania większej siły.\n\nKluczem jest timing. Strzał przychodzi późno — tuż przed punktem kontaktu, nie wcześniej. Za wcześnie, a przyspieszenie ulatnia się, zanim speeder tam dotrze. Dokładnie w chwili trafienia napięcie uwalnia się z luźno trzymanego nadgarstka.\n\nI tu opłaca się luźny chwyt, który ćwiczysz od początku. Spięty nadgarstek nie może strzelić. Tylko luźna ręka, która dopiero w chwili trafienia krótko się usztywnia, tworzy bat. Mocno robi się na ułamek kontaktu, potem znów rozluźniasz.\n\nTen ruch tkwi od teraz w niemal każdym mocnym uderzeniu — w drivie, w clearze, w smeczu. To przejście od kontrolowanego uderzenia podstawowego do gry pod presją.',
  {
    titel: 'Wyczuć czas strzału',
    ziel: 'Pozwolić nadgarstkowi strzelić we właściwym momencie — późno, rozluźnionemu, w punkcie kontaktu.',
    schritte: [
      'Przyjmij pozycję podstawową, chwyt uniwersalny, nadgarstek luźny.',
      'Zagraj drive’a forhendowego jak zwykle — ale tym razem pozwól nadgarstkowi w ostatniej chwili przed punktem kontaktu strzelić do przodu.',
      'Zacznij powoli i świadomie przesadzaj ze strzałem, by znaleźć to czucie.',
      'Potem wprowadź speedera: podrzucony samodzielnie, opuszczony na wysokość bioder, trafiony łukiem ze strzałem.',
      'Podnoś tempo dopiero, gdy strzał niezawodnie przychodzi w chwili trafienia.',
    ],
    steigerung: 'Zmieniaj między zwięzłym uderzeniem bez strzału a jednym ze strzałem. Czujesz różnicę tempa przy tym samym nakładzie siły? Wtedy bat pracuje.',
    selbstkontrolle: 'Zwróć uwagę na dźwięk i czucie: dobrze wyczuty w czasie strzał wydaje się bez wysiłku, a speeder leci wyczuwalnie szybciej. Jeśli siła bierze się ze spiętego ramienia zamiast z rozluźnionego strzału, zdejmij tempo i najpierw odnajdź timing.',
    abschluss: 'Bat to składnik, który od teraz wędruje do twoich mocnych uderzeń, nie osobne uderzenie. Daj mu czas — czysty timing bije surową siłę.',
  },
  // b1 erklaerteil (Überkopf)
  'Uderzenie nad głową to twoje narzędzie do wszystkich wysokich speederów. Trafiasz nad głową, ruchem bardzo podobnym do serwisu tenisowego — a bat z poprzedniego modułu jest jego silnikiem.\n\nTak biegnie ruch: ustawiasz się bokiem do celu, wolne ramię wskazuje nadlatującego speedera, ciężar spoczywa najpierw na tylnej nodze. Potem wyciągasz się w górę i trafiasz speedera jak najwyżej, lekko przed ciałem. W chwili trafienia przedramię wkręca się, a nadgarstek strzela — ten sam bat co przy drivie, tylko nad głową.\n\nUderzenie nad głową grasz w dwóch odmianach. Clear defensywny bijesz wysoko i daleko: daje ci czas, gdy jesteś pod presją, i wypycha przeciwnika głęboko w tył. Clear ofensywny bijesz płasko i szybko: przechodzi ponad przeciwnikiem, który stoi zbyt daleko z przodu, zanim ten wróci.\n\nWysoki punkt kontaktu jest jak zrywanie jabłka z najwyższej gałęzi — wyciągasz się cały, trafiasz w najwyższym punkcie swojego zasięgu. Kto pozwala speederowi opaść i trafia dopiero na wysokości głowy, traci wysokość, tempo i kontrolę.\n\nWysoki punkt kontaktu to połowa sukcesu. Wszystko w uderzeniu nad głową stoi i pada z tym, że trafiasz wcześnie i wysoko.',
  {
    titel: 'Trafiać wysoko i wcześnie',
    ziel: 'Trafiać uderzenie nad głową w najwyższym punkcie, z ustawieniem bokiem i batem.',
    schritte: [
      'Ustaw się bokiem do celu, wolne ramię wskazuje w górę na wyobrażonego speedera, ciężar na tylnej nodze.',
      'Ćwicz najpierw ruch bez speedera: wyciągnięcie, trafienie u góry, wkręcenie przedramienia, strzał nadgarstka.',
      'Potem podrzuć sobie speedera wysoko albo niech ktoś ci go dorzuci i trafiaj go jak najwyżej, lekko przed ciałem.',
      'Zagraj najpierw kilka defensywnych, wysokich clearów, potem kilka płaskich, ofensywnych.',
      'Wróć po każdym uderzeniu do pozycji centralnej.',
    ],
    steigerung: 'Niech ktoś dorzuca ci speedery na różne wysokości i głębokości, tak byś najpierw musiał ruszyć do piłki, zanim trafisz u góry.',
    selbstkontrolle: 'Czy trafiasz speedera naprawdę nad głową i przed ciałem, czy punkt kontaktu zsuwa się w dół i za ciebie? Zbyt niski punkt kontaktu to najczęstszy błąd — wtedy przeważnie nie gra jeszcze praca nóg, która ma cię w porę doprowadzić pod speedera.',
    abschluss: 'Uderzenie nad głową otwiera drzwi do smecza — to ruch, z którego powstaje uderzenie atakujące.',
  },
  // b2 erklaerteil (Smash)
  'Smecz to twoje uderzenie kończące — mocna piłka z góry na dół, którą kończysz punkt. Wyrasta wprost z uderzenia nad głową: to samo przygotowanie, ale trafiasz jeszcze nieco bardziej z przodu i bijesz stromo w dół w pole przeciwnika.\n\nNajwiększa pułapka to myśl, że smecz musi być przede wszystkim mocny. W rzeczywistości wygrywa smecz powtarzalny, nie najszybszy. Kto zbije trzy, cztery smecze z rzędu czysto i z umiejscowieniem, kruszy obronę przeciwnika — odbicia z każdym razem słabną. Pojedyncze szaleńcze uderzenie, które chybi, nie daje za to nic.\n\nTrzy rzeczy czynią smecz nośnym. Praca nóg, która w porę doprowadza cię za i pod speedera — bez niej stoisz źle, a smecz sam wpędza cię w kłopoty. Timing, by trafiać speedera wcześnie i wysoko. I urozmaicenie: zmieniasz kąt, tempo i cel — żaden przeciwnik nie znajdzie kontry.\n\nPomyśl o młotku, który trafia gwóźdź — siła bierze się z precyzyjnego, wyczutego w czasie uderzenia z góry, nie z dzikiego walenia. Umiejscowiony, powtarzalny smecz jest groźniejszy niż pojedynczy mocny.\n\nI punkt, o którym wielu zapomina: po smeczu natychmiast wracasz do pozycji centralnej. Dobry przeciwnik odeśle także mocny smecz — i wtedy musisz być gotów.',
  {
    titel: 'Stałość ponad tempo',
    ziel: 'Zbić kilka umiejscowionych smeczy z rzędu czysto, zamiast jednego maksymalnie mocnego.',
    schritte: [
      'Niech ktoś dorzuca ci wysokie speedery, które możesz zaatakować nad głową.',
      'Zbij smecz stromo w dół w pole przeciwnika — z batem, ale kontrolowanie, nie maksymalnie.',
      'Celuj w określony obszar pola, nie po prostu w dół.',
      'Wróć po każdym smeczu natychmiast do pozycji centralnej, zanim nadejdzie następny speeder.',
      'Policz, ile smeczy z rzędu umieścisz czysto i w obszarze celu.',
    ],
    steigerung: 'Świadomie zmieniaj kąt i tempo: raz stromiej i wolniej, raz płaściej i szybciej. Celem jest, byś kontrolował kilka smeczy z rzędu, nie żeby jeden był szczególnie mocny.',
    selbstkontrolle: 'Czy twoja jakość pozostaje równa przez kilka smeczy, czy załamuje się po pierwszym mocnym uderzeniu? Czy po smeczu tracisz pozycję centralną? Stałość i powrót są ważniejsze niż maksymalne tempo pojedynczego uderzenia.',
    abschluss: 'Smecz to nagroda za dobre przygotowanie — niosą go praca nóg i uderzenie nad głową. Bez nich staje się ryzykiem.',
  },
  // b3 erklaerteil (Stopp)
  'Nie każdy punkt powstaje przez siłę. Skrót to przeciwieństwo smecza: subtelnie dozowana, krótka piłka, która ląduje tuż za strefą neutralną w przednim obszarze pola przeciwnika. Zaskakuje przeciwnika, który stoi daleko z tyłu i spodziewa się mocnego uderzenia.\n\nJego bronią jest zwód. Skrót przygotowujesz tak samo jak mocny drive czy clear — to samo ustawienie, ta sama droga zamachu. Dopiero w ostatniej chwili zdejmujesz tempo i pozwalasz speederowi miękko opaść za strefą. Przeciwnik czyta twoje przygotowanie jako atak, stoi głęboko, a speeder skapuje przed nim.\n\nSztuka tkwi w dozowaniu. Speeder musi ledwie przejść ponad strefą neutralną i potem krótko opaść. Za dużo tempa, a stanie się łatwą piłką dla przeciwnika. Za mało, a wyląduje w strefie. To subtelne czucie rozwijasz tylko przez wiele powtórzeń.\n\nSkrót jest jak piłka delikatnie przełożona przez mur, która spada tuż za nim — akurat dość siły, by przejść na drugą stronę, i ani odrobiny więcej.\n\nSkrót działa najsilniej w przemianie z twoimi mocnymi uderzeniami. Najpierw głęboki clear, który wypycha przeciwnika w tył, potem skrót do przodu — ta przemiana długiego i krótkiego to jedna z najskuteczniejszych broni w grze zaawansowanej.',
  {
    titel: 'Miękko ponad strefą',
    ziel: 'Subtelnie dozowanego speedera pozwolić opaść tuż za strefą neutralną.',
    schritte: [
      'Wyłóż w przednim obszarze pola przeciwnika, tuż za strefą, znacznik celu.',
      'Przygotuj uderzenie jak normalny drive — to samo ustawienie, ta sama droga zamachu.',
      'Zdejmij w ostatniej chwili tempo i pozwól speederowi miękko opaść ponad strefą.',
      'Celuj w to, by opadł krótko za strefą, przy twoim znaczniku.',
      'Policz swoje trafienia i zmieniaj kierunek.',
    ],
    steigerung: 'Graj na przemian: głęboki clear w tył, potem skrót do przodu. Tak ćwiczysz zwód i przełączanie między długim a krótkim.',
    selbstkontrolle: 'Czy speeder opada tuż za strefą, czy kładziesz go za długo (łatwa piłka dla przeciwnika) lub za krótko (w strefę)? I czy po twoim przygotowaniu już widać, że nadchodzi skrót? Im bardziej przygotowanie równa się mocnemu uderzeniu, tym skuteczniejszy zwód.',
    abschluss: 'Skrót żyje z kontrastu. Sam dla siebie jest tylko krótką piłką — w przemianie z twoimi mocnymi uderzeniami staje się bronią.',
  },
  // b4 erklaerteil (Schnitt)
  'Do tej pory chodziło o to, by trafiać speedera czysto i pełno. Podcięcie to zaawansowane narzędzie, które świadomie działa inaczej: muskasz speedera z boku lub od dołu i nadajesz mu przez to rotację. Ta rotacja czyni jego tor lotu i zachowanie trudniejszymi do odczytania dla przeciwnika.\n\nSpeeder jest z natury stabilny i leci prosto. Właśnie to wykorzystujesz, zakłócając to. Jeśli przy trafieniu muśniesz go lekko z boku, zamiast trafić pełno, dostaje podkręcenie. Tor lotu lekko się zakrzywia, tempo się zmienia, a przeciwnik trudniej oceni piłkę.\n\nPodcięcie ma swoją cenę: podcięta piłka jest wolniejsza i oddajesz nieco kontroli. Dlatego stosujesz je celowo, nie bez przerwy. Opłaca się jako zaskoczenie, jako urozmaicenie, by wybić przeciwnika z rytmu — zwłaszcza przy krótkich piłkach i przy serwisie.\n\nPodcięta piłka jest jak rzut z efektem w petanque czy tenisie stołowym — dociera inaczej, niż spodziewa się oko, a to małe zamieszanie często wystarcza do błędu przeciwnika.\n\nPodcięcie to program dowolny, nie obowiązkowy. Buduje się na pewnym, pełnym trafianiu — kto jeszcze nie trafia speedera niezawodnie czysto, ćwiczy najpierw to. Kto to opanowuje, zyskuje z podcięciem subtelną dodatkową barwę.',
  {
    titel: 'Nadać speederowi podkręcenie',
    ziel: 'Kontrolowanie podciąć speedera i poczuć zmieniony tor lotu.',
    schritte: [
      'Zacznij od prostego uderzenia i muśnij speedera przy trafieniu lekko z boku, zamiast trafić pełno.',
      'Obserwuj, jak zmieniają się tor lotu i tempo w porównaniu z pełnym trafieniem.',
      'Wypróbuj podcięcie najpierw przy serwisie, gdzie możesz trafiać w spokoju.',
      'Potem przenieś je na krótkie piłki w grze.',
      'Świadomie zmieniaj między pełnym trafieniem a podcięciem.',
    ],
    selbstkontrolle: 'Czy mimo podcięcia trafiasz speedera kontrolowanie, czy tracisz kierunek? Podcięcie może kosztować kontrolę tylko trochę — jeśli traci się za dużo dokładności, trafiasz jeszcze zbyt niepewnie i lepiej ćwicz najpierw dalej pełne trafianie.',
    abschluss: 'Podcięcie to urozmaicenie na szczególne momenty. Oszczędnie i celowo użyte wybija przeciwnika z rytmu.',
  },
  // b5 erklaerteil (Beinarbeit-System)
  'W części dla początkujących poznałeś cykl podstawowy: pozycja centralna, split-step, wyjście do piłki, powrót do środka. Teraz wypełniasz ten cykl poszczególnymi typami kroków, które czynią każdą strefę twojego pola najszybciej osiągalną. To pełny system pracy nóg.\n\nNiosą go cztery typy kroków. Chassé to boczny krok dostawny, w którym stopy nigdy się nie krzyżują — pozostajesz w równowadze i często przygotowujesz nim następny krok. Wykrok to najczęściej używany krok: głęboki, eksplozywny wypad w narożnik, stopą po stronie uderzenia w przód, który doprowadza cię stabilnie i daleko do speedera. Skok nożycowy doprowadza cię do głębokich, wysokich speederów w tylnym obszarze — odbijasz się, zmieniasz w powietrzu ustawienie nóg i wracasz na ziemię gotów do uderzenia. Skok blokujący przechwytuje szybkie piłki z boku, gdy nie ma czasu na cały krok.\n\nDecydujące jest, byś dla każdej strefy wybierał odpowiedni krok — i po każdym uderzeniu czystym krokiem powrotnym wracał do pozycji centralnej. Krok powrotny jest najniepozorniejszy i najważniejszy: za każdym razem od nowa odtwarza cykl.\n\nPomyśl o szermierzu. Jego stopy nigdy nie stają przypadkowo — każdy krok ma formę i cel, a po każdym ataku natychmiast wraca do postawy podstawowej. Właśnie tej ekonomii szukasz dla swojego pola.\n\nTen system biegnie kiedyś nieświadomie. Na początku wybierasz krok świadomie; z czasem ciało wybiera go samo — i wtedy wszędzie jesteś w porę.',
  {
    titel: 'Przypisać kroki do stref',
    ziel: 'Dla każdej strefy pola przywołać odpowiedni typ kroku i czysto wrócić.',
    schritte_teil1: [
      'Ćwicz typy kroków najpierw pojedynczo, bez speedera: chassé w bok, wykrok w przednie narożniki, skok nożycowy w tył, skok blokujący w bok.',
      'Zwróć uwagę przy chassé, by stopy nigdy się nie krzyżowały.',
      'Wróć po każdym kroku krokiem powrotnym do pozycji centralnej.',
    ],
    schritte_teil2: [
      'Niech ktoś teraz dorzuca ci speedery w różne strefy.',
      'Wybierz dla każdej strefy odpowiedni krok, zagraj speedera i wróć.',
      'Zwiększaj tempo dopiero, gdy przypisanie krok-do-strefy siedzi.',
    ],
    selbstkontrolle: 'Czy dla każdej strefy wybierasz odpowiedni krok, czy wszędzie biegniesz tymi samymi krokami? I czy po każdej piłce niezawodnie wracasz do pozycji centralnej? System niesie dopiero wtedy, gdy wybór kroku i powrót działają płynnie.',
    abschluss: 'System pracy nóg to podstawa wszystkich zaawansowanych uderzeń — tylko kto w porę i dobrze stoi, może czysto zagrać clear, smecz i skrót.',
  },
  // delta0 anzeigetitel + erklaerteil (Handgelenk BAD)
  'Włączyć nadgarstek — dla graczy przechodzących z badmintona',
  'Bata nie musisz dopiero się uczyć — wnosisz go ze sobą. W badmintonie niemal każde uderzenie żyje z nadgarstka, a twój strzał jest prawdopodobnie już szybki i czysty. To prawdziwa zaleta.\n\nCo dostosowujesz, to balans między nadgarstkiem a przedramieniem. Twoja rakieta badmintonowa jest długa i elastyczna i strzela przy uderzeniu razem z tobą; sam nadgarstek wystarcza tam do dużego tempa. Twój sprzęt tutaj jest krótszy, sztywniejszy i mocniej naciągnięty, a speeder jest wyraźnie cięższy niż lotka. Sam strzał nadgarstka przenosi na tym sprzęcie mniej.\n\nDlatego przenieś część pracy z nadgarstka w rotację przedramienia i mocniejszy chwyt w chwili trafienia. Bat pozostaje — ale przychodzi teraz mocniej z wkręcającego się przedramienia, a mniej z wyizolowanego nadgarstka. To to samo przeważenie siły, które poznałeś już przy drivie forhendowym, tylko przeniesione na szybsze, mocniejsze uderzenia.\n\nMały test: zagraj kilka mocnych drive’ów i zwróć uwagę, skąd bierze się tempo. Jeśli bierze się niemal tylko z nadgarstka, a przedramię pozostaje bierne, tracisz na sztywnym sprzęcie siłę. Jeśli przedramię wkręca się razem, a chwyt w chwili trafienia krótko się usztywnia, energia przenosi się czysto.',
  // delta1 anzeigetitel + erklaerteil (Überkopf BAD)
  'Uderzenie nad głową — dla graczy przechodzących z badmintona',
  'To uderzenie znasz niemal jeden do jednego. Ustawienie bokiem, ramię wskazujące, wyciągnięcie w górę, strzał w najwyższym punkcie — twój badmintonowy clear i twoje uderzenie nad głową tutaj dzielą ten sam ruch. Motorycznie ledwie musisz się uczyć na nowo.\n\nCo się zmienia, to cel twojego toru lotu. W badmintonie unosisz clear wysoko nad siatkę aż na tylną linię — wysokość jest częścią celu. Tutaj nie ma siatki. Na jej miejscu leży strefa neutralna, a pokonujesz ją płaskim, dalekim torem głęboko w pole przeciwnika, zamiast wysokością.\n\nSwój clear defensywny możesz dalej grać wysoko, gdy potrzebujesz czasu — ale nawet on biegnie płaściej niż w badmintonie, bo nie ma wysokości siatki do pokonania. Twój clear ofensywny robi się wyraźnie płaski i szybki: wyciągnięty tor, który przechodzi ponad przeciwnikiem, zamiast wysokiego łuku.\n\nMały test: obserwuj tor swojego cleara. Czy speeder najpierw wznosi się stromo, jakbyś musiał pokonać siatkę? To znaczy, że wciąż grasz badmintonową wysokość. Celem jest płaściejszy, daleki tor, który mostem przechodzi ponad strefą i dociera głęboko.',
  // delta2 anzeigetitel + erklaerteil (Beinarbeit BAD)
  'System pracy nóg — dla graczy przechodzących z badmintona',
  'Poszczególne kroki znasz: chassé i wykrok są w badmintonie jak tutaj u siebie, skok nożycowy jest ci znany z wysokich piłek. Typów kroków ledwie musisz się uczyć na nowo.\n\nCo przeuczasz, to ich porządek w przestrzeni — i to największa różnica w ogóle. Twoja badmintonowa praca nóg jest zbudowana wokół siatki. Myślisz w przednim i tylnym obszarze, twoje centrum leży blisko krótkiej linii serwisowej, i jesteś zawsze zwrócony do siatki. Całej tej mapy tutaj nie ma.\n\nTwoje pole to kwadrat bez siatki, i bronisz go z jego środka — na wszystkie cztery narożniki równo. Są cztery równorzędne narożniki wokół symetrycznego centrum, nie ma przodu i tyłu w sensie siatki. Skok blokujący przechwytuje tu szybkie piłki z boku, nie atak przy siatce. A twój powrót prowadzi w środek kwadratu, nie na pozycję przy siatce.\n\nUstaw więc swoją wewnętrzną mapę na nowo: precz od zorientowanego na siatkę przodu-tyłu, ku symetrycznemu kwadratowi z czterema równymi narożnikami. Nogi już umieją kroki — muszą się tylko nauczyć myśleć w tej nowej geometrii.\n\nMały test: łapiesz się na tym, że po uderzeniu ustawiasz się jak przy siatce do przodu albo faworyzujesz „tył"? To znaczy, że wciąż niesie cię badmintonowa mapa. Celem jest równomierne krycie wszystkich czterech narożników ze środka kwadratu.',
];

const TAKTIK = [
  // b0 umschalten
  'Atak i obrona — przełączanie',
  'W taktyce dla początkujących chodziło o to, by grać pewnie i zmuszać przeciwnika do błędów. Teraz dochodzi decydujące pytanie taktyki zaawansowanej: w jakiej roli właśnie jesteś — atakujesz czy bronisz? I kiedy jedna rola przechodzi w drugą?\n\nKażda wymiana porusza się między dwoma stanami. Jesteś w ataku, gdy możesz grać speedera z góry na dół i naciskać przeciwnika. Jesteś w obronie, gdy sam jesteś pod presją i musisz najpierw utrzymać wymianę przy życiu. Między obojgiem leży najważniejszy moment w ogóle: przełączanie.\n\nMoment przełączenia to chwila, w której karta się odwraca — gdy przeciwnik zagra słabą piłkę i możesz z obrony przejść do ataku, albo gdy zdarzy ci się błąd i nagle musisz bronić. Kto ten moment rozpoznaje wcześnie, jest o krok do przodu. Kto go przegapia, atakuje za późno albo broni za późno.\n\nPomyśl o przeciąganiu liny. Przez większość czasu obie strony trzymają napięcie. Ale są momenty, w których jedna zaczyna się zsuwać — i właśnie wtedy musisz ciągnąć, z całej siły i natychmiast. Kto ten moment prześpi, oddaje przewagę.\n\nTaktyka zaawansowana żyje z tego spojrzenia: rozpoznać, w jakiej jesteś roli i kiedy się przechyla, zamiast tylko grać następną piłkę. Kolejne moduły pokazują, jak w ataku budujesz punkt, jak wykorzystujesz moment przełączenia do smecza i jak przetrwać w obronie.',
  'Zwróć w następnym meczu uwagę na role: czy zauważasz, kiedy jesteś w ataku, a kiedy w obronie? Spróbuj zauważyć moment, w którym się przechyla — słaba piłka przeciwnika, którą mógłbyś zaatakować, albo własny błąd, który wpycha cię do defensywy. Nie musisz jeszcze niczego robić inaczej. Na początek wystarczy, że zaczynasz widzieć wymianę w tych dwóch rolach i ich punkcie zwrotnym.',
  // b1 punkt_aufbauen
  'Budowanie punktu — długo i krótko',
  'Początkujący reaguje na każdą piłkę osobno. Gracz zaawansowany buduje punkt — gra serię uderzeń z planem, na końcu której stoi otwarta szansa. Najważniejsze narzędzie do tego właśnie poznałeś: przemianę długich i krótkich piłek.\n\nWzorzec podstawowy jest prosty i skuteczny. Grasz głęboki clear, który wypycha przeciwnika daleko w tył. Musi biec z powrotem, wziąć piłkę wysoko, i w tym momencie jego przód stoi otworem. Teraz kładziesz skrót krótko przed strefą. Przeciwnik, przed chwilą jeszcze w tyle, nie zdąży już do przodu. Długo, potem krótko — i punkt jest przygotowany.\n\nWzorzec działa też odwrotnie: gdy ściągniesz przeciwnika skrótem do przodu, jego tył stoi otworem na następną głęboką piłkę. Decydujące jest, byś każdym uderzeniem wyprowadzał przeciwnika o kawałek bardziej z równowagi, zamiast grać mu piłkę wygodnie w środek.\n\nJesteś bokserem, który składa kombinację, zamiast liczyć na pierwsze trafienie — jedno uderzenie otwiera gardę, następne trafia w lukę. Żadna pojedyncza piłka nie wygrywa punktu; robi to sekwencja.\n\nWażna jest cierpliwość. Budowa wymaga kilku uderzeń, i nie każde kończy się winnerem. Często wystarczy poruszyć przeciwnika tak daleko, że sam popełni błąd. Budowa to most między pewną grą a aktywnym atakiem.',
  {
    titel: 'Łączyć długie i krótkie',
    ziel: 'Poruszać przeciwnika przemianą cleara i skrótu i wytworzyć otwartą szansę.',
    schritte: [
      'Graj z partnerem: jeden się porusza, drugi buduje.',
      'Zacznij od głębokiego cleara, który wypycha partnera w tył.',
      'Połóż następną piłkę jako skrót krótko przed strefą.',
      'Obserwuj, czy partner zdąży do przodu — i zagraj kombinację także odwrotnie (krótko, potem długo).',
      'Zmieńcie po kilku rundach role.',
    ],
    steigerung: 'Wpleć trzecią stację: clear w tył, skrót do przodu, a gdy partner ledwie dosięgnie skrótu, znów pociągnij długo. Trzy uderzenia, jeden plan.',
    selbstkontrolle: 'Czy faktycznie wyprowadzasz partnera z równowagi, czy grasz mu piłki wygodnie osiągalne? Budowa działa tylko wtedy, gdy każde uderzenie ściąga przeciwnika o kawałek dalej z pozycji centralnej.',
    abschluss: 'Budowa punktu to figura podstawowa zaawansowanego ataku. Gdy przemiana długie-krótkie siedzi, smecz jako zakończenie przychodzi niemal sam.',
  },
  // b2 smash_vorbereiten
  'Przygotowanie smecza',
  'Smecz to twoje najmocniejsze uderzenie — ale wygrywa punkt tylko wtedy, gdy przychodzi z właściwej sytuacji. Smecz ze złej pozycji sam wpędza cię w kłopoty. Ten moduł pokazuje, jak wytworzyć moment, w którym smecz siedzi.\n\nKluczem jest piłka, która otwiera ci szansę. Dobry smecz rzadko przychodzi znikąd. Przeważnie poprzedza go uderzenie, które zmusza przeciwnika do podbicia speedera wysoko — głęboki clear, który wypycha go w tył, albo piłka, która wyprowadza go z równowagi. Właśnie to wysokie, słabe odbicie jest twoim zaproszeniem do smecza.\n\nDlatego obowiązuje: rozpoznaj moment przełączenia. Gdy przeciwnik pod presją zagra wysoką, krótką piłkę, to twój sygnał, by z budowy przejść do zakończenia. Jeśli natomiast piłka stoi zbyt nisko lub zbyt daleko, lepiej przytrzymaj i buduj dalej, zamiast wymuszać zły smecz.\n\nI jak już przy technice: stałość bije maksymalne tempo. Dwa, trzy umiejscowione smecze z rzędu kruszą obronę bardziej niż pojedynczy mocny, który chybi. Po każdym smeczu natychmiast wracasz, gotów na odbicie.\n\nSmecz to gwóźdź, ale budowa to zamach młotkiem. Bez zamachu — piłki, która otwiera przeciwnika — trafiasz w pustkę. Kto tylko wpatruje się w gwóźdź i wali dziko, chybia go.',
  {
    titel: 'Kończyć z budowy',
    ziel: 'Zagrać smecz z przygotowanej sytuacji, nie wymuszać go.',
    schritte: [
      'Graj z partnerem, który podaje ci piłki.',
      'Zacznij od głębokiego cleara, który wypycha partnera w tył.',
      'Czekaj na jego odbicie: przyjdzie wysoko i krótko — atakuj smeczem. Przyjdzie nisko — buduj dalej.',
      'Ćwicz świadomie obie decyzje — kończyć i przytrzymać.',
      'Wróć po każdym smeczu natychmiast do pozycji centralnej.',
    ],
    steigerung: 'Pozwól partnerowi odgrywać dowolnie. Trenuj oko, by wśród wielu odbić rozpoznać to jedno wysokie, słabe i tylko je atakować.',
    selbstkontrolle: 'Czy smeczujesz tylko z dobrych pozycji, czy wymuszasz zakończenie także ze złych? Przytrzymany smecz ze złego położenia to lepsza decyzja niż wymuszony, który sam wpędza cię do defensywy.',
    abschluss: 'Przygotowany smecz to plon całej budowy. Cierpliwość w budowie i zdecydowanie we właściwym momencie należą do siebie.',
  },
  // b3 gegner_lesen_muster
  'Czytanie przeciwnika i łamanie schematów',
  'W taktyce dla początkujących poznałeś jedną słabość przeciwnika: bekhend. Teraz idziesz dalej i czytasz całego przeciwnika — jego nawyki, jego upodobania, to, co pod presją robi raz za razem.\n\nKażdy gracz ma schematy. Jeden pod presją niemal zawsze gra pewną piłkę w środek. Drugi próbuje w potrzebie ryzykownego winnera. Jeden po swoim uderzeniu wraca tylko powoli. Drugi kryje swój bekhend tak lękliwie, że jego strona forhendowa stoi otworem. Kto te schematy rozpoznaje, często zna następną piłkę przeciwnika, zanim ten ją zagra.\n\nCzytanie ma dwa poziomy. Pierwszy to wczesne czytanie toru lotu: po ustawieniu przeciwnika, jego zamachu i punkcie kontaktu wcześnie rozpoznajesz, dokąd idzie piłka — i ruszasz, zanim zostanie uderzona. Drugi to rozpoznawanie schematów przez całego seta: zapamiętujesz, co przeciwnik robi w jakiej sytuacji, i nastawiasz się na to.\n\nAle czytanie idzie w obie strony. Podczas gdy ty czytasz przeciwnika, on czyta ciebie. Dlatego do gry zaawansowanej należy łamanie własnych schematów — nie zawsze ten sam serwis, nie zawsze ta sama odpowiedź na tę samą piłkę. Kto jest przewidywalny, zostaje odczytany.\n\nDobry gracz jest jak szachista, który myśli dwa ruchy naprzód — widzi schemat przeciwnika i zarazem łamie własny. Gra staje się wyścigiem, kto pierwszy przejrzy drugiego.',
  'Weź sobie w następnym meczu na cel jednego przeciwnika i poszukaj jednego jedynego schematu: co robi, gdy jest pod presją? Dokąd najchętniej gra swój serwis? Jak szybko wraca do środka? Jeden rozpoznany schemat wystarcza, by zyskać przewagę. A potem próba odwrotna: czy sam masz schemat, który przeciwnik mógłby odczytać? Obserwuj własny serwis — czy zawsze przychodzi tak samo?',
  // b4 doppel_grundlagen
  'Gra podwójna — podstawy',
  'Debel to osobna gra. Dwoje graczy dzieli kwadrat, a cały urok tkwi w tym, jak dzielicie między siebie powierzchnię i zadania. Kto gra debla jak singiel we dwoje, staje sobie nawzajem na drodze.\n\nStruktura podstawowa jest jasno uregulowana. Dzielicie się na gracza atakującego i gracza tylnego. Gracz tylny stoi z tyłu i kryje głębokie piłki, gracz atakujący stoi z przodu i kładzie krótkie, mocne uderzenia. Stała reguła ogranicza wasze ustawienie: gracz tylny w chwili trafienia nie może postawić tylnej stopy przed stopę partnera — inaczej punkt jest stracony. Ta reguła trzyma role czysto rozdzielone.\n\nSzczególny jest porządek serwisu. Serwującym jest zawsze gracz tylny, a prawo serwisu wędruje w stałej kolejności przez wszystkich czterech graczy: od gracza jednej strony do atakującego drugiej, potem do odpowiednich partnerów. Z każdą zmianą prawa serwisu role mogą ułożyć się na nowo. Po serwisie możecie poruszać się swobodnie — ale wyobrażony podział na przód i tył pozostaje waszym rusztowaniem.\n\nNajważniejsze w deblu jest porozumienie. Kto bierze piłkę w środku? Kto kryje który narożnik? Krótki okrzyk, ustalony znak — bez komunikacji oboje biegną do tego samego speedera albo nikt.\n\nDobry debel jest jak dwoje ochroniarzy przy szerokich drzwiach. Każdy kryje swoją stronę, rozmawiają ze sobą, a w środku jest wcześniej jasne, kto łapie. Dwoje, którzy się nie dostrajają, zostawiają lukę właśnie w środku.',
  {
    titel: 'Role i porozumienie',
    ziel: 'Jako para utrzymać podział atak/tył i wyjaśnić środek.',
    schritte: [
      'Ustawcie się jako para: jeden jako gracz atakujący z przodu, jeden jako gracz tylny z tyłu.',
      'Niech ktoś podaje wam piłki w różne obszary i ćwiczcie, kto którą piłkę bierze.',
      'Ustalcie wcześniej przez umowę, kto bierze piłki w środku.',
      'Wołajcie przy każdej piłce w środku krótko, kto ją gra.',
      'Zmieńcie po kilku rundach role i ćwiczcie też zmianę ról przy zmianie serwisu.',
    ],
    selbstkontrolle: 'Czy zawsze jest jasne, kto którą piłkę bierze — zwłaszcza w środku? Czy podział na przód i tył się utrzymuje, czy wchodzicie sobie w drogę? Debel działa przez jasność ról i wołanie, nie przez dwóch pojedynczych graczy obok siebie.',
    abschluss: 'To są podstawy. Debel ma własną, głęboką taktykę — tutaj kładziesz fundament: jasne role i ciągłe porozumienie.',
  },
  // b5 engen_satz_fuehren
  'Prowadzenie wyrównanego seta',
  'Set rzadko rozstrzyga się równomiernie. Są momenty, które ważą więcej niż inne — niewielka przewaga, strata, a przede wszystkim końcówka wyrównanego seta. Jak prowadzisz te momenty taktycznie, decyduje często o całym meczu. To strona taktyczna; spokój mentalny do tego znajdziesz w części mentalnej.\n\nCrossminton ma regułę, która zaostrza końcówkę szczególnie: od 15:15 potrzebujesz dwóch punktów przewagi, a prawo serwisu zmienia się po każdym punkcie. Każda pojedyncza wymiana waży teraz ciężko, i nikt nie może odskoczyć kilkoma serwisami z rzędu. Wyrównany set staje się próbą nerwów — i sprawdzianem taktycznym.\n\nNajważniejsza decyzja taktyczna w ciasnym momencie to wybór pewności. Właśnie teraz, gdy każdy punkt się liczy, pokusa szukania efektownego winnera jest wielka. To przeważnie błąd. W ciasnocie wygrywa ten, kto pozwala przeciwnikowi popełnić błąd — pewne piłki, wysokie zaangażowanie w wymianę, żadnego zbędnego ryzyka. Przerzucasz odpowiedzialność za następny błąd na drugą stronę.\n\nNiewielką przewagę zarządzasz podobnie: nie robisz się bierny, ale wybierasz pewne opcje i zmuszasz przeciwnika do szukania ryzyka. Kto przewagę roztrwoni ryzykownymi uderzeniami, sam ją oddał.\n\nWyrównany set jest jak niesienie pełnej misy ostatnie kroki do stołu. Teraz nie czas na wielkie gesty — teraz liczy się spokojny, pewny krok. Kto na końcu zrobi się nerwowy, rozleje wszystko tuż przed celem.',
  'Wróć myślami do wyrównanego seta, który przegrałeś: czy pod koniec robiłeś się bardziej ryzykowny, czy bardziej pewny? Wielu przegrywa ciasnotę, bo właśnie wtedy szuka efektownej piłki. Postanów sobie na następny wyrównany set jedną jedyną regułę taktyczną: od 15:15 gram pewną piłkę i pozwalam przeciwnikowi nieść ryzyko. Obserwuj, czy wynik się zmienia.',
  // delta0 anzeigetitel + erklaerteil (Doppel BAD)
  'Gra podwójna — dla graczy przechodzących z badmintona',
  'Debla znasz — ale debel badmintonowy i debel crossmintona to mimo tej samej idei podstawowej dwie różne gry. Twoje wygrane deblowe odruchy pasują tu tylko częściowo.\n\nW badmintonie rotujecie nieustannie. W ataku stoicie jeden za drugim (przód i tył), w obronie obok siebie (bok w bok), i płynnie zmieniacie między obiema formacjami — wszystko zorganizowane wokół siatki. Ta ciągła rotacja siedzi w tobie głęboko.\n\nW crossmintonie tej płynnej rotacji nie ma. Role są stałe: gracz atakujący z przodu, gracz tylny z tyłu. Są związane z prawem serwisu, zamiast swobodnie zmieniać się w wymianie — z każdą zmianą serwisu układają się na nowo. Do tego dochodzi reguła, której w badmintonie nie ma: gracz tylny w chwili trafienia nie może postawić tylnej stopy przed stopę partnera. I nie ma siatki, do której ustawiają się wasze formacje — tylko wspólny kwadrat.\n\nPrzestaw więc swoje wyobrażenie debla: precz od płynnej rotacji przy siatce, ku stałemu podziałowi ról w kwadracie, który układa się z serwisem. Także kolejność serwisu jest stała (A1 do B1 do A2 do B2) i trzeba się jej nauczyć.\n\nMały test: łapiesz się z partnerem na odruchowym przechodzeniu w obronę bok w bok albo w rotację przód-tył? To znaczy, że wciąż niesie cię debel badmintonowy. Celem jest stały, związany z serwisem podział ról w kwadracie bez siatki.',
];

const r1 = insertPl('data/bausteine.fortgeschritten-technik.json', TECHNIK);
const r2 = insertPl('data/bausteine.fortgeschritten-taktik.json', TAKTIK);
console.log(`Ring 5 pl: technik ${r1.knoten} + taktik ${r2.knoten} = ${r1.knoten + r2.knoten} Knoten.`);
