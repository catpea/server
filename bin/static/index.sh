#!/usr/bin/env bash

echo Creating static version

rm -fr ./docs/
mkdir -p docs

wget --mirror --convert-links --html-extension --no-host-directories --directory-prefix ./docs/ http://black:3000
cp ./docs/index.html ./docs/404.html
