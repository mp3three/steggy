ROOT=$(pwd)
# Purge build cache
rm -rf dist/living-docs
cd apps/living-docs

# Extract version from app folder
TAG=$(cat "package.json" | grep version | awk -F: '{ print $2 }' | awk -F, '{ print $1 }'| xargs)

# Build using prod settings
compodoc --assetsFolder assets --output ../../dist/living-docs -p tsconfig.doc.json -n "Living Docs $TAG" -c build/.compodocrc --includes ./

# By default, compodoc will include file paths relative to system root
# Go through, and update paths to be relative to repository root
cd ../..
# There doesn't seem to be a flag to make compodoc do this in the first place unfortunately
./tools/scripts/deep replace "$ROOT/" "" "dist/living-docs/**/*html"
