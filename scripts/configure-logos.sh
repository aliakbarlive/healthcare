#!/bin/bash

set -euxo pipefail

IN="img/$1"
OUT="logos/$1"

mkdir -p "$OUT"

convert -background none inkscape:"$IN/icon.svg" -resize 32x32 "$OUT/favicon-32.png"
convert -background none inkscape:"$IN/icon.svg" -resize 16x16 "$OUT/favicon-16.png"
convert -background none inkscape:"$OUT/favicon-16.png" "$OUT/favicon-32.png" "$OUT/favicon.ico"
convert -background none inkscape:"$IN/icon.svg" -resize 152x152 "$OUT/apple-touch-icon.png"
convert -background none inkscape:"$IN/logo.svg" -resize 421x51 -gravity center -extent 421x51 "$OUT/xlsx.png"
cp "$IN/logo.svg" "$OUT"
rm "$OUT"/favicon-16.png "$OUT"/favicon-32.png
