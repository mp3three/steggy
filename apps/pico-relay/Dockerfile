# <STAGE 1>
# Bring repo into intermediate container
FROM node:18-alpine AS build
WORKDIR /app
RUN apk add git curl; npm install --location=global npm@latest

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

RUN npx figlet-cli -f Pagga Pico Relay
RUN npx nx build pico-relay --configuration=production
# Minify
RUN npx terser dist/apps/pico-relay/main.js -c -m --keep-classnames --module > dist/apps/pico-relay/minified.js
# Scan the config
RUN node dist/apps/pico-relay/main.js --config-scanner > config.json
# </STAGE 1>

# <STAGE 2>
# Build node_modules for final container
FROM node:18-alpine AS node_modules
WORKDIR /app
COPY --from=build --chown=node:node /app/dist/apps/pico-relay .
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
RUN adduser --disabled-password --gecos "" --ingroup node --home $HOME $USER

# Add container deps
## More latest stuff.
RUN sed -i -e 's/v[[:digit:]]\..*\//edge\//g' /etc/apk/repositories && apk add --upgrade nodejs

# Finalize
USER node
WORKDIR /app
COPY --from=node_modules /app/node_modules ./node_modules
COPY --from=build /app/dist/apps/pico-relay/minified.js ./main.js
COPY --from=build /app/dist/apps/pico-relay/package.json ./package.json
COPY --from=build /app/config.json ./config.json

CMD ["node", "./main.js"]
# </STAGE 3>
