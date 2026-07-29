// KO-Turnier-Engine: erzeugt aus einer Teilnehmerliste ein Einzel-K.-o.-Bracket,
// trägt Sieger ein und lässt die nächste Runde automatisch entstehen, sobald die
// aktuelle komplett ist. Rein funktional (kein DOM); Zufälligkeit (Auslosung) kommt
// als bereits gemischte Liste herein — die Engine ruft nie selbst Math.random() auf
// und bleibt so deterministisch testbar (analog zu js/plan.js).
//
// Kein „offizielles" Turnier-Feature (das ist js/ansichten/turnier.js, das
// Regularium) — ein eigenständiges Werkzeug für ein selbst organisiertes
// Spaßturnier: Namen eintragen, auslosen, Sieger antippen, am Ende steht fest,
// wer gewonnen hat und wer wie weit gekommen ist (Platzierung).

const MIN_TEILNEHMER = 2;

// Fisher-Yates mit injizierter Zufallsquelle (Standard: Math.random) — bleibt
// dadurch deterministisch testbar (Tests reichen eine feste Quelle herein).
export function mische(liste, zufall = Math.random) {
  const kopie = [...liste];
  for (let i = kopie.length - 1; i > 0; i--) {
    const j = Math.floor(zufall() * (i + 1));
    [kopie[i], kopie[j]] = [kopie[j], kopie[i]];
  }
  return kopie;
}

function naechstePotenzVonZwei(n) {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

// Runde 1 aus einer bereits gemischten Teilnehmerliste: Ist die Teilnehmerzahl keine
// Zweierpotenz, entstehen Freilose (automatisch entschiedene Matches mit nur einer
// Person) — gleichmäßig verteilt, sodass Runde 2 wieder eine saubere Zweierpotenz ist.
// Da `gemischt` bereits zufällig geordnet ist, ist auch die Freilos-Vergabe zufällig.
function ersteRunde(gemischt) {
  const groesse = naechstePotenzVonZwei(gemischt.length);
  const freilose = groesse - gemischt.length;
  const matchZahl = groesse / 2;
  const matches = [];
  let cursor = 0;
  for (let i = 0; i < matchZahl; i++) {
    if (i >= matchZahl - freilose) {
      const a = gemischt[cursor]; cursor += 1;
      matches.push({ a, b: null, sieger: a });
    } else {
      const a = gemischt[cursor]; cursor += 1;
      const b = gemischt[cursor]; cursor += 1;
      matches.push({ a, b, sieger: null });
    }
  }
  return matches;
}

// Erzeugt ein neues Turnier. `gemischteTeilnehmer` ist die bereits ausgeloste
// (gemischte) Namensliste — siehe mische(). Wirft bei zu wenig oder doppelten
// Namen (echter Programmfehler-Fall, keine Zwei-Ebenen-Logik-Frage).
export function erzeugeTurnier(titel, gemischteTeilnehmer) {
  const teilnehmer = (gemischteTeilnehmer || []).map((n) => String(n).trim()).filter(Boolean);
  if (teilnehmer.length < MIN_TEILNEHMER) {
    throw new Error(`erzeugeTurnier: mindestens ${MIN_TEILNEHMER} Teilnehmer:innen erforderlich`);
  }
  if (new Set(teilnehmer).size !== teilnehmer.length) {
    throw new Error('erzeugeTurnier: Namen müssen eindeutig sein');
  }
  return {
    titel: String(titel || '').trim(),
    teilnehmer,
    runden: [ersteRunde(teilnehmer)],
  };
}

// Trägt den Sieger eines Matches ein. Ist die Runde damit komplett, entsteht die
// nächste Runde automatisch aus den Siegern (Finale-Sieger erzeugt keine weitere
// Runde mehr). Wird der Sieger eines bereits entschiedenen Matches GEÄNDERT, werden
// alle darauf aufbauenden späteren Runden verworfen — sie beruhten auf der alten
// Entscheidung und müssen neu entstehen, sobald diese Runde wieder komplett ist.
// Ungültige Eingaben (unbekanntes Match/unbeteiligter Name) sind kein Fehlerfall
// und lassen das Turnier unverändert (defensiv gegen veraltete UI-Zustände).
export function traegtSiegerEin(turnier, rundenIndex, matchIndex, sieger) {
  const aktuellesMatch = turnier.runden[rundenIndex]?.[matchIndex];
  if (!aktuellesMatch) return turnier;
  if (aktuellesMatch.a !== sieger && aktuellesMatch.b !== sieger) return turnier;
  if (aktuellesMatch.sieger === sieger) return turnier;

  const runden = turnier.runden.slice(0, rundenIndex + 1).map((runde) => runde.map((m) => ({ ...m })));
  runden[rundenIndex][matchIndex].sieger = sieger;

  if (runden[rundenIndex].every((m) => m.sieger)) {
    const siegerListe = runden[rundenIndex].map((m) => m.sieger);
    if (siegerListe.length > 1) {
      const naechste = [];
      for (let i = 0; i < siegerListe.length; i += 2) {
        naechste.push({ a: siegerListe[i], b: siegerListe[i + 1], sieger: null });
      }
      runden.push(naechste);
    }
  }
  return { ...turnier, runden };
}

export function istAbgeschlossen(turnier) {
  const letzte = turnier.runden[turnier.runden.length - 1];
  return Boolean(letzte && letzte.length === 1 && letzte[0].sieger);
}

export function turniersieger(turnier) {
  return istAbgeschlossen(turnier) ? turnier.runden[turnier.runden.length - 1][0].sieger : null;
}

// Bracket-übliche Rundennamen anhand der Match-Zahl dieser Runde. `null` bedeutet:
// keine besondere Bezeichnung — die Ansicht zeigt dann „Runde {rundenIndex+1}".
const RUNDENNAMEN = { 1: 'finale', 2: 'halbfinale', 4: 'viertelfinale', 8: 'achtelfinale' };
export function rundenName(matchAnzahl) {
  return RUNDENNAMEN[matchAnzahl] || null;
}

// Platzierung je Teilnehmer:in: die Runde (0-basiert), in der die Person verlor,
// oder null, solange sie noch nicht verloren hat (das schließt den amtierenden bzw.
// finalen Turniersieger ein — die Ansicht unterscheidet „noch im Turnier" vs.
// „Turniersieger" über istAbgeschlossen()/turniersieger()). Sortiert nach bester
// Platzierung zuerst (später ausgeschieden = weiter gekommen).
export function platzierungen(turnier) {
  const ausgeschieden = new Map();
  turnier.runden.forEach((runde, ri) => {
    for (const m of runde) {
      if (!m.sieger) continue;
      const verlierer = m.a === m.sieger ? m.b : m.a;
      if (verlierer) ausgeschieden.set(verlierer, ri);
    }
  });
  return turnier.teilnehmer
    .map((name) => ({ name, ausgeschiedenInRunde: ausgeschieden.has(name) ? ausgeschieden.get(name) : null }))
    .sort((a, b) => (b.ausgeschiedenInRunde ?? Infinity) - (a.ausgeschiedenInRunde ?? Infinity));
}
