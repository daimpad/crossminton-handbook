// Wiederverwendbarer, byte-treuer fr→pl-Inserter für die pl-Inhaltsringe.
// insertPl(pfad, PL) findet jeden `"fr":`-Wert (String ODER Objekt) in
// Dokumentreihenfolge und schiebt `"pl": <wert>` dahinter ein:
//   • mehrzeiliger Knoten ("fr" erstes Nicht-WS der Zeile) → ,\n<indent>"pl": …  (indent-treu)
//   • inline-Knoten ({"de":…,"fr":…} in einer Zeile)        → , "pl": …          (inline)
// de/en/fr bleiben unangetastet (nur je ein Trailing-Komma auf den fr-Zeilen).
// PL ist eine Liste in Dokumentreihenfolge; Einträge String (für String-fr)
// oder Objekt (für Objekt-fr, muss die de-Form spiegeln).
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

export function stringEnde(text, i) {
  i++;
  while (i < text.length) {
    if (text[i] === '\\') { i += 2; continue; }
    if (text[i] === '"') return i;
    i++;
  }
  throw new Error('String nicht geschlossen ab ' + i);
}
export function objektEnde(text, i) {
  let tiefe = 0, inStr = false;
  for (; i < text.length; i++) {
    const c = text[i];
    if (inStr) { if (c === '\\') { i++; continue; } if (c === '"') inStr = false; continue; }
    if (c === '"') inStr = true;
    else if (c === '{') tiefe++;
    else if (c === '}') { tiefe--; if (tiefe === 0) return i; }
  }
  throw new Error('Objekt nicht geschlossen ab ' + i);
}

function gleicheForm(a, b) {
  if (typeof a === 'string') return typeof b === 'string';
  if (Array.isArray(a)) return Array.isArray(b) && a.length === b.length && a.every((x, i) => gleicheForm(x, b[i]));
  if (a && typeof a === 'object') {
    if (!b || typeof b !== 'object' || Array.isArray(b)) return false;
    const ka = Object.keys(a), kb = new Set(Object.keys(b));
    return ka.length === Object.keys(b).length && ka.every((k) => kb.has(k) && gleicheForm(a[k], b[k]));
  }
  return true;
}

// Alle de/en/(fr)-Textknoten eines Baums in Dokumentreihenfolge sammeln.
export function textKnoten(o, acc = []) {
  if (Array.isArray(o)) { o.forEach((v) => textKnoten(v, acc)); return acc; }
  if (o && typeof o === 'object') {
    const istKnoten = 'de' in o && 'en' in o;
    if (istKnoten) acc.push(o);
    for (const [k, v] of Object.entries(o)) {
      if (istKnoten && ['de', 'en', 'fr', 'pl'].includes(k)) continue;
      textKnoten(v, acc);
    }
  }
  return acc;
}

export function insertPl(pfad, PL, opts = {}) {
  let s = readFileSync(pfad, 'utf8');
  const re = /"fr"\s*:\s*/g;
  const treffer = [];
  let m;
  while ((m = re.exec(s)) !== null) {
    const j = re.lastIndex;
    const lineStart = s.lastIndexOf('\n', m.index) + 1;
    const prefix = s.slice(lineStart, m.index);
    const inline = prefix.trim().length > 0; // etwas vor "fr" auf der Zeile → inline-Knoten
    let ende, typ;
    if (s[j] === '"') { ende = stringEnde(s, j); typ = 'str'; }
    else if (s[j] === '{') { ende = objektEnde(s, j); typ = 'obj'; }
    else throw new Error(`Unerwarteter fr-Wert bei ${j}: ${s.slice(j, j + 20)}`);
    treffer.push({ einf: ende + 1, baseIndent: prefix, inline, typ });
  }
  if (treffer.length !== PL.length) {
    throw new Error(`${pfad}: fr-Knoten (${treffer.length}) ≠ PL (${PL.length})`);
  }
  for (let k = 0; k < treffer.length; k++) {
    const plTyp = typeof PL[k] === 'string' ? 'str' : 'obj';
    if (treffer[k].typ !== plTyp) throw new Error(`${pfad}: Typkonflikt #${k}: fr=${treffer[k].typ} pl=${plTyp}`);
    if (treffer[k].inline && plTyp === 'obj') throw new Error(`${pfad}: inline-Objekt #${k} nicht unterstützt`);
  }
  const serial = (wert, baseIndent) => {
    if (typeof wert === 'string') return JSON.stringify(wert);
    const body = JSON.stringify(wert, null, 2);
    return body.split('\n').map((ln, i) => (i === 0 ? ln : baseIndent + ln)).join('\n');
  };
  for (let k = treffer.length - 1; k >= 0; k--) {
    const t = treffer[k];
    const ins = t.inline
      ? ', "pl": ' + JSON.stringify(PL[k])
      : ',\n' + t.baseIndent + '"pl": ' + serial(PL[k], t.baseIndent);
    s = s.slice(0, t.einf) + ins + s.slice(t.einf);
  }
  // Verifikation
  const neu = JSON.parse(s);
  const knoten = textKnoten(neu);
  let fehl = 0;
  for (const kn of knoten) if (!('pl' in kn) || !gleicheForm(kn.de, kn.pl)) fehl++;
  if (fehl) throw new Error(`${pfad}: ${fehl} pl-Knoten fehlend/formabweichend`);
  // de/en/fr byte-identisch (Werte) gegen HEAD
  const alt = JSON.parse(execSync(`git show HEAD:${pfad}`, { encoding: 'utf8' }));
  const av = textKnoten(alt), bv = knoten;
  for (const lang of ['de', 'en', 'fr']) {
    const a = av.map((n) => JSON.stringify(n[lang], Object.keys(n[lang] || {}).sort?.() || null));
    const b = bv.map((n) => JSON.stringify(n[lang], Object.keys(n[lang] || {}).sort?.() || null));
    if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${pfad}: ${lang} nicht byte-identisch`);
  }
  writeFileSync(pfad, s, 'utf8');
  return { knoten: knoten.length };
}
