set -e

# semantic-release
pnpx semantic-release

(
  cd dist
  # Init repo
  git init
  git remote add origin "https://$GLITCH_TOKEN@api.glitch.com/git/comrade-pingu"
  # Copy package.json because that may have changed due tom semantic-release
  cp ../package.json package.json
  # Push to glitch
  git add .
  git commit -m "update from travis build #$TRAVIS_BUILD_NUMBER"
  git push -f origin master
)
