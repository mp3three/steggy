#!/bin/sh
npx nx build node-red-contrib-automagical
rsync --delete -ahP /home/cameron/Repos/automagical/dist/libs/node-red-contrib-automagical /home/cameron/.config/node-red/node_modules
docker restart node-red
