#!/bin/bash

IMAGE=$1
if [ -z "$IMAGE" ]
then
  echo "docker-build.sh IMAGE [DIR]"
  exit
fi

DIR=$2
if [ -z "$DIR" ]
then
  DIR=$IMAGE
fi

# Extract metadata from local files
VERSION=$(jq .version < package.json | xargs)
HOMEPAGE=$(jq .author.url < package.json | xargs)
EMAIL=$(jq .author.email < package.json | xargs)
PUBLISHER="containers.programmable.work"
NAME=$(jq .name < "apps/$DIR/package.json" | xargs)
BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
VCS_REF=$(git rev-parse --short HEAD)
VCS_URL=$(git config --get remote.origin.url)

BUILD_ARGS=""
BUILD_ARGS="$BUILD_ARGS --build-arg CONFIGURATION=$IMAGE"
BUILD_ARGS="$BUILD_ARGS --build-arg BUILD_DATE=$BUILD_DATE"
BUILD_ARGS="$BUILD_ARGS --build-arg BUILD_VERSION=$VERSION"
BUILD_ARGS="$BUILD_ARGS --build-arg MAINTAINER=$EMAIL"
BUILD_ARGS="$BUILD_ARGS --build-arg URL=$HOMEPAGE"
BUILD_ARGS="$BUILD_ARGS --build-arg VCS_URL=$VCS_URL"
BUILD_ARGS="$BUILD_ARGS --build-arg NAME=$NAME"
BUILD_ARGS="$BUILD_ARGS --build-arg VCS_REF=$VCS_REF"

COMMAND="docker build -t $PUBLISHER/$1:latest -f apps/$DIR/Dockerfile $BUILD_ARGS ."
echo "$COMMAND"
echo "$COMMAND" | sh
