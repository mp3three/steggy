SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd $SCRIPT_DIR
cd ../../../

# npx nx build devtools

node ./dist/apps/devtools/main.js $1
