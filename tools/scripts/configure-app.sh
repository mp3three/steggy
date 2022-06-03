#!/bin/bash

APP=$1
npx nx scan-config "$APP"
node ./tools/scripts/config-builder.js --definition_file ./dist/configs/"$APP".json
