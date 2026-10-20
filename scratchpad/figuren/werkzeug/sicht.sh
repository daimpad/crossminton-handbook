#!/bin/sh
# Schnellansicht: erzeugt die Motive neu und kachelt alt|neu, hell und dunkel.
# sicht.sh <ausgabeordner> G-002 G-010 …
set -e
R=$(cd "$(dirname "$0")/../../.." && pwd); A="$1"; shift
node "$R/scratchpad/figuren/motive.mjs" --ziel "$A" "$@"
L=""; for id in "$@"; do L="$L $R/images/$id.svg $A/$id.svg"; done
node "$R/scratchpad/figuren/werkzeug/bogen.mjs" "$A/sicht" $L --spalten 2
