cd apps/living-docs
TAG=$(cat "package.json" | grep version | awk -F: '{ print $2 }' | awk -F, '{ print $1 }'| xargs)
compodoc -p tsconfig.doc.json -s -n "Living Docs $TAG" -c .compodocrc
