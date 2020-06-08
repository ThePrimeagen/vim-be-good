#!/bin/sh

cd "$(dirname "$0")"
if which npm >/dev/null; then
    npm install && npm run build
else
    if which yarn >/dev/null; then
        yarn && yarn build
    else
        echo "You must have NPM or Yarn installed"
    fi
fi