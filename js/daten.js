// Datenschicht: lädt die statischen Inhaltsdateien, baut Indizes und prüft die
// Daten leicht auf Konsistenz (Warnungen, keine Abbrüche — hilft beim Inhaltsausbau).
// Die Inhaltsdatei bleibt unangetastet; alles Abgeleitete lebt hier.

import { topoSortiere } from './graph.js';

async function holeJson(pfad) {
  const antwort = await fetch(pfad);
  if (!antwort.ok) throw new Error(`${pfad}: HTTP ${antwort.status}`);
  return antwort.json();
}

export async function ladeDaten() {
  const [inhalt, einheiten] = await Promise.all([
    holeJson('data/bausteine.beginner-technik.json'),
    holeJson('data/trainingseinheiten.json'),
  ]);
  return baueIndizes(inhalt, einheiten);
}

export function hatUebungsteil(baustein) {
  return baustein.uebungsteil != null;
}

export function domaenenVon(baustein) {
  return Array.isArray(baustein.domaene) ? baustein.domaene : [baustein.domaene];
}

// Ein mehrfach zugeordneter Baustein gehört in den Kompetenzpfad seiner
// niedrigsten Könnensstufe; rein trainer-getaggte in die Trainer-Sicht (Spez. 6.1).
export function niedrigsteStufe(daten, baustein) {
  const stufen = baustein.kompetenzstufe || [];
  for (const stufe of daten.koennensOrdnung) {
    if (stufen.includes(stufe)) return stufe;
  }
  return stufen.includes('trainer') ? 'trainer' : null;
}

export function deltaFuer(daten, basisId, herkunft) {
  if (!herkunft) return null;
  return daten.deltaVonSchluessel.get(`${basisId}::${herkunft}`) || null;
}

export function baueIndizes(inhaltRoh, einheitenRoh) {
  const warnungen = [];
  const vokabulare = inhaltRoh.vokabulare || {};
  const bausteine = inhaltRoh.bausteine || [];
  const deltas = inhaltRoh.delta_bausteine || [];
  const einheiten = einheitenRoh?.einheiten || [];

  const daten = {
    meta: inhaltRoh._meta || {},
    einheitenMeta: einheitenRoh?._meta || {},
    vokabulare,
    bausteine,
    deltas,
    einheiten,
    bausteinVonId: new Map(bausteine.map((b) => [b.id, b])),
    einheitVonId: new Map(einheiten.map((e) => [e.id, e])),
    deltaVonSchluessel: new Map(),
    poolIndex: new Map(bausteine.map((b, i) => [b.id, i])),
    koennensOrdnung: (vokabulare.kompetenzstufe || []).filter((s) => s !== 'trainer'),
    herkuenfte: [],
    spielzielBereichVonFaktor: new Map(),
    vermittlungszielBereichVonFaktor: new Map(),
    warnungen,
  };

  for (const [bereich, faktoren] of Object.entries(vokabulare.spielziele || {})) {
    if (bereich.startsWith('_')) continue;
    for (const f of faktoren) daten.spielzielBereichVonFaktor.set(f, bereich);
  }
  for (const [bereich, faktoren] of Object.entries(vokabulare.vermittlungsziele || {})) {
    if (bereich.startsWith('_')) continue;
    for (const f of faktoren) daten.vermittlungszielBereichVonFaktor.set(f, bereich);
  }

  // Ersetzungsrelation indizieren; Herkunftsliste für das Onboarding aus dem
  // Delta-Bestand ableiten (Spez. 7.3 — bleibt automatisch synchron zum Ausbaustand).
  for (const delta of deltas) {
    const schluessel = `${delta.basis_baustein}::${delta.ersetzt_bei_herkunft}`;
    if (daten.deltaVonSchluessel.has(schluessel)) {
      warnungen.push(`Delta ${delta.id}: doppelte Ersetzung für ${schluessel}`);
    }
    daten.deltaVonSchluessel.set(schluessel, delta);
    if (delta.ersetzt_bei_herkunft && !daten.herkuenfte.includes(delta.ersetzt_bei_herkunft)) {
      daten.herkuenfte.push(delta.ersetzt_bei_herkunft);
    }
  }

  pruefeDaten(daten);
  return daten;
}

function pruefeDaten(daten) {
  const w = daten.warnungen;
  const voka = daten.vokabulare;
  const deltaIds = new Set(daten.deltas.map((d) => d.id));
  const inVokabular = (liste, wert) => !Array.isArray(liste) || liste.includes(wert);

  for (const b of daten.bausteine) {
    for (const d of domaenenVon(b)) {
      if (!inVokabular(voka.domaene, d)) w.push(`${b.id}: unbekannte Domäne "${d}"`);
    }
    if (!b.kompetenzstufe?.length) w.push(`${b.id}: keine Kompetenzstufe`);
    for (const s of b.kompetenzstufe || []) {
      if (!inVokabular(voka.kompetenzstufe, s)) w.push(`${b.id}: unbekannte Stufe "${s}"`);
    }
    if (!inVokabular(voka.baustein_typ, b.typ)) w.push(`${b.id}: unbekannter Typ "${b.typ}"`);
    for (const v of b.voraussetzungen || []) {
      if (!daten.bausteinVonId.has(v)) w.push(`${b.id}: Voraussetzung "${v}" existiert nicht`);
    }
    for (const z of b.spielziele || []) {
      if (!daten.spielzielBereichVonFaktor.has(z)) w.push(`${b.id}: unbekanntes Spielziel "${z}"`);
    }
    for (const z of b.vermittlungsziele || []) {
      if (!daten.vermittlungszielBereichVonFaktor.has(z)) w.push(`${b.id}: unbekanntes Vermittlungsziel "${z}"`);
    }
    const kuerzel = b.transfer_herkunft || [];
    if (new Set(kuerzel).size !== kuerzel.length) w.push(`${b.id}: Transfer-Kürzel doppelt`);
    for (const k of kuerzel) {
      if (!inVokabular(voka.transfer_herkunft, k)) w.push(`${b.id}: unbekanntes Transfer-Kürzel "${k}"`);
    }
    if (b.untergrund && !inVokabular(voka.untergrund, b.untergrund)) w.push(`${b.id}: unbekannter Untergrund "${b.untergrund}"`);
    for (const wetter of b.witterung || []) {
      if (!inVokabular(voka.witterung, wetter)) w.push(`${b.id}: unbekannte Witterung "${wetter}"`);
    }
    if (b.typ === 'micro' && b.domaene === 'technik' && !hatUebungsteil(b)) {
      w.push(`${b.id}: Technik-Baustein ohne Übungsteil`);
    }
  }

  for (const d of daten.deltas) {
    if (!daten.bausteinVonId.has(d.basis_baustein)) w.push(`${d.id}: Basisbaustein "${d.basis_baustein}" existiert nicht`);
    if (!inVokabular(voka.transfer_herkunft, d.ersetzt_bei_herkunft)) w.push(`${d.id}: unbekannte Herkunft "${d.ersetzt_bei_herkunft}"`);
    if (d.eigener_uebungsteil) w.push(`${d.id}: Delta mit eigenem Übungsteil verletzt die Delta-Übungsregel (Spez. 5)`);
    for (const verweis of d.delta_buendelung || []) {
      if (!deltaIds.has(verweis)) w.push(`${d.id}: Bündelungs-Verweis "${verweis}" existiert nicht`);
    }
  }

  for (const e of daten.einheiten) {
    for (const id of e.uebungsteile || []) {
      const b = daten.bausteinVonId.get(id);
      if (!b) w.push(`${e.id}: referenzierter Baustein "${id}" existiert nicht`);
      else if (!hatUebungsteil(b)) w.push(`${e.id}: Baustein "${id}" hat keinen Übungsteil`);
    }
  }

  const { zyklisch } = topoSortiere(daten.bausteine, (a, b) => daten.poolIndex.get(a.id) - daten.poolIndex.get(b.id));
  if (zyklisch.length > 0) w.push(`Voraussetzungszyklus: ${zyklisch.join(', ')}`);
}
