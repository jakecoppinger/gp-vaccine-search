#!/usr/bin/env bash
find src/*.ts src/**/*.ts test/*.ts test/*.ts *.sh package.json | entr -rc -s "yarn test"
