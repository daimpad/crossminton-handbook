// Wiederverwendbarer, format-treuer fr-Zwilling-Einfüger für Referenz-Inhaltsdateien.
// FR-Map je Baustein-id: { t?: anzeigetitel-fr (String), e?: erklaerteil-fr (String),
//   r?: reflexionsaufgabe-fr (String), u?: uebungsteil-fr (Objekt, de-formgleich) }.
// anzeigetitel = inline (…, "fr": "…"); erklaerteil/reflexionsaufgabe = String nach
// en (8-Leerzeichen, neue Zeile); uebungsteil = Objekt nach en-Objekt-Schließung.
// de/en bleiben byte-identisch; jede Ersetzung muss genau einmal matchen.
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

export function insertFr(pfad, FR) {
  const daten = JSON.parse(readFileSync(pfad, 'utf8'));
  const byId = {};
  for (const b of [...(daten.bausteine || []), ...(daten.delta_bausteine || [])]) byId[b.id] = b;
  let s = readFileSync(pfad, 'utf8');
  let n = 0;
  const ers = (needle, repl, wo) => {
    const c = s.split(needle).length - 1;
    if (c !== 1) { console.error(`FEHLER (${c}×): ${wo}`); process.exit(1); }
    s = s.replace(needle, repl);
    n++;
  };
  const renderObj = (o) => JSON.stringify(o, null, 2).split('\n').map((l, i) => (i === 0 ? l : '        ' + l)).join('\n');

  for (const [id, t] of Object.entries(FR)) {
    const b = byId[id];
    if (!b) { console.error('unbekannte id', id); process.exit(1); }
    if (t.t != null) { // anzeigetitel (inline)
      const en = b.anzeigetitel.en;
      ers(`"en": ${JSON.stringify(en)}`, `"en": ${JSON.stringify(en)}, "fr": ${JSON.stringify(t.t)}`, `${id}.anzeigetitel`);
    }
    if (t.e != null) { // erklaerteil (String, mehrzeiliges Objekt)
      const en = b.erklaerteil.en;
      ers(`"en": ${JSON.stringify(en)}`, `"en": ${JSON.stringify(en)},\n        "fr": ${JSON.stringify(t.e)}`, `${id}.erklaerteil`);
    }
    if (t.r != null) { // reflexionsaufgabe (String)
      const en = b.reflexionsaufgabe.en;
      ers(`"en": ${JSON.stringify(en)}`, `"en": ${JSON.stringify(en)},\n        "fr": ${JSON.stringify(t.r)}`, `${id}.reflexionsaufgabe`);
    }
    if (t.u != null) { // uebungsteil (Objekt) — Anker: letztes (String-)Feld + en-Schließung
      const enU = b.uebungsteil.en;
      const keys = Object.keys(enU);
      const lk = keys[keys.length - 1];
      const anchor = `          ${JSON.stringify(lk)}: ${JSON.stringify(enU[lk])}\n        }`;
      ers(anchor, `${anchor},\n        "fr": ${renderObj(t.u)}`, `${id}.uebungsteil`);
    }
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
}
