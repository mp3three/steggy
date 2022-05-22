# <STAGE 1>
# Bring repo into intermediate container
FROM node:16-alpine AS build
WORKDIR /app
RUN apk add git curl; npm install -g npm@8.7.0

# Build dev environment
# Only copy necessary stuff for install up front to cache better
COPY --chown=node:node package.json yarn.lock ./
RUN yarn install --frozen-lockfile --non-interactive --no-progress
# Having the files present before install causes nx to freak out
COPY --chown=node:node workspace.json nx.json tsconfig.base.json babel.config.json  ./
# Now folders
COPY --chown=node:node .git ./.git
COPY --chown=node:node apps ./apps
COPY --chown=node:node libs ./libs

# Build UI
RUN npx figlet-cli -f Pagga Building UI
RUN npx nx build home-configure --configuration=production
# Build Backend
RUN npx figlet-cli -f Pagga Building Backend
RUN npx nx build home-controller --configuration=production
# Minify
RUN npx terser dist/apps/home-controller/main.js -c -m --keep-classnames --module > dist/apps/home-controller/minified.js
# </STAGE 1>

# <STAGE 1.5> - Same layer, different work
RUN npx figlet-cli -f Pagga Analyzing Configs
RUN npx nx build home-controller --configuration=scanner
RUN node dist/scanner/home-controller/main.js > config.json
# </STAGE 1.5>


# <STAGE 2>
# Build node_modules for final container
FROM node:16-alpine AS node_modules
WORKDIR /app
COPY --from=build --chown=node:node /app/dist/apps/home-controller .
RUN yarn install --production
# </STAGE 2>

# <STAGE 3>: FINAL
FROM alpine:latest
ARG BUILD_DATE
ARG MAINTAINER
ARG BUILD_VERSION
ARG DESCRIPTION
ARG URL
ARG VCS_URL
ARG VCS_REF
ARG NAME

# LABELS
LABEL maintainer=$MAINTAINER
LABEL org.label-schema.build-date=$BUILD_DATE
LABEL org.label-schema.version=$BUILD_VERSION
LABEL org.label-schema.name=$CONFIGURATION
LABEL org.label-schema.url=$URL
LABEL org.label-schema.vcs-url=$VCS_URL
LABEL org.label-schema.description=$DESCRIPTION
LABEL org.label-schema.vendor=$NAME
LABEL org.label-schema.vcs-ref=$VCS_REF
LABEL org.label-schema.schema-version="1.0"

# User
ARG USER=node
ARG HOME=/home/node
RUN addgroup -S node
RUN adduser --disabled-password --gecos "" --ingroup node \
  --home $HOME $USER

# Add container deps
## More latest stuff.
RUN sed -i -e 's/v[[:digit:]]\..*\//edge\//g' /etc/apk/repositories && apk add --upgrade nodejs npm curl

# Finalize
USER node
WORKDIR /app
COPY --from=node_modules /app/node_modules ./node_modules
COPY --from=build /app/dist/apps/home-controller/minified.js ./main.js
COPY --from=build /app/dist/apps/home-controller/package.json ./package.json
COPY --from=build /app/dist/apps/home-configure ./ui
COPY --from=build /app/dist/apps/home-controller/assets ./assets
COPY --from=build /app/config.json ./config.json

HEALTHCHECK CMD curl --fail http://localhost:7000/api/health
CMD ["node", "./main.js"]
# </STAGE 3>
