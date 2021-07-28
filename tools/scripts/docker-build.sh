# figure out what we're doing
IMAGE=$1
if [ -z $IMAGE ]
then
  echo "docker-build.sh IMAGE [DIR]"
  exit
fi

DIR=$2
if [ -z $DIR ]
then
  DIR=$IMAGE
fi

## build metadata
# application version
VERSION=$(cat "apps/$DIR/package.json" | jq .version)
# application description
DESCRIPTION=$(cat "apps/$DIR/package.json" | jq .version)
# root home page
HOMEPAGE=$(cat package.json | jq .author.url)
# root email
EMAIL=$(cat package.json | jq .author.email)
# root publisher
PUBLISHER=$(cat package.json | jq .publisher)
# root name ()
NAME=$(head -n 15 package.json | jq .author.name)
BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
VCS_REF=$(git rev-parse --short HEAD)
VCS_URL=$(git config --get remote.origin.url)

# reformat
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

# execute
COMMAND="docker build -t $PUBLISHER/$1:latest -f apps/$DIR/Dockerfile $BUILD_ARGS ."
echo $COMMAND
echo $COMMAND | sh
