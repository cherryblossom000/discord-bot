set -e
(
  cd dist
  # Init repo
  git init
  git remote add origin "https://$GLITCH_TOKEN@api.glitch.com/git/comrade-pingu"
  # Push to glitch
  git add .
  git commit -m "update from travis build #$TRAVIS_BUILD_NUMBER"
  git push -f origin master
)
# semantic-release
pnpx semantic-release
