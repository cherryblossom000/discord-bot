#!/bin/bash
set -xeuo pipefail

git commit -m "docs: update from workflow run #$GITHUB_RUN_NUMBER [skip ci]" packages/bot/README.md
git push "$GITHUB_SERVER_URL/$GITHUB_REPOSITORY"
