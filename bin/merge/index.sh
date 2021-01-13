#!/usr/bin/env bash

echo Merging new images
rsync -qav --progress .sources/warrior/docs/images/ ./static/image
rsync -qav --progress .sources/poetry/dist/image/ ./static/image

echo Merging new audio
rsync -qav --progress .sources/warrior/docs/audio/ ./static/audio
rsync -qav --progress .sources/poetry/dist/audio/ ./static/audio

echo Importing new server data objects
cp .sources/poetry/dist/server-object/furkies-purrkies.bootstrap.json posts/furkies-purrkies.json
cp .sources/warrior/dist/server-object/westland-warrior.json posts
