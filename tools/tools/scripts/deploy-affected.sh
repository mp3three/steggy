FILES=$(git status -s | grep -v package.json)
if [ $(echo $FILES | wc -w) -gt "0" ]; then
  echo "Commit all changes before deploying"
  exit
fi
BRANCH=$(git branch --show-current)

# # Validate
# nx affected --target=lint
# # nx affected --target=test

# # Version bump
# nx affected --target=maintenance --configuration=patch

# # Build
# nx affected --target=build-docker

# git commit -a -m "Automatic Version Bump"
