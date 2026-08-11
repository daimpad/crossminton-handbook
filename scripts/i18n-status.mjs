// Abdeckungs-Dashboard für die Übersetzung — dependency-frei:
//   node scripts/i18n-status.mjs
//
// Meldet je Zielsprache (en/fr/pl) zwei Flächen getrennt:
//   1. UI-Labels   → data/labels/<sprache>.json (gefüllte vs. leere Blatt-Werte)
//   2. Inhaltstexte → "<sprache>":-Zwilling neben jedem "de":-Knoten in data/*.json
// und listet pro Fläche die größten Lücken (Dateien mit den meisten offenen Knoten).
//
// Steuert das Ring-für-Ring-Vorgehen: was ist schon englisch, was fehlt noch wo.

import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const wurzel = join(dirname(fileURLToPath(import.meta.url)), '..');
const lies = (p) => JSON.parse(readFileSync(join(wurzel, p), 'utf8'));
const ZIELE = ['en', 'fr', 'pl'];
const prozent = (a, b) => (b === 0 ? '100.0' : ((a / b) * 100).toFixed(1));
const balken = (a, b) => {
  const n = b === 0 ? 20 : Math.round((a / b) * 20);
  return '█'.repeat(n) + '░'.repeat(20 - n);
};

// --- 1. Labels: alle Blatt-Werte (String) sammeln, _meta ausgenommen ---
function blaetter(obj, praefix = '', acc = []) {
  for (const [k, v] of Object.entries(obj)) {
    if (praefix === '' && k === '_meta') continue;
    const pfad = praefix ? `${praefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) blaetter(v, pfad, acc);
    else acc.push([pfad, v]);
  }
  return acc;
}

const deLabels = blaetter(lies('data/labels/de.json'));
const labelGesamt = deLabels.length;

// --- 2. Inhalt: jeden Knoten mit "de"-Schlüssel über alle data/*.json einsammeln ---
function knotenSammeln(obj, datei, acc) {
  if (Array.isArray(obj)) {
    for (const x of obj) knotenSammeln(x, datei, acc);
  } else if (obj && typeof obj === 'object') {
    if (Object.prototype.hasOwnProperty.call(obj, 'de')) acc.push({ datei, obj });
    for (const v of Object.values(obj)) knotenSammeln(v, datei, acc);
  }
}
const inhaltsknoten = [];
for (const datei of readdirSync(join(wurzel, 'data')).filter((f) => f.endsWith('.json'))) {
  knotenSammeln(lies(join('data', datei)), datei, inhaltsknoten);
}
const inhaltGesamt = inhaltsknoten.length;
const gefuellt = (wert) => typeof wert === 'string' ? wert.trim() !== '' : wert != null;

console.log('\n  Crossminton-Handbuch — Übersetzungsabdeckung\n');
console.log(`  Quelle (de):  ${labelGesamt} UI-Labels · ${inhaltGesamt} Inhaltsknoten\n`);

for (const s of ZIELE) {
  let ziel;
  try { ziel = blaetter(lies(`data/labels/${s}.json`)); }
  catch { console.log(`  ${s.toUpperCase()}: labels/${s}.json nicht ladbar\n`); continue; }
  const zielMap = new Map(ziel);
  const labelsOk = deLabels.filter(([pfad]) => gefuellt(zielMap.get(pfad))).length;

  const inhaltOk = inhaltsknoten.filter(({ obj }) => gefuellt(obj[s])).length;
  const proDatei = new Map();
  for (const { datei, obj } of inhaltsknoten) {
    if (gefuellt(obj[s])) continue;
    proDatei.set(datei, (proDatei.get(datei) || 0) + 1);
  }

  console.log(`  ${s.toUpperCase()}`);
  console.log(`    Labels   ${balken(labelsOk, labelGesamt)} ${prozent(labelsOk, labelGesamt).padStart(5)}%  (${labelsOk}/${labelGesamt})`);
  console.log(`    Inhalt   ${balken(inhaltOk, inhaltGesamt)} ${prozent(inhaltOk, inhaltGesamt).padStart(5)}%  (${inhaltOk}/${inhaltGesamt})`);
  const luecken = [...proDatei.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  if (luecken.length) {
    console.log('    offene Inhaltsknoten (Top):');
    for (const [datei, n] of luecken) console.log(`      ${String(n).padStart(4)}  ${datei}`);
  }
  console.log('');
}
