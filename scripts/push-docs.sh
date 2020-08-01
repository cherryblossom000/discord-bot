set -e
git commit -m "docs: update from travis build #$TRAVIS_BUILD_NUMBER [skip ci]" packages/bot/README.md
git push "https://$GH_TOKEN@github.com/cherryblossom000/comrade-pingu" HEAD:$TRAVIS_BRANCH
