#!/bin/bash

IMAGE=$1
DIR=$2
if [ -z "$DIR" ]
then
  DIR=$IMAGE
fi
# BUILD
tools/scripts/docker-build.sh "$IMAGE" "$DIR"
PUBLISHER=$(jq .publisher < "package.json" | xargs)
VERSION=$(jq .version < "apps/$DIR/package.json" | xargs)
TAGS=$(npx ts-node tools/scripts/create-tags.js "$VERSION")
IMAGE="$PUBLISHER/$IMAGE"

for TAG in $TAGS
do
  if [ "$TAG" != "latest" ]; then
    COMMAND="docker tag $IMAGE:latest $IMAGE:$TAG"
    echo "$COMMAND"
    echo "$COMMAND" | sh
  fi
  COMMAND="docker push $IMAGE:$TAG"
  echo "$COMMAND"
  echo "$COMMAND" | sh
done
