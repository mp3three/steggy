IMAGE=$1
DIR=$2
if [ -z $DIR ]
then
  DIR=$IMAGE
fi

# BUILD
tools/scripts/docker-build.sh $IMAGE $DIR

NAME=$(cat package.json | grep name | head -n 1 | awk -F: '{ print $2 }' | awk -F, '{ print $1 }'| xargs)
VERSION=$(cat "apps/$DIR/package.json" | grep version | awk -F: '{ print $2 }' | awk -F, '{ print $1 }'| xargs)
SHA=$(docker inspect --format='{{index .RepoDigests 0}}' $NAME/$IMAGE:latest)
GIT_ID=$(git log -1 --pretty=%h)
IMAGE=$(echo "$NAME/$IMAGE")

# build up list of tags
TAGS=$(ts-node tools/scripts/create-tags.js $VERSION $GIT_ID)
# add tags to image and push
for TAG in $TAGS
do
  if [ "$TAG" != "latest" ]; then
    COMMAND="docker tag $IMAGE:latest $IMAGE:$TAG"
    echo $COMMAND
    echo $COMMAND | sh
  fi
  COMMAND="docker push $IMAGE:$TAG"
  echo $COMMAND
  echo $COMMAND | sh
done
