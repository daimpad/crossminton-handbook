// Dedizierter fr-Einfüger für data/fehlerbilder.json:
// erklaerteil ist ein OBJEKT {symptom, ursache, korrektur} (kein String),
// und die Entität liegt unter fehlerbild_bausteine (nicht bausteine).
// Darum eigenes Skript statt fr-insert.mjs. de/en bleiben byte-identisch.
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const pfad = 'data/fehlerbilder.json';

const FR = {
  griff_fehler_zu_fest: {
    symptom: "L'avant-bras fatigue tôt, les frappes deviennent dures et imprécises, le poignet reste rigide. Souvent visible à des jointures blanches et à une prise qui ne se relâche pas de tout l'échange.",
    ursache: "La main se crispe en permanence, au lieu de ne serrer qu'au moment de la frappe. Le plus souvent par tension ou par désir de plus de contrôle — mais la prise ferme enlève justement le sens qu'elle recherche.",
    korrektur: "Saisir souplement comme pour une poignée de main ; cela ne devient ferme qu'au moment de la frappe, puis se relâche à nouveau. Consigne : « Tiens la prise de sorte que je puisse encore te tourner facilement la raquette hors de la main — ne serre qu'à la frappe, puis relâche aussitôt. »"
  }
};

const daten = JSON.parse(readFileSync(pfad, 'utf8'));
const byId = {};
for (const b of daten.fehlerbild_bausteine || []) byId[b.id] = b;

let s = readFileSync(pfad, 'utf8');
let n = 0;
const renderObj = (o) => JSON.stringify(o, null, 2).split('\n').map((l, i) => (i === 0 ? l : '        ' + l)).join('\n');

for (const [id, frObj] of Object.entries(FR)) {
  const b = byId[id];
  if (!b) { console.error('unbekannte id', id); process.exit(1); }
  const enObj = b.erklaerteil.en;
  const keys = Object.keys(enObj);
  const lk = keys[keys.length - 1]; // 'korrektur'
  const anchor = `          ${JSON.stringify(lk)}: ${JSON.stringify(enObj[lk])}\n        }`;
  const c = s.split(anchor).length - 1;
  if (c !== 1) { console.error(`FEHLER (${c}×): ${id}.erklaerteil-Anker`); process.exit(1); }
  s = s.replace(anchor, `${anchor},\n        "fr": ${renderObj(frObj)}`);
  n++;
}

JSON.parse(s);
writeFileSync(pfad, s);

// de/en-Byte-Identität + fr-Formtreue prüfen
const neu = JSON.parse(readFileSync(pfad, 'utf8'));
const alt = JSON.parse(execSync(`git show HEAD:${pfad}`).toString());
let de = 0, en = 0, fr = 0; const diffs = [];
const walk = (a, o, p) => {
  if (a && typeof a === 'object' && !Array.isArray(a)) {
    if ('de' in a) { de++; if (JSON.stringify(a.de) !== JSON.stringify(o?.de)) diffs.push('de≠' + p); }
    if ('en' in a) { en++; if (JSON.stringify(a.en) !== JSON.stringify(o?.en)) diffs.push('en≠' + p); }
    if ('fr' in a) {
      fr++;
      if (typeof a.fr !== typeof a.de) diffs.push('frForm≠' + p);
      else if (a.de && typeof a.de === 'object' && JSON.stringify(Object.keys(a.de)) !== JSON.stringify(Object.keys(a.fr))) diffs.push('frKeys≠' + p);
    }
    for (const k of Object.keys(a)) walk(a[k], o?.[k], p + '.' + k);
  } else if (Array.isArray(a)) a.forEach((x, i) => walk(x, o?.[i], p + '[' + i + ']'));
};
walk(neu, alt, '');
const deEn = diffs.filter((d) => d.startsWith('de') || d.startsWith('en'));
console.log(`${pfad}: Einfügungen ${n} | de:${de} en:${en} fr:${fr} | de/en≠HEAD: ${deEn.length ? deEn.join(';') : 'KEINE'} | fr-Form: ${diffs.filter((d) => d.startsWith('fr')).length ? diffs.filter((d) => d.startsWith('fr')).join(';') : 'OK'}`);
if (deEn.length || fr !== de) { console.error('ABBRUCH: Integritätsfehler'); process.exit(1); }
