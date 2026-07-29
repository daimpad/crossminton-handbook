// Ring 1 (pl): fügt pl-Zwillinge zu allen 44 Textknoten in data/app-info.json.
// Findet jeden `"fr": "..."`-Knoten (fr ist stets letzter Key, gefolgt von `}`)
// in Dokumentreihenfolge und schiebt `, "pl": "..."` dahinter ein. de/en/fr
// bleiben byte-identisch (nur additive Einfügung). Terminologie: docs/glossar-pl.md.
import { readFileSync, writeFileSync } from 'node:fs';

// PL-Werte in EXAKTER Dokumentreihenfolge (Walk: dict-Keys in Einfügereihenfolge,
// Listen nach Index) — identisch zur Reihenfolge des de-Dumps.
const PL = [
  /* ueber.titel */ 'O tej aplikacji',
  /* ueber.absaetze[0] */ 'Ta aplikacja to narzędzie do nauki crossmintona. Przekazuje grę w małych, wzajemnie budujących się modułach — od pierwszych uderzeń po szlif na poziomie eksperckim.',
  /* ueber.absaetze[1] */ 'Sam wybierasz własną drogę przez materiał: według poziomu, według osobistego celu, według tematu albo jako prowadzoną jednostkę treningową. Kto przychodzi z innego sportu rakietowego, otrzymuje celowe wskazówki, gdzie znane ruchy różnią się w crossmintonie. Do tego dochodzi osobny temat gry podwójnej oraz zakładka z zasadami, zawierająca oficjalne przepisy gry.',
  /* ueber.absaetze[2] */ 'Treści są rzeczowe i oparte na sprawdzonych podstawach z teorii treningu i nauk o sporcie. Aplikacja chce cię prowadzić do samodzielnego ćwiczenia, a nie zajmować cię bez końca.',
  /* ueber.danksagungen.titel */ 'Podziękowania i źródła',
  /* ueber.danksagungen.eintraege[0] */ 'Przepisy gry pochodzą z oficjalnych zasad crossmintona International Crossminton Organisation (ICO), reprezentowanej w Niemczech przez Deutscher Crossminton Verband (DCV); ich wersja jest zgodna z wydaniem ICO 2024/dec.',
  /* ueber.danksagungen.eintraege[1] */ 'Podstawy merytoryczne opierają się na literaturze i materiałach z crossmintona, nauk o treningu i psychologii sportu oraz na doświadczeniach transferowych z pokrewnych sportów rakietowych.',
  /* ueber.danksagungen.eintraege[2] */ 'W tworzenie treści zaangażowały się następujące osoby: XXX. Dziękujemy wszystkim, którzy pomogli w testowaniu i ulepszaniu.',
  /* ueber.credits_lizenz.titel */ 'Licencja i twórcy',
  /* lizenzen[0].rolle */ 'Oprogramowanie',
  /* lizenzen[0].name */ 'MIT License',
  /* lizenzen[1].rolle */ 'Treści i teksty',
  /* lizenzen[1].name */ 'Creative Commons Uznanie autorstwa 4.0 Międzynarodowe (CC BY 4.0)',
  /* credits.praefix */ 'Twórcy',
  /* github.label */ 'Kod źródłowy i współtworzenie: zobacz GitHub',
  /* mitmachen.titel */ 'Współtwórz',
  /* mitmachen.einleitung[0] */ 'Ta aplikacja to otwarty projekt i żyje dzięki wkładowi innych. Nie musisz być profesjonalistą — już wskazanie błędu lub niejasnego sformułowania pomaga.',
  /* moeglichkeiten[0].titel */ 'Zgłoś błąd lub zaproponuj ulepszenie',
  /* moeglichkeiten[0].text */ 'Widzisz błąd merytoryczny, literówkę lub mylące objaśnienie? Masz pomysł, jak ulepszyć moduł? Zgłoś to przez Issues na GitHubie — krótko i nieformalnie wystarczy.',
  /* moeglichkeiten[0].cta_label */ 'Zgłoś błąd lub pomysł',
  /* moeglichkeiten[1].titel */ 'Pomóż w tłumaczeniu',
  /* moeglichkeiten[1].text */ 'Aplikacja jest pomyślana jako wielojęzyczna. Jeśli dobrze znasz jeden z języków docelowych, możesz pomóc w tłumaczeniu i sprawdzaniu treści. Pliki językowe znajdują się w data/labels/ — każdy język przybliża aplikację do większej liczby grających.',
  /* moeglichkeiten[1].cta_label */ 'Wesprzyj tłumaczenie',
  /* moeglichkeiten[2].titel */ 'Wnieś wkład w kod',
  /* moeglichkeiten[2].text */ 'Lubisz programować? Ulepszenia samej aplikacji są mile widziane. Zforkuj projekt, wprowadź swoją zmianę i wyślij pull request na GitHubie.',
  /* moeglichkeiten[2].cta_label */ 'Wnieś wkład na GitHubie',
  /* mitmachen.feedback.titel */ 'Komentuj bezpośrednio na stronie',
  /* mitmachen.feedback.text */ 'Najszybciej przekażesz opinię bezpośrednio tu, w aplikacji: zaznacz fragment tekstu, dopisz swój komentarz, a na końcu wyślij wszystkie uwagi zbiorczo jako plik lub e-mail. Nic nie jest zapisywane — twoje notatki pozostają tylko w tej sesji.',
  /* mitmachen.feedback.knopf */ 'Uruchom tryb opinii',
  /* mitmachen.feedback.aktiv */ 'Tryb opinii jest aktywny — okrągły przycisk w prawym dolnym rogu otwiera narzędzia do zaznaczania, komentowania i wysyłania.',
  /* rechtliches.impressum.titel */ 'Nota prawna',
  /* impressum.absaetze[0] */ 'Informacje zgodnie z § 5 TMG / § 18 MStV dla niekomercyjnych projektów stowarzyszeń.',
  /* impressum.absaetze[1] */ 'Odpowiedzialny za treść: Damian Paderta',
  /* impressum.absaetze[2] */ 'Kontakt: contact@nozilla.de',
  /* impressum.absaetze[3] */ 'Stan na: lipiec 2026',
  /* rechtliches.datenschutz.titel */ 'Prywatność',
  /* datenschutz.absaetze[0] */ 'Ta aplikacja działa w całości w twojej przeglądarce. Twoje postępy w nauce i twoje dane są przechowywane wyłącznie lokalnie (localStorage) i nigdy nie są przesyłane na serwer.',
  /* datenschutz.absaetze[1] */ 'Nie odbywa się żadne śledzenie, analiza ani przekazywanie osobom trzecim. Nie są ustawiane żadne pliki cookie do celów reklamowych ani analitycznych.',
  /* datenschutz.absaetze[2] */ 'Przy dostępie przez GitHub Pages, z przyczyn technicznych, dzienniki serwera (m.in. adres IP) są przetwarzane przez GitHub, Inc.; dodatkowo obowiązuje ich polityka prywatności.',
  /* datenschutz.absaetze[3] */ 'Administrator w rozumieniu RODO: Damian Paderta. Kontakt: contact@nozilla.de',
  /* sprachen.liste[0].label */ 'Niemiecki',
  /* sprachen.liste[1].label */ 'Angielski',
  /* sprachen.liste[2].label */ 'Francuski',
  /* sprachen.liste[3].label */ 'Polski',
];

const PFAD = 'data/app-info.json';
let s = readFileSync(PFAD, 'utf8');

// Alle `"fr": "..."`-Vorkommen in Reihenfolge finden (String-Ende via Escape-Scan).
function findeFrStellen(text) {
  const stellen = [];
  const re = /"fr"\s*:\s*"/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    let i = re.lastIndex; // erstes Zeichen NACH dem öffnenden "
    while (i < text.length) {
      if (text[i] === '\\') { i += 2; continue; }
      if (text[i] === '"') break;
      i++;
    }
    // i zeigt auf schließendes " ; nächstes Nicht-WS muss } sein
    let j = i + 1;
    while (j < text.length && /\s/.test(text[j])) j++;
    if (text[j] !== '}') throw new Error(`fr-Knoten nicht mit } geschlossen bei Index ${i} (folgt: ${text.slice(i, i + 20)})`);
    stellen.push(i + 1); // Einfügeposition: direkt nach dem schließenden "
  }
  return stellen;
}

const stellen = findeFrStellen(s);
if (stellen.length !== PL.length) {
  console.error(`Anzahl fr-Knoten (${stellen.length}) ≠ PL-Einträge (${PL.length}) — Abbruch.`);
  process.exit(1);
}

// Von hinten nach vorn einfügen, damit frühere Indizes gültig bleiben.
for (let k = stellen.length - 1; k >= 0; k--) {
  const einf = ', "pl": ' + JSON.stringify(PL[k]);
  s = s.slice(0, stellen[k]) + einf + s.slice(stellen[k]);
}

// Sanity: gültiges JSON + pl-Vollständigkeit
const parsed = JSON.parse(s);
let cnt = 0, fehlt = 0;
(function walk(o) {
  if (Array.isArray(o)) return o.forEach(walk);
  if (o && typeof o === 'object') {
    if (typeof o.de === 'string') { cnt++; if (typeof o.pl !== 'string' || !o.pl) fehlt++; }
    for (const [k, v] of Object.entries(o)) { if (!['de', 'en', 'fr', 'pl'].includes(k)) walk(v); }
  }
})(parsed);
if (fehlt) { console.error(`${fehlt} Textknoten ohne pl — Abbruch.`); process.exit(1); }

writeFileSync(PFAD, s, 'utf8');
console.log(`app-info.json: ${cnt} Textknoten, alle mit pl. Datei geschrieben.`);
