// Prüft Prototyp-SVGs gegen die Repo-Regeln für Grafiken:
// Test [22] (nur Klassenselektoren, keine At-Regeln, keine Kommentare im <style>),
// Farben nur als var(--token, #fallback), viewBox vorhanden, role="img" + aria-label,
// Caption (.st) ≤ 46 Zeichen, kein style=-Attribut, keine externen Verweise.
// node pruefe.mjs <datei.svg> […]
import { readFileSync } from 'node:fs';
let fehler = 0;
const ERLAUBT = new Set(['--tinte', '--tinte-2', '--tinte-3', '--primaer', '--primaer-dunkel', '--primaer-tief', '--primaer-weich', '--schatten-boden', '--flaeche', '--flaeche-2', '--linie', '--speeder-korb', '--speeder-kappe', '--speeder-kappe-tief']);
for (const d of process.argv.slice(2)) {
  const q = readFileSync(d, 'utf8'); const p = [];
  if (!/viewBox="[^"]+"/.test(q)) p.push('keine viewBox');
  if (!/role="img"/.test(q) || !/aria-label="[^"]{10,}"/.test(q)) p.push('role/aria-label fehlt');
  if (/\sstyle="/.test(q)) p.push('style=-Attribut');
  if (/(href|src)="(?!#)/.test(q)) p.push('externer Verweis');
  for (const block of q.match(/<style[^>]*>[\s\S]*?<\/style>/g) ?? []) {
    if (/@[a-z-]+/i.test(block)) p.push('At-Regel im <style>');
    if (block.includes('/*')) p.push('Kommentar im <style>');
    for (const regel of block.replace(/<\/?style[^>]*>/g, '').matchAll(/([^{}]+)\{[^{}]*\}/g)) {
      for (const sel of regel[1].split(',')) { const roh = sel.trim(); if (roh && (!/^[.\w\s.-]*$/.test(roh) || !roh.startsWith('.'))) p.push(`Selektor "${roh}"`); }
    }
  }
  const ohneVar = q.replace(/var\(--[a-z0-9-]+,\s*#[0-9a-fA-F]{3,8}\)/g, '');
  const hart = ohneVar.match(/#[0-9a-fA-F]{3,8}\b/g)?.filter((h) => !/^#(ah|mp|m)\w*$/.test(h)) ?? [];
  const echteHex = hart.filter((h) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(h));
  if (echteHex.length) p.push(`harte Farbe(n) ${[...new Set(echteHex)].join(' ')}`);
  if (/\b(rgb|hsl)a?\(/.test(ohneVar)) p.push('rgb()/hsl() hart');
  for (const m of q.matchAll(/var\((--[a-z0-9-]+)/g)) if (!ERLAUBT.has(m[1])) p.push(`unbekanntes Token ${m[1]}`);
  for (const m of q.matchAll(/<text[^>]*class="st"[^>]*>([^<]*)<\/text>/g)) if (m[1].length > 46) p.push(`Caption ${m[1].length} Zeichen`);
  if (p.length) { fehler++; console.log(`✗ ${d}\n  - ${[...new Set(p)].join('\n  - ')}`); } else console.log(`✓ ${d}`);
}
process.exit(fehler ? 1 : 0);
