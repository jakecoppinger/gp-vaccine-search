#!/usr/bin/env bash
find src/scss/*.* src/**/*.ts src/*.ts src/index.html src/about/index.html | entr -rc -s "./after-watch-build.sh"
