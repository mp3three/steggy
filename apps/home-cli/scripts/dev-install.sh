#!/bin/sh
npx nx build home-cli --configuration=production
BUILD=$(cat dist/apps/home-cli/main.js)
printf "#!/usr/bin/env node\n%s" "$BUILD" > dist/apps/home-cli/main.js
yarn global add "$(pwd)/dist/apps/home-cli"
