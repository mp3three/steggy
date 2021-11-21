npx figlet-cli --font="DOS Rebel" "Build Docker"
npx nx affected --target=build-docker
npx figlet-cli --font="DOS Rebel" "NPM Publish"
npx nx affected --target=publish
