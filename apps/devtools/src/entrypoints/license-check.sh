nx serve devtools --configuration=license-check
cd apps/devtools/out
yarn install
license-checker --production --csv > ./licenses.csv
rm -rf node_modules yarn.lock
