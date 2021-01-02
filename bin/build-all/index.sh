#!/usr/bin/env bash

bin/sync/index.sh
bin/merge/index.sh

node app.mjs &

FOO_PID=$!
sleep 3

bin/static/index.sh

kill $FOO_PID
