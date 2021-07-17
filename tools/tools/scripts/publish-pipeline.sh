# 1) verify that there are no uncommitted changes
# 2) successful lint
# 3) successful test + generate code coverage
# 4) request changelog info
# 5) generate changelog
# -- root version bump
# -- affected version bump
# -- git secret hide
# 6) git commit
# 7) affected build publish docker
# 8) post publish

######################
# # 1) Verify changes
# UNCOMMITTED_FILES=$(git status -s | wc -l)
# if [ "$UNCOMMITTED_FILES" -gt "0" ]; then
#   echo "Publish pipeline requires all files to be committed"
#   exit 1
# fi
######################

######################
# # 2) Lint
# LINT_RESULT=$(nx affected --target=lint --maxParallel=8 --parallel)
# LINT_STATUS=$?
# if [ $LINT_STATUS -eq 1 ]; then
#   echo "Linting failed with errors"
#   echo "nx affected --target=lint"
#   exit
# fi
######################

######################
# # 3) Test
# TEST_RESULT=$(nx affected --target=test --parallel --codeCoverage)
# TEST_STATUS=$?
# if [ $LINT_STATUS -eq 1 ]; then
#   echo "Testing failed with errors"
#   echo "nx affected --target=test"
#   exit
# fi
######################

mkdir -p dist/changelog
nx print-affected > dist/changelog/affected.json
