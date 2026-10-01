// Turniersimulator-Engine: rechnet aus Feldzahl, Teilnehmenden, Turniermodus und
// Match-Begrenzung einen vollständigen Zeitplan je Feld und die Kennzahlen dazu.
// Rein funktional (kein DOM, kein Date.now(), kein Math.random()) — dieselben
// Eingaben ergeben immer denselben Plan, und jede Zahl lässt sich im Test
// nachrechnen (wie js/plan.js und js/ko-turnier.js).
//
// Ein Planungswerkzeug, kein Lerninhalt: kein Fortschritt, keine Baustein-Bindung.
// Die Einstellungen leben in der Adresse (ausQuery/zuQuery), damit ein Szenario
// als Link an die Turnierleitung gehen kann — sie sind darum ungeprüfte Eingabe
// und laufen IMMER durch normalisiere().
//
// Das Zeitmodell ist bewusst eine Schätzung mit offengelegten Annahmen
// (ANNAHMEN): Sekunden je Punkt, Punkte der verlierenden Seite, Satzverteilung.
// Die Ansicht zeigt sie an; wer sie ändert, ändert auch den Text dort.

// ---------- Eingaben ----------

// Grenzen und Vorgaben aller Zahlen-Regler. `schritt` gilt beim Normalisieren:
// ein Wert zwischen zwei Schritten wird auf den nächsten Schritt gerundet.
export const GRENZEN = {
  felder: { min: 1, max: 16, schritt: 1 },
  maenner: { min: 0, max: 64, schritt: 1 },
  frauen: { min: 0, max: 64, schritt: 1 },
  saetze: { min: 1, max: 3, schritt: 1 },
  punkte: { min: 4, max: 21, schritt: 1 },
  minuten: { min: 4, max: 12, schritt: 1 },
  halle: { min: 60, max: 720, schritt: 15 },
  puffer: { min: 0, max: 15, schritt: 1 },
};

// Feste Auswahlen. Die erste Option ist NICHT automatisch die Vorgabe — die
// steht in STANDARD.
export const AUSWAHL = {
  form: ['einzel', 'doppel'],
  wertung: ['getrennt', 'offen', 'mixed'],
  modus: ['ko', 'rr'],
  satz: ['punkte', 'zeit'],
};

// Ein Szenario, das ohne Eingriff ein sinnvolles Bild ergibt: ein mittleres
// Einzelturnier im K.-o.-System, das knapp in einen Hallentag passt.
export const STANDARD = Object.freeze({
  felder: 6,
  form: 'einzel',
  maenner: 16,
  frauen: 8,
  wertung: 'getrennt',
  modus: 'ko',
  satz: 'punkte',
  saetze: 2,
  punkte: 16,
  minuten: 8,
  halle: 360,
  start: '09:00',
  puffer: 5,
});

// Reihenfolge der Schlüssel in der Adresse — fest, damit derselbe Plan immer
// denselben Link ergibt.
const QUERY_REIHENFOLGE = ['felder', 'form', 'maenner', 'frauen', 'wertung', 'modus', 'satz', 'saetze', 'punkte', 'minuten', 'halle', 'start', 'puffer'];

const UHRZEIT = /^([01]\d|2[0-3]):([0-5]\d)$/;

function zahl(wert, grenze, vorgabe) {
  const n = typeof wert === 'number' ? wert : Number(String(wert ?? '').trim());
  if (!Number.isFinite(n) || String(wert ?? '').trim() === '') return vorgabe;
  const gerundet = grenze.min + Math.round((n - grenze.min) / grenze.schritt) * grenze.schritt;
  return Math.min(grenze.max, Math.max(grenze.min, gerundet));
}

function wahl(wert, optionen, vorgabe) {
  return optionen.includes(wert) ? wert : vorgabe;
}

// Macht aus beliebiger Eingabe (Formular, Adresse, Test) ein vollständiges,
// gültiges Szenario. Unbekanntes fällt auf die Vorgabe zurück, Zahlen werden
// begrenzt. Mixed gibt es nur im Doppel — im Einzel wird daraus „getrennt".
export function normalisiere(roh = {}) {
  const e = {};
  for (const [schluessel, grenze] of Object.entries(GRENZEN)) e[schluessel] = zahl(roh[schluessel], grenze, STANDARD[schluessel]);
  for (const [schluessel, optionen] of Object.entries(AUSWAHL)) e[schluessel] = wahl(roh[schluessel], optionen, STANDARD[schluessel]);
  e.start = typeof roh.start === 'string' && UHRZEIT.test(roh.start) ? roh.start : STANDARD.start;
  if (e.form === 'einzel' && e.wertung === 'mixed') e.wertung = 'getrennt';
  return e;
}

// Adresse → Szenario. Nimmt URLSearchParams oder ein schlichtes Objekt.
export function ausQuery(parameter) {
  const lies = typeof parameter?.get === 'function' ? (k) => parameter.get(k) ?? undefined : (k) => parameter?.[k];
  const roh = {};
  for (const schluessel of QUERY_REIHENFOLGE) roh[schluessel] = lies(schluessel);
  return normalisiere(roh);
}

// Szenario → Adresse (ohne „?"). Nur Abweichungen von der Vorgabe, damit der
// Standardfall eine saubere Adresse behält und ein Link kurz bleibt.
export function zuQuery(einstellungen) {
  const e = normalisiere(einstellungen);
  const teile = [];
  for (const schluessel of QUERY_REIHENFOLGE) {
    if (e[schluessel] !== STANDARD[schluessel]) teile.push(`${schluessel}=${encodeURIComponent(String(e[schluessel]))}`);
  }
  return teile.join('&');
}

// ---------- Zeitmodell ----------

export const ANNAHMEN = Object.freeze({
  // Sekunden je gespieltem Punkt, Ballwechsel samt kurzer Pause.
  sekundenJePunkt: { typ: 40, schnell: 35, langsam: 45 },
  // Die verlierende Seite holt im Mittel 70 % der Gewinnpunkte (bis 16: 16 zu 11).
  verliererAnteil: 0.7,
  // Die stärkere Seite gewinnt einen Satz mit 70 %. Best-of-3 geht damit im
  // Mittel über 2,42 Sätze, Best-of-5 über 3,89.
  satzchanceFavorit: 0.7,
});

function binomial(n, k) {
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return r;
}

// Erwartete Satzzahl, wenn gewinnt, wer zuerst `gewinnsaetze` Sätze holt.
export function erwarteteSaetze(gewinnsaetze, q = ANNAHMEN.satzchanceFavorit) {
  const g = gewinnsaetze;
  let erwartung = 0;
  for (let k = g; k <= 2 * g - 1; k++) {
    const p = binomial(k - 1, g - 1) * (q ** g * (1 - q) ** (k - g) + (1 - q) ** g * q ** (k - g));
    erwartung += k * p;
  }
  return erwartung;
}

// Dauer eines Matches in Minuten (ohne Wechselzeit).
export function matchDauer(einstellungen, sekundenJePunkt = ANNAHMEN.sekundenJePunkt.typ) {
  const e = normalisiere(einstellungen);
  if (e.satz === 'zeit') return e.minuten;
  const punkteJeSatz = e.punkte * (1 + ANNAHMEN.verliererAnteil);
  return (erwarteteSaetze(e.saetze) * punkteJeSatz * sekundenJePunkt) / 60;
}

// ---------- Konkurrenzen ----------

// Welche Konkurrenzen entstehen aus den Teilnehmenden? Ein Eintrag ist im Einzel
// eine Person, im Doppel ein Paar. Wer im Doppel keinen Partner bekommt, wird
// als `uebrig` gemeldet statt still verschluckt (wie im KO-Turnier).
export function konkurrenzen(einstellungen) {
  const e = normalisiere(einstellungen);
  const doppel = e.form === 'doppel';
  const liste = [];
  let uebrig = 0;
  const neu = (id, art, eintraege) => {
    if (eintraege > 0) liste.push({ id, art, eintraege, personenJeEintrag: doppel ? 2 : 1 });
  };
  if (!doppel) {
    if (e.wertung === 'offen') neu('offen_einzel', 'offen', e.maenner + e.frauen);
    else {
      neu('herren_einzel', 'herren', e.maenner);
      neu('damen_einzel', 'damen', e.frauen);
    }
  } else if (e.wertung === 'mixed') {
    const paare = Math.min(e.maenner, e.frauen);
    neu('mixed', 'mixed', paare);
    uebrig = e.maenner + e.frauen - 2 * paare;
  } else if (e.wertung === 'offen') {
    const alle = e.maenner + e.frauen;
    neu('offen_doppel', 'offen', Math.floor(alle / 2));
    uebrig = alle % 2;
  } else {
    neu('herren_doppel', 'herren', Math.floor(e.maenner / 2));
    neu('damen_doppel', 'damen', Math.floor(e.frauen / 2));
    uebrig = (e.maenner % 2) + (e.frauen % 2);
  }
  const personen = liste.reduce((s, k) => s + k.eintraege * k.personenJeEintrag, 0);
  return { liste, uebrig, personen };
}

// ---------- Matches ----------

// Jeder gegen jeden nach der Kreismethode: jede Runde ist eine Menge disjunkter
// Paare, und über alle Runden trifft jeder Eintrag jeden anderen genau einmal.
// Bei ungerader Zahl setzt je Runde ein Eintrag aus.
export function rundenJederGegenJeden(n) {
  if (n < 2) return [];
  const m = n % 2 === 0 ? n : n + 1;
  const kreis = Array.from({ length: m - 1 }, (_, i) => i + 1);
  const runden = [];
  for (let r = 0; r < m - 1; r++) {
    const reihe = [0, ...kreis];
    const paare = [];
    for (let k = 0; k < m / 2; k++) {
      const a = reihe[k];
      const b = reihe[m - 1 - k];
      if (a < n && b < n) paare.push([a, b]);
    }
    runden.push(paare);
    kreis.unshift(kreis.pop());
  }
  return runden;
}

// Setzliste eines K.-o.-Baums der Größe B (Zweierpotenz): 1 gegen B, B/2 gegen
// B/2+1 … so verteilt, dass die Freilose an die besten Plätze gehen und nie zwei
// Freilose aufeinandertreffen.
export function setzReihenfolge(groesse) {
  let reihe = [1];
  while (reihe.length < groesse) {
    const n = reihe.length * 2;
    reihe = reihe.flatMap((s) => [s, n + 1 - s]);
  }
  return reihe;
}

// Einfaches K.-o. mit Freilosen in Runde 1. Liefert je Runde die Knoten; ein
// Knoten ist ein Match (zwei Quellen) — Freilose erzeugen keins, ihr Eintrag
// rückt direkt als Quelle in Runde 2.
export function bracketKo(n) {
  if (n < 2) return { runden: [], groesse: n };
  const groesse = 2 ** Math.ceil(Math.log2(n));
  const plaetze = setzReihenfolge(groesse).map((s) => (s <= n ? { eintrag: s - 1 } : null));
  const runden = [];
  let ebene = [];
  for (let i = 0; i < groesse; i += 2) {
    const [a, b] = [plaetze[i], plaetze[i + 1]];
    ebene.push(a && b ? { match: true, quellen: [a, b] } : { match: false, durch: a || b });
  }
  runden.push(ebene);
  while (ebene.length > 1) {
    const naechste = [];
    for (let i = 0; i < ebene.length; i += 2) naechste.push({ match: true, quellen: [ebene[i], ebene[i + 1]] });
    runden.push(naechste);
    ebene = naechste;
  }
  return { runden, groesse };
}

// Alle Matches aller Konkurrenzen als flache Liste in Planungs-Reihenfolge.
// Quellen sind {eintrag} oder {match: index}. `rang` verteilt die Konkurrenzen
// gleichmäßig über den Tag (Rundenanteil statt Rundennummer), damit eine kleine
// Konkurrenz nicht früh fertig ist, während die große allein weiterläuft.
export function erzeugeMatches(konkurrenzListe, modus) {
  const matches = [];
  let versatz = 0;
  konkurrenzListe.forEach((k, ki) => {
    // Globale Nummer je Eintrag (über alle Konkurrenzen), damit die Planung
    // Verfügbarkeiten in einem schlichten Zahlenfeld führen kann.
    const basis = versatz;
    versatz += k.eintraege;
    if (modus === 'rr') {
      const runden = rundenJederGegenJeden(k.eintraege);
      runden.forEach((paare, ri) => {
        paare.forEach(([a, b], nr) => {
          matches.push({
            k: ki, runde: ri, rundenZahl: runden.length, nr, rundenGroesse: null,
            quellen: [{ eintrag: a, p: basis + a }, { eintrag: b, p: basis + b }],
            rang: (ri + 0.5) / runden.length,
          });
        });
      });
      return;
    }
    const { runden, groesse } = bracketKo(k.eintraege);
    const index = new Map();
    runden.forEach((ebene, ri) => {
      ebene.forEach((knoten, nr) => {
        if (!knoten.match) return;
        const quellen = knoten.quellen.map((q) => {
          if (q.eintrag !== undefined) return { eintrag: q.eintrag, p: basis + q.eintrag };
          if (!q.match) return { eintrag: q.durch.eintrag, p: basis + q.durch.eintrag };
          return { match: index.get(q) };
        });
        // Index VOR dem Sortieren; unten auf die Planungs-Reihenfolge umgeschrieben.
        index.set(knoten, matches.length);
        matches.push({
          k: ki, runde: ri, rundenZahl: runden.length, nr, rundenGroesse: groesse / 2 ** (ri + 1),
          quellen,
          rang: (ri + 0.5) / runden.length,
        });
      });
    });
  });
  // Stabile Planungs-Reihenfolge: Rundenanteil, dann Konkurrenz, dann Position.
  const reihenfolge = matches.map((m, i) => i).sort((x, y) => {
    const a = matches[x];
    const b = matches[y];
    return a.rang - b.rang || a.k - b.k || a.runde - b.runde || a.nr - b.nr || x - y;
  });
  const neuerIndex = new Map(reihenfolge.map((alt, neu) => [alt, neu]));
  const liste = reihenfolge.map((alt) => {
    const m = matches[alt];
    return {
      k: m.k, runde: m.runde, rundenZahl: m.rundenZahl, nr: m.nr, rundenGroesse: m.rundenGroesse,
      quellen: m.quellen.map((q) => (q.match !== undefined ? { match: neuerIndex.get(q.match) } : q)),
    };
  });
  liste.eintraege = versatz;
  return liste;
}

// ---------- Planung ----------

// Verteilt die Matches auf die Felder (Listenplanung): das Feld, das als
// nächstes frei wird, bekommt das Match, das dort am frühesten beginnen kann —
// bei Gleichstand das nächste in Planungs-Reihenfolge. Ein Match kann erst
// beginnen, wenn beide Seiten ihr letztes Match beendet und die Wechselzeit
// hinter sich haben; im K.-o. heißt das: wenn beide Zubringer-Matches fertig
// sind. Zwischen zwei Matches auf einem Feld liegt ebenfalls die Wechselzeit.
//
// Betrachtet werden nur die nächsten FENSTER offenen Matches — sonst wüchse der
// Aufwand quadratisch, und bei über 8000 Matches (128 Einträge jeder gegen
// jeden) hinge jeder Regler. Die Kreismethode liefert ohnehin Runden aus
// disjunkten Paaren; weiter vorn findet sich immer ein spielbares Match.
export function verteile(matches, felder, dauer, puffer) {
  const n = matches.length;
  const fenster = Math.max(32, felder * 4);
  const frei = new Array(felder).fill(0);
  // Frühester Start je Eintrag (globale Nummer p). Zahlenfeld statt Map mit
  // zusammengesetzten Schlüsseln: das Fenster prüft bei 8000 Matches rund eine
  // Million Kandidaten, jede Zeichenkette dort kostete spürbar Zeit.
  const bereitEintrag = new Float64Array(matches.eintraege ?? anzahlEintraege(matches));
  const geplant = new Uint8Array(n);
  const start = new Float64Array(n);
  const feld = new Int16Array(n);
  let kopf = 0;

  const bereitAb = (m) => {
    let t = 0;
    for (const q of m.quellen) {
      if (q.match !== undefined) {
        if (!geplant[q.match]) return Infinity;
        t = Math.max(t, start[q.match] + dauer + puffer);
      } else {
        t = Math.max(t, bereitEintrag[q.p]);
      }
    }
    return t;
  };

  for (let geplanteZahl = 0; geplanteZahl < n; geplanteZahl++) {
    let f = 0;
    for (let i = 1; i < felder; i++) if (frei[i] < frei[f]) f = i;
    const jetzt = frei[f];
    while (kopf < n && geplant[kopf]) kopf++;
    let bester = -1;
    let besterStart = Infinity;
    for (let i = kopf, gesehen = 0; i < n && gesehen < fenster; i++) {
      if (geplant[i]) continue;
      gesehen++;
      const s = Math.max(jetzt, bereitAb(matches[i]));
      if (s < besterStart) {
        besterStart = s;
        bester = i;
        if (s === jetzt) break;
      }
    }
    // Das erste offene Match hat nie einen ungeplanten Zubringer (Zubringer
    // stehen in der Reihenfolge immer davor) — es gibt also stets einen Kandidaten.
    const m = matches[bester];
    geplant[bester] = 1;
    start[bester] = besterStart;
    feld[bester] = f;
    frei[f] = besterStart + dauer + puffer;
    for (const q of m.quellen) {
      if (q.eintrag !== undefined) bereitEintrag[q.p] = besterStart + dauer + puffer;
    }
  }
  return { start: Array.from(start), feld: Array.from(feld) };
}

// Für eine Liste ohne mitgegebene Eintragszahl (etwa von Hand gebaut im Test).
function anzahlEintraege(matches) {
  let n = 0;
  for (const m of matches) for (const q of m.quellen) if (q.p !== undefined) n = Math.max(n, q.p + 1);
  return n;
}

// Ende des letzten Matches (ohne Wechselzeit danach).
function dauerVon(plan, dauer) {
  let ende = 0;
  for (const s of plan.start) ende = Math.max(ende, s + dauer);
  return ende;
}

// ---------- Auswertung ----------

// Ab dieser Wartezeit zwischen zwei eigenen Spielen meldet die Ansicht einen
// Hinweis (Minuten): im Mittel oder als längste einzelne Wartezeit.
export const WARTEN_HINWEIS = Object.freeze({ mittel: 45, laengste: 90 });

function wartezeiten(matches, plan, dauer) {
  const luecken = [];
  const jeEintrag = new Map();
  matches.forEach((m, i) => {
    for (const q of m.quellen) {
      if (q.match !== undefined) {
        // K.-o.: wer das Zubringer-Match gewinnt, wartet bis zu diesem Match.
        luecken.push(plan.start[i] - (plan.start[q.match] + dauer));
      } else {
        if (!jeEintrag.has(q.p)) jeEintrag.set(q.p, []);
        jeEintrag.get(q.p).push(plan.start[i]);
      }
    }
  });
  for (const starts of jeEintrag.values()) {
    starts.sort((a, b) => a - b);
    for (let i = 1; i < starts.length; i++) luecken.push(starts[i] - (starts[i - 1] + dauer));
  }
  if (!luecken.length) return { mittel: 0, laengste: 0 };
  let summe = 0;
  let laengste = 0;
  for (const x of luecken) {
    summe += x;
    if (x > laengste) laengste = x;
  }
  return { mittel: summe / luecken.length, laengste };
}

// Spiele je Person: jeder gegen jeden n−1 für alle; im K.-o. im Mittel
// 2(n−1)/n, mindestens eins, höchstens so viele wie Runden. Wer allein in
// seiner Konkurrenz steht oder ohne Partner:in bleibt, spielt gar nicht und
// zählt mit 0 — sonst stünde „für alle gleich" da, obwohl jemand zusieht.
function spieleJePerson(liste, modus, uebrig = 0) {
  let summe = 0;
  let personen = 0;
  let min = Infinity;
  let max = 0;
  for (const k of liste) {
    const p = k.eintraege * k.personenJeEintrag;
    if (k.eintraege < 2) {
      personen += p;
      min = 0;
      continue;
    }
    if (modus === 'rr') {
      summe += (k.eintraege - 1) * p;
      min = Math.min(min, k.eintraege - 1);
      max = Math.max(max, k.eintraege - 1);
    } else {
      summe += ((2 * (k.eintraege - 1)) / k.eintraege) * p;
      min = Math.min(min, 1);
      max = Math.max(max, Math.ceil(Math.log2(k.eintraege)));
    }
    personen += p;
  }
  if (uebrig > 0) {
    personen += uebrig;
    min = 0;
  }
  return personen ? { mittel: summe / personen, min, max } : { mittel: 0, min: 0, max: 0 };
}

// So viele Felder gelten als „unbegrenzt": mehr als die Hälfte der höchstens
// 128 Einträge einer offenen Konkurrenz kann nie gleichzeitig spielen. Mit so
// vielen Feldern zeigt dieselbe Planung, was die Kette eigener Spiele allein
// erzwingt — eine gemessene Größe statt einer geschätzten Untergrenze.
const FELDER_UNBEGRENZT = 64;

// Kleinste Feldzahl (bis zur Obergrenze), mit der `bedingung` gilt. Sucht binär:
// mehr Felder machen ein Turnier praktisch nie länger. Wo die Listenplanung
// davon im Einzelfall abweicht, ist das Ergebnis eine passende, nicht zwingend
// die kleinstmögliche Zahl — gemeldet wird aber nur eine Zahl, die passt.
// NUR für die Gesamtdauer: Wartezeiten steigen und fallen mit der Feldzahl,
// dort sucht `ersteFeldzahlAb` der Reihe nach.
function kleinsteFeldzahl(planMit, bedingung) {
  let unten = GRENZEN.felder.min;
  let oben = GRENZEN.felder.max;
  if (!bedingung(planMit(oben))) return null;
  while (unten < oben) {
    const mitte = Math.floor((unten + oben) / 2);
    if (bedingung(planMit(mitte))) oben = mitte;
    else unten = mitte + 1;
  }
  return unten;
}

// Erste Feldzahl über `ab` (bis zur Obergrenze), mit der `bedingung` gilt —
// der Reihe nach, weil die Bedingung nicht mit der Feldzahl wächst.
function ersteFeldzahlAb(ab, planMit, bedingung) {
  for (let f = ab + 1; f <= GRENZEN.felder.max; f++) if (bedingung(planMit(f))) return f;
  return null;
}

// Die ganze Simulation: Konkurrenzen, Matches, Zeitplan (typisch, schnell,
// langsam), Kennzahlen, Engpass und Warnungen.
export function simuliere(einstellungen) {
  const e = normalisiere(einstellungen);
  const { liste, uebrig, personen } = konkurrenzen(e);
  const matches = erzeugeMatches(liste, e.modus);
  const sek = ANNAHMEN.sekundenJePunkt;
  const dauer = {
    typ: matchDauer(e, sek.typ),
    schnell: matchDauer(e, sek.schnell),
    langsam: matchDauer(e, sek.langsam),
  };
  // Jede Feldzahl wird höchstens einmal geplant — Gesamtdauer, Engpass, nötige
  // Felder und die Felder gegen lange Wartezeiten fragen teils dieselben Zahlen.
  const plaene = new Map();
  const planMit = (f) => {
    if (!plaene.has(f)) plaene.set(f, verteile(matches, f, dauer.typ, e.puffer));
    return plaene.get(f);
  };
  const plan = planMit(e.felder);
  const gesamt = {
    typ: dauerVon(plan, dauer.typ),
    schnell: e.satz === 'zeit' ? null : dauerVon(verteile(matches, e.felder, dauer.schnell, e.puffer), dauer.schnell),
    langsam: e.satz === 'zeit' ? null : dauerVon(verteile(matches, e.felder, dauer.langsam, e.puffer), dauer.langsam),
  };
  // Auslastung: belegt ist ein Feld während des Matches UND der Wechselzeit
  // danach (Feldwechsel, Einspielen, Ergebnis) — nur nach dem letzten Match
  // des Tages zählt sie nicht mehr. Ohne die Wechselzeit käme ein voll
  // belegtes Feld nie über dauer/(dauer+puffer), bei 8 + 5 Minuten also 62 %.
  let belegt = 0;
  for (const s of plan.start) belegt += Math.min(s + dauer.typ + e.puffer, gesamt.typ) - s;
  const auslastung = gesamt.typ > 0 ? belegt / (e.felder * gesamt.typ) : 0;
  const warten = wartezeiten(matches, plan, dauer.typ);

  // Engpass und Kette werden GEMESSEN, nicht geschätzt: dieselbe Planung mit so
  // vielen Feldern, dass nie ein Match auf ein Feld wartet, zeigt die Dauer, die
  // allein die Kette eigener Spiele erzwingt (Runden im K.-o., jede Person ihre
  // Spiele nacheinander im Jeder gegen jeden — bei ungerader Zahl sind das n
  // Wellen, nicht n−1). Zwei Schätzungen gegeneinander zu halten lag daneben:
  // im Standard-Szenario hieß es „mehr Felder helfen kaum", obwohl acht statt
  // sechs Felder eine ganze Welle sparen.
  // Felder sind der Engpass, wenn mehr von ihnen mindestens ein halbes Match
  // einsparen würden — gemessen an der Höchstzahl, die der Simulator zulässt.
  // Gegen unbegrenzt viele gemessen, versprach „mehr Felder verkürzen das
  // Turnier" eine Ersparnis, die erst ab 17 Feldern eintritt (K.-o. mit 49
  // Einträgen: 11 bis 16 Felder dauern gleich lang). Nur wer schon die
  // Höchstzahl eingestellt hat, wird gegen unbegrenzt viele gemessen.
  const takt = dauer.typ + e.puffer;
  const unbegrenzt = matches.length ? dauerVon(planMit(Math.max(e.felder, FELDER_UNBEGRENZT)), dauer.typ) : 0;
  const bestenfalls = matches.length && e.felder < GRENZEN.felder.max
    ? dauerVon(planMit(GRENZEN.felder.max), dauer.typ)
    : unbegrenzt;
  const engpass = matches.length ? (gesamt.typ - bestenfalls >= takt / 2 ? 'felder' : 'runden') : null;

  const passtInHalle = gesamt.typ <= e.halle;
  // Passt es nicht einmal mit unbegrenzt vielen Feldern, ist die Kette selbst zu
  // lang — ein anderer Grund als „zu viele Matches für 16 Felder", und die
  // Ansicht nennt nur den zutreffenden.
  const ketteZuLang = unbegrenzt > e.halle;
  const felderNoetig = matches.length
    ? kleinsteFeldzahl(planMit, (p) => dauerVon(p, dauer.typ) <= e.halle)
    : null;
  const langesWarten = warten.mittel > WARTEN_HINWEIS.mittel || warten.laengste > WARTEN_HINWEIS.laengste;
  const felderFuerWarten = langesWarten && matches.length
    ? ersteFeldzahlAb(e.felder, planMit, (p) => {
        const w = wartezeiten(matches, p, dauer.typ);
        return w.mittel <= WARTEN_HINWEIS.mittel && w.laengste <= WARTEN_HINWEIS.laengste;
      })
    : null;

  const matchesJeKonkurrenz = liste.map(() => 0);
  for (const m of matches) matchesJeKonkurrenz[m.k]++;

  const ablauf = matches
    .map((m, i) => ({
      feld: plan.feld[i],
      start: plan.start[i],
      ende: plan.start[i] + dauer.typ,
      konkurrenz: liste[m.k].id,
      art: liste[m.k].art,
      runde: m.runde,
      rundenZahl: m.rundenZahl,
      rundenGroesse: m.rundenGroesse,
    }))
    .sort((a, b) => a.feld - b.feld || a.start - b.start);

  return {
    einstellungen: e,
    konkurrenzen: liste.map((k, ki) => ({
      ...k,
      matches: matchesJeKonkurrenz[ki],
      runden: k.eintraege < 2 ? 0 : e.modus === 'rr' ? (k.eintraege % 2 ? k.eintraege : k.eintraege - 1) : Math.ceil(Math.log2(k.eintraege)),
    })),
    uebrig,
    personen,
    matchDauer: dauer,
    matchZahl: matches.length,
    ablauf,
    gesamt,
    auslastung,
    spieleJePerson: spieleJePerson(liste, e.modus, uebrig),
    warten,
    engpass,
    passtInHalle,
    felderNoetig,
    ketteZuLang,
    langesWarten,
    felderFuerWarten,
  };
}

// ---------- Zeitangaben ----------

// Minuten nach Turnierbeginn → Uhrzeit. `tag` zählt, wie oft Mitternacht
// überschritten wurde (ein Turnier, das nicht in einen Tag passt, soll das
// sichtbar sagen, statt um 3 Uhr „früh" zu enden).
export function uhrzeit(beginn, minuten) {
  const [h, m] = (UHRZEIT.test(beginn) ? beginn : STANDARD.start).split(':').map(Number);
  const gesamt = h * 60 + m + Math.round(minuten);
  const tag = Math.floor(gesamt / 1440);
  const rest = gesamt - tag * 1440;
  const text = `${String(Math.floor(rest / 60)).padStart(2, '0')}:${String(rest % 60).padStart(2, '0')}`;
  return { text, tag };
}

// Minuten → ganze Stunden und Minuten (gerundet auf ganze Minuten).
export function stundenMinuten(minuten) {
  const gesamt = Math.round(minuten);
  return { h: Math.floor(gesamt / 60), m: gesamt % 60 };
}
