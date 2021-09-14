#!/bin/bash
set -xeuo pipefail

# Update package.json (could have changed due to semantic-release) and remove
# devDependencies so they aren't installed on Repl.it
node scripts/dist/update-package

(
  cd packages/bot/dist

  # Add .replit
  echo "language = 'nodejs'
run = 'node src/server'" > .replit

  # Add replit.nix
  echo '{ pkgs }: { deps = [ pkgs.nodejs-16_x ]; }' > replit.nix

  # Init repo
  git init
  git remote add origin "https://$GITHUB_TOKEN@${GITHUB_SERVER_URL##https://}/$GITHUB_REPOSITORY"
  git checkout -b repl
  # Push to repl branch
  git add *.js .replit package.json **/*.js assets
  git commit -m "chore: update from workflow run #$GITHUB_RUN_NUMBER"
  git push -f origin repl
)
