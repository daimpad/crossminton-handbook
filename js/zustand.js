// Persistenter Zustand der Person: Diagnose, baustein-gebundener Fortschritt,
// Kontinuität und Einstellungen. Ein localStorage-Schlüssel, versioniertes Schema.
// Der Abschluss-Status ist ein erweiterbarer Zustandsraum: heute offen/erledigt,
// „beherrscht" ist später nur ein weiterer Wert, keine Migration.

const SPEICHER_KEY = 'crossminton.zustand.v1';
const SCHEMA_VERSION = 1;

let z = null;
let speicherVerfuegbar = true;

function vorgabe() {
  return {
    schemaVersion: SCHEMA_VERSION,
    onboardingAbgeschlossen: false,
    diagnose: { stufe: null, trainer: false, herkunft: null, ziel: null },
    fortschritt: {},
    kontinuitaet: { gesamt: 0, jeEinheit: {} },
    einstellungen: { sprache: 'de', transferKuerzelSichtbar: false, thema: 'hell' },
    // Persönlicher Trainingsplan (generiert, anpassbar): null = noch keiner erstellt.
    plan: null,
    // Merkliste: baustein-gebundene Wiedervorlage (Liste von Baustein-IDs in
    // Merk-Reihenfolge). Wie der Fortschritt am Baustein, nie am Pfad.
    merkliste: [],
    // KO-Turnier (Spaßturnier-Werkzeug, kein Lerninhalt): null = kein aktives
    // Turnier. Ein Turnier zur Zeit, wie der Trainingsplan.
    koTurnier: null,
  };
}

// Darf ein gespeicherter Wert die Vorgabe ersetzen? Nur bei GLEICHER GESTALT.
//
// Ohne diese Prüfung überschrieb ein `"diagnose": null` im gespeicherten Zustand
// das Vorgabe-Objekt komplett — danach warf jedes `diagnose().stufe` und die App
// zeigte einen leeren Bildschirm ohne jede Meldung. Genau das darf hier nicht
// passieren: was im Speicher steht, kommt von außen und kann alles sein
// (halber Schreibvorgang, fremdes Werkzeug, künftiger Refaktor). Passt es nicht,
// gewinnt die Vorgabe — das kostet höchstens eine Einstellung, nie die App.
//
// Ist die Vorgabe selbst ein Skalar oder `null` (plan, koTurnier), ist jeder
// gespeicherte Wert zulässig: dort ist der Übergang null → Objekt der Normalfall.
// Unbekannte Zusatz-Schlüssel (keine Vorgabe vorhanden) bleiben ebenfalls erhalten.
function gestaltPasst(basis, wert) {
  if (Array.isArray(basis)) return Array.isArray(wert);
  if (basis && typeof basis === 'object') return wert != null && typeof wert === 'object' && !Array.isArray(wert);
  return true;
}

// Tiefer Merge: gespeicherte Werte überlagern die Vorgabe rekursiv, sodass auch
// künftige verschachtelte Default-Keys erhalten bleiben. Arrays und Skalare ersetzen.
function tiefMerge(basis, gespeichert) {
  if (gespeichert == null || typeof gespeichert !== 'object' || Array.isArray(gespeichert)) return basis;
  const ergebnis = { ...basis };
  for (const [k, v] of Object.entries(gespeichert)) {
    const b = basis[k];
    if (!gestaltPasst(b, v)) continue; // unbrauchbar — Vorgabe behalten
    if (b && typeof b === 'object' && !Array.isArray(b)) {
      ergebnis[k] = tiefMerge(b, v);
    } else {
      ergebnis[k] = v;
    }
  }
  return ergebnis;
}

function verschmelze(basis, gespeichert) {
  if (gespeichert == null || typeof gespeichert !== 'object') return basis;
  const ergebnis = tiefMerge(basis, gespeichert);
  ergebnis.schemaVersion = SCHEMA_VERSION;
  return ergebnis;
}

export function ladeZustand() {
  let gespeichert = null;
  try {
    const roh = globalThis.localStorage?.getItem(SPEICHER_KEY);
    if (roh) gespeichert = JSON.parse(roh);
  } catch {
    gespeichert = null;
  }
  z = verschmelze(vorgabe(), gespeichert);
  speichereZustand();
  return z;
}

function stelleSicher() {
  if (!z) ladeZustand();
  return z;
}

export function speichereZustand() {
  try {
    globalThis.localStorage?.setItem(SPEICHER_KEY, JSON.stringify(z));
    speicherVerfuegbar = typeof globalThis.localStorage !== 'undefined';
  } catch {
    speicherVerfuegbar = false;
  }
}

export function speicherIstVerfuegbar() {
  stelleSicher();
  return speicherVerfuegbar;
}

export function aktuellerZustand() {
  return stelleSicher();
}

export function diagnose() {
  return stelleSicher().diagnose;
}

export function setzeDiagnose(patch) {
  Object.assign(stelleSicher().diagnose, patch);
  speichereZustand();
}

export function istOnboardingAbgeschlossen() {
  return stelleSicher().onboardingAbgeschlossen;
}

export function schliesseOnboardingAb() {
  stelleSicher().onboardingAbgeschlossen = true;
  speichereZustand();
}

// Abschluss-Status je Teil: 'offen' | 'erledigt' (getrennt für Erklär- und Übungsteil).
export function teilStatus(bausteinId, teil) {
  const eintrag = stelleSicher().fortschritt[bausteinId];
  return eintrag?.[teil] === 'erledigt' ? 'erledigt' : 'offen';
}

export function setzeTeilStatus(bausteinId, teil, status) {
  const fortschritt = stelleSicher().fortschritt;
  if (!fortschritt[bausteinId]) fortschritt[bausteinId] = {};
  fortschritt[bausteinId][teil] = status;
  speichereZustand();
}

export function einstellungen() {
  return stelleSicher().einstellungen;
}

export function setzeEinstellung(schluessel, wert) {
  stelleSicher().einstellungen[schluessel] = wert;
  speichereZustand();
}

export function kontinuitaet() {
  return stelleSicher().kontinuitaet;
}

// Kumulativ, ohne Abbruchmechanik: Sitzungen summieren sich, Pausen entwerten nichts.
export function registriereEinheitAbschluss(einheitId) {
  const k = stelleSicher().kontinuitaet;
  k.gesamt += 1;
  k.jeEinheit[einheitId] = (k.jeEinheit[einheitId] || 0) + 1;
  speichereZustand();
  return k.gesamt;
}

// Trainingsplan: ein generierter, danach anpassbarer Wochenplan. Rein persistent,
// kein Fortschritt (der bleibt baustein-gebunden über die Einheiten-Referenzen).
// Ein Dokument-Slice ist entweder `null` oder ein Objekt — nie ein String, eine
// Zahl oder eine Liste. Was im Speicher steht, kann davon abweichen: ein alter
// Stand mit anderer Gestalt, ein halber Schreibvorgang. Die Ansichten lesen
// darauf direkt Felder (`plan.sessions`, `turnier.runden`), ein Fremdkoerper
// warf dort und liess die Seite LEER zurueck. Lieber „noch keiner erstellt" —
// beides ist in zwei Klicks neu erzeugt, ein leerer Bildschirm nicht erklaerbar.
function alsDokument(wert) {
  return wert && typeof wert === 'object' && !Array.isArray(wert) ? wert : null;
}

export function plan() {
  return alsDokument(stelleSicher().plan);
}

export function setzePlan(neu) {
  stelleSicher().plan = neu;
  speichereZustand();
  return neu;
}

export function loeschePlan() {
  stelleSicher().plan = null;
  speichereZustand();
}

// Merkliste: eine Liste gemerkter Baustein-IDs (Wiedervorlage). Baustein-gebunden
// wie der Fortschritt; die Reihenfolge ist die Merk-Reihenfolge (hinten angehängt).
// Unbekannte IDs (z. B. nach einer Datenänderung) werden erst beim Rendern gefiltert.
export function merkliste() {
  return stelleSicher().merkliste;
}

export function istGemerkt(bausteinId) {
  return stelleSicher().merkliste.includes(bausteinId);
}

// Umschalten: fügt hinten an oder entfernt. Gibt den neuen Zustand zurück (true = gemerkt).
export function schalteMerken(bausteinId) {
  const liste = stelleSicher().merkliste;
  const i = liste.indexOf(bausteinId);
  if (i >= 0) liste.splice(i, 1);
  else liste.push(bausteinId);
  speichereZustand();
  return liste.includes(bausteinId);
}

export function vergiss(bausteinId) {
  const liste = stelleSicher().merkliste;
  const i = liste.indexOf(bausteinId);
  if (i >= 0) {
    liste.splice(i, 1);
    speichereZustand();
  }
}

// KO-Turnier: ein generiertes, danach fortgeschriebenes Bracket (js/ko-turnier.js).
// Rein persistent, kein Fortschritt und keine Baustein-Bindung — ein eigenständiges
// Werkzeug für ein selbst organisiertes Spaßturnier.
export function koTurnier() {
  return alsDokument(stelleSicher().koTurnier);
}

export function setzeKoTurnier(neu) {
  stelleSicher().koTurnier = neu;
  speichereZustand();
  return neu;
}

export function loescheKoTurnier() {
  stelleSicher().koTurnier = null;
  speichereZustand();
}

export function setzeZurueck() {
  try {
    globalThis.localStorage?.removeItem(SPEICHER_KEY);
  } catch {
    /* egal — Neuaufbau folgt ohnehin */
  }
  z = vorgabe();
  speichereZustand();
  return z;
}
