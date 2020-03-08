set -e
git commit -m "docs: update from github action $GITHUB_WORKFLOW #$GITHUB_RUN_NUMBER [skip ci]" assets/index.html README.md
git push "https://$GH_TOKEN@github.com/cherryblossom000/comrade-pingu" HEAD:master
