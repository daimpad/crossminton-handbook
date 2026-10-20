// grafik-gate.mjs — statisches Prüf-Gate der generierten Personengrafiken (docs/grafik-strategie.md).
// Abhängigkeitsfrei, ohne Browser; läuft in tests/engine.test.mjs Abschnitt [26] und einzeln:
//   node scripts/grafik-gate.mjs
// Geprüft wird jede Grafik, deren deutsche Datei data-quelle="figuren" trägt — also alles, was
// scratchpad/figuren/motive.mjs erzeugt. Die übrigen Grafiken folgen älteren Regeln (Test [22]).
// Was nur im Browser messbar ist (Caption-Breite, Kontrast), prüft scratchpad/figuren/gate.mjs.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), '..');
export const SPRACHEN = ['de', 'en', 'fr', 'pl'];
// Tokens, die eine Personengrafik lesen darf. Jeder Fallback muss dem Hellwert in css/app.css
// gleichen: mit ihm entsteht das PNG, und ein abweichender Fallback ergäbe ein anderes Bild.
export const TOKENS = ['--tinte', '--tinte-2', '--tinte-3', '--flaeche', '--flaeche-2', '--primaer', '--primaer-dunkel',
  '--primaer-tief', '--primaer-weich', '--speeder-korb', '--speeder-kappe', '--speeder-kappe-tief', '--schatten-boden'];
export const GROESSE_HINWEIS = 16 * 1024;
export const PNG_STAND = 'scratchpad/figuren/png-stand.json';
// Schrift beim Messen (scratchpad/figuren/gate.mjs) und beim PNG-Rendern: Liberation Sans ist
// Arial-metrisch und steht für system-ui auf den Geräten. Der Container löst system-ui auf
// DejaVu Sans auf, die gut 10 % breiter läuft — gemessen und gerendert damit liefen Captions
// über den Rand, die auf jedem Gerät passen.
export const STELLVERTRETER = "svg text{font-family:'Liberation Sans',Arial,sans-serif !important}";

const dateiName = (id, s) => `${id}${s === 'de' ? '' : '.' + s}`;
export const hash = (text) => createHash('sha256').update(text).digest('hex').slice(0, 16);

// Hellwerte aus dem ersten :root-Block von css/app.css
export function hellWerte(css) {
  const block = css.slice(css.indexOf(':root {'), css.indexOf('\n}', css.indexOf(':root {')));
  return Object.fromEntries([...block.matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)].map(([, k, v]) => [k, v.trim().toLowerCase()]));
}

// Breite × Höhe aus dem IHDR-Kopf einer PNG-Datei
export function pngGroesse(buf) {
  if (buf.length < 24 || buf.toString('ascii', 12, 16) !== 'IHDR') return null;
  return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
}

// Alles außer den übersetzten Stellen: aria-label und Textinhalte
const geruest = (svg) => svg.replace(/aria-label="[^"]*"/, 'aria-label=""').replace(/(<text\b[^>]*>)[^<]*(<\/text>)/g, '$1$2');
const texte = (svg) => [...svg.matchAll(/<text\b[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]);

// Regeln für eine einzelne Datei; gibt eine Liste von Befunden zurück
export function pruefeDatei(svg, hell) {
  const b = [];
  if (!/^<svg [^>]*viewBox="0 0 \d+ \d+"/.test(svg)) b.push('keine viewBox am Wurzelelement');
  if (!/<svg [^>]*role="img"/.test(svg)) b.push('role="img" fehlt');
  const aria = svg.match(/<svg [^>]*aria-label="([^"]*)"/)?.[1] ?? '';
  if (aria.length < 20) b.push('aria-label fehlt oder ist zu kurz');
  if (/\sstyle="/.test(svg)) b.push('style=-Attribut');
  if (/<use\b/.test(svg)) b.push('<use> (vereinzele() zieht nur url(#…) mit)');
  if (/<script\b|\son[a-z]+="/i.test(svg)) b.push('Skript oder Ereignis-Attribut');
  if (/(?:href|src)="(?!#)/.test(svg)) b.push('externer Verweis');
  // Escaping: im Text und im aria-label nur Entitäten, kein rohes & oder <
  for (const t of [aria, ...texte(svg)]) if (/&(?!(?:amp|lt|gt|quot|#\d+);)/.test(t)) b.push(`unescaptes & in „${t.slice(0, 30)}“`);
  const stile = svg.match(/<style>([\s\S]*?)<\/style>/g) ?? [];
  if (stile.length !== 1) b.push(`${stile.length} <style>-Blöcke statt einem`);
  const definiert = new Set();
  for (const block of stile) {
    const inhalt = block.replace(/<\/?style>/g, '');
    if (/@[a-z-]+/i.test(inhalt)) b.push('At-Regel im <style>');
    if (inhalt.includes('/*')) b.push('Kommentar im <style>');
    if (inhalt.includes('url(')) b.push('url() im <style>');
    for (const [, sel, dekl] of inhalt.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const s = sel.trim();
      if (!/^\.(s-[a-z0-9-]+|st)$/.test(s)) b.push(`Selektor „${s}“ (nur .s-… oder .st)`);
      else definiert.add(s.slice(1));
      if (/\b(rgb|hsl)a?\(/.test(dekl)) b.push(`${s}: rgb()/hsl() statt Token`);
      if (/#[0-9a-f]{3,8}\b/i.test(dekl.replace(/var\(--[a-z0-9-]+,\s*#[0-9a-f]{3,8}\)/gi, ''))) b.push(`${s}: harte Farbe ohne Token`);
      for (const [, tok, fb] of dekl.matchAll(/var\((--[a-z0-9-]+)(?:,\s*([^)]*))?\)/g)) {
        if (!TOKENS.includes(tok)) b.push(`${s}: Token ${tok} nicht zugelassen`);
        else if (!fb) b.push(`${s}: ${tok} ohne Fallback`);
        else if (hell[tok] && fb.trim().toLowerCase() !== hell[tok]) b.push(`${s}: Fallback ${tok} ${fb} ≠ Hellwert ${hell[tok]}`);
      }
    }
  }
  const benutzt = new Set([...svg.matchAll(/class="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/)));
  for (const k of benutzt) if (!definiert.has(k)) b.push(`Klasse .${k} benutzt, aber nicht definiert`);
  for (const k of definiert) if (!benutzt.has(k)) b.push(`Klasse .${k} definiert, aber nicht benutzt`);
  // url(#…) muss auf eine ID derselben Datei zeigen
  const ids = new Set([...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const [, ziel] of svg.matchAll(/url\(#([^)]+)\)/g)) if (!ids.has(ziel)) b.push(`url(#${ziel}) zeigt ins Leere`);
  return b;
}

// Gesamtprüfung über alle generierten Grafiken. erzeuge(id, sprache) liefert optional den
// Generatorstand, gegen den die Dateien verglichen werden (Handänderungen fallen so auf).
export async function pruefeGrafiken({ wurzel = WURZEL, erzeuge = null } = {}) {
  const fehler = [], warnungen = [];
  const bild = (n) => join(wurzel, 'images', n);
  const hell = hellWerte(readFileSync(join(wurzel, 'css/app.css'), 'utf8'));
  for (const t of TOKENS) if (!hell[t]) fehler.push(`Token ${t} fehlt im :root von css/app.css`);
  const stand = existsSync(join(wurzel, PNG_STAND)) ? JSON.parse(readFileSync(join(wurzel, PNG_STAND), 'utf8')) : {};
  const ids = readdirSync(join(wurzel, 'images'))
    .filter((n) => /^G-\d{3}\.svg$/.test(n) && readFileSync(bild(n), 'utf8').includes('data-quelle="figuren"'))
    .map((n) => n.slice(0, 5)).sort();
  for (const id of ids) {
    const de = readFileSync(bild(`${id}.svg`), 'utf8');
    for (const s of SPRACHEN) {
      const n = dateiName(id, s);
      if (!existsSync(bild(`${n}.svg`))) { fehler.push(`${n}.svg fehlt`); continue; }
      const svg = readFileSync(bild(`${n}.svg`), 'utf8');
      if (!svg.includes('data-quelle="figuren"')) fehler.push(`${n}.svg ist nicht generiert (Sprachen laufen auseinander)`);
      for (const x of pruefeDatei(svg, hell)) fehler.push(`${n}.svg: ${x}`);
      if (s !== 'de') {
        if (geruest(svg) !== geruest(de)) fehler.push(`${n}.svg weicht außerhalb von Text und aria-label vom Deutschen ab`);
        if (texte(svg).length !== texte(de).length) fehler.push(`${n}.svg: ${texte(svg).length} statt ${texte(de).length} Texte`);
        if (texte(svg).some((t, i) => t.length === 0 && texte(de)[i].length > 0)) fehler.push(`${n}.svg: leerer Text`);
      }
      if (statSync(bild(`${n}.svg`)).size > GROESSE_HINWEIS) warnungen.push(`${n}.svg: ${Math.round(statSync(bild(`${n}.svg`)).size / 1024)} KB`);
      if (erzeuge) {
        const soll = await erzeuge(id, s);
        if (soll !== svg) fehler.push(`${n}.svg entspricht nicht dem Generator (motive.mjs neu laufen lassen, nie von Hand ändern)`);
      }
      // PNG: vorhanden, doppelte viewBox-Größe, aus genau diesem SVG-Stand gerendert
      if (!existsSync(bild(`${n}.png`))) { fehler.push(`${n}.png fehlt`); continue; }
      const [, vb, vh] = svg.match(/viewBox="0 0 (\d+) (\d+)"/) ?? [];
      const g = pngGroesse(readFileSync(bild(`${n}.png`)));
      if (!g || g[0] !== 2 * vb || g[1] !== 2 * vh) fehler.push(`${n}.png ist ${g ? g.join('×') : 'kein PNG'} statt ${2 * vb}×${2 * vh}`);
      if (stand[`${n}.svg`] !== hash(svg)) fehler.push(`${n}.png ist älter als ${n}.svg (scratchpad/render-svg.mjs ${n})`);
    }
  }
  return { ids, fehler, warnungen };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { baue } = await import('../scratchpad/figuren/motive.mjs');
  const { ids, fehler, warnungen } = await pruefeGrafiken({ erzeuge: (id, s) => baue(id, s).datei });
  for (const w of warnungen) console.log(`  Hinweis: ${w}`);
  for (const f of fehler) console.log(`✗ ${f}`);
  console.log(`${ids.length} generierte Grafiken × ${SPRACHEN.length} Sprachen, ${fehler.length} Fehler`);
  process.exit(fehler.length ? 1 : 0);
}
