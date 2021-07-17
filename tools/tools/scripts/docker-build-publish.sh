IMAGE=$1
DIR=$2
if [ -z $DIR ]
then
  DIR=$IMAGE
fi
# BUILD
tools/scripts/docker-build.sh $IMAGE $DIR

VERSION=$(cat "apps/$DIR/package.json" | grep version | awk -F: '{ print $2 }' | awk -F, '{ print $1 }'| xargs)
SHA=$(docker inspect --format='{{index .RepoDigests 0}}' formio/$IMAGE:latest)
GIT_ID=$(git log -1 --pretty=%h)
TAGS=$(ts-node tools/scripts/create-tags.js $VERSION $GIT_ID)
IMAGE=$(echo "formio/$IMAGE")
LATEST=$(echo "latest")

for TAG in $TAGS
do
  if [ "$TAG" != "$LATEST" ]; then
    COMMAND="docker tag $IMAGE:latest $IMAGE:$TAG"
    echo $COMMAND
    echo $COMMAND | sh
  fi
  COMMAND="docker push $IMAGE:$TAG"
  echo $COMMAND
  echo $COMMAND | sh
done
