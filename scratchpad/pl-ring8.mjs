// Ring 8 (pl): Experte-Technik (18) + Experte-Taktik (18) = 36 Knoten, delta-frei (herkunftsneutral).
import { insertPl } from './pl-core.mjs';

const TECHNIK = [
  'Zwód — ukrycie zamiaru',
  'Na poziomie eksperckim coraz częściej o punkcie decyduje ukryty zamiar, nie już samo lepsze uderzenie. Zwód to sygnatura eksperta: przeciwnik czyta twoje uderzenie błędnie, bo do ostatniej chwili nie zdradzasz mu, co nadejdzie.\n\nSekret tkwi w przygotowaniu, które zawsze wygląda tak samo. Czy uderzasz mocno, skracasz, czy grasz długo — twój najazd, twój zamach, twoja postawa ciała są identyczne. Dopiero w ostatniej chwili przed trafieniem decydujesz, które to będzie uderzenie. Finta siedzi na przebiegu, który i tak opanowujesz; dodajesz tylko późną decyzję.\n\nTiming jest wszystkim. Trzymasz uderzenie do ostatniej chwili i wtedy trafiasz — za wczesna decyzja cię zdradza, za późna psuje uderzenie. Przy zwodzie skrótu najpierw szybko się zamachujesz jak do mocnego uderzenia i dopiero tuż przed kontaktem zdejmujesz tempo.\n\nTwoje stopy opowiadają historię razem. Gdy udajesz smecz, twój najazd musi pasować do smecza — połowiczny ruch demaskuje fintę natychmiast. A po zwodzie natychmiast wracasz do równowagi, bo dobry przeciwnik dosięgnie także zwiedzionej piłki.\n\nZwód to pokerowa twarz. Twoje karty się zmieniają, twoja twarz pozostaje ta sama. Dopiero gdy jest za późno, przeciwnik widzi, co naprawdę trzymasz.\n\nJeszcze jedna zasada: stosować oszczędnie. Finta, którą przeciwnik widział już trzy razy, przestaje nią być. Zwód żyje z zaskoczenia, nie z powtarzania.',
  {
    titel: 'To samo przygotowanie, późna decyzja',
    ziel: 'Grać clear, skrót i mocne uderzenie z identycznego przygotowania i decydować dopiero późno.',
    schritte_teil1: [
      'Zagraj z tylnego pola clear, skrót i drive po kolei — ze świadomie identycznym przygotowaniem: ten sam najazd, ten sam zamach, także przy miękkim skrócie.',
      'Przesadzaj najpierw z pełnym przygotowaniem także przy skrócie, aż będzie się czuło tak samo jak przy mocnym uderzeniu.',
    ],
    schritte_teil2: [
      'Niech partner ci podaje i zdecyduj dopiero w ostatniej chwili, które z trzech uderzeń grasz.',
      'Przy zwiedzionym skrócie: szybki zamach jak do mocnego uderzenia, dopiero tuż przed kontaktem zdejmij tempo.',
      'Wróć po każdym uderzeniu natychmiast do równowagi.',
    ],
    selbstkontrolle: 'Zapytaj partnera, czy widzi twoje uderzenie wcześnie. Czy twoje przygotowanie już zdradza, co nadejdzie? Czy miękki skrót wygląda tak samo jak mocne uderzenie — do ostatniej chwili? Tylko naprawdę neutralne przygotowanie zwodzi.',
    abschluss: 'Zwód to istota gry eksperckiej. Stoi i pada z neutralnym przygotowaniem — i z powściągliwością, by pokazać go tylko we właściwym momencie.',
  },
  'Wczesne przyjmowanie speedera',
  'Czas to w crossmintonie najcenniejszy zasób. Ekspert kradnie go przeciwnikowi, przyjmując speedera wcześniej, niż przeciwnik się spodziewa — w najwyższym i najwcześniejszym punkcie, zamiast pozwolić mu opaść.\n\nKto trafia speedera wcześnie, dramatycznie skraca przeciwnikowi czas reakcji. Każdy ułamek sekundy, który grasz wcześniej, brakuje przeciwnikowi, by się pozbierać i wrócić. Z równorzędnej wymiany robi się taka, w której stale jesteś o krok do przodu.\n\nWczesne przyjmowanie wymaga trzech rzeczy razem. Wczesnego czytania toru lotu, byś wcześnie rozpoznał speedera i ruszył, zanim zostanie uderzony. Szybkiej pracy nóg, która w porę doprowadza cię na pozycję. I zwięzłego uderzenia, które bez długiego zamachu wykonuje się natychmiast. Brakuje jednego z tego, przychodzisz za późno.\n\nSzczególnie skuteczne jest przechwytywanie: bierzesz piłkę, którą przeciwnik spodziewa się dopiero za tobą, już z przodu z powietrza. To zaskakuje go podwójnie — ma mniej czasu i się tego nie spodziewa.\n\nWyobraź sobie, że łapiesz piłkę w locie, zamiast czekać, aż odbije się od ziemi. Kto zawsze sięga w najwyższym punkcie, dyktuje tempo — drugi dyszy z tyłu.\n\nWczesne przyjmowanie to także podstawa wielu innych uderzeń eksperckich: wczesny punkt kontaktu czyni twój zwód groźniejszym, a twój atak szybszym.',
  {
    titel: 'Sięgać w najwyższym punkcie',
    ziel: 'Trafiać speedera wcześniej i wyżej, by odebrać przeciwnikowi czas.',
    schritte: [
      'Niech ktoś ci podaje i trafiaj świadomie w najwcześniejszym, najwyższym punkcie, zamiast pozwalać opaść.',
      'Zadbaj o wczesny start — czytaj tor lotu już z ruchu podającego.',
      'Ćwicz przechwytywanie: piłki, które normalnie wziąłbyś za sobą, trafiaj już z przodu z powietrza.',
      'Trzymaj uderzenie przy tym zwięzłe, bez długiego zamachu.',
      'Zwiększaj tempo podania, gdy tylko wczesne trafianie niezawodnie się udaje.',
    ],
    selbstkontrolle: 'Czy trafiasz speedera naprawdę wcześniej niż zwykle, czy z nawyku pozwalasz mu opaść? Czy ze zwięzłym uderzeniem zdążasz na czas, czy zamachujesz się zbyt szeroko? Wczesne przyjmowanie udaje się tylko, gdy czytanie, nogi i zwięzłe uderzenie współgrają.',
    abschluss: 'Kto przyjmuje speedera wcześnie, dyktuje tempo. Ten skradziony czas to jedna z największych przewag w grze eksperckiej.',
  },
  'Zmiana tempa i rytmu',
  'Przeciwnik, który dostroił się do twojego tempa, gra przeciw tobie pewnie. Ekspert odbiera mu tę pewność, świadomie łamiąc tempo i rytm wymiany — raz szybko, raz wolno, bez zapowiedzi.\n\nKażda wymiana ma rytm, w który wchodzą oboje gracze. Właśnie ten rytm celowo zakłócasz. Po kilku szybkich, mocnych piłkach nagle nadchodzi wolna, wysoka — przeciwnik, nastawiony na tempo, jest zaskoczony. Po kilku spokojnych piłkach nieoczekiwanie nadchodzi szybka, która łapie go w niewłaściwym momencie.\n\nKluczem jest to, że zmiana nie jest zapowiedziana. Dlatego ten moduł buduje się na zwodzie: jeśli twoje przygotowanie zawsze wygląda tak samo, przeciwnik nie widzi nadchodzącej zmiany tempa. Dopiero speeder zdradza, że złamałeś tempo — wtedy jest za późno.\n\nSzczególnie skuteczna jest nagła zmiana wewnątrz twojego własnego ruchu: poruszasz się szybko do piłki, jak do mocnego uderzenia, i potem w ostatniej chwili zdejmujesz tempo. Ta rozbieżność między szybkim ruchem a wolnym uderzeniem szczególnie dezorientuje przeciwnika.\n\nPomyśl o muzyku, który w środku utworu łamie tempo. Kto kiwa się w równym takcie, gubi krok właśnie wtedy. Twoja gra ma opanować to złamanie taktu — przewidywalne tempo czyni cię czytelnym.\n\nJak przy zwodzie obowiązuje: zmiana działa przez zaskoczenie. Kto stale zmienia tempo, sam staje się przewidywalny w swojej nieprzewidywalności.',
  {
    titel: 'Złamać takt',
    ziel: 'Świadomie i bez zapowiedzi zmieniać tempo i rytm wewnątrz wymiany.',
    schritte: [
      'Graj z partnerem dłuższe wymiany i świadomie planuj zmiany tempa.',
      'Zagraj kilka szybkich piłek, potem nieoczekiwanie wolną, wysoką — i odwrotnie.',
      'Trzymaj przy tym swoje przygotowanie takie samo, by zmiana nie była zapowiedziana.',
      'Ćwicz zmianę wewnątrz ruchu: szybko do piłki, potem w ostatniej chwili zdejmij tempo.',
      'Obserwuj, czy partner przy zmianie gubi krok.',
    ],
    selbstkontrolle: 'Czy partner przez zmiany tempa wypada z rytmu, czy szybko się do nich dostraja? Czy twoje przygotowanie zdradza zmianę już wcześniej? Złamanie tempa działa tylko, gdy zaskakuje — a więc to samo przygotowanie i oszczędne użycie.',
    abschluss: 'Świadome łamanie tempa trzyma przeciwnika w niepewności. Razem ze zwodem czyni twoją grę trudną do odczytania.',
  },
  'Smecz z wyskoku',
  'Smecz z wyskoku to najpotężniejszy stopień rozbudowy twojego ataku. Odbijasz się, by trafić speedera jeszcze wyżej i wcześniej — i zyskujesz przez to stromszy kąt i więcej presji.\n\nZysk tkwi w wysokości. Im wyżej trafiasz, tym stromiej możesz zbić speedera w dół, i tym mniej czasu zostaje przeciwnikowi. Wyskok wynosi cię ponad punkt kontaktu, który osiągnąłbyś z ziemi, i łączy tak wysoki punkt kontaktu z siłą smecza. Dlatego buduje się na wczesnym przyjmowaniu: chodzi o najwcześniejszy i najwyższy możliwy kontakt.\n\nPrzebieg łączy odbicie i uderzenie w jeden ruch. Odbijasz się, trafiasz w najwyższym punkcie wyskoku pełnym batem i wracasz na ziemię gotów do uderzenia. Uderzenie dzieje się w powietrzu, w szczycie wyskoku.\n\nTu smecz z wyskoku jest zarazem sprawą fizyczną — i tu staranność jest ważna. Odbicie i lądowanie mocno obciążają nogi i stawy. Miękkie, kontrolowane lądowanie jest ważniejsze niż wysokość wyskoku. Buduj smecz z wyskoku stopniowo, na solidnej podstawie z siły i pracy nóg, a do części atletycznej w razie wątpliwości weź wykwalifikowane prowadzenie. Czysto wylądowany, kontrolowany wyskok bije dziki, wysoki.\n\nSmecz z wyskoku przypomina siatkarza, który wznosi się do ataku: wysokość tworzy kąt, z którego piłka spada nieosiągalnie w dół. Ale każdy dobry atakujący ląduje miękko i kontrolowanie.\n\nI jak przy smeczu z ziemi obowiązuje: stałość i powrót przed maksymalnym tempem. Po smeczu z wyskoku musisz natychmiast znów być w równowadze i gotowy.',
  {
    titel: 'Wysokość dla kąta',
    ziel: 'Grać smecz z kontrolowanego odbicia — z czystym, miękkim lądowaniem.',
    schritte_teil1: [
      'Ćwicz najpierw odbicie bez speedera: luźno się odbić, w najwyższym punkcie zaznaczyć ruch uderzenia, miękko i kontrolowanie wylądować.',
      'Zwracaj od początku uwagę bardziej na miękkie lądowanie niż na wysokość.',
    ],
    schritte_teil2: [
      'Niech ktoś podaje ci wysokie piłki i zbijaj smecz z odbicia, trafiony w szczycie.',
      'Celuj stromo w dół — wykorzystaj zyskaną wysokość dla kąta.',
      'Wracaj po każdym smeczu z wyskoku na ziemię gotów do uderzenia i w równowadze.',
      'Zwiększaj wysokość i tempo tylko powoli i na solidnej podstawie.',
    ],
    selbstkontrolle: 'Czy lądujesz miękko i kontrolowanie, czy twardo i z utratą równowagi? Czy trafiasz w szczycie wyskoku? Jeśli lądowanie nie jest czyste albo czujesz się niepewnie, cofnij wysokość wyskoku i buduj wolniej — a do części atletycznej weź wykwalifikowane prowadzenie.',
    abschluss: 'Smecz z wyskoku łączy wysokość, kąt i siłę. Opłaca się tylko z czystym lądowaniem i cierpliwą budową — kontrola stoi ponad wysokością.',
  },
  'Precyzja przy liniach',
  'Na poziomie eksperckim decydują centymetry. Piłka w środek pola jest łatwa do dosięgnięcia; piłka na skrajną linię nie. Ekspert gra świadomie przy krawędziach — z najmniejszym marginesem bezpieczeństwa i maksymalnym zyskiem.\n\nZysk z ciasnego umiejscowienia jest wielki. Im bliżej linii grasz, tym dalej musi biec przeciwnik i tym mniej ma czasu. Piłka, która pada dokładnie w narożnik, jest często nieosiągalna. Dlatego celujesz teraz w narożniki i linie, zamiast w całe pole.\n\nCeną jest ryzyko. Im ciaśniej celujesz, tym większe niebezpieczeństwo, że piłka pójdzie na aut. Sztuką eksperta jest świadome rozważenie: w którym momencie ciasny cel się opłaca, a kiedy wystarczy pewna piłka? Przy wyraźnej przewadze grasz ciasno i kończysz punkt; pod presją lub w wyrównanym secie bierzesz nieco marginesu, zamiast ryzykować błąd.\n\nTa precyzja powstaje tylko przez wiele powtórzeń. Trenujesz oko i rękę, by przynosić speedera coraz ciaśniej do celu, nie tracąc kontroli.\n\nPrecyzja przy liniach jest jak nawlekanie nitki przez ucho igielne. Milimetr obok i się nie udaje — ale kto trafi, wygrywa punkt. Ekspert wie, kiedy ucho igielne się opłaca, a kiedy pewna droga jest mądrzejsza.\n\nCiasne umiejscowienie i pewność się nie wykluczają; to wybór, którego dokonujesz w każdej chwili.',
  {
    titel: 'Trafiać w krawędzie',
    ziel: 'Celowo umieszczać speedera przy liniach i w narożnikach i świadomie ważyć ryzyko.',
    schritte: [
      'Wyłóż znaczniki celu w narożniki i tuż przy liniach pola przeciwnika.',
      'Graj clery i skróty celowo w te cele przy krawędziach, zamiast w środek pola.',
      'Policz swoje trafienia i obserwuj, jak często wpadasz w aut.',
      'Ćwicz świadomie obie decyzje: ciasny cel przy wyraźnej przewadze, pewny cel pod presją.',
      'Zmniejszaj margines dopiero, gdy niezawodnie trafiasz w krawędzie.',
    ],
    selbstkontrolle: 'Czy trafiasz w cele przy krawędziach niezawodnie, czy za dużo idzie na aut? Czy wybierasz ciasny cel we właściwym momencie — przy przewadze tak, pod presją raczej pewnie? Precyzja znaczy trafić właściwy cel we właściwym momencie — nie zawsze szukać najciaśniejszego.',
    abschluss: 'Umiejscowienie przy liniach to szlif dokładności. Wygrywa punkty — gdy świadomie ważysz ryzyko i pewność jedno przeciw drugiemu.',
  },
  'Stałość pod najwyższą presją',
  'Na końcu ekspertów rozdziela najbardziej niezawodne uderzenie, nie najefektowniejsze. Stałość pod najwyższą presją to techniczna odporność, by utrzymać swoją jakość dokładnie wtedy, gdy liczy się najbardziej — w decydującym punkcie, w wyrównanym secie, przeciw najmocniejszemu przeciwnikowi.\n\nPod presją u wielu rozpada się technika. Chwyt się spina, ruch robi się nerwowy, wyćwiczona precyzja się załamuje. Ekspert trzyma swoją technikę stabilnie, niezależnie od tego, jak wysoka jest stawka. Ta odporność to nie osobny ruch; to zdolność czystego przywoływania wszystkich twoich uderzeń także pod obciążeniem.\n\nPowstaje na dwa sposoby. Pierwszy to głęboka automatyzacja: uderzenie, które zbiłeś tysiące razy czysto, biegnie także pod presją samo — technika niesie, bo nie musi już myśleć. Drugi to mądry wybór uderzenia: pod najwyższą presją wybierasz uderzenie, które opanowujesz najpewniej, zamiast szukać najbardziej ryzykownego. Najlepszy ekspert zna swoje najbardziej niezawodne uderzenia i sięga po nie w decydującym momencie.\n\nTu technika dotyka mentalności. Spokojna ręka pod presją bierze się z wyćwiczonej techniki i z mentalnego opanowania razem — stronę mentalną znajdziesz w części mentalnej, techniczną budujesz tutaj.\n\nStałość pod presją jest jak dobrze zbudowany most w burzy. Nie musi być najpiękniejszy — musi trzymać, gdy obciążenie jest największe. Właśnie to odróżnia eksperta od błyskotliwego, ale zawodnego gracza.\n\nTa odporność to cichy rdzeń mistrzostwa: jakość, która trzyma także w najtrudniejszym momencie, nie jedno szaleńcze uderzenie.',
  {
    titel: 'Utrzymać jakość, gdy się liczy',
    ziel: 'Przywoływać własne uderzenia czysto i niezawodnie także pod zwiększoną presją.',
    schritte: [
      'Wbuduj w swój trening świadomie presję: graj o punkty, stawiaj sobie cele, które musisz trafić, symuluj wyrównane stany seta.',
      'Obserwuj, które uderzenia pod presją załamują się najpierw — tam leży twoja praca.',
      'W sytuacjach presji wybieraj świadomie swoje najbardziej niezawodne uderzenie, nie najbardziej ryzykowne.',
      'Powtarzaj swoje najpewniejsze uderzenia tak często, by także pod obciążeniem biegły same.',
      'Zwracaj uwagę na luźny chwyt — spięcie to pierwszy znak presji.',
    ],
    selbstkontrolle: 'Czy twoja technika pozostaje pod presją czysta, czy robi się nerwowa i spięta? Czy w decydującym momencie sięgasz po swoje najpewniejsze uderzenie, czy szukasz ryzyka? Odporność znaczy przywołać wyćwiczoną jakość także wtedy, gdy stawka jest wysoka.',
    abschluss: 'Stałość pod najwyższą presją to cichy rdzeń mistrzostwa. Wieńczy technikę ekspercką: wygrywa uderzenie, które trzyma także w najtrudniejszym momencie, nie najbardziej błyskotliwe.',
  },
];

const TAKTIK = [
  'Plan meczu',
  'Na poziomie eksperckim mecz nie zaczyna się pierwszym serwisem; zaczyna się w głowie przed nim. Plan meczu to twoja z góry powzięta strategia: jak chcesz zagrać przeciw właśnie temu przeciwnikowi? Kto przystępuje z planem, jest o krok przed tym, kto tylko reaguje.\n\nDobry plan opiera się na dwóch filarach. Pierwszy to ocena przeciwnika: gra ofensywnie czy defensywnie? Gdzie są jego słabości, jak z jego ruchomością, jak z jego nerwami? Drugi to twoja własna gra: co potrafisz najlepiej, jaka jest twoja najbardziej niezawodna siła? Plan łączy oboje — kieruje twoją siłę przeciw jego słabości.\n\nPrzy tym plan pozostaje świadomie prosty. Jedna, dwie jasne myśli przewodnie niosą dalej niż przeładowana koncepcja. Na przykład: wypychać przeciwnika długimi piłkami w tył i męczyć przez jego bekhend. Albo: trzymać wysokie tempo, bo w długich, szybkich wymianach słabnie.\n\nNajważniejsze w planie meczu jest gotowość, by go dostosować. Żaden plan nie przetrwa pierwszego kontaktu z przeciwnikiem bez zmian. Zauważasz, że nie wychodzi, zmieniasz go — próbujesz innej drogi, zamiast trzymać się nieudanej. Ekspert w trakcie meczu stale czyta na nowo i koryguje.\n\nMecz to partia szachów. Masz przygotowane otwarcie, ale musisz reagować na każdy ruch przeciwnika i na bieżąco dostosowywać swój plan. Kto uparcie trzyma się jednego otwarcia, przegrywa z tym, kto myśli razem z grą.',
  'Weź przed następnym meczem dwie minuty na plan. Odpowiedz na dwa pytania: jaka jest największa słabość przeciwnika, którą znasz lub podejrzewasz? I jaka jest twoja najbardziej niezawodna siła, którą możesz ją zaatakować? Sformułuj z tego jedną jedyną myśl przewodnią. Obserwuj w meczu, czy plan wychodzi — i zmień go świadomie, jeśli nie, zamiast się go trzymać.',
  'Typy przeciwników i kontrśrodki',
  'Żaden przeciwnik nie jest jak drugi, ale wielu wpada w powracające typy. Kto te typy rozpoznaje, ma na każdego gotowy kontrśrodek — i nie musi w każdym meczu zaczynać od zera.\n\nPrzeciw atakującemu, który stale bije mocno i chce szybko zakończyć punkt, zdejmujesz tempo. Wysokie, głębokie piłki wypychają go w tył i odbierają mu pozycję ataku; krótkie piłki zmuszają go do przodu, z jego strefy komfortu. Odmawiasz mu rytmu, którego szuka.\n\nPrzeciw graczowi defensywnemu, który wszystko odsyła i czeka na twój błąd, pomaga cierpliwość. Ruszasz go po wszystkich czterech narożnikach, wydłużasz wymiany i czekasz, aż zmęczenie lub niecierpliwość doprowadzą go do błędu. Kto sam robi się tu niecierpliwy i szuka ryzyka, gra mu na rękę.\n\nPrzeciw wolnemu lub mało ruchliwemu przeciwnikowi grasz szerokie kąty i długie drogi. Zmuszasz go, by ogarniał dużo terenu, i trafiasz w przestrzenie, których nie dosięga na czas.\n\nJesteś lekarzem, który najpierw stawia diagnozę, a potem wybiera odpowiedni środek. Ta sama recepta na każdego przeciwnika działa równie mało jak to samo lekarstwo na każdą chorobę.\n\nKontrśrodek zaczyna się od wczesnej diagnozy: w rozgrzewce i pierwszych punktach rozpoznajesz typ — i nastawiasz się na niego, zamiast grać przeciw każdemu tak samo.',
  'Pomyśl o trzech przeciwnikach, przeciw którym często grasz. Któremu typowi odpowiada każdy — atakujący, gracz defensywny, mało ruchliwy gracz, czy mieszanka? Obmyśl dla każdego prosty kontrśrodek: zdjąć tempo, zmęczyć po czterech narożnikach, wymusić długie drogi. Postanów sobie w następnym meczu już w rozgrzewce określić typ przeciwnika i zastosować swoją receptę wcześnie.',
  'Narzucić przeciwnikowi własną grę',
  'Dwoje graczy chce w każdym meczu tego samego: dyktować grę. Ekspert wygrywa tę walkę, narzucając przeciwnikowi swoją własną grę — i zmuszając go, by działał w swojej słabej, a nie mocnej grze.\n\nMyśl przewodnia jest prosta: robisz grę swoją. Jesteś mocniejszym atakującym, trzymasz wysokie tempo i nie zostawiasz mu czasu. Jesteś wytrzymalszym, cierpliwszym graczem, wydłużasz wymiany, aż się załamie. Grasz swoją muzykę, a przeciwnik musi do niej tańczyć.\n\nDo tego każda wymiana dostaje zamiar. Ekspert nie gra żadnej piłki bez celu. Każda wymiana podąża za tym samym wzorcem: najpierw sondować, gdzie przeciwnik jest wrażliwy, potem budować presję, która wyprowadza go z pozycji, w końcu wykorzystać szansę, gdy powstanie. Uderzenia budujące poruszają przeciwnika, uderzenia kończące kończą punkt — a ty wiesz w każdej chwili, w której fazie jesteś.\n\nKto natomiast tylko reaguje, oddaje przeciwnikowi kontrolę. Dlatego narzucanie to także postawa: zamiast czekać, co nadejdzie, dyktujesz, co się dzieje.\n\nJesteś reżyserem wymiany, nie statystą. Ty narzucasz reżyserię, a przeciwnik gra rolę, którą mu przydzielasz — nie odwrotnie.',
  {
    titel: 'Każda wymiana z zamiarem',
    ziel: 'Określać strukturę wymiany — sondować, budować presję, kończyć.',
    schritte: [
      'Graj z partnerem dłuższe wymiany i nadaj każdej jasny plan: najpierw poruszyć partnera, potem zbudować presję, potem szukać szansy.',
      'Zaczynaj każdą wymianę sondującą piłką, która testuje słabość.',
      'Buduj uderzeniami budującymi presję, które wyciągają partnera z pozycji.',
      'Kończ dopiero, gdy szansa naprawdę jest, zamiast wymuszać zakończenie.',
      'Nazwij po każdej wymianie, w której fazie wygrałeś lub przegrałeś punkt.',
    ],
    selbstkontrolle: 'Czy określasz strukturę wymiany, czy tylko reagujesz na partnera? Czy każda twoja piłka ma zamiar, czy grasz bez planu? Narzucanie udaje się tylko, gdy prowadzisz każdą wymianę, zamiast pozwalać jej się dziać.',
    abschluss: 'Kto narzuca przeciwnikowi własną grę, wygrywa walkę o kontrolę. Zamiar w każdej wymianie to droga do tego.',
  },
  'Systematyczne atakowanie słabości',
  'Rozpoznać słabość przeciwnika to połowa pracy. Druga połowa to wykorzystywać ją konsekwentnie i systematycznie, zamiast po jednym trafieniu znów ją stracić z oczu.\n\nPierwszym krokiem jest wczesna diagnoza. W rozgrzewce i pierwszych punktach szukasz celowo: dokąd porusza się wolniej? Boi się narożnika bekhendowego? Nie radzi sobie z przodu? Jest po długich wymianach bez tchu? Im wcześniej znajdziesz słabość, tym dłużej możesz ją wykorzystywać.\n\nPotem atakujesz ją systematycznie. To nie znaczy grać każdą piłkę tam — to byłoby przewidywalne. To znaczy raz za razem celowo wracać w to miejsce, zwłaszcza w ważnych momentach, aż przeciwnik udowodni, że potrafi je obronić. Słabość, którą trafiasz tylko raz, nie ma wartości; taka, którą przez cały mecz raz za razem testujesz, kruszy.\n\nJednocześnie chronisz własną słabość. Dobry przeciwnik szuka też twojego czułego miejsca. Gdy tylko zauważysz, że je znalazł, bronisz go świadomie i nie pozwalasz mu grać tam bez przeszkód.\n\nAtakowanie słabości jest jak stała kropla, która drąży kamień. Pojedyncza kropla nic nie zdziała — to powtarzanie przenika. Kto po jednym trafieniu przestaje, marnuje efekt.',
  {
    titel: 'Testować narożnik raz za razem',
    ziel: 'Systematycznie i wielokrotnie atakować strefę celu, nie stając się przewidywalnym.',
    schritte: [
      'Określ z partnerem strefę celu, która stanowi słabość (np. narożnik bekhendowy).',
      'Wracaj w wymianie raz za razem celowo do tej strefy, nie grając tam każdej piłki.',
      'Graj inne piłki tylko po to, by poruszyć przeciwnika i na nowo otworzyć strefę.',
      'Zadbaj o to, by kierować w strefę zwłaszcza w ważnych punktach.',
      'Zmień rolę i ćwicz zarazem obronę wielokrotnie atakowanej własnej strefy.',
    ],
    selbstkontrolle: 'Czy systematycznie wracasz do strefy celu, czy tracisz ją z oczu po jednym, dwóch trafieniach? Czy pozostajesz przy tym dość nieprzewidywalny? I czy zauważasz, gdy partner atakuje twoją własną słabość? Systematyka znaczy powtarzanie z zamiarem, nie uparte granie w to samo.',
    abschluss: 'Systematycznie atakowana słabość rozstrzyga wyrównane mecze. Wczesna diagnoza i konsekwentne powtarzanie to klucz.',
  },
  'Sterowanie przebiegiem meczu',
  'Mecz to więcej niż ciąg pojedynczych punktów — ma przebieg, dramaturgię. Ekspert steruje tym przebiegiem świadomie, zamiast go tylko przeżywać. Myśli w setach i w całym meczu, nie tylko w następnej piłce.\n\nJednym narzędziem jest sterowanie tempem w czasie. Są fazy, w których podkręcasz tempo, by przewalcować przeciwnika, i fazy, w których świadomie je zdejmujesz, by samemu odetchnąć lub przełamać jego bieg. Kto cały mecz gra na jednej prędkości, marnuje to narzędzie.\n\nDrugim jest dostosowanie w trakcie. Twój plan meczu spotyka rzeczywistość, i jeśli nie wychodzi, zmieniasz go w środku meczu. Może po przegranym pierwszym secie działa całkiem inne podejście. Ekspert nie unika tej zmiany, lecz jej szuka, gdy pierwsza droga nie prowadzi.\n\nTrzecim jest taktyka zależna od stanu. Przy prowadzeniu grasz bardziej kontrolowanie i pozwalasz przeciwnikowi nieść ryzyko; na stracie szukasz skalkulowanego ryzyka, bo pewna droga już nie wystarcza. Ta sama sytuacja wymaga przy 12:6 innej decyzji niż przy 6:12.\n\nJesteś sternikiem łodzi na długim dystansie. Raz stawiasz więcej żagli, raz coś zdejmujesz, raz zmieniasz kurs — zawsze z okiem na cały wyścig, nie tylko na następną falę. Mentalną stronę tego sterowania znajdziesz w części mentalnej.',
  'Wróć myślami do meczu, który wypuściłeś z rąk albo odwróciłeś. Czy sterowałeś przebiegiem świadomie — zmieniałeś tempo, dostosowywałeś plan, decydowałeś zależnie od stanu — czy przeszedłeś przez niego na jednej linii? Postanów sobie na następny mecz jedną jedyną dźwignię sterowania: na przykład po przegranym secie świadomie zmienić podejście, zamiast uparcie grać dalej.',
  'Decydujący punkt',
  'Nie wszystkie punkty ważą tak samo. Są te decydujące — piłka setowa, piłka meczowa, punkt przy 14:14. Jak grasz te punkty, odróżnia eksperta od dobrego gracza. A sekret jest przeważnie prostszy, niż się sądzi.\n\nW największych momentach potrzeba jasności taktycznej zamiast genialności. Zamiast po najbardziej ryzykowne, najefektowniejsze uderzenie ekspert sięga w decydującym punkcie po wzorzec, któremu ufa najbardziej — po swój niezawodny standard, który zagrał tysiące razy. Presja jest już dość wysoka; nie potrzebujesz dodatkowo ryzyka.\n\nTen niezawodny wzorzec przygotowujesz sobie z góry. Kto wie, co chce zagrać przy ważnym punkcie, w danej chwili nie musi już decydować — jasność jest już obecna. Może to twój pewny serwis na bekhend, a po nim atak na słabe odbicie. Plan, który znasz, niesie cię przez ten moment.\n\nTu także obowiązuje logika zależna od stanu. Przy własnej piłce setowej grasz jasno i zdecydowanie swój wzorzec; przy piłce setowej przeciwnika odbierasz mu łatwy punkt i zmuszasz go, by ci go wyrwał — pewnie, nie w panice.\n\nDecydujący punkt to rzut karny crossmintona. Najlepszy strzelec nie szuka idealnego rogu; strzela piłkę, którą pewnie trafia. Znajomość bije genialność, gdy presja jest największa. Spokój mentalny do tego znajdziesz w części mentalnej — jasność taktyczną budujesz tutaj.',
  'Przygotuj sobie niezawodny wzorzec na decydujące punkty — sekwencję, której pod presją ufasz najbardziej (na przykład: pewny serwis na bekhend, potem atak na słabe odbicie). Opisz go dla siebie w jednym zdaniu. Postanów sobie w następnym wyrównanym meczu przy ważnym punkcie zagrać dokładnie ten wzorzec, zamiast szukać ryzykownego uderzenia. Obserwuj, czy z góry powzięta jasność ci pomaga.',
];

const r1 = insertPl('data/bausteine.experte-technik.json', TECHNIK);
const r2 = insertPl('data/bausteine.experte-taktik.json', TAKTIK);
console.log(`Ring 8 pl: experte-technik ${r1.knoten} + experte-taktik ${r2.knoten} = ${r1.knoten + r2.knoten} Knoten.`);
