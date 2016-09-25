#!/bin/bash
# exit on error
set -e
set -o pipefail

cd "`dirname $BASH_SOURCE`"

commit="`git log --oneline -1`"
git branch tmp-publish
git checkout master
git merge tmp-publish --no-ff -m .
git branch -d tmp-publish

npm install
git add bundle.js
git commit --amend -m "build $commit"
git push origin master
