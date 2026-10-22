// Trainingsplan-Engine (Spez. 6.4, „regelbasierte Generierung"): baut aus den
// stufen-gefilterten Trainingseinheiten einen Wochenplan mit Terminen. Rein
// funktional (kein DOM); das Startdatum kommt als ISO herein und ein Zeitstempel
// wird für den iCal-Export durchgereicht — so bleibt die Erzeugung deterministisch
// und testbar (kein Date.now()).

import { einheitReferenzen } from './daten.js';
import { trainingsuebersicht } from './pfade.js';

// --- Trainings-Metadaten (Spez. 13.4) ---------------------------------------
// Die vier Felder hängen am Baustein, geplant werden aber Einheiten. `einheitProfil`
// verdichtet die Metadaten der referenzierten Übungsbausteine zu einem Einheiten-
// Profil, das die Verteilung steuert und in der Ansicht sichtbar wird. Bewusst
// Klassen statt Minuten (Gesundheitsrahmen) — es wird nie zu einer Dosierung addiert.
const DAUER_RANG = { kurz: 1, mittel: 2, lang: 3 };
const INTENSITAET_RANG = { niedrig: 1, mittel: 2, hoch: 3 };
const RANG_ZU_DAUER = ['kurz', 'kurz', 'mittel', 'lang'];

function rangZuName(tabelle, rang) {
  return Object.keys(tabelle).find((k) => tabelle[k] === rang) || null;
}

// Verdichtet die Metadaten einer Einheit. `dauer` schätzt den Umfang als Klasse
// (Summe der Baustein-Klassen, auf drei Stufen zurückgebildet), `intensitaet` nimmt
// die SPITZE (sie bestimmt den Erholungsbedarf, nicht der Mittelwert), `fokus` die
// Vereinigung.
//
// `phasenTreu`/`abweichungen` sind eine INFORMATIVE Konsistenzaussage, keine Sperre
// und ausdrücklich kein Lint: 6 der 8 kuratierten Einheiten sind bewusst „untreu",
// weil die beiden Quellen `ausklang` verschieden lesen. Die Einheiten nutzen den
// Ausklang als *spielerischen Abschluss* (die Hinweise sagen es: „Spielerische
// Anwendung", „Spielnaher Abschluss: intensive Ballwechsel", „Integration") und
// setzen dort absichtlich eine intensive Anwendung; die Trainings-Metadaten aus dem
// Übergabepaket lesen `ausklang` im engeren Sinn des Herunterfahrens. Beide Seiten
// sind für sich stimmig — darum wird hier nichts angeglichen und nichts gewarnt.
// Der Wert taugt als Fund für die Redaktion und als Wächter gegen eine KÜNFTIGE
// Einheit, die etwa eine reine Erwärmungsübung in den Hauptteil setzt.
export function einheitProfil(daten, einheitId) {
  const einheit = (daten.einheiten || []).find((e) => e.id === einheitId);
  if (!einheit) return null;
  const referenzen = einheitReferenzen(einheit);
  let dauerSumme = 0;
  let intensitaetSumme = 0;
  let intensitaetSpitze = 0;
  const fokus = new Set();
  const abweichungen = [];
  let getaggt = 0;
  for (const ref of referenzen) {
    const b = daten.bausteinVonId.get(ref.baustein);
    if (!b || !b.dauer_klasse) continue;
    getaggt += 1;
    dauerSumme += DAUER_RANG[b.dauer_klasse] || 0;
    const rang = INTENSITAET_RANG[b.intensitaet] || 0;
    intensitaetSumme += rang;
    intensitaetSpitze = Math.max(intensitaetSpitze, rang);
    for (const f of b.fokus || []) fokus.add(f);
    if ((b.geeignete_phase || []).length && !b.geeignete_phase.includes(ref.phase)) {
      abweichungen.push({ baustein: ref.baustein, phase: ref.phase, angeboten: b.geeignete_phase });
    }
  }
  if (!getaggt) return null;
  const mittel = dauerSumme / getaggt;
  return {
    einheit: einheitId,
    bausteine: getaggt,
    dauer: RANG_ZU_DAUER[Math.min(3, Math.round(mittel))] || 'mittel',
    intensitaet: rangZuName(INTENSITAET_RANG, intensitaetSpitze) || 'mittel',
    // `last` ist das ABGESTUFTE Maß (Mittel der Ränge, 1–3) und steuert die
    // Verteilung; `intensitaet` bleibt die Spitze und ist die ehrliche Aussage für
    // die Anzeige („diese Einheit enthält harte Arbeit"). Die Spitze allein taugt
    // NICHT zum Verteilen: 7 der 8 kuratierten Einheiten haben mindestens einen
    // harten Baustein und wären damit alle gleich „hoch" — die Last trennt sie
    // (1,40 bis 2,80) und macht den Lastwechsel überhaupt wirksam.
    last: Math.round((intensitaetSumme / getaggt) * 100) / 100,
    fokus: [...fokus].sort(),
    phasenTreu: abweichungen.length === 0,
    abweichungen,
  };
}

// n Einheiten gleichmäßig auf die Woche verteilen → n Wochentag-Offsets (0 = Mo … 6 = So).
function verteileTage(n) {
  const tage = [];
  for (let i = 0; i < n; i++) tage.push(Math.min(6, Math.floor((i * 7) / n)));
  return tage;
}

// ISO-Datum (YYYY-MM-DD) + Tage → ISO-Datum. Rechnet in UTC, um Zeitzonen-/DST-Sprünge zu meiden.
function plusTage(iso, tage) {
  const [j, m, t] = String(iso).split('-').map(Number);
  const d = new Date(Date.UTC(j, m - 1, t));
  d.setUTCDate(d.getUTCDate() + tage);
  return d.toISOString().slice(0, 10);
}

// Planbare Einheiten: stufen-kumulativ (aus trainingsuebersicht), optional nach Spielform.
export function planbareEinheiten(daten, spielform = 'alle') {
  return trainingsuebersicht(daten)
    .map((u) => u.einheit)
    .filter((e) => spielform === 'alle' || (e.spielform || 'einzel') === spielform);
}

const STANDARD = { wochen: 4, einheitenProWoche: 2, spielform: 'alle' };

// Ab dieser Last gilt eine Einheit als schwer (über „mittel" im Rang-Mittel).
const SCHWER = 2.0;

// Wählt aus den noch nicht verplanten Kandidaten den nächsten. Zwei Regeln aus den
// Trainings-Metadaten, beide DETERMINISTISCH (kein Math.random — der Plan muss
// reproduzierbar und testbar bleiben):
//   Lastwechsel — nach einer SCHWEREN Einheit zählt die Last des Kandidaten gegen
//                 ihn; nach einer leichten spielt sie keine Rolle.
//   Abwechslung — die Fokus-Überschneidung mit der Vorgänger-Einheit zählt gegen ihn.
// Beide Regeln werden ADDIERT, keine hat Vorrang: eine etwas schwerere Einheit darf
// gewinnen, wenn sie thematisch besser abwechselt. Bei Gleichstand gewinnt die
// Pool-Reihenfolge (stabil). Ohne Metadaten (kein
// Profil) fällt die Wahl auf die reine Rotation zurück — kein Fehlerfall.
function waehleNaechste(kandidaten, profile, vorige) {
  const vor = vorige ? profile.get(vorige) : null;
  if (!vor) return kandidaten[0];
  let beste = kandidaten[0];
  let bestesGewicht = Infinity;
  for (const id of kandidaten) {
    const p = profile.get(id);
    if (!p) continue;
    const lastStrafe = vor.last >= SCHWER ? p.last * 2 : 0;
    const ueberschneidung = p.fokus.filter((f) => vor.fokus.includes(f)).length;
    const gewicht = lastStrafe + ueberschneidung;
    if (gewicht < bestesGewicht) {
      bestesGewicht = gewicht;
      beste = id;
    }
  }
  return beste;
}

// Erzeugt einen Plan: verteilt die planbaren Einheiten auf Termine ab startISO.
// Die Reihenfolge folgt den Trainings-Metadaten (Lastverteilung + Abwechslung,
// s. `waehleNaechste`); ist der Pool erschöpft, beginnt er von vorn. Ohne planbare
// Einheiten bleibt `sessions` leer.
export function erzeugePlan(daten, konfig = {}) {
  const k = { ...STANDARD, ...konfig };
  if (!k.startISO || Number.isNaN(Date.parse(k.startISO))) {
    throw new Error('erzeugePlan: gültiges startISO (YYYY-MM-DD) erforderlich');
  }
  const wochen = Math.max(1, Math.min(12, (k.wochen | 0) || STANDARD.wochen));
  const proWoche = Math.max(1, Math.min(4, (k.einheitenProWoche | 0) || STANDARD.einheitenProWoche));
  const pool = planbareEinheiten(daten, k.spielform).map((e) => e.id);
  const profile = new Map(pool.map((id) => [id, einheitProfil(daten, id)]));
  const tage = verteileTage(proWoche);
  const sessions = [];
  let uebrig = [...pool];
  let vorige = null;
  for (let w = 0; w < wochen && pool.length > 0; w++) {
    for (let s = 0; s < proWoche; s++) {
      if (!uebrig.length) uebrig = [...pool]; // Pool erschöpft → neue Runde
      const gewaehlt = waehleNaechste(uebrig, profile, vorige);
      uebrig = uebrig.filter((id) => id !== gewaehlt);
      sessions.push({ datum: plusTage(k.startISO, w * 7 + tage[s]), einheit: gewaehlt });
      vorige = gewaehlt;
    }
  }
  return { startISO: k.startISO, wochen, einheitenProWoche: proWoche, spielform: k.spielform, sessions };
}

// Tauscht die Einheit einer Session gegen die nächste planbare (zyklisch) — macht „anpassbar".
export function tauscheEinheit(daten, plan, index) {
  const pool = planbareEinheiten(daten, plan.spielform).map((e) => e.id);
  if (!plan.sessions[index] || pool.length <= 1) return plan;
  const aktuell = pool.indexOf(plan.sessions[index].einheit);
  const naechste = pool[(aktuell + 1 + pool.length) % pool.length];
  const sessions = plan.sessions.map((s, i) => (i === index ? { ...s, einheit: naechste } : s));
  return { ...plan, sessions };
}

// Entfernt eine Session (die Termine der übrigen bleiben, wie sie waren).
export function entferneSession(plan, index) {
  return { ...plan, sessions: plan.sessions.filter((_, i) => i !== index) };
}

// Sessions nach Wochen-Nummer gruppieren (für Anzeige/Druck), abgeleitet aus dem Datum.
export function planNachWochen(plan) {
  if (!plan || !plan.sessions.length) return [];
  const gruppen = new Map();
  for (const s of plan.sessions) {
    const woche = Math.floor(tageDifferenz(plan.startISO, s.datum) / 7) + 1;
    if (!gruppen.has(woche)) gruppen.set(woche, []);
    gruppen.get(woche).push(s);
  }
  return [...gruppen.entries()].sort((a, b) => a[0] - b[0]).map(([woche, sessions]) => ({ woche, sessions }));
}

function tageDifferenz(isoA, isoB) {
  const ms = (iso) => {
    const [j, m, t] = String(iso).split('-').map(Number);
    return Date.UTC(j, m - 1, t);
  };
  return Math.round((ms(isoB) - ms(isoA)) / 86400000);
}

function icalEscape(s) {
  return String(s == null ? '' : s).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
}

// iCalendar-Export: eine ganztägige VEVENT je Session. `beschriftung(einheitId)` liefert
// { titel, schwerpunkt }; `jetztStempel` (YYYYMMDDTHHMMSSZ) kommt herein (kein Date.now()).
export function planAlsIcal(plan, beschriftung, jetztStempel) {
  const zeilen = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Crossminton-Handbuch//Trainingsplan//DE',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];
  plan.sessions.forEach((s, i) => {
    const b = beschriftung(s.einheit) || {};
    const tag = s.datum.replace(/-/g, '');
    const ende = plusTage(s.datum, 1).replace(/-/g, '');
    zeilen.push(
      'BEGIN:VEVENT',
      `UID:cmh-${tag}-${i}@crossminton-handbuch`,
      `DTSTAMP:${jetztStempel}`,
      `DTSTART;VALUE=DATE:${tag}`,
      `DTEND;VALUE=DATE:${ende}`,
      `SUMMARY:${icalEscape('Crossminton – ' + (b.titel || s.einheit))}`,
      `DESCRIPTION:${icalEscape(b.schwerpunkt || '')}`,
      'END:VEVENT',
    );
  });
  zeilen.push('END:VCALENDAR');
  return zeilen.join('\r\n');
}
