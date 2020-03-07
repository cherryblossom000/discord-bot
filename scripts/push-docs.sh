set -e

git add assets/index.html README.md
git commit -m "docs: update from github action $GITHUB_WORKFLOW #$GITHUB_RUN_NUMBER [skip ci]"
git push "https://$GH_TOKEN@github.com/cherryblossom000/comrade-pingu" HEAD:master
