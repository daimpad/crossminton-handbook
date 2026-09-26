// Ring 13 (pl): trainingseinheiten.json — 63 Knoten in Dokumentreihenfolge
// (8 Einheiten je titel + schwerpunkt + beschreibung + hinweise). titel spiegeln Ring-0-Labels.
import { insertPl } from './pl-core.mjs';

const PL = [
  // E0 beginner_erste_schlaege
  'Pierwsze uderzenia',
  'Pewnie trafiać uderzenia podstawowe',
  'Pierwsza jednostka dla początkujących: od chwytu przez serwis do drive’a forhendowego, zakończona zabawową grą na cel w głębię.',
  'Krótka sekwencja rozgrzewki — rozruszać krążenie, obudzić bark i nogi.',
  'Najpierw chwyt uniwersalny — niesie wszystkie kolejne uderzenia.',
  'Do ćwiczenia bez partnera; idealne jako drugi krok.',
  'Uderzenie chleba powszedniego; tu leży nacisk jednostki.',
  'Zabawowe zastosowanie: nauczonego drive’a grać na cel w głębi.',
  // E1 beginner_bewegung_und_position
  'Ruch i pozycja',
  'Być w porę przy speederze — pozycja podstawowa, zryw, powrót',
  'Jednostka ruchowa dla początkujących: pozycja centralna, szybkie stopy i obieg ruchu, zakończona pielęgnacją ruchomości.',
  'Przed pracą ruchową szczególnie dobrze przygotować nogi.',
  'Naładowana postawa wyjściowa jako punkt startu każdego ruchu.',
  'Zryw i zmiana kierunku — krótkie, czyste powtórzenia.',
  'Obieg ze split-stepu, drogi do piłki i powrotu; nacisk jednostki.',
  'Cool-down: łagodna pielęgnacja ruchomości, gdy ciało jest ciepłe.',
  // E2 fortgeschritten_angriff_aufbauen
  'Budowanie ataku',
  'Wytworzyć atak i zakończyć',
  'Zaawansowana jednostka ataku: od bata przez uderzenie nad głową do smecza, potem taktyczne przygotowanie zakończenia. Zakończenie pielęgnacją barku po pracy nad głową.',
  'Przed pracą nad głową i szybkosiłową dokładnie się rozgrzać, zwłaszcza bark uderzający.',
  'Źródło siły najpierw — niesie clear i smecz.',
  'Wysoki punkt kontaktu jako podstawa ataku z góry.',
  'Stałość przed tempem; kilka umiejscowionych smeczy zamiast jednego mocnego.',
  'Taktyczny rdzeń jednostki: zagrać smecz z przygotowanej sytuacji.',
  'Cool-down: zadbać o jednostronnie obciążony bark uderzający po pracy nad głową.',
  // E3 doppel_als_paar_spielen
  'Gra jako para',
  'Atakować i bronić jako jedność',
  'Jednostka deblowa: zgrany ruch jako para, atak w obcęgi i obrona bez luk, zakończona interwałami bliskimi grze.',
  'Rozgrzać się wspólnie; przygotowanie ruchowe już was do siebie dostraja.',
  'Najpierw zgrany ruch — niesie atak jak i obronę.',
  'Obcęgi z presji (z tyłu) i zakończenia (z przodu).',
  'Kryć bez luk, zdejmować tempo, wypatrzeć moment przełączenia; nacisk wspólnie z atakiem.',
  'Zakończenie bliskie grze: intensywne wymiany z krótką regeneracją, grane w deblu.',
  // E4 experte_praezision_und_taeuschung
  'Precyzja i zwód',
  'Zwodzić przeciwnika i trafiać w linie',
  'Jednostka ekspercka na ostrość i finezję: być wcześnie przy speederze, ukrywać zamiar, precyzyjnie kłaść przy liniach — i całość przenieść w partię, w której narzucasz przeciwnikowi swoją grę.',
  'Obudzić bark i tułów — baza dla czystych ruchów nad głową i zwodów.',
  'Najpierw brać piłkę wcześnie: to daje ci czas, który w ogóle umożliwia zwód i precyzję.',
  'Budując na zyskanym czasie, ukrywać zamiar — to samo podejście, inny kierunek.',
  'Nacisk: zwiedzione piłki precyzyjnie kłaść przy liniach, gdzie bolą najbardziej.',
  'Zastosowanie w partii: wcześnie przyjętymi, zwiedzionymi i precyzyjnymi piłkami narzucać przeciwnikowi swoją grę.',
  // E5 experte_tempo_und_konstanz
  'Tempo i stałość',
  'Zmieniać tempo i pozostać stałym pod presją',
  'Jednostka ekspercka na rytm i wytrzymałość: świadomie zmieniać tempo, eksplozywnie odbijać się od podłoża i kłaść mocne uderzenie z wyskoku — zakończona utrzymaniem jakości pod najwyższą presją.',
  'Doprowadzić pracę nóg do temperatury pracy — przygotować zryw i kontakt z podłożem do następującej pracy reaktywnej.',
  'Świadomie zmieniać tempo, by złamać rytm przeciwnika.',
  'Kłaść mocne zakończenie z wyskoku — z zapisaną w pliku wskazówką zdrowotną co do obciążenia skokowego.',
  'Szkolić eksplozywny, krótki kontakt z podłożem, który dopiero niesie zmianę tempa i wyskok.',
  'Integracja: tempo i moc utrzymać czysto także wtedy, gdy presja jest największa.',
  // E6 outdoor_wind_und_boden
  'Wiatr i podłoże',
  'Nastawić się na zewnątrz na wiatr i podłoże',
  'Jednostka plenerowa do gry na dworze: dostosować pracę nóg do zmiennego podłoża, czytać i wykorzystywać wiatr — i stosować sterowanie długością, które na zewnątrz decyduje o wygranej i porażce.',
  'Obudzić pracę nóg — na zewnątrz szczególnie ważne, bo podłoże zmienia odbicie.',
  'Najpierw odczytać podłoże i dostosować pracę nóg do piasku, trawy, mączki czy sztucznej trawy.',
  'Potem uwzględnić wiatr: dostosować moc i długość do kierunku wiatru, celować przeciw znoszeniu.',
  'Zastosowanie: celowo użyć sterowania długością — na zewnątrz pod wpływem wiatru jest kluczem.',
  // E7 doppel_beginner_zusammenspiel
  'Pierwsza współpraca w grze podwójnej',
  'Serwować jako para, przypisać piłkę, zostawiać miejsce',
  'Pierwsza jednostka deblowa dla par początkujących: serwis w prostej kolejności, jasne przypisanie piłki przez okrzyk i wzajemne zostawianie sobie miejsca — trzy podstawy pewnej współpracy.',
  'Obudzić pracę nóg — w deblu podstawa, by szybko sobie nawzajem uskakiwać.',
  'Najpierw serwis deblowy w prostej, stałej kolejności — tak czysto wchodzicie do gry.',
  'Potem najważniejsze podstawowe uzgodnienie: przypisać piłkę wcześnie i wyraźnie jednemu z dwojga.',
  'Zastosowanie: poruszać się względem siebie i świadomie zostawiać sobie miejsce — na niewidzialnej linie.',
];

const r = insertPl('data/trainingseinheiten.json', PL);
console.log(`Ring 13 pl: trainingseinheiten ${r.knoten} Knoten.`);
