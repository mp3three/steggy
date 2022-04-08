#!/bin/bash
npx figlet-cli --font="DOS Rebel" "NPM Publish"
npx nx affected --target=publish --parallel=1

npx figlet-cli --font="DOS Rebel" "Build Docker"
npx nx affected --target=build-docker --parallel=1
