#!/usr/bin/env bash -xeuo pipefail

# Copy assets
(
  cd dist
  mkdir -p assets
  trash assets/img
  cp -r ../assets/img assets/img
)

# Build docs
node ../scripts/dist/docs
mkdir -p dist/assets/css
purgecss -c purgecss.config.cjs -o dist/assets/css
