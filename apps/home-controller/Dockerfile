# Generate node_modules
FROM node:16-alpine AS build-app
ARG CONFIGURATION
WORKDIR /app
ARG path="dist/apps/${CONFIGURATION}"
COPY --chown=node:node $path .
RUN yarn install --production


FROM node:16-alpine AS build-configure
ARG CONFIGURATION
WORKDIR /app
ARG path="dist/apps/${CONFIGURATION}-configuration"
COPY --chown=node:node $path .
RUN yarn install --production


# Final build: alpine latest + latest node
## Mental note: linter is upset about latest.
## Not sure if there is a better option that doesn't require a ton of work to maintain
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
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home $HOME \
    --ingroup node \
    $USER

# Add container deps
## More latest stuff.
RUN sed -i -e 's/v[[:digit:]]\..*\//edge\//g' /etc/apk/repositories &&\
    apk add --upgrade \
    nodejs npm

COPY --chown=node:node libs/tty/scripts/configure-app.sh /bin/configure-app
RUN chmod +x /bin/configure-app

# Finalize
USER node
WORKDIR /app
COPY --from=build-app /app/node_modules server/node_modules
COPY --from=build-app /app/minified.js server/main.js
COPY --from=build-app /app/package.json server/package.json
COPY --from=build-app /app/assets server/assets

COPY --from=build-configure /app/node_modules configure/node_modules
COPY --from=build-configure /app/minified.js configure/main.js
COPY --from=build-configure /app/package.json configure/package.json
COPY --from=build-app /app/assets configure/assets

CMD ["node", "./server/main.js"]
