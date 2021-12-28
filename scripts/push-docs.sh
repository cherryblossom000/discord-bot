#!/usr/bin/env bash -xeuo pipefail

git commit -m "docs: update from workflow run #$GITHUB_RUN_NUMBER [skip ci]" packages/bot/README.md || exit 0
git push "$GITHUB_SERVER_URL/$GITHUB_REPOSITORY"
