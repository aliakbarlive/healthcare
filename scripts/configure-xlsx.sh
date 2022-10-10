#!/bin/bash

cd ..

set -euxo pipefail

unzip ra/public/census.xlsx -d o
rm ra/public/census.xlsx
cp "ra/$3" o/xl/media/image1.png

cd o
zip "../ra/public/$2-census.xlsx" -r .
cd ..

rm -rf o
