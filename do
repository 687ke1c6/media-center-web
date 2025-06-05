#!/bin/sh
set -eu
IFS=$'\n\t'

case $1 in
    debug )
        # For Rust backend: run in debug mode with auto-reload
        cargo install cargo-watch
        cargo watch -x run -w src
    ;;
    build )
        # For Rust backend: build release binary
        cargo build --release
        mkdir -p dist/www
        cp target/release/media-center-web dist/
        cd media-center-web-ui
        pnpm install && pnpm build
        cd ..
        cp -r media-center-web-ui/dist/* dist/www
    ;;
esac
