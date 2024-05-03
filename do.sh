#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

case $1 in
    debug )
        [[ -e .env ]] && source .env
        cargo install cargo-watch
        cargo watch -x run -w src
    ;;
    build )
        cargo build -r
        mkdir -p dist/www
        cp target/release/media-center-web dist/
        cd media-center-web-ui
        npm i && npm run build
        cd ..
        cp -r media-center-web-ui/dist/* dist/www
    ;;
esac
