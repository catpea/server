#!/usr/bin/env bash

echo Creating Static Version

rm -fr ./docs/
mkdir -p docs

echo WGET MIRRORING (this may take a while)
wget --quiet --mirror --convert-links --html-extension --no-host-directories --directory-prefix ./docs/ http://black:7467
cp ./views/404.html ./docs/404.html
