#!/usr/bin/env python3
"""
Validierungs-Suite fuer den Crossminton-Handbuch-Korpus.

Aufruf:  python3 validate.py [VERZEICHNIS]
         (Default: aktuelles Verzeichnis)

Prueft alle Inhaltsdateien und meldet Fehler (blockierend) und Warnungen.
Exit-Code 0 = alles gruen, 1 = mindestens ein Fehler.
"""
import json, glob, os, re, sys

ROOT = sys.argv[1] if len(sys.argv) > 1 else "."
def path(p): return os.path.join(ROOT, p)

errors, warnings = [], []
def err(f, i, msg):  errors.append((f, i, msg))
def warn(f, i, msg): warnings.append((f, i, msg))

# ---------------------------------------------------------------- laden
def load(p):
    try:
        return json.load(open(p, encoding="utf-8"))
    except json.JSONDecodeError as e:
        err(os.path.basename(p), "-", f"UNGUELTIGES JSON: {e}")
        return None

baustein_files = sorted(glob.glob(path("bausteine.*.json")))
if not baustein_files:
    print("Keine bausteine.*.json gefunden in", os.path.abspath(ROOT)); sys.exit(1)

# kanonisches Vokabular
vok_src = load(path("bausteine.beginner-technik.json"))
V = (vok_src or {}).get("vokabulare", {})
def flat(d):
    out = set()
    for k, val in d.items():
        if isinstance(val, list): out |= set(val)
    return out
ALLOW = {
    "domaene": set(V.get("domaene", [])),
    "kompetenzstufe": set(V.get("kompetenzstufe", [])),
    "typ": set(V.get("baustein_typ", [])),
    "herkunft": set(V.get("transfer_herkunft", [])) | {"SP", "AT"},  # koordinierte Ergaenzungen
    "untergrund": set(V.get("untergrund", [])),
    "witterung": set(V.get("witterung", [])),
    "spielform": {"einzel", "doppel"},
    "spielziele": flat(V.get("spielziele", {})),
    "vermittlungsziele": flat(V.get("vermittlungsziele", {})),
    # Trainings-Metadaten (Zuarbeit fuer den Trainingsplan, Spez. 13.4)
    "geeignete_phase": set(V.get("trainings_metadaten", {}).get("geeignete_phase", [])),
    "dauer_klasse": set(V.get("trainings_metadaten", {}).get("dauer_klasse", [])),
    "intensitaet": set(V.get("trainings_metadaten", {}).get("intensitaet", [])),
    "fokus": set(V.get("trainings_metadaten", {}).get("fokus", [])),
}

# ---------------------------------------------------------------- sammeln
pool = {}          # baustein_id -> (datei, dict)
has_uebung = set() # ids mit uebungsteil
deltas = []        # (datei, dict)
for f in baustein_files:
    d = load(f)
    if not d: continue
    fn = os.path.basename(f)
    for b in d.get("bausteine", []):
        bid = b.get("id", "?")
        if bid in pool: err(fn, bid, f"doppelte Baustein-ID (auch in {pool[bid][0]})")
        pool[bid] = (fn, b)
        if "uebungsteil" in b: has_uebung.add(bid)
    for dd in d.get("delta_bausteine", []):
        deltas.append((fn, dd))

def texts(b):
    """alle DE-Textfelder eines Bausteins/Deltas."""
    out = []
    for k in ("erklaerteil", "reflexionsaufgabe"):
        if isinstance(b.get(k), dict) and "de" in b[k]: out.append(b[k]["de"])
    u = b.get("uebungsteil", {}).get("de") if isinstance(b.get("uebungsteil"), dict) else None
    # Den Uebungsteil vollstaendig einsammeln (auch titel, steigerung, naechste_stufe
    # und schritte_teil1/_teil2 — beinarbeit_system lief an einer Feldliste vorbei).
    def alle(o):
        if isinstance(o, str): out.append(o)
        elif isinstance(o, dict):
            for v in o.values(): alle(v)
        elif isinstance(o, list):
            for v in o: alle(v)
    if isinstance(u, dict): alle(u)
    return out

# ---------------------------------------------------------------- checks
def check_baustein(fn, b):
    bid = b.get("id")
    if not bid: err(fn, "?", "Baustein ohne id"); return
    # Pflichtfelder
    for req in ("typ", "domaene", "kompetenzstufe", "erklaerteil"):
        if req not in b: err(fn, bid, f"Pflichtfeld fehlt: {req}")
    # Wertkonformitaet
    if b.get("domaene") not in ALLOW["domaene"]:
        err(fn, bid, f"unbekannte domaene: {b.get('domaene')}")
    if b.get("typ") not in ALLOW["typ"]:
        err(fn, bid, f"unbekannter typ: {b.get('typ')}")
    for s in b.get("kompetenzstufe", []):
        if s not in ALLOW["kompetenzstufe"]: err(fn, bid, f"unbekannte kompetenzstufe: {s}")
    for h in b.get("transfer_herkunft", []):
        if h not in ALLOW["herkunft"]: err(fn, bid, f"unbekannte transfer_herkunft: {h}")
    if "spielform" in b and b["spielform"] not in ALLOW["spielform"]:
        err(fn, bid, f"unbekannte spielform: {b['spielform']}")
    ug = b.get("untergrund")
    for u in ([ug] if isinstance(ug, str) else (ug or [])):
        if u not in ALLOW["untergrund"]: err(fn, bid, f"unbekannter untergrund: {u}")
    for w in b.get("witterung", []):
        if w not in ALLOW["witterung"]: err(fn, bid, f"unbekannte witterung: {w}")
    for z in b.get("spielziele", []):
        if z not in ALLOW["spielziele"]: err(fn, bid, f"unbekanntes spielziel: {z}")
    for z in b.get("vermittlungsziele", []):
        if z not in ALLOW["vermittlungsziele"]: err(fn, bid, f"unbekanntes vermittlungsziel: {z}")
    # Trainings-Metadaten: Werte gegen das Vokabular; jeder Uebungsteil muss sie tragen
    for ph in b.get("geeignete_phase", []):
        if ph not in ALLOW["geeignete_phase"]: err(fn, bid, f"unbekannte geeignete_phase: {ph}")
    if "dauer_klasse" in b and b["dauer_klasse"] not in ALLOW["dauer_klasse"]:
        err(fn, bid, f"unbekannte dauer_klasse: {b['dauer_klasse']}")
    if "intensitaet" in b and b["intensitaet"] not in ALLOW["intensitaet"]:
        err(fn, bid, f"unbekannte intensitaet: {b['intensitaet']}")
    for fk in b.get("fokus", []):
        if fk not in ALLOW["fokus"]: err(fn, bid, f"unbekannter fokus: {fk}")
    if "uebungsteil" in b and "geeignete_phase" not in b:
        warn(fn, bid, "Uebungsteil ohne Trainings-Metadaten (geeignete_phase/dauer_klasse/intensitaet/fokus)")
    # innere Struktur: genau eines von uebungsteil/reflexionsaufgabe
    inner = [k for k in ("uebungsteil", "reflexionsaufgabe") if k in b]
    if len(inner) != 1:
        err(fn, bid, f"innere Struktur: genau 1 von uebungsteil/reflexionsaufgabe erwartet, gefunden {inner}")
    # Voraussetzungen aufloesbar
    for v in b.get("voraussetzungen", []):
        if v not in pool: err(fn, bid, f"Voraussetzung zeigt ins Leere: {v}")

def check_delta(fn, dd):
    did = dd.get("id", "?")
    basis = dd.get("basis_baustein")
    if basis not in pool:
        err(fn, did, f"Delta-Basis existiert nicht: {basis}")
    else:
        stufen = pool[basis][1].get("kompetenzstufe", [])
        if "experte" in stufen:
            err(fn, did, f"Delta auf Experten-Baustein '{basis}' (Experten-Stufe ist herkunftsneutral, 11.5)")
    if dd.get("eigener_uebungsteil", False) is not False:
        warn(fn, did, "Delta sollte eigener_uebungsteil: false tragen")
    if dd.get("ersetzt_bei_herkunft") not in ALLOW["herkunft"]:
        err(fn, did, f"unbekannte ersetzt_bei_herkunft: {dd.get('ersetzt_bei_herkunft')}")

# Spez. 12.1. Die Muster sind bewusst weiter als der Wortlaut: frueher rutschten
# „Nicht …, sondern" (gross), „keinen …, sondern", „nie …, sondern" und die
# Formel „Ein Bild dazu …:" durch. „nicht nur …, sondern auch" ist additiv,
# keine Antithese, und bleibt erlaubt.
ANTITHESE = re.compile(r"\b(?:[Nn]icht(?!\s+nur\b)|[Kk]ein(?:e|en|em|er|es)?|[Nn]ie)\b[^.;:!?]{0,80}?,?\s+sondern\b")
BILD_FORMEL = re.compile(r"\bEin Bild\b[^.!?]{0,40}:")
# Deutsche Zitate schliessen mit “ (U+201C), nie mit dem geraden Zeichen: „so“.
ZITAT_GERADE = re.compile(r'„[^„“”"]*"')

def pruefe_sprachregeln(fn, bid, t):
    if BILD_FORMEL.search(t):
        err(fn, bid, "Sprachregel: 'Ein Bild:'-Formel gefunden")
    if ANTITHESE.search(t):
        err(fn, bid, "Sprachregel: 'nicht/kein …, sondern …'-Antithese gefunden")
    if ZITAT_GERADE.search(t):
        err(fn, bid, 'Sprachregel: Zitat „…" mit geradem Schlusszeichen statt “')

def check_language(fn, b):
    bid = b.get("id", "?")
    for t in texts(b):
        pruefe_sprachregeln(fn, bid, t)
        for bad, good in (("Tempo-Management", "Tempo-Steuerung"),
                          ("punktstandabhängig", "je nach Spielstand")):
            if bad in t: err(fn, bid, f"Glossar-Verstoss: '{bad}' -> '{good}'")
        if re.search(r"(?<!Auf)Bauschläge", t): err(fn, bid, "Glossar-Verstoss: 'Bauschläge' -> 'Aufbauschläge'")

# Bausteine + Deltas pruefen
for f in baustein_files:
    d = load(f); fn = os.path.basename(f)
    if not d: continue
    for b in d.get("bausteine", []):
        check_baustein(fn, b); check_language(fn, b)
    for dd in d.get("delta_bausteine", []):
        check_delta(fn, dd); check_language(fn, dd)

# Delta: keine doppelte (Basis, Herkunft)-Kante
seen = {}
for fn, dd in deltas:
    key = (dd.get("basis_baustein"), dd.get("ersetzt_bei_herkunft"))
    if key in seen: err(fn, dd.get("id", "?"), f"doppelte (Basis, Herkunft)-Kante {key} (auch {seen[key]})")
    else: seen[key] = dd.get("id", "?")

# Trainingseinheiten
te = load(path("trainingseinheiten.json"))
if te:
    for e in te.get("trainingseinheiten", []):
        eid = e.get("id", "?")
        phasen = e.get("phasen", {})
        for need in ("erwaermung", "hauptteil", "ausklang"):
            if need not in phasen: err("trainingseinheiten.json", eid, f"Phase fehlt: {need}")
        for ph, items in phasen.items():
            for it in items:
                ref = it.get("baustein")
                if ref not in pool: err("trainingseinheiten.json", eid, f"Referenz zeigt ins Leere: {ref}")
                elif ref not in has_uebung: err("trainingseinheiten.json", eid, f"Referenz '{ref}' hat keinen uebungsteil")

# Fehlerbilder (Trainer-Layer, Spez. 13.5): basis_baustein muss aufloesen und der
# Basisbaustein den trainer_layer_offen-Marker tragen (sonst nur Warnung, nie sperrend).
fb = load(path("fehlerbilder.json"))
if fb:
    for e in fb.get("fehlerbild_bausteine", []):
        eid = e.get("id", "?")
        ref = e.get("basis_baustein")
        if ref not in pool:
            err("fehlerbilder.json", eid, f"basis_baustein zeigt ins Leere: {ref}")
        elif not pool[ref][1].get("trainer_layer_offen"):
            warn("fehlerbilder.json", eid, f"Basisbaustein '{ref}' hat keinen trainer_layer_offen-Marker")
        for feld in ("symptom", "ursache", "korrektur"):
            wert = (e.get("erklaerteil", {}).get("de", {}) or {}).get(feld)
            if not wert:
                err("fehlerbilder.json", eid, f"erklaerteil.de.{feld} fehlt")
            else:
                pruefe_sprachregeln("fehlerbilder.json", eid, wert)

# reine JSON-Ladepruefung fuer restliche Dateien
for extra in ("regeln.json", "app-info.json"):
    if os.path.exists(path(extra)): load(path(extra))

# ---------------------------------------------------------------- report
print("=" * 64)
print(f"  Validierung: {len(pool)} Bausteine, {len(deltas)} Deltas, "
      f"{len(baustein_files)} Baustein-Dateien")
print("=" * 64)
for f, i, m in warnings: print(f"  ⚠  {f} [{i}] {m}")
for f, i, m in errors:   print(f"  ✗  {f} [{i}] {m}")
print("-" * 64)
if errors:
    print(f"  FEHLER: {len(errors)} | Warnungen: {len(warnings)}")
    sys.exit(1)
print(f"  ALLES GRUEN — 0 Fehler, {len(warnings)} Warnungen")
sys.exit(0)
