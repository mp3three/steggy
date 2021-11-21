IMAGE=$1
DIR=$2
if [ -z $DIR ]
then
  DIR=$IMAGE
fi
# BUILD
tools/scripts/docker-build.sh $IMAGE $DIR
PUBLISHER=$(cat package.json | jq .publisher | xargs)

VERSION=$(cat "apps/$DIR/package.json" | jq .version | xargs)
GIT_ID=$(git log -1 --pretty=%h)
TAGS=$(npx ts-node tools/scripts/create-tags.js $VERSION $GIT_ID)
IMAGE=$(echo "$PUBLISHER/$IMAGE")
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
