// Ring 15 (pl): turnierregeln.json — 170 Knoten (letzter Content-Ring).
// Anders als sonst werden die _meta-{de}-Zwillinge mitübersetzt (echte text()-Knoten).
// 132 unique de-Strings via de→pl-Wörterbuch, positional über den Dokument-Walk gemappt.
import { insertPl } from './pl-core.mjs';
import { readFileSync } from 'node:fs';

const DICT = {
  '1 Vollzeit-Moderator, der die ICO-Sponsoren ansagt.': '1 moderator na pełny etat, który zapowiada sponsorów ICO.',
  '1 Vollzeit-Organisator (Empfehlung: spielt nicht selbst mit).': '1 organizator na pełny etat (zalecenie: sam nie gra).',
  '1 Vollzeit-Organisator, der nicht selbst mitspielen darf.': '1 organizator na pełny etat, który sam nie może grać.',
  '1 benannter Organisator.': '1 wyznaczony organizator.',
  '1 lizenzierter Head Umpire (Empfehlung: spielt nicht selbst mit).': '1 licencjonowany sędzia główny (Head Umpire) (zalecenie: sam nie gra).',
  '100 Punkte': '100 punktów',
  '100/250/500/1000 Punkte inkl. Doppel-, Junior- und Fun-Varianten.': '100/250/500/1000 punktów wraz z wariantami debla, juniorów i Fun.',
  '1000 Punkte': '1000 punktów',
  '1000er': '1000',
  '100er': '100',
  '2,50 € je Spieler:in an die ICO (nach dem Turnier verrechnet).': '2,50 € od gracza na rzecz ICO (rozliczane po turnieju).',
  '250 Punkte': '250 punktów',
  '250er': '250',
  '500 Punkte': '500 punktów',
  '500er': '500',
  'Ablauf & Schiedsgericht': 'Przebieg i skład sędziowski',
  'Allgemeines Regelwerk: Aufbau, Turniermodus, Offizielle, Spielerkleidung.': 'Ogólne przepisy: organizacja, tryb turnieju, oficjele, strój gracza.',
  'Anders als im Einzel darf im Doppel die Gruppenphase entfallen — reines K.-o. ist zulässig (Entscheidung spätestens direkt nach dem Meldeschluss).': 'Inaczej niż w grze pojedynczej, w deblu faza grupowa może odpaść — czysty system pucharowy jest dopuszczalny (decyzja najpóźniej bezpośrednio po terminie zgłoszeń).',
  'Anlage & Ausrüstung': 'Obiekt i sprzęt',
  'Anmeldung & Organisation': 'Zgłoszenie i organizacja',
  'Anmeldung in der Tournament Software, 1 Monat vorher.': 'Zgłoszenie w Tournament Software, 1 miesiąc wcześniej.',
  'Antrag 3 Monate vorher; Junioren sollen nicht als Match-/Linienrichter eingesetzt werden.': 'Wniosek 3 miesiące wcześniej; juniorzy nie powinni być wyznaczani na sędziów meczowych/liniowych.',
  'Anzahl Spielfelder': 'Liczba pól gry',
  'Anzeigetafeln': 'Tablice wyników',
  'Auslosung & Setzung': 'Losowanie i rozstawienie',
  'Auszug der wichtigsten Anforderungen zur schnellen Orientierung. Der allgemeine Rahmen (Aufbau, Modus, Offizielle, Spielerkleidung) folgt der ICO Tournament Regulations 2024/dec; die stufenspezifischen Zahlen (Mindest-Teilnehmer, Kategorien, Felder, Fristen, Gebühren) stehen in den separaten ICO-Tournament-Standards je Kategorie. Verbindlich ist stets das vollständige offizielle Regelwerk — im Zweifel dort prüfen.': 'Wyciąg z najważniejszych wymogów dla szybkiej orientacji. Ogólne ramy (organizacja, tryb, oficjele, strój gracza) podążają za ICO Tournament Regulations 2024/dec; liczby specyficzne dla poziomu (minimalna liczba uczestników, kategorie, pola, terminy, opłaty) stoją w osobnych ICO Tournament Standards dla każdej kategorii. Wiążące są zawsze pełne oficjalne przepisy — w razie wątpliwości sprawdź tam.',
  'Center Court': 'Center Court',
  'DCV-Schiedsrichterordnung': 'DCV-Schiedsrichterordnung',
  'DCV-Spielordnung': 'DCV-Spielordnung',
  'DCV-Spielregeln Crossminton': 'DCV-Spielregeln Crossminton',
  'Doppel': 'Debel',
  'Durchführung nach ICO-Turnierordnung, ICO-Spielregeln und ICO-Schiedsrichterordnung.': 'Przeprowadzenie według regulaminu turniejowego ICO, przepisów gry ICO i regulaminu sędziowskiego ICO.',
  'Ehrung mit Podium und ICO-/Sponsor-Werbung; Urkunden/Medaillen für die Plätze 1–3 empfohlen.': 'Dekoracja z podium i reklamą ICO/sponsorów; dyplomy/medale za miejsca 1–3 zalecane.',
  'Ehrung mit Podium, Ansager, Nationalhymne der Sieger; Urkunden und Medaillen/Pokale.': 'Dekoracja z podium, spikerem, hymnem narodowym zwycięzców; dyplomy i medale/puchary.',
  'Ehrung mit Podium, Ansager; Urkunden und Medaillen/Pokale für die Plätze 1–3.': 'Dekoracja z podium, spikerem; dyplomy i medale/puchary za miejsca 1–3.',
  'Eigens gebrandeter, gestalteter Center Court (alle ICO-Sponsoren).': 'Specjalnie brandowany, zaprojektowany Center Court (wszyscy sponsorzy ICO).',
  'Eine Anzeigetafel pro Feld.': 'Jedna tablica wyników na pole.',
  'Einstiegs-Ranglistenturnier auf nationaler Ebene.': 'Wejściowy turniej rankingowy na poziomie krajowym.',
  'Ergebnisse & Turnierbericht': 'Wyniki i raport turniejowy',
  'Ergebnisse über den Tournament Planner veröffentlichen.': 'Wyniki opublikować przez Tournament Planner.',
  'Erste-Hilfe-Material bereithalten.': 'Mieć w gotowości materiały pierwszej pomocy.',
  'Es gelten die offiziellen ICO-Spielregeln (Feld, Zählweise, Aufschlag).': 'Obowiązują oficjalne przepisy gry ICO (pole, sposób liczenia, serwis).',
  'Es werden Doppel-Kategorien ausgespielt (mind. 4 Kategorien; Open-, Damen- oder Mixed-Doppel verpflichtend), je mind. 4 Paare.': 'Rozgrywane są kategorie debla (co najmniej 4 kategorie; debel open, kobiet lub mikst obowiązkowy), każda co najmniej 4 pary.',
  'Es werden Doppel-Kategorien ausgespielt, je mind. 4 Paare.': 'Rozgrywane są kategorie debla, każda co najmniej 4 pary.',
  'Feldmaße und Markierung (Feldnummern, Aufschlaglinie …) nach ICO-Standard.': 'Wymiary pola i oznaczenie (numery pól, linia serwisowa …) według standardu ICO.',
  'Feldmaße und Markierung nach Regelwerk.': 'Wymiary pola i oznaczenie według przepisów.',
  'Fun': 'Fun',
  'Für mindestens 10 Spieler:innen.': 'Dla co najmniej 10 graczy.',
  'Für mindestens 120 Spieler:innen; die Teilnehmerzahl darf nicht begrenzt werden.': 'Dla co najmniej 120 graczy; liczby uczestników nie wolno ograniczać.',
  'Für mindestens 50 Spieler:innen (Feld darf begrenzt werden, nicht darunter).': 'Dla co najmniej 50 graczy (liczbę można ograniczyć, nie poniżej).',
  'Für mindestens 80 Spieler:innen (Feld darf begrenzt werden, nicht darunter).': 'Dla co najmniej 80 graczy (liczbę można ograniczyć, nie poniżej).',
  'Gestalteter, gebrandeter Center Court empfohlen.': 'Zaprojektowany, brandowany Center Court zalecany.',
  'Großes Weltranglisten-Turnier.': 'Duży turniej rankingu światowego.',
  'Gültige ICO-Lizenz für alle Spieler:innen.': 'Ważna licencja ICO dla wszystkich graczy.',
  'Halle mindestens 7 m hoch (über allen Feldern); Ausnahmen nur mit ICO-Genehmigung.': 'Hala co najmniej 7 m wysoka (nad wszystkimi polami); wyjątki tylko za zgodą ICO.',
  'Hallen-Kapazität für mindestens 50 (statt 80).': 'Pojemność hali na co najmniej 50 (zamiast 80).',
  'Hallenhöhe': 'Wysokość hali',
  'Höchste Kategorie mit den strengsten Auflagen.': 'Najwyższa kategoria z najsurowszymi wymogami.',
  'Höchstens 100 km zu einem internationalen Flughafen.': 'Najwyżej 100 km do międzynarodowego lotniska.',
  'ICO Tournament Regulations (2024/dec)': 'ICO Tournament Regulations (2024/dec)',
  'ICO Tournament Regulations (Fassung 2024/dec) + ICO Tournament Standards je Kategorie · International Crossminton Organisation (ICO) / Deutscher Crossminton Verband (DCV)': 'ICO Tournament Regulations (wersja 2024/dec) + ICO Tournament Standards dla każdej kategorii · International Crossminton Organisation (ICO) / Deutscher Crossminton Verband (DCV)',
  'ICO-Fassung 2024/dec': 'wersja ICO 2024/dec',
  'ICO-Turnierstandards (Original-PDFs)': 'Standardy turniejowe ICO (oryginalne PDF-y)',
  'International Series': 'International Series',
  'Internationales Ranglistenturnier.': 'Międzynarodowy turniej rankingowy.',
  'Junior': 'Junior',
  'Junioren-Kategorien (U12/U14/U18 …); U12 und U14 werden zusammengelegt.': 'Kategorie juniorskie (U12/U14/U18 …); U12 i U14 są łączone.',
  'Kategorien (für die Wertung)': 'Kategorie (do klasyfikacji)',
  'Kein Preisgeld und keine Spielergebühr; Sachpreise für die Podestplätze empfohlen.': 'Brak nagród pieniężnych i brak opłaty startowej; nagrody rzeczowe za miejsca na podium zalecane.',
  'Keine ICO-Lizenz nötig, aber ein Spielerprofil in der Tournament Software (durch den nationalen Administrator).': 'Licencja ICO nie jest potrzebna, ale profil gracza w Tournament Software (przez krajowego administratora).',
  'Lage zum Flughafen': 'Położenie względem lotniska',
  'Live-Stream': 'Transmisja na żywo',
  'Live-Stream inkl. ICO-Partner-Werbung empfohlen.': 'Transmisja na żywo wraz z reklamą partnerów ICO zalecana.',
  'Live-Stream inkl. ICO-Partner-Werbung.': 'Transmisja na żywo wraz z reklamą partnerów ICO.',
  'Lockeres Turnier ohne ICO-Sanktionierung — es gelten die Spielregeln, sonst keine Auflagen.': 'Luźny turniej bez sankcjonowania ICO — obowiązują przepisy gry, poza tym żadnych wymogów.',
  'Lokal / Fun': 'Lokalny / Fun',
  'Match- & Linienrichter': 'Sędziowie meczowi i liniowi',
  'Match- & Linienrichter ab dem Halbfinale aller Kategorien (Match-Umpire lizenziert oder erfahren).': 'Sędziowie meczowi i liniowi od półfinału wszystkich kategorii (sędzia meczowy licencjonowany lub doświadczony).',
  'Match- & Linienrichter ab dem Halbfinale aller Kategorien.': 'Sędziowie meczowi i liniowi od półfinału wszystkich kategorii.',
  'Match- & Linienrichter in den Finals aller Kategorien.': 'Sędziowie meczowi i liniowi w finałach wszystkich kategorii.',
  'Medizinische Versorgung': 'Opieka medyczna',
  'Medizinische Versorgung durch den Veranstalter; Sanitäranlagen nötig.': 'Opieka medyczna przez organizatora; zaplecze sanitarne konieczne.',
  'Meldeschluss der Spieler': 'Termin zgłoszeń graczy',
  'Mindest-Kapazität der Halle': 'Minimalna pojemność hali',
  'Mindest-Teilnehmerzahl': 'Minimalna liczba uczestników',
  'Mindestens 1 unabhängiger Beobachter; ICO-Sponsoring nach erreichtem Standard-Prozentsatz.': 'Co najmniej 1 niezależny obserwator; sponsoring ICO według osiągniętego procentu standardu.',
  'Mindestens 1 unabhängiger Beobachter; Standards werden vom ICO-Board abgenommen.': 'Co najmniej 1 niezależny obserwator; standardy są odbierane przez zarząd ICO.',
  'Mindestens 10 Spieler:innen.': 'Co najmniej 10 graczy.',
  'Mindestens 14 Tage vor Turnierbeginn.': 'Co najmniej 14 dni przed rozpoczęciem turnieju.',
  'Mindestens 2 Einzel-Kategorien; je mind. 4 gemeldete Spieler:innen.': 'Co najmniej 2 kategorie gry pojedynczej; każda co najmniej 4 zgłoszonych graczy.',
  'Mindestens 25 Spieler:innen.': 'Co najmniej 25 graczy.',
  'Mindestens 30 Spieler:innen und Hallen-Kapazität für 30 (statt 25 bzw. 50).': 'Co najmniej 30 graczy i pojemność hali na 30 (zamiast 25 lub 50).',
  'Mindestens 30 Spieler:innen und Kapazität für 30 (statt 50/80).': 'Co najmniej 30 graczy i pojemność na 30 (zamiast 50/80).',
  'Mindestens 4 Einzel-Kategorien (Damen und Open verpflichtend); je mind. 4 Spieler:innen.': 'Co najmniej 4 kategorie gry pojedynczej (kobiety i open obowiązkowe); każda co najmniej 4 graczy.',
  'Mindestens 4 Einzel-Kategorien und mindestens 4 Felder (statt 6/6).': 'Co najmniej 4 kategorie gry pojedynczej i co najmniej 4 pola (zamiast 6/6).',
  'Mindestens 4 Felder.': 'Co najmniej 4 pola.',
  'Mindestens 50 Spieler:innen.': 'Co najmniej 50 graczy.',
  'Mindestens 6 Einzel-Kategorien (Damen und Open verpflichtend); je mind. 4 Spieler:innen.': 'Co najmniej 6 kategorii gry pojedynczej (kobiety i open obowiązkowe); każda co najmniej 4 graczy.',
  'Mindestens 6 Felder.': 'Co najmniej 6 pól.',
  'Mindestens 6 Kategorien (Erwachsene, Junioren, Senioren); je mind. 8 Spieler:innen.': 'Co najmniej 6 kategorii (dorośli, juniorzy, seniorzy); każda co najmniej 8 graczy.',
  'Mindestens 7 Tage vor Turnierbeginn.': 'Co najmniej 7 dni przed rozpoczęciem turnieju.',
  'Mindestens 8 Felder.': 'Co najmniej 8 pól.',
  'Mindestens 80 Spieler:innen.': 'Co najmniej 80 graczy.',
  'Moderation': 'Prowadzenie',
  'Nach dem Turnier': 'Po turnieju',
  'National Series': 'National Series',
  'Oberschiedsrichter (Head Umpire)': 'Sędzia główny (Head Umpire)',
  'Oberteil (T-Shirt) mit Name und Land (oder Länderkürzel) auf dem Rücken — in allen Spielen (World Series).': 'Koszulka (T-shirt) z nazwiskiem i krajem (lub skrótem kraju) na plecach — we wszystkich meczach (World Series).',
  'Oberteil mit Name und Land (oder Länderkürzel) auf dem Rücken — ab dem Halbfinale (International Series).': 'Koszulka z nazwiskiem i krajem (lub skrótem kraju) na plecach — od półfinału (International Series).',
  'Offiziellen ICO-Turnierbericht (mit Fotos) 1 Tag nach dem Turnier senden.': 'Oficjalny raport turniejowy ICO (ze zdjęciami) wysłać 1 dzień po turnieju.',
  'Organisation': 'Organizacja',
  'Preisgeld': 'Nagrody pieniężne',
  'Preisgeld für Sieger und Finalist der Damen- und der Open-Einzelkonkurrenz.': 'Nagrody pieniężne dla zwycięzcy i finalisty gry pojedynczej kobiet i open.',
  'Regelwerk': 'Przepisy',
  'Setzung nach ICO-Rangliste; Auslosung im Tournament Planner, .tp-Datei mind. 3 Tage vorher zur Prüfung an die ICO.': 'Rozstawienie według rankingu ICO; losowanie w Tournament Planner, plik .tp co najmniej 3 dni wcześniej do sprawdzenia do ICO.',
  'Setzung nach ICO-Rangliste; Auslosung im Tournament Planner, .tp-Datei mind. 7 Tage vorher zur Prüfung an die ICO.': 'Rozstawienie według rankingu ICO; losowanie w Tournament Planner, plik .tp co najmniej 7 dni wcześniej do sprawdzenia do ICO.',
  'Setzung nach ICO-Rangliste; Auslosung im Tournament Planner, .tp-Datei vorab zur Prüfung an die ICO.': 'Rozstawienie według rankingu ICO; losowanie w Tournament Planner, plik .tp wcześniej do sprawdzenia do ICO.',
  'Siegerehrung': 'Dekoracja zwycięzców',
  'Spieler-Lizenz': 'Licencja gracza',
  'Spielergebühr': 'Opłata startowa',
  'Spielerkleidung (Name & Land)': 'Strój gracza (nazwisko i kraj)',
  'Spielfeld & Markierung': 'Pole gry i oznaczenie',
  'Teilnehmer & Auslosung': 'Uczestnicy i losowanie',
  'Termin 1 Monat vorher bei der ICO; danach offizielle Ankündigung in der Tournament Software.': 'Termin 1 miesiąc wcześniej w ICO; potem oficjalne ogłoszenie w Tournament Software.',
  'Termin bis zum Vorjahres-Stichtag (23.11.); Kalenderfreigabe durch das ICO-Board; Ankündigung 3 Monate vorher.': 'Termin do dnia granicznego w roku poprzednim (23 listopada); zatwierdzenie kalendarza przez zarząd ICO; ogłoszenie 3 miesiące wcześniej.',
  'Turnier-Antrag & Kalender': 'Wniosek turniejowy i kalendarz',
  'Turnier-Regularium': 'Regulamin turniejowy',
  'Unabhängiger Beobachter': 'Niezależny obserwator',
  'Vollzeit-Moderator empfohlen (nennt die ICO-Sponsoren).': 'Moderator na pełny etat zalecany (wymienia sponsorów ICO).',
  'World Series': 'World Series',
  'Wähle die Kategorie deines Turniers. Die Liste zeigt, woran ein offizielles Turnier gebunden ist — und hebt hervor, was mit jeder Stufe neu dazukommt oder strenger wird.': 'Wybierz kategorię swojego turnieju. Lista pokazuje, czym związany jest oficjalny turniej — i podkreśla, co z każdym poziomem dochodzi jako nowe lub staje się surowsze.',
  'ohne Wertung': 'bez klasyfikacji',
};

// Dokument-Walk: alle Knoten mit de+fr in Reihenfolge (= 170), de→pl via DICT.
const d = JSON.parse(readFileSync('data/turnierregeln.json', 'utf8'));
const PL = [];
const fehlend = new Set();
(function walk(o) {
  if (Array.isArray(o)) return o.forEach(walk);
  if (o && typeof o === 'object') {
    if ('de' in o && 'fr' in o) {
      const de = o.de;
      if (de in DICT) PL.push(DICT[de]);
      else { PL.push(''); fehlend.add(de); }
    }
    for (const [k, v] of Object.entries(o)) if (!['de', 'en', 'fr', 'pl'].includes(k)) walk(v);
  }
})(d);

if (fehlend.size) {
  console.error(`FEHLEN im DICT (${fehlend.size}):`);
  for (const s of fehlend) console.error('  ' + JSON.stringify(s).slice(0, 100));
  process.exit(1);
}

const r = insertPl('data/turnierregeln.json', PL);
console.log(`Ring 15 pl: turnierregeln ${r.knoten} Knoten (${PL.length} eingefügt).`);
