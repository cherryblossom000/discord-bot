set -e

# semantic-release
pnpx semantic-release

(
  cd packages/bot/dist

  # Copy package.json because that could have changed due to semantic-release
  cp ../package.json package.json
  # Add .replit
  echo "language = 'nodejs'" > .replit
  echo "run = 'node src/server'" >> .replit

  # Init repo
  git init
  git remote add origin "https://$GH_TOKEN@github.com/cherryblossom000/comrade-pingu"
  git checkout -b repl
  # Push to repl branch
  git add .
  git commit -m "chore: update from travis build #$TRAVIS_BUILD_NUMBER"
  git push -f origin repl
)
