IMAGE=$1
DIR=$2
if [ -z $DIR ]
then
  DIR=$IMAGE
fi

# Extract metadata from local files
VERSION=$(cat "apps/$DIR/package.json" | grep version | awk -F: '{ print $2 }' | awk -F, '{ print $1 }'| xargs)
DESCRIPTION=$(cat "apps/$DIR/package.json" | grep version | awk -F: '{ print $2 }' | awk -F, '{ print $1 }'| xargs)
HOMEPAGE=$(cat package.json | grep url | head -n 1 | awk -F: '{ print $2 }' | awk -F, '{ print $1 }'| xargs)
EMAIL=$(cat package.json | grep email | head -n 1 | awk -F: '{ print $2 }' | awk -F, '{ print $1 }'| xargs)
PUBLISHER=$(cat package.json | grep publisher | head -n 1 | awk -F: '{ print $2 }' | awk -F, '{ print $1 }'| xargs)
NAME=$(head -n 15 package.json | grep name | tail -n 1 | awk -F: '{ print $2 }' | awk -F, '{ print $1 }'| xargs)
BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
VCS_REF=$(git rev-parse --short HEAD)
VCS_URL=$(git config --get remote.origin.url)
PUBLISHER=$(git config --get remote.origin.url)

BUILD_ARGS=""
BUILD_ARGS="$BUILD_ARGS --build-arg CONFIGURATION=$IMAGE"
BUILD_ARGS="$BUILD_ARGS --build-arg BUILD_DATE=$BUILD_DATE"
BUILD_ARGS="$BUILD_ARGS --build-arg BUILD_VERSION=$VERSION"
BUILD_ARGS="$BUILD_ARGS --build-arg MAINTAINER=$EMAIL"
BUILD_ARGS="$BUILD_ARGS --build-arg URL=$HOMEPAGE"
BUILD_ARGS="$BUILD_ARGS --build-arg VCS_URL=$VCS_URL"
BUILD_ARGS="$BUILD_ARGS --build-arg NAME=$NAME"
BUILD_ARGS="$BUILD_ARGS --build-arg VCS_REF=$VCS_REF"
BUILD_ARGS="$BUILD_ARGS --build-arg DESCRIPTION=$DESCRIPTION"

COMMAND="docker build -t $PUBLISHER/$1:latest -f apps/$DIR/Dockerfile $BUILD_ARGS ."
echo $COMMAND
echo $COMMAND | sh
