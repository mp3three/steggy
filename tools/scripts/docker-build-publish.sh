IMAGE=$1
DIR=$2
if [ -z $DIR ]
then
  DIR=$IMAGE
fi

# BUILD
tools/scripts/docker-build.sh $IMAGE $DIR

NAME=$(cat package.json | jq .name)
VERSION=$(cat "apps/$DIR/package.json" | jq .version)
SHA=$(docker inspect --format='{{index .RepoDigests 0}}' $NAME/$IMAGE:latest)
GIT_ID=$(git log -1 --pretty=%h)
IMAGE=$(echo "$NAME/$IMAGE")

# build up list of tags
TAGS=$(npx ts-node tools/scripts/create-tags.ts $VERSION $GIT_ID)
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
